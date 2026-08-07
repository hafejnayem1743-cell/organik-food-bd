import React from 'react';
import { Star, ShoppingBag, Heart, ShoppingCart, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  onOpenDetails,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onShareProduct
}) => {
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - (product.discountPrice || product.price)) / product.price) * 100) 
    : 0;

  const inStock = product.stock > 0;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-pink-100/80 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-between overflow-hidden p-2.5 sm:p-3.5 group relative"
    >
      {/* Product Image Area */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative w-full h-36 sm:h-44 bg-pink-50/40 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer border border-pink-100/60 group-hover:border-red-200 transition-colors"
      >
        <img
          src={product.images && product.images[0] ? product.images[0] : (product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800')}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Top Badges & Share Button */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            {product.isOrganic !== false && (
              <span className="bg-[#DC2626] text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
                🌱 Organic
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[#16A34A] text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Share Button Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShareProduct) onShareProduct(product);
            }}
            className="pointer-events-auto bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-90 border border-pink-100"
            title="Share Product"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>

        {/* Stock Badge */}
        <span className={`absolute bottom-2 right-2 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-xs ${
          inStock ? 'bg-slate-900/80 backdrop-blur-md text-white' : 'bg-red-500 text-white'
        }`}>
          {inStock ? `In Stock` : 'Stock Out'}
        </span>
      </div>

      {/* Card Body Details */}
      <div className="flex-1 flex flex-col justify-between mt-2 space-y-2">
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-1">
            <span className="text-[#DC2626] font-extrabold uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded-md border border-red-100 line-clamp-1">
              {product.category}
            </span>
            <div className="flex items-center space-x-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 
            onClick={() => onOpenDetails(product)}
            className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-[#DC2626] transition-colors cursor-pointer line-clamp-1 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.bnName && (
            <p className="text-[11px] text-[#DC2626] font-bold line-clamp-1">
              {product.bnName}
            </p>
          )}
        </div>

        {/* Price Row */}
        <div className="pt-1">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="font-black text-[#DC2626] text-sm sm:text-base">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through">
                  ৳{product.price}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">/ {product.unit}</span>
          </div>

          {/* Action Buttons Section */}
          <div className="flex flex-col gap-[6px] w-full">
            {/* Row 1: Add Wish & Add Cart */}
            <div className="grid grid-cols-2 gap-[6px] w-full">
              {/* 1. Add Wish (Blue #2563EB) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleWishlist) onToggleWishlist(product.id);
                }}
                className={`bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[9px] min-[360px]:text-[10px] sm:text-[11px] px-1 h-[36px] rounded-[8px] flex items-center justify-center space-x-0.5 sm:space-x-1 cursor-pointer transition-all shadow-xs ${
                  isWishlisted ? 'ring-2 ring-blue-300' : ''
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isWishlisted ? 'fill-white' : ''}`} />
                <span className="whitespace-nowrap">{isWishlisted ? 'Saved' : 'Add Wish'}</span>
              </button>

              {/* 2. Add Cart (Red #DC2626) */}
              <button
                type="button"
                disabled={!inStock}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="bg-[#DC2626] hover:bg-red-700 active:scale-95 text-white font-extrabold text-[9px] min-[360px]:text-[10px] sm:text-[11px] px-1 h-[36px] rounded-[8px] flex items-center justify-center space-x-0.5 sm:space-x-1 cursor-pointer transition-all shadow-xs disabled:opacity-40"
                title="Add to Cart"
              >
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Add Cart</span>
              </button>
            </div>

            {/* Row 2: BUY NOW (Green #16A34A, Height 42px, Full Width) */}
            <button
              type="button"
              disabled={!inStock}
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="w-full bg-[#16A34A] hover:bg-emerald-700 active:scale-95 text-white font-black text-xs h-[42px] rounded-[8px] flex items-center justify-center space-x-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-40 uppercase tracking-wider"
              title="Buy Now"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>BUY NOW</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


