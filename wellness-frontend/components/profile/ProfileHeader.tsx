"use client";

import React, { useState, useRef } from "react";
import {
  Edit,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { User as UserType } from "@/lib/redux/features/authSlice";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  profile: UserType;
  isEditing: boolean;
  onEdit: () => void;
  onSuccess: (updatedUser: UserType) => void;
  onCancel: () => void;
  showEditButton?: boolean;
  currentUser?: UserType;
  token?: string;
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
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

  const handleSave = async () => {
    if (!token) {
      Swal.fire("Authentication Error", "Please log in again.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      const dataToSave = editingProfile || profile;

      if (dataToSave.firstName) formData.append("firstName", dataToSave.firstName);
      if (dataToSave.lastName) formData.append("lastName", dataToSave.lastName);
      if (dataToSave.email) formData.append("email", dataToSave.email);
      if (dataToSave.phone) formData.append("phone", dataToSave.phone);
      if (dataToSave.bio) formData.append("bio", dataToSave.bio);
      if (dataToSave.dateOfBirth) formData.append("dateOfBirth", dataToSave.dateOfBirth);
      if (dataToSave.address) formData.append("address", dataToSave.address);

      if (avatarFile) {
        formData.append("image", avatarFile);
      }

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
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          timer: 2000,
          showConfirmButton: false,
        });
        onSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || "Update failed.");
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      Swal.fire("Update Failed", error.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const userDisplayName = currentUser
    ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
    : `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();

  const userEmail = currentUser?.email || profile?.email || "No email provided";
  const userRole = currentUser?.role || "Customer";

  return (
    <TooltipProvider>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-blue-100 shadow-lg p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="p-1.5 bg-slate-50 rounded-full">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md">
                  <AvatarImage
                    src={previewImage || profile?.imageUrl || "/logo.png"}
                    alt={userDisplayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl bg-blue-50 text-blue-600 font-black">
                    {userDisplayName.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white transition-all z-30"
                    onClick={handleCameraClick}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {userDisplayName}
                </h1>
                <span className="rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider border border-blue-100">
                  {userRole}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                  <Mail className="w-4 h-4 text-blue-500" />
                  {userEmail}
                </div>
                {currentUser?.phone && (
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    Verified User
                  </div>
                )}
              </div>
              {currentUser?.bio && (
                <p className="text-slate-400 text-sm font-medium mt-2 max-w-lg leading-relaxed">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto">
            {showEditButton && (
              isEditing ? (
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleSave}
                    className="h-11 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-sm transition-all active:scale-95"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="h-11 px-8 rounded-xl border-slate-200 text-slate-500 font-bold text-sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onEdit}
                  className="w-full md:w-auto h-11 px-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-sm hover:shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default ProfileHeader;
