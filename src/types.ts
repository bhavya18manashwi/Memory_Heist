/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'objects' | 'numbers' | 'patterns' | 'story' | 'mixed';
export type ChallengeTheme = 
  | 'Indian Railway Station'
  | 'Cricket Stadium'
  | 'College Campus'
  | 'Wedding Hall'
  | 'Street Food Market'
  | 'Festival Ground'
  | 'Shopping Mall'
  | 'Historical Fort'
  | 'Metro Station'
  | 'Classroom';

export interface UserStats {
  totalScore: number;
  gamesPlayed: number;
  accuracy: number; // 0 to 100
  rank: string; // e.g. "Bronze II", "Silver I", "Gold III", "Memory Master"
  xp: number;
  bestStreak: number;
  achievementsUnlocked: string[]; // List of achievement IDs
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string; // url or preset identifier
  stats: UserStats;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string; // ISO string
}

export interface ChallengeItem {
  name: string;
  color: string;
  position: string; // e.g. "top-left", "center", "beside laptop"
  count?: number;
}

export interface PatternCell {
  row: number;
  col: number;
  color: string;
  symbol?: string;
}

// Full challenge asset data passed to frontend
export interface ChallengeScene {
  theme: ChallengeTheme;
  mode: GameMode;
  title: string;
  description: string;
  
  // Mode-specific data payload
  objects?: ChallengeItem[];
  numbersSequence?: string;
  patternGrid?: {
    rows: number;
    cols: number;
    cells: PatternCell[];
  };
  storyText?: string;
  
  imageUrl?: string; // Generated scene image block
}

export interface GameQuestion {
  id: string;
  text: string;
  options: string[]; // MCQ choice labels
  correctAnswer: string;
  points: number;
}

export interface PlayerState {
  userId: string;
  username: string;
  avatar: string;
  xp: number;
  ready: boolean;
  score: number;
  answersSubmitted: Record<string, string>; // questionId -> submitted answer
  answersCorrectPercent: number; // calculated results metrics
  completionTime: number; // seconds taken to answer
  typing?: boolean;
}

export interface GameSession {
  id: string; // e.g. "MH4827"
  isMultiplayer: boolean;
  mode: GameMode;
  theme: ChallengeTheme;
  status: 'lobby' | 'observe' | 'discuss' | 'answer' | 'results';
  timerLeft: number; // Countdown seconds remaining
  scene: ChallengeScene;
  questions: GameQuestion[];
  players: Record<string, PlayerState>;
  chat: ChatMessage[];
  maxPlayers: number;
  hostId: string;
  dailyChallengeDate?: string; // If daily heist
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  rank: string;
  score: number;
  accuracy: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string; // icon name or emoji
  unlockedAt?: string;
}
