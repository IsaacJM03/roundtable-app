export type UserRole = "admin" | "prayer_team" | "counselor" | "member";
export type ReactionType = "praying" | "amen" | "felt_this";
export type MomentStatus = "active" | "removed";
export type HonestStatus = "active" | "removed";
export type PostStatus = "active" | "closed" | "removed";
export type PostCategory = "general" | "faith" | "prayer" | "life" | "bible" | "other" | "off_topic";
export type PrayerStatus = "active" | "updated" | "answered" | "closed";
export type ReportStatus = "pending" | "reviewed" | "actioned";

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  category: PostCategory;
  anonymous_token: string | null;
  author_id: string | null;
  status: PostStatus;
  reply_count: number;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "role"> | null;
}

export interface PostReport {
  id: string;
  post_id: string;
  reporter_token: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

export interface Reply {
  id: string;
  post_id: string;
  body: string;
  anonymous_token: string | null;
  author_id: string | null;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "role"> | null;
}

export interface PrayerRequest {
  id: string;
  title: string;
  body: string;
  status: PrayerStatus;
  anonymous_token: string | null;
  contact_email: string | null;
  is_private: boolean;
  follow_up_sent_at: string | null;
  testimony: string | null;
  testimony_at: string | null;
  created_at: string;
  prayer_updates?: PrayerUpdate[];
  /** Populated by GET /api/prayers — aggregate from reactions table */
  reaction_count?: number;
}

export interface PrayerUpdate {
  id: string;
  prayer_request_id: string;
  note: string;
  updated_by: string;
  created_at: string;
  profiles?: Pick<Profile, "display_name">;
}

export interface DailyDrop {
  id: string;
  drop_date: string;
  verse_ref: string;
  verse_text: string;
  reflection: string;
  question: string;
  author_id: string | null;
  created_at: string;
}

export interface ReactionCounts {
  praying: number;
  amen: number;
  felt_this: number;
}

export interface GodMoment {
  id: string;
  body: string;
  anonymous_token: string | null;
  status: MomentStatus;
  created_at: string;
  reactions?: ReactionCounts;
}

export interface HonestHour {
  id: string;
  body: string;
  anonymous_token: string;
  expires_at: string;
  reaction_count: number;
  team_note: string | null;
  team_note_by: string | null;
  status: HonestStatus;
  created_at: string;
}

// Supabase Database type (minimal — expand as needed)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      posts: { Row: Post; Insert: Omit<Post, "id" | "created_at" | "reply_count">; Update: Partial<Post> };
      replies: { Row: Reply; Insert: Omit<Reply, "id" | "created_at">; Update: Partial<Reply> };
      prayer_requests: { Row: PrayerRequest; Insert: Omit<PrayerRequest, "id" | "created_at" | "follow_up_sent_at" | "testimony" | "testimony_at">; Update: Partial<PrayerRequest> };
      prayer_updates: { Row: PrayerUpdate; Insert: Omit<PrayerUpdate, "id" | "created_at">; Update: Partial<PrayerUpdate> };
      post_reports: { Row: PostReport; Insert: Omit<PostReport, "id" | "created_at" | "status">; Update: Partial<PostReport> };
    };
  };
};
