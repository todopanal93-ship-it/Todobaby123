
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Product, CartItem, StoreSettings, ClientUIProps } from '../types';
import { CATEGORIES } from '../constants';
import { generateChatbotResponse } from '../services/geminiService';
import { IconCart, IconPlus, IconMinus, IconTrash, IconChevronDown, IconX, IconChatBubble, IconSend } from './Icons';

const Header: React.FC<{ settings: StoreSettings }> = ({ settings }) => (
  <header className="p-4 glassmorphic sticky top-0 z-20">
    <div className="container mx-auto flex justify-between items-center">
      <NavLink to="/">
        <img src={settings.logoUrl} alt={`${settings.storeName} Logo`} className="h-12 w-auto object-contain" />
      </NavLink>
      <nav className="hidden md:flex gap-6 items-center">
        <NavLink to="/" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-700'}`}>Inicio</NavLink>
        <NavLink to="/about" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-700'}`}>Quiénes Somos</NavLink>
        <NavLink to="/contact" className={({isActive}) => `font-semibold transition-colors hover:text-[#FF5DCD] ${isActive ? 'text-[#FF5DCD]' : 'text-gray-700'}`}>Contáctanos</NavLink>
      </nav>
    </div>
  </header>
);

const Footer: React.FC<{ settings: StoreSettings }> = ({ settings }) => (
    <footer className="bg-transparent text-gray-700 p-6 mt-8">
      <div className="container mx-auto text-center">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
                <p className="font-bold text-lg mb-2 font-arista">{settings.storeName}</p>
                <p className="text-sm">{settings.address}</p>
                 <div className="flex justify-center md:justify-start gap-4 my-4">
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">Instagram</a>
                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">Facebook</a>
                    <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5DCD] transition-colors">TikTok</a>
                </div>
            </div>
            <div className="text-center">
                <h3 className="font-bold font-arista mb-2">Horarios de Atención</h3>
                <ul className="text-sm">
                    <li>Lunes - Sábado: 7:30 AM – 7:30 PM</li>
                    <li>Domingo: 8:30 AM – 7:30 PM</li>
                </ul>
            </div>
             <div className="text-center md:text-right">
                <h3 className="font-bold font-arista mb-2">Navegación</h3>
                <ul className="text-sm">
                    <li><NavLink to="/" className="hover:text-[#FF5DCD]">Inicio</NavLink></li>
                    <li><NavLink to="/about" className="hover:text-[#FF5DCD]">Quiénes Somos</NavLink></li>
                    <li><NavLink to="/contact" className="hover:text-[#FF5DCD]">Contáctanos</NavLink></li>
                </ul>
            </div>
        </div>
        <div className="text-xs mt-8 pt-4 border-t border-gray-300 flex justify-center items-center">
            <NavLink to="/admin" className="hover:text-[#FF5DCD] transition-colors" title="Acceso de Administrador">
                <span>&copy; {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.</span>
            </NavLink>
        </div>
      </div>
    </footer>
);

const Chatbot: React.FC<{ products: Product[], settings: StoreSettings }> = ({ products, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; parts: { text: string }[] }[]>([
    { role: 'model', parts: [{ text: `¡Hola! Soy Laudith, tu asistente de ${settings.storeName}. ¿Cómo puedo ayudarte a prepararte para la llegada de tu bebé?` }] }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    const newMessages = [...messages, { role: 'user', parts: [{ text: trimmedInput }] }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const botResponseText = await generateChatbotResponse(messages, trimmedInput, products);
    
    setMessages([...newMessages, { role: 'model', parts: [{ text: botResponseText }] }]);
    setIsLoading(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30">
        <button onClick={() => setIsOpen(!isOpen)} className="bg-gradient-to-br from-[#00E0FF] to-[#9AD5FA] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2">
          <IconChatBubble className="w-8 h-8" />
        </button>
      </div>
      
      <div className={`fixed bottom-24 left-6 z-40 w-[calc(100%-3rem)] max-w-sm h-[60vh] glassmorphic rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="p-4 bg-white/30 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800 font-arista">Asistente TODO BABY</h3>
            <button onClick={() => setIsOpen(false)}><IconX className="w-6 h-6"/></button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#9AD5FA] text-white' : 'bg-white/80 text-gray-800'}`}>
                        {msg.parts[0].text}
                    </div>
                </div>
            ))}
            {isLoading && <div className="flex justify-start mb-3"><div className="bg-gray-200 p-3 rounded-2xl">...</div></div>}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 flex gap-2">
            <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Pregúntame algo..."
                className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"
            />
            <button type="submit" className="bg-[#00E0FF] text-white p-3 rounded-lg neomorphic-out neomorphic-button" disabled={isLoading}>
                <IconSend className="w-6 h-6"/>
            </button>
        </form>
      </div>
    </>
  );
};


