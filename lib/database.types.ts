export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: "admin" | "prayer_team" | "counselor" | "member";
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: "admin" | "prayer_team" | "counselor" | "member";
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: "admin" | "prayer_team" | "counselor" | "member";
          bio?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          body: string;
          category: "general" | "faith" | "prayer" | "life" | "bible" | "other";
          anonymous_token: string | null;
          author_id: string | null;
          status: "active" | "closed" | "removed";
          reply_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          category?: "general" | "faith" | "prayer" | "life" | "bible" | "other";
          anonymous_token?: string | null;
          author_id?: string | null;
          status?: "active" | "closed" | "removed";
          reply_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          category?: "general" | "faith" | "prayer" | "life" | "bible" | "other";
          anonymous_token?: string | null;
          author_id?: string | null;
          status?: "active" | "closed" | "removed";
          reply_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      replies: {
        Row: {
          id: string;
          post_id: string;
          body: string;
          anonymous_token: string | null;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          body: string;
          anonymous_token?: string | null;
          author_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          body?: string;
          anonymous_token?: string | null;
          author_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      prayer_requests: {
        Row: {
          id: string;
          title: string;
          body: string;
          status: "active" | "updated" | "answered" | "closed";
          anonymous_token: string | null;
          contact_email: string | null;
          is_private: boolean;
          follow_up_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          status?: "active" | "updated" | "answered" | "closed";
          anonymous_token?: string | null;
          contact_email?: string | null;
          is_private?: boolean;
          follow_up_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          status?: "active" | "updated" | "answered" | "closed";
          anonymous_token?: string | null;
          contact_email?: string | null;
          is_private?: boolean;
          follow_up_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      prayer_updates: {
        Row: {
          id: string;
          prayer_request_id: string;
          note: string;
          updated_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prayer_request_id: string;
          note: string;
          updated_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          prayer_request_id?: string;
          note?: string;
          updated_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      counseling_sessions: {
        Row: {
          id: string;
          room_id: string;
          status: "pending" | "active" | "closed";
          counselor_id: string | null;
          anonymous_token: string;
          intake_note: string | null;
          created_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string;
          status?: "pending" | "active" | "closed";
          counselor_id?: string | null;
          anonymous_token: string;
          intake_note?: string | null;
          created_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          status?: "pending" | "active" | "closed";
          counselor_id?: string | null;
          anonymous_token?: string;
          intake_note?: string | null;
          created_at?: string;
          closed_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          sender_role: "user" | "counselor";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          sender_role: "user" | "counselor";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          sender_role?: "user" | "counselor";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
