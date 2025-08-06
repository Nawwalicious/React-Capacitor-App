import { useRoutes } from 'react-router-dom';

// Import Pages
import Dashboard from './pages/Dashboard';
import CurrencyConverter from './pages/CurrencyConverter';
import Calculator from './pages/Calculator';
import UnitConverter from './pages/UnitConverter';
import TodoList from './pages/Todo/TodoList';

export default function AppRoutes() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/currency',
      element: <CurrencyConverter />,
    },
    {
      path: '/calculator',
      element: <Calculator />,
    },
    {
      path: '/units',
      element: <UnitConverter />,
    },
    {
      path: '/todo',
      element: <TodoList />,
    },
    // Add a catch-all or 404 page if you want
    // { path: '*', element: <NotFoundPage /> }
  ]);

  return routes;
}