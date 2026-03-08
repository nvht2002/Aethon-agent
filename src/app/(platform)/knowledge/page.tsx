"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Database, 
  Plus, 
  Search, 
  FileText,
  Globe,
  Github,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";

const KNOWLEDGE_SOURCES = [
  {
    id: "1",
    name: "Documentation",
    type: "web",
    url: "https://docs.aethon.ai",
    status: "synced",
    lastSync: "2 hours ago",
    documentCount: 156,
  },
  {
    id: "2",
    name: "GitHub Repository",
    type: "github",
    url: "https://github.com/nvht2002/aethon",
    status: "synced",
    lastSync: "1 day ago",
    documentCount: 89,
  },
  {
    id: "3",
    name: "API Reference",
    type: "web",
    url: "https://api.aethon.ai",
    status: "pending",
    lastSync: "Never",
    documentCount: 0,
  },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
            <p className="text-sm text-slate-500">Manage your AI knowledge sources</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white hover:from-cyan-400 hover:to-violet-500 transition-all">
            <Plus size={16} />
            Add Source
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Total Documents</p>
            <p className="text-2xl font-bold text-white">245</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Sources</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-1">Last Indexed</p>
            <p className="text-2xl font-bold text-white">2h</p>
          </div>
        </div>

        {/* Sources */}
        <h2 className="text-lg font-semibold text-white mb-4">Knowledge Sources</h2>
        <div className="space-y-3">
          {KNOWLEDGE_SOURCES.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center">
                {source.type === 'web' ? <Globe size={20} className="text-cyan-400" /> : <Github size={20} className="text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{source.name}</h3>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${source.status === 'synced' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }
                  `}>
                    {source.status === 'synced' ? (
                      <span className="flex items-center gap-1"><CheckCircle size={10} /> Synced</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock size={10} /> Pending</span>
                    )}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">{source.url}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-white">{source.documentCount} docs</p>
                <p className="text-xs text-slate-500">{source.lastSync}</p>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <RefreshCw size={16} />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Add */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Add</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all group">
              <Globe size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-300">Website URL</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all group">
              <Github size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-300">GitHub Repo</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all group">
              <FileText size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-300">Upload PDF</span>
            </button>
            <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all group">
              <Database size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm text-slate-300">Connect Notion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
