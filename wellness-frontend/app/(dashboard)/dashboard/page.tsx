"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Package,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Activity,
  Stethoscope,
  Megaphone,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApiV1Url } from "@/lib/utils/api";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";

const DashboardPage = () => {
  const router = useRouter();
  const [productCount, setProductCount] = useState("0");
  const [orderCount, setOrderCount] = useState("0");
  const [userCount, setUserCount] = useState("0");
  const [doctorCount, setDoctorCount] = useState("0");
  const [influencerCount, setInfluencerCount] = useState("0");
  const [customerCount, setCustomerCount] = useState("0");
  const [contactCount, setContactCount] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        let token = "";
        if (typeof window !== "undefined") {
          token =
            localStorage.getItem("authToken") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken") ||
            "";
          token = token.replace(/^"|"$/g, "");
        }

        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        // Helper function to handle fetch errors gracefully
        const fetchWithLogging = async (url: string, label: string) => {
          try {
            const res = await fetch(url, { headers, credentials: "include" });
            if (!res.ok) {
              console.error(`${label} API Error: ${res.status} ${res.statusText}`);
              return { success: false };
            }
            return await res.json();
          } catch (error) {
            console.error(`${label} Fetch Error:`, error);
            return { success: false };
          }
        };

        const [
          productData,
          orderData,
          userData,
          doctorData,
          influencerData,
          customerData,
          contactData,
        ] = await Promise.all([
          fetchWithLogging(getApiV1Url("/products/count"), "Products"),
          fetchWithLogging(getApiV1Url("/orders/admin/count"), "Orders"),
          fetchWithLogging(getApiV1Url("/users/count"), "Users"),
          fetchWithLogging(getApiV1Url("/doctor/admin/count"), "Doctors"),
          fetchWithLogging(getApiV1Url("/influencer/admin/count"), "Influencers"),
          fetchWithLogging(getApiV1Url("/users/customer/admin/count"), "Customers"),
          fetchWithLogging(getApiV1Url("/contacts/admin/count"), "Contacts"),
        ]);

        if (productData.success) setProductCount(productData.count.toString());
        if (orderData.success || orderData.count !== undefined) {
          setOrderCount((orderData.count || 0).toString());
        }
        if (userData.success) setUserCount(userData.total.toString());
        if (doctorData.success) setDoctorCount(doctorData.count.toString());
        if (influencerData.success) setInfluencerCount(influencerData.count.toString());
        if (customerData.success) setCustomerCount(customerData.count.toString());
        if (contactData.success) setContactCount(contactData.count.toString());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <Loader variant="skeleton" message="Loading dashboard..." />;
  }

  if (error) {
    return <Error title="Dashboard Error" message={error} />;
  }

  // Enhanced stats with more detailed information
  const stats = [
    {
      name: "Total Users",
      value: userCount,
      icon: Users,
      change: "+12%",
      changeType: "positive",
      color: "blue",
      route: "/dashboard/users",
    },
    {
      name: "Doctors",
      value: doctorCount,
      icon: Stethoscope,
      change: "+8%",
      changeType: "positive",
      color: "emerald",
      route: "/dashboard/doctors",
    },
    {
      name: "Influencers",
      value: influencerCount,
      icon: Megaphone,
      change: "+15%",
      changeType: "positive",
      color: "purple",
      route: "/dashboard/influencers",
    },
    {
      name: "Customers",
      value: customerCount,
      icon: UserCheck,
      change: "+18%",
      changeType: "positive",
      color: "green",
      route: "/dashboard/customers",
    },
    {
      name: "Products",
      value: productCount,
      icon: Package,
      change: "+5%",
      changeType: "positive",
      color: "orange",
      route: "/dashboard/products",
    },
    {
      name: "Orders",
      value: orderCount,
      icon: ShoppingCart,
      change: "+18%",
      changeType: "positive",
      color: "indigo",
      route: "/dashboard/orders",
    },
    {
      name: "Revenue",
      value: "₹45,67,890",
      icon: IndianRupee,
      change: "+12%",
      changeType: "positive",
      color: "green",
      route: "/dashboard/reports",
    },
    {
      name: "Leads",
      value: contactCount,
      icon: TrendingUp,
      change: "+23%",
      changeType: "positive",
      color: "yellow",
      route: "/dashboard/leads",
    },
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: "user_registered",
      title: "New user registered",
      description: "Priya Sharma joined the platform",
      time: "2 minutes ago",
      icon: Users,
      color: "green",
    },
    {
      id: 2,
      type: "order_placed",
      title: "New order placed",
      description: "Order #12345 for ₹2,500",
      time: "5 minutes ago",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      id: 3,
      type: "lead_generated",
      title: "New lead generated",
      description: "Lead from Instagram campaign",
      time: "10 minutes ago",
      icon: TrendingUp,
      color: "yellow",
    },
    {
      id: 4,
      type: "doctor_joined",
      title: "New doctor joined",
      description: "Dr. Rajesh Kumar - Cardiology",
      time: "15 minutes ago",
      icon: Stethoscope,
      color: "emerald",
    },
    {
      id: 5,
      type: "influencer_signed",
      title: "Influencer signed up",
      description: "Wellness influencer with 50K followers",
      time: "20 minutes ago",
      icon: Megaphone,
      color: "purple",
    },
  ];

  // Top performing items
  const topPerformers = [
    {
      name: "Premium Protein Powder",
      sales: 245,
      revenue: "₹1,22,500",
      growth: "+15%",
    },
    {
      name: "Vitamin D3 Capsules",
      sales: 189,
      revenue: "₹94,500",
      growth: "+12%",
    },
    { name: "Omega-3 Fish Oil", sales: 156, revenue: "₹78,000", growth: "+8%" },
    {
      name: "Multivitamin Complex",
      sales: 134,
      revenue: "₹67,000",
      growth: "+6%",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      purple: "bg-purple-50 text-purple-600 border border-purple-100",
      green: "bg-green-50 text-green-600 border border-green-100",
      orange: "bg-orange-50 text-orange-600 border border-orange-100",
      indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      yellow: "bg-yellow-50 text-yellow-600 border border-yellow-100",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Welcome back! Here&apos;s what&apos;s happening with your wellness platform.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="group hover:shadow-md transition-all duration-300 cursor-pointer border-slate-200 bg-white"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-3">
                      <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mr-2
                        ${stat.changeType === "positive"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                        {stat.changeType === "positive" ? (
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        )}
                        {stat.change}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${getColorClasses(stat.color)}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="font-medium">Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${getColorClasses(activity.color)} flex items-center justify-center transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Plus className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="font-medium">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/users?action=add")}
              >
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Add User</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-green-50 hover:border-green-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/products?action=add")}
              >
                <div className="p-2.5 rounded-lg bg-green-50 text-green-600 border border-green-100">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Add Product</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-purple-50 hover:border-purple-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/leads")}
              >
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">View Leads</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-orange-50 hover:border-orange-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/orders")}
              >
                <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">View Orders</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-emerald-50 hover:border-emerald-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/doctors")}
              >
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Add Doctor</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/dashboard/influencers")}
              >
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Megaphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Add Influencer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Performing Products
            </CardTitle>
            <CardDescription className="font-medium">Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {product.revenue}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {product.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Bell className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
            <CardDescription className="font-medium">Platform health and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      System Online
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All services running
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Database
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Response time: 45ms
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  Optimal
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      API Rate Limit
                    </p>
                    <p className="text-xs text-muted-foreground">
                      85% of limit used
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >
                  Warning
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Backup Status
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last backup: 2 hours ago
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  Updated
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
