"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Check, 
  Zap,
  Settings,
  ChevronRight,
  MessageSquare,
  Code,
  Eye,
  Search,
} from "lucide-react";

const MODELS = [
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Most capable model for complex tasks. 1M token context window.",
    contextWindow: "1M",
    maxOutput: "8K",
    capabilities: ["chat", "code", "vision", "search", "reasoning"],
    inputCost: 1.25,
    outputCost: 5.0,
    status: "active",
  },
  {
    id: "gemini-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Fast and efficient for high-frequency tasks. 1M token context.",
    contextWindow: "1M",
    maxOutput: "8K",
    capabilities: ["chat", "code", "vision", "search"],
    inputCost: 0.075,
    outputCost: 0.3,
    status: "active",
  },
  {
    id: "gemini-vision",
    name: "Gemini Pro Vision",
    provider: "Google",
    description: "Specialized for vision and image understanding tasks.",
    contextWindow: "1M",
    maxOutput: "4K",
    capabilities: ["chat", "vision"],
    inputCost: 1.25,
    outputCost: 5.0,
    status: "active",
  },
];

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  chat: <MessageSquare size={12} />,
  code: <Code size={12} />,
  vision: <Eye size={12} />,
  search: <Search size={12} />,
  reasoning: <Brain size={12} />,
};

export default function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  return (
    <div className="flex h-full">
      {/* Model List */}
      <div className="w-80 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white">AI Models</h2>
          <p className="text-sm text-slate-500">Select model for your agents</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                ${selectedModel.id === model.id 
                  ? 'bg-cyan-500/10 border border-cyan-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${selectedModel.id === model.id 
                  ? 'bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20' 
                  : 'bg-white/5'
                }
              `}>
                <Brain size={18} className={selectedModel.id === model.id ? 'text-cyan-400' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{model.name}</p>
                <p className="text-xs text-slate-500">{model.provider}</p>
              </div>
              {selectedModel.id === model.id && (
                <Check size={16} className="text-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Model Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{selectedModel.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  {selectedModel.status}
                </span>
              </div>
              <p className="text-slate-400">{selectedModel.description}</p>
            </div>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Settings size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Context Window</p>
              <p className="text-xl font-bold text-white">{selectedModel.contextWindow}</p>
              <p className="text-xs text-slate-500">tokens</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Max Output</p>
              <p className="text-xl font-bold text-white">{selectedModel.maxOutput}</p>
              <p className="text-xs text-slate-500">tokens</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Speed</p>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                <p className="text-xl font-bold text-white">Fast</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
            <h3 className="font-semibold text-white mb-4">Pricing (per 1M tokens)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Input</p>
                <p className="text-lg font-bold text-white">${selectedModel.inputCost}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Output</p>
                <p className="text-lg font-bold text-white">${selectedModel.outputCost}</p>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="font-semibold text-white mb-4">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {selectedModel.capabilities.map((cap) => (
                <span 
                  key={cap}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-slate-300"
                >
                  {CAPABILITY_ICONS[cap]}
                  <span className="capitalize">{cap}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group">
                <span className="text-sm text-slate-300">Test Model</span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
              <button className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group">
                <span className="text-sm text-slate-300">Set as Default</span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
