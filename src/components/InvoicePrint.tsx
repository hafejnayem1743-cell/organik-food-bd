import React from 'react';
import { Order } from '../types';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Sparkles, MapPin, Phone, Mail, FileText } from 'lucide-react';

interface InvoicePrintProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, onClose }) => {
  if (!order) return null;

  const invoiceNumber = order.invoiceNumber || `INV-${order.orderNumber || order.id}`;
  const formattedDate = new Date(order.orderTime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(order.orderTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`Organik Food BD Invoice: ${invoiceNumber} | Order: ${order.orderNumber} | Total: ৳${order.totalAmount}`)}`;

  const extraCharge = order.extraCharge || order.paymentCharge || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 relative print:shadow-none print:w-full print:max-w-none print:rounded-none print:p-4 my-auto border border-slate-100">
        
        {/* Controls Bar (Hidden during printing) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-3 print:hidden">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Official Invoice & Tax Receipt</span>
            </h3>
            <p className="text-xs text-slate-500">
              Invoice #{invoiceNumber} • Organik Food BD Mirpur, Kushtia
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content Area */}
        <div id="printable-invoice" className="pt-4 space-y-6 text-xs text-slate-800">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🌱</span>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-emerald-950 uppercase">Organik Food BD</h1>
                  <p className="text-[11px] text-emerald-700 font-bold">Pure • Chemical-Free • Fresh Organic Food</p>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 space-y-0.5">
                <p><strong>Manager:</strong> Md Sohel Rana | <strong>Admin:</strong> BD NAYEM BOSS</p>
                <p>Mirpur, Kushtia, Bangladesh • <strong>Hotline:</strong> +880 1700-000000</p>
                <p><strong>Email:</strong> support@organikfoodbd.com • <strong>Web:</strong> www.organikfoodbd.com</p>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-900 font-black text-xs rounded-full border border-emerald-300">
                OFFICIAL INVOICE
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Invoice No:</p>
                <p className="font-black text-sm text-slate-900 font-mono">{invoiceNumber}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Order ID: <strong className="text-slate-900">{order.orderNumber}</strong></p>
                <p className="text-[11px] text-slate-500">Date: {formattedDate} ({formattedTime})</p>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-wider text-emerald-800 mb-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Customer Information</span>
              </p>
              <p className="font-extrabold text-sm text-slate-900">{order.receiverName || order.customerName}</p>
              <p className="text-slate-600 font-medium">Phone: <strong>{order.mobile}</strong></p>
              <p className="text-slate-600 font-medium">Email: {order.email || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-wider text-emerald-800 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Shipping Address</span>
              </p>
              <p className="text-slate-800 font-bold">{order.fullAddress || order.address}</p>
              <p className="text-slate-600 font-medium">
                Village/Area: {order.village || order.area || 'N/A'} • Upazila: {order.upazila} • District: {order.district}
              </p>
              <p className="text-slate-600 font-medium pt-0.5">
                Payment: <strong className="text-emerald-700">{order.paymentMethod}</strong> ({order.paymentStatus})
              </p>
              {(order.paymentTxnId || order.transactionId) && (
                <p className="text-slate-600 font-medium text-[11px]">
                  Txn ID: <strong className="font-mono text-slate-900">{order.paymentTxnId || order.transactionId}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-950 text-white font-black text-xs uppercase tracking-wider">
                  <th className="p-3">#</th>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-extrabold text-slate-900">{item.productName}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="p-3 text-right text-slate-600 font-medium">৳{item.unitPrice}</td>
                    <td className="p-3 text-right font-black text-slate-900">৳{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & QR Code Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-6">
            
            {/* QR Code & Status */}
            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <img
                src={qrUrl}
                alt="Invoice QR Code"
                className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="space-y-1 text-[11px]">
                <p className="font-black text-slate-900 uppercase">Organik Food BD Verified</p>
                <p className="text-slate-500">Scan QR Code to verify order invoice authenticity.</p>
                <p className="text-emerald-700 font-bold">Status: {order.status}</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-72 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{order.subtotal}</span>
              </div>
              
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">৳{order.deliveryCharge}</span>
              </div>

              {extraCharge > 0 && (
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Extra Charge</span>
                  <span className="font-bold text-slate-900">৳{extraCharge}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-emerald-950 pt-2 border-t border-slate-300">
                <span>Grand Total</span>
                <span className="text-emerald-700">৳{order.totalAmount || order.grandTotal}</span>
              </div>
            </div>

          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-500 border-t border-slate-200 mt-8">
            <div>
              <div className="border-b border-slate-300 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Customer Signature</p>
            </div>
            <div>
              <div className="border-b border-slate-300 w-40 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Organik Food BD Authority</p>
              <p className="text-[10px] text-slate-400">Manager: Md Sohel Rana</p>
            </div>
          </div>

          {/* Footer Statement */}
          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-dashed border-slate-200">
            Thank you for shopping with Organik Food BD.
          </div>

        </div>

      </div>
    </div>
  );
};
