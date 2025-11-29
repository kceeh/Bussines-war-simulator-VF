import React from 'react'; 
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const difficultyOptions = {
    easy: {
        label: 'Fácil (Start-up Financiada)',
        capital: 2500000,
        marketShare: 5.0,
        maxWeeks: 52,
        winGoal: { capital: 6000000, marketShare: 20.0 },
        description: 'Empiezas con fuerte respaldo financiero y algo de tracción. Ideal para aprender.',
        color: 'border-green-500 bg-green-50 hover:bg-green-100'
    },
    medium: {
        label: 'Normal (El Desafío Estándar)',
        capital: 1000000,
        marketShare: 1.0,
        maxWeeks: 40,
        winGoal: { capital: 5000000, marketShare: 25.0 },
        description: 'Recursos limitados, competencia establecida. Equilibrio entre crecimiento y supervivencia.',
        color: 'border-blue-500 bg-blue-50 hover:bg-blue-100'
    },
    hard: {
        label: 'Difícil (Bootstrapping)',
        capital: 500000,
        marketShare: 0.1,
        maxWeeks: 30,
        winGoal: { capital: 8000000, marketShare: 30.0 },
        description: 'Sin margen de error. Empiezas casi desde cero. Solo para expertos.',
        color: 'border-red-500 bg-red-50 hover:bg-red-100'
    }
};

const SetupPage = () => {
    const { createNewGame, user, gameState, isNewPlayer } = useGame();
    const navigate = useNavigate();
    
    // Detectamos si es un reset (jugador antiguo) o inicio (jugador nuevo)
    const isGameActive = !isNewPlayer && gameState; 

    const username = user?.username || 'Emprendedor';
    const companyName = user?.companyName || 'Mi Nueva Empresa'; 

    const handleSelectDifficulty = async (difficultyKey) => {
        const option = difficultyOptions[difficultyKey];
        
        // Advertencia si va a borrar una partida existente
        if (isGameActive) {
            const confirm = window.confirm("⚠️ ¿Estás seguro? Esto borrará tu progreso actual y reiniciará la empresa.");
            if (!confirm) return;
        }

        try {
            const result = await createNewGame({
                difficultyKey: difficultyKey, 
                companyName: companyName,
                startingCapital: option.capital,
                initialMarketShare: option.marketShare,
                initialRevenue: 100000, 
                settings: { maxWeeks: option.maxWeeks, winGoal: option.winGoal }
            });
            
            if (result.success) {
                // ✅ CORRECCIÓN IMPORTANTE:
                // Sea usuario nuevo o reinicio, SIEMPRE vamos a /decisions para empezar a jugar.
                // Usamos { replace: true } para que no puedan volver atrás con el navegador.
                navigate('/decisions', { replace: true });
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error inesperado.');
        }
    };

    return (
        <div className="min-h-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-5xl w-full relative">
                
                {/* Botón Volver (Solo si ya existe partida) */}
                {isGameActive && (
                    <button 
                        onClick={() => navigate('/decisions')} 
                        className="absolute top-6 left-6 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center transition"
                    >
                        ⬅️ Volver
                    </button>
                )}

                <header className="text-center mb-10 mt-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                        {isGameActive ? 'Reiniciar Simulación' : 'Configuración Inicial'}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {isGameActive 
                            ? 'Selecciona una nueva dificultad para reiniciar tu empresa:' 
                            : `Bienvenido, ${username}. Configura tu primera empresa:`}
                    </p>
                    
                    <div className="mt-4 max-w-sm mx-auto">
                        <p className="w-full p-3 border-2 border-indigo-300 bg-indigo-50 rounded-lg text-center text-lg font-bold text-indigo-700">
                            {companyName}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(difficultyOptions).map(([key, option]) => (
                        <div key={key} className={`flex flex-col h-full border-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${option.color}`}>
                            <div className="p-6 flex-grow">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">{option.label}</h3>
                                <p className="text-gray-700 mb-6">{option.description}</p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>💰 Capital: <b>${option.capital.toLocaleString()}</b></li>
                                    <li>🌍 Cuota: <b>{option.marketShare}%</b></li>
                                    <li>⏳ Tiempo: <b>{option.maxWeeks} Semanas</b></li>
                                </ul>
                            </div>
                            <div className="p-6 pt-0 mt-auto">
                                <button 
                                    onClick={() => handleSelectDifficulty(key)} 
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
                                >
                                    {isGameActive ? 'Reiniciar Partida' : 'Comenzar Juego'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SetupPage;