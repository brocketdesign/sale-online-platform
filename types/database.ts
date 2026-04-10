export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductFormat = 'pdf' | 'mp3' | 'mp4' | 'epub' | 'zip' | 'software' | 'other'
export type ProductStatus = 'draft' | 'published'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'completed' | 'disputed'

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string | null
          display_name: string | null
          bio: string | null
          tagline: string | null
          avatar_url: string | null
          website_url: string | null
          twitter_url: string | null
          is_pro: boolean
          credits: number
          total_swaps: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          display_name?: string | null
          bio?: string | null
          tagline?: string | null
          avatar_url?: string | null
          website_url?: string | null
          twitter_url?: string | null
          is_pro?: boolean
          credits?: number
          total_swaps?: number
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string
          slug: string
          title: string
          description: string | null
          banner_url: string | null
          price: number
          currency: string
          status: ProductStatus
          tags: string[]
          product_format: ProductFormat
          conversion_message: string | null
          sales_count: number
          show_sales_count: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          seller_id: string
          slug: string
          title: string
          description?: string | null
          banner_url?: string | null
          price: number
          currency?: string
          status?: ProductStatus
          tags?: string[]
          product_format?: ProductFormat
          conversion_message?: string | null
          sales_count?: number
          show_sales_count?: boolean
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      product_files: {
        Row: {
          id: string
          product_id: string
          file_name: string
          file_url: string
          file_size: number | null
          sort_order: number
          created_at: string
        }
        Insert: {
          product_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['product_files']['Insert']>
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          reviewer_id: string | null
          rating: number
          title: string | null
          body: string | null
          verified_buyer: boolean
          created_at: string
        }
        Insert: {
          product_id: string
          reviewer_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          verified_buyer?: boolean
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string
          buyer_id: string | null
          buyer_email: string
          buyer_name: string
          country: string
          total_amount: number
          currency: string
          tip_amount: number
          status: OrderStatus
          gift_recipient_email: string | null
          gift_note: string | null
          created_at: string
        }
        Insert: {
          stripe_session_id: string
          buyer_id?: string | null
          buyer_email: string
          buyer_name?: string
          country?: string
          total_amount: number
          currency?: string
          tip_amount?: number
          status?: OrderStatus
          gift_recipient_email?: string | null
          gift_note?: string | null
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          currency: string
          created_at: string
        }
        Insert: {
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price: number
          currency?: string
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
        Relationships: []
      }
      purchases: {
        Row: {
          id: string
          order_id: string
          buyer_id: string | null
          buyer_email: string
          product_id: string | null
          amount_paid: number
          currency: string
          created_at: string
        }
        Insert: {
          order_id: string
          buyer_id?: string | null
          buyer_email: string
          product_id?: string | null
          amount_paid?: number
          currency?: string
        }
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>
        Relationships: []
      }
      email_subscribers: {
        Row: {
          id: string
          seller_id: string
          email: string
          created_at: string
        }
        Insert: {
          seller_id: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['email_subscribers']['Insert']>
        Relationships: []
      }
      chat_testimonials: {
        Row: {
          id: string
          product_id: string
          seller_id: string
          sender_name: string
          sender_avatar_url: string | null
          message: string
          display_time: string
          display_date: string
          reactions: Array<{ emoji: string; count: number }>
          likes_count: number
          background_url: string | null
          chat_bg_color: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          product_id: string
          seller_id: string
          sender_name?: string
          sender_avatar_url?: string | null
          message: string
          display_time?: string
          display_date?: string
          reactions?: Array<{ emoji: string; count: number }>
          likes_count?: number
          background_url?: string | null
          chat_bg_color?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['chat_testimonials']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_sales_count: {
        Args: { product_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductFile = Database['public']['Tables']['product_files']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']

export type ProductWithSeller = Product & { profiles: Profile }
export type ProductWithFiles = Product & { product_files: ProductFile[] }

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  currency: string
  bannerUrl: string | null
  sellerName: string
  sellerUsername: string
  slug: string
}
