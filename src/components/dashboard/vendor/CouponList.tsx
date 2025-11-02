import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Copy, Pencil, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import CouponEditForm from "./CouponEditForm";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  max_uses: number | null;
  start_date: string;
  end_date: string;
  active_status: boolean;
  is_recurring: boolean;
  recurrence_pattern: string | null;
}

interface CouponListProps {
  refresh: boolean;
  onRefreshComplete: () => void;
  onCreateClick?: () => void;
}

export default function CouponList({ refresh, onRefreshComplete, onCreateClick }: CouponListProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const loadCoupons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'list' },
      });

      if (response.error) throw response.error;
      setCoupons(response.data.coupons || []);
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      onRefreshComplete();
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    if (refresh) {
      loadCoupons();
    }
  }, [refresh]);

  const deleteCoupon = async (id: string) => {
    try {
      const response = await supabase.functions.invoke('manage-coupons', {
        body: {
          action: 'delete',
          coupon: { id },
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });

      loadCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    });
  };

  const activeCoupons = coupons.filter(c => c.active_status && new Date(c.end_date) > new Date());
  const expiredCoupons = coupons.filter(c => !c.active_status || new Date(c.end_date) <= new Date());
  const recurringCoupons = coupons.filter(c => c.is_recurring);

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <Card key={coupon.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-lg font-bold">{coupon.code}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(coupon.code)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Badge variant={coupon.active_status ? "default" : "secondary"}>
                {coupon.active_status ? "Active" : "Inactive"}
              </Badge>
              {coupon.is_recurring && <Badge variant="outline">Recurring</Badge>}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                {coupon.discount_type === 'percentage' && `${coupon.discount_value}% off`}
                {coupon.discount_type === 'fixed_amount' && `$${coupon.discount_value} off`}
                {coupon.discount_type === 'free_shipping' && 'Free Shipping'}
              </p>
              <p>
                Used: {coupon.used_count} 
                {coupon.max_uses ? ` / ${coupon.max_uses}` : ' (unlimited)'}
              </p>
              <p>
                Expires: {format(new Date(coupon.end_date), "PPP")}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCoupon(coupon)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteCoupon(coupon.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading coupons...</div>;
  }

  return (
    <>
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCoupons.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
          <TabsTrigger value="recurring">Recurring ({recurringCoupons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No Active Coupons Yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first coupon to attract shoppers and increase sales.<br />
                Coupons can be linked to specific listings or used store-wide.
              </p>
              {onCreateClick && (
                <Button onClick={onCreateClick}>
                  <Gift className="h-4 w-4 mr-2" />
                  Create Your First Coupon
                </Button>
              )}
            </div>
          ) : (
            activeCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-4">
          {expiredCoupons.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No expired coupons</p>
          ) : (
            expiredCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
          )}
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          {recurringCoupons.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No recurring coupons</p>
          ) : (
            recurringCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingCoupon} onOpenChange={(open) => !open && setEditingCoupon(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <CouponEditForm
              coupon={editingCoupon}
              onSuccess={() => {
                setEditingCoupon(null);
                loadCoupons();
              }}
              onCancel={() => setEditingCoupon(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}