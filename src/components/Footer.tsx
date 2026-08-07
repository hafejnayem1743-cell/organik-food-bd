import React from 'react';
import { MapPin, Phone, Shield, Award, Truck, Clock } from 'lucide-react';

interface FooterProps {
  onOpenSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupport }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-white pt-12 pb-8 border-t border-pink-200/20 mt-20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF5C8A]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-slate-800 text-center">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center hover:border-[#FF5C8A]/40 transition-colors">
            <Shield className="w-5 h-5 text-[#FF5C8A] mb-1.5" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">100% Organic</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Chemical & Formalin Free</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center hover:border-[#FF5C8A]/40 transition-colors">
            <Truck className="w-5 h-5 text-[#FF5C8A] mb-1.5" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Express Delivery</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Kushtia & All Bangladesh</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center hover:border-[#FF5C8A]/40 transition-colors">
            <Award className="w-5 h-5 text-[#FF5C8A] mb-1.5" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Quality Harvest</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct From Village Farms</p>
          </div>
          <div 
            onClick={onOpenSupport}
            className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center hover:border-[#FF5C8A]/40 transition-colors cursor-pointer group"
          >
            <Clock className="w-5 h-5 text-[#FF5C8A] mb-1.5 group-hover:scale-110 transition-transform" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">24/7 Support</h4>
            <p className="text-[11px] text-[#FF5C8A] mt-0.5 font-bold flex items-center space-x-1">
              <span>🛟 Open Support Center</span>
            </p>
          </div>
        </div>

        {/* Editorial Layout Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info & Authority */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Organik Food BD</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              100% genuine, organic, and chemical-free food products sourced directly from growers in Kushtia and Sundarban regions.
            </p>
            <div className="pt-2 text-[11px] space-y-1 uppercase tracking-wider font-semibold">
              <p className="text-[#FF5C8A]">Manager: Md Sohel Rana</p>
              <p className="text-slate-300">Admin: BD NAYEM BOSS</p>
              <p className="text-slate-400 text-[10px] italic">Mirpur, Kushtia, Bangladesh</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-200 mb-3 uppercase tracking-widest border-b border-pink-500/20 pb-1.5 inline-block">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="/" className="hover:text-[#FF5C8A] transition-colors">Home Store</a></li>
              <li><a href="#products" className="hover:text-[#FF5C8A] transition-colors">Sundarban Honey & Ghee</a></li>
              <li><a href="#products" className="hover:text-[#FF5C8A] transition-colors">Padma Hilsa Fish</a></li>
              <li><a href="#products" className="hover:text-[#FF5C8A] transition-colors">Organic Vegetables</a></li>
              <li><a href="#products" className="hover:text-[#FF5C8A] transition-colors">Pure Mustard Oil</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-200 mb-3 uppercase tracking-widest border-b border-pink-500/20 pb-1.5 inline-block">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#" className="hover:text-[#FF5C8A] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FF5C8A] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#FF5C8A] transition-colors">Return & Refund Policy</a></li>
              <li><a href="#" className="hover:text-[#FF5C8A] transition-colors">Track Your Order</a></li>
              <li>
                <button 
                  type="button" 
                  onClick={onOpenSupport} 
                  className="hover:text-[#FF5C8A] transition-colors cursor-pointer text-left"
                >
                  Contact Support (🛟 VIP Center)
                </button>
              </li>
            </ul>
          </div>

          {/* Location & WhatsApp Contact */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest border-b border-pink-500/20 pb-1.5 inline-block">Store Location</h4>
            <div className="text-xs text-slate-400 space-y-2 font-medium">
              <p className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#FF5C8A] shrink-0 mt-0.5" />
                <span>Mirpur, Kushtia, Bangladesh</span>
              </p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[#FF5C8A] font-extrabold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Number:</span>
                </p>
                <div className="pl-5 space-y-1 text-slate-200 font-mono text-xs mt-1">
                  <p>(01724202210)</p>
                  <p>(01907655994)</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-400 gap-3">
          <p>© 2026 Organik Food BD | All Rights Reserved</p>
          <div className="flex items-center space-x-4">
            <span className="text-[#FF5C8A]">Manager: Md Sohel Rana</span>
            <div className="h-3 w-px bg-slate-700"></div>
            <span>Admin: BD NAYEM BOSS</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
