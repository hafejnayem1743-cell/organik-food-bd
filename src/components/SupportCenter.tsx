import React, { useState } from 'react';
import { AdsterraBanner728x90 } from './AdsterraAds';
import { 
  X, 
  Phone, 
  Copy, 
  Check, 
  LifeBuoy, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Heart
} from 'lucide-react';

interface SupportCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportCenter: React.FC<SupportCenterProps> = ({ isOpen, onClose }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopy = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    showToast(`✅ Link Copied Successfully (${label})`);
  };

  const support1Link = "https://wa.me/8801724202210?text=Hello%20Organik%20Food%20BD";
  const support2Link = "https://wa.me/8801907655994?text=Hello%20Organik%20Food%20BD";
  const telegramLink = "https://t.me/techwithnayem";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl border border-emerald-500/50 flex items-center space-x-2 animate-in slide-in-from-top duration-300">
          <span className="text-sm font-bold text-emerald-400">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between">
        
        {/* HEADER */}
        <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-10 px-4 sm:px-8 shadow-2xl overflow-hidden border-b border-blue-400/20">
          
          {/* Decorative Glow Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <button
                onClick={onClose}
                className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md mb-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Store</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                  🛟
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    <span>Customer Support Center</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
                    Need help? Contact our support team anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Close Icon Button */}
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 shadow-md border border-white/20"
              title="Close Support Center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* BODY CONTENT */}
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-10 flex-1 w-full">
          
          {/* Top 728x90 Adsterra Banner Ad */}
          <AdsterraBanner728x90 />

          {/* PREMIUM NOTICE BOX */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-blue-200/80 rounded-[18px] p-5 sm:p-6 shadow-xl shadow-blue-950/20 text-center space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <span className="text-xl">ℹ️</span>
              <h2 className="text-base sm:text-lg font-black text-blue-700 tracking-wide">
                📢 গুরুত্বপূর্ণ নির্দেশনা
              </h2>
            </div>

            <div className="text-black font-medium text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto space-y-2" style={{ color: '#000000' }}>
              <p>
                যেকোনো ধরনের সমস্যা, অর্ডার সংক্রান্ত তথ্য, পেমেন্ট যাচাই, ডেলিভারি আপডেট অথবা যেকোনো সহায়তার জন্য আমাদের Official WhatsApp Support 1 অথবা Support 2-এ মেসেজ করুন।
              </p>
              <p>
                আপনি চাইলে আমাদের Official Telegram Channel-এ যুক্ত হয়ে সেখান থেকেও সরাসরি যোগাযোগ করতে পারবেন।
              </p>
              <p>
                আমাদের সাপোর্ট টিম যত দ্রুত সম্ভব আপনার সমস্যার সমাধানের চেষ্টা করবে।
              </p>
              <p className="font-bold pt-1 flex items-center justify-center space-x-1">
                <span>Organik Food BD-এর সাথে থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ।</span>
                <span className="text-red-500">❤️</span>
              </p>
            </div>
          </div>

          {/* SECTION 1: WHATSAPP SUPPORT */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-800/40 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                    WhatsApp Customer Support
                  </h2>
                  <p className="text-xs text-slate-400">Direct instant messaging with our official representatives</p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                24/7 Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1 */}
              <div className="group relative bg-slate-800/80 backdrop-blur-xl border border-blue-500/20 hover:border-emerald-500/50 p-6 rounded-[20px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    {/* WhatsApp Large Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Primary Line
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">1st Support</h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">WhatsApp Customer Support</p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3 pt-2">
                  <a
                    href={support1Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 border border-emerald-400/30 cursor-pointer"
                  >
                    <span>Open WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Direct Call Button */}
                  <a
                    href="tel:01724202210"
                    className="w-full py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 border border-slate-600 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Call Now (01724202210)</span>
                  </a>

                  {/* Copy Link Option */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="truncate max-w-[200px] text-[11px] text-slate-400 font-mono">
                      {support1Link}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(support1Link, '1st Support')}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer transition-colors shrink-0 ml-2 border border-emerald-500/30"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CARD 2 */}
              <div className="group relative bg-slate-800/80 backdrop-blur-xl border border-blue-500/20 hover:border-emerald-500/50 p-6 rounded-[20px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    {/* WhatsApp Large Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                      Secondary Line
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">2nd Support</h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">WhatsApp Customer Support</p>
                  </div>
                </div>

                {/* Secondary Action Buttons */}
                <div className="space-y-3 pt-2">
                  <a
                    href={support2Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 border border-emerald-400/30 cursor-pointer"
                  >
                    <span>Open WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Direct Call Button */}
                  <a
                    href="tel:01907655994"
                    className="w-full py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 border border-slate-600 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Call Now (01907655994)</span>
                  </a>

                  {/* Copy Link Option */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="truncate max-w-[200px] text-[11px] text-slate-400 font-mono">
                      {support2Link}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(support2Link, '2nd Support')}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer transition-colors shrink-0 ml-2 border border-emerald-500/30"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* SECTION 2: TELEGRAM COMMUNITY */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-blue-800/40 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
                    Telegram Community
                  </h2>
                  <p className="text-xs text-slate-400">Join our official community channel for instant offers & announcements</p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-extrabold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30 uppercase tracking-widest">
                Official Channel
              </span>
            </div>

            <div className="group bg-slate-800/80 backdrop-blur-xl border border-blue-500/20 hover:border-sky-500/50 p-6 sm:p-8 rounded-[20px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5">
                  {/* Telegram Large Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-900/40 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.128.832.942z"/>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">Telegram Channel</h3>
                    <p className="text-xs text-slate-300 font-medium max-w-md">
                      Join our official Telegram Channel for updates, stock alerts, and exclusive discounts.
                    </p>
                    <div className="pt-2 flex items-center justify-center sm:justify-start space-x-2 text-[11px] text-sky-400 font-mono">
                      <span>{telegramLink}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2.5 sm:space-y-0 sm:space-x-3 w-full md:w-auto shrink-0">
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-900/30 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 border border-sky-400/30 cursor-pointer"
                  >
                    <span>Join Telegram</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(telegramLink, 'Telegram Channel')}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors border border-sky-500/30 shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                </div>

              </div>
            </div>
          </section>

          {/* Bottom 728x90 Adsterra Banner Ad (Below Telegram section) */}
          <AdsterraBanner728x90 />

        </main>

        {/* FOOTER */}
        <footer className="bg-slate-950/80 border-t border-blue-900/40 py-8 px-4 text-center space-y-3 mt-12">
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Need More Help?
            </h4>
            <p className="text-xs text-blue-200 font-medium">
              We usually reply within a few minutes.
            </p>
          </div>
          <p className="text-xs font-bold text-slate-400 flex items-center justify-center space-x-1 pt-2">
            <span>Thank you for choosing</span>
            <span className="text-yellow-400 font-black uppercase">Organik Food BD</span>
            <span>❤️</span>
          </p>
        </footer>

      </div>
    </div>
  );
};
