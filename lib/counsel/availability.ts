import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function countAvailableVolunteers(
  admin: SupabaseClient<Database>
): Promise<number> {
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("role", ["counselor", "admin"])
    .eq("available_for_counseling", true);

  if (error) throw error;
  return count ?? 0;
}
