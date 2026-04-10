'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalProps {
  sessionId?: string;
}

export default function Terminal({ sessionId: initialSessionId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [sessionId, setSessionId] = useState<string>(initialSessionId || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const currentLineRef = useRef('');
  const cursorPositionRef = useRef(0);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) {
      xtermRef.current?.write('\r\n$ ');
      return;
    }
    
    xtermRef.current?.write('\r\n');
    setIsExecuting(true);
    
    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          sessionId: sessionId || undefined,
        }),
      });
      
      const result = await response.json();
      
      if (result.sessionId && !sessionId) {
        setSessionId(result.sessionId);
      }
      
      if (result.stdout) {
        xtermRef.current?.write(result.stdout);
      }
      if (result.stderr) {
        xtermRef.current?.write(`\x1b[31m${result.stderr}\x1b[0m`);
      }
      
      xtermRef.current?.write(`\r\n$ `);
    } catch (error) {
      xtermRef.current?.write(`\x1b[31mError: ${error}\x1b[0m\r\n$ `);
    } finally {
      setIsExecuting(false);
    }
  }, [sessionId]);

  const handleKeyDown = useCallback((data: { key: string; domEvent: KeyboardEvent }) => {
    const e = data.domEvent;
    if (!xtermRef.current || isExecuting) return;
    
    const term = xtermRef.current;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = currentLineRef.current;
      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      term.write('\r\n');
      executeCommand(command);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (cursorPositionRef.current > 0) {
        currentLineRef.current = currentLineRef.current.slice(0, -1);
        cursorPositionRef.current--;
        term.write('\b \b');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      term.write('^C\r\n$ ');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = currentLineRef.current;
      const parts = current.split(' ');
      const lastPart = parts[parts.length - 1];
      const matches = ['ls', 'cd', 'pwd', 'cat', 'echo', 'node', 'npm', 'git', 'curl', 'python', 'pip'].filter(
        cmd => cmd.startsWith(lastPart)
      );
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        currentLineRef.current = parts.join(' ');
        cursorPositionRef.current = currentLineRef.current.length;
        term.write('\r\x1b[K$ ' + currentLineRef.current);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
    } else if (e.key.length === 1) {
      e.preventDefault();
      currentLineRef.current += e.key;
      cursorPositionRef.current++;
      term.write(e.key);
    }
  }, [executeCommand, isExecuting]);

  useEffect(() => {
    if (!terminalRef.current) return;
    
    const term = new XTerm({
      theme: {
        background: '#0D0D0D',
        foreground: '#00FF41',
        cursor: '#00FF41',
        cursorAccent: '#0D0D0D',
        selectionBackground: '#00FF4133',
        black: '#0D0D0D',
        red: '#FF3333',
        green: '#00FF41',
        yellow: '#FFFF33',
        blue: '#3333FF',
        magenta: '#FF33FF',
        cyan: '#33FFFF',
        white: '#FFFFFF',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: false,
    });
    
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    
    term.write('\x1b[32m');
    term.write('╔════════════════════════════════════════════════════════════╗\r\n');
    term.write('║           Mobile Shell Terminal v1.0               ║\r\n');
    term.write('║                                                    ║\r\n');
    term.write('║  Type commands to execute them on the server.                ║\r\n');
    term.write('║  Supported: node, npm, git, python, curl, etc.     ║\r\n');
    term.write('╚════════════════════════════════════════════════════════════╝\x1b[0m\r\n\r\n');
    term.write('$ ');
    
    term.onKey(({ key, domEvent }) => handleKeyDown({ key, domEvent }));
    
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    setIsConnected(true);
    
    const handleResize = () => {
      fitAddon.fit();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400 font-mono">
            {sessionId ? sessionId.slice(0, 8) : 'No session'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isExecuting && <span className="text-xs text-yellow-400 animate-pulse">Executing...</span>}
        </div>
      </div>
      
      <div 
        ref={terminalRef} 
        className="flex-1 p-2 overflow-hidden"
        style={{ minHeight: '300px' }}
      />
      
      <div className="fixed bottom-4 right-4 flex gap-2 md:hidden">
        <button
          onClick={() => {
            if (xtermRef.current) {
              currentLineRef.current += '\t';
              cursorPositionRef.current = currentLineRef.current.length;
              xtermRef.current.write('\t');
            }
          }}
          className="w-10 h-10 bg-[#1A1A1A] border border-[#333] rounded text-white text-sm font-mono"
        >
          TAB
        </button>
        <button
          onClick={() => {
            if (xtermRef.current) {
              currentLineRef.current += ' ';
              cursorPositionRef.current = currentLineRef.current.length;
              xtermRef.current.write(' ');
            }
          }}
          className="w-10 h-10 bg-[#1A1A1A] border border-[#333] rounded text-white text-sm font-mono"
        >
          SPACE
        </button>
        <button
          onClick={() => {
            if (xtermRef.current) {
              currentLineRef.current = currentLineRef.current.slice(0, -1);
              cursorPositionRef.current = currentLineRef.current.length;
              xtermRef.current.write('\b \b');
            }
          }}
          className="w-10 h-10 bg-[#1A1A1A] border border-[#333] rounded text-white text-sm font-mono"
        >
          DEL
        </button>
      </div>
    </div>
  );
}