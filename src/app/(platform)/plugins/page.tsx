"use client";

import { Package, Search, Star, Download } from "lucide-react";

const PLUGINS = [
  { id: "1", name: "Slack Integration", author: "AETHON", downloads: 1250, rating: 4.8, category: "productivity" },
  { id: "2", name: "GitHub Actions", author: "AETHON", downloads: 980, rating: 4.6, category: "devtools" },
  { id: "3", name: "Discord Bot", author: "Community", downloads: 756, rating: 4.5, category: "social" },
  { id: "4", name: "Notion Sync", author: "AETHON", downloads: 542, rating: 4.7, category: "productivity" },
  { id: "5", name: "Stripe Payments", author: "Community", downloads: 423, rating: 4.4, category: "finance" },
  { id: "6", name: "Analytics Pro", author: "AETHON", downloads: 389, rating: 4.9, category: "analytics" },
];

export default function PluginsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Plugins</h1>
            <p className="text-sm text-slate-500">Extend AETHON with plugins</p>
          </div>
        </div>
        <div className="mt-4 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search plugins..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLUGINS.map((plugin) => (
            <div key={plugin.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center">
                  <Package size={18} className="text-cyan-400" />
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-slate-400">{plugin.category}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{plugin.name}</h3>
              <p className="text-xs text-slate-500 mb-3">by {plugin.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <Star size={14} className="text-amber-400 fill-current" />
                  <span>{plugin.rating}</span>
                </div>
                <button className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
                  <Download size={14} />
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
