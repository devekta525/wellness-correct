"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Loader2,
  CheckCircle,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";

// Dummy data for reports
const salesData = [
  { month: "Jan", sales: 45000, orders: 120, customers: 95 },
  { month: "Feb", sales: 52000, orders: 135, customers: 110 },
  { month: "Mar", sales: 48000, orders: 125, customers: 100 },
  { month: "Apr", sales: 61000, orders: 155, customers: 130 },
  { month: "May", sales: 55000, orders: 140, customers: 115 },
  { month: "Jun", sales: 67000, orders: 170, customers: 145 },
  { month: "Jul", sales: 72000, orders: 185, customers: 160 },
  { month: "Aug", sales: 68000, orders: 175, customers: 150 },
  { month: "Sep", sales: 75000, orders: 195, customers: 170 },
  { month: "Oct", sales: 82000, orders: 210, customers: 185 },
  { month: "Nov", sales: 78000, orders: 200, customers: 175 },
  { month: "Dec", sales: 85000, orders: 220, customers: 195 },
];

const productPerformance = [
  { name: "Premium Protein Powder", sales: 25000, units: 150, growth: 15.2 },
  { name: "Organic Green Tea", sales: 18000, units: 200, growth: 8.5 },
  { name: "Vitamin D3 Capsules", sales: 22000, units: 180, growth: 12.3 },
  { name: "Omega-3 Fish Oil", sales: 16000, units: 120, growth: -2.1 },
  { name: "Multivitamin Complex", sales: 20000, units: 160, growth: 6.8 },
  { name: "Herbal Sleep Aid", sales: 12000, units: 80, growth: -5.2 },
  { name: "Turmeric Curcumin", sales: 15000, units: 100, growth: 9.1 },
  { name: "Collagen Peptides", sales: 19000, units: 140, growth: 11.7 },
];

const customerAnalytics = [
  { segment: "New Customers", count: 450, percentage: 35, revenue: 180000 },
  {
    segment: "Returning Customers",
    count: 520,
    percentage: 40,
    revenue: 320000,
  },
  { segment: "VIP Customers", count: 180, percentage: 14, revenue: 280000 },
  { segment: "Inactive Customers", count: 150, percentage: 11, revenue: 25000 },
];

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    from: "2024-01-01",
    to: "2024-12-31",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");

  const reportTypes = [
    {
      id: "sales",
      name: "Sales Report",
      icon: DollarSign,
      description: "Revenue and sales analytics",
    },
    {
      id: "products",
      name: "Product Performance",
      icon: Package,
      description: "Product sales and performance",
    },
    {
      id: "customers",
      name: "Customer Analytics",
      icon: Users,
      description: "Customer behavior and segments",
    },
    {
      id: "orders",
      name: "Order Analysis",
      icon: ShoppingBag,
      description: "Order trends and patterns",
    },
    {
      id: "inventory",
      name: "Inventory Report",
      icon: BarChart3,
      description: "Stock levels and movements",
    },
    {
      id: "financial",
      name: "Financial Summary",
      icon: TrendingUp,
      description: "Profit, loss, and expenses",
    },
  ];

  const exportFormats = [
    { id: "pdf", name: "PDF", icon: FileText },
    { id: "excel", name: "Excel", icon: BarChart3 },
    { id: "csv", name: "CSV", icon: FileText },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsExporting(false);
    }
  };

  const getTotalSales = () => {
    return salesData.reduce((sum, month) => sum + month.sales, 0);
  };

  const getTotalOrders = () => {
    return salesData.reduce((sum, month) => sum + month.orders, 0);
  };

  const getTotalCustomers = () => {
    return salesData.reduce((sum, month) => sum + month.customers, 0);
  };

  const getGrowthRate = () => {
    const currentMonth = salesData[salesData.length - 1].sales;
    const previousMonth = salesData[salesData.length - 2].sales;
    return (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and export data
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>
            <Button
              onClick={handleExportReport}
              disabled={isExporting}
              variant="outline"
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{getTotalSales().toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />+{getGrowthRate()}% from
                    last month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">
                    {getTotalOrders()}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {Math.round(getTotalOrders() / 12)} avg/month
                  </p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {getTotalCustomers()}
                  </p>
                  <p className="text-sm text-purple-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {Math.round(getTotalCustomers() / 12)} avg/month
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    +{getGrowthRate()}%
                  </p>
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Monthly growth
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Select report type, period, and export format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select
                  value={selectedReport}
                  onValueChange={setSelectedReport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        <div className="flex items-center gap-2">
                          <report.icon className="w-4 h-4" />
                          {report.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period">Time Period</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex items-center gap-2">
                          <format.icon className="w-4 h-4" />
                          {format.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedPeriod === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedReport === report.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${selectedReport === report.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <report.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {report.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                  {selectedReport === report.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Preview */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {selectedReport === "sales" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesData.slice(-6).map((month) => (
                        <div
                          key={month.month}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {month.month}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(month.sales / 85000) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-20 text-right">
                              ₹{month.sales.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Revenue
                        </span>
                        <span className="font-semibold">
                          ₹{getTotalSales().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Average Monthly
                        </span>
                        <span className="font-semibold">
                          ₹{Math.round(getTotalSales() / 12).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Best Month
                        </span>
                        <span className="font-semibold">Dec (₹85,000)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Growth Rate
                        </span>
                        <span className="font-semibold text-emerald-600">
                          +{getGrowthRate()}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedReport === "products" && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Units Sold</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productPerformance.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            ₹{product.sales.toLocaleString()}
                          </TableCell>
                          <TableCell>{product.units}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.growth > 0 ? "default" : "destructive"
                              }
                            >
                              {product.growth > 0 ? "+" : ""}
                              {product.growth}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {selectedReport === "customers" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Segments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerAnalytics.map((segment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm font-medium">
                              {segment.segment}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {segment.count} ({segment.percentage}%)
                            </span>
                            <span className="text-sm font-medium">
                              ₹{segment.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Customers
                        </span>
                        <span className="font-semibold">1,300</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Active Customers
                        </span>
                        <span className="font-semibold">1,150 (88%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          VIP Customers
                        </span>
                        <span className="font-semibold">180 (14%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Order Value
                        </span>
                        <span className="font-semibold">₹1,250</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Report Data</CardTitle>
                <CardDescription>
                  Comprehensive data for {selectedReport} report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Detailed View</h3>
                  <p className="text-muted-foreground">
                    Click &quot;Generate Report&quot; to see detailed data for
                    the selected report type.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Interactive chart will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Pie chart will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default ReportsPage;
