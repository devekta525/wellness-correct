'use client'

import React from 'react'
import { Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface NotificationData {
  emailNotifications: {
    orderUpdates: boolean
    newOrders: boolean
    lowStock: boolean
    customerReviews: boolean
    marketingEmails: boolean
    systemAlerts: boolean
  }
  smsNotifications: {
    orderUpdates: boolean
    newOrders: boolean
    lowStock: boolean
    systemAlerts: boolean
  }
  pushNotifications: {
    orderUpdates: boolean
    newOrders: boolean
    lowStock: boolean
    customerReviews: boolean
    systemAlerts: boolean
  }
}

interface NotificationSettingsProps {
  notificationData: NotificationData
  setNotificationData: React.Dispatch<React.SetStateAction<NotificationData>>
  editStates: { notifications: boolean }
  isLoading: boolean
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationData,
  setNotificationData,
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
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Configure how you want to receive notifications</CardDescription>
          </div>
          {!editStates.notifications ? (
            <Button onClick={() => onEdit('notifications')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Notifications
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('notifications')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('notifications')} disabled={isLoading}>
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
        <div>
          <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-4">
            {Object.entries(notificationData.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {key === 'orderUpdates' && 'Get notified when order status changes'}
                    {key === 'newOrders' && 'Receive alerts for new orders'}
                    {key === 'lowStock' && 'Get notified when inventory is low'}
                    {key === 'customerReviews' && 'Receive notifications for new reviews'}
                    {key === 'marketingEmails' && 'Receive promotional emails and updates'}
                    {key === 'systemAlerts' && 'Get important system notifications'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked: boolean) => setNotificationData({
                    ...notificationData,
                    emailNotifications: {
                      ...notificationData.emailNotifications,
                      [key]: checked
                    }
                  })}
                  disabled={!editStates.notifications}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">SMS Notifications</h3>
          <div className="space-y-4">
            {Object.entries(notificationData.smsNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {key === 'orderUpdates' && 'Get SMS when order status changes'}
                    {key === 'newOrders' && 'Receive SMS alerts for new orders'}
                    {key === 'lowStock' && 'Get SMS when inventory is low'}
                    {key === 'systemAlerts' && 'Get important system SMS notifications'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked: boolean) => setNotificationData({
                    ...notificationData,
                    smsNotifications: {
                      ...notificationData.smsNotifications,
                      [key]: checked
                    }
                  })}
                  disabled={!editStates.notifications}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
          <div className="space-y-4">
            {Object.entries(notificationData.pushNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {key === 'orderUpdates' && 'Get push notifications when order status changes'}
                    {key === 'newOrders' && 'Receive push alerts for new orders'}
                    {key === 'lowStock' && 'Get push notifications when inventory is low'}
                    {key === 'customerReviews' && 'Receive push notifications for new reviews'}
                    {key === 'systemAlerts' && 'Get important system push notifications'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked: boolean) => setNotificationData({
                    ...notificationData,
                    pushNotifications: {
                      ...notificationData.pushNotifications,
                      [key]: checked
                    }
                  })}
                  disabled={!editStates.notifications}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationSettings
