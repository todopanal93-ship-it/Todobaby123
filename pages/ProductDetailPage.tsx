import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Product } from '../types';
import { IconPlus, IconMinus, IconChevronLeft, IconChevronRight, IconShare, IconX, IconCopy, IconQrCode, IconDownload } from '../components/Icons';

type ProductDetailPageProps = {
  products: Product[];
  addToCart: (product: Product, quantity: number) => void;
};

const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}> = ({ isOpen, onClose, product }) => {
  const productUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`;
  const [copyText, setCopyText] = useState('Copiar');
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopyText('¡Copiado!');
      setTimeout(() => setCopyText('Copiar'), 2000);
    });
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `qr-producto-${product.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('No se pudo descargar el código QR.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="glassmorphic rounded-2xl p-6 w-full max-w-sm relative text-gray-800" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-800 hover:text-gray-900">
          <IconX className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center text-[#FF5DCD] mb-4 font-arista">Compartir Producto</h2>
        
        <div className="flex justify-center mb-4 p-1 rounded-full bg-black/10">
            <button onClick={() => setActiveTab('link')} className={`px-4 py-2 text-sm font-semibold rounded-full flex-1 transition-all ${activeTab === 'link' ? 'bg-white/50 shadow' : 'hover:bg-white/20'}`}>Enlace</button>
            <button onClick={() => setActiveTab('qr')} className={`px-4 py-2 text-sm font-semibold rounded-full flex-1 transition-all ${activeTab === 'qr' ? 'bg-white/50 shadow' : 'hover:bg-white/20'}`}>Código QR</button>
        </div>

        {activeTab === 'link' && (
          <div className="space-y-3">
            <p className="text-sm text-center">Copia y comparte el enlace a este producto.</p>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={productUrl} className="w-full p-3 bg-white/20 rounded-lg focus:outline-none text-sm truncate border border-transparent focus:border-white/50 focus:bg-white/30" />
              <button onClick={copyToClipboard} className="px-4 py-3 bg-[#00E0FF] text-gray-800 rounded-lg hover:bg-[#9AD5FA] transition-colors text-sm font-semibold min-w-[80px] flex items-center justify-center gap-2">
                <IconCopy className="w-5 h-5"/>
                {copyText}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-4 flex flex-col items-center">
            <p className="text-sm text-center">Escanea el código para ver el producto en otro dispositivo.</p>
            <div className="p-4 bg-white rounded-lg shadow-inner">
                <img src={qrCodeUrl} alt={`QR Code for ${product.name}`} className="w-48 h-48 rounded-md" />
            </div>
            <button onClick={downloadQrCode} className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                <IconDownload className="w-5 h-5"/>
                Descargar QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ products, addToCart }) => {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === Number(productId));

  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <div className="md:col-span-1">
            <div className="mb-4 relative group">
              {hasImages ? (
                <>
                  <div className="w-full rounded-lg">
                    <img src={selectedImage} alt={product.name} className="w-full h-auto object-contain rounded-lg"/>
                  </div>
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
                  <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Sin Imagen</span>
                  </div>
              )}
            </div>
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                  {product.images.slice(0, 5).map((img, index) => (
                  <div key={index} className={`rounded-lg cursor-pointer transition-all ${currentIndex === index ? 'ring-2 ring-offset-2 ring-[#00E0FF]' : 'opacity-70 hover:opacity-100'}`} onClick={() => setCurrentIndex(index)}>
                      <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-20 h-20 object-contain rounded-md"/>
                  </div>
                  ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:col-span-1">
            <p className="text-md text-gray-800 mb-2">{product.category}</p>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-arista">{product.name}</h1>
              <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-full neomorphic-out neomorphic-button flex-shrink-0" aria-label="Compartir producto">
                <IconShare className="w-6 h-6 text-gray-700"/>
              </button>
            </div>
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
                <h2 className="text-2xl font-bold text-center text-[#FF5DCD] font-arista mb-6">También te podría interesar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {relatedProducts.map(related => (
                      <div key={related.id} className="neomorphic-out group flex flex-col h-full bg-white/50 text-center">
                          <Link to={`/product/${related.id}`} className="block flex flex-col h-full p-2">
                              <div className="flex-shrink-0">
                                <img src={related.images[0]} alt={related.name} className="w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="pt-3 flex-grow flex flex-col justify-between">
                                 <h3 className="font-bold text-sm text-gray-800 font-arista leading-tight">{related.name}</h3>
                                 <p className="text-base font-semibold text-[#00E0FF] mt-2">${related.price.toFixed(2)}</p>
                              </div>
                          </Link>
                      </div>
                    ))}
                </div>
            </div>
        )}
      </div>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} product={product} />
    </>
  );
};