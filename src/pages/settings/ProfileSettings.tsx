import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  locationPublic: z.boolean(),
  highFivesPublic: z.boolean()
});
const ProfileSettings = () => {
  const {
    toast
  } = useToast();
  const {
    user,
    activeRole
  } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const handleBack = () => {
    const dashboardPath = activeRole === 'vendor' ? '/vendor/dashboard' : '/dashboard';
    navigate(dashboardPath);
  };
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      location: "",
      bio: "",
      avatarUrl: "",
      locationPublic: true,
      highFivesPublic: true
    }
  });
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
        return;
      }
      if (data) {
        form.reset({
          displayName: data.display_name || "",
          location: data.location || "",
          bio: data.bio || "",
          avatarUrl: data.avatar_url || "",
          locationPublic: data.location_public ?? true,
          highFivesPublic: data.high_fives_public ?? true
        });
      }
    };
    loadProfile();
  }, [user]);
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from("profiles").update({
        display_name: values.displayName,
        location: values.location,
        bio: values.bio,
        avatar_url: values.avatarUrl,
        location_public: values.locationPublic,
        high_fives_public: values.highFivesPublic
      }).eq("id", user.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your public profile information</p>
          
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="displayName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="location" render={({
                field
              }) => <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your location (e.g., "San Francisco, CA")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="bio" render={({
                field
              }) => <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                      </FormControl>
                      <FormDescription>
                        Brief description for your profile. Max 500 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="avatarUrl" render={({
                field
              }) => <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <div className="space-y-2">
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" className="w-full" onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async e => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file || !user) return;
                      try {
                        const {
                          uploadFile,
                          getUserPath
                        } = await import("@/lib/storage");
                        const path = getUserPath(user.id, file.name);
                        const {
                          url
                        } = await uploadFile({
                          bucket: "profile-pictures",
                          file,
                          path
                        });
                        field.onChange(url);
                        toast({
                          title: "Success",
                          description: "Image uploaded!"
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Upload failed",
                          variant: "destructive"
                        });
                      }
                    };
                    input.click();
                  }}>
                          Upload Image
                        </Button>
                      </div>
                      <FormDescription>Provide a URL or upload an image</FormDescription>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="locationPublic" render={({
                field
              }) => <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Location</FormLabel>
                        <FormDescription>
                          Allow others to see your location
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>} />

                <FormField control={form.control} name="highFivesPublic" render={({
                field
              }) => <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public High-Fives</FormLabel>
                        <FormDescription>
                          Allow others to see your high-fives
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>} />

                <Button type="submit" disabled={isLoading}>
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>;
};
export default ProfileSettings;