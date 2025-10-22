import React from 'react';
import { StoreSettings } from '../types';

type ContactPageProps = {
  settings: StoreSettings;
};

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.API_KEY}&q=${encodeURIComponent(settings.address)}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FF5DCD] font-arista">Ponte en Contacto</h1>
        <p className="mt-4 text-lg text-gray-800">¡Estamos aquí para ayudarte! Visítanos o contáctanos.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="p-8 neomorphic-out">
          <h2 className="text-2xl font-bold font-arista mb-4 text-gray-800">Nuestra Tienda</h2>
          <p className="text-gray-800 mb-2"><strong>Dirección:</strong> {settings.address}</p>
          <p className="text-gray-800 mb-4"><strong>WhatsApp:</strong> <a href={`https://wa.me/${settings.whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#00E0FF] hover:underline">{settings.whatsappNumber}</a></p>
          
          <h3 className="text-xl font-bold font-arista mt-6 mb-2 text-gray-800">Horarios de Atención</h3>
          <ul className="text-gray-800">
            <li>Lunes - Sábado: 7:30 AM – 7:30 PM</li>
            <li>Domingo: 8:30 AM – 7:30 PM</li>
          </ul>
          
          <h3 className="text-xl font-bold font-arista mt-6 mb-2 text-gray-800">Síguenos</h3>
          <div className="flex gap-4">
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-[#00E0FF] hover:underline">Instagram</a>
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-[#00E0FF] hover:underline">Facebook</a>
              <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#00E0FF] hover:underline">TikTok</a>
          </div>
        </div>
        
        <div className="neomorphic-out p-2">
            <iframe
                title="Google Maps Location"
                src={mapUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
            ></iframe>
        </div>
      </div>
    </div>
  );
};