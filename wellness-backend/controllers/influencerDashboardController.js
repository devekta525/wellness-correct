import User from "../models/userModel.js";
import ReferralUsage from "../models/referralUsageModel.js";
import InfluencerActivity from "../models/influencerActivityModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const influencerId = req.user._id;

    const user = await User.findById(influencerId).select(
      "followers referralCode walletBalance engagementRate socialMediaLinks commissionRate"
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const totalReferralsCount = await ReferralUsage.countDocuments({ influencerId });
    
    const startOfMonth = new Date(new Date().setDate(1));
    const monthlyEarningsData = await ReferralUsage.aggregate([
      { 
        $match: { 
          influencerId, 
          status: "completed", 
          createdAt: { $gte: startOfMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$rewardAmount" } } }
    ]);
    const monthlyIncome = monthlyEarningsData.length > 0 ? monthlyEarningsData[0].total : 0;

    const recentReferrals = await ReferralUsage.find({ influencerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("referredUser", "name") 
      .select("referredUser rewardAmount orderAmount status createdAt platform");

    const activities = await InfluencerActivity.find({ influencerId })
      .sort({ createdAt: -1 })
      .limit(5);

    const socialPerformance = [
      {
        platform: "Instagram",
        followers: user.followers || 0,
        engagement: `${user.engagementRate || 0}%`,
        posts: 0,
        revenue: 0
      }
    ];

    const stats = [
      { 
        name: 'Total Followers', 
        value: user.followers ? `${(user.followers / 1000).toFixed(1)}K` : '0', 
        change: '+0', 
        changeType: 'neutral',
        color: 'blue'
      },
      { 
        name: 'Monthly Income', 
        value: `₹${monthlyIncome.toLocaleString()}`, 
        change: 'Active', 
        changeType: 'positive',
        color: 'green'
      },
      { 
        name: 'Referral Code', 
        value: user.referralCode || 'N/A', 
        change: 'Active', 
        changeType: 'neutral',
        color: 'purple'
      },
      { 
        name: 'Engagement Rate', 
        value: `${user.engagementRate || 0}%`, 
        change: 'Stable', 
        changeType: 'neutral',
        color: 'emerald'
      },
      { 
        name: 'Total Referrals', 
        value: totalReferralsCount, 
        change: 'Lifetime', 
        changeType: 'positive',
        color: 'orange'
      },
      { 
        name: 'Commission Rate', 
        value: `${user.commissionRate || 0}%`, 
        change: 'Standard', 
        changeType: 'neutral',
        color: 'indigo'
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivities: activities,
        recentReferrals: recentReferrals.map(ref => ({
            name: ref.referredUser?.name || "Unknown User",
            platform: ref.platform || "Direct",
            amount: `₹${ref.orderAmount}`,
            commission: `₹${ref.rewardAmount}`,
            date: new Date(ref.createdAt).toLocaleDateString(),
            status: ref.status.charAt(0).toUpperCase() + ref.status.slice(1)
        })),
        socialPerformance
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { type, title, description, color } = req.body;
    const activity = await InfluencerActivity.create({
      influencerId: req.user._id,
      type,
      title,
      description,
      color
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};