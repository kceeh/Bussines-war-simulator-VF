const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso denegado. Token no proporcionado.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido. Usuario no encontrado.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error en middleware auth:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado.' 
        });
    }
};

module.exports = auth;