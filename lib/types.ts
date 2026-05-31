export type UserRole = "admin" | "prayer_team" | "counselor" | "member";
export type PostStatus = "active" | "closed" | "removed";
export type PostCategory = "general" | "faith" | "prayer" | "life" | "bible" | "other";
export type PrayerStatus = "active" | "updated" | "answered" | "closed";
export type SessionStatus = "pending" | "active" | "closed";
export type SenderRole = "user" | "counselor";

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
  created_at: string;
  prayer_updates?: PrayerUpdate[];
}

export interface PrayerUpdate {
  id: string;
  prayer_request_id: string;
  note: string;
  updated_by: string;
  created_at: string;
  profiles?: Pick<Profile, "display_name">;
}

export interface CounselingSession {
  id: string;
  room_id: string;
  status: SessionStatus;
  counselor_id: string | null;
  anonymous_token: string;
  intake_note: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  sender_role: SenderRole;
  created_at: string;
}

// Supabase Database type (minimal — expand as needed)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      posts: { Row: Post; Insert: Omit<Post, "id" | "created_at" | "reply_count">; Update: Partial<Post> };
      replies: { Row: Reply; Insert: Omit<Reply, "id" | "created_at">; Update: Partial<Reply> };
      prayer_requests: { Row: PrayerRequest; Insert: Omit<PrayerRequest, "id" | "created_at" | "follow_up_sent_at">; Update: Partial<PrayerRequest> };
      prayer_updates: { Row: PrayerUpdate; Insert: Omit<PrayerUpdate, "id" | "created_at">; Update: Partial<PrayerUpdate> };
      counseling_sessions: { Row: CounselingSession; Insert: Omit<CounselingSession, "id" | "created_at" | "closed_at">; Update: Partial<CounselingSession> };
      messages: { Row: Message; Insert: Omit<Message, "id" | "created_at">; Update: Partial<Message> };
    };
  };
};
