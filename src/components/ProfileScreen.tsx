/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Shield, User, Sparkles, CheckCircle, TrendingUp, Cpu, Sliders, ArrowLeft, Gamepad2 } from 'lucide-react';

const TEAM_AVATARS = [
  { name: '🕵️‍♂️ Sherlock', label: 'Sherlock Sharma' },
  { name: '☕ Chai Lover', label: 'Chai Lover' },
  { name: '🏏 Cricketer', label: 'Gully Cricketer' },
  { name: '🚇 Metro Raider', label: 'Metro Raider' },
  { name: '🍛 Curry King', label: 'Curry King' },
  { name: '👑 Fort Ruler', label: 'Amber Lord' },
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
}

interface ProfileScreenProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  onBack: () => void;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_heist', title: 'First Heist', description: 'Complete your first memory challenge successfully.', badge: '🕵️‍♂️' },
  { id: 'perfect_recall', title: 'Perfect Recall', description: 'Get a perfect 100% score on any challenge.', badge: '🧠' },
  { id: 'speed_observer', title: 'Speed Observer', description: 'Submit all answers with more than 15 seconds remaining.', badge: '⚡' },
  { id: 'memory_master', title: 'Memory Master', description: 'Reach 10,000 Total XP.', badge: '👑' },
  { id: 'daily_champion', title: 'Daily Champion', description: 'Participated in a Daily co-op Heist.', badge: '📅' },
  { id: 'multiplayer_winner', title: 'Multiplayer Winner', description: 'Secure 1st place in a live multiplayer match.', badge: '🏆' },
];

