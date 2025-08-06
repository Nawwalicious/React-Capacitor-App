import { Outlet } from 'react-router-dom';
import './App.scss';

function App({ children }) { // Accept children
  return (
    <div className="app">
      <div className="app-container">
        {children} {/* Render the routes here */}
      </div>
    </div>
  );
}

export default App;