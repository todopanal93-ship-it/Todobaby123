import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Product } from '../types';
import { IconPlus, IconMinus, IconChevronLeft, IconChevronRight } from '../components/Icons';

type ProductDetailPageProps = {
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products, addToCart }) => {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === Number(productId));

  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4); // Show up to 4 related products
  }, [product, products]);
  
  if (!product) {
    return <Navigate to="/" />; // Or a proper 404 page
  }
  
  const hasImages = product.images && product.images.length > 0;

  const goToPrevious = () => {
    if (!hasImages) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? product.images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (!hasImages) return;
    const isLastSlide = currentIndex === product.images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const selectedImage = hasImages ? product.images[currentIndex] : '';


  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} x ${product.name} añadido(s) al carrito!`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
        {/* Image Gallery */}
        <div className="md:col-span-4">
          <div className="neomorphic-out p-2 mb-4 relative group">
            {hasImages ? (
              <>
                <img src={selectedImage} alt={product.name} className="w-full h-auto object-cover rounded-lg" style={{ aspectRatio: '1/1' }}/>
                 {product.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={goToPrevious} className="bg-white/50 hover:bg-white/80 p-2 rounded-full ml-4 neomorphic-button">
                      <IconChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button onClick={goToNext} className="bg-white/50 hover:bg-white/80 p-2 rounded-full mr-4 neomorphic-button">
                      <IconChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </div>
                )}
              </>
            ) : (
                <div className="w-full h-auto bg-gray-200 rounded-lg flex items-center justify-center" style={{ aspectRatio: '1/1' }}>
                    <span className="text-gray-500">Sin Imagen</span>
                </div>
            )}
          </div>
          {hasImages && product.images.length > 1 && (
            <div className="flex gap-2 justify-center">
                {product.images.slice(0, 5).map((img, index) => (
                <div key={index} className={`p-1 rounded-md cursor-pointer ${currentIndex === index ? 'neomorphic-in' : 'neomorphic-out'}`} onClick={() => setCurrentIndex(index)}>
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-20 h-20 object-cover rounded"/>
                </div>
                ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:col-span-1">
          <p className="text-md text-gray-800 mb-2">{product.category}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-arista mb-4">{product.name}</h1>
          <p className="text-4xl font-bold text-[#00E0FF] mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-800 leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <p className="font-semibold text-gray-800">Cantidad:</p>
            <div className="flex items-center neomorphic-out p-1 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 neomorphic-button rounded-md"><IconMinus className="w-5 h-5"/></button>
                <span className="px-6 font-bold text-lg text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2 neomorphic-button rounded-md"><IconPlus className="w-5 h-5"/></button>
            </div>
          </div>

          <button onClick={handleAddToCart} className="w-full bg-[#FF5DCD] hover:bg-[#D4AF37] text-gray-800 font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-300 neomorphic-out neomorphic-button">
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