import { useQuery } from '@tanstack/react-query';
import { getPlayerById } from '../services/player.service';
import { getPlayerAchievements } from '../services/achievement.service';
import { getPlayerRewards, getPlayerBalance } from '../services/reward.service';
import { useAuthStore } from '../store/auth';

/**
 * Hook personalizado para obtener datos agregados del dashboard del jugador
 */
export const usePlayerDashboard = (playerId?: string) => {
  const user = useAuthStore((s) => s.user);
  const actualPlayerId = playerId || user?.id;

  const playerQuery = useQuery({
    queryKey: ['player', actualPlayerId],
    queryFn: () => getPlayerById(actualPlayerId!),
    staleTime: 0, // Siempre refrescar datos del jugador
    refetchOnMount: 'always', // Forzar refetch al montar
    refetchOnWindowFocus: true, // Refetch al volver al tab
    enabled: !!actualPlayerId,
  });

  const achievementsQuery = useQuery({
    queryKey: ['achievements', actualPlayerId],
    queryFn: () => getPlayerAchievements(actualPlayerId!),
    staleTime: 0, // Siempre refrescar logros
    refetchOnMount: 'always', // Forzar refetch al montar
    refetchOnWindowFocus: true, // Refetch al volver al tab
    enabled: !!actualPlayerId,
  });

  const rewardsQuery = useQuery({
    queryKey: ['rewards', actualPlayerId],
    queryFn: () => getPlayerRewards(actualPlayerId!),
    staleTime: 0, // Siempre refrescar recompensas
    refetchOnMount: 'always', // Forzar refetch al montar
    refetchOnWindowFocus: true, // Refetch al volver al tab
    enabled: !!actualPlayerId,
  });

  const balanceQuery = useQuery({
    queryKey: ['balance', actualPlayerId],
    queryFn: () => getPlayerBalance(actualPlayerId!),
    staleTime: 0, // Siempre refrescar balance
    refetchOnMount: 'always', // Forzar refetch al montar
    refetchOnWindowFocus: true, // Refetch al volver al tab
    enabled: !!actualPlayerId,
  });

  return {
    player: playerQuery.data || user,
    achievements: achievementsQuery.data,
    rewards: rewardsQuery.data,
    balance: balanceQuery.data,
    isLoading: playerQuery.isLoading || achievementsQuery.isLoading,
    error: playerQuery.error || achievementsQuery.error,
  };
};
