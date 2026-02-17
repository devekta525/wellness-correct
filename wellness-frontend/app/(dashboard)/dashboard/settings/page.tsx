"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  Building2,
  Bell,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionData, fetchUserDetails } from "@/lib/utils/auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchSettingsData,
  updateSettings,
  selectSettingsData,
  selectSettingsLoading,
} from "@/lib/redux/features/settingSlice";
import {
  selectUser as selectAuthUser,
  setUser,
  updateProfile,
  selectAuthLoading,
  resetPassword,
} from "@/lib/redux/features/authSlice";
import {
  fetchUserSessions,
  endSession,
  endAllOtherSessions,
  selectSessions,
  selectSessionLoading,
} from "@/lib/redux/features/sessionSlice";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SEOSettings from "@/components/settings/SEOSettings";
import BusinessSettings from "@/components/settings/BusinessSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PaymentSettings from "@/components/settings/PaymentSettings";
import ShippingSettings from "@/components/settings/ShippingSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const settingsData = useAppSelector(selectSettingsData);
  const isLoading = useAppSelector(selectSettingsLoading);

  // User and session data
  const currentUser = useAppSelector(selectAuthUser);
  const userLoading = useAppSelector(selectAuthLoading);
  const sessions = useAppSelector(selectSessions);
  const sessionLoading = useAppSelector(selectSessionLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Edit states for each tab
  const [editStates, setEditStates] = useState({
    profile: false,
    seo: false,
    business: false,
    notifications: false,
    payments: false,
    shipping: false,
    security: false,
  });

  // Load user from localStorage on component mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const sessionData = getSessionData();
      if (sessionData && !currentUser) {
        try {
          const userDetails = await fetchUserDetails(
            sessionData.user,
            sessionData.token,
          );
          if (userDetails) {
            dispatch(setUser(userDetails));
          }
        } catch (error) {
          console.error("Error loading user from localStorage:", error);
        }
      }
    };
    loadUserFromStorage();
  }, [dispatch, currentUser]);

  // Fetch settings data on component mount
  useEffect(() => {
    dispatch(fetchSettingsData());
  }, [dispatch]);

  // Fetch user sessions for security tab
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchUserSessions(currentUser._id));
    }
  }, [dispatch, currentUser]);

  // Update profile data from current user
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        avatar: currentUser.imageUrl || "",
        bio: currentUser.bio || "",
      });
    } else {
    }
  }, [currentUser]);

  // Update local state when settings data is loaded
  useEffect(() => {
    if (settingsData) {
      // Update SEO data
      if (settingsData.seoSetting && settingsData.seoSetting.basicSetting) {
        setSeoData({
          siteTitle: settingsData.seoSetting.basicSetting.siteTitle || "",
          siteDescription:
            settingsData.seoSetting.basicSetting.metaDescription || "",
          siteKeywords:
            settingsData.seoSetting.basicSetting.keywords?.join(", ") || "",
          ogImage: settingsData.seoSetting.basicSetting.googleAnalyticsId || "",
          twitterHandle:
            settingsData.seoSetting.basicSetting.twitterHandle || "",
          googleAnalytics:
            settingsData.seoSetting.basicSetting.googleAnalyticsId || "",
          facebookPixel: "",
          sitemapUrl: "https://wellnessfuel.com/sitemap.xml",
          robotsTxt: "https://wellnessfuel.com/robots.txt",
          thirdPartyScripts: {
            googleTagManager:
              settingsData.seoSetting.thirdPartySetting?.googleTagManagerId ||
              "",
            hotjar: settingsData.seoSetting.thirdPartySetting?.hotjarId || "",
            intercom:
              settingsData.seoSetting.thirdPartySetting?.intercomAppId || "",
            zendesk:
              settingsData.seoSetting.thirdPartySetting?.zendeskWidgetKey || "",
            customScripts:
              settingsData.seoSetting.thirdPartySetting?.customScripts || "",
          },
          metaTags: {
            author: settingsData.seoSetting.metaSetting?.author || "",
            robots:
              settingsData.seoSetting.metaSetting?.robots || "index, follow",
            viewport:
              settingsData.seoSetting.metaSetting?.viewport ||
              "width=device-width, initial-scale=1",
            themeColor:
              settingsData.seoSetting.metaSetting?.themeColor || "#10b981",
            customMetaTags:
              settingsData.seoSetting.metaSetting?.customMetaTags || "",
          },
        });
      }

      // Update Business data
      if (
        settingsData.businessSetting &&
        settingsData.businessSetting.businessInformation
      ) {
        setBusinessData({
          businessName:
            settingsData.businessSetting.businessInformation.businessName || "",
          businessEmail:
            settingsData.businessSetting.businessInformation.businessEmail ||
            "",
          businessPhone:
            settingsData.businessSetting.businessInformation.businessPhone ||
            "",
          businessAddress:
            settingsData.businessSetting.businessInformation.businessAddress ||
            "",
          gstNumber:
            settingsData.businessSetting.businessInformation.gstNumber || "",
          panNumber:
            settingsData.businessSetting.businessInformation.panNumber || "",
          businessType:
            settingsData.businessSetting.businessInformation.businessType ||
            "Private Limited",
          industry: "Health & Wellness",
          foundedYear:
            settingsData.businessSetting.businessInformation.foundedYear?.toString() ||
            "2020",
          website:
            settingsData.businessSetting.businessInformation.website || "",
          socialMedia: {
            facebook:
              settingsData.businessSetting.socialMediaSetting?.socialMedia
                ?.facebook || "",
            instagram:
              settingsData.businessSetting.socialMediaSetting?.socialMedia
                ?.instagram || "",
            twitter:
              settingsData.businessSetting.socialMediaSetting?.socialMedia
                ?.twitter || "",
            linkedin:
              settingsData.businessSetting.socialMediaSetting?.socialMedia
                ?.linkedin || "",
          },
        });
      }

      // Update Shipping data
      if (settingsData.shippingSetting) {
        setShippingData({
          defaultShippingRate:
            settingsData.shippingSetting.defaultShippingRate || 50,
          freeShippingThreshold:
            settingsData.shippingSetting.freeShippingThreshold || 1000,
          shippingZones:
            settingsData.shippingSetting.shippingZones?.map((zone, index) => ({
              id: index + 1,
              name: zone.zoneName,
              rate: zone.shippingRate,
              freeShipping: zone.freeShippingThreshold || 0,
            })) || [],
          deliveryTime: {
            standard:
              settingsData.shippingSetting.deliveryTimeframes?.standard ||
              "3-6 business days",
            express:
              settingsData.shippingSetting.deliveryTimeframes?.express ||
              "1-2 business days",
            overnight:
              settingsData.shippingSetting.deliveryTimeframes?.overnight ||
              "Next day delivery",
          },
        });
      }
    }
  }, [settingsData]);

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@wellnessfuel.com",
    phone: "+91 98765 43210",
    avatar: "",
    bio: "E-commerce store owner focused on wellness and health products.",
  });

  // Security Settings State
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
  });

  // SEO Settings State
  const [seoData, setSeoData] = useState({
    siteTitle: "Wellness Fuel - Premium Health & Wellness Products",
    siteDescription:
      "Discover premium health and wellness products including supplements, vitamins, and natural remedies for a healthier lifestyle.",
    siteKeywords:
      "wellness, health, supplements, vitamins, natural products, fitness, nutrition",
    ogImage: "",
    twitterHandle: "@wellnessfuel",
    googleAnalytics: "",
    facebookPixel: "",
    sitemapUrl: "https://wellnessfuel.com/sitemap.xml",
    robotsTxt: "https://wellnessfuel.com/robots.txt",
    thirdPartyScripts: {
      googleTagManager: "",
      hotjar: "",
      intercom: "",
      zendesk: "",
      customScripts: "",
    },
    metaTags: {
      author: "Wellness Fuel Team",
      robots: "index, follow",
      viewport: "width=device-width, initial-scale=1",
      themeColor: "#10b981",
      customMetaTags: "",
    },
  });

  // Business Settings State
  const [businessData, setBusinessData] = useState({
    businessName: "Wellness Fuel Pvt Ltd",
    businessEmail: "info@wellnessfuel.com",
    businessPhone: "+91 98765 43210",
    businessAddress:
      "123 Wellness Street, Health District, Mumbai, Maharashtra 400001",
    gstNumber: "27ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    businessType: "Private Limited",
    industry: "Health & Wellness",
    foundedYear: "2020",
    website: "https://wellnessfuel.com",
    socialMedia: {
      facebook: "https://facebook.com/wellnessfuel",
      instagram: "https://instagram.com/wellnessfuel",
      twitter: "https://twitter.com/wellnessfuel",
      linkedin: "https://linkedin.com/company/wellnessfuel",
    },
  });

  // Notification Settings State
  const [notificationData, setNotificationData] = useState({
    emailNotifications: {
      orderUpdates: true,
      newOrders: true,
      lowStock: true,
      customerReviews: true,
      marketingEmails: false,
      systemAlerts: true,
    },
    smsNotifications: {
      orderUpdates: false,
      newOrders: true,
      lowStock: true,
      systemAlerts: false,
    },
    pushNotifications: {
      orderUpdates: true,
      newOrders: true,
      lowStock: true,
      customerReviews: true,
      systemAlerts: true,
    },
  });

  // Payment Settings State
  const [paymentData, setPaymentData] = useState({
    currency: "INR",
    paymentMethods: {
      razorpay: {
        enabled: true,
        keyId: "rzp_test_1234567890",
        keySecret: "••••••••••••••••••••••••••••••••",
      },
      paypal: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
      stripe: {
        enabled: false,
        publishableKey: "",
        secretKey: "",
      },
      cod: {
        enabled: true,
        minAmount: 0,
        maxAmount: 5000,
      },
    },
    taxSettings: {
      gstRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
    },
  });

  // Shipping Settings State
  const [shippingData, setShippingData] = useState({
    defaultShippingRate: 50,
    freeShippingThreshold: 1000,
    shippingZones: [
      {
        id: 1,
        name: "Mumbai",
        rate: 50,
        freeShipping: 1000,
      },
      {
        id: 2,
        name: "Delhi",
        rate: 75,
        freeShipping: 1000,
      },
      {
        id: 3,
        name: "Bangalore",
        rate: 60,
        freeShipping: 1000,
      },
    ],
    deliveryTime: {
      standard: "3-5 business days",
      express: "1-2 business days",
      overnight: "Next day delivery",
    },
  });

  const handleEdit = (section: string) => {
    setEditStates((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleCancel = (section: string) => {
    // Simply exit edit mode without restoring data
    // In a real app, you might want to restore from a backup or refetch from API
    setEditStates((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  const handleSave = async (section: string) => {
    try {
      let updateData: Record<string, unknown> = {};

      switch (section) {
        case "seo":
          updateData = {
            seoSetting: {
              basicSetting: {
                siteTitle: seoData.siteTitle,
                metaDescription: seoData.siteDescription,
                keywords: seoData.siteKeywords
                  .split(",")
                  .map((k) => k.trim())
                  .filter((k) => k),
                twitterHandle: seoData.twitterHandle,
                googleAnalyticsId: seoData.googleAnalytics,
              },
              thirdPartySetting: {
                googleTagManagerId: seoData.thirdPartyScripts.googleTagManager,
                hotjarId: seoData.thirdPartyScripts.hotjar,
                intercomAppId: seoData.thirdPartyScripts.intercom,
                zendeskWidgetKey: seoData.thirdPartyScripts.zendesk,
                customScripts: seoData.thirdPartyScripts.customScripts,
              },
              metaSetting: {
                author: seoData.metaTags.author,
                robots: seoData.metaTags.robots,
                viewport: seoData.metaTags.viewport,
                themeColor: seoData.metaTags.themeColor,
                customMetaTags: seoData.metaTags.customMetaTags,
              },
            },
          };
          break;

        case "business":
          updateData = {
            businessSetting: {
              businessInformation: {
                businessName: businessData.businessName,
                businessEmail: businessData.businessEmail,
                businessPhone: businessData.businessPhone,
                website: businessData.website,
                businessAddress: businessData.businessAddress,
                gstNumber: businessData.gstNumber,
                panNumber: businessData.panNumber,
                businessType: businessData.businessType,
                foundedYear: parseInt(businessData.foundedYear),
              },
              socialMediaSetting: {
                socialMedia: {
                  facebook: businessData.socialMedia.facebook,
                  instagram: businessData.socialMedia.instagram,
                  twitter: businessData.socialMedia.twitter,
                  linkedin: businessData.socialMedia.linkedin,
                },
              },
            },
          };
          break;

        case "shipping":
          updateData = {
            shippingSetting: {
              defaultShippingRate: shippingData.defaultShippingRate,
              freeShippingThreshold: shippingData.freeShippingThreshold,
              shippingZones: shippingData.shippingZones.map((zone) => ({
                zoneName: zone.name,
                shippingRate: zone.rate,
                freeShippingThreshold: zone.freeShipping,
              })),
              deliveryTimeframes: {
                standard: shippingData.deliveryTime.standard,
                express: shippingData.deliveryTime.express,
                overnight: shippingData.deliveryTime.overnight,
              },
            },
          };
          break;

        case "profile":
          // Use userSlice to update profile
          if (currentUser?._id) {
            const success = await dispatch(
              updateProfile(currentUser._id, {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                bio: profileData.bio,
                imageUrl: profileData.avatar,
              }),
            );

            if (!success) {
              throw new Error("Failed to update profile");
            }
          } else {
            console.error("No current user found for profile update");
            throw new Error("No user found to update");
          }
          break;

        case "security":
          // Security settings - use user API for security updates
          if (currentUser?._id) {
            const success = await dispatch(
              updateProfile(currentUser._id, {
                twoFactorEnabled: securityData.twoFactorEnabled,
              }),
            );

            if (!success) {
              throw new Error("Failed to update security settings");
            }
          } else {
            throw new Error("No user found for security update");
          }
          break;

        default:
          await new Promise((resolve) => setTimeout(resolve, 1000));
          break;
      }

      // Call updateSettings API for SEO, Business, and Shipping
      if (["seo", "business", "shipping"].includes(section)) {
        const success = await dispatch(updateSettings(updateData));
        if (!success) {
          throw new Error(`Failed to update ${section} settings`);
        }
      }

      // Exit edit mode after successful save
      setEditStates((prev) => ({
        ...prev,
        [section]: false,
      }));
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      // You might want to show a toast notification here
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle image upload logic here
    }
  };

  // Session management functions
  const handleEndSession = async (sessionId: string) => {
    try {
      const success = await dispatch(endSession(sessionId));
      if (success) {
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleEndAllOtherSessions = async () => {
    try {
      if (currentUser?._id && sessions.length > 0) {
        const currentSessionId = sessions.find((s) => s.isActive)?._id;
        if (currentSessionId) {
          const success = await dispatch(
            endAllOtherSessions(currentUser._id, currentSessionId),
          );
          if (success) {
          }
        }
      }
    } catch (error) {
      console.error("Error ending other sessions:", error);
    }
  };

  // Password change function using resetPassword API
  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      if (!currentUser?._id) {
        console.error("No current user found for password change");
        return false;
      }

      // Use resetPassword API for password change
      const success = await dispatch(
        resetPassword(currentPassword, newPassword),
      );

      // Disable edit mode after successful password change
      if (success) {
        setEditStates((prev) => ({
          ...prev,
          security: false,
        }));
      }

      return success;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  };

  // AI-powered password change
  const handleAIPasswordChange = async () => {
    try {
      // This would integrate with AI service to generate secure password
      // Implementation would go here
    } catch (error) {
      console.error("Error with AI password change:", error);
    }
  };

  // Debug current user

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and preferences
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings
            profileData={profileData}
            setProfileData={setProfileData}
            editStates={editStates}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            onImageUpload={handleImageUpload}
          />
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <SEOSettings
            seoData={seoData}
            setSeoData={setSeoData}
            editStates={editStates}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <BusinessSettings
            businessData={businessData}
            setBusinessData={setBusinessData}
            editStates={editStates}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            notificationData={notificationData}
            setNotificationData={setNotificationData}
            editStates={editStates}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentSettings
            paymentData={paymentData}
            setPaymentData={setPaymentData}
            editStates={editStates}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <ShippingSettings
            shippingData={shippingData}
            setShippingData={setShippingData}
            editStates={editStates}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySettings
            editStates={editStates}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            sessions={sessions}
            sessionLoading={sessionLoading}
            onEndSession={handleEndSession}
            onEndAllOtherSessions={handleEndAllOtherSessions}
            onAIPasswordChange={handleAIPasswordChange}
            onChangePassword={handlePasswordChange}
            securityData={securityData}
            setSecurityData={setSecurityData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
