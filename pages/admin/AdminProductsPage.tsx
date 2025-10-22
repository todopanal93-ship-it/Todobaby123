
import React, { useState, useCallback, useEffect } from 'react';
import { Product } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { IconSparkles } from '../../components/Icons';
import { CATEGORIES } from '../../constants';

type ProductFormData = Omit<Product, 'id' | 'images' | 'colors' | 'sizes' | 'tags' | 'hashtags'> & {
    id?: number;
    images: string;
    colors: string;
    sizes: string;
    tags: string;
    hashtags?: string;
};

type AdminProductsPageProps = {
  products: Product[];
  handleProductAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  handleProductUpdate: (product: Product) => Promise<void>;
  handleProductDelete: (productId: number) => Promise<void>;
};

const ProductEditModal: React.FC<{
  product: Product | Omit<Product, 'id'> | null;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductFormData>({ name: '', sku: '', description: '', category: CATEGORIES[0], subcategory: '', price: 0, stock: 0, status: 'Active', images: '', colors: '', sizes: '', material: '', tags: '', hashtags: '' });
  
  useEffect(() => {
    if (product) {
        setFormData({
            ...product,
            images: Array.isArray(product.images) ? product.images.join(', ') : '',
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            hashtags: Array.isArray(product.hashtags) ? product.hashtags.join(', ') : '',
        });
    } else {
        setFormData({ name: '', sku: '', description: '', category: CATEGORIES[0], subcategory: '', price: 0, stock: 0, status: 'Active', images: '', colors: '', sizes: '', material: '', tags: '', hashtags: '' });
    }
  }, [product]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDesc = async () => {
    if (!formData.name || !formData.category) {
        alert("Por favor, ingrese un nombre y categoría para el producto.");
        return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({...prev, description: desc}));
    setIsGenerating(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
        ...formData,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        hashtags: formData.hashtags?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
        price: Number(formData.price),
        stock: Number(formData.stock)
    };
    onSave(processedData);
  };
  
  if (!product) return null;

  const isNewProduct = !('id' in product) || !product.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="glassmorphic rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{isNewProduct ? 'Añadir Nuevo' : 'Editar'} Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del Producto" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
            <input name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="Código SKU" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="subcategory" value={formData.subcategory || ''} onChange={handleChange} placeholder="Subcategoría" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Precio" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
            <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock Disponible" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
             <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]">
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
            </select>
            <input name="material" value={formData.material || ''} onChange={handleChange} placeholder="Material (ej. Algodón)" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>
          <div className="relative">
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción Completa" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] h-24" />
            <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="absolute bottom-3 right-3 bg-[#D4AF37] text-white p-2 rounded-full hover:bg-yellow-600 disabled:bg-gray-400">
                <IconSparkles className="w-5 h-5"/>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imágenes (URLs separadas por comas)</label>
            <textarea name="images" value={formData.images} onChange={handleChange} placeholder="https://url.com/img1.jpg, https://url.com/img2.jpg" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] h-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <input name="colors" value={formData.colors} onChange={handleChange} placeholder="Colores (ej. Rojo, Azul)" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
             <input name="sizes" value={formData.sizes} onChange={handleChange} placeholder="Tallas (ej. 3-6M, Etapa 1)" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
             <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Etiquetas (ej. nuevo, organico)" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
             <input name="hashtags" value={formData.hashtags || ''} onChange={handleChange} placeholder="Hashtags (ej. #ropabebe)" className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200/50 rounded-lg neomorphic-out neomorphic-button">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[#00E0FF] text-white rounded-lg neomorphic-out neomorphic-button">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ products, handleProductAdd, handleProductUpdate, handleProductDelete }) => {
    const [editingProduct, setEditingProduct] = useState<Product | Omit<Product, 'id'> | null>(null);

    const handleSave = async (productToSave: Product | Omit<Product, 'id'>) => {
        if ('id' in productToSave && productToSave.id) {
            await handleProductUpdate(productToSave as Product);
        } else {
            await handleProductAdd(productToSave as Omit<Product, 'id'>);
        }
        setEditingProduct(null);
    }
    
    const handleDelete = (productId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            handleProductDelete(productId);
        }
    }

    const openAddModal = () => {
        setEditingProduct({ name: '', sku: '', description: '', category: CATEGORIES[0], subcategory: '', price: 0, stock: 0, status: 'Active', images: [], colors: [], sizes: [], material: '', tags: [], hashtags: [] });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
                <button onClick={openAddModal} className="px-4 py-2 bg-[#00E0FF] text-white font-bold rounded-lg hover:bg-[#9AD5FA] neomorphic-out neomorphic-button">Añadir Producto</button>
            </div>
            <div className="neomorphic-out rounded-lg overflow-x-auto p-2">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-white">
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3">Precio</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b border-white hover:bg-gray-50/20">
                                <td className="p-3 font-semibold">{p.name}</td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3">${p.price.toFixed(2)}</td>
                                <td className="p-3">{p.stock}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => setEditingProduct(p)} className="text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingProduct && <ProductEditModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave}/>}
        </div>
    );
};