import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Gift, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  end_date: string;
  active_status: boolean;
}

interface ShareCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopperId: string;
  shopperName: string;
}

const ShareCouponDialog = ({ open, onOpenChange, shopperId, shopperName }: ShareCouponDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");
  const [shareLimit, setShareLimit] = useState<{ used: number; max: number }>({ used: 0, max: 20 });
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (open) {
      loadCoupons();
      loadShareLimit();
    }
  }, [open]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-coupons", {
        body: { action: "list" },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Filter active coupons only
      const activeCoupons = (data.coupons || []).filter(
        (c: Coupon) => c.active_status && new Date(c.end_date) > new Date()
      );
      setCoupons(activeCoupons);
    } catch (error: any) {
      console.error("Error loading coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const loadShareLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("coupon_shares")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", user.id)
        .gte("shared_at", startOfMonth.toISOString());

      if (error) throw error;

      setShareLimit({ used: count || 0, max: 20 });
    } catch (error) {
      console.error("Error loading share limit:", error);
    }
  };

  const handleShare = async () => {
    if (!selectedCouponId) {
      toast.error("Please select a coupon");
      return;
    }

    if (shareLimit.used >= shareLimit.max) {
      toast.error(`Monthly share limit reached (${shareLimit.max} shares)`);
      return;
    }

    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-coupon", {
        body: {
          coupon_id: selectedCouponId,
          shopper_id: shopperId,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const selectedCoupon = coupons.find((c) => c.id === selectedCouponId);
      toast.success(`Coupon ${selectedCoupon?.code} shared!`, {
        description: `${shopperName} will see your offer.`,
      });

      onOpenChange(false);
      setSelectedCouponId("");
    } catch (error: any) {
      console.error("Error sharing coupon:", error);
      toast.error(error.message || "Failed to share coupon");
    } finally {
      setSharing(false);
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    return coupon.discount_type === "percentage"
      ? `${coupon.discount_value}% off`
      : `$${coupon.discount_value} off`;
  };

  const getUsageDisplay = (coupon: Coupon) => {
    if (!coupon.max_uses) return "Unlimited uses";
    const remaining = coupon.max_uses - coupon.used_count;
    return `${remaining} of ${coupon.max_uses} remaining`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Share Coupon with {shopperName}</DialogTitle>
          <DialogDescription>
            Select an existing coupon to share. The shopper will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Limit Badge */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Monthly shares</span>
            </div>
            <Badge variant={shareLimit.used >= shareLimit.max ? "destructive" : "secondary"}>
              {shareLimit.used}/{shareLimit.max}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active coupons available</p>
              <p className="text-sm mt-1">Create a coupon first to share with shoppers</p>
            </div>
          ) : (
            <RadioGroup value={selectedCouponId} onValueChange={setSelectedCouponId}>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {coupons.map((coupon) => (
                  <Label
                    key={coupon.id}
                    htmlFor={coupon.id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                      selectedCouponId === coupon.id && "border-primary bg-accent"
                    )}
                  >
                    <RadioGroupItem value={coupon.id} id={coupon.id} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {coupon.code}
                          </Badge>
                          <span className="font-semibold">{getDiscountDisplay(coupon)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {format(new Date(coupon.end_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{getUsageDisplay(coupon)}</span>
                        </div>
                      </div>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedCouponId || sharing || shareLimit.used >= shareLimit.max}
              className="flex-1"
            >
              {sharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share Coupon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCouponDialog;
