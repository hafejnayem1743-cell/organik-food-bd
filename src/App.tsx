import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { InvoicePrint } from './components/InvoicePrint';
import { SupportCenter } from './components/SupportCenter';
import { BannerSlider } from './components/BannerSlider';
import { AdsterraBanner728x90, AdsterraNativeAd } from './components/AdsterraAds';
import { ShareProductModal } from './components/ShareProductModal';
import { SEO, slugify } from './components/SEO';
import { Product, Category, CartItem, User, Order, Notification, Banner } from './types';
import { useLanguage } from './lib/i18n';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Search, 
  SlidersHorizontal, 
  Award, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Heart,
  LogOut
} from 'lucide-react';

export const normalizeCategory = (cat?: string): string => {
  if (!cat) return 'General';
  const trimmed = cat.trim();
  if (trimmed === 'Food Supplement' || trimmed === 'Category 1') return 'Food Supplement';
  if (trimmed === 'Consumer Goods' || trimmed === 'Category 2' || trimmed === 'Consumer') return 'Consumer Goods';
  if (trimmed === 'General') return 'General';
  return trimmed;
};

export default function App() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-food-supplement', name: 'Food Supplement', slug: 'food-supplement', icon: 'Sparkles', description: 'Food Supplement products' },
    { id: 'cat-consumer-goods', name: 'Consumer Goods', slug: 'consumer-goods', icon: 'Package', description: 'Consumer Goods products' },
    { id: 'cat-general', name: 'General', slug: 'general', icon: 'Leaf', description: 'General products' },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('organik_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('organik_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price-low' | 'price-high'>('latest');

  // Modals & Drawers state
  const { lang, t } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shareProductModalItem, setShareProductModalItem] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [printingInvoiceOrder, setPrintingInvoiceOrder] = useState<Order | null>(null);

  const [deliveryArea, setDeliveryArea] = useState<'kushtia' | 'outside'>('kushtia');

  // PWA Install State & Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  useEffect(() => {
    // Check if global prompt event was already captured in main.tsx
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
    };

    (window as any).onBeforeInstallPromptReady = handler;
    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      (window as any).deferredPrompt = null;
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      localStorage.setItem('pwa_app_installed', 'true');
      sessionStorage.setItem('pwa_popup_dismissed', 'true');
    });

    // Automatically appear 3 seconds after entering website (unless installed or dismissed in current session)
    const isDismissed = sessionStorage.getItem('pwa_popup_dismissed') === 'true';
    const isInstalled = localStorage.getItem('pwa_app_installed') === 'true' || window.matchMedia('(display-mode: standalone)').matches;

    let timer: NodeJS.Timeout | null = null;
    if (!isDismissed && !isInstalled) {
      timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setDeferredPrompt(null);
          setShowInstallBanner(false);
          localStorage.setItem('pwa_app_installed', 'true');
          sessionStorage.setItem('pwa_popup_dismissed', 'true');
        } else {
          setShowInstallBanner(false);
          sessionStorage.setItem('pwa_popup_dismissed', 'true');
        }
      } catch (err) {
        console.warn('Error invoking native install prompt:', err);
        setShowInstallBanner(false);
        sessionStorage.setItem('pwa_popup_dismissed', 'true');
        setShowInstallGuideModal(true);
      }
    } else {
      setShowInstallBanner(false);
      sessionStorage.setItem('pwa_popup_dismissed', 'true');
      setShowInstallGuideModal(true);
    }
  };

  // Initial Data Fetching
  const fetchProductsAndData = async () => {
    try {
      const [pRes, cRes, nRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/notifications')
      ]);

      if (pRes.ok) {
        const fetchedProds = await pRes.json();
        setProducts(prev => prev.length > 0 ? prev : fetchedProds);
      }
      if (cRes.ok) {
        const fetchedCats: Category[] = await cRes.json();
        setCategories(fetchedCats.length > 0 ? fetchedCats : [
          { id: 'cat-food-supplement', name: 'Food Supplement', slug: 'food-supplement', icon: 'Sparkles', description: 'Food Supplement products' },
          { id: 'cat-consumer-goods', name: 'Consumer Goods', slug: 'consumer-goods', icon: 'Package', description: 'Consumer Goods products' },
          { id: 'cat-general', name: 'General', slug: 'general', icon: 'Leaf', description: 'General products' },
        ]);
      }
      if (nRes.ok) setNotifications(await nRes.json());
    } catch (err) {
      console.error('Failed fetching data:', err);
    }
  };

  useEffect(() => {
    fetchProductsAndData();

    // 1. Firebase Auth listener (keeps user logged in across refresh)
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          const uEmail = (fbUser.email || '').toLowerCase();
          const isUserAdmin = uEmail === 'hafejnayem1743@gmail.com' || uEmail === 'jsenterprisesohel@gmail.com';
          let userData: User;

          if (userSnap.exists()) {
            const d = userSnap.data();
            userData = {
              id: fbUser.uid,
              fullName: d.fullName || fbUser.displayName || 'User',
              username: d.username || 'user',
              email: fbUser.email || '',
              mobile: d.mobile || '',
              role: isUserAdmin ? 'admin' : (d.role || 'customer'),
              profilePhoto: d.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
              createdAt: d.createdAt || new Date().toISOString()
            };
          } else {
            userData = {
              id: fbUser.uid,
              fullName: fbUser.displayName || 'User',
              username: fbUser.email ? fbUser.email.split('@')[0] : 'user',
              email: fbUser.email || '',
              mobile: '',
              role: isUserAdmin ? 'admin' : 'customer',
              profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, {
              uid: fbUser.uid,
              fullName: userData.fullName,
              username: userData.username,
              email: userData.email,
              mobile: '',
              role: userData.role,
              profilePhoto: userData.profilePhoto,
              createdAt: userData.createdAt
            });
          }
          setCurrentUser(userData);
          localStorage.setItem('organik_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Auth state user doc error:", err);
        }
      } else {
        const savedUser = localStorage.getItem('organik_user');
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });

    // 2. Real-time Firestore products listener with auto-seeding
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default products to Firestore if collection is empty
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const initialProds: Product[] = await res.json();
            for (const p of initialProds) {
              const mainImg = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
              const pDoc = {
                image: mainImg,
                name: p.name,
                bnName: p.bnName || p.name,
                price: Number(p.price),
                discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
                caption: p.caption || p.shortDescription || p.name,
                shortDescription: p.shortDescription || p.caption || p.name,
                benefits: p.benefits || p.fullDescription || p.shortDescription || p.name,
                fullDescription: p.fullDescription || p.benefits || p.shortDescription || p.name,
                category: p.category || 'General',
                stock: Number(p.stock) || 50,
                unit: p.unit || 'Kg',
                images: p.images || [mainImg],
                rating: p.rating || 5,
                reviewCount: p.reviewCount || 10,
                status: p.status || 'active',
                createdAt: p.createdAt || new Date().toISOString()
              };
              await setDoc(doc(db, 'products', p.id), pDoc, { merge: true });
            }
          }
        } catch (seedErr) {
          console.warn("Firestore product seeding warning:", seedErr);
        }
      } else {
        const fsProducts: Product[] = snapshot.docs.map(docSnap => {
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
            category: d.category || 'General',
            stock: d.stock ? Number(d.stock) : 50,
            unit: d.unit || 'Kg',
            image: mainImg,
            images: d.images && d.images.length > 0 ? d.images : [mainImg],
            rating: d.rating || 5,
            reviewCount: d.reviewCount || 10,
            status: d.status || 'active',
            createdAt: d.createdAt || new Date().toISOString()
          } as Product;
        });
        setProducts(fsProducts);
      }
    }, (error) => {
      console.warn("Firestore products snapshot warning:", error);
    });

    // 3. Realtime Firestore notifications listener
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      const notifList: Notification[] = snap.docs
        .map(docSnap => {
          const d = docSnap.data();
          const isR = Boolean(d.read || d.isRead);
          return {
            id: docSnap.id,
            userId: d.userId || 'admin',
            title: d.title || 'Notification',
            message: d.message || '',
            read: isR,
            isRead: isR,
            createdAt: d.createdAt || new Date().toISOString(),
            type: d.type || 'order',
            link: d.link || ''
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(notifList);
    });

    // 4. Realtime Firestore banners listener
    const unsubscribeBanners = onSnapshot(collection(db, 'banners'), (snap) => {
      const bannerList: Banner[] = snap.docs.map(docSnap => {
        const d = docSnap.data();
        const imgUrl = d.image || d.imageUrl || d.img || d.bannerImage || d.url || d.cloudinaryUrl || '';
        return {
          id: docSnap.id,
          image: imgUrl,
          title: d.title || '',
          subtitle: d.subtitle || d.description || '',
          badge: d.badge || d.tag || '',
          buttonText: d.buttonText || d.btnText || 'Shop Now',
          buttonLink: d.buttonLink || d.btnLink || '#products',
          displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : (typeof d.order === 'number' ? d.order : 1),
          enabled: d.enabled !== false && d.status !== 'disabled' && d.status !== 'inactive' && d.active !== false,
          startDate: d.startDate?.toDate ? d.startDate.toDate().toISOString() : d.startDate || undefined,
          endDate: d.endDate?.toDate ? d.endDate.toDate().toISOString() : d.endDate || undefined,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || undefined
        };
      });
      setBanners(bannerList);
    }, (error) => {
      console.warn("Firestore banners snapshot warning:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeNotifications();
      unsubscribeBanners();
    };
  }, []);

  // Sync URL routing for SEO-friendly URLs & browser Back/Forward navigation
  useEffect(() => {
    if (products.length === 0) return;

    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // 1. Initial URL routing on page load
    if (pathname.startsWith('/products/') || pathname.startsWith('/product/')) {
      const slug = pathname.replace(/^\/products?\//, '').split('?')[0];
      const matched = products.find(p => slugify(p.name) === slug || p.id === slug);
      if (matched) setSelectedProduct(matched);
    } else if (pathname === '/support') {
      setIsSupportOpen(true);
    } else if (searchParams.get('category')) {
      const cat = searchParams.get('category');
      if (cat) setSelectedCategory(cat);
    }

    // 2. Handle browser Back/Forward navigation (popstate)
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/products/') || currentPath.startsWith('/product/')) {
        const slug = currentPath.replace(/^\/products?\//, '').split('?')[0];
        const matched = products.find(p => slugify(p.name) === slug || p.id === slug);
        setSelectedProduct(matched || null);
        setIsSupportOpen(false);
      } else if (currentPath === '/support') {
        setIsSupportOpen(true);
        setSelectedProduct(null);
      } else {
        setSelectedProduct(null);
        setIsSupportOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Update browser URL state whenever view/product changes
  useEffect(() => {
    let targetUrl = '/';
    if (selectedProduct) {
      targetUrl = `/products/${slugify(selectedProduct.name)}`;
    } else if (isSupportOpen) {
      targetUrl = '/support';
    } else if (selectedCategory !== 'All' && selectedCategory !== 'Wishlist') {
      targetUrl = `/products?category=${encodeURIComponent(selectedCategory)}`;
    }

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({ url: targetUrl }, '', targetUrl);
    }
  }, [selectedProduct, isSupportOpen, selectedCategory]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('organik_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("Firebase logout error:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('organik_user');
    setIsProfileOpen(false);
    setIsAdminOpen(false);
  };

  // Cart Functions
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCart([{ product, quantity }]);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    fetchProductsAndData();
  };

  const handleMarkNotificationsRead = async () => {
    try {
      // 1. Update unread notifications directly in Firestore
      const unreadList = notifications.filter(n => !n.read && !n.isRead);
      for (const notif of unreadList) {
        if (notif.id) {
          try {
            await updateDoc(doc(db, 'notifications', notif.id), {
              read: true,
              isRead: true
            });
          } catch (err) {
            console.warn("Error updating notification status in Firestore:", err);
          }
        }
      }
      // 2. Sync backend API
      await fetch('/api/notifications/read', { method: 'PUT' }).catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch (e) {
      console.error("Mark notifications read error:", e);
    }
  };

  // Filtering Products
  const filteredProducts = products.filter(p => {
    // Search query filter
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bnName && p.bnName.includes(searchQuery)) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter or Wishlist filter
    let matchesCategory = true;
    if (selectedCategory === 'Wishlist') {
      matchesCategory = wishlistIds.includes(p.id);
    } else if (selectedCategory !== 'All') {
      const normCat = normalizeCategory(p.category);
      matchesCategory = normCat === selectedCategory;
    }

    // Price filter
    const currentPrice = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
    let matchesPrice = true;
    if (priceFilter === 'under-200') matchesPrice = currentPrice < 200;
    else if (priceFilter === '200-500') matchesPrice = currentPrice >= 200 && currentPrice <= 500;
    else if (priceFilter === '500-1000') matchesPrice = currentPrice > 500 && currentPrice <= 1000;
    else if (priceFilter === 'above-1000') matchesPrice = currentPrice > 1000;

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
    const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;

    if (sortBy === 'popular') return b.rating - a.rating;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // latest
  });

  const categoryNames = categories.map(c => c.name);
  const userEmail = currentUser?.email?.toLowerCase() || '';
  const isAdmin = userEmail === 'hafejnayem1743@gmail.com' || userEmail === 'jsenterprisesohel@gmail.com';
  const userNotifications = notifications.filter(n => {
    if (isAdmin) return n.userId === 'admin' || n.userId === 'all' || n.userId === currentUser?.id;
    if (currentUser) return n.userId === currentUser.id || n.userId === 'all';
    return n.userId === 'all';
  });
  const unreadNotificationsCount = userNotifications.filter(n => !n.read && !n.isRead).length;
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col font-sans antialiased text-slate-800 relative overflow-hidden">
      
      {/* Dynamic SEO Meta Tags, Canonical Links, Open Graph, Twitter & Structured Data (JSON-LD) */}
      <SEO
        product={selectedProduct}
        pageType={
          selectedProduct
            ? 'product_details'
            : isSupportOpen
            ? 'support'
            : selectedCategory !== 'All'
            ? 'products'
            : 'home'
        }
        categoryName={selectedCategory !== 'All' ? selectedCategory : undefined}
      />

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        cartCount={cartTotalCount}
        wishlistCount={wishlistIds.length}
        notifications={userNotifications}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setSelectedCategory(selectedCategory === 'Wishlist' ? 'All' : 'Wishlist')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onLogout={() => setShowLogoutConfirm(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categoryNames}
        unreadCount={unreadNotificationsCount}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenSupport={() => setIsSupportOpen(true)}
        onInstallApp={handleInstallApp}
      />

      {/* Floating PWA Install Prompt Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-50 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/40 animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {/* Far left: Close (✕) button */}
            <button
              onClick={() => {
                setShowInstallBanner(false);
                sessionStorage.setItem('pwa_popup_dismissed', 'true');
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm shrink-0 cursor-pointer transition-colors"
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Left side: App Logo */}
            <img src="/icons/icon-192x192.png" alt="Organik Food BD Logo" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs shrink-0 object-cover border border-emerald-500/20" />

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase truncate">
                DOWNLOAD APP
              </h4>
              <p className="text-[10px] sm:text-xs text-emerald-300 font-medium line-clamp-1 leading-tight">
                Install ORGANIK FOOD BD for a faster and better experience.
              </p>
            </div>
          </div>

          {/* Right side: Green INSTALL button */}
          <button
            onClick={handleInstallApp}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wide rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            INSTALL
          </button>
        </div>
      )}

      {/* Professional Install Guide Modal (When native install prompt is unavailable) */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-emerald-100 space-y-4 text-slate-800 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <img src="/icons/icon-192x192.png" alt="Organik Food BD" className="w-12 h-12 rounded-2xl shadow-sm border border-emerald-200 object-cover shrink-0" />
              <div>
                <h3 className="text-base font-black text-gray-900">Install Organik Food BD</h3>
                <p className="text-xs text-emerald-600 font-bold">Fast & Easy Access</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-gray-600">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 space-y-1">
                <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  📱 iPhone / iPad (Safari)
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Tap the Share button <span className="font-bold">📤</span> at the bottom, then select <span className="font-bold">"Add to Home Screen" ➕</span>.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  🤖 Android / Chrome
                </p>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  Tap browser menu <span className="font-bold">⋮</span> top-right and select <span className="font-bold">"Install App"</span> or <span className="font-bold">"Add to Home Screen"</span>.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  💻 Desktop (Chrome / Edge)
                </p>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  Click the Install icon <span className="font-bold">📥</span> in the browser address bar.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuideModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 relative z-10">
        
        {/* Auto-sliding Premium Promo Banner System */}
        <BannerSlider banners={banners} />

        {/* Top 728x90 Adsterra Banner Ad (Directly below Homepage Banner Slider) */}
        <AdsterraBanner728x90 />

        {/* Smart Filters Bar */}
        <section className="bg-white p-4 rounded-2xl border border-blue-100/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:bg-white text-slate-800 font-medium outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-2.5" />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              
              {/* Category Filter Dropdown */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider">{t('allCategories')}:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 font-bold text-slate-800 text-xs outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs transition-all"
                >
                  <option value="All">{t('allCategories')}</option>
                  <option value="Food Supplement">Food Supplement</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Price Filter Dropdown */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider">{t('filterPrice')}:</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 font-bold text-slate-800 text-xs outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs transition-all"
                >
                  <option value="all">All Prices</option>
                  <option value="under-200">Under ৳200</option>
                  <option value="200-500">৳200 - ৳500</option>
                  <option value="500-1000">৳500 - ৳1,000</option>
                  <option value="above-1000">Above ৳1,000</option>
                </select>
              </div>

            </div>

          </div>
        </section>

        {/* Product Cards Grid */}
        <section id="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>🌱</span>
              <span>{selectedCategory === 'All' ? t('allCategories') : selectedCategory}</span>
            </h2>
            <span className="text-xs font-black text-white bg-red-600 px-3 py-1 rounded-full uppercase shadow-xs">
              {filteredProducts.length} Products
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-3xl border border-pink-200 space-y-3 shadow-xs">
              <div className="w-14 h-14 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                📦
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">No products available in this category.</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Currently no items are listed under this category.
              </p>
            </div>
          ) : (
            /* Strict Grid: 2 cols on mobile, 3 on tablet (sm), 4 on lg, 5 on xl */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
              {filteredProducts.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                    onToggleWishlist={handleToggleWishlist}
                    onShareProduct={(p) => setShareProductModalItem(p)}
                  />
                  {/* Insert Adsterra Native Ad after every 6 products */}
                  {(index + 1) % 6 === 0 && (
                    <div className="col-span-full">
                      <AdsterraNativeAd />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer 728x90 Adsterra Banner Ad (Immediately above website footer) */}
      <AdsterraBanner728x90 />

      {/* Footer */}
      <Footer onOpenSupport={() => setIsSupportOpen(true)} />

      {/* Floating Support Button (Bottom Right) */}
      <button
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-[60px] h-[60px] sm:w-[64px] sm:h-[64px] rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.08] active:scale-95 cursor-pointer shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-500/60 group"
        style={{
          background: 'linear-gradient(135deg, #3B82F6, #2563EB, #1D4ED8)',
          border: '2px solid rgba(255, 255, 255, 0.35)'
        }}
        title="Customer Support Center"
      >
        <svg 
          className="w-6 h-6 text-white group-hover:rotate-6 transition-transform duration-300" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 11a9 9 0 0 1 18 0" />
          <path d="M2 11a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" fill="currentColor" fillOpacity="0.25" />
          <path d="M17 11a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4z" fill="currentColor" fillOpacity="0.25" />
          <path d="M19 15v1a3 3 0 0 1-3 3h-3" />
          <circle cx="11" cy="19" r="1.5" fill="currentColor" />
        </svg>
        <span className="text-[10px] sm:text-[11px] font-bold text-white leading-none mt-0.5 tracking-[0.5px]">
          Support
        </span>
      </button>

      {/* Support Center Full Page Overlay */}
      <SupportCenter
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-pink-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] mx-auto flex items-center justify-center text-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Confirm Logout</h3>
              <p className="text-xs text-slate-600 font-medium">Are you sure you want to logout?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-3 bg-gray-200 hover:bg-gray-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 active:scale-95"
              >
                <span>❌ Cancel</span>
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await handleLogout();
                }}
                className="py-2.5 px-3 bg-[#DC2626] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1 active:scale-95"
              >
                <span>✅ Confirm Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Slide-overs */}
      <ProductDetailsModal
        product={selectedProduct}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        onShareProduct={(p) => setShareProductModalItem(p)}
      />

      <ShareProductModal
        product={shareProductModalItem}
        isOpen={Boolean(shareProductModalItem)}
        onClose={() => setShareProductModalItem(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        deliveryArea={deliveryArea}
        setDeliveryArea={setDeliveryArea}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        onUpdateCartQuantity={handleUpdateCartQuantity}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <UserProfile
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleAuthSuccess}
          onLogout={() => {
            setIsProfileOpen(false);
            setShowLogoutConfirm(true);
          }}
          onPrintInvoice={(ord) => setPrintingInvoiceOrder(ord)}
        />
      )}

      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          currentUser={currentUser}
          onPrintInvoice={(ord) => setPrintingInvoiceOrder(ord)}
        />
      )}

      <InvoicePrint
        order={printingInvoiceOrder}
        onClose={() => setPrintingInvoiceOrder(null)}
      />

    </div>
  );
}

