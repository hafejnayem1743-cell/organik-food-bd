import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, User } from '../types';
import { DeliveryTracker } from './DeliveryTracker';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  Download, 
  FileText, 
  Printer, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Truck, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  MapPin, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Sparkles,
  ArrowUpDown,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';

interface OrderManagerProps {
  orders: Order[];
  users: User[];
  currentUser: User;
  onPrintInvoice: (order: Order) => void;
  setViewImageModalUrl: (url: string) => void;
  isSuperAdmin?: boolean;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  users,
  currentUser,
  onPrintInvoice,
  setViewImageModalUrl,
  isSuperAdmin = true
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Detailed Modal state
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Loading / Processing state for async operations
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Extract unique districts from orders for filter dropdown
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.district) set.add(o.district);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Create user lookup map by email/id/phone
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => {
      if (u.email) map.set(u.email.toLowerCase(), u);
      if (u.id) map.set(u.id, u);
      if (u.mobile) map.set(u.mobile, u);
    });
    return map;
  }, [users]);

  // Handle single order status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsProcessing(true);
    const targetOrder = orders.find(o => o.id === orderId || o.orderId === orderId || o.orderNumber === orderId);
    const docIdToUpdate = targetOrder?.id || orderId;
    const now = new Date().toISOString();
    const adminEmail = currentUser?.email || 'hafejnayem1743@gmail.com';

    try {
      const orderRef = doc(db, 'orders', docIdToUpdate);
      const existingTimeline = targetOrder?.timeline || [];
      const updatedTimeline = [
        ...existingTimeline,
        { 
          status: newStatus, 
          timestamp: now, 
          note: `Status updated to ${newStatus} by Admin`,
          updatedBy: adminEmail
        }
      ];

      const updatePayload: any = {
        status: newStatus,
        orderStatus: newStatus,
        timeline: updatedTimeline,
        updatedAt: now,
        statusUpdatedBy: adminEmail
      };

      if (newStatus === 'Delivered') {
        updatePayload.deliveryCompletedAt = now;
      }

      await updateDoc(orderRef, updatePayload);

      // Create notification for customer
      if (targetOrder) {
        const custUid = targetOrder.customerUid || targetOrder.userId || 'guest';
        let notifMsg = `Your order #${targetOrder.orderNumber || targetOrder.orderId} status has been updated to ${newStatus}.`;
        if (newStatus === 'Confirmed') notifMsg = `✅ Your order #${targetOrder.orderNumber || targetOrder.orderId} has been confirmed.`;
        if (newStatus === 'Processing') notifMsg = `📦 Your order #${targetOrder.orderNumber || targetOrder.orderId} is now being processed.`;
        if (newStatus === 'Shipped') notifMsg = `🚚 Your order #${targetOrder.orderNumber || targetOrder.orderId} has been shipped.`;
        if (newStatus === 'Delivered') notifMsg = `🎉 Your order #${targetOrder.orderNumber || targetOrder.orderId} has been delivered successfully.`;
        if (newStatus === 'Cancelled') notifMsg = `❌ Your order #${targetOrder.orderNumber || targetOrder.orderId} has been cancelled.`;

        await addDoc(collection(db, 'notifications'), {
          type: 'order',
          userId: custUid,
          title: `Order ${newStatus} • #${targetOrder.orderNumber || targetOrder.orderId}`,
          message: notifMsg,
          read: false,
          isRead: false,
          createdAt: now,
          link: `/profile/orders`
        });
      }

      // Sync backend API
      try {
        await fetch(`/api/orders/${docIdToUpdate}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, note: `Status set by ${currentUser.fullName || adminEmail}` })
        });
      } catch (e) {
        // API fallback
      }

      setActionSuccessMsg(`Order #${targetOrder?.orderNumber || docIdToUpdate} status updated to ${newStatus}`);
      setTimeout(() => setActionSuccessMsg(''), 3000);

      if (viewingOrder?.id === docIdToUpdate || viewingOrder?.id === orderId) {
        setViewingOrder(prev => prev ? { ...prev, status: newStatus, orderStatus: newStatus } : null);
      }
    } catch (err: any) {
      console.error("Error updating order status:", err);
      alert(`Failed to update order status: ${err.message || 'Check network connection'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Single Order Delete (Admin Only)
  const handleDeleteOrder = async (orderId: string, orderNumber?: string) => {
    if (!isSuperAdmin) {
      alert("⚠️ Access Denied: Only Super Admin (hafejnayem1743@gmail.com) has permission to delete orders.");
      return;
    }
    const targetOrder = orders.find(o => o.id === orderId || o.orderId === orderId || o.orderNumber === orderId);
    const docIdToDelete = targetOrder?.id || orderId;
    const displayNum = orderNumber || targetOrder?.orderNumber || docIdToDelete;

    if (!window.confirm(`⚠️ PERMANENT WARNING: Are you sure you want to permanently delete order #${displayNum}? This action CANNOT be undone.`)) return;

    setIsProcessing(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'orders', docIdToDelete));

      // Call server API delete endpoint
      try {
        await fetch(`/api/orders/${docIdToDelete}`, { method: 'DELETE' });
      } catch (apiErr) {
        // API fallback
      }

      if (viewingOrder?.id === docIdToDelete || viewingOrder?.id === orderId) {
        setViewingOrder(null);
      }

      setActionSuccessMsg(`Order #${displayNum} permanently deleted`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error("Error deleting order:", err);
      alert(`Failed to delete order: ${err.message || 'Check connection'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Status Update
  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to change status to "${newStatus}" for ${selectedOrderIds.length} selected orders?`)) return;

    setIsProcessing(true);
    try {
      for (const orderId of selectedOrderIds) {
        await handleUpdateStatus(orderId, newStatus);
      }
      setSelectedOrderIds([]);
      setActionSuccessMsg(`Successfully updated ${selectedOrderIds.length} orders to ${newStatus}`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Bulk status update failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!isSuperAdmin) {
      alert("⚠️ Access Denied: Only Super Admin (hafejnayem1743@gmail.com) has permission to delete orders.");
      return;
    }
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`⚠️ PERMANENT WARNING: Are you sure you want to permanently delete ${selectedOrderIds.length} selected orders from Firestore? This action CANNOT be undone.`)) return;

    setIsProcessing(true);
    try {
      for (const orderId of selectedOrderIds) {
        await deleteDoc(doc(db, 'orders', orderId));
      }
      setSelectedOrderIds([]);
      setActionSuccessMsg(`Permanently deleted selected orders`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Failed to delete selected orders.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate live statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    let pendingCount = 0;
    let confirmedCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    let todayOrdersCount = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    orders.forEach(o => {
      const st = o.status || o.orderStatus || 'Pending';
      if (st === 'Pending') pendingCount++;
      else if (st === 'Confirmed') confirmedCount++;
      else if (st === 'Processing') processingCount++;
      else if (st === 'Shipped') shippedCount++;
      else if (st === 'Delivered') deliveredCount++;
      else if (st === 'Cancelled') cancelledCount++;

      const orderAmount = Number(o.totalAmount || o.grandTotal || 0);
      const oDate = new Date(o.orderTime || o.createdAt || Date.now());

      if (!isNaN(oDate.getTime())) {
        const oDateStr = oDate.toISOString().split('T')[0];
        if (oDateStr === todayStr) {
          todayOrdersCount++;
          if (st !== 'Cancelled') todayRevenue += orderAmount;
        }

        if (oDate.getMonth() === currentMonth && oDate.getFullYear() === currentYear) {
          if (st !== 'Cancelled') monthlyRevenue += orderAmount;
        }
      }
    });

    return {
      totalOrders,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      todayOrdersCount,
      todayRevenue,
      monthlyRevenue
    };
  }, [orders]);

  // Smart Filtering Engine
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Search Query
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const inv = (o.invoiceNumber || `INV-${o.orderNumber || o.id}`).toLowerCase();
        const ordId = (o.orderNumber || o.id || '').toLowerCase();
        const name = (o.receiverName || o.customerName || '').toLowerCase();
        const phone = (o.mobile || '').toLowerCase();
        const email = (o.email || '').toLowerCase();
        const district = (o.district || '').toLowerCase();
        const upazila = (o.upazila || '').toLowerCase();
        const method = (o.paymentMethod || '').toLowerCase();
        const txn = (o.paymentTxnId || o.transactionId || '').toLowerCase();
        
        // Find matched user username
        const matchedUser = userMap.get(email) || userMap.get(phone);
        const username = (matchedUser?.username || '').toLowerCase();

        const matchesSearch = inv.includes(q) ||
          ordId.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          district.includes(q) ||
          upazila.includes(q) ||
          method.includes(q) ||
          txn.includes(q) ||
          username.includes(q);

        if (!matchesSearch) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'All') {
        const st = o.status || o.orderStatus || 'Pending';
        if (st !== statusFilter) return false;
      }

      // 3. Payment Method Filter
      if (paymentFilter !== 'All') {
        if (paymentFilter === 'COD') {
          if (o.paymentMethod !== 'Cash On Delivery' && o.paymentMethod !== 'COD') return false;
        } else if (o.paymentMethod !== paymentFilter) {
          return false;
        }
      }

      // 4. District Filter
      if (districtFilter !== 'All') {
        if (o.district !== districtFilter) return false;
      }

      // 5. Date Range Filter
      if (dateRangeFilter !== 'All') {
        const orderDate = new Date(o.orderTime || o.createdAt || Date.now());
        if (isNaN(orderDate.getTime())) return true;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRangeFilter === 'Today') {
          if (orderDate < todayStart) return false;
        } else if (dateRangeFilter === 'Yesterday') {
          const yestStart = new Date(todayStart);
          yestStart.setDate(yestStart.getDate() - 1);
          if (orderDate < yestStart || orderDate >= todayStart) return false;
        } else if (dateRangeFilter === 'Last7Days') {
          const d7 = new Date(todayStart);
          d7.setDate(d7.getDate() - 7);
          if (orderDate < d7) return false;
        } else if (dateRangeFilter === 'Last30Days') {
          const d30 = new Date(todayStart);
          d30.setDate(d30.getDate() - 30);
          if (orderDate < d30) return false;
        } else if (dateRangeFilter === 'ThisMonth') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          if (orderDate < monthStart) return false;
        } else if (dateRangeFilter === 'LastMonth') {
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          if (orderDate < lastMonthStart || orderDate >= thisMonthStart) return false;
        } else if (dateRangeFilter === 'Custom' && customStartDate && customEndDate) {
          const sDate = new Date(customStartDate);
          const eDate = new Date(customEndDate);
          eDate.setHours(23, 59, 59, 999);
          if (orderDate < sDate || orderDate > eDate) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.orderTime || a.createdAt || 0).getTime();
      const timeB = new Date(b.orderTime || b.createdAt || 0).getTime();
      const amountA = Number(a.totalAmount || a.grandTotal || 0);
      const amountB = Number(b.totalAmount || b.grandTotal || 0);

      switch (sortBy) {
        case 'newest':
          return timeB - timeA;
        case 'oldest':
          return timeA - timeB;
        case 'highestAmount':
          return amountB - amountA;
        case 'lowestAmount':
          return amountA - amountB;
        case 'customerName':
          return (a.receiverName || a.customerName || '').localeCompare(b.receiverName || b.customerName || '');
        case 'newestDelivered':
          if (a.status === 'Delivered' && b.status !== 'Delivered') return -1;
          if (a.status !== 'Delivered' && b.status === 'Delivered') return 1;
          return timeB - timeA;
        case 'newestPending':
          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;
          return timeB - timeA;
        default:
          return timeB - timeA;
      }
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, districtFilter, dateRangeFilter, customStartDate, customEndDate, sortBy, userMap]);

  // Paginated Orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Checkbox toggle handlers
  const toggleSelectAllPage = () => {
    const pageIds = paginatedOrders.map(o => o.id);
    const allSelected = pageIds.every(id => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Export CSV Functionality
  const handleExportCSV = () => {
    const ordersToExport = selectedOrderIds.length > 0
      ? orders.filter(o => selectedOrderIds.includes(o.id))
      : filteredOrders;

    if (ordersToExport.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      'Order ID',
      'Invoice Number',
      'Order Date',
      'Customer Name',
      'Mobile',
      'Email',
      'District',
      'Upazila',
      'Full Address',
      'Subtotal (BDT)',
      'Delivery Charge (BDT)',
      'Extra Charge (BDT)',
      'Grand Total (BDT)',
      'Payment Method',
      'Payment Status',
      'Transaction ID',
      'Order Status'
    ];

    const rows = ordersToExport.map(o => [
      `"${o.orderNumber || o.id}"`,
      `"${o.invoiceNumber || `INV-${o.orderNumber || o.id}`}"`,
      `"${new Date(o.orderTime || o.createdAt || Date.now()).toLocaleString('en-GB')}"`,
      `"${(o.receiverName || o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.mobile || ''}"`,
      `"${o.email || ''}"`,
      `"${(o.district || '').replace(/"/g, '""')}"`,
      `"${(o.upazila || '').replace(/"/g, '""')}"`,
      `"${(o.fullAddress || o.address || '').replace(/"/g, '""')}"`,
      o.subtotal || 0,
      o.deliveryCharge || 0,
      o.extraCharge || o.paymentCharge || 0,
      o.totalAmount || o.grandTotal || 0,
      `"${o.paymentMethod || ''}"`,
      `"${o.paymentStatus || ''}"`,
      `"${o.paymentTxnId || o.transactionId || ''}"`,
      `"${o.status || o.orderStatus || 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrganikFoodBD_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeStyle = (st: OrderStatus) => {
    switch (st) {
      case 'Pending': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Processing': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Shipped': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Delivered': return 'bg-green-100 text-green-950 border-green-400 font-extrabold';
      case 'Cancelled': return 'bg-rose-100 text-rose-900 border-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 font-bold text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. Live Statistics Counter Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900">{stats.totalOrders}</p>
          <p className="text-[10px] text-emerald-700 font-bold">Today: +{stats.todayOrdersCount}</p>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-950">{stats.pendingCount}</p>
          <p className="text-[10px] text-amber-700 font-medium">Awaiting Confirmation</p>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-950">{stats.confirmedCount}</p>
          <p className="text-[10px] text-emerald-700 font-medium">Verified Orders</p>
        </div>

        <div className="bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-orange-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Processing</span>
            <PackageCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-black text-orange-950">{stats.processingCount}</p>
          <p className="text-[10px] text-orange-700 font-medium">Packing in Warehouse</p>
        </div>

        <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/70 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Shipped</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-950">{stats.shippedCount}</p>
          <p className="text-[10px] text-blue-700 font-medium">Out for Delivery</p>
        </div>

        <div className="bg-green-50 p-3.5 rounded-2xl border border-green-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-green-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-green-700" />
          </div>
          <p className="text-xl font-black text-green-950">{stats.deliveredCount}</p>
          <p className="text-[10px] text-green-700 font-extrabold">Revenue: ৳{stats.monthlyRevenue}</p>
        </div>
      </div>

      {/* 2. Smart Search & Filter Header Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Top Search Input & Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Smart Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Order ID, Invoice No, Customer Name, Phone, Email, Txn ID, District..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export & Print Report Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Excel</span>
            </button>
            
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Print Filtered Report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
          </div>

        </div>

        {/* Filter Chips Bar */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          
          {/* Status Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-black uppercase text-slate-400 mr-1 shrink-0 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>

            {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Additional Filter Dropdowns (Payment, Date, District, Sort) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            
            {/* Payment Method Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                <option value="bKash">bKash Mobile Banking</option>
                <option value="Nagad">Nagad Mobile Banking</option>
                <option value="Rocket">Rocket Mobile Banking</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Date Range</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last7Days">Last 7 Days</option>
                <option value="Last30Days">Last 30 Days</option>
                <option value="ThisMonth">This Month</option>
                <option value="LastMonth">Last Month</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">District</label>
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Districts ({availableDistricts.length})</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Sort Orders By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highestAmount">Highest Amount</option>
                <option value="lowestAmount">Lowest Amount</option>
                <option value="customerName">Customer Name (A-Z)</option>
                <option value="newestDelivered">Delivered First</option>
                <option value="newestPending">Pending First</option>
              </select>
            </div>

          </div>

          {/* Custom Date Pickers */}
          {dateRangeFilter === 'Custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="font-extrabold text-slate-700">Custom Dates:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2 py-1 font-bold text-slate-800"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2 py-1 font-bold text-slate-800"
              />
            </div>
          )}

        </div>

      </div>

      {/* 3. Bulk Actions Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-emerald-900 text-white p-3 sm:p-4 rounded-2xl shadow-lg border border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xs">
              {selectedOrderIds.length}
            </span>
            <span className="font-black text-emerald-100">Orders Selected</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => handleBulkStatusUpdate('Confirmed')}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer"
            >
              Bulk Confirm
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Processing')}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl cursor-pointer"
            >
              Bulk Processing
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Shipped')}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl cursor-pointer"
            >
              Bulk Shipped
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Delivered')}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl cursor-pointer"
            >
              Bulk Delivered
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Cancelled')}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl cursor-pointer"
            >
              Bulk Cancel
            </button>
            {isSuperAdmin && (
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete</span>
              </button>
            )}
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Orders Table / List Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleSelectAllPage}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer flex items-center space-x-1.5 font-bold"
            >
              {paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.includes(o.id)) ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select Page ({paginatedOrders.length})</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-bold">
              Showing <strong>{filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> – <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> matching orders
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-bold">Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3 w-8 text-center">Select</th>
                <th className="p-3">Order & Invoice ID</th>
                <th className="p-3">Customer & Location</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount & Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Search className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold text-slate-600">No matching orders found</p>
                      <p className="text-[11px] text-slate-400">Try loosening your search query or filter options.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const invNo = ord.invoiceNumber || `INV-${ord.orderNumber || ord.id}`;
                  const extra = ord.extraCharge || ord.paymentCharge || 0;
                  const isOnline = ord.paymentMethod === 'bKash' || ord.paymentMethod === 'Nagad' || ord.paymentMethod === 'Rocket';
                  const proofImg = ord.paymentScreenshotURL || ord.paymentProof;

                  // Find user photo if available
                  const userCust = userMap.get((ord.email || '').toLowerCase()) || userMap.get(ord.mobile || '');

                  return (
                    <tr 
                      key={ord.id} 
                      className={`transition-colors hover:bg-slate-50/80 ${isSelected ? 'bg-emerald-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOrder(ord.id)}
                          className="p-1 cursor-pointer text-slate-500 hover:text-emerald-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Order & Invoice ID */}
                      <td className="p-3 space-y-0.5">
                        <span className="font-black text-slate-900 block text-xs">#{ord.orderNumber || ord.id}</span>
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded font-extrabold border border-slate-200">
                          {invNo}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {new Date(ord.orderTime || ord.createdAt || Date.now()).toLocaleDateString('en-GB')} {new Date(ord.orderTime || ord.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={userCust?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                            alt={ord.receiverName || ord.customerName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate max-w-[150px]">{ord.receiverName || ord.customerName}</p>
                            <p className="text-[11px] text-slate-600 font-mono font-bold">{ord.mobile}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{ord.district} • {ord.upazila}</p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className="font-black text-slate-800 text-xs">
                            {ord.items ? ord.items.length : ord.quantity || 1} Item(s)
                          </span>
                          <div className="flex items-center space-x-1">
                            {ord.items && ord.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.productImage}
                                alt={item.productName}
                                className="w-6 h-6 rounded object-cover border border-slate-200"
                                title={`${item.productName} x${item.quantity}`}
                              />
                            ))}
                            {ord.items && ord.items.length > 3 && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 rounded">
                                +{ord.items.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="p-3 space-y-1">
                        <p className="font-black text-emerald-950 text-sm">৳{ord.totalAmount || ord.grandTotal}</p>
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-full">
                            {ord.paymentMethod}
                          </span>
                          <span className={`px-2 py-0.5 font-bold rounded-full ${ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Verified' ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'}`}>
                            {ord.paymentStatus}
                          </span>
                        </div>
                        {isOnline && (ord.paymentTxnId || ord.transactionId) && (
                          <p className="text-[10px] font-mono text-slate-600 truncate max-w-[130px]">
                            Txn: <span className="font-bold text-slate-900">{ord.paymentTxnId || ord.transactionId}</span>
                          </p>
                        )}
                      </td>

                      {/* Delivery Status Select */}
                      <td className="p-3 space-y-1.5">
                        <select
                          value={ord.status || ord.orderStatus || 'Pending'}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                          disabled={isProcessing}
                          className={`w-full text-xs font-black px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${getStatusBadgeStyle(ord.status)}`}
                        >
                          <option value="Pending">🟡 Pending</option>
                          <option value="Confirmed">🟢 Confirmed</option>
                          <option value="Processing">🟠 Processing</option>
                          <option value="Shipped">🔵 Shipped</option>
                          <option value="Delivered">✅ Delivered</option>
                          <option value="Cancelled">🔴 Cancelled</option>
                        </select>

                        {proofImg && (
                          <button
                            type="button"
                            onClick={() => setViewImageModalUrl(proofImg)}
                            className="w-full text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Proof Image</span>
                          </button>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-xl transition-all cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onPrintInvoice(ord)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer shadow-2xs"
                            title="Print Invoice / PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all cursor-pointer"
                              title="Delete Order (Admin Only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-bold">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    currentPage === pageNum ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 5. ORDER DETAILS MODAL POPUP */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 relative my-auto border border-slate-100 max-h-[92vh] overflow-y-auto space-y-6 text-xs">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <span>Order #{viewingOrder.orderNumber || viewingOrder.id}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-xs rounded-md font-extrabold border border-slate-200">
                    {viewingOrder.invoiceNumber || `INV-${viewingOrder.orderNumber || viewingOrder.id}`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on: {new Date(viewingOrder.orderTime || viewingOrder.createdAt || Date.now()).toLocaleString('en-GB')}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onPrintInvoice(viewingOrder)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View / Print Invoice</span>
                </button>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(viewingOrder.id, viewingOrder.orderNumber)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Delivery Tracker Component */}
            <DeliveryTracker order={viewingOrder} />

            {/* Quick Status Control Buttons */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Quick Status Change
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(viewingOrder.id, st)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      viewingOrder.status === st
                        ? 'bg-slate-900 text-white shadow-xs ring-2 ring-emerald-400'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Address Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800">
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Customer Details</span>
                </h4>
                <p className="font-extrabold text-sm text-slate-900">{viewingOrder.receiverName || viewingOrder.customerName}</p>
                <p className="text-slate-600">Mobile: <strong className="text-slate-900 font-mono">{viewingOrder.mobile}</strong></p>
                <p className="text-slate-600">Email: {viewingOrder.email || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Delivery Shipping Address</span>
                </h4>
                <p className="font-bold text-slate-900">{viewingOrder.fullAddress || viewingOrder.address}</p>
                <p className="text-slate-600">
                  {viewingOrder.village || viewingOrder.area ? `Village/Area: ${viewingOrder.village || viewingOrder.area}, ` : ''}Upazila: {viewingOrder.upazila}, District: {viewingOrder.district}
                </p>
              </div>
            </div>

            {/* Itemized Order Products */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Ordered Products ({viewingOrder.items ? viewingOrder.items.length : 1})</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                {viewingOrder.items ? viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{item.productName}</p>
                        <p className="text-[11px] text-slate-500">Unit Price: ৳{item.unitPrice} × Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">৳{item.totalPrice}</span>
                  </div>
                )) : (
                  <div className="p-3 flex justify-between">
                    <span>{viewingOrder.productName || 'Organic Item'}</span>
                    <span className="font-bold">৳{viewingOrder.totalAmount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Breakdown & Payment Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Payment Details */}
              <div className="space-y-1.5 text-xs text-slate-700">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2">Payment Verification</h4>
                <p>Payment Method: <strong className="text-emerald-800">{viewingOrder.paymentMethod}</strong></p>
                <p>Payment Status: <strong className="text-emerald-800">{viewingOrder.paymentStatus}</strong></p>
                {(viewingOrder.paymentTxnId || viewingOrder.transactionId) && (
                  <p className="font-mono text-xs">
                    Txn ID: <strong className="text-slate-900">{viewingOrder.paymentTxnId || viewingOrder.transactionId}</strong>
                  </p>
                )}
                {(viewingOrder.senderMobileNumber || viewingOrder.senderNumber) && (
                  <p className="font-mono text-xs">
                    Sender Mobile: <strong className="text-slate-900">{viewingOrder.senderMobileNumber || viewingOrder.senderNumber}</strong>
                  </p>
                )}
                {(viewingOrder.paymentScreenshotURL || viewingOrder.paymentProof || viewingOrder.paymentScreenshotUrl) && (
                  <button
                    type="button"
                    onClick={() => setViewImageModalUrl(viewingOrder.paymentScreenshotURL || viewingOrder.paymentProof || viewingOrder.paymentScreenshotUrl || '')}
                    className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Payment Screenshot</span>
                  </button>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-slate-700 text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">৳{viewingOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-slate-900">৳{viewingOrder.deliveryCharge}</span>
                </div>
                {(viewingOrder.extraCharge || viewingOrder.paymentCharge) ? (
                  <div className="flex justify-between">
                    <span>Extra Charge:</span>
                    <span className="font-bold text-slate-900">৳{viewingOrder.extraCharge || viewingOrder.paymentCharge}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-black text-emerald-950 pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700">৳{viewingOrder.totalAmount || viewingOrder.grandTotal}</span>
                </div>
              </div>

            </div>

            {/* Status History Timeline Audit */}
            {viewingOrder.timeline && viewingOrder.timeline.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Status History & Audit Logs</h4>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 divide-y divide-slate-200/60">
                  {viewingOrder.timeline.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-black text-slate-900 mr-2">{item.status}</span>
                        <span className="text-slate-500">{item.note || 'Status updated'}</span>
                        {item.updatedBy && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Updated by: {item.updatedBy}</span>
                        )}
                      </div>
                      <span className="font-bold text-emerald-800 shrink-0">
                        {new Date(item.timestamp).toLocaleDateString('en-GB')} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
