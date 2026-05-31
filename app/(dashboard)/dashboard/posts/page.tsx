import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { CategoryBadge } from "@/components/shared/Badge";

async function removePost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return;
  const id = formData.get("id") as string;
  await supabase.from("posts").update({ status: "removed" }).eq("id", id);
  revalidatePath("/dashboard/posts");
}

export default async function PostsDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(display_name, role)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Discussions</h1>
          <p className="text-sm text-white/40">{posts?.length ?? 0} active posts</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!posts || posts.length === 0 ? (
          <div className="py-16 text-center glass border border-white/8 rounded-2xl">
            <MessageCircle size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No active discussions.</p>
          </div>
        ) : (
          posts.map((post: Post) => (
            <div key={post.id} className="p-4 rounded-2xl glass border border-white/8 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge category={post.category} />
                  <span className="text-xs text-white/25">
                    {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <Link href={`/discuss/${post.id}`} target="_blank" className="font-medium text-white/85 hover:text-white text-sm line-clamp-1 transition-colors duration-150">
                  {post.title}
                </Link>
                <p className="text-xs text-white/35 mt-1 line-clamp-1">{post.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-white/25 flex items-center gap-1">
                    <MessageCircle size={11} />
                    {post.reply_count}
                  </span>
                  <span className="text-xs text-white/25">
                    {post.profiles?.display_name ?? "Anonymous"}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <form action={removePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    className="p-2 rounded-lg text-white/20 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 press-scale"
                    title="Remove post"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
