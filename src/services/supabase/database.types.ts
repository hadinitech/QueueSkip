export type CustomerStatus = 'waiting' | 'serving' | 'done'
export type ProfileRole =
  | 'business'
  | 'customer'
  | 'super_admin'

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string
          business_email: string
          city: string
          country: string
          created_at: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          owner_name: string
          payment_status: 'overdue' | 'paid' | 'trial' | 'unpaid'
          place_id: string | null
          phone: string
          province: string
          status: 'active' | 'pending' | 'suspended' | 'trial'
          subscription_plan_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string
          business_email: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name: string
          owner_name?: string
          payment_status?: 'overdue' | 'paid' | 'trial' | 'unpaid'
          place_id?: string | null
          phone?: string
          province?: string
          status?: 'active' | 'pending' | 'suspended' | 'trial'
          subscription_plan_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          business_email?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          owner_name?: string
          payment_status?: 'overdue' | 'paid' | 'trial' | 'unpaid'
          place_id?: string | null
          phone?: string
          province?: string
          status?: 'active' | 'pending' | 'suspended' | 'trial'
          subscription_plan_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            columns: ['subscription_plan_id']
            foreignKeyName: 'businesses_subscription_plan_id_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'subscription_plans'
          },
        ]
      }
      business_onboarding_requests: {
        Row: {
          business_name: string
          created_at: string
          email: string
          id: string
          location: string
          notes: string | null
          owner_name: string
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: 'approved' | 'contacted' | 'new'
          updated_at: string
        }
        Insert: {
          business_name: string
          created_at?: string
          email: string
          id?: string
          location: string
          notes?: string | null
          owner_name: string
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: 'approved' | 'contacted' | 'new'
          updated_at?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          email?: string
          id?: string
          location?: string
          notes?: string | null
          owner_name?: string
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: 'approved' | 'contacted' | 'new'
          updated_at?: string
        }
        Relationships: [
          {
            columns: ['reviewed_by']
            foreignKeyName: 'business_onboarding_requests_reviewed_by_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'profiles'
          },
        ]
      }
      queues: {
        Row: {
          business_id: string | null
          created_at: string
          description: string
          estimated_wait_minutes: number
          id: string
          lunch_time: string
          location: string
          name: string
          owner_id: string
          title: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description: string
          estimated_wait_minutes?: number
          id?: string
          lunch_time?: string
          location: string
          name: string
          owner_id: string
          title: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description?: string
          estimated_wait_minutes?: number
          id?: string
          lunch_time?: string
          location?: string
          name?: string
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            columns: ['business_id']
            foreignKeyName: 'queues_business_id_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'businesses'
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          position: number
          queue_id: string
          status: CustomerStatus
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          position: number
          queue_id: string
          status?: CustomerStatus
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          position?: number
          queue_id?: string
          status?: CustomerStatus
          user_id?: string | null
        }
        Relationships: [
          {
            columns: ['queue_id']
            foreignKeyName: 'customers_queue_id_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'queues'
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          location: string
          role: ProfileRole
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          location?: string
          role?: ProfileRole
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string
          role?: ProfileRole
        }
        Relationships: [
          {
            columns: ['business_id']
            foreignKeyName: 'profiles_business_id_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'businesses'
          },
          {
            columns: ['id']
            foreignKeyName: 'profiles_id_fkey'
            isOneToOne: true
            referencedColumns: ['id']
            referencedRelation: 'users'
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          queue_limit: number | null
          staff_limit: number | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          name: string
          queue_limit?: number | null
          staff_limit?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          queue_limit?: number | null
          staff_limit?: number | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      list_public_queues: {
        Args: {
          location_param?: string | null
        }
        Returns: {
          address: string
          business_id: string | null
          city: string
          country: string
          created_at: string
          description: string
          estimated_wait_minutes: number
          id: string
          latitude: number | null
          lunch_time: string
          location: string
          longitude: number | null
          name: string
          people_waiting: number
          place_id: string | null
          province: string
          title: string
        }[]
      }
      join_queue: {
        Args: {
          customer_name_param: string
          customer_phone_param: string
          queue_name_param: string
        }
        Returns: {
          created_at: string
          id: string
          name: string
          phone: string
          position: number
          queue_id: string
          status: CustomerStatus
        }[]
      }
      join_queue_by_id: {
        Args: {
          customer_name_param: string
          customer_phone_param: string
          queue_id_param: string
        }
        Returns: {
          created_at: string
          id: string
          name: string
          phone: string
          position: number
          queue_id: string
          status: CustomerStatus
        }[]
      }
      list_queue_locations: {
        Args: Record<string, never>
        Returns: {
          location: string
        }[]
      }
      list_my_queues: {
        Args: Record<string, never>
        Returns: {
          created_at: string
          estimated_wait_minutes: number
          id: string
          people_ahead: number
          position: number
          queue_description: string
          queue_id: string
          queue_name: string
          queue_title: string
          status: CustomerStatus
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
