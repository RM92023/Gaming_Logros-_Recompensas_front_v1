import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Crown, Lock } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsOverview from '../components/achievements/StatsOverview';
import OverallProgress from '../components/achievements/OverallProgress';
import Toolbar from '../components/achievements/Toolbar';
import AchievementGrid from '../components/achievements/AchievementGrid';
import AchievementModal from '../components/achievements/AchievementModal';
import { AchievementDetailModal } from '../components/features/achievements/AchievementDetailModal';
import PremiumModal from '../components/PremiumModal';
import { getPlayerAchievements } from '../services/achievement.service';
import { useAuthStore } from '../store/auth';
import { AchievementFilterType, AchievementWithProgress } from '../types/achievement.types';

export default function Achievements() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.id;
  const isPremium = user?.isPremium || false;

  const [filter, setFilter] = useState<AchievementFilterType>('all');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all'); // Filtro por nivel
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', playerId],
    queryFn: () => getPlayerAchievements(playerId!),
    enabled: !!playerId,
  });

  const filteredAchievements = useMemo(() => {
    let result = achievements || [];

    // Primero filtrar por nivel si está seleccionado
    if (levelFilter !== 'all') {
      result = result.filter((a) => {
        const eventType = a.eventType || '';
        // Extraer el nivel del eventType (ej: LEVEL_2_COMPLETE -> 2)
        const levelMatch = eventType.match(/LEVEL_(\d+)/);
        if (levelMatch) {
          return parseInt(levelMatch[1]) === levelFilter;
        }
        // Si no tiene LEVEL_ en el eventType, no pertenece a ningún nivel específico
        return false;
      });
    }

    // Luego filtrar por tipo (desbloqueados/bloqueados/temporales)
    if (filter === 'unlocked') {
      // Incluir logros desbloqueados O al 100% de progreso
      result = result.filter((a) => a.isUnlocked || (a.progress >= a.maxProgress && a.maxProgress > 0));
    } else if (filter === 'locked') {
      // Mostrar solo logros que NO estén desbloqueados Y que no estén al 100%
      result = result.filter((a) => !a.isUnlocked && !(a.progress >= a.maxProgress && a.maxProgress > 0));
    } else if (filter === 'timed') {
      result = result.filter((a) => a.isTimed && !a.isUnlocked);
    }

    // Finalmente buscar por nombre o descripción
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.name?.toLowerCase() || '').includes(query) ||
          (a.description?.toLowerCase() || '').includes(query)
      );
    }

    return result;
  }, [achievements, filter, levelFilter, searchQuery]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Logros
        </h1>
        <p className="text-gray-400">
          Rastrea tu progreso y desbloquea recompensas
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview achievements={achievements} />

      {/* Overall Progress */}
      <OverallProgress achievements={achievements} />

      {/* Toolbar */}
      <Toolbar
        filter={filter}
        onFilterChange={setFilter}
        onSearch={setSearchQuery}
      />

      {/* Level Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setLevelFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            levelFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Todos los Niveles
        </button>
        {[1, 2, 3, 4, 5].map((level) => {
          const levelCount = achievements?.filter((a) => {
            const eventType = a.eventType || '';
            const levelMatch = eventType.match(/LEVEL_(\d+)/);
            return levelMatch && parseInt(levelMatch[1]) === level;
          }).length || 0;
          
          const isLocked = level >= 3 && !isPremium;
          
          return (
            <button
              key={level}
              onClick={() => {
                if (isLocked) {
                  setShowPremiumModal(true);
                } else {
                  setLevelFilter(level);
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
                levelFilter === level
                  ? 'bg-purple-600 text-white'
                  : isLocked
                  ? 'bg-gradient-to-r from-yellow-500/20 to-purple-600/20 border border-yellow-500/30 text-gray-300 hover:border-yellow-500/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {isLocked && <Lock className="w-4 h-4 text-yellow-400" />}
              Nivel {level}
              {isLocked && <Crown className="w-4 h-4 text-yellow-400" />}
              {levelCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isLocked ? 'bg-yellow-500/30' : 'bg-purple-500/30'
                }`}>
                  {levelCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <AchievementGrid
        achievements={filteredAchievements}
        isLoading={isLoading}
        onCardClick={setSelectedAchievement}
      />

      {/* Modal Original */}
      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />

      {/* Nuevo Modal Detallado */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </DashboardLayout>
  );
}
