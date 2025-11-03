import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useVendorCouponAnalytics } from "@/hooks/useVendorCouponAnalytics";
import { Clock, TrendingUp, AlertTriangle, Award } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function CouponAnalytics() {
  const { schedules, history, insights, loading } = useVendorCouponAnalytics();
  const navigate = useNavigate();

  const getUrgencyColor = (hours: number) => {
    if (hours < 24) return "destructive";
    if (hours < 72) return "default";
    return "secondary";
  };

  const getUrgencyIcon = (hours: number) => {
    if (hours < 24) return "🔴";
    if (hours < 72) return "🟡";
    return "🟢";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recurring Coupons Yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Create a coupon with automatic resets to see analytics here.
          </p>
          <Button onClick={() => navigate("/vendor/listing/new")}>Create Recurring Coupon</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.most_popular_code || "—"}</div>
            <p className="text-xs text-muted-foreground">{insights.most_popular_uses} uses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Reset Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.average_reset_days}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Near Depletion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.coupons_nearing_depletion}</div>
            <p className="text-xs text-muted-foreground">coupons at 80%+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Resets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Reset Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Next Reset Schedule</CardTitle>
          <CardDescription>Upcoming automatic coupon resets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.slice(0, 5).map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getUrgencyIcon(schedule.time_until_reset_hours)}</span>
                    <code className="font-bold">{schedule.code}</code>
                    <Badge variant="outline" className="text-xs">
                      {schedule.reset_cycle}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{schedule.listing_title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>
                      Used: {schedule.used_count}
                      {schedule.max_uses ? ` / ${schedule.max_uses}` : " (unlimited)"}
                    </span>
                    {schedule.max_uses && (
                      <span>Usage: {schedule.usage_percentage}%</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={getUrgencyColor(schedule.time_until_reset_hours)}>
                    {schedule.resets_at
                      ? formatDistanceToNow(new Date(schedule.resets_at), { addSuffix: true })
                      : "—"}
                  </Badge>
                  {schedule.resets_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(schedule.resets_at), "PPp")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {schedules.length > 5 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              + {schedules.length - 5} more scheduled resets
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reset History Chart */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reset History (Last 30 Days)</CardTitle>
            <CardDescription>Daily coupon reset activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "PPP")}
                  formatter={(value, name) => [
                    value,
                    name === "reset_count" ? "Resets" : "Emails Sent",
                  ]}
                />
                <Bar dataKey="reset_count" fill="hsl(var(--primary))" name="reset_count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
