import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/db/supabase";

// GET /api/tasks — list tasks for current user, ordered by priority desc
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("aethon_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}

// POST /api/tasks — create a new task
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, priority = 0 } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeof priority !== "number") {
    return NextResponse.json({ error: "priority must be a number" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("aethon_tasks")
    .insert({ user_id: userId, title, description, priority, status: "queued" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data }, { status: 201 });
}

// PATCH /api/tasks — update task status
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, result, error: taskError } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("aethon_tasks")
    .update({ status, result, error_msg: taskError, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}
