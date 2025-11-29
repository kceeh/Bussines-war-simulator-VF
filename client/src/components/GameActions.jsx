// client/src/components/GameActions.jsx
import React, { useState } from 'react';

const GameActions = ({ onDecide, onNextWeek, currentCash }) => {
  const [investmentAmount, setInvestmentAmount] = useState(10000); 

  const handleInvestmentChange = (e) => {
    setInvestmentAmount(Number(e.target.value));
  };
  
  const handleInvestment = (type) => {
    onDecide(type, investmentAmount); 
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Decisiones Estratégicas (RF03)</h2>
      <p className="text-gray-600 mb-6">Elige tus inversiones para influir en el motor económico y la IA (simulado).</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Acción de Inversión en Marketing */}
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Invertir en Marketing</h3>
          <p className="text-sm text-gray-700 mb-3">Aumenta tu cuota de mercado.</p>
          <div className="flex items-center mb-3">
            <label htmlFor="marketing-amount" className="mr-2 text-gray-700 font-medium">Cantidad ($):</label>
            <input
              type="number"
              id="marketing-amount"
              min="10000"
              step="5000"
              value={investmentAmount}
              onChange={handleInvestmentChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            onClick={() => handleInvestment('Marketing')} 
            disabled={currentCash < investmentAmount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentCash < investmentAmount ? 'Fondos Insuficientes' : `Invertir $${investmentAmount.toLocaleString()}`}
          </button>
        </div>

        {/* Acción de Inversión en I+D */}
        <div className="bg-red-50 p-5 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Invertir en I+D</h3>
          <p className="text-sm text-gray-700 mb-3">Desarrolla nuevas tecnologías (RF04).</p>
           <div className="flex items-center mb-3">
            <label htmlFor="rd-amount" className="mr-2 text-gray-700 font-medium">Cantidad ($):</label>
            <input
              type="number"
              id="rd-amount"
              min="10000"
              step="5000"
              value={investmentAmount}
              onChange={handleInvestmentChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button 
            onClick={() => handleInvestment('I+D')} 
            disabled={currentCash < investmentAmount}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentCash < investmentAmount ? 'Fondos Insuficientes' : `Invertir $${investmentAmount.toLocaleString()}`}
          </button>
        </div>

        {/* Botón para Simular Siguiente Semana */}
        <div className="bg-green-50 p-5 rounded-lg border border-green-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Avanzar el Tiempo</h3>
            <p className="text-sm text-gray-700 mb-3">Simula una semana y aplica el impacto de las decisiones.</p>
          </div>
          <button 
            onClick={onNextWeek} 
            className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Avanzar a la Siguiente Semana
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameActions;