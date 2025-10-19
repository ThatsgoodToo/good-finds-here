import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VendorSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    toast.info("Vendor application coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showGoodToday={false} />
      
      <main className="pt-16 sm:pt-20">
        <SearchBar
          onSearch={() => {}}
          onToggleMap={() => {}}
          isMapView={false}
          isCentered={true}
          onWhatsgoodClick={() => navigate("/")}
        />
        
        <div className="flex items-center justify-center p-4 pt-8">
          <Card className="w-full max-w-2xl p-6">
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold">Become a Vendor</h1>
              <p className="text-lg text-muted-foreground">
                Share your unique goods, services, and experiences with our community.
              </p>
              <p className="text-muted-foreground">
                Join local vendors, independent artists, and small businesses who are already part of That's Good Too.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto">
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VendorSignup;
