import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { TimeAgo } from "@/components/shared/TimeAgo";

async function removeMoment(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("god_moments").update({ status: "removed" }).eq("id", id);
  revalidatePath("/dashboard/moments");
}

export default async function DashboardMomentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["prayer_team", "admin"].includes(profile.role)) redirect("/dashboard");

  const { data: moments } = await supabase
    .from("god_moments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const active = moments?.filter((m) => m.status === "active") ?? [];
  const removed = moments?.filter((m) => m.status === "removed") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">God Moments</h1>
          <p className="text-sm text-white/40 mt-0.5">{active.length} active · {removed.length} removed</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {active.length === 0 ? (
          <div className="py-14 text-center glass border border-white/8 rounded-2xl">
            <Sparkles size={28} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">No moments yet.</p>
          </div>
        ) : (
          active.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl glass border border-white/8 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <p className="text-sm text-white/75 leading-relaxed">{m.body}</p>
                <TimeAgo date={m.created_at} className="text-xs text-white/25" />
              </div>
              <form action={removeMoment}>
                <input type="hidden" name="id" value={m.id} />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg text-white/25 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 press-scale shrink-0"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
