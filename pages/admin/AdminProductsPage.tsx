import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { uploadProductImage } from '../../services/supabaseService';
import { IconSparkles, IconX } from '../../components/Icons';
import { CATEGORIES } from '../../constants';

// --- Type for form data, converting arrays to strings ---
type ProductFormData = Omit<Product, 'id' | 'images' | 'colors' | 'sizes' | 'tags' | 'hashtags' | 'price' | 'stock'> & {
    id?: number;
    images: string; // Comma-separated URLs
    colors: string;
    sizes: string;
    tags: string[];
    hashtags?: string;
    price: string | number;
    stock: string | number;
};

// --- Reusable form input component ---
const FormInput = React.forwardRef<HTMLInputElement, any>(({ label, ...props }, ref) => (
    <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <input ref={ref} {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
    </div>
));

// FIX: Correctly type the FormSelect component props to avoid issues with `children` type inference.
const FormSelect = ({ label, children, ...props }: React.ComponentPropsWithoutRef<'select'> & { label: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <select {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] appearance-none">
            {children}
        </select>
    </div>
);


const FormTextArea = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
        <textarea {...props} className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] h-24 resize-y"/>
    </div>
);

// --- Reusable Tag Input Component ---
const TagInput: React.FC<{
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}> = ({ label, tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <div className="w-full p-2 bg-transparent rounded-lg neomorphic-in flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-[#9AD5FA]">
        {tags.map((tag, index) => (
          <div key={index} className="bg-[#9AD5FA] text-gray-800 text-sm font-semibold px-2 py-1 rounded-md flex items-center gap-1.5">
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-gray-800 hover:text-red-600"
              aria-label={`Remove ${tag}`}
            >
              <IconX className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir etiqueta..."
          className="bg-transparent focus:outline-none flex-grow p-1 text-sm"
        />
      </div>
    </div>
  );
};


// --- Product Edit/Create Modal ---
const ProductEditModal: React.FC<{
  product: Product | Omit<Product, 'id'> | null;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
        setFormData({
            ...product,
            images: Array.isArray(product.images) ? product.images.join(', ') : '',
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
            tags: Array.isArray(product.tags) ? product.tags : [],
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

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => prev ? { ...prev, tags: newTags } : null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    // FIX: Explicitly type `files` as an array of `File` objects to resolve type inference issues.
    const files: File[] = Array.from(e.target.files);

    // Validate files before uploading
    for (const file of files) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit per file
            alert(`El archivo '${file.name}' es muy grande. El límite es 2MB.`);
            e.target.value = ''; // Reset file input
            return;
        }
    }

    setIsUploading(true);
    
    const uploadPromises = files.map(file => uploadProductImage(file));
    const results = await Promise.all(uploadPromises);

    setIsUploading(false);
    e.target.value = ''; // Reset file input

    const successfulUploads = results.filter(r => r.publicUrl && !r.error).map(r => r.publicUrl) as string[];
    const failedUploads = results.filter(r => r.error);

    if (failedUploads.length > 0) {
        alert(`${failedUploads.length} imagen(es) no pudieron subirse. Por favor, intente de nuevo.`);
        console.error("Failed uploads:", failedUploads);
    }

    if (successfulUploads.length > 0) {
        setFormData(prev => {
            if (!prev) return null;
            const existingImages = prev.images ? prev.images.split(',').map(s => s.trim()).filter(Boolean) : [];
            const newImageUrls = [...existingImages, ...successfulUploads];
            return { ...prev, images: newImageUrls.join(', ') };
        });
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setFormData(prev => {
        if (!prev) return null;
        const currentImages = prev.images.split(',').map(s => s.trim()).filter(Boolean);
        const newImages = currentImages.filter(url => url !== urlToRemove);
        return { ...prev, images: newImages.join(', ') };
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);

    const processedData = {
        ...formData,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags,
        hashtags: formData.hashtags?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
    };
    await onSave(processedData);
    setIsSaving(false);
  };
  
  if (!formData) return null;

  const isNewProduct = !('id' in product!) || !product.id;
  const imageList = formData.images.split(',').map(s => s.trim()).filter(Boolean);
  const primaryImageUrl = imageList[0] || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="neomorphic-out rounded-2xl p-6 w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex-shrink-0">{isNewProduct ? 'Añadir Nuevo' : 'Editar'} Producto</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput ref={nameInputRef} label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Pijama de algodón" required />
              <FormInput label="SKU (Opcional)" name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="Ej: PJM-001" />
            </div>

            <div className="relative">
              <FormTextArea label="Descripción" name="description" value={formData.description} onChange={handleChange} placeholder="Describe el producto..." required/>
              <button type="button" onClick={handleGenerateDesc} disabled={isGeneratingDesc} className="absolute bottom-3 right-3 bg-[#D4AF37] text-gray-800 p-2 rounded-full hover:bg-yellow-600 disabled:bg-gray-400 flex items-center gap-1 text-sm neomorphic-button">
                  <IconSparkles className="w-5 h-5"/> {isGeneratingDesc ? '...' : ''}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                   <label className="block text-sm font-medium text-gray-800 mb-1">Imágenes (URLs o Subir)</label>
                   <div className="neomorphic-in rounded-lg p-3">
                        <textarea 
                           name="images" 
                           value={formData.images} 
                           onChange={handleChange} 
                           placeholder="https://url.com/img1.jpg, https://url.com/img2.jpg"
                           className="w-full bg-transparent focus:outline-none text-sm h-16 resize-y"
                        />
                        <div className="flex items-center justify-end mt-2">
                           <input type="file" id="imageUpload" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} disabled={isUploading} multiple />
                           <label htmlFor="imageUpload" className={`px-4 py-2 text-sm bg-[#9AD5FA] text-gray-800 rounded-lg neomorphic-out neomorphic-button ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               {isUploading ? 'Subiendo...' : 'Subir Imagen(es)'}
                           </label>
                        </div>
                   </div>
                </div>
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-800 mb-1">Vista Previa Principal</label>
                    <div className="w-full h-32 rounded-lg flex items-center justify-center">
                        {primaryImageUrl ? <img src={primaryImageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" /> : <span className="text-gray-800 text-sm">Sin imagen</span>}
                    </div>
                </div>
            </div>

            {imageList.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Imágenes Cargadas</label>
                    <div className="flex flex-wrap gap-2 p-2 neomorphic-in rounded-lg">
                        {imageList.map((url, index) => (
                            <div key={index} className="relative w-20 h-20 group">
                                <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-contain rounded-md" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(url)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Eliminar imagen"
                                >
                                    <IconX className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}


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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <TagInput label="Etiquetas" tags={formData.tags} onTagsChange={handleTagsChange} />
               <FormInput label="Material" name="material" value={formData.material || ''} onChange={handleChange} placeholder="Algodón Pima" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Colores (separados por comas)" name="colors" value={formData.colors} onChange={handleChange} placeholder="Rojo, Azul" />
              <FormInput label="Tallas (separados por comas)" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="3-6M, Etapa 1" />
            </div>

        </form>
        <div className="flex justify-end gap-4 mt-6 flex-shrink-0 pt-4 border-t border-white/80">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent rounded-lg neomorphic-out neomorphic-button">Cancelar</button>
            <button type="submit" onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-[#00E0FF] text-gray-800 rounded-lg neomorphic-out neomorphic-button disabled:opacity-50 min-w-[120px]">
                {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Admin Product Card for mobile-first view ---
const AdminProductCard: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="neomorphic-out p-4 flex flex-col text-sm text-gray-800 h-full">
      <img 
        src={product.images?.[0] || `https://picsum.photos/seed/p${product.id}/400/400`} 
        alt={product.name} 
        className="w-full object-contain rounded-lg mb-3" 
      />
      <h3 className="font-bold text-base text-gray-800 truncate flex-grow" title={product.name}>{product.name}</h3>
      <p className="text-xs text-gray-800 mb-2">{product.category}</p>
      
      <div className="flex justify-between items-center my-2 text-xs">
        <p className="font-semibold text-sm text-[#00E0FF]">${product.price.toFixed(2)}</p>
        <p><span className="font-semibold">Stock:</span> {product.stock}</p>
      </div>
      
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/80">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.status}
        </span>
        <div className="flex gap-2">
            <button onClick={() => onEdit(product)} className="px-3 py-1 text-xs neomorphic-out neomorphic-button rounded-md font-semibold text-blue-600">Editar</button>
            <button onClick={() => onDelete(product.id)} className="px-3 py-1 text-xs neomorphic-out neomorphic-button rounded-md font-semibold text-red-600">Eliminar</button>
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
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return products
            .filter(p => {
                if (!lowercasedSearchTerm) return true;
                
                const nameMatch = p.name.toLowerCase().includes(lowercasedSearchTerm);
                const descriptionMatch = p.description.toLowerCase().includes(lowercasedSearchTerm);
                const categoryMatch = p.category.toLowerCase().includes(lowercasedSearchTerm);
                const tagsMatch = p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));

                return nameMatch || descriptionMatch || categoryMatch || tagsMatch;
            })
            .filter(p => {
                if (statusFilter === 'All') return true;
                return p.status === statusFilter;
            });
    }, [products, searchTerm, statusFilter]);

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
    
    const requestDelete = (product: Product) => {
        setProductToDelete(product);
    }

    const confirmDelete = () => {
        if(productToDelete){
            handleProductDelete(productToDelete.id);
            setProductToDelete(null);
        }
    }
    
    const cancelDelete = () => {
        setProductToDelete(null);
    }


    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Productos ({filteredProducts.length})</h1>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <input
                        type="search"
                        placeholder="Buscar por nombre, categoría, etc..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-3 rounded-lg glassmorphic focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] w-full sm:w-auto text-gray-800 placeholder-gray-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
                        className="w-full sm:w-auto p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"
                    >
                        <option value="All">Todos los Estados</option>
                        <option value="Active">Activos</option>
                        <option value="Inactive">Inactivos</option>
                    </select>
                    <button onClick={openAddModal} className="px-4 py-3 bg-[#00E0FF] text-gray-800 font-bold rounded-lg hover:bg-[#9AD5FA] neomorphic-out neomorphic-button whitespace-nowrap w-full sm:w-auto">
                        Añadir Producto
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                    <AdminProductCard 
                        key={p.id}
                        product={p}
                        onEdit={openEditModal}
                        onDelete={() => requestDelete(p)}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center p-8 neomorphic-out rounded-lg">
                    <p className="text-gray-800">No se encontraron productos.</p>
                </div>
            )}
            
            {isModalOpen && <ProductEditModal product={editingProduct} onClose={closeModal} onSave={handleSave}/>}
            
            {productToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="neomorphic-out rounded-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Eliminación</h3>
                        <p className="text-gray-800 mb-6">¿Estás seguro de que quieres eliminar el producto "{productToDelete.name}"?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={cancelDelete} className="px-6 py-2 bg-transparent rounded-lg neomorphic-out neomorphic-button font-semibold">
                                Cancelar
                            </button>
                            <button onClick={confirmDelete} className="px-6 py-2 bg-red-500 text-white rounded-lg neomorphic-out neomorphic-button font-semibold">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};