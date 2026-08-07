import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import { User, Product, Category, Order, Notification, OrderStatus, PaymentMethod } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const defaultCategories: Category[] = [
  { id: 'cat-food-supplement', name: 'Food Supplement', slug: 'food-supplement', icon: 'Sparkles', description: 'Food Supplement products' },
  { id: 'cat-consumer-goods', name: 'Consumer Goods', slug: 'consumer-goods', icon: 'Package', description: 'Consumer Goods products' },
  { id: 'cat-general', name: 'General', slug: 'general', icon: 'Leaf', description: 'General products' },
];

const defaultProducts: Product[] = [];

// Helper to hash passwords consistently
const saltRounds = 10;
const hashedAdminPassword = bcrypt.hashSync('admin123', saltRounds);

const defaultUsers: User[] = [
  {
    id: 'user-admin',
    fullName: 'Hafez Nayem (Admin)',
    username: 'hafejnayem1743',
    email: 'hafejnayem1743@gmail.com',
    mobile: '01724202210',
    role: 'admin',
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    isBlocked: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    address: { district: 'Kushtia', upazila: 'Mirpur', area: 'Main Bazar', fullAddress: 'Mirpur, Kushtia, Bangladesh' }
  }
];

const defaultOrders: Order[] = [];

const defaultNotifications: Notification[] = [];

// Memory store initialized from file or defaults
interface DBStructure {
  categories: Category[];
  products: Product[];
  users: User[];
  userPasswords: Record<string, string>; // userId -> passwordHash
  orders: Order[];
  notifications: Notification[];
}

let db: DBStructure = {
  categories: defaultCategories,
  products: defaultProducts,
  users: defaultUsers,
  userPasswords: {
    'user-admin': hashedAdminPassword,
  },
  orders: defaultOrders,
  notifications: defaultNotifications
};

// Helper to check if request is from an admin account
function isReqAdmin(req: express.Request): boolean {
  const userEmail = (
    req.headers['x-user-email'] as string ||
    req.body?.adminEmail ||
    req.query?.adminEmail ||
    ''
  ).toLowerCase();
  return userEmail === 'hafejnayem1743@gmail.com' || userEmail === 'jsenterprisesohel@gmail.com';
}

// Load database if exists
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(data);
      db = {
        categories: loaded.categories || defaultCategories,
        products: loaded.products || defaultProducts,
        users: loaded.users || defaultUsers,
        userPasswords: loaded.userPasswords || {
          'user-admin': hashedAdminPassword,
        },
        orders: loaded.orders || defaultOrders,
        notifications: loaded.notifications || defaultNotifications,
      };
    } catch (err) {
      console.error('Failed to parse db.json, using defaults:', err);
    }
  }

  // Ensure default categories are set
  db.categories = [...defaultCategories];

  const normalizeCatName = (cat?: string): string => {
    if (!cat) return 'General';
    const trimmed = cat.trim();
    if (trimmed === 'Food Supplement' || trimmed === 'Category 1') return 'Food Supplement';
    if (trimmed === 'Consumer Goods' || trimmed === 'Category 2' || trimmed === 'Consumer') return 'Consumer Goods';
    if (trimmed === 'General') return 'General';
    return trimmed;
  };

  db.products = db.products.map(p => ({
    ...p,
    category: normalizeCatName(p.category)
  }));

  // Ensure hafejnayem1743@gmail.com is present as Admin
  let adminUser = db.users.find(u => u.email.toLowerCase() === 'hafejnayem1743@gmail.com');
  if (!adminUser) {
    adminUser = {
      id: 'user-admin',
      fullName: 'Hafez Nayem (Admin)',
      username: 'hafejnayem1743',
      email: 'hafejnayem1743@gmail.com',
      mobile: '01724202210',
      role: 'admin',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isBlocked: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      address: { district: 'Kushtia', upazila: 'Mirpur', area: 'Main Bazar', fullAddress: 'Mirpur, Kushtia, Bangladesh' }
    };
    db.users.unshift(adminUser);
    db.userPasswords['user-admin'] = hashedAdminPassword;
  } else {
    adminUser.role = 'admin';
  }

  // Ensure jsenterprisesohel@gmail.com is present as Admin
  let secAdmin = db.users.find(u => u.email.toLowerCase() === 'jsenterprisesohel@gmail.com');
  if (!secAdmin) {
    secAdmin = {
      id: 'user-admin-secondary',
      fullName: 'JS Enterprises Sohel',
      username: 'jsenterprisesohel',
      email: 'jsenterprisesohel@gmail.com',
      mobile: '01700000000',
      role: 'admin',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isBlocked: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      address: { district: 'Kushtia', upazila: 'Mirpur', area: 'Main Bazar', fullAddress: 'Mirpur, Kushtia, Bangladesh' }
    };
    db.users.push(secAdmin);
    db.userPasswords['user-admin-secondary'] = hashedAdminPassword;
  } else {
    secAdmin.role = 'admin';
  }

  saveDB();
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

loadDB();

// API ROUTES

// Helper to slugify product/category names
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'organikfoodbd.com';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

