"use client";

import { motion } from "framer-motion";
import { Wand2, Clock, Play, Plus } from "lucide-react";

const WORKFLOWS = [
  {
    id: "1",
    name: "Daily Code Review",
    description: "Automatically review code changes every day at 9 AM",
    trigger: "schedule",
    schedule: "Every day at 9:00 AM",
    status: "active",
    lastRun: "2 hours ago",
    runCount: 45,
  },
  {
    id: "2",
    name: "Deploy on Merge",
    description: "Deploy to Vercel when PR is merged to main",
    trigger: "webhook",
    schedule: "On push to main",
    status: "active",
    lastRun: "1 day ago",
    runCount: 23,
  },
];

export default function WorkflowsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Workflows</h1>
            <p className="text-sm text-slate-500">Automate your AI workflows</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white hover:from-cyan-400 hover:to-violet-500 transition-all">
            <Plus size={16} />
            New Workflow
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {WORKFLOWS.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
                <Wand2 size={20} className="text-violet-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{workflow.name}</h3>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${workflow.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }
                  `}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{workflow.description}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-slate-400 mb-1">
                  <Clock size={14} />
                  <span>{workflow.schedule}</span>
                </div>
                <p className="text-xs text-slate-500">Last run: {workflow.lastRun}</p>
              </div>

              <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <Play size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Cards */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Start from Template</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              "Code Review",
              "Auto Deploy",
              "Data Sync",
              "Report Gen",
              "Test Run",
              "Backup",
            ].map((template) => (
              <button
                key={template}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all text-left group"
              >
                <Wand2 size={20} className="text-slate-400 mb-2 group-hover:text-cyan-400 transition-colors" />
                <p className="text-sm font-medium text-slate-300">{template}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
