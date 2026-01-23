import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth.service';
import StatsGrid from '../components/dashboard/StatsGrid';
import QuickEvents from '../components/dashboard/QuickEvents';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import LatestRewards from '../components/dashboard/LatestRewards';
import PremiumModal from '../components/PremiumModal';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Refrescar datos del usuario al montar el componente
  useEffect(() => {
    const refreshUserData = async () => {
      if (user?.id) {
        try {
          const updatedUser = await authService.getProfile(user.id);
          setUser(updatedUser);
        } catch (error) {
          console.error('Error al refrescar datos del usuario:', error);
        }
      }
    };

    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Panel Principal
          </h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            Bienvenido de nuevo, <span className="text-purple-300 font-semibold">{user?.username}</span>
            {user?.isPremium && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-purple-600 rounded-full text-white text-sm font-bold shadow-lg shadow-yellow-500/30 animate-pulse">
                <Crown className="w-4 h-4" />
                Premium
              </span>
            )}
          </p>
        </div>
        
        {/* Botón Premium si no es premium */}
        {!user?.isPremium && (
          <button
            onClick={() => setShowPremiumModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
          >
            <Crown className="w-5 h-5" />
            Hazte Premium
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid />
      </div>

      {/* Quick Events */}
      <div className="mb-8">
        <QuickEvents />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAchievements />
        <LatestRewards />
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </DashboardLayout>
  );
}
