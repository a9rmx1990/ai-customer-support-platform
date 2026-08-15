/**
 * Supabase Database TypeScript types.
 * These match the schema defined in supabase/migrations/001_initial_medical_schema.sql
 * 
 * When you connect a real Supabase project, you can auto-generate these types with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 */

export type UserRole = 'patient' | 'doctor' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
export type ExceptionStatus = 'available' | 'unavailable' | 'leave' | 'holiday';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      patient_profiles: {
        Row: {
          id: string;
          user_id: string;
          date_of_birth: string | null;
          gender: string | null;
          emergency_contact: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date_of_birth?: string | null;
          gender?: string | null;
          emergency_contact?: string | null;
        };
        Update: Partial<Database['public']['Tables']['patient_profiles']['Insert']>;
      };
      doctor_profiles: {
        Row: {
          id: string;
          user_id: string;
          specialization: string;
          license_number: string | null;
          bio: string | null;
          experience_years: number | null;
          consultation_fee: number | null;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialization: string;
          license_number?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          consultation_fee?: number | null;
          verification_status?: VerificationStatus;
        };
        Update: Partial<Database['public']['Tables']['doctor_profiles']['Insert']>;
      };
      doctor_availability: {
        Row: {
          id: string;
          doctor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: Partial<Database['public']['Tables']['doctor_availability']['Insert']>;
      };
      doctor_schedule_exceptions: {
        Row: {
          id: string;
          doctor_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          status: ExceptionStatus;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: ExceptionStatus;
          reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['doctor_schedule_exceptions']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status: AppointmentStatus;
          reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status?: AppointmentStatus;
          reason?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          appointment_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          appointment_id?: string | null;
          read?: boolean;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: never;
      };
    };
    Functions: {
      book_appointment_atomic: {
        Args: {
          p_doctor_id: string;
          p_scheduled_start: string;
          p_scheduled_end: string;
          p_reason?: string;
        };
        Returns: {
          success: boolean;
          appointment_id: string | null;
          error: string | null;
        };
      };
    };
  };
}
