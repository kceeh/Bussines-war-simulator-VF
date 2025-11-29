import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🛑 CLAVE: Usar HashRouter
import { HashRouter } from 'react-router-dom'; 

// 🛑 CLAVE: Sin basename cuando la base de Vite es './'
// const BASE_PATH = ...; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter> 
      <App />
    </HashRouter>
  </React.StrictMode>,
)