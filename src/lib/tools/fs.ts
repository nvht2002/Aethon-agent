/**
 * AETHON Tool: File System access with allowlist policy
 * Note: On Vercel, the filesystem is read-only except /tmp.
 * Writes are best-effort and may fail in production.
 */

import fs from "fs/promises";
import path from "path";
import { checkFsPolicy } from "@/lib/agent/policy";

const ROOT = process.cwd();

function resolveSafe(filePath: string): string {
  const resolved = path.resolve(ROOT, filePath);
  // Prevent path traversal outside project root
  if (!resolved.startsWith(ROOT)) {
    throw new Error(`Path traversal detected: "${filePath}"`);
  }
  return resolved;
}

// ─── Read File ────────────────────────────────────────────────────────────────
export async function readFile(filePath: string): Promise<string> {
  const policy = checkFsPolicy(filePath);
  if (!policy.allowed) throw new Error(`FS Policy denied: ${policy.reason}`);

  const resolved = resolveSafe(filePath);
  const content = await fs.readFile(resolved, "utf-8");
  return content;
}

// ─── Write File (with backup) ─────────────────────────────────────────────────
export async function writeFile(filePath: string, content: string): Promise<void> {
  const policy = checkFsPolicy(filePath);
  if (!policy.allowed) throw new Error(`FS Policy denied: ${policy.reason}`);

  const resolved = resolveSafe(filePath);
  const backupPath = resolved + ".bak";

  // Create backup if file exists
  try {
    await fs.access(resolved);
    await fs.copyFile(resolved, backupPath);
  } catch {
    // File doesn't exist yet — no backup needed
  }

  // Ensure directory exists
  await fs.mkdir(path.dirname(resolved), { recursive: true });

  // Write new content
  await fs.writeFile(resolved, content, "utf-8");
}

// ─── List Directory ───────────────────────────────────────────────────────────
export async function listDirectory(dirPath: string): Promise<string[]> {
  const policy = checkFsPolicy(dirPath);
  if (!policy.allowed) throw new Error(`FS Policy denied: ${policy.reason}`);

  const resolved = resolveSafe(dirPath);
  const entries = await fs.readdir(resolved, { withFileTypes: true });
  return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
}
