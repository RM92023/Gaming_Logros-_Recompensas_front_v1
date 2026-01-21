import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAchievementById, trackAchievement } from '../../services/achievement.service';
import { AchievementWithProgress } from '../../types/achievement.types';

interface AchievementModalProps {
  achievement: AchievementWithProgress | null;
  onClose: () => void;
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const queryClient = useQueryClient();

  const trackMutation = useMutation({
    mutationFn: () => trackAchievement(achievement!.id),
    onSuccess: () => {
      // Mostrar notificación de éxito (integrar con toast más adelante)
      console.log('Achievement tracked successfully!');
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error tracking achievement:', error);
    },
  });

  if (!achievement) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-400 bg-green-500/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'HARD':
        return 'text-orange-400 bg-orange-500/20';
      case 'LEGENDARY':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-[500px] w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 rounded-lg p-3">
              <span className="material-symbols-outlined text-purple-400 text-4xl">
                {achievement.icon || 'emoji_events'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-2xl font-bold mb-2">{achievement.name}</h2>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(achievement.difficulty)}`}>
                  {achievement.difficulty}
                </span>
                {achievement.isUnlocked && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                    DESBLOQUEADO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h3 className="text-white font-bold mb-2">Descripción</h3>
            <p className="text-gray-400">{achievement.description}</p>
          </div>

          {/* Progress */}
          {!achievement.isUnlocked && achievement.maxProgress > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">Progreso</h3>
                <span className="text-purple-400 font-bold text-lg">
                  {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progreso Actual</span>
                  <span className="text-white font-bold">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div>
            <h3 className="text-white font-bold mb-3">Recompensas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">payments</span>
                <div>
                  <p className="text-gray-400 text-xs">Monedas</p>
                  <p className="text-white font-bold">{achievement.coinReward}</p>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">bolt</span>
                <div>
                  <p className="text-gray-400 text-xs">Experiencia</p>
                  <p className="text-white font-bold">{achievement.xpReward} XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-white font-bold mb-2">Categoría</h3>
            <p className="text-gray-400">{achievement.category}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
          {!achievement.isUnlocked && (
            <button
              onClick={() => trackMutation.mutate()}
              disabled={trackMutation.isPending}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trackMutation.isPending ? 'Rastreando...' : 'Rastrear Logro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