// Sitemap.xml endpoint
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'organikfoodbd.com';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const staticPages = [
    '',
    '/products',
    '/categories',
    '/support',
    '/about',
    '/contact'
  ];

  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  staticPages.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${p}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${p === '' ? 'daily' : 'weekly'}</changefreq>\n`;
    xml += `    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Product Pages
  db.products.forEach(p => {
    if (p.status !== 'disabled') {
      const slug = slugify(p.name);
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${slug}</loc>\n`;
      xml += `    <lastmod>${(p.createdAt ? new Date(p.createdAt) : new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'Organik Food BD API', timestamp: new Date() });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, username, email, mobile, password, profilePhoto, address } = req.body;

    if (!fullName || !username || !email || !mobile || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ error: 'Email address is already registered.' });
    }

    const existingUsername = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const isOwnerAdmin = email.toLowerCase() === 'hafejnayem1743@gmail.com';
    const newUser: User = {
      id: 'user-' + Date.now(),
      fullName,
      username,
      email,
      mobile,
      role: isOwnerAdmin ? 'admin' : 'customer',
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isBlocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      address: address || { district: 'Kushtia', upazila: 'Mirpur', area: 'Mirpur', fullAddress: 'Mirpur, Kushtia' }
    };

    db.users.push(newUser);
    db.userPasswords[newUser.id] = hashedPassword;

    // Create Notification for admin
    const notif: Notification = {
      id: 'notif-' + Date.now(),
      type: 'user',
      title: 'New Customer Signup 🎉',
      message: `${fullName} (@${username}) registered a new account.`,
      read: false,
      createdAt: new Date().toISOString(),
      link: '/admin/users'
    };
    db.notifications.unshift(notif);

    saveDB();

    res.json({ message: 'Registration successful', user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or username
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Please enter Email/Username and Password.' });
    }

    const user = db.users.find(
      u => u.email.toLowerCase() === loginId.toLowerCase() || u.username.toLowerCase() === loginId.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid Email/Username or Password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been temporarily disabled by Admin. Please contact support.' });
    }

    const userHash = db.userPasswords[user.id];
    let isMatch = false;

    if (userHash) {
      isMatch = await bcrypt.compare(password, userHash);
    } else {
      // Fallback if hash missing
      isMatch = password === 'admin123' || password === 'manager123' || password === 'nayem123';
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Email/Username or Password.' });
    }

    user.lastLogin = new Date().toISOString();
    saveDB();

    res.json({ message: 'Login successful', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/auth/profile', (req, res) => {
  try {
    const { userId, fullName, mobile, profilePhoto, address } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (mobile) user.mobile = mobile;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (address) user.address = { ...user.address, ...address };

    saveDB();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userHash = db.userPasswords[user.id];
    if (userHash) {
      const isMatch = await bcrypt.compare(currentPassword, userHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    db.userPasswords[user.id] = await bcrypt.hash(newPassword, saltRounds);
    saveDB();
    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  try {
    if (!isReqAdmin(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only admin (hafejnayem1743@gmail.com) can manage products.' });
    }

    const productData = req.body;
    const shortDesc = productData.caption || productData.shortDescription || '';
    const fullDesc = productData.benefits || productData.fullDescription || '';

    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      name: productData.name || 'Unnamed Product',
      price: Number(productData.price) || 0,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      caption: shortDesc,
      benefits: fullDesc,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      createdAt: new Date().toISOString(),
      status: productData.status || 'active',
      isOrganic: productData.isOrganic !== false,
      unit: productData.unit || 'Kg',
      category: productData.category || 'General',
      images: productData.images && productData.images.length > 0 ? productData.images : [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
      ]
    };

    db.products.unshift(newProduct);
    saveDB();
    res.json({ message: 'Product created successfully', product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    if (!isReqAdmin(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only admin (hafejnayem1743@gmail.com) can manage products.' });
    }

    const { id } = req.params;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const updates = { ...req.body };
    if (updates.caption) updates.shortDescription = updates.caption;
    if (updates.benefits) updates.fullDescription = updates.benefits;
    if (updates.shortDescription) updates.caption = updates.shortDescription;
    if (updates.fullDescription) updates.benefits = updates.fullDescription;

    db.products[index] = { ...db.products[index], ...updates };
    saveDB();
    res.json({ message: 'Product updated', product: db.products[index] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    if (!isReqAdmin(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only admin (hafejnayem1743@gmail.com) can manage products.' });
    }

    const { id } = req.params;
    db.products = db.products.filter(p => p.id !== id);
    saveDB();
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Category Routes
app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      icon: icon || 'Leaf',
      description: description || ''
    };

    db.categories.push(newCat);
    saveDB();
    res.json({ message: 'Category created', category: newCat });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.categories = db.categories.filter(c => c.id !== id);
    saveDB();
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Order Routes
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const searchId = String(userId).trim().toLowerCase();
    const userOrders = db.orders.filter(o => 
      (o.userId && String(o.userId).trim().toLowerCase() === searchId) ||
      (o.customerUid && String(o.customerUid).trim().toLowerCase() === searchId) ||
      (o.email && String(o.email).trim().toLowerCase() === searchId) ||
      (o.customerEmail && String(o.customerEmail).trim().toLowerCase() === searchId) ||
      (o.mobile && String(o.mobile).trim() === String(userId).trim()) ||
      (o.phone && String(o.phone).trim() === String(userId).trim())
    );
    return res.json(userOrders);
  }
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  try {
    const {
      userId,
      receiverName,
      username,
      email,
      mobile,
      fullAddress,
      district,
      upazila,
      area,
      notes,
      items,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentTxnId
    } = req.body;

    if (!receiverName || !mobile || !fullAddress || !items || items.length === 0) {
      return res.status(400).json({ error: 'Please provide receiver details and cart items.' });
    }

    const orderNumber = 'OFBD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      userId,
      receiverName,
      username: username || 'guest',
      email: email || '',
      mobile,
      fullAddress,
      district: district || 'Kushtia',
      upazila: upazila || 'Mirpur',
      area: area || 'Mirpur Bazar',
      notes,
      items,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Waiting Verification',
      paymentTxnId,
      orderTime: now,
      status: 'Pending',
      timeline: [
        { status: 'Pending', timestamp: now, note: `Order placed via ${paymentMethod}` }
      ]
    };

    db.orders.unshift(newOrder);

    // Update product stock and check low stock
    items.forEach((item: any) => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock <= 10) {
          db.notifications.unshift({
            id: 'notif-' + Date.now() + Math.random(),
            type: 'stock',
            title: 'Low Stock Alert ⚠️',
            message: `Product "${prod.name}" stock is low (${prod.stock} left).`,
            read: false,
            createdAt: now,
            link: '/admin/products'
          });
        }
      }
    });

    // Create Notification for Admin
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'order',
      title: 'New Order Placed! 🛒',
      message: `Order #${orderNumber} by ${receiverName} (৳${totalAmount.toLocaleString()} via ${paymentMethod})`,
      read: false,
      createdAt: now,
      link: '/admin/orders'
    });

    saveDB();

    res.json({ message: 'Order placed successfully!', order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const order = db.orders.find(o => o.id === id);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status as OrderStatus;
    const now = new Date().toISOString();
    order.timeline.push({
      status: status as OrderStatus,
      timestamp: now,
      note: note || `Status updated to ${status}`
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    } else if (status === 'Cancelled') {
      // Revert product stock
      order.items.forEach(item => {
        const prod = db.products.find(p => p.id === item.productId);
        if (prod) prod.stock += item.quantity;
      });

      db.notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'order',
        title: 'Order Cancelled ❌',
        message: `Order #${order.orderNumber} was cancelled.`,
        read: false,
        createdAt: now,
        link: '/admin/orders'
      });
    }

    saveDB();
    res.json({ message: 'Order status updated', order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.orders = db.orders.filter(o => o.id !== id && o.orderId !== id && o.orderNumber !== id);
    saveDB();
    res.json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Management Routes
app.get('/api/users', (req, res) => {
  res.json(db.users);
});

app.put('/api/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role, isBlocked } = req.body;
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (role) user.role = role;
    if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;

    saveDB();
    res.json({ message: 'User updated successfully', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications Routes
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

app.put('/api/notifications/read', (req, res) => {
  db.notifications.forEach(n => { n.read = true; });
  saveDB();
  res.json({ message: 'All notifications marked as read' });
});

// Analytics Dashboard Stats
app.get('/api/stats', (req, res) => {
  const totalUsers = db.users.length;
  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter(o => o.status === 'Pending').length;
  const completedOrders = db.orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = db.orders.filter(o => o.status === 'Cancelled').length;

  const totalRevenue = db.orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = db.orders
    .filter(o => o.orderTime.startsWith(todayStr) && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const bestSellersMap: Record<string, { name: string; salesCount: number; revenue: number }> = {};
  db.orders.filter(o => o.status !== 'Cancelled').forEach(order => {
    order.items.forEach(item => {
      if (!bestSellersMap[item.productId]) {
        bestSellersMap[item.productId] = { name: item.productName, salesCount: 0, revenue: 0 };
      }
      bestSellersMap[item.productId].salesCount += item.quantity;
      bestSellersMap[item.productId].revenue += item.totalPrice;
    });
  });

  const bestSellers = Object.values(bestSellersMap)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  const monthlyData = [
    { month: 'Jan', sales: 45000, orders: 35 },
    { month: 'Feb', sales: 58000, orders: 48 },
    { month: 'Mar', sales: 62000, orders: 52 },
    { month: 'Apr', sales: 71000, orders: 60 },
    { month: 'May', sales: 85000, orders: 74 },
    { month: 'Jun', sales: 92000, orders: 81 },
    { month: 'Jul', sales: totalRevenue > 0 ? totalRevenue : 105000, orders: totalOrders > 0 ? totalOrders : 90 },
  ];

  res.json({
    totalUsers,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    todaySales,
    monthlySales: totalRevenue,
    totalRevenue,
    bestSellers,
    recentOrders: db.orders.slice(0, 6),
    monthlyData
  });
});

// Vite / Production setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Organik Food BD Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
