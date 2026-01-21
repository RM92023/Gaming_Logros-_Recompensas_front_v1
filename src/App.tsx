import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotificationCenter } from './components/features/notifications/NotificationCenter';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Rewards from './pages/Rewards';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';

export default function App() {
  // Monitorear conexión de red
  useNetworkStatus();

  return (
    <div className="App">
      {/* Sistema de notificaciones global */}
      <NotificationCenter />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        
        <Route path="*" element={<div className="p-8 text-white">404 - Página no encontrada</div>} />
      </Routes>
    </div>
  );
}
