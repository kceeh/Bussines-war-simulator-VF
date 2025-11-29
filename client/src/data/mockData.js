// client/src/data/mockData.js

// Datos simulados para la competencia (Inteligencia Artificial)
export const mockRivalData = [
    { name: "Alpha Corp", capital: 3500000, cuotaMercado: 12.5, strength: "Alta", lastInvestment: "Inversión pesada en I+D", lastActionEffect: "Mejora en Calidad de Producto" },
    { name: "Beta Solutions", capital: 1800000, cuotaMercado: 8.2, strength: "Media", lastInvestment: "Campaña de Marketing Agresiva", lastActionEffect: "Aumento de Reconocimiento de Marca" },
    { name: "Gamma Dynamics", capital: 5200000, cuotaMercado: 15.0, strength: "Alta", lastInvestment: "Optimización de Procesos", lastActionEffect: "Reducción de Costos Fijos" }
];

// Definición de las categorías de decisiones de inversión (Las 10 por opción)
export const decisionCategories = [
    {
        key: 'nivelID',
        name: 'Investigación y Desarrollo',
        cost: 150000,
        gain: '+1 Nivel Calidad (Sube Satisfacción a largo plazo y mejora el crecimiento de Cuota)',
        affectsKPI: 'nivelID',
    },
    {
        key: 'nivelMarketing',
        name: 'Marketing Digital',
        cost: 100000,
        gain: '+1 Nivel Marketing (Sube Cuota de Mercado, impulsa el crecimiento de Ingresos)',
        affectsKPI: 'nivelMarketing',
    },
    {
        key: 'satisfaccion',
        name: 'Capacitación RRHH',
        cost: 50000,
        gain: '+5 pts Satisfacción inmediata. Una alta Satisfacción protege tus Ingresos contra la volatilidad.',
        affectsKPI: 'satisfaccion',
    },
    {
        key: 'ingresos',
        name: 'Expansión de Capacidad',
        cost: 200000,
        gain: '+10% Capacidad de Ingresos Base. Esto sube el techo de tu Ganancia Neta semanal.',
        affectsKPI: 'ingresos',
    },
    {
        key: 'capital_boost', 
        name: 'Optimización de Costos',
        cost: 30000,
        gain: '+1 Nivel Eficiencia. Reduce permanentemente tus Costos Fijos/Sueldos (Gasto Fijo).',
        affectsKPI: 'capital_boost', 
    },
    {
        key: 'campana_imagen',
        name: 'Campaña de Imagen',
        cost: 80000,
        gain: '+2 pts Satisfacción y pequeña mejora de marca (Mejora la retención de Cuota en riesgo)',
        affectsKPI: 'satisfaccion',
    },
    {
        key: 'innovacion_proceso',
        name: 'Innovación de Proceso',
        cost: 120000,
        gain: '+1 Nivel Calidad (Inversión alternativa a I+D, enfocada en la producción)',
        affectsKPI: 'nivelID',
    },
    {
        key: 'contratacion_clave',
        name: 'Contratación Clave',
        cost: 180000,
        gain: 'Aumenta el rendimiento de todas las inversiones en un 5% (Efecto global pequeño)',
        affectsKPI: 'nivelID', 
    },
    {
        key: 'publicidad_segmentada',
        name: 'Publicidad Segmentada',
        cost: 90000,
        gain: '+1 Nivel Marketing (Mayor eficiencia que Marketing Digital)',
        affectsKPI: 'nivelMarketing',
    },
    {
        key: 'mantenimiento_infraestructura',
        name: 'Mantenimiento Infraestructura',
        cost: 70000,
        gain: '+5 pts Satisfacción inmediata (Menor riesgo de falla y mejor servicio)',
        affectsKPI: 'satisfaccion',
    },
];

// ✅ NUEVO: Datos de reporte simulados, necesarios para ReportsPage.jsx
export const mockReportData = {
    title: "Análisis de Decisiones",
    sections: [
        {
            title: "Rendimiento de Inversión (ROI)",
            metrics: [
                { name: "Marketing Digital", roi: "1.2x", detail: "Alta eficacia en las últimas 3 semanas." },
                { name: "Investigación y Desarrollo", roi: "0.8x", detail: "Beneficios aún no materializados; impacto proyectado en 2 semanas." }
            ]
        },
        {
            title: "Desglose de Costos Fijos",
            metrics: [
                { name: "Costo de Sueldos (Base)", value: "250.000", detail: "Aumento por contratación reciente." },
                { name: "Eficiencia (Ahorro)", value: "30.000", detail: "Ahorro generado por la optimización de costos nivel 3." }
            ]
        }
    ]
};