"use client";

import { Code, Terminal as TerminalIcon } from "lucide-react";

export default function IDEPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white">Code IDE</h1>
          <p className="text-sm text-slate-500">Write and edit code with AI assistance</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 border-r border-white/5 p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Explorer</h3>
          <div className="space-y-1">
            {['src/', 'components/', 'lib/', 'app/', 'package.json'].map((file) => (
              <button
                key={file}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-400 hover:text-white hover:bg-white/5 text-left"
              >
                <Code size={14} />
                {file}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
            <span className="text-sm text-slate-400">src/app/page.tsx</span>
          </div>
          <div className="flex-1 p-4 bg-[#0a0a0a] font-mono text-sm text-slate-300">
            <pre className="whitespace-pre-wrap">{`// Welcome to AETHON IDE
// Your AI-powered code editor

import { AETHON } from '@aethon/core';

export default function Page() {
  return (
    <div>
      <h1>Hello, AETHON!</h1>
    </div>
  );
}`}</pre>
          </div>
        </div>

        {/* Terminal */}
        <div className="w-80 border-l border-white/5 bg-[#0a0a0a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TerminalIcon size={14} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-400">Terminal</span>
          </div>
          <div className="font-mono text-xs text-slate-500 space-y-1">
            <p><span className="text-cyan-400">$</span> aethon --version</p>
            <p className="text-slate-300">AETHON v1.0.0</p>
            <p className="mt-2"><span className="text-cyan-400">$</span> _</p>
          </div>
        </div>
      </div>
    </div>
  );
}
