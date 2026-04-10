import { spawn, ChildProcess } from 'child_process';
import { randomUUID } from 'crypto';

export interface TerminalSession {
  id: string;
  process: ChildProcess | null;
  cwd: string;
  createdAt: number;
  lastActive: number;
}

const sessions = new Map<string, TerminalSession>();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function createSession(sessionId: string, cwd?: string): TerminalSession {
  const homeDir = cwd || `/tmp/terminal-${sessionId}`;
  
  const session: TerminalSession = {
    id: sessionId,
    process: null,
    cwd: homeDir,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };
  
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): TerminalSession | undefined {
  return sessions.get(sessionId);
}

export function removeSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session?.process) {
    session.process.kill();
  }
  sessions.delete(sessionId);
}

export function cleanupOldSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      removeSession(id);
    }
  }
}

setInterval(cleanupOldSessions, 60 * 1000);

export function generateSessionId(): string {
  return randomUUID();
}