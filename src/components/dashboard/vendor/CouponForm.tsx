import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const couponSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .transform(val => val.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and hyphens allowed")),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  discount_value: z.coerce.number().positive("Discount must be positive"),
  max_uses: z.coerce.number().positive().int().optional().nullable(),
  start_date: z.date(),
  end_date: z.date(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional().nullable(),
  listing_id: z.string().uuid().optional().nullable(),
}).refine(data => data.end_date > data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"]
}).refine((data) => {
  if (data.discount_type === 'percentage') {
    return data.discount_value >= 1 && data.discount_value <= 100;
  }
  return true;
}, {
  message: "Percentage must be between 1 and 100",
  path: ["discount_value"]
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  listingId?: string | null;
  autoLinkListing?: boolean;
  deferSubmission?: boolean;
  onCouponDataReady?: (couponData: CouponFormData) => void;
}

export default function CouponForm({ onSuccess, onCancel, listingId, autoLinkListing, deferSubmission, onCouponDataReady }: CouponFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      is_recurring: false,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
  });

  const discountType = watch("discount_type");
  const isRecurring = watch("is_recurring");

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setValue("code", code);
  };

  const onSubmit = async (data: CouponFormData) => {
    // If deferred submission, just return the data to parent
    if (deferSubmission && onCouponDataReady) {
      onCouponDataReady(data);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create coupons",
          variant: "destructive",
        });
        return;
      }

      // If autoLinkListing is true and we have a listingId, use it
      const finalListingId = autoLinkListing && listingId 
        ? listingId 
        : data.listing_id || null;

      const response = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'create',
          coupon: {
            code: data.code,
            discount_type: data.discount_type,
            discount_value: data.discount_value,
            max_uses: data.max_uses || null,
            start_date: data.start_date.toISOString(),
            end_date: data.end_date.toISOString(),
            is_recurring: data.is_recurring,
            recurrence_pattern: data.recurrence_pattern || null,
            listing_id: finalListingId,
          },
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Coupon created successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            {...register("code")}
            placeholder="SAVE20"
            className="uppercase"
            onChange={(e) => {
              const uppercased = e.target.value.toUpperCase();
              e.target.value = uppercased;
              setValue("code", uppercased);
            }}
          />
          <Button type="button" variant="outline" onClick={generateCode}>
            Generate
          </Button>
        </div>
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discount_type">Discount Type</Label>
          <Select onValueChange={(value) => setValue("discount_type", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              <SelectItem value="free_shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
          {errors.discount_type && <p className="text-sm text-destructive">{errors.discount_type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_value">
            {discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
          </Label>
          <Input
            id="discount_value"
            type="number"
            step={discountType === 'percentage' ? '1' : '0.01'}
            {...register("discount_value", { valueAsNumber: true })}
            placeholder={discountType === 'percentage' ? '20' : '10.00'}
          />
          {errors.discount_value && <p className="text-sm text-destructive">{errors.discount_value.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_uses">Maximum Uses (Optional)</Label>
        <Input
          id="max_uses"
          type="number"
          {...register("max_uses", { 
            valueAsNumber: true,
            setValueAs: (v) => v === "" ? null : Number(v)
          })}
          placeholder="Leave empty for unlimited"
        />
        {errors.max_uses && <p className="text-sm text-destructive">{errors.max_uses.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setValue("start_date", date || new Date());
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setValue("end_date", date || new Date());
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("is_recurring", checked)}
        />
        <Label htmlFor="is_recurring">Make this a recurring coupon</Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
          <Select onValueChange={(value) => setValue("recurrence_pattern", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}