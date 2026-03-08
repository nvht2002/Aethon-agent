/**
 * AETHON AI Brain - Layer 2: Orchestrator
 * 
 * This is the central brain that coordinates all AI operations.
 * It analyzes prompts, routes to appropriate agents, and manages context.
 */

import { google } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import { z } from "zod";

/**
 * Prompt Analyzer - Analyzes user input to determine intent
 */
export interface PromptAnalysis {
  intent: 'chat' | 'code' | 'research' | 'deploy' | 'automation' | 'search' | 'memory' | 'unknown';
  complexity: 'simple' | 'moderate' | 'complex';
  requiredCapabilities: string[];
  suggestedAgent: string;
  needsMemory: boolean;
  needsWebSearch: boolean;
}

const intentPatterns = {
  code: /\b(code|coding|program|function|class|debug|fix|write|create|build|implement)\b/i,
  research: /\b(search|research|find|look|what is|how does|explain|information)\b/i,
  deploy: /\b(deploy|deploy|release|push|publish|host)\b/i,
  automation: /\b(automate|workflow|schedule|repeatevery|when)\b/i,
  memory: /\b(remember|forget|recall|memory|know about me)\b/i,
  search: /\b(search|google|web|find)\b/i,
  chat: /\b(hi|hello|hey|what|how|why|can you|tell me)\b/i,
};

export async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  // Simple pattern-based analysis
  let intent: PromptAnalysis['intent'] = 'chat';
  let complexity: PromptAnalysis['complexity'] = 'simple';
  let requiredCapabilities: string[] = ['chat'];
  let suggestedAgent = 'AETHON-Core';
  let needsMemory = false;
  let needsWebSearch = false;

  // Check intent patterns
  if (intentPatterns.code.test(prompt)) {
    intent = 'code';
    suggestedAgent = 'AETHON-Coder';
    requiredCapabilities = ['code', 'file_system', 'terminal', 'github'];
  } else if (intentPatterns.research.test(prompt) || intentPatterns.search.test(prompt)) {
    intent = 'research';
    suggestedAgent = 'AETHON-Search';
    requiredCapabilities = ['web_search', 'data_collection'];
    needsWebSearch = true;
  } else if (intentPatterns.deploy.test(prompt)) {
    intent = 'deploy';
    suggestedAgent = 'AETHON-Deploy';
    requiredCapabilities = ['vercel_deploy', 'github_pr'];
  } else if (intentPatterns.automation.test(prompt)) {
    intent = 'automation';
    requiredCapabilities = ['automation', 'workflows'];
  } else if (intentPatterns.memory.test(prompt)) {
    intent = 'memory';
    requiredCapabilities = ['memory'];
    needsMemory = true;
  }

  // Determine complexity
  const wordCount = prompt.split(/\s+/).length;
  if (wordCount > 100) {
    complexity = 'complex';
    requiredCapabilities.push('reasoning', 'planning');
  } else if (wordCount > 30) {
    complexity = 'moderate';
  }

  // Check if memory is needed
  if (needsMemory || intentPatterns.memory.test(prompt)) {
    needsMemory = true;
  }

  // Check if web search is needed
  if (needsWebSearch || intentPatterns.search.test(prompt)) {
    needsWebSearch = true;
  }

  return {
    intent,
    complexity,
    requiredCapabilities,
    suggestedAgent,
    needsMemory,
    needsWebSearch,
  };
}

/**
 * Task Planner - Creates execution plans for complex tasks
 */
export interface TaskPlan {
  steps: PlanStep[];
  estimatedTime: number;
  requiresAgent: boolean;
  agentName?: string;
}

export interface PlanStep {
  id: number;
  description: string;
  action: string;
  dependencies: number[];
  estimatedDuration: number;
}

export async function createTaskPlan(prompt: string, analysis: PromptAnalysis): Promise<TaskPlan> {
  const steps: PlanStep[] = [];
  
  if (analysis.needsWebSearch) {
    steps.push({
      id: 1,
      description: "Search the web for relevant information",
      action: "googleSearch",
      dependencies: [],
      estimatedDuration: 2000,
    });
  }

  if (analysis.needsMemory) {
    const memoryStepId = steps.length + 1;
    steps.push({
      id: memoryStepId,
      description: "Recall relevant memories",
      action: "recallMemory",
      dependencies: [],
      estimatedDuration: 1000,
    });
  }

  switch (analysis.intent) {
    case 'code':
      steps.push({
        id: steps.length + 1,
        description: "Write or edit code files",
        action: "writeFile",
        dependencies: analysis.needsWebSearch ? [1] : [],
        estimatedDuration: 5000,
      });
      break;
    case 'deploy':
      steps.push({
        id: steps.length + 1,
        description: "Deploy to Vercel",
        action: "vercelDeploy",
        dependencies: analysis.needsWebSearch ? [1] : [],
        estimatedDuration: 10000,
      });
      break;
    case 'research':
      steps.push({
        id: steps.length + 1,
        description: "Compile research results",
        action: "compileResearch",
        dependencies: analysis.needsWebSearch ? [1] : [],
        estimatedDuration: 2000,
      });
      break;
  }

  // Add final response step
  steps.push({
    id: steps.length + 1,
    description: "Generate final response",
    action: "respond",
    dependencies: steps.map(s => s.id),
    estimatedDuration: 3000,
  });

  const estimatedTime = steps.reduce((acc, s) => acc + s.estimatedDuration, 0);

  return {
    steps,
    estimatedTime,
    requiresAgent: analysis.intent !== 'chat',
    agentName: analysis.suggestedAgent,
  };
}

