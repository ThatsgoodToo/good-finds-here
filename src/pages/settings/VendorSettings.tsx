import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Store, ShoppingBag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VendorSettings = () => {
  const navigate = useNavigate();
  const { roles, activeRole, setActiveRole, user } = useAuth();
  const [locationPublic, setLocationPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const hasVendorRole = roles.includes("vendor");
  const hasShopperRole = roles.includes("shopper");

  useEffect(() => {
    if (!hasVendorRole) {
      navigate("/settings/profile");
    }
  }, [hasVendorRole, navigate]);

  useEffect(() => {
    const loadVendorSettings = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("location_public")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading vendor settings:", error);
        return;
      }

      if (data) {
        setLocationPublic(data.location_public ?? true);
      }
    };

    loadVendorSettings();
  }, [user]);

  const handleRoleSwitch = (newRole: "vendor" | "shopper") => {
    setActiveRole(newRole);
    if (newRole === "shopper") {
      navigate("/dashboard/shopper");
    } else {
      navigate("/dashboard/vendor");
    }
  };

  const handleLocationPublicToggle = async (checked: boolean) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("vendor_profiles")
        .update({ location_public: checked })
        .eq("user_id", user.id);

      if (error) throw error;

      setLocationPublic(checked);
      toast.success("Privacy settings updated");
    } catch (error: any) {
      console.error("Error updating location privacy:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Settings</h1>
          <p className="text-muted-foreground">Manage your vendor profile and business settings</p>
        </div>

        {/* Role Switcher */}
        {hasShopperRole && (
          <Card>
            <CardHeader>
              <CardTitle>Switch Role</CardTitle>
              <CardDescription>
                Switch between vendor and shopper modes to access different features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={activeRole === "vendor" ? "default" : "outline"}
                  onClick={() => handleRoleSwitch("vendor")}
                  className="flex-1"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Vendor Mode
                  {activeRole === "vendor" && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
                <Button
                  variant={activeRole === "shopper" ? "default" : "outline"}
                  onClick={() => handleRoleSwitch("shopper")}
                  className="flex-1"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shopper Mode
                  {activeRole === "shopper" && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Vendor Mode:</strong> Manage your listings, coupons, and view analytics<br />
                <strong>Shopper Mode:</strong> Browse, save favorites, and claim coupons from other vendors
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control what information is visible on your public profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Public Location</Label>
                <p className="text-sm text-muted-foreground">
                  Allow shoppers to see your business location
                </p>
              </div>
              <Switch
                checked={locationPublic}
                onCheckedChange={handleLocationPublicToggle}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>Access your full vendor dashboard to manage listings and profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard/vendor")}>
              Go to Vendor Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default VendorSettings;
