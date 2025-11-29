// Funciones auxiliares
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount);
};

const calculateTotalInvestment = (investmentLevels) => {
    const { DECISION_CATEGORIES } = require('./constants');
    return Object.entries(investmentLevels).reduce((sum, [key, level]) => {
        const decision = DECISION_CATEGORIES.find(d => d.key === key);
        return sum + (decision ? decision.cost * level : 0);
    }, 0);
};

const getGlobalRanking = (kpis, rivals) => {
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
};

module.exports = {
    formatCurrency,
    calculateTotalInvestment,
    getGlobalRanking
};