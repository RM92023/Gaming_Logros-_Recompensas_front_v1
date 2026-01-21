import { AchievementWithProgress } from '../../types/achievement.types';

interface OverallProgressProps {
  achievements?: AchievementWithProgress[];
}

export default function OverallProgress({ achievements = [] }: OverallProgressProps) {
  // Contar logros completados (desbloqueados o al 100%)
  const unlocked = achievements.filter((a) => 
    a.isUnlocked || (a.progress >= a.maxProgress && a.maxProgress > 0)
  ).length;
  
  const total = achievements.length || 5; // Total real de logros disponibles
  const percentage = total > 0 ? (unlocked / total) * 100 : 0;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-white text-lg font-bold">Viaje al Gran Maestro</h3>
          <p className="text-gray-400 text-sm">
            {total - unlocked} logros restantes para alcanzar Gran Maestro
          </p>
        </div>
        <p className="text-purple-400 text-2xl font-black italic">
          {unlocked}/{total}
        </p>
      </div>
      <div className="rounded-full bg-gray-700 p-1">
        <div
          className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
