import InfluencerMetric from "../models/influencerMetricModel.js";
import BrandCollaboration from "../models/brandCollaborationModel.js";
import AudienceInsight from "../models/audienceInsightModel.js";
import ReportLog from "../models/reportLogModel.js";
import User from "../models/userModel.js";

// Helper function to calculate date range
const getDateRange = (period) => {
  const dateLimit = new Date();
  const endDate = new Date();

  if (period === "7d") dateLimit.setDate(dateLimit.getDate() - 7);
  else if (period === "90d") dateLimit.setDate(dateLimit.getDate() - 90);
  else if (period === "1y") dateLimit.setFullYear(dateLimit.getFullYear() - 1);
  else dateLimit.setDate(dateLimit.getDate() - 30);

  return { startDate: dateLimit, endDate };
};

// Helper function to calculate comprehensive metrics
const calculateMetrics = (metrics, collaborations, totalFollowers) => {
  if (metrics.length === 0) {
    return {
      totalFollowers,
      totalEngagement: 0,
      totalPosts: 0,
      totalRevenue: 0,
      avgLikesPerPost: 0,
      avgCommentsPerPost: 0,
      avgSharesPerPost: 0,
      reachRate: 0,
      conversionRate: 0,
      brandCollaborations: collaborations.length,
      engagementGrowth: 0,
      revenueGrowth: 0
    };
  }

  const totalLikes = metrics.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = metrics.reduce((acc, curr) => acc + (curr.comments || 0), 0);
  const totalShares = metrics.reduce((acc, curr) => acc + (curr.shares || 0), 0);
  const totalPosts = metrics.reduce((acc, curr) => acc + (curr.postsCount || 1), 0);
  const totalReach = metrics.reduce((acc, curr) => acc + (curr.reach || 0), 0);
  const totalMetricRevenue = metrics.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const collaborationRevenue = collaborations.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalRevenue = totalMetricRevenue + collaborationRevenue;

  // Calculate engagement rate: (likes + comments + shares) / (posts * followers)
  const totalEngagements = totalLikes + totalComments + totalShares;
  const engagementRate = totalFollowers > 0
    ? (totalEngagements / (totalPosts * totalFollowers)) * 100
    : 0;

  // Calculate reach rate
  const reachRate = totalPosts > 0 ? (totalReach / (totalPosts * totalFollowers)) * 100 : 0;

  // Calculate conversion rate (revenue based)
  const conversionRate = totalReach > 0 ? (totalRevenue / totalReach) * 100 : 0;

  // Calculate growth metrics (compare first half vs second half)
  const midPoint = Math.floor(metrics.length / 2);
  const firstHalf = metrics.slice(0, midPoint);
  const secondHalf = metrics.slice(midPoint);

  const firstHalfEngagement = firstHalf.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const secondHalfEngagement = secondHalf.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const engagementGrowth = firstHalfEngagement > 0
    ? ((secondHalfEngagement - firstHalfEngagement) / firstHalfEngagement) * 100
    : 0;

  const firstHalfRevenue = firstHalf.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const secondHalfRevenue = secondHalf.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const revenueGrowth = firstHalfRevenue > 0
    ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
    : 0;

  return {
    totalFollowers,
    totalEngagement: parseFloat(engagementRate.toFixed(2)),
    totalPosts,
    totalRevenue,
    avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
    avgCommentsPerPost: totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0,
    avgSharesPerPost: totalPosts > 0 ? Math.round(totalShares / totalPosts) : 0,
    reachRate: parseFloat(reachRate.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    brandCollaborations: collaborations.length,
    engagementGrowth: parseFloat(engagementGrowth.toFixed(2)),
    revenueGrowth: parseFloat(revenueGrowth.toFixed(2))
  };
};

export const getReportDashboardData = async (req, res) => {
  try {
    const influencerId = req.user._id;
    const { period = "30d" } = req.query;

    if (!influencerId) {
      return res.status(400).json({ success: false, message: "Influencer ID is required" });
    }

    const { startDate, endDate } = getDateRange(period);

    // Fetch all required data in parallel
    const [metrics, collaborations, audience, user] = await Promise.all([
      InfluencerMetric.find({
        influencerId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }),
      BrandCollaboration.find({ influencerId }).select("brandName postsCount revenue engagementRate status"),
      AudienceInsight.find({ influencerId, demographicType: "age" }).select("label count percentage trend"),
      User.findById(influencerId).select("followers").catch(() => User.findById(influencerId).select("followers"))
    ]);

    const totalFollowers = user?.followers || 0;
    const stats = calculateMetrics(metrics, collaborations, totalFollowers);

    // Transform metrics for frontend chart display
    const postPerformanceData = metrics.map(m => ({
      date: m.date.toISOString().split('T')[0],
      posts: m.postsCount || 0,
      likes: m.likes || 0,
      comments: m.comments || 0,
      shares: m.shares || 0,
      reach: m.reach || 0,
      revenue: m.revenue || 0
    }));

    // Transform audience for frontend display
    const audienceAnalytics = audience.map(a => ({
      demographic: a.label || a.demographicType,
      count: a.count || 0,
      percentage: a.percentage || 0,
      trend: a.trend || 'stable'
    }));

    // Transform collaborations for frontend display
    const collaborationsData = collaborations.map(c => ({
      brand: c.brandName || "Unknown",
      posts: c.postsCount || 0,
      revenue: c.revenue || 0,
      engagement: c.engagementRate || 0,
      status: c.status || 'pending'
    }));

    res.status(200).json({
      success: true,
      data: {
        stats,
        postPerformanceData,
        audienceAnalytics,
        brandCollaborations: collaborationsData,
        period,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error fetching report dashboard data:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch report data" });
  }
};

export const getReportHistory = async (req, res) => {
  try {
    const influencerId = req.user._id;

    if (!influencerId) {
      return res.status(400).json({ success: false, message: "Influencer ID is required" });
    }

    const logs = await ReportLog.find({ influencerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: logs.map(log => ({
        id: log._id,
        reportName: log.reportName,
        reportType: log.reportType,
        format: log.format,
        fileSize: log.fileSize,
        generatedAt: log.createdAt,
        status: 'completed'
      }))
    });
  } catch (error) {
    console.error("Error fetching report history:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch report history" });
  }
};

export const generateReport = async (req, res) => {
  try {
    const influencerId = req.user._id;
    const { reportType, format, dateRange } = req.body;

    if (!reportType || !format) {
      return res.status(400).json({ success: false, message: "Report type and format are required" });
    }

    // Create report log entry
    const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`;

    const newLog = await ReportLog.create({
      influencerId,
      reportName,
      reportType,
      format: format.toUpperCase(),
      fileSize: "2.1 MB",
      url: `/api/v1/reports/download/${Date.now()}`,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      data: {
        id: newLog._id,
        reportName: newLog.reportName,
        reportType: newLog.reportType,
        format: newLog.format,
        fileSize: newLog.fileSize,
        generatedAt: newLog.createdAt,
        downloadUrl: newLog.url
      }
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to generate report" });
  }
};

// Dummy Data Seeder for Testing
export const seedDummyData = async (req, res) => {
  try {
    const influencerId = req.user._id;

    if (!influencerId) {
      return res.status(400).json({ success: false, message: "Influencer ID is required" });
    }

    // Clear existing test data
    await Promise.all([
      InfluencerMetric.deleteMany({ influencerId }),
      BrandCollaboration.deleteMany({ influencerId }),
      AudienceInsight.deleteMany({ influencerId })
    ]);

    // Generate realistic metric data for 30 days
    const metrics = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      metrics.push({
        influencerId,
        date: d,
        postsCount: Math.floor(Math.random() * 5) + 1,
        likes: Math.floor(Math.random() * 5000) + 1000,
        comments: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 200) + 10,
        reach: Math.floor(Math.random() * 25000) + 8000,
        revenue: Math.floor(Math.random() * 500) + 50
      });
    }
    await InfluencerMetric.insertMany(metrics);

    // Create diverse brand collaborations
    const brands = [
      { brandName: "Wellness Fuel", postsCount: 8, revenue: 12000, engagementRate: 8.5, status: "active" },
      { brandName: "FitLife Supplements", postsCount: 6, revenue: 8500, engagementRate: 7.2, status: "completed" },
      { brandName: "Health Plus", postsCount: 5, revenue: 7200, engagementRate: 9.1, status: "active" },
      { brandName: "Vitality Co", postsCount: 4, revenue: 6800, engagementRate: 6.8, status: "completed" },
      { brandName: "Pure Wellness", postsCount: 3, revenue: 4500, engagementRate: 8.9, status: "pending" }
    ];

    await BrandCollaboration.insertMany(
      brands.map(b => ({ ...b, influencerId }))
    );

    // Create comprehensive audience demographics
    const demographics = [
      { influencerId, demographicType: "age", label: "18-24", count: 45000, percentage: 36.0, trend: "up" },
      { influencerId, demographicType: "age", label: "25-34", count: 38000, percentage: 30.4, trend: "up" },
      { influencerId, demographicType: "age", label: "35-44", count: 25000, percentage: 20.0, trend: "stable" },
      { influencerId, demographicType: "age", label: "45-54", count: 12000, percentage: 9.6, trend: "down" },
      { influencerId, demographicType: "age", label: "55+", count: 5000, percentage: 4.0, trend: "stable" }
    ];

    await AudienceInsight.insertMany(demographics);

    res.status(200).json({
      success: true,
      message: "Dummy data seeded successfully",
      data: {
        metricsCount: metrics.length,
        brandsCount: brands.length,
        demographicsCount: demographics.length
      }
    });
  } catch (error) {
    console.error("Error seeding dummy data:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to seed data" });
  }
};