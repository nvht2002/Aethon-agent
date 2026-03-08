"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, ListTodo, Clock, CheckCircle, XCircle, Play } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  status: "queued" | "running" | "done" | "error";
  created_at: string;
}

const STATUS_CONFIG = {
  queued: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
  running: { icon: Play, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  done: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: 0 });

  async function loadTasks() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function createTask() {
    if (!form.title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", description: "", priority: 0 });
      setShowForm(false);
      await loadTasks();
    }
    setCreating(false);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-slate-400 text-sm mt-1">Priority-ordered task queue</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-violet-500 transition-all"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <input
                type="text"
                placeholder="Task title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Priority: <span className="text-white font-mono">{form.priority}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <button
                  onClick={createTask}
                  disabled={creating || !form.title.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium disabled:opacity-50 hover:bg-cyan-400 transition-all flex items-center gap-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : "Create"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <ListTodo size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No tasks yet. Create your first task above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const { icon: StatusIcon, color, bg } = STATUS_CONFIG[task.status];
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${bg}`}
                >
                  <StatusIcon size={18} className={`${color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm truncate">{task.title}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono shrink-0">
                        P{task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${color} shrink-0`}>{task.status}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
