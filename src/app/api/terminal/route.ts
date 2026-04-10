import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const sessions = new Map<string, { cwd: string; createdAt: number }>();

const MAX_OUTPUT_SIZE = 100 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { command, sessionId } = body;
    
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }
    
    const sid = sessionId || randomUUID();
    let session = sessions.get(sid);
    
    if (!session) {
      const cwd = `/tmp/terminal-${sid}`;
      if (!fs.existsSync(cwd)) {
        fs.mkdirSync(cwd, { recursive: true });
      }
      session = { cwd, createdAt: Date.now() };
      sessions.set(sid, session);
    }
    
    const shell = process.env.SHELL || '/bin/bash';
    
    return new Promise<NextResponse>((resolve) => {
      const proc = spawn(shell, ['-c', command], {
        cwd: session!.cwd,
        env: { ...process.env, TERM: 'xterm-256color', HOME: session!.cwd },
      });
      
      let stdout = '';
      let stderr = '';
      let outputSize = 0;
      
      proc.stdout?.on('data', (chunk) => {
        const str = chunk.toString();
        outputSize += str.length;
        if (outputSize <= MAX_OUTPUT_SIZE) {
          stdout += str;
        }
      });
      
      proc.stderr?.on('data', (chunk) => {
        const str = chunk.toString();
        outputSize += str.length;
        if (outputSize <= MAX_OUTPUT_SIZE) {
          stderr += str;
        }
      });
      
      proc.on('close', (code) => {
        sessions.set(sid, { ...session!, createdAt: Date.now() });
        
        if (outputSize > MAX_OUTPUT_SIZE) {
          stdout += '\n[Output truncated - exceeded 100KB limit]';
        }
        
        resolve(NextResponse.json({
          sessionId: sid,
          command,
          stdout,
          stderr,
          exitCode: code || 0,
          cwd: session!.cwd,
        }));
      });
      
      proc.on('error', (err) => {
        resolve(NextResponse.json({
          sessionId: sid,
          command,
          stdout: '',
          stderr: err.message,
          exitCode: 1,
          cwd: session!.cwd,
        }));
      });
      
      setTimeout(() => {
        proc.kill();
        resolve(NextResponse.json({
          sessionId: sid,
          command,
          stdout: stdout + '\n[Command timed out after 30 seconds]',
          stderr: '',
          exitCode: 124,
          cwd: session!.cwd,
        }));
      }, 30000);
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (sessionId && sessions.has(sessionId)) {
    return NextResponse.json({
      sessionId,
      session: sessions.get(sessionId),
    });
  }
  
  return NextResponse.json({
    message: 'Terminal API - POST command to execute',
    usage: {
      method: 'POST',
      body: { command: 'ls -la', sessionId: 'optional-existing-session' },
    },
    availableSessions: sessions.size,
  });
}