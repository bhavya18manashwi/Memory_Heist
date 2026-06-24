/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, Radio, Lock, Award, BookOpen, Layers, CheckCircle, HelpCircle, User, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Player {
  userId: string;
  username: string;
  avatar: string;
  score: number;
  answersSubmitted: Record<string, string>;
  answersCorrectPercent: number;
  completionTime: number;
}

interface Scene {
  theme: string;
  mode: string;
  title: string;
  description: string;
  objects?: Array<{ name: string; color: string; position: string; count?: number }>;
  numbersSequence?: string;
  patternGrid?: {
    rows: number;
    cols: number;
    cells: Array<{ row: number; col: number; color: string; symbol?: string }>;
  };
  storyText?: string;
  generatedBy?: string;
}

interface GameSession {
  id: string;
  isMultiplayer: boolean;
  mode: string;
  theme: string;
  status: 'lobby' | 'observe' | 'discuss' | 'answer' | 'results';
  timerLeft: number;
  scene: Scene;
  questions: Question[];
  players: Record<string, Player>;
  chat: any[];
}

interface GameScreenProps {
  session: GameSession;
  currentUser: any;
  onSendMessage: (text: string) => void;
  onSubmitAnswers: (answers: Record<string, string>, timeTaken: number) => void;
  onExit: () => void;
}

// Play minimal synthetic electronic star beep-boops using the browser's native AudioContext
const playStartSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(392, now, 0.08, 'sawtooth');          // G4
    playTone(523.25, now + 0.1, 0.08, 'sawtooth');   // C5
    playTone(659.25, now + 0.2, 0.08, 'sawtooth');   // E5
    playTone(1046.5, now + 0.32, 0.4, 'sine');       // C6 (bright cyber-hack ping)
  } catch (err) {
    console.warn('AudioContext sound failed to render:', err);
  }
};

