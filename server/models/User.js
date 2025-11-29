const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
    },
    // ✅ RUT OBLIGATORIO AGREGADO
    rut: {
        type: String,
        required: [true, 'El RUT es requerido'],
        unique: true,
        trim: true,
        match: [/^[0-9]{7,8}-[0-9kK]{1}$/, 'Por favor ingresa un RUT válido (formato: 12345678-9)']
    },
    currentGame: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Game' 
    },
    stats: {
        gamesPlayed: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
        bestCapital: { type: Number, default: 0 },
        bestMarketShare: { type: Number, default: 0 }
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);