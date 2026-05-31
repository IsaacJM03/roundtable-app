import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import type { PrayerRequest } from "@/lib/types";

const statusColors: Record<string, string> = {
  active: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  updated: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  answered: "bg-green-500/15 text-green-300 border-green-500/20",
  closed: "bg-white/8 text-white/40 border-white/10",
};

async function updatePrayerStatus(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as "active" | "updated" | "answered" | "closed";
  await supabase.from("prayer_requests").update({ status }).eq("id", id);
  revalidatePath("/dashboard/prayers");
}

async function addPrayerUpdate(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const prayer_request_id = formData.get("prayer_request_id") as string;
  const note = formData.get("note") as string;
  if (!note?.trim()) return;
  await supabase.from("prayer_updates").insert({ prayer_request_id, note, updated_by: user.id });
  revalidatePath("/dashboard/prayers");
}

export default async function PrayersDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["prayer_team", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const { data: prayers } = await supabase
    .from("prayer_requests")
    .select("*, prayer_updates(id, note, created_at, profiles(display_name))")
    .neq("status", "closed")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Prayer Queue</h1>
          <p className="text-sm text-white/40">{prayers?.length ?? 0} active requests</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {!prayers || prayers.length === 0 ? (
          <div className="py-16 text-center glass border border-white/8 rounded-2xl">
            <Heart size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No active prayer requests right now.</p>
          </div>
        ) : (
          prayers.map((prayer: PrayerRequest) => (
            <div key={prayer.id} className="p-5 rounded-2xl glass border border-white/10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className={`self-start text-xs px-2 py-0.5 rounded-full border ${statusColors[prayer.status]}`}>
                    {prayer.status}
                  </span>
                  <h3 className="font-semibold text-white">{prayer.title}</h3>
                </div>
                <form action={updatePrayerStatus} className="flex gap-2 shrink-0">
                  <input type="hidden" name="id" value={prayer.id} />
                  <select
                    name="status"
                    defaultValue={prayer.status}
                    className="px-2 py-1 rounded-lg text-xs glass border border-white/10 bg-transparent text-white/70 outline-none"
                  >
                    <option value="active" className="bg-zinc-900">active</option>
                    <option value="updated" className="bg-zinc-900">updated</option>
                    <option value="answered" className="bg-zinc-900">answered</option>
                    <option value="closed" className="bg-zinc-900">closed</option>
                  </select>
                  <button type="submit" className="px-3 py-1 rounded-lg text-xs bg-amber-500/20 border border-amber-500/25 text-amber-300 hover:bg-amber-500/35 transition-all duration-150 press-scale">
                    Update
                  </button>
                </form>
              </div>

              <p className="text-sm text-white/60 leading-relaxed">{prayer.body}</p>

              {/* Existing updates */}
              {prayer.prayer_updates && prayer.prayer_updates.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/8">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Previous updates</p>
                  {prayer.prayer_updates.map((update) => (
                    <div key={update.id} className="text-xs text-white/50 bg-white/4 rounded-lg px-3 py-2">
                      {update.note}
                    </div>
                  ))}
                </div>
              )}

              {/* Add update */}
              <form action={addPrayerUpdate} className="flex gap-2 pt-2 border-t border-white/8">
                <input type="hidden" name="prayer_request_id" value={prayer.id} />
                <input
                  type="text"
                  name="note"
                  required
                  placeholder="Add a prayer update or note…"
                  className="flex-1 px-3 py-2 rounded-lg text-sm glass border border-white/8 focus:border-violet-500/30 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150"
                />
                <button type="submit" className="px-3 py-2 rounded-lg text-xs bg-violet-500/20 border border-violet-500/25 text-violet-300 hover:bg-violet-500/35 transition-all duration-150 press-scale">
                  Post
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
