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
          ? localStorage.getItem("authToken") || localStorage.getItem("token")
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "info";
      case "Processing":
        return "warning";
      case "Pending":
        return "secondary";
      case "Cancelled":
        return "destructive";
      case "Returned":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Shipped":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "Processing":
        return <Package className="w-4 h-4 text-yellow-500" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Returned":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order History
          </CardTitle>
          <CardDescription>Track and manage your orders</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading orders...</p>
            </div>
          )}

          {/* Orders List */}
          {!loading && (
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <div
                  key={order._id}
                  className="border rounded-xl p-5 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <h3 className="font-semibold text-lg">
                          {order.orderNumber}
                        </h3>
                        <Badge
                          variant={
                            getStatusColor(order.status) as
                              | "default"
                              | "secondary"
                              | "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt || "").toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for active orders */}
                    {order.status !== "Cancelled" &&
                      order.status !== "Returned" &&
                      order.status !== "Delivered" && (
                        <div className="w-full">
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Order Placed</span>
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${getStatusProgress(order.status)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Order Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold text-lg">
                          ₹{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="font-medium">{order.paymentStatus}</p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <p className="text-muted-foreground">Tracking</p>
                          <p className="font-mono text-xs truncate">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {(order.status === "Shipped" ||
                        order.status === "Processing") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleTrackOrder(order.orderNumber)}
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      {order.status === "Delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackOrder(order.orderNumber)}
                          className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          View Tracking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="mb-4">Start shopping to see your orders here</p>
                  <Button
                    onClick={() => router.push("/shop")}
                    variant="default"
                  >
                    Start Shopping
                  </Button>
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {pagination.total > 0
                      ? `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                          pagination.page * pagination.limit,
                          pagination.total,
                        )} of ${pagination.total}`
                      : "Showing 0 results"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Order {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Order details and item information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="font-semibold">
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {renderItemName(item, index)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <p className="text-muted-foreground p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {renderAddress(selectedOrder.shippingAddress)}
                  </p>
                </div>
              )}

              {/* Tracking Info */}
              {selectedOrder.trackingNumber && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Tracking Number
                  </p>
                  <p className="font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setIsDialogOpen(false);
                    handleTrackOrder(selectedOrder.orderNumber);
                  }}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTab;
