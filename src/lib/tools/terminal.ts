/**
 * AETHON Tool: Terminal command execution with denylist policy
 * Uses child_process.exec — real execution, not simulated.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { checkTerminalPolicy } from "@/lib/agent/policy";

const execAsync = promisify(exec);

const EXEC_TIMEOUT_MS = 30_000; // 30 seconds max
const MAX_OUTPUT_CHARS = 10_000;

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runCommand(command: string): Promise<ExecResult> {
  const policy = checkTerminalPolicy(command);
  if (!policy.allowed) {
    throw new Error(`Terminal Policy denied: ${policy.reason}`);
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: EXEC_TIMEOUT_MS,
      cwd: process.cwd(),
      env: process.env,
    });

    return {
      stdout: truncate(stdout),
      stderr: truncate(stderr),
      exitCode: 0,
    };
  } catch (err) {
    const error = err as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      stdout: truncate(error.stdout ?? ""),
      stderr: truncate(error.stderr ?? error.message ?? "Unknown error"),
      exitCode: error.code ?? 1,
    };
  }
}

function truncate(text: string): string {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return text.slice(0, MAX_OUTPUT_CHARS) + `\n... [truncated ${text.length - MAX_OUTPUT_CHARS} chars]`;
}
