import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CouponRequest {
  action: 'create' | 'update' | 'delete' | 'get' | 'list';
  coupon?: {
    id?: string;
    code?: string;
    discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping';
    discount_value?: number;
    max_uses?: number;
    start_date?: string;
    end_date?: string;
    is_recurring?: boolean;
    recurrence_pattern?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    listing_id?: string;
  };
  vendor_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is a vendor
    const { data: roles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError || !roles?.some(r => r.role === 'vendor')) {
      throw new Error('User must be a vendor to manage coupons');
    }

    const { action, coupon, vendor_id }: CouponRequest = await req.json();

    // Validate vendor_id matches authenticated user
    const effectiveVendorId = vendor_id || user.id;
    if (effectiveVendorId !== user.id) {
      throw new Error('Cannot manage coupons for other vendors');
    }

    switch (action) {
      case 'create': {
        if (!coupon) throw new Error('Coupon data required');

        // Validate coupon data
        if (!coupon.code || coupon.code.length < 3 || coupon.code.length > 20) {
          throw new Error('Code must be 3-20 characters');
        }

        if (!/^[A-Z0-9-]+$/.test(coupon.code)) {
          throw new Error('Code must contain only uppercase letters, numbers, and hyphens');
        }

        if (!coupon.discount_type || !['percentage', 'fixed_amount', 'free_shipping'].includes(coupon.discount_type)) {
          throw new Error('Invalid discount type');
        }

        if (!coupon.discount_value || coupon.discount_value <= 0) {
          throw new Error('Discount value must be positive');
        }

        if (coupon.discount_type === 'percentage' && (coupon.discount_value < 1 || coupon.discount_value > 100)) {
          throw new Error('Percentage discount must be between 1 and 100');
        }

        if (!coupon.start_date || !coupon.end_date) {
          throw new Error('Start and end dates required');
        }

        const startDate = new Date(coupon.start_date);
        const endDate = new Date(coupon.end_date);

        if (startDate >= endDate) {
          throw new Error('End date must be after start date');
        }

        // Check for duplicate code
        const { data: existing } = await supabaseClient
          .from('coupons')
          .select('id')
          .eq('vendor_id', user.id)
          .eq('code', coupon.code)
          .single();

        if (existing) {
          throw new Error('Coupon code already exists');
        }

        // Create coupon
        const { data, error } = await supabaseClient
          .from('coupons')
          .insert({
            vendor_id: user.id,
            code: coupon.code.toUpperCase(),
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            max_uses: coupon.max_uses || null,
            start_date: coupon.start_date,
            end_date: coupon.end_date,
            is_recurring: coupon.is_recurring || false,
            recurrence_pattern: coupon.recurrence_pattern || null,
            listing_id: coupon.listing_id || null,
            active_status: true,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, coupon: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
        );
      }

      case 'update': {
        if (!coupon?.id) throw new Error('Coupon ID required');

        const updateData: any = {};
        
        if (coupon.discount_value) updateData.discount_value = coupon.discount_value;
        if (coupon.max_uses !== undefined) updateData.max_uses = coupon.max_uses;
        if (coupon.end_date) updateData.end_date = coupon.end_date;
        if (coupon.is_recurring !== undefined) updateData.is_recurring = coupon.is_recurring;
        if (coupon.recurrence_pattern) updateData.recurrence_pattern = coupon.recurrence_pattern;

        const { data, error } = await supabaseClient
          .from('coupons')
          .update(updateData)
          .eq('id', coupon.id)
          .eq('vendor_id', user.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, coupon: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!coupon?.id) throw new Error('Coupon ID required');

        const { error } = await supabaseClient
          .from('coupons')
          .delete()
          .eq('id', coupon.id)
          .eq('vendor_id', user.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!coupon?.id) throw new Error('Coupon ID required');

        const { data, error } = await supabaseClient
          .from('coupons')
          .select('*')
          .eq('id', coupon.id)
          .eq('vendor_id', user.id)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, coupon: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const { data, error } = await supabaseClient
          .from('coupons')
          .select('*, coupon_usage(count)')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, coupons: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Error in manage-coupons:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});