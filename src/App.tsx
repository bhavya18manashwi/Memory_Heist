/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import ProfileScreen from './components/ProfileScreen';
import { Radio, ShieldAlert, Award, Grid, Sparkles, BookOpen, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState<'landing' | 'auth' | 'dashboard' | 'lobby' | 'game' | 'leaderboard' | 'profile'>('landing');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [systemMessage, setSystemMessage] = useState<string>('');

  // Join room helper from invite links
  const checkPendingRoomJoin = async (currentUserObj: any) => {
    const pendingCode = sessionStorage.getItem('pending_join_room');
    if (pendingCode && currentUserObj) {
      sessionStorage.removeItem('pending_join_room');
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.warn('Could not clean URL params:', e);
      }
      try {
        const res = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserObj.id, roomCode: pendingCode })
        });
        const data = await res.json();
        if (res.ok) {
          setActiveSession(data);
          setActiveScreen('lobby');
        } else {
          setSystemMessage(data.error || `Unable to join invited room ${pendingCode}`);
          setActiveScreen('dashboard');
        }
      } catch (err) {
        console.error('Failed to auto-join invited room:', err);
        setActiveScreen('dashboard');
      }
    }
  };

  // Load persisted user on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem('heist_user');
    let currentUserObj: any = null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
          currentUserObj = parsed;
          setActiveScreen('dashboard');

          // Self-healing synchronization helper to re-inject user on server restarts/sandbox environments
          fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: parsed })
          })
          .then(res => {
            if (res.ok) return res.json();
          })
          .then(synchronized => {
            if (synchronized && synchronized.id) {
              setUser(synchronized);
              localStorage.setItem('heist_user', JSON.stringify(synchronized));
            }
          })
          .catch(e => console.warn('User synchronization handshake completed (locally cached):', e));
        }
      } catch (err) {
        console.error('Failed to reconstruct saved agent credentials', err);
      }
    }

    // Check url invite parameter
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      const sanitizedCode = roomFromUrl.trim().toUpperCase();
      sessionStorage.setItem('pending_join_room', sanitizedCode);
      if (currentUserObj) {
        checkPendingRoomJoin(currentUserObj);
      } else {
        setSystemMessage(`You have been invited to join crew room ${sanitizedCode}. Register or sign in below to join!`);
        setActiveScreen('auth');
      }
    }
  }, []);

  // Synchronize player stats whenever results phase concludes
  const refreshUserStats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('heist_user', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to update stats:', e);
    }
  };

  // Synchronize current lobby & game state from the Express backend via polling
  useEffect(() => {
    let timerId: any = null;
    let consecutiveFailures = 0;
    const sessionId = activeSession?.id;

    if (sessionId && (activeScreen === 'lobby' || activeScreen === 'game')) {
      const pollRoom = async () => {
        try {
          const res = await fetch(`/api/rooms/${sessionId}`);
          if (!res.ok) {
            // Room expired or deleted
            setSystemMessage('The active heist room has expired or shut down.');
            handleExitToDashboard();
            return;
          }
          const sessionData = await res.json();
          setActiveSession(sessionData);
          consecutiveFailures = 0; // Reset counter on success

          // Force view transition active state on phase swaps
          if (sessionData.status !== 'lobby' && activeScreen === 'lobby') {
            setActiveScreen('game');
          }
          if (sessionData.status === 'results' && activeScreen === 'game') {
            // Auto refresh player levels
            refreshUserStats();
          }
        } catch (err) {
          consecutiveFailures++;
          // Only log a failure if it persists across multiple ticks (like during server restart)
          if (consecutiveFailures > 3) {
            console.error('Lobby poll tick failed (consecutive):', err);
          } else {
            console.warn('Lobby poll tick connection warning (retrying...):', err);
          }
        }
      };

      // Trigger immediately and then poll every 1500ms for robust and efficient networking
      pollRoom();
      timerId = setInterval(pollRoom, 1500);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeSession?.id, activeScreen, user?.id]);

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    localStorage.setItem('heist_user', JSON.stringify(authenticatedUser));
    const pendingCode = sessionStorage.getItem('pending_join_room');
    if (pendingCode) {
      checkPendingRoomJoin(authenticatedUser);
    } else {
      setActiveScreen('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('heist_user');
    setActiveSession(null);
    setActiveScreen('landing');
  };

  const handleSelectSolo = async (mode: string, theme: string, useAI: boolean) => {
    setSystemMessage('');
    if (!user) {
      setActiveScreen('auth');
      return;
    }
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, mode, theme, isMultiplayer: false, useAI })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize session');
      
      setActiveSession(data);
      setActiveScreen('game');
    } catch (err: any) {
      setSystemMessage(err.message || 'Intrusion gate failed.');
    }
  };

  const handleSelectDaily = async () => {
    setSystemMessage('');
    if (!user) {
      setActiveScreen('auth');
      return;
    }
    try {
      // Create a curated instant co-op daily session using standard theme elements
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          mode: 'mixed', 
          theme: 'Cricket Stadium', 
          isMultiplayer: false,
          useAI: false 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Daily sector failed');

      // Update with Daily specifications
      data.scene.title = "Chinnaswamy Cup Finale";
      data.scene.description = "A critical spectator box filled with scorecards, giant banners, and VIP objects.";

      setActiveSession(data);
      setActiveScreen('game');
    } catch (err: any) {
      setSystemMessage(err.message || 'Daily heist access denied.');
    }
  };

  const handleCreateMultiplayer = async (mode: string, theme: string, useAI: boolean) => {
    setSystemMessage('');
    if (!user) {
      setActiveScreen('auth');
      return;
    }
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, mode, theme, isMultiplayer: true, useAI })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActiveSession(data);
      setActiveScreen('lobby');
    } catch (err: any) {
      setSystemMessage(err.message || 'Multiplayer terminal error.');
    }
  };

  const handleJoinMultiplayer = async (roomCode: string) => {
    setSystemMessage('');
    if (!user) {
      setActiveScreen('auth');
      return;
    }
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roomCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Room not found.');

      setActiveSession(data);
      setActiveScreen('lobby');
    } catch (err: any) {
      setSystemMessage(err.message || 'Gate connection failed.');
    }
  };

  const handleToggleReady = async () => {
    if (!activeSession || !user) return;
    try {
      const res = await fetch(`/api/rooms/${activeSession.id}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      setActiveSession(data);
    } catch (e) {
      console.error('Readiness toggle failed:', e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeSession || !user) return;
    try {
      const res = await fetch(`/api/rooms/${activeSession.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, text })
      });
      const data = await res.json();
      setActiveSession(data);
    } catch (e) {
      console.error('Failed to submit message:', e);
    }
  };

  const handleSubmitAnswers = async (answers: Record<string, string>, timeTaken: number) => {
    if (!activeSession || !user) return;
    try {
      const res = await fetch(`/api/rooms/${activeSession.id}/submit-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, answers, timeTaken })
      });
      const data = await res.json();
      setActiveSession(data);
      if (data && data.status === 'results') {
        refreshUserStats();
      }
    } catch (e) {
      console.error('Answer submission failed:', e);
    }
  };

  const handleExitToDashboard = () => {
    setActiveSession(null);
    if (user) {
      setActiveScreen('dashboard');
    } else {
      setActiveScreen('landing');
    }
  };

  // Get dynamic full-page immersive background as per the active scenic theme
  const getThemeBackground = () => {
    if (!activeSession) return '';
    const theme = activeSession.scene?.theme || activeSession.theme;
    if (!theme) return '';
    switch (theme) {
      case 'Indian Railway Station':
        return 'https://images.unsplash.com/photo-1595123550441-d37847451553?auto=format&fit=crop&w=1600&q=80';
      case 'Cricket Stadium':
        return 'https://images.unsplash.com/photo-1531415080275-bc3b429cd751?auto=format&fit=crop&w=1600&q=80';
      case 'Classroom':
        return 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1600&q=80';
      case 'Wedding Hall':
        return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80';
      case 'Street Food Market':
        return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';
      case 'College Campus':
        return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80';
      case 'Festival Ground':
        return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80';
      case 'Shopping Mall':
        return 'https://images.unsplash.com/photo-1567401373180-989d00067b6a?auto=format&fit=crop&w=1600&q=80';
      case 'Historical Fort':
        return 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1600&q=80';
      case 'Metro Station':
        return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80';
      default:
        return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80';
    }
  };

  const bgImage = getThemeBackground();

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-200 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      
      {/* Immersive Theme Fullscreen Background */}
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-in-out">
          <img 
            src={bgImage} 
            alt="" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-[0.09] filter blur-[8px] brightness-[0.35] transition-all duration-1000 select-none scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07070a]" />
        </div>
      )}

      {/* Main interactive layer */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full">
        
        {/* Top Console Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-black/40 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleExitToDashboard}>
            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <div className="w-5 h-5 border-2 border-white/95 rounded-sm rotate-45"></div>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 select-none">
              MEMORY HEIST
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              SECURE SECTOR
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-profile"
                  onClick={() => setActiveScreen('profile')}
                  className="flex items-center gap-2 hover:bg-white/5 p-1.5 py-1 rounded-xl transition-all border border-transparent hover:border-white/10"
                >
                  <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-lg select-none">
                    {user.avatar.split(' ')[0]}
                  </div>
                  <div className="text-left font-sans select-none">
                    <div className="text-xs font-bold text-white leading-none">{user.username}</div>
                    <span className="text-[9px] text-cyan-400 font-mono">LVL {user.stats.xp ? Math.floor(user.stats.xp / 100) + 1 : 1} • {user.stats.rank}</span>
                  </div>
                </button>
                <button
                  id="header-logout"
                  onClick={handleLogout}
                  title="Disconnect Identity (Logout)"
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 transition-all text-xs flex items-center justify-center cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 font-mono text-[10px] font-bold uppercase tracking-wider">LOGOUT</span>
                </button>
              </div>
            ) : (
              <button
                id="header-auth"
                onClick={() => setActiveScreen('auth')}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-black text-xs uppercase rounded-lg transition-all shadow-[0_4px_10px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                Synchronize Agent
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Primary content area */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full">
          
          {systemMessage && (
            <div className="max-w-md mx-auto mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-xs flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              {systemMessage}
            </div>
          )}

          {activeScreen === 'landing' && (
            <LandingPage
              onPlayNow={() => {
                if (user) setActiveScreen('dashboard');
                else setActiveScreen('auth');
              }}
              onLogin={() => setActiveScreen('auth')}
              onRegister={() => setActiveScreen('auth')}
              onViewLeaderboard={() => setActiveScreen('leaderboard')}
            />
          )}

          {activeScreen === 'auth' && (
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
              onBack={handleExitToDashboard}
            />
          )}

          {activeScreen === 'dashboard' && (
            <Dashboard
              user={user}
              onSelectSolo={handleSelectSolo}
              onSelectDaily={handleSelectDaily}
              onCreateMultiplayer={handleCreateMultiplayer}
              onJoinMultiplayer={handleJoinMultiplayer}
              onViewLeaderboard={() => setActiveScreen('leaderboard')}
              onViewProfile={() => setActiveScreen('profile')}
              onLogout={handleLogout}
            />
          )}

          {activeScreen === 'lobby' && activeSession && (
            <LobbyScreen
              session={activeSession}
              currentUser={user}
              onToggleReady={handleToggleReady}
              onSendMessage={handleSendMessage}
              onBackToDashboard={handleExitToDashboard}
            />
          )}

          {activeScreen === 'game' && activeSession && (
            <GameScreen
              session={activeSession}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onSubmitAnswers={handleSubmitAnswers}
              onExit={handleExitToDashboard}
            />
          )}

          {activeScreen === 'leaderboard' && (
            <LeaderboardScreen
              currentUser={user}
              onBack={handleExitToDashboard}
            />
          )}

          {activeScreen === 'profile' && (
            <ProfileScreen
              user={user}
              onUpdateUser={(updated) => {
                setUser(updated);
                localStorage.setItem('heist_user', JSON.stringify(updated));
              }}
              onBack={handleExitToDashboard}
            />
          )}

        </div>
      </main>

      {/* Footer segment */}
      <footer className="h-10 bg-cyan-950/10 border-t border-white/5 flex items-center px-4 justify-between shrink-0 font-mono text-[10px]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-6 overflow-hidden">
          <div className="flex gap-6 items-center truncate">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">Global Servers: Operational</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 shrink-0 hidden sm:block"></div>
            <div className="text-[10px] text-slate-400 truncate hidden sm:block">
              NEWS: <span className="text-white">SEASON 4 STARTING SOON. OPTIMIZE BRAIN RETRIEVAL GATES.</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-600 shrink-0">
            MEM_HEIST_SYSTEM_V.2.4.1
          </div>
        </div>
      </footer>
      </div>

    </div>
  );
}
