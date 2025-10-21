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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  active_status: boolean;
}

const couponEditSchema = z.object({
  discount_value: z.coerce.number().positive("Discount value must be positive"),
  max_uses: z.coerce.number().int().positive("Max uses must be a positive integer").nullable(),
  end_date: z.date(),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(["weekly", "monthly", "quarterly", "yearly"]).nullable(),
});

type CouponEditData = z.infer<typeof couponEditSchema>;

interface CouponEditFormProps {
  coupon: Coupon;
  onSuccess: () => void;
  onCancel: () => void;
}

const CouponEditForm = ({ coupon, onSuccess, onCancel }: CouponEditFormProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponEditData>({
    resolver: zodResolver(couponEditSchema),
    defaultValues: {
      discount_value: coupon.discount_value,
      max_uses: coupon.max_uses,
      end_date: new Date(coupon.end_date),
      is_recurring: coupon.is_recurring,
      recurrence_pattern: coupon.recurrence_pattern as any,
    },
  });

  const isRecurring = watch("is_recurring");
  const endDate = watch("end_date");
  const maxUses = watch("max_uses");

  const onSubmit = async (data: CouponEditData) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to edit coupons");
        return;
      }

      // Validate max_uses doesn't decrease below used_count
      if (data.max_uses && data.max_uses < coupon.used_count) {
        toast.error(`Max uses cannot be less than current usage (${coupon.used_count})`);
        return;
      }

      const { data: result, error } = await supabase.functions.invoke("manage-coupons", {
        body: {
          action: "update",
          coupon: {
            id: coupon.id,
            discount_value: data.discount_value,
            max_uses: data.max_uses,
            end_date: data.end_date.toISOString(),
            is_recurring: data.is_recurring,
            recurrence_pattern: data.is_recurring ? data.recurrence_pattern : null,
          },
        },
      });

      if (error) throw error;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Coupon updated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Read-only fields */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Coupon Code (Cannot be changed)</Label>
          <Badge variant="secondary" className="text-lg px-3 py-1">{coupon.code}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Discount Type</Label>
            <p className="text-sm font-medium mt-1">{coupon.discount_type}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Start Date</Label>
            <p className="text-sm font-medium mt-1">{format(new Date(coupon.start_date), "PPP")}</p>
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Usage</Label>
          <p className="text-sm font-medium mt-1">{coupon.used_count} / {coupon.max_uses || "∞"} used</p>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discount_value">
            Discount Value ({coupon.discount_type === "percentage" ? "%" : "$"})
          </Label>
          <Input
            id="discount_value"
            type="number"
            step="0.01"
            {...register("discount_value")}
          />
          {errors.discount_value && (
            <p className="text-sm text-destructive">{errors.discount_value.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_uses">Maximum Uses (leave empty for unlimited)</Label>
          <Input
            id="max_uses"
            type="number"
            {...register("max_uses")}
            placeholder="Unlimited"
          />
          {errors.max_uses && (
            <p className="text-sm text-destructive">{errors.max_uses.message}</p>
          )}
          {maxUses && maxUses < coupon.used_count && (
            <p className="text-sm text-destructive">
              Cannot be less than current usage ({coupon.used_count})
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setValue("end_date", date)}
                disabled={(date) => date < new Date(coupon.start_date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_recurring">Recurring Coupon</Label>
            <p className="text-sm text-muted-foreground">
              Automatically renew after expiration
            </p>
          </div>
          <Switch
            id="is_recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("is_recurring", checked)}
          />
        </div>

        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
            <Select
              value={watch("recurrence_pattern") || ""}
              onValueChange={(value) => setValue("recurrence_pattern", value as any)}
            >
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
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Coupon
        </Button>
      </div>
    </form>
  );
};

export default CouponEditForm;
