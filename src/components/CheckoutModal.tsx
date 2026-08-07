import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Truck, Phone, MapPin, Building, ArrowRight, Copy, Upload, Check, AlertCircle } from 'lucide-react';
import { CartItem, PaymentMethod, User, Order } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User | null;
  onOrderSuccess: (order: Order) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onOrderSuccess,
  onUpdateCartQuantity
}) => {
  const [receiverName, setReceiverName] = useState(currentUser?.fullName || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [district, setDistrict] = useState(currentUser?.address?.district || 'Kushtia');
  const [upazila, setUpazila] = useState(currentUser?.address?.upazila || 'Mirpur');
  const [village, setVillage] = useState(currentUser?.address?.area || 'Mirpur Bazar');
  const [fullAddress, setFullAddress] = useState(currentUser?.address?.fullAddress || '');
  const [notes, setNotes] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [senderMobileNumber, setSenderMobileNumber] = useState('');
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Dynamic Payment Themes
  const paymentThemes: Record<string, {
    primary: string;
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    lightBg: string;
    borderColor: string;
  }> = {
    'Cash on Delivery': {
      primary: '#FF5A8A',
      headerBg: 'from-[#FF5A8A] via-[#FF759B] to-[#FF5A8A]',
      badgeBg: 'bg-pink-100',
      badgeText: 'text-[#FF5A8A]',
      btnBg: 'bg-[#FF5A8A]',
      lightBg: 'bg-pink-50/80',
      borderColor: 'border-pink-200',
    },
    'bKash': {
      primary: '#E2136E',
      headerBg: 'from-[#E2136E] via-[#f0388d] to-[#E2136E]',
      badgeBg: 'bg-[#E2136E]/15',
      badgeText: 'text-[#E2136E]',
      btnBg: 'bg-[#E2136E]',
      lightBg: 'bg-[#E2136E]/10',
      borderColor: 'border-[#E2136E]/30',
    },
    'Nagad': {
      primary: '#F9A825',
      headerBg: 'from-[#F9A825] via-[#fbc02d] to-[#F9A825]',
      badgeBg: 'bg-[#F9A825]/20',
      badgeText: 'text-[#d97706]',
      btnBg: 'bg-[#F9A825]',
      lightBg: 'bg-[#F9A825]/10',
      borderColor: 'border-[#F9A825]/30',
    },
    'Rocket': {
      primary: '#7B1FA2',
      headerBg: 'from-[#7B1FA2] via-[#ab47bc] to-[#7B1FA2]',
      badgeBg: 'bg-[#7B1FA2]/15',
      badgeText: 'text-[#7B1FA2]',
      btnBg: 'bg-[#7B1FA2]',
      lightBg: 'bg-[#7B1FA2]/10',
      borderColor: 'border-[#7B1FA2]/30',
    },
  };

  const currentTheme = paymentThemes[paymentMethod] || paymentThemes['Cash on Delivery'];

  // Delivery Charge logic:
  // Kushtia = 50, Khulna = 120, Other = 150
  let deliveryCharge = 150;
  if (district === 'Kushtia') {
    deliveryCharge = 50;
  } else if (district === 'Khulna') {
    deliveryCharge = 120;
  }

  // Calculate Subtotal
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice && item.product.discountPrice < item.product.price
      ? item.product.discountPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Online Payment Charge (1% for bKash, Nagad, Rocket)
  const isOnlinePayment = paymentMethod === 'bKash' || paymentMethod === 'Nagad' || paymentMethod === 'Rocket';
  const paymentCharge = isOnlinePayment ? Math.round(subtotal * 0.01) : 0;

  // Grand Total
  const grandTotal = subtotal + deliveryCharge + paymentCharge;

  // Check validation for placing order
  const isOnlinePaymentValid = isOnlinePayment
    ? Boolean(transactionId.trim() && senderMobileNumber.trim() && (paymentScreenshotFile || screenshotPreview))
    : true;

  const canPlaceOrder = agreedTerms && receiverName.trim() && mobile.trim() && fullAddress.trim() && district.trim() && upazila.trim() && village.trim() && cart.length > 0 && isOnlinePaymentValid;

  // Payment Numbers
  const paymentNumbers: Record<string, string> = {
    bKash: '01907655994',
    Nagad: '01724202210',
    Rocket: '01907655994'
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');

    if (!agreedTerms) {
      setErrorMessage('Please agree to the Terms & Conditions before placing your order.');
      return;
    }

    if (!receiverName.trim() || !mobile.trim() || !fullAddress.trim() || !district.trim() || !upazila.trim() || !village.trim()) {
      setErrorMessage('Please fill in all delivery details (Name, Mobile, District, Upazila, Village, Full Address).');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (isOnlinePayment) {
      if (!transactionId.trim()) {
        setErrorMessage(`Please enter your ${paymentMethod} Transaction ID.`);
        return;
      }
      if (!senderMobileNumber.trim()) {
        setErrorMessage(`Please enter the Sender Mobile Number for ${paymentMethod}.`);
        return;
      }
      if (!paymentScreenshotFile && !screenshotPreview) {
        setErrorMessage(`Please upload a Payment Screenshot for ${paymentMethod}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl = '';

      // Upload screenshot to Cloudinary if provided
      if (isOnlinePayment && paymentScreenshotFile) {
        setUploadProgress(true);
        paymentProofUrl = await uploadToCloudinary(paymentScreenshotFile);
        setUploadProgress(false);
      } else if (isOnlinePayment && screenshotPreview) {
        paymentProofUrl = screenshotPreview;
      }

      const generatedOrderId = 'OFBD-' + Math.floor(100000 + Math.random() * 900000);
      const docId = 'ord-' + Date.now();
      const now = new Date().toISOString();

      const primaryProduct = cart[0]?.product;

      const orderData: Order = {
        id: docId,
        orderId: generatedOrderId,
        orderNumber: generatedOrderId,
        userId: currentUser?.id || 'guest',
        customerUid: currentUser?.id || 'guest',
        receiverName: receiverName.trim(),
        customerName: receiverName.trim(),
        username: currentUser?.username || 'customer',
        email: email.trim() || currentUser?.email || 'customer@organikfoodbd.com',
        customerEmail: email.trim() || currentUser?.email || 'customer@organikfoodbd.com',
        mobile: mobile.trim(),
        phone: mobile.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        area: village.trim(),
        village: village.trim(),
        fullAddress: fullAddress.trim(),
        address: fullAddress.trim(),
        notes: notes.trim(),
        productId: primaryProduct?.id || '',
        productName: primaryProduct?.name || '',
        productImage: primaryProduct?.image || primaryProduct?.images[0] || '',
        quantity: cart.reduce((s, i) => s + i.quantity, 0),
        unitPrice: primaryProduct ? (primaryProduct.discountPrice || primaryProduct.price) : 0,
        items: cart.map(item => {
          const unitPrice = item.product.discountPrice && item.product.discountPrice < item.product.price
            ? item.product.discountPrice
            : item.product.price;
          return {
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0] || item.product.image || '',
            unitPrice,
            quantity: item.quantity,
            totalPrice: unitPrice * item.quantity
          };
        }),
        cartItems: cart.map(item => {
          const unitPrice = item.product.discountPrice && item.product.discountPrice < item.product.price
            ? item.product.discountPrice
            : item.product.price;
          return {
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0] || item.product.image || '',
            unitPrice,
            quantity: item.quantity,
            totalPrice: unitPrice * item.quantity
          };
        }),
        subtotal,
        deliveryCharge,
        paymentCharge,
        totalAmount: grandTotal,
        grandTotal,
        paymentMethod,
        paymentStatus: isOnlinePayment ? 'Paid' : 'Unpaid',
        paymentTxnId: isOnlinePayment ? transactionId.trim() : '',
        transactionId: isOnlinePayment ? transactionId.trim() : '',
        senderMobileNumber: isOnlinePayment ? senderMobileNumber.trim() : '',
        senderNumber: isOnlinePayment ? senderMobileNumber.trim() : '',
        paymentProof: paymentProofUrl,
        paymentScreenshotURL: paymentProofUrl,
        paymentScreenshotUrl: paymentProofUrl,
        orderTime: now,
        createdAt: now,
        updatedAt: now,
        status: 'Pending',
        orderStatus: 'Pending',
        timeline: [
          { status: 'Pending', timestamp: now, note: `Order placed via ${paymentMethod}` }
        ]
      };

      // 1. Save to Firestore 'orders' collection
      await setDoc(doc(db, 'orders', docId), orderData, { merge: true });

      // 2. Decrement stock for products in Firestore
      for (const item of cart) {
        try {
          const prodRef = doc(db, 'products', item.product.id);
          await updateDoc(prodRef, {
            stock: increment(-item.quantity)
          });
        } catch (stkErr) {
          console.warn(`Failed stock decrement for prod ${item.product.id}:`, stkErr);
        }
      }

      // 3. Create Notifications in Firestore
      try {
        // Admin Notification: New Order
        await addDoc(collection(db, 'notifications'), {
          type: 'order',
          userId: 'admin',
          title: '🛒 New Order Received',
          message: `Order #${generatedOrderId} placed by ${receiverName.trim()} (৳${grandTotal.toLocaleString()} via ${paymentMethod})`,
          read: false,
          isRead: false,
          createdAt: now,
          link: '/admin/orders'
        });

        // Admin Notification: Payment Submitted if online
        if (isOnlinePayment) {
          await addDoc(collection(db, 'notifications'), {
            type: 'order',
            userId: 'admin',
            title: '💳 Payment Submitted',
            message: `Payment submitted for Order #${generatedOrderId} via ${paymentMethod}. TxID: ${transactionId.trim() || 'N/A'}.`,
            read: false,
            isRead: false,
            createdAt: now,
            link: '/admin/orders'
          });
        }

        // Customer Notification: Order Placed
        const custUid = currentUser?.id || 'guest';
        if (custUid !== 'guest') {
          await addDoc(collection(db, 'notifications'), {
            type: 'order',
            userId: custUid,
            title: '🎉 Order Placed Successfully',
            message: `Thank you ${receiverName.trim()}! Your order #${generatedOrderId} (৳${grandTotal.toLocaleString()}) has been placed and is currently Pending.`,
            read: false,
            isRead: false,
            createdAt: now,
            link: '/profile/orders'
          });
        }
      } catch (notifErr) {
        console.warn("Failed creating notifications:", notifErr);
      }

      // 4. Save to Express server memory DB if running
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      } catch (apiErr) {
        console.warn("Server API sync warning:", apiErr);
      }

      setCreatedOrder(orderData);
      onOrderSuccess(orderData);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMessage(err.message || 'Failed to place order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative my-auto border border-pink-100 max-h-[92vh] flex flex-col">
            {/* Header */}
        <div 
          className={`px-6 py-4 bg-gradient-to-r ${currentTheme.headerBg} text-white flex items-center justify-between transition-all duration-300`}
        >
          <div>
            <h3 className="text-lg font-black flex items-center space-x-2">
              <span>Checkout & Payment</span>
            </h3>
            <p className="text-xs text-white/90">Organik Food BD • Mirpur, Kushtia</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {createdOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Your order has been placed successfully! 🎉</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for choosing Organik Food BD. Your order <strong className="text-emerald-700">#{createdOrder.orderId}</strong> is now <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold text-xs">Pending</span> and sent to Admin for quick confirmation!
              </p>

              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 text-left text-xs max-w-md mx-auto space-y-2">
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-slate-500 font-semibold">Order ID:</span>
                  <span className="font-extrabold text-slate-900">#{createdOrder.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-slate-500 font-semibold">Customer Name:</span>
                  <span className="font-bold text-slate-900">{createdOrder.receiverName}</span>
                </div>
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-slate-500 font-semibold">Mobile:</span>
                  <span className="font-bold text-slate-900">{createdOrder.mobile}</span>
                </div>
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-slate-500 font-semibold">Delivery Address:</span>
                  <span className="font-bold text-slate-900 text-right">{createdOrder.fullAddress}, {createdOrder.district}</span>
                </div>
                <div className="flex justify-between border-b border-pink-100 pb-2">
                  <span className="text-slate-500 font-semibold">Payment Method:</span>
                  <span className="font-extrabold" style={{ color: currentTheme.primary }}>{createdOrder.paymentMethod}</span>
                </div>
                {createdOrder.transactionId && (
                  <div className="flex justify-between border-b border-pink-100 pb-2">
                    <span className="text-slate-500 font-semibold">Transaction ID:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{createdOrder.transactionId}</span>
                  </div>
                )}
                {createdOrder.senderMobileNumber && (
                  <div className="flex justify-between border-b border-pink-100 pb-2">
                    <span className="text-slate-500 font-semibold">Sender Number:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{createdOrder.senderMobileNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1">
                  <span>Grand Total:</span>
                  <span style={{ color: currentTheme.primary }}>৳{createdOrder.grandTotal}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    try {
                      window.open('https://www.effectivecpmnetwork.com/sgw291bc?key=9f566c4945f649d7daa48b2043e6080d', '_blank');
                    } catch (e) {
                      console.warn('Smart link open error:', e);
                    }
                    onClose();
                  }}
                  style={{ backgroundColor: currentTheme.primary }}
                  className="px-6 py-3 text-white rounded-full font-extrabold text-xs shadow-md cursor-pointer transition-all duration-300 hover:brightness-90"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Customer & Delivery Information */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <Truck className="w-4 h-4" style={{ color: currentTheme.primary }} />
                  <span>1. Delivery Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hafez Nayem"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712345678"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">District *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                    >
                      <option value="Kushtia">District Kushtia (৳50 Delivery)</option>
                      <option value="Khulna">District Khulna (৳120 Delivery)</option>
                      <option value="Dhaka">Dhaka (৳150 Delivery)</option>
                      <option value="Rajshahi">Rajshahi (৳150 Delivery)</option>
                      <option value="Chittagong">Chittagong (৳150 Delivery)</option>
                      <option value="Sylhet">Sylhet (৳150 Delivery)</option>
                      <option value="Barisal">Barisal (৳150 Delivery)</option>
                      <option value="Rangpur">Rangpur (৳150 Delivery)</option>
                      <option value="Mymensingh">Mymensingh (৳150 Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Upazila *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mirpur"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Village / Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mirpur Bazar"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House No, Road Name, Landmarks..."
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="Special instructions for delivery rider..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white outline-none font-medium text-slate-800 transition-all duration-300"
                  />
                </div>
              </div>

              {/* 2. Product Summary & Quantity Adjuster */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <span>🛒</span>
                  <span>2. Product Summary</span>
                </h4>

                <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-3.5 divide-y divide-slate-100 max-h-48 overflow-y-auto space-y-2">
                  {cart.map((item) => {
                    const unitPrice = item.product.discountPrice && item.product.discountPrice < item.product.price
                      ? item.product.discountPrice
                      : item.product.price;
                    return (
                      <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <img
                            src={item.product.images[0] || item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                            <p className="text-[10px] text-slate-500">৳{unitPrice} / {item.product.unit}</p>
                          </div>
                        </div>

                        {/* Quantity Adjuster Buttons (+ -) */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity && onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-extrabold text-xs text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQuantity && onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-slate-900 w-16 text-right">
                            ৳{unitPrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Payment Options */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4" style={{ color: currentTheme.primary }} />
                  <span>3. Payment Options</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Cash on Delivery', 'bKash', 'Nagad', 'Rocket'] as PaymentMethod[]).map((method) => {
                    const isSelected = paymentMethod === method;
                    const optionTheme = paymentThemes[method];
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'shadow-xs ring-2 bg-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                        style={{
                          borderColor: isSelected ? optionTheme.primary : undefined,
                          color: isSelected ? optionTheme.primary : undefined,
                        }}
                      >
                        <div className="font-extrabold">{method}</div>
                        <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                          {method === 'Cash on Delivery' ? 'Pay cash on arrival' : '+1% Payment Fee'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Online Payment Box */}
                {isOnlinePayment && (
                  <div 
                    className="p-4 rounded-2xl border space-y-3 animate-in fade-in transition-all duration-300"
                    style={{ backgroundColor: `${currentTheme.primary}0D`, borderColor: `${currentTheme.primary}40` }}
                  >
                    <p className="text-xs font-bold text-slate-800">
                      Send payment to our Official Send Money / Cash In Mobile Banking Number:
                    </p>

                    {/* Selected Single Payment Card */}
                    {(paymentMethod === 'bKash' || paymentMethod === 'Nagad' || paymentMethod === 'Rocket') && (
                      <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: currentTheme.primary }}>
                            {paymentMethod} Number:
                          </span>
                          <span className="text-base font-black font-mono text-slate-900">{paymentNumbers[paymentMethod]}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(paymentNumbers[paymentMethod])}
                          style={{ backgroundColor: `${currentTheme.primary}1A`, color: currentTheme.primary }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer hover:opacity-80"
                        >
                          {copiedNumber === paymentNumbers[paymentMethod] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Number</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Bangla Warning Message immediately below the payment card */}
                    <div 
                      className="text-center font-bold text-black text-[13px] leading-snug w-full py-0.5"
                      style={{ 
                        color: '#000000', 
                        fontWeight: 700, 
                        fontSize: '13px', 
                        marginTop: '8px',
                        marginBottom: '4px'
                      }}
                    >
                      অবশ্যই সেন্ড মানি করবেন।
                    </div>

                    {/* Transaction ID & Sender Mobile Number - 2 Inputs in 1 Row */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <div className="w-full sm:w-[45%]">
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          Transaction ID *
                        </label>
                        <input
                          type="text"
                          required={isOnlinePayment}
                          placeholder="e.g. BKASH893214"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono text-slate-900 font-bold transition-all duration-300"
                          style={{ borderColor: `${currentTheme.primary}60` }}
                        />
                      </div>

                      <div className="w-full sm:w-[55%]">
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          Sender Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required={isOnlinePayment}
                          placeholder="e.g. 017XXXXXXXX"
                          value={senderMobileNumber}
                          onChange={(e) => setSenderMobileNumber(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono text-slate-900 font-bold transition-all duration-300"
                          style={{ borderColor: `${currentTheme.primary}60` }}
                        />
                      </div>
                    </div>

                    {/* Screenshot Upload */}
                    <div className="pt-1">
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Upload Payment Screenshot *
                      </label>
                      <label 
                        className="flex items-center justify-center px-3 py-2.5 bg-white border border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                        style={{ borderColor: `${currentTheme.primary}80` }}
                      >
                        <Upload className="w-4 h-4 mr-2" style={{ color: currentTheme.primary }} />
                        <span>{paymentScreenshotFile ? paymentScreenshotFile.name : 'Select Screenshot (JPG, PNG, WEBP)'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {screenshotPreview && (
                      <div className="mt-2 text-center">
                        <p className="text-[10px] text-slate-500 font-semibold mb-1">Payment Screenshot Preview:</p>
                        <img
                          src={screenshotPreview}
                          alt="Payment Screenshot Preview"
                          className="w-36 h-36 object-cover rounded-xl mx-auto border-2 shadow-xs"
                          style={{ borderColor: currentTheme.primary }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Order Total Breakdown */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Product Subtotal</span>
                  <span className="font-bold text-slate-800">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge ({district === 'Kushtia' ? 'District Kushtia' : district === 'Khulna' ? 'District Khulna' : 'Other Districts'})</span>
                  <span className="font-bold text-slate-800">৳{deliveryCharge}</span>
                </div>
                {isOnlinePayment && (
                  <div className="flex justify-between" style={{ color: currentTheme.primary }}>
                    <span>Online Payment Charge (1% {paymentMethod})</span>
                    <span className="font-bold">৳{paymentCharge}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span style={{ color: currentTheme.primary }}>৳{grandTotal}</span>
                </div>
              </div>

              {/* 5. Terms & Conditions Agreement Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  style={{ accentColor: currentTheme.primary }}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-700 font-medium cursor-pointer">
                  I agree with the <strong style={{ color: currentTheme.primary }}>Terms & Conditions</strong> of Organik Food BD.
                </label>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || !canPlaceOrder}
                style={{ backgroundColor: currentTheme.primary }}
                className="w-full py-4 text-white font-extrabold text-sm rounded-full shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer hover:brightness-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>
                  {isSubmitting
                    ? (uploadProgress ? 'Uploading Screenshot...' : 'Processing Order...')
                    : `Confirm Order (৳${grandTotal})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
