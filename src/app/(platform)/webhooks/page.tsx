"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Zap, 
  Trash2, 
  Edit, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Webhook,
  Copy,
  Check
} from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event_type: string;
  status: string;
  response_code?: number;
  error_message?: string;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: "", url: "", events: [] });
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    }
  };

  const toggleWebhook = async (webhook: Webhook) => {
    try {
      await fetch(`/api/webhooks/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !webhook.enabled }),
      });
      fetchWebhooks();
    } catch (error) {
      console.error("Failed to toggle webhook:", error);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;
    
    try {
      await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      fetchWebhooks();
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const testWebhook = async (webhook: Webhook) => {
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}/test`, {
        method: "POST",
      });
      alert(res.ok ? "Test successful!" : "Test failed!");
    } catch (error) {
      console.error("Failed to test webhook:", error);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableEvents = [
    { value: "task.created", label: "Task Created" },
    { value: "task.updated", label: "Task Updated" },
    { value: "task.completed", label: "Task Completed" },
    { value: "agent.started", label: "Agent Started" },
    { value: "agent.completed", label: "Agent Completed" },
    { value: "agent.failed", label: "Agent Failed" },
    { value: "chat.message", label: "Chat Message" },
    { value: "deploy.started", label: "Deploy Started" },
    { value: "deploy.completed", label: "Deploy Completed" },
    { value: "deploy.failed", label: "Deploy Failed" },
    { value: "user.registered", label: "User Registered" },
    { value: "usage.threshold", label: "Usage Threshold" },
  ];

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Webhooks</h1>
            <p className="text-slate-400 mt-1">
              Connect AETHON to external services with event-driven automation
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Webhook
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Webhook size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{webhooks.length}</p>
                <p className="text-sm text-slate-400">Total Webhooks</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {webhooks.filter(w => w.enabled).length}
                </p>
                <p className="text-sm text-slate-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap size={20} className="text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">13</p>
                <p className="text-sm text-slate-400">Event Types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook List */}
        {webhooks.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
            <Webhook size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No webhooks yet</h3>
            <p className="text-slate-400 mb-4">
              Create your first webhook to start receiving events
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition-colors"
            >
              Create Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        webhook.enabled 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {webhook.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3 font-mono">{webhook.url}</p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 text-xs bg-violet-500/10 text-violet-400 rounded border border-violet-500/20"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWebhook(webhook)}
                      className={`p-2 rounded-lg transition-colors ${
                        webhook.enabled 
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                          : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                      }`}
                    >
                      {webhook.enabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </button>
                    <button
                      onClick={() => testWebhook(webhook)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Create Webhook</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Webhook"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://your-server.com/webhook"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Events
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                    {availableEvents.map((event) => (
                      <button
                        key={event.value}
                        onClick={() => toggleEvent(event.value)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          formData.events.includes(event.value)
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createWebhook}
                  disabled={!formData.name || !formData.url || formData.events.length === 0}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Webhook Payload Format</h2>
          <pre className="bg-black/50 rounded-lg p-4 text-sm text-slate-300 overflow-auto">
{`{
  "event": "task.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "task_id": "abc123",
    "task_name": "Deploy to production",
    "result": "Success"
  }
}`}
          </pre>
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-slate-400">Headers:</span>
            <code className="px-2 py-1 bg-black/50 rounded text-cyan-400">X-Aethon-Signature</code>
            <code className="px-2 py-1 bg-black/50 rounded text-cyan-400">X-Aethon-Event</code>
            <code className="px-2 py-1 bg-black/50 rounded text-cyan-400">X-Aethon-Timestamp</code>
          </div>
        </div>
      </div>
    </div>
  );
}
