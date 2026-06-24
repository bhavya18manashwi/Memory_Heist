/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, Zap, Clock, Shield, Flame, Target, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  rank: string;
  score: number;
  accuracy: number;
  xp: number;
}

interface LeaderboardScreenProps {
  currentUser?: any;
  onBack: () => void;
}

export default function LeaderboardScreen({ currentUser, onBack }: LeaderboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'allTime'>('allTime');
  const [leaderboardData, setLeaderboardData] = useState<{
    daily: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboards')
      .then((res) => res.json())
      .then((data) => {
        setLeaderboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to retrieve leaderboard metrics:', err);
        setLoading(false);
      });
  }, []);

  const getEntries = () => {
    if (!leaderboardData) return [];
    return leaderboardData[activeTab] || [];
  };

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 py-4 px-4 font-sans">
      
      {/* Back button & Header row */}
      <div className="flex items-center justify-between">
        <button
          id="btn-lead-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-xs font-mono text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO DASHBOARD
        </button>

        <span className="text-xs font-mono text-slate-500">OPERATIONAL COMMUNIQUE INDEX</span>
      </div>

      <div className="text-center space-y-3">
        <div className="inline-flex py-1 px-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-full text-xs font-mono font-bold tracking-wider">
          🏆 MEMORY HEIST ARCHIVE
        </div>
        <h2 className="text-3xl font-sans font-black text-white">Public Agent Leaderboards</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Synchronize with daily, weekly, or all-time operational scores to analyze top speed observers on the tactical grid.
        </p>
      </div>

      {/* Tabs segment */}
      <div className="flex items-center justify-center p-1 bg-slate-950 rounded-2xl max-w-xs mx-auto border border-slate-900 font-mono text-xs">
        {(['daily', 'weekly', 'allTime'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-lead-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-2.5 rounded-xl text-center capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-slate-905 bg-emerald-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'allTime' ? 'All Time' : tab}
          </button>
        ))}
      </div>

      {/* Leaderboard Entries List Panel */}
      <div className="bg-slate-900 bg-opacity-70 border border-slate-850 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-500 animate-pulse">
            🔑 Decrypting Global Archives...
          </div>
        ) : getEntries().length === 0 ? (
          <div className="py-25 text-center text-xs text-slate-505">
            No session scores recorded in this sector yet.
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Table Header labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-3 pb-2 border-b border-slate-850">
              <span className="w-12">RANK</span>
              <span className="flex-1 text-left">AGENT PROFILE ID</span>
              <span className="w-24 text-center">ACCURACY</span>
              <span className="w-24 text-right">TOTAL HEIST XP</span>
            </div>

            {/* List entries */}
            <div className="space-y-2">
              {(() => {
                const allEntries = getEntries();
                const topFive = allEntries.slice(0, 5);
                const userIndex = allEntries.findIndex(e => e.userId === currentUser?.id);
                const userInTopFive = userIndex !== -1 && userIndex < 5;

                const currentUserEntryObj = userIndex !== -1 ? allEntries[userIndex] : currentUser ? {
                  userId: currentUser.id,
                  username: currentUser.username || currentUser.name,
                  avatar: currentUser.avatar || '🕵️‍♂️ Anonymous',
                  rank: currentUser.stats?.rank || 'Recruit',
                  score: currentUser.stats?.totalScore || 0,
                  accuracy: currentUser.stats?.accuracy || 0,
                  xp: currentUser.stats?.xp || 0
                } : null;

                return (
                  <>
                    {topFive.map((entry, index) => {
                      const isCurrentUser = entry.userId === currentUser?.id;
                      return (
                        <div
                          key={`${entry.userId}_${index}`}
                          className={`p-3.5 bg-slate-950 rounded-2xl flex items-center justify-between border transition-all ${
                            isCurrentUser 
                              ? 'border-cyan-500/80 shadow-md shadow-cyan-500/10 bg-cyan-950/10' 
                              : index < 3 
                                ? 'border-emerald-500/15 shadow-md shadow-emerald-500/[0.01]' 
                                : 'border-slate-850 bg-opacity-40'
                          }`}
                        >
                          {/* Ranking Medal column */}
                          <div className="w-12 text-sm font-mono font-bold text-center">
                            <span className={`inline-block text-center ${index < 3 ? 'text-xl' : 'text-slate-500'}`}>
                              {getMedalEmoji(index)}
                            </span>
                          </div>

                          {/* Avatar and Info */}
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex justify-center items-center text-2xl select-none">
                              {entry.avatar.split(' ')[0]}
                            </div>
                            <div>
                              <div className="text-xs font-sans font-bold text-white flex items-center gap-1.5">
                                {entry.username}
                                {isCurrentUser && (
                                  <span className="text-[9px] text-cyan-400 font-mono font-normal tracking-wide bg-cyan-950/30 border border-cyan-800/30 px-1.5 py-0.2 rounded">(you)</span>
                                )}
                                {index === 0 && (
                                  <span className="text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold">Apex</span>
                                )}
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono lowercase">{entry.rank}</div>
                            </div>
                          </div>

                          {/* Accuracy percentage */}
                          <div className="w-24 text-center flex items-center justify-center gap-1">
                            <Target className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-xs font-semibold text-teal-300 font-mono">{entry.accuracy}%</span>
                          </div>

                          {/* Total Score XP */}
                          <div className="w-24 text-right">
                            <div className="text-xs font-mono font-black text-emerald-400">+{entry.xp} XP</div>
                            <div className="text-[9px] text-slate-500 font-sans">{entry.score} pts</div>
                          </div>

                        </div>
                      );
                    })}

                    {/* Separator and Personal standing row if active user is not in top 5 */}
                    {currentUser && !userInTopFive && currentUserEntryObj && (
                      <>
                        <div className="flex justify-center items-center gap-3 py-2">
                          <div className="h-[1px] bg-slate-800/60 flex-1"></div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Your Operational Standing</span>
                          <div className="h-[1px] bg-slate-800/60 flex-1"></div>
                        </div>

                        <div
                          className="p-3.5 bg-slate-950 rounded-2xl flex items-center justify-between border border-cyan-500/80 shadow-md shadow-cyan-500/20 bg-cyan-950/20"
                        >
                          {/* Ranking column */}
                          <div className="w-12 text-sm font-mono font-bold text-center text-cyan-400">
                            #{userIndex !== -1 ? userIndex + 1 : allEntries.length + 1}
                          </div>

                          {/* Avatar and Info */}
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex justify-center items-center text-2xl select-none animate-pulse">
                              {currentUserEntryObj.avatar.split(' ')[0]}
                            </div>
                            <div>
                              <div className="text-xs font-sans font-bold text-white flex items-center gap-1.5">
                                {currentUserEntryObj.username} 
                                <span className="text-[9px] text-cyan-400 font-mono font-normal tracking-wide bg-cyan-950/30 border border-cyan-800/30 px-1.5 py-0.2 rounded">(you)</span>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono lowercase">{currentUserEntryObj.rank || 'Recruit'}</div>
                            </div>
                          </div>

                          {/* Accuracy percentage */}
                          <div className="w-24 text-center flex items-center justify-center gap-1">
                            <Target className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-xs font-semibold text-teal-300 font-mono">{currentUserEntryObj.accuracy}%</span>
                          </div>

                          {/* Total Score XP */}
                          <div className="w-24 text-right">
                            <div className="text-xs font-mono font-black text-emerald-400">+{currentUserEntryObj.xp} XP</div>
                            <div className="text-[9px] text-slate-500 font-sans">{currentUserEntryObj.score} pts</div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
