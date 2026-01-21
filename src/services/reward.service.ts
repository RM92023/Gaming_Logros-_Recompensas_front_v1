import api from '../lib/api';
import { Reward, RewardWithStatus, PlayerBalance } from '../types/reward.types';

const REWARD_BASE = import.meta.env.VITE_REWARD_SERVICE_URL || 'http://localhost:3003';

/**
 * Mapea la recompensa del backend al formato UI
 */
const mapRewardToUI = (reward: Reward): RewardWithStatus => {
  return {
    ...reward,
    playerRewardId: reward.id,
    name: `Recompensa ${reward.rewardType}`,
    description: `Has ganado ${reward.rewardAmount} ${reward.rewardType}`,
    rarity: 'COMMON',
    coinValue: reward.rewardType === 'coins' ? reward.rewardAmount : 0,
    xpValue: reward.rewardType === 'points' ? reward.rewardAmount : 0,
    icon: reward.rewardType === 'coins' ? 'payments' : 'bolt',
    source: 'LOGRO',
    assignedAt: reward.awardedAt,
    claimedAt: reward.isClaimed ? reward.awardedAt : null,
    expiresAt: null,
  };
};

/**
 * Obtiene todas las recompensas disponibles
 */
export const getAllRewards = async (): Promise<Reward[]> => {
  const res = await api.get(`${REWARD_BASE}/api/rewards`);
  return res.data;
};

/**
 * Obtiene todas las recompensas de un jugador
 */
export const getPlayerRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const res = await api.get<Reward[]>(`${REWARD_BASE}/api/rewards/players/${playerId}`);
  return res.data.map(mapRewardToUI);
};

/**
 * Obtiene las recompensas asignadas (no reclamadas) de un jugador
 * Filtra localmente las recompensas que no han sido reclamadas
 */
export const getAssignedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const allRewards = await getPlayerRewards(playerId);
  return allRewards.filter(reward => !reward.isClaimed);
};

/**
 * Obtiene las recompensas reclamadas de un jugador
 * Filtra localmente las recompensas que han sido reclamadas
 */
export const getClaimedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const allRewards = await getPlayerRewards(playerId);
  return allRewards.filter(reward => reward.isClaimed);
};

/**
 * Obtiene el balance total del jugador
 */
export const getPlayerBalance = async (playerId: string): Promise<PlayerBalance> => {
  const res = await api.get(`${REWARD_BASE}/api/rewards/balance/${playerId}`);
  return res.data;
};

/**
 * Reclama una recompensa específica
 */
export const claimReward = async (rewardId: string): Promise<Reward> => {
  const url = `${REWARD_BASE}/api/rewards/${rewardId}/claim`;
  console.log('[Frontend] Claiming reward with URL:', url);
  console.log('[Frontend] Reward ID:', rewardId);
  try {
    const res = await api.post(url);
    console.log('[Frontend] Reward claimed successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('[Frontend] Error claiming reward:', error.response?.status, error.response?.data);
    throw error;
  }
};
