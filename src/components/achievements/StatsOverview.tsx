import { AchievementWithProgress } from '../../types/achievement.types';

interface StatsOverviewProps {
  achievements?: AchievementWithProgress[];
}

export default function StatsOverview({ achievements = [] }: StatsOverviewProps) {
  // Calcular XP ganado de logros desbloqueados o al 100%
  const totalXP = achievements.reduce((sum, a) => {
    const isComplete = a.isUnlocked || (a.progress >= a.maxProgress && a.maxProgress > 0);
    return sum + (isComplete ? (a.xpReward || 0) : 0);
  }, 0);
  
  // Contar logros completados (desbloqueados o al 100%)
  const unlockedCount = achievements.filter((a) => 
    a.isUnlocked || (a.progress >= a.maxProgress && a.maxProgress > 0)
  ).length;
  
  const completionRate = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;

  const stats = [
    {
      label: 'XP Total',
      value: totalXP.toLocaleString(),
      icon: 'bolt',
      trend: '+150% esta semana',
      trendColor: 'text-green-400',
    },
    {
      label: 'Completitud',
      value: `${Math.round(completionRate)}%`,
      icon: 'analytics',
      progress: completionRate,
    },
    {
      label: 'Rango Global',
      value: 'Elite',
      icon: 'military_tech',
      subtitle: 'Top 5% de jugadores',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 rounded-lg p-2">
                <span className="material-symbols-outlined text-purple-400 text-2xl">
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
          {stat.trend && (
            <p className={`text-sm ${stat.trendColor}`}>{stat.trend}</p>
          )}
          {stat.subtitle && (
            <p className="text-gray-400 text-sm">{stat.subtitle}</p>
          )}
          {stat.progress !== undefined && (
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
