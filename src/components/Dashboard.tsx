/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Calendar, Users, Award, User, Flame, TrendingUp, Trophy, Sparkles, AlertCircle, Plus, DoorOpen, Radio } from 'lucide-react';

interface DashboardProps {
  user: any;
  onSelectSolo: (mode: string, theme: string, useAI: boolean) => void;
  onSelectDaily: () => void;
  onCreateMultiplayer: (mode: string, theme: string, useAI: boolean) => void;
  onJoinMultiplayer: (roomCode: string) => void;
  onViewLeaderboard: () => void;
  onViewProfile?: () => void;
  onLogout: () => void;
}

const MODES = [
  { id: 'objects', title: 'Objects & Coordinates', desc: 'Remember colors, placements, and counts' },
  { id: 'numbers', title: 'Numbers & Sequences', desc: 'Recall precise numeric strings under watch' },
  { id: 'patterns', title: 'Pattern Matrix Grid', desc: 'Analyze color configurations and labels' },
  { id: 'story', title: 'Short Narrative Story', desc: 'Read a paragraph and remember key activities' },
  { id: 'mixed', title: 'Mixed Fusion Sector', desc: 'Intense cross-field challenge combine' },
];

const THEMES = [
  'Indian Railway Station',
  'Cricket Stadium',
  'College Campus',
  'Wedding Hall',
  'Street Food Market',
  'Festival Ground',
  'Shopping Mall',
  'Historical Fort',
  'Metro Station',
  'Classroom',
];

