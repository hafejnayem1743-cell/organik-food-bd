import { useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export const dictionary = {
  // Common & Header
  appTitle: { en: 'Organik Food BD', bn: 'অর্গানিক ফুড বিডি' },
  topBanner: { en: '🌱 100% Organic Chemical-Free Food Delivered Across Kushtia & Bangladesh', bn: '🌱 ১০০% নির্ভেজাল ও রাসায়নিকমুক্ত অর্গানিক খাদ্য সমগ্র কুষ্টিয়া ও বাংলাদেশে ডেলিভারি' },
  location: { en: 'Mirpur, Kushtia, Bangladesh', bn: 'মিরপুর, কুষ্টিয়া, বাংলাদেশ' },
  searchPlaceholder: { en: 'Search organic products...', bn: 'অর্গানিক পন্য খুঁজুন...' },
  support: { en: 'Support', bn: 'সাপোর্ট' },
  admin: { en: 'Admin', bn: 'এডমিন' },
  wishlist: { en: 'Wishlist', bn: 'উইশলিস্ট' },
  cart: { en: 'Cart', bn: 'কার্ট' },
  login: { en: 'Login / Register', bn: 'লগইন / রেজিস্টার' },
  account: { en: 'Account', bn: 'অ্যাকাউন্ট' },
  notifications: { en: 'Notifications', bn: 'নোটিফিকেশন' },
  logout: { en: 'Logout', bn: 'লগআউট' },
  
  // Hero / Banner
  heroTitle: { en: 'Pure & Pure Natural Organic Food', bn: 'খাঁটি ও প্রাকৃতিক পুষ্টিকর অর্গানিক খাদ্য' },
  heroSubtitle: { en: 'Direct from farmers to your kitchen with guaranteed purity.', bn: 'কৃষকের জমি থেকে সরাসরি আপনার রান্নাঘরে শতভাগ গ্যারান্টিসহ।' },
  shopNow: { en: 'Shop Now', bn: 'এখনই কেনাকাটা করুন' },

  // Filters & Categories
  allCategories: { en: 'All Categories', bn: 'সকল ক্যাটাগরি' },
  sortBy: { en: 'Sort By', bn: 'সাজান' },
  latest: { en: 'Latest Added', bn: 'সর্বশেষ নতুন' },
  popular: { en: 'Most Popular', bn: 'জনপ্রিয়' },
  priceLowHigh: { en: 'Price: Low to High', bn: 'দাম: কম থেকে বেশি' },
  priceHighLow: { en: 'Price: High to Low', bn: 'দাম: বেশি থেকে কম' },
  filterPrice: { en: 'Filter Price', bn: 'দাম ফিল্টার' },
  organicOnly: { en: '100% Pure Organic', bn: '১০০% বিশুদ্ধ অর্গানিক' },

  // Product Card & Details
  addToCart: { en: 'Add to Cart', bn: 'কার্টে যোগ করুন' },
  buyNow: { en: 'Buy Now', bn: 'এখনই কিনুন' },
  outOfStock: { en: 'Out of Stock', bn: 'স্টক শেষ' },
  inStock: { en: 'In Stock', bn: 'স্টকে আছে' },
  viewDetails: { en: 'View Details', bn: 'বিস্তারিত দেখুন' },
  shareProduct: { en: 'Share Product', bn: 'শেয়ার করুন' },
  off: { en: 'OFF', bn: 'ছাড়' },
  reviews: { en: 'Reviews', bn: 'রিভিউ' },
  unit: { en: 'Unit', bn: 'একক' },
  benefits: { en: 'Health Benefits', bn: 'স্বাস্থ্য উপকারিতা' },
  description: { en: 'Product Description', bn: 'পণ্যের বিবরণ' },

  // Cart Drawer
  yourCart: { en: 'Your Shopping Cart', bn: 'আপনার শপিং কার্ট' },
  emptyCart: { en: 'Your cart is empty', bn: 'আপনার কার্ট ফাঁকা রয়েছে' },
  subtotal: { en: 'Subtotal', bn: 'সাবটোটাল' },
  deliveryCharge: { en: 'Delivery Charge', bn: 'ডেলিভারি চার্জ' },
  grandTotal: { en: 'Grand Total', bn: 'সর্বমোট' },
  checkout: { en: 'Proceed to Checkout', bn: 'অর্ডার সম্পূর্ণ করুন' },
  clearCart: { en: 'Clear Cart', bn: 'কার্ট খালি করুন' },
  quantity: { en: 'Quantity', bn: 'পরিমাণ' },

  // Checkout Modal
  orderSummary: { en: 'Order Summary', bn: 'অর্ডারের বিবরণ' },
  customerInfo: { en: 'Customer Information', bn: 'গ্রাহকের তথ্য' },
  fullName: { en: 'Receiver Full Name', bn: 'প্রাপকের পুরো নাম' },
  mobileNumber: { en: 'Mobile Number', bn: 'মোবাইল নম্বর' },
  fullAddress: { en: 'Delivery Full Address', bn: 'সম্পূর্ণ ডেলিভারি ঠিকানা' },
  district: { en: 'District', bn: 'জেলা' },
  upazila: { en: 'Upazila / Area', bn: 'উপজেলা / এলাকা' },
  deliveryLocation: { en: 'Delivery Location', bn: 'ডেলিভারি এলাকা' },
  insideKushtia: { en: 'Inside Kushtia District (৳60)', bn: 'কুষ্টিয়া জেলার ভেতরে (৳৬০)' },
  outsideKushtia: { en: 'Outside Kushtia / Whole Bangladesh (৳120)', bn: 'কুষ্টিয়ার বাইরে / সারা বাংলাদেশ (৳১২০)' },
  paymentMethod: { en: 'Payment Method', bn: 'পেমেন্ট পদ্ধতি' },
  cashOnDelivery: { en: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি' },
  bKash: { en: 'bKash (Send Money / Merchant)', bn: 'বিকাশ (সেন্ড মানি / মার্চেন্ট)' },
  Nagad: { en: 'Nagad (Send Money)', bn: 'নগদ (সেন্ড মানি)' },
  Rocket: { en: 'Rocket (Send Money)', bn: 'রকেট (সেন্ড মানি)' },
  transactionId: { en: 'Transaction ID (TxnID)', bn: 'ট্রানজেকশন আইডি (TxnID)' },
  uploadProof: { en: 'Upload Payment Screenshot', bn: 'পেমেন্ট স্ক্রিনশট আপলোড করুন' },
  placeOrder: { en: 'Confirm Order Now', bn: 'অর্ডার নিশ্চিত করুন' },
  orderSuccessTitle: { en: 'Order Placed Successfully!', bn: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' },
  orderSuccessMsg: { en: 'Thank you for choosing Organik Food BD. We will deliver your items soon.', bn: 'অর্গানিক ফুড বিডি বেছে নেওয়ার জন্য ধন্যবাদ। দ্রুত আপনার পণ্য পৌঁছে দেওয়া হবে।' },

  // User Profile
  myAccount: { en: 'My Account', bn: 'আমার অ্যাকাউন্ট' },
  orderHistory: { en: 'Order History', bn: 'পূর্ববর্তী অর্ডারসমূহ' },
  profileDetails: { en: 'Profile Details', bn: 'প্রোফাইল তথ্য' },
  trackOrder: { en: 'Track Order', bn: 'অর্ডার ট্র্যাকিং' },
  printInvoice: { en: 'Print Invoice', bn: 'ইনভয়েস প্রিন্ট' },
  orderStatus: { en: 'Order Status', bn: 'অর্ডারের অবস্থা' },
  orderTime: { en: 'Order Time', bn: 'অর্ডারের সময়' },
  items: { en: 'Items', bn: 'পণ্যসামগ্রী' },

  // Share Modal
  shareTitle: { en: 'Share Product With Friends', bn: 'বন্ধুদের সাথে পণ্য শেয়ার করুন' },
  copyLink: { en: 'Copy Product Link', bn: 'লিঙ্ক কপি করুন' },
  linkCopied: { en: '✅ Product link copied successfully.', bn: '✅ প্রোডাক্ট লিঙ্ক কপি করা হয়েছে।' },
  shareWhatsapp: { en: 'Share on WhatsApp', bn: 'হোয়াটসঅ্যাপে শেয়ার' },
  shareFacebook: { en: 'Share on Facebook', bn: 'ফেসবুকে শেয়ার' },
  shareTelegram: { en: 'Share on Telegram', bn: 'টেলিগ্রামে শেয়ার' },
  shareMessenger: { en: 'Share on Messenger', bn: 'মেসেঞ্জারে শেয়ার' },
  shareEmail: { en: 'Share via Email', bn: 'ইমেইলে শেয়ার' },

  // Notifications
  notificationsTitle: { en: 'Notifications', bn: 'নোটিফিকেশনসমূহ' },
  markAllRead: { en: 'Mark All as Read', bn: 'সব পড়া হয়েছে হিসেবে চিহ্নিত করুন' },
  noNotifications: { en: 'No notifications yet', bn: 'কোন নোটিফিকেশন নেই' },
  unread: { en: 'Unread', bn: 'অপঠিত' },
  read: { en: 'Read', bn: 'পড়া হয়েছে' },

  // Support
  supportTitle: { en: '24/7 Customer Support', bn: '২৪/৭ কাস্টমার সাপোর্ট' },
  managerName: { en: 'Md Sohel Rana (Manager)', bn: 'মো: সোহেল রানা (ম্যানেজার)' },
  adminName: { en: 'BD NAYEM BOSS (Admin)', bn: 'বিডি নায়েম বস (এডমিন)' },
  liveChat: { en: 'Live WhatsApp Chat', bn: 'লাইভ হোয়াটসঅ্যাপ চ্যাট' }
};

let currentSessionLang: Language = 'en';

export const getLanguage = (): Language => {
  return currentSessionLang;
};

export const setLanguage = (lang: Language) => {
  currentSessionLang = lang;
  try {
    localStorage.removeItem('organik_lang');
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('organik_lang_change'));
};

export const useLanguage = () => {
  const [lang, setLangState] = useState<Language>(getLanguage);

  useEffect(() => {
    const handleLangChange = () => {
      setLangState(getLanguage());
    };

    window.addEventListener('organik_lang_change', handleLangChange);
    return () => {
      window.removeEventListener('organik_lang_change', handleLangChange);
    };
  }, []);

  const changeLang = (newLang: Language) => {
    setLanguage(newLang);
    setLangState(newLang);
  };

  const t = (key: keyof typeof dictionary): string => {
    const entry = dictionary[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return { lang, setLang: changeLang, t };
};