export default function ProfileScreen({ user, onUpdateUser, onBack }: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const MILESTONES = [
    { xp: 0, label: 'Stealth Recruit', type: 'Level 1', desc: 'Secure entry into the cyber heist network', badge: '🕵️‍♂️' },
    { xp: 1000, label: 'Observer Level 2', type: 'Level 2', desc: 'Secure observation feed upgrades', badge: '📡' },
    { xp: 1500, label: 'Bronze Master', type: 'Rank Up', desc: 'Official Tactical Rank Tag: Bronze Master', badge: '🥉' },
    { xp: 2000, label: 'Agent Level 3', type: 'Level 3', desc: 'Tactical database clearance authorization', badge: '🔐' },
    { xp: 3000, label: 'Operative Level 4', type: 'Level 4', desc: 'Bypass auxiliary security firewalls', badge: '⚡' },
    { xp: 4050, label: 'Silver Elite', type: 'Rank Up', desc: 'Official Tactical Rank Tag: Silver Elite', badge: '🥈' },
    { xp: 5000, label: 'Mind Intruder', type: 'Level 5', desc: 'Highly synchronized generative model filters', badge: '🧠' },
    { xp: 8000, label: 'Gold Champion', type: 'Rank Up', desc: 'Official Tactical Rank Tag: Gold Champion', badge: '🥇' },
    { xp: 10000, label: 'Memory Master', type: 'Max Rank', desc: 'Earn the legendary title inside the system', badge: '👑' },
  ];

  const xp = user?.stats?.xp || 0;
  const level = Math.floor(xp / 1000) + 1;
  const currentLevelMinXp = (level - 1) * 1000;
  const nextLevelMinXp = level * 1000;
  const xpInCurrentLevel = xp - currentLevelMinXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 1000) * 100));

  const getRankBadge = (rankName: string = 'Bronze I') => {
    const isGold = rankName.toLowerCase().includes('gold') || rankName.toLowerCase().includes('champion');
    const isSilver = rankName.toLowerCase().includes('silver') || rankName.toLowerCase().includes('elite');
    const isBronze = rankName.toLowerCase().includes('bronze');
    const isMemoryMaster = rankName.toLowerCase().includes('memory master') || (rankName.toLowerCase().includes('master') && !isBronze);

    if (isGold) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 shadow-md shadow-amber-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          🥇 {rankName}
        </span>
      );
    }
    if (isSilver) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-400/30 bg-slate-400/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 shadow-md shadow-slate-400/5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
          🥈 {rankName}
        </span>
      );
    }
    if (isBronze) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-600/30 bg-orange-950/20 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 shadow-md shadow-orange-600/5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          🥉 {rankName}
        </span>
      );
    }
    if (isMemoryMaster) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 shadow-md shadow-cyan-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          👑 {rankName}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-500/30 bg-slate-500/10 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">
        🕵️‍♂️ {rankName}
      </span>
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, avatar })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update credentials.');
      }
      onUpdateUser(data.user);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const isUnlocked = (achId: string) => {
    return user?.stats?.achievementsUnlocked?.includes(achId) || false;
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 py-4 px-4 font-sans">
      
      {/* Navigation and Title */}
      <div className="flex items-center justify-between">
        <button
          id="btn-prof-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO HUB
        </button>

        <span className="text-xs font-mono text-slate-505">COMMISSION FREQUENCY: OPERATIONAL LOG</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile configuration console Form */}
        <div className="p-6 bg-slate-900 border border-slate-850 rounded-3xl space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-5xl shadow-lg shadow-emerald-500/5 mb-3">
              {avatar.split(' ')[0]}
            </div>
            <h3 className="text-lg font-sans font-bold text-white">{name}</h3>
            <span className="text-[10px] font-mono text-slate-500 tracking-wider block">AGENT ID: {user.id}</span>
            <div className="mt-3.5 flex justify-center">
              {getRankBadge(user?.stats?.rank)}
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {message && (
              <div className="p-2.5 text-center text-[10px] font-mono rounded bg-slate-950 border border-slate-850 text-emerald-400">
                {message}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">Agent Identity Name</label>
              <input
                id="prof-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">Codenamed Handler</label>
              <input
                id="prof-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-2">Tactical Agent Avatar</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TEAM_AVATARS.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setAvatar(t.name)}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      avatar === t.name 
                        ? 'bg-emerald-500/10 border-emerald-500/45 text-white' 
                        : 'bg-slate-950 border-slate-950 text-slate-500 hover:border-slate-850'
                    }`}
                  >
                    <span className="text-base block">{t.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-mono truncate leading-none block mt-0.5">{t.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-update-profile"
              type="submit"
              disabled={updating}
              className="w-full py-2 bg-emerald-500 text-slate-950 text-xs font-sans font-black rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              {updating ? 'SYNCING PORTALS...' : 'UPDATE SECURE PROFILE'}
            </button>
          </form>
        </div>

        {/* Career Stats & Unlocked tactical Achievements */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Level Synaptic Progression Tracker */}
          <div className="p-6 bg-slate-900 bg-opacity-70 border border-slate-850 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">EXPERIENCE SYNAPSE SYSTEMS</span>
                <h3 className="text-lg font-sans font-black text-white italic tracking-tight mt-0.5 uppercase">Agent Level {level}</h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">TOTAL XP BALANCE</span>
                <span className="text-sm font-mono font-black text-cyan-400">{xp} <span className="text-[10px] text-slate-500 font-normal">/ {nextLevelMinXp} XP</span></span>
              </div>
            </div>

            {/* EXP Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850/60 p-0.5">
                <div 
                  className="bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(34,211,238,0.25)]" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>LVL {level} ({currentLevelMinXp} XP)</span>
                <span className="text-cyan-300 font-bold">{1000 - xpInCurrentLevel} XP UNTIL LEVEL {level + 1}</span>
                <span>LVL {level + 1} ({nextLevelMinXp} XP)</span>
              </div>
            </div>

            {/* Upcoming Milestones Sequence */}
            <div className="border-t border-slate-850 pt-4 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Synapse Milestones & Rank Progressions</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[175px] overflow-y-auto pr-1">
                {MILESTONES.map((m) => {
                  const unlocked = xp >= m.xp;
                  return (
                    <div 
                      key={m.label} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs leading-none transition-all ${
                        unlocked 
                          ? 'bg-slate-950 border-emerald-500/10 text-slate-300' 
                          : 'bg-slate-950/40 border-slate-905/30 text-slate-600 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-base ${unlocked ? 'opacity-100' : 'opacity-30'}`}>{m.badge}</span>
                        <div>
                          <div className={`font-sans font-bold flex items-center gap-1.5 ${unlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                            {m.label}
                            {unlocked && (
                              <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded">UNLOCKED</span>
                            )}
                          </div>
                          <div className={`text-[9px] font-mono mt-0.5 leading-normal ${unlocked ? 'text-slate-500' : 'text-slate-700'}`}>{m.desc}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-mono font-bold block ${unlocked ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {m.xp} XP
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{m.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Career statistics visual box */}
          <div className="p-6 bg-slate-900 bg-opacity-70 border border-slate-850 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Operational Activity logs
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl flex flex-col justify-between border border-slate-905">
                <span className="text-[9px] font-mono text-slate-500">ACCUMULATED SCORE</span>
                <span className="text-xl font-sans font-black text-white">{user.stats.totalScore}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl flex flex-col justify-between border border-slate-905">
                <span className="text-[9px] font-mono text-slate-500 font-bold">ACCURACY TAPE</span>
                <span className="text-xl font-sans font-black text-emerald-400">{user.stats.accuracy}%</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl flex flex-col justify-between border border-slate-905">
                <span className="text-[9px] font-mono text-slate-500">HEISTS RESOLVED</span>
                <span className="text-xl font-sans font-black text-white">{user.stats.gamesPlayed}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl flex flex-col justify-between border border-slate-905">
                <span className="text-[9px] font-mono text-slate-500">XP METERS</span>
                <span className="text-xl font-sans font-black text-teal-400">{user.stats.xp}</span>
              </div>
            </div>
          </div>

          {/* Achieved Badges panel */}
          <div className="p-6 bg-slate-900 bg-opacity-70 border border-slate-850 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Special Ops Achievements ({user.stats.achievementsUnlocked.length} / {ALL_ACHIEVEMENTS.length} Badges)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const unlocked = isUnlocked(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                      unlocked 
                        ? 'bg-slate-950 border-emerald-500/20' 
                        : 'bg-slate-950/40 border-slate-905 opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      unlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-905'
                    }`}>
                      {ach.badge}
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-white flex items-center gap-1">
                        {ach.title}
                        {unlocked && (
                          <span className="text-[8px] uppercase font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-1 rounded-full">UNLOCKED</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