/**
 * Context Builder - Builds context for AI models
 */
export interface ContextOptions {
  includeMemory?: boolean;
  includeSystemPrompt?: boolean;
  maxHistoryMessages?: number;
  customContext?: Record<string, unknown>;
}

export async function buildContext(
  userId: string,
  messages: Array<{ role: string; content: string }>,
  options: ContextOptions = {}
): Promise<{
  systemPrompt: string;
  contextMessages: Array<{ role: string; content: string }>;
}> {
  const {
    includeMemory = true,
    includeSystemPrompt = true,
    maxHistoryMessages = 10,
    customContext = {},
  } = options;

  // Build system prompt
  let systemPrompt = '';
  
  if (includeSystemPrompt) {
    systemPrompt = `You are AETHON — an Autonomous AI Operating System built by Nguyễn Văn Hoài Thương.
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
5. Always confirm dangerous actions before executing.`;
  }

  // Add custom context
  if (Object.keys(customContext).length > 0) {
    systemPrompt += `\n\nAdditional Context:\n${JSON.stringify(customContext, null, 2)}`;
  }

  // Limit history messages
  const contextMessages = messages.slice(-maxHistoryMessages);

  return {
    systemPrompt,
    contextMessages,
  };
}

/**
 * Agent Router - Routes to appropriate agent
 */
export interface AgentInfo {
  name: string;
  displayName: string;
  capabilities: string[];
  tools: string[];
  status: 'idle' | 'busy' | 'error';
}

export function routeToAgent(analysis: PromptAnalysis): AgentInfo {
  const agents: Record<string, AgentInfo> = {
    'AETHON-Core': {
      name: 'AETHON-Core',
      displayName: 'AETHON Core',
      capabilities: ['chat', 'reasoning', 'planning', 'web_search', 'memory'],
      tools: ['googleSearch', 'saveMemory', 'recallMemory'],
      status: 'idle',
    },
    'AETHON-Coder': {
      name: 'AETHON-Coder',
      displayName: 'AETHON Coder',
      capabilities: ['code', 'file_system', 'terminal', 'github'],
      tools: ['readFile', 'writeFile', 'listDirectory', 'runCommand', 'githubWriteFile', 'githubOpenPR'],
      status: 'idle',
    },
    'AETHON-Search': {
      name: 'AETHON-Search',
      displayName: 'AETHON Search',
      capabilities: ['web_search', 'data_collection', 'analysis'],
      tools: ['googleSearch'],
      status: 'idle',
    },
    'AETHON-Deploy': {
      name: 'AETHON-Deploy',
      displayName: 'AETHON Deploy',
      capabilities: ['vercel_deploy', 'github_pr', 'deployment'],
      tools: ['vercelDeploy', 'vercelListDeployments'],
      status: 'idle',
    },
  };

  return agents[analysis.suggestedAgent] || agents['AETHON-Core'];
}

/**
 * Memory Manager - Handles AI memory operations
 */
export class MemoryManager {
  private userId: string;
  private supabase: any;

  constructor(userId: string, supabaseClient: any) {
    this.userId = userId;
    this.supabase = supabaseClient;
  }

  async saveContext(key: string, content: string, metadata: Record<string, unknown> = {}): Promise<void> {
    // This would save to the memories table
    // Implementation depends on having the vector store set up
    console.log(`[MemoryManager] Saving context: ${key}`);
  }

  async recallContext(query: string, threshold: number = 0.7): Promise<string[]> {
    // This would recall from the memories table using vector similarity
    console.log(`[MemoryManager] Recalling context for: ${query}`);
    return [];
  }

  async clearOldMemory(olderThanDays: number = 30): Promise<void> {
    console.log(`[MemoryManager] Clearing memory older than ${olderThanDays} days`);
  }
}

export const AIBrain = {
  analyzePrompt,
  createTaskPlan,
  buildContext,
  routeToAgent,
  MemoryManager,
};
