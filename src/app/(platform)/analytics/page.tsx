"use client";

import { BarChart3, TrendingUp, Users, MessageSquare, Bot } from "lucide-react";

const STATS = [
  { label: "Total API Calls", value: "12,458", change: "+12%", icon: MessageSquare },
  { label: "Active Agents", value: "4", change: "0%", icon: Bot },
  { label: "Total Users", value: "1,234", change: "+5%", icon: Users },
  { label: "Avg Response Time", value: "1.2s", change: "-8%", icon: TrendingUp },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-500">Track your AI usage and performance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={18} className="text-cyan-400" />
                <span className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-400' : stat.change.startsWith('-') ? 'text-amber-400' : 'text-slate-400'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-cyan-400" />
            <h3 className="font-semibold text-white">Usage Over Time</h3>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-500/5 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
