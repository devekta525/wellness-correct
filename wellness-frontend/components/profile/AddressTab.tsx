"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  selectAddressData,
  selectAddressError,
  selectAddressLoading,
  fetchUserAddresses,
  addNewAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  Address,
} from "@/lib/redux/features/addressSlice";
import { selectUser } from "@/lib/redux/features/authSlice";

// Use the Address interface from addressSlice
type AddressItem = Address["addresses"][0];

interface AddressTabProps {
  addresses?: AddressItem[];
}

const AddressTab: React.FC<AddressTabProps> = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const addressData = useAppSelector(selectAddressData);
  const loading = useAppSelector(selectAddressLoading);
  const error = useAppSelector(selectAddressError);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchUserAddresses(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<AddressItem>>({
    addressType: "Home",
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    landMark: "",
    isDefault: false,
  });

  const refreshAddresses = () => {
    if (currentUser?._id) {
      dispatch(fetchUserAddresses(currentUser._id));
    }
  };

  const handleAddAddress = async () => {
    if (!currentUser?._id) return;

    if (editingAddress && editingAddressId) {
      // Update existing address
      const success = await dispatch(
        updateAddress(
          currentUser._id,
          editingAddressId,
          newAddress as AddressItem,
        ),
      );
      if (success) {
        setEditingAddress(null);
        setEditingAddressId(null);
        setShowAddDialog(false);
        resetForm();
        refreshAddresses();
      }
    } else {
      // Add new address
      const success = await dispatch(
        addNewAddress(currentUser._id, newAddress as AddressItem),
      );
      if (success) {
        setShowAddDialog(false);
        resetForm();
        refreshAddresses();
      }
    }
  };

  const resetForm = () => {
    setNewAddress({
      addressType: "Home",
      name: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      phone: "",
      landMark: "",
      isDefault: false,
    });
  };

  const handleEditAddress = (address: AddressItem) => {
    setEditingAddress(address);
    setEditingAddressId(address._id || null);
    setNewAddress(address);
    setShowAddDialog(true);
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!currentUser?._id) return;
    if (!addressId) return;

    const success = await dispatch(deleteAddress(currentUser._id, addressId));
    if (success) {
      refreshAddresses();
    }
  };

  const handleSetDefault = async (addressId?: string) => {
    if (!currentUser?._id) return;
    if (!addressId) return;

    const success = await dispatch(
      setDefaultAddress(currentUser._id, addressId),
    );
    if (success) {
      refreshAddresses();
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "Home":
        return "bg-blue-100 text-blue-800";
      case "Work":
        return "bg-green-100 text-green-800";
      case "Other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Addresses</h2>
          <p className="text-muted-foreground">
            Manage your delivery addresses
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading addresses...</p>
        </div>
      )}

      {/* Addresses Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addressData?.addresses.map((address: AddressItem, index: number) => (
            <Card
              key={address._id || index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{address.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getAddressTypeColor(address.addressType)}>
                      {address.addressType}
                    </Badge>
                    {address.isDefault && (
                      <Badge variant="default" className="bg-green-600">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{address.address}</p>
                  <p>
                    {address.city}, {address.state} {address.pinCode}
                  </p>
                  <p>{address.landMark}</p>
                  <p className="mt-2">Phone: {address.phone}</p>
                </div>

                <div className="flex gap-2 pt-3">
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(address._id)}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditAddress(address)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteAddress(address._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!addressData?.addresses ||
            addressData.addresses[0] === undefined) && (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No addresses added
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first address to get started
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update your address information"
                : "Add a new delivery address"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address-name">Address Name</Label>
                <Input
                  id="address-name"
                  value={newAddress.name || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, name: e.target.value })
                  }
                  placeholder="e.g., Home, Office"
                />
              </div>
              <div>
                <Label htmlFor="address-type">Address Type</Label>
                <Select
                  value={newAddress.addressType}
                  onValueChange={(value: "Home" | "Work" | "Other") =>
                    setNewAddress({ ...newAddress, addressType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={newAddress.address || ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newAddress.city || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newAddress.state || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pinCode">PIN Code</Label>
                <Input
                  id="pinCode"
                  value={newAddress.pinCode || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pinCode: e.target.value })
                  }
                  placeholder="PIN Code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landMark">Landmark</Label>
                <Input
                  id="landMark"
                  value={newAddress.landMark || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, landMark: e.target.value })
                  }
                  placeholder="Landmark"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newAddress.phone || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault || false}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddAddress}>
              <Check className="w-4 h-4 mr-2" />
              {editingAddress ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressTab;
