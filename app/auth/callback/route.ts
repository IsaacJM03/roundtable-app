import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const { url, publishableKey } = getSupabaseConfig();

  function createSupabaseOnResponse(response: NextResponse) {
    return createServerClient<Database>(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
  }

  // PKCE flow (?code=) — used by OAuth and the default invite ConfirmationURL.
  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseOnResponse(response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  // Token-hash flow (?token_hash=&type=) — used by invite/recovery email templates
  // that link straight to the app instead of through Supabase's verify endpoint.
  if (tokenHash && type) {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createSupabaseOnResponse(response);
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`);
}
