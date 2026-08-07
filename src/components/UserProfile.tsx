import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, where, or, addDoc } from 'firebase/firestore';
import { DeliveryTracker } from './DeliveryTracker';
import { 
  X, 
  User as UserIcon, 
  Package, 
  Key, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Edit3, 
  LogOut,
  ChevronRight,
  AlertCircle,
  Eye,
  Download,
  FileText,
  Truck
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onPrintInvoice: (order: Order) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onPrintInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'edit-profile' | 'password'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Edit profile form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || '');
  const [district, setDistrict] = useState(currentUser?.address?.district || 'Kushtia');
  const [upazila, setUpazila] = useState(currentUser?.address?.upazila || 'Mirpur');
  const [fullAddress, setFullAddress] = useState(currentUser?.address?.fullAddress || '');
  const [saveMessage, setSaveMessage] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Fetch orders fallback
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const activeId = auth.currentUser?.uid || currentUser.id;
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(activeId)}`);
      if (res.ok) {
        const apiData: Order[] = await res.json();
        setOrders(prev => {
          const map = new Map<string, Order>();
          prev.forEach(o => {
            const k = o.id || o.orderNumber || o.orderId;
            if (k) map.set(k, o);
          });
          (Array.isArray(apiData) ? apiData : []).forEach(o => {
            const k = o.id || o.orderNumber || o.orderId;
            if (k && !map.has(k)) map.set(k, o);
          });
          return Array.from(map.values()).sort((a, b) => 
            new Date(b.orderTime || b.createdAt || 0).getTime() - new Date(a.orderTime || a.createdAt || 0).getTime()
          );
        });
      }
    } catch (err) {
      console.error("User orders fetch error:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      setLoadingOrders(true);

      // Initial API fallback fetch
      fetchUserOrders();

      const cId = (auth.currentUser?.uid || currentUser.id || '').trim();
      const cEmail = (auth.currentUser?.email || currentUser.email || '').trim().toLowerCase();
      const cPhone = (currentUser.mobile || '').trim();

      // Subscribe live from Firestore orders collection
      const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
        const myOrders: Order[] = snap.docs
          .map(docSnap => {
            const d = docSnap.data();
            const ordId = d.orderId || d.orderNumber || docSnap.id;
            const ordNum = d.orderNumber || d.orderId || docSnap.id;
            const time = d.orderTime || d.createdAt || new Date().toISOString();
            const created = d.createdAt || d.orderTime || time;
            const proof = d.paymentProof || d.paymentScreenshotURL || d.paymentScreenshotUrl || '';
            const txn = d.paymentTxnId || d.transactionId || '';
            const items = Array.isArray(d.items) && d.items.length > 0 ? d.items : (Array.isArray(d.cartItems) ? d.cartItems : []);

            return {
              id: docSnap.id,
              orderId: ordId,
              orderNumber: ordNum,
              invoiceNumber: d.invoiceNumber || `INV-${ordNum}`,
              userId: d.userId || d.customerUid || d.uid || '',
              customerUid: d.customerUid || d.userId || d.uid || '',
              receiverName: d.receiverName || d.customerName || d.name || 'Customer',
              customerName: d.customerName || d.receiverName || d.name || 'Customer',
              username: d.username || '',
              email: d.email || d.customerEmail || '',
              customerEmail: d.customerEmail || d.email || '',
              mobile: d.mobile || d.phone || '',
              phone: d.phone || d.mobile || '',
              fullAddress: d.fullAddress || d.address || '',
              address: d.address || d.fullAddress || '',
              district: d.district || '',
              upazila: d.upazila || '',
              area: d.area || d.village || '',
              village: d.village || d.area || '',
              notes: d.notes || '',
              items,
              cartItems: items,
              subtotal: Number(d.subtotal) || 0,
              deliveryCharge: Number(d.deliveryCharge) || 0,
              paymentCharge: Number(d.paymentCharge) || 0,
              extraCharge: Number(d.extraCharge) || 0,
              totalAmount: Number(d.totalAmount || d.grandTotal) || 0,
              grandTotal: Number(d.grandTotal || d.totalAmount) || 0,
              paymentMethod: d.paymentMethod || 'Cash on Delivery',
              paymentStatus: d.paymentStatus || 'Unpaid',
              paymentTxnId: txn,
              transactionId: txn,
              senderMobileNumber: d.senderMobileNumber || d.senderNumber || '',
              senderNumber: d.senderNumber || d.senderMobileNumber || '',
              paymentProof: proof,
              paymentScreenshotURL: proof,
              paymentScreenshotUrl: proof,
              orderTime: time,
              createdAt: created,
              updatedAt: d.updatedAt || created,
              status: d.status || d.orderStatus || 'Pending',
              orderStatus: d.orderStatus || d.status || 'Pending',
              timeline: Array.isArray(d.timeline) ? d.timeline : []
            } as Order;
          })
          .filter(o => {
            if (!currentUser) return false;
            const matchId = Boolean(cId) && (o.userId === cId || o.customerUid === cId);
            const matchEmail = Boolean(cEmail) && ((o.email || '').toLowerCase() === cEmail || (o.customerEmail || '').toLowerCase() === cEmail);
            const matchPhone = Boolean(cPhone) && (o.mobile === cPhone || o.phone === cPhone);
            return matchId || matchEmail || matchPhone;
          })
          .sort((a, b) => new Date(b.orderTime || b.createdAt || 0).getTime() - new Date(a.orderTime || a.createdAt || 0).getTime());

        setOrders(myOrders);
        setLoadingOrders(false);
      }, (err) => {
        console.warn("Firestore orders onSnapshot warning:", err);
        setLoadingOrders(false);
      });

      return () => unsub();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName,
          mobile,
          profilePhoto,
          address: { district, upazila, fullAddress }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      onUpdateUser(data.user);
      setSaveMessage('Profile details updated successfully! ✅');
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setPassSuccess('Password changed successfully! ✅');
      try {
        await addDoc(collection(db, 'notifications'), {
          type: 'system',
          userId: currentUser.id,
          title: '🔑 Password Changed',
          message: 'Your account password was updated successfully.',
          read: false,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: '/profile'
        });
      } catch (nErr) {
        console.warn("Password change notification notice:", nErr);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPassError(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (selectedOrderFilter === 'All') return true;
    return o.status === selectedOrderFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative my-auto border border-gray-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-green-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'}
              alt={currentUser.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <h2 className="text-xl font-extrabold flex items-center space-x-2">
                <span>{currentUser.fullName}</span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {currentUser.role}
                </span>
              </h2>
              <p className="text-xs text-emerald-200">@{currentUser.username} • {currentUser.email}</p>
              <p className="text-[11px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{currentUser.address?.fullAddress || 'Mirpur, Kushtia, Bangladesh'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'orders' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit-profile')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'edit-profile' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'password' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Order Status Filters */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedOrderFilter(st)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      selectedOrderFilter === st ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-gray-500 font-bold">Loading your orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-3xl">📦</div>
                  <p className="font-bold text-gray-700 text-sm">No orders found in this category.</p>
                  <p className="text-xs text-gray-400">Place an order for fresh organic products to view history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => {
                    const invNo = ord.invoiceNumber || `INV-${ord.orderNumber || ord.id}`;
                    const extra = ord.extraCharge || ord.paymentCharge || 0;

                    return (
                      <div
                        key={ord.id}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                      >
                        {/* Order & Invoice Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black text-slate-900">Order #{ord.orderNumber}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-md font-extrabold border border-slate-200">
                                {invNo}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Placed on: {new Date(ord.orderTime).toLocaleDateString('en-GB')} at {new Date(ord.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${getStatusBadge(ord.status)}`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Invoice Action Buttons */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                          <button
                            type="button"
                            onClick={() => onPrintInvoice(ord)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>👁 View Invoice</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onPrintInvoice(ord)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>🖨 Print Invoice</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onPrintInvoice(ord)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>📄 Download Invoice (PDF)</span>
                          </button>
                        </div>

                        {/* Real-time Delivery Tracker Timeline */}
                        <DeliveryTracker order={ord} />

                        {/* Customer & Address Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                          <div>
                            <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-emerald-800 mb-1">
                              Receiver Info
                            </p>
                            <p className="font-bold text-slate-900">{ord.receiverName || ord.customerName}</p>
                            <p className="text-slate-600">Mobile: {ord.mobile}</p>
                            <p className="text-slate-600">Email: {ord.email || 'N/A'}</p>
                          </div>

                          <div>
                            <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-emerald-800 mb-1">
                              Shipping Address
                            </p>
                            <p className="text-slate-800 font-medium">{ord.fullAddress || ord.address}</p>
                            <p className="text-slate-600">
                              {ord.village || ord.area ? `Village/Area: ${ord.village || ord.area}, ` : ''}Upazila: {ord.upazila}, District: {ord.district}
                            </p>
                            {(ord.paymentTxnId || ord.transactionId) && (
                              <p className="text-emerald-700 font-extrabold text-[11px] mt-1">
                                Txn ID: <span className="font-mono">{ord.paymentTxnId || ord.transactionId}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-2">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Ordered Products ({ord.items.length})</p>
                          <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden bg-white">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2.5">
                                  <img src={item.productImage} alt={item.productName} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                                  <div>
                                    <p className="font-bold text-slate-900">{item.productName}</p>
                                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ৳{item.unitPrice}</p>
                                  </div>
                                </div>
                                <span className="font-black text-slate-900">৳{item.totalPrice}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment & Charges Summary */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900">Payment Method:</span>
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded-full text-[10px]">
                                {ord.paymentMethod}
                              </span>
                            </div>
                            <p className="text-slate-600">
                              Payment Status: <strong className={ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Verified' ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>{ord.paymentStatus}</strong>
                            </p>
                            {(ord.paymentProof || ord.paymentScreenshotURL) && (
                              <a
                                href={ord.paymentProof || ord.paymentScreenshotURL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block text-[11px] font-bold text-blue-600 hover:underline pt-0.5"
                              >
                                🖼 View Payment Screenshot
                              </a>
                            )}
                          </div>

                          <div className="w-full sm:w-56 space-y-1 text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                            <div className="flex justify-between text-slate-600">
                              <span>Subtotal:</span>
                              <span className="font-bold">৳{ord.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Delivery Charge:</span>
                              <span className="font-bold">৳{ord.deliveryCharge}</span>
                            </div>
                            {extra > 0 && (
                              <div className="flex justify-between text-slate-600">
                                <span>Extra Charge:</span>
                                <span className="font-bold">৳{extra}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-black text-sm text-emerald-950 pt-1 border-t border-slate-200">
                              <span>Grand Total:</span>
                              <span className="text-emerald-700">৳{ord.totalAmount || ord.grandTotal}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {activeTab === 'edit-profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              {saveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  {saveMessage}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Upazila / Area</label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Full Address</label>
                <textarea
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Profile Photo Image URL</label>
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              {passError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                  ⚠️ {passError}
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  {passSuccess}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
