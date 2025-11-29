// client/src/pages/ReportsPage.jsx

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { mockReportData } from '../data/mockData';
import { useGame } from '../context/GameContext'; 


const ReportsPage = () => {
    const { gameState, isLoading } = useGame();
    const [report] = useState(mockReportData);

    // Protección de Renderizado. 
    if (isLoading || !gameState || !gameState.nombreEmpresa) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-xl text-indigo-600 animate-pulse">Cargando datos del reporte...</p>
            </div>
        );
    }

    // Función para obtener la fecha actual formateada en español
    const getFormattedDate = () => {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('es-CL', options);
    };

    // Lógica principal de generación de PDF (RF07)
    const generatePdfReport = () => {
        const doc = new jsPDF();
        const currentDate = getFormattedDate(); 

        // Traducción de las claves de los KPIs (usando datos dinámicos de gameState)
        const kpiNamesMap = {
            'semanaActual': 'Semana Actual',
            'capital': 'Capital Disponible',
            'ingresos': 'Ingresos Totales',
            'cuotaMercado': 'Cuota de Mercado (%)',
            'satisfaccion': 'Satisfacción Cliente (%)',
        };

        // --- ENCABEZADO DEL PDF ---
        doc.setFontSize(22);
        doc.text(report.title, 14, 20); 
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Fecha de Emisión: ${currentDate}`, 14, 30); 

        // --- TABLA DE KPIS (Usando DATOS REALES del juego) ---
        const kpiData = [
            ['Empresa', gameState.nombreEmpresa],
            [kpiNamesMap.semanaActual, gameState.semanaActual.toString()],
            [kpiNamesMap.capital, `$${gameState.capital.toLocaleString('es-CL')}`],
            [kpiNamesMap.ingresos, `$${gameState.ingresos.toLocaleString('es-CL')}`],
            [kpiNamesMap.cuotaMercado, `${gameState.cuotaMercado.toFixed(2)}%`],
            [kpiNamesMap.satisfaccion, `${gameState.satisfaccion}%`],
        ];

        doc.autoTable({
          startY: 75,
          head: [['Métrica', 'Valor']], 
          body: kpiData,
          theme: 'grid',
          headStyles: { fillColor: [74, 58, 217], textColor: [255, 255, 255] },
          margin: { left: 14, right: 14 }
        });
        
        // --- CONTENIDO DETALLADO --- (Placeholder)
        doc.text("Análisis de datos (Ver Dashboard para gráficos)", 14, doc.lastAutoTable.finalY + 15);


        doc.save(`Reporte-${gameState.nombreEmpresa}-${currentDate}.pdf`); 
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
                📄 Reportes Históricos
            </h1>
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{report.title}</h2>
                <p className="text-gray-600 mb-2">Empresa: <span className="font-semibold">{gameState.nombreEmpresa}</span></p>
                <p className="text-gray-600 mb-2">Fecha de Emisión Actual: <span className="font-semibold">{getFormattedDate()}</span></p>
                <p className="text-gray-600 mb-6">{report.summary}</p>
                
                <div className="text-center mt-8">
                    <button 
                        onClick={generatePdfReport}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    >
                        Generar Reporte PDF (RF07)
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v4a1 1 0 001 1h4V4H6zm6 8a1 1 0 01-1 1H9a1 1 0 110-2h2a1 1 0 011 1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;