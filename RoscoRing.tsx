import React from 'react';
import { QuestionItem } from './gameData';

export type QuestionStatus = 'pending' | 'correct' | 'wrong' | 'passed';

interface RoscoRingProps {
  questions: QuestionItem[];
  currentIndex: number;
  statuses: Record<number, QuestionStatus>;
  onSelectQuestion: (index: number) => void;
  ringMode: 'all50' | 'part1' | 'part2';
}

export const RoscoRing: React.FC<RoscoRingProps> = ({
  questions,
  currentIndex,
  statuses,
  onSelectQuestion,
  ringMode,
}) => {
  // Always display the 25 letters of El Rosco exactly as in the TV show:
  // A, B, C, D, E, F, G, H, I, J, L, M, N, Ñ, O, P, Q, R, S, T, U, V, X, Y, Z
  // If ringMode is 'part2', we show questions 26-50 mapped to A-Z; if 'part1' or 'all50', we show based on the active question's round.
  const isRound2 = ringMode === 'part2' || (ringMode === 'all50' && currentIndex >= 25);
  const offset = isRound2 ? 25 : 0;
  
  // 25 letters around the circle
  const visibleIndices: number[] = React.useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => i + offset);
  }, [offset]);

  const count = 25; // Authentic Pasapalabra letter circle size
  const size = 500;
  const center = size / 2;
  const radius = size * 0.415;
  const bubbleRadius = 22; // Perfect size for bold capital letters

  const currentQ = questions[currentIndex];

  return (
    <div className="relative w-full max-w-[480px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Studio glowing background disc */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-b from-sky-500/20 via-blue-600/15 to-sky-950/40 backdrop-blur-md border border-sky-400/20 shadow-[0_0_60px_rgba(2,132,199,0.35)] pointer-events-none" />

      {/* Rosco SVG Ring */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full transform transition-transform duration-300"
      >
        <defs>
          {/* Radial glow for current active bubble */}
          <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Authentic TV show 3D green sphere gradient */}
          <radialGradient id="greenGloss" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="25%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>

          {/* Authentic TV show 3D blue sphere gradient */}
          <radialGradient id="blueGloss" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="30%" stopColor="#0284c7" />
            <stop offset="75%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>

          {/* Red wrong gradient */}
          <radialGradient id="redGloss" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="30%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          {/* Orange passed gradient */}
          <radialGradient id="orangeGloss" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Active flashing yellow/gold gradient */}
          <radialGradient id="activeGloss" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>
        </defs>

        {/* Central connecting orbit track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(56, 189, 248, 0.3)"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />

        {/* Render each letter bubble around the Rosco circle */}
        {visibleIndices.map((qIdx, order) => {
          // In standard Pasapalabra, 'A' starts at the top (angle = -PI/2) and proceeds clockwise
          const angle = (2 * Math.PI * order) / count - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const q = questions[qIdx];
          if (!q) return null;

          const status = statuses[q.id] || 'pending';
          const isActive = qIdx === currentIndex;

          let fillUrl = 'url(#blueGloss)';
          let strokeColor = '#bae6fd';
          let strokeW = 2;

          if (status === 'correct') {
            fillUrl = 'url(#greenGloss)';
            strokeColor = '#ffffff';
            strokeW = 2.5;
          } else if (status === 'wrong') {
            fillUrl = 'url(#redGloss)';
            strokeColor = '#ffffff';
            strokeW = 2.5;
          } else if (status === 'passed') {
            fillUrl = 'url(#orangeGloss)';
            strokeColor = '#fef08a';
            strokeW = 2.5;
          }

          if (isActive) {
            strokeColor = '#ffffff';
            strokeW = 4;
          }

          return (
            <g
              key={q.id}
              onClick={() => onSelectQuestion(qIdx)}
              className="cursor-pointer transition-all duration-200 group"
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              {/* Outer pulsing ring for currently active letter */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={bubbleRadius + 7}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  opacity="0.85"
                  className="animate-ping"
                />
              )}

              {/* Main bubble sphere */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? bubbleRadius + 3 : bubbleRadius}
                fill={isActive ? 'url(#activeGloss)' : fillUrl}
                stroke={strokeColor}
                strokeWidth={strokeW}
                filter={isActive ? 'url(#activeGlow)' : undefined}
                className="transition-all duration-200 group-hover:scale-110 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              />

              {/* Top-left glossy 3D glass highlight */}
              <ellipse
                cx={x - bubbleRadius * 0.3}
                cy={y - bubbleRadius * 0.35}
                rx={bubbleRadius * 0.45}
                ry={bubbleRadius * 0.25}
                fill="rgba(255, 255, 255, 0.6)"
                transform={`rotate(-25 ${x - bubbleRadius * 0.3} ${y - bubbleRadius * 0.35})`}
                className="pointer-events-none"
              />

              {/* The prominent Rosco Capital Letter (A, B, C, D... Ñ... Z) */}
              <text
                x={x}
                y={y + (q.letter === 'Ñ' ? 6 : 7)}
                textAnchor="middle"
                fill={isActive ? '#0f172a' : '#ffffff'}
                fontSize={q.letter === 'Ñ' ? 16 : 18}
                fontWeight="900"
                fontFamily="Montserrat, sans-serif"
                className="pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
              >
                {q.letter}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center of the Rosco: Active Letter display and category */}
      <div className="absolute inset-[24%] flex flex-col items-center justify-center text-center p-3 rounded-full pointer-events-none">
        <div className="text-[11px] uppercase tracking-widest text-sky-200 font-bold mb-0.5">
          {isRound2 ? 'Մաս 2 · Frutas y Verduras' : 'Մաս 1 · Verbos'}
        </div>
        
        {/* Giant Active Letter in Center */}
        <div className="flex items-baseline justify-center gap-1.5 my-0.5">
          <span className="text-5xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
            {currentQ?.letter || 'A'}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-sky-300">
            (#{currentQ?.id || 1})
          </span>
        </div>

        <div className="text-xs text-sky-100 font-medium px-2.5 py-0.5 rounded-full bg-sky-900/80 border border-sky-400/40 shadow-sm mt-1">
          {currentQ?.category === 'verbos' ? '🇪🇸 Բայեր' : '🍎 Մրգեր/Բանջ.'}
        </div>
      </div>
    </div>
  );
};
