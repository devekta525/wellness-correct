'use client'

import React from 'react'
import { CreditCard, Truck, Eye, EyeOff, Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface PaymentData {
  currency: string
  paymentMethods: {
    razorpay: {
      enabled: boolean
      keyId: string
      keySecret: string
    }
    paypal: {
      enabled: boolean
      clientId: string
      clientSecret: string
    }
    stripe: {
      enabled: boolean
      publishableKey: string
      secretKey: string
    }
    cod: {
      enabled: boolean
      minAmount: number
      maxAmount: number
    }
  }
  taxSettings: {
    gstRate: number
    cgstRate: number
    sgstRate: number
    igstRate: number
  }
}

interface PaymentSettingsProps {
  paymentData: PaymentData
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentData>>
  editStates: { payments: boolean }
  isLoading: boolean
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  paymentData,
  setPaymentData,
  editStates,
  isLoading,
  showPassword,
  setShowPassword,
  onEdit,
  onCancel,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment gateways and tax settings</CardDescription>
          </div>
          {!editStates.payments ? (
            <Button onClick={() => onEdit('payments')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Payments
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('payments')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('payments')} disabled={isLoading}>
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
          <Label htmlFor="currency">Default Currency</Label>
          <Select value={paymentData.currency} onValueChange={(value) => setPaymentData({...paymentData, currency: value})} disabled={!editStates.payments}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="GBP">British Pound (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Gateways</h3>
          <div className="space-y-6">
            {/* Razorpay */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Razorpay</h4>
                    <p className="text-sm text-muted-foreground">Accept payments via Razorpay</p>
                  </div>
                </div>
                <Switch
                  checked={paymentData.paymentMethods.razorpay.enabled}
                  onCheckedChange={(checked: boolean) => setPaymentData({
                    ...paymentData,
                    paymentMethods: {
                      ...paymentData.paymentMethods,
                      razorpay: {
                        ...paymentData.paymentMethods.razorpay,
                        enabled: checked
                      }
                    }
                  })}
                  disabled={!editStates.payments}
                />
              </div>
              {paymentData.paymentMethods.razorpay.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razorpayKeyId">Key ID</Label>
                    <Input
                      id="razorpayKeyId"
                      value={paymentData.paymentMethods.razorpay.keyId}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        paymentMethods: {
                          ...paymentData.paymentMethods,
                          razorpay: {
                            ...paymentData.paymentMethods.razorpay,
                            keyId: e.target.value
                          }
                        }
                      })}
                      disabled={!editStates.payments}
                    />
                  </div>
                  <div>
                    <Label htmlFor="razorpayKeySecret">Key Secret</Label>
                    <div className="relative">
                      <Input
                        id="razorpayKeySecret"
                        type={showPassword ? "text" : "password"}
                        value={paymentData.paymentMethods.razorpay.keySecret}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          paymentMethods: {
                            ...paymentData.paymentMethods,
                            razorpay: {
                              ...paymentData.paymentMethods.razorpay,
                              keySecret: e.target.value
                            }
                          }
                        })}
                        disabled={!editStates.payments}
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
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cash on Delivery</h4>
                    <p className="text-sm text-muted-foreground">Accept cash payments on delivery</p>
                  </div>
                </div>
                <Switch
                  checked={paymentData.paymentMethods.cod.enabled}
                  onCheckedChange={(checked: boolean) => setPaymentData({
                    ...paymentData,
                    paymentMethods: {
                      ...paymentData.paymentMethods,
                      cod: {
                        ...paymentData.paymentMethods.cod,
                        enabled: checked
                      }
                    }
                  })}
                  disabled={!editStates.payments}
                />
              </div>
              {paymentData.paymentMethods.cod.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codMinAmount">Minimum Amount</Label>
                    <Input
                      id="codMinAmount"
                      type="number"
                      value={paymentData.paymentMethods.cod.minAmount}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        paymentMethods: {
                          ...paymentData.paymentMethods,
                          cod: {
                            ...paymentData.paymentMethods.cod,
                            minAmount: Number(e.target.value)
                          }
                        }
                      })}
                      disabled={!editStates.payments}
                    />
                  </div>
                  <div>
                    <Label htmlFor="codMaxAmount">Maximum Amount</Label>
                    <Input
                      id="codMaxAmount"
                      type="number"
                      value={paymentData.paymentMethods.cod.maxAmount}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        paymentMethods: {
                          ...paymentData.paymentMethods,
                          cod: {
                            ...paymentData.paymentMethods.cod,
                            maxAmount: Number(e.target.value)
                          }
                        }
                      })}
                      disabled={!editStates.payments}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                type="number"
                value={paymentData.taxSettings.gstRate}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  taxSettings: {
                    ...paymentData.taxSettings,
                    gstRate: Number(e.target.value)
                  }
                })}
                disabled={!editStates.payments}
              />
            </div>
            <div>
              <Label htmlFor="cgstRate">CGST Rate (%)</Label>
              <Input
                id="cgstRate"
                type="number"
                value={paymentData.taxSettings.cgstRate}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  taxSettings: {
                    ...paymentData.taxSettings,
                    cgstRate: Number(e.target.value)
                  }
                })}
                disabled={!editStates.payments}
              />
            </div>
            <div>
              <Label htmlFor="sgstRate">SGST Rate (%)</Label>
              <Input
                id="sgstRate"
                type="number"
                value={paymentData.taxSettings.sgstRate}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  taxSettings: {
                    ...paymentData.taxSettings,
                    sgstRate: Number(e.target.value)
                  }
                })}
                disabled={!editStates.payments}
              />
            </div>
            <div>
              <Label htmlFor="igstRate">IGST Rate (%)</Label>
              <Input
                id="igstRate"
                type="number"
                value={paymentData.taxSettings.igstRate}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  taxSettings: {
                    ...paymentData.taxSettings,
                    igstRate: Number(e.target.value)
                  }
                })}
                disabled={!editStates.payments}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentSettings
