import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  FolderPlus, 
  Bell, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Printer, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  UserPlus,
  Sparkles,
  Download,
  FileText
} from 'lucide-react';
import { Product, Category, Order, User, Notification, SystemStats, OrderStatus, UserRole, Banner } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BannerManager } from './BannerManager';
import { DeliveryTracker } from './DeliveryTracker';
import { OrderManager } from './OrderManager';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';

const formatReadableDate = (rawDate: any): string => {
  if (!rawDate) return 'N/A';
  try {
    let d: Date;
    if (typeof rawDate === 'object' && rawDate !== null) {
      if (typeof rawDate.toDate === 'function') {
        d = rawDate.toDate();
      } else if (typeof rawDate.seconds === 'number') {
        d = new Date(rawDate.seconds * 1000);
      } else {
        d = new Date(rawDate);
      }
    } else if (typeof rawDate === 'number') {
      d = new Date(rawDate);
    } else {
      d = new Date(String(rawDate));
    }

    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const normalizeCategory = (cat?: string): string => {
  if (!cat) return 'General';
  const trimmed = cat.trim();
  if (trimmed === 'Food Supplement' || trimmed === 'Category 1') return 'Food Supplement';
  if (trimmed === 'Consumer Goods' || trimmed === 'Category 2' || trimmed === 'Consumer') return 'Consumer Goods';
  if (trimmed === 'General') return 'General';
  return trimmed;
};

const renderPaymentMethodBadge = (method?: string) => {
  switch (method) {
    case 'bKash':
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E2136E]/15 text-[#E2136E] border border-[#E2136E]/30">bKash</span>;
    case 'Nagad':
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F9A825]/20 text-[#d97706] border border-[#F9A825]/30">Nagad</span>;
    case 'Rocket':
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#7B1FA2]/15 text-[#7B1FA2] border border-[#7B1FA2]/30">Rocket</span>;
    case 'Cash on Delivery':
    default:
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-[#FF5A8A] border border-pink-200">Cash on Delivery</span>;
  }
};

const renderPaymentStatusBadge = (pStatus?: string) => {
  const isPaid = pStatus === 'Paid' || pStatus === 'Verified';
  if (isPaid) {
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">Paid</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
};

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPrintInvoice: (order: Order) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPrintInvoice
}) => {
  const userEmail = currentUser?.email?.toLowerCase() || '';
  const isSuperAdmin = userEmail === 'hafejnayem1743@gmail.com';
  const isLimitedAdmin = userEmail === 'jsenterprisesohel@gmail.com';
  const isAdmin = isSuperAdmin || isLimitedAdmin;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'users' | 'notifications' | 'roles' | 'banners'>('overview');

  const switchTab = (tab: 'overview' | 'products' | 'orders' | 'categories' | 'users' | 'notifications' | 'roles' | 'banners') => {
    if (isLimitedAdmin && !['overview', 'orders', 'notifications'].includes(tab)) {
      setActiveTab('overview');
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (isLimitedAdmin && !['overview', 'orders', 'notifications'].includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [isLimitedAdmin, activeTab]);

  // Stats
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Banners
  const [banners, setBanners] = useState<Banner[]>([]);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form
  const [pName, setPName] = useState('');
  const [pBnName, setPBnName] = useState('');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pCaption, setPCaption] = useState('');
  const [pBenefits, setPBenefits] = useState('');
  const [pPrice, setPPrice] = useState(100);
  const [pDiscountPrice, setPDiscountPrice] = useState(0);
  const [pCategory, setPCategory] = useState('General');
  const [pStock, setPStock] = useState(50);
  const [pUnit, setPUnit] = useState('Kg');
  const [pImages, setPImages] = useState<string[]>(['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800']);

  // Handle Image File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPImages([reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [viewImageModalUrl, setViewImageModalUrl] = useState<string | null>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load Banners from Firestore
  const loadBanners = async () => {
    try {
      const bannerSnap = await getDocs(collection(db, 'banners'));
      const fetchedBanners: Banner[] = bannerSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          image: d.image || '',
          title: d.title || '',
          subtitle: d.subtitle || '',
          badge: d.badge || '',
          buttonText: d.buttonText || '',
          buttonLink: d.buttonLink || '',
          displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 1,
          enabled: d.enabled !== false,
          startDate: d.startDate || undefined,
          endDate: d.endDate || undefined,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || undefined
        };
      });
      setBanners(fetchedBanners);
    } catch (bErr) {
      console.warn("Firestore fetch banners error:", bErr);
    }
  };

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      await loadBanners();

      // 1. Fetch products from Firestore
      let firestoreProducts: Product[] = [];
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        firestoreProducts = prodSnap.docs.map(doc => {
          const d = doc.data();
          const imgUrl = d.image || (d.images && d.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
          return {
            id: doc.id,
            name: d.name || '',
            bnName: d.bnName || d.name || '',
            caption: d.caption || d.shortDescription || '',
            shortDescription: d.caption || d.shortDescription || '',
            benefits: d.benefits || d.fullDescription || '',
            fullDescription: d.benefits || d.fullDescription || '',
            price: Number(d.price) || 0,
            discountPrice: d.discountPrice ? Number(d.discountPrice) : undefined,
            category: normalizeCategory(d.category),
            stock: d.stock ? Number(d.stock) : 50,
            unit: d.unit || 'Kg',
            image: imgUrl,
            images: d.images || [imgUrl],
            rating: d.rating || 5,
            reviewCount: d.reviewCount || 10,
            status: d.status || 'active',
            createdAt: d.createdAt || new Date().toISOString()
          } as Product;
        });
      } catch (fsErr) {
        console.warn("Firestore fetch products error:", fsErr);
      }

      const [sRes, pRes, oRes, cRes, nRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/categories'),
        fetch('/api/notifications')
      ]);

      const apiProds = await pRes.json();
      const apiOrders = await oRes.json();

      // Combine firestore products and api products, avoiding duplicate IDs
      const combinedProdsMap = new Map<string, Product>();
      (Array.isArray(apiProds) ? apiProds : []).forEach(p => combinedProdsMap.set(p.id, p));
      firestoreProducts.forEach(p => combinedProdsMap.set(p.id, p));

      setStats(await sRes.json());
      setProducts(Array.from(combinedProdsMap.values()));
      setCategories(await cRes.json());
      setNotifications(await nRes.json());

      // Merge API orders if state is currently empty
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        setOrders(prev => {
          const map = new Map<string, Order>();
          prev.forEach(o => map.set(o.id || o.orderNumber || o.orderId || '', o));
          apiOrders.forEach((o: Order) => {
            const key = o.id || o.orderNumber || o.orderId || '';
            if (key && !map.has(key)) map.set(key, o);
          });
          return Array.from(map.values()).sort((a, b) => new Date(b.orderTime || b.createdAt || 0).getTime() - new Date(a.orderTime || a.createdAt || 0).getTime());
        });
      }
    } catch (err) {
      console.error('Failed loading admin data:', err);
    }
  };

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();

      // Real-time Firestore users listener
      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const uList: User[] = snap.docs.map(docSnap => {
          const d = docSnap.data();
          const email = (d.email || '').trim();
          const isSuperAdmin = email.toLowerCase() === 'hafejnayem1743@gmail.com';
          const fullName = d.fullName || d.name || (isSuperAdmin ? 'Hafez Nayem' : 'Customer');
          const username = d.username || (email ? email.split('@')[0] : 'user');
          const mobile = d.mobile || '';
          const role = isSuperAdmin ? 'admin' : 'customer';

          let rawCreatedAt = d.createdAt;
          let createdAtIso = new Date().toISOString();
          if (rawCreatedAt) {
            if (typeof rawCreatedAt === 'object' && typeof rawCreatedAt.toDate === 'function') {
              createdAtIso = rawCreatedAt.toDate().toISOString();
            } else if (typeof rawCreatedAt === 'object' && typeof rawCreatedAt.seconds === 'number') {
              createdAtIso = new Date(rawCreatedAt.seconds * 1000).toISOString();
            } else if (typeof rawCreatedAt === 'string') {
              createdAtIso = rawCreatedAt;
            } else if (typeof rawCreatedAt === 'number') {
              createdAtIso = new Date(rawCreatedAt).toISOString();
            }
          }

          return {
            id: d.uid || docSnap.id,
            fullName,
            username,
            email,
            mobile,
            role,
            profilePhoto: d.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
            isBlocked: Boolean(d.isBlocked),
            createdAt: createdAtIso
          };
        });
        setUsers(uList);
      });

      // Real-time Firestore products listener
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        const pList: Product[] = snap.docs.map(docSnap => {
          const d = docSnap.data();
          const mainImg = d.image || (d.images && d.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
          return {
            id: docSnap.id,
            name: d.name || '',
            bnName: d.bnName || d.name || '',
            caption: d.caption || d.shortDescription || d.name || '',
            shortDescription: d.caption || d.shortDescription || d.name || '',
            benefits: d.benefits || d.fullDescription || '',
            fullDescription: d.benefits || d.fullDescription || '',
            price: Number(d.price) || 0,
            discountPrice: d.discountPrice ? Number(d.discountPrice) : undefined,
            category: normalizeCategory(d.category),
            stock: d.stock ? Number(d.stock) : 0,
            unit: d.unit || 'Kg',
            image: mainImg,
            images: d.images && d.images.length > 0 ? d.images : [mainImg],
            rating: d.rating || 5,
            reviewCount: d.reviewCount || 10,
            status: d.status || 'active',
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || d.createdAt || new Date().toISOString()
          } as Product;
        });
        setProducts(pList);
      });

      // Real-time Firestore orders listener
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        const oList: Order[] = snap.docs.map(docSnap => {
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
            productId: d.productId || '',
            productName: d.productName || '',
            productImage: d.productImage || '',
            quantity: Number(d.quantity) || 0,
            unitPrice: Number(d.unitPrice) || 0,
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
        }).sort((a, b) => new Date(b.orderTime || b.createdAt || 0).getTime() - new Date(a.orderTime || a.createdAt || 0).getTime());

        setOrders(oList);
      }, (err) => {
        console.warn("AdminPanel orders onSnapshot warning:", err);
      });

      return () => {
        unsubUsers();
        unsubProducts();
        unsubOrders();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl text-center max-w-sm shadow-2xl border border-red-100 space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
            🔒
          </div>
          <h3 className="text-lg font-black text-gray-900">অ্যাক্সেস অস্বীকৃত (Access Denied)</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            শুধুমাত্র অনুমোদিত এডমিন অ্যাকাউন্ট (<strong>hafejnayem1743@gmail.com</strong> / <strong>Jsenterprisesohel@gmail.com</strong>) এডমিন প্যানেল ব্যবহার করতে পারবেন।
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    );
  }

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can save or edit products.");
      return;
    }
    setIsSavingProduct(true);
    try {
      const captionText = pCaption.trim() || pShortDesc.trim() || pName;
      const benefitsText = pBenefits.trim() || pShortDesc.trim();

      let mainImage = pImages[0] || '';
      if (mainImage.startsWith('data:')) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(mainImage);
          if (cloudinaryUrl) {
            mainImage = cloudinaryUrl;
          }
        } catch (cErr) {
          console.warn("Cloudinary upload issue:", cErr);
        }
      }

      if (!mainImage || mainImage.trim().length === 0) {
        mainImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
      }

      const now = new Date().toISOString();
      const productId = editingProduct?.id || ('prod-' + Date.now());

      const productPayload = {
        id: productId,
        image: mainImage,
        name: pName.trim(),
        price: Number(pPrice),
        caption: captionText,
        benefits: benefitsText,
        category: normalizeCategory(pCategory),
        stock: Number(pStock),
        createdAt: editingProduct?.createdAt || now,
        updatedAt: now,
        bnName: pBnName.trim() || pName.trim(),
        discountPrice: pDiscountPrice > 0 ? Number(pDiscountPrice) : undefined,
        unit: pUnit || 'Kg',
        images: [mainImage],
        status: 'active'
      };

      // Direct write to Firestore products collection
      await setDoc(doc(db, 'products', productId), productPayload, { merge: true });

      // Sync backend API if available
      const reqHeaders = {
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || 'hafejnayem1743@gmail.com'
      };

      await fetch(`/api/products/${productId}`, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: reqHeaders,
        body: JSON.stringify(productPayload)
      }).catch(aErr => console.warn("API sync notice:", aErr));

      setIsAddProductOpen(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (err: any) {
      console.error("Save product error:", err);
      alert(`Error saving product: ${err.message || 'Check Firestore connection'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const resetProductForm = () => {
    setPName('');
    setPBnName('');
    setPCaption('');
    setPShortDesc('');
    setPBenefits('');
    setPPrice(100);
    setPDiscountPrice(0);
    setPCategory(categories.length > 0 ? categories[0].name : 'General');
    setPStock(50);
    setPUnit('Kg');
    setPImages(['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800']);
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPBnName(prod.bnName || '');
    setPCaption(prod.caption || prod.shortDescription || '');
    setPShortDesc(prod.shortDescription || '');
    setPBenefits(prod.benefits || prod.fullDescription || '');
    setPPrice(prod.price);
    setPDiscountPrice(prod.discountPrice || 0);
    setPCategory(normalizeCategory(prod.category));
    setPStock(prod.stock);
    setPUnit(prod.unit);
    setPImages(prod.images && prod.images.length > 0 ? prod.images : [prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800']);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can delete products.");
      return;
    }
    if (!confirm('Are you sure you want to delete this product?')) return;

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (fsDelErr) {
      console.warn("Firestore product delete warning:", fsDelErr);
    }

    // Delete from API endpoint
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-email': currentUser?.email || 'hafejnayem1743@gmail.com'
      }
    });
    loadAdminData();
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId || o.orderId === orderId || o.orderNumber === orderId);
    const realDocId = targetOrder?.id || orderId;
    const now = new Date().toISOString();
    const adminUser = currentUser?.email || 'hafejnayem1743@gmail.com';

    // 1. Update Firestore document
    try {
      const orderRef = doc(db, 'orders', realDocId);
      const existingTimeline = targetOrder?.timeline || [];
      const updatedTimeline = [
        ...existingTimeline,
        { 
          status, 
          timestamp: now, 
          note: `Status updated to ${status} by Admin`,
          updatedBy: adminUser
        }
      ];

      const updateData: any = {
        status,
        orderStatus: status,
        timeline: updatedTimeline,
        updatedAt: now,
        statusUpdatedBy: adminUser
      };

      if (status === 'Delivered') {
        updateData.deliveryCompletedAt = now;
      }

      await updateDoc(orderRef, updateData);
    } catch (fsErr) {
      console.warn("Firestore order status update error:", fsErr);
    }

    // 2. Notify Customer via Firestore notifications
    if (targetOrder) {
      try {
        const custUid = targetOrder.customerUid || targetOrder.userId || 'guest';
        let notifMsg = `Your order #${targetOrder.orderNumber || targetOrder.orderId} status has been updated to ${status}.`;
        if (status === 'Confirmed') notifMsg = `✅ Your order #${targetOrder.orderNumber || targetOrder.orderId} has been confirmed.`;
        if (status === 'Processing') notifMsg = `📦 Your order #${targetOrder.orderNumber || targetOrder.orderId} is now being processed.`;
        if (status === 'Shipped') notifMsg = `🚚 Your order #${targetOrder.orderNumber || targetOrder.orderId} has been shipped.`;
        if (status === 'Delivered') notifMsg = `🎉 Your order #${targetOrder.orderNumber || targetOrder.orderId} has been delivered successfully.`;
        if (status === 'Cancelled') notifMsg = `❌ Your order #${targetOrder.orderNumber || targetOrder.orderId} has been cancelled.`;

        await addDoc(collection(db, 'notifications'), {
          type: 'order',
          userId: custUid,
          title: `Order ${status} • #${targetOrder.orderNumber || targetOrder.orderId}`,
          message: notifMsg,
          read: false,
          isRead: false,
          createdAt: now,
          link: `/profile/orders`
        });
      } catch (notifErr) {
        console.warn("Notification error:", notifErr);
      }
    }

    // 3. Update API server endpoint
    try {
      await fetch(`/api/orders/${realDocId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: `Status set by ${currentUser.fullName || adminUser}` })
      });
    } catch (apiErr) {
      console.warn("API status sync warning:", apiErr);
    }

    if (selectedOrder?.id === realDocId || selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status, orderStatus: status } : null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: 'Unpaid' | 'Waiting Verification' | 'Verified' | 'Paid' | 'Refunded') => {
    try {
      const targetOrder = orders.find(o => o.id === orderId || o.orderId === orderId || o.orderNumber === orderId);
      const realDocId = targetOrder?.id || orderId;
      const orderRef = doc(db, 'orders', realDocId);
      await updateDoc(orderRef, { paymentStatus });
      if (selectedOrder?.id === realDocId || selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus } : null);
      }

      if (targetOrder) {
        const custUid = targetOrder.customerUid || targetOrder.userId || 'guest';
        if (custUid !== 'guest') {
          let pTitle = `Payment Status: ${paymentStatus}`;
          let pMsg = `The payment status for your order #${targetOrder.orderNumber || targetOrder.orderId} was updated to ${paymentStatus}.`;
          if (paymentStatus === 'Verified' || paymentStatus === 'Paid') {
            pTitle = '💳 Payment Verified!';
            pMsg = `Your payment for order #${targetOrder.orderNumber || targetOrder.orderId} has been verified.`;
          } else if (paymentStatus === 'Refunded') {
            pTitle = '↩️ Payment Refunded';
            pMsg = `Payment for order #${targetOrder.orderNumber || targetOrder.orderId} has been refunded.`;
          }

          await addDoc(collection(db, 'notifications'), {
            type: 'order',
            userId: custUid,
            title: pTitle,
            message: pMsg,
            read: false,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/profile/orders'
          });
        }
      }
    } catch (pErr) {
      console.warn("Payment status update error:", pErr);
    }
  };

  const handleDeleteOrderConfirm = async (orderId: string) => {
    if (!isAdmin) {
      alert("Access Denied: Admin privileges required to delete orders.");
      return;
    }
    try {
      const targetOrder = orders.find(o => o.id === orderId || o.orderId === orderId || o.orderNumber === orderId);
      const realDocId = targetOrder?.id || orderId;

      await deleteDoc(doc(db, 'orders', realDocId));
      await fetch(`/api/orders/${realDocId}`, { method: 'DELETE' }).catch(() => {});
      if (selectedOrder?.id === realDocId || selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
    } catch (err: any) {
      console.error("Error deleting order from Firestore:", err);
      alert(`Failed to delete order: ${err.message || 'Check connection'}`);
    }
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can manage categories.");
      return;
    }
    if (!newCatName) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, description: newCatDesc })
    });
    setNewCatName('');
    setNewCatDesc('');
    loadAdminData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can manage categories.");
      return;
    }
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    loadAdminData();
  };

  // User Actions
  const handleToggleUserBlock = async (user: User) => {
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can block/unblock users.");
      return;
    }
    await fetch(`/api/users/${user.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !user.isBlocked })
    });
    loadAdminData();
  };

  const handleChangeUserRole = async (userId: string, role: UserRole) => {
    if (!isSuperAdmin) {
      alert("Access Denied: Only Super Admin (hafejnayem1743@gmail.com) can change user roles.");
      return;
    }
    await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    loadAdminData();
  };

  // Filtered lists
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.receiverName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.mobile.includes(orderSearch);
    if (orderStatusFilter === 'All') return matchesSearch;
    return matchesSearch && o.status === orderStatusFilter;
  });

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.mobile.includes(userSearch)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden relative my-auto border border-gray-100 max-h-[95vh] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Organik Food BD • Admin Portal</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  ADMINISTRATOR
                </span>
              </div>
              <p className="text-xs text-emerald-300 mt-0.5">
                Logged in as: <strong className="text-amber-300">{currentUser.fullName}</strong> ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Nav Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 space-x-2 sm:space-x-4 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => switchTab('overview')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => switchTab('orders')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => switchTab('notifications')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'notifications' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Real-time Alerts</span>
          </button>

          {/* Super Admin Restricted Tabs */}
          {isSuperAdmin && (
            <>
              <button
                onClick={() => switchTab('products')}
                className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'products' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products ({products.length})</span>
              </button>

              <button
                onClick={() => switchTab('categories')}
                className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'categories' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => switchTab('users')}
                className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'users' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Registered Users ({users.length})</span>
              </button>

              <button
                onClick={() => switchTab('banners')}
                className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'banners' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Banner Manager ({banners.length})</span>
              </button>

              <button
                onClick={() => switchTab('roles')}
                className={`pb-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'roles' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Admin Roles</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB: BANNER MANAGER */}
          {activeTab === 'banners' && (
            <BannerManager banners={banners} onRefreshBanners={loadBanners} />
          )}
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <AdminAnalyticsDashboard
              orders={orders}
              products={products}
              users={users}
              categories={categories}
              onNavigateTab={(tab) => switchTab(tab as any)}
              onOpenAddProduct={() => {
                if (!isSuperAdmin) {
                  return;
                }
                setEditingProduct(null);
                resetProductForm();
                setIsAddProductOpen(true);
              }}
            />
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <OrderManager
              orders={orders}
              users={users}
              currentUser={currentUser}
              onPrintInvoice={onPrintInvoice}
              setViewImageModalUrl={setViewImageModalUrl}
              isSuperAdmin={isSuperAdmin}
            />
          )}

          {/* TAB 3: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search product name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    resetProductForm();
                    setIsAddProductOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Organic Product</span>
                </button>
              </div>

              {/* Add/Edit Product Modal */}
              {isAddProductOpen && (
                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <h4 className="font-extrabold text-sm text-emerald-950">
                      {editingProduct ? 'Edit Organic Product' : 'Add New Organic Product'}
                    </h4>
                    <button onClick={() => setIsAddProductOpen(false)} className="text-gray-500 hover:text-gray-800 text-xs font-bold">Cancel</button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pure Sundarban Honey"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Bengali Name (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. খাঁটি মধু"
                        value={pBnName}
                        onChange={(e) => setPBnName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Category *</label>
                      <select
                        required
                        value={normalizeCategory(pCategory)}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="Food Supplement">Food Supplement</option>
                        <option value="Consumer Goods">Consumer Goods</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Regular Price (৳) *</label>
                      <input
                        type="number"
                        required
                        value={pPrice}
                        onChange={(e) => setPPrice(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Discount Price (৳)</label>
                      <input
                        type="number"
                        value={pDiscountPrice}
                        onChange={(e) => setPDiscountPrice(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Stock Units *</label>
                      <input
                        type="number"
                        required
                        value={pStock}
                        onChange={(e) => setPStock(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Unit Type *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1 Kg, 500g Jar, 1 Dozen"
                        value={pUnit}
                        onChange={(e) => setPUnit(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-gray-200">
                      <label className="font-bold text-gray-700 block mb-1">Product Image (Upload File or Enter URL) *</label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {pImages[0] && (
                          <img 
                            src={pImages[0]} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0" 
                          />
                        )}
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                          />
                          <input
                            type="url"
                            required
                            placeholder="Or enter Image URL (https://...)"
                            value={pImages[0] || ''}
                            onChange={(e) => setPImages([e.target.value])}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-bold text-gray-700 block mb-1">Product Caption *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100% Pure & Fresh Organic Honey from Sundarbans"
                        value={pCaption}
                        onChange={(e) => {
                          setPCaption(e.target.value);
                          setPShortDesc(e.target.value);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-bold text-gray-700 block mb-1">Product Benefits & Details (Multi-line) *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Enter product benefits and descriptions...&#10;- Boosts immunity&#10;- 100% natural and unpasteurized&#10;- Collected directly from honeycombs"
                        value={pBenefits}
                        onChange={(e) => setPBenefits(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 transition-all"
                      >
                        {isSavingProduct ? 'Uploading to Cloudinary & Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 flex items-center space-x-2.5">
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-emerald-800 font-semibold">{p.bnName}</p>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-gray-700">{normalizeCategory(p.category)}</td>
                        <td className="p-3 font-extrabold text-emerald-700">
                          ৳{p.discountPrice || p.price}
                          {p.discountPrice && <span className="text-[10px] text-gray-400 line-through ml-1">৳{p.price}</span>}
                        </td>
                        <td className="p-3 font-bold">
                          <span className={p.stock <= 10 ? 'text-red-600 font-black' : 'text-gray-800'}>
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-2xl">
              
              <form onSubmit={handleAddCategory} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 text-xs">
                <h4 className="font-extrabold text-sm text-gray-900">Create Unlimited Product Categories</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Organic Spices"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure hand-ground spices"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save Category
                </button>
              </form>

              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden text-xs">
                <div className="p-3 bg-gray-50 font-extrabold text-gray-800 border-b">Active Categories ({categories.length})</div>
                <div className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-3.5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        <p className="text-[11px] text-gray-500">{cat.description || 'Organic Store Category'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: REGISTERED USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  placeholder="Search user name, email or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email & Mobile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          No users found in Firestore collection.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = u.email.toLowerCase() === 'hafejnayem1743@gmail.com';
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80">
                            <td className="p-3 flex items-center space-x-2.5">
                              <img
                                src={u.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'}
                                className="w-9 h-9 rounded-full object-cover border border-pink-100 shrink-0"
                                alt={u.fullName}
                              />
                              <div>
                                <p className="font-bold text-slate-800">{u.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">UID: {u.id.substring(0, 10)}...</p>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-slate-700">
                              @{u.username}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{u.email}</p>
                              <p className="text-[10px] text-slate-500">{u.mobile || 'No Mobile'}</p>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isSuperAdmin ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-pink-50 text-[#FF5C8A] border border-pink-100'
                              }`}>
                                {isSuperAdmin ? 'Admin' : 'Customer'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-medium text-[11px]">
                              {formatReadableDate(u.createdAt)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {isSuperAdmin ? (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                  System Admin
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserBlock(u)}
                                  className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                                    u.isBlocked ? 'bg-emerald-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                                  }`}
                                >
                                  {u.isBlocked ? 'Unblock User' : 'Block Access'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3 max-w-2xl">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-bold text-sm text-gray-900">Real-Time Store Alerts Log</h4>
                <span className="text-xs text-emerald-600 font-semibold">Updates live automatically</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-gray-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN ROLES & AUTHORIZATION */}
          {activeTab === 'roles' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2 shadow-xs">
                <h4 className="font-extrabold text-sm flex items-center space-x-1.5 text-amber-950">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Admin Access Policy & Verification</span>
                </h4>
                <p className="leading-relaxed">
                  The primary administrator account <strong className="text-amber-950 font-mono">hafejnayem1743@gmail.com</strong> is permanently assigned as Super Admin with full access across all controls. The secondary administrator account <strong className="text-amber-950 font-mono">Jsenterprisesohel@gmail.com</strong> is assigned as Limited Admin with restricted access to Overview, Orders, and Real-time Alerts only.
                </p>
              </div>

              <div className="border border-emerald-100 rounded-2xl bg-white overflow-hidden text-xs shadow-xs">
                <div className="p-3.5 bg-emerald-50/60 font-black text-slate-800 border-b border-emerald-100 flex justify-between items-center">
                  <span>Registered User Roles & Access Overview</span>
                  <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-extrabold">Firestore Realtime</span>
                </div>
                <div className="divide-y divide-emerald-50">
                  {users.map((u) => {
                    const uEmail = u.email.toLowerCase();
                    const isSuper = uEmail === 'hafejnayem1743@gmail.com';
                    const isLimited = uEmail === 'jsenterprisesohel@gmail.com';

                    return (
                      <div key={u.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                            <span>{u.fullName}</span>
                            {isSuper && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black">
                                SUPER ADMIN
                              </span>
                            )}
                            {isLimited && (
                              <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-black">
                                LIMITED ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 mt-0.5">@{u.username} • {u.email} {u.mobile ? `(${u.mobile})` : ''} • Joined {formatReadableDate(u.createdAt)}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isSuper ? (
                            <span className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-200 font-extrabold rounded-xl text-xs flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Permanent Super Admin (Full Control)</span>
                            </span>
                          ) : isLimited ? (
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 font-extrabold rounded-xl text-xs flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>Limited Admin (Overview, Orders & Alerts Only)</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-gray-50 text-slate-600 border border-gray-200 font-bold rounded-xl text-xs">
                              Customer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Selected Order Details Modal Overlay */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative my-auto border border-pink-100 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-[#FF5C8A]" />
                      <span>Order #{selectedOrder.orderNumber || selectedOrder.orderId}</span>
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-md font-extrabold border border-slate-200">
                      {selectedOrder.invoiceNumber || `INV-${selectedOrder.orderNumber || selectedOrder.id}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Placed on: {new Date(selectedOrder.orderTime || selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onPrintInvoice(selectedOrder)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                  <button
                    onClick={() => onPrintInvoice(selectedOrder)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delivery Tracker Preview */}
              <DeliveryTracker order={selectedOrder} />

              {/* Customer Information */}
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-2">
                <h4 className="font-extrabold text-xs text-[#FF5C8A] uppercase tracking-wider">Customer & Delivery Info</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer Name</span>
                    <strong className="text-slate-900 font-bold">{selectedOrder.receiverName || selectedOrder.customerName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile Number</span>
                    <strong className="text-slate-900 font-bold">{selectedOrder.mobile || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-semibold text-slate-800">{selectedOrder.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">District & Upazila</span>
                    <span className="font-bold text-slate-800">{selectedOrder.district}, {selectedOrder.upazila}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Full Address</span>
                    <span className="font-bold text-slate-900">{selectedOrder.fullAddress || selectedOrder.address} ({selectedOrder.area || selectedOrder.village})</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Purchased Products</h4>
                <div className="border border-pink-100 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-pink-50/80 text-slate-800 font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-800 flex items-center space-x-2">
                            {item.productImage && (
                              <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded-lg object-cover border border-pink-100" />
                            )}
                            <span>{item.productName}</span>
                          </td>
                          <td className="p-2.5 text-center font-semibold">{item.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600">৳{item.unitPrice}</td>
                          <td className="p-2.5 text-right font-extrabold text-slate-900">৳{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-slate-800">৳{selectedOrder.deliveryCharge}</span>
                </div>
                {Boolean(selectedOrder.paymentCharge) && (
                  <div className="flex justify-between text-[#FF5C8A]">
                    <span>Payment Charge (1%):</span>
                    <span className="font-bold">৳{selectedOrder.paymentCharge}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-[#FF5C8A]">৳{selectedOrder.totalAmount || selectedOrder.grandTotal}</span>
                </div>
              </div>

              {/* Payment Info & Screenshot */}
              {(() => {
                const isOnline = selectedOrder.paymentMethod === 'bKash' || selectedOrder.paymentMethod === 'Nagad' || selectedOrder.paymentMethod === 'Rocket';
                const proofUrl = selectedOrder.paymentScreenshotURL || selectedOrder.paymentProof;

                return (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Payment Details</h4>
                      <div>{renderPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Payment Method</span>
                        <div className="mt-0.5">{renderPaymentMethodBadge(selectedOrder.paymentMethod)}</div>
                      </div>

                      {isOnline && (
                        <>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Transaction ID *</span>
                            <strong className="font-mono text-slate-900 font-extrabold text-xs">{selectedOrder.transactionId || selectedOrder.paymentTxnId || 'N/A'}</strong>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px]">Sender Mobile Number *</span>
                            <strong className="font-mono text-slate-900 font-extrabold text-xs">{selectedOrder.senderMobileNumber || 'N/A'}</strong>
                          </div>
                        </>
                      )}
                    </div>

                    {isOnline && (
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-slate-600 font-bold block mb-1.5 text-xs">Payment Screenshot Proof:</span>
                        {proofUrl ? (
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => setViewImageModalUrl(proofUrl)}
                              className="relative group rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xs cursor-pointer hover:border-emerald-600 transition-all shrink-0"
                            >
                              <img
                                src={proofUrl}
                                alt="Payment Screenshot"
                                className="w-32 h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                                <Eye className="w-5 h-5 mr-1" />
                                Zoom
                              </div>
                            </button>
                            <div className="text-xs text-slate-500 space-y-1">
                              <p className="font-semibold text-slate-700">Customer Proof Uploaded</p>
                              <p className="text-[10px] text-slate-400">Click image to inspect full size</p>
                              <button
                                type="button"
                                onClick={() => setViewImageModalUrl(proofUrl)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Full Screenshot</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No payment screenshot was uploaded for this order.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Status Controls */}
              <div className="p-4 bg-white rounded-2xl border border-pink-200 space-y-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-2 uppercase tracking-wider text-[11px]">
                    Update Order Status:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          selectedOrder.status === st
                            ? 'bg-[#FF5C8A] text-white shadow-xs'
                            : 'bg-pink-50 text-slate-700 hover:bg-pink-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-pink-100">
                  <label className="font-extrabold text-slate-800 block mb-2 uppercase tracking-wider text-[11px]">
                    Update Payment Status:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Unpaid', 'Waiting Verification', 'Verified', 'Paid', 'Refunded'] as const).map((pst) => (
                      <button
                        key={pst}
                        onClick={() => handleUpdatePaymentStatus(selectedOrder.id, pst)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          selectedOrder.paymentStatus === pst
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {pst}
                      </button>
                    ))}
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="pt-3 border-t border-red-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">Delete Record:</span>
                    <button
                      type="button"
                      onClick={() => setOrderToDelete(selectedOrder)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Order</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Delete Order Safety Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative border border-red-100 space-y-4 text-slate-800 text-xs">
              <div className="flex items-center space-x-3 text-red-600 border-b border-red-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Delete Order?</h3>
                  <p className="text-[11px] text-slate-500">Order #{orderToDelete.orderNumber || orderToDelete.orderId}</p>
                </div>
              </div>

              <div className="space-y-2 bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                <p className="font-bold text-slate-800">
                  Are you sure you want to permanently delete order <span className="text-red-700 font-mono">#{orderToDelete.orderNumber || orderToDelete.orderId}</span> placed by <span className="text-slate-900 font-extrabold">{orderToDelete.receiverName || orderToDelete.customerName}</span>?
                </p>
                <p className="text-[11px] text-slate-500">
                  This will permanently remove the order record from Firestore. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOrderConfirm(orderToDelete.id)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Size Image Lightbox Modal */}
        {viewImageModalUrl && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-3xl p-5 overflow-hidden flex flex-col items-center">
              <div className="w-full flex justify-between items-center pb-3 border-b border-slate-800 text-white">
                <span className="font-extrabold text-sm flex items-center space-x-2">
                  <span>📷 Payment Screenshot Verification</span>
                </span>
                <button
                  type="button"
                  onClick={() => setViewImageModalUrl(null)}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center overflow-auto w-full">
                <img
                  src={viewImageModalUrl}
                  alt="Payment Screenshot Full Size"
                  className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-700"
                />
              </div>
              <div className="pt-3 flex justify-center space-x-3 w-full border-t border-slate-800">
                <a
                  href={viewImageModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center space-x-1"
                >
                  <span>Open Original Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewImageModalUrl(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
