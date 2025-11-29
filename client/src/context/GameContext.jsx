import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // ✅ NUEVO: Bandera para saber si el usuario necesita Setup obligatoriamente
    const [isNewPlayer, setIsNewPlayer] = useState(false);

    // Cargar usuario al iniciar
    useEffect(() => {
        checkAuth();
    }, []);

    // ✅ 1. VERIFICAR AUTENTICACIÓN
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const storedAuth = localStorage.getItem('isAuthenticated');

        if (token && storedAuth === 'true') {
            try {
                const profile = await apiRequest(API_ENDPOINTS.AUTH.PROFILE, 'GET');
                setUser(profile.user);
                setIsAuthenticated(true);
                await loadCurrentGame(); 
            } catch (error) {
                console.error('Error verificando sesión:', error);
                logoutUser();
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    // ✅ 2. CARGAR PARTIDA ACTUAL (Lógica "Nuevo vs Viejo")
    const loadCurrentGame = async () => {
        try {
            const response = await apiRequest(API_ENDPOINTS.GAMES.CURRENT, 'GET');
            
            if (response.success) {
                if (response.game && response.game.gameState) {
                    // CASO A: TIENE PARTIDA (Usuario Viejo)
                    setGameState(response.game.gameState);
                    setIsNewPlayer(false);
                } else {
                    // CASO B: NO TIENE PARTIDA (Usuario Nuevo o Reset)
                    // El backend devolvié 200 OK pero game: null
                    console.log("Usuario sin partida activa. Requiere Setup.");
                    setGameState(null);
                    setIsNewPlayer(true); 
                }
            } else {
                setGameState(null);
                setIsNewPlayer(true);
            }
        } catch (error) {
            console.error('Error cargando partida (Frontend):', error);
            setGameState(null); 
            // Si hay error de red, asumimos que no hay estado seguro, 
            // pero cuidado con bloquear si es solo caída de red. 
            // Por seguridad, null suele requerir setup o reintento.
        } finally {
            setIsLoading(false); 
        }
    };

    // ✅ 3. LOGIN
    const loginUser = async (credentials) => {
        try {
            const result = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials);
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('isAuthenticated', 'true');
                
                const profile = await apiRequest(API_ENDPOINTS.AUTH.PROFILE, 'GET');
                setUser(profile.user);
                setIsAuthenticated(true);
                
                // Cargar juego para determinar si va a Setup o Dashboard
                await loadCurrentGame(); 
            }
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    
    // ✅ 4. REGISTRO / LOGOUT
    const registerUser = async (userData) => {
        try {
            const result = await apiRequest(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData);
            return result;
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logoutUser = () => {
        setUser(null);
        setIsAuthenticated(false);
        setGameState(null);
        setIsNewPlayer(false); // Resetear bandera
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
    };

    // ✅ 5. CREAR NUEVA PARTIDA (Actualiza estado al instante)
    const createNewGame = async (gameData) => {
        try {
            const response = await apiRequest(API_ENDPOINTS.GAMES.NEW, 'POST', gameData);
            if (response.success) {
                setGameState(response.game.gameState);
                setIsNewPlayer(false); // 🔓 ¡DESBLOQUEA EL DASHBOARD!
                return { success: true, message: 'Partida creada exitosamente' };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error creando partida:', error);
            return { success: false, message: 'Error de conexión: ' + error.message };
        }
    };
    
    // ✅ 6. GUARDAR ESTADO
    const saveGameState = async (newState) => {
        if (newState) setGameState(newState);
        if (isAuthenticated && newState) {
            try { 
                await apiRequest(API_ENDPOINTS.GAMES.SAVE, 'POST', { gameState: newState }); 
            } catch (error) { 
                console.error('Error guardando partida en segundo plano:', error); 
            }
        }
    };

    // ✅ 7. ACCIONES DE JUEGO
    const processInvestment = async (investmentLevels) => {
        try {
            const response = await apiRequest('games/investment', 'POST', { investmentLevels });
            if (response.success) {
                setGameState(response.gameState);
                return { success: true, message: response.message, capitalRemaining: response.capitalRemaining };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const advanceWeek = async () => {
        try {
            const response = await apiRequest('games/advance', 'POST');
            if (response.success) {
                setGameState(response.gameState);
                return { success: true, message: response.message, week: response.week };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    
    const resetGame = async () => {
        if (isAuthenticated) {
            try { 
                await apiRequest(API_ENDPOINTS.GAMES.RESET, 'POST'); 
            } catch (error) { 
                console.error('Error reiniciando partida:', error); 
            }
        }
        setGameState(null);
        setIsNewPlayer(true); // 🔒 Bloquea de nuevo, manda a Setup
    };

    // ✅ 8. GETTERS AUXILIARES
    const getDashboardData = async () => {
        try {
            const response = await apiRequest('games/dashboard', 'GET');
            return response.success ? response.dashboardData : null;
        } catch (error) {
            console.error('Error obteniendo datos del dashboard:', error);
            return null;
        }
    };

    const getGameStatus = async () => {
        try {
            const response = await apiRequest('games/status', 'GET');
            return response.success ? response.status : null;
        } catch (error) {
            return null;
        }
    };

    const value = {
        user, isAuthenticated, gameState, isLoading, isNewPlayer, // Exportamos isNewPlayer
        loginUser, registerUser, logoutUser, 
        createNewGame, saveGameState, resetGame, processInvestment, advanceWeek,
        getDashboardData, getGameStatus
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    return useContext(GameContext);
};