import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSaveFeedback = () => {
  const { user } = useAuth();
  const [saveCount, setSaveCount] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSaveCount = async () => {
      // Count user_saves for this user
      const { count } = await supabase
        .from("user_saves")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count !== null) {
        setSaveCount(count);

        // Send feedback email after 5 saves (only once)
        if (count === 5 && !feedbackSent) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, display_name")
            .eq("id", user.id)
            .single();

          if (profile?.email) {
            await supabase.functions.invoke("send-email", {
              body: {
                to: profile.email,
                subject: "How are we doing? Quick feedback requested 📝",
                html: `<p>Hi ${profile.display_name || "there"},</p><p>We noticed you've saved 5 items on ThatsGoodToo! 🎉</p><p>We'd love to hear your thoughts. How would you rate your experience so far?</p><p>Rate us 1-5 stars by replying to this email with a number!</p><ul><li>⭐ = Needs improvement</li><li>⭐⭐⭐⭐⭐ = Amazing!</li></ul><p>Your feedback helps us improve.</p><p>Thanks!<br>ThatsGoodToo Team</p>`,
                templateVars: {
                  user_name: profile.display_name || "there",
                },
              },
            });
            setFeedbackSent(true);
          }
        }
      }
    };

    checkSaveCount();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("user_saves_feedback")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_saves",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkSaveCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, feedbackSent]);

  return { saveCount };
};
