"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  DollarSign,
  Users,
  Heart,
  MessageCircle,
  Loader2,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiV1Url } from "@/lib/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const validateDateRange = (from: string, to: string): boolean => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return fromDate <= toDate && toDate <= new Date();
};

const getReportTypeDescription = (reportType: string): string => {
  const descriptions: Record<string, string> = {
    overview: "Complete overview of all metrics",
    engagement: "Engagement trends and patterns analysis",
    audience: "Detailed audience demographics and insights",
    content: "Content performance and post analysis",
    revenue: "Revenue streams and earnings breakdown",
    brands: "Brand collaboration ROI analysis",
    growth: "Follower growth and reach trends",
    conversion: "Sales and conversion metrics",
  };
  return descriptions[reportType] || "Performance metrics for selected period";
};

// Influencer Reports Page Component
const InfluencerReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterBrand, setFilterBrand] = useState("all");

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(
        getApiV1Url(`/influencer-reports/dashboard?period=${selectedPeriod}`),
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.statusText}`,
        );
      }

      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        throw new Error(result.message || "Failed to load report data");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error.message || "Failed to load report data. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Use API data if available, otherwise use dummy data
  const influencerStats = reportData?.stats || {
    totalFollowers: 125000,
    totalEngagement: 8.5,
    totalPosts: 342,
    totalRevenue: 45680,
    avgLikesPerPost: 1250,
    avgCommentsPerPost: 89,
    avgSharesPerPost: 45,
    reachRate: 12.8,
    engagementRate: 6.2,
    conversionRate: 3.8,
    brandCollaborations: 23,
    sponsoredPosts: 45,
    affiliateSales: 892,
    topPerformingPost: 15600,
    engagementGrowth: 5.2,
    revenueGrowth: 8.7,
  };

  const postPerformanceData = reportData?.postPerformanceData || [
    {
      date: "2024-01-01",
      posts: 3,
      likes: 4200,
      comments: 280,
      shares: 120,
      reach: 15000,
    },
    {
      date: "2024-01-02",
      posts: 2,
      likes: 3800,
      comments: 250,
      shares: 95,
      reach: 13500,
    },
    {
      date: "2024-01-03",
      posts: 1,
      likes: 2100,
      comments: 180,
      shares: 65,
      reach: 8500,
    },
    {
      date: "2024-01-04",
      posts: 4,
      likes: 5600,
      comments: 420,
      shares: 180,
      reach: 22000,
    },
    {
      date: "2024-01-05",
      posts: 2,
      likes: 3200,
      comments: 220,
      shares: 85,
      reach: 12000,
    },
    {
      date: "2024-01-06",
      posts: 3,
      likes: 4800,
      comments: 350,
      shares: 140,
      reach: 18000,
    },
    {
      date: "2024-01-07",
      posts: 2,
      likes: 2900,
      comments: 200,
      shares: 75,
      reach: 11000,
    },
  ];

  const audienceAnalytics = reportData?.audienceAnalytics || [
    { demographic: "18-24", count: 45000, percentage: 36.0, trend: "up" },
    { demographic: "25-34", count: 38000, percentage: 30.4, trend: "up" },
    { demographic: "35-44", count: 25000, percentage: 20.0, trend: "stable" },
    { demographic: "45-54", count: 12000, percentage: 9.6, trend: "down" },
    { demographic: "55+", count: 5000, percentage: 4.0, trend: "stable" },
  ];

  const brandCollaborations = reportData?.brandCollaborations || [
    {
      brand: "Wellness Fuel",
      posts: 8,
      revenue: 12000,
      engagement: 8.5,
      status: "active",
    },
    {
      brand: "FitLife Supplements",
      posts: 6,
      revenue: 8500,
      engagement: 7.2,
      status: "completed",
    },
    {
      brand: "Health Plus",
      posts: 5,
      revenue: 7200,
      engagement: 9.1,
      status: "active",
    },
    {
      brand: "Vitality Co",
      posts: 4,
      revenue: 6800,
      engagement: 6.8,
      status: "completed",
    },
    {
      brand: "Pure Wellness",
      posts: 3,
      revenue: 4500,
      engagement: 8.9,
      status: "pending",
    },
  ];

  const reportTypes = [
    {
      id: "overview",
      name: "Overview Report",
      description: "Complete influencer performance overview",
      icon: BarChart3,
    },
    {
      id: "engagement",
      name: "Engagement Analytics",
      description: "Engagement trends and patterns",
      icon: Heart,
    },
    {
      id: "audience",
      name: "Audience Analytics",
      description: "Follower demographics and insights",
      icon: Users,
    },
    {
      id: "content",
      name: "Content Performance",
      description: "Post performance and content analysis",
      icon: MessageCircle,
    },
    {
      id: "revenue",
      name: "Revenue Analysis",
      description: "Earnings and monetization metrics",
      icon: DollarSign,
    },
    {
      id: "brands",
      name: "Brand Collaborations",
      description: "Partnership performance and ROI",
      icon: Award,
    },
    {
      id: "growth",
      name: "Growth Tracking",
      description: "Follower growth and reach analysis",
      icon: TrendingUp,
    },
    {
      id: "conversion",
      name: "Conversion Tracking",
      description: "Sales and conversion metrics",
      icon: Target,
    },
  ];

  const exportFormats = [
    { value: "pdf", label: "PDF Report", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet", icon: BarChart3 },
    { value: "csv", label: "CSV Data", icon: FileText },
    { value: "json", label: "JSON Data", icon: FileText },
  ];

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Validate inputs
      if (!selectedReport) {
        setError("Please select a report type");
        setIsGenerating(false);
        return;
      }

      if (!exportFormat) {
        setError("Please select an export format");
        setIsGenerating(false);
        return;
      }

      // Validate date range if custom is selected
      if (selectedPeriod === "custom") {
        if (!validateDateRange(dateRange.from, dateRange.to)) {
          setError(
            "Invalid date range. End date must be after start date and not in the future.",
          );
          setIsGenerating(false);
          return;
        }
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        getApiV1Url("/influencer-reports/generate"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            reportType: selectedReport,
            format: exportFormat,
            dateRange: selectedPeriod === "custom" ? dateRange : null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Show success notification
        const successMsg = `${result.data?.reportName || "Report"} generated successfully!`;
        alert(successMsg);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        throw new Error(result.message || "Failed to generate report");
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      setError(error.message || "Failed to generate report");
      alert("Failed to generate report: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Simulate export delay (in production, this would call an actual export API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a mock download
      const exportData = {
        report: selectedReport,
        format: exportFormat,
        generatedAt: new Date().toISOString(),
        stats: influencerStats,
        period: selectedPeriod,
      };

      const fileName = `influencer-report-${selectedReport}-${new Date().getTime()}.${exportFormat === "pdf" ? "pdf" : exportFormat === "excel" ? "xlsx" : "csv"}`;

      alert(`Report exported as ${fileName}`);
    } catch (error: any) {
      console.error("Error exporting report:", error);
      setError(error.message || "Failed to export report");
      alert("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Influencer Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your influencer performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load report data: {error}. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Quick Stats with Growth Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Followers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {influencerStats.totalFollowers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {influencerStats.totalEngagement}%
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">
                    {influencerStats.engagementGrowth}%
                  </span>{" "}
                  growth
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${influencerStats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">
                    {influencerStats.revenueGrowth}%
                  </span>{" "}
                  growth
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Brand Collaborations
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {influencerStats.brandCollaborations}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active partnerships
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Customize your report parameters and export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={selectedReport}
                    onValueChange={setSelectedReport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          <div className="flex items-center gap-2">
                            <report.icon className="w-4 h-4" />
                            {report.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timePeriod">Time Period</Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {exportFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center gap-2">
                            <format.icon className="w-4 h-4" />
                            {format.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedPeriod === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <Input
                      id="toDate"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => (
              <Card
                key={report.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedReport === report.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <report.icon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm">{report.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {report.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                Preview of your selected report with current data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Post Performance Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Post Performance Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {postPerformanceData
                            .slice(-5)
                            .map(
                              (
                                day: (typeof postPerformanceData)[0],
                                index: number,
                              ) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {new Date(day.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {day.posts} posts
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {day.likes.toLocaleString()} likes
                                    </p>
                                    <p className="text-sm text-green-600">
                                      {day.reach.toLocaleString()} reach
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Audience Demographics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Audience Demographics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {audienceAnalytics.map(
                            (
                              demo: (typeof audienceAnalytics)[0],
                              index: number,
                            ) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <span className="font-medium">
                                    {demo.demographic}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {demo.count.toLocaleString()}
                                  </span>
                                  <Badge variant="outline">
                                    {demo.percentage}%
                                  </Badge>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Brand Collaborations */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Brand Collaborations
                          </CardTitle>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">By Date</SelectItem>
                              <SelectItem value="revenue">
                                By Revenue
                              </SelectItem>
                              <SelectItem value="engagement">
                                By Engagement
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {brandCollaborations
                            .sort(
                              (
                                a: (typeof brandCollaborations)[0],
                                b: (typeof brandCollaborations)[0],
                              ) => {
                                if (sortBy === "revenue")
                                  return b.revenue - a.revenue;
                                if (sortBy === "engagement")
                                  return b.engagement - a.engagement;
                                return 0;
                              },
                            )
                            .map(
                              (
                                collab: (typeof brandCollaborations)[0],
                                index: number,
                              ) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {collab.brand}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {collab.posts} posts • {collab.engagement}
                                      % engagement
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      ${collab.revenue.toLocaleString()}
                                    </p>
                                    <Badge
                                      variant={
                                        collab.status === "active"
                                          ? "default"
                                          : collab.status === "completed"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {collab.status}
                                    </Badge>
                                  </div>
                                </div>
                              ),
                            )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Content Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Avg. Likes per Post
                            </span>
                            <Badge variant="secondary">
                              {influencerStats.avgLikesPerPost.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Avg. Comments per Post
                            </span>
                            <Badge variant="secondary">
                              {influencerStats.avgCommentsPerPost}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Avg. Shares per Post
                            </span>
                            <Badge variant="secondary">
                              {influencerStats.avgSharesPerPost}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Reach Rate</span>
                            <Badge variant="default">
                              {influencerStats.reachRate}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Conversion Rate</span>
                            <Badge variant="default">
                              {influencerStats.conversionRate}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="charts" className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      To enable interactive charts, install recharts:{" "}
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        npm install recharts
                      </code>
                      . This will provide real-time visualization of your
                      engagement trends and performance metrics.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Engagement Trend
                        </CardTitle>
                        <CardDescription>
                          Likes, comments, and shares over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded-lg">
                          <div className="text-center">
                            <LineChart className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Engagement Trend Chart</p>
                            <p className="text-xs mt-1">
                              Install recharts to view
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Audience Distribution
                        </CardTitle>
                        <CardDescription>
                          Follower demographics breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/50 rounded-lg">
                          <div className="text-center">
                            <PieChart className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Audience Demographics</p>
                            <p className="text-xs mt-1">
                              Install recharts to view
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Options</CardTitle>
                        <CardDescription>
                          Choose your preferred export format and settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Export Format</Label>
                          <Select
                            value={exportFormat}
                            onValueChange={setExportFormat}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {exportFormats.map((format) => (
                                <SelectItem
                                  key={format.value}
                                  value={format.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <format.icon className="w-4 h-4" />
                                    {format.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Include Charts</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="includeCharts"
                              defaultChecked
                            />
                            <Label htmlFor="includeCharts" className="text-sm">
                              Include visual charts and graphs
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Include Raw Data</Label>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="includeRawData" />
                            <Label htmlFor="includeRawData" className="text-sm">
                              Include detailed data tables
                            </Label>
                          </div>
                        </div>

                        <Button
                          onClick={handleExportReport}
                          disabled={isExporting}
                          className="w-full"
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Exporting Report...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Export Report
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Export History</CardTitle>
                        <CardDescription>
                          Your recent report exports
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                Engagement Report - Jan 2024
                              </p>
                              <p className="text-sm text-muted-foreground">
                                PDF • 2.3 MB
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                Audience Analytics - Dec 2023
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Excel • 1.8 MB
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                Revenue Report - Nov 2023
                              </p>
                              <p className="text-sm text-muted-foreground">
                                PDF • 3.1 MB
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InfluencerReportsPage;
