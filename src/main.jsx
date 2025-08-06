import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes'; // Import AppRoutes
import './App.scss';
import './pages/Dashboard.scss'; // Import new SCSS files
import './pages/Calculator.scss';
import './pages/UnitConverter.scss';
import './pages/Todo/TodoList.scss';
import 'flag-icons/css/flag-icons.min.css';

// The main App component now just provides the overall container if needed,
// but for this structure, we can go directly to routes.
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App> {/* App provides the Outlet */}
        <AppRoutes />
      </App>
    </BrowserRouter>
  </React.StrictMode>
);