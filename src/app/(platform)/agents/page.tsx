"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Bot, Zap, AlertCircle, RefreshCw } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "idle" | "busy" | "error";
  capabilities: string[];
  last_seen: string;
  current_task_id?: string;
  aethon_tasks?: { id: string; title: string; status: string } | null;
}

const STATUS_CONFIG = {
  idle: {
    label: "Idle",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  busy: {
    label: "Busy",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    dot: "bg-cyan-500 animate-pulse",
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-500",
  },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAgents() {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data.agents ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 10_000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Agents</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time agent runtime state</p>
          </div>
          <button
            onClick={loadAgents}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent, i) => {
              const { label, color, bg, dot } = STATUS_CONFIG[agent.status];
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`p-5 rounded-2xl border ${bg} space-y-3`}
                >
                  {/* Agent header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center">
                        <Bot size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{agent.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          <span className={`text-xs ${color}`}>{label}</span>
                        </div>
                      </div>
                    </div>
                    {agent.status === "busy" && (
                      <Zap size={16} className="text-cyan-400 animate-pulse" />
                    )}
                    {agent.status === "error" && (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </div>

                  {/* Current task */}
                  {agent.aethon_tasks && (
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-xs text-slate-500 mb-0.5">Current task</p>
                      <p className="text-xs text-white truncate">{agent.aethon_tasks.title}</p>
                    </div>
                  )}

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Last seen */}
                  <p className="text-xs text-slate-600">
                    Last seen: {new Date(agent.last_seen).toLocaleTimeString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
