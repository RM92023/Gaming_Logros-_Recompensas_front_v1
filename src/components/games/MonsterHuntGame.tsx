import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { submitGameEvent } from '../../services/player.service';
import { getPlayerAchievements } from '../../services/achievement.service';
import { getAssignedRewards } from '../../services/reward.service';
import { AchievementWithProgress } from '../../types/achievement.types';
import Toast from '../common/Toast';
import Confetti from '../common/Confetti';

interface Position {
  x: number;
  y: number;
}

interface Monster {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  color: string;
  level: number;
}

interface BattleState {
  active: boolean;
  monster: Monster | null;
  playerHealth: number;
  monsterHealth: number;
  battleLog: string[];
}

interface MonsterHuntGameProps {
  onMonsterKilled?: (totalKilled: number) => void;
}

// Tipos de monstruos con diferentes niveles y recompensas
const MONSTER_TYPES: Monster[] = [
  { id: 'slime', name: 'Slime', emoji: '🟢', xp: 10, color: 'bg-green-500/40', level: 1 },
  { id: 'goblin', name: 'Goblin', emoji: '👺', xp: 25, color: 'bg-yellow-500/40', level: 2 },
  { id: 'orc', name: 'Orco', emoji: '👹', xp: 50, color: 'bg-orange-500/40', level: 3 },
  { id: 'demon', name: 'Demonio', emoji: '😈', xp: 80, color: 'bg-red-500/40', level: 4 },
  { id: 'dragon', name: 'Dragón', emoji: '🐉', xp: 120, color: 'bg-purple-500/40', level: 5 },
];

// Logros de monstruos (basado en el backend)
const MONSTER_ACHIEVEMENTS = [
  { kills: 3, name: 'FIRST_BLOOD' },
  { kills: 6, name: 'MONSTER_SLAYER_6' },
  { kills: 9, name: 'MONSTER_SLAYER_9' },
  { kills: 12, name: 'MONSTER_SLAYER_12' },
  { kills: 15, name: 'MONSTER_SLAYER_15' },
];

