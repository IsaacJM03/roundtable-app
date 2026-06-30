import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, UserPlus, ShieldCheck, Clock, KeyRound, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ROLES = ["member", "counselor", "prayer_team", "admin"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABEL: Record<Role, string> = {
  member: "Member",
  counselor: "Counselor",
  prayer_team: "Prayer Team",
  admin: "Admin",
};

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  prayer_team: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  counselor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  member: "bg-white/8 text-white/40 border-white/12",
};

const roleRank = (r: Role) => ROLES.indexOf(r);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  return { userId: user.id };
}

// ───────────────────────── Server actions ─────────────────────────

async function inviteMember(formData: FormData) {
  "use server";
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as Role;
  const displayName = (formData.get("display_name") as string)?.trim();

  if (!email || !ROLES.includes(role)) {
    redirect("/dashboard/team?error=" + encodeURIComponent("Enter a valid email and role."));
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName || email.split("@")[0] },
    redirectTo: `${appUrl}/auth/callback?next=/auth/set-password`,
  });

  if (error || !data?.user) {
    redirect("/dashboard/team?error=" + encodeURIComponent(error?.message ?? "Invite failed."));
  }

  // The on_auth_user_created trigger creates the profile as 'member'.
  // Promote to the chosen role (service-role client bypasses RLS).
  if (role !== "member") {
    await admin.from("profiles").update({ role }).eq("id", data.user.id);
  }

  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?invited=" + encodeURIComponent(email));
}

async function changeRole(formData: FormData) {
  "use server";
  const { userId } = await requireAdmin();

  const targetId = formData.get("user_id") as string;
  const role = formData.get("role") as Role;
  if (!targetId || !ROLES.includes(role)) return;

  // Guard against an admin locking themselves out of admin.
  if (targetId === userId) {
    redirect("/dashboard/team?error=" + encodeURIComponent("You can't change your own role."));
  }

  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", targetId);
  revalidatePath("/dashboard/team");
}

// ───────────────────────── Page ─────────────────────────

type Member = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  pending: boolean;
  created_at: string;
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const { userId } = await requireAdmin();
  const sp = await searchParams;

  const serviceConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  let members: Member[] = [];
  if (serviceConfigured) {
    const admin = createAdminClient();
    const [{ data: profiles }, authList] = await Promise.all([
      admin.from("profiles").select("id, display_name, role, created_at"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const authMeta = new Map(
      (authList.data?.users ?? []).map((u) => [
        u.id,
        { email: u.email ?? "—", pending: !u.last_sign_in_at },
      ])
    );

    members = (profiles ?? [])
      .map((p) => ({
        id: p.id,
        display_name: p.display_name,
        role: (p.role as Role) ?? "member",
        created_at: p.created_at,
        email: authMeta.get(p.id)?.email ?? "—",
        pending: authMeta.get(p.id)?.pending ?? false,
      }))
      .sort((a, b) =>
        a.role === b.role
          ? a.display_name.localeCompare(b.display_name)
          : roleRank(b.role) - roleRank(a.role)
      );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team members</h1>
          <p className="text-sm text-white/40 mt-0.5">Invite people and manage their roles</p>
        </div>
      </div>

      {/* Flash messages */}
      {sp.error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
          <AlertTriangle size={14} className="shrink-0" />
          {sp.error}
        </div>
      )}
      {sp.invited && (
        <div className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
          <ShieldCheck size={14} className="shrink-0" />
          Invite sent to {sp.invited}. They&apos;ll get an email to set a password.
        </div>
      )}

      {!serviceConfigured ? (
        <div className="p-6 rounded-2xl glass border border-amber-500/20 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={16} className="text-amber-300" />
            <h2 className="text-sm font-semibold text-white">Service role key required</h2>
          </div>
          <p className="text-sm text-white/50 leading-relaxed mb-3">
            To invite members and change roles from here, add your Supabase{" "}
            <span className="text-white/70 font-medium">service_role</span> key to the server environment:
          </p>
          <pre className="text-xs bg-black/30 border border-white/8 rounded-lg px-3 py-2.5 text-amber-200/80 overflow-x-auto">
            SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
          </pre>
          <p className="text-xs text-white/30 mt-3 leading-relaxed">
            Find it in Supabase → Project Settings → API → service_role. Restart the dev server after adding it.
            This key is server-only and is never sent to the browser.
          </p>
        </div>
      ) : (
        <>
          {/* Invite form */}
          <form
            action={inviteMember}
            className="p-5 rounded-2xl glass border border-white/8 mb-8 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-amber-300" />
              <h2 className="text-sm font-semibold text-white">Invite a member</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@church.org"
                  className="px-3.5 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none text-sm transition-colors duration-150"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Display name</label>
                <input
                  type="text"
                  name="display_name"
                  placeholder="optional"
                  className="px-3.5 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none text-sm transition-colors duration-150"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Role</label>
                <select
                  name="role"
                  defaultValue="prayer_team"
                  className="px-3.5 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white outline-none text-sm transition-colors duration-150 [&>option]:bg-neutral-900"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all duration-150 press-scale"
              >
                <UserPlus size={15} />
                Send invite
              </button>
            </div>
          </form>

          {/* Member list */}
          <p className="text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase mb-3">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
          <div className="flex flex-col gap-2.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl glass border border-white/8"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-sm font-semibold text-white/50 shrink-0">
                    {m.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white/85 truncate">{m.display_name}</p>
                      {m.id === userId && <span className="text-[10px] text-white/30">you</span>}
                      {m.pending && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/70">
                          <Clock size={9} /> invited
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/35 truncate">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${ROLE_BADGE[m.role]} capitalize`}>
                    {ROLE_LABEL[m.role]}
                  </span>

                  {m.id === userId ? (
                    <span className="text-[11px] text-white/20 px-2">—</span>
                  ) : (
                    <form action={changeRole} className="flex items-center gap-1.5">
                      <input type="hidden" name="user_id" value={m.id} />
                      <select
                        name="role"
                        defaultValue={m.role}
                        className="px-2.5 py-1.5 rounded-lg glass border border-white/8 focus:border-white/25 bg-transparent text-white/70 outline-none text-xs transition-colors duration-150 [&>option]:bg-neutral-900"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-white/8 border border-white/10 text-white/60 hover:bg-white/12 hover:text-white/80 transition-all duration-150 press-scale"
                      >
                        Update
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
