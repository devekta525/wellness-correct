'use client'

import React from 'react'
import { Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface BusinessData {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  gstNumber: string
  panNumber: string
  businessType: string
  industry: string
  foundedYear: string
  website: string
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
  }
}

interface BusinessSettingsProps {
  businessData: BusinessData
  setBusinessData: React.Dispatch<React.SetStateAction<BusinessData>>
  editStates: { business: boolean }
  isLoading: boolean
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  businessData,
  setBusinessData,
  editStates,
  isLoading,
  onEdit,
  onCancel,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Manage your business details and legal information</CardDescription>
          </div>
          {!editStates.business ? (
            <Button onClick={() => onEdit('business')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Business
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('business')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('business')} disabled={isLoading}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessData.businessName}
              onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
              disabled={!editStates.business}
            />
          </div>
          <div>
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              value={businessData.businessEmail}
              onChange={(e) => setBusinessData({...businessData, businessEmail: e.target.value})}
              disabled={!editStates.business}
            />
          </div>
          <div>
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              value={businessData.businessPhone}
              onChange={(e) => setBusinessData({...businessData, businessPhone: e.target.value})}
              disabled={!editStates.business}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={businessData.website}
              onChange={(e) => setBusinessData({...businessData, website: e.target.value})}
              disabled={!editStates.business}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="businessAddress">Business Address</Label>
          <Textarea
            id="businessAddress"
            value={businessData.businessAddress}
            onChange={(e) => setBusinessData({...businessData, businessAddress: e.target.value})}
            rows={3}
            disabled={!editStates.business}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              value={businessData.gstNumber}
              onChange={(e) => setBusinessData({...businessData, gstNumber: e.target.value})}
              placeholder="27ABCDE1234F1Z5"
              disabled={!editStates.business}
            />
          </div>
          <div>
            <Label htmlFor="panNumber">PAN Number</Label>
            <Input
              id="panNumber"
              value={businessData.panNumber}
              onChange={(e) => setBusinessData({...businessData, panNumber: e.target.value})}
              placeholder="ABCDE1234F"
              disabled={!editStates.business}
            />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Select value={businessData.businessType} onValueChange={(value) => setBusinessData({...businessData, businessType: value})} disabled={!editStates.business}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Private Limited">Private Limited</SelectItem>
                <SelectItem value="Public Limited">Public Limited</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="LLP">Limited Liability Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              value={businessData.foundedYear}
              onChange={(e) => setBusinessData({...businessData, foundedYear: e.target.value})}
              placeholder="2020"
              disabled={!editStates.business}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={businessData.socialMedia.facebook}
                onChange={(e) => setBusinessData({
                  ...businessData, 
                  socialMedia: {...businessData.socialMedia, facebook: e.target.value}
                })}
                placeholder="https://facebook.com/yourpage"
                disabled={!editStates.business}
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={businessData.socialMedia.instagram}
                onChange={(e) => setBusinessData({
                  ...businessData, 
                  socialMedia: {...businessData.socialMedia, instagram: e.target.value}
                })}
                placeholder="https://instagram.com/yourpage"
                disabled={!editStates.business}
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={businessData.socialMedia.twitter}
                onChange={(e) => setBusinessData({
                  ...businessData, 
                  socialMedia: {...businessData.socialMedia, twitter: e.target.value}
                })}
                placeholder="https://twitter.com/yourpage"
                disabled={!editStates.business}
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={businessData.socialMedia.linkedin}
                onChange={(e) => setBusinessData({
                  ...businessData, 
                  socialMedia: {...businessData.socialMedia, linkedin: e.target.value}
                })}
                placeholder="https://linkedin.com/company/yourcompany"
                disabled={!editStates.business}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BusinessSettings
