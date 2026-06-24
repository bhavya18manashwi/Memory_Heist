/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, CheckCircle } from 'lucide-react';

const AVATARS = [
  { id: '1', name: '🕵️‍♂️ Sherlock', label: 'Sherlock Sharma' },
  { id: '2', name: '☕ Chai Lover', label: 'Tapri Chai Lover' },
  { id: '3', name: '🏏 Cricketer', label: 'Gully Cricketer' },
  { id: '4', name: '🚇 Metro Raider', label: 'Metro Raider' },
  { id: '5', name: '🍛 Curry King', label: 'Curry King' },
  { id: '6', name: '👑 Fort Ruler', label: 'Amber Lord' },
];

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
}

export default function AuthPage({ onAuthSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🕵️‍♂️ Sherlock');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = isLogin 
      ? { email, password }
      : { name, username, email, password, avatar: selectedAvatar };

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPlay = () => {
    // Generates instant session details for testers and zero-hassle players
    const randomNum = Math.floor(100 + Math.random() * 900);
    onAuthSuccess({
      id: `usr_guest_${randomNum}`,
      name: `Guest Agent ${randomNum}`,
      username: `HeistAgent_${randomNum}`,
      email: `guest_${randomNum}@memoryheist.in`,
      avatar: selectedAvatar,
      stats: {
        totalScore: 0,
        gamesPlayed: 0,
        accuracy: 0,
        rank: 'Bronze I',
        xp: 150,
        bestStreak: 1,
        achievementsUnlocked: []
      }
    });
  };

  return (
    <div id="auth-panel" className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl shadow-emerald-500/5 mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-4 animate-pulse">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-sans font-bold tracking-tight text-white">
          {isLogin ? 'Synchronize Credentials' : 'Create Agent Profile'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isLogin ? 'Access your Memory Heist operational logs' : 'Register your signature code system'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Full Identity Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center col-span-1">
                  <User className="h-4 w-4 text-slate-500" />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Agent Handle (Username)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Sparkles className="h-4 w-4 text-emerald-400/80" />
                </span>
                <input
                  id="reg-username"
                  type="text"
                  required
                  placeholder="e.g. AmberRaider"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Select Tactical Avatar</label>
              <div className="grid grid-cols-3 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.name)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      selectedAvatar === av.name 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{av.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono leading-none">{av.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Email Interface</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Mail className="h-4 w-4 text-slate-500" />
            </span>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="agent@memoryheist.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Cryptographic Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Lock className="h-4 w-4 text-slate-500" />
            </span>
            <input
              id="auth-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          id="btn-auth-submit"
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm mt-3"
        >
          {loading ? 'Decrypting Secure Portals...' : isLogin ? 'Access Portal' : 'Initialize Identity'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-850"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-900 text-slate-400 font-mono">OR DIRECT DEMO</span>
        </div>
      </div>

      <button
        id="btn-guest-pass"
        onClick={handleQuickPlay}
        className="w-full py-2 px-4 bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 font-mono text-xs rounded-xl transition-all"
      >
        🎟️ BUNDLE GUEST TACTICAL PASS
      </button>

      <div className="mt-6 text-center text-xs">
        <button
          id="toggle-auth-mode"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
        >
          {isLogin ? 'Create standard profile instead' : 'Sync existing profile database'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          id="back-to-landing"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-400 text-xs transition-colors"
        >
          ← Return to main frequency
        </button>
      </div>
    </div>
  );
}
