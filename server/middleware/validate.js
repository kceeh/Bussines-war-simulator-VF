const validateRegistration = (req, res, next) => {
    const { username, email, password, companyName } = req.body;
    
    if (!username || !email || !password || !companyName) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos: username, email, password, companyName'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del email es inválido'
        });
    }

    next();
};

const validateGameCreation = (req, res, next) => {
    const { difficulty, companyName } = req.body;
    
    if (!difficulty || !companyName) {
        return res.status(400).json({
            success: false,
            message: 'Dificultad y nombre de empresa son requeridos'
        });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({
            success: false,
            message: 'Dificultad debe ser: easy, medium o hard'
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateGameCreation
};