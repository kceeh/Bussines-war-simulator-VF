import React, { useState, useMemo, useEffect } from 'react'; 
import { useGame } from '../context/GameContext'; 
import { useNavigate } from 'react-router-dom'; 
import { mockRivalData } from '../data/mockData'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==========================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================
const MAX_LEVEL_PER_OPTION = 10; 
const BASE_EMPLOYEE_COST = 5000; 
const EFFICIENCY_IMPACT_RATE = 0.01;
const BASE_EMPLOYEES_NEUTRAL = 5; 

// ✅ LISTA MAESTRA CON DESCRIPCIONES DETALLADAS
const decisionCategories = [
    { 
        key: 'id_product', 
        name: 'Investigación y Desarrollo', 
        cost: 150000, 
        gain: '⭐ +1 Nivel Calidad',
        description: 'Mejora la calidad de tus productos/servicios. Aumenta la satisfacción del cliente a largo plazo y te protege de caídas en ingresos por mala calidad.'
    },
    { 
        key: 'marketing_online', 
        name: 'Marketing Digital', 
        cost: 100000, 
        gain: '📈 +1 Nivel Marketing',
        description: 'Campañas en redes sociales y SEO. Aumenta directamente tu cuota de mercado e ingresos semanales. Efecto inmediato.'
    },
    { 
        key: 'staff_sales', 
        name: 'Capacitación RRHH', 
        cost: 50000, 
        gain: '😊 +5 pts Satisfacción',
        description: 'Entrenamiento para tu equipo de ventas y atención al cliente. Mejora instantánea en satisfacción, protegiendo tus ingresos base.'
    },
    { 
        key: 'id_tech', 
        name: 'Expansión de Capacidad', 
        cost: 200000, 
        gain: '🏭 +10% Capacidad',
        description: 'Inversión en infraestructura que aumenta tu techo de ingresos máximo. Permite crecer más en semanas futuras.'
    },
    { 
        key: 'eff_process', 
        name: 'Optimización de Costos', 
        cost: 30000, 
        gain: '⚙️ +1 Nivel Eficiencia',
        description: 'Automatización y mejora de procesos internos. Reduce permanentemente tus gastos fijos en un 1% por nivel.'
    },
    { 
        key: 'marketing_tv', 
        name: 'Campaña de Imagen', 
        cost: 80000, 
        gain: '✨ +2 pts Satisfacción',
        description: 'Publicidad en medios tradicionales que mejora el reconocimiento de marca. Aumenta la lealtad del cliente y satisfacción.'
    },
    { 
        key: 'eff_training', 
        name: 'Innovación de Proceso', 
        cost: 120000, 
        gain: '🛠️ +1 Nivel Calidad',
        description: 'Implementación de nuevas metodologías de producción. Mejora la calidad mientras optimiza costos operativos.'
    },
    { 
        key: 'staff_support', 
        name: 'Contratación Clave', 
        cost: 180000, 
        gain: '🚀 +1 Nivel Eficiencia',
        description: 'Trae talento especializado a tu empresa. Boost significativo en eficiencia operativa y toma de decisiones.'
    },
    { 
        key: 'ad_segment', 
        name: 'Publicidad Segmentada', 
        cost: 90000, 
        gain: '🎯 +1 Nivel Marketing',
        description: 'Campañas dirigidas a tu mercado objetivo específico. Alto retorno de inversión en crecimiento de cuota.'
    },
    { 
        key: 'infra_maintenance', 
        name: 'Mantenimiento Infra.', 
        cost: 70000, 
        gain: '🔧 +5 pts Satisfacción',
        description: 'Mantenimiento preventivo de equipos e instalaciones. Reduce riesgos de fallos y mejora la percepción de calidad.'
    }
];

