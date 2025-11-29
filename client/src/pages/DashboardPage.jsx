import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext'; 
import { useNavigate } from 'react-router-dom';
import KPIWidget from '../components/Dashboard/KPIWidget'; 
import ChartCard from '../components/Dashboard/ChartCard';
import { mockRivalData } from '../data/mockData'; 
import { Pie } from 'react-chartjs-2'; 
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';

// Registro de componentes de gráficos
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// ==========================================
// 1. LÓGICA DE INTELIGENCIA RIVAL (RIESGO)
// ==========================================
const getThreatAnalysis = (rival, userKpis) => {
    const userShare = userKpis.cuotaMercado || 0;
    const userCapital = userKpis.capital || 0;
    
    if (rival.cuotaMercado > userShare) {
        return { label: 'ALTA', color: 'text-red-500 bg-red-900/30 border-red-500', icon: '🔥', desc: 'Domina más mercado que tú.' };
    }
    if (rival.capital > userCapital * 1.10) {
        return { label: 'MEDIA', color: 'text-yellow-500 bg-yellow-900/30 border-yellow-500', icon: '⚠️', desc: 'Fuertes recursos financieros.' };
    }
    return { label: 'BAJA', color: 'text-green-500 bg-green-900/30 border-green-500', icon: '🛡️', desc: 'Sin ventaja competitiva actual.' };
};

