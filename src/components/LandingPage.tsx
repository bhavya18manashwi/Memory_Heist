/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, ShieldAlert, Award, Radio, Zap, Sparkles, Flame, Users, Grid, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onPlayNow: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onViewLeaderboard: () => void;
}

export default function LandingPage({ onPlayNow, onLogin, onRegister, onViewLeaderboard }: LandingPageProps) {
  return (
    <div className="max-w-4xl w-full mx-auto text-center space-y-10 py-6 px-4">
      {/* Visual Header / Hero Segment */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          MULTIPLE OPERATIONAL SECTORS ACTIVE
        </div>
        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight text-white select-none italic uppercase">
          MEMORY <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">HEIST</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-xs md:text-sm">
          A high-intensity multiplayer observation game. Absorb intricate Indian scene details in seconds, coordinate tactics in live chat, and beat the clock.
        </p>
      </div>

      {/* Primary Landing Dashboard Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id="landing-play-now"
          onClick={onPlayNow}
          className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-black text-xs uppercase rounded-lg shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          PLAY NOW
        </button>

        <button
          id="landing-login"
          onClick={onLogin}
          className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 hover:border-cyan-500/30 text-white font-sans font-bold text-xs uppercase rounded-lg hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Agent Login
        </button>

        <button
          id="landing-register"
          onClick={onRegister}
          className="w-full sm:w-auto px-5 py-3 bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/50 text-cyan-400 font-sans font-bold text-xs uppercase rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Register Profile
        </button>

        <button
          id="landing-leaderboard"
          onClick={onViewLeaderboard}
          className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 font-sans font-bold text-xs uppercase rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-blue-400" />
          Leaderboard
        </button>
      </div>

      {/* Visual Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/20 transition-all text-left space-y-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl inline-block">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Live Tactical Co-Op</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Form operational crews of 2 to 4 agents. Observe details together, brainstorm items on the grid, and lock down memory metrics.
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/20 transition-all text-left space-y-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl inline-block">
            <Grid className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Multiple Challenge Sectors</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Toggle between visual Object Coordinates, high-speed Number Series, algebraic grids/Pattern matrices, or narrative Story memories.
          </p>
        </div>

        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/20 transition-all text-left space-y-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl inline-block">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">Gemini Synaptic Scale</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inject full AI complexity. Call on Gemini to scale difficulty, design custom structural blueprints, or invent new high-IQ story scenarios.
          </p>
        </div>
      </div>

      {/* Gameplay Blueprint Guideline / Manual */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left space-y-5 max-w-2xl mx-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Operational Directives (How to Play)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <div className="text-[9px] font-mono text-cyan-400 mb-0.5">STEP 01</div>
            <div className="text-xs font-sans font-bold text-white uppercase">OBSERVE</div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">Absorb details on scene vectors (10–15s)</p>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <div className="text-[9px] font-mono text-cyan-400 mb-0.5">STEP 02</div>
            <div className="text-xs font-sans font-bold text-white uppercase">DISCUSS</div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">Compare notes in co-op chat (30s)</p>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <div className="text-[9px] font-mono text-cyan-400 mb-0.5">STEP 03</div>
            <div className="text-xs font-sans font-bold text-white uppercase">ANSWER</div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">Submit multiple choice answers</p>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <div className="text-[9px] font-mono text-cyan-400 mb-0.5">STEP 04</div>
            <div className="text-xs font-sans font-bold text-white uppercase">SCORE</div>
            <p className="text-[10px] text-slate-500 mt-1 leading-snug">Gain XP, rise on leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
