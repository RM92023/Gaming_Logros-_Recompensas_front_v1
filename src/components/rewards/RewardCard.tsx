import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RewardWithStatus } from '../../types/reward.types';
import { claimReward } from '../../services/reward.service';
import { useAuthStore } from '../../store/auth';
import { useState } from 'react';

interface RewardCardProps {
  reward: RewardWithStatus;
}

/**
 * RewardCard Component
 * Displays individual reward information with status
 */
export default function RewardCard({ reward }: RewardCardProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const claimMutation = useMutation({
    mutationFn: () => claimReward(reward.id),
    onSuccess: () => {
      setShowSuccess(true);
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['rewards', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'claimed', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['balance', user?.id] });
      
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      console.error('Error claiming reward:', error);
      alert('Error al reclamar la recompensa. Intenta de nuevo.');
    },
  });

  const getRarityColor = (rewardType: string) => {
    switch (rewardType) {
      case 'coins':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
        };
      case 'points':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/50',
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
        };
    }
  };

  const colors = getRarityColor(reward.rewardType);

  return (
    <div 
      className={`bg-gray-800/50 border-2 ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all ${
        reward.isClaimed ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`${colors.bg} rounded-lg p-3 flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${colors.text} text-3xl`}>
            {reward.icon || 'emoji_events'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{reward.name || `${reward.rewardAmount} ${reward.rewardType}`}</h3>
          <p className="text-gray-400 text-xs">De: {reward.source || 'Logro'}</p>
        </div>
      </div>

      {/* Description */}
      {reward.description && (
        <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
      )}

      {/* Status */}
      {reward.isClaimed ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
          <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Reclamada
          </span>
        </div>
      ) : showSuccess ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center animate-pulse">
          <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">celebration</span>
            ¡Reclamada con éxito!
          </span>
        </div>
      ) : (
        <button
          onClick={() => claimMutation.mutate()}
          disabled={claimMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {claimMutation.isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Reclamando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">redeem</span>
              Reclamar Recompensa
            </>
          )}
        </button>
      )}
    </div>
  );
}
