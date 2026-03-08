"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Save, Loader2, User, Cpu, Wrench, Globe } from "lucide-react";
import { supabase } from "@/lib/db/supabase";

interface UserSettings {
  backend_endpoint: string;
  model_provider: string;
  model_name: string;
  temperature: number;
  enable_search: boolean;
  enable_deploy: boolean;
  enable_self_mutation: boolean;
  enable_terminal: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  backend_endpoint: "",
  model_provider: "gemini",
  model_name: "models/gemini-1.5-pro-latest",
  temperature: 0.7,
  enable_search: true,
  enable_deploy: false,
  enable_self_mutation: false,
  enable_terminal: false,
};

const MODEL_OPTIONS = [
  { provider: "gemini", name: "models/gemini-1.5-pro-latest", label: "Gemini 1.5 Pro" },
  { provider: "gemini", name: "models/gemini-1.5-flash-latest", label: "Gemini 1.5 Flash" },
  { provider: "gemini", name: "models/gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Exp)" },
];

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setSettings({
        backend_endpoint: data.backend_endpoint ?? "",
        model_provider: data.model_provider,
        model_name: data.model_name,
        temperature: data.temperature,
        enable_search: data.enable_search,
        enable_deploy: data.enable_deploy,
        enable_self_mutation: data.enable_self_mutation,
        enable_terminal: data.enable_terminal,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveSettings() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure AETHON for your workflow</p>
        </div>

        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <User size={18} className="text-cyan-400" />
            <h2 className="font-semibold text-white">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full" />
            )}
            <div>
              <p className="font-medium text-white">{user?.fullName ?? "—"}</p>
              <p className="text-sm text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </motion.section>

        {/* Model */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={18} className="text-violet-400" />
            <h2 className="font-semibold text-white">AI Model</h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-400">Model</label>
            <select
              value={settings.model_name}
              onChange={(e) => {
                const opt = MODEL_OPTIONS.find((o) => o.name === e.target.value);
                setSettings((s) => ({
                  ...s,
                  model_name: e.target.value,
                  model_provider: opt?.provider ?? "gemini",
                }));
              }}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {MODEL_OPTIONS.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-400">
              Temperature: <span className="text-white font-mono">{settings.temperature}</span>
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.temperature}
              onChange={(e) =>
                setSettings((s) => ({ ...s, temperature: parseFloat(e.target.value) }))
              }
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>
        </motion.section>

        {/* Backend */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe size={18} className="text-emerald-400" />
            <h2 className="font-semibold text-white">Backend Endpoint</h2>
          </div>
          <input
            type="url"
            value={settings.backend_endpoint}
            onChange={(e) => setSettings((s) => ({ ...s, backend_endpoint: e.target.value }))}
            placeholder="https://your-backend.com (optional)"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </motion.section>

        {/* Tool Toggles */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Wrench size={18} className="text-orange-400" />
            <h2 className="font-semibold text-white">Tool Permissions</h2>
          </div>

          {[
            {
              key: "enable_search" as const,
              label: "Web Search",
              desc: "Allow AETHON to search Google via Serper.dev",
              color: "cyan",
            },
            {
              key: "enable_deploy" as const,
              label: "Vercel Deploy",
              desc: "Allow AETHON to trigger Vercel deployments",
              color: "violet",
              danger: true,
            },
            {
              key: "enable_self_mutation" as const,
              label: "Self-Mutation (File Write)",
              desc: "Allow AETHON to write files in the project",
              color: "orange",
              danger: true,
            },
            {
              key: "enable_terminal" as const,
              label: "Terminal Access",
              desc: "Allow AETHON to run safe terminal commands",
              color: "red",
              danger: true,
            },
          ].map(({ key, label, desc, danger }) => (
            <div
              key={key}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                danger ? "border-orange-500/20 bg-orange-500/5" : "border-white/5 bg-white/5"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  {label}
                  {danger && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                      Dangerous
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings[key] ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    settings[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </motion.section>

        {/* Save */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-violet-500 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : saved ? (
            "✓ Saved!"
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
