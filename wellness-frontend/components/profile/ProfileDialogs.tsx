'use client'

import React, { useState } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppDispatch } from '@/lib/redux/hooks'
import { resetPassword } from '@/lib/redux/features/authSlice'

interface ProfileDialogsProps {
  showChangePassword: boolean
  showDeleteAccount: boolean
  onCloseChangePassword: () => void
  onCloseDeleteAccount: () => void
  onChangePassword: () => void
  onDeleteAccount: () => void
}

const ProfileDialogs = ({
  showChangePassword,
  showDeleteAccount,
  onCloseChangePassword,
  onCloseDeleteAccount,
  onChangePassword,
  onDeleteAccount
}: ProfileDialogsProps) => {
  const dispatch = useAppDispatch()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await dispatch(resetPassword(currentPassword, newPassword))
      
      if (success) {
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setError('')
        onChangePassword()
      } else {
        setError('Failed to change password. Please check your current password.')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError('An error occurred while changing password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseChangePassword = () => {
    // Clear form when closing
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    onCloseChangePassword()
  }
  return (
    <>
      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={handleCloseChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and new password to update your account security.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input 
                  id="new-password" 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input 
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseChangePassword}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={onCloseDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Warning</p>
              </div>
              <p className="text-sm text-red-700 mt-2">
                Deleting your account will permanently remove all your data, orders, and preferences.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeleteAccount}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProfileDialogs
