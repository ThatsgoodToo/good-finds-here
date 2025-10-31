import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VendorAuthData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface VendorApplication {
  // Page 1
  website: string;
  social_media_links: string[];
  city: string;
  state_region: string;
  country: string;
  phone_number: string;
  business_type: string;
  business_type_other: string;
  
  // Page 2
  business_description: string;
  products_services: string[];
  inventory_type: string[];
  shipping_options: string[];
  pickup_address: string;
  
  // Page 3
  area_of_expertise: string[];
  business_duration: string;
  craft_development: string;
  certifications_awards: string;
  
  // Page 4
  creativity_style: string;
  inspiration: string;
  brand_uniqueness: string;
  sustainable_methods: string[];
  
  // Page 5
  pricing_style: string;
  exclusive_offers: string;
  promotion_social_channels: string;
  future_website: string;
  
  // Page 6
  promo_code: string;
  subscription_type: string;
  payment_method_saved: boolean;
  
  // Page 7
  additional_info: string;
  info_accurate: boolean;
  understands_review: boolean;
  agrees_to_terms: boolean;
  receive_updates: boolean;
}

const VendorSignup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isDualRole = searchParams.get('promo') === 'DUAL_ROLE';
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [authData, setAuthData] = useState<VendorAuthData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [formData, setFormData] = useState<VendorApplication>({
    website: "",
    social_media_links: [],
    city: "",
    state_region: "",
    country: "",
    phone_number: "",
    business_type: "",
    business_type_other: "",
    business_description: "",
    products_services: [],
    inventory_type: [],
    shipping_options: [],
    pickup_address: "",
    area_of_expertise: [],
    business_duration: "",
    craft_development: "",
    certifications_awards: "",
    creativity_style: "",
    inspiration: "",
    brand_uniqueness: "",
    sustainable_methods: [],
    pricing_style: "",
    exclusive_offers: "",
    promotion_social_channels: "",
    future_website: "",
    promo_code: isDualRole ? "DUAL_ROLE" : "",
    subscription_type: "standard",
    payment_method_saved: false,
    additional_info: "",
    info_accurate: false,
    understands_review: false,
    agrees_to_terms: false,
    receive_updates: false,
  });

  // Check if user is already authenticated and load their data
  useEffect(() => {
    const loadUserData = async () => {
      if (user && isDualRole) {
        setIsExistingUser(true);
        setShowWelcome(false);
        setShowAuth(false);
        
        // Load existing profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setAuthData({
            fullName: profile.full_name || "",
            email: profile.email || user.email || "",
            password: "", // Not needed for existing users
            confirmPassword: "", // Not needed for existing users
          });
        }
      }
    };

    loadUserData();
  }, [user, isDualRole]);

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateField = (field: keyof VendorApplication, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof VendorApplication, item: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(item)) {
      updateField(field, currentArray.filter(i => i !== item));
    } else {
      updateField(field, [...currentArray, item]);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.website || !formData.city || !formData.state_region || !formData.country || !formData.business_type) {
          toast.error("Please fill in all required fields");
          return false;
        }
        break;
      case 1: // About Your Business
        if (!formData.business_description || formData.products_services.length === 0 || formData.inventory_type.length === 0 || formData.area_of_expertise.length === 0) {
          toast.error("Please fill in all required fields");
          return false;
        }
        break;
      case 2: // Expertise
        if (!formData.business_duration || !formData.craft_development) {
          toast.error("Please fill in all required fields");
          return false;
        }
        break;
      case 3: // Practices & Creativity - no required fields
        break;
      case 4: // Agreements
        if (!formData.info_accurate || !formData.understands_review || !formData.agrees_to_terms) {
          toast.error("Please agree to all required terms");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleAuthSubmit = async () => {
    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });

        if (error) {
          toast.error("Login failed: " + error.message);
          return;
        }

        toast.success("Logged in successfully!");
        setShowAuth(false);
      } else {
        // Handle signup
        if (!authData.fullName || !authData.email || !authData.password || !authData.confirmPassword) {
          toast.error("Please fill in all fields");
          return;
        }

        // Validate passwords match
        if (authData.password !== authData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/vendor-signup`,
            data: {
              full_name: authData.fullName,
              role: "vendor",
            },
          },
        });

        if (error) {
          toast.error("Signup failed: " + error.message);
          return;
        }

        toast.success("Account created successfully!");
        setShowAuth(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Please sign in to submit your application");
        navigate("/auth");
        return;
      }

      // For dual role users, check if they already have a shopper subscription
      if (isDualRole && isExistingUser) {
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .single();

        // If they have an active subscription, they don't need a new one
        if (existingSub) {
          // Just submit the application without creating new subscription
          const { error } = await supabase
            .from('vendor_applications')
            .insert([{
              user_id: currentUser.id,
              ...formData,
              status: 'pending'
            }]);

          if (error) throw error;

          // Update profile name if changed
          if (authData.fullName) {
            await supabase
              .from('profiles')
              .update({ full_name: authData.fullName })
              .eq('id', currentUser.id);
          }

          toast.success("Application submitted! You can now list products as a vendor.");
          setCurrentStep(totalSteps); // Show thank you page
          return;
        }
      }

      // Regular submission for new vendors
      const { error } = await supabase
        .from('vendor_applications')
        .insert([{
          user_id: currentUser.id,
          ...formData,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success("Application submitted successfully!");
      setCurrentStep(totalSteps); // Show thank you page
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome || showAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Header showGoodToday={false} />
        
        <main className="pt-16 sm:pt-20 pb-24">
          <div className="flex items-center justify-center p-4 pt-8">
            {showWelcome && (
            <Card className="w-full max-w-3xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl sm:text-4xl font-bold mb-2">
                  Welcome to That's Good Too!
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Become a Vendor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-primary font-medium mb-4">
                  Welcome to our Premiere Release — our community and database will grow as we bring more creators on board!
                </p>
                
                <div className="prose prose-sm sm:prose-base text-muted-foreground space-y-4">
                  <p>
                    We promote local goods, independent artists, and small-scale producers by giving you five spaces to showcase your products, services, or experiences, directing customers straight to your existing site.
                  </p>
                  <p>
                    Our subscription-based platform is affordable, designed to save you time, and has no ad fees, making it easy to promote your work and connect with your community.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">5</div>
                    <div className="text-sm text-muted-foreground">Showcase Spaces</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">Free</div>
                    <div className="text-sm text-muted-foreground">Founding Member Access</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">0%</div>
                    <div className="text-sm text-muted-foreground">Ad Fees</div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowWelcome(false);
                    setShowAuth(true);
                  }} 
                  className="w-full"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
            )}

            {showAuth && !isExistingUser && (
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {isLogin ? "Sign In" : "Create Your Account"}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? "Already have a shopper account? Sign in to continue." 
                    : "Create a new account to get started."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={authData.fullName}
                      onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={authData.confirmPassword}
                    onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <Button onClick={handleAuthSubmit} className="w-full">
                  {isLogin ? "Sign In & Continue" : "Create Account & Continue"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have a shopper account? Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Thank You Page
  if (currentStep === totalSteps) {
    return (
      <div className="min-h-screen bg-background">
        <Header showGoodToday={false} />
        
        <main className="pt-16 sm:pt-20 pb-24">
          <div className="flex items-center justify-center p-4 pt-8">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold mb-2">
                  Thank You for Applying! ✨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <p className="text-lg">
                  We've received your application and are excited to learn more about you!
                </p>
                <p className="text-muted-foreground">
                  At TGT, we keep things authentic — every application is reviewed by a real person, not an automated system. Please allow up to 5 business days for review.
                </p>
                <p className="text-muted-foreground">
                  If approved, you'll receive a confirmation email with next steps.
                </p>
                <p className="text-sm font-medium text-primary">
                  Thank you for helping us support small-scale makers, independent artists, and authentic experiences!
                </p>
                <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGoodToday={false} />
      
      <main className="pt-16 sm:pt-20 pb-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 0 && "Basic Info"}
                {currentStep === 1 && "About Your Business"}
                {currentStep === 2 && "Expertise"}
                {currentStep === 3 && "Practices & Creativity"}
                {currentStep === 4 && "Confirmation & Agreements"}
              </CardTitle>
              <CardDescription>
                {currentStep === 0 && "Where can we find you?"}
                {currentStep === 1 && "Tell us about what you offer"}
                {currentStep === 2 && "Share your experience and expertise"}
                {currentStep === 3 && "What makes your work unique?"}
                {currentStep === 4 && "Review and confirm your application"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Page 1: Basic Info */}
              {currentStep === 0 && (
                <>
                  {isExistingUser && (
                    <div className="p-4 bg-primary/10 rounded-lg mb-4">
                      <h3 className="font-semibold mb-2">Welcome Back!</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        You're already signed in. Optionally update your name below, then continue with your vendor application.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="updateName">
                          Full Name (optional - leave as is if you don't want to change)
                        </Label>
                        <Input
                          id="updateName"
                          type="text"
                          placeholder={authData.fullName || "Current name"}
                          value={authData.fullName}
                          onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Verified email: <strong>{authData.email}</strong>
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="website">Website / Social Media Link *</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://yourwebsite.com or @username"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Portland"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Region *</Label>
                      <Input
                        id="state"
                        value={formData.state_region}
                        onChange={(e) => updateField('state_region', e.target.value)}
                        placeholder="Oregon"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessType">Ownership *</Label>
                    <Select value={formData.business_type} onValueChange={(val) => updateField('business_type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Independent artist / maker</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit / mission-driven</SelectItem>
                        <SelectItem value="family">Family Owned</SelectItem>
                        <SelectItem value="collaborative">Collaborative</SelectItem>
                        <SelectItem value="diverse">Diverse-owned</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.business_type === "diverse" || formData.business_type === "other") && (
                    <div>
                      <Label htmlFor="businessTypeOther">Please Specify</Label>
                      <Input
                        id="businessTypeOther"
                        value={formData.business_type_other}
                        onChange={(e) => updateField('business_type_other', e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Page 2: About Your Business */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="description">Brief Description of Business *</Label>
                    <Textarea
                      id="description"
                      value={formData.business_description}
                      onChange={(e) => updateField('business_description', e.target.value)}
                      placeholder="Tell us about your business..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Products or Services Offered *</Label>
                    <div className="space-y-2 mt-2">
                      {["Designed, made, grown, or collected", "Services offered", "An Experience"].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.products_services.includes(item)}
                            onCheckedChange={() => toggleArrayItem('products_services', item)}
                          />
                          <Label className="font-normal">{item}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Inventory Type *</Label>
                    <div className="space-y-2 mt-2">
                      {["Regular", "Overstocked", "Odd Balls / One-Offs / Misfits", "Viewer-based", "Other"].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.inventory_type.includes(item)}
                            onCheckedChange={() => toggleArrayItem('inventory_type', item)}
                          />
                          <Label className="font-normal">{item}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ownership">Ownership *</Label>
                    <Select value={formData.business_type} onValueChange={(val) => updateField('business_type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Independent artist / maker</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit / mission-driven</SelectItem>
                        <SelectItem value="family">Family Owned</SelectItem>
                        <SelectItem value="collaborative">Collaborative</SelectItem>
                        <SelectItem value="diverse">Diverse-owned</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pricing">Pricing Style</Label>
                    <Select value={formData.pricing_style} onValueChange={(val) => updateField('pricing_style', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget-friendly</SelectItem>
                        <SelectItem value="accessible">Accessible</SelectItem>
                        <SelectItem value="cost-effective">Cost-effective</SelectItem>
                        <SelectItem value="high-end">High-end/Designer</SelectItem>
                        <SelectItem value="no-budget">No set budget</SelectItem>
                        <SelectItem value="viewership">Viewership-based</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Area of Expertise / Business Type *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {["Art & Design", "Fashion & Accessories", "Food & Beverage", "Home & Lifestyle", "Wellness & Body Care", "Tech & Innovation", "Education & Experiences", "Other"].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.area_of_expertise.includes(item)}
                            onCheckedChange={() => toggleArrayItem('area_of_expertise', item)}
                          />
                          <Label className="font-normal text-sm">{item}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Page 3: Expertise */}
              {currentStep === 2 && (
                <>
                  <div>
                    <Label htmlFor="duration">Business Duration *</Label>
                    <Select value={formData.business_duration} onValueChange={(val) => updateField('business_duration', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<1">&lt;1 year</SelectItem>
                        <SelectItem value="1-3">1–3 years</SelectItem>
                        <SelectItem value="3-5">3–5 years</SelectItem>
                        <SelectItem value="5-10">5–10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="craftDev">Craft Development *</Label>
                    <Select value={formData.craft_development} onValueChange={(val) => updateField('craft_development', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you develop your craft?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self-taught">Self-taught</SelectItem>
                        <SelectItem value="formal">Formally trained</SelectItem>
                        <SelectItem value="apprentice">Apprenticeship/mentorship</SelectItem>
                        <SelectItem value="family">Family tradition</SelectItem>
                        <SelectItem value="learning">Still learning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="certs">Certifications / Awards (Optional)</Label>
                    <Textarea
                      id="certs"
                      value={formData.certifications_awards}
                      onChange={(e) => updateField('certifications_awards', e.target.value)}
                      placeholder="List any relevant certifications or awards..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Page 4: Practices & Creativity */}
              {currentStep === 3 && (
                <>
                  <div>
                    <Label htmlFor="creativity">Creativity Style/Level</Label>
                    <Select value={formData.creativity_style} onValueChange={(val) => updateField('creativity_style', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventive">🎨 Inventive</SelectItem>
                        <SelectItem value="refined">🌿 Refined</SelectItem>
                        <SelectItem value="resourceful">🔄 Resourceful</SelectItem>
                        <SelectItem value="expressive">✨ Expressive</SelectItem>
                        <SelectItem value="practical">⚙️ Practical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sustainable / Local / Small-Scale Methods</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {[
                        "♻️ Upcycled/recycled", 
                        "🌿 Eco-friendly", 
                        "🧵 Handcrafted/small-batch", 
                        "🏠 Locally made", 
                        "🚜 Locally sourced", 
                        "🔋 Low-waste/zero-waste",
                        "🌞 Ethical labor",
                        "💧 Energy-conscious",
                        "🌎 Community-based",
                        "🪴 Regenerative/circular",
                        "🧡 Social impact",
                        "🪡 Made-to-order"
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.sustainable_methods.includes(item)}
                            onCheckedChange={() => toggleArrayItem('sustainable_methods', item)}
                          />
                          <Label className="font-normal text-sm">{item}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Page 5: Confirmation & Agreements */}
              {currentStep === 4 && (
                <>
                  <div>
                    <Label htmlFor="additional">Anything else you'd like to add? (Optional)</Label>
                    <Textarea
                      id="additional"
                      value={formData.additional_info}
                      onChange={(e) => updateField('additional_info', e.target.value)}
                      placeholder="Share any additional information..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Required Agreements</h3>
                    
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={formData.info_accurate}
                        onCheckedChange={(checked) => updateField('info_accurate', checked)}
                      />
                      <Label className="font-normal">
                        I confirm the information is accurate
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={formData.understands_review}
                        onCheckedChange={(checked) => updateField('understands_review', checked)}
                      />
                      <Label className="font-normal">
                        I understand TGT reviews applications and approval is at our discretion
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={formData.agrees_to_terms}
                        onCheckedChange={(checked) => updateField('agrees_to_terms', checked)}
                      />
                      <Label className="font-normal">
                        I agree to TGT Vendor Guidelines & Terms of Use{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setShowTermsDialog(true)}
                        >
                          (Read Terms)
                        </Button>
                      </Label>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t">
                      <Checkbox
                        checked={formData.receive_updates}
                        onCheckedChange={(checked) => updateField('receive_updates', checked)}
                      />
                      <Label className="font-normal">
                        Yes, I'd like to receive updates, tips, and promotional opportunities (Optional)
                      </Label>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                {currentStep < totalSteps - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>TGT Vendor Guidelines & Terms of Use</DialogTitle>
            <DialogDescription>
              Please read and understand these terms before agreeing
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-sm space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">1. Platform Purpose</h3>
              <p>TGT is a promotional and discovery platform. We do not process payments or handle sales. All transactions happen directly on the vendor's website or third-party platform.</p>
            </div>

            <div>
              <h3 className="font-semibold">2. Vendor Eligibility</h3>
              <p>You must be the legal owner or authorized representative of your brand, business, or content. All information you provide must be accurate and truthful.</p>
            </div>

            <div>
              <h3 className="font-semibold">3. Listings & Offers</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Product or service listings must have at least one active exclusive offer</li>
                <li>Exclusive offers are optional for content-based/creator listings</li>
                <li>Offers must be described accurately. Misrepresentation may result in removal</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">4. Tracking & Analytics</h3>
              <p>By participating, you consent to TGT tracking clicks, visits, coupon usage, and referrals from our platform to your checkout site. This data is used to measure performance and improve the platform.</p>
            </div>

            <div>
              <h3 className="font-semibold">5. Intellectual Property</h3>
              <p>You retain ownership of your content. By submitting content to TGT, you grant a non-exclusive, worldwide license for TGT to display and promote your work on the platform and social channels.</p>
            </div>

            <div>
              <h3 className="font-semibold">6. Prohibited Items</h3>
              <p>Vendors may not promote or sell alcohol, tobacco, or age-restricted products.</p>
            </div>

            <div>
              <h3 className="font-semibold">7. Responsibilities</h3>
              <p>You agree to keep listings and offers accurate and up-to-date, comply with all applicable laws, and respect TGT community guidelines.</p>
            </div>

            <div>
              <h3 className="font-semibold">8. Liability</h3>
              <p>TGT is not responsible for sales, transactions, or disputes. Vendors assume all financial, legal, and transactional responsibilities.</p>
            </div>

            <div>
              <h3 className="font-semibold">9. Termination & Updates</h3>
              <p>TGT may remove listings, suspend, or terminate accounts at our discretion. Terms may be updated, and major changes will be communicated.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorSignup;