export default function MonsterHuntGame({ onMonsterKilled }: MonsterHuntGameProps) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const GRID_SIZE = 10;
  const [playerPos, setPlayerPos] = useState<Position>({ x: 4, y: 4 });
  const [monsterPos, setMonsterPos] = useState<Position | null>(null);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [monstersKilled, setMonstersKilled] = useState(0); // Total global (backend)
  const [levelMonstersKilled, setLevelMonstersKilled] = useState(0); // Monstruos del nivel actual
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentGameLevel, setCurrentGameLevel] = useState(1);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [levelAchievements, setLevelAchievements] = useState<number[]>([]); // Logros desbloqueados en este nivel
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState>({
    active: false,
    monster: null,
    playerHealth: 100,
    monsterHealth: 100,
    battleLog: [],
  });

  // Obtener achievements del jugador para verificar progreso
  const { data: achievements } = useQuery<AchievementWithProgress[]>({
    queryKey: ['achievements', user?.id],
    queryFn: () => getPlayerAchievements(user!.id),
    enabled: !!user?.id && isPlaying,
    refetchInterval: 2000, // Refrescar cada 2 segundos durante el juego
  });

  // Obtener recompensas pendientes
  const { data: pendingRewards } = useQuery({
    queryKey: ['rewards', 'assigned', user?.id],
    queryFn: () => getAssignedRewards(user!.id),
    enabled: !!user?.id,
    refetchInterval: 3000,
  });

  // Calcular XP necesaria para el siguiente nivel (escala exponencial)
  const calculateXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  // Verificar logros desbloqueados y completitud del nivel
  useEffect(() => {
    // Detectar logros del nivel actual
    const currentLevelAchievements: number[] = [];
    MONSTER_ACHIEVEMENTS.forEach(achievement => {
      if (levelMonstersKilled >= achievement.kills && !levelAchievements.includes(achievement.kills)) {
        currentLevelAchievements.push(achievement.kills);
        
        // Mostrar toast solo para nuevos logros del nivel
        if (!levelAchievements.includes(achievement.kills)) {
          setAchievementToast(
            `🏆 ¡LOGRO DEL NIVEL ${currentGameLevel}!\n\n${achievement.name}\n\nHas derrotado ${achievement.kills} monstruos en este nivel\n\n💰 Recompensa disponible en tu inventario`
          );
        }
      }
    });
    
    if (currentLevelAchievements.length > levelAchievements.length) {
      setLevelAchievements(prev => [...new Set([...prev, ...currentLevelAchievements])]);
    }
    
    // Verificar si el nivel está completo (15 monstruos del nivel)
    if (levelMonstersKilled >= 15 && !showVictoryScreen) {
      setGameCompleted(true);
      setIsPlaying(false);
      setShowVictoryScreen(true);
    }
  }, [levelMonstersKilled, currentGameLevel, levelAchievements, showVictoryScreen]);

  // Seleccionar monstruo aleatorio basado en el nivel del jugador
  const selectRandomMonster = useCallback(() => {
    // Los monstruos disponibles dependen del nivel del jugador
    const availableMonsters = MONSTER_TYPES.filter(m => m.level <= playerLevel + 1);
    const randomIndex = Math.floor(Math.random() * availableMonsters.length);
    return availableMonsters[randomIndex];
  }, [playerLevel]);

  // Generar posición aleatoria para el monstruo
  const generateMonsterPosition = useCallback((playerPosition: Position) => {
    let newPos: Position;
    let attempts = 0;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      attempts++;
    } while (
      (newPos.x === playerPosition.x && newPos.y === playerPosition.y) &&
      attempts < 100
    );
    return newPos;
  }, []);

  // Spawn monstruo en el mapa
  const spawnMonster = useCallback(() => {
    if (gameCompleted) return;
    
    const monster = selectRandomMonster();
    const position = generateMonsterPosition(playerPos);
    
    setCurrentMonster(monster);
    setMonsterPos(position);
    setMessage(`⚠️ ¡Un ${monster.name} salvaje aparece en el mapa!`);
    
    setTimeout(() => setMessage(''), 2000);
  }, [selectRandomMonster, generateMonsterPosition, playerPos, gameCompleted]);

  // Iniciar batalla
  const startBattle = useCallback((monster: Monster) => {
    setBattle({
      active: true,
      monster,
      playerHealth: 100,
      monsterHealth: 100,
      battleLog: [
        `¡Batalla iniciada contra ${monster.name}!`,
        `Nivel del monstruo: ${monster.level}`,
      ],
    });
    setMessage('⚔️ ¡BATALLA INICIADA!');
  }, []);

  // Ejecutar ataque en batalla
  const executeBattleTurn = useCallback(() => {
    setBattle(prev => {
      if (!prev.active || !prev.monster) return prev;
      
      const newLog = [...prev.battleLog];
      let newPlayerHealth = prev.playerHealth;
      let newMonsterHealth = prev.monsterHealth;
      
      // Turno del jugador
      const playerDamage = Math.floor(Math.random() * 20) + 10 + (playerLevel * 5);
      newMonsterHealth -= playerDamage;
      newLog.push(`💥 ¡Atacas por ${playerDamage} de daño!`);
      
      // Verificar si el monstruo fue derrotado
      if (newMonsterHealth <= 0) {
        newLog.push(`🎉 ¡Has derrotado al ${prev.monster.name}!`);
        return {
          ...prev,
          monsterHealth: 0,
          battleLog: newLog,
        };
      }
      
      // Turno del monstruo
      const monsterDamage = Math.floor(Math.random() * 15) + 5 + (prev.monster.level * 3);
      newPlayerHealth -= monsterDamage;
      newLog.push(`💢 ${prev.monster.name} te ataca por ${monsterDamage} de daño!`);
      
      // Mantener solo los últimos 4 mensajes
      const recentLog = newLog.slice(-4);
      
      return {
        ...prev,
        playerHealth: Math.max(0, newPlayerHealth),
        monsterHealth: Math.max(0, newMonsterHealth),
        battleLog: recentLog,
      };
    });
  }, [playerLevel]);

  // Auto-batalla cada 1 segundo
  useEffect(() => {
    if (!battle.active || gameCompleted) return;
    
    const timer = setInterval(() => {
      if (battle.monsterHealth <= 0) {
        // Victoria
        clearInterval(timer);
        handleBattleVictory();
      } else if (battle.playerHealth <= 0) {
        // Derrota
        clearInterval(timer);
        handleBattleDefeat();
      } else {
        executeBattleTurn();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [battle.active, battle.monsterHealth, battle.playerHealth, executeBattleTurn, gameCompleted]);

  // Inicializar juego
  const startGame = () => {
    const initialPlayerPos = { x: 4, y: 4 };
    setPlayerPos(initialPlayerPos);
    setIsPlaying(true);
    setShowVictoryScreen(false);
    setMessage('¡Explora el mapa! Los monstruos aparecerán mientras caminas 🎮');
    
    // Spawn primer monstruo después de 2 segundos
    setTimeout(() => {
      spawnMonster();
    }, 2000);
  };

  // Reiniciar juego para nuevo nivel
  const startNewLevel = () => {
    setCurrentGameLevel(prev => prev + 1);
    setLevelMonstersKilled(0); // Resetear contador del nivel
    setGameCompleted(false);
    setShowVictoryScreen(false);
    setPlayerXP(0);
    setPlayerLevel(1);
    setXpToNextLevel(100);
    setLevelAchievements([]); // Resetear logros del nivel
    startGame();
  };

  // Mutation para registrar el evento de monstruo derrotado
  const submitEventMutation = useMutation({
    mutationFn: submitGameEvent,
    onSuccess: async (updatedPlayer) => {
      console.log('✅ Monstruo derrotado, player actualizado:', updatedPlayer);
      
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
      
      // Invalidar queries para actualizar el dashboard
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['player', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['balance', user?.id] }),
      ]);
    },
    onError: (error: any) => {
      console.error('Error al registrar monstruo:', error);
    },
  });

  // Manejar victoria en batalla
  const handleBattleVictory = useCallback(() => {
    if (!battle.monster) return;
    
    const gainedXP = battle.monster.xp;
    const newTotalXP = playerXP + gainedXP;
    const newKillCount = monstersKilled + 1; // Total global
    const newLevelKillCount = levelMonstersKilled + 1; // Nivel actual
    
    setMonstersKilled(newKillCount); // Actualizar total global
    setLevelMonstersKilled(newLevelKillCount); // Actualizar nivel actual
    
    // Registrar evento en el backend (total global)
    if (user?.id) {
      submitEventMutation.mutate({
        playerId: user.id,
        eventType: 'monster_killed',
        metadata: { value: 1 },
      });
    }
    
    // Sistema de nivel y experiencia
    let newLevel = playerLevel;
    let remainingXP = newTotalXP;
    let currentXPThreshold = xpToNextLevel;
    
    // Verificar si sube de nivel
    while (remainingXP >= currentXPThreshold) {
      newLevel++;
      remainingXP -= currentXPThreshold;
      currentXPThreshold = calculateXPForLevel(newLevel);
      setMessage(`🎊 ¡SUBISTE AL NIVEL ${newLevel}! 🎊`);
    }
    
    setPlayerLevel(newLevel);
    setPlayerXP(remainingXP);
    setXpToNextLevel(currentXPThreshold);
    
    // Mensaje de victoria
    setTimeout(() => {
      setMessage(`✅ Victoria! +${gainedXP} XP | Nivel: ${newLevelKillCount}/15 monstruos`);
    }, 500);
    
    // Callback opcional
    if (onMonsterKilled) {
      onMonsterKilled(newKillCount);
    }
    
    // Cerrar batalla y continuar jugando
    setBattle({
      active: false,
      monster: null,
      playerHealth: 100,
      monsterHealth: 100,
      battleLog: [],
    });
    
    setMonsterPos(null);
    setCurrentMonster(null);
    
    // Spawn nuevo monstruo después de 3-7 segundos
    const spawnDelay = Math.random() * 4000 + 3000;
    setTimeout(() => {
      if (isPlaying && !gameCompleted) {
        spawnMonster();
      }
    }, spawnDelay);
    
  }, [battle.monster, playerXP, monstersKilled, levelMonstersKilled, playerLevel, xpToNextLevel, user?.id, submitEventMutation, onMonsterKilled, isPlaying, gameCompleted, spawnMonster]);

  // Manejar derrota en batalla (por ahora, reiniciar salud)
  const handleBattleDefeat = useCallback(() => {
    setMessage('💀 Has sido derrotado... Recuperando salud...');
    
    // Cerrar batalla
    setBattle({
      active: false,
      monster: null,
      playerHealth: 100,
      monsterHealth: 100,
      battleLog: [],
    });
    
    // El monstruo permanece en el mapa
    setTimeout(() => {
      setMessage('❤️ Salud recuperada. ¡Intenta de nuevo!');
    }, 2000);
  }, []);

  // Detectar colisión con monstruo
  const checkCollision = useCallback((newPlayerPos: Position) => {
    if (!monsterPos || !currentMonster || battle.active) return false;
    
    if (newPlayerPos.x === monsterPos.x && newPlayerPos.y === monsterPos.y) {
      // Iniciar batalla
      startBattle(currentMonster);
      return true;
    }
    return false;
  }, [monsterPos, currentMonster, battle.active, startBattle]);

  // Manejar movimiento del jugador
  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying || battle.active || gameCompleted) return;
    
    setPlayerPos(prevPos => {
      let newPos = { ...prevPos };
      
      switch (direction) {
        case 'up':
          if (prevPos.y > 0) newPos.y -= 1;
          break;
        case 'down':
          if (prevPos.y < GRID_SIZE - 1) newPos.y += 1;
          break;
        case 'left':
          if (prevPos.x > 0) newPos.x -= 1;
          break;
        case 'right':
          if (prevPos.x < GRID_SIZE - 1) newPos.x += 1;
          break;
      }
      
      // Verificar colisión con monstruo
      checkCollision(newPos);
      
      return newPos;
    });
  }, [isPlaying, battle.active, gameCompleted, checkCollision]);

  // Escuchar teclas del teclado
  useEffect(() => {
    if (!isPlaying || battle.active || gameCompleted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, battle.active, gameCompleted, movePlayer]);

  // Renderizar celda del grid
  const renderCell = (x: number, y: number) => {
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isMonster = monsterPos && monsterPos.x === x && monsterPos.y === y;
    
    let bgColor = 'bg-gray-800/40';
    let emoji = '';
    let additionalClass = '';
    
    if (isPlayer && isMonster && currentMonster) {
      // Batalla en curso
      emoji = '💥';
      bgColor = 'bg-yellow-500/60';
      additionalClass = 'animate-pulse';
    } else if (isPlayer) {
      emoji = '🧙‍♂️';
      bgColor = 'bg-blue-500/40';
    } else if (isMonster && currentMonster) {
      emoji = currentMonster.emoji;
      bgColor = currentMonster.color;
      additionalClass = 'animate-pulse';
    }
    
    return (
      <div
        key={`${x}-${y}`}
        className={`
          ${bgColor}
          ${additionalClass}
          border border-gray-700/50
          flex items-center justify-center
          text-2xl
          transition-all duration-150
          hover:border-purple-500/50
        `}
        style={{ 
          width: '100%', 
          height: '100%',
          aspectRatio: '1/1'
        }}
      >
        {emoji}
      </div>
    );
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 shadow-lg">
      {/* Toast de logros */}
      {achievementToast && (
        <Toast
          message={achievementToast}
          onClose={() => setAchievementToast(null)}
        />
      )}

      {/* Pantalla de Victoria */}
      {showVictoryScreen && <Confetti />}
      {showVictoryScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 p-8 rounded-2xl border-2 border-yellow-400 shadow-2xl max-w-2xl w-full animate-pulse">
            <div className="text-center space-y-6">
              <div className="text-6xl">🏆</div>
              <h2 className="text-4xl font-bold text-yellow-400">
                ¡FELICIDADES!
              </h2>
              <h3 className="text-3xl font-bold text-white">
                ¡Has completado el Nivel {currentGameLevel}!
              </h3>
              
              <div className="bg-black/40 p-6 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-purple-300 text-sm">Monstruos del Nivel</p>
                    <p className="text-3xl font-bold text-white">{levelMonstersKilled}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Nivel Jugador</p>
                    <p className="text-3xl font-bold text-white">{playerLevel}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Logros del Nivel</p>
                    <p className="text-3xl font-bold text-yellow-400">{levelAchievements.length}/5</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Total Global</p>
                    <p className="text-3xl font-bold text-green-400">{monstersKilled}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xl text-gray-300">
                  ¡Has completado todos los logros de caza!
                </p>
                
                {(pendingRewards?.length || 0) > 0 && (
                  <div className="bg-green-900/40 border border-green-500/50 p-4 rounded-lg">
                    <p className="text-green-300 font-semibold">
                      💰 Tienes {pendingRewards?.length} recompensa(s) esperando por ti
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/rewards')}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg transform hover:scale-105"
                >
                  💰 Reclamar Recompensas
                </button>
                
                <button
                  onClick={startNewLevel}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg transform hover:scale-105"
                >
                  🎮 Jugar Nivel {currentGameLevel + 1}
                </button>
                
                <button
                  onClick={() => setShowVictoryScreen(false)}
                  className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚔️</span>
            Caza de Monstruos - Nivel {currentGameLevel}
            {gameCompleted && <span className="text-green-400 text-sm">✓ COMPLETADO</span>}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {gameCompleted 
              ? '¡Has completado todos los logros de este nivel!' 
              : 'Explora el mapa y derrota monstruos'}
          </p>
        </div>
        
        {isPlaying && !gameCompleted ? (
          <button
            onClick={() => setIsPlaying(false)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Pausar
          </button>
        ) : gameCompleted ? (
          <button
            onClick={() => setShowVictoryScreen(true)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-bold transition-all shadow-lg animate-pulse"
          >
            🏆 Ver Victoria
          </button>
        ) : (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            {monstersKilled > 0 ? 'Continuar' : 'Iniciar Juego'}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-3 rounded-lg border border-purple-500/30">
          <div className="text-purple-400 text-xs font-semibold">Nivel Jugador</div>
          <div className="text-2xl font-bold text-white">{playerLevel}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/30">
          <div className="text-blue-400 text-xs font-semibold">XP</div>
          <div className="text-sm font-bold text-white">
            {playerXP} / {xpToNextLevel}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(playerXP / xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 p-3 rounded-lg border border-red-500/30">
          <div className="text-red-400 text-xs font-semibold">Monstruos (Nivel)</div>
          <div className="text-2xl font-bold text-white">{levelMonstersKilled} / 15</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-3 rounded-lg border border-green-500/30">
          <div className="text-green-400 text-xs font-semibold">Estado</div>
          <div className="text-sm font-bold text-white">
            {battle.active ? '⚔️ Batalla' : (isPlaying ? '🎮 Explorando' : '⏸️ Pausado')}
          </div>
        </div>
      </div>

      {/* Progreso de Logros del Nivel */}
      {isPlaying && !battle.active && (
        <div className="mb-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
          <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
            🏆 Progreso de Logros - Nivel {currentGameLevel}
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {MONSTER_ACHIEVEMENTS.map((achievement, idx) => {
              const isUnlocked = levelAchievements.includes(achievement.kills);
              const progress = Math.min(levelMonstersKilled, achievement.kills);
              const percentage = (progress / achievement.kills) * 100;
              
              return (
                <div key={idx} className={`p-2 rounded-lg ${isUnlocked ? 'bg-green-900/60 border-2 border-green-500' : 'bg-gray-800/60 border border-gray-600'}`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{isUnlocked ? '✅' : '🏆'}</div>
                    <div className={`text-xs font-semibold ${isUnlocked ? 'text-green-400' : 'text-gray-400'}`}>
                      {progress}/{achievement.kills}
                    </div>
                    {!isUnlocked && (
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-purple-900/40 border border-purple-500/30 rounded-lg text-center text-white text-sm animate-pulse">
          {message}
        </div>
      )}

      {/* Battle Screen */}
      {battle.active && battle.monster && (
        <div className="mb-4 p-4 bg-gradient-to-br from-red-900/60 to-purple-900/40 border-2 border-red-500/50 rounded-xl">
          <h4 className="text-xl font-bold text-white text-center mb-3">
            ⚔️ BATALLA vs {battle.monster.name} {battle.monster.emoji}
          </h4>
          
          {/* Health Bars */}
          <div className="space-y-3 mb-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-300">🧙‍♂️ Tu Salud</span>
                <span className="text-white font-bold">{battle.playerHealth}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${battle.playerHealth}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-300">{battle.monster.emoji} {battle.monster.name}</span>
                <span className="text-white font-bold">{battle.monsterHealth}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${battle.monsterHealth}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Battle Log */}
          <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
            <div className="text-xs space-y-1">
              {battle.battleLog.map((log, i) => (
                <div key={i} className="text-gray-300">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {!battle.active && (
        <div>
          <div 
            className="grid gap-1 mb-4 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              maxWidth: '500px'
            }}
          >
            {Array.from({ length: GRID_SIZE }, (_, y) => 
              Array.from({ length: GRID_SIZE }, (_, x) => renderCell(x, y))
            )}
          </div>

          {/* Controls Info */}
          <div className="text-center text-gray-400 text-sm space-y-1">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span>🧙‍♂️ = Tú</span>
              {MONSTER_TYPES.map(m => (
                <span key={m.id}>{m.emoji} = {m.name} (Nv.{m.level})</span>
              ))}
            </div>
            <div className="text-xs">
              Usa las <span className="text-purple-400 font-semibold">flechas del teclado</span> o <span className="text-purple-400 font-semibold">WASD</span> para moverte
            </div>
            {!gameCompleted && (
              <div className="text-xs text-yellow-400 mt-2">
                Meta: Derrotar 15 monstruos en este nivel | Total Global: {monstersKilled}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
