import { Link } from 'react-router-dom';
import './Dashboard.scss';

const Dashboard = () => {
  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">utility suite</h1>
        </div>
      </header>
      <div className="dashboard-grid">
        {/* Currency Converter Tile */}
        <Link to="/currency" className="dashboard-tile currency">
          <div className="tile-icon">
            {/* Metro-style currency icon */}
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <span className="tile-label">currency<br/>converter</span>
        </Link>

        {/* Calculator Tile */}
        <Link to="/calculator" className="dashboard-tile calculator">
          <div className="tile-icon">
            {/* Metro-style calculator icon */}
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 17H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm4 8H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4-4H5V5h14v2z"/>
              <rect x="6" y="8" width="1" height="1"/>
              <rect x="10" y="8" width="1" height="1"/>
              <rect x="14" y="8" width="1" height="1"/>
              <rect x="6" y="12" width="1" height="1"/>
              <rect x="10" y="12" width="1" height="1"/>
              <rect x="14" y="12" width="1" height="1"/>
              <rect x="6" y="16" width="1" height="1"/>
              <rect x="10" y="16" width="1" height="1"/>
              <rect x="14" y="16" width="1" height="1"/>
            </svg>
          </div>
          <span className="tile-label">calculator</span>
        </Link>

        {/* Unit Converter Tile */}
        <Link to="/units" className="dashboard-tile units">
          <div className="tile-icon">
            {/* Metro-style conversion/measurement icon */}
            <svg viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-4H7v-2h2V9h2v2h2v2h-2v4zm6-2h-2v-2h2v2zm0-4h-2V9h2v2z"/>
              <path d="M15 13h2v2h-2zm0-4h2v2h-2z"/>
            </svg>
          </div>
          <span className="tile-label">unit<br/>converter</span>
        </Link>

        {/* To-Do List Tile */}
        <Link to="/todo" className="dashboard-tile todo">
          <div className="tile-icon">
            {/* Metro-style checklist icon */}
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              <path d="M8.5 12.5L10 14l4-4"/>
              <circle cx="8.5" cy="8.5" r="1"/>
              <path d="M11 8h5"/>
              <circle cx="8.5" cy="16.5" r="1"/>
              <path d="M11 16h5"/>
            </svg>
          </div>
          <span className="tile-label">to-do list</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;