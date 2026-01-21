import { AchievementWithProgress } from '../../types/achievement.types';

interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onClick?: () => void;
}

export default function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  // Verificar si está completado (desbloqueado o al 100%)
  const isCompleted = achievement.isUnlocked || (achievement.progress >= achievement.maxProgress && achievement.maxProgress > 0);
  
  const getCardStyle = () => {
    if (isCompleted) {
      return 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20';
    }
    if (achievement.progress > 0) {
      return 'border-2 border-purple-500/50 shadow-lg shadow-purple-500/20';
    }
    if (achievement.isTimed && !isCompleted) {
      return 'border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 animate-pulse';
    }
    return 'bg-gray-800/40 border-2 border-transparent opacity-60 grayscale';
  };

  const getIconColor = () => {
    if (isCompleted) return 'bg-yellow-500/20 text-yellow-400';
    if (achievement.progress > 0) return 'bg-purple-500/20 text-purple-400';
    if (achievement.isTimed) return 'bg-orange-500/20 text-orange-400';
    return 'bg-gray-700/50 text-gray-500';
  };

  const progressPercentage = achievement.maxProgress > 0 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-4 rounded-xl p-5 transition-all cursor-pointer hover:-translate-y-1 ${getCardStyle()}`}
    >
      {/* Header con icono y estado */}
      <div className="flex justify-between items-start">
        <div className={`size-14 rounded-lg flex items-center justify-center ${getIconColor()}`}>
          <span className="material-symbols-outlined text-3xl">
            {achievement.icon || 'emoji_events'}
          </span>
        </div>
        {isCompleted ? (
          <div className="bg-green-500/20 px-2 py-1 rounded text-green-400 text-xs font-bold">
            ✓ COMPLETADO
          </div>
        ) : achievement.progress > 0 ? (
          <div className="bg-purple-500/20 px-2 py-1 rounded text-purple-400 text-xs font-bold">
            {Math.round(progressPercentage)}%
          </div>
        ) : achievement.isTimed ? (
          <div className="bg-orange-500/20 px-2 py-1 rounded text-orange-400 text-xs font-bold">
            TEMPORAL
          </div>
        ) : null}
      </div>

      {/* Título y descripción */}
      <div>
        <h4 className="text-white font-bold text-lg mb-1">{achievement.name}</h4>
        <p className="text-gray-400 text-sm line-clamp-2">{achievement.description}</p>
      </div>

      {/* Footer: Progress o Recompensas */}
      {!isCompleted && achievement.progress > 0 ? (
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progreso</span>
            <span className="text-white font-bold">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      ) : isCompleted ? (
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-sm">
              payments
            </span>
            <span className="text-white text-sm font-bold">{achievement.coinReward}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-sm">
              bolt
            </span>
            <span className="text-white text-sm font-bold">{achievement.xpReward} XP</span>
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-sm">
              payments
            </span>
            <span className="text-white text-sm font-bold">{achievement.coinReward}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-sm">
              bolt
            </span>
            <span className="text-white text-sm font-bold">{achievement.xpReward} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}
