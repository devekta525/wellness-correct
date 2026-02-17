"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Search,
    Package,
    Truck,
    CheckCircle,
    Clock,
    MapPin,
    Calendar,
    ArrowLeft,
    Loader2,
    XCircle,
    Box,
    Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Order status types
type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";

interface TrackingStep {
    status: OrderStatus;
    title: string;
    description: string;
    date?: string;
    time?: string;
    location?: string;
    completed: boolean;
    current: boolean;
}

interface OrderDetails {
    orderNumber: string;
    status: OrderStatus;
    orderDate: string;
    estimatedDelivery: string;
    shippingAddress: string;
    trackingNumber?: string;
    carrier?: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        image: string;
    }[];
    timeline: TrackingStep[];
}

// Mock function to simulate API call - in real app, this would fetch from backend
const getOrderDetails = async (orderNumber: string): Promise<OrderDetails | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock order data - in real app, this would come from API
    const mockOrders: Record<string, OrderDetails> = {
        "ORD-2024-001": {
            orderNumber: "ORD-2024-001",
            status: "Shipped",
            orderDate: "2024-01-05",
            estimatedDelivery: "2024-01-10",
            shippingAddress: "123 Wellness Street, Health City, HC 500001",
            trackingNumber: "TRK123456789IN",
            carrier: "BlueDart Express",
            items: [
                { name: "Forever Gut", quantity: 2, price: 1477, image: "/supplement-jar-blue.png" },
                { name: "Longevity Pro", quantity: 1, price: 2774, image: "/supplement-bottle-blue.png" },
            ],
            timeline: [
                { status: "Pending", title: "Order Placed", description: "Your order has been placed successfully", date: "Jan 5, 2024", time: "10:30 AM", completed: true, current: false },
                { status: "Confirmed", title: "Order Confirmed", description: "Your order has been confirmed and is being prepared", date: "Jan 5, 2024", time: "11:45 AM", completed: true, current: false },
                { status: "Processing", title: "Processing", description: "Your order is being processed and packed", date: "Jan 6, 2024", time: "09:00 AM", location: "Warehouse - Mumbai", completed: true, current: false },
                { status: "Shipped", title: "Shipped", description: "Your package has been shipped", date: "Jan 7, 2024", time: "02:30 PM", location: "Hub - Delhi", completed: true, current: true },
                { status: "Out for Delivery", title: "Out for Delivery", description: "Your package is out for delivery", completed: false, current: false },
                { status: "Delivered", title: "Delivered", description: "Package delivered successfully", completed: false, current: false },
            ],
        },
        "ORD-2024-002": {
            orderNumber: "ORD-2024-002",
            status: "Delivered",
            orderDate: "2024-01-01",
            estimatedDelivery: "2024-01-06",
            shippingAddress: "456 Health Avenue, Wellness Town, WT 600001",
            trackingNumber: "TRK987654321IN",
            carrier: "DTDC",
            items: [
                { name: "Complete Gut Fibre", quantity: 3, price: 974, image: "/supplement-jar-blue.png" },
            ],
            timeline: [
                { status: "Pending", title: "Order Placed", description: "Your order has been placed successfully", date: "Jan 1, 2024", time: "03:15 PM", completed: true, current: false },
                { status: "Confirmed", title: "Order Confirmed", description: "Your order has been confirmed", date: "Jan 1, 2024", time: "04:00 PM", completed: true, current: false },
                { status: "Processing", title: "Processing", description: "Your order is being processed", date: "Jan 2, 2024", time: "10:00 AM", location: "Warehouse - Chennai", completed: true, current: false },
                { status: "Shipped", title: "Shipped", description: "Your package has been shipped", date: "Jan 3, 2024", time: "11:30 AM", location: "Hub - Bangalore", completed: true, current: false },
                { status: "Out for Delivery", title: "Out for Delivery", description: "Your package is out for delivery", date: "Jan 5, 2024", time: "08:00 AM", location: "Local Hub - Pune", completed: true, current: false },
                { status: "Delivered", title: "Delivered", description: "Package delivered successfully", date: "Jan 5, 2024", time: "02:45 PM", location: "Delivered to: John Doe", completed: true, current: true },
            ],
        },
    };

    return mockOrders[orderNumber.toUpperCase()] || null;
};

