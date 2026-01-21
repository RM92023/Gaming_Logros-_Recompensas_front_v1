import { z } from 'zod';

// Schema para registro (username + email)
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido')
});

// Schema para login (email + password)
export const loginSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .min(1, 'La contraseña es requerida')
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede tener más de 50 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Tipos inferidos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Response types del backend
export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  mustChangePassword: boolean;
  coins?: number;
  xp?: number;
  level?: number;
  monstersKilled?: number;
  timePlayed?: number;
  isActive?: boolean;
  isPremium?: boolean;
  premiumPurchasedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  player: AuthResponse;
  message: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}
