import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../../types';


type AdminSettingsPageProps = {
    settings: StoreSettings,
    setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>
};

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ settings, setSettings }) => {
    const [formData, setFormData] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Update state, which useStickyState will persist to localStorage
        setSettings(formData);
        
        // Simulate async operation for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        alert('¡Configuración guardada!');
        
        setIsSaving(false);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Configuración de la Tienda</h1>
            <form onSubmit={handleSave} className="p-6 neomorphic-out space-y-4">
                {Object.entries(formData).map(([key, value]) => {
                    if (key === 'id' || key === 'values') return null; // Hide non-editable fields
                    const isTextArea = key === 'aboutUs' || key === 'mission' || key === 'vision';
                    return (
                        <div key={key}>
                            <label className="block font-semibold capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {isTextArea ? (
                                <textarea
                                    name={key}
                                    value={value as string}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 rounded-md neomorphic-in bg-transparent focus:outline-none focus:ring-2 focus:ring-[#9AD5FA] h-24"
                                />
                            ) : (
                                <input
                                    type="text"
                                    name={key}
                                    value={value as string}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 rounded-md neomorphic-in bg-transparent focus:outline-none focus:ring-2 focus:ring-[#9AD5FA]"
                                />
                            )}
                        </div>
                    )
                })}
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[#00E0FF] text-gray-800 font-bold rounded-lg hover:bg-[#9AD5FA] neomorphic-out neomorphic-button disabled:bg-gray-400">
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </form>
        </div>
    );
};