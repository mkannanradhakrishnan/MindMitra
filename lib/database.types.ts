export type UserRole = "student" | "mentor" | "admin";
export type RoomStatus = "waiting" | "active" | "closed";

export interface Profile {
  id: string;
  display_name: string | null;
  peer_alias: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  sleep_quality: number;
  academic_load: number;
  support_signal: number;
  created_at: string;
}

export interface PeerRoom {
  id: string;
  student_id: string;
  mentor_id: string | null;
  status: RoomStatus;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
}

export interface PeerMessage {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, "id" | "peer_alias"> &
          Partial<Pick<Profile, "display_name" | "role">>;
        Update: Partial<Pick<Profile, "display_name" | "peer_alias">>;
        Relationships: [];
      };
      check_ins: {
        Row: CheckIn;
        Insert: Omit<CheckIn, "id" | "created_at">;
        Update: Partial<Omit<CheckIn, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      peer_rooms: {
        Row: PeerRoom;
        Insert: Pick<PeerRoom, "student_id">;
        Update: Partial<Pick<PeerRoom, "status" | "closed_at" | "updated_at">>;
        Relationships: [];
      };
      peer_messages: {
        Row: PeerMessage;
        Insert: Omit<PeerMessage, "id" | "created_at">;
        Update: Partial<Pick<PeerMessage, "body">>;
        Relationships: [];
      };
      peer_reports: {
        Row: {
          id: string;
          room_id: string;
          reporter_id: string;
          reason: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["peer_reports"]["Row"], "id" | "created_at">;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_peer_room: {
        Args: { requested_room_id: string };
        Returns: PeerRoom[];
      };
      close_peer_room: {
        Args: { requested_room_id: string };
        Returns: PeerRoom[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