const ProductCard: React.FC<{ product: Product; onAddToCart: () => void; }> = ({ product, onAddToCart }) => (
    <div className="neomorphic-out group flex flex-col h-full bg-white/50">
        <Link to={`/product/${product.id}`} className="block">
            <img className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" src={product.images[0]} alt={product.name} />
            <div className="p-4 flex-grow">
                <p className="text-sm text-gray-500">{product.category}</p>
                <h3 className="font-bold text-lg text-gray-800 font-arista">{product.name}</h3>
            </div>
        </Link>
        <div className="p-4 mt-auto">
            <div className="flex justify-between items-center">
                <p className="text-xl font-semibold text-[#00E0FF]">${product.price.toFixed(2)}</p>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToCart();
                    }}
                    className="bg-[#FF5DCD] hover:bg-[#D4AF37] text-white font-bold p-2 rounded-full transition-colors duration-300 transform hover:scale-110 z-10 relative">
                    <IconPlus className="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
);

const Filters: React.FC<{ selectedCategory: string | null; onSelectCategory: (category: string | null) => void; }> = ({ selectedCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4 rounded-lg neomorphic-out">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-bold text-lg text-[#FF5DCD] mb-2">
        Categorías <IconChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full text-left px-2 py-1 rounded-md transition-colors ${!selectedCategory ? 'bg-[#9AD5FA] text-white' : 'hover:bg-gray-100/50'}`}
            >
              Todas
            </button>
          </li>
          {CATEGORIES.map(category => (
            <li key={category}>
              <button
                onClick={() => onSelectCategory(category)}
                className={`w-full text-left px-2 py-1 rounded-md transition-colors ${selectedCategory === category ? 'bg-[#9AD5FA] text-white' : 'hover:bg-gray-100/50'}`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const OrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  clearCart: () => void;
}> = ({ isOpen, onClose, cart, settings, clearCart }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    let message = `¡Hola ${settings.storeName}! 👋\n\nMi nombre es ${name} y me gustaría hacer el siguiente pedido:\n\n`;
    cart.forEach(item => {
      message += `*${item.name}* (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total Estimado:* $${total.toFixed(2)}\n`;
    message += `\n*Dirección de entrega:*\n${address}\n\n¡Muchas gracias!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber.replace(/\+/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="glassmorphic rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          <IconX className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center text-[#FF5DCD] mb-4 font-arista">Finalizar Pedido</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Nombre Completo</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>
          <div className="mb-6">
            <label htmlFor="address" className="block text-gray-700 font-semibold mb-1">Dirección de Entrega</label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full p-3 bg-transparent rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"/>
          </div>
          <button type="submit" className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 neomorphic-out neomorphic-button">
            Enviar Pedido por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

const FloatingCart: React.FC<ClientUIProps> = (props) => {
  const { cart, removeFromCart, updateQuantity } = props;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-gradient-to-br from-[#FF5DCD] to-[#FFA6E3] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2">
          <IconCart className="w-8 h-8" />
          {cartCount > 0 && <span className="bg-white text-[#FF5DCD] rounded-full px-2 py-0.5 text-sm font-bold">{cartCount}</span>}
        </button>
      </div>

      <div className={`fixed top-0 right-0 h-full w-full md:w-96 glassmorphic shadow-2xl z-40 transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#FF5DCD] font-arista">Tu Carrito</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-gray-900"><IconX className="w-7 h-7" /></button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-center text-gray-600 flex-grow flex items-center justify-center">Tu carrito está vacío.</p>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 mb-4 bg-white/40 p-2 rounded-lg">
                  <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-[#00E0FF] font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50"><IconMinus className="w-4 h-4"/></button>
                      <span className="px-3 font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200/50 hover:bg-gray-300/50"><IconPlus className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><IconTrash className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/30 pt-4 mt-auto">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                setIsOrderModalOpen(true);
              }}
              disabled={cart.length === 0}
              className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed neomorphic-out neomorphic-button"
            >
              Proceder al Pedido
            </button>
          </div>
        </div>
      </div>
      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} cart={props.cart} settings={props.settings} clearCart={props.clearCart}/>
    </>
  );
};


export const ClientLayout: React.FC<ClientUIProps> = (props) => (
    <div className="flex flex-col min-h-screen bg-transparent">
        <Header settings={props.settings} />
        <main className="flex-grow">
            <Outlet />
        </main>
        <Footer settings={props.settings} />
        <Chatbot products={props.products} settings={props.settings} />
        <FloatingCart {...props} />
    </div>
);


export const HomePage: React.FC<Omit<ClientUIProps, 'cart' | 'removeFromCart' | 'updateQuantity' | 'clearCart'>> = (props) => {
  const { products, settings, addToCart } = props;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="md:col-span-1 md:sticky md:top-24">
        <Filters selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </aside>
      <div className="md:col-span-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, 1)} />
          ))}
        </div>
      </div>
    </div>
  );
};