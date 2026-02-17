'use client'

import React from 'react'
import { User, Upload, Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Image from 'next/image'


interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  bio: string
}

interface ProfileSettingsProps {
  profileData: ProfileData
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>
  editStates: { profile: boolean }
  isLoading: boolean
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profileData,
  setProfileData,
  editStates,
  isLoading,
  onEdit,
  onCancel,
  onSave,
  onImageUpload
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </div>
          {!editStates.profile ? (
            <Button onClick={() => onEdit('profile')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('profile')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('profile')} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              {profileData.avatar ? (
                <Image src={profileData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(e, 'avatar')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
            <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              disabled={!editStates.profile}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              disabled={!editStates.profile}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              disabled={!editStates.profile}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              disabled={!editStates.profile}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            rows={3}
            disabled={!editStates.profile}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileSettings
