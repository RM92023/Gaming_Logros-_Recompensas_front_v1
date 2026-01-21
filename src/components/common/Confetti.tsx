import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  animationDelay: number;
  backgroundColor: string;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.backgroundColor,
            animationDelay: `${piece.animationDelay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
