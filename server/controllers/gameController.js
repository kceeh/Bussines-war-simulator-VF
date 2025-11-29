const Game = require('../models/Game');

// ==========================================
// 1. CONSTANTES Y CONFIGURACIÓN
// ==========================================
const BASE_EMPLOYEE_COST = 5000;

// ✅ CORRECCIÓN FINANCIERA: 
// 70% es el MARGEN DE BENEFICIO (lo que ingresa a caja). 
// El 30% restante se considera Costo de Ventas/Retención.
const REVENUE_SHARE = 0.70; 

// ✅ LISTA DE COSTOS ACTUALIZADA (10 Opciones para coincidir con el Frontend)
const COSTS = { 
    id_product: 150000, 
    marketing_online: 100000,
    staff_sales: 50000,
    id_tech: 200000,
    eff_process: 30000,
    marketing_tv: 80000,
    eff_training: 120000,
    staff_support: 180000,
    ad_segment: 90000,
    infra_maintenance: 70000
};

// ==========================================
// 2. LÓGICA DE RIVALES (SETUP)
// ==========================================
const createInitialRivals = (difficulty, baseCapital, baseMarketShare) => {
    // Aseguramos igualdad de condiciones al inicio (Fair Start).
    // La dificultad afectará la INTELIGENCIA de la IA semana a semana, no su dinero inicial.
    const exactCapital = Math.round(baseCapital);
    const exactMarketShare = baseMarketShare;
    
    return [
        { 
            name: "Corporación Rival A", 
            capital: exactCapital, 
            cuotaMercado: exactMarketShare, 
            lastInvestment: "Inicio", 
            strength: "Alta", 
            lastActionEffect: "Estable" 
        },
        { 
            name: "Tech Competitors Inc", 
            capital: exactCapital, 
            cuotaMercado: exactMarketShare,
            lastInvestment: "Inicio", 
            strength: "Media", 
            lastActionEffect: "Estable" 
        },
        { 
            name: "Global Enterprises", 
            capital: exactCapital, 
            cuotaMercado: exactMarketShare,
            lastInvestment: "Inicio", 
            strength: "Muy Alta", 
            lastActionEffect: "Estable" 
        }
    ];
};

// ==========================================
// 3. CONTROLADORES (ENDPOINTS)
// ==========================================

