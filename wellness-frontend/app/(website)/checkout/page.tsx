"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiV1Url } from "@/lib/utils/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  MapPin,
  Package,
  Tag,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { toast } from "sonner";
import RazorpayButton from "@/components/RazorpayButton";
import Swal from "sweetalert2";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectUser,
  selectIsAuthenticated,
} from "@/lib/redux/features/authSlice";

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems.length, router]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Optional: Redirect to login or show login prompt
      // router.push("/login?redirect=/checkout");
      // For now we might proceed if we want to allow guest checkout but backend requires user ID
      // So we should probably enforce login
      toast.error("Please login to place an order");
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, router, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name as keyof ShippingAddress]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const getFormErrors = (data: ShippingAddress) => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!data.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(data.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!data.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!data.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!data.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!data.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^[0-9]{6}$/.test(data.pinCode)) {
      newErrors.pinCode = "Please enter a valid 6-digit PIN code";
    }

    return newErrors;
  };

  const formErrors = getFormErrors(shippingAddress);
  const isFormValid = Object.keys(formErrors).length === 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    // Simulated coupon validation - in real app, this would be an API call
    if (couponCode.toUpperCase() === "WELLNESS10") {
      setDiscount(cartTotal * 0.1);
      setCouponApplied(true);
      toast.success("Coupon applied! 10% discount added.");
    } else if (couponCode.toUpperCase() === "FIRST20") {
      setDiscount(cartTotal * 0.2);
      setCouponApplied(true);
      toast.success("Coupon applied! 20% discount added.");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscount(0);
    toast.success("Coupon removed");
  };

  const shippingCost = cartTotal >= 500 ? 0 : 49;
  const taxAmount = (cartTotal - discount) * 0.18; // 18% GST
  const finalTotal = cartTotal - discount + shippingCost + taxAmount;

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      setErrors(formErrors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      if (!user?._id) {
        toast.error("User not verified or logged in");
        setIsLoading(false);
        return;
      }

      // Get authentication token
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      // Generate a unique order number (e.g., timestamp + random)
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderPayload = {
        orderNumber,
        user: user._id,
        shippingAddress: shippingAddress, // valid address object
        billingAddress: shippingAddress, // assuming same for now
        items: cartItems.map((item) => ({
          product: item.id, // or item.productId
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
        paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid",
        shippingCost,
        subtotal: cartTotal,
        totalAmount: finalTotal,
        isCouponApplied: couponApplied,
        couponCode,
        discountValue: discount,
        // Add more fields if needed
      };

      const response = await axios.post(getApiV1Url("/orders"), orderPayload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      clearCart();
      setIsOrderPlaced(true);
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Track Order",
      }).then(() => {
        router.push("/track-order");
      });
    } catch (error: any) {
      // Show backend error message if available
      console.error("Order API Error:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRazorpayClick = () => {
    if (!isFormValid) {
      setErrors(formErrors);
      toast.error("Please fill in all required fields correctly");
      return false;
    }
    return true;
  };

  // Handle Razorpay payment success
  const handleRazorpaySuccess = async (paymentData: any) => {
    setIsLoading(true);
    try {
      if (!user?._id) {
        toast.error("User not verified or logged in");
        setIsLoading(false);
        return;
      }

      // Get authentication token
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      // Generate a unique order number (e.g., timestamp + random)
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderPayload = {
        orderNumber,
        user: user._id,
        shippingAddress: shippingAddress, // valid address object
        billingAddress: shippingAddress,
        items: cartItems.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        paymentMethod: "Online",
        paymentStatus: "Paid",
        shippingCost,
        subtotal: cartTotal,
        totalAmount: finalTotal,
        isCouponApplied: couponApplied,
        couponCode,
        discountValue: discount,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
      };

      const response = await axios.post(getApiV1Url("/orders"), orderPayload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      clearCart();
      setIsOrderPlaced(true);
      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Track Order",
      }).then(() => {
        router.push("/track-order");
      });
    } catch (error: any) {
      console.error("Order API Error:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Razorpay payment failure
  const handleRazorpayFailure = (error: any) => {
    toast.error("Payment failed. Please try again.");
    console.error("Razorpay Failure:", error);
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-blue-100 dark:border-blue-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>
          <Button
            onClick={() => router.push("/track-order")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
          >
            Track Order
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Back to Cart */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping & Payment Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    className={`${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={`${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    placeholder="House no., Building, Street, Area"
                    className={`${errors.address ? "border-red-500" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    City *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className={`${errors.city ? "border-red-500" : ""}`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="Enter your state"
                    className={`${errors.state ? "border-red-500" : ""}`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="pinCode"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    PIN Code *
                  </Label>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    value={shippingAddress.pinCode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit PIN code"
                    className={`${errors.pinCode ? "border-red-500" : ""}`}
                  />
                  {errors.pinCode && (
                    <p className="text-red-500 text-sm">{errors.pinCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="landmark"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Landmark (Optional)
                  </Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    value={shippingAddress.landmark}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pay when your order is delivered
                    </p>
                  </div>
                  <Package className="w-6 h-6 text-slate-400" />
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Online Payment
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pay securely with UPI, Card, or Net Banking
                    </p>
                  </div>
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-800/30 sticky top-32">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Coupon Code
                  </span>
                </div>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        {couponCode.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST (18%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              {/* Place Order/Pay Now Button */}
              {paymentMethod === "online" ? (
                <div className="mt-6">
                  <RazorpayButton
                    amount={finalTotal}
                    currency="INR"
                    userData={{
                      name: shippingAddress.name,
                      email: shippingAddress.email,
                      contact: shippingAddress.phone,
                    }}
                    onSuccess={handleRazorpaySuccess}
                    onFailure={handleRazorpayFailure}
                    disabled={isLoading}
                    onPaymentStart={handleRazorpayClick}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold rounded-full py-4 shadow-xl shadow-blue-500/50 disabled:opacity-70"
                  >
                    Place Order
                  </RazorpayButton>
                </div>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  size="lg"
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold rounded-full py-4 shadow-xl shadow-blue-500/50 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 dark:text-slate-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Secure Checkout</span>
              </div>

              {/* Delivery Info */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
                  <Truck className="w-4 h-4" />
                  <span className="font-medium">
                    Expected Delivery: 3-5 Business Days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
