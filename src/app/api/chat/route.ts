import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { googleSearch } from "@/lib/tools/serper";
import { saveMemory, recallMemory } from "@/lib/tools/memory";
import { triggerDeploy, listDeployments } from "@/lib/tools/vercel";
import { githubWriteFile, githubCreateBranch, githubOpenPR } from "@/lib/tools/github";
import { readFile, writeFile, listDirectory } from "@/lib/tools/fs";
import { runCommand } from "@/lib/tools/terminal";
import { withToolLog } from "@/lib/agent/logs";
import { checkDangerousToolPolicy } from "@/lib/agent/policy";
import { supabaseAdmin } from "@/lib/db/supabase";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();

  // Load user settings from DB
  const { data: settings } = await supabaseAdmin
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  const userSettings = settings ?? {
    model_name: "models/gemini-1.5-pro-latest",
    temperature: 0.7,
    enable_search: true,
    enable_deploy: false,
    enable_self_mutation: false,
    enable_terminal: false,
  };

  const result = await streamText({
    model: google(userSettings.model_name),
    temperature: userSettings.temperature,
    messages,
    system: `You are AETHON — an Autonomous AI Operating System built by Nguyễn Văn Hoài Thương.
You are NOT a chatbot. You are an AI Agent Platform with real capabilities:
- Real web search via Serper.dev
- Real long-term memory via Supabase vector store
- Real Vercel deployments
- Real GitHub file writes and PR creation
- Real file system access (within allowed paths)
- Real terminal command execution (within safe commands)

Rules:
1. NEVER use fake data, setTimeout simulations, or hardcoded mock responses.
2. Always use the appropriate tool when the user asks for real-world actions.
3. Be concise and action-oriented. Show results, not process.
4. If a tool is disabled in settings, explain that and suggest enabling it.
5. Always confirm dangerous actions before executing.`,
    tools: {
      // ── Search ──────────────────────────────────────────────────────────────
      googleSearch: tool({
        description: "Search Google for real-time information using Serper.dev",
        parameters: z.object({
          query: z.string().describe("The search query"),
          numResults: z.number().optional().default(5).describe("Number of results to return"),
        }),
        execute: async ({ query, numResults }) => {
          if (!userSettings.enable_search) {
            return { error: "Search is disabled in your settings." };
          }
          return withToolLog(userId, "googleSearch", { query }, () =>
            googleSearch(query, numResults)
          );
        },
      }),

      // ── Memory ───────────────────────────────────────────────────────────────
      saveMemory: tool({
        description: "Save important information to long-term memory (Supabase vector store)",
        parameters: z.object({
          content: z.string().describe("The information to remember"),
          metadata: z.record(z.unknown()).optional().describe("Optional metadata tags"),
        }),
        execute: async ({ content, metadata }) =>
          withToolLog(userId, "saveMemory", { metadata }, () =>
            saveMemory(userId, content, metadata)
          ),
      }),

      recallMemory: tool({
        description: "Recall relevant memories from long-term storage using semantic search",
        parameters: z.object({
          query: z.string().describe("What to search for in memory"),
          threshold: z.number().optional().default(0.7).describe("Similarity threshold (0-1)"),
          count: z.number().optional().default(5).describe("Max results to return"),
        }),
        execute: async ({ query, threshold, count }) =>
          withToolLog(userId, "recallMemory", { query }, () =>
            recallMemory(userId, query, threshold, count)
          ),
      }),

      // ── Vercel ───────────────────────────────────────────────────────────────
      vercelDeploy: tool({
        description: "Trigger a new Vercel deployment",
        parameters: z.object({
          name: z.string().describe("Project name"),
          repoId: z.string().optional().describe("GitHub repo ID"),
          ref: z.string().optional().default("main").describe("Git branch/ref to deploy"),
        }),
        execute: async ({ name, repoId, ref }) => {
          const policy = checkDangerousToolPolicy("vercelDeploy", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "vercelDeploy", { name }, () =>
            triggerDeploy({
              name,
              gitSource: repoId ? { type: "github", repoId, ref: ref ?? "main" } : undefined,
            })
          );
        },
      }),

      vercelListDeployments: tool({
        description: "List recent Vercel deployments",
        parameters: z.object({
          projectId: z.string().optional().describe("Filter by project ID"),
          limit: z.number().optional().default(5),
        }),
        execute: async ({ projectId, limit }) =>
          withToolLog(userId, "vercelListDeployments", { projectId }, () =>
            listDeployments(projectId, limit)
          ),
      }),

      // ── GitHub ───────────────────────────────────────────────────────────────
      githubWriteFile: tool({
        description: "Write or update a file in a GitHub repository",
        parameters: z.object({
          owner: z.string().describe("Repository owner (username or org)"),
          repo: z.string().describe("Repository name"),
          filePath: z.string().describe("Path to the file in the repo"),
          content: z.string().describe("File content to write"),
          commitMessage: z.string().describe("Git commit message"),
          branch: z.string().optional().default("main").describe("Target branch"),
        }),
        execute: async ({ owner, repo, filePath, content, commitMessage, branch }) => {
          const policy = checkDangerousToolPolicy("githubWrite", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "githubWriteFile", { owner, repo, filePath }, () =>
            githubWriteFile(owner, repo, filePath, content, commitMessage, branch)
          );
        },
      }),

      githubOpenPR: tool({
        description: "Create a new Pull Request on GitHub",
        parameters: z.object({
          owner: z.string(),
          repo: z.string(),
          title: z.string().describe("PR title"),
          body: z.string().describe("PR description"),
          head: z.string().describe("Source branch"),
          base: z.string().optional().default("main").describe("Target branch"),
        }),
        execute: async ({ owner, repo, title, body, head, base }) => {
          const policy = checkDangerousToolPolicy("githubWrite", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "githubOpenPR", { owner, repo, title }, () =>
            githubOpenPR(owner, repo, title, body, head, base)
          );
        },
      }),

      githubCreateBranch: tool({
        description: "Create a new branch in a GitHub repository",
        parameters: z.object({
          owner: z.string(),
          repo: z.string(),
          newBranch: z.string().describe("Name of the new branch"),
          fromBranch: z.string().optional().default("main"),
        }),
        execute: async ({ owner, repo, newBranch, fromBranch }) => {
          const policy = checkDangerousToolPolicy("githubWrite", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "githubCreateBranch", { owner, repo, newBranch }, () =>
            githubCreateBranch(owner, repo, newBranch, fromBranch)
          );
        },
      }),

      // ── File System ──────────────────────────────────────────────────────────
      readFile: tool({
        description: "Read a file from the project (allowed paths only)",
        parameters: z.object({
          path: z.string().describe("Relative file path within the project"),
        }),
        execute: async ({ path }) =>
          withToolLog(userId, "readFile", { path }, () => readFile(path)),
      }),

      writeFile: tool({
        description: "Write content to a file in the project (allowed paths only, creates backup)",
        parameters: z.object({
          path: z.string().describe("Relative file path within the project"),
          content: z.string().describe("Content to write"),
        }),
        execute: async ({ path, content }) => {
          const policy = checkDangerousToolPolicy("selfMutation", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "writeFile", { path }, async () => {
            await writeFile(path, content);
            return { success: true, path };
          });
        },
      }),

      listDirectory: tool({
        description: "List files in a project directory",
        parameters: z.object({
          path: z.string().describe("Relative directory path"),
        }),
        execute: async ({ path }) =>
          withToolLog(userId, "listDirectory", { path }, () => listDirectory(path)),
      }),

      // ── Terminal ─────────────────────────────────────────────────────────────
      runCommand: tool({
        description: "Execute a safe terminal command (read/build commands only)",
        parameters: z.object({
          command: z.string().describe("The command to execute"),
        }),
        execute: async ({ command }) => {
          const policy = checkDangerousToolPolicy("terminal", userSettings);
          if (!policy.allowed) return { error: policy.reason };
          return withToolLog(userId, "runCommand", { command }, () => runCommand(command));
        },
      }),
    },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}
