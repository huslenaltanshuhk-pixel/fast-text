import React from 'react';
import { motion } from 'motion/react';
import { VehicleType, GameState, MultiplayerPlayer } from '../types';

interface TrackProps {
  playerProgress: number; // 0 to 100
  botProgress: number; // 0 to 100
  playerVehicle: VehicleType;
  playerWpm: number;
  botWpm: number;
  botName: string;
  gameState: GameState;
  lang?: 'mn' | 'en';
  isMultiplayer?: boolean;
  multiplayerPlayers?: MultiplayerPlayer[];
  currentPlayerId?: string | null;
}

const VEHICLE_EMOJIS: Record<VehicleType, { emoji: string; name: string; color: string; glowColor: string }> = {
  car: { emoji: '🏎️', name: 'Уралдааны машин', color: 'bg-emerald-500', glowColor: 'rgba(16,185,129,0.5)' },
  rocket: { emoji: '🚀', name: 'Сансрын пуужин', color: 'bg-cyan-500', glowColor: 'rgba(6,182,212,0.5)' },
  horse: { emoji: '🐎', name: 'Хурдан морь', color: 'bg-amber-500', glowColor: 'rgba(245,158,11,0.5)' },
};

const BOT_EMOJIS: Record<VehicleType, string> = {
  car: '🚓',
  rocket: '🛸',
  horse: '🦄',
};