// --- FUNCIÓN DE RANKING ---
const getGlobalRanking = (kpis, rivals) => {
    const allPlayers = [
        { 
            name: kpis.nombreEmpresa, 
            capital: kpis.capital || 0, 
            cuotaMercado: kpis.cuotaMercado || 0, 
            isPlayer: true 
        },
        ...(rivals || []).filter(r => r && r.name).map(r => ({
            name: r.name,
            capital: r.capital || 0,
            cuotaMercado: r.cuotaMercado || 0,
            isPlayer: false
        }))
    ];
    allPlayers.sort((a, b) => b.capital - a.capital);
    return allPlayers.map((player, index) => ({
        ...player,
        rank: index + 1,
        color: player.isPlayer ? 'text-indigo-600 font-extrabold' : 'text-gray-800'
    }));
};

// --- WIDGET 1: CARRERA DE LIDERAZGO ---
const LeadershipRaceWidget = ({ ranking }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-500 mb-6">
            <h3 className="text-xl font-extrabold text-green-700 mb-4 flex items-center">
                🏆 Carrera de Liderazgo
            </h3>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Empresa</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Capital</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">Cuota</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {ranking.map((player) => (
                        <tr key={player.name} className={`${player.isPlayer ? 'bg-indigo-50 font-extrabold' : 'hover:bg-gray-50'}`}>
                            <td className={`px-3 py-3 whitespace-nowrap text-sm ${player.color}`}>{player.rank}</td>
                            <td className={`px-3 py-3 whitespace-nowrap text-sm ${player.color}`}>{player.name} {player.isPlayer && "(TÚ)"}</td>
                            <td className={`px-3 py-3 whitespace-nowrap text-sm ${player.color}`}>${player.capital.toLocaleString('es-CL')}</td>
                            <td className={`px-3 py-3 whitespace-nowrap text-sm ${player.color}`}>{player.cuotaMercado.toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- WIDGET 2: ESTADO DE CARRERA ---
const RaceStatusWidget = ({ kpis, settings }) => {
    let status = { text: 'Competitivo / Estable', color: 'bg-blue-100 text-blue-800 border-blue-500', icon: '⚖️' };
    const winGoalCapital = settings?.winGoal?.capital || 5000000; 
    const winGoalMarket = settings?.winGoal?.marketShare || 50;
    const currentCapital = kpis?.capital || 0;
    const currentShare = kpis?.cuotaMercado || 0;
    const maxWeeks = settings?.maxWeeks || 10;

    if (currentCapital < 200000) {
        status = { text: 'ALERTA: Liquidez Crítica', color: 'bg-red-100 text-red-800 border-red-500', icon: '🚨' };
    } else if (currentCapital >= winGoalCapital * 0.8 && currentShare >= winGoalMarket * 0.8) {
        status = { text: 'Liderando la Carrera', color: 'bg-green-100 text-green-800 border-green-500', icon: '🏆' };
    }

    return (
        <div className={`p-4 rounded-xl border-l-8 shadow-sm mb-6 flex justify-between items-center ${status.color} bg-white`}>
            <div>
                <h3 className="font-bold text-lg flex items-center">{status.icon} Estatus: {status.text}</h3>
            </div>
            <div className="text-right">
                <p className="text-xs font-semibold uppercase opacity-70">Meta S{maxWeeks}</p>
                <p className="font-bold">${(winGoalCapital/1000000).toFixed(1)}M / {winGoalMarket}% Cuota</p>
            </div>
        </div>
    );
};

// --- WIDGET 3: RESUMEN DE INVERSIÓN (SIMPLIFICADO) ---
const InvestmentSummaryWidget = ({ totalInvestment, estimatedImpact, totalSelectedCount, maxCount, initialCapital, capitalRemaining, kpis, hasInvested }) => {
    const isOverspent = capitalRemaining < 0;
    
    const currentStrategicPerks = {
        nivelID: kpis?.nivelID || 0, 
        nivelMarketing: kpis?.nivelMarketing || 0,
        nivelEficiencia: kpis?.nivelEficiencia || 0,
    };
    
    return (
        <div className={`bg-white p-4 rounded-xl shadow-lg border-2 mb-6 transition-colors duration-300 ${hasInvested ? 'border-green-500 bg-green-50' : 'border-indigo-300'}`}>
            <h3 className={`text-xl font-extrabold mb-2 ${hasInvested ? 'text-green-800' : 'text-indigo-700'}`}>
                {hasInvested ? '✅ Inversión Confirmada' : '✨ Impacto Estimado Semanal'}
            </h3>
            
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm font-medium text-gray-700">Capital Disponible (Antes):</p>
                <p className="text-md font-bold text-gray-900">${initialCapital.toLocaleString('es-CL')}</p>
            </div>
            
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm font-medium text-gray-700">Costo Proyectado:</p>
                <p className="text-lg font-bold text-red-600">${totalInvestment.toLocaleString('es-CL')}</p>
            </div>
            
            {/* ✅ SOLO UNA LÍNEA DE CAPITAL - ELIMINADA LA REDUNDANCIA */}
            <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-extrabold text-gray-700">Capital para Próxima Semana:</p>
                    <p className={`text-xl font-extrabold ${isOverspent ? 'text-red-700 animate-pulse' : 'text-teal-600'}`}>
                        ${capitalRemaining.toLocaleString('es-CL')}
                    </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Este será tu "Capital al Inicio de Semana" en el Dashboard de la semana {kpis.semanaActual + 1}
                </p>
            </div>
            
            <div className="mt-3 pt-3 border-t">
                 <p className="text-sm font-extrabold text-gray-700 mb-2">Efectos Estratégicos:</p>
                 <p className="text-xs text-gray-700 pl-2 border-l-2 border-orange-500 mb-1">
                    <span className="font-bold text-xs">Satisfacción ({kpis?.satisfaccion || 0}%):</span> Protege de caídas de Ingresos.
                 </p>
                 <p className="text-xs text-gray-700 pl-2 border-l-2 border-orange-500 mb-1">
                    <span className="font-bold text-xs">Ingresos Base (${(kpis?.ingresos || 0).toLocaleString('es-CL')}):</span> Clave para Ganancia Neta.
                 </p>
                 <p className="text-xs text-gray-700 pl-2 border-l-2 border-orange-500 mb-1">
                    <span className="font-bold text-xs">Nivel I+D ({currentStrategicPerks.nivelID}):</span> Mejora Calidad y crecimiento.
                 </p>
                 <p className="text-xs text-gray-700 pl-2 border-l-2 border-orange-500">
                    <span className="font-bold text-xs">Nivel Eficiencia ({currentStrategicPerks.nivelEficiencia}):</span> Reduce Gastos Fijos en {Math.round(currentStrategicPerks.nivelEficiencia * EFFICIENCY_IMPACT_RATE * 100)}%.
                 </p>
            </div>

            <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-extrabold text-gray-700 mb-2">Beneficios Proyectados:</p>
                {(estimatedImpact || []).map((impact, index) => (
                     <p key={index} className="text-xs text-gray-700 mt-1 pl-2 border-l-2 border-green-500">
                         {impact} 
                     </p>
                 ))}
                <p className="text-xs text-gray-500 mt-2">Niveles seleccionados: {totalSelectedCount} de {maxCount} máx.</p>
            </div>
        </div>
    );
};

// --- WIDGET 4: CONTROL DE COSTOS ---
const CostControlWidget = ({ kpis, updateKpis, setNotification }) => {
    
    const employeeCount = kpis?.empleados || BASE_EMPLOYEES_NEUTRAL;
    const fixedCosts = employeeCount * BASE_EMPLOYEE_COST; 

    const employeeDiff = employeeCount - BASE_EMPLOYEES_NEUTRAL;
    let riskMessage = '';
    let riskColor = 'text-gray-600';

    if (employeeDiff > 2) {
        riskMessage = `¡Riesgo Alto! Mayor personal (+${employeeDiff}) aumenta volatilidad.`;
        riskColor = 'text-red-500 font-bold';
    } else if (employeeDiff < -2) {
        riskMessage = `¡Precaución! Menor personal (${employeeDiff}) reduce crecimiento.`;
        riskColor = 'text-yellow-500 font-bold';
    } else {
        riskMessage = "Nivel de personal estable. Volatilidad normal.";
    }

    const handleEmployeeChange = (increment) => {
        const newEmployees = employeeCount + increment;
        if (newEmployees < 1) { 
            setNotification({ message: "Se requiere al menos 1 empleado.", type: 'warning' });
            return;
        }
        updateKpis({ ...kpis, empleados: newEmployees });
        setNotification({ message: `Empleados ajustados a ${newEmployees}.`, type: 'success' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-400 mb-6">
            <h3 className="text-xl font-extrabold text-gray-800 mb-4">💰 Control de Costos Operacionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                    <p className="font-bold text-sm text-gray-700 mb-2">Gastos Fijos (Sueldos)</p>
                    <p className="text-2xl font-extrabold text-red-600 mb-3">${fixedCosts.toLocaleString('es-CL')}</p>
                    <p className="text-sm text-gray-500 mb-2">Empleados: {employeeCount}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => handleEmployeeChange(-1)} className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold">Despedir (-1)</button>
                        <button onClick={() => handleEmployeeChange(1)} className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold">Contratar (+1)</button>
                    </div>
                    <p className={`text-xs mt-3 p-2 bg-gray-50 rounded ${riskColor}`}>{riskMessage}</p> 
                </div>

                <div>
                    <p className="font-bold text-sm text-gray-700 mb-2">Margen Bruto (COGS)</p>
                    <p className="text-2xl font-extrabold text-teal-600 mb-3">30%</p>
                    <p className="text-sm text-gray-500">Porcentaje de ventas que se convierte en Beneficio Bruto.</p>
                </div>
            </div>
        </div>
    );
};

// ================= COMPONENTE PRINCIPAL =================
const DecisionsPage = () => {
    const { user, gameState, processInvestment, advanceWeek, saveGameState, resetGame, isLoading } = useGame(); 
    const navigate = useNavigate(); 
    
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [investmentLevels, setInvestmentLevels] = useState({}); 
    
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [hasInvested, setHasInvested] = useState(false);
    
    const [availableCapital, setAvailableCapital] = useState(0);

    // Inicializar estado
    useEffect(() => {
        if (gameState) {
            setAvailableCapital(gameState.capital || 0);
            setHasInvested(false);
            setInvestmentLevels({});
        }
    }, [gameState?.semanaActual]);

    // Hooks calculados
    const totalInvestment = useMemo(() => {
        return Object.entries(investmentLevels).reduce((sum, [key, level]) => {
            const decision = decisionCategories.find(d => d.key === key);
            return sum + (decision ? decision.cost * level : 0);
        }, 0);
    }, [investmentLevels]);

    const totalSelectedCount = useMemo(() => {
        return Object.values(investmentLevels).reduce((sum, level) => sum + level, 0);
    }, [investmentLevels]);

    if (isLoading || !gameState || !gameState.nombreEmpresa) return <div className="flex h-screen items-center justify-center">Cargando datos del juego...</div>;
    
    const kpis = gameState; 
    const settings = gameState.settings || {};
    
    const displayCapitalRemaining = availableCapital - totalInvestment;

    // Handlers
    const updateKpis = async (newKpis) => { 
        try {
            await saveGameState(newKpis); 
        } catch (error) {
            console.error("Error updating KPIs:", error);
        }
    };

    const handleInvestmentChange = (key, newLevel) => {
        if (hasInvested) return; 
        const level = Math.max(0, Math.min(MAX_LEVEL_PER_OPTION, newLevel));
        if (level === 0) {
            setInvestmentLevels(prev => { const n = { ...prev }; delete n[key]; return n; });
        } else {
            setInvestmentLevels(prev => ({ ...prev, [key]: level }));
        }
    };

    const getPlayerEstimatedImpact = () => {
        const activeKeys = Object.keys(investmentLevels).filter(key => investmentLevels[key] > 0);
        if (activeKeys.length === 0) return ["Mantenimiento de posición actual."];
        const impacts = [];
        if (activeKeys.some(k => k.includes('marketing'))) impacts.push("📈 Aumento en Cuota e Ingresos.");
        if (activeKeys.some(k => k.includes('id'))) impacts.push("⭐ Mejora en Calidad y Satisfacción.");
        if (activeKeys.some(k => k.includes('eff'))) impacts.push("⚙️ Reducción de Gastos Operativos.");
        if (activeKeys.some(k => k.includes('staff'))) impacts.push("😊 Mejora en Satisfacción.");
        return impacts;
    };

    // ✅ CORRECCIÓN CRÍTICA: Función handleSubmitDecisions mejorada
    const handleSubmitDecisions = async () => {
        console.log("🔹 Iniciando handleSubmitDecisions...");
        
        if (totalInvestment === 0) {
            setNotification({ message: "Selecciona al menos 1 nivel de inversión.", type: 'error' });
            return;
        }
        if (displayCapitalRemaining < 0) {
            setNotification({ message: "Capital insuficiente. Reduce las inversiones.", type: 'error' });
            return;
        }

        setIsSubmitting(true);
        console.log("🔹 Enviando inversiones:", investmentLevels);

        try {
            const result = await processInvestment(investmentLevels);
            console.log("🔹 Resultado recibido:", result);
            
            if (result && result.success) {
                console.log("🔹 Inversión exitosa, actualizando estado...");
                
                // ✅ ACTUALIZAR EL ESTADO CON EL NUEVO CAPITAL
                if (result.gameState) {
                    await updateKpis(result.gameState); 
                    setAvailableCapital(result.gameState.capital);
                }
                
                setNotification({ 
                    message: result.message || 'Inversiones aplicadas correctamente.', 
                    type: 'success' 
                });
                setHasInvested(true);
                
                console.log("🔹 Inversión completada exitosamente");
            } else {
                const errorMsg = result?.message || 'Error desconocido al procesar inversión';
                console.error("🔹 Error en inversión:", errorMsg);
                setNotification({ message: errorMsg, type: 'error' });
            }
        } catch (error) {
            console.error("🔹 Error catch en handleSubmitDecisions:", error);
            setNotification({ 
                message: `Error de conexión: ${error.message || "No se pudo procesar la inversión"}`,
                type: 'error' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextWeek = async () => {
        if (kpis.isGameOver) return;
        setIsSubmitting(true); 
        try {
            const result = await advanceWeek();
            if (result && result.success) {
                if (result.gameState) {
                    await updateKpis(result.gameState);
                }
                navigate('/dashboard'); 
            } else {
                setNotification({ message: result?.message || "Error al avanzar", type: 'error' });
            }
        } catch (error) {
            console.error("Error avanzando semana:", error);
            setNotification({ message: "Error de red al avanzar", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRestartGame = () => {
        resetGame();
        navigate('/setup'); 
    };

    // --- FUNCIONES DE REPORTE ---
    const getFinalReportData = () => {
        const reportData = [
            { name: kpis.nombreEmpresa, capital: kpis.capital, share: kpis.cuotaMercado, type: "JUGADOR (TÚ)" },
            ...(kpis.rivalsData || []).map(r => ({ name: r.name, capital: r.capital, share: r.cuotaMercado, type: "COMPETENCIA (IA)" }))
        ];
        reportData.sort((a, b) => b.capital - a.capital);
        return reportData;
    };

    const handleDownloadCSV = () => {
        const reportData = getFinalReportData();
        const headers = ["Ranking,Empresa,Capital Final,Cuota Mercado,Tipo"];
        const rows = reportData.map((d, index) => 
            `${index + 1},"${d.name}","$ ${d.capital.toLocaleString('es-CL')}","${d.share.toFixed(2)}%","${d.type}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Fin_Juego_${kpis.nombreEmpresa.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(`Reporte Final: ${kpis.nombreEmpresa}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        const estadoJuego = kpis.winCondition === 'win' ? 'VICTORIA' : 'DERROTA';
        doc.text(`Semana: ${kpis.semanaActual} | Resultado: ${estadoJuego}`, 14, 30);
        const reportData = getFinalReportData();
        const rows = reportData.map((d, i) => [
            i + 1, d.name, `$ ${d.capital.toLocaleString('es-CL')}`, `${d.share.toFixed(2)}%`, d.type
        ]);
        autoTable(doc, {
            startY: 40,
            head: [['Ranking', 'Empresa', 'Capital Final', 'Cuota Mercado', 'Tipo']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 10, cellPadding: 3 },
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Generado por Business Wars Simulator", 14, finalY);
        doc.save(`Reporte_Fin_Juego_${kpis.nombreEmpresa.replace(/\s+/g, '_')}.pdf`);
    };

    const currentRivals = (kpis.rivalsData || mockRivalData).filter(r => r && r.name);
    const globalRanking = getGlobalRanking(kpis, currentRivals);

    if (kpis.isGameOver) { 
        const winCondition = kpis.winCondition;
        let title, message, icon, color;

        switch(winCondition) {
            case 'win':
                title = '¡VICTORIA EMPRESARIAL!';
                message = `¡Felicidades! ${kpis.nombreEmpresa} ha dominado el mercado.`;
                icon = '🏆';
                color = 'bg-green-600';
                break;
            case 'lose_rival':
                title = 'DERROTA COMPETITIVA';
                message = `La competencia te ha superado.`;
                icon = '🥈';
                color = 'bg-orange-600';
                break;
            case 'lose_bankrupt':
                title = 'QUIEBRA FINANCIERA';
                message = `Tus fondos se han agotado.`;
                icon = '💸';
                color = 'bg-red-700';
                break;
            case 'lose_time':
                title = 'TIEMPO AGOTADO';
                message = `Se cumplió el plazo de ${settings.maxWeeks} semanas.`;
                icon = '⌛';
                color = 'bg-gray-700';
                break;
            default:
                title = 'GAME OVER';
                message = 'La simulación ha terminado.';
                icon = '🛑';
                color = 'bg-gray-800';
        }
        
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-95 p-4">
                <div className={`bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border-4 border-dashed ${winCondition === 'win' ? 'border-green-500' : 'border-gray-400'}`}>
                    <p className="text-8xl mb-4">{icon}</p>
                    <h1 className={`text-4xl font-extrabold mb-3 text-gray-800`}>{title}</h1>
                    <p className="text-xl text-gray-600 mb-8">{message}</p>
                    
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleDownloadCSV} className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 text-sm">📊 CSV</button>
                            <button onClick={handleDownloadPDF} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 text-sm">📄 PDF</button>
                        </div>
                        <button onClick={handleRestartGame} className={`w-full px-6 py-3 ${color} text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg mt-2`}>Volver a Empezar</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-full">
            {/* NOTIFICATION */}
            {notification.message && (
                <div className={`fixed top-4 right-4 p-4 border-l-4 rounded-lg shadow-lg z-50 max-w-sm ${
                    notification.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
                    notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
                    notification.type === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                    'bg-blue-100 border-blue-500 text-blue-700'
                }`}>
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <button 
                            onClick={() => setNotification({ message: '', type: '' })}
                            className="ml-4 text-gray-500 hover:text-gray-700 text-lg font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">🛠️ Centro de Decisiones: {kpis.nombreEmpresa}</h1>
            
            <LeadershipRaceWidget ranking={globalRanking} />
            <CostControlWidget kpis={kpis} updateKpis={updateKpis} setNotification={setNotification} />
            <RaceStatusWidget kpis={kpis} settings={settings} />
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Inversión Estratégica
                <span className="text-base ml-4 text-indigo-600 font-extrabold">(Niveles: {totalSelectedCount})</span>
            </h2>
            
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${hasInvested ? 'opacity-70 pointer-events-none' : ''}`}>
                {decisionCategories.map((decision) => {
                    const currentLevel = investmentLevels[decision.key] || 0;
                    return (
                        <div 
                            key={decision.key} 
                            className={`p-4 rounded-xl shadow-lg border-2 transition-all duration-200 ${
                                currentLevel > 0 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'
                            } hover:border-indigo-400 hover:shadow-md`}
                        >
                            <h3 className="font-bold text-sm text-gray-800 mb-1">{decision.name}</h3>
                            <p className="text-xs text-gray-600 mb-2 font-semibold">{decision.gain}</p>
                            
                            {/* ✅ DESCRIPCIÓN INTEGRADA DENTRO DEL CUADRO */}
                            <div className="mb-3">
                                <p className="text-xs text-gray-500 leading-tight">
                                    {decision.description}
                                </p>
                            </div>
                            
                            <p className="text-xs text-gray-400 mb-2">
                                Costo: <span className="font-bold">${decision.cost.toLocaleString('es-CL')}</span> por nivel
                            </p>
                            <div className="mt-3 pt-3 border-t flex justify-between items-center space-x-2">
                                <p className="font-semibold text-xs text-gray-700">
                                    Nivel: <span className="text-indigo-600 text-base font-extrabold">{currentLevel} / {MAX_LEVEL_PER_OPTION}</span>
                                </p>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleInvestmentChange(decision.key, currentLevel - 1)} 
                                        disabled={currentLevel === 0 || hasInvested} 
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold disabled:bg-gray-300 text-sm hover:bg-red-600 transition"
                                    >
                                        -
                                    </button>
                                    <button 
                                        onClick={() => handleInvestmentChange(decision.key, currentLevel + 1)} 
                                        disabled={currentLevel >= MAX_LEVEL_PER_OPTION || hasInvested} 
                                        className="px-3 py-1 bg-green-500 text-white rounded-lg font-bold disabled:bg-gray-300 text-sm hover:bg-green-600 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center mb-10 space-x-4">
                {!hasInvested ? (
                    <button 
                        onClick={handleSubmitDecisions} 
                        disabled={totalInvestment === 0 || displayCapitalRemaining < 0 || isSubmitting} 
                        className={`px-8 py-3 text-white font-bold rounded-lg shadow-md transition-all transform duration-200 
                            ${totalInvestment === 0 || displayCapitalRemaining < 0 || isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed scale-100 opacity-70' 
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
                    >
                        {isSubmitting 
                            ? '⏳ Procesando...' 
                            : `Aplicar Inversiones ($${totalInvestment.toLocaleString('es-CL')})`}
                    </button>
                ) : (
                    <div className="bg-green-100 border-2 border-green-500 text-green-800 px-8 py-3 rounded-lg font-bold flex items-center shadow-md">
                        ✅ Inversiones Registradas. Esperando cierre de semana.
                    </div>
                )}
            </div>
            
            <InvestmentSummaryWidget 
                totalInvestment={totalInvestment} 
                estimatedImpact={getPlayerEstimatedImpact()} 
                totalSelectedCount={totalSelectedCount} 
                maxCount={MAX_LEVEL_PER_OPTION} 
                initialCapital={availableCapital}
                capitalRemaining={displayCapitalRemaining} 
                kpis={kpis} 
                hasInvested={hasInvested}
            />

            <hr className="my-8" />
            
            <div className="flex justify-center my-10">
                <button 
                    onClick={handleNextWeek} 
                    disabled={isSubmitting}
                    className={`px-8 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Cargando...' : `Avanzar a Semana ${kpis.semanaActual + 1} ➔`}
                </button>
            </div>
            
            {/* ✅ TELETMETRÍA MEJORADA CON MÁS INFORMACIÓN */}
            <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 border-t pt-6">🤖 Análisis de Competencia - Inteligencia de Mercado</h2>
            
            <div className="bg-white rounded-xl shadow overflow-hidden border mb-8">
                 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span>📡</span> Monitoreo Competitivo en Tiempo Real
                    </h3>
                    <p className="text-sm opacity-90">Análisis de movimientos estratégicos de la competencia</p>
                 </div>
                 
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Empresa</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Capital</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cuota</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estrategia Actual</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Impacto</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                         {/* JUGADOR */}
                         <tr className="bg-indigo-50 border-l-4 border-indigo-500">
                             <td className="px-6 py-4 font-bold text-indigo-900">
                                 <div className="flex items-center gap-2">
                                     <span>👑</span>
                                     {kpis.nombreEmpresa} (Tú)
                                 </div>
                             </td>
                             <td className="px-6 py-4 font-bold text-indigo-900">${(kpis.capital || 0).toLocaleString('es-CL')}</td>
                             <td className="px-6 py-4 font-bold text-indigo-900">{(kpis.cuotaMercado || 0).toFixed(2)}%</td>
                             <td className="px-6 py-4 text-indigo-700 font-semibold">
                                 {kpis.lastDecisions?.length > 0 ? (
                                     <div>
                                         <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{kpis.lastDecisions.join(', ')}</span>
                                     </div>
                                 ) : '🔄 Planificando...'}
                             </td>
                             <td className="px-6 py-4">
                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">En Desarrollo</span>
                             </td>
                         </tr>

                         {/* RIVALES CON MÁS DETALLES */}
                         {currentRivals.map((rival, index) => {
                             const threatLevel = rival.capital > kpis.capital * 1.5 ? 'ALTO' : rival.capital > kpis.capital ? 'MEDIO' : 'BAJO';
                             const threatColor = threatLevel === 'ALTO' ? 'bg-red-100 text-red-800' : 
                                               threatLevel === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' : 
                                               'bg-green-100 text-green-800';
                             
                             return (
                                 <tr key={index} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-4 text-gray-700">
                                         <div className="flex items-center gap-2">
                                             <span>🤖</span>
                                             {rival.name}
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-gray-600">
                                         <div className="flex flex-col">
                                             <span>${rival.capital.toLocaleString('es-CL')}</span>
                                             <span className={`text-xs ${rival.capital > kpis.capital ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                 {rival.capital > kpis.capital ? `+${((rival.capital - kpis.capital) / kpis.capital * 100).toFixed(1)}%` : 'Ventaja tuya'}
                                             </span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-gray-600">
                                         <div className="flex flex-col">
                                             <span>{rival.cuotaMercado.toFixed(2)}%</span>
                                             <span className={`text-xs ${rival.cuotaMercado > kpis.cuotaMercado ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                 {rival.cuotaMercado > kpis.cuotaMercado ? `+${(rival.cuotaMercado - kpis.cuotaMercado).toFixed(2)}%` : 'Ventaja tuya'}
                                             </span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="flex flex-col gap-1">
                                             <span className="text-orange-600 font-medium text-sm">{rival.lastInvestment}</span>
                                             <span className="text-xs text-gray-500">Fuerza: {rival.strength}</span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="flex flex-col gap-1">
                                             <span className={`text-xs px-2 py-1 rounded font-semibold ${threatColor}`}>
                                                 Riesgo: {threatLevel}
                                             </span>
                                             <span className="text-xs text-gray-500">{rival.lastActionEffect}</span>
                                         </div>
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
                 
                 {/* ✅ ANÁLISIS COMPETITIVO ADICIONAL */}
                 <div className="bg-gray-50 p-4 border-t">
                     <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                         <span>📊</span> Análisis Competitivo
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                         <div className="bg-white p-3 rounded border">
                             <p className="font-semibold text-gray-700">Posición Relativa:</p>
                             <p className="text-xs text-gray-600">
                                 {currentRivals.filter(r => r.capital > kpis.capital).length > 0 
                                     ? `${currentRivals.filter(r => r.capital > kpis.capital).length} rivales te superan en capital` 
                                     : 'Lideras en capital disponible'}
                             </p>
                         </div>
                         <div className="bg-white p-3 rounded border">
                             <p className="font-semibold text-gray-700">Cuota de Mercado:</p>
                             <p className="text-xs text-gray-600">
                                 {currentRivals.filter(r => r.cuotaMercado > kpis.cuotaMercado).length > 0
                                     ? `${currentRivals.filter(r => r.cuotaMercado > kpis.cuotaMercado).length} rivales tienen mayor cuota`
                                     : 'Tienes ventaja en cuota de mercado'}
                             </p>
                         </div>
                         <div className="bg-white p-3 rounded border">
                             <p className="font-semibold text-gray-700">Recomendación:</p>
                             <p className="text-xs text-gray-600">
                                 {kpis.capital < currentRivals[0]?.capital ? 'Enfócate en aumentar capital' : 'Mantén ventaja competitiva'}
                             </p>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default DecisionsPage;