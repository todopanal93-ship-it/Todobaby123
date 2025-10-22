import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

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
          
          <button type="submit" disabled={isLoading} className="w-full bg-[#00E0FF] hover:bg-[#9AD5FA] text-white font-bold py-3 rounded-lg transition-colors neomorphic-out neomorphic-button disabled:bg-gray-400">
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Admin Layout ---
const AdminSidebar: React.FC<{ logout: () => Promise<void>; }> = ({ logout }) => {
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `w-full text-left p-3 rounded-lg transition-colors font-semibold ${isActive ? 'bg-[#9AD5FA]/50 text-[#00E0FF]' : 'hover:bg-[#9AD5FA]/50'}`;

    return (
        <aside className="w-64 p-4 neomorphic-out flex flex-col m-4 rounded-2xl">
            <h2 className="text-2xl font-bold text-[#FF5DCD] mb-8 font-arista text-center">TODO BABY</h2>
            <nav className="flex-grow">
            <ul>
                <li className="mb-2">
                    <NavLink to="/admin/dashboard" className={navLinkClasses}>
                        Dashboard
                    </NavLink>
                </li>
                 <li className="mb-2">
                    <NavLink to="/admin/products" className={navLinkClasses}>
                        Products
                    </NavLink>
                </li>
                 <li className="mb-2">
                    <NavLink to="/admin/settings" className={navLinkClasses}>
                        Settings
                    </NavLink>
                </li>
            </ul>
            </nav>
            <button onClick={logout} className="w-full p-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors neomorphic-out neomorphic-button">
            Cerrar Sesión
            </button>
        </aside>
    );
}

export const AdminLayout: React.FC<{ logout: () => Promise<void>; children: React.ReactNode; }> = ({ logout, children }) => {
  return (
    <div className="flex h-screen bg-transparent">
      <AdminSidebar logout={logout} />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};