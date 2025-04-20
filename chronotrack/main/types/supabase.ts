export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      time_entries: {
        Row: {
          id: number
          user_id: string
          date: string
          clock_in: string
          clock_out: string | null
          duration: string | null
          job_id: number
          status: "active" | "modified" | "deleted"
          created_at: string
          updated_at: string
          breaks: Json | null
          original_data: Json | null
          modified_at: string | null
          modified_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          reason: string | null
        }
        Insert: {
          id?: number
          user_id: string
          date: string
          clock_in: string
          clock_out?: string | null
          duration?: string | null
          job_id: number
          status?: "active" | "modified" | "deleted"
          created_at?: string
          updated_at?: string
          breaks?: Json | null
          original_data?: Json | null
          modified_at?: string | null
          modified_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          reason?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          date?: string
          clock_in?: string
          clock_out?: string | null
          duration?: string | null
          job_id?: number
          status?: "active" | "modified" | "deleted"
          created_at?: string
          updated_at?: string
          breaks?: Json | null
          original_data?: Json | null
          modified_at?: string | null
          modified_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          reason?: string | null
        }
      }
      jobs: {
        Row: {
          id: number
          name: string
          rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      job_rules: {
        Row: {
          id: number
          days: string
          time_range: string
          job_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          days: string
          time_range: string
          job_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          days?: string
          time_range?: string
          job_id?: number
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: number
          user_id: string
          date: string
          category: string
          description: string
          amount: number
          job_id: number
          billable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          date: string
          category: string
          description: string
          amount: number
          job_id: number
          billable: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          date?: string
          category?: string
          description?: string
          amount?: number
          job_id?: number
          billable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: number
          user_id: string
          timestamp: string
          action: string
          details: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          timestamp: string
          action: string
          details: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          timestamp?: string
          action?: string
          details?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          pin: string
          time_zone: string
          time_format: "12h" | "24h"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          pin: string
          time_zone?: string
          time_format?: "12h" | "24h"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          pin?: string
          time_zone?: string
          time_format?: "12h" | "24h"
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Derived types for easier use in components
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"]
export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type JobRule = Database["public"]["Tables"]["job_rules"]["Row"]
export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"]

// Break type for time entries
export interface Break {
  start: string
  end: string
  duration: string
}
