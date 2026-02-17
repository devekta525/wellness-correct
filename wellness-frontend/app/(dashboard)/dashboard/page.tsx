"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
            localStorage.getItem("token") ||
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
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      emerald:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400",
      purple:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      green:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      orange:
        "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
      indigo:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400",
      yellow:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s what&apos;s happening with your wellness
            platform.
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
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === "positive" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}
                  >
                    <Icon className="w-6 h-6" />
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${getColorClasses(activity.color)} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => router.push("/dashboard/users")}
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Add User</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => router.push("/dashboard/products")}
              >
                <Package className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Add Product</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={() => router.push("/dashboard/leads")}
              >
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">View Leads</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950"
                onClick={() => router.push("/dashboard/orders")}
              >
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">View Orders</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => router.push("/dashboard/doctors")}
              >
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium">Add Doctor</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                onClick={() => router.push("/dashboard/influencers")}
              >
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium">Add Influencer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>Platform health and notifications</CardDescription>
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

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(DashboardPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  ),
});
