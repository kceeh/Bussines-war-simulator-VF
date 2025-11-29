import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { useGame } from '../context/GameContext'; 
import Notification from '../components/Notification'; 
import AuthForm from '../components/AuthForm'; 

const AuthPage = () => {
    const { loginUser, registerUser } = useGame(); 
    const navigate = useNavigate();
    const location = useLocation();

    const isRegisterMode = location.search.includes('mode=register');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ FORMATOS REQUERIDOS PARA MOSTRAR AL USUARIO
    const formatRequirements = {
        username: "3-30 caracteres (solo letras, números y _)",
        password: "Mínimo 6 caracteres", 
        email: "Formato de email válido (ej: usuario@dominio.com)",
        rut: "Formato: 12345678-9 (8 dígitos + guión + dígito verificador)",
        companyName: "1-50 caracteres"
    };

    const handleAuthSubmit = async (formData) => {
        console.log('📤 Datos enviados al backend:', formData);
        
        // ✅ VALIDACIONES FRONTEND DETALLADAS
        if (!formData.username || !formData.password) {
            setNotification({ 
                message: 'Usuario y Contraseña son obligatorios.', 
                type: 'error' 
            });
            return;
        }

        // Validación específica para registro
        if (isRegisterMode) {
            // Verificar campos obligatorios
            const missingFields = [];
            if (!formData.email) missingFields.push('Email');
            if (!formData.rut) missingFields.push('RUT');
            if (!formData.companyName) missingFields.push('Nombre de Empresa');
            
            if (missingFields.length > 0) {
                setNotification({ 
                    message: `Faltan campos obligatorios: ${missingFields.join(', ')}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar longitud de contraseña
            if (formData.password.length < 6) {
                setNotification({ 
                    message: `La contraseña debe tener al menos 6 caracteres. ${formatRequirements.password}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar que las contraseñas coincidan
            if (formData.password !== formData.confirmPassword) {
                setNotification({ 
                    message: 'Las contraseñas no coinciden. Por favor verifica.', 
                    type: 'error' 
                });
                return;
            }

            // Validar formato de RUT
            const rutRegex = /^\d{7,8}-[\dkK]$/;
            if (!rutRegex.test(formData.rut)) {
                setNotification({ 
                    message: `Formato de RUT inválido. ${formatRequirements.rut}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setNotification({ 
                    message: `Formato de email inválido. ${formatRequirements.email}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar longitud de usuario
            if (formData.username.length < 3 || formData.username.length > 30) {
                setNotification({ 
                    message: `El usuario debe tener entre 3 y 30 caracteres. ${formatRequirements.username}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar caracteres del usuario
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(formData.username)) {
                setNotification({ 
                    message: `El usuario solo puede contener letras, números y guiones bajos (_). ${formatRequirements.username}`, 
                    type: 'error' 
                });
                return;
            }

            // Validar longitud de empresa
            if (formData.companyName.length < 1 || formData.companyName.length > 50) {
                setNotification({ 
                    message: `El nombre de empresa debe tener entre 1 y 50 caracteres. ${formatRequirements.companyName}`, 
                    type: 'error' 
                });
                return;
            }
        }

        setIsLoading(true);

        try {
            let result;
            
            if (isRegisterMode) {
                console.log('🔍 Validando datos de registro...');
                
                // ✅ Datos estructurados para el backend
                const registrationData = {
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    rut: formData.rut,
                    companyName: formData.companyName
                };
                
                console.log('📤 Enviando registro al backend:', registrationData);
                
                result = await registerUser(registrationData);
                
                if (result.success) {
                    setNotification({ 
                        message: '✅ ¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.', 
                        type: 'success' 
                    });
                    
                    // ✅ Redirigir al LOGIN después de 2.5 segundos
                    setTimeout(() => {
                        navigate('/auth');
                    }, 0.25);
                } else {
                    // ✅ MANEJO MEJORADO DE ERRORES ESPECÍFICOS
                    let errorMessage = result.message;
                    
                    // Errores de duplicados
                    if (result.message?.includes('RUT ya está registrado')) {
                        errorMessage = '❌ El RUT ya está registrado en el sistema. ¿Ya tienes una cuenta?';
                    } else if (result.message?.includes('usuario ya existe')) {
                        errorMessage = '❌ El nombre de usuario ya está en uso. Por favor elige otro.';
                    } else if (result.message?.includes('email ya está registrado')) {
                        errorMessage = '❌ El email ya está registrado. ¿Ya tienes una cuenta?';
                    } 
                    // Errores de validación
                    else if (result.message?.includes('Datos de registro inválidos')) {
                        errorMessage = '❌ Datos de registro inválidos. Por favor verifica los formatos.';
                    } else if (result.message?.includes('contraseña')) {
                        errorMessage = '❌ Error en la contraseña. Debe tener al menos 6 caracteres.';
                    } else if (result.message?.includes('usuario') && result.message?.includes('caracteres')) {
                        errorMessage = '❌ El usuario debe tener entre 3 y 30 caracteres.';
                    } else if (result.message?.includes('RUT') && result.message?.includes('válido')) {
                        errorMessage = '❌ Formato de RUT inválido. Debe ser: 12345678-9';
                    } else if (result.message?.includes('email') && result.message?.includes('válido')) {
                        errorMessage = '❌ Formato de email inválido. Ejemplo: usuario@dominio.com';
                    }
                    // Error genérico
                    else {
                        errorMessage = `❌ Error: ${result.message}`;
                    }
                    
                    setNotification({ 
                        message: errorMessage, 
                        type: 'error' 
                    });
                }
                
            } else {
                // LOGIN con backend
                console.log('🔍 Intentando login...');
                
                result = await loginUser({
                    username: formData.username,
                    password: formData.password
                });
                
                if (result.success) {
                    setNotification({ 
                        message: '✅ ¡Login exitoso! Redirigiendo...', 
                        type: 'success' 
                    });
                    
                    setTimeout(() => navigate('/'), 1500);
                } else {
                    setNotification({ 
                        message: '❌ Usuario o contraseña incorrectos', 
                        type: 'error' 
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error en handleAuthSubmit:', error);
            setNotification({ 
                message: '❌ Error de conexión con el servidor. Intenta nuevamente.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })} 
            />
            
            <div className="p-8 bg-white rounded-xl shadow-2xl max-w-md w-full">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-indigo-600">
                        {isRegisterMode ? "Crear Cuenta" : "Iniciar Sesión"}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isRegisterMode ? "Completa todos los campos para registrarte" : "Bienvenido de vuelta"}
                    </p>
                    
                    {/* ✅ INFORMACIÓN DE FORMATOS REQUERIDOS */}
                    {isRegisterMode && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">
                                📋 Formatos requeridos:
                            </h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• <strong>Usuario:</strong> {formatRequirements.username}</li>
                                <li>• <strong>Contraseña:</strong> {formatRequirements.password}</li>
                                <li>• <strong>Email:</strong> {formatRequirements.email}</li>
                                <li>• <strong>RUT:</strong> {formatRequirements.rut}</li>
                                <li>• <strong>Empresa:</strong> {formatRequirements.companyName}</li>
                            </ul>
                        </div>
                    )}
                </header>
                
                <AuthForm 
                    isRegister={isRegisterMode} 
                    onSubmit={handleAuthSubmit}
                    onToggle={() => navigate(isRegisterMode ? '/auth' : '/auth?mode=register')}
                    isLoading={isLoading}
                />
                
                {isLoading && (
                    <div className="mt-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-500 mt-2">Procesando...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;