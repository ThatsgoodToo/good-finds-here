import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
const PrivacySettings = () => {
  const navigate = useNavigate();
  const {
    activeRole
  } = useAuth();
  const handleBack = () => {
    const dashboardPath = activeRole === 'vendor' ? '/vendor/dashboard' : '/dashboard';
    navigate(dashboardPath);
  };
  return <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Privacy Controls</h1>
          <p className="text-muted-foreground">Manage your privacy and data settings</p>
          
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control who can see your information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Privacy controls are available in your Profile Settings. You can manage location
              visibility, high-fives visibility, and other privacy options there.
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>;
};
export default PrivacySettings;