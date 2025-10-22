export interface Product {
  id: number;
  name: string;
  sku?: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive';
  images: string[];
  colors: string[];
  sizes: string[];
  material?: string;
  tags: string[];
  hashtags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type Category = {
  name: string;
  products: Product[];
};

export interface StoreSettings {
  id?: number; // Added for Supabase
  whatsappNumber: string;
  storeName: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
  mission: string;
  vision: string;
  logoUrl: string;
  bannerUrl: string;
  aboutUs: string;
  values: { title: string; description: string }[];
}

export interface ClientUIProps {
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}