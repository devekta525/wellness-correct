"use client";

import React, { useState, useRef } from "react";
import {
  Edit,
  Save,
  X,
  Camera,
  User,
  Calendar,
  Heart,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User as UserType } from "@/lib/redux/features/authSlice";
import axios from "axios";
import Swal from "sweetalert2";

interface ProfileHeaderProps {
  profile: UserType;
  isEditing: boolean;
  onEdit: () => void;
  onSuccess: (updatedUser: UserType) => void;
  onCancel: () => void;
  showEditButton?: boolean;
  currentUser?: UserType;
  /**
   * The authentication token passed from the parent.
   */
  token?: string;
  /**
   * The profile object containing the current edits.
   */
  editingProfile?: UserType | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing,
  onEdit,
  onSuccess,
  onCancel,
  showEditButton = true,
  currentUser,
  token,
  editingProfile,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // State to hold the selected file
  const [isLoading, setIsLoading] = useState(false); // Loading state for the save button
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file); // Store the file object for upload

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    // Reset image preview and file state when canceling
    setPreviewImage(null);
    setAvatarFile(null);
    onCancel();
  };

  // Main handler for saving the profile data
  const handleSave = async () => {
    if (!token) {
      Swal.fire(
        "Authentication Error",
        "Could not find authentication token. Please log in again.",
        "error",
      );
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Use editingProfile if available, otherwise fallback to current profile
      const dataToSave = editingProfile || profile;

      // Append text fields
      if (dataToSave.firstName) formData.append("firstName", dataToSave.firstName);
      if (dataToSave.lastName) formData.append("lastName", dataToSave.lastName);
      if (dataToSave.email) formData.append("email", dataToSave.email);
      if (dataToSave.phone) formData.append("phone", dataToSave.phone);
      if (dataToSave.bio) formData.append("bio", dataToSave.bio);
      if (dataToSave.dateOfBirth) formData.append("dateOfBirth", dataToSave.dateOfBirth);
      if (dataToSave.address) formData.append("address", dataToSave.address);

      // Append the image file if a new one was selected
      if (avatarFile) {
        formData.append("image", avatarFile);
      }

      // If no changes (and no file), we could skip, but let's allow it to ensure consistency
      if (!avatarFile && !editingProfile) {
        onSuccess(profile);
        setIsLoading(false);
        return;
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/users/update-profile`,
        formData,
        {
          headers: {
            // Content-Type is automatically set by axios with the correct boundary for FormData
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        onSuccess(response.data.data); // Notify parent with updated user data
      } else {
        throw new Error(
          response.data.message || "An unknown error occurred during update.",
        );
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile. Please try again.";
      Swal.fire("Update Failed", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <TooltipProvider>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>

        {/* Edit Profile Button - Top Right Corner */}
        {showEditButton && (
          <div className="absolute top-4 right-4 z-20">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl border-0 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  className="gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={onEdit}
                size="sm"
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl border-0 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        )}

        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 animate-pulse"></div>
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl relative z-10">
                  <AvatarImage
                    src={
                      previewImage ||
                      profile?.imageUrl ||
                      "/api/placeholder/100/100"
                    }
                    alt={
                      currentUser
                        ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
                        : `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {(currentUser
                      ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`
                      : `${profile?.firstName || ""} ${profile?.lastName || ""}`
                    )
                      .trim()
                      .split(" ")
                      .filter((n) => n.length > 0)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl border-2 border-white transition-all duration-300 hover:scale-110 z-30"
                        onClick={handleCameraClick}
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change profile picture</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 space-y-6">
              {/* Name and Basic Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {currentUser
                      ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
                      : `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {currentUser?.email || profile?.email || "No email"}
                  </p>
                </div>

                {/* Personal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Age
                      </p>
                      <p className="font-semibold text-gray-900">
                        {currentUser?.dateOfBirth
                          ? getAge(currentUser.dateOfBirth)
                          : profile?.dateOfBirth
                            ? getAge(profile.dateOfBirth)
                            : "Not set"}{" "}
                        years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Role
                      </p>
                      <p className="font-semibold text-gray-900">
                        {currentUser?.role || "Customer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Bio
                      </p>
                      <p className="font-semibold text-gray-900">
                        {currentUser?.bio || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="default"
                  className="px-4 py-2 text-sm font-semibold shadow-lg border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  {currentUser?.role || "Customer"}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-semibold border-2 border-green-300 text-green-700 bg-green-50"
                >
                  {currentUser?.status === "Active" ? "Active" : "Inactive"}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-semibold border-2 border-blue-300 text-blue-700 bg-blue-50"
                >
                  {currentUser?.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProfileHeader;
