import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORTS DE PÁGINAS ---
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import DecisionsPage from './pages/DecisionsPage'; 
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';

// --- IMPORTS DE COMPONENTES Y CONTEXTO ---
import Sidebar from './components/Sidebar';
import { GameProvider, useGame } from './context/GameContext'; 
import './index.css'; 

// ==========================================
// 1. COMPONENTE AUXILIAR: MANEJAR LOGOUT
// ==========================================
const LogoutHandler = () => {
  const { logoutUser } = useGame();
  
  useEffect(() => {
    logoutUser();
  }, [logoutUser]);
  
  return <Navigate to="/" replace />;
};

// ==========================================
// 2. LAYOUT PARA JUGADORES (CON SIDEBAR)
// ==========================================
const AuthenticatedLayout = ({ component: Component }) => {
  const { logoutUser } = useGame();
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* El Sidebar permite cerrar sesión */}
      <Sidebar onLogout={logoutUser} /> 
      <main className="flex-grow p-4 md:p-8 overflow-y-auto w-full">
        <Component /> 
      </main>
    </div>
  );
};

// ==========================================
// 3. PÁGINA 404 PERSONALIZADA (ESTILO OSCURO)
// ==========================================
const NotFoundPage = () => (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-indigo-500">404</h1>
            <p className="text-xl">Página no encontrada</p>
            <button 
                onClick={() => window.location.href = '/'}
                className="mt-8 px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-bold"
            >
                Volver al Juego
            </button>
        </div>
    </div>
);

// ==========================================
// 4. LÓGICA PRINCIPAL DE LA APP
// ==========================================
const AppContent = () => {
    // Traemos todo el estado global necesario
    const { isAuthenticated, isLoading, user, gameState, isNewPlayer } = useGame(); 

    // --- DEBUG: LOGS EN CONSOLA ---
    useEffect(() => {
        console.log('🔍 App State Update:', {
            isLoading,
            isAuthenticated,
            isNewPlayer,
            hasGameState: !!gameState,
            companyName: gameState?.nombreEmpresa,
            semanaActual: gameState?.semanaActual
        });
    }, [gameState, isLoading, isAuthenticated, isNewPlayer]);

    // --- SEGURIDAD: LIMPIEZA DE SESIÓN ROTA ---
    // Si dice que está autenticado pero no hay usuario cargado, forzamos limpieza.
    useEffect(() => {
        if (localStorage.getItem('isAuthenticated') === 'true' && !user && !isLoading) {
            console.log('🔄 Limpiando sesión inválida (Token expirado o error)...');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            // Opcional: window.location.reload();
        }
    }, [user, isLoading]);

    // --- PANTALLA DE CARGA ---
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white text-xl font-bold">
                Cargando Business Wars...
            </div>
        );
    }

    // ==========================================
    // 5. SISTEMA DE RUTAS (ROUTING)
    // ==========================================

    // CASO A: USUARIO NO AUTENTICADO (Visitante)
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                {/* Cualquier otra ruta redirige al inicio */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // CASO B: JUGADOR NUEVO (Sin partida creada)
    // isNewPlayer es true cuando el backend devuelve game: null
    if (isNewPlayer) {
        return (
            <Routes>
                {/* Solo tiene acceso al Setup y al Logout */}
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/logout" element={<LogoutHandler />} />
                
                {/* Cualquier intento de ir al dashboard lo devuelve al Setup */}
                <Route path="*" element={<Navigate to="/setup" replace />} />
            </Routes>
        );
    }

    // CASO C: JUGADOR VETERANO (Con partida activa)
    return (
        <Routes>
            {/* Rutas Principales del Juego (Con Sidebar) */}
            <Route path="/dashboard" element={<AuthenticatedLayout component={DashboardPage} />} />
            <Route path="/decisions" element={<AuthenticatedLayout component={DecisionsPage} />} />
            <Route path="/reports" element={<AuthenticatedLayout component={ReportsPage} />} />
            
            {/* Configuración (Permitimos volver al setup para reiniciar) */}
            <Route path="/setup" element={<AuthenticatedLayout component={SetupPage} />} />
            
            <Route path="/logout" element={<LogoutHandler />} />

            {/* 🔥 CORRECCIÓN CRÍTICA: SI ENTRA A /AUTH ESTANDO LOGUEADO */}
            {/* Esto arregla el error 404 del video al iniciar sesión */}
            <Route path="/auth" element={<Navigate to="/decisions" replace />} />

            {/* Redirección Inicial por defecto */}
            <Route path="/" element={<Navigate to="/decisions" replace />} />
            
            {/* Página 404 para rutas inexistentes */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

// ==========================================
// 6. EXPORTACIÓN FINAL
// ==========================================
export default function App() { 
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    ); 
}