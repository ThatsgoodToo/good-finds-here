import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const AboutPage = () => {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">About Us</h1>
          <p className="text-muted-foreground">Learn more about our platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We're building a platform that connects shoppers with unique vendors offering
              products, services, and experiences.
            </p>
            <p>
              Our goal is to create a vibrant marketplace where small businesses and artisans
              can thrive while providing shoppers with exclusive offers and personalized
              discoveries.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Founded with the vision of supporting local businesses and creators, our platform
              makes it easy for vendors to showcase their offerings and connect directly with
              customers.
            </p>
            <p>
              Whether you're a shopper looking for unique finds or a vendor ready to share your
              craft with the world, we're here to make that connection happen.
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default AboutPage;
