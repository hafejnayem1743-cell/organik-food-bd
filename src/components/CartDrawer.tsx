import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  deliveryArea: 'kushtia' | 'outside';
  setDeliveryArea: (area: 'kushtia' | 'outside') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  deliveryArea,
  setDeliveryArea
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice && item.product.discountPrice < item.product.price
      ? item.product.discountPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryCharge = cart.length === 0 ? 0 : (subtotal >= 1500 ? 0 : (deliveryArea === 'kushtia' ? 50 : 120));
  const total = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-red-700 flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h3 className="font-black text-base">Your Shopping Cart</h3>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Delivery Banner */}
        <div className="bg-red-50 px-4 py-2 border-b border-pink-100 text-xs font-semibold text-red-600 flex items-center justify-between">
          <span>🚚 Free Delivery on orders over ৳1,500!</span>
          <span className="font-extrabold">{subtotal >= 1500 ? 'Unlocked!' : `Add ৳${1500 - subtotal} more`}</span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-3xl">
                🛒
              </div>
              <p className="font-bold text-gray-800">Your cart is empty!</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our fresh organic honey, ghee, fish, and vegetables to add to your order.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const price = item.product.discountPrice && item.product.discountPrice < item.product.price
                ? item.product.discountPrice
                : item.product.price;

              return (
                <div
                  key={item.product.id}
                  className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100 flex items-center space-x-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-pink-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.product.unit}</p>
                    <p className="font-black text-sm text-[#FF5C8A] mt-0.5">
                      ৳{price} <span className="text-[10px] text-slate-400 font-normal">x {item.quantity} = ৳{price * item.quantity}</span>
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end space-y-1">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center border border-pink-200 rounded-full bg-white text-xs overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold hover:bg-pink-50 text-slate-700"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold hover:bg-pink-50 text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-pink-100 bg-white space-y-3">
            
            {/* Delivery Location Selector */}
            <div className="text-xs space-y-1">
              <label className="font-extrabold text-slate-700 block">Select Delivery Location:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryArea('kushtia')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    deliveryArea === 'kushtia'
                      ? 'border-[#FF5C8A] bg-pink-50 text-[#FF5C8A]'
                      : 'border-slate-200 text-slate-600 hover:border-pink-200'
                  }`}
                >
                  Inside Kushtia (৳50)
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryArea('outside')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    deliveryArea === 'outside'
                      ? 'border-[#FF5C8A] bg-pink-50 text-[#FF5C8A]'
                      : 'border-slate-200 text-slate-600 hover:border-pink-200'
                  }`}
                >
                  Outside Kushtia (৳120)
                </button>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {deliveryCharge === 0 ? <strong className="text-[#FF5C8A]">FREE</strong> : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-pink-100">
                <span>Total Payable Amount</span>
                <span className="text-[#FF5C8A]">৳{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
