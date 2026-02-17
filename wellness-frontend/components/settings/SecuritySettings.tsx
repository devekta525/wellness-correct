'use client'

import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Edit, Save, Loader2, AlertCircle, Monitor, Smartphone, Tablet, LogOut, Sparkles, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface Session {
  _id?: string
  user: string
  token: string
  ipAddress: string
  userAgent: string
  expiresAt: string
  isActive: boolean
  deviceInfo: {
    browser: string
    device: string
    os: string
  }
  createdAt: string
}

interface SecurityData {
  twoFactorEnabled: boolean
}

interface SecuritySettingsProps {
  editStates: { security: boolean }
  isLoading: boolean
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
  sessions: Session[]
  sessionLoading: boolean
  onEndSession: (sessionId: string) => void
  onEndAllOtherSessions: () => void
  onAIPasswordChange: () => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  securityData: SecurityData
  setSecurityData: React.Dispatch<React.SetStateAction<SecurityData>>
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  editStates,
  isLoading,
  showPassword,
  setShowPassword,
  onEdit,
  onCancel,
  onSave,
  sessions,
  sessionLoading,
  onEndSession,
  onEndAllOtherSessions,
  onChangePassword,
  securityData,
  setSecurityData
}) => {
  // Password generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Password generation function
  const generatePassword = () => {
    setIsGenerating(true)
    
    // Character sets
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    // Combine alphabets
    const alphabets = lowercase + uppercase
    
    // Generate 12-character password with specific requirements
    let password = ''
    
    // Ensure at least 3 numbers
    for (let i = 0; i < 3; i++) {
      password += numbers[Math.floor(Math.random() * numbers.length)]
    }
    
    // Add maximum 3 symbols (random between 1-3)
    const symbolCount = Math.floor(Math.random() * 3) + 1 // 1, 2, or 3 symbols
    for (let i = 0; i < symbolCount; i++) {
      password += symbols[Math.floor(Math.random() * symbols.length)]
    }
    
    // Fill remaining positions with alphabets
    const remainingLength = 12 - password.length
    for (let i = 0; i < remainingLength; i++) {
      password += alphabets[Math.floor(Math.random() * alphabets.length)]
    }
    
    // Shuffle the password to randomize positions
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    // Simulate AI generation delay
    setTimeout(() => {
      setNewPassword(password)
      setIsGenerating(false)
    }, 1000)
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    setIsChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const success = await onChangePassword(currentPassword, newPassword)
      if (success) {
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError('Failed to change password. Please check your current password.')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('An error occurred while changing password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security and privacy</CardDescription>
          </div>
          {!editStates.security ? (
            <Button onClick={() => onEdit('security')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Security
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('security')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('security')} disabled={isLoading}>
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Keep your account secure by regularly updating your password and enabling two-factor authentication.
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={!editStates.security}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!editStates.security}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!editStates.security}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Password Error/Success Messages */}
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={!editStates.security || isChangingPassword}
                onClick={handlePasswordChange}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Button 
                variant="outline" 
                disabled={!editStates.security || isGenerating}
                onClick={generatePassword}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              disabled={!editStates.security} 
              checked={securityData.twoFactorEnabled}
              onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: checked }))}
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Login Sessions</h3>
            {sessions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEndAllOtherSessions}
                disabled={sessionLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                End All Other Sessions
              </Button>
            )}
          </div>
          
          {sessionLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                      {session.deviceInfo.device.toLowerCase().includes('mobile') ? (
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                      ) : session.deviceInfo.device.toLowerCase().includes('tablet') ? (
                        <Tablet className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{session.deviceInfo.browser} on {session.deviceInfo.os}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{session.ipAddress}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(session.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {!session.isActive && session._id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEndSession(session._id!)}
                        disabled={sessionLoading}
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SecuritySettings