# Memory Heist Constitution

## 1. Project Vision
Memory Heist is a multiplayer observation and recall application styled in slate cyber-glassmorphic layouts. Players must observe rich Indian-themed scenes, coordinate in pre-answer discussion chat channels, and answer observational detail puzzles under ticks.

## 2. Technical Stack Boundaries
- **Frontend**: React 19 + Vite + Tailwind CSS + Framer Motion/Lucide
- **Backend**: Express + Vite middleware proxying API requests
- **GenAI model**: `gemini-3.5-flash` via official `@google/genai` typescript client
- **Database / Synchronization State**: Server-authoritative in-memory ticking sessions with short polling support.

## 3. Human UX Directive
- Zero exposure of developer diagnostic labels.
- Simple, humble visual cards with illustrations instead of pure console printouts.
- Direct quick-pass credentials synchronization with customizable Indian character avatars.
