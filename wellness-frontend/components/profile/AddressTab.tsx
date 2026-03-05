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
    <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 h-64">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-full">
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-1/4 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="space-y-3 py-6">
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
      </div>
      <div className="mt-auto flex gap-3 pt-2">
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            <MapPin className="h-7 w-7 text-indigo-500" />
            Saved Addresses
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Manage your delivery locations for a faster checkout experience. Set a default address to save time during checkout.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 px-6 py-5 sm:py-6 text-sm font-bold transition-all hover:scale-105"
          disabled={loading}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Error State */}
      {error && !loading && displayAddresses.length === 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/30 dark:bg-red-900/10 shadow-sm">
          <p className="flex items-center justify-center gap-2 font-semibold text-red-600 dark:text-red-400 text-sm">
            <X className="h-5 w-5" /> {error}
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
            <div
              key={address._id || index}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${address.isDefault
                  ? "border-indigo-200/60 bg-white shadow-md dark:border-indigo-500/20 dark:bg-slate-800/80"
                  : "border-slate-200/60 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80"
                }`}
            >
              {/* Default Badge absolute positioning */}
              {address.isDefault && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md shadow-orange-500/20">
                  <Star className="h-3.5 w-3.5 fill-current text-white" />
                  DEFAULT
                </div>
              )}

              {/* Card Header Gradient Background */}
              <div className={`p-6 pb-5 ${address.isDefault ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'bg-slate-50/50 dark:bg-slate-900/50'} border-b border-slate-100 dark:border-slate-700/50 relative overflow-hidden`}>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1 pr-20">
                    <div className="flex items-center gap-3 mb-2.5">
                      <Badge
                        variant="secondary"
                        className={`h-7 px-3 py-1 text-[11px] font-bold tracking-wide uppercase shadow-sm border ${address.addressType === "Home"
                            ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
                            : address.addressType === "Work"
                              ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                      >
                        {getAddressTypeIcon(address.addressType)}
                        {address.addressType}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {address.name}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-indigo-400" />
                      {address.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Content */}
              <div className="flex flex-col flex-1 p-6">
                <div className="mb-6 flex-grow space-y-3">
                  <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 mt-0.5 text-indigo-400 shrink-0" />
                    <p className="line-clamp-2 text-sm leading-relaxed font-medium">
                      {address.address}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-900 dark:text-slate-100">
                    <div className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-bold">
                      {address.city}, {address.state} - {address.pinCode}
                    </p>
                  </div>
                  {address.landMark && (
                    <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400 mt-2">
                      <Building2 className="h-4 w-4 mt-0.5 text-indigo-400/70 shrink-0" />
                      <p className="text-sm font-medium italic">
                        Near {address.landMark}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
                  {(!address.isDefault && address._id) && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetDefault(address._id)}
                      className="w-full sm:w-auto h-12 flex-1 rounded-xl font-bold border-indigo-200 text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:border-transparent dark:border-indigo-800 dark:text-indigo-400 transition-all shadow-sm text-sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Set Default
                    </Button>
                  )}

                  <div className={`flex items-center gap-2 w-full ${!address.isDefault ? 'sm:w-auto' : ''}`}>
                    <Button
                      variant="outline"
                      onClick={() => handleEditAddress(address)}
                      className={`h-12 rounded-xl font-bold border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors ${!address.isDefault ? "flex-1 px-5" : "flex-1 w-full"}`}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    {address._id && (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteAddress(address._id)}
                        className="h-12 w-12 shrink-0 rounded-xl border-2 border-red-100 bg-white p-0 text-red-500 hover:border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {displayAddresses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 py-24 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 shadow-inner dark:bg-indigo-900/20">
                <MapPin className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="mb-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                No Addresses Saved
              </h3>
              <p className="max-w-sm text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-8">
                You haven't added any delivery addresses yet. Add one now to speed up your checkout process.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
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
