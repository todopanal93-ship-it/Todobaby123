import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { IconMenu, IconX } from './Icons';

// --- Login Page ---
export const AdminLoginPage: React.FC<{ login: (email: string, password: string) => Promise<boolean>; }> = ({ login }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Credenciales incorrectas o error de red.');
    }
    // If successful, the App component will handle navigation.
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="p-8 rounded-2xl w-full max-w-sm neomorphic-out">
        <h1 className="text-3xl font-bold text-center text-[#FF5DCD] mb-6 font-arista">Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
             <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo Electrónico"
              required
              autoComplete="email"
              className="w-full p-3 rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] bg-transparent"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              autoComplete="current-password"
              className="w-full p-3 rounded-lg neomorphic-in focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] bg-transparent"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-gray-800 font-bold py-3 rounded-lg transition-colors neomorphic-out neomorphic-button disabled:bg-gray-400">
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Admin Layout ---
export const AdminLayout: React.FC<{ logout: () => Promise<void>; children: React.ReactNode; }> = ({ logout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `w-full text-left p-3 rounded-lg transition-colors font-semibold ${isActive ? 'bg-[#9AD5FA]/50 text-[#00E0FF]' : 'hover:bg-[#9AD5FA]/50'}`;

  const sidebarContent = (
    <>
      <div className="flex justify-between items-center mb-4 md:justify-center">
        <h2 className="text-2xl font-bold text-[#FF5DCD] font-arista text-center">TODO BABY</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <IconX className="w-6 h-6 text-gray-800"/>
        </button>
      </div>
      <nav className="flex-grow">
        <ul>
          <li className="mb-2">
            <NavLink to="/admin/dashboard" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
              Dashboard
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/admin/products" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
              Products
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/admin/settings" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
      <button onClick={logout} className="w-full p-3 rounded-lg bg-red-500 text-gray-200 font-bold hover:bg-red-600 transition-colors neomorphic-out neomorphic-button">
        Cerrar Sesión
      </button>
    </>
  );

  return (
    <div className="relative min-h-screen bg-transparent md:flex">
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full p-4
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="w-64 h-full p-4 neomorphic-out flex flex-col rounded-2xl bg-[#e6e9ef] text-gray-800">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 p-4 flex items-center justify-between bg-[#e6e9ef]/80 backdrop-blur-sm md:hidden">
          <button onClick={() => setIsSidebarOpen(true)}>
            <IconMenu className="w-6 h-6 text-gray-800" />
          </button>
           <h1 className="text-xl font-bold text-[#FF5DCD] font-arista">Admin Panel</h1>
           <div className="w-6" /> {/* Spacer to balance the title */}
        </header>
        
        <main className="flex-1 p-4 md:p-8 text-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};