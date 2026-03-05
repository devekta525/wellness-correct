'use client'

import React, { useState } from 'react'
import { Shield, CreditCard, Download, Key, Lock, Eye, EyeOff, Smartphone, History, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface SecuritySettingsProps {
  onChangePassword: () => void
  onPaymentMethods: () => void
  onDownloadData: () => void
  onDeleteAccount: () => void
  onTwoFactorAuth: () => void
  onLoginHistory: () => void
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onChangePassword,
  onPaymentMethods,
  onDownloadData,
  onDeleteAccount,
  onTwoFactorAuth,
  onLoginHistory
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Password Security */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <CardHeader className="p-6 sm:p-8 pb-2">
          <CardTitle className="flex items-center gap-3 text-xl font-bold dark:text-white">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4 space-y-6 sm:space-y-8 flex flex-col items-start">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 px-4 font-medium transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1 h-10 w-10 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 px-4 font-medium transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1 h-10 w-10 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 px-4 font-medium transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1 h-10 w-10 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={onChangePassword} className="w-full sm:w-auto h-12 px-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 transition-all font-bold gap-2 active:scale-95 group">
            <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Secure Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <CardHeader className="p-6 sm:p-8 pb-2">
          <CardTitle className="flex items-center gap-3 text-xl font-bold dark:text-white">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            Multi-Factor Auth
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4 space-y-6 flex flex-col items-start">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-blue-200 dark:hover:border-blue-500/30">
            <div className="space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">2FA Security Layer</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">Add an extra layer of biometric or code security</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              className="data-[state=checked]:bg-blue-600 shrink-0 scale-110"
            />
          </div>

          <Button
            variant="outline"
            onClick={onTwoFactorAuth}
            className="w-full sm:w-auto h-12 rounded-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-bold px-8 transition-colors"
          >
            <Lock className="w-4 h-4 mr-2" />
            {twoFactorEnabled ? 'Manage Security' : 'Enable Setup'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Control Center */}
      <Card className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative mb-8">
        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <CardHeader className="p-6 sm:p-8 pb-2">
          <CardTitle className="flex items-center gap-3 text-xl font-bold dark:text-white">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            Security Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-40 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all gap-3 group"
              onClick={onLoginHistory}
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-slate-900 dark:text-white text-[15px]">Login History</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Audit Logs</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-40 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all gap-3 group"
              onClick={onPaymentMethods}
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-slate-900 dark:text-white text-[15px]">Finances</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Payments & Methods</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-40 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-200 transition-all gap-3 group"
              onClick={onDownloadData}
            >
              <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-slate-900 dark:text-white text-[15px]">Archives</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Export your Data</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-40 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-red-50 transition-all gap-3 group"
              onClick={onDeleteAccount}
            >
              <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <p className="font-bold text-red-600 dark:text-red-500 text-[15px]">Terminate Account</p>
                <p className="text-xs text-red-500/80 font-medium mt-1">Danger Zone</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card >
    </div >
  )
}

export default SecuritySettings

