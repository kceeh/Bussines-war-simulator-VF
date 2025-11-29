const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Conexión a MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/businessgame')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const userRoutes = require('./routes/users');

const app = express();

// Middleware CORS CORREGIDO
const allowedOrigins = [
  'https://bussines-war-simulator-vf.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    } else {
      console.log('CORS bloqueado para origen:', origin);
      return callback(new Error('CORS policy violation'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para preflight requests
app.options('*', cors());

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Servidor funcionando', 
        timestamp: new Date(),
        version: '1.0'
    });
});

// Ruta de prueba adicional
app.get('/', (req, res) => {
    res.json({ message: 'Backend Business Game funcionando!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Orígenes permitidos:`, allowedOrigins);
});