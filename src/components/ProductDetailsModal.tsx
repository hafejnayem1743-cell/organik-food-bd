import React, { useState } from 'react';
import { X, Star, ShoppingBag, Zap, ShieldCheck, Truck, RefreshCw, Heart, CheckCircle2, Share2 } from 'lucide-react';
import { Product } from '../types';
import { AdsterraBanner300x250 } from './AdsterraAds';

interface ProductDetailsModalProps {
  product: Product | null;
  isWishlisted?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onToggleWishlist?: (productId: string) => void;
  onShareProduct?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isWishlisted = false,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onShareProduct
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviews, setReviews] = useState([
    { id: '1', user: 'Rafiqul Islam', rating: 5, date: '2 days ago', comment: '100% genuine honey! Very tasty and fresh aroma.' },
    { id: '2', user: 'Shirin Sultana', rating: 5, date: '5 days ago', comment: 'Delivery was super fast in Mirpur, Kushtia. Packaging was perfect.' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  if (!product) return null;

  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const currentPrice = hasDiscount ? (product.discountPrice || product.price) : product.price;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviews([
      {
        id: Date.now().toString(),
        user: 'Valued Customer',
        rating: newRating,
        date: 'Just now',
        comment: newComment
      },
      ...reviews
    ]);
    setNewComment('');
  };

  const imagesList = (product.images && product.images.length > 0) ? product.images : [product.image];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative my-auto border border-pink-100 max-h-[92vh] flex flex-col text-slate-800">
        
        {/* Top Header Bar */}
        <div className="bg-red-600 text-white px-5 py-3 flex items-center justify-between border-b border-red-700 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌱</span>
            <span className="font-extrabold text-sm uppercase tracking-wider">Organic Product Details</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Images & Zoom */}
            <div className="space-y-3">
              <div 
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                className="aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-pink-50/40 border border-pink-100 relative cursor-crosshair group"
              >
                <img
                  src={imagesList[activeImageIndex] || imagesList[0]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                />
                
                {product.isOrganic && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase">
                    🌱 100% Organic
                  </span>
                )}

                {/* Wishlist & Share Button Overlay */}
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onShareProduct && onShareProduct(product)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2 rounded-full shadow-md cursor-pointer transition-transform active:scale-90"
                    title="Share Product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-full shadow-md cursor-pointer transition-transform active:scale-90"
                    title="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-purple-600 text-purple-600' : 'text-purple-700'}`} />
                  </button>
                </div>
              </div>

              {/* Image Gallery Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx ? 'border-red-600 scale-95 shadow-sm' : 'border-pink-100 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 uppercase">
                    {product.category}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `In Stock (${product.stock} ${product.unit})` : 'Out of Stock'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  {product.name}
                </h1>
                {product.bnName && (
                  <p className="text-sm text-red-600 font-extrabold mt-0.5">
                    {product.bnName}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-black text-red-600">
                    ৳{currentPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ৳{product.price}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">/ {product.unit}</span>
                </div>

                {/* Caption / Short description */}
                {(product.caption || product.shortDescription) && (
                  <div className="mt-3 p-3 bg-red-50/50 rounded-2xl border border-red-100">
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">
                      "{product.caption || product.shortDescription}"
                    </p>
                  </div>
                )}

                {/* Benefits / Full description */}
                {(product.benefits || product.fullDescription) && (
                  <div className="mt-3 space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Product Benefits & Details</span>
                    </h4>
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-pink-50/30 p-3 rounded-2xl border border-pink-100">
                      {product.benefits || product.fullDescription}
                    </div>
                  </div>
                )}

                {/* Adsterra 300x250 Banner Ad */}
                <AdsterraBanner300x250 />
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-pink-100">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-pink-200 rounded-full bg-white overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-pink-50 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-pink-50 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Total: <strong className="text-red-600 font-black">৳{currentPrice * quantity}</strong>
                  </span>
                </div>

                {/* Red Add to Cart & Green Buy Now */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transition-all shadow-sm active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    disabled={product.stock <= 0}
                    onClick={() => {
                      onBuyNow(product, quantity);
                      onClose();
                    }}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 pt-2 text-center">
                  <div className="p-2 bg-pink-50/50 rounded-xl flex items-center justify-center space-x-1 border border-pink-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Organic Certified</span>
                  </div>
                  <div className="p-2 bg-pink-50/50 rounded-xl flex items-center justify-center space-x-1 border border-pink-100">
                    <Truck className="w-3.5 h-3.5 text-red-600" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="p-2 bg-pink-50/50 rounded-xl flex items-center justify-center space-x-1 border border-pink-100">
                    <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                    <span>Easy Return</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-6 border-t border-pink-100 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Customer Reviews & Feedback</span>
            </h3>

            {/* Write Review Form */}
            <form onSubmit={handleAddReview} className="bg-pink-50/40 p-3.5 rounded-2xl space-y-2 border border-pink-100">
              <p className="text-xs font-bold text-slate-800">Write a Review for {product.name}</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Share your experience with this organic product..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-white border border-pink-200 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold cursor-pointer transition-all"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-2.5">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-white rounded-2xl border border-gray-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{rev.user}</span>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

