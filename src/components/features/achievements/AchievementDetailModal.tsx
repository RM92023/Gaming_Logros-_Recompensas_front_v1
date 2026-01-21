import { useEffect } from 'react';

interface AchievementDetailModalProps {
  achievement: any; // Del backend actual
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementDetailModal = ({ 
  achievement, 
  isOpen, 
  onClose 
}: AchievementDetailModalProps) => {
  
  // Focus trap y cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !achievement) return null;

  // Verificar si está completado
  const isCompleted = achievement.isUnlocked || (achievement.progress >= achievement.maxProgress && achievement.maxProgress > 0);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-40 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/50 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Icono principal */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
            <span className="material-symbols-outlined text-4xl text-white">
              {achievement.type === 'kill' ? 'psychology' : achievement.type === 'exploration' ? 'explore' : 'flag'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {achievement.name}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {achievement.description}
          </p>

          {/* Progress Section */}
          {!isCompleted && achievement.maxProgress > 0 && (
            <div className="w-full space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-purple-400">Progress</span>
                <span className="text-white">
                  {Math.round((achievement.progress / achievement.maxProgress) * 100)}% Complete
                </span>
              </div>
              <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Info básica */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-3">
              <span className="material-symbols-outlined text-purple-400 text-2xl mb-1 block">
                flag
              </span>
              <p className="text-xs text-gray-400">Type</p>
              <p className="font-bold text-white capitalize">{achievement.type || 'Achievement'}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <span className="material-symbols-outlined text-purple-400 text-2xl mb-1 block">
                {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-bold text-white">
                {isCompleted ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>

          {/* Achievement ID para desarrolladores */}
          {achievement.id && (
            <div className="text-xs text-gray-500 mb-4">
              ID: {achievement.id}
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 transition-all rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};