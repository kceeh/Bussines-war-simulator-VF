import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
    // ✅ PROTECCIÓN: Si no hay mensaje, no renderizamos nada (retornamos null).
    // Esto evita errores internos de React cuando el estado está vacío.
    if (!message) return null;

    const baseClasses = "fixed top-4 right-4 p-4 rounded-lg shadow-xl text-white font-semibold z-50 transition-transform duration-300 transform translate-x-0 animate-fade-in";
    let colorClasses = "";

    // Usamos tus estilos originales
    switch (type) {
        case 'success':
            colorClasses = "bg-green-600 border-l-4 border-green-800";
            break;
        case 'warning':
            colorClasses = "bg-yellow-600 border-l-4 border-yellow-800";
            break;
        case 'error':
            colorClasses = "bg-red-700 border-l-4 border-red-900";
            break;
        default:
            colorClasses = "bg-indigo-600 border-l-4 border-indigo-800";
    }

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 6000); // Mantenemos tus 6 segundos
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            <div className="flex items-center justify-between gap-4">
                <span>{message}</span>
                <button 
                    onClick={onClose} 
                    className="text-xl font-bold leading-none hover:text-gray-200 focus:outline-none"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Notification;