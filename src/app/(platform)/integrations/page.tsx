"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "Google Gemini",
    description: "AI model powering AETHON's brain — streaming, tool calling, embeddings",
    url: "https://aistudio.google.com",
    icon: "🧠",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    badge: "Active",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
  },
  {
    name: "Postman",
    description: "API testing and documentation platform for AETHON's REST endpoints",
    url: "https://postman.co",
    icon: "📮",
    color: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "CodeRabbit",
    description: "AI-powered code review — automatically reviews every PR in your repos",
    url: "https://coderabbit.ai",
    icon: "🐰",
    color: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "Claude AI",
    description: "Anthropic's Claude — alternative AI model for complex reasoning tasks",
    url: "https://claude.ai",
    icon: "🤖",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "Lovable",
    description: "AI-powered full-stack web app builder — rapid prototyping platform",
    url: "https://lovable.dev",
    icon: "💜",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "Vercel",
    description: "Deploy AETHON and your projects — AETHON can trigger deployments via API",
    url: "https://vercel.com",
    icon: "▲",
    color: "from-slate-500/20 to-gray-500/20",
    border: "border-slate-500/20",
    badge: "Active",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
  },
  {
    name: "CodeSandbox",
    description: "Instant cloud development environments for rapid prototyping",
    url: "https://codesandbox.io",
    icon: "📦",
    color: "from-cyan-500/20 to-teal-500/20",
    border: "border-cyan-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "DEV Community",
    description: "Developer community — share AETHON articles and tutorials",
    url: "https://dev.to",
    icon: "📝",
    color: "from-gray-500/20 to-slate-500/20",
    border: "border-gray-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "Google Colab",
    description: "Jupyter notebooks in the cloud — run AETHON ML experiments",
    url: "https://colab.google",
    icon: "🔬",
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "NixOS",
    description: "Reproducible Linux OS — declarative system configuration for AETHON infra",
    url: "https://nixos.org",
    icon: "❄️",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "Base44",
    description: "AI-native app builder — create full-stack apps with natural language",
    url: "https://base44.com",
    icon: "🏗️",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
  {
    name: "VS Code Web",
    description: "Browser-based VS Code — edit AETHON source code from anywhere",
    url: "https://vscode.dev",
    icon: "💻",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    badge: "External",
    badgeColor: "bg-slate-500/20 text-slate-400",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-slate-400 text-sm mt-1">
            AETHON connects with the best tools in the ecosystem
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration, i) => (
            <motion.a
              key={integration.name}
              href={integration.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group relative bg-gradient-to-br ${integration.color} border ${integration.border} rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer`}
            >
              {/* Badge */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{integration.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${integration.badgeColor}`}>
                  {integration.badge}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                {integration.name}
                <ExternalLink
                  size={12}
                  className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{integration.description}</p>
            </motion.a>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-8">
          &quot;Active&quot; integrations are directly used by AETHON via API. &quot;External&quot; links open in a new tab.
        </p>
      </div>
    </div>
  );
}
