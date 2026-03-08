/**
 * AETHON Tool: Long-term Memory via Supabase pgvector + Gemini embeddings
 * Real API calls — no mocks.
 */

import { supabaseAdmin } from "@/lib/db/supabase";

const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_DIMS = 768;

// ─── Embedding ────────────────────────────────────────────────────────────────
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini embedding error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const values: number[] = data.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIMS) {
    throw new Error(`Unexpected embedding dimensions: ${values?.length}`);
  }
  return values;
}

// ─── Save Memory ──────────────────────────────────────────────────────────────
export async function saveMemory(
  userId: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<{ id: string }> {
  const embedding = await generateEmbedding(content);

  const { data, error } = await supabaseAdmin
    .from("memories")
    .insert({ user_id: userId, content, metadata, embedding })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to save memory: ${error.message}`);
  return { id: data.id };
}

// ─── Recall Memory ────────────────────────────────────────────────────────────
export interface MemoryResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function recallMemory(
  userId: string,
  query: string,
  threshold = 0.7,
  count = 5
): Promise<MemoryResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc("match_memories", {
    p_user_id: userId,
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: count,
  });

  if (error) throw new Error(`Failed to recall memory: ${error.message}`);
  return (data ?? []) as MemoryResult[];
}
