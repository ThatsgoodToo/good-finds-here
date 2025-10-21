import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const { activeRole } = useAuth();

  const handleBack = () => {
    const dashboardPath = activeRole === 'vendor' ? '/vendor/dashboard' : '/dashboard';
    navigate(dashboardPath);
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">View and manage your messages</p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Your platform messages will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">
                When you receive messages, they'll appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default Messages;
