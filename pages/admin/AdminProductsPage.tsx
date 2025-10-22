import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { IconSparkles } from '../../components/Icons';
import { CATEGORIES } from '../../constants';

// --- Type for form data, converting arrays to strings ---
type ProductFormData = Omit<Product, 'id' | 'images' | 'colors' | 'sizes' | 'tags' | 'hashtags' | 'price' | 'stock'> & {
    id?: number;
    images: string; // Comma-separated URLs
    colors: string;
    sizes: string;
    tags: string;
    hashtags?: string;
    price: string | number;
    stock: string | number;
};

// --- Reusable form input component ---
const FormInput = React.forwardRef<HTMLInputElement, any>(({ label, ...props }, ref) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input ref={ref} {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
    </div>
));

const FormSelect = ({ label, children, ...props }: { label: string, children: React.ReactNode, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] appearance-none">
            {children}
        </select>
    </div>
);


const FormTextArea = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] h-24 resize-y"/>
    </div>
);


// --- Product Edit/Create Modal ---
const ProductEditModal: React.FC<{
  product: Product | Omit<Product, 'id'> | null;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
        setFormData({
            ...product,
            images: Array.isArray(product.images) ? product.images.join(', ') : '',
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            hashtags: Array.isArray(product.hashtags) ? product.hashtags.join(', ') : '',
            price: product.price ?? '',
            stock: product.stock ?? '',
        });
        // Focus the name input when the modal opens
        setTimeout(() => nameInputRef.current?.focus(), 100);
    } else {
        setFormData(null);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleGenerateDesc = async () => {
    if (!formData || !formData.name || !formData.category) {
        alert("Por favor, ingrese un nombre y categoría para el producto.");
        return;
    }
    setIsGeneratingDesc(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => prev ? ({...prev, description: desc}) : null);
    setIsGeneratingDesc(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);

    const processedData = {
        ...formData,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        hashtags: formData.hashtags?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
    };
    await onSave(processedData);
    setIsSaving(false);
  };
  
  if (!formData) return null;

  const isNewProduct = !('id' in product!) || !product.id;
  const primaryImageUrl = formData.images.split(',')[0]?.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="glassmorphic rounded-2xl p-6 w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">{isNewProduct ? 'Añadir Nuevo' : 'Editar'} Producto</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput ref={nameInputRef} label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Pijama de algodón" required />
              <FormInput label="SKU (Opcional)" name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="Ej: PJM-001" />
            </div>

            <div className="relative">
              <FormTextArea label="Descripción" name="description" value={formData.description} onChange={handleChange} placeholder="Describe el producto..." required/>
              <button type="button" onClick={handleGenerateDesc} disabled={isGeneratingDesc} className="absolute bottom-3 right-3 bg-[#D4AF37] text-white p-2 rounded-full hover:bg-yellow-600 disabled:bg-gray-400 flex items-center gap-1 text-sm">
                  <IconSparkles className="w-5 h-5"/> {isGeneratingDesc ? '...' : ''}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                   <FormTextArea label="Imágenes (URLs separadas por comas)" name="images" value={formData.images} onChange={handleChange} placeholder="https://url.com/img1.jpg, https://url.com/img2.jpg" />
                </div>
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vista Previa</label>
                    <div className="w-full h-32 neomorphic-in rounded-lg flex items-center justify-center">
                        {primaryImageUrl ? <img src={primaryImageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" /> : <span className="text-gray-500 text-sm">Sin imagen</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormInput label="Precio" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" required/>
              <FormInput label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="0" required/>
              <FormSelect label="Categoría" name="category" value={formData.category} onChange={handleChange} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </FormSelect>
              <FormSelect label="Estado" name="status" value={formData.status} onChange={handleChange} required>
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
              </FormSelect>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormInput label="Colores (separados por comas)" name="colors" value={formData.colors} onChange={handleChange} placeholder="Rojo, Azul" />
              <FormInput label="Tallas (separados por comas)" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="3-6M, Etapa 1" />
              <FormInput label="Etiquetas (separados por comas)" name="tags" value={formData.tags} onChange={handleChange} placeholder="nuevo, organico" />
              <FormInput label="Material" name="material" value={formData.material || ''} onChange={handleChange} placeholder="Algodón Pima" />
            </div>

        </form>
        <div className="flex justify-end gap-4 mt-6 flex-shrink-0 pt-4 border-t border-white/30">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200/50 rounded-lg neomorphic-out neomorphic-button">Cancelar</button>
            <button type="submit" onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-[#00E0FF] text-white rounded-lg neomorphic-out neomorphic-button disabled:opacity-50 min-w-[120px]">
                {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Admin Products Page Component ---
export const AdminProductsPage: React.FC<{
  products: Product[];
  handleProductAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  handleProductUpdate: (product: Product) => Promise<void>;
  handleProductDelete: (productId: number) => Promise<void>;
}> = ({ products, handleProductAdd, handleProductUpdate, handleProductDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | Omit<Product, 'id'> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const openAddModal = () => {
        setEditingProduct({ name: '', sku: '', description: '', category: CATEGORIES[0], subcategory: '', price: 0, stock: 0, status: 'Active', images: [], colors: [], sizes: [], material: '', tags: [], hashtags: [] });
        setIsModalOpen(true);
    }
    
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    }

    const handleSave = async (productToSave: Product | Omit<Product, 'id'>) => {
        if ('id' in productToSave && productToSave.id) {
            await handleProductUpdate(productToSave as Product);
        } else {
            await handleProductAdd(productToSave as Omit<Product, 'id'>);
        }
        closeModal();
    }
    
    const handleDelete = (productId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            handleProductDelete(productId);
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Productos ({products.length})</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                        type="search"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-2 rounded-lg neomorphic-in bg-transparent focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] w-full md:w-64"
                    />
                    <button onClick={openAddModal} className="px-4 py-2 bg-[#00E0FF] text-white font-bold rounded-lg hover:bg-[#9AD5FA] neomorphic-out neomorphic-button whitespace-nowrap">
                        Añadir Producto
                    </button>
                </div>
            </div>
            <div className="neomorphic-out rounded-lg overflow-x-auto p-2">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="border-b-2 border-white">
                            <th className="p-3 w-16">Imagen</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3">Precio</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="border-b border-white hover:bg-gray-50/20">
                                <td className="p-3">
                                    <img src={p.images?.[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md bg-gray-200" />
                                </td>
                                <td className="p-3 font-semibold">{p.name}</td>
                                <td className="p-3 text-sm text-gray-600">{p.category}</td>
                                <td className="p-3">${p.price.toFixed(2)}</td>
                                <td className="p-3">{p.stock}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>
                                </td>
                                <td className="p-3 flex gap-4 items-center h-full">
                                    <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && <p className="text-center p-4 text-gray-500">No se encontraron productos.</p>}
            </div>
            {isModalOpen && <ProductEditModal product={editingProduct} onClose={closeModal} onSave={handleSave}/>}
        </div>
    );
};