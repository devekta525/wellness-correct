"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUser } from "@/lib/redux/features/authSlice";
import {
  Search,
  Grid3X3,
  List,
  Edit,
  Package,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ShoppingCart,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Settings,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import { getApiV1Url, getApiV1BaseUrl } from "@/lib/utils/api";
import Swal from "sweetalert2";

// Create axios instance with interceptors for authentication
const authenticatedAxios = axios.create({
  baseURL: getApiV1BaseUrl(),
  withCredentials: true,
});

// Add request interceptor to include auth token
authenticatedAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Try multiple possible token storage keys
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (token) {
        // Remove quotes if present
        token = token.replace(/^"|"$/g, "");
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Token added to request");
      } else {
        console.warn("⚠️ No authentication token found");
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
authenticatedAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized - Token may be invalid or expired");
    }
    return Promise.reject(error);
  },
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoData from "@/components/common/dashboard/NoData";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import { formatPrice } from "@/lib/formatters";

const orderStatuses = [
  "all",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
] as const;
const paymentStatuses = [
  "all",
  "Paid",
  "Pending",
  "Refunded",
  "Failed",
] as const;

interface OrderItem {
  product: string | { name: string; image?: string };
  name?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string };
  createdAt: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: any;
  billingAddress?: any;
  trackingNumber?: string;
  notes?: string;
}

