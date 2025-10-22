import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Product } from '../types';
import { IconPlus, IconMinus } from '../components/Icons';

type ProductDetailPageProps = {
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products, addToCart }) => {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === Number(productId));

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.images[0] || '');

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4); // Show up to 4 related products
  }, [product, products]);
  
  if (!product) {
    return <Navigate to="/" />; // Or a proper 404 page
  }

  // Fallback if main selected image is somehow invalid
  if(!selectedImage && product.images.length > 0) {
      setSelectedImage(product.images[0])
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} x ${product.name} añadido(s) al carrito!`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="neomorphic-out p-2 mb-4">
            <img src={selectedImage} alt={product.name} className="w-full h-auto object-cover rounded-lg" style={{ aspectRatio: '1/1' }}/>
          </div>
          <div className="flex gap-2 justify-center">
            {product.images.slice(0, 5).map((img, index) => (
              <div key={index} className={`p-1 rounded-md cursor-pointer ${selectedImage === img ? 'neomorphic-in' : 'neomorphic-out'}`} onClick={() => setSelectedImage(img)}>
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-20 h-20 object-cover rounded"/>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <p className="text-md text-gray-500 mb-2">{product.category}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-arista mb-4">{product.name}</h1>
          <p className="text-4xl font-bold text-[#00E0FF] mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <p className="font-semibold">Cantidad:</p>
            <div className="flex items-center neomorphic-out p-1 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 neomorphic-button rounded-md"><IconMinus className="w-5 h-5"/></button>
                <span className="px-6 font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 neomorphic-button rounded-md"><IconPlus className="w-5 h-5"/></button>
            </div>
          </div>

          <button onClick={handleAddToCart} className="w-full bg-[#FF5DCD] hover:bg-[#D4AF37] text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-300 neomorphic-out neomorphic-button">
            Añadir al Carrito
          </button>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
          <div className="mt-16">
              <h2 className="text-3xl font-bold text-center text-[#FF5DCD] font-arista mb-8">Productos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map(related => (
                    <div key={related.id} className="neomorphic-out group flex flex-col h-full bg-white/50 text-center">
                        <Link to={`/product/${related.id}`} className="block">
                            <img src={related.images[0]} alt={related.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="p-4 flex-grow flex flex-col">
                               <h3 className="font-bold text-md text-gray-800 font-arista flex-grow">{related.name}</h3>
                               <p className="text-lg font-semibold text-[#00E0FF] mt-2">${related.price.toFixed(2)}</p>
                            </div>
                        </Link>
                    </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};