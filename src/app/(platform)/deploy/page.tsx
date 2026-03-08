"use client";

import { HardDrive, Plus, Globe, Clock, CheckCircle, XCircle } from "lucide-react";

const DEPLOYMENTS = [
  { id: "1", name: "AETHON Platform", status: "ready", url: "aethon.ai", time: "2 hours ago" },
  { id: "2", name: "Chat Widget", status: "ready", url: "chat.aethon.ai", time: "1 day ago" },
  { id: "3", name: "Dashboard", status: "error", url: "dash.aethon.ai", time: "3 days ago" },
];

export default function DeployPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Deploy</h1>
            <p className="text-sm text-slate-500">Deploy your AI projects</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white">
            <Plus size={16} /> New Deployment
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {DEPLOYMENTS.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center">
                <HardDrive size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{d.name}</h3>
                <a href={`https://${d.url}`} className="text-sm text-cyan-400 hover:underline flex items-center gap-1">
                  <Globe size={12} /> {d.url}
                </a>
              </div>
              <div className="text-right">
                {d.status === 'ready' ? (
                  <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14} /> Ready</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400"><XCircle size={14} /> Error</span>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1 justify-end"><Clock size={10} /> {d.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
