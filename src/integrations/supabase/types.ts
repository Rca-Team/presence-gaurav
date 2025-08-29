export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ar_interactions: {
        Row: {
          content_title: string
          content_type: string
          helpful_rating: number | null
          id: string
          interaction_duration: number | null
          session_id: string
          textbook_page: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          content_title: string
          content_type: string
          helpful_rating?: number | null
          id?: string
          interaction_duration?: number | null
          session_id: string
          textbook_page?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          content_title?: string
          content_type?: string
          helpful_rating?: number | null
          id?: string
          interaction_duration?: number | null
          session_id?: string
          textbook_page?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          created_at: string
          device_info: Json
          id: string
          timestamp: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json
          id?: string
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json
          id?: string
          timestamp?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      desk_detections: {
        Row: {
          confidence_scores: Json | null
          distraction_objects: string[] | null
          id: string
          objects_detected: string[] | null
          session_id: string
          study_posture_valid: boolean | null
          timestamp: string
          user_id: string
          warning_triggered: boolean | null
          warning_type: string | null
        }
        Insert: {
          confidence_scores?: Json | null
          distraction_objects?: string[] | null
          id?: string
          objects_detected?: string[] | null
          session_id: string
          study_posture_valid?: boolean | null
          timestamp?: string
          user_id: string
          warning_triggered?: boolean | null
          warning_type?: string | null
        }
        Update: {
          confidence_scores?: Json | null
          distraction_objects?: string[] | null
          id?: string
          objects_detected?: string[] | null
          session_id?: string
          study_posture_valid?: boolean | null
          timestamp?: string
          user_id?: string
          warning_triggered?: boolean | null
          warning_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "desk_detections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      emotion_detections: {
        Row: {
          confidence: number
          emotion: string
          focus_level: number | null
          id: string
          looking_at_book: boolean | null
          metadata: Json | null
          posture_score: number | null
          session_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          confidence: number
          emotion: string
          focus_level?: number | null
          id?: string
          looking_at_book?: boolean | null
          metadata?: Json | null
          posture_score?: number | null
          session_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          confidence?: number
          emotion?: string
          focus_level?: number | null
          id?: string
          looking_at_book?: boolean | null
          metadata?: Json | null
          posture_score?: number | null
          session_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_detections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_streaks: {
        Row: {
          best_count: number
          created_at: string
          current_count: number
          id: string
          last_activity_date: string
          metadata: Json | null
          streak_active: boolean
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_count?: number
          created_at?: string
          current_count?: number
          id?: string
          last_activity_date?: string
          metadata?: Json | null
          streak_active?: boolean
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_count?: number
          created_at?: string
          current_count?: number
          id?: string
          last_activity_date?: string
          metadata?: Json | null
          streak_active?: boolean
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_analyses: {
        Row: {
          clarity_score: number | null
          diagrams_suggested: string[] | null
          extracted_text: string | null
          id: string
          image_url: string | null
          missing_keywords: string[] | null
          session_id: string
          subject_detected: string | null
          suggested_improvements: string[] | null
          timestamp: string
          user_id: string
        }
        Insert: {
          clarity_score?: number | null
          diagrams_suggested?: string[] | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          missing_keywords?: string[] | null
          session_id: string
          subject_detected?: string | null
          suggested_improvements?: string[] | null
          timestamp?: string
          user_id: string
        }
        Update: {
          clarity_score?: number | null
          diagrams_suggested?: string[] | null
          extracted_text?: string | null
          id?: string
          image_url?: string | null
          missing_keywords?: string[] | null
          session_id?: string
          subject_detected?: string | null
          suggested_improvements?: string[] | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          emergency_contact: string | null
          employee_id: string | null
          grade_level: string | null
          id: string
          learning_preferences: Json | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          privacy_settings: Json | null
          relationship: string | null
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          grade_level?: string | null
          id?: string
          learning_preferences?: Json | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          privacy_settings?: Json | null
          relationship?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          grade_level?: string | null
          id?: string
          learning_preferences?: Json | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          privacy_settings?: Json | null
          relationship?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          ar_interactions: number | null
          created_at: string
          distraction_count: number | null
          duration_minutes: number | null
          emotion_summary: Json | null
          end_time: string | null
          focus_score: number | null
          id: string
          notes_analyzed: number | null
          session_metadata: Json | null
          start_time: string
          subject: string
          topic: string | null
          user_id: string
        }
        Insert: {
          ar_interactions?: number | null
          created_at?: string
          distraction_count?: number | null
          duration_minutes?: number | null
          emotion_summary?: Json | null
          end_time?: string | null
          focus_score?: number | null
          id?: string
          notes_analyzed?: number | null
          session_metadata?: Json | null
          start_time?: string
          subject: string
          topic?: string | null
          user_id: string
        }
        Update: {
          ar_interactions?: number | null
          created_at?: string
          distraction_count?: number | null
          duration_minutes?: number | null
          emotion_summary?: Json | null
          end_time?: string | null
          focus_score?: number | null
          id?: string
          notes_analyzed?: number | null
          session_metadata?: Json | null
          start_time?: string
          subject?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_interactions: {
        Row: {
          ai_response: string | null
          id: string
          interaction_type: string
          processing_time_ms: number | null
          session_id: string
          timestamp: string
          transcript: string
          user_id: string
          voice_used: string | null
        }
        Insert: {
          ai_response?: string | null
          id?: string
          interaction_type: string
          processing_time_ms?: number | null
          session_id: string
          timestamp?: string
          transcript: string
          user_id: string
          voice_used?: string | null
        }
        Update: {
          ai_response?: string | null
          id?: string
          interaction_type?: string
          processing_time_ms?: number | null
          session_id?: string
          timestamp?: string
          transcript?: string
          user_id?: string
          voice_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
