const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Asegúrate de tener este middleware
const gameController = require('../controllers/gameController');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas principales
router.post('/new', gameController.createNewGame);      // Crear partida
router.get('/current', gameController.getCurrentGame);  // Cargar partida
router.post('/save', gameController.saveGameState);     // Guardar (manual)
router.post('/reset', gameController.resetGame);        // Reiniciar

// Rutas de acciones de juego
router.post('/investment', gameController.processInvestment); // Procesar inversión
router.post('/advance', gameController.advanceWeek);          // Avanzar semana

// Rutas de datos
router.get('/dashboard', gameController.getDashboardData);    // Datos dashboard
router.get('/status', gameController.getGameStatus);          // Estado simple

module.exports = router;