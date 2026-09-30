/**
 * Hand-written database types matching supabase/migrations/20260930000000_init.sql.
 * Regenerate with `supabase gen types typescript --linked > lib/supabase/database.types.ts`
 * once the Supabase CLI is linked; keep the shape below if you edit by hand.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          custom_domain: string | null;
          template: string;
          published: boolean;
          rsvp_enabled: boolean;
          rsvp_deadline: string | null;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          custom_domain?: string | null;
          template?: string;
          published?: boolean;
          rsvp_enabled?: boolean;
          rsvp_deadline?: string | null;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          custom_domain?: string | null;
          template?: string;
          published?: boolean;
          rsvp_enabled?: boolean;
          rsvp_deadline?: string | null;
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          attending: boolean;
          guests: number;
          dietary: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          attending: boolean;
          guests?: number;
          dietary?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          name?: string;
          attending?: boolean;
          guests?: number;
          dietary?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rsvps_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
export type SiteInsert = Database["public"]["Tables"]["sites"]["Insert"];
export type SiteUpdate = Database["public"]["Tables"]["sites"]["Update"];
export type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];
export type RsvpInsert = Database["public"]["Tables"]["rsvps"]["Insert"];
