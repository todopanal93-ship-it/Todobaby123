







import { createClient, Session, Subscription } from '@supabase/supabase-js';
import { Product } from '../types';

const supabaseUrl = 'https://npyghmudamnkpssfddwh.supabase.co';
// IMPORTANT: The key should be in an environment variable in a real app.
// For this project, we'll use the provided public anon key directly.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weWdobXVkYW1ua3Bzc2ZkZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTg2NDQsImV4cCI6MjA3NjY5NDY0NH0.ZfWDthMqJWMGqs9IBjiqfC_byXEmpKDCHaSBfqX16Eo';

const supabase = createClient(supabaseUrl, supabaseKey);


// --- Admin Auth Functions (Using Supabase Auth) ---

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    return data.session;
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void): Subscription | undefined => {
    const { data } = supabase.auth.onAuthStateChange(callback);
    // Use optional chaining to safely access the subscription.
    // This prevents a crash if `data` is null or undefined.
    return data?.subscription;
};


// --- Product CRUD Functions ---

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding product:', error);
        return null;
    }
    return data as Product;
};

export const updateProduct = async (productData: Product): Promise<Product | null> => {
    const { id, ...updateData } = productData;
    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating product:', error);
        return null;
    }
    return data as Product;
};

export const deleteProduct = async (productId: number): Promise<{ error: any | null }> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
    
    if (error) {
        console.error('Error deleting product:', error);
    }
    return { error };
};

// --- Storage Functions ---
export const uploadProductImage = async (file: File): Promise<{ publicUrl: string | null; error: any | null; }> => {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `public/${fileName}`; // Store in a 'public' folder within the bucket

    // Upload the file to the 'product-images' bucket with explicit content type
    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            contentType: file.type, // Explicitly set the MIME type for better handling (e.g., for PNGs)
            upsert: false,
        });

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { publicUrl: null, error: uploadError };
    }

    // Get the public URL for the uploaded file
    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    if (!data.publicUrl) {
         const error = { message: 'Could not get public URL for uploaded image.' };
         console.error(error.message);
         return { publicUrl: null, error };
    }

    return { publicUrl: data.publicUrl, error: null };
};