export default function Dashboard({
  user,
  onSelectSolo,
  onSelectDaily,
  onCreateMultiplayer,
  onJoinMultiplayer,
  onViewLeaderboard,
  onViewProfile,
  onLogout
}: DashboardProps) {
  const [selectedMode, setSelectedMode] = useState('objects');
  const [selectedTheme, setSelectedTheme] = useState('Indian Railway Station');
  const [useAI, setUseAI] = useState(true);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  const [multiplayerMode, setMultiplayerMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!roomCodeToJoin) {
      setErrorMessage('Please input a valid 6-character room code.');
      return;
    }
    onJoinMultiplayer(roomCodeToJoin);
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 py-4 px-4">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
        <button
          id="btn-dash-profile-trigger"
          onClick={onViewProfile}
          className="flex items-center gap-4 text-left hover:bg-white/5 p-2 rounded-2xl transition-all border border-transparent hover:border-white/10 cursor-pointer group"
          title="Custom Profile Configuration Settings"
        >
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 flex items-center justify-center text-3xl shadow-md select-none transition-all">
            {user.avatar.split(' ')[0]}
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <span>AGENT PROFILE SYNCHRONIZED</span>
              <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.2 rounded group-hover:animate-pulse">EDIT</span>
            </span>
            <h2 className="text-xl font-sans font-black tracking-tight text-white mt-0.5 uppercase italic">Welcome, {user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-slate-300 uppercase">
                {user.stats.rank}
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">
                XP: {user.stats.xp} • Accuracy: {user.stats.accuracy}%
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="dash-logout"
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-[10px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
          >
            DISCONNECT FREQUENCY →
          </button>
        </div>
      </div>

      {/* User Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono text-slate-500">HEIST SCORE</div>
            <div className="text-base font-sans font-black text-white">{user.stats.totalScore}</div>
          </div>
        </div>

        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono text-slate-500">GAMES DONE</div>
            <div className="text-base font-sans font-black text-white">{user.stats.gamesPlayed}</div>
          </div>
        </div>

        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono text-slate-500">ACCURACY</div>
            <div className="text-base font-sans font-black text-white">{user.stats.accuracy}%</div>
          </div>
        </div>

        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-550 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono text-slate-500">BEST STREAK</div>
            <div className="text-base font-sans font-black text-white">{user.stats.bestStreak}</div>
          </div>
        </div>
      </div>

      {/* Main Mode Configuring Segment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Play Now Configuration Console */}
        <div className="md:col-span-2 space-y-6">
          {/* Direct Dual Mode Option Tabs Selector */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-white/10 shrink-0">
            <button
              id="tab-select-solo"
              onClick={() => setMultiplayerMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-sans font-black uppercase transition-all tracking-wide cursor-pointer ${
                !multiplayerMode
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              👤 SOLO MISSIONS (SINGLE-PLAYER)
            </button>
            <button
              id="tab-select-multiplayer"
              onClick={() => setMultiplayerMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-sans font-black uppercase transition-all tracking-wide cursor-pointer ${
                multiplayerMode
                  ? 'bg-purple-500 text-slate-950 shadow-md font-black shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              📡 CO-OP SYNDICATE (MULTIPLAYER)
            </button>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-5 relative overflow-hidden transition-all duration-300">
            {/* Dynamic Watermark Background Grid Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden opacity-[0.02] transition-opacity duration-500">
              <div className="absolute right-[-10%] bottom-[-15%] font-sans font-black tracking-tighter uppercase text-[120px] whitespace-nowrap italic leading-none">
                {selectedTheme}
              </div>
              <div className="absolute left-6 top-6 font-mono tracking-widest uppercase text-[10px] opacity-40">
                SCENIC SYSTEM // {selectedTheme} // ACTIVE SECTOR
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
              <h3 className="text-xs font-sans font-black text-white uppercase flex items-center gap-2 tracking-widest text-slate-400">
                <Radio className="w-4 h-4 text-cyan-400" />
                {multiplayerMode ? '📡 CO-OP SYNAPSE CREATOR' : '👤 STEALTH Blueprints Configure'}
              </h3>
              
              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                multiplayerMode 
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' 
                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
              }`}>
                {multiplayerMode ? '📡 CO-OP ACTIVE' : '👤 OFFLINE SECURE'}
              </span>
            </div>

            {/* Mode Selector */}
            <div className="space-y-2 relative z-10">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">CHALLENGE SECTOR TYPE</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    id={`mode-select-${m.id}`}
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedMode === m.id 
                        ? multiplayerMode
                          ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                          : 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                        : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-sans font-bold tracking-tight uppercase leading-snug">{m.title}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2 relative z-10">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">INDIAN SCENIC THEME</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme}
                    id={`theme-select-${theme.replace(/\s+/g, '')}`}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-2 rounded-xl border text-center text-[10px] font-sans transition-all cursor-pointer truncate relative overflow-hidden ${
                      selectedTheme === theme 
                        ? multiplayerMode
                          ? 'bg-purple-500/15 border-purple-500/50 text-white font-bold'
                          : 'bg-cyan-500/15 border-cyan-500/50 text-white font-bold' 
                        : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                    }`}
                    title={theme}
                  >
                    {selectedTheme === theme && (
                      <span className={`absolute inset-0 pointer-events-none opacity-[0.08] bg-gradient-to-tr ${
                        multiplayerMode ? 'from-purple-500 to-transparent' : 'from-cyan-500 to-transparent'
                      }`} />
                    )}
                    <span className="relative z-10">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional AI generator slider toggle */}
            <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-xl border border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-slate-900 border border-white/5 text-cyan-400 rounded-lg">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </span>
                <div>
                  <div className="text-xs font-sans font-bold text-white uppercase tracking-tight">Scale via Gemini Synapse</div>
                  <div className="text-[10px] text-slate-500">Inject dynamic content scaling / real-time AI scenes</div>
                </div>
              </div>
              <button
                id="toggle-ai-gen"
                onClick={() => setUseAI(!useAI)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  useAI 
                    ? multiplayerMode ? 'bg-purple-500' : 'bg-cyan-500'
                    : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  useAI ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Submit Action */}
            <div className="relative z-10">
              {multiplayerMode ? (
                <div className="space-y-4 pt-2">
                  <button
                    id="btn-create-lobby"
                    onClick={() => onCreateMultiplayer(selectedMode, selectedTheme, useAI)}
                    className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-black font-sans font-black rounded-xl transition-all text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-black stroke-[3px]" />
                    GENERATE SECURE MULTIPLAYER ROOM
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-mono uppercase tracking-widest text-slate-600">OR JOIN ACTIVE LOBBY</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">ENTER ACTIVE CO-OP CODE</div>
                    <form onSubmit={handleJoinSubmit} className="flex gap-2">
                      <input
                        id="join-code-input"
                        type="text"
                        maxLength={6}
                        placeholder="MH8421"
                        value={roomCodeToJoin}
                        onChange={(e) => setRoomCodeToJoin(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-950 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 rounded-xl px-4 py-2 text-center text-sm font-mono tracking-widest text-white uppercase focus:outline-none placeholder-slate-800"
                      />
                      <button
                        id="btn-join-room-submit"
                        type="submit"
                        className="px-6 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 text-xs font-sans font-black uppercase rounded-xl transition-all cursor-pointer"
                      >
                        CONNECT
                      </button>
                    </form>
                    {errorMessage && (
                      <div className="text-[10px] text-rose-400 flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg leading-tight">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  id="btn-start-solo"
                  onClick={() => onSelectSolo(selectedMode, selectedTheme, useAI)}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-black rounded-xl transition-all text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-black fill-black" />
                  LAUNCH SOLO OPERATION
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Tactical Room Entry & Live Daily Link */}
        <div className="space-y-6">
          
          {/* Daily Heist Anchor card */}
          <div className="p-5 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono text-amber-500 flex items-center gap-1 font-bold">
                <Calendar className="w-3 h-3" />
                DAILY HEIST
              </span>
              <span className="text-[9px] font-mono text-slate-500 font-bold">SEED: #ACTIVE</span>
            </div>

            <h3 className="text-sm font-sans font-black text-white leading-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Chinnaswamy Cup Finale
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Observe VIP spectator boxes filled with cricket items. Everyone receives the same challenge layout.
            </p>

            <button
              id="dash-daily"
              onClick={onSelectDaily}
              className="w-full py-2 bg-white/5 border border-amber-500/20 hover:border-amber-500/50 text-amber-300 font-sans font-bold text-xs uppercase rounded-lg transition-all cursor-pointer"
            >
              🔐 SOLVE SECTOR BLUEPRINT
            </button>
          </div>

          {/* Hall of Fame Mini Leaderboard Card */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-xs font-sans font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              GLOBAL OPERATIONS
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Check active tactical ranks, top speed memory accuracies and claim high positions on the records grid.
            </p>

            <button
              id="dash-leaderboard"
              onClick={onViewLeaderboard}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-sans font-bold uppercase rounded-lg transition-all border border-white/10 cursor-pointer"
            >
              Open Leaderboards →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
