import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type Db = SupabaseClient;

let cachedDb: Db | null = null;

export function db() {
  if (!cachedDb) {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase env vars");
    }
    cachedDb = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedDb;
}

export const dbInstance = db();