interface UserWithOrders {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  imageUrl?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  firstOrderDate: string;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersWithOrders, setUsersWithOrders] = useState<UserWithOrders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
  });
  const currentUser = useAppSelector(selectUser);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayMode, setDisplayMode] = useState<"orders" | "users">("orders");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear previous errors

      if (!currentUser) {
        setOrders([]);
        // Don't set error immediately to avoid flash during initial load
        setIsLoading(false);
        return;
      }

      // Admins can see all orders, regular users only see their own
      // Check for lowercase admin roles from backend (admin, super_admin)
      const isAdmin =
        currentUser.role === "admin" ||
        currentUser.role === "super_admin" ||
        currentUser.role === "Admin";

      // Handle potential ID mismatch (_id vs id)
      const userId = currentUser._id || (currentUser as any).id;

      // Fetch all orders by handling pagination (backend max per page is 100)
      let allOrders: Order[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const baseUrl = isAdmin
          ? `/orders?limit=100&page=${currentPage}`
          : `/orders?user=${userId}&limit=100&page=${currentPage}`;

        const response = await authenticatedAxios.get(baseUrl);

        console.log(
          `Orders API response (page ${currentPage}):`,
          response.data,
        );

        // Extract orders from response
        let pageOrders = [];
        if (Array.isArray(response.data)) {
          pageOrders = response.data;
        } else if (
          response.data?.orders &&
          Array.isArray(response.data.orders)
        ) {
          pageOrders = response.data.orders;
        } else if (response.data?.data) {
          if (Array.isArray(response.data.data)) {
            pageOrders = response.data.data;
          } else if (typeof response.data.data === "object") {
            pageOrders = [response.data.data];
          }
        }

        allOrders = [...allOrders, ...pageOrders];

        // Check if there are more pages
        if (response.data?.pagination) {
          totalPages = response.data.pagination.pages || 1;
          console.log(
            `Fetched page ${currentPage} of ${totalPages}, total orders so far: ${allOrders.length}`,
          );
        } else {
          // No pagination info, assume this is the only page
          break;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      console.log(`✅ Fetched all ${allOrders.length} orders`);
      setOrders(allOrders);
      setError("");
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchUsersWithOrders = useCallback(async () => {
    try {
      setIsLoadingUsers(true);

      if (!currentUser) {
        setUsersWithOrders([]);
        setIsLoadingUsers(false);
        return;
      }

      const isAdmin =
        currentUser.role === "admin" ||
        currentUser.role === "super_admin" ||
        currentUser.role === "Admin";

      if (!isAdmin) {
        setIsLoadingUsers(false);
        return;
      }

      // Fetch all users with orders by handling pagination
      let allUsers: UserWithOrders[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await authenticatedAxios.get(
          `/orders/admin/users-with-orders?limit=100&page=${currentPage}`,
        );

        console.log(
          `Users with orders API response (page ${currentPage}):`,
          response.data,
        );

        let pageUsers = [];
        if (Array.isArray(response.data.data)) {
          pageUsers = response.data.data;
        }

        allUsers = [...allUsers, ...pageUsers];

        if (response.data?.pagination) {
          totalPages = response.data.pagination.pages || 1;
          console.log(
            `Fetched page ${currentPage} of ${totalPages}, total users so far: ${allUsers.length}`,
          );
        } else {
          break;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      console.log(`✅ Fetched all ${allUsers.length} users with orders`);
      setUsersWithOrders(allUsers);
    } catch (err: any) {
      console.error("Error fetching users with orders:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  // Fetch orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
    // refetch when user changes (e.g., login/logout)
  }, [fetchOrders]);

  // Fetch users with orders when switching to users view
  useEffect(() => {
    if (displayMode === "users" && usersWithOrders.length === 0) {
      fetchUsersWithOrders();
    }
  }, [displayMode, fetchUsersWithOrders, usersWithOrders.length]);

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => {
      const userName =
        typeof order.user === "string" ? order.user : order.user?.name || "";
      const orderNumber = order.orderNumber || "";
      const matchesSearch =
        orderNumber
          .toLowerCase()
          .includes(filters.search?.toLowerCase() || "") ||
        userName.toLowerCase().includes(filters.search?.toLowerCase() || "");
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesPaymentStatus =
        !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [orders, filters]);

  // Filter users
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(usersWithOrders)) return [];
    return usersWithOrders.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      const matchesSearch =
        fullName.toLowerCase().includes(filters.search?.toLowerCase() || "") ||
        user.email
          .toLowerCase()
          .includes(filters.search?.toLowerCase() || "") ||
        user.phone.includes(filters.search || "");

      return matchesSearch;
    });
  }, [usersWithOrders, filters.search]);

  // Pagination logic
  const currentData = displayMode === "orders" ? filteredOrders : filteredUsers;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change or display mode changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, displayMode]);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
    trackingNumber?: string,
  ) => {
    try {
      await authenticatedAxios.put(`/orders/${orderId}`, {
        status: newStatus,
        trackingNumber,
      });
      await fetchOrders();
      setShowEditModal(false);
      Swal.fire({
        title: "Success!",
        text: "Order details updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update order status",
        icon: "error",
      });
    }
  };

  const openViewModal = async (order: Order) => {
    try {
      const response = await authenticatedAxios.get(`/orders/${order._id}`);
      const orderData =
        response.data.order || response.data.data || response.data;
      setSelectedOrder(orderData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Processing":
        return <Package className="w-4 h-4" />;
      case "Shipped":
        return <Truck className="w-4 h-4" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4" />;
      case "Returned":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Processing":
        return "secondary";
      case "Shipped":
        return "default";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "destructive";
      case "Returned":
        return "default";
      default:
        return "secondary";
    }
  };

  const renderUser = (user: Order["user"]) => {
    if (typeof user === "string") return user;
    return user?.name || "Unknown User";
  };

  const renderAddress = (address: any) => {
    if (!address) return "N/A";
    if (typeof address === "string") return address;

    if (address.address || address.city || address.state || address.pinCode) {
      return [
        address.address,
        address.landmark,
        address.city,
        address.state,
        address.pinCode,
      ]
        .filter(Boolean)
        .join(", ");
    }

    return address.name || JSON.stringify(address);
  };

  const renderProduct = (item: OrderItem) => {
    if (item.name) return item.name;
    if (
      item.product &&
      typeof item.product === "object" &&
      "name" in item.product
    ) {
      return item.product.name;
    }
    return typeof item.product === "string" ? item.product : "Unknown Product";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading orders" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-2xl border border-slate-200">
                    {displayMode === "orders" ? <ShoppingCart className="w-6 h-6 text-primary" /> : <Users className="w-6 h-6 text-primary" />}
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                    {displayMode === "orders" ? (
                      <>Transaction <span className="text-primary">Ledger</span></>
                    ) : (
                      <>Entity <span className="text-primary">Registry</span></>
                    )}
                  </h1>
                </div>
                <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {displayMode === "orders"
                    ? "Oversee procurement cycles, delivery logistics, and operational metrics."
                    : "Analyze entity patterns, acquisition metrics, and behavioral intelligence."}
                </p>
              </div>

              {(currentUser?.role === "admin" || currentUser?.role === "super_admin" || currentUser?.role === "Admin") && (
                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 border border-slate-200 shadow-sm">
                  <Button
                    onClick={() => setDisplayMode("orders")}
                    className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border-none ${displayMode === "orders"
                      ? "bg-white text-primary shadow-md"
                      : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                    Transactions
                  </Button>
                  <Button
                    onClick={() => setDisplayMode("users")}
                    className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border-none ${displayMode === "users"
                      ? "bg-white text-primary shadow-md"
                      : "bg-transparent text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <Users className="w-3.5 h-3.5 mr-2" />
                    Entities
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Perspective */}
            {displayMode === "orders" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Total Volume', value: orders.length, icon: Package, color: 'primary', trend: 'Total Orders' },
                  { label: 'Pending Cycle', value: orders.filter((o) => o.status === "Pending").length, icon: Clock, color: 'amber', trend: 'In Queue' },
                  { label: 'Fulfillment Rate', value: orders.filter((o) => o.status === "Delivered").length, icon: CheckCircle, color: 'emerald', trend: 'Delivered' },
                  { label: 'Gross Revenue', value: formatPrice(orders.reduce((sum, o) => sum + o.totalAmount, 0)), icon: DollarSign, color: 'blue', trend: 'Financial Impact' },
                ].map((stat, i) => (
                  <Card key={i} className="group overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all duration-500`}>
                          <stat.icon className={`w-5 h-5 text-primary`} />
                        </div>
                        <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-wider border-slate-100 bg-slate-50 px-3 py-1 text-slate-500">
                          {stat.trend}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Total Entities', value: usersWithOrders.length, icon: Users, color: 'primary', trend: 'Customer Base' },
                  { label: 'Order Velocity', value: usersWithOrders.reduce((sum, u) => sum + u.totalOrders, 0), icon: ShoppingCart, color: 'blue', trend: 'Total Volume' },
                  { label: 'Financial Yield', value: formatPrice(usersWithOrders.reduce((sum, u) => sum + u.totalSpent, 0)), icon: DollarSign, color: 'emerald', trend: 'Total Spent' },
                  { label: 'Economic Average', value: formatPrice(usersWithOrders.length > 0 ? usersWithOrders.reduce((sum, u) => sum + u.averageOrderValue, 0) / usersWithOrders.length : 0), icon: TrendingUp, color: 'amber', trend: 'Avg Ticket' },
                ].map((stat, i) => (
                  <Card key={i} className="group overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300`}>
                          <stat.icon className={`w-5 h-5 text-slate-900`} />
                        </div>
                        <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-wider border-slate-100 bg-slate-50 px-3 py-1 text-slate-400">
                          {stat.trend}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Command & Control Bar */}
            <div className="mb-10 sticky top-4 z-20">
              <Card className="border border-slate-200 bg-white shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
                    {/* Semantic Search */}
                    <div className="relative flex-1 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="text"
                        placeholder={displayMode === "orders" ? "Search transaction protocols by number or entity name..." : "Search customer registry by name, email, or telephone..."}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="h-14 pl-16 pr-6 rounded-xl bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white shadow-sm transition-all text-sm font-bold placeholder:font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {displayMode === "orders" && (
                        <>
                          {/* Status Filter */}
                          <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
                          >
                            <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-xl bg-slate-50 border-transparent text-xs font-black uppercase tracking-widest text-slate-600">
                              <SelectValue placeholder="Operational State" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2">
                              {orderStatuses.map(status => (
                                <SelectItem key={status} value={status} className="rounded-xl mb-1 focus:bg-primary/5 focus:text-primary font-bold uppercase tracking-tighter text-[11px]">
                                  {status === "all" ? "All Protocols" : status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Payment Filter */}
                          <Select
                            value={filters.paymentStatus || "all"}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value === "all" ? "" : value }))}
                          >
                            <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-xl bg-slate-50 border-transparent text-xs font-black uppercase tracking-widest text-slate-600">
                              <SelectValue placeholder="Fiscal Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-2">
                              {paymentStatuses.map(status => (
                                <SelectItem key={status} value={status} className="rounded-xl mb-1 focus:bg-primary/5 focus:text-primary font-bold uppercase tracking-tighter text-[11px]">
                                  {status === "all" ? "Complete Archive" : status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {/* View Toggle */}
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        {[
                          { mode: 'grid', icon: Grid3X3 },
                          { mode: 'list', icon: List },
                        ].map((item) => (
                          <Button
                            key={item.mode}
                            variant={viewMode === (item.mode as any) ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode(item.mode as any)}
                            className={`h-12 w-12 rounded-lg transition-all ${viewMode === item.mode
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                              }`}
                          >
                            <item.icon className="w-5 h-5" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Synthesis */}
            {displayMode === "orders" ? (
              <>
                {isLoading ? (
                  <Loader variant="skeleton" message="Synchronizing transaction ledger..." />
                ) : filteredOrders.length === 0 ? (
                  <NoData
                    message="No transaction records found"
                    description="The ledger is currently empty. Initiate global commerce to populate this node."
                    icon={<Package className="w-full h-full text-slate-200" />}
                    size="lg"
                  />
                ) : (
                  <>
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedOrders.map((order) => (
                          <Card
                            key={order._id}
                            className="group relative overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col h-full"
                          >
                            <CardHeader className="p-6 pb-4">
                              <div className="flex items-center justify-between mb-4">
                                <Badge variant="outline" className="rounded-lg px-2 py-0.5 bg-slate-50 border-slate-200 font-bold font-mono text-[10px] tracking-tighter text-slate-500">
                                  {order.orderNumber}
                                </Badge>
                                <Badge
                                  className={`rounded-lg px-2 py-0.5 font-bold uppercase tracking-widest text-[8px] shadow-sm border-none ${order.status === "Delivered" ? "bg-emerald-500 text-white" :
                                    order.status === "Pending" ? "bg-amber-500 text-white" :
                                      order.status === "Cancelled" ? "bg-rose-500 text-white" :
                                        "bg-primary text-white"
                                    }`}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                                {renderUser(order.user)}
                              </CardTitle>
                              <CardDescription className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Synchronized {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8 pt-4 space-y-6 flex-1 flex flex-col">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Impact</p>
                                  <p className="text-xl font-black text-slate-900">{formatPrice(order.totalAmount)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Status</p>
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <p className="text-xs font-bold text-slate-700">{order.paymentStatus}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Inventory Payload</span>
                                  <span className="font-black text-slate-700">{order.items.length} Units</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary truncate max-w-[150px]">
                                      {renderProduct(item)}
                                    </div>
                                  ))}
                                  {order.items.length > 2 && (
                                    <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                                      +{order.items.length - 2} More
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="pt-4 mt-auto flex gap-2">
                                <Button
                                  onClick={() => openViewModal(order)}
                                  variant="outline"
                                  className="flex-1 h-11 rounded-xl border-slate-200 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all duration-300"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2" />
                                  Explore
                                </Button>
                                <Button
                                  onClick={() => openEditModal(order)}
                                  className="flex-1 h-11 rounded-xl shadow-md font-bold uppercase tracking-widest text-[10px] bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 active:scale-95"
                                >
                                  <Edit className="w-3.5 h-3.5 mr-2" />
                                  Manage
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow className="border-slate-100 hover:bg-transparent">
                              <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">Transaction ID</TableHead>
                              <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entity Details</TableHead>
                              <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Lifecycle Stage</TableHead>
                              <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Fiscal Status</TableHead>
                              <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Economic Impact</TableHead>
                              <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Operations</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedOrders.map((order) => (
                              <TableRow key={order._id} className="group border-slate-100 hover:bg-slate-50/50 transition-all">
                                <TableCell className="py-6 px-8 text-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 tracking-tight">{order.orderNumber}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-6">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 tracking-tight">{renderUser(order.user)}</span>
                                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{renderAddress(order.shippingAddress)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-6 text-center">
                                  <Badge
                                    className={`rounded-lg px-2.5 py-1 font-black uppercase tracking-widest text-[9px] shadow-sm border-none mx-auto ${order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                                      order.status === "Pending" ? "bg-amber-500/10 text-amber-600" :
                                        order.status === "Cancelled" ? "bg-rose-500/10 text-rose-600" :
                                          "bg-primary/10 text-primary"
                                      }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {getStatusIcon(order.status)}
                                      {order.status}
                                    </div>
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-6 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`rounded-lg px-2.5 py-1 font-black uppercase tracking-widest text-[9px] border-none mx-auto ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                      }`}
                                  >
                                    {order.paymentStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-6 text-right font-black text-slate-900 tracking-tight">
                                  {formatPrice(order.totalAmount)}
                                </TableCell>
                                <TableCell className="py-6 px-8 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      onClick={() => openViewModal(order)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => openEditModal(order)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}

                    {/* Pagination Interface */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100 mt-12">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pagination Context</span>
                        <p className="text-xs font-bold text-slate-600">
                          Mapping <span className="text-primary">{startIndex + 1}</span> &mdash; <span className="text-primary">{Math.min(endIndex, filteredOrders.length)}</span> of <span className="text-primary">{filteredOrders.length}</span> entities
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="h-12 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all bg-white"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1.5 px-3">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 p-0 rounded-xl font-black transition-all ${currentPage === page
                                ? 'bg-slate-900 text-white shadow-lg scale-110'
                                : 'border-slate-200 hover:bg-slate-100 bg-white'
                                }`}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="h-12 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all bg-white"
                        >
                          Next Cycle
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Users with Orders View (Entity Analyst) */}
                {isLoadingUsers ? (
                  <Loader variant="skeleton" message="Parsing entity registry..." />
                ) : filteredUsers.length === 0 ? (
                  <NoData
                    message="No entity records found"
                    description="The registry is awaiting automated synchronization with procurement nodes."
                    icon={<Users className="w-full h-full text-slate-200" />}
                    size="lg"
                  />
                ) : (
                  <>
                    <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entity Identity</TableHead>
                            <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Communication Vector</TableHead>
                            <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Protocol Volume</TableHead>
                            <TableHead className="py-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Economic Velocity</TableHead>
                            <TableHead className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Temporal Signature</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user._id} className="group border-slate-100 hover:bg-slate-50/50 transition-all">
                              <TableCell className="py-6 px-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                                    {user.imageUrl ? (
                                      <img src={user.imageUrl} alt={user.firstName} className="w-12 h-12 rounded-2xl object-cover" />
                                    ) : (
                                      <span className="text-primary font-black text-sm">{user.firstName[0]}{user.lastName[0]}</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 tracking-tight">{user.firstName} {user.lastName}</span>
                                    <Badge variant="outline" className="w-fit mt-1 rounded-md px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter bg-slate-50 border-slate-200 text-slate-400">
                                      {user.role}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-700">{user.email}</span>
                                  <span className="text-[10px] font-medium text-slate-400">{user.phone}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <Badge className="rounded-xl px-3 py-1 bg-primary text-white font-black text-[10px]">
                                    {user.totalOrders} Cycles
                                  </Badge>
                                  <div className="flex gap-1">
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] px-1.5">{user.deliveredOrders} D</Badge>
                                    {user.pendingOrders > 0 && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] px-1.5">{user.pendingOrders} P</Badge>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-black text-slate-900 tracking-tight">{formatPrice(user.totalSpent)}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Avg: {formatPrice(user.averageOrderValue)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-8 text-right">
                                <div className="flex flex-col items-end text-nowrap">
                                  <span className="text-[11px] font-bold text-slate-700">{new Date(user.lastOrderDate).toLocaleDateString()}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>

                    {/* Pagination for Entities */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100 mt-12">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Entity Index</span>
                        <p className="text-xs font-bold text-slate-600">
                          Analyzing <span className="text-primary">{startIndex + 1}</span> to <span className="text-primary">{Math.min(endIndex, filteredUsers.length)}</span> of <span className="text-primary">{filteredUsers.length}</span> verified nodes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="h-12 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all bg-white"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous Phase
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="h-12 px-6 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all bg-white"
                        >
                          Next Phase
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* View Order Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-2xl shadow-2xl">
            <DialogHeader className="p-8 pb-6 bg-slate-100 border-b sticky top-0 z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                    Order Details <span className="text-primary/60 ml-2">#{selectedOrder?.orderNumber}</span>
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Comprehensive breakdown of procurement intelligence and fulfillment logic.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedOrder && (
              <div className="p-8 space-y-8 pb-12">
                {/* Status Progress Bar - Conceptual */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column - Core Intelligence */}
                  <div className="lg:col-span-7 space-y-8">
                    {/* Order Information Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <Activity className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Order Intelligence</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Temporal Sync</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Operational Status</p>
                          <Badge
                            variant={getStatusColor(selectedOrder.status) as any}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                          >
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1.5">{selectedOrder.status}</span>
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Payment Protocol</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                selectedOrder.paymentStatus === "Paid"
                                  ? "success"
                                  : selectedOrder.paymentStatus === "Refunded"
                                    ? "default"
                                    : "warning"
                              }
                              className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                            >
                              {selectedOrder.paymentStatus}
                            </Badge>
                            <span className="text-xs font-medium text-slate-500 italic">via {selectedOrder.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Financial Impact</p>
                          <p className="text-xl font-black text-primary tracking-tighter">
                            {formatPrice(selectedOrder.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.trackingNumber && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Logistics Tracking</p>
                              <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                {selectedOrder.trackingNumber}
                              </code>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary">
                              Track Package <ArrowUpRight className="ml-1 w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items List */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <List className="w-5 h-5 text-orange-500" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inventory Allocation</h3>
                      </div>

                      <div className="space-y-4">
                        {selectedOrder.items?.map((item, index) => (
                          <div
                            key={index}
                            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all hover:shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
                                {typeof item.product !== 'string' && item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-slate-300" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {renderProduct(item)}
                                </p>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">
                                  Quantity: <span className="font-bold text-slate-700">{item.quantity}</span> × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">
                                {formatPrice(item.total)}
                              </p>
                              <div className="h-1 w-8 bg-primary/20 rounded-full ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Entity Data */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Customer Profile Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Identity Context</h3>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 mb-6">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Authenticated Entity</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {typeof selectedOrder.user === "string"
                            ? selectedOrder.user
                            : selectedOrder.user?.name || "Anonymous Requester"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {typeof selectedOrder.user === "object" && selectedOrder.user?.email}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-500 rounded-full" /> Shipping Terminal
                          </p>
                          <div className="p-4 rounded-2xl bg-slate-50 text-xs font-medium text-slate-600 leading-relaxed border border-dashed border-slate-200">
                            {renderAddress(selectedOrder.shippingAddress)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-indigo-500 rounded-full" /> Billing Origin
                          </p>
                          <div className="p-4 rounded-2xl bg-slate-50 text-xs font-medium text-slate-600 leading-relaxed border border-dashed border-slate-200">
                            {renderAddress(selectedOrder.billingAddress)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Notes */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <Edit className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Internal Remarks</h3>
                      </div>

                      <div className="relative z-10">
                        {selectedOrder.notes ? (
                          <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                            <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                              "{selectedOrder.notes}"
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                              <Search className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documentation found</p>
                          </div>
                        )}
                      </div>
                      {/* Decorative background circle */}
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-8 bg-white border-t sticky bottom-0 z-10 mt-0">
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">
                  Verified Transaction Protocol &copy; 2024
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-2 hover:bg-slate-50 hover:text-slate-950 transition-all border-slate-200 dark:border-slate-800"
                  >
                    Archive View
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedOrder!);
                    }}
                    className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-primary"
                  >
                    Calibrate Status
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Order Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl p-0 border-none bg-white rounded-2xl shadow-2xl overflow-hidden">
            <DialogHeader className="p-8 pb-6 bg-slate-50 border-b sticky top-0 z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Settings className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                    Protocol <span className="text-primary">Calibration</span>
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Adjust lifecycle metrics and logistics parameters for node <span className="font-black text-slate-900">#{selectedOrder?.orderNumber}</span>.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedOrder && (
              <div className="p-8 space-y-8">
                {/* Main Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <Label htmlFor="order-status" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Operational Status
                      </Label>
                    </div>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        setSelectedOrder({ ...selectedOrder, status: value })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 shadow-sm transition-all font-bold text-slate-700">
                        <SelectValue placeholder="Analyze stage..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 p-2 shadow-2xl">
                        {orderStatuses.slice(1).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="rounded-lg mb-1 focus:bg-primary/5 focus:text-primary font-medium"
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <span>{status}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tracking Number */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full" />
                      <Label htmlFor="tracking-number" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Logistics Tracer
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="tracking-number"
                        type="text"
                        placeholder="TRK-XXXXXXXXX"
                        value={selectedOrder.trackingNumber || ""}
                        onChange={(e) =>
                          setSelectedOrder({
                            ...selectedOrder,
                            trackingNumber: e.target.value,
                          })
                        }
                        className="h-12 pl-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 shadow-sm transition-all font-mono font-bold"
                      />
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                </div>

                {/* Notes/Internal Narrative */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <Label htmlFor="order-notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Deployment Narrative
                    </Label>
                  </div>
                  <Textarea
                    id="order-notes"
                    placeholder="Document internal procedural observations..."
                    value={selectedOrder.notes || ""}
                    onChange={(e) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        notes: e.target.value,
                      })
                    }
                    className="min-h-[120px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500/20 shadow-inner transition-all p-5 font-medium resize-none leading-relaxed"
                  />
                </div>

                {/* Risk Warning/Acknowledge */}
                <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100">
                  <div className="p-2 rounded-xl bg-amber-100 mt-0.5">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-tight text-amber-700">Sensitivity protocol</p>
                    <p className="text-[10px] text-amber-600 font-medium leading-tight">
                      Modifying the operational status will trigger automated notifications and inventory modulation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-8 bg-slate-50 border-t mt-4">
              <div className="flex items-center justify-between w-full gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-2 border-slate-200 hover:bg-white transition-all"
                >
                  Discard changes
                </Button>
                <Button
                  onClick={() => {
                    if (selectedOrder) {
                      handleUpdateOrderStatus(
                        selectedOrder._id!,
                        selectedOrder.status as any,
                        selectedOrder.trackingNumber,
                      );
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none rounded-xl px-12 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 active:scale-95 transition-all bg-slate-900 text-white hover:bg-slate-800 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="animate-pulse">Syncing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Commit Registry <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default OrdersPage;
