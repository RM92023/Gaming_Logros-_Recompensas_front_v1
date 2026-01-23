import api from '../lib/api';

const PLAYER_BASE = import.meta.env.VITE_PLAYER_SERVICE_URL || 'http://localhost:3001';

export interface GameEventDto {
  playerId: string;
  eventType: string;
  value: number;
}

export const getPlayerById = async (playerId: string) => {
  const response = await api.get(`${PLAYER_BASE}/players/${playerId}`);
  return response.data;
};

export const submitGameEvent = async (eventData: GameEventDto) => {
  const response = await api.post(`${PLAYER_BASE}/players/events`, eventData);
  return response.data;
};