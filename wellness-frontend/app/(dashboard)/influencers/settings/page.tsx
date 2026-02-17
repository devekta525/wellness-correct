"use client";

import React, { useState, useEffect } from "react";
import { getApiV1Url } from "@/lib/utils/api";
import { Save, Edit, Loader2, Camera, Plus, X, Languages } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Influencer Settings Page Component
const InfluencerSettingsPage = () => {
  // All state declarations at the top
  const [editStates, setEditStates] = useState({
    profile: false,
    business: false,
    security: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originalData, setOriginalData] = useState({
    profile: {
      name: "Emma Rodriguez",
      email: "emma.rodriguez@influencer.com",
      phone: "+91 810-123-4567",
      niche: "Fashion & Lifestyle",
      followers: 125000,
      engagement: 4.2,
      platform: "Instagram",
      location: "Los Angeles, CA",
      bio: "Fashion enthusiast and lifestyle influencer with 125K+ followers. Sharing daily style tips and wellness content.",
      avatar: "/avatars/influencer-1.jpg",
      languages: ["English", "Spanish"],
      collaborationRate: 500,
      sponsoredPostRate: 800,
    },
    business: {
      brandName: "Emma Rodriguez Brand",
      businessAddress: "456 Fashion District, Los Angeles, CA 90210",
      businessPhone: "+1 (555) 987-6543",
      businessEmail: "business@emmarodriguez.com",
      website: "www.emmarodriguez.com",
      taxId: "12-3456789",
      businessType: "Individual Influencer",
      socialMedia: {
        instagram: "@emmarodriguez",
        tiktok: "@emmarodriguez",
        youtube: "Emma Rodriguez",
        twitter: "@emmarodriguez",
      },
      contentSchedule: {
        monday: { posts: 2, stories: 5, reels: 1 },
        tuesday: { posts: 1, stories: 3, reels: 2 },
        wednesday: { posts: 2, stories: 4, reels: 1 },
        thursday: { posts: 1, stories: 3, reels: 1 },
        friday: { posts: 2, stories: 5, reels: 2 },
        saturday: { posts: 1, stories: 2, reels: 1 },
        sunday: { posts: 1, stories: 2, reels: 0 },
      },
      averagePostTime: 2,
      maxCollaborationsPerMonth: 8,
      brandPartnerships: true,
    },
    security: {
      twoFactorAuth: true,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      ipWhitelist: ["192.168.1.100", "10.0.0.50"],
      auditLogs: true,
      dataEncryption: true,
      backupFrequency: "daily",
    },
  });

  const [formData, setFormData] = useState(originalData);

  // Fetch settings data from API
  useEffect(() => {
    fetchSettings();
  }, []);

  // Sync formData when originalData changes after API fetch
  useEffect(() => {
    if (originalData && originalData.profile) {
      setFormData(originalData);
    }
  }, [originalData]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(getApiV1Url("/influencer-settings"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setOriginalData(result.data);
        // Don't need to set formData here - the useEffect below will handle it
      } else {
        throw new Error(result.message || "Failed to load settings");
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      setError(error.message || "Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    setEditStates((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancel = (section: string) => {
    setEditStates((prev) => ({ ...prev, [section]: false }));
    setFormData((prev) => ({
      ...prev,
      [section]: originalData[section as keyof typeof originalData],
    }));
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateWebsite = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async (section: string) => {
    try {
      // Validation and data transformation
      let dataToSend: any = { ...formData[section as keyof typeof formData] };

      if (section === "profile") {
        // Validate email
        if (!validateEmail(dataToSend.email)) {
          setError("Please enter a valid email address");
          return;
        }
        // Validate phone
        if (
          dataToSend.phone &&
          !validatePhoneNumber(dataToSend.phone.toString())
        ) {
          setError("Please enter a valid phone number (at least 10 digits)");
          return;
        }

        // Transform name to firstName and lastName
        const nameParts = (dataToSend.name as string).split(" ");
        dataToSend.firstName = nameParts[0] || "";
        dataToSend.lastName = nameParts.slice(1).join(" ") || "";
        // Remove fields that shouldn't be sent to backend
        delete dataToSend.name;
        delete dataToSend.avatar;
      } else if (section === "business") {
        // Validate website if provided
        if (dataToSend.website && !validateWebsite(dataToSend.website)) {
          setError("Please enter a valid website URL");
          return;
        }
        // Remove contentSchedule - not handled by backend
        delete dataToSend.contentSchedule;
      }

      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem("token");
      const endpoint =
        section === "profile"
          ? "/v1/influencer-settings/profile"
          : section === "business"
            ? "/v1/influencer-settings/business"
            : "/v1/influencer-settings/security";

      const response = await fetch(getApiV1Url(endpoint), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to save settings: ${response.statusText}`,
        );
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the data from server to ensure we have the latest
        await fetchSettings();
        setEditStates((prev) => ({ ...prev, [section]: false }));
        setError(null);
        alert(
          `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`,
        );
      } else {
        throw new Error(result.message || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setError(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    return (
      /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, "").length >= 10
    );
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string | number | boolean | string[],
  ) => {
    // Clear error when user starts typing
    if (error) setError(null);

    // Validate phone field in real-time
    if (field === "phone" && typeof value === "string") {
      if (value && !validatePhoneNumber(value)) {
        // Still allow input but user will see validation error on save
      }
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (
    section: string,
    parentField: string,
    childField: string,
    value: string | number | boolean | object,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [parentField]: {
          ...((prev[section as keyof typeof prev] as Record<string, unknown>)[
            parentField
          ] as Record<string, unknown>),
          [childField]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, business settings, and influencer preferences
          </p>
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
            Failed to load settings: {error}. Please refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal and professional information
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {editStates.profile ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleCancel("profile")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSave("profile")}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleEdit("profile")}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={formData.profile.avatar}
                      alt={formData.profile.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {formData.profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.profile.name}
                      onChange={(e) =>
                        handleInputChange("profile", "name", e.target.value)
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.profile.email}
                      onChange={(e) =>
                        handleInputChange("profile", "email", e.target.value)
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.profile.phone}
                      onChange={(e) =>
                        handleInputChange("profile", "phone", e.target.value)
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche">Niche</Label>
                    <Select
                      value={formData.profile.niche}
                      onValueChange={(value) =>
                        handleInputChange("profile", "niche", value)
                      }
                      disabled={!editStates.profile}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fashion & Lifestyle">
                          Fashion & Lifestyle
                        </SelectItem>
                        <SelectItem value="Beauty & Skincare">
                          Beauty & Skincare
                        </SelectItem>
                        <SelectItem value="Fitness & Wellness">
                          Fitness & Wellness
                        </SelectItem>
                        <SelectItem value="Food & Cooking">
                          Food & Cooking
                        </SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followers">Followers Count</Label>
                    <Input
                      id="followers"
                      type="number"
                      value={formData.profile.followers}
                      onChange={(e) =>
                        handleInputChange(
                          "profile",
                          "followers",
                          parseInt(e.target.value),
                        )
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engagement">Engagement Rate (%)</Label>
                    <Input
                      id="engagement"
                      type="number"
                      step="0.1"
                      value={formData.profile.engagement}
                      onChange={(e) =>
                        handleInputChange(
                          "profile",
                          "engagement",
                          parseFloat(e.target.value),
                        )
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Primary Platform</Label>
                    <Select
                      value={formData.profile.platform}
                      onValueChange={(value) =>
                        handleInputChange("profile", "platform", value)
                      }
                      disabled={!editStates.profile}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="TikTok">TikTok</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.profile.location}
                      onChange={(e) =>
                        handleInputChange("profile", "location", e.target.value)
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.profile.bio}
                    onChange={(e) =>
                      handleInputChange("profile", "bio", e.target.value)
                    }
                    disabled={!editStates.profile}
                    rows={4}
                  />
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.profile.languages.map((language, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Languages className="w-3 h-3" />
                        {language}
                        {editStates.profile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => {
                              const newLanguages =
                                formData.profile.languages.filter(
                                  (_, i) => i !== index,
                                );
                              handleInputChange(
                                "profile",
                                "languages",
                                newLanguages,
                              );
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                    {editStates.profile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLanguage = prompt("Enter language:");
                          if (newLanguage) {
                            handleInputChange("profile", "languages", [
                              ...formData.profile.languages,
                              newLanguage,
                            ]);
                          }
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Language
                      </Button>
                    )}
                  </div>
                </div>

                {/* Collaboration Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="collaborationRate">
                      Collaboration Rate ($)
                    </Label>
                    <Input
                      id="collaborationRate"
                      type="number"
                      value={formData.profile.collaborationRate}
                      onChange={(e) =>
                        handleInputChange(
                          "profile",
                          "collaborationRate",
                          parseInt(e.target.value),
                        )
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsoredPostRate">
                      Sponsored Post Rate ($)
                    </Label>
                    <Input
                      id="sponsoredPostRate"
                      type="number"
                      value={formData.profile.sponsoredPostRate}
                      onChange={(e) =>
                        handleInputChange(
                          "profile",
                          "sponsoredPostRate",
                          parseInt(e.target.value),
                        )
                      }
                      disabled={!editStates.profile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      Manage your brand and business details
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {editStates.business ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleCancel("business")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSave("business")}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleEdit("business")}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Business
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={formData.business.brandName}
                      onChange={(e) =>
                        handleInputChange(
                          "business",
                          "brandName",
                          e.target.value,
                        )
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={formData.business.businessType}
                      onValueChange={(value) =>
                        handleInputChange("business", "businessType", value)
                      }
                      disabled={!editStates.business}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual Influencer">
                          Individual Influencer
                        </SelectItem>
                        <SelectItem value="Influencer Agency">
                          Influencer Agency
                        </SelectItem>
                        <SelectItem value="Content Creator">
                          Content Creator
                        </SelectItem>
                        <SelectItem value="Brand Ambassador">
                          Brand Ambassador
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      value={formData.business.businessPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "business",
                          "businessPhone",
                          e.target.value,
                        )
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.business.businessEmail}
                      onChange={(e) =>
                        handleInputChange(
                          "business",
                          "businessEmail",
                          e.target.value,
                        )
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.business.website}
                      onChange={(e) =>
                        handleInputChange("business", "website", e.target.value)
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.business.taxId}
                      onChange={(e) =>
                        handleInputChange("business", "taxId", e.target.value)
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.business.businessAddress}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "businessAddress",
                        e.target.value,
                      )
                    }
                    disabled={!editStates.business}
                    rows={3}
                  />
                </div>

                {/* Social Media Handles */}
                <div className="space-y-4">
                  <Label>Social Media Handles</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.business.socialMedia).map(
                      ([platform, handle]) => (
                        <div key={platform} className="space-y-2">
                          <Label htmlFor={platform} className="capitalize">
                            {platform}
                          </Label>
                          <Input
                            id={platform}
                            value={handle}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "business",
                                "socialMedia",
                                platform,
                                e.target.value,
                              )
                            }
                            disabled={!editStates.business}
                            placeholder={`@${platform}handle`}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="averagePostTime">
                      Average Post Time (hours)
                    </Label>
                    <Input
                      id="averagePostTime"
                      type="number"
                      value={formData.business.averagePostTime}
                      onChange={(e) =>
                        handleInputChange(
                          "business",
                          "averagePostTime",
                          parseInt(e.target.value),
                        )
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCollaborationsPerMonth">
                      Max Collaborations Per Month
                    </Label>
                    <Input
                      id="maxCollaborationsPerMonth"
                      type="number"
                      value={formData.business.maxCollaborationsPerMonth}
                      onChange={(e) =>
                        handleInputChange(
                          "business",
                          "maxCollaborationsPerMonth",
                          parseInt(e.target.value),
                        )
                      }
                      disabled={!editStates.business}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand Partnerships</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.business.brandPartnerships}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "business",
                            "brandPartnerships",
                            checked,
                          )
                        }
                        disabled={!editStates.business}
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.business.brandPartnerships
                          ? "Open"
                          : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and privacy settings
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {editStates.security ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleCancel("security")}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSave("security")}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleEdit("security")}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Security
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={formData.security.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        handleInputChange("security", "twoFactorAuth", checked)
                      }
                      disabled={!editStates.security}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone logs into your account
                      </p>
                    </div>
                    <Switch
                      checked={formData.security.loginAlerts}
                      onCheckedChange={(checked) =>
                        handleInputChange("security", "loginAlerts", checked)
                      }
                      disabled={!editStates.security}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default InfluencerSettingsPage;
