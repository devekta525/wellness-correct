"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ShoppingBag,
  Eye,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderItem {
  product: OrderProduct | string;
  quantity: number;
  price: number;
}

interface OrderAddress {
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: OrderAddress | string;
  trackingNumber?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const OrdersTab = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      // Safely get token only on the client side
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") || localStorage.getItem("authToken")
          : null;

      console.log("🔍 OrdersTab - Fetching orders...");
      console.log(
        "📝 Token found:",
        token ? "Yes (length: " + token.length + ")" : "No",
      );
      console.log(
        "🌐 API URL:",
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/orders/user/my-orders`,
      );

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/orders/user/my-orders`,
        {
          params: { page, limit: 10 },
          // Conditionally add the Authorization header if a token exists
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          // Ensures cookies are sent with the request, which can be necessary for auth
          withCredentials: true,
        },
      );

      console.log("✅ Response received:", response.data);

      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Error message:", err.message);

      // Check if backend is unreachable
      if (
        err.code === "ERR_NETWORK" ||
        err.message.includes("Network Error") ||
        !err.response
      ) {
        setError(
          "Cannot connect to server. Please ensure the backend is running on port 5000.",
        );
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication error. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
          "An error occurred while fetching orders.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleTrackOrder = (orderNumber: string) => {
    router.push(`/track-order?order=${orderNumber}`);
  };

  const renderAddress = (address?: string | OrderAddress) => {
    if (!address) return "N/A";
    if (typeof address === "string") return address;
    const parts = [
      address.address,
      address.city,
      address.state,
      address.pinCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const renderItemName = (item: OrderItem, index: number) => {
    if (typeof item.product === "string") return `Product #${index + 1}`;
    return item.product?.name || `Product #${index + 1}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Shipped":
      case "Processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Cancelled":
      case "Returned":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "Shipped":
        return <Truck className="w-3.5 h-3.5" />;
      case "Processing":
        return <Package className="w-3.5 h-3.5" />;
      case "Pending":
        return <Clock className="w-3.5 h-3.5" />;
      case "Cancelled":
      case "Returned":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Package className="w-3.5 h-3.5" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "Pending":
        return 16;
      case "Confirmed":
        return 33;
      case "Processing":
        return 50;
      case "Shipped":
        return 66;
      case "Out for Delivery":
        return 83;
      case "Delivered":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-6 pt-8 px-6 sm:px-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            <ShoppingBag className="w-6 h-6 text-indigo-500" />
            Order History
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-base mt-2">
            Track and manage your recent orders
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 bg-slate-50/30 dark:bg-slate-900/30">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 mb-8">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-6">Loading orders...</p>
            </div>
          )}

          {/* Orders List */}
          {!loading && (
            <div className="space-y-6">
              {orders.map((order: Order) => (
                <div
                  key={order._id}
                  className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header Gradient */}
                  <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                        <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-0.5">Order ID</p>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-none">
                          {order.orderNumber}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(order.createdAt || "").toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm uppercase tracking-wide ${getStatusClasses(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8">
                    {/* Progress Bar */}
                    {order.status !== "Cancelled" && order.status !== "Returned" && (
                      <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 px-1">
                          <span className={getStatusProgress(order.status) >= 16 ? "text-indigo-600 dark:text-indigo-400" : ""}>PLACED</span>
                          <span className={`${getStatusProgress(order.status) >= 50 ? "text-indigo-600 dark:text-indigo-400" : ""} hidden sm:block`}>PROCESSING</span>
                          <span className={getStatusProgress(order.status) >= 66 ? "text-indigo-600 dark:text-indigo-400" : ""}>SHIPPED</span>
                          <span className={getStatusProgress(order.status) >= 100 ? "text-emerald-600 dark:text-emerald-400" : ""}>DELIVERED</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner flex items-center">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative transition-all duration-1000 ease-out"
                            style={{ width: `${getStatusProgress(order.status)}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700/50">
                      <div className="space-y-1.5">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Amount</p>
                        <p className="font-extrabold text-xl text-slate-900 dark:text-white">
                          ₹{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <Package className="w-3.5 h-3.5" /> Items
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">
                          {order.items.length} Product{order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                          Payment
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-base capitalize">
                          {order.paymentStatus}
                        </p>
                      </div>
                      {order.trackingNumber && (
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                            Tracking ID
                          </p>
                          <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 truncate bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm inline-block">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 text-white shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/25 transition-all duration-300 rounded-xl py-6 font-bold text-sm"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        View Order Details
                      </Button>

                      {(order.status === "Shipped" || order.status === "Processing") && (
                        <Button
                          variant="outline"
                          onClick={() => handleTrackOrder(order.orderNumber)}
                          className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 rounded-xl py-6 font-bold text-sm"
                        >
                          <Truck className="w-5 h-5 mr-2 text-blue-500" />
                          Track Package
                        </Button>
                      )}

                      {order.status === "Delivered" && (
                        <Button
                          variant="outline"
                          onClick={() => handleTrackOrder(order.orderNumber)}
                          className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800/50 shadow-sm transition-all duration-300 rounded-xl py-6 font-bold text-sm"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Delivery Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    You haven't placed any orders. Discover our premium wellness products and start your journey today!
                  </p>
                  <Button
                    onClick={() => router.push("/shop")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                  >
                    Start Shopping
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {pagination.total > 0
                      ? `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )} of ${pagination.total} orders`
                      : "No results"}
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300">
                      {pagination.page} / {pagination.pages}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Package className="w-6 h-6" />
                </div>
                Order Details
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Order <span className="font-bold text-slate-900 dark:text-white">#{selectedOrder?.orderNumber}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedOrder && (
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 space-y-8">
              {/* Order Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="mb-4 sm:mb-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 shadow-sm ${getStatusClasses(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-slate-400" /> Products
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                            {renderItemName(item, index)}
                          </p>
                          <p className="text-sm font-medium text-slate-500 mt-0.5">
                            Quantity: <span className="text-slate-700 dark:text-slate-300">{item.quantity}</span> × ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid for Shipping & Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOrder.shippingAddress && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                      <MapPin className="w-5 h-5 text-indigo-500" />
                      Shipping Address
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {renderAddress(selectedOrder.shippingAddress)}
                    </p>
                  </div>
                )}

                {selectedOrder.trackingNumber && (
                  <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                      <Truck className="w-5 h-5 text-indigo-500" />
                      Tracking Info
                    </h4>
                    <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2.5 rounded-xl inline-block shadow-sm">
                      <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl py-6 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close Window
                </Button>
                {(selectedOrder.status === "Shipped" || selectedOrder.status === "Processing") && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-500/30"
                    onClick={() => {
                      setIsDialogOpen(false);
                      handleTrackOrder(selectedOrder.orderNumber);
                    }}
                  >
                    <Truck className="w-5 h-5 mr-2" />
                    Track Package
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTab;
