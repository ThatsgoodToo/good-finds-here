import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MetricsChartProps {
  metric: string;
  onClose: () => void;
}

const MetricsChart = ({ metric, onClose }: MetricsChartProps) => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<Array<{ name: string; value: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        if (metric === "sales") {
          // Get coupon usage over time
          const { data: coupons } = await supabase
            .from("coupons")
            .select("id")
            .eq("vendor_id", user.id);

          if (coupons && coupons.length > 0) {
            const { data: usage } = await supabase
              .from("coupon_usage")
              .select("used_at")
              .in("coupon_id", coupons.map(c => c.id))
              .order("used_at", { ascending: true });

            if (usage) {
              // Calculate weekly data (last 7 days)
              const now = new Date();
              const weekData = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (6 - i));
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const count = usage.filter(u => {
                  const usedDate = new Date(u.used_at);
                  return usedDate.toDateString() === date.toDateString();
                }).length;
                return { name: dayName, value: count };
              });
              setWeeklyData(weekData);

              // Calculate monthly data (last 4 weeks)
              const monthData = Array.from({ length: 4 }, (_, i) => {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - ((3 - i) * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const count = usage.filter(u => {
                  const usedDate = new Date(u.used_at);
                  return usedDate >= weekStart && usedDate <= weekEnd;
                }).length;
                return { name: `Week ${i + 1}`, value: count };
              });
              setMonthlyData(monthData);
            }
          }
        } else if (metric === "followers") {
          // Get followers over time
          const { data: followers } = await supabase
            .from("followers")
            .select("created_at")
            .eq("vendor_id", user.id)
            .order("created_at", { ascending: true });

          if (followers) {
            // Calculate weekly data
            const now = new Date();
            const weekData = Array.from({ length: 7 }, (_, i) => {
              const date = new Date(now);
              date.setDate(date.getDate() - (6 - i));
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
              const count = followers.filter(f => {
                const createdDate = new Date(f.created_at);
                return createdDate.toDateString() === date.toDateString();
              }).length;
              return { name: dayName, value: count };
            });
            setWeeklyData(weekData);

            // Calculate monthly data
            const monthData = Array.from({ length: 4 }, (_, i) => {
              const weekStart = new Date(now);
              weekStart.setDate(weekStart.getDate() - ((3 - i) * 7));
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              const count = followers.filter(f => {
                const createdDate = new Date(f.created_at);
                return createdDate >= weekStart && createdDate <= weekEnd;
              }).length;
              return { name: `Week ${i + 1}`, value: count };
            });
            setMonthlyData(monthData);
          }
        } else {
          // For clicks and offers, use demo data as we don't have time-series tracking yet
          setWeeklyData([
            { name: "Mon", value: 0 },
            { name: "Tue", value: 0 },
            { name: "Wed", value: 0 },
            { name: "Thu", value: 0 },
            { name: "Fri", value: 0 },
            { name: "Sat", value: 0 },
            { name: "Sun", value: 0 },
          ]);
          setMonthlyData([
            { name: "Week 1", value: 0 },
            { name: "Week 2", value: 0 },
            { name: "Week 3", value: 0 },
            { name: "Week 4", value: 0 },
          ]);
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [user, metric]);

  const yearlyData = [
    { name: "Jan", value: 0 },
    { name: "Feb", value: 0 },
    { name: "Mar", value: 0 },
    { name: "Apr", value: 0 },
    { name: "May", value: 0 },
    { name: "Jun", value: 0 },
    { name: "Jul", value: 0 },
    { name: "Aug", value: 0 },
    { name: "Sep", value: 0 },
    { name: "Oct", value: 0 },
    { name: "Nov", value: 0 },
    { name: "Dec", value: 0 },
  ];

  const getMetricTitle = () => {
    switch (metric) {
      case "clicks": return "Clicks to Your Site";
      case "sales": return "Sales via Referrals";
      case "offers": return "Active Offers";
      case "followers": return "Your Hi Fives (Followers)";
      default: return "Metrics";
    }
  };

  return (
    <Card className="fixed top-24 left-4 right-4 bottom-4 z-50 overflow-auto bg-background shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getMetricTitle()}</CardTitle>
            <CardDescription>Track your performance over time</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MetricsChart;
