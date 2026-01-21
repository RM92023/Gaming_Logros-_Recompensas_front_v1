import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { submitGameEvent } from '../../services/player.service';
import { getPlayerAchievements } from '../../services/achievement.service';
import { getPlayerBalance } from '../../services/reward.service';
import EventCard from './EventCard';
import { useEffect, useState } from 'react';
import Toast from '../common/Toast';
import { useQuery } from '@tanstack/react-query';
import MonsterHuntGame from '../games/MonsterHuntGame';

export default function QuickEvents() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [previousAchievements, setPreviousAchievements] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number>(user?.level || 1);
  const [previousMonsters, setPreviousMonsters] = useState<number>(0);

  // Obtener achievements para mostrar progreso
  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => getPlayerAchievements(user!.id),
    enabled: !!user?.id,
    staleTime: 0,
  });

  // Calcular siguiente logro de monstruos
  const getNextMonsterAchievement = () => {
    if (!achievements) return null;
    
    const monstersKilled = user?.monstersKilled || 0;
    const monsterAchievements = achievements
      .filter(a => a.achievement.eventType === 'MONSTER_KILLED')
      .sort((a, b) => a.achievement.requiredValue - b.achievement.requiredValue);
    
    // Encontrar el primer logro no desbloqueado
    const nextAchievement = monsterAchievements.find(a => !a.unlockedAt);
    
    if (nextAchievement) {
      // Limitar el progreso actual a no superar el valor requerido
      const currentProgress = Math.min(monstersKilled, nextAchievement.achievement.requiredValue);
      
      return {
        name: nextAchievement.achievement.code,
        current: currentProgress,
        required: nextAchievement.achievement.requiredValue,
        progress: (currentProgress / nextAchievement.achievement.requiredValue) * 100
      };
    }
    
    return null;
  };

  // Cargar logros y nivel iniciales
  useEffect(() => {
    if (user?.id) {
      getPlayerAchievements(user.id).then(achievements => {
        setPreviousAchievements(achievements.filter(a => a.unlockedAt !== null));
      }).catch(() => {});
      
      setPreviousLevel(user.level || 1);
      setPreviousMonsters(user.monstersKilled || 0);
    }
  }, [user?.id]);

  const submitEventMutation = useMutation({
    mutationFn: submitGameEvent,
    onSuccess: async (updatedPlayer) => {
      console.log('✅ Evento registrado, player actualizado:', updatedPlayer);
      
      // Calcular nivel basado en monstruos (cada 3 monstruos = 1 nivel)
      const monstersKilled = updatedPlayer.monstersKilled || 0;
      const newLevel = Math.floor(monstersKilled / 3) + 1;
      const progressToNextLevel = monstersKilled % 3;
      
      // Detectar subida de nivel
      const leveledUp = newLevel > previousLevel;
      
      setPreviousLevel(newLevel);
      setPreviousMonsters(monstersKilled);
      
      // Actualizar el usuario en el store de auth (sin await)
      if (updatedPlayer) {
        setUser({
          ...user!,
          monstersKilled: updatedPlayer.monstersKilled,
          timePlayed: updatedPlayer.timePlayed,
          level: updatedPlayer.level,
          coins: updatedPlayer.coins,
          xp: updatedPlayer.xp,
        });
      }
      
      // Invalidar y refrescar queries EN PARALELO (sin bloquear)
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['player', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['balance', user?.id] }),
      ]).then(() => {
        // Después de invalidar, refrescar datos
        queryClient.refetchQueries({ queryKey: ['player', user?.id] });
        queryClient.refetchQueries({ queryKey: ['balance', user?.id] });
        queryClient.refetchQueries({ queryKey: ['achievements', user?.id] });
      });
      
      // Verificar logros en segundo plano (reducido a 200ms)
      setTimeout(async () => {
        try {
          const [currentAchievements, balance] = await Promise.all([
            getPlayerAchievements(user!.id),
            getPlayerBalance(user!.id)
          ]);
          
          const unlockedAchievements = currentAchievements.filter(a => a.unlockedAt !== null);
          
          // Detectar nuevos logros desbloqueados
          const newUnlocked = unlockedAchievements.filter(current => 
            !previousAchievements.some(prev => prev.achievementId === current.achievementId)
          );
          
          if (newUnlocked.length > 0) {
            // Mostrar toast por cada logro desbloqueado
            newUnlocked.forEach((achievement, index) => {
              setTimeout(() => {
                const achievementName = achievement.achievement.name || achievement.achievement.code;
                const rewardPoints = achievement.achievement.rewardPoints || 0;
                
                setToastMessage(
                  `🎉 ¡LOGRO DESBLOQUEADO!\n\n` +
                  `🏆 ${achievementName}\n\n` +
                  `💰 Monedas: ${rewardPoints}\n` +
                  `⭐ Puntos: ${Math.floor(rewardPoints / 2)}`
                );
              }, index * 1600); // Espaciar toasts si hay múltiples logros
            });
            
            setPreviousAchievements(unlockedAchievements);
          }
        } catch (error) {
          console.error('Error al verificar logros:', error);
        }
      }, 200); // Reducido de 500ms a 200ms
    },
    onError: (error: any) => {
      console.error('Error completo al enviar evento:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Error desconocido';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'No se puede conectar al backend. ¿Está corriendo en http://localhost:3001?';
        } else {
          errorMessage = `Error de conexión: ${error.code}`;
        }
      }
      
      alert(`Error al registrar evento: ${errorMessage}`);
    },
  });

  const handleEventSubmit = (eventType: string, value: number = 1) => {
    console.log('Usuario completo:', user);
    console.log('ID del jugador:', user?.id);
    console.log('Tipo de evento:', eventType);
    console.log('Valor:', value);
    
    if (!user?.id) {
      alert('Error: No se encontró el ID del jugador');
      return;
    }
    
    const eventData = {
      playerId: user.id,
      eventType,
      value,
    };
    
    console.log('Datos del evento a enviar:', eventData);
    console.log('URL del backend:', 'http://localhost:3001/players/events');
    
    submitEventMutation.mutate(eventData);
  };

  return (
    <div>
      {/* Toast para logros desbloqueados */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
      
      <h2 className="text-2xl font-bold text-white mb-6">Eventos Rápidos</h2>
      
      {/* Juego de Caza de Monstruos */}
      <MonsterHuntGame 
        onMonsterKilled={(total) => {
          console.log(`Total de monstruos derrotados: ${total}`);
        }}
      />
    </div>
  );
}
