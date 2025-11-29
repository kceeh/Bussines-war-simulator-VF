// client/src/config/api.js - VERSIÓN COMPLETA CORREGIDA
const API_BASE = 'https://bussines-war-simulator-vf.onrender.com/api';

export const apiRequest = async (endpoint, method = 'GET', data = null) => {
    // ✅ DEBUG EXTRA - mostrar exactamente qué endpoint llega
    console.log('🔍 DEBUG API - Endpoint original:', endpoint);
    console.log('🔍 DEBUG API - Tipo de endpoint:', typeof endpoint);
    console.log('🔍 DEBUG API - Endpoint contiene #:', endpoint.includes('#'));
    
    // ✅ LIMPIAR ENDPOINT MÁS AGRESIVAMENTE
    let cleanEndpoint = endpoint;
    
    // Remover slash inicial si existe
    if (cleanEndpoint.startsWith('/')) {
        cleanEndpoint = cleanEndpoint.substring(1);
    }
    
    // Remover cualquier fragmento de hash (#) si existe
    if (cleanEndpoint.includes('#')) {
        console.warn('🔍 DEBUG API: ⚠️ Endpoint contiene #! Limpiando...');
        cleanEndpoint = cleanEndpoint.split('#')[0];
    }
    
    // Remover doble slash si existe
    cleanEndpoint = cleanEndpoint.replace(/\/\//g, '/');
    
    const fullUrl = `${API_BASE}/${cleanEndpoint}`;
    
    console.log('🔍 DEBUG API - Endpoint limpio:', cleanEndpoint);
    console.log('🔍 DEBUG API - URL final:', fullUrl);
    console.log('🔍 DEBUG API: Método:', method);
    console.log('🔍 DEBUG API: Datos:', data);

    // ✅ OBTENER TOKEN CORRECTAMENTE
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG API: Token disponible:', !!token);

    const options = {
        method: method,
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
        const response = await fetch(fullUrl, options);

        console.log('🔍 DEBUG API: Status:', response.status);
        console.log('🔍 DEBUG API: OK:', response.ok);
        console.log('🔍 DEBUG API: URL real:', response.url);
        
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
        REGISTER: 'auth/register',
        LOGIN: 'auth/login',
        PROFILE: 'auth/profile'
    },
    GAMES: {
        CURRENT: 'games/current',
        NEW: 'games/new',
        SAVE: 'games/save',
        DECISION: 'games/decision',
        RESET: 'games/reset',
        INVESTMENT: 'games/investment',
        ADVANCE: 'games/advance',
        DASHBOARD: 'games/dashboard',
        STATUS: 'games/status'
    }
};