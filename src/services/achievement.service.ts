import api from '../lib/api';
import { Achievement, PlayerAchievement, AchievementWithProgress } from '../types/achievement.types';

const ACHIEVEMENT_BASE = import.meta.env.VITE_ACHIEVEMENT_SERVICE_URL || 'http://localhost:3002';

/**
 * Convierte PlayerAchievement del backend a AchievementWithProgress para la UI
 */
const mapToAchievementWithProgress = (pa: PlayerAchievement): AchievementWithProgress => {
  const achievement = pa.achievement || {} as any;
  
  // Generar nombre y descripción legibles
  const displayName = achievement.name || achievement.code || achievement.titleKey || 'Logro Desconocido';
  
  // Generar descripción significativa basada en el tipo de logro
  let displayDescription = achievement.description;
  
  // Si la descripción es una clave i18n, generar descripción informativa
  if (!displayDescription || displayDescription.startsWith('achievement.')) {
    const code = achievement.code || '';
    const eventType = achievement.eventType || '';
    const requiredValue = achievement.requiredValue || 100;
    
    // Logros de niveles específicos
    if (eventType.includes('LEVEL_') && eventType.includes('_COMPLETE')) {
      const levelMatch = eventType.match(/LEVEL_(\d+)/);
      const levelNum = levelMatch ? levelMatch[1] : 'X';
      displayDescription = `Completa el Nivel ${levelNum} derrotando ${requiredValue} monstruos. Progreso: ${pa.progress}/${requiredValue}`;
    } else if (eventType.includes('LEVEL_') && eventType.includes('_PROGRESS')) {
      const levelMatch = eventType.match(/LEVEL_(\d+)/);
      const levelNum = levelMatch ? levelMatch[1] : 'X';
      displayDescription = `Progresa en el Nivel ${levelNum} derrotando ${requiredValue} monstruos. Avance: ${pa.progress}/${requiredValue}`;
    } else if (eventType === 'LEVELS_COMPLETED') {
      displayDescription = `Conviértete en Gran Maestro completando los ${requiredValue} niveles del juego. Niveles completados: ${pa.progress}/${requiredValue}`;
    } else if (code.includes('MONSTER_SLAYER')) {
      displayDescription = `Derrota ${requiredValue} monstruos en combate. Progreso actual: ${pa.progress}/${requiredValue}`;
    } else if (code.includes('FIRST_BLOOD')) {
      displayDescription = `Logra tu primera victoria en combate. Derrota ${requiredValue} enemigos para desbloquear.`;
    } else if (code === 'MONSTER_KILLED') {
      displayDescription = `Mata monstruos en tus aventuras. Meta: ${requiredValue} monstruos eliminados.`;
    } else {
      // Fallback genérico
      displayDescription = `Completa este desafío alcanzando ${requiredValue} puntos. Avance: ${pa.progress}/${requiredValue}`;
    }
  }
  
  return {
    // Achievement base properties
    id: achievement.id || pa.achievementId,
    code: achievement.code || 'UNKNOWN',
    name: displayName,
    titleKey: achievement.titleKey || achievement.code || 'achievement.unknown',
    descriptionKey: achievement.descriptionKey || 'achievement.unknown.description',
    description: displayDescription,
    requiredValue: achievement.requiredValue || 100,
    eventType: achievement.eventType || 'GENERAL',
    isTemporal: achievement.isTemporal || false,
    temporalWindowStart: achievement.temporalWindowStart || null,
    temporalWindowEnd: achievement.temporalWindowEnd || null,
    isActive: achievement.isActive !== undefined ? achievement.isActive : true,
    rewardPoints: achievement.rewardPoints || 0,
    xpReward: achievement.rewardPoints || 0,
    coinReward: achievement.rewardPoints || 0,
    category: achievement.eventType || 'GENERAL',
    difficulty: 'MEDIUM' as const,
    icon: 'emoji_events',
    createdAt: achievement.createdAt || pa.createdAt || new Date().toISOString(),
    updatedAt: achievement.updatedAt || pa.updatedAt || new Date().toISOString(),
    
    // PlayerAchievement properties
    isUnlocked: !!pa.unlockedAt, // Calcular basado en unlockedAt
    progress: pa.progress || 0,
    maxProgress: achievement.requiredValue || pa.maxProgress || 100,
    isTimed: achievement.isTemporal || false,
    expiresAt: achievement.temporalWindowEnd || null,
    unlockedAt: pa.unlockedAt || null,
  };
};

/**
 * Obtiene todos los achievements disponibles
 */
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/api/achievements`);
  return res.data;
};

/**
 * Obtiene los achievements de un jugador con su progreso
 */
export const getPlayerAchievements = async (playerId: string): Promise<AchievementWithProgress[]> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/api/achievements/players/${playerId}`);
  const playerAchievements: PlayerAchievement[] = res.data;
  return playerAchievements.map(mapToAchievementWithProgress);
};

/**
 * Obtiene el progreso específico de un achievement
 */
export const getAchievementProgress = async (
  playerId: string,
  achievementId: string
): Promise<PlayerAchievement> => {
  const res = await api.get(
    `${ACHIEVEMENT_BASE}/api/achievements/players/${playerId}/${achievementId}/progress`
  );
  return res.data;
};

/**
 * Obtiene un achievement específico por ID
 */
export const getAchievementById = async (achievementId: string): Promise<Achievement> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/achievements/${achievementId}`);
  return res.data;
};

/**
 * Marca un achievement como objetivo activo (si existe este endpoint)
 */
export const trackAchievement = async (achievementId: string): Promise<void> => {
  await api.post(`${ACHIEVEMENT_BASE}/achievements/${achievementId}/track`);
};
