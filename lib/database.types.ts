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
          available_for_counseling: boolean;
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
          available_for_counseling?: boolean;
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
          category?: "general" | "faith" | "prayer" | "life" | "bible" | "other" | "off_topic";
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
          category?: "general" | "faith" | "prayer" | "life" | "bible" | "other" | "off_topic";
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
          testimony: string | null;
          testimony_at: string | null;
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
          testimony?: string | null;
          testimony_at?: string | null;
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
          accepted_at: string | null;
          first_response_at: string | null;
          risk_flag: "none" | "self_harm" | "harm_to_others";
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
          accepted_at?: string | null;
          first_response_at?: string | null;
          risk_flag?: "none" | "self_harm" | "harm_to_others";
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          content: string;
          sender_role: "user" | "counselor" | "system";
          created_at: string;
          audio_url: string | null;
          audio_duration_seconds: number | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          content: string;
          sender_role: "user" | "counselor" | "system";
          created_at?: string;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          content?: string;
          sender_role?: "user" | "counselor" | "system";
          created_at?: string;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
        };
        Relationships: [];
      };
      session_events: {
        Row: {
          id: string;
          session_id: string;
          actor_id: string | null;
          action: "accepted" | "message_sent" | "escalated" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          actor_id?: string | null;
          action: "accepted" | "message_sent" | "escalated" | "closed";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          actor_id?: string | null;
          action?: "accepted" | "message_sent" | "escalated" | "closed";
          created_at?: string;
        };
        Relationships: [];
      };
      post_reports: {
        Row: {
          id: string;
          post_id: string;
          reporter_token: string;
          reason: string;
          status: "pending" | "reviewed" | "actioned";
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          reporter_token: string;
          reason: string;
          status?: "pending" | "reviewed" | "actioned";
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          reporter_token?: string;
          reason?: string;
          status?: "pending" | "reviewed" | "actioned";
          created_at?: string;
        };
        Relationships: [];
      };
      daily_drops: {
        Row: {
          id: string;
          drop_date: string;
          verse_ref: string;
          verse_text: string;
          reflection: string;
          question: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          drop_date: string;
          verse_ref: string;
          verse_text: string;
          reflection: string;
          question: string;
          author_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          drop_date?: string;
          verse_ref?: string;
          verse_text?: string;
          reflection?: string;
          question?: string;
          author_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      god_moments: {
        Row: {
          id: string;
          body: string;
          anonymous_token: string | null;
          status: "active" | "removed";
          created_at: string;
        };
        Insert: {
          id?: string;
          body: string;
          anonymous_token?: string | null;
          status?: "active" | "removed";
          created_at?: string;
        };
        Update: {
          id?: string;
          body?: string;
          anonymous_token?: string | null;
          status?: "active" | "removed";
          created_at?: string;
        };
        Relationships: [];
      };
      moment_reactions: {
        Row: {
          id: string;
          moment_id: string;
          reaction_type: "praying" | "amen" | "felt_this";
          anon_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          moment_id: string;
          reaction_type: "praying" | "amen" | "felt_this";
          anon_token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          moment_id?: string;
          reaction_type?: "praying" | "amen" | "felt_this";
          anon_token?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          target_type: "post" | "prayer";
          target_id: string;
          reaction_type: "praying" | "amen" | "felt_this";
          anon_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: "post" | "prayer";
          target_id: string;
          reaction_type: "praying" | "amen" | "felt_this";
          anon_token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_type?: "post" | "prayer";
          target_id?: string;
          reaction_type?: "praying" | "amen" | "felt_this";
          anon_token?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      honest_hours: {
        Row: {
          id: string;
          body: string;
          anonymous_token: string;
          expires_at: string;
          reaction_count: number;
          team_note: string | null;
          team_note_by: string | null;
          status: "active" | "removed";
          created_at: string;
        };
        Insert: {
          id?: string;
          body: string;
          anonymous_token: string;
          expires_at?: string;
          reaction_count?: number;
          team_note?: string | null;
          team_note_by?: string | null;
          status?: "active" | "removed";
          created_at?: string;
        };
        Update: {
          id?: string;
          body?: string;
          anonymous_token?: string;
          expires_at?: string;
          reaction_count?: number;
          team_note?: string | null;
          team_note_by?: string | null;
          status?: "active" | "removed";
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
