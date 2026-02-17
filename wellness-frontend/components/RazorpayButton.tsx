"use client";
import React, { useState } from "react";
import Script from "next/script";
import { getApiV1Url } from "../lib/utils/api";

interface RazorpayButtonProps {
  amount: number;
  currency?: string;
  userData: {
    name: string;
    email: string;
    contact: string;
  };
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  onPaymentStart?: () => boolean;
  className?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  amount,
  currency = "INR",
  userData,
  onSuccess,
  onFailure,
  disabled,
  children,
  onPaymentStart,
  className,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (onPaymentStart && !onPaymentStart()) {
      return;
    }
    setLoading(true);
    try {
      // Ensure amount is an integer in paise (for INR)
      const amountInPaise = Math.round(amount);
      const res = await fetch(getApiV1Url("/razorpay/order"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountInPaise, currency }),
      });
      const orderData = await res.json();

      if (!orderData.id) {
        throw new Error("Order creation failed");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Wellness Fuel",
        description: "Transaction",
        image: "/logo.png", // Replace with your logo URL
        order_id: orderData.id,
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch(getApiV1Url("/razorpay/verify"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onSuccess(response);
            } else {
              onFailure(verifyData);
            }
          } catch (err) {
            onFailure(err);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
        },
        notes: {
          address: "Wellness Fuel Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        onFailure(response.error);
      });
      rzp1.open();
    } catch (error) {
      console.error("Payment error:", error);
      onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className={
          className ||
          "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        }
      >
        {loading ? "Processing..." : children || "Pay Now"}
      </button>
    </>
  );
};

export default RazorpayButton;
