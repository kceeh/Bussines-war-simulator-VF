const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    gameState: {
        nombreEmpresa: { type: String, required: true },
        semanaActual: { type: Number, default: 1 },
        
        // KPIs Principales
        capital: { type: Number, required: true }, // Dinero del jugador (Caja actual) - CAPITAL FINAL
        capitalInicial: { type: Number, required: true }, // ✅ NUEVO: Capital al inicio de la semana
        ingresos: { type: Number, default: 0 },
        cuotaMercado: { type: Number, default: 0 },
        satisfaccion: { type: Number, default: 50 },
        
        // Niveles de Inversión
        empleados: { type: Number, default: 5 },
        nivelMarketing: { type: Number, default: 0 },
        nivelID: { type: Number, default: 0 },
        nivelEficiencia: { type: Number, default: 0 },
        
        lastDecisions: [String], // Historial de textos de decisiones

        // 🔥 CAMPO OBLIGATORIO NUEVO 🔥
        // Guarda cuánto se invirtió para poder hacer los cálculos en el Dashboard
        lastInvestmentCost: { type: Number, default: 0 },

        // Definición de Rivales
        rivalsData: [{
            name: String,
            capital: Number,
            cuotaMercado: Number,
            lastInvestment: String,
            strength: String,
            lastActionEffect: String
        }],

        // Gráficos
        revenueChartData: {
            labels: [String],
            datasets: [{
                label: String,
                data: [Number],
                borderColor: String,
                backgroundColor: String
            }]
        },
        marketShareChartData: {
            labels: [String],
            datasets: [{
                label: String,
                data: [Number],
                borderColor: String,
                backgroundColor: String
            }]
        },
        volatilityChartData: {
            labels: [String],
            datasets: [{
                label: String,
                data: [Number],
                borderColor: String,
                backgroundColor: String
            }]
        },

        // Estado del Juego
        isGameOver: { type: Boolean, default: false },
        winCondition: { type: String, default: 'none' }, // 'win', 'lose_rival', 'lose_bankrupt', 'lose_time'
        winnerName: { type: String },

        // Configuraciones de la partida
        settings: {
            difficulty: String,
            maxWeeks: Number,
            winGoal: {
                capital: Number,
                marketShare: Number
            }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);