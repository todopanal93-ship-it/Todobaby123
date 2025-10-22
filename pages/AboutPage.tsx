import React from 'react';
import { StoreSettings } from '../types';

type AboutPageProps = {
  settings: StoreSettings;
};

export const AboutPage: React.FC<AboutPageProps> = ({ settings }) => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FF5DCD] font-arista">Nuestra Historia</h1>
        <p className="mt-4 text-lg text-gray-800 max-w-3xl mx-auto">{settings.aboutUs}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="p-8 neomorphic-out">
          <h2 className="text-3xl font-bold text-[#00E0FF] font-arista mb-4">Misión</h2>
          <p className="text-gray-800">{settings.mission}</p>
        </div>
        <div className="p-8 neomorphic-out">
          <h2 className="text-3xl font-bold text-[#00E0FF] font-arista mb-4">Visión</h2>
          <p className="text-gray-800">{settings.vision}</p>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-bold text-center text-[#FF5DCD] font-arista mb-8">Nuestros Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {settings.values.map((value, index) => (
            <div key={index} className="p-6 neomorphic-out text-center">
              <h3 className="text-xl font-bold text-gray-800 font-arista mb-2">{value.title}</h3>
              <p className="text-gray-800 text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};