const getStatusIcon = (status: OrderStatus, completed: boolean, current: boolean) => {
    if (status === "Cancelled" || status === "Returned") {
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (completed) {
        return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (current) {
        return <div className="w-6 h-6 rounded-full bg-blue-500 animate-pulse" />;
    }
    return <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600" />;
};

const getStepIcon = (status: OrderStatus) => {
    switch (status) {
        case "Pending":
            return <Clock className="w-5 h-5" />;
        case "Confirmed":
            return <CheckCircle className="w-5 h-5" />;
        case "Processing":
            return <Box className="w-5 h-5" />;
        case "Shipped":
            return <Truck className="w-5 h-5" />;
        case "Out for Delivery":
            return <MapPin className="w-5 h-5" />;
        case "Delivered":
            return <Home className="w-5 h-5" />;
        default:
            return <Package className="w-5 h-5" />;
    }
};

const OrderTrackingPage = () => {
    const [orderNumber, setOrderNumber] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrackOrder = async () => {
        if (!orderNumber.trim()) {
            toast.error("Please enter an order number");
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const result = await getOrderDetails(orderNumber.trim());
            setOrderDetails(result);

            if (!result) {
                toast.error("Order not found. Please check your order number.");
            }
        } catch (error) {
            toast.error("Failed to fetch order details. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleTrackOrder();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                        Track Your Order
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Enter your order number to track the status of your delivery
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 dark:border-blue-800/30 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter Order Number (e.g., ORD-2024-001)"
                                className="pl-12 h-12 text-lg"
                            />
                        </div>
                        <Button
                            onClick={handleTrackOrder}
                            disabled={isSearching}
                            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Track Order
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        💡 Try these demo order numbers: <span className="font-mono text-blue-600">ORD-2024-001</span> or <span className="font-mono text-blue-600">ORD-2024-002</span>
                    </p>
                </div>

                {/* Order Not Found */}
                {hasSearched && !isSearching && !orderDetails && (
                    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 shadow-xl border border-red-100 dark:border-red-800/30 text-center">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Order Not Found
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We couldn&apos;t find an order with the number &quot;{orderNumber}&quot;. Please check your order number and try again.
                        </p>
                        <Link href="/profile?tab=orders">
                            <Button variant="outline" className="border-blue-500 text-blue-600">
                                View My Orders
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Order Details */}
                {orderDetails && (
                    <div className="space-y-6">
                        {/* Order Summary Card */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        Order {orderDetails.orderNumber}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Placed on {new Date(orderDetails.orderDate).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold ${orderDetails.status === "Delivered"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : orderDetails.status === "Cancelled" || orderDetails.status === "Returned"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                    {orderDetails.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Expected Delivery</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {orderDetails.trackingNumber && (
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Tracking Number</p>
                                            <p className="font-mono text-sm text-slate-900 dark:text-white">
                                                {orderDetails.trackingNumber}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {orderDetails.carrier && (
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Carrier</p>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {orderDetails.carrier}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 dark:border-blue-800/30">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                Tracking Timeline
                            </h3>

                            <div className="relative">
                                {orderDetails.timeline.map((step, index) => (
                                    <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                                        {/* Timeline Line */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                    : step.current
                                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/20"
                                                        : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                                                }`}>
                                                {getStepIcon(step.status)}
                                            </div>
                                            {index < orderDetails.timeline.length - 1 && (
                                                <div className={`w-0.5 flex-1 my-2 ${step.completed
                                                        ? "bg-green-300 dark:bg-green-700"
                                                        : "bg-slate-200 dark:bg-slate-700"
                                                    }`} />
                                            )}
                                        </div>

                                        {/* Step Content */}
                                        <div className="flex-1 pb-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <h4 className={`font-semibold ${step.completed || step.current
                                                        ? "text-slate-900 dark:text-white"
                                                        : "text-slate-400 dark:text-slate-500"
                                                    }`}>
                                                    {step.title}
                                                </h4>
                                                {step.date && (
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {step.date} {step.time && `at ${step.time}`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-1 ${step.completed || step.current
                                                    ? "text-slate-600 dark:text-slate-400"
                                                    : "text-slate-400 dark:text-slate-500"
                                                }`}>
                                                {step.description}
                                            </p>
                                            {step.location && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {step.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-800/30">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Shipping Address
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {orderDetails.shippingAddress}
                            </p>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-800/30">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                            <Package className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                                Need Help?
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300 mb-4">
                                If you have any questions about your order, feel free to contact our support team.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/contact">
                                    <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-100">
                                        Contact Support
                                    </Button>
                                </Link>
                                <Link href="/profile?tab=orders">
                                    <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-100">
                                        View All Orders
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
