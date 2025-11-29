// CONSTANTES DEL JUEGO - Migradas desde frontend
module.exports = {
    // Límites de juego
    MAX_LEVEL_PER_OPTION: 10,
    BASE_EMPLOYEES_NEUTRAL: 5,
    
    // Económicas - ✅ CORREGIDO: REVENUE_SHARE debe ser 0.70 (70% margen)
    REVENUE_SHARE: 0.70,
    BASE_EMPLOYEE_COST: 5000,
    
    // Factores de impacto
    ID_IMPACT_RATE: 0.005,
    MKT_IMPACT_RATE: 0.01,
    EFFICIENCY_IMPACT_RATE: 0.01,
    BASE_GROWTH_INITIAL: 0.05,
    
    // Configuraciones por dificultad
    DIFFICULTY_SETTINGS: {
        easy: {
            capital: 2500000,
            marketShare: 5.0,
            maxWeeks: 52,
            winGoal: { capital: 6000000, marketShare: 20.0 }
        },
        medium: {
            capital: 1000000,
            marketShare: 1.0,
            maxWeeks: 40,
            winGoal: { capital: 5000000, marketShare: 25.0 }
        },
        hard: {
            capital: 500000,
            marketShare: 0.1,
            maxWeeks: 30,
            winGoal: { capital: 8000000, marketShare: 30.0 }
        }
    },
    
    // Datos de rivales base
    BASE_RIVALS: [
        {
            name: "Corporación Rival A",
            capital: 5200000,
            cuotaMercado: 15.00
        },
        {
            name: "Tech Competitors Inc", 
            capital: 4800000,
            cuotaMercado: 12.50
        },
        {
            name: "Global Enterprises",
            capital: 4500000,
            cuotaMercado: 10.00
        }
    ],

    // ✅ LISTA DE COSTOS ACTUALIZADA - Sincronizada con frontend y backend
    COSTS: { 
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
    },

    // ✅ CATEGORÍAS DE DECISIÓN ACTUALIZADAS - Sincronizadas con frontend
    DECISION_CATEGORIES: [
        { 
            key: 'inv_calidad', 
            name: 'Investigación y Desarrollo', 
            cost: 150000, 
            gain: '⭐ +1 Nivel Calidad (Sube Satisfacción a largo plazo)',
            affectsKPI: 'nivelID'
        },
        { 
            key: 'mkt_digital', 
            name: 'Marketing Digital', 
            cost: 100000, 
            gain: '📈 +1 Nivel Marketing (Sube Cuota e Ingresos)',
            affectsKPI: 'nivelMarketing'
        },
        { 
            key: 'rrhh_capacitacion', 
            name: 'Capacitación RRHH', 
            cost: 50000, 
            gain: '😊 +5 pts Satisfacción inmediata (Protege Ingresos)',
            affectsKPI: 'satisfaccion'
        },
        { 
            key: 'cap_expansion', 
            name: 'Expansión de Capacidad', 
            cost: 200000, 
            gain: '🏭 +10% Capacidad de Ingresos Base (Techo de ganancia)',
            affectsKPI: 'ingresos'
        },
        { 
            key: 'opt_costos', 
            name: 'Optimización de Costos', 
            cost: 30000, 
            gain: '⚙️ +1 Nivel Eficiencia (Reduce Gastos Fijos)',
            affectsKPI: 'nivelEficiencia'
        },
        { 
            key: 'mkt_imagen', 
            name: 'Campaña de Imagen', 
            cost: 80000, 
            gain: '✨ +2 pts Satisfacción y mejora de Marca',
            affectsKPI: 'satisfaccion'
        },
        { 
            key: 'inv_procesos', 
            name: 'Innovación de Proceso', 
            cost: 120000, 
            gain: '🛠️ +1 Nivel Calidad (Enfocada en producción)',
            affectsKPI: 'nivelID'
        },
        { 
            key: 'rrhh_contratacion', 
            name: 'Contratación Clave', 
            cost: 180000, 
            gain: '🚀 +1 Nivel Eficiencia (Boost Global)',
            affectsKPI: 'nivelEficiencia'
        },
        { 
            key: 'mkt_segmentado', 
            name: 'Publicidad Segmentada', 
            cost: 90000, 
            gain: '🎯 +1 Nivel Marketing (Alta eficiencia)',
            affectsKPI: 'nivelMarketing'
        },
        { 
            key: 'infra_mant', 
            name: 'Mantenimiento Infra.', 
            cost: 70000, 
            gain: '🔧 +5 pts Satisfacción (Menor riesgo de fallos)',
            affectsKPI: 'satisfaccion'
        }
    ],

    // ✅ FUNCIONES AUXILIARES ACTUALIZADAS
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    },

    calculateTotalInvestment: (investmentLevels) => {
        return Object.entries(investmentLevels).reduce((sum, [key, level]) => {
            const cost = module.exports.COSTS[key];
            return sum + (cost ? cost * level : 0);
        }, 0);
    },

    getGlobalRanking: (kpis, rivals) => {
        const allPlayers = [
            {
                name: kpis.nombreEmpresa,
                capital: kpis.capital || 0,
                cuotaMercado: kpis.cuotaMercado || 0,
                isPlayer: true
            },
            ...(rivals || []).filter(r => r && r.name).map(r => ({
                name: r.name,
                capital: r.capital || 0,
                cuotaMercado: r.cuotaMercado || 0,
                isPlayer: false
            }))
        ];

        allPlayers.sort((a, b) => b.capital - a.capital);
        return allPlayers.map((player, index) => ({
            ...player,
            rank: index + 1,
            color: player.isPlayer ? 'text-indigo-600' : 'text-gray-800'
        }));
    },

    // ✅ FUNCIÓN PARA CALCULAR PRÓXIMA SEMANA ACTUALIZADA
    calculateNextWeek: (currentGameState, investmentLevels = {}) => {
        const kpis = currentGameState;
        const nextWeek = kpis.semanaActual + 1;
        
        // ✅ CORRECCIÓN: Usar capitalInicial desde la BD
        const capitalInicial = kpis.capitalInicial || kpis.capital || 0;
        
        // Lógica de empleados y riesgo
        const employeeCount = kpis.empleados || module.exports.BASE_EMPLOYEES_NEUTRAL;
        const EMPLOYEE_FACTOR = (employeeCount - module.exports.BASE_EMPLOYEES_NEUTRAL) * 0.002;
        const ADJUSTED_BASE_GROWTH = module.exports.BASE_GROWTH_INITIAL + EMPLOYEE_FACTOR;
        const VOLATILITY_ADJUSTER = Math.abs(employeeCount - module.exports.BASE_EMPLOYEES_NEUTRAL) * 0.002;
        
        const MARKET_VOLATILITY = (Math.random() * (0.02 + VOLATILITY_ADJUSTER)) - (0.01 + (VOLATILITY_ADJUSTER / 2));
        const CUOTA_VOLATILITY = (Math.random() * (0.04 + VOLATILITY_ADJUSTER * 2)) - (0.02 + VOLATILITY_ADJUSTER);

        // 1. Gastos fijos ajustados (Eficiencia)
        const nivelEficiencia = kpis.nivelEficiencia || 0;
        const fixedCostReductionFactor = 1 - (nivelEficiencia * module.exports.EFFICIENCY_IMPACT_RATE);
        const fixedCostsWeeklyAdjusted = Math.max(0, employeeCount * module.exports.BASE_EMPLOYEE_COST * fixedCostReductionFactor);
        
        // 2. Crecimiento de ingresos (Marketing + Base Ajustada + Riesgo)
        const nivelMarketing = kpis.nivelMarketing || 0;
        const nivelID = kpis.nivelID || 0;
        
        const MKT_Factor_Ingresos = nivelMarketing * module.exports.MKT_IMPACT_RATE;
        const isMarketingSaturated = (nivelMarketing > 5 && nivelID < 3);
        let saturationPenalty = 0;
        if (isMarketingSaturated) { saturationPenalty = 0.02; }

        const growthRateIngresos = ADJUSTED_BASE_GROWTH + MKT_Factor_Ingresos + MARKET_VOLATILITY - saturationPenalty;
        const newIngresos = Math.round((kpis.ingresos || 0) * (1 + growthRateIngresos));
        
        // 3. Crecimiento de cuota (I+D + Marketing + Base Ajustada + Riesgo)
        const ID_Factor_Cuota = nivelID * module.exports.ID_IMPACT_RATE;
        const MKT_Cuota_Factor = nivelMarketing * 0.005;
        
        const growthCuota = (ADJUSTED_BASE_GROWTH * 2) + ID_Factor_Cuota + MKT_Cuota_Factor + CUOTA_VOLATILITY;
        const newCuota = parseFloat(((kpis.cuotaMercado || 0) * (1 + growthCuota)).toFixed(2));
        
        // 4. Capital final - ✅ CORREGIDO: Usar capitalInicial + ganancia
        const profit = (newIngresos * module.exports.REVENUE_SHARE) - fixedCostsWeeklyAdjusted;
        const newCapital = capitalInicial + profit;
        
        // 5. Satisfacción (I+D + Riesgo)
        const satisfactionDropRisk = newIngresos < (kpis.ingresos || 0) * 0.9 ? -5 : 0;
        const newSatisfaccion = Math.min(100, Math.max(0, (kpis.satisfaccion || 0) + (nivelID * 2) + satisfactionDropRisk));

        // 6. Detección de victoria
        const winGoalCapital = kpis.settings?.winGoal?.capital || 5000000;
        const winGoalMarket = kpis.settings?.winGoal?.marketShare || 50;
        const isGameWon = newCapital >= winGoalCapital && newCuota >= winGoalMarket;
        const isGameOver = newCapital < 0 || isGameWon;
        const winCondition = isGameWon ? 'win' : (newCapital < 0 ? 'lose' : 'none');

        return {
            semanaActual: nextWeek,
            capital: newCapital,
            capitalInicial: capitalInicial, // ✅ MANTENER capitalInicial para consistencia
            ingresos: newIngresos,
            cuotaMercado: newCuota,
            satisfaccion: Math.round(newSatisfaccion),
            empleados: employeeCount,
            nivelID,
            nivelMarketing,
            nivelEficiencia,
            isGameOver,
            winCondition,
            settings: kpis.settings,
            volatilityImpact: MARKET_VOLATILITY * 100
        };
    }
};