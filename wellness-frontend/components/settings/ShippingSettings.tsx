'use client'

import React from 'react'
import { Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface ShippingZone {
  id: number
  name: string
  rate: number
  freeShipping: number
}

interface ShippingData {
  defaultShippingRate: number
  freeShippingThreshold: number
  shippingZones: ShippingZone[]
  deliveryTime: {
    standard: string
    express: string
    overnight: string
  }
}

interface ShippingSettingsProps {
  shippingData: ShippingData
  setShippingData: React.Dispatch<React.SetStateAction<ShippingData>>
  editStates: { shipping: boolean }
  isLoading: boolean
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
}

const ShippingSettings: React.FC<ShippingSettingsProps> = ({
  shippingData,
  setShippingData,
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
            <CardTitle>Shipping Settings</CardTitle>
            <CardDescription>Configure shipping rates and delivery options</CardDescription>
          </div>
          {!editStates.shipping ? (
            <Button onClick={() => onEdit('shipping')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Shipping
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('shipping')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('shipping')} disabled={isLoading}>
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
            <Label htmlFor="defaultShippingRate">Default Shipping Rate (₹)</Label>
            <Input
              id="defaultShippingRate"
              type="number"
              value={shippingData.defaultShippingRate}
              onChange={(e) => setShippingData({...shippingData, defaultShippingRate: Number(e.target.value)})}
              disabled={!editStates.shipping}
            />
          </div>
          <div>
            <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              value={shippingData.freeShippingThreshold}
              onChange={(e) => setShippingData({...shippingData, freeShippingThreshold: Number(e.target.value)})}
              disabled={!editStates.shipping}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Shipping Zones</h3>
          <div className="space-y-4">
            {shippingData.shippingZones.map((zone) => (
              <div key={zone.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Zone Name</Label>
                    <Input value={zone.name} readOnly />
                  </div>
                  <div>
                    <Label>Shipping Rate (₹)</Label>
                    <Input
                      type="number"
                      value={zone.rate}
                      onChange={(e) => {
                        const updatedZones = shippingData.shippingZones.map(z => 
                          z.id === zone.id ? {...z, rate: Number(e.target.value)} : z
                        )
                        setShippingData({...shippingData, shippingZones: updatedZones})
                      }}
                      disabled={!editStates.shipping}
                    />
                  </div>
                  <div>
                    <Label>Free Shipping Threshold (₹)</Label>
                    <Input
                      type="number"
                      value={zone.freeShipping}
                      onChange={(e) => {
                        const updatedZones = shippingData.shippingZones.map(z => 
                          z.id === zone.id ? {...z, freeShipping: Number(e.target.value)} : z
                        )
                        setShippingData({...shippingData, shippingZones: updatedZones})
                      }}
                      disabled={!editStates.shipping}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Timeframes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="standardDelivery">Standard Delivery</Label>
              <Input
                id="standardDelivery"
                value={shippingData.deliveryTime.standard}
                onChange={(e) => setShippingData({
                  ...shippingData,
                  deliveryTime: {
                    ...shippingData.deliveryTime,
                    standard: e.target.value
                  }
                })}
                disabled={!editStates.shipping}
              />
            </div>
            <div>
              <Label htmlFor="expressDelivery">Express Delivery</Label>
              <Input
                id="expressDelivery"
                value={shippingData.deliveryTime.express}
                onChange={(e) => setShippingData({
                  ...shippingData,
                  deliveryTime: {
                    ...shippingData.deliveryTime,
                    express: e.target.value
                  }
                })}
                disabled={!editStates.shipping}
              />
            </div>
            <div>
              <Label htmlFor="overnightDelivery">Overnight Delivery</Label>
              <Input
                id="overnightDelivery"
                value={shippingData.deliveryTime.overnight}
                onChange={(e) => setShippingData({
                  ...shippingData,
                  deliveryTime: {
                    ...shippingData.deliveryTime,
                    overnight: e.target.value
                  }
                })}
                disabled={!editStates.shipping}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingSettings
