const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REGISTRO DE USUARIO
const register = async (req, res) => {
    try {
        // Extraemos todos los datos, incluyendo el RUT
        const { username, email, password, companyName, rut } = req.body;

        // Verificar si el usuario, email o RUT ya existen
        const existingUser = await User.findOne({ 
            $or: [
                { email }, 
                { username },
                { rut } 
            ] 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario, email o RUT ya está registrado'
            });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const user = new User({
            username,
            email,
            password: hashedPassword,
            companyName,
            rut // Guardamos el RUT
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        
        // Manejo de error de duplicados de MongoDB (por seguridad extra)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Datos duplicados: El usuario, email o RUT ya existe.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

// ✅ LOGIN DE USUARIO (Corregido para aceptar username)
const login = async (req, res) => {
    try {
        // Recibimos email O username desde el frontend
        const { email, username, password } = req.body;

        // Definimos el identificador (puede ser el email o el nombre de usuario)
        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor ingrese usuario y contraseña'
            });
        }

        // Buscamos en la BD si coincide con email O con username
        const user = await User.findOne({ 
            $or: [
                { email: identifier }, 
                { username: identifier }
            ] 
        });

        // Si no existe el usuario
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas (Usuario no encontrado)'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas (Contraseña incorrecta)'
            });
        }

        // Generar token
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                companyName: user.companyName,
                rut: user.rut
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesión'
        });
    }
};

// ✅ OBTENER PERFIL
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile
};