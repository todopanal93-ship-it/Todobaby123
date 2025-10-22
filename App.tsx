import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientLayout, HomePage } from './components/ClientUI';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminLayout, AdminLoginPage } from './components/AdminUI';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { INITIAL_SETTINGS } from './constants';
import { Product, CartItem, StoreSettings } from './types';
import * as db from './services/supabaseService';

// Simple in-memory storage for state persistence across reloads
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const ProtectedRoute: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useStickyState<StoreSettings>(INITIAL_SETTINGS, 'todo-baby-settings');
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useStickyState<CartItem[]>([], 'todo-baby-cart');
  
  // --- Auth State ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false); // To prevent flicker on load

  // Check auth state on mount and listen for changes
  useEffect(() => {
    const checkInitialSession = async () => {
        const session = await db.getSession();
        setIsAdminAuthenticated(!!session);
        setAuthChecked(true); // Auth has been checked
    };
    
    checkInitialSession();

    // FIX: Correctly handle the subscription object returned by onAuthStateChange.
    // The service function already extracts the subscription, so we don't need to destructure `data`.
    const subscription = db.onAuthStateChange((_event, session) => {
        setIsAdminAuthenticated(!!session);
    });

    // Cleanup subscription on unmount
    return () => {
        subscription?.unsubscribe();
    };
  }, []);

  // Fetch products from Supabase on initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const fetchedProducts = await db.getProducts();
      setProducts(fetchedProducts);
      setIsLoading(false);
    };
    loadData();
  }, []);


  // --- Cart Logic ---
  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, [setCart]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [setCart, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  // --- Auth Logic ---
  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await db.signInWithEmail(email, password);
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }
    // onAuthStateChange will handle setting isAdminAuthenticated
    return true;
  };

  const logout = async () => {
    const { error } = await db.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    // onAuthStateChange will handle setting isAdminAuthenticated to false
  };
  
  // --- Admin Data Handlers (Now with Supabase) ---
  const handleProductAdd = async (productData: Omit<Product, 'id'>) => {
    const newProduct = await db.addProduct(productData);
    if (newProduct) {
        setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleProductUpdate = async (productData: Product) => {
     const updatedProduct = await db.updateProduct(productData);
     if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
     }
  };
  
  const handleProductDelete = async (productId: number) => {
    const { error } = await db.deleteProduct(productId);
    if (!error) {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const clientProps = { products, settings, cart, addToCart, removeFromCart, updateQuantity, clearCart };
  
  if (!authChecked || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }
  
  return (
    <HashRouter>
      <Routes>
        {/* Client-facing routes */}
        <Route element={<ClientLayout {...clientProps} />}>
          <Route path="/" element={<HomePage products={products} settings={settings} addToCart={addToCart} />} />
          <Route path="/about" element={<AboutPage settings={settings} />} />
          <Route path="/contact" element={<ContactPage settings={settings} />} />
          <Route path="/product/:productId" element={<ProductDetailPage products={products} addToCart={addToCart} />} />
        </Route>
        
        {/* Admin Public Login Route */}
        <Route 
          path="/admin/login"
          element={
            isAdminAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage login={login} />
          }
        />

        {/* Protected Admin Section */}
        <Route 
          path="/admin/*"
          element={
            <ProtectedRoute isAuthenticated={isAdminAuthenticated}>
              <AdminLayout logout={logout}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage products={products} />} />
                  <Route path="products" element={
                    <AdminProductsPage
                      products={products}
                      handleProductAdd={handleProductAdd}
                      handleProductUpdate={handleProductUpdate}
                      handleProductDelete={handleProductDelete}
                    />
                  } />
                  <Route path="settings" element={
                    <AdminSettingsPage
                      settings={settings}
                      setSettings={setSettings}
                    />
                  } />
                   <Route index path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;