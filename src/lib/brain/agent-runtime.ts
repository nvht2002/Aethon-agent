/**
 * AETHON AI Brain - Layer 3: Agent Runtime
 * 
 * Manages agent lifecycle, task execution, and state.
 */

import { supabaseAdmin } from "@/lib/db/supabase";

/**
 * Agent status types
 */
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';

/**
 * Agent capabilities
 */
export const AGENT_CAPABILITIES = {
  CHAT: 'chat',
  REASONING: 'reasoning',
  PLANNING: 'planning',
  CODE: 'code',
  FILE_SYSTEM: 'file_system',
  TERMINAL: 'terminal',
  GITHUB: 'github',
  WEB_SEARCH: 'web_search',
  MEMORY: 'memory',
  DEPLOYMENT: 'deployment',
  DATA_COLLECTION: 'data_collection',
  ANALYSIS: 'analysis',
  AUTOMATION: 'automation',
  WORKFLOWS: 'workflows',
} as const;

/**
 * Agent definition
 */
export interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  avatarUrl?: string;
  status: AgentStatus;
  currentTaskId?: string;
  capabilities: string[];
  tools: string[];
  systemPrompt?: string;
  modelProvider: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  lastSeen: Date;
  createdAt: Date;
}

/**
 * Agent Runtime - manages agent lifecycle
 */
export class AgentRuntime {
  private userId: string;
  private agents: Map<string, Agent> = new Map();

  constructor(userId: string) {
    this.userId = userId;
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents() {
    // Default AETHON agents
    const defaultAgents: Agent[] = [
      {
        id: 'core',
        name: 'AETHON-Core',
        displayName: 'AETHON Core',
        description: 'Main AI agent for general tasks',
        status: 'idle',
        capabilities: ['chat', 'reasoning', 'planning', 'web_search', 'memory'],
        tools: ['googleSearch', 'saveMemory', 'recallMemory'],
        modelProvider: 'gemini',
        modelName: 'models/gemini-1.5-pro-latest',
        temperature: 0.7,
        maxTokens: 8192,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'coder',
        name: 'AETHON-Coder',
        displayName: 'AETHON Coder',
        description: 'Specialized in code writing and editing',
        status: 'idle',
        capabilities: ['code', 'file_system', 'terminal', 'github'],
        tools: ['readFile', 'writeFile', 'listDirectory', 'runCommand', 'githubWriteFile', 'githubOpenPR'],
        modelProvider: 'gemini',
        modelName: 'models/gemini-1.5-pro-latest',
        temperature: 0.3,
        maxTokens: 8192,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'search',
        name: 'AETHON-Search',
        displayName: 'AETHON Search',
        description: 'Research and data collection agent',
        status: 'idle',
        capabilities: ['web_search', 'data_collection', 'analysis'],
        tools: ['googleSearch'],
        modelProvider: 'gemini',
        modelName: 'models/gemini-1.5-flash-latest',
        temperature: 0.5,
        maxTokens: 4096,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'deploy',
        name: 'AETHON-Deploy',
        displayName: 'AETHON Deploy',
        description: 'Deployment and DevOps agent',
        status: 'idle',
        capabilities: ['vercel_deploy', 'github_pr', 'deployment'],
        tools: ['vercelDeploy', 'vercelListDeployments'],
        modelProvider: 'gemini',
        modelName: 'models/gemini-1.5-pro-latest',
        temperature: 0.2,
        maxTokens: 4096,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.name, agent);
    });
  }

  /**
   * Get all available agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get available agents for a task
   */
  getAgentsForCapabilities(requiredCapabilities: string[]): Agent[] {
    return Array.from(this.agents.values()).filter(agent =>
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentName: string, status: AgentStatus, taskId?: string): Promise<void> {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.status = status;
      agent.currentTaskId = taskId;
      agent.lastSeen = new Date();

      // Persist to database
      try {
        await supabaseAdmin
          .from('aethon_agents')
          .update({ 
            status, 
            current_task_id: taskId,
            last_seen: new Date().toISOString()
          })
          .eq('name', agentName);
      } catch (error) {
        console.error('Failed to update agent status in DB:', error);
      }
    }
  }

  /**
   * Execute task with agent
   */
  async executeWithAgent<T>(
    agentName: string,
    task: () => Promise<T>
  ): Promise<T> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    // Check if agent is available
    if (agent.status === 'busy') {
      throw new Error(`Agent ${agentName} is currently busy`);
    }

    // Set agent to busy
    await this.updateAgentStatus(agentName, 'busy');

    try {
      // Execute task
      const result = await task();
      
      // Set agent back to idle
      await this.updateAgentStatus(agentName, 'idle');
      
      return result;
    } catch (error) {
      // Set agent to error state
      await this.updateAgentStatus(agentName, 'error');
      throw error;
    }
  }

  /**
   * Create new agent
   */
  async createAgent(config: Partial<Agent>): Promise<Agent> {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: config.name || `Agent-${Date.now()}`,
      displayName: config.displayName || config.name || 'New Agent',
      description: config.description || '',
      status: 'idle',
      capabilities: config.capabilities || [],
      tools: config.tools || [],
      modelProvider: config.modelProvider || 'gemini',
      modelName: config.modelName || 'models/gemini-1.5-pro-latest',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 8192,
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    this.agents.set(newAgent.name, newAgent);

    // Persist to database
    try {
      await supabaseAdmin
        .from('aethon_agents')
        .insert({
          name: newAgent.name,
          display_name: newAgent.displayName,
          description: newAgent.description,
          capabilities: newAgent.capabilities,
          tools: newAgent.tools,
          model_provider: newAgent.modelProvider,
          model_name: newAgent.modelName,
          temperature: newAgent.temperature,
          max_tokens: newAgent.maxTokens,
        });
    } catch (error) {
      console.error('Failed to create agent in DB:', error);
    }

    return newAgent;
  }
}

/**
 * Task executor for agents
 */
export class TaskExecutor {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Create a new task
   */
  async createTask(title: string, description: string, taskType: string, priority: number = 0) {
    const { data, error } = await supabaseAdmin
      .from('aethon_tasks')
      .insert({
        user_id: this.userId,
        title,
        description,
        task_type: taskType,
        priority,
        status: 'queued',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get tasks by status
   */
  async getTasks(status?: string) {
    let query = supabaseAdmin
      .from('aethon_tasks')
      .select('*')
      .eq('user_id', this.userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get next queued task
   */
  async getNextTask() {
    const { data, error } = await supabaseAdmin
      .from('aethon_tasks')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'queued')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: string, result?: string, errorMsg?: string) {
    const updates: Record<string, any> = { 
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'running') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'done' || status === 'error') {
      updates.completed_at = new Date().toISOString();
    }

    if (result) updates.result = result;
    if (errorMsg) updates.error_msg = errorMsg;

    const { error } = await supabaseAdmin
      .from('aethon_tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) throw error;
  }
}

export const AgentRuntimeSystem = {
  AgentRuntime,
  TaskExecutor,
  AGENT_CAPABILITIES,
};