// --- CREAR NUEVA PARTIDA ---
const createNewGame = async (req, res) => {
    try {
        const { companyName, difficulty, startingCapital, initialMarketShare, settings } = req.body;
        const userId = req.user.id;

        // Limpieza previa para evitar conflictos
        await Game.deleteMany({ userId });

        // Generación de rivales sincronizados
        const rivalsData = createInitialRivals(difficulty, startingCapital, initialMarketShare);
        
        const newGame = new Game({
            userId,
            gameState: {
                nombreEmpresa: companyName,
                semanaActual: 1,
                
                // Datos Iniciales Jugador
                capital: Math.round(startingCapital), // ✅ Capital FINAL de la semana 1
                capitalInicial: Math.round(startingCapital), // ✅ Capital INICIAL de la semana 1 (mismo que final al inicio)
                ingresos: 100000, // Ingreso base inicial para arrancar
                cuotaMercado: initialMarketShare,
                satisfaccion: 50,
                
                // Niveles Iniciales
                empleados: 5,
                nivelMarketing: 0,
                nivelID: 0,
                nivelEficiencia: 0,
                lastDecisions: [],
                
                // ✅ FIX: Inicializamos la variable crítica para el Dashboard
                lastInvestmentCost: 0, 
                
                // Datos Rivales
                rivalsData: rivalsData, 
                
                // Historial para Gráficos
                revenueChartData: { labels: ['S1'], datasets: [{ label: 'Ingresos', data: [100000], borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }] },
                marketShareChartData: { labels: ['S1'], datasets: [{ label: 'Cuota', data: [initialMarketShare], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' }] },
                volatilityChartData: { labels: ['S1'], datasets: [{ label: 'Volatilidad', data: [0], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' }] },
                
                isGameOver: false,
                winCondition: 'none',
                
                settings: {
                    difficulty: difficulty || 'normal',
                    maxWeeks: settings?.maxWeeks || 52,
                    winGoal: settings?.winGoal || { capital: 5000000, marketShare: 50 }
                }
            }
        });

        await newGame.save();
        res.status(201).json({ success: true, game: newGame });
    } catch (error) {
        console.error("Error creando partida:", error);
        res.status(500).json({ success: false, message: 'Error al crear el juego' });
    }
};

// --- OBTENER PARTIDA ACTUAL ---
const getCurrentGame = async (req, res) => {
    try {
        const game = await Game.findOne({ userId: req.user.id });
        if (!game) {
            return res.status(200).json({ success: true, game: null, message: 'No hay partida activa.' });
        }
        res.json({ success: true, game });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo partida' });
    }
};

// --- GUARDAR ESTADO MANUALMENTE ---
const saveGameState = async (req, res) => {
    try {
        const { gameState } = req.body;
        await Game.findOneAndUpdate({ userId: req.user.id }, { gameState }, { new: true });
        res.json({ success: true, message: 'Partida guardada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error guardando partida' });
    }
};

// --- PROCESAR INVERSIONES DEL JUGADOR ---
const processInvestment = async (req, res) => {
    try {
        const { investmentLevels } = req.body;
        const game = await Game.findOne({ userId: req.user.id });
        if (!game) return res.status(404).json({ success: false });

        let kpis = game.gameState;
        let totalCost = 0;
        let decisionsList = [];

        // Calcular costos basados en niveles seleccionados
        for (const [key, level] of Object.entries(investmentLevels)) {
            if (COSTS[key] && level > 0) {
                totalCost += COSTS[key] * level;
                decisionsList.push(`${key.replace('_', ' ')} (x${level})`);
                
                // Aplicar mejoras inmediatas a los niveles
                if (key.includes('marketing') || key.includes('ad') || key.includes('image')) kpis.nivelMarketing += level;
                if (key.includes('id') || key.includes('process') || key.includes('tech')) kpis.nivelID += level;
                if (key.includes('eff') || key.includes('cost') || key.includes('hiring')) kpis.nivelEficiencia += level;
                if (key.includes('staff') || key.includes('hr') || key.includes('infra')) kpis.satisfaccion += (level * 1.5); 
            }
        }

        // Validación de fondos
        if (totalCost > kpis.capital) {
            return res.json({ success: false, message: 'Capital insuficiente.' });
        }

        // ✅ CORRECCIÓN: Aplicar gasto de inversiones al capital actual
        kpis.capital -= totalCost;
        kpis.capital = Math.round(kpis.capital); // Redondear para evitar decimales locos
        
        kpis.lastDecisions = decisionsList; 
        
        // ✅ GUARDAR EL COSTO PARA EL DASHBOARD
        kpis.lastInvestmentCost = totalCost;

        game.markModified('gameState');
        await game.save();

        res.json({ 
            success: true, 
            message: 'Inversiones aplicadas.', 
            gameState: kpis, 
            capitalRemaining: kpis.capital,
            investmentCost: totalCost // ✅ Enviar costo al frontend
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error procesando inversión' });
    }
};

// --- AVANZAR SEMANA (LÓGICA PRINCIPAL MODIFICADA) ---
const advanceWeek = async (req, res) => {
    try {
        const game = await Game.findOne({ userId: req.user.id });
        if (!game) return res.status(404).json({ success: false });

        let kpis = game.gameState;
        
        // ✅ CORRECCIÓN CRÍTICA: El capital INICIAL de la nueva semana debe ser el capital FINAL actual
        // (después de las inversiones realizadas en DecisionsPage)
        const capitalInicialNuevaSemana = kpis.capital; 
        
        kpis.semanaActual += 1;
        kpis.capitalInicial = capitalInicialNuevaSemana; // ✅ ESTABLECER CAPITAL INICIAL
        
        // Ajustes de Dificultad y Tiempo
        const difficulty = kpis.settings.difficulty || 'normal';
        const maxWeeks = kpis.settings.maxWeeks || 52;

        // Factor de volatilidad del mercado (Random pequeño)
        const volatility = (Math.random() * 0.10) - 0.05; 
        
        // ==========================
        // 1. CÁLCULOS DEL JUGADOR
        // ==========================
        const growthFactor = 1 + (0.02) + (kpis.nivelMarketing * 0.015) + (kpis.nivelID * 0.005) + volatility;
        const satPenalty = kpis.satisfaccion < 40 ? 0.9 : 1;
        
        kpis.ingresos = Math.round(kpis.ingresos * growthFactor * satPenalty);
        
        // Crecimiento de Cuota (Más difícil en dificultad alta)
        let marketGrowthBase = (kpis.nivelMarketing * 0.05) + (kpis.nivelID * 0.05);
        if (difficulty === 'hard') marketGrowthBase *= 0.8; 
        
        const marketGrowth = marketGrowthBase + (volatility * 2);
        kpis.cuotaMercado = Math.max(0.1, Math.min(60, kpis.cuotaMercado + marketGrowth));
        kpis.satisfaccion = Math.round(Math.max(10, Math.min(100, kpis.satisfaccion - 2)));

        // Finanzas Jugador
        const efficiencyDiscount = Math.min(0.4, kpis.nivelEficiencia * 0.02);
        const fixedCosts = (kpis.empleados * BASE_EMPLOYEE_COST) * (1 - efficiencyDiscount);
        
        // ✅ APLICACIÓN DEL MARGEN 70%
        const grossProfit = kpis.ingresos * REVENUE_SHARE; 
        const netProfit = grossProfit - fixedCosts;
        
        // ✅ Capital FINAL = Capital INICIAL + Ganancia Neta
        kpis.capital = kpis.capitalInicial + netProfit;
        kpis.capital = Math.round(kpis.capital);

        // ==========================
        // 2. LÓGICA RIVALES (IA REALISTA ORIGINAL)
        // ==========================
        
        // Configuración de Personalidad IA según Dificultad
        let aiAggressiveness = 0.15; // % de capital disponible que invierte
        let aiEfficiency = 1.0;      // Retorno por dólar invertido
        
        if (difficulty === 'easy') { 
            aiAggressiveness = 0.10; // Tímida
            aiEfficiency = 0.8;      // Ineficiente
        }
        if (difficulty === 'hard') { 
            aiAggressiveness = 0.25; // Agresiva
            aiEfficiency = 1.2;      // Optimizada
        }

        kpis.rivalsData = kpis.rivalsData.map(rival => {
            let actionText = "Ahorro / Pasivo";
            let spending = 0;
            
            // Lógica de Inversión: Solo invierten si tienen flujo de caja sano
            if (rival.capital > 50000) {
                // Inversión variable realista
                spending = Math.floor(rival.capital * aiAggressiveness * (0.8 + Math.random() * 0.4));
                
                rival.capital -= spending;
                
                // Impacto en Mercado normalizado (para evitar saltos irreales)
                // Costo base alto para subir cuota, ajustado por eficiencia de IA
                const marketImpactBase = 400000; 
                const marketGain = (spending / marketImpactBase) * aiEfficiency * (0.9 + Math.random() * 0.2);
                
                rival.cuotaMercado += marketGain;
                
                // Narrativa visual
                if (spending > 150000) actionText = "Expansión Agresiva";
                else if (spending > 50000) actionText = "Inversión Moderada";
                else actionText = "Mantenimiento";
            }

            // ✅ CORRECCIÓN DE INGRESOS IA (BASADO EN CUOTA):
            // Ingresos = Cuota de Mercado * Factor Base * Volatilidad.
            // Factor Base ajustado para que 1% de cuota genere ingresos realistas (~$22k).
            const revenuePerSharePoint = 22000; 
            const rivalRevenue = (rival.cuotaMercado * revenuePerSharePoint) * (1 + volatility);
            
            // Costos operativos de la IA (Simulados: 25% de sus ingresos son costos fijos)
            const rivalFixedCosts = (rivalRevenue * 0.25); 
            
            // Aplicar Margen de 70% (Igual que al jugador)
            const rivalGrossProfit = rivalRevenue * REVENUE_SHARE; 
            const rivalNetProfit = rivalGrossProfit - rivalFixedCosts;

            rival.capital += rivalNetProfit;
            rival.capital = Math.round(rival.capital);
            
            return { 
                ...rival, 
                lastInvestment: actionText, 
                lastActionEffect: spending > 0 ? "Creciendo" : "Estable" 
            };
        });

        // ==========================
        // 3. VERIFICAR CONDICIONES DE VICTORIA / DERROTA
        // ==========================
        const winGoalCapital = kpis.settings.winGoal.capital;
        const winGoalShare = kpis.settings.winGoal.marketShare;

        // A. Derrota por Quiebra
        if (kpis.capital <= 0) {
            kpis.isGameOver = true; 
            kpis.winCondition = 'lose_bankrupt'; 
        }
        // B. Victoria del Jugador (Meta alcanzada)
        else if (kpis.capital >= winGoalCapital && kpis.cuotaMercado >= winGoalShare) {
            kpis.isGameOver = true; 
            kpis.winCondition = 'win';
        }
        // C. Derrota por Competencia (IA ganó)
        else {
            const winnerRival = kpis.rivalsData.find(r => r.capital >= winGoalCapital && r.cuotaMercado >= winGoalShare);
            if (winnerRival) {
                kpis.isGameOver = true;
                kpis.winCondition = 'lose_rival'; 
                kpis.winnerName = winnerRival.name; 
            }
            // D. ✅ Derrota por Tiempo Agotado
            else if (kpis.semanaActual > maxWeeks) {
                kpis.isGameOver = true;
                kpis.winCondition = 'lose_time';
            }
        }

        // Actualizar Gráficos Históricos
        kpis.revenueChartData.labels.push(`S${kpis.semanaActual}`);
        kpis.revenueChartData.datasets[0].data.push(kpis.ingresos);
        kpis.marketShareChartData.labels.push(`S${kpis.semanaActual}`);
        kpis.marketShareChartData.datasets[0].data.push(kpis.cuotaMercado);
        kpis.volatilityChartData.labels.push(`S${kpis.semanaActual}`);
        kpis.volatilityChartData.datasets[0].data.push(volatility * 100);

        game.markModified('gameState');
        await game.save();

        res.json({ success: true, message: `Semana ${kpis.semanaActual} completada`, gameState: kpis });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error avanzando semana' });
    }
};

// --- OTROS ENDPOINTS AUXILIARES ---
const resetGame = async (req, res) => { 
    try { 
        await Game.deleteOne({ userId: req.user.id }); 
        res.json({ success: true }); 
    } catch (e) { 
        res.status(500).json({ success: false }); 
    } 
};

const getDashboardData = async (req, res) => { 
    try { 
        const game = await Game.findOne({ userId: req.user.id }); 
        res.json({ success: true, dashboardData: game?.gameState }); 
    } catch (e) { 
        res.status(500).json({ success: false }); 
    } 
};

const getGameStatus = async (req, res) => { 
    try { 
        const game = await Game.findOne({ userId: req.user.id }); 
        res.json({ success: true, status: { currentWeek: game?.gameState.semanaActual, isGameOver: game?.gameState.isGameOver } }); 
    } catch (e) { 
        res.status(500).json({ success: false }); 
    } 
};

module.exports = { 
    createNewGame, 
    getCurrentGame, 
    saveGameState, 
    processInvestment, 
    advanceWeek, 
    resetGame, 
    getDashboardData, 
    getGameStatus 
};