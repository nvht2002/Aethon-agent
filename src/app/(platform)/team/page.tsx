"use client";

import { Users, Plus, Mail, Shield } from "lucide-react";

const TEAM_MEMBERS = [
  { id: "1", name: "Nguyễn Văn Hoài Thương", email: "thuongnv@aethon.ai", role: "owner" },
  { id: "2", name: "AI Assistant", email: "ai@aethon.ai", role: "admin" },
];

export default function TeamPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Team</h1>
            <p className="text-sm text-slate-500">Manage your team members</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white">
            <Plus size={16} /> Invite
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center">
                <Users size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Mail size={12} /> {member.email}
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-white/5 text-xs text-slate-400 flex items-center gap-1">
                <Shield size={10} /> {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
