import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const HelpPage = () => {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Help & FAQ</h1>
          <p className="text-muted-foreground">Find answers to common questions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Get help with common issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  Click on the "Sign Up" button in the header and follow the registration process.
                  You can sign up as either a shopper or vendor.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>What are High-Fives?</AccordionTrigger>
                <AccordionContent>
                  High-Fives are your saved items and favorite vendors. You can organize them into
                  folders for easy access later.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How do vendor coupons work?</AccordionTrigger>
                <AccordionContent>
                  Vendors can create and share exclusive coupons with their followers. Shoppers
                  receive these offers directly and can claim them for special discounts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I become a vendor?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Vendor Signup page and complete the application process. Your
                  application will be reviewed, and you'll be notified once approved.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Can I switch between shopper and vendor modes?</AccordionTrigger>
                <AccordionContent>
                  Yes! If you have both roles, you can switch between them using the toggle in
                  your dashboard or settings menu.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default HelpPage;
