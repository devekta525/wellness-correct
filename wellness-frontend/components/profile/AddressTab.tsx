"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
  Building2,
  Loader2,
  Star,
  MoreVertical,
  Phone,
} from "lucide-react";
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
import Swal from "sweetalert2";
import { selectUser } from "@/lib/redux/features/authSlice";

interface AddressItem {
  _id?: string;
  addressType: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  landMark?: string;
  isDefault: boolean;
}

const AddressTab = () => {
  const currentUser = useAppSelector(selectUser);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAddresses = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError(""); // Clear previous errors before a new request
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/addresses/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setAddresses(response.data.data.addresses || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [currentUser]);

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

  const displayAddresses: AddressItem[] = addresses.length > 0
    ? addresses
    : (currentUser?.address ? [
      {
        addressType: "Home",
        name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "My Address",
        address: currentUser.address,
        city: currentUser.city || "",
        state: currentUser.state || "",
        pinCode: currentUser.zipCode ? String(currentUser.zipCode) : "",
        phone: currentUser.phone || "",
        isDefault: true,
      }
    ] : []);

  const refreshAddresses = () => {
    fetchAddresses();
  };

  const handleAddAddress = async () => {
    if (!currentUser?._id) {
      Swal.fire("Error", "You must be logged in to manage addresses.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (editingAddress && editingAddressId) {
        // Update existing address - Use PUT
        await axios.put(
          `${apiUrl}/v1/addresses/${editingAddressId}`,
          newAddress,
          config
        );
      } else {
        // Add new address - Use POST
        // The backend uses req.user._id, so no need to send userId in the body
        await axios.post(
          `${apiUrl}/v1/addresses/add`,
          newAddress,
          config
        );
      }

      Swal.fire({
        icon: "success",
        title: editingAddress
          ? "Address updated successfully"
          : "Address added successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      setEditingAddress(null);
      setEditingAddressId(null);
      setShowAddDialog(false);
      resetForm();
      refreshAddresses();
    } catch (err: any) {
      console.error("Error saving address:", err);
      Swal.fire("Save Failed", err.message || "An error occurred.", "error");
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
    setNewAddress({
      addressType: address.addressType || "Home",
      name: address.name || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pinCode: address.pinCode || "",
      phone: address.phone || "",
      landMark: address.landMark || "",
      isDefault: address.isDefault || false,
    });
    setShowAddDialog(true);
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!currentUser?._id || !addressId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This address will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/addresses/${addressId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire("Deleted!", "Your address has been deleted.", "success");
        refreshAddresses();
      } catch (err: any) {
        Swal.fire("Error!", err.message || "Could not delete address.", "error");
      }
    }
  };

  const handleSetDefault = async (addressId?: string) => {
    if (!currentUser?._id || !addressId) return;

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/addresses/${addressId}/default`,
        {}, // PATCH request with an empty body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Default address updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      refreshAddresses();
    } catch (err: any) {
      Swal.fire(
        "Error!",
        err.message || "Could not update default address.",
        "error",
      );
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "Home":
        return <Home className="w-3.5 h-3.5 mr-1" />;
      case "Work":
        return <Briefcase className="w-3.5 h-3.5 mr-1" />;
      default:
        return <MapPin className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const AddressSkeleton = () => (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full">
          <div className="h-5 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-1/4 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="space-y-2 py-4">
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
      </div>
      <div className="mt-auto flex gap-2 pt-2">
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <MapPin className="h-6 w-6 text-primary" />
            Saved Addresses
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your delivery locations for a faster checkout experience.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Error State */}
      {error && !loading && displayAddresses.length === 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/10">
          <p className="flex items-center justify-center gap-2 font-medium text-red-600 dark:text-red-400">
            <X className="h-4 w-4" /> {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <AddressSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Addresses Grid */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayAddresses.map((address: AddressItem, index: number) => (
            <Card
              key={address._id || index}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${address.isDefault
                  ? "border-primary/40 bg-primary/5 shadow-md"
                  : "border-slate-200 bg-white hover:border-primary/30 dark:border-slate-800 dark:bg-slate-950"
                }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 z-20 flex items-center gap-1 rounded-bl-xl bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                  <Star className="h-3 w-3 fill-current text-yellow-300" />
                  DEFAULT
                </div>
              )}

              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                          {address.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`h-5 border-0 px-2 py-0 text-[10px] font-medium ${address.addressType === "Home"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : address.addressType === "Work"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                        >
                          {getAddressTypeIcon(address.addressType)}
                          {address.addressType}
                        </Badge>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Phone className="h-3 w-3" />
                        {address.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 mt-4 flex-grow">
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {address.address}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {address.city}, {address.state} - {address.pinCode}
                  </p>
                  {address.landMark && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Building2 className="h-3 w-3" />
                      Near {address.landMark}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {(!address.isDefault && address._id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(address._id)}
                      className="h-9 flex-1 border-slate-200 text-xs transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                      Set Default
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditAddress(address)}
                    className={`h-9 gap-1.5 border-slate-200 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 ${!address.isDefault ? "w-auto px-3" : "flex-1"
                      }`}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                    Edit
                  </Button>

                  {address._id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAddress(address._id)}
                      className="h-9 w-9 border-slate-200 p-0 text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {displayAddresses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-20 text-center dark:border-slate-700 dark:bg-slate-900/20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <MapPin className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                No Addresses Saved
              </h3>
              <p className="max-w-sm text-slate-500 dark:text-slate-400 mb-8">
                You haven't added any delivery addresses yet. Add one now to speed up your checkout process.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add First Address
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader>
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                {editingAddress ? (
                  <Edit2 className="w-5 h-5 text-primary" />
                ) : (
                  <Plus className="w-5 h-5 text-primary" />
                )}
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                {editingAddress
                  ? "Update your address information"
                  : "Add a new delivery address"}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</Label>
                <Input
                  id="address-name"
                  value={newAddress.name || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, name: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  className="h-11 border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-type" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address Type</Label>
                <Select
                  value={newAddress.addressType}
                  onValueChange={(value: "Home" | "Work" | "Other") =>
                    setNewAddress({ ...newAddress, addressType: value })
                  }
                >
                  <SelectTrigger className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" /> Home
                      </div>
                    </SelectItem>
                    <SelectItem value="Work">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Work
                      </div>
                    </SelectItem>
                    <SelectItem value="Other">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Street Address</Label>
              <Input
                id="address"
                value={newAddress.address || ""}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                placeholder="House No., Building, Street Area"
                className="h-11 border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-slate-500">City</Label>
                <Input
                  id="city"
                  value={newAddress.city || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  placeholder="City"
                  className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wider text-slate-500">State</Label>
                <Input
                  id="state"
                  value={newAddress.state || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  placeholder="State"
                  className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode" className="text-xs font-semibold uppercase tracking-wider text-slate-500">PIN Code</Label>
                <Input
                  id="pinCode"
                  value={newAddress.pinCode || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, pinCode: e.target.value })
                  }
                  placeholder="PIN Code"
                  className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landMark" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Landmark</Label>
                <Input
                  id="landMark"
                  value={newAddress.landMark || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, landMark: e.target.value })
                  }
                  placeholder="Near..."
                  className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</Label>
                <Input
                  id="phone"
                  value={newAddress.phone || ""}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                  placeholder="10-digit mobile number"
                  className="h-11 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-slate-100 bg-slate-50 p-4 pt-2 dark:border-slate-800 dark:bg-slate-900/50">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault || false}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, isDefault: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isDefault" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                Use as default delivery address
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleAddAddress} className="gap-2 h-11 rounded-full px-8 shadow-lg shadow-primary/20">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {editingAddress ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressTab;
