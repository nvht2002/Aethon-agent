"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Search,
  Database,
  Terminal,
  Github,
  Globe,
  FileText,
  Zap,
} from "lucide-react";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  googleSearch: <Search size={12} />,
  saveMemory: <Database size={12} />,
  recallMemory: <Database size={12} />,
  vercelDeploy: <Globe size={12} />,
  vercelListDeployments: <Globe size={12} />,
  githubWriteFile: <Github size={12} />,
  githubOpenPR: <Github size={12} />,
  githubCreateBranch: <Github size={12} />,
  readFile: <FileText size={12} />,
  writeFile: <FileText size={12} />,
  listDirectory: <FileText size={12} />,
  runCommand: <Terminal size={12} />,
};

const SUGGESTIONS = [
  "Search Google for latest AI news",
  "Remember that I prefer TypeScript",
  "List my recent Vercel deployments",
  "Read the file src/app/page.tsx",
  "What do you remember about me?",
];

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        setRows(1);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    const lineCount = e.target.value.split("\n").length;
    setRows(Math.min(lineCount, 6));
  };

  return (
    <div className="flex flex-col h-full bg-[#030712]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
          <Zap size={16} className="text-white fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-white">AETHON Chat</h1>
          <p className="text-xs text-slate-500">Gemini 1.5 Pro · Real tools enabled</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center">
              <Zap size={32} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">AETHON is ready</h2>
              <p className="text-slate-400 text-sm max-w-md">
                I can search the web, remember things, deploy to Vercel, write GitHub PRs, read
                files, and run commands. What shall we build?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    handleInputChange({ target: { value: s } } as React.ChangeEvent<HTMLTextAreaElement>);
                    textareaRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-cyan-400" />
                </div>
              )}

              <div className={`max-w-[80%] space-y-2 ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {/* Tool invocations */}
                {m.toolInvocations?.map((inv) => (
                  <div
                    key={inv.toolCallId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 font-mono"
                  >
                    <span className="text-cyan-400">
                      {TOOL_ICONS[inv.toolName] ?? <Sparkles size={12} />}
                    </span>
                    <span>{inv.toolName}</span>
                    {inv.state === "call" && (
                      <Loader2 size={10} className="animate-spin text-cyan-400" />
                    )}
                    {inv.state === "result" && (
                      <span className="text-emerald-400">✓</span>
                    )}
                  </div>
                ))}

                {/* Message content */}
                {m.content && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 text-white rounded-tr-sm"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-violet-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="text-red-400 text-sm px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            Error: {error.message}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <form
          onSubmit={(e) => {
            handleSubmit(e);
            setRows(1);
          }}
          className="relative bg-white/5 border border-white/10 rounded-2xl focus-within:border-cyan-500/50 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={rows}
            placeholder="Ask AETHON anything... (Shift+Enter for new line)"
            className="w-full bg-transparent px-4 pt-4 pb-12 text-sm text-white placeholder:text-slate-600 outline-none resize-none"
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-violet-500 transition-all"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-slate-600 mt-2">
          AETHON uses real APIs — no fake data, no simulations
        </p>
      </div>
    </div>
  );
}
