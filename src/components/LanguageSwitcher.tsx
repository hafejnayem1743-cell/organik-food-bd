import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../lib/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef}>
      {/* Premium Pill / Capsule Button (Compact & Reduced size ~20%) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center space-x-1 min-[360px]:space-x-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white font-extrabold text-[9px] min-[360px]:text-[9.5px] sm:text-[10.5px] transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95 group border border-white/40 backdrop-blur-md shrink-0 select-none"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          boxShadow: isOpen 
            ? '0 0 10px rgba(34, 197, 94, 0.6), 0 2px 6px rgba(0, 0, 0, 0.15)' 
            : '0 2px 5px rgba(22, 163, 74, 0.3)'
        }}
        title="Select Language / ভাষা নির্বাচন"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-1">
          <Globe className="w-3 h-3 text-white group-hover:rotate-12 transition-transform duration-300 shrink-0" />
          <span className="text-white font-black tracking-wide">
            Language
          </span>
        </div>

        {/* Small badge indicating current flag */}
        <span className="ml-0.5 text-[8px] min-[360px]:text-[9px] bg-white/20 px-1 py-0.5 rounded-full font-extrabold text-white leading-none shrink-0">
          {lang === 'bn' ? '🇧🇩' : '🇺🇸'}
        </span>

        <ChevronDown 
          className={`w-3 h-3 text-white/90 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-2xl shadow-2xl border border-emerald-100 p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.2), 0 4px 16px -2px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="px-2.5 py-1 mb-1 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Select Language
            </span>
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold">
              {lang === 'en' ? 'English' : 'বাংলা'}
            </span>
          </div>

          <div className="space-y-1">
            {/* English Option */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectLanguage('en');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base leading-none">🇺🇸</span>
                <span className="font-extrabold text-xs">English</span>
              </div>
              {lang === 'en' && (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
            </button>

            {/* Bangla Option */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectLanguage('bn');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lang === 'bn'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base leading-none">🇧🇩</span>
                <span className="font-extrabold text-xs">বাংলা</span>
              </div>
              {lang === 'bn' && (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
