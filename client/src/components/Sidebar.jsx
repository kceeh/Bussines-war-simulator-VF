import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { useGame } from '../context/GameContext'; 

const Sidebar = ({ onLogout }) => { 
    const location = useLocation();
    const { user, gameState } = useGame(); 

    // ✅ LECTURA DE DATOS (Prioridad: GameState > User > Fallback)
    const username = user?.username || 'Invitado';
    const companyName = gameState?.nombreEmpresa || user?.companyName || 'Sin Empresa';
    const currentWeek = gameState?.semanaActual || 1;

    // Función para determinar si el link está activo (Estilo visual)
    const isActive = (path) => location.pathname === path 
        ? 'bg-indigo-600 text-white font-bold shadow-md' 
        : 'text-gray-300 hover:bg-gray-700 hover:text-white';

    // Lista de navegación dinámica
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📈' },
        { name: 'Decisiones', path: '/decisions', icon: '🎯' }, // Nombre acortado para mejor ajuste
        { name: 'Reportes', path: '/reports', icon: '📄' },
    ];

    // Solo mostramos "Configuración" si NO hay una partida en curso (para evitar el rebote)
    // O si prefieres dejarlo siempre, el Link evitará la recarga, pero App.jsx podría redirigirte.
    const showSetup = true; 

    return (
        <aside className="flex flex-col w-64 bg-gray-900 text-gray-100 min-h-screen shadow-2xl z-50">
            {/* ENCABEZADO */}
            <div className="p-6 border-b border-gray-800">
                <div className="text-2xl font-extrabold text-teal-400 tracking-wider">
                    Business Wars
                </div>
                <p className="text-xs text-gray-500 mt-1 uppercase">Simulador Empresarial</p>
            </div>
            
            {/* INFO DEL JUGADOR */}
            <div className="px-4 py-6">
                <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 shadow-inner">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Jugador</p>
                    <p className="font-bold text-white truncate text-lg" title={username}>{username}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-teal-400 mb-1">Empresa (Semana {currentWeek})</p>
                        <p className="font-semibold text-gray-200 truncate" title={companyName}>{companyName}</p>
                    </div>
                </div>
            </div>
            
            {/* NAVEGACIÓN */}
            <nav className="flex-grow px-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)}`}
                    >
                        <span className="mr-3 text-xl">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}

                {/* Link de Configuración separado */}
                {showSetup && (
                    <Link
                        to="/setup"
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/setup')}`}
                    >
                        <span className="mr-3 text-xl">⚙️</span>
                        <span className="font-medium">Configuración</span>
                    </Link>
                )}
            </nav>

            {/* BOTÓN CERRAR SESIÓN */}
            <div className="p-4 border-t border-gray-800">
                <button 
                    onClick={onLogout} 
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg"
                >
                    <span>🚪</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;