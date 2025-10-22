import React from 'react';
import { NavLink } from 'react-router-dom';
import { Product } from '../../types';

type AdminDashboardPageProps = {
  products: Product[];
};

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="p-6 neomorphic-out text-center">
        <p className="text-4xl font-bold" style={{ color }}>{value}</p>
        <h3 className="text-lg text-gray-600 mt-2 font-semibold">{title}</h3>
    </div>
);

const NavCard: React.FC<{ to: string; title: string; description: string }> = ({ to, title, description }) => (
    <NavLink to={to} className="block p-6 neomorphic-out hover:shadow-inner transition-shadow duration-200">
        <h3 className="text-xl font-bold text-[#FF5DCD] font-arista">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </NavLink>
);


export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ products }) => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'Active').length;
    const inactiveProducts = totalProducts - activeProducts;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Productos Totales" value={totalProducts} color="#00E0FF" />
                <StatCard title="Productos Activos" value={activeProducts} color="#4ade80" />
                <StatCard title="Productos Inactivos" value={inactiveProducts} color="#f87171" />
            </div>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">Accesos Rápidos</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NavCard 
                    to="/admin/products"
                    title="Gestionar Productos"
                    description="Añade, edita o elimina productos de tu catálogo."
                />
                <NavCard 
                    to="/admin/settings"
                    title="Configuración de Tienda"
                    description="Actualiza la información de contacto, redes sociales y más."
                />
            </div>
        </div>
    );
};