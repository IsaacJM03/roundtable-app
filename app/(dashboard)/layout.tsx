import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Users,
  MessageCircle,
  LogOut,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/prayers", label: "Prayers", icon: Heart, roles: ["prayer_team", "admin"] },
  { href: "/dashboard/counseling", label: "Counseling", icon: Users, roles: ["counselor", "admin"] },
  { href: "/dashboard/posts", label: "Posts", icon: MessageCircle },
  { href: "/dashboard/daily", label: "Daily Drop", icon: BookOpen, roles: ["prayer_team", "admin"] },
  { href: "/dashboard/moments", label: "Moments", icon: Sparkles, roles: ["prayer_team", "admin"] },
  { href: "/dashboard/honest", label: "Honest Hours", icon: Flame, roles: ["prayer_team", "admin", "counselor"] },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("display_name, role").eq("id", user.id).single();
  const role = profile?.role ?? "member";

  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-52 shrink-0 border-r border-white/8 p-4 flex flex-col gap-1 hidden sm:flex">
        <div className="px-3 py-2 mb-4">
          <p className="text-xs font-semibold text-white/80 truncate">{profile?.display_name}</p>
          <p className="text-xs text-white/30 capitalize">{role.replace("_", " ")}</p>
        </div>

        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/6 transition-all duration-150 press-scale"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}

        {role === "admin" && (
          <Link
            href="/dashboard/team"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/6 transition-all duration-150 press-scale"
          >
            <ShieldCheck size={15} />
            Team
          </Link>
        )}

        <div className="mt-auto">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-rose-300 hover:bg-rose-500/8 transition-all duration-150 press-scale"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
