import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase client. SERVER-ONLY — only import this from server
 * components or server actions, never a client component.
 *
 * It uses the secret service-role key, which bypasses Row Level Security, so it
 * can create users and change roles. The key has no NEXT_PUBLIC_ prefix, so Next
 * never bundles it into client code — on the browser `process.env.SUPABASE_SERVICE_ROLE_KEY`
 * is simply undefined.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Team management requires SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in your environment."
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
