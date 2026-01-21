export interface Achievement {
  id: string;
  code: string; // Código único del logro
  name?: string; // Nombre legacy (opcional)
  titleKey: string; // Clave de traducción del título
  descriptionKey: string; // Clave de traducción de la descripción
  description?: string; // Descripción legacy (opcional)
  requiredValue: number; // Valor requerido para desbloquear
  eventType: string; // Tipo de evento (MONSTER_KILLED, etc)
  isTemporal: boolean;
  temporalWindowStart: string | null;
  temporalWindowEnd: string | null;
  isActive: boolean;
  rewardPoints: number; // Puntos de recompensa
  xpReward?: number; // Legacy
  coinReward?: number; // Legacy
  category?: string; // Legacy
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'; // Legacy
  icon?: string; // Legacy
  createdAt: string;
  updatedAt: string;
}

export interface PlayerAchievement {
  id: string;
  playerId: string;
  achievementId: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  isTimed: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  achievement?: Achievement;
}

export interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  isTimed: boolean;
  expiresAt: string | null;
  unlockedAt: string | null;
}

export type AchievementFilterType = 'all' | 'unlocked' | 'locked' | 'timed';
