import { supabaseAdmin } from "@/lib/db/supabase";

export interface ToolLogEntry {
  userId: string;
  toolName: string;
  args?: Record<string, unknown>;
  status: "ok" | "error";
  latencyMs?: number;
  errorMsg?: string;
}

/**
 * Log a tool call to the aethon_logs table.
 * Redacts sensitive fields (content, code, secret, token, key).
 */
export async function logToolCall(entry: ToolLogEntry): Promise<void> {
  const redactedArgs = redactSensitiveFields(entry.args ?? {});

  const { error } = await supabaseAdmin.from("aethon_logs").insert({
    user_id: entry.userId,
    tool_name: entry.toolName,
    args: redactedArgs,
    status: entry.status,
    latency_ms: entry.latencyMs ?? null,
    error_msg: entry.errorMsg ?? null,
  });

  if (error) {
    // Non-fatal: log to stderr but don't throw
    console.error("[AETHON] Failed to write audit log:", error.message);
  }
}

/**
 * Wrap a tool execution with automatic timing and logging.
 */
export async function withToolLog<T>(
  userId: string,
  toolName: string,
  args: Record<string, unknown>,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await logToolCall({
      userId,
      toolName,
      args,
      status: "ok",
      latencyMs: Date.now() - start,
    });
    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logToolCall({
      userId,
      toolName,
      args,
      status: "error",
      latencyMs: Date.now() - start,
      errorMsg,
    });
    throw err;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SENSITIVE_KEYS = ["content", "code", "secret", "token", "key", "password", "apiKey"];

function redactSensitiveFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSecret = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s));
    result[k] = isSecret ? "[REDACTED]" : v;
  }
  return result;
}
