import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client (for client-side use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (for server-side use only — never expose to client)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
