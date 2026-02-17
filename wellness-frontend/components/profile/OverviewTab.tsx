"use client";

import React from "react";
import { User, Activity, Calendar, Clock, Package, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserType } from "@/lib/redux/features/authSlice";

interface RecentActivity {
  id: string;
  type: "order" | "appointment" | "prescription" | "profile_update";
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface OverviewTabProps {
  profile: UserType;
  isEditing: boolean;
  onProfileChange: (profile: UserType) => void;
  currentUser?: UserType; // Use UserType instead of any
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  isEditing,
  onProfileChange,
  currentUser,
}) => {
  const handleFieldChange = (field: string, value: string) => {
    // Update the profile with the new value
    const updatedProfile = {
      ...profile,
      [field]: value,
    };
    onProfileChange(updatedProfile as UserType);
  };

  // Dummy recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "order",
      title: "Order #12345 Delivered",
      description: "Your order of 2 items has been successfully delivered",
      date: "2024-03-20T10:30:00Z",
      icon: "Package",
    },
    {
      id: "2",
      type: "appointment",
      title: "Appointment Scheduled",
      description: "Appointment with Dr. Sarah Johnson scheduled for March 25",
      date: "2024-03-18T14:20:00Z",
      icon: "Calendar",
    },
    {
      id: "3",
      type: "prescription",
      title: "New Prescription",
      description: "Prescription for Atorvastatin issued by Dr. Sarah Johnson",
      date: "2024-03-15T09:15:00Z",
      icon: "Heart",
    },
    {
      id: "4",
      type: "profile_update",
      title: "Profile Updated",
      description: "Your personal information has been updated",
      date: "2024-03-12T16:45:00Z",
      icon: "User",
    },
  ];

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "Package":
        return <Package className="w-4 h-4" />;
      case "Calendar":
        return <Calendar className="w-4 h-4" />;
      case "Heart":
        return <Heart className="w-4 h-4" />;
      case "User":
        return <User className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600 bg-blue-100";
      case "appointment":
        return "text-green-600 bg-green-100";
      case "prescription":
        return "text-red-600 bg-red-100";
      case "profile_update":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatActivityDate = (value: string | Date) => {
    const date = new Date(value);
    const dateText = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
    const timeText = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date);
    return `${dateText} at ${timeText}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={currentUser?.firstName || ""}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.firstName || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={currentUser?.lastName || ""}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.lastName || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={currentUser?.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.email || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={currentUser?.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.phone || "Not set"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <p className="text-sm font-medium capitalize">
                  {currentUser?.role || "Not set"}
                </p>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <p className="text-sm font-medium capitalize">
                  {currentUser?.status || "Not set"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Input
                    id="bio"
                    value={currentUser?.bio || ""}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    placeholder="Enter your bio"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.bio || "Not specified"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={currentUser?.address || ""}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {currentUser?.address || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentUser?.dateOfBirth || ""}
                  onChange={(e) =>
                    handleFieldChange("dateOfBirth", e.target.value)
                  }
                />
              ) : (
                <p className="text-sm font-medium">
                  {currentUser?.dateOfBirth || "Not specified"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatActivityDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
