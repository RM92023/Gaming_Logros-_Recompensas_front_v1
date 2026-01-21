import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth';
import type { LoginInput, RegisterInput, ChangePasswordInput } from '../schemas/auth.schema';

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (player) => {
      setUser(player);
      // Si debe cambiar contraseña, redirigir a página de cambio
      if (player.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmPassword'>) => 
      authService.register(data)
    // No hacer nada en onSuccess - el componente maneja el éxito
  });
}

export function useChangePassword() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: ChangePasswordInput) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return authService.changePassword(user.id, data);
    },
    onSuccess: (updatedPlayer) => {
      setUser(updatedPlayer);
      navigate('/dashboard');
    }
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => Promise.resolve(), // Ya no hay endpoint de logout
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      // Incluso si falla, limpiamos localmente
      logout();
      navigate('/login');
    }
  });
}
