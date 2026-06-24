/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Users, Check, AlertCircle, Copy, Send, HelpCircle, Loader, Radio, Link2 } from 'lucide-react';

interface PlayerState {
  userId: string;
  username: string;
  avatar: string;
  ready: boolean;
  score: number;
}

interface GameSession {
  id: string;
  isMultiplayer: boolean;
  mode: string;
  theme: string;
  status: string;
  players: Record<string, PlayerState>;
  chat: any[];
  scene?: {
    generatedBy?: string;
  };
}

interface LobbyScreenProps {
  session: GameSession;
  currentUser: any;
  onToggleReady: () => void;
  onSendMessage: (text: string) => void;
  onBackToDashboard: () => void;
}

export default function LobbyScreen({
  session,
  currentUser,
  onToggleReady,
  onSendMessage,
  onBackToDashboard
}: LobbyScreenProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to newest messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.chat?.length]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}?room=${session.id}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendMessage(typedMessage);
    setTypedMessage('');
  };

  const playersList = Object.values(session.players);
  const hostId = session.players ? Object.keys(session.players)[0] : '';
  const isHost = currentUser.id === hostId;

  return (
    <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-4 px-4">
      
      {/* Structural Room details & Connected Teams */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Room ID and Code Block */}
        <div className="p-6 bg-slate-900 border border-slate-805 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              HEIST ENCRYPTED GATEWAY
            </span>
            <div className="flex items-center gap-1.5">
              {session.scene?.generatedBy === 'gemini' ? (
                <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                  ✨ Gemini AI
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800/80 border border-slate-750 text-slate-400 font-mono px-2 py-0.5 rounded uppercase font-bold">
                  🔒 Local
                </span>
              )}
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                Mode: {session.mode}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-500">TACTICAL ENTRY CODE</div>
              <div className="text-3xl font-mono text-white tracking-widest font-black flex items-center gap-3 flex-wrap">
                {session.id}
                <button
                  id="btn-copy-code"
                  onClick={handleCopyCode}
                  className="p-1 px-2 border border-slate-800 rounded-lg hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
                <button
                  id="btn-copy-invite-link"
                  onClick={handleCopyLink}
                  className="p-1 px-2 border border-purple-500/30 bg-purple-500/5 rounded-lg hover:bg-purple-500/15 text-purple-400 hover:text-purple-300 text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  {copiedLink ? 'Link Copied!' : 'Copy Direct Invite Link'}
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500">OPERATIONAL AREA</div>
              <div className="text-sm font-sans font-bold text-white">{session.theme}</div>
            </div>
          </div>
        </div>

        {/* Players Readiness Screen */}
        <div className="p-6 bg-slate-900 bg-opacity-70 border border-slate-850 rounded-3xl space-y-4">
          <h3 className="text-xs font-mono text-slate-400 flex items-center gap-1.5 uppercase">
            <Users className="w-4 h-4 text-emerald-400" />
            Crew Status ({playersList.length} / 4 Agents)
          </h3>

          <div className="space-y-2">
            {playersList.map((player) => (
              <div
                key={player.userId}
                className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-900 hover:border-slate-850 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-2xl">
                    {player.avatar.split(' ')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-sans font-bold text-white flex items-center gap-1.5">
                      {player.username}
                      {player.userId === hostId && (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-1.5 rounded-full font-mono uppercase">HEIST HOST</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">Agent Identity Index: {player.userId}</div>
                  </div>
                </div>

                <div>
                  {player.ready ? (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-[10px] font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      READY
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/5 border border-amber-500/10 text-amber-500/80 rounded-lg text-[10px] font-mono flex items-center gap-1 animate-pulse">
                      <Loader className="w-3 h-3 animate-spin text-amber-500" />
                      ANALYZING...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-lobby-toggle-ready"
              onClick={onToggleReady}
              className={`w-full py-3 font-sans font-black text-xs rounded-xl transition-all shadow-md ${
                session.players[currentUser.id]?.ready 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/5' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/5'
              }`}
            >
              {session.players[currentUser.id]?.ready ? '⚠️ CANCEL READINESS' : '🔥 CONFIRM OPERATIONAL READINESS'}
            </button>

            <button
              id="btn-lobby-back"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto py-3 px-5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 text-xs font-mono rounded-xl transition-colors"
            >
              ABORT MISSION
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Multiplayer Lobby Team Chat */}
      <div className="flex flex-col bg-slate-900 border border-slate-805 rounded-3xl p-4 h-[440px] shadow-2xl shadow-purple-500/[0.01]">
        <div className="pb-3 border-b border-slate-850 flex items-center justify-between">
          <h3 className="text-xs font-mono text-slate-300">📡 PRE-HEIST CHANNEL</h3>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Chat Scrolling body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {session.chat?.map((msg) => {
            const isSystem = msg.userId === 'system';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSystem ? 'items-center text-center' : 'items-start'}`}
              >
                {isSystem ? (
                  <div className="p-2 py-1.5 bg-slate-950 border border-slate-850 max-w-[90%] rounded-xl text-[10px] font-mono text-slate-400">
                    <span className="mr-1">{msg.avatar}</span>
                    {msg.text}
                  </div>
                ) : (
                  <div className="space-y-1 max-w-[90%]">
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                      <span>{msg.avatar.split(' ')[0]}</span>
                      <span className="text-emerald-400 font-bold">{msg.username}</span>
                      <span className="text-[8px] text-slate-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 text-xs text-slate-200 rounded-2xl rounded-tl-none border border-slate-900">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input interface bar */}
        <form onSubmit={handleChatSend} className="pt-3 border-t border-slate-850 flex gap-2">
          <input
            id="lobby-chat-input"
            type="text"
            placeholder="Type transmission..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            id="btn-lobby-chat-send"
            type="submit"
            className="p-1.5 px-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
