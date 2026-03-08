import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/db/supabase";

// GET /api/agents — list all agents with their current state
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("aethon_agents")
    .select("*, aethon_tasks(id, title, status)")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agents: data });
}

// PATCH /api/agents — update agent status (internal use)
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, current_task_id } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("aethon_agents")
    .update({ status, current_task_id, last_seen: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agent: data });
}
