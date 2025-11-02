import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
const createCouponSchema = z.object({
  code: z.string()
    .trim()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens')
    .transform(val => val.toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping'], {
    errorMap: () => ({ message: 'Invalid discount type' })
  }),
  discount_value: z.number()
    .positive('Discount value must be positive')
    .max(10000, 'Discount value too large'),
  max_uses: z.number().int().positive().optional().nullable(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  is_recurring: z.boolean().optional(),
  recurrence_pattern: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']).optional().nullable(),
  listing_id: z.string().uuid('Invalid listing ID format').optional().nullable(),
}).refine(data => {
  if (data.discount_type === 'percentage') {
    return data.discount_value >= 1 && data.discount_value <= 100;
  }
  return true;
}, {
  message: 'Percentage discount must be between 1 and 100',
  path: ['discount_value'],
}).refine(data => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  return start < end;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

const updateCouponSchema = z.object({
  id: z.string().uuid('Invalid coupon ID format'),
  discount_value: z.number().positive().max(10000).optional(),
  max_uses: z.number().int().positive().optional().nullable(),
  end_date: z.string().datetime().optional(),
  is_recurring: z.boolean().optional(),
  recurrence_pattern: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']).optional().nullable(),
});

const couponIdSchema = z.object({
  id: z.string().uuid('Invalid coupon ID format'),
});

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

        // Validate and sanitize input
        const validatedCoupon = createCouponSchema.parse(coupon);

        // Check for duplicate code
        const { data: existing } = await supabaseClient
          .from('coupons')
          .select('id')
          .eq('vendor_id', user.id)
          .eq('code', validatedCoupon.code)
          .single();

        if (existing) {
          throw new Error('Coupon code already exists');
        }

        // Create coupon with validated data
        const { data, error } = await supabaseClient
          .from('coupons')
          .insert({
            vendor_id: user.id,
            code: validatedCoupon.code,
            discount_type: validatedCoupon.discount_type,
            discount_value: validatedCoupon.discount_value,
            max_uses: validatedCoupon.max_uses ?? null,
            start_date: validatedCoupon.start_date,
            end_date: validatedCoupon.end_date,
            is_recurring: validatedCoupon.is_recurring ?? false,
            recurrence_pattern: validatedCoupon.recurrence_pattern ?? null,
            listing_id: validatedCoupon.listing_id ?? null,
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

        // Validate and sanitize input
        const validatedUpdate = updateCouponSchema.parse(coupon);

        const updateData: any = {};
        
        if (validatedUpdate.discount_value !== undefined) updateData.discount_value = validatedUpdate.discount_value;
        if (validatedUpdate.max_uses !== undefined) updateData.max_uses = validatedUpdate.max_uses;
        if (validatedUpdate.end_date !== undefined) updateData.end_date = validatedUpdate.end_date;
        if (validatedUpdate.is_recurring !== undefined) updateData.is_recurring = validatedUpdate.is_recurring;
        if (validatedUpdate.recurrence_pattern !== undefined) updateData.recurrence_pattern = validatedUpdate.recurrence_pattern;

        const { data, error } = await supabaseClient
          .from('coupons')
          .update(updateData)
          .eq('id', validatedUpdate.id)
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

        // Validate coupon ID format
        const { id } = couponIdSchema.parse(coupon);

        const { error } = await supabaseClient
          .from('coupons')
          .delete()
          .eq('id', id)
          .eq('vendor_id', user.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!coupon?.id) throw new Error('Coupon ID required');

        // Validate coupon ID format
        const { id } = couponIdSchema.parse(coupon);

        const { data, error } = await supabaseClient
          .from('coupons')
          .select('*')
          .eq('id', id)
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