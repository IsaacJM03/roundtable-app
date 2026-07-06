import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CounselingAuditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["counselor", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: events } = await admin
    .from("session_events")
    .select("id, session_id, actor_id, action, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/counseling" className="text-white/40 hover:text-white/70">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Session audit log</h1>
      </div>
      <div className="glass border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-left text-white/40 text-xs uppercase">
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id} className="border-b border-white/5">
                <td className="px-4 py-3 text-white/70">{e.action}</td>
                <td className="px-4 py-3 text-white/40 font-mono text-xs">{e.session_id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-white/35 text-xs">
                  {new Date(e.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(events ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-white/30">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
