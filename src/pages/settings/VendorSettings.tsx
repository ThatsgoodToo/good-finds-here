import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Store } from "lucide-react";

const VendorSettings = () => {
  const navigate = useNavigate();
  const { activeRole } = useAuth();

  useEffect(() => {
    if (activeRole !== "vendor") {
      navigate("/settings/profile");
    }
  }, [activeRole, navigate]);

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Settings</h1>
          <p className="text-muted-foreground">Manage your vendor profile and business settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>Access your full vendor dashboard to manage listings and profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/vendor/dashboard")}>
              Go to Vendor Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default VendorSettings;
