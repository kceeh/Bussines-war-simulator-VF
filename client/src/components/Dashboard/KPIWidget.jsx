// client/src/components/Dashboard/KPIWidget.jsx

import React from 'react';

const KPIWidget = ({ title, value, color }) => {
  return (
    // 'color' será 'bg-white' o un color claro pasado desde DashboardPage.jsx.
    // Usamos border y shadow para definir el bloque.
    <div className={`p-6 rounded-xl shadow-md flex flex-col justify-between ${color} border border-gray-200`}>
      <div>
        {/* Título: Texto gris para que sea legible y no compita con el valor */}
        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
        
        {/* Valor: Texto oscuro y grande para máxima legibilidad y contraste */}
        <p className="text-3xl font-bold mt-1 text-gray-800 dark:text-darkText">{value}</p>
      </div>
      {/* El icono (si se usa) debe ir aquí */}
    </div>
  );
};

export default KPIWidget;