import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Flame, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { TimeAgo } from "@/components/shared/TimeAgo";

async function removePost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("honest_hours").update({ status: "removed" }).eq("id", id);
  revalidatePath("/dashboard/honest");
}

async function addTeamNote(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const id = formData.get("id") as string;
  const note = formData.get("note") as string;
  if (!note?.trim()) return;
  await supabase
    .from("honest_hours")
    .update({ team_note: note.trim(), team_note_by: user.id })
    .eq("id", id);
  revalidatePath("/dashboard/honest");
}

function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default async function DashboardHonestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["prayer_team", "admin", "counselor"].includes(profile.role)) redirect("/dashboard");

  // Team sees all (including expired) — most recent first
  const { data: posts } = await supabase
    .from("honest_hours")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);

  const active = posts?.filter((p) => p.status === "active" && new Date(p.expires_at) > new Date()) ?? [];
  const expired = posts?.filter((p) => p.status === "active" && new Date(p.expires_at) <= new Date()) ?? [];
  const removed = posts?.filter((p) => p.status === "removed") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Honest Hours</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {active.length} live · {expired.length} expired · {removed.length} removed
          </p>
        </div>
      </div>

      {active.length === 0 && (
        <div className="py-12 text-center glass border border-white/8 rounded-2xl mb-6">
          <Flame size={28} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm">No active posts right now.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {active.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl glass border border-white/8">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm text-white/75 leading-relaxed flex-1">{p.body}</p>
              <form action={removePost}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg text-white/25 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 press-scale shrink-0"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>

            {p.team_note && (
              <div className="flex gap-2 mb-3 p-3 rounded-lg bg-violet-500/8 border border-violet-500/12">
                <p className="text-xs text-violet-200/60 italic">{p.team_note}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-[11px] text-white/25 mb-3">
              <TimeAgo date={p.created_at} className="" />
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {timeLeft(p.expires_at)}
              </span>
              <span className="flex items-center gap-1">
                <Flame size={10} />
                {p.reaction_count}
              </span>
            </div>

            {/* Add team note */}
            <form action={addTeamNote} className="flex gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                type="text"
                name="note"
                placeholder={p.team_note ? "Update team note…" : "Add an encouraging note…"}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs glass border border-white/8 focus:border-violet-500/25 bg-transparent text-white/70 placeholder-white/20 outline-none transition-colors duration-150"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs bg-violet-500/15 border border-violet-500/20 text-violet-300/80 hover:bg-violet-500/25 transition-all duration-150 press-scale"
              >
                {p.team_note ? "Update" : "Reply"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
