import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../lib/i18n';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  Mail, 
  MessageCircle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ShareProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen || !product) return null;

  // Build product link URL
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?product=${product.id}` 
    : `https://organikfoodbd.com/?product=${product.id}`;

  const currentPrice = product.discountPrice || product.price;
  const shareText = `🌱 Organik Food BD: ${product.name} - Only ৳${currentPrice}/${product.unit}! Check out this 100% chemical-free product.`;

  // Copy Link Handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 3000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 3000);
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Facebook Share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Telegram Share
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Messenger Share
  const handleMessengerShare = () => {
    const url = `fb-messenger://share/?link=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank') || handleWhatsAppShare();
  };

  // Email Share
  const handleEmailShare = () => {
    const subject = `Check out ${product.name} from Organik Food BD`;
    const body = `${shareText}\n\nView product here: ${productUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Native Web Share API option
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl
        });
      } catch (e) {
        // User cancelled or not supported
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-black animate-in slide-in-from-top-4 duration-300 border border-emerald-500/40">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{t('linkCopied')}</span>
        </div>
      )}

      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Glassmorphism Share Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/60 p-5 sm:p-6 space-y-5 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-300 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">{t('shareTitle')}</h3>
              <p className="text-[11px] text-slate-500">Spread pure & organic goodness</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Card Preview Box */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
          <img
            src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200'}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
              {product.category}
            </span>
            <h4 className="font-extrabold text-slate-900 text-xs truncate">{product.name}</h4>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-black text-emerald-800">৳{currentPrice}</span>
              {product.discountPrice && (
                <span className="text-[10px] text-slate-400 line-through">৳{product.price}</span>
              )}
              <span className="text-[10px] text-slate-500">/ {product.unit}</span>
            </div>
          </div>
        </div>

        {/* Social Share Buttons Grid */}
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Share options:</p>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <span className="text-[10px] font-extrabold text-emerald-950">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform font-black text-lg">
                f
              </div>
              <span className="text-[10px] font-extrabold text-blue-950">Facebook</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegramShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-sky-950">Telegram</span>
            </button>

            {/* Messenger */}
            <button
              onClick={handleMessengerShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-indigo-950">Messenger</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-purple-950">Email</span>
            </button>

          </div>
        </div>

        {/* Copy Product Direct Link Input Row */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Direct Product URL:</p>
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={productUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-700 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-2xs ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : t('copyLink')}</span>
            </button>
          </div>
        </div>

        {/* Native Web Share option button if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Open Native Device Share Sheet</span>
          </button>
        )}

      </div>
    </div>
  );
};
