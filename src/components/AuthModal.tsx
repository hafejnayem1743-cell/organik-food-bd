import React, { useState } from 'react';
import { 
  X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles, 
  KeyRound, CheckCircle2, Eye, EyeOff, Loader2, ArrowRight 
} from 'lucide-react';
import { User, UserRole } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const photoOptions = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  ];

  const getFirebaseAuthErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email/username or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Authentication failed. Please check your credentials and try again.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!loginId || !loginPassword) {
      setErrorMessage('Please enter Email/Username and Password.');
      return;
    }

    setLoading(true);
    try {
      let targetEmail = loginId.trim();

      // If user entered username instead of email, lookup email from Firestore
      if (!targetEmail.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', targetEmail.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const uData = querySnap.docs[0].data();
          targetEmail = uData.email;
        }
      }

      const userCred = await signInWithEmailAndPassword(auth, targetEmail, loginPassword);
      const uid = userCred.user.uid;

      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData: User;
      const loggedInEmail = (userCred.user.email || targetEmail).toLowerCase();
      const isAdminAccount = loggedInEmail === 'hafejnayem1743@gmail.com' || loggedInEmail === 'jsenterprisesohel@gmail.com';

      if (userDocSnap.exists()) {
        const d = userDocSnap.data();
        userData = {
          id: uid,
          fullName: d.fullName || userCred.user.displayName || 'User',
          username: d.username || 'user',
          email: userCred.user.email || targetEmail,
          mobile: d.mobile || '',
          role: isAdminAccount ? 'admin' : (d.role || 'customer'),
          profilePhoto: d.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
          createdAt: d.createdAt || new Date().toISOString()
        };
      } else {
        userData = {
          id: uid,
          fullName: userCred.user.displayName || 'User',
          username: targetEmail.split('@')[0],
          email: userCred.user.email || targetEmail,
          mobile: '',
          role: isAdminAccount ? 'admin' : 'customer',
          profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
          createdAt: new Date().toISOString()
        };
        // Save initial profile
        await setDoc(userDocRef, {
          uid,
          fullName: userData.fullName,
          username: userData.username,
          email: userData.email,
          mobile: '',
          role: userData.role,
          profilePhoto: userData.profilePhoto,
          createdAt: userData.createdAt
        });
      }

      // Admin Login Notification
      if (userData.role === 'admin' || isAdminAccount) {
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'system',
            userId: 'admin',
            title: '🔐 Admin Portal Login',
            message: `${userData.fullName} logged into the Admin Portal.`,
            read: false,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/admin'
          });
        } catch (nErr) {
          console.warn("Admin login notification notice:", nErr);
        }
      }

      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(userData);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      setErrorMessage(getFirebaseAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const formattedEmail = email.trim().toLowerCase();
      const userCred = await createUserWithEmailAndPassword(auth, formattedEmail, password);
      const user = userCred.user;

      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn("Email verification send issue:", e);
      }

      const role: UserRole = formattedEmail === 'hafejnayem1743@gmail.com' ? 'admin' : 'customer';

      const userDocData = {
        uid: user.uid,
        fullName: fullName.trim(),
        username: username.toLowerCase().trim(),
        mobile: mobile.trim(),
        email: formattedEmail,
        profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
        role,
        createdAt: new Date().toISOString()
      };

      // Always create Firestore document inside users/{uid}
      await setDoc(doc(db, 'users', user.uid), userDocData);

      const newUserRecord: User = {
        id: user.uid,
        fullName: userDocData.fullName,
        username: userDocData.username,
        email: userDocData.email,
        mobile: userDocData.mobile,
        role: userDocData.role,
        profilePhoto: userDocData.profilePhoto,
        createdAt: userDocData.createdAt
      };

      // Create notifications for New Registration
      try {
        // Admin Notification
        await addDoc(collection(db, 'notifications'), {
          type: 'user',
          userId: 'admin',
          title: '👤 New Customer Registered',
          message: `${fullName.trim()} (@${username.trim()}) created a new account (${formattedEmail}).`,
          read: false,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: '/admin/users'
        });

        // Customer Welcome Notification
        await addDoc(collection(db, 'notifications'), {
          type: 'system',
          userId: user.uid,
          title: '🌿 Welcome to Organik Food BD!',
          message: `Hello ${fullName.trim()}, welcome! Discover 100% pure organic food items and supplements.`,
          read: false,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: '/'
        });
      } catch (nErr) {
        console.warn("Registration notification error:", nErr);
      }

      setSuccessMessage('Registration successful!');
      setTimeout(() => {
        onAuthSuccess(newUserRecord);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Firebase Signup Error:", err);
      setErrorMessage(getFirebaseAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSuccessMessage('');

    if (!resetEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      setResetSuccessMessage('Password reset link has been sent to your email.');
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setErrorMessage(err.message || getFirebaseAuthErrorMessage(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      
      {/* Glassmorphism Card */}
      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden relative my-auto border border-blue-100/80 transition-all">
        
        {/* Top Header - Premium Blue Gradient */}
        <div className="p-6 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
              🌱
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight text-white leading-tight">Organik Food BD</h2>
              <p className="text-xs text-blue-200 font-medium">Fresh & Organic Products</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 bg-white/15 backdrop-blur-md p-1 rounded-full mt-5 text-xs font-bold text-center border border-white/20">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); setResetSuccessMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-[#2563EB] shadow-md font-extrabold' : 'text-white/90 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(''); setResetSuccessMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'signup' ? 'bg-white text-[#2563EB] shadow-md font-extrabold' : 'text-white/90 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setActiveTab('forgot'); setErrorMessage(''); setResetSuccessMessage(''); setSuccessMessage(''); setResetEmail(loginId); }}
              className={`py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'forgot' ? 'bg-white text-[#2563EB] shadow-md font-extrabold' : 'text-white/90 hover:text-white'
              }`}
            >
              Reset Pass
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Welcome Message */}
          <div className="text-left space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {activeTab === 'login' && 'Welcome Back!'}
              {activeTab === 'signup' && 'Create Your Account'}
              {activeTab === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'login' && 'Enter your credentials to manage your organic orders'}
              {activeTab === 'signup' && 'Join Organik Food BD to shop pure organic foods'}
              {activeTab === 'forgot' && 'Enter your email address to receive a password reset link'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <span className="text-base">⚠️</span>
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Email or Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. nayem@gmail.com"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-extrabold text-slate-700 block">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setResetEmail(loginId);
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Gradient Blue Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : activeTab === 'signup' ? (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hafez Nayem"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                  <UserIcon className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="nayem123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Mobile *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01712345678"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                    />
                    <Phone className="w-3.5 h-3.5 text-[#2563EB] absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nayem@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Confirm *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Profile Avatar Selection */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Profile Avatar</label>
                <div className="flex space-x-2 overflow-x-auto py-1">
                  {photoOptions.map((imgUrl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setProfilePhoto(imgUrl)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        profilePhoto === imgUrl ? 'border-[#2563EB] scale-110 shadow-md ring-2 ring-blue-300' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <img src={imgUrl} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register New Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. nayem@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 outline-none text-slate-800 font-medium transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Password Reset Email</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); setResetSuccessMessage(''); setSuccessMessage(''); }}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};