export default function GameScreen({
  session,
  currentUser,
  onSendMessage,
  onSubmitAnswers,
  onExit
}: GameScreenProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [typedMessage, setTypedMessage] = useState('');
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [submittedLocal, setSubmittedLocal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Play synthetic starter chime on Game start
  useEffect(() => {
    playStartSound();
  }, []);

  // Smooth local timer tracking to prevent flickering or lag caused by server-side ticks and poll frequencies
  const [localTimerLeft, setLocalTimerLeft] = useState(session.timerLeft);

  useEffect(() => {
    setLocalTimerLeft(session.timerLeft);
  }, [session.status, session.id]);

  useEffect(() => {
    // If the server-side value drifts significantly from the local count down, align them
    if (Math.abs(localTimerLeft - session.timerLeft) > 3 || session.timerLeft === 0) {
      setLocalTimerLeft(session.timerLeft);
    }
  }, [session.timerLeft, localTimerLeft]);

  useEffect(() => {
    if (session.status === 'lobby' || session.status === 'results') return;

    const interval = setInterval(() => {
      setLocalTimerLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.status, session.id]);

  // Auto-submit answers when the countdown timer hits 0 to protect player score
  useEffect(() => {
    if (session.status === 'answer' && localTimerLeft === 0 && session.timerLeft <= 5 && !submittedLocal) {
      setSubmittedLocal(true);
      onSubmitAnswers(answers, secondsSpent);
    }
  }, [localTimerLeft, session.timerLeft, session.status, submittedLocal, answers, secondsSpent, onSubmitAnswers]);

  // Track user time spent during answering
  useEffect(() => {
    let interval: any = null;
    if (session.status === 'answer' && !submittedLocal) {
      interval = setInterval(() => {
        setSecondsSpent((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsSpent(0);
    }
    return () => clearInterval(interval);
  }, [session.status, submittedLocal]);

  // Clean local state on phase changes
  useEffect(() => {
    if (session.status === 'observe') {
      setAnswers({});
      setSubmittedLocal(false);
    }
  }, [session.status]);

  // Scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.chat?.length]);

  // Trigger Confetti explosion popper for winners
  useEffect(() => {
    if (session.status === 'results') {
      const players = Object.values(session.players);
      if (players.length > 0) {
        const highestScore = Math.max(...players.map(p => p.score));
        const currentUserPlayerObj = session.players[currentUser?.id];
        
        // Checks if current user is part of the winning top tier
        if (currentUserPlayerObj && currentUserPlayerObj.score === highestScore && highestScore > 0) {
          import('canvas-confetti').then((confettiModule) => {
            const confetti = confettiModule.default;
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;

            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#10b981', '#06b6d4', '#4f46e5', '#fbbf24', '#f43f5e']
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#10b981', '#06b6d4', '#4f46e5', '#fbbf24', '#f43f5e']
              });

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            }());
          }).catch(err => {
            console.error('Confetti failed to explode:', err);
          });
        }
      }
    }
  }, [session.status, session.id, currentUser?.id]);

  const selectOption = (qId: string, option: string) => {
    if (submittedLocal) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const submitFinalAnswers = () => {
    setSubmittedLocal(true);
    onSubmitAnswers(answers, secondsSpent);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || session.status === 'answer' || session.status === 'results') return;
    onSendMessage(typedMessage);
    setTypedMessage('');
  };

  const getIndianSceneGradient = (theme: string) => {
    switch (theme) {
      case 'Cricket Stadium': return 'from-emerald-950/80 to-slate-900';
      case 'Indian Railway Station': return 'from-amber-950/70 to-zinc-900';
      case 'Wedding Hall': return 'from-pink-950/60 to-slate-900';
      case 'Street Food Market': return 'from-orange-950/70 to-neutral-900';
      case 'Historical Fort': return 'from-yellow-950/60 to-stone-900';
      case 'Classroom': return 'from-blue-950/60 to-slate-900';
      case 'Metro Station': return 'from-cyan-950/70 to-slate-900';
      default: return 'from-slate-900 to-slate-950';
    }
  };

  const getThemeBackgroundImage = (theme: string) => {
    switch (theme) {
      case 'Indian Railway Station':
        return 'https://images.unsplash.com/photo-1595123550441-d37847451553?auto=format&fit=crop&w=1200&q=80';
      case 'Cricket Stadium':
        return 'https://images.unsplash.com/photo-1531415080275-bc3b429cd751?auto=format&fit=crop&w=1200&q=80';
      case 'Classroom':
        return 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80';
      case 'Wedding Hall':
        return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
      case 'Street Food Market':
        return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
      case 'College Campus':
        return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';
      case 'Festival Ground':
        return 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80';
      case 'Shopping Mall':
        return 'https://images.unsplash.com/photo-1567401373180-989d00067b6a?auto=format&fit=crop&w=1200&q=80';
      case 'Historical Fort':
        return 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80';
      case 'Metro Station':
        return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80';
      default:
        return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80';
    }
  };

  const currentScoreMap = Object.values(session.players);

  return (
    <div className="max-w-6xl w-full mx-auto p-4 space-y-6">
      
      {/* HUD Bar - Top Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              {session.isMultiplayer ? 'CONNECTED CO-OP OPERATION' : 'SOLO STEALTH MISSION'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-sans font-black text-white">{session.scene.title}</h2>
              {session.scene.generatedBy === 'gemini' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 uppercase tracking-widest animate-pulse">
                  ✨ Gemini Synapse Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800/60 border border-slate-705 text-slate-400 uppercase tracking-widest">
                  🔒 Local Procedural Synth
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Phase-specific notifications */}
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-850 flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">STATUS:</span>
            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
              session.status === 'observe' ? 'text-amber-400 animate-pulse' :
              session.status === 'discuss' ? 'text-emerald-400' :
              session.status === 'answer' ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {session.status}
            </span>
          </div>

          <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
            localTimerLeft <= 5 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-bounce' : 'bg-slate-950 border-slate-850 text-white'
          }`}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm">{localTimerLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gameboard Stage Box */}
        <div className={`lg:col-span-2 flex flex-col min-h-[460px] bg-gradient-to-br ${getIndianSceneGradient(session.scene.theme)} border border-slate-850 rounded-3xl overflow-hidden shadow-2xl relative`}
        >
          {/* Theme Dynamic Background Image with subtle dark overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            <img 
              id="game-theme-bg"
              src={getThemeBackgroundImage(session.scene.theme)} 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-15 filter brightness-[0.60] contrast-[1.10]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/95" />
          </div>

          {/* Phase 1: Observation Module */}
          {session.status === 'observe' && (
            <div className="flex-1 p-8 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] font-mono text-amber-500 uppercase font-bold">
                  Observe Objects, Colors, & Positions Details
                </span>
                <h3 className="text-2xl font-sans font-bold text-white tracking-tight">{session.scene.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{session.scene.description}</p>
              </div>

              {/* Mode Specific Visual Renderings */}
              <div className="flex-1 flex items-center justify-center py-4">
                
                {/* 1. OBJECTS Challenge Mode Drawing */}
                {session.scene.mode === 'objects' && session.scene.objects && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    {session.scene.objects.map((obj, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="text-xs uppercase font-mono text-emerald-400 tracking-wider">OBJECT #{i + 1}</div>
                          <div className="text-sm font-sans font-black text-white">{obj.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: obj.color.toLowerCase().includes('red') ? 'red' : obj.color.toLowerCase().includes('teal') ? 'teal' : 'gold' }}></span>
                            Color/Mantle: {obj.color}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 bg-slate-900 text-[10px] font-mono text-slate-400 rounded-lg uppercase">
                            {obj.position}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. NUMBERS Challenge Mode */}
                {session.scene.mode === 'numbers' && (
                  <div className="space-y-6 text-center">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">TRANSMISSION SEQUENCE KEY</div>
                    <div className="flex items-center justify-center gap-3">
                      {session.scene.numbersSequence?.split('').map((char, index) => (
                        <div
                          key={index}
                          className="w-14 h-16 bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-xl flex items-center justify-center text-3xl font-mono font-black text-emerald-400"
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PATTERNS Mode drawing represent */}
                {session.scene.mode === 'patterns' && session.scene.patternGrid && (
                  <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
                    {session.scene.patternGrid.cells.map((cell, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-slate-950 border border-slate-850 rounded-xl p-2 flex flex-col justify-between text-center transition-all cursor-crosshair hover:border-emerald-500/30"
                      >
                        <span className="text-[9px] font-mono text-slate-600">R{cell.row} C{cell.col}</span>
                        <span className="text-2xl block">{cell.symbol === 'Sneaker' ? '👟' : cell.symbol === 'Heel' ? '👠' : cell.symbol === 'Boot' ? '🥾' : cell.symbol === 'Acid' ? '🧪' : cell.symbol === 'Carbon' ? '💎' : cell.symbol === 'Water' ? '💧' : '🔮'}</span>
                        <span className="text-[9px] font-mono font-bold uppercase rounded-md tracking-wider py-0.5" style={{ color: cell.color.toLowerCase(), backgroundColor: `${cell.color.toLowerCase()}10` }}>
                          {cell.color}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. STORY Screen representing parchment paper */}
                {session.scene.mode === 'story' && session.scene.storyText && (
                  <div className="p-6 bg-amber-950/10 border border-amber-500/10 rounded-2xl max-w-lg space-y-3 relative">
                    <div className="absolute top-2 right-3">
                      <BookOpen className="w-5 h-5 text-amber-500/40" />
                    </div>
                    <h4 className="text-xs uppercase font-mono text-amber-500 tracking-wider">CONSPIRACY NARRATIVE</h4>
                    <p className="text-sm text-slate-100 font-serif leading-relaxed italic">
                      "{session.scene.storyText}"
                    </p>
                  </div>
                )}

                {/* 5. MIXED Grid challenge combo */}
                {session.scene.mode === 'mixed' && (
                  <div className="w-full max-w-md space-y-4">
                    {session.scene.storyText && (
                      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-300 italic">
                        "{session.scene.storyText}"
                      </div>
                    )}
                    {session.scene.objects && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {session.scene.objects.map((obj, i) => (
                          <div key={i} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex justify-between text-[11px]">
                            <span className="font-bold text-white">{obj.name}</span>
                            <span className="text-slate-500 font-mono">{obj.color} ({obj.position})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              <div className="text-center text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1 bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                <span>⚠️ SCREEN CODES ROTATE IN:</span>
                <span className="text-amber-500 font-bold">{localTimerLeft} SECONDS</span>
              </div>
            </div>
          )}

          {/* Phase 2: Discussion Phase Module */}
          {session.status === 'discuss' && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6 relative z-10">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                <Radio className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
              </div>
              <h3 className="text-xl font-sans font-bold text-white">Scene Dissolved! Tactical Channels Open</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The visual feed has ceased. Compare notes with your active crew in the right-hand discussion chat. Confirm colors, coordinates, patterns, and digits!
              </p>

              <div className="w-full max-w-xs bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-[11px] font-mono text-slate-500 space-y-1">
                <div>LOCKDOWN TIMER IN PROCESS:</div>
                <div className="text-lg text-emerald-400 font-bold font-mono tracking-wider">{localTimerLeft}s</div>
              </div>
            </div>
          )}

          {/* Phase 3: Answer Module MCQ form */}
          {session.status === 'answer' && (
            <div className="flex-1 p-6 flex flex-col justify-between space-y-6 relative z-10">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-cyan-500/15 border border-cyan-500/30 rounded text-[9px] font-mono text-cyan-400 uppercase font-bold">
                  DECRYPTION CHALLENGE ACTIVE
                </span>
                <h3 className="text-lg font-sans font-bold text-white">Transmissions Sealed! Solve Details</h3>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[280px] py-1">
                {session.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-3"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-between">
                      <span>CHALLENGE #{qIndex + 1}</span>
                      <span>{q.points} XP Available</span>
                    </div>
                    <p className="text-sm font-sans text-white leading-relaxed">{q.text}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-sans">
                      {q.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          disabled={submittedLocal}
                          onClick={() => selectOption(q.id, option)}
                          className={`p-2.5 rounded-xl text-left text-xs transition-colors border ${
                            answers[q.id] === option 
                              ? 'bg-cyan-500/10 border-cyan-500/60 text-white font-bold' 
                              : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-850 font-sans">
                <span className="text-xs text-slate-500">
                  {Object.keys(answers).length} of {session.questions.length} answered
                </span>
                <button
                  id="btn-heist-submit-answers"
                  onClick={submitFinalAnswers}
                  disabled={submittedLocal || Object.keys(answers).length < session.questions.length}
                  className={`px-6 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition-all ${
                    submittedLocal 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : Object.keys(answers).length === session.questions.length 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {submittedLocal ? '🔐 Transmitted to Base...' : '🚀 SEND DECRYPTION ANSWERS'}
                </button>
              </div>
            </div>
          )}

          {/* Phase 4: Results Display sheet */}
          {session.status === 'results' && (
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4 relative z-10 overflow-hidden">
              <div className="text-center space-y-2 shrink-0">
                <div className="inline-flex py-1 px-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                  OPERATION RESULTS COMPILED
                </div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-white">Tactical Mission Scorecard</h3>
              </div>

              {/* Scrollable mid-section holding scores list and diagnostics questions review */}
              <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                
                {/* Connected Teams Score List */}
                <div className="space-y-3 py-1">
                  {currentScoreMap.sort((a,b) => b.score - a.score).map((player, idx) => (
                    <div
                      key={player.userId}
                      className="p-4 bg-slate-950/90 rounded-2xl border border-slate-850 flex items-center justify-between shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl">
                          {player.avatar.split(' ')[0]}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-sans font-bold text-white flex items-center gap-2">
                            #{idx + 1} {player.username}
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-[9px] uppercase rounded-full animate-bounce">🥇 WINNER</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="text-emerald-400 font-bold">⏱️ Completed in {player.completionTime || 0}s</span>
                            {player.completionTime > 0 && player.completionTime < 15 && (
                              <span className="text-cyan-400 text-[8px] bg-cyan-950/40 border border-cyan-800/30 px-1 py-0.2 rounded uppercase">lightning swift</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base sm:text-lg font-sans font-black text-emerald-400">+{player.score} XP</div>
                        <div className="text-[10px] text-slate-400 font-mono">Accuracy: {player.answersCorrectPercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tactical Question Review list with Green/Red validation & completion speed status */}
                <div className="space-y-3 p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-850 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 mb-2">
                    <h4 className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5 uppercase">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      DECRYPTION DIAGNOSTICS & SCORECARD
                    </h4>
                    {(() => {
                      const localPlayer = session.players[currentUser?.id] || session.players[currentUser?.userId];
                      if (localPlayer) {
                        return (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                            ⏱️ YOUR TIME: <span className="text-cyan-400 font-mono font-black">{localPlayer.completionTime || 0} SECONDS</span>
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="space-y-3">
                    {session.questions.map((q, qIdx) => {
                      const localPlayer = session.players[currentUser?.id] || session.players[currentUser?.userId];
                      const userAnswer = localPlayer ? localPlayer.answersSubmitted?.[q.id] : null;
                      const isCorrect = userAnswer === q.correctAnswer;
                      
                      return (
                        <div 
                          key={q.id} 
                          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                            !userAnswer ? 'bg-rose-950/10 border-rose-900/40' :
                            isCorrect 
                              ? 'bg-emerald-950/20 border-emerald-500/30' 
                              : 'bg-rose-950/20 border-rose-500/30'
                          }`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-start gap-2.5">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-black text-slate-400 shrink-0 mt-0.5">
                                {qIdx + 1}
                              </span>
                              <span className="text-xs md:text-sm font-sans font-medium text-slate-100">{q.text}</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-7.5 text-[11px] font-mono">
                              {/* User's response info */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-slate-500 uppercase">Your Entry:</span>
                                {!userAnswer ? (
                                  <span className="text-rose-400 font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" /> TIMED OUT / MISSING
                                  </span>
                                ) : isCorrect ? (
                                  <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 inline-flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {userAnswer}
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-bold bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30 inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {userAnswer}
                                  </span>
                                )}
                              </div>

                              {/* Correct target system code overlay */}
                              {!isCorrect && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-slate-500 uppercase">Correct System Key:</span>
                                  <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 inline-flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {q.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* XP Scores Display */}
                          <div className="text-right pl-7.5 md:pl-0 shrink-0">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                                🛡️ +{q.points} XP
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-rose-400/80 font-bold uppercase">
                                ❌ 0 XP
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Action Exit Gates */}
              <div className="pt-2 shrink-0 border-t border-slate-850/60">
                <button
                  id="btn-exit-results"
                  onClick={onExit}
                  className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-sans font-bold rounded-xl text-xs uppercase cursor-pointer transition-all duration-200 outline-none transform active:scale-[0.98] shadow-md hover:shadow-cyan-500/10"
                >
                  RETURN TO OPERATIONS SYSTEM
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Co-Op Tactical Chat and Scores Column */}
        <div className="flex flex-col bg-slate-900 border border-slate-805 rounded-3xl p-4 min-h-[460px]">
          
          {/* Phase Indicators / Room players scores */}
          <div className="pb-3 border-b border-slate-850">
            <h4 className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              OPERATIONAL RADAR
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {currentScoreMap.map((p) => (
                <div key={p.userId} className="p-2 bg-slate-950 rounded-xl border border-slate-900 flex items-center gap-2">
                  <span className="text-lg">{p.avatar.split(' ')[0]}</span>
                  <div className="truncate">
                    <div className="text-[10px] font-sans font-bold text-white truncate">{p.username}</div>
                    <div className="text-[8px] text-emerald-400 font-mono">SCORE: {p.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time chat messaging during discussion */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[290px]">
            {session.chat?.map((msg) => {
              const isSys = msg.userId === 'system';
              return (
                <div key={msg.id} className={`flex flex-col ${isSys ? 'items-center text-center' : 'items-start'}`}>
                  {isSys ? (
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl max-w-[95%] text-[9px] font-mono text-slate-400">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="space-y-0.5 max-w-[95%]">
                      <div className="flex items-center gap-1 text-[8px] text-slate-500">
                        <span className="text-emerald-400 font-bold font-mono">{msg.username}</span>
                        <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="p-2 bg-slate-950 border border-slate-900 text-xs text-slate-200 rounded-2xl rounded-tl-none">
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input block - locked automatically in Answer or Results phase */}
          {session.status === 'observe' || session.status === 'discuss' ? (
            <form onSubmit={handleChatSend} className="pt-3 border-t border-slate-850 flex gap-1.5 font-sans">
              <input
                id="tactical-chat-input"
                type="text"
                placeholder="Submit layout tip..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                id="btn-tactical-chat-send"
                type="submit"
                className="p-1 px-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors"
              >
                <Send className="w-3 h-3 text-slate-950" />
              </button>
            </form>
          ) : (
            <div className="pt-3 border-t border-slate-850 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1 bg-slate-950/40 p-2 rounded-xl border border-slate-900">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>TRANSMISSION ENCRYPTED DURING DECISIONS</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
