"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Gift,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApiV1Url } from "@/lib/utils/api";

// Types
interface ReferralCode {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "product";
  value: number;
  maxUses: number | null;
  currentUses: number;
  status: "active" | "inactive" | "expired";
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalEarnings: number;
  lastUsed: string | null;
}

interface ReferralUsage {
  id: string;
  referralCode: string;
  referredUser: string;
  referredUserEmail: string;
  referredUserPhone: string;
  rewardAmount: number;
  status: "pending" | "completed" | "cancelled";
  usedAt: string;
  completedAt: string | null;
  notes: string;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
  conversionRate: number;
  avgCommission: number;
}

interface ReferralData {
  referralCode: string;
  commissionRate: number;
  stats: ReferralStats;
  usageHistory: ReferralUsage[];
}

const ReferralsPage = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedReferral] = useState<ReferralCode | null>(null);

  // Fetch referral data from backend
  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiV1Url("/influencer-referrals/dashboard");

      const response = await fetch(apiUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        console.error(`API Error: ${response.status}`, errorData);

        if (response.status === 401) {
          setError("Please log in to access referral data.");
        } else if (response.status === 403) {
          setError("Access denied. Influencer role required.");
        } else if (response.status === 404) {
          setError("Referral service not found. Please contact support.");
        } else {
          setError(errorData.message || `Error: ${response.status}`);
        }
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setReferralData(result.data);
        setError(null);
      } else {
        console.error("API returned unsuccessful response:", result);
        setError(result.message || "Failed to load referral data");
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      setError(
        "Network error. Please check your connection and backend server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getUsageStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getReferralUsage = (code: string) => {
    return (
      referralData?.usageHistory.filter(
        (usage) => usage.referralCode === code,
      ) || []
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !referralData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Users className="w-16 h-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">
            {error || "No referral data available"}
          </p>
          <p className="text-sm text-muted-foreground">
            {!error && "Your referral code will be generated automatically."}
          </p>
        </div>
        <Button onClick={fetchReferralData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Referral Code
            </h1>
            <p className="text-muted-foreground">
              Track your referral code performance and earnings
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export referral data</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={fetchReferralData}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* My Referral Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Share this code with others to earn commission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-lg border-2 border-dashed border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your unique referral code:
                </p>
                <p className="text-3xl font-bold font-mono text-primary">
                  {referralData.referralCode}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Earn {referralData.commissionRate}% commission for each
                  successful referral
                </p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => copyToClipboard(referralData.referralCode)}
                      className="gap-2"
                      size="lg"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy your referral code</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {referralData.stats.totalReferrals}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {referralData.stats.completedReferrals} completed
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Commission
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{referralData.stats.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time earnings
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {referralData.stats.conversionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {referralData.stats.pendingReferrals} pending
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Commission
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{referralData.stats.avgCommission}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per successful referral
                  </p>
                </div>
                <Gift className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Usage Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Usage History</CardTitle>
            <CardDescription>
              Track all users who used your referral code and their commission
              details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Commission Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralData.usageHistory.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {usage.referredUser}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {usage.referredUserEmail}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {usage.referredUserPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      ₹{usage.rewardAmount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getUsageStatusColor(usage.status) as
                            | "default"
                            | "secondary"
                            | "outline"
                        }
                      >
                        {usage.status.charAt(0).toUpperCase() +
                          usage.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(usage.usedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {usage.completedAt
                        ? new Date(usage.completedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {usage.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {referralData.usageHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No referral usage found yet.</p>
                <p className="text-sm mt-2">
                  Share your referral code to get started!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Modal */}
        <Dialog open={showUsageModal} onOpenChange={setShowUsageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Referral Code Usage - {selectedReferral?.code}
              </DialogTitle>
              <DialogDescription>
                View all usage details for the referral code &quot;
                {selectedReferral?.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Uses
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedReferral?.currentUses || 0}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{selectedReferral?.totalEarnings || 0}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Used
                        </p>
                        <p className="text-sm font-medium">
                          {selectedReferral?.lastUsed
                            ? new Date(
                                selectedReferral.lastUsed,
                              ).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage History</CardTitle>
                  <CardDescription>
                    Detailed history of all uses of this referral code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Reward Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used At</TableHead>
                        <TableHead>Completed At</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getReferralUsage(selectedReferral?.code || "").map(
                        (usage) => (
                          <TableRow key={usage.id}>
                            <TableCell className="font-medium">
                              {usage.referredUser}
                            </TableCell>
                            <TableCell>{usage.referredUserEmail}</TableCell>
                            <TableCell>{usage.referredUserPhone}</TableCell>
                            <TableCell className="font-medium">
                              ₹{usage.rewardAmount}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getUsageStatusColor(usage.status) as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                }
                              >
                                {usage.status.charAt(0).toUpperCase() +
                                  usage.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(usage.usedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {usage.completedAt
                                ? new Date(
                                    usage.completedAt,
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {usage.notes}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                  {getReferralUsage(selectedReferral?.code || "").length ===
                    0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No usage history found for this referral code.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUsageModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default ReferralsPage;
