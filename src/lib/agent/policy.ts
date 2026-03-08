/**
 * AETHON Security Policy Layer
 * All tool calls are validated against these policies before execution.
 */

// ─── File System Policy ───────────────────────────────────────────────────────
const FS_ALLOWLIST = [
  "src/app",
  "src/components",
  "src/lib",
  "src/types",
  "public",
];

const FS_DENYLIST = [
  ".env",
  ".env.local",
  ".env.production",
  "node_modules",
  ".git",
  "bun.lock",
  "package-lock.json",
];

export function checkFsPolicy(filePath: string): { allowed: boolean; reason?: string } {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\//, "");

  for (const denied of FS_DENYLIST) {
    if (normalized.includes(denied)) {
      return { allowed: false, reason: `Path "${filePath}" is in the deny list.` };
    }
  }

  const isAllowed = FS_ALLOWLIST.some((allowed) => normalized.startsWith(allowed));
  if (!isAllowed) {
    return {
      allowed: false,
      reason: `Path "${filePath}" is outside the allowed directories: ${FS_ALLOWLIST.join(", ")}`,
    };
  }

  return { allowed: true };
}

// ─── Terminal Policy ──────────────────────────────────────────────────────────
const TERMINAL_DENY_PATTERNS = [
  /rm\s+-rf/i,
  /shutdown/i,
  /reboot/i,
  /mkfs/i,
  /dd\s+if=/i,
  /chmod\s+777/i,
  /curl.*\|\s*bash/i,
  /wget.*\|\s*bash/i,
  />\s*\/dev\/sd/i,
  /format\s+c:/i,
  /del\s+\/[fqs]/i,
];

const TERMINAL_ALLOW_PATTERNS = [
  /^(ls|dir|pwd|echo|cat|head|tail|grep|find|wc|sort|uniq|diff)\b/,
  /^(git\s+(status|log|diff|show|branch|fetch|pull))\b/,
  /^(bun|npm|yarn)\s+(install|run|build|test|lint|typecheck)\b/,
  /^(node|bun)\s+/,
  /^(tsc|eslint|prettier)\b/,
];

export function checkTerminalPolicy(command: string): { allowed: boolean; reason?: string } {
  for (const pattern of TERMINAL_DENY_PATTERNS) {
    if (pattern.test(command)) {
      return { allowed: false, reason: `Command matches deny pattern: ${pattern}` };
    }
  }

  const isAllowed = TERMINAL_ALLOW_PATTERNS.some((p) => p.test(command.trim()));
  if (!isAllowed) {
    return {
      allowed: false,
      reason: `Command "${command}" is not in the allow list. Only safe read/build commands are permitted.`,
    };
  }

  return { allowed: true };
}

// ─── Dangerous Tool Guard ─────────────────────────────────────────────────────
export type DangerousTool = "selfMutation" | "terminal" | "vercelDeploy" | "githubWrite";

export function checkDangerousToolPolicy(
  tool: DangerousTool,
  userSettings: { enable_self_mutation?: boolean; enable_terminal?: boolean; enable_deploy?: boolean }
): { allowed: boolean; reason?: string } {
  if (tool === "selfMutation" && !userSettings.enable_self_mutation) {
    return { allowed: false, reason: "Self-mutation is disabled in your settings." };
  }
  if (tool === "terminal" && !userSettings.enable_terminal) {
    return { allowed: false, reason: "Terminal access is disabled in your settings." };
  }
  if (tool === "vercelDeploy" && !userSettings.enable_deploy) {
    return { allowed: false, reason: "Vercel deploy is disabled in your settings." };
  }
  return { allowed: true };
}
