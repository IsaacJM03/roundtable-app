import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Heart, Users, MessageCircle, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).single();

  // Stats
  const [{ count: prayerCount }, { count: sessionCount }, { count: postCount }] = await Promise.all([
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("counseling_sessions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const stats = [
    { label: "Active prayer requests", value: prayerCount ?? 0, icon: Heart, href: "/dashboard/prayers", color: "violet" },
    { label: "Pending counseling sessions", value: sessionCount ?? 0, icon: Users, href: "/dashboard/counseling", color: "rose" },
    { label: "Active discussions", value: postCount ?? 0, icon: MessageCircle, href: "/dashboard/posts", color: "amber" },
  ];

  const role = profile?.role ?? "member";
  const canCounsel = ["counselor", "admin"].includes(role);
  const canPray = ["prayer_team", "admin"].includes(role);
  const isAdmin = role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.display_name ?? "team member"} 👋
        </h1>
        <p className="text-white/40 text-sm mt-1 capitalize">
          Role: <span className="text-white/60">{role.replace("_", " ")}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8 hover:border-${color}-500/25 hover:shadow-lg transition-all duration-200 press-scale`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center`}>
                <Icon size={17} className={`text-${color}-300`} />
              </div>
              <TrendingUp size={14} className="text-white/20 group-hover:text-white/40 transition-colors duration-150" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors duration-150">
              View all <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {canPray && (
          <Link
            href="/dashboard/prayers"
            className="group flex items-center gap-4 p-4 rounded-2xl glass border border-white/8 hover:border-violet-500/25 transition-all duration-200 press-scale"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <Heart size={18} className="text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Prayer queue</p>
              <p className="text-xs text-white/40">Review & update prayer requests</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-150" />
          </Link>
        )}
        {canCounsel && (
          <Link
            href="/dashboard/counseling"
            className="group flex items-center gap-4 p-4 rounded-2xl glass border border-white/8 hover:border-rose-500/25 transition-all duration-200 press-scale"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
              <Users size={18} className="text-rose-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Counseling queue</p>
              <p className="text-xs text-white/40">Accept sessions & support people</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-150" />
          </Link>
        )}
        <Link
          href="/dashboard/posts"
          className="group flex items-center gap-4 p-4 rounded-2xl glass border border-white/8 hover:border-amber-500/25 transition-all duration-200 press-scale"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Discussions</p>
            <p className="text-xs text-white/40">Moderate and respond to discussions</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-150" />
        </Link>
        {isAdmin && (
          <Link
            href="/dashboard/team"
            className="group flex items-center gap-4 p-4 rounded-2xl glass border border-white/8 hover:border-amber-500/25 transition-all duration-200 press-scale"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Team members</p>
              <p className="text-xs text-white/40">Invite people & manage roles</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-150" />
          </Link>
        )}
      </div>
    </div>
  );
}