export const Track: React.FC<TrackProps> = ({
  playerProgress,
  botProgress,
  playerVehicle,
  playerWpm,
  botWpm,
  botName,
  gameState,
  lang = 'mn',
  isMultiplayer = false,
  multiplayerPlayers = [],
  currentPlayerId = null,
}) => {
  const pVehicle = VEHICLE_EMOJIS[playerVehicle];
  const botVehicleEmoji = BOT_EMOJIS[playerVehicle];

  return (
    <div className="w-full flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-xl" id="racetrack-container">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-400">
            {lang === 'en' ? 'Racetrack' : 'Уралдааны зам'}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
            {gameState === 'playing' ? '🏁 LIVE RACING' : gameState === 'finished' ? '🏁 FINISHED' : '🚦 READY'}
          </span>
        </div>
      </div>

      {/* Track Lanes Container */}
      <div className={`relative flex flex-col gap-6 py-4 justify-center ${isMultiplayer ? 'min-h-[160px]' : 'h-48'}`}>
        {/* Dashed Finish Line */}
        <div className="absolute right-16 top-0 bottom-0 w-1 border-l-2 border-dashed border-slate-800 pointer-events-none z-10"></div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 font-sans font-black text-2xl tracking-widest transform rotate-90 opacity-20 pointer-events-none select-none">
          FINISH
        </div>

        {isMultiplayer ? (
          /* --- MULTIPLAYER MODE --- */
          multiplayerPlayers.map((player, index) => {
            const isCurrent = player.id === currentPlayerId;
            const vehicleCfg = VEHICLE_EMOJIS[player.vehicle] || VEHICLE_EMOJIS.car;
            
            return (
              <div 
                key={player.id} 
                className={`relative h-12 flex items-center transition-all duration-300 ${
                  gameState === 'playing' || gameState === 'finished' ? 'opacity-100' : 'opacity-80'
                }`}
              >
                {/* Track Lane Background */}
                <div className={`absolute inset-0 rounded-full border transition-all ${
                  isCurrent 
                    ? 'bg-emerald-500/5 border-emerald-500/25 shadow-[inset_0_1px_3px_rgba(16,185,129,0.05)]' 
                    : 'bg-slate-800/20 border-slate-800/40'
                }`}></div>
                
                {/* Progress fill line */}
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isCurrent ? 'bg-emerald-500/40' : 'bg-slate-700/50'
                  }`} 
                  style={{ width: `${Math.min(100, Math.max(1, player.progress))}%` }}
                ></div>

                {/* Vehicle item container */}
                <motion.div
                  className="absolute flex flex-col items-center z-20"
                  initial={{ left: '0%' }}
                  animate={{ left: `calc(${player.progress}% * 0.84)` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                >
                  <div className="flex flex-col items-center relative -top-3">
                    <span 
                      className="text-3.5xl md:text-4.5xl select-none block transition-transform hover:scale-110 active:scale-95 cursor-pointer filter"
                      style={{ filter: `drop-shadow(0 0 12px ${isCurrent ? 'rgba(16,185,129,0.5)' : 'rgba(148,163,184,0.3)'})` }}
                    >
                      {vehicleCfg.emoji}
                    </span>
                    <div className={`mt-1 px-2 py-0.5 text-[8px] md:text-[9px] font-bold rounded uppercase tracking-wider shadow-sm flex items-center gap-1 border ${
                      isCurrent 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      <span className="truncate max-w-[80px] md:max-w-[120px]">
                        {isCurrent ? (lang === 'en' ? 'YOU' : 'ТА') : player.name.split(' ')[0]}
                      </span>
                      <span>({player.wpm} WPM)</span>
                      {player.isFinished && <span className="ml-1 text-[8px]">🏆</span>}
                      {!player.isFinished && player.ready && roomStatusIsLobby(gameState) && (
                        <span className="text-[8px] text-emerald-400 ml-1">✓</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })
        ) : (
          /* --- SINGLE PLAYER MODE (DEFAULT) --- */
          <>
            {/* LANE 1: PLAYER */}
            <div className="relative h-12 flex items-center">
              {/* Track Lane Background */}
              <div className="absolute inset-0 bg-emerald-500/5 rounded-full border border-emerald-500/10"></div>
              
              {/* Progress fill line */}
              <div 
                className="h-1 bg-emerald-500/40 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(1, playerProgress))}%` }}
              ></div>

              {/* Player vehicle item container */}
              <motion.div
                className="absolute flex flex-col items-center z-20"
                initial={{ left: '0%' }}
                animate={{ left: `calc(${playerProgress}% * 0.84)` }}
                transition={{ type: 'spring', stiffness: 70, damping: 15 }}
              >
                <div className="flex flex-col items-center relative -top-3">
                  <span 
                    className="text-4.5xl select-none block transition-transform hover:scale-110 active:scale-95 cursor-pointer filter"
                    style={{ filter: `drop-shadow(0 0 12px ${pVehicle.glowColor})` }}
                  >
                    {pVehicle.emoji}
                  </span>
                  <div className="mt-1.5 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded uppercase tracking-wider shadow-sm">
                    {lang === 'en' ? 'YOU' : 'ТА'} ({playerWpm} WPM)
                  </div>
                </div>
              </motion.div>
            </div>

            {/* LANE 2: BOT */}
            <div className={`relative h-12 flex items-center transition-opacity duration-300 ${gameState === 'playing' ? 'opacity-100' : 'opacity-60'}`}>
              {/* Bot Track Lane Background */}
              <div className="absolute inset-0 bg-slate-800/40 rounded-full border border-slate-800/40"></div>

              {/* Progress fill line */}
              <div 
                className="h-1 bg-slate-700/50 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(1, botProgress))}%` }}
              ></div>

              {/* Bot vehicle container */}
              <motion.div
                className="absolute flex flex-col items-center z-20"
                initial={{ left: '0%' }}
                animate={{ left: `calc(${botProgress}% * 0.84)` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              >
                <div className="flex flex-col items-center relative -top-3">
                  <span className="text-4.5xl filter drop-shadow-md select-none opacity-90">
                    {botVehicleEmoji}
                  </span>
                  <div className="mt-1.5 px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-700">
                    {botName.split(' ')[0]} ({botWpm} WPM)
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper to determine if we should show ready ticks in lobby
function roomStatusIsLobby(gameState: GameState) {
  return gameState === 'idle';
}


