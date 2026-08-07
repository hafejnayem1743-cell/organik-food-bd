import React, { useState, useMemo } from 'react';
import { Order, Product, User, Category } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Printer, 
  Plus, 
  Eye, 
  Sparkles, 
  Layers, 
  Filter, 
  Tag, 
  Activity, 
  Award, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  MessageSquare, 
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';

interface AdminAnalyticsDashboardProps {
  orders: Order[];
  products: Product[];
  users: User[];
  categories: Category[];
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({
  orders,
  products,
  users,
  categories,
  onNavigateTab,
  onOpenAddProduct
}) => {
  // Date Range filter state
  const [dateFilter, setDateFilter] = useState<string>('Last30Days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // 1. Date Range Filtering Logic
  const { filteredOrders, previousPeriodOrders, dateRangeLabel } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startTime = new Date(0);
    let endTime = new Date();
    let prevStartTime = new Date(0);
    let prevEndTime = new Date(0);
    let label = 'All Time';

    if (dateFilter === 'Today') {
      startTime = todayStart;
      endTime = now;
      prevStartTime = new Date(todayStart.getTime() - 86400000);
      prevEndTime = todayStart;
      label = "Today's Performance";
    } else if (dateFilter === 'Yesterday') {
      startTime = new Date(todayStart.getTime() - 86400000);
      endTime = todayStart;
      prevStartTime = new Date(todayStart.getTime() - 86400000 * 2);
      prevEndTime = startTime;
      label = "Yesterday's Performance";
    } else if (dateFilter === 'Last7Days') {
      startTime = new Date(todayStart.getTime() - 86400000 * 7);
      endTime = now;
      prevStartTime = new Date(todayStart.getTime() - 86400000 * 14);
      prevEndTime = startTime;
      label = "Last 7 Days";
    } else if (dateFilter === 'Last30Days') {
      startTime = new Date(todayStart.getTime() - 86400000 * 30);
      endTime = now;
      prevStartTime = new Date(todayStart.getTime() - 86400000 * 60);
      prevEndTime = startTime;
      label = "Last 30 Days";
    } else if (dateFilter === 'ThisMonth') {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1);
      endTime = now;
      prevStartTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndTime = startTime;
      label = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    } else if (dateFilter === 'LastMonth') {
      startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endTime = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartTime = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEndTime = startTime;
      label = "Last Month";
    } else if (dateFilter === 'ThisYear') {
      startTime = new Date(now.getFullYear(), 0, 1);
      endTime = now;
      prevStartTime = new Date(now.getFullYear() - 1, 0, 1);
      prevEndTime = startTime;
      label = `Year ${now.getFullYear()}`;
    } else if (dateFilter === 'Custom' && customStartDate && customEndDate) {
      startTime = new Date(customStartDate);
      endTime = new Date(customEndDate);
      endTime.setHours(23, 59, 59, 999);
      const diff = endTime.getTime() - startTime.getTime();
      prevStartTime = new Date(startTime.getTime() - diff);
      prevEndTime = startTime;
      label = `${customStartDate} to ${customEndDate}`;
    }

    const currentFiltered = orders.filter(o => {
      const dt = new Date(o.orderTime || o.createdAt || 0);
      if (isNaN(dt.getTime())) return true;
      return dt >= startTime && dt <= endTime;
    });

    const previousFiltered = orders.filter(o => {
      const dt = new Date(o.orderTime || o.createdAt || 0);
      if (isNaN(dt.getTime())) return false;
      return dt >= prevStartTime && dt < prevEndTime;
    });

    return {
      filteredOrders: currentFiltered,
      previousPeriodOrders: previousFiltered,
      dateRangeLabel: label
    };
  }, [orders, dateFilter, customStartDate, customEndDate]);

  // 2. Comprehensive Statistics Metrics
  const metrics = useMemo(() => {
    // Current period revenue (excluding cancelled)
    const totalRevenue = filteredOrders
      .filter(o => (o.status || o.orderStatus) !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

    const previousRevenue = previousPeriodOrders
      .filter(o => (o.status || o.orderStatus) !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

    // Revenue growth %
    const revenueGrowth = previousRevenue > 0
      ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : totalRevenue > 0 ? '+100' : '0';

    // Today's metrics
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayOrdersList = orders.filter(o => {
      const dt = new Date(o.orderTime || o.createdAt || 0);
      return !isNaN(dt.getTime()) && dt.toISOString().split('T')[0] === todayStr;
    });

    const todayRevenue = todayOrdersList
      .filter(o => (o.status || o.orderStatus) !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

    const todayDelivered = todayOrdersList.filter(o => (o.status || o.orderStatus) === 'Delivered').length;
    const todayCancelled = todayOrdersList.filter(o => (o.status || o.orderStatus) === 'Cancelled').length;

    // Weekly Revenue (Last 7 days)
    const d7Ago = new Date(now.getTime() - 86400000 * 7);
    const weeklyRevenue = orders
      .filter(o => {
        const dt = new Date(o.orderTime || o.createdAt || 0);
        return !isNaN(dt.getTime()) && dt >= d7Ago && (o.status || o.orderStatus) !== 'Cancelled';
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

    // Monthly Revenue (This Month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = orders
      .filter(o => {
        const dt = new Date(o.orderTime || o.createdAt || 0);
        return !isNaN(dt.getTime()) && dt >= monthStart && (o.status || o.orderStatus) !== 'Cancelled';
      })
      .reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);

    // Order Counts Breakdown
    const totalOrdersCount = filteredOrders.length;
    let pendingCount = 0;
    let confirmedCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    filteredOrders.forEach(o => {
      const st = o.status || o.orderStatus || 'Pending';
      if (st === 'Pending') pendingCount++;
      else if (st === 'Confirmed') confirmedCount++;
      else if (st === 'Processing') processingCount++;
      else if (st === 'Shipped') shippedCount++;
      else if (st === 'Delivered') deliveredCount++;
      else if (st === 'Cancelled') cancelledCount++;
    });

    // Orders growth
    const previousOrdersCount = previousPeriodOrders.length;
    const ordersGrowth = previousOrdersCount > 0
      ? (((totalOrdersCount - previousOrdersCount) / previousOrdersCount) * 100).toFixed(1)
      : totalOrdersCount > 0 ? '+100' : '0';

    // Products & Customers metrics
    const totalCustomers = users.filter(u => u.email.toLowerCase() !== 'hafejnayem1743@gmail.com').length;
    const totalProducts = products.length;
    const featuredProductsCount = products.filter(p => p.isFeatured).length;

    return {
      totalRevenue,
      previousRevenue,
      revenueGrowth,
      todayRevenue,
      todayOrdersCount: todayOrdersList.length,
      todayDelivered,
      todayCancelled,
      weeklyRevenue,
      monthlyRevenue,
      totalOrdersCount,
      ordersGrowth,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      totalCustomers,
      totalProducts,
      featuredProductsCount
    };
  }, [filteredOrders, previousPeriodOrders, orders, users, products]);

  // 3. Sales & Revenue Trend Chart Data (Grouped by Date)
  const salesTrendData = useMemo(() => {
    const map = new Map<string, { date: string; Revenue: number; Orders: number }>();

    // Generate date sequence for filtered range
    const now = new Date();
    let daysToInclude = 14;
    if (dateFilter === 'Today' || dateFilter === 'Yesterday') daysToInclude = 7;
    else if (dateFilter === 'Last30Days' || dateFilter === 'ThisMonth') daysToInclude = 30;

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      map.set(key, { date: key, Revenue: 0, Orders: 0 });
    }

    filteredOrders.forEach(o => {
      const dt = new Date(o.orderTime || o.createdAt || 0);
      if (!isNaN(dt.getTime())) {
        const key = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const existing = map.get(key) || { date: key, Revenue: 0, Orders: 0 };
        if ((o.status || o.orderStatus) !== 'Cancelled') {
          existing.Revenue += Number(o.totalAmount || o.grandTotal || 0);
        }
        existing.Orders += 1;
        map.set(key, existing);
      }
    });

    return Array.from(map.values());
  }, [filteredOrders, dateFilter]);

  // 4. Order Status Distribution Pie Chart Data
  const orderStatusDistribution = useMemo(() => {
    return [
      { name: 'Pending', value: metrics.pendingCount, color: '#f59e0b' },
      { name: 'Confirmed', value: metrics.confirmedCount, color: '#10b981' },
      { name: 'Processing', value: metrics.processingCount, color: '#f97316' },
      { name: 'Shipped', value: metrics.shippedCount, color: '#3b82f6' },
      { name: 'Delivered', value: metrics.deliveredCount, color: '#059669' },
      { name: 'Cancelled', value: metrics.cancelledCount, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [metrics]);

  // 5. Category Revenue Distribution
  const categorySalesData = useMemo(() => {
    const catMap = new Map<string, number>();

    filteredOrders.forEach(o => {
      if ((o.status || o.orderStatus) !== 'Cancelled') {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(item => {
            const prod = products.find(p => p.id === item.productId || p.name === item.productName);
            const catName = prod?.category || 'Organic Grocery';
            const curr = catMap.get(catName) || 0;
            catMap.set(catName, curr + Number(item.totalPrice || item.unitPrice * item.quantity || 0));
          });
        }
      }
    });

    return Array.from(catMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredOrders, products]);

  // 6. Best Selling Products (Top 10)
  const bestSellingProducts = useMemo(() => {
    const map = new Map<string, { product: Product | null; name: string; image: string; unitsSold: number; revenue: number; stock: number }>();

    orders.forEach(o => {
      if ((o.status || o.orderStatus) !== 'Cancelled') {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(item => {
            const pId = item.productId || item.productName;
            const existing = map.get(pId) || {
              product: products.find(p => p.id === item.productId || p.name === item.productName) || null,
              name: item.productName,
              image: item.productImage,
              unitsSold: 0,
              revenue: 0,
              stock: 0
            };
            existing.unitsSold += item.quantity || 1;
            existing.revenue += Number(item.totalPrice || item.unitPrice * item.quantity || 0);

            if (existing.product) {
              existing.stock = existing.product.stock;
              existing.image = existing.product.image || existing.product.images?.[0] || item.productImage;
            }

            map.set(pId, existing);
          });
        }
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);
  }, [orders, products]);

  // 7. Top Customers by Total Spend
  const topCustomers = useMemo(() => {
    const custMap = new Map<string, { email: string; name: string; phone: string; photo: string; orderCount: number; totalSpend: number; lastOrderDate: string }>();

    orders.forEach(o => {
      if ((o.status || o.orderStatus) !== 'Cancelled') {
        const key = (o.email || o.mobile || o.receiverName || 'Guest').toLowerCase().trim();
        const existing = custMap.get(key) || {
          email: o.email || 'N/A',
          name: o.receiverName || o.customerName || 'Valued Customer',
          phone: o.mobile || 'N/A',
          photo: '',
          orderCount: 0,
          totalSpend: 0,
          lastOrderDate: o.orderTime || o.createdAt || ''
        };

        existing.orderCount += 1;
        existing.totalSpend += Number(o.totalAmount || o.grandTotal || 0);
        
        if (new Date(o.orderTime || 0) > new Date(existing.lastOrderDate || 0)) {
          existing.lastOrderDate = o.orderTime || o.createdAt || existing.lastOrderDate;
        }

        // Match registered user photo
        const matchedUser = users.find(u => u.email.toLowerCase() === existing.email.toLowerCase() || u.mobile === existing.phone);
        if (matchedUser) {
          existing.photo = matchedUser.profilePhoto || '';
          existing.name = matchedUser.fullName || existing.name;
        }

        custMap.set(key, existing);
      }
    });

    return Array.from(custMap.values())
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 8);
  }, [orders, users]);

  // 8. Low Stock Products Detection
  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);

  // 9. Live Activity Feed (Combines recent orders and recent user registrations)
  const activityFeed = useMemo(() => {
    const list: { id: string; type: 'order' | 'user'; title: string; subtitle: string; time: string; amount?: number; badge: string; iconBg: string }[] = [];

    orders.slice(0, 8).forEach(o => {
      list.push({
        id: `ord-${o.id}`,
        type: 'order',
        title: `New Order #${o.orderNumber || o.id} from ${o.receiverName || o.customerName}`,
        subtitle: `${o.items?.length || 1} Item(s) • ${o.paymentMethod} • ${o.district}`,
        time: o.orderTime || o.createdAt || new Date().toISOString(),
        amount: o.totalAmount || o.grandTotal || 0,
        badge: o.status || 'Pending',
        iconBg: 'bg-emerald-100 text-emerald-800'
      });
    });

    users.slice(0, 5).forEach(u => {
      list.push({
        id: `user-${u.id}`,
        type: 'user',
        title: `New Customer Registered: ${u.fullName}`,
        subtitle: `Email: ${u.email} • ${u.mobile || 'No Mobile'}`,
        time: u.createdAt || new Date().toISOString(),
        badge: 'Customer',
        iconBg: 'bg-blue-100 text-blue-800'
      });
    });

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [orders, users]);

  // Export Analytics CSV
  const handleExportAnalyticsCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Date Range Filter', dateRangeLabel],
      ['Total Sales Revenue (BDT)', metrics.totalRevenue],
      ['Total Orders Count', metrics.totalOrdersCount],
      ['Pending Orders', metrics.pendingCount],
      ['Confirmed Orders', metrics.confirmedCount],
      ['Processing Orders', metrics.processingCount],
      ['Shipped Orders', metrics.shippedCount],
      ['Delivered Orders', metrics.deliveredCount],
      ['Cancelled Orders', metrics.cancelledCount],
      ['Today Revenue (BDT)', metrics.todayRevenue],
      ['Today Orders Count', metrics.todayOrdersCount],
      ['Weekly Revenue (BDT)', metrics.weeklyRevenue],
      ['Monthly Revenue (BDT)', metrics.monthlyRevenue],
      ['Total Registered Customers', metrics.totalCustomers],
      ['Total Active Products', metrics.totalProducts]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrganikFoodBD_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* Top Header & Date Range Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white tracking-wide">Executive Sales & Operations Dashboard</h2>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] rounded-full font-bold">
              LIVE FIRESTORE SYNC
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time business performance metrics, customer behavior insights, and organic sales analytics.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 text-xs">
          <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <Calendar className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-white font-extrabold px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="Today" className="bg-slate-900 text-white">Today</option>
              <option value="Yesterday" className="bg-slate-900 text-white">Yesterday</option>
              <option value="Last7Days" className="bg-slate-900 text-white">Last 7 Days</option>
              <option value="Last30Days" className="bg-slate-900 text-white">Last 30 Days</option>
              <option value="ThisMonth" className="bg-slate-900 text-white">This Month</option>
              <option value="LastMonth" className="bg-slate-900 text-white">Last Month</option>
              <option value="ThisYear" className="bg-slate-900 text-white">This Year</option>
              <option value="Custom" className="bg-slate-900 text-white">Custom Range</option>
            </select>
          </div>

          <button
            onClick={handleExportAnalyticsCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {dateFilter === 'Custom' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <span className="font-extrabold text-slate-700">Select Custom Period:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold"
          />
        </div>
      )}

      {/* Quick Navigation Shortcuts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Quick Actions:</span>
        <button
          onClick={onOpenAddProduct}
          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
        <button
          onClick={() => onNavigateTab('orders')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
          <span>View Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => onNavigateTab('users')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-blue-700" />
          <span>Manage Customers ({metrics.totalCustomers})</span>
        </button>
        <button
          onClick={() => onNavigateTab('products')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <Package className="w-3.5 h-3.5 text-orange-700" />
          <span>Inventory ({metrics.totalProducts})</span>
        </button>
        <button
          onClick={() => onNavigateTab('banners')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <Tag className="w-3.5 h-3.5 text-purple-700" />
          <span>Banner Ads</span>
        </button>
        <button
          onClick={() => onNavigateTab('support')}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-pink-700" />
          <span>Support Tickets</span>
        </button>
      </div>

      {/* 1. PRIMARY STATISTIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-5 rounded-3xl text-white shadow-md relative overflow-hidden space-y-3 border border-emerald-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
              Total Revenue ({dateFilter})
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white">৳{metrics.totalRevenue.toLocaleString()}</p>
            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              {Number(metrics.revenueGrowth) >= 0 ? (
                <span className="flex items-center text-emerald-400 font-black">
                  <ArrowUpRight className="w-4 h-4 mr-0.5" />
                  {metrics.revenueGrowth}%
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-black">
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  {metrics.revenueGrowth}%
                </span>
              )}
              <span className="text-slate-400 font-medium">vs previous period</span>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-800/50 flex justify-between text-[10px] text-emerald-200 font-bold">
            <span>Today: ৳{metrics.todayRevenue}</span>
            <span>Month: ৳{metrics.monthlyRevenue}</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{metrics.totalOrdersCount}</p>
            <div className="flex items-center space-x-1.5 mt-1 text-xs">
              {Number(metrics.ordersGrowth) >= 0 ? (
                <span className="flex items-center text-emerald-700 font-black">
                  <ArrowUpRight className="w-4 h-4 mr-0.5" />
                  {metrics.ordersGrowth}%
                </span>
              ) : (
                <span className="flex items-center text-rose-600 font-black">
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  {metrics.ordersGrowth}%
                </span>
              )}
              <span className="text-slate-400 font-medium">order volume trend</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-600 font-bold">
            <span className="text-amber-800">Pending: {metrics.pendingCount}</span>
            <span className="text-emerald-800">Delivered: {metrics.deliveredCount}</span>
          </div>
        </div>

        {/* Customers & Engagement Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Registered Customers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{metrics.totalCustomers}</p>
            <p className="text-xs text-emerald-700 font-bold mt-1">Active Organic Shoppers</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-600 font-bold">
            <span>Avg Spend: ৳{metrics.totalCustomers > 0 ? Math.round(metrics.totalRevenue / metrics.totalCustomers) : 0}</span>
            <span className="text-purple-700">Top Buyers: {topCustomers.length}</span>
          </div>
        </div>

        {/* Inventory Overview Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{metrics.totalProducts}</p>
            <p className="text-xs text-orange-700 font-bold mt-1">{metrics.featuredProductsCount} Featured Items</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] font-bold">
            <span className={lowStockProducts.length > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
              Low Stock Alert: {lowStockProducts.length}
            </span>
            <span className="text-emerald-700">Categories: {categories.length}</span>
          </div>
        </div>

      </div>

      {/* SECONDARY ORDER STATUS METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-amber-900">Pending</span>
          <p className="text-xl font-black text-amber-950">{metrics.pendingCount}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-emerald-900">Confirmed</span>
          <p className="text-xl font-black text-emerald-950">{metrics.confirmedCount}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-2xl border border-orange-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-orange-900">Processing</span>
          <p className="text-xl font-black text-orange-950">{metrics.processingCount}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-blue-900">Shipped</span>
          <p className="text-xl font-black text-blue-950">{metrics.shippedCount}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-2xl border border-green-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-green-900">Delivered</span>
          <p className="text-xl font-black text-green-950">{metrics.deliveredCount}</p>
        </div>
        <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200/80 text-center space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-rose-900">Cancelled</span>
          <p className="text-xl font-black text-rose-950">{metrics.cancelledCount}</p>
        </div>
      </div>

      {/* 2. RECHARTS SALES & REVENUE VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Sales Trend Chart (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Sales Revenue & Order Volume Growth</span>
              </h3>
              <p className="text-[11px] text-slate-400">Daily revenue trends computed from real Firestore orders.</p>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200 self-start sm:self-auto">
              {dateRangeLabel}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px', border: 'none' }}
                  labelStyle={{ color: '#34d399', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (BDT)" />
                <Area yAxisId="right" type="monotone" dataKey="Orders" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" name="Order Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution (Pie / Donut Chart) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Order Status Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-400">Current active order status ratios.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {orderStatusDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 text-center">No order status data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Status Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            {orderStatusDistribution.map((st) => (
              <div key={st.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                <span className="font-bold text-slate-700">{st.name}:</span>
                <span className="font-black text-slate-900">{st.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. CATEGORY REVENUE & TODAY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Category Revenue Bar Chart */}
        <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Revenue by Product Category (BDT)</span>
            </h3>
            <p className="text-[11px] text-slate-400">Best performing organic food categories.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} name="Category Sales (৳)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Operational Summary Card */}
        <div className="bg-gradient-to-b from-slate-900 to-emerald-950 p-5 rounded-3xl text-white shadow-md space-y-4 border border-emerald-900/50">
          <div className="border-b border-emerald-800/60 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-black text-sm">Today's Live Snapshot</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300 font-bold">Today's Revenue</span>
              <span className="font-black text-emerald-400 text-base">৳{metrics.todayRevenue}</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300 font-bold">Today's Orders</span>
              <span className="font-black text-white text-base">{metrics.todayOrdersCount}</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300 font-bold">Delivered Today</span>
              <span className="font-black text-green-400 text-base">{metrics.todayDelivered}</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl flex items-center justify-between">
              <span className="text-slate-300 font-bold">Cancelled Today</span>
              <span className="font-black text-rose-400 text-base">{metrics.todayCancelled}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. TOP 10 BEST SELLING PRODUCTS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 10 Best Sellers Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Top 10 Best Selling Products</span>
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="p-2.5">Rank & Product</th>
                  <th className="p-2.5 text-center">Units Sold</th>
                  <th className="p-2.5 text-right">Revenue (BDT)</th>
                  <th className="p-2.5 text-right">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestSellingProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">No product sales recorded yet.</td>
                  </tr>
                ) : (
                  bestSellingProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </span>
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200'}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                          <span className="font-bold text-slate-800 truncate max-w-[160px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-black text-slate-900">
                        {p.unitsSold}
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-800">
                        ৳{p.revenue.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          p.stock === 0 ? 'bg-rose-100 text-rose-800' : p.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-600 text-xs">All products well stocked!</p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <img
                      src={p.image || p.images?.[0]}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[120px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500">৳{p.discountPrice || p.price} / {p.unit}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      p.stock === 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {p.stock === 0 ? 'OUT OF STOCK' : `Only ${p.stock} Left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. TOP CUSTOMERS & LIVE ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Customers Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Top Customers by Total Spend</span>
            </h3>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>Manage Users</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topCustomers.length === 0 ? (
              <p className="py-6 text-slate-400 text-center">No customer spend records available yet.</p>
            ) : (
              topCustomers.map((c, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={c.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt={c.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{c.phone} • {c.orderCount} Order(s)</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-800 text-xs">৳{c.totalSpend.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400">
                      Last: {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Activity Feed</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Latest 10 Events</span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 text-xs">
            {activityFeed.map((act) => (
              <div key={act.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold ${act.iconBg}`}>
                  {act.type === 'order' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-slate-900 truncate text-[11px]">{act.title}</p>
                    {act.amount !== undefined && (
                      <span className="font-black text-emerald-800 text-xs shrink-0">৳{act.amount}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{act.subtitle}</p>
                  <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.time).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
