"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Share2,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Percent,
  BarChart3,
  Clock,
  Plus,
  Target,
  CreditCard,
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
import Loader from "@/components/common/dashboard/Loader";
import { getApiV1Url } from "@/lib/utils/api";

const InfluencersDashboard = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = getApiV1Url("/influencer-dashboard");
        const token = localStorage.getItem("token");
        const res = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        if (data) {
          setDashboardData(data.data || data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Influencer-specific stats
  const stats = [
    {
      name: "Total Followers",
      value:
        dashboardData?.followers !== undefined
          ? `${(dashboardData.followers / 1000).toFixed(1)}K`
          : "125K",
      icon: Users,
      change: "+8.5K",
      changeType: "positive",
      color: "blue",
      route: "/influencers/analytics",
    },
    {
      name: "Monthly Income",
      value:
        dashboardData?.monthlyEarnings !== undefined
          ? `₹${dashboardData.monthlyEarnings.toLocaleString()}`
          : "₹45,600",
      icon: DollarSign,
      change: "+12%",
      changeType: "positive",
      color: "green",
      route: "/influencers/earnings",
    },
    {
      name: "Referral Code",
      value: dashboardData?.referralCode || "WELL20",
      icon: Megaphone,
      change: "Active",
      changeType: "neutral",
      color: "purple",
      route: "/influencers/referrals",
    },
    {
      name: "Engagement Rate",
      value:
        dashboardData?.performanceMetrics?.engagement !== undefined
          ? `${dashboardData.performanceMetrics.engagement}%`
          : "4.8%",
      icon: TrendingUp,
      change: "+0.3%",
      changeType: "positive",
      color: "emerald",
      route: "/influencers/performance",
    },
    {
      name: "Total Referrals",
      value:
        dashboardData?.totalReferrals !== undefined
          ? dashboardData.totalReferrals
          : "234",
      icon: Share2,
      change: "+18",
      changeType: "positive",
      color: "orange",
      route: "/influencers/referrals",
    },
    {
      name: "Commission Rate",
      value:
        dashboardData?.commissionRate !== undefined
          ? `${dashboardData.commissionRate}%`
          : "15%",
      icon: Percent,
      change: "Premium",
      changeType: "neutral",
      color: "indigo",
      route: "/influencers/settings",
    },
  ];

  // Recent activities data
  const recentActivities = dashboardData?.recentActivities || [
    {
      id: 1,
      type: "referral_earned",
      title: "New referral earned",
      description: "Priya Sharma used your code WELL20 - ₹450 commission",
      time: "5 minutes ago",
      icon: DollarSign,
      color: "green",
    },
    {
      id: 2,
      type: "post_published",
      title: "Instagram post published",
      description: "Wellness tips post reached 12.5K views",
      time: "10 minutes ago",
      icon: Instagram,
      color: "pink",
    },
    {
      id: 3,
      type: "campaign_completed",
      title: "Campaign completed",
      description: "Protein powder promotion - 234 clicks generated",
      time: "15 minutes ago",
      icon: Target,
      color: "blue",
    },
    {
      id: 4,
      type: "payment_received",
      title: "Payment received",
      description: "Monthly commission payment - ₹12,500",
      time: "2 hours ago",
      icon: CreditCard,
      color: "emerald",
    },
    {
      id: 5,
      type: "new_follower",
      title: "New follower milestone",
      description: "Reached 125K followers on Instagram",
      time: "3 hours ago",
      icon: Users,
      color: "purple",
    },
  ];

  // Recent referrals
  const recentReferrals = dashboardData?.recentReferrals || [
    {
      name: "Priya Sharma",
      platform: "Instagram",
      amount: "₹2,500",
      commission: "₹450",
      date: "Today",
      status: "Completed",
    },
    {
      name: "Rajesh Kumar",
      platform: "YouTube",
      amount: "₹1,800",
      commission: "₹270",
      date: "Yesterday",
      status: "Completed",
    },
    {
      name: "Amit Patel",
      platform: "Facebook",
      amount: "₹3,200",
      commission: "₹480",
      date: "2 days ago",
      status: "Pending",
    },
    {
      name: "Sneha Gupta",
      platform: "Instagram",
      amount: "₹1,500",
      commission: "₹225",
      date: "3 days ago",
      status: "Completed",
    },
  ];

  // Social media performance
  const socialPerformance = dashboardData?.socialPerformance || [
    {
      platform: "Instagram",
      followers: "85K",
      engagement: "4.2%",
      posts: "12",
      revenue: "₹18,500",
    },
    {
      platform: "YouTube",
      followers: "25K",
      engagement: "6.8%",
      posts: "4",
      revenue: "₹12,300",
    },
    {
      platform: "Facebook",
      followers: "15K",
      engagement: "3.1%",
      posts: "8",
      revenue: "₹8,200",
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
      pink: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[status as keyof typeof colors] || colors["Pending"];
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      Instagram: Instagram,
      YouTube: Youtube,
      Facebook: Facebook,
      Twitter: Twitter,
    };
    return icons[platform as keyof typeof icons] || Megaphone;
  };

  if (isLoading) {
    return <Loader variant="skeleton" message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Influencer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, @{dashboardData?.username || "wellness_guru"}!
            Here&apos;s your influencer performance overview.
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
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : stat.changeType === "negative" ? (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-600 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {stat.changeType === "neutral" ? "" : "from last month"}
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
            <CardDescription>Common influencer tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={() => router.push("/influencers/campaigns")}
              >
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Create Campaign</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => router.push("/influencers/earnings")}
              >
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">View Earnings</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => router.push("/influencers/analytics")}
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950"
                onClick={() => router.push("/influencers/referrals")}
              >
                <Share2 className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Referrals</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-pink-50 dark:hover:bg-pink-950"
                onClick={() => router.push("/influencers/content")}
              >
                <Instagram className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-medium">Content</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                onClick={() => router.push("/influencers/settings")}
              >
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Recent Referrals
            </CardTitle>
            <CardDescription>
              Latest referral earnings and conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReferrals.map((referral, index) => {
                const PlatformIcon = getPlatformIcon(referral.platform);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <PlatformIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {referral.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.platform} • {referral.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {referral.commission}
                      </p>
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Social Media Performance
            </CardTitle>
            <CardDescription>Performance across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialPerformance.map((platform, index) => {
                const PlatformIcon = getPlatformIcon(platform.platform);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <PlatformIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {platform.platform}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {platform.followers} followers
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {platform.engagement} engagement
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {platform.revenue}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {platform.posts} posts
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfluencersDashboard;
