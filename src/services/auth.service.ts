import api from '../lib/api';
import type { RegisterInput, LoginInput, AuthResponse, RegisterResponse, ChangePasswordInput } from '../schemas/auth.schema';

export const authService = {
  // PUT /players - Registro (devuelve mensaje de éxito, no el jugador)
  register: async (data: RegisterInput): Promise<RegisterResponse> => {
    const response = await api.put('/players', data);
    return response.data;
  },

  // POST /players/login - Login con correo y contraseña
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post('/players/login', data);
    return response.data;
  },

  // POST /players/change-password - Cambiar contraseña
  changePassword: async (playerId: string, data: ChangePasswordInput): Promise<AuthResponse> => {
    const response = await api.post('/players/change-password', {
      playerId,
      newPassword: data.newPassword
    });
    return response.data;
  },

  // GET /players/:id - Obtener perfil
  getProfile: async (id: string): Promise<AuthResponse> => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  }
};
