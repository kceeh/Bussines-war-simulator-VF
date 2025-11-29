const { 
    DIFFICULTY_SETTINGS, 
    BASE_RIVALS,
    REVENUE_SHARE,
    BASE_EMPLOYEE_COST,
    BASE_EMPLOYEES_NEUTRAL,
    ID_IMPACT_RATE,
    MKT_IMPACT_RATE,
    EFFICIENCY_IMPACT_RATE,
    BASE_GROWTH_INITIAL
} = require('./constants');

// Inicializar rivales según dificultad
const initializeRivals = (difficulty) => {
    const baseCapital = DIFFICULTY_SETTINGS[difficulty].capital;
    return BASE_RIVALS.map(rival => ({
        ...rival,
        capital: baseCapital * (2 + Math.random()),
        cuotaMercado: DIFFICULTY_SETTINGS[difficulty].marketShare * (3 + Math.random()),
        lastInvestment: 'Esperando...',
        lastActionEffect: 'Sin actividad'
    }));
};

// Simular avance de rivales IA
const simulateRivalAdvance = (rival, globalRanking) => {
    const RIVAL_EMPLOYEE_COST = 25000;
    const WEEKLY_PROFIT_BASE = rival.capital * 0.005;
    const RIVAL_INCOME_GROWTH_BASE = 0.01;
    
    const rivalRank = globalRanking.find(p => p.name === rival.name)?.rank || 4;
    
    let INVESTMENT_COST = 0;
    let investmentType = 'Mantenimiento';
    let cuotaChange = (Math.random() * 0.3) - 0.15;
    let capitalChange = WEEKLY_PROFIT_BASE - RIVAL_EMPLOYEE_COST;

    if (rival.capital > 250000 && rivalRank >= 2) {
        if (rivalRank >= 4) {
            investmentType = Math.random() > 0.5 ? 'Marketing (Agresivo)' : 'I+D (Innovación)';
            INVESTMENT_COST = 150000 + Math.random() * 100000;
            cuotaChange += (investmentType === 'Marketing (Agresivo)' ? 1.0 : 0.3);
        } else if (rivalRank === 2 || rivalRank === 3) {
            investmentType = 'Optimización (Eficiencia)';
            INVESTMENT_COST = 50000 + Math.random() * 50000;
            capitalChange += INVESTMENT_COST * 0.5;
        }
        capitalChange -= INVESTMENT_COST;
    }
    
    const newCapital = Math.max(0, rival.capital + capitalChange);
    const newCuota = Math.max(0, rival.cuotaMercado + cuotaChange + RIVAL_INCOME_GROWTH_BASE);

    return {
        ...rival,
        capital: newCapital,
        cuotaMercado: parseFloat(newCuota.toFixed(2)),
        lastInvestment: INVESTMENT_COST > 0 ? `${investmentType} ($${INVESTMENT_COST.toLocaleString('es-CL')})` : 'Mantenimiento de Costos',
        lastActionEffect: `Capital: ${capitalChange >= 0 ? '+' : ''}${Math.round(capitalChange).toLocaleString('es-CL')}, Cuota: ${cuotaChange >= 0 ? '+' : ''}${cuotaChange.toFixed(2)}%`,
    };
};

// Calcular siguiente semana
const calculateNextWeek = (currentGameState, investmentLevels = {}) => {
    const kpis = currentGameState;
    const nextWeek = kpis.semanaActual + 1;
    
    // Lógica de empleados y riesgo
    const employeeCount = kpis.empleados || BASE_EMPLOYEES_NEUTRAL;
    const EMPLOYEE_FACTOR = (employeeCount - BASE_EMPLOYEES_NEUTRAL) * 0.002;
    const ADJUSTED_BASE_GROWTH = BASE_GROWTH_INITIAL + EMPLOYEE_FACTOR;
    const VOLATILITY_ADJUSTER = Math.abs(employeeCount - BASE_EMPLOYEES_NEUTRAL) * 0.002;
    
    const MARKET_VOLATILITY = (Math.random() * (0.02 + VOLATILITY_ADJUSTER)) - (0.01 + (VOLATILITY_ADJUSTER / 2));
    const CUOTA_VOLATILITY = (Math.random() * (0.04 + VOLATILITY_ADJUSTER * 2)) - (0.02 + VOLATILITY_ADJUSTER);

    // 1. Gastos fijos ajustados (Eficiencia)
    const nivelEficiencia = kpis.nivelEficiencia || 0;
    const fixedCostReductionFactor = 1 - (nivelEficiencia * EFFICIENCY_IMPACT_RATE);
    const fixedCostsWeeklyAdjusted = Math.max(0, employeeCount * BASE_EMPLOYEE_COST * fixedCostReductionFactor);
    
    // 2. Crecimiento de ingresos (Marketing + Base Ajustada + Riesgo)
    const nivelMarketing = kpis.nivelMarketing || 0;
    const nivelID = kpis.nivelID || 0;
    
    const MKT_Factor_Ingresos = nivelMarketing * MKT_IMPACT_RATE;
    const isMarketingSaturated = (nivelMarketing > 5 && nivelID < 3);
    let saturationPenalty = 0;
    if (isMarketingSaturated) { saturationPenalty = 0.02; }

    const growthRateIngresos = ADJUSTED_BASE_GROWTH + MKT_Factor_Ingresos + MARKET_VOLATILITY - saturationPenalty;
    const newIngresos = Math.round((kpis.ingresos || 0) * (1 + growthRateIngresos));
    
    // 3. Crecimiento de cuota (I+D + Marketing + Base Ajustada + Riesgo)
    const ID_Factor_Cuota = nivelID * ID_IMPACT_RATE;
    const MKT_Cuota_Factor = nivelMarketing * 0.005;
    
    const growthCuota = (ADJUSTED_BASE_GROWTH * 2) + ID_Factor_Cuota + MKT_Cuota_Factor + CUOTA_VOLATILITY;
    const newCuota = parseFloat(((kpis.cuotaMercado || 0) * (1 + growthCuota)).toFixed(2));
    
    // 4. Capital final
    const profit = (newIngresos * REVENUE_SHARE) - fixedCostsWeeklyAdjusted;
    const newCapital = (kpis.capital || 0) + profit;
    
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
};

// Aplicar efectos de inversiones
const applyInvestmentEffects = (currentState, investmentLevels) => {
    let newState = { ...currentState };
    const { DECISION_CATEGORIES } = require('./constants');

    Object.entries(investmentLevels).forEach(([key, level]) => {
        if (level > 0) {
            const decision = DECISION_CATEGORIES.find(d => d.key === key);
            if (!decision) return;

            if (decision.affectsKPI.startsWith('nivel')) {
                newState[decision.affectsKPI] = (newState[decision.affectsKPI] || 0) + level;
            } else if (decision.affectsKPI === 'satisfaccion') {
                newState.satisfaccion = Math.min(100, (newState.satisfaccion || 0) + (15 * level));
            } else if (decision.affectsKPI === 'ingresos') {
                newState.ingresos = (newState.ingresos || 0) + (50000 * level);
            } else if (decision.affectsKPI === 'capital_boost') {
                newState.nivelEficiencia = (newState.nivelEficiencia || 0) + level;
            }
        }
    });

    return newState;
};

module.exports = {
    initializeRivals,
    simulateRivalAdvance,
    calculateNextWeek,
    applyInvestmentEffects
};