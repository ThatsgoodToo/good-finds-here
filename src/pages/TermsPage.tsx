import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsPage = () => {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using this platform, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Users are responsible for maintaining the confidentiality of their account
              credentials and for all activities that occur under their account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Obligations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Vendors must provide accurate information about their products and services,
              honor all offers and coupons, and comply with all applicable laws and regulations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Users may not engage in fraudulent activities, violate intellectual property rights,
              or use the platform for any unlawful purposes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The platform is provided "as is" without warranties of any kind. We are not liable
              for any damages arising from the use or inability to use our services.
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default TermsPage;
