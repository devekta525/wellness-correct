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
  ArrowUpRight,
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
        const token = localStorage.getItem("authToken");
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
      blue: "bg-blue-50 text-blue-600 border border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      purple: "bg-purple-50 text-purple-600 border border-purple-100",
      green: "bg-green-50 text-green-600 border border-green-100",
      orange: "bg-orange-50 text-orange-600 border border-orange-100",
      indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      yellow: "bg-yellow-50 text-yellow-600 border border-yellow-100",
      pink: "bg-pink-50 text-pink-600 border border-pink-100",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Active: "bg-blue-100 text-blue-800 border border-blue-200",
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Influencer Active</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Influencer Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Welcome back, @{dashboardData?.username || "wellness_guru"}!
            Here&apos;s your influencer performance overview.
          </p>
        </div>
        <Button
          onClick={() => router.push("/influencers/referrals")}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-xl px-5 shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          View Referrals
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="group hover:shadow-md transition-all duration-300 cursor-pointer border-slate-200 bg-white"
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {stat.name}
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.changeType === "positive"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                        }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 ${getColorClasses(stat.color)}`}>
                    <Icon className="w-4 h-4" />
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
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="font-medium">Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity: any) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${getColorClasses(activity.color)} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
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
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Plus className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="font-medium">Common influencer tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-purple-50 hover:border-purple-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/campaigns")}
              >
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Create Campaign</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-green-50 hover:border-green-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/earnings")}
              >
                <div className="p-2.5 rounded-lg bg-green-50 text-green-600 border border-green-100">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">View Earnings</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-blue-50 hover:border-blue-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/analytics")}
              >
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-orange-50 hover:border-orange-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/referrals")}
              >
                <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Referrals</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-pink-50 hover:border-pink-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/content")}
              >
                <div className="p-2.5 rounded-lg bg-pink-50 text-pink-600 border border-pink-100">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Content</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-100 transition-all hover:shadow-sm"
                onClick={() => router.push("/influencers/settings")}
              >
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Megaphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-600">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Share2 className="w-5 h-5 text-purple-600" />
              Recent Referrals
            </CardTitle>
            <CardDescription className="font-medium">
              Latest referral earnings and conversions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentReferrals.map((referral: any, index: number) => {
                const PlatformIcon = getPlatformIcon(referral.platform);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                        <PlatformIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {referral.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {referral.platform} • {referral.amount}
                        </p>
                        <p className="text-xs text-slate-400">
                          {referral.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {referral.commission}
                      </p>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Performance */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Social Media Performance
            </CardTitle>
            <CardDescription className="font-medium">Performance across all platforms</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {socialPerformance.map((platform: any, index: number) => {
                const PlatformIcon = getPlatformIcon(platform.platform);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <PlatformIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {platform.platform}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {platform.followers} followers
                        </p>
                        <p className="text-xs text-slate-400">
                          {platform.engagement} engagement
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {platform.revenue}
                      </p>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {platform.posts} posts
                      </span>
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
