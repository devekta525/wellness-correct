const asyncHandler = require('express-async-handler');
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');

const REPORT_TYPES = ['orders', 'products', 'customers', 'sales_summary', 'categories', 'brands', 'reviews', 'coupons'];

function applyDateFilter(query, startDate, endDate) {
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  return query;
}

async function addSheetFromRows(workbook, sheetName, headers, rows) {
  const sheet = workbook.addWorksheet(sheetName, { headerRows: 1 });
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));
  sheet.columns.forEach((col, i) => { col.width = Math.min(40, Math.max(12, headers[i]?.length || 10)); });
}

// @desc    Generate Excel report by type
// @route   GET /api/admin/reports/excel?type=orders&startDate=...&endDate=...
const generateReport = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  if (!type || !REPORT_TYPES.includes(type)) {
    res.status(400);
    throw new Error(`Invalid report type. Use one of: ${REPORT_TYPES.join(', ')}`);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Wellness_fuel Admin';
  workbook.created = new Date();

  if (type === 'orders') {
    const match = {};
    applyDateFilter(match, startDate, endDate);
    const orders = await Order.find(match)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const headers = ['Order #', 'Date', 'Customer', 'Email', 'Payment', 'Payment Status', 'Order Status', 'Subtotal', 'Shipping', 'Tax', 'Discount', 'Total', 'Items'];
    const rows = orders.map((o) => [
      o.orderNumber || '',
      o.createdAt ? new Date(o.createdAt).toISOString() : '',
      o.user?.name || o.guestEmail || o.shippingAddress?.fullName || 'Guest',
      o.user?.email || o.guestEmail || '',
      o.paymentMethod || '',
      o.paymentStatus || '',
      o.orderStatus || '',
      o.subtotal ?? '',
      o.shippingCost ?? '',
      o.tax ?? '',
      o.discount ?? '',
      o.total ?? '',
      (o.items && o.items.length) ? o.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0,
    ]);
    await addSheetFromRows(workbook, 'Orders', headers, rows);
  }

  if (type === 'products') {
    const match = {};
    applyDateFilter(match, startDate, endDate);
    const products = await Product.find(match)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    const headers = ['Title', 'SKU', 'Category', 'Brand', 'Price', 'Compare Price', 'Discount %', 'Stock', 'Low Stock', 'Featured', 'Active', 'Total Sales', 'Created'];
    const rows = products.map((p) => [
      p.title || '',
      p.sku || '',
      p.category?.name || '',
      p.brand || '',
      p.price ?? '',
      p.comparePrice ?? '',
      p.discount ?? '',
      p.stock ?? '',
      p.lowStockThreshold ?? '',
      p.isFeatured ? 'Yes' : 'No',
      p.isActive ? 'Yes' : 'No',
      p.totalSales ?? 0,
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Products', headers, rows);
  }

  if (type === 'customers') {
    const match = { role: 'customer' };
    const users = await User.find(match).select('name email phone role isActive createdAt').sort({ createdAt: -1 }).lean();
    const headers = ['Name', 'Email', 'Phone', 'Active', 'Created'];
    const rows = users.map((u) => [
      u.name || '',
      u.email || '',
      u.phone || '',
      u.isActive ? 'Yes' : 'No',
      u.createdAt ? new Date(u.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Customers', headers, rows);
  }

  if (type === 'sales_summary') {
    const match = { paymentStatus: 'paid' };
    applyDateFilter(match, startDate, endDate);
    const orders = await Order.find(match).lean();
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const byStatus = {};
    const byPayment = {};
    orders.forEach((o) => {
      byStatus[o.orderStatus] = (byStatus[o.orderStatus] || 0) + 1;
      byPayment[o.paymentMethod] = (byPayment[o.paymentMethod] || 0) + 1;
    });
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Orders', orders.length],
      ['Total Revenue (₹)', totalRevenue.toFixed(2)],
      ['Avg Order Value (₹)', orders.length ? (totalRevenue / orders.length).toFixed(2) : 0],
      ['', ''],
      ['By Order Status', ''],
      ...Object.entries(byStatus).map(([k, v]) => [k, v]),
      ['', ''],
      ['By Payment Method', ''],
      ...Object.entries(byPayment).map(([k, v]) => [k, v]),
    ];
    await addSheetFromRows(workbook, 'Sales Summary', headers, rows);
  }

  if (type === 'categories') {
    const categories = await Category.find().sort({ order: 1, name: 1 }).populate('parent', 'name').lean();
    const headers = ['Name', 'Slug', 'Parent', 'Description', 'Active', 'Order', 'Created'];
    const rows = categories.map((c) => [
      c.name || '',
      c.slug || '',
      c.parent?.name || '',
      (c.description || '').substring(0, 100),
      c.isActive ? 'Yes' : 'No',
      c.order ?? '',
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Categories', headers, rows);
  }

  if (type === 'brands') {
    const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
    const headers = ['Name', 'Slug', 'Description', 'Active', 'Order', 'Created'];
    const rows = brands.map((b) => [
      b.name || '',
      b.slug || '',
      (b.description || '').substring(0, 100),
      b.isActive ? 'Yes' : 'No',
      b.order ?? '',
      b.createdAt ? new Date(b.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Brands', headers, rows);
  }

  if (type === 'reviews') {
    const match = {};
    applyDateFilter(match, startDate, endDate);
    const reviews = await Review.find(match)
      .populate('product', 'title slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const headers = ['Product', 'User', 'Rating', 'Title', 'Comment', 'Status', 'Verified', 'Created'];
    const rows = reviews.map((r) => [
      r.product?.title || '',
      r.user?.email || '',
      r.rating ?? '',
      (r.title || '').substring(0, 50),
      (r.comment || '').substring(0, 100),
      r.status || '',
      r.isVerifiedPurchase ? 'Yes' : 'No',
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Reviews', headers, rows);
  }

  if (type === 'coupons') {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    const headers = ['Code', 'Type', 'Value', 'Min Order', 'Max Discount', 'Usage Limit', 'Usage Count', 'Active', 'Expires', 'Created'];
    const rows = coupons.map((c) => [
      c.code || '',
      c.type || '',
      c.value ?? '',
      c.minOrderAmount ?? '',
      c.maxDiscount ?? '',
      c.usageLimit ?? 'Unlimited',
      c.usageCount ?? 0,
      c.isActive ? 'Yes' : 'No',
      c.expiresAt ? new Date(c.expiresAt).toISOString() : '',
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ]);
    await addSheetFromRows(workbook, 'Coupons', headers, rows);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `report-${type}-${Date.now()}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

// @desc    Get list of available report types (for UI)
// @route   GET /api/admin/reports/types
const getReportTypes = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    types: REPORT_TYPES.map((t) => ({
      id: t,
      name: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      supportsDateRange: ['orders', 'products', 'sales_summary', 'reviews'].includes(t),
    })),
  });
});

module.exports = { generateReport, getReportTypes };
