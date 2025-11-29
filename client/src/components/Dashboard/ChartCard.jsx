import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Función auxiliar simple para añadir opacidad a un color HEX
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ChartCard = ({ title, data, type = 'line', customColor = '#4F46E5' }) => {
  
  const safeData = {
    labels: data?.labels || [],
    datasets: (data?.datasets || []).map((dataset) => ({
      ...dataset,
      label: dataset.label || title,
      // 🎨 AQUÍ ESTÁ LA MAGIA: Usamos el customColor si no viene nada del backend
      borderColor: dataset.borderColor || customColor,
      backgroundColor: dataset.backgroundColor || hexToRgba(customColor, 0.2), // Color de fondo con 20% opacidad
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#fff',
      pointBorderColor: dataset.borderColor || customColor,
      tension: 0.4, 
      fill: true,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
            color: '#374151',
            usePointStyle: true,
            font: { family: "'Inter', sans-serif", size: 12 }
        } 
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
      }
    },
    scales: {
      x: { 
        ticks: { color: '#6B7280', font: { size: 11 } }, 
        grid: { display: false } 
      },
      y: { 
        ticks: { color: '#6B7280', font: { size: 11 } }, 
        grid: { color: '#F3F4F6', borderDash: [5, 5] } 
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
      <div className="flex-grow w-full min-h-[250px]">
         <ChartComponent options={options} data={safeData} />
      </div>
    </div>
  );
};

export default ChartCard;