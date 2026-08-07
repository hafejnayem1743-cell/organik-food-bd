import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface DeliveryTrackerProps {
  order: Order;
  compact?: boolean;
}

interface StepConfig {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  badgeBg: string;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ order, compact = false }) => {
  const currentStatus = order.status || order.orderStatus || 'Pending';
  const isCancelled = currentStatus === 'Cancelled';

  // Standard delivery progression steps
  const standardSteps: StepConfig[] = [
    {
      status: 'Pending',
      label: 'Pending',
      icon: <Clock className="w-4 h-4" />,
      activeColor: 'text-amber-600',
      activeBg: 'bg-amber-50',
      activeBorder: 'border-amber-500',
      badgeBg: 'bg-amber-500'
    },
    {
      status: 'Confirmed',
      label: 'Confirmed',
      icon: <CheckCircle className="w-4 h-4" />,
      activeColor: 'text-emerald-600',
      activeBg: 'bg-emerald-50',
      activeBorder: 'border-emerald-500',
      badgeBg: 'bg-emerald-500'
    },
    {
      status: 'Processing',
      label: 'Processing',
      icon: <PackageCheck className="w-4 h-4" />,
      activeColor: 'text-orange-600',
      activeBg: 'bg-orange-50',
      activeBorder: 'border-orange-500',
      badgeBg: 'bg-orange-500'
    },
    {
      status: 'Shipped',
      label: 'Shipped',
      icon: <Truck className="w-4 h-4" />,
      activeColor: 'text-blue-600',
      activeBg: 'bg-blue-50',
      activeBorder: 'border-blue-500',
      badgeBg: 'bg-blue-500'
    },
    {
      status: 'Delivered',
      label: 'Delivered',
      icon: <CheckCircle2 className="w-4 h-4" />,
      activeColor: 'text-green-700',
      activeBg: 'bg-green-50',
      activeBorder: 'border-green-600',
      badgeBg: 'bg-green-600'
    }
  ];

  // Map timeline items to lookup map for quick time retrieval
  const timelineMap = new Map<string, string>();
  if (order.timeline && Array.isArray(order.timeline)) {
    order.timeline.forEach((item) => {
      if (item && item.status) {
        timelineMap.set(item.status, item.timestamp);
      }
    });
  }

  // Helper function to determine index of status
  const getStatusIndex = (st: OrderStatus) => {
    switch (st) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const formatStepDate = (rawIso?: string) => {
    if (!rawIso) return null;
    try {
      const d = new Date(rawIso);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  if (isCancelled) {
    const cancelTime = timelineMap.get('Cancelled') || order.updatedAt || order.orderTime;
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-rose-900 animate-in fade-in">
        <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
          <XCircle className="w-5 h-5 text-rose-600" />
          <span>Order Cancelled</span>
        </div>
        <p className="text-xs text-rose-700 font-medium">
          This order was cancelled on {formatStepDate(cancelTime) || 'recently'}. Please contact support if you have any questions.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery Progress</span>
          </span>
          <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {currentStatus}
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          {standardSteps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step.status}
                className={`h-full flex-1 transition-all duration-500 border-r border-white/50 ${
                  isCompleted
                    ? isCurrent
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-emerald-600'
                    : 'bg-slate-200'
                }`}
                title={`${step.label} (${isCompleted ? 'Completed' : 'Pending'})`}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
          <span>Ordered</span>
          <span>Delivered</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Live Delivery Tracker</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time status updates synced with Organik Food BD warehouse.
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-950 font-black text-xs rounded-full border border-emerald-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>Current: {currentStatus}</span>
        </div>
      </div>

      {/* Desktop & Tablet Timeline (Horizontal) */}
      <div className="hidden sm:block relative pt-2 pb-4">
        {/* Progress Line */}
        <div className="absolute top-[28px] left-[5%] right-[5%] h-1 bg-slate-200 -z-0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 transition-all duration-700 ease-out"
            style={{ width: `${(Math.max(0, currentIndex) / (standardSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-5 gap-2 relative z-10 text-center">
          {standardSteps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const stepTime = timelineMap.get(step.status) || (idx === 0 ? order.orderTime : undefined);
            const formattedTime = formatStepDate(stepTime);

            return (
              <div key={step.status} className="flex flex-col items-center space-y-2">
                {/* Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold shadow-md ${
                    isCompleted
                      ? isCurrent
                        ? `${step.badgeBg} text-white ring-4 ring-emerald-200 scale-110`
                        : 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Label */}
                <div>
                  <p className={`text-xs font-black ${isCurrent ? 'text-emerald-900 scale-105' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </p>

                  {/* Timestamp */}
                  {formattedTime ? (
                    <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5 flex items-center justify-center space-x-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{formattedTime}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {isCompleted ? 'Completed' : 'Pending'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Timeline (Vertical) */}
      <div className="block sm:hidden space-y-4 relative pl-2">
        <div className="absolute top-2 bottom-2 left-[21px] w-0.5 bg-slate-200" />

        {standardSteps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const stepTime = timelineMap.get(step.status) || (idx === 0 ? order.orderTime : undefined);
          const formattedTime = formatStepDate(stepTime);

          return (
            <div key={step.status} className="flex items-start space-x-3.5 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? isCurrent
                      ? `${step.badgeBg} text-white ring-4 ring-emerald-100 scale-110`
                      : 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  step.icon
                )}
              </div>

              <div className="pt-0.5">
                <p className={`text-xs font-black ${isCurrent ? 'text-emerald-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label} {isCurrent && <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Active</span>}
                </p>

                {formattedTime ? (
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>{formattedTime}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <span>Delivery Address: <strong className="text-slate-900">{order.fullAddress || order.address}, {order.upazila}, {order.district}</strong></span>
        <span className="text-emerald-700 font-bold">Payment: {order.paymentMethod} ({order.paymentStatus})</span>
      </div>

    </div>
  );
};
