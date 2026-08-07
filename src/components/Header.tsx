import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  MapPin, 
  LogOut, 
  Heart,
  Sparkles,
  SlidersHorizontal,
  LifeBuoy,
  Globe,
  CheckCheck,
  Download
} from 'lucide-react';
import { User, Notification } from '../types';
import { useLanguage } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { markNotificationReadInFirestore, markAllUserNotificationsReadInFirestore } from '../lib/notifications';

interface HeaderProps {
  currentUser: User | null;
  cartCount: number;
  wishlistCount: number;
  notifications: Notification[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  unreadCount: number;
  onMarkNotificationsRead: () => void;
  onOpenSupport?: () => void;
  onInstallApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  cartCount,
  wishlistCount,
  notifications,
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  unreadCount,
  onMarkNotificationsRead,
  onOpenSupport,
  onInstallApp
}) => {
  const { lang, setLang, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const userEmail = currentUser?.email?.toLowerCase() || '';
  const isAdmin = userEmail === 'hafejnayem1743@gmail.com' || userEmail === 'jsenterprisesohel@gmail.com';

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white shadow-lg transition-all duration-300 w-full overflow-x-hidden">
      
      {/* Top Banner Notice */}
      <div className="bg-red-800/80 text-white text-[10px] sm:text-[11px] py-1 px-2 sm:px-4 font-semibold flex justify-between items-center overflow-x-hidden whitespace-nowrap border-b border-red-500/40 w-full">
        <div className="flex items-center space-x-1.5 sm:space-x-2 mx-auto sm:mx-0 overflow-hidden min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
          <span className="uppercase tracking-wider truncate text-[9.5px] min-[360px]:text-[10.5px] sm:text-xs">
            🌱 100% Organic Chemical-Free Food Delivered Across Kushtia & Bangladesh
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-white/90 text-[11px] uppercase tracking-widest font-medium shrink-0">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-yellow-300" /> 
            <span>Mirpur, Kushtia, Bangladesh</span>
          </span>
        </div>
      </div>

      {/* Main Sticky Header Row */}
      <div className="max-w-7xl mx-auto px-1.5 min-[360px]:px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-2.5 w-full">
        <div className="flex items-center justify-between gap-1 min-[360px]:gap-1.5 sm:gap-3 w-full min-w-0">
          
          {/* Logo & Required Branding Header */}
          <div className="flex items-center space-x-1 min-[360px]:space-x-1.5 sm:space-x-3 shrink min-w-0 overflow-hidden">
            <a href="/" className="group flex items-center space-x-1 min-[360px]:space-x-1.5 sm:space-x-3 min-w-0 overflow-hidden">
              <div className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-lg min-[360px]:text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-all shrink-0">
                🌱
              </div>
              <div className="space-y-0.5 min-w-0 overflow-hidden">
                <h1 id="header-brand-title" className="text-xs min-[360px]:text-sm sm:text-2xl font-black text-white tracking-tight leading-none uppercase drop-shadow-sm truncate">
                  Organik Food BD
                </h1>
                <div className="flex flex-col border-l border-white/40 pl-1 sm:pl-2 mt-0.5 space-y-0.5 min-w-0 overflow-hidden">
                  <span id="header-manager-name" className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-xs font-bold text-red-100 leading-none truncate">
                    Md Sohel Rana <span className="text-[7px] font-normal text-white/80 hidden min-[360px]:inline">(manager)</span>
                  </span>
                  <span id="header-admin-name" className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-xs font-bold text-yellow-200 uppercase leading-none truncate">
                    BD NAYEM BOSS <span className="text-[7px] font-normal text-white/80 hidden min-[360px]:inline">(admin)</span>
                  </span>
                  <p id="header-location" className="text-[9px] font-semibold text-white/90 uppercase tracking-widest italic hidden sm:block truncate">
                    Mirpur, Kushtia
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Header Actions Icons (Aligned Left, compact responsive spacing) */}
          <div className="flex items-center gap-0.5 min-[360px]:gap-1 sm:gap-2 shrink-0">
            
            {/* Language Switcher Capsule Pill & Dropdown */}
            <LanguageSwitcher />

            {/* Support Center Button */}
            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.08] active:scale-95 cursor-pointer shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB, #1D4ED8)',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)'
                }}
                title="Customer Support Center"
              >
                <svg 
                  className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 text-white" 
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
                <span className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[8.5px] font-bold text-white leading-none mt-0.5 tracking-[0.1px]">
                  Support
                </span>
              </button>
            )}

            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                id="header-admin-btn"
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <span>Admin</span>
              </button>
            )}

            {/* Wishlist Button (Purple Heart) */}
            <button
              onClick={onOpenWishlist}
              className="relative p-1 min-[360px]:p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 min-[360px]:w-[18px] min-[360px]:h-[18px] sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'fill-purple-300 text-purple-200' : 'text-white'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[8px] min-[360px]:text-[9px] w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 rounded-full flex items-center justify-center font-extrabold shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications Icon */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (unreadCount > 0) onMarkNotificationsRead();
                }}
                className="relative p-1 min-[360px]:p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 min-[360px]:w-[18px] min-[360px]:h-[18px] sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-slate-900 text-[8px] min-[360px]:text-[9px] font-black w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-72 min-[360px]:w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800 flex items-center space-x-1.5">
                      <Bell className="w-4 h-4 text-red-600" />
                      <span>Notifications</span>
                    </h4>
                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Live Updates</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No recent notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div key={notif.id} className={`p-3 text-xs hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-red-50/50' : ''}`}>
                          <p className="font-bold text-slate-800">{notif.title}</p>
                          <p className="text-slate-600 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-1 min-[360px]:p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-full transition-all cursor-pointer flex items-center space-x-1 shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 min-[360px]:w-[18px] min-[360px]:h-[18px] sm:w-5 sm:h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-yellow-400 text-slate-900 text-[8px] min-[360px]:text-[9px] w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 flex items-center justify-center rounded-full font-black shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white">Cart</span>
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-all shadow-xs shrink-0"
                title={currentUser.fullName}
              >
                {currentUser.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt={currentUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] min-[360px]:text-xs font-black text-white uppercase">
                    {currentUser.fullName.substring(0, 2)}
                  </span>
                )}
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="px-2 py-1 sm:px-3.5 sm:py-1.5 bg-white text-red-600 hover:bg-red-50 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 text-white hover:bg-white/10 rounded-xl cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
              ) : (
                <Menu className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-red-500/40 flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
          <span className="text-[10px] uppercase tracking-widest text-white/80 font-black shrink-0 mr-1 hidden sm:inline">Categories:</span>
          {[
            { label: 'All Products', value: 'All' },
            { label: 'Food Supplement', value: 'Food Supplement' },
            { label: 'Consumer Goods', value: 'Consumer Goods' },
            { label: 'General', value: 'General' }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-white text-red-700 font-extrabold shadow-md scale-102'
                  : 'bg-red-800/60 hover:bg-red-800 text-white border border-red-400/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-slate-800 border-b border-gray-200 px-4 py-3 space-y-2 animate-in slide-in-from-top shadow-xl">
          {onInstallApp && (
            <button
              onClick={() => {
                onInstallApp();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>📱 Install Mobile / Desktop App</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Install</span>
            </button>
          )}

          {onOpenSupport && (
            <button
              onClick={() => {
                onOpenSupport();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-200 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4 text-blue-600" />
                <span>🛟 Customer Support Center</span>
              </div>
              <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase">Open</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                onOpenAdmin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {currentUser ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenProfile();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-gray-800 hover:bg-pink-50 rounded-xl flex items-center justify-between"
              >
                <span>My Profile & Orders</span>
                <span className="text-[10px] text-red-600 font-bold uppercase">View</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs text-center"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </header>
  );
};

