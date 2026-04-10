import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { TerminalSession, createSession, getSession, removeSession, generateSessionId } from './sessions';

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function spawnShell(
  sessionId: string,
  command: string,
  cwd?: string
): Promise<ShellResult> {
  return new Promise((resolve) => {
    let session = getSession(sessionId);
    if (!session) {
      session = createSession(sessionId, cwd);
    }
    
    const shell = process.env.SHELL || '/bin/bash';
    const workingDir = cwd || session.cwd;
    
    const proc = spawn(shell, ['-c', command], {
      cwd: workingDir,
      env: { ...process.env, TERM: 'xterm-256color' },
      shell: false,
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });
    
    proc.on('error', (err) => {
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
      });
    });
  });
}

export async function createShellSession(cwd?: string): Promise<TerminalSession> {
  const sessionId = generateSessionId();
  const homeDir = cwd || `/tmp/terminal-${sessionId}`;
  
  if (!fs.existsSync(homeDir)) {
    fs.mkdirSync(homeDir, { recursive: true });
  }
  
  return createSession(sessionId, homeDir);
}

export function destroyShellSession(sessionId: string): void {
  removeSession(sessionId);
}

export async function executeCommand(
  sessionId: string,
  command: string
): Promise<ShellResult> {
  const session = getSession(sessionId);
  return spawnShell(sessionId, command, session?.cwd);
}

export type { TerminalSession };
export { getSession, createSession, removeSession, generateSessionId };