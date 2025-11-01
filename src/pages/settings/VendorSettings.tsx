import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Store, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VendorSettings = () => {
  const navigate = useNavigate();
  const { roles, activeRole, setActiveRole } = useAuth();

  const hasVendorRole = roles.includes("vendor");
  const hasShopperRole = roles.includes("shopper");

  useEffect(() => {
    if (!hasVendorRole) {
      navigate("/settings/profile");
    }
  }, [hasVendorRole, navigate]);

  const handleRoleSwitch = (newRole: "vendor" | "shopper") => {
    setActiveRole(newRole);
    if (newRole === "shopper") {
      navigate("/dashboard/shopper");
    } else {
      navigate("/dashboard/vendor");
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
