export type UserRole = 'admin' | 'manager' | 'customer';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  profilePhoto?: string;
  isBlocked?: boolean;
  createdAt: string;
  lastLogin?: string;
  address?: {
    district?: string;
    upazila?: string;
    area?: string;
    fullAddress?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  bnName?: string;
  shortDescription: string;
  fullDescription?: string;
  caption?: string;
  benefits?: string;
  price: number;
  discountPrice?: number;
  category: string;
  image?: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  unit: string; // e.g. 'kg', 'liter', 'jar', 'piece', 'dozen'
  isOrganic?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface StatusTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderId?: string; // e.g. OFBD-8392
  orderNumber: string;
  invoiceNumber?: string; // e.g. INV-OFBD-8392
  userId?: string;
  customerUid?: string;
  receiverName: string;
  customerName?: string;
  username?: string;
  email: string;
  customerEmail?: string;
  mobile: string;
  phone?: string;
  fullAddress: string;
  address?: string;
  district: string;
  upazila: string;
  area: string;
  village?: string;
  notes?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  quantity?: number;
  unitPrice?: number;
  items: OrderItem[];
  cartItems?: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  extraCharge?: number;
  paymentCharge?: number;
  totalAmount: number;
  grandTotal?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Unpaid' | 'Waiting Verification' | 'Verified' | 'Paid' | 'Refunded';
  paymentTxnId?: string;
  transactionId?: string;
  senderMobileNumber?: string;
  senderNumber?: string;
  paymentProof?: string; // Cloudinary screenshot URL
  paymentScreenshotURL?: string; // Cloudinary or preview screenshot URL
  paymentScreenshotUrl?: string;
  orderTime: string;
  createdAt?: string;
  updatedAt?: string;
  statusUpdatedBy?: string;
  paymentVerifiedAt?: string;
  deliveryCompletedAt?: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  timeline: StatusTimeline[];
}

export interface Notification {
  id: string;
  notificationId?: string;
  type: 'order' | 'user' | 'stock' | 'system' | 'banner' | 'product' | 'welcome' | 'offer' | 'payment';
  title: string;
  message: string;
  read: boolean;
  isRead?: boolean;
  userId?: string;
  createdAt: string;
  link?: string;
  icon?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todaySales: number;
  monthlySales: number;
  totalRevenue: number;
  bestSellers: { name: string; salesCount: number; revenue: number }[];
  recentOrders: Order[];
  monthlyData: { month: string; sales: number; orders: number }[];
}
