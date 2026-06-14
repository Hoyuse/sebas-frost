import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Sparkles, 
  MapPin, 
  Clock, 
  Snowflake, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  X, 
  Heart, 
  Leaf, 
  Smile, 
  BookOpen,
  LogOut,
  Menu,
  Play
} from 'lucide-react';

import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

import { Product, CartItem } from './types';
import { PRODUCTS } from './data';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CustomMixModal from './components/CustomMixModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import WelcomeVideoPage from './components/WelcomeVideoPage';
import MisionVisionPage from './components/MisionVisionPage';

export default function App() {
  const STORE_MAP_LINK = 'https://www.google.com/maps?q=10.378189086914062,-75.4897232055664&z=17&hl=es';
  const STORE_COORDINATES = '10.378189, -75.489723';

  // --- STATE ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Cítricos' | 'Dulces'>('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMixModalOpen, setIsMixModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'store' | 'video' | 'mision-vision'>('store');
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- FIREBASE AUTHENTICATION TRIGGER & INITIAL RETRIEVAL ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData && Array.isArray(userData.cart)) {
              setCart(userData.cart);
            }
          } else {
            // First time login - Sync existing local cart to Cloud if present
            const stored = localStorage.getItem('sebas_frost_cart');
            const localCart = stored ? JSON.parse(stored) : [];
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || null,
              cart: localCart,
              updatedAt: serverTimestamp()
            });
            setCart(localCart);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        // Logged out: recover local session cart
        const stored = localStorage.getItem('sebas_frost_cart');
        try {
          setCart(stored ? JSON.parse(stored) : []);
        } catch {
          setCart([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // --- BUSINESS STATUS CHECKER ---
  useEffect(() => {
    const checkOpenState = () => {
      // Sebas Frost operates from 10:00 AM to 9:00 PM (Lunes a Domingo)
      const currentHour = new Date().getHours();
      if (currentHour >= 10 && currentHour < 21) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false);
      }
    };
    checkOpenState();
    const interval = setInterval(checkOpenState, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // --- CART PERSISTENCE & CLOUD WRITER ---
  const updateCartAndSync = async (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('sebas_frost_cart', JSON.stringify(newCart));

    // If logged in, push user's cart to Firestore securely
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      try {
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName || null,
          cart: newCart,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    }
  };

  // --- CART FUNCTIONS ---
  const handleAddToCartAttempt = (product: Product) => {
    if (product.id === 'mix-sebas') {
      // Trigger custom three-flavors combination dialog instead of raw insert
      setIsMixModalOpen(true);
    } else {
      addProductToCart(product);
    }
  };

  const addProductToCart = (product: Product, customDetails?: string) => {
    let nextCart: CartItem[] = [];
    const existingIdx = cart.findIndex(
      (item) => item.product.id === product.id && item.customDetails === customDetails
    );

    if (existingIdx > -1) {
      nextCart = [...cart];
      nextCart[existingIdx].quantity += 1;
    } else {
      nextCart = [...cart, { product, quantity: 1, customDetails }];
    }

    updateCartAndSync(nextCart);
    setIsCartOpen(true);
  };

  const handleConfirmMix = (selectedFlavors: string[]) => {
    const mixProduct = PRODUCTS.find((p) => p.id === 'mix-sebas');
    if (!mixProduct) return;
    
    // Join the chosen combinations together
    const details = selectedFlavors.join(' + ');
    addProductToCart(mixProduct, details);
  };

  const handleUpdateQuantity = (productId: string, customDetails: string | undefined, delta: number) => {
    const nextCart = cart
      .map((item) => {
        if (item.product.id === productId && item.customDetails === customDetails) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    updateCartAndSync(nextCart);
  };

  const handleRemoveItem = (productId: string, customDetails: string | undefined) => {
    const nextCart = cart.filter(
      (item) => !(item.product.id === productId && item.customDetails === customDetails)
    );
    updateCartAndSync(nextCart);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- FILTERS ---
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-primary">
      
      {/* 1. Header / TopNavBar */}
      <header className={`fixed top-0 w-full z-50 border-b border-white/20 shadow-[0_10px_30px_-10px_rgba(0,105,112,0.04)] ${isMobileMenuOpen ? 'bg-white' : 'bg-white/60 backdrop-blur-xl'}`}>
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setCurrentView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold shadow-sm">
              <Snowflake className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-secondary">
              Sebas <span className="text-primary font-black">Frost</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-8 items-center font-semibold text-sm">
            <button 
              onClick={() => setCurrentView('store')} 
              className={`transition-colors cursor-pointer ${currentView === 'store' ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Menú Principal
            </button>
            <button 
              onClick={() => setCurrentView('video')} 
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${currentView === 'video' ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Vídeo de Bienvenida
            </button>
            <a href="#sabores" onClick={() => setCurrentView('store')} className="text-on-surface-variant hover:text-primary transition-colors">
              Sabores
            </a>
            <a href="#horarios" onClick={() => setCurrentView('store')} className="text-on-surface-variant hover:text-primary transition-colors">
              Horarios
            </a>
            <a href="#ubicacion" onClick={() => setCurrentView('store')} className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Ubicación
            </a>
            <button 
              onClick={() => { setCurrentView('mision-vision'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`transition-colors cursor-pointer ${currentView === 'mision-vision' ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Misión y Visión
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 bg-white border border-zinc-200 shadow-sm hover:bg-zinc-100 rounded-xl transition-colors text-on-surface"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* User Profile Auth Section */}
            {!loadingAuth && (
              <div>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary/5 pl-2.5 pr-4 py-1.5 rounded-full border border-primary/10">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || ''} 
                          className="w-6 h-6 rounded-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-bold text-on-surface truncate max-w-[95px] hidden sm:inline">
                        {user.displayName || 'Usuario'}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut(auth)}
                      title="Cerrar Sesión"
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-xs font-black text-white bg-primary hover:bg-primary/95 px-4.5 py-2.5 rounded-full shadow-md cursor-pointer"
                  >
                    Iniciar Sesión
                  </motion.button>
                )}
              </div>
            )}

            {/* Cart Trigger */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-all duration-200 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.3]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] flex items-center justify-center shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
            >
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="absolute right-0 top-0 h-full w-[84vw] max-w-xs bg-white shadow-2xl p-5 flex flex-col gap-4 z-[70]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold">Navegación</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => { setCurrentView('store'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Menú Principal
                </button>
                <button
                  onClick={() => { setCurrentView('video'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Vídeo de Bienvenida
                </button>
                <button
                  onClick={() => { setCurrentView('store'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Sabores
                </button>
                <button
                  onClick={() => { setCurrentView('store'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Horarios
                </button>
                <button
                  onClick={() => { setCurrentView('store'); setIsMobileMenuOpen(false); setTimeout(() => document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Ubicación
                </button>
                <button
                  onClick={() => { setCurrentView('mision-vision'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-left w-full px-4 py-3 rounded-2xl font-semibold text-on-surface hover:bg-zinc-100 transition-colors"
                >
                  Misión y Visión
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        {currentView === 'video' ? (
          <WelcomeVideoPage onBackToStore={() => setCurrentView('store')} />
        ) : currentView === 'mision-vision' ? (
          <MisionVisionPage onBackToStore={() => setCurrentView('store')} />
        ) : (
          <>
            {/* 2. Hero Section */}
            <section className="relative min-h-[620px] md:min-h-[720px] flex items-center overflow-hidden ice-gradient pb-10 md:pb-0">
              <div className="max-w-7xl mx-auto px-6 md:px-16 w-full grid md:grid-cols-2 gap-12 items-center">
                <div className="z-10 text-center md:text-left pt-12 md:pt-0">
                  {/* Promotion banner */}
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>100% Granizados Frutales Artesanales</span>
                  </div>

                  {user ? (
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface leading-[1.1] mb-6">
                      ¡Hola, <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container font-black">{user.displayName || 'bienvenido'}</span>! Refresca tu día con Sebas Frost
                    </h1>
                  ) : (
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface leading-[1.1] mb-6">
                      Refresca tu día con <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Sebas Frost</span>
                    </h1>
                  )}
                  
                  <p className="text-base md:text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                    Descubre la explosión de sabores frutales reales en su punto más frío. Exquisitos granizados preparados uno a uno de forma artesanal para congelar el calor.
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4">
                    <a 
                      href="#sabores" 
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                    >
                      Ver Sabores
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </a>
                    <button
                      onClick={() => setIsHistoryOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-zinc-50 text-on-surface-variant font-bold text-sm rounded-full border border-zinc-200 hover:border-zinc-300 hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      Nuestra Receta Secreta
                    </button>
                    <button
                      onClick={() => setCurrentView('video')}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-full border border-emerald-200 hover:border-emerald-300 hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer gap-2"
                      id="hero-play-video-btn"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-800 text-emerald-800 ml-0.5" />
                      Video de Bienvenida
                    </button>
                  </div>
                </div>

                {/* Float hero image wrapper with clean styling */}
                <div className="relative flex justify-center items-center group/heroCon">
                  <div className="w-[300px] md:w-[480px] aspect-square rounded-full bg-primary-container/20 blur-3xl absolute scale-110"></div>
                  <img 
                    alt="Sebas Frost Signature Slushie" 
                    className="relative z-10 w-[82%] md:w-[88%] drop-shadow-[0_20px_50px_rgba(0,105,112,0.25)] animate-float-ice object-contain" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNQ34Fy0c0KftNDHGr_0N5s4P_88UpNi0UaCmXiokxu3j2OtJCO1oiJhupxf0XQGJLlsSJvjM4aodVENdpZbzOiNw8JC2XWeNiT0lbBKjtr7lBHooh_ENYvqiqALEsIFdBUGtYR8ebHMoQbIhQ34qHnr62PKHHBAbG_eKbvescEKdRs7eaqsq7JFsiWwHmfPzSpAx9yzPjB1lY89B5O6G3xuhG6AguE6T-7wWUcvcFqpyWw1TCU-AdcKNh9X6p0JCnjvW7ABbSGH3"
                  />
                </div>
              </div>
            </section>

        {/* 3. Product Catalog Section */}
        <section className="py-24 max-w-7xl mx-auto px-6 md:px-16" id="sabores">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">
                Nuestras Creaciones
              </h2>
              <p className="text-sm text-on-surface-variant">Artesanía bajo cero fresca, elaborada para cada paladar.</p>
            </div>

            {/* Filtering elements: Category chips & Clean Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search input field */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar sabor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-100 rounded-xl border border-zinc-200 outline-none focus:border-primary/50 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categorization toggle */}
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                {(['Todos', 'Cítricos', 'Dulces'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid render */}
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center text-zinc-400"
              >
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 border">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-on-surface font-black text-lg mb-1">No se encontraron sabores</h3>
                <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                  Prueba buscando otro término o cambia el filtro de categoría.
                </p>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCartAttempt}
                    onViewDetail={setSelectedProduct}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. Ice Shimmer Divider Bar */}
        <div className="w-full h-2.5 shimmer-bar"></div>

        {/* 5. Bento Style Information Cards */}
        <section className="py-24 bg-zinc-100/55 border-b border-zinc-200/50">
          <div className="max-w-4xl mx-auto px-6 md:px-16" id="bento-info">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

              {/* Horarios Card (Dynamic status checking) */}
              <div 
                id="horarios"
                className="bg-primary text-white rounded-3xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden min-h-[300px]"
              >
                {/* Visual elements */}
                <div className="absolute right-[-10px] top-[-10px] opacity-10">
                  <Snowflake className="w-32 h-32 rotate-[15deg]" />
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/15 text-primary-container flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <h4 className="font-sans font-black text-xl mb-2 flex items-center gap-2">
                    <span>Horarios</span>
                    {/* Pulsing indicator of real-time open status */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isOpenNow ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-red-400 text-red-950'
                    }`}>
                      {isOpenNow ? 'Abierto ahora' : 'Cerrado ahora'}
                    </span>
                  </h4>
                  <p className="text-sm text-primary-container/85 leading-relaxed">
                    Siempre hay tiempo para un Sebas Frost. Preparados instantáneamente en cada momento del día con higiene y frescura certificada.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 flex flex-col gap-1">
                  <span className="font-black text-sm">Lunes a Domingo</span>
                  <span className="text-xs text-primary-container/90">10:00 AM - 9:00 PM sin interrupciones</span>
                </div>
              </div>

              {/* Ubicacion Card */}
              <div
                id="ubicacion"
                className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200/40 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 min-h-[300px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <h4 className="font-sans font-black text-xl text-on-surface mb-2">Ubicación</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Encuéntranos en Cartagena. Esta es la ubicación exacta que abrimos en Google Maps para que llegues sin vueltas.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-200/70 flex flex-col gap-3">
                  <span className="font-black text-sm text-on-surface">Coordenadas</span>
                  <span className="text-xs text-on-surface-variant">{STORE_COORDINATES}</span>
                  <a
                    href={STORE_MAP_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-2xl text-xs font-extrabold shadow-sm transition-all"
                  >
                    Abrir en Google Maps
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Misión y Visión Card */}
              <div 
                id="mision-vision-card"
                className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200/40 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 min-h-[300px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6 stroke-[2.3]" />
                  </div>
                  <h4 className="font-sans font-black text-xl text-on-surface mb-2">Misión y Visión</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Nuestra razón de ser y el horizonte que perseguimos. Elaboramos cada granizado guiados por la máxima calidad y un compromiso inquebrantable de frescura.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8">
                  <button 
                    onClick={() => { setCurrentView('mision-vision'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-white bg-primary hover:bg-primary/95 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Ver Misión y Visión Complete</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="text-on-surface-variant hover:text-primary px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border border-zinc-200 rounded-xl"
                  >
                    Nuestra Historia
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="w-full py-16 bg-zinc-100 text-on-surface border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="font-black text-2xl tracking-tight text-secondary mb-2">
                Sebas <span className="text-primary font-black">Frost</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                <a href="https://sebas-frost.vercel.app/" className="hover:underline">Sebas Frost</a> by <a href="https://github.com/Hoyuse" className="hover:underline">Sebastian Morelo</a> is marked <a href="https://creativecommons.org/publicdomain/zero/1.0/" className="hover:underline">CC0 1.0</a>
                <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="cc" style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }} />
                <img src="https://mirrors.creativecommons.org/presskit/icons/zero.svg" alt="zero" style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }} />
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <span 
                className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer" 
                onClick={() => { setCurrentView('mision-vision'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Misión y Visión
              </span>
              <span className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => setIsHistoryOpen(true)}>
                Historia
              </span>
              <a href="#horarios" onClick={() => setCurrentView('store')} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                Horario
              </a>
              <a href="#ubicacion" onClick={() => setCurrentView('store')} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                Ubicación
              </a>
              <span className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onClick={() => setIsCartOpen(true)}>
                Ver Pedido
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* --- POPUPS & DRAWERS --- */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Custom Tri-Flavor Slushie Builder Modal */}
      <CustomMixModal
        isOpen={isMixModalOpen}
        onClose={() => setIsMixModalOpen(false)}
        onConfirmMix={handleConfirmMix}
      />

      {/* Detailed Product Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartAttempt}
      />

      {/* Authentication Login/Signup Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={async () => {
          if (auth.currentUser) {
            try {
              await auth.currentUser.reload();
            } catch (err) {
              console.warn("User reload failed:", err);
            }
            setUser({ ...auth.currentUser } as any);
          }
        }}
      />

      {/* Nuestra Historia / Secret Recipe Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-primary/20 z-10 p-6 md:p-8"
            >
              {/* Close Icon */}
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <h3 className="font-extrabold text-2xl text-on-surface">La Historia de Sebas Frost</h3>
              </div>

              <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                <p>
                  Fundado bajo la idea de que la ola de calor caribeña merece un alivio premium, <strong>Sebas Frost</strong> nace como una respuesta artesanal y saludable a las bebidas artificiales tradicionales.
                </p>
                <p>
                  Nuestros granizados se elaboran raspando hielo fino de máxima pureza, impregnado con pulpas 100% orgánicas extraídas directamente de frutas maduras locales seleccionadas en su punto óptimo de dulzura.
                </p>
                
                <div className="p-4 bg-zinc-50 rounded-2xl border border-primary/10 my-4 space-y-2">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5" />
                    El Compromiso Glacial
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-primary shrink-0" />
                      <span><strong>Frutas de Origen Local:</strong> Apoyamos a nuestros agricultores de la región.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary shrink-0" />
                      <span><strong>Bajo en Azúcar:</strong> No usamos jarabes químicos artificiales.</span>
                    </li>
                  </ul>
                </div>

                <p>
                  Cada capa de nuestros helados representa un esmero por la calidad, logrando un balance ideal entre acidez, frescura y dulzura natural que congela el tiempo. ¡Gracias por hacernos parte de tus días dorados!
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  ¡De acuerdo!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