const RivalIntelligenceWidget = ({ kpis }) => {
    const rivals = kpis.rivalsData || [];

    return (
        <div className="bg-gray-900 p-4 rounded-xl shadow-xl text-white h-full overflow-y-auto max-h-[500px] custom-scrollbar border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center text-cyan-400">
                <span className="text-2xl mr-2">🤖</span> Inteligencia Rival (Live)
            </h3>
            <div className="space-y-3">
                {rivals.map((rival, index) => {
                    const threat = getThreatAnalysis(rival, kpis);
                    return (
                        <div key={index} className={`p-4 rounded-lg border-l-4 bg-gray-800 relative transition-all hover:bg-gray-750 ${threat.color.replace('text-', 'border-')}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm text-gray-100">{rival.name}</h4>
                                <span className={`text-[10px] font-extrabold px-2 py-1 rounded border uppercase tracking-wider ${threat.color}`}>{threat.icon} {threat.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div><p className="text-[10px] text-gray-400 uppercase">Cuota Actual</p><p className="text-base font-mono font-bold text-white">{rival.cuotaMercado.toFixed(2)}%</p></div>
                                <div><p className="text-[10px] text-gray-400 uppercase">Capital Est.</p><p className="text-base font-mono font-bold text-green-400">${rival.capital.toLocaleString('es-CL')}</p></div>
                            </div>
                            <div className="pt-2 border-t border-gray-700 mt-1"><p className="text-xs text-gray-400 italic flex items-center gap-1"><span>ℹ️</span> {threat.desc}</p></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ==========================================
// 2. WIDGET DE FLUJO DE CAJA (ACTUALIZADO - SIN VERIFICACIÓN)
// ==========================================
const WeeklyProfitLossWidget = ({ kpis }) => {
    const BASE_EMPLOYEE_COST = 5000; 
    const REVENUE_SHARE = 0.70; 
    
    const currentEmployees = kpis?.empleados || 0;
    const currentIngresos = kpis?.ingresos || 0;
    const capitalFinal = kpis?.capital || 0;
    
    const capitalInicial = kpis?.capitalInicial || 0;
    const nivelEficiencia = kpis?.nivelEficiencia || 0;
    
    const lastInvestmentCost = kpis?.lastInvestmentCost || 0;

    // --- CÁLCULOS EXACTOS ---
    const efficiencyDiscount = Math.min(0.4, nivelEficiencia * 0.02);
    const FIXED_COSTS = Math.round((currentEmployees * BASE_EMPLOYEE_COST) * (1 - efficiencyDiscount));
    
    const grossIncome = Math.round(currentIngresos * REVENUE_SHARE); 
    const costOfSales = currentIngresos - grossIncome; 
    const weeklyProfit = grossIncome - FIXED_COSTS; 
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-teal-500 mt-6 mb-8">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                <span>💰</span> Flujo de Caja y Desglose Financiero Semanal
            </h3>
            
            {/* FILA 1: CAPITAL INICIAL */}
            <div className="mb-6">
                <div className="flex justify-between items-end">
                    <h4 className="font-extrabold text-lg text-gray-900 uppercase">CAPITAL AL INICIO DE SEMANA</h4>
                    <span className="font-extrabold text-xl text-gray-900">${capitalInicial.toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 border-b border-gray-200 pb-4">
                    Monto disponible de la semana anterior. La Ganancia Neta se suma a este valor.
                    {lastInvestmentCost > 0 && (
                        <span className="block text-orange-600 font-semibold mt-1">
                            💡 Incluye deducción de inversiones de la semana anterior: -${lastInvestmentCost.toLocaleString('es-CL')}
                        </span>
                    )}
                </p>
            </div>
            
            <div className="space-y-5">
                {/* FILA 2: INGRESOS */}
                <div>
                    <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900">Ingresos Totales (Ventas)</span>
                        <span className="text-blue-600">${currentIngresos.toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Dinero total generado por las ventas de tus productos/servicios esta semana.
                    </p>
                </div>

                {/* FILA 3: COSTOS DE VENTA */}
                <div>
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>(-) Costo de Ventas (COGS) / Margen (30% aplicado)</span>
                        <span>-${costOfSales.toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 border-b border-gray-100 pb-2">
                        Costo directo asociado a las ventas (ej. producción). Aquí se aplica tu margen bruto fijo del 30%.
                    </p>
                </div>
                
                {/* FILA 4: BENEFICIO BRUTO */}
                <div>
                    <div className="flex justify-between font-bold text-base">
                        <span className="text-gray-900">Beneficio Bruto</span>
                        <span className="text-green-600">${grossIncome.toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 border-b border-gray-100 pb-2">
                        Ganancia residual después de cubrir el Costo de Ventas, antes de otros gastos.
                    </p>
                </div>

                {/* FILA 5: GASTOS FIJOS */}
                <div>
                    <div className="flex justify-between text-red-600 font-medium">
                        <span>(-) **Gastos Fijos** / Sueldos ({currentEmployees} empleados)</span>
                        <span>-${FIXED_COSTS.toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 border-b border-gray-200 pb-4">
                        Costos operativos (ej. salarios).
                        {efficiencyDiscount > 0 && <span className="text-green-600 font-bold ml-1">(Ahorro Eficiencia: {Math.round(efficiencyDiscount*100)}%)</span>}
                    </p>
                </div>

                {/* FILA 6: GANANCIA NETA */}
                <div>
                    <div className="flex justify-between font-extrabold text-lg">
                        <span className="text-gray-900 uppercase">GANANCIA NETA (SUMA AL CAPITAL)</span>
                        <span className={weeklyProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {weeklyProfit >= 0 ? '+' : ''}${weeklyProfit.toLocaleString('es-CL')}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* ✅ ELIMINADA LA SECCIÓN DE VERIFICACIÓN */}
            
            {/* FILA 8: CAPITAL FINAL */}
            <div className="flex justify-between items-center font-extrabold text-xl pt-4 border-t-4 border-teal-500 mt-6">
                <span className="text-gray-900 uppercase">CAPITAL DISPONIBLE (Final KPI)</span>
                <span className="text-teal-700 text-2xl">
                    ${capitalFinal.toLocaleString('es-CL')}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                El Capital Inicial más la Ganancia Neta de esta semana.
                {kpis.semanaActual > 1 && (
                    <span className="block text-orange-600 font-semibold mt-1">
                        💡 Este será tu "Capital al Inicio" para la semana {kpis.semanaActual + 1}
                    </span>
                )}
            </p>
        </div>
    );
};

// ==========================================
// 3. COMPONENTE DE VOLATILIDAD MEJORADO
// ==========================================
const VolatilityChartCard = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Impacto de la Volatilidad del Mercado</h3>
            <div className="mb-4">
                <ChartCard 
                    title="" 
                    data={data} 
                    type="line" 
                    customColor="#F59E0B" 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-1">📈 ¿Qué es la Volatilidad?</h4>
                    <p className="text-blue-700 text-xs">Fluctuaciones impredecibles del mercado que afectan tus ingresos semanales.</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-1">⚡ Cómo te Afecta</h4>
                    <p className="text-green-700 text-xs">Valores positivos aumentan tus ingresos, negativos los disminuyen.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-1">🛡️ Cómo Protegerte</h4>
                    <p className="text-purple-700 text-xs">Invierte en I+D y mantén alta satisfacción para reducir impacto.</p>
                </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="font-bold">💡 Interpretación:</span> Un valor de +3% significa que el mercado favoreció tus ingresos esta semana. 
                Un -2% indica condiciones adversas. La línea muestra la tendencia general del mercado.
            </p>
        </div>
    );
};

const RecommendationWidget = ({ kpis }) => {
    return (
        <div className="p-5 rounded-xl shadow-md border-l-8 bg-white border-blue-500 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2">💡 Análisis de Situación</h3>
            <p className="text-gray-700">
                {kpis.semanaActual === 1 
                 ? "Inicio del juego. Concéntrate en establecer una base de ingresos sólida invirtiendo en Marketing." 
                 : "El mercado reacciona a tus decisiones. Revisa la competencia en la sección de Inteligencia Rival."}
            </p>
        </div>
    );
};

// ==========================================
// 4. COMPONENTE PRINCIPAL (DASHBOARD)
// ==========================================
const DashboardPage = () => {
    const { gameState, isLoading, user } = useGame(); 
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading || !gameState || !gameState.nombreEmpresa) return <div className="flex h-screen items-center justify-center bg-gray-50">Cargando Dashboard...</div>;

    const kpis = gameState; 
    
    const handleGoToDecisions = () => {
        navigate('/decisions'); 
    };
    
    const displayCompanyName = kpis?.nombreEmpresa || user?.companyName || 'Mi Empresa';
    const currentRivals = kpis.rivalsData || mockRivalData;

    // Configuración de Gráfico de Torta
    const playerShare = kpis.cuotaMercado || 0;
    const totalRivalShare = currentRivals.reduce((sum, r) => sum + (r.cuotaMercado || 0), 0);
    
    const chartColors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#A855F7'];

    const pieData = {
        labels: [kpis.nombreEmpresa, ...currentRivals.map(r => r.name), 'Resto del Mercado'],
        datasets: [{
            data: [playerShare, ...currentRivals.map(r => r.cuotaMercado), Math.max(0, 100 - (playerShare + totalRivalShare))],
            backgroundColor: chartColors,
            hoverBackgroundColor: chartColors,
            borderWidth: 1,
            borderColor: '#ffffff'
        }]
    };

    // Datos seguros para gráficos
    const safeRevenueData = kpis.revenueChartData || { labels: [], datasets: [] };
    const safeMarketData = kpis.marketShareChartData || { labels: [], datasets: [] };
    const safeVolatilityData = kpis.volatilityChartData || { labels: [], datasets: [] };

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Dashboard Ejecutivo: <span className="text-indigo-600">{displayCompanyName}</span>
                    </h1>
                    <p className="text-lg text-gray-500 mt-2">Reporte de situación - Semana {kpis.semanaActual}</p>
                </div>
                <button 
                    onClick={handleGoToDecisions} 
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2"
                >
                    <span>🛠️</span> Tomar Decisiones
                </button>
            </div>

            <RecommendationWidget kpis={kpis} />

            {/* SECCIÓN DE KPIS */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Indicadores Clave (KPIs)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPIWidget title="Capital Disponible" value={`$${(kpis.capital || 0).toLocaleString('es-CL')}`} color="bg-white" />
                    <KPIWidget title="Ingresos Semanales" value={`$${(kpis.ingresos || 0).toLocaleString('es-CL')}`} color="bg-white" />
                    <KPIWidget title="Cuota de Mercado" value={`${(kpis.cuotaMercado || 0).toFixed(2)}%`} color="bg-white" />
                    <KPIWidget title="Satisfacción Cliente" value={`${kpis.satisfaccion || 0}%`} color="bg-white" />
                </div>
            </div>

            {/* WIDGET FINANCIERO (ACTUALIZADO - SIN VERIFICACIÓN) */}
            <WeeklyProfitLossWidget kpis={kpis} />

            {/* SECCIÓN DE GRÁFICOS */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Tendencias Históricas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard 
                        title="Historial de Ingresos" 
                        data={safeRevenueData} 
                        type="line" 
                        customColor="#3B82F6" 
                    /> 
                    <ChartCard 
                        title="Historial de Cuota de Mercado" 
                        data={safeMarketData} 
                        type="line" 
                        customColor="#10B981" 
                    />
                </div>
                
                {/* ✅ GRÁFICO DE VOLATILIDAD MEJORADO */}
                <div className="mt-8">
                    <VolatilityChartCard data={safeVolatilityData} />
                </div>
            </div>

            {/* SECCIÓN INFERIOR: TORTA Y RIVALES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                {/* GRÁFICO DE TORTA */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Distribución del Mercado Total</h3>
                    <div className="flex-grow relative flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                
                {/* WIDGET DE INTELIGENCIA RIVAL */}
                <div className="h-full">
                    <RivalIntelligenceWidget kpis={kpis} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;