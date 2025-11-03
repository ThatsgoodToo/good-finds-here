import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorHandler";

interface ListingData {
  id: string;
  title: string;
  resets_at: string | null;
  reset_cycle: string;
}

interface CouponWithListing {
  id: string;
  code: string;
  used_count: number;
  max_uses: number | null;
  listings: ListingData;
}

export interface CouponResetSchedule {
  id: string;
  code: string;
  used_count: number;
  max_uses: number | null;
  listing_title: string;
  listing_id: string;
  resets_at: string | null;
  reset_cycle: string;
  usage_percentage: number;
  time_until_reset_hours: number;
}

export interface ResetHistoryPoint {
  date: string;
  reset_count: number;
  emails_sent: number;
}

export interface PerformanceInsights {
  most_popular_code: string | null;
  most_popular_uses: number;
  average_reset_days: number;
  coupons_nearing_depletion: number;
}

export const useVendorCouponAnalytics = () => {
  const [schedules, setSchedules] = useState<CouponResetSchedule[]>([]);
  const [history, setHistory] = useState<ResetHistoryPoint[]>([]);
  const [insights, setInsights] = useState<PerformanceInsights>({
    most_popular_code: null,
    most_popular_uses: 0,
    average_reset_days: 0,
    coupons_nearing_depletion: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch coupon reset schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("coupons")
        .select(`
          id,
          code,
          used_count,
          max_uses,
          listings!inner(
            id,
            title,
            resets_at,
            reset_cycle
          )
        `)
        .eq("vendor_id", session.user.id)
        .neq("listings.reset_cycle", "none")
        .not("listings.resets_at", "is", null)
        .eq("active_status", true)
        .order("listings.resets_at", { ascending: true });

      if (schedulesError) throw schedulesError;

      const formattedSchedules: CouponResetSchedule[] = (schedulesData as CouponWithListing[] || []).map((item) => {
        const listing = item.listings;
        const resetsAt = listing.resets_at ? new Date(listing.resets_at) : null;
        const now = new Date();
        const timeUntilReset = resetsAt ? (resetsAt.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;
        const usagePercentage = item.max_uses ? (item.used_count / item.max_uses) * 100 : 0;

        return {
          id: item.id,
          code: item.code,
          used_count: item.used_count,
          max_uses: item.max_uses,
          listing_title: listing.title,
          listing_id: listing.id,
          resets_at: listing.resets_at,
          reset_cycle: listing.reset_cycle,
          usage_percentage: Math.round(usagePercentage),
          time_until_reset_hours: Math.max(0, timeUntilReset),
        };
      });

      setSchedules(formattedSchedules);

      // Fetch reset history from cron_logs
      const { data: historyData, error: historyError } = await supabase
        .from("cron_logs")
        .select("completed_at, records_processed, emails_sent")
        .eq("job_name", "daily_listing_notifications")
        .eq("status", "success")
        .gte("completed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("completed_at", { ascending: false });

      if (historyError) throw historyError;

      const groupedHistory: { [key: string]: ResetHistoryPoint } = {};
      (historyData || []).forEach((log) => {
        const date = new Date(log.completed_at).toISOString().split("T")[0];
        if (!groupedHistory[date]) {
          groupedHistory[date] = { date, reset_count: 0, emails_sent: 0 };
        }
        groupedHistory[date].reset_count += log.records_processed || 0;
        groupedHistory[date].emails_sent += log.emails_sent || 0;
      });

      setHistory(Object.values(groupedHistory).sort((a, b) => a.date.localeCompare(b.date)));

      // Calculate performance insights
      const mostPopular = formattedSchedules.reduce(
        (max, current) => (current.used_count > max.used_count ? current : max),
        { code: null, used_count: 0 } as { code: string | null; used_count: number }
      );

      const nearingDepletion = formattedSchedules.filter(
        (s) => s.max_uses && s.usage_percentage >= 80
      ).length;

      const avgResetDays =
        formattedSchedules.reduce((sum, s) => {
          const days =
            s.reset_cycle === "daily" ? 1 : s.reset_cycle === "weekly" ? 7 : s.reset_cycle === "monthly" ? 30 : 0;
          return sum + days;
        }, 0) / (formattedSchedules.length || 1);

      setInsights({
        most_popular_code: mostPopular.code,
        most_popular_uses: mostPopular.used_count,
        average_reset_days: Math.round(avgResetDays),
        coupons_nearing_depletion: nearingDepletion,
      });
    } catch (error) {
      logError("Loading vendor coupon analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("coupon_analytics_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coupons",
        },
        () => {
          loadAnalytics();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        () => {
          loadAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { schedules, history, insights, loading, refresh: loadAnalytics };
};
