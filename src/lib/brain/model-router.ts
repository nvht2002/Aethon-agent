/**
 * AETHON AI Brain - Layer 4: Model Router
 * 
 * Routes requests to appropriate AI models based on task requirements.
 */

import { google } from "@ai-sdk/google";

/**
 * Supported AI providers
 */
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'local';

/**
 * Model information
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: string[];
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
}

/**
 * Available models
 */
export const MODELS: Record<string, ModelInfo> = {
  // Gemini models
  'gemini-pro': {
    id: 'models/gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    capabilities: ['chat', 'code', 'vision', 'search', 'reasoning', 'planning'],
    inputCost: 1.25,
    outputCost: 5.0,
  },
  'gemini-flash': {
    id: 'models/gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    capabilities: ['chat', 'code', 'vision', 'search', 'fast'],
    inputCost: 0.075,
    outputCost: 0.3,
  },
  'gemini-pro-vision': {
    id: 'models/gemini-1.5-pro-vision-preview',
    name: 'Gemini Pro Vision',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 4096,
    capabilities: ['chat', 'code', 'vision'],
    inputCost: 1.25,
    outputCost: 5.0,
  },
};

/**
 * Task types and their recommended models
 */
const TASK_MODEL_MAP: Record<string, string> = {
  'chat': 'gemini-flash',
  'code': 'gemini-pro',
  'research': 'gemini-flash',
  'vision': 'gemini-pro-vision',
  'reasoning': 'gemini-pro',
  'fast': 'gemini-flash',
  'default': 'gemini-pro',
};

/**
 * Model Router - selects optimal model for task
 */
export class ModelRouter {
  private userSettings: {
    modelProvider?: string;
    modelName?: string;
    temperature?: number;
  };

  constructor(settings?: { modelProvider?: string; modelName?: string; temperature?: number }) {
    this.userSettings = settings || {};
  }

  /**
   * Get model for task type
   */
  getModelForTask(taskType: string): ModelInfo {
    // Check if user has a custom model setting
    if (this.userSettings.modelName && MODELS[this.userSettings.modelName]) {
      return MODELS[this.userSettings.modelName];
    }

    const modelId = TASK_MODEL_MAP[taskType] || TASK_MODEL_MAP['default'];
    return MODELS[modelId];
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): ModelInfo | undefined {
    return MODELS[modelId];
  }

  /**
   * Get all available models
   */
  getAllModels(): ModelInfo[] {
    return Object.values(MODELS);
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: string): ModelInfo[] {
    return Object.values(MODELS).filter(m => 
      m.capabilities.includes(capability)
    );
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = MODELS[modelId];
    if (!model) return 0;

    const inputCost = (inputTokens / 1000000) * model.inputCost;
    const outputCost = (outputTokens / 1000000) * model.outputCost;
    
    return inputCost + outputCost;
  }

  /**
   * Create model instance for use
   */
  createModel(modelId: string, options?: { temperature?: number; maxTokens?: number }) {
    const modelInfo = this.getModel(modelId);
    if (!modelInfo) {
      throw new Error(`Model ${modelId} not found`);
    }

    const model = google(modelInfo.id);

    return {
      model,
      info: modelInfo,
      options: {
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? modelInfo.maxOutputTokens,
      },
    };
  }
}

/**
 * Multi-model AI client
 */
export class MultiModelClient {
  private router: ModelRouter;
  private userId: string;

  constructor(userId: string, settings?: { modelProvider?: string; modelName?: string; temperature?: number }) {
    this.userId = userId;
    this.router = new ModelRouter(settings);
  }

  /**
   * Route to appropriate model based on task
   */
  route(taskType: string, options?: { temperature?: number; maxTokens?: number }) {
    const modelInfo = this.router.getModelForTask(taskType);
    const model = google(modelInfo.id);

    return {
      send: async (messages: any[]) => {
        // This would use the AI SDK to send to the model
        return { model: modelInfo, messages };
      },
      model,
      info: modelInfo,
      options: {
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? modelInfo.maxOutputTokens,
      },
    };
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return this.router.getAllModels();
  }

  /**
   * Switch model
   */
  switchModel(modelId: string) {
    return this.router.createModel(modelId);
  }
}

export const ModelRouterSystem = {
  ModelRouter,
  MultiModelClient,
  MODELS,
};
