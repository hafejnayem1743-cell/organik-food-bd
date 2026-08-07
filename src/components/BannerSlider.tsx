import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, ExternalLink } from 'lucide-react';
import { Banner } from '../types';

interface BannerSliderProps {
  banners?: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch Swipe coordinates
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Permanent default banner - MUST ALWAYS be present as the first banner
  const defaultBanner: Banner = {
    id: 'default-banner-permanent',
    image: '',
    title: 'Pure Chemical-Free Organic Food Fresh To Your Doorstep',
    subtitle: 'Healthy • Fresh • Trusted | Supervised directly by Md Sohel Rana & BD N NAYEM BOSS in Mirpur, Kushtia',
    badge: '🌱 100% ORGANIC PRODUCTS',
    buttonText: 'Shop Now',
    buttonLink: '#products',
    displayOrder: 0,
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  // Filter active banners from admin uploads based on enabled status and expiration date
  const now = new Date();

  const activeAdminBanners = (banners || [])
    .filter(b => {
      // 1. Must be enabled
      const isEnabled = b.enabled !== false && (b as any).status !== 'disabled' && (b as any).status !== 'inactive' && (b as any).active !== false;
      if (!isEnabled) return false;

      // 2. Ignore expired banners only (where endDate is in the past)
      if (b.endDate) {
        const end = new Date(b.endDate);
        if (!isNaN(end.getTime()) && now > end) return false;
      }
      return true;
    })
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  // The permanent default banner is ALWAYS first, followed by active admin banners
  const displayBanners = [
    defaultBanner,
    ...activeAdminBanners.filter(b => b.id !== defaultBanner.id && b.title !== defaultBanner.title)
  ];

  // Preload banner images for lag-free smooth transition
  useEffect(() => {
    if (banners === undefined) return;
    displayBanners.forEach(banner => {
      if (banner.image) {
        const img = new Image();
        img.src = banner.image;
      }
    });
  }, [displayBanners, banners]);

  // Skeleton loader if banners prop is strictly loading/undefined
  if (banners === undefined) {
    return (
      <div className="relative w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[380px] rounded-[20px] bg-slate-900 border border-emerald-500/20 overflow-hidden shadow-2xl flex items-center p-6 sm:p-10 animate-pulse">
        <div className="space-y-3.5 max-w-xl w-full z-10">
          <div className="h-6 w-36 bg-slate-800 rounded-full" />
          <div className="h-9 sm:h-12 w-3/4 bg-slate-800 rounded-xl" />
          <div className="h-4 w-1/2 bg-slate-800 rounded-lg" />
          <div className="h-10 w-32 bg-slate-800 rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  // For seamless loop, append a clone of the first slide at the end
  const itemsToRender = [
    ...displayBanners,
    { ...displayBanners[0], id: `${displayBanners[0].id}-clone` }
  ];

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const goToPrev = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => {
      if (prev === 0) {
        return displayBanners.length - 1;
      }
      return prev - 1;
    });
  };

  // Seamless infinite loop handling: when reaching the clone slide at end, snap back to index 0 invisibly
  useEffect(() => {
    if (currentIndex === itemsToRender.length - 1) {
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700);
    }
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [currentIndex, itemsToRender.length]);

  // Re-enable CSS transition shortly after snapping back to index 0
  useEffect(() => {
    if (!isTransitioning && currentIndex === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex]);

  // Make sure index stays valid if banner count changes dynamically
  useEffect(() => {
    if (currentIndex >= itemsToRender.length) {
      setCurrentIndex(0);
      setIsTransitioning(true);
    }
  }, [itemsToRender.length, currentIndex]);

  // Auto slide timer (every 4 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, itemsToRender.length]);

  const handlePrev = () => {
    goToPrev();
  };

  const handleNext = () => {
    goToNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleButtonClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link;
    }
  };

  return (
    <div 
      className="relative w-full rounded-[20px] overflow-hidden shadow-2xl bg-slate-900 group select-none border border-emerald-500/20 min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[380px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div 
        className={`flex w-full h-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[380px] ${
          isTransitioning ? 'transition-transform duration-700 ease-out' : 'transition-none'
        }`}
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          willChange: 'transform'
        }}
      >
        {itemsToRender.map((banner, index) => (
          <div 
            key={`${banner.id}-${index}`}
            className="relative w-full flex-shrink-0 min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[380px] flex items-center"
          >
            {/* Background Image / Banner Render */}
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900" />
            )}

            {/* Premium Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

            {/* Banner Content Container */}
            <div className="relative z-10 p-4 sm:p-8 md:p-12 max-w-2xl space-y-2.5 sm:space-y-4">
              
              {/* Badge */}
              {banner.badge && (
                <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 bg-yellow-400 text-slate-950 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 animate-pulse" />
                  <span>{banner.badge}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-snug sm:leading-tight text-white uppercase drop-shadow-md">
                {banner.title}
              </h1>

              {/* Subtitle */}
              {banner.subtitle && (
                <p className="text-[11px] sm:text-sm md:text-base text-emerald-100/90 font-medium leading-normal sm:leading-relaxed max-w-xl drop-shadow-xs line-clamp-3 sm:line-clamp-none">
                  {banner.subtitle}
                </p>
              )}

              {/* Action Button */}
              {banner.buttonText && (
                <div className="pt-1 sm:pt-2">
                  <button
                    type="button"
                    onClick={() => handleButtonClick(banner.buttonLink)}
                    className="relative overflow-hidden inline-flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-[11px] sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-950/50 hover:shadow-2xl hover:shadow-emerald-600/40 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-400/30 cursor-pointer group/btn"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 group-hover/btn:scale-110 transition-transform" />
                    <span>{banner.buttonText}</span>
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-200" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MANUAL NAVIGATION CONTROLS (Prev / Next Buttons) */}
      {displayBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-emerald-600 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 border border-white/20 shadow-lg cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
            title="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-emerald-600 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 border border-white/20 shadow-lg cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
            title="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* SLIDE NAVIGATION DOTS */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-lg">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === (currentIndex % displayBanners.length)
                    ? 'w-7 h-2.5 bg-gradient-to-r from-emerald-400 to-green-500 shadow-md shadow-emerald-500/50'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


