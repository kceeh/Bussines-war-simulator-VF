// config/api.js
const API_BASE = 'https://bussines-war-simulator-vf.onrender.com/';

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
    console.log('🔍 DEBUG API: Llamando a:', `${API_BASE}${endpoint}`);
    console.log('🔍 DEBUG API: Método:', method);
    console.log('🔍 DEBUG API: Datos:', data);

    // ✅ OBTENER TOKEN CORRECTAMENTE
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG API: Token disponible:', !!token);

    const options = {
        method: method, // ✅ Asegurar que method sea string, no objeto
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // ✅ AÑADIR TOKEN SI ESTÁ DISPONIBLE
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 DEBUG API: Token añadido a headers');
    }

    // ✅ MANEJAR DATOS CORRECTAMENTE
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
        console.log('🔍 DEBUG API: Body añadido:', data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);

        console.log('🔍 DEBUG API: Status:', response.status);
        console.log('🔍 DEBUG API: OK:', response.ok);
        console.log('🔍 DEBUG API: URL:', response.url);
        
        const responseText = await response.text();
        console.log('🔍 DEBUG API: Respuesta COMPLETA:', responseText);

        if (responseText.trim().startsWith('<!DOCTYPE') || 
            responseText.trim().startsWith('<!doctype') || 
            responseText.trim().startsWith('<html')) {
            
            console.error('🔍 DEBUG API: ❌ EL BACKEND DEVOLVIÓ HTML');
            throw new Error(`El servidor devolvió HTML. Status: ${response.status}`);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(responseText);
            console.log('🔍 DEBUG API: ✅ JSON parseado exitosamente:', jsonData);
        } catch (jsonError) {
            console.error('🔍 DEBUG API: ❌ No es JSON válido. Texto:', responseText);
            throw new Error(`Respuesta no es JSON válido`);
        }

        if (jsonData && jsonData.success === false) {
            console.log('🔍 DEBUG API: ✅ Backend indica error:', jsonData.message);
            
            // ✅ MANEJO ESPECÍFICO DE ERROR DE TOKEN
            if (jsonData.message.includes('Token') || jsonData.message.includes('token')) {
                console.error('🔍 DEBUG API: ❌ Error de token, limpiando sesión');
                // Limpiar token inválido
                localStorage.removeItem('token');
                localStorage.removeItem('isAuthenticated');
                window.location.reload(); // Forzar recarga para limpiar estado
            }
            
            throw new Error(jsonData.message);
        }

        if (!response.ok) {
            throw new Error(jsonData?.message || `HTTP error! status: ${response.status}`);
        }

        return jsonData;

    } catch (error) {
        console.error('🔍 DEBUG API: ❌ Error completo en apiRequest:', error);
        throw error;
    }
};

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        PROFILE: '/auth/profile'
    },
    GAMES: {
        CURRENT: '/games/current',
        NEW: '/games/new',
        SAVE: '/games/save',
        DECISION: '/games/decision',
        RESET: '/games/reset'
    }
};