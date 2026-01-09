"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { usePayments } from "@/lib/hooks/use-payments";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useTables } from "@/lib/hooks/use-tables";
import { useMemo } from "react";
import { PageSkeleton } from "@/components/loaders/page-skeleton";

export default function ReportsPage() {
  const { toast } = useToast();
  const { payments, isLoading: paymentsLoading } = usePayments();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const { tables, isLoading: tablesLoading } = useTables();

  // Calculate daily revenue from last 7 days
  const dailyRevenue = useMemo(() => {
    if (!payments) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: payments
        .filter(p => p.createdAt.startsWith(date) && p.status === "PAID")
        .reduce((sum, p) => sum + p.total, 0),
    }));
  }, [payments]);

  // Calculate table usage from bookings
  const tableUsage = useMemo(() => {
    if (!bookings || !tables) return [];

    const usageMap = new Map<
      string,
      { tableName: string; usageCount: number }
    >();

    bookings.forEach(booking => {
      const table = tables.find(t => t.id === booking.tableId);
      if (table) {
        const current = usageMap.get(table.id) || {
          tableName: table.code,
          usageCount: 0,
        };
        usageMap.set(table.id, {
          ...current,
          usageCount: current.usageCount + 1,
        });
      }
    });

    return Array.from(usageMap.values()).sort(
      (a, b) => b.usageCount - a.usageCount
    );
  }, [bookings, tables]);

  // Weekly bookings trend
  const weeklyBookings = useMemo(() => {
    if (!bookings) return [];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);

    bookings.forEach(booking => {
      const dayOfWeek = new Date(booking.startTime).getDay();
      counts[dayOfWeek]++;
    });

    return daysOfWeek.map((day, index) => ({
      day,
      bookings: counts[index],
    }));
  }, [bookings]);

  // Table type distribution
  const tableTypeDistribution = useMemo(() => {
    if (!tables) return [];

    const typeCounts = tables.reduce((acc, table) => {
      acc[table.type] = (acc[table.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [tables]);

  if (paymentsLoading || bookingsLoading || tablesLoading) {
    return <PageSkeleton />;
  }

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "CSV file is being generated",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Business insights and performance metrics
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Daily Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [
                    `${value.toLocaleString()}đ`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Top 3 Most Used Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tableUsage.slice(0, 3)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="tableName"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`${value} bookings`, "Usage"]}
                />
                <Bar
                  dataKey="usageCount"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Weekly Booking Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Table Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tableTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tableTypeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Avg Revenue/Day
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {dailyRevenue.length > 0
                ? (
                    dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) /
                    dailyRevenue.length
                  ).toLocaleString("vi-VN", { maximumFractionDigits: 0 })
                : "0"}
              đ
            </div>
            <div className="text-xs text-emerald-500 mt-1">Last 7 days</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total Bookings
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {bookings?.length || 0}
            </div>
            <div className="text-xs text-blue-500 mt-1">All time</div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total Tables
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {tables?.length || 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active tables
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total Revenue
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(
                payments
                  ?.filter(p => p.status === "PAID")
                  .reduce((sum, p) => sum + p.total, 0) || 0
              ).toLocaleString()}
              đ
            </div>
            <div className="text-xs text-emerald-500 mt-1">All time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
