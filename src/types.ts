export type VehicleType = 'car' | 'rocket' | 'horse';

export type GameState = 'idle' | 'countdown' | 'playing' | 'finished';

export interface WpmHistoryPoint {
  time: number; // in seconds
  wpm: number;
  accuracy: number;
}

export interface Paragraph {
  id: string;
  text: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lang: 'mn' | 'en';
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalCharsTyped: number;
  timeElapsed: number; // in seconds
}
