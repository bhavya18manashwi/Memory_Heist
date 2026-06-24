/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the official @google/genai Client lazily to prevent crash if key is missing
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const DB_FILE = path.join(process.cwd(), 'users_db.json');

function loadUsers() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Database] Failed to load persisted users:', err);
  }
  return {};
}

function saveUsers() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(USERS, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database] Failed to write persisted users to file:', err);
  }
}

// Persisted and In-Memory Database State
const USERS: Record<string, {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  stats: {
    totalScore: number;
    gamesPlayed: number;
    accuracy: number;
    rank: string;
    xp: number;
    bestStreak: number;
    achievementsUnlocked: string[];
  };
}> = loadUsers();

const SESSIONS: Record<string, {
  id: string;
  isMultiplayer: boolean;
  mode: any;
  theme: any;
  status: 'lobby' | 'observe' | 'discuss' | 'answer' | 'results';
  timerLeft: number;
  started?: boolean;
  scene: any;
  questions: any[];
  players: Record<string, any>;
  chat: any[];
  maxPlayers: number;
  hostId: string;
  dailyChallengeDate?: string;
}> = {};

// Default initial achievements
const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_heist', title: 'First Heist', description: 'Complete your first memory challenge.', badge: '🕵️‍♂️' },
  { id: 'perfect_recall', title: 'Perfect Recall', description: 'Get a perfect 100% score on any challenge.', badge: '🧠' },
  { id: 'speed_observer', title: 'Speed Observer', description: 'Submit all answers with more than 15 seconds remaining.', badge: '⚡' },
  { id: 'memory_master', title: 'Memory Master', description: 'Reach 10,000 Total XP.', badge: '👑' },
  { id: 'daily_champion', title: 'Daily Champion', description: 'Submit score for the Daily Heist Co-Op.', badge: '📅' },
  { id: 'multiplayer_winner', title: 'Multiplayer Winner', description: 'Secure 1st place in a multiplayer match.', badge: '🏆' },
];

// Rich Scenic Themes of India Fallback Challenge Database
const FALLBACK_CHALLENGES: Array<{
  theme: any;
  mode: any;
  title: string;
  description: string;
  objects?: any[];
  numbersSequence?: string;
  patternGrid?: any;
  storyText?: string;
  questions: any[];
}> = [
  {
    theme: 'Indian Railway Station',
    mode: 'objects',
    title: 'Howrah Station Morning Commute',
    description: 'Platform 8 of the iconic station. Passengers hustle near tea stalls, steel trunks are stacked, and the heritage clock towers over the tracks.',
    objects: [
      { name: 'Red Steel Trunk', color: 'Crimson Red', position: 'Left of the bench', count: 1 },
      { name: 'Heritage Gate Clock', color: 'Golden Yellow', position: 'Centered on top structural arch', count: 1 },
      { name: 'Chai Stall', color: 'Ocean Teal with brass kettle', position: 'Right-hand side next to pillar', count: 1 },
      { name: 'Porter Uniform', color: 'Scarlet Orange with brass badge #42', position: 'Near the luggage stack', count: 1 }
    ],
    questions: [
      {
        id: 'q1',
        text: 'What color was the steel trunk near the bench?',
        options: ['Teal Green', 'Ocean Blue', 'Crimson Red', 'Dull Gray'],
        correctAnswer: 'Crimson Red',
        points: 200
      },
      {
        id: 'q2',
        text: 'What was the badge number of the porter carrying luggage?',
        options: ['#42', '#101', '#88', '#12'],
        correctAnswer: '#42',
        points: 250
      },
      {
        id: 'q3',
        text: 'Where was the ocean teal Chai Stall located?',
        options: ['Under the central bench', 'Left of the main platform', 'Right-hand side next to a pillar', 'Mounted on the ceiling'],
        correctAnswer: 'Right-hand side next to a pillar',
        points: 200
      }
    ]
  },
  {
    theme: 'Cricket Stadium',
    mode: 'numbers',
    title: 'Chinnaswamy Stadium Last Ball Scoreboard',
    description: 'The giant modern LED scoreboard in Bangalore during an intense rivalry match. Fans cheer in the background as lights gleam.',
    numbersSequence: '937256',
    questions: [
      {
        id: 'q1',
        text: 'What was the exact 6-digit session code shown on the screen?',
        options: ['937146', '937256', '846201', '573910'],
        correctAnswer: '937256',
        points: 300
      },
      {
        id: 'q2',
        text: 'What was the second digit in the displayed code sequence?',
        options: ['9', '7', '3', '2'],
        correctAnswer: '3',
        points: 150
      },
      {
        id: 'q3',
        text: 'What was the final digit in the code sequence?',
        options: ['6', '5', '0', '9'],
        correctAnswer: '6',
        points: 150
      }
    ]
  },
  {
    theme: 'Classroom',
    mode: 'patterns',
    title: 'Nalanda Academy Chemistry Corner',
    description: 'A grid of colorful lab beakers, element diagrams, and neon labels displayed on a student whiteboard.',
    patternGrid: {
      rows: 3,
      cols: 3,
      cells: [
        { row: 1, col: 1, color: 'Purple', symbol: 'Acid' },
        { row: 1, col: 2, color: 'Orange', symbol: 'Carbon' },
        { row: 1, col: 3, color: 'Purple', symbol: 'Hydrogen' },
        { row: 2, col: 1, color: 'Green', symbol: 'Oxygen' },
        { row: 2, col: 2, color: 'Green', symbol: 'Zinc' },
        { row: 2, col: 3, color: 'Purple', symbol: 'Nitrogen' },
        { row: 3, col: 1, color: 'Orange', symbol: 'Water' },
        { row: 3, col: 2, color: 'Purple', symbol: 'Gold' },
        { row: 3, col: 3, color: 'Green', symbol: 'Copper' }
      ]
    },
    questions: [
      {
        id: 'q1',
        text: 'What color was the chemical beaker at the center of the grid (Row 2, Column 2)?',
        options: ['Purple', 'Green', 'Orange', 'Blue'],
        correctAnswer: 'Green',
        points: 250
      },
      {
        id: 'q2',
        text: 'How many Purple-colored cells were present on the 3x3 layoutboard?',
        options: ['2 Cells', '3 Cells', '4 Cells', '5 Cells'],
        correctAnswer: '4 Cells',
        points: 200
      },
      {
        id: 'q3',
        text: 'What was the symbol name located in the bottom-left corner beaker (Row 3, Column 1)?',
        options: ['Acid', 'Water', 'Copper', 'Oxygen'],
        correctAnswer: 'Water',
        points: 250
      }
    ]
  },
  {
    theme: 'Wedding Hall',
    mode: 'story',
    title: 'The Grand Jaipur Baaraat',
    description: 'A traditional royal wedding setup with rich garlands, musicians, and delicious regional catering tables.',
    storyText: 'Aarav arrived at the Jaipur luxury fort hall on Monday afternoon wearing a deep velvet emerald sherwani. He carried a silver tray with 5 red envelopes representing blessings from Delhi, while his cousin Priya was busy coordinating 12 classical dhol drummers from Amritsar to perform at exactly 07:00 PM.',
    questions: [
      {
        id: 'q1',
        text: 'Under what color of velvet sherwani did Aarav make his entrance?',
        options: ['Midnight Black', 'Ruby Crimson', 'Velvet Sapphire', 'Emerald Green'],
        correctAnswer: 'Emerald Green',
        points: 200
      },
      {
        id: 'q2',
        text: 'How many red envelopes of blessings did Aarav carry on the silver tray?',
        options: ['3 Envelopes', '5 Envelopes', '8 Envelopes', '12 Envelopes'],
        correctAnswer: '5 Envelopes',
        points: 200
      },
      {
        id: 'q3',
        text: 'Which city did the 12 classical dhol drummers arrive from?',
        options: ['Amritsar', 'Jaipur', 'Delhi', 'Hyderabad'],
        correctAnswer: 'Amritsar',
        points: 200
      }
    ]
  },
  {
    theme: 'Street Food Market',
    mode: 'mixed',
    title: 'Chandni Chowk Sizzler Market',
    description: 'Old Delhi alley filled with mouthwatering food carts, neon signs, and spice sacks.',
    storyText: 'Chef Ravi started Golgappa King Stall at 04:30 PM using exactly 8 secret spices. A yellow neon sign hung high on structural pillar #9 while he served fresh hot kachoris at 80 rupees a plate in red clay bowls.',
    objects: [
      { name: 'Neon Signboard', color: 'Yellow', position: 'Top of pillar #9' },
      { name: 'Clay bowls', color: 'Terracotta Red', position: 'On Golgappa counter' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'What was the price set for a hot plate of fresh kachoris?',
        options: ['40 rupees', '60 rupees', '80 rupees', '100 rupees'],
        correctAnswer: '80 rupees',
        points: 200
      },
      {
        id: 'q2',
        text: 'What color was the glowing neon signboard hung near the pillar?',
        options: ['Crimson Pink', 'Yellow', 'Sky Blue', 'Light Green'],
        correctAnswer: 'Yellow',
        points: 200
      },
      {
        id: 'q3',
        text: 'How many secret spices did Chef Ravi integrate for his menu?',
        options: ['5 Spices', '8 Spices', '12 Spices', '4 Spices'],
        correctAnswer: '8 Spices',
        points: 250
      }
    ]
  },
  {
    theme: 'Historical Fort',
    mode: 'objects',
    title: 'Amber Fort Royal Courtyard',
    description: 'The geometric archways of Amber Fort in Jaipur. Royal mirrors catch the afternoon sun near decorated wooden doors.',
    objects: [
      { name: 'Shield Set', color: 'Polished Bronze with 4 spikes', position: 'Mounted above the archway' },
      { name: 'Peacock Urn', color: 'Emerald Green and Indigo', position: 'Right corner next to the fountain' },
      { name: 'Silk Rug', color: 'Rich Marigold Orange', position: 'Draped on the royal balustrade' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'What colors were painted on the Peacock Urn near the fountain?',
        options: ['Teal and Gold', 'Crimson and White', 'Emerald Green and Indigo', 'Silver and Bronze'],
        correctAnswer: 'Emerald Green and Indigo',
        points: 200
      },
      {
        id: 'q2',
        text: 'Where was the rich Marigold Orange silk rug draped?',
        options: ['Above the central archway', 'Draped on the royal balustrade', 'Next to the fountain base', 'Under the shield set'],
        correctAnswer: 'Draped on the royal balustrade',
        points: 250
      }
    ]
  },
  {
    theme: 'Metro Station',
    mode: 'numbers',
    title: 'Delhi Metro Transit Intercom',
    description: 'A digital route tracker and emergency helpline terminal showing codes on Platform 2 of Rajiv Chowk station.',
    numbersSequence: '482703',
    questions: [
      {
        id: 'q1',
        text: 'What was the exact 6-digit digital route coordinate shown on Rajiv Chowk terminal?',
        options: ['482703', '486701', '382704', '842701'],
        correctAnswer: '482703',
        points: 300
      }
    ]
  },
  {
    theme: 'Shopping Mall',
    mode: 'patterns',
    title: 'Phoenix Mall Interactive Footwear Grid',
    description: 'A 3x3 artistic window display featuring stylish sneakers, high heels, and boots combined with colored lights.',
    patternGrid: {
      rows: 3,
      cols: 3,
      cells: [
        { row: 1, col: 1, color: 'Red', symbol: 'Sneaker' },
        { row: 1, col: 2, color: 'Blue', symbol: 'Heel' },
        { row: 1, col: 3, color: 'Red', symbol: 'Boot' },
        { row: 2, col: 1, color: 'Yellow', symbol: 'Sneaker' },
        { row: 2, col: 2, color: 'Yellow', symbol: 'Heel' },
        { row: 2, col: 3, color: 'Blue', symbol: 'Sneaker' },
        { row: 3, col: 1, color: 'Red', symbol: 'Boot' },
        { row: 3, col: 2, color: 'Blue', symbol: 'Boot' },
        { row: 3, col: 3, color: 'Yellow', symbol: 'Heel' }
      ]
    },
    questions: [
      {
        id: 'q1',
        text: 'How many Red-colored cells did you count in the window grid display?',
        options: ['1 Cell', '2 Cells', '3 Cells', '4 Cells'],
        correctAnswer: '3 Cells',
        points: 200
      },
      {
        id: 'q2',
        text: 'What type of footwear was styled in the bottom-middle section (Row 3, Column 2)?',
        options: ['Sneaker', 'Heel', 'Boot', 'Sandal'],
        correctAnswer: 'Boot',
        points: 250
      }
    ]
  }
];

// Helper to seed scores/rankings for bots on the leaderboard
const LEADERBOARD: Array<{
  userId: string;
  username: string;
  avatar: string;
  rank: string;
  score: number;
  accuracy: number;
  xp: number;
}> = [
  { userId: 'bot_1', username: 'SherlockSharma', avatar: '🕵️‍♂️ Sherlock', rank: 'Memory Master', score: 18500, accuracy: 96, xp: 12500 },
  { userId: 'bot_2', username: 'ChaiCaptain', avatar: '☕ Chai Lover', rank: 'Gold III', score: 14200, accuracy: 91, xp: 9400 },
  { userId: 'bot_3', username: 'MetroRider26', avatar: '🚇 Metro Raider', rank: 'Gold II', score: 12900, accuracy: 89, xp: 8100 },
  { userId: 'bot_4', username: 'DholBeats', avatar: '🥁 Dhol Star', rank: 'Silver III', score: 10400, accuracy: 84, xp: 6200 },
  { userId: 'bot_5', username: 'AmberCrown', avatar: '👑 Royal Fort', rank: 'Silver I', score: 7100, accuracy: 78, xp: 4500 },
];

// Seed Daily Challenge
const DAILY_CHALLENGE = {
  date: '2026-06-09',
  theme: 'Cricket Stadium',
  mode: 'mixed',
  title: 'Chinnaswamy Cup Finale',
  description: 'A critical spectator box filled with scorecards, giant banners, and VIP objects.',
  storyText: 'Captain Rohit won the toss under a bright golden floodlight in Bangalore and chose to bat. On the main VIP table sat 3 gold-plated trophies beside a black bowler hat, while the scoreboard showed an active tracking passcode of 573910.',
  objects: [
    { name: 'Gold-plated trophies', color: 'Bright Gold', position: 'On the main VIP table' },
    { name: 'Bowler hat', color: 'Matt Black', position: 'Beside the trophies' }
  ],
  questions: [
    {
      id: 'dq1',
      text: 'What was the active tracking passcode shown on the scoreboard?',
      options: ['937256', '573910', '482703', '102938'],
      correctAnswer: '573910',
      points: 250
    },
    {
      id: 'dq2',
      text: 'What was the color and finish of the bowler hat on the VIP table?',
      options: ['Glossy Blue', 'Matt Black', 'Sparkling Maroon', 'Dark Gray'],
      correctAnswer: 'Matt Black',
      points: 200
    },
    {
      id: 'dq3',
      text: 'How many gold-plated trophies were resting on the VIP counter?',
      options: ['1 Trophy', '2 Trophies', '3 Trophies', '5 Trophies'],
      correctAnswer: '3 Trophies',
      points: 200
    }
  ]
};

// Generate random room codes
// Helper to shuffle a simple array in place
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleChallenge(challenge: any) {
  const cloned = JSON.parse(JSON.stringify(challenge));
  if (cloned.questions && Array.isArray(cloned.questions)) {
    // Shuffle options of each question
    cloned.questions.forEach((q: any) => {
      if (q.options && Array.isArray(q.options)) {
        q.options = shuffleArray(q.options);
      }
    });
    // Shuffle questions themselves
    cloned.questions = shuffleArray(cloned.questions);
  }
  return cloned;
}

const OBJ_POOL_BY_THEME: Record<string, { names: string[], colors: string[], positions: string[] }> = {
  'Indian Railway Station': {
    names: ['Chai Stall', 'Steel Cargo Trunk', 'Heritage Gate Clock', 'Porter Badge #42', 'Railway Time Guidebook', 'Hot Samosa Platter'],
    colors: ['Crimson Red', 'Ocean Teal', 'Bright Saffron', 'Steel Grey', 'Emerald Green', 'Deep Amber'],
    positions: ['Left of the platform bench', 'Under the central booking kiosk', 'Centered on the heritage arch', 'Near the luggage stack', 'On the passenger waiting rack', 'Beside the ticket counter']
  },
  'Cricket Stadium': {
    names: ['Signed League Leather Ball', 'English Willow Bat', 'VIP Spectator Pass', 'Huge Team Banner', 'Channaswamy Stadium Megaphone', 'Spiked Bowler Cap'],
    colors: ['Bright Crimson', 'Light Wood Amber', 'Royal Purple', 'Emerald Forest Green', 'Electric Neon Yellow', 'Matte Black'],
    positions: ['Near the boundary rope', 'Leaning on the VIP table sideline', 'Pinned to the sightscreen board', 'Beside the grass rollers', 'Hanging on the press box rails', 'Centered on the spectator glass table']
  },
  'Classroom': {
    names: ['Beaker of Acid', 'Chemistry Element Diagram', 'Chalk Box Container', 'Dry Student Whiteboard', 'Brass Compass Ruler', 'Wooden Desk Globe'],
    colors: ['Acidic Purple', 'Carbon Neon Orange', 'Fluorescent Green', 'Dull Charcoal Grey', 'Polished Copper', 'Sky Turquoise Blue'],
    positions: ['On the central laboratory desk', 'Mounted above the periodic table', 'On the teacher\'s pedestal', 'Propped against the side projector shelf', 'Under the display cabinet', 'Beside the marker stand']
  },
  'Wedding Hall': {
    names: ['Fresh Orange Marigold Garland', 'Blessings Shagun Envelope', 'Dhol Traditional Drum', 'Groom Velvet Sherwani', 'Rosewater Brass Sprinkler', 'Mehndi Henna applicator'],
    colors: ['Saffron Orange', 'Velvet Rose Pink', 'Polished Silver Gold', 'Deep Royal Blue', 'Dazzling Ruby Red', 'Forest Leaf Green'],
    positions: ['At the main palace entry archway', 'Resting on the velvet silver tray', 'Placed beside the stage backdrop', 'Near the imperial canopy columns', 'On the buffet counter', 'Beside the luxury sofa']
  },
  'Street Food Market': {
    names: ['Golgappa Mint Water Jar', 'Terracotta Samosa Cup', 'Spicy Kachori Masala Sack', 'Fruit Skewer Platter', 'Glass Chess Lassi Tumbler', 'Vendor Neon Signboard'],
    colors: ['Clay Terracotta', 'Sunny Lemon Yellow', 'Earthy Cinnamon Saffron', 'Lime Mint Green', 'Milky Cream White', 'Bright Magenta Pink'],
    positions: ['On the central chef stall counter', 'Stacked near the hot frying pan', 'Beside the wooden spice mortars', 'On the corner fruit rack side', 'Beside the copper churning jug', 'Hanging high on utility pillar #9']
  },
  'College Campus': {
    names: ['Canteen Teakettle', 'Acoustic Cover Guitar', 'Robotics Micro Circuit Board', 'Dean Parchment Library Scroll', 'Laurel Ivy Festival Trophy', 'Sports Geared Bicycle'],
    colors: ['Sienna Antique Copper', 'Mahogany Wood Brown', 'Azure Turquoise Blue', 'Aged Cream Ivory', 'Chrome Silver Star', 'Ruby Cherry Red'],
    positions: ['Next to the boiling kettle', 'Propped against the stone water fountain', 'Under the laboratory lamp', 'Inside the archival desk', 'Centered on the main display shelf', 'Parked beside the heavy gate arches']
  },
  'Festival Ground': {
    names: ['Ravana Effigy Golden Bow', 'Henna Stencil Needle', 'Traditional Kathakali Puppet', 'Cotton Candy Spun Wheel', 'Ornate Festive Brass Lantern', 'Floral Clay Diya Sconce'],
    colors: ['Neon Saffron orange', 'Fuchsia Indigo Magenta', 'Earthy Ochre Yellow', 'Candy Floss Light Pink', 'Shiny Brass Yellow', 'Terracotta Red'],
    positions: ['At the center of the main fairground', 'Near the Ferris wheel ticket booth', 'Draped on the drama stage', 'On the vendor cart display rack', 'Suspended above the gateway', 'Lining the circular walkway']
  },
  'Shopping Mall': {
    names: ['Aesthetic Sneakers Display', 'Electric Escalator Gate Logo', 'Designer Rose Perfume Atomizer', 'Luxury Leather Handbag', 'Mannequin Silk Scarf', 'Atrium Giant Helium Balloon'],
    colors: ['Metallic Coral Salmon', 'Sky Electric Blue', 'Brilliant Platinum Gold', 'Velvet Burgundy Crimson', 'Teal Mint Cyan', 'Amethyst Purple'],
    positions: ['In the front window visual box', 'Next to the atrium service desk arch', 'Under the vanity lighting rows', 'On the glass pedestal display case', 'Draped elegantly on the mannequin', 'Suspended from the skylight crossbars']
  },
  'Historical Fort': {
    names: ['Polished Bronze Crest Shield', 'Emerald Peacock Urn', 'Rich Silk Balustrade Rug', 'Maharajah Throne Saber Swivel', 'Incense Sandalwood Holder', 'Wrought Iron Imperial Cannon'],
    colors: ['Antique Bronze Metallic', 'Deep Indigo Cobalt Blue', 'Marigold Sun Saffron', 'Silver Steel Filigree', 'Dark Walnut Brown', 'Rusty Charcoal Black'],
    positions: ['Mounted above the outer portcullis', 'Right corner beside the courtyard fountain', 'Draped over the stone balustrade', 'Displayed on the velvet cushion', 'Placed near the royal column base', 'Positioned near the battlement view window']
  },
  'Metro Station': {
    names: ['Emergency Intercom Help Unit', 'Smart Transit Ticket Card', 'Digital Route System Board', 'Commuter Coffee Thermos Flask', 'Under-bench Metal Stash Trunk', 'Biometric Security Hand scanner'],
    colors: ['High-visibility Safety Yellow', 'Electric Sky Blue', 'Glossy Transit Neon Orange', 'Chrome Silver Steel', 'Olive Drab Forest Green', 'Midnight Jet Black'],
    positions: ['On Column #3', 'Spotted near the smart card gate', 'Mounted on the central pillar archway', 'Left behind the main transport desk', 'Under the platform passenger seating bench', 'Inside the security kiosk cabin']
  }
};

function generateObjectsChallenge(theme: string) {
  const data = OBJ_POOL_BY_THEME[theme] || OBJ_POOL_BY_THEME['Indian Railway Station'];
  const shuffledNames = shuffleArray(data.names).slice(0, 3);
  const shuffledColors = shuffleArray(data.colors);
  const shuffledPositions = shuffleArray(data.positions);
  
  const chosenObjects = shuffledNames.map((name, i) => {
    return {
      name,
      color: shuffledColors[i],
      position: shuffledPositions[i]
    };
  });
  
  const questions = chosenObjects.map((obj, i) => {
    if (i % 2 === 0) {
      const otherColors = data.colors.filter(c => c !== obj.color);
      const options = shuffleArray([obj.color, ...shuffleArray(otherColors).slice(0, 3)]);
      return {
        id: `gen_q_obj_col_${Date.now()}_${i}`,
        text: `What was the exact color of the "${obj.name}" matching the visual display?`,
        options,
        correctAnswer: obj.color,
        points: 200 + i * 50
      };
    } else {
      const otherPositions = data.positions.filter(p => p !== obj.position);
      const options = shuffleArray([obj.position, ...shuffleArray(otherPositions).slice(0, 3)]);
      return {
        id: `gen_q_obj_pos_${Date.now()}_${i}`,
        text: `Where was the "${obj.name}" located in the observed layout?`,
        options,
        correctAnswer: obj.position,
        points: 200 + i * 50
      };
    }
  });
  
  return {
    title: `Observation Heist: ${theme}`,
    description: `A tactical inspection of objects located in the ${theme}. Memorize each design detail, physical color mantle, and relative coordinates setup!`,
    objects: chosenObjects,
    questions
  };
}

function generateNumbersChallenge(theme: string) {
  const sequenceDigits = [];
  for (let idx = 0; idx < 6; idx++) {
    sequenceDigits.push(Math.floor(Math.random() * 10).toString());
  }
  const code = sequenceDigits.join('');
  const ordinalLabels = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  const queryDigits = shuffleArray([0, 1, 2, 3, 4, 5]).slice(0, 2);
  
  const questions = [
    {
      id: `gen_q_num_all_${Date.now()}`,
      text: `Select the complete, exact 6-digit synchronization passcode shown on the ${theme} interface:`,
      options: shuffleArray([
        code,
        code.slice(0, 3) + ((parseInt(code[3]) + 3) % 10) + code.slice(4),
        code.slice(0, 2) + ((parseInt(code[2]) + 5) % 10) + code.slice(3),
        code.substring(0, 4) + ((parseInt(code[4]) + 7) % 10) + ((parseInt(code[5]) + 1) % 10)
      ]),
      correctAnswer: code,
      points: 250
    }
  ];
  
  queryDigits.forEach((qIdx, i) => {
    const digitValue = code[qIdx];
    const otherDigits = Array.from({ length: 10 }, (_, d) => d.toString()).filter(d => d !== digitValue);
    const options = shuffleArray([digitValue, ...shuffleArray(otherDigits).slice(0, 3)]);
    
    questions.push({
      id: `gen_q_num_pos_${Date.now()}_${qIdx}`,
      text: `What was the ${ordinalLabels[qIdx]} digit in the 6-digit transmission sequence you observed?`,
      options,
      correctAnswer: digitValue,
      points: 150 + i * 50
    });
  });
  
  return {
    title: `${theme} Signal Feed`,
    description: `A secure data intercept relay is running at the ${theme}. Memorize the exact digit sequence flashing on the central digital ledger terminal immediately!`,
    numbersSequence: code,
    questions
  };
}

function generatePatternsChallenge(theme: string) {
  const symbolPool = theme === 'Classroom' 
    ? ['Acid Beaker', 'Carbon Atom', 'Water Node', 'Gold Cell', 'Zinc Block', 'Hydrogen Node']
    : theme === 'Shopping Mall'
    ? ['Sneaker Icon', 'High Heel', 'Strap Boot', 'Sandal Icon', 'Slippers Plaque', 'Handbag Logo']
    : ['Golden Sigil', 'Brass Ring', 'Bronze Knot', 'Star Shield', 'Crest Emblem', 'Crown Logo'];
    
  const colorsList = ['Purple', 'Orange', 'Green', 'Red', 'Blue', 'Yellow'];
  const cells = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      cells.push({
        row: r,
        col: c,
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        symbol: symbolPool[Math.floor(Math.random() * symbolPool.length)]
      });
    }
  }
  
  const targetCell1 = cells[Math.floor(Math.random() * 9)];
  let targetCell2 = cells[Math.floor(Math.random() * 9)];
  while (targetCell2.row === targetCell1.row && targetCell2.col === targetCell1.col) {
    targetCell2 = cells[Math.floor(Math.random() * 9)];
  }
  
  const randomColorToCount = colorsList[Math.floor(Math.random() * colorsList.length)];
  const matchingColorCount = cells.filter(cell => cell.color === randomColorToCount).length;
  
  const questions = [
    {
      id: `gen_q_pat_color_${Date.now()}`,
      text: `What color was the design tile at Row ${targetCell1.row}, Column ${targetCell1.col} on the grid matrix?`,
      options: shuffleArray([targetCell1.color, ...shuffleArray(colorsList.filter(c => c !== targetCell1.color)).slice(0, 3)]),
      correctAnswer: targetCell1.color,
      points: 200
    },
    {
      id: `gen_q_pat_symbol_${Date.now()}`,
      text: `Which architectural symbol descriptor was printed on the tile at Row ${targetCell2.row}, Column ${targetCell2.col}?`,
      options: shuffleArray([targetCell2.symbol, ...shuffleArray(symbolPool.filter(s => s !== targetCell2.symbol)).slice(0, 3)]),
      correctAnswer: targetCell2.symbol,
      points: 250
    },
    {
      id: `gen_q_pat_count_${Date.now()}`,
      text: `How many total "${randomColorToCount}"-colored cell tiles were visible inside the 3x3 display layout?`,
      options: shuffleArray([
        `${matchingColorCount} Cells`,
        `${(matchingColorCount + 1) % 9} Cells`,
        `${(matchingColorCount + 2) % 9} Cells`,
        `${(matchingColorCount + 3) % 9} Cells`
      ].filter((v, i, self) => self.indexOf(v) === i).slice(0, 4)),
      correctAnswer: `${matchingColorCount} Cells`,
      points: 200
    }
  ];
  
  return {
    title: `${theme} Security Matrix`,
    description: `A customized 3x3 encryption grid pattern board on the central platform deck of the ${theme}. Memorize cell alignments, colors, and graphical symbols!`,
    patternGrid: {
      rows: 3,
      cols: 3,
      cells
    },
    questions
  };
}

function generateStoryChallenge(theme: string) {
  const names = ['Aarav', 'Rohan', 'Siddharth', 'Meera', 'Ananya', 'Priya', 'Kabir', 'Aanya'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const colors = ['emerald green', 'ruby red', 'midnight black', 'ocean teal', 'saffron gold', 'neon cobalt'];
  const metals = ['antique silver', 'polished brass', 'aged copper', 'burnished gold', 'heavy bronze'];
  const cities = ['Amritsar', 'Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Kochi', 'Patna', 'Srinagar'];
  
  const itemThemeMap: Record<string, { items: string[], counts: number[], instruments: string[], actions: string[] }> = {
    'Indian Railway Station': {
      items: ['heritage blueprints', 'royal luggage bags', 'teabags', 'gold sovereign coins'],
      counts: [3, 4, 5, 8],
      instruments: ['whistling porters', 'ticket checkers', 'tea vendors'],
      actions: ['arrived on the express coach', 'waited at Platform 8']
    },
    'Cricket Stadium': {
      items: ['signed balls', 'willow bats', 'match tickets', 'championship badges'],
      counts: [2, 3, 5, 6],
      instruments: ['match umpires', 'cheerleaders', 'security drone cams'],
      actions: ['seated in the corporate box', 'waited beside the turf pitch']
    },
    'Classroom': {
      items: ['research lab notebooks', 'microscope slides', 'test-tube samples', 'brass rulers'],
      counts: [3, 4, 6, 7],
      instruments: ['science invigilators', 'lab assistants', 'thesis evaluators'],
      actions: ['sitting under the corner projector', 'attending chemical lab tests']
    },
    'Wedding Hall': {
      items: ['red envelopes of blessings', 'silk flower garlands', 'sweets giftboxes', 'crystal goblets'],
      counts: [4, 5, 7, 9],
      instruments: ['classical dhol drummers', 'shehnai players', 'bridal dancers'],
      actions: ['standing beside the royal canopy', 'entering the high banquet hall']
    },
    default: {
      items: ['blessing letters', 'keepsake souvenirs', 'decorated cards', 'valuable keyrings'],
      counts: [3, 5, 7, 8],
      instruments: ['guest coordinators', 'venue security staff', 'cultural performers'],
      actions: ['coordinating events in the back pavilion', 'visiting the historic site']
    }
  };
  
  const ctx = itemThemeMap[theme] || itemThemeMap.default;
  
  const chosenName1 = names[Math.floor(Math.random() * names.length)];
  let chosenName2 = names[Math.floor(Math.random() * names.length)];
  while (chosenName2 === chosenName1) {
    chosenName2 = names[Math.floor(Math.random() * names.length)];
  }
  const chosenDay = days[Math.floor(Math.random() * days.length)];
  const chosenColor = colors[Math.floor(Math.random() * colors.length)];
  const chosenMetal = metals[Math.floor(Math.random() * metals.length)];
  const chosenCity1 = cities[Math.floor(Math.random() * cities.length)];
  let chosenCity2 = cities[Math.floor(Math.random() * cities.length)];
  while (chosenCity2 === chosenCity1) {
    chosenCity2 = cities[Math.floor(Math.random() * cities.length)];
  }
  
  const chosenItem = ctx.items[Math.floor(Math.random() * ctx.items.length)];
  const chosenCount1 = ctx.counts[Math.floor(Math.random() * ctx.counts.length)];
  const chosenInstrument = ctx.instruments[Math.floor(Math.random() * ctx.instruments.length)];
  const chosenCount2 = ctx.counts[Math.floor(Math.random() * ctx.counts.length)];
  const chosenAction = ctx.actions[Math.floor(Math.random() * ctx.actions.length)];
  const hours = [6, 7, 8, 9, 10];
  const chosenTime = `0${hours[Math.floor(Math.random() * hours.length)]}:00 PM`;
  
  const storyText = `${chosenName1} arrived at the ${theme} on ${chosenDay} afternoon wearing a deep velvet ${chosenColor} garb. He carried a ${chosenMetal} tray with exactly ${chosenCount1} ${chosenItem} representing valuable parcels from ${chosenCity1}, while his cousin ${chosenName2} was busy ${chosenAction} with ${chosenCount2} ${chosenInstrument} from ${chosenCity2} to perform at exactly ${chosenTime}.`;
  
  const questions = [
    {
      id: `gen_q_story_col_${Date.now()}`,
      text: `Under what color of velvet clothing did ${chosenName1} make their entrance at the scene?`,
      options: shuffleArray([chosenColor, ...shuffleArray(colors.filter(c => c !== chosenColor)).slice(0, 3)]),
      correctAnswer: chosenColor,
      points: 200
    },
    {
      id: `gen_q_story_count_${Date.now()}`,
      text: `How many "${chosenItem}" did ${chosenName1} carry on their ${chosenMetal} tray?`,
      options: shuffleArray([
        `${chosenCount1} ${chosenItem}`,
        `${(chosenCount1 + 3) % 10} ${chosenItem}`,
        `${(chosenCount1 + 1) % 10} ${chosenItem}`,
        `${Math.max(1, chosenCount1 - 2)} ${chosenItem}`
      ].filter((v, i, self) => self.indexOf(v) === i).slice(0, 4)),
      correctAnswer: `${chosenCount1} ${chosenItem}`,
      points: 200
    },
    {
      id: `gen_q_story_city_${Date.now()}`,
      text: `Which regional city did the ${chosenCount2} ${chosenInstrument} travel from?`,
      options: shuffleArray([chosenCity2, ...shuffleArray(cities.filter(c => c !== chosenCity2)).slice(0, 3)]),
      correctAnswer: chosenCity2,
      points: 250
    }
  ];
  
  return {
    title: `Narrative of ${theme}`,
    description: `A secret informant dossier detailing events at the ${theme}. Memorize the exact figures, participants, days, and colors!`,
    storyText,
    questions
  };
}

function generateMixedChallenge(theme: string) {
  const numberPart = generateNumbersChallenge(theme);
  const objectsPart = generateObjectsChallenge(theme);
  
  const names = ['Aarav', 'Rohan', 'Meera', 'Priya', 'Kabir'];
  const chosenName = names[Math.floor(Math.random() * names.length)];
  const counts = [3, 4, 8, 12];
  const chosenCount = counts[Math.floor(Math.random() * counts.length)];
  const items = ['security dossiers', 'vip invitations', 'golden key tokens', 'sealed envelopes'];
  const chosenItem = items[Math.floor(Math.random() * items.length)];
  
  const storyText = `Inside the core archives of the ${theme}, undercover agent ${chosenName} secured exactly ${chosenCount} ${chosenItem}. On the main dashboard terminal, the digital display glowed with active sync pin ${numberPart.numbersSequence}.`;
  
  const chosenObjects = objectsPart.objects.slice(0, 2);
  
  const questions = [
    {
      id: `gen_q_mix_num_${Date.now()}`,
      text: `What was the active synchronization pin sequence displayed on the security ledger dashboard terminal?`,
      options: numberPart.questions[0].options,
      correctAnswer: numberPart.numbersSequence,
      points: 250
    },
    {
      id: `gen_q_mix_obj_${Date.now()}`,
      text: `What was the design color of the observed detail object "${chosenObjects[0].name}"?`,
      options: shuffleArray([
        chosenObjects[0].color,
        ...shuffleArray(['Purple', 'Orange', 'Green', 'Red', 'Blue', 'Yellow'].filter(c => c !== chosenObjects[0].color)).slice(0, 3)
      ]),
      correctAnswer: chosenObjects[0].color,
      points: 200
    },
    {
      id: `gen_q_mix_story_${Date.now()}`,
      text: `How many "${chosenItem}" did undercover representative ${chosenName} secure during the covert operation?`,
      options: shuffleArray([
        `${chosenCount} items`,
        `${(chosenCount + 2) % 15} items`,
        `${(chosenCount + 5) % 15} items`,
        `${Math.max(1, chosenCount - 2)} items`
      ].filter((v, i, self) => self.indexOf(v) === i).slice(0, 4)),
      correctAnswer: `${chosenCount} items`,
      points: 200
    }
  ];
  
  return {
    title: `Sector Fusion Heist: ${theme}`,
    description: `A complex cross-field surveillance layout at the ${theme}. High concentration is required to remember all objects, narrative figures, and passcode systems!`,
    storyText,
    objects: chosenObjects,
    numbersSequence: numberPart.numbersSequence,
    questions
  };
}

function generateProceduralChallenge(mode: string, theme: string) {
  let challenge;
  switch (mode) {
    case 'objects':
      challenge = generateObjectsChallenge(theme);
      break;
    case 'numbers':
      challenge = generateNumbersChallenge(theme);
      break;
    case 'patterns':
      challenge = generatePatternsChallenge(theme);
      break;
    case 'story':
      challenge = generateStoryChallenge(theme);
      break;
    case 'mixed':
    default:
      challenge = generateMixedChallenge(theme);
      break;
  }
  challenge.theme = theme;
  challenge.mode = mode;
  return challenge;
}

function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = 'MH';
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

function evaluateSessionResults(session: any) {
  if (session.status === 'results') return; // already processed
  session.status = 'results';
  session.timerLeft = 0;

  // Auto calculate non-submitted answers as incorrect
  Object.keys(session.players).forEach(userId => {
    const player = session.players[userId];
    session.questions.forEach(q => {
      if (!player.answersSubmitted || !player.answersSubmitted[q.id]) {
        if (!player.answersSubmitted) player.answersSubmitted = {};
        player.answersSubmitted[q.id] = '';
      }
    });
    
    // Compute scores
    let correct = 0;
    let earned = 0;
    session.questions.forEach(q => {
      if (player.answersSubmitted[q.id] === q.correctAnswer) {
        correct++;
        // Raw score + speed bonus if completed fast
        const speedBonus = player.completionTime > 0 ? Math.max(0, Math.floor((30 - player.completionTime) * 2)) : 0;
        earned += q.points + speedBonus;
      }
    });
    
    const accuracy = Math.round((correct / session.questions.length) * 100);
    player.score = earned;
    player.answersCorrectPercent = accuracy;

    // Award persistence metrics to global players profile
    if (USERS[userId]) {
      const up = USERS[userId];
      up.stats.gamesPlayed += 1;
      up.stats.totalScore += player.score;
      up.stats.xp += player.score;
      
      // Re-calculate accuracy
      up.stats.accuracy = Math.round(((up.stats.accuracy * (up.stats.gamesPlayed - 1)) + accuracy) / up.stats.gamesPlayed);
      
      if (accuracy === 100) {
        if (!up.stats.achievementsUnlocked.includes('perfect_recall')) {
          up.stats.achievementsUnlocked.push('perfect_recall');
        }
      }
      if (up.stats.xp > 10000 && !up.stats.achievementsUnlocked.includes('memory_master')) {
        up.stats.achievementsUnlocked.push('memory_master');
      }
      if (up.stats.gamesPlayed === 1 && !up.stats.achievementsUnlocked.includes('first_heist')) {
        up.stats.achievementsUnlocked.push('first_heist');
      }

      // Adjust Ranks
      if (up.stats.xp > 8000) up.stats.rank = 'Gold Champion';
      else if (up.stats.xp > 4050) up.stats.rank = 'Silver Elite';
      else if (up.stats.xp > 1500) up.stats.rank = 'Bronze Master';
    }
  });

  // Determine Multiplayer Winner
  let bestScore = -1;
  let winnerId = '';
  Object.keys(session.players).forEach(userId => {
    if (session.players[userId].score > bestScore) {
      bestScore = session.players[userId].score;
      winnerId = userId;
    }
  });

  if (winnerId && USERS[winnerId]) {
    if (!USERS[winnerId].stats.achievementsUnlocked.includes('multiplayer_winner')) {
      USERS[winnerId].stats.achievementsUnlocked.push('multiplayer_winner');
    }
  }

  saveUsers();
}

// Background Timer Loop (Serves Multiplayer Phase transitions seamlessly)
setInterval(() => {
  for (const roomId in SESSIONS) {
    const session = SESSIONS[roomId];
    if (session.status === 'lobby') continue;
    if (session.status === 'observe' && !session.isMultiplayer && session.started === false) continue;

    if (session.timerLeft > 0) {
      session.timerLeft -= 1;
    } else {
      // Transition Game phase
      if (session.status === 'observe') {
        if (session.isMultiplayer) {
          session.status = 'discuss';
          session.timerLeft = 30; // 30s discussion phase
          session.chat.push({
            id: `sys_${Date.now()}`,
            userId: 'system',
            username: 'System Coordinator',
            avatar: '📢',
            text: 'Observation phase over! Live Chat has been unlocked. Discuss layout details with your crew!',
            timestamp: new Date().toISOString()
          });
        } else {
          session.status = 'answer';
          session.timerLeft = 30; // 30s answer phase
          session.chat.push({
            id: `sys_${Date.now()}`,
            userId: 'system',
            username: 'System Coordinator',
            avatar: '📢',
            text: 'Observation phase over! Submit your final answers individually now!',
            timestamp: new Date().toISOString()
          });
        }
      } else if (session.status === 'discuss') {
        session.status = 'answer';
        session.timerLeft = 30; // 30s answer phase
        session.chat.push({
          id: `sys_${Date.now()}`,
          userId: 'system',
          username: 'System Coordinator',
          avatar: '📢',
          text: 'Discussion phase ended! Live Chat has been locked. Submit your final answers individually now!',
          timestamp: new Date().toISOString()
        });
      } else if (session.status === 'answer') {
        evaluateSessionResults(session);
      }
    }
  }
}, 1000);

// API REST Endpoints

// Authentication API
app.post('/api/auth/register', (req, res) => {
  const { name, username, email, password, avatar } = req.body;
  if (!name || !username || !email) {
    return res.status(400).json({ error: 'Full name, email and unique username required' });
  }

  const userId = `usr_${Math.floor(1000 + Math.random() * 9000)}`;
  USERS[userId] = {
    id: userId,
    name,
    username,
    email,
    avatar: avatar || '🕵️‍♂️ Sherlock',
    stats: {
      totalScore: 0,
      gamesPlayed: 0,
      accuracy: 0,
      rank: 'Bronze I',
      xp: 150, // Initial login bonus
      bestStreak: 1,
      achievementsUnlocked: []
    }
  };
  saveUsers();

  res.json({ message: 'Register successful', user: USERS[userId] });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  // Find match or auto-create friendly profile for immediate zero-friction demo play
  let user = Object.values(USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Lazy high-safety fallback: auto register so developers never get blocked!
    const randomId = Math.floor(100 + Math.random() * 900);
    const mockEmailParts = email.split('@');
    const displayUser = mockEmailParts[0] || 'Agent';
    user = {
      id: `usr_${randomId}`,
      name: displayUser.charAt(0).toUpperCase() + displayUser.slice(1),
      username: `${displayUser}${randomId}`,
      email: email,
      avatar: '🕵️‍♂️ Sherlock',
      stats: {
        totalScore: 4200,
        gamesPlayed: 12,
        accuracy: 85,
        rank: 'Bronze III',
        xp: 1200,
        bestStreak: 4,
        achievementsUnlocked: ['first_heist']
      }
    };
    USERS[user.id] = user;
    saveUsers();
  }
  res.json({ message: 'Login successful', user });
});

// Profile stats & edits
app.post('/api/users/sync', (req, res) => {
  const { user } = req.body;
  if (!user || !user.id) {
    return res.status(400).json({ error: 'Invalid user payload' });
  }
  if (!USERS[user.id]) {
    USERS[user.id] = user;
    saveUsers();
  }
  res.json(USERS[user.id]);
});

app.get('/api/users/:id', (req, res) => {
  const user = USERS[req.params.id];
  if (!user) return res.status(404).json({ error: 'User does not exist' });
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const user = USERS[req.params.id];
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { name, username, avatar } = req.body;
  if (name) user.name = name;
  if (username) user.username = username;
  if (avatar) user.avatar = avatar;
  saveUsers();
  
  res.json({ message: 'Profile updated', user });
});

// Fetch Leaderboards
app.get('/api/leaderboards', (req, res) => {
  // Merge static bot rankings with any live players
  const playersList = Object.values(USERS).map(u => ({
    userId: u.id,
    username: u.username,
    avatar: u.avatar,
    rank: u.stats.rank,
    score: u.stats.totalScore,
    accuracy: u.stats.accuracy,
    xp: u.stats.xp
  }));
  
  const fullLeaderboard = [...playersList, ...LEADERBOARD].sort((a, b) => b.score - a.score);
  res.json({
    daily: fullLeaderboard,
    weekly: fullLeaderboard,
    allTime: fullLeaderboard
  });
});

// Get Achievements List
app.get('/api/achievements', (req, res) => {
  res.json(DEFAULT_ACHIEVEMENTS);
});

// Daily challenge
app.get('/api/daily-challenge', (req, res) => {
  res.json(DAILY_CHALLENGE);
});

// Lobby/Room systems
app.post('/api/rooms/create', async (req, res) => {
  const { userId, mode, theme, isMultiplayer, useAI } = req.body;
  const user = USERS[userId];
  const hostName = user ? user.username : 'Unknown Agent';
  const hostAvatar = user ? user.avatar : '🕵️‍♂️';

  const roomCode = generateRoomCode();
  
  // Decide challenge configuration
  let challenge;
  if (mode && theme) {
    if (theme === 'Cricket Stadium' && mode === 'mixed') {
      challenge = JSON.parse(JSON.stringify(DAILY_CHALLENGE));
    } else {
      challenge = generateProceduralChallenge(mode, theme);
    }
  } else {
    const randomFallback = FALLBACK_CHALLENGES[Math.floor(Math.random() * FALLBACK_CHALLENGES.length)];
    challenge = generateProceduralChallenge(randomFallback.mode, randomFallback.theme);
  }

  // Trigger Gemini API optimization or scaling if specified
  const genAI = getGeminiClient();
  if (useAI && genAI) {
    try {
      const gPrompt = `Create a family-friendly and highly specific Memory and Observation game puzzle located at: "${theme}" using GameMode: "${mode}".
      Fill appropriate fields based on the mode:
      - If mode is 'objects': fill "objects" with 4-5 entries representing distinct items in the scene. Leave numbersSequence, patternGrid, and storyText empty.
      - If mode is 'numbers': fill "numbersSequence" with a highly unique 6-digit passcode. Other visual fields are empty.
      - If mode is 'patterns': fill "patternGrid" with 9 cells forming a 3x3 array. Each cell must have row (1-3), col (1-3), color (e.g. Red, Green, Blue, Violet, Amber, Orange), and symbol (choose from: Sneaker, Heel, Boot, Acid, Carbon, Water, Cosmic).
      - If mode is 'story': fill "storyText" with a highly engaging narrative of 3-4 sentences containing target cities, specific transactions, exact sums of money, day of week, or names.
      - If mode is 'mixed': combine multiple categories (e.g., fill storyText with a narrative and include 3-4 objects in the objects list).
      Ensure you generate exactly 5 multiple choice questions testing players on the hyper-specific details of what you described. Provide exactly 4 plausible options for each, and state the correctAnswer matching the correct option exactly.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "An evocative, creative, Indian-themed memory heist title appropriate for the location and mode"
          },
          description: {
            type: Type.STRING,
            description: "A rich narrative paragraph describing a high-detail scene layout with objects, colours, counts, placements, and locations for agents to examine."
          },
          objects: {
            type: Type.ARRAY,
            description: "List of 4 to 6 specific items placed in the scene. Required if mode is 'objects', 'mixed' or any general mode.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the item, e.g., 'Vintage Sitar', 'Plate of Piping Hot Samosas', 'Wicker Basket'" },
                color: { type: Type.STRING, description: "Color or aesthetic aspect, e.g., 'Emerald Green', 'Royal Crimson', 'Midnight Gold'" },
                position: { type: Type.STRING, description: "The relative coordinates/placement, e.g., 'Beside Row 4 Desk', 'Hung on the Main Gate Pillar', 'Next to the Clock Tower'" }
              },
              required: ["name", "color", "position"]
            }
          },
          numbersSequence: {
            type: Type.STRING,
            description: "A secure 6-digit numeric string containing only digits, e.g. '849312'. Required if mode is 'numbers' or 'mixed'."
          },
          patternGrid: {
            type: Type.OBJECT,
            description: "A matrix puzzle representing high-spec keypad passcodes with rows & cols. Required if mode is 'patterns'.",
            properties: {
              rows: { type: Type.INTEGER, description: "Always 3" },
              cols: { type: Type.INTEGER, description: "Always 3" },
              cells: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    row: { type: Type.INTEGER, description: "Row index from 1 to 3" },
                    col: { type: Type.INTEGER, description: "Column index from 1 to 3" },
                    color: { type: Type.STRING, description: "Color shade e.g. 'Violet', 'Amber', 'Emerald', 'Indigo', 'Azure'" },
                    symbol: { type: Type.STRING, description: "The symbol keyword. Choose from: 'Sneaker', 'Heel', 'Boot', 'Acid', 'Carbon', 'Water', 'Cosmic'" }
                  },
                  required: ["row", "col", "color", "symbol"]
                }
              }
            },
            required: ["rows", "cols", "cells"]
          },
          storyText: {
            type: Type.STRING,
            description: "A paragraph story filled with hyper-specific transactional or circumstantial details (names, target cities, exact quantities, timestamps). Required if mode is 'story' or 'mixed'."
          },
          questions: {
            type: Type.ARRAY,
            description: "A set of strictly 5 ingenious multiple-choice questions testing observation skill on the exact details generated in this prompt.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "Observational question such as 'How many total green items are on the platform?' or 'Which digit is in the fourth index of our keypad sequence?'" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options, only 1 of which is correct. These must be concise and family-friendly."
                },
                correctAnswer: { type: Type.STRING, description: "The absolute correct option in string representation. Must match EXACTLY an item in the options list." },
                points: { type: Type.INTEGER, description: "Awardable score, default 200" }
              },
              required: ["id", "text", "options", "correctAnswer", "points"]
            }
          }
        },
        required: ["title", "description", "questions"]
      };

      let aiResponse;
      let lastError: any;
      const maxAttempts = 3;
      // Resilient sequence of models to bypass temporary regional high-demand / 503 limits
      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const selectedModel = modelsToTry[attempt - 1] || 'gemini-3.5-flash';
        try {
          aiResponse = await genAI.models.generateContent({
            model: selectedModel,
            contents: gPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
            },
          });
          break; // successfully generated response, break retry loop
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
          const isUnavailable = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('busy');
          
          if (isQuota) {
            console.log(`[Notification] Gemini API limit reached with model ${selectedModel}. Engaging tactical backup sequence.`);
            break;
          } else if (isUnavailable) {
            console.log(`[Notification] Model ${selectedModel} is temporarily under high demand (503). Retrying cascade...`);
          } else {
            console.log(`[Notification] Model ${selectedModel} response standby. Standby error: ${errMsg}`);
          }

          if (attempt < maxAttempts) {
            // Wait with backoff: 1050ms, 2100ms
            await new Promise((resolve) => setTimeout(resolve, attempt * 1050));
          }
        }
      }

      if (!aiResponse) {
        throw lastError || new Error('All model candidates temporarily busy. Engaging seamless tactical procedural generator fallback.');
      }

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        const finalObjects = (parsed.objects || []).map((o: any) => ({
          name: o.name || 'Mysterious Trunk',
          color: o.color || 'Dark Jade',
          position: o.position || o.pos || 'Center Console'
        }));

        challenge = {
          theme: theme || 'Indian Railway Station',
          mode: mode || 'objects',
          title: parsed.title || `Dynamic Heist Sector: ${theme}`,
          description: parsed.description || `Tactical heist blueprint sector coverage at the ${theme}. Remember details!`,
          objects: finalObjects.length > 0 ? finalObjects : undefined,
          numbersSequence: parsed.numbersSequence || undefined,
          patternGrid: parsed.patternGrid || undefined,
          storyText: parsed.storyText || undefined,
          questions: (parsed.questions || []).map((q: any, i: number) => ({
            id: q.id || `aq_${i}_${Date.now()}`,
            text: q.text,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            points: q.points || 200
          })),
          generatedBy: 'gemini'
        };
      }
    } catch (e: any) {
      const errMsg = e?.message || String(e);
      const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        console.log('[Notification] Gemini API limit reached. Activating robust tactical backup generator.');
        challenge.generatedBy = 'procedural-quota';
      } else {
        console.log(`[Notification] Generation backup deployed: ${errMsg}`);
        challenge.generatedBy = 'procedural-error';
      }
    }
  }

  // Ensure generatedBy flag is defined on challenge
  if (challenge) {
    challenge.generatedBy = challenge.generatedBy || 'procedural';
  }

  // Shuffle questions and their options at each play to guarantee a fresh experience
  challenge = shuffleChallenge(challenge);

  SESSIONS[roomCode] = {
    id: roomCode,
    isMultiplayer: !!isMultiplayer,
    mode: challenge.mode,
    theme: challenge.theme,
    status: isMultiplayer ? 'lobby' : 'observe',
    started: !isMultiplayer ? false : true,
    timerLeft: challenge.mode === 'story' ? 20 : 15, // Observation timer logic (15-20 seconds)
    scene: {
      theme: challenge.theme,
      mode: challenge.mode,
      title: challenge.title,
      description: challenge.description,
      objects: challenge.objects,
      numbersSequence: challenge.numbersSequence,
      patternGrid: challenge.patternGrid,
      storyText: challenge.storyText,
      generatedBy: challenge.generatedBy
    },
    questions: challenge.questions,
    players: {
      [userId]: {
        userId,
        username: hostName,
        avatar: hostAvatar,
        xp: user ? user.stats.xp : 0,
        ready: false, // Starts as false to track answer submission completion status safely
        score: 0,
        answersSubmitted: {},
        answersCorrectPercent: 0,
        completionTime: 0
      }
    },
    chat: [
      {
        id: `sys_welcome_${Date.now()}`,
        userId: 'system',
        username: 'Intelligence Bureau',
        avatar: '🚨',
        text: `Room ${roomCode} initialized. Operation: Heist of detail at the ${challenge.theme}!`,
        timestamp: new Date().toISOString()
      },
      ...(challenge.generatedBy === 'procedural-quota' ? [{
        id: `sys_quota_${Date.now()}`,
        userId: 'system',
        username: 'Intelligence Bureau',
        avatar: '⚠️',
        text: `Notice: Daily free-tier AI generation quota exceeded. Seamlessly fell back to adaptive procedural generation!`,
        timestamp: new Date().toISOString()
      }] : []),
      ...(challenge.generatedBy === 'procedural-error' ? [{
        id: `sys_error_${Date.now()}`,
        userId: 'system',
        username: 'Intelligence Bureau',
        avatar: '⚠️',
        text: `Notice: Intelligence server is temporarily busy. Seamlessly fell back to tactical procedural generation!`,
        timestamp: new Date().toISOString()
      }] : [])
    ],
    maxPlayers: 4,
    hostId: userId
  };

  res.json(SESSIONS[roomCode]);
});

// Join multiplayer room
app.post('/api/rooms/join', (req, res) => {
  const { userId, roomCode } = req.body;
  const upperCode = roomCode?.toUpperCase();
  const session = SESSIONS[upperCode];
  
  if (!session) {
    return res.status(444).json({ error: 'Room code not found or expired' });
  }

  if (Object.keys(session.players).length >= session.maxPlayers) {
    return res.status(400).json({ error: 'Multiplayer room is completely full' });
  }

  const user = USERS[userId];
  if (!user) {
    return res.status(404).json({ error: 'Please login or register first' });
  }

  session.players[userId] = {
    userId,
    username: user.username,
    avatar: user.avatar,
    xp: user.stats.xp,
    ready: false,
    score: 0,
    answersSubmitted: {},
    answersCorrectPercent: 0,
    completionTime: 0
  };

  session.chat.push({
    id: `sys_join_${Date.now()}`,
    userId: 'system',
    username: 'Security System',
    avatar: '🔌',
    text: `${user.username} has bypassed firewalls and joined the lobby!`,
    timestamp: new Date().toISOString()
  });

  res.json(session);
});

// Sync Room / Gameplay ticks
app.get('/api/rooms/:id', (req, res) => {
  const room = SESSIONS[req.params.id?.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room expired or closed' });

  // If solo and not started yet, mark it as started now that the client has loaded
  if (!room.isMultiplayer && room.status === 'observe' && room.started === false) {
    room.started = true;
    room.timerLeft = room.mode === 'story' ? 20 : 15;
  }

  res.json(room);
});

app.post('/api/rooms/:id/ready', (req, res) => {
  const { userId } = req.body;
  const room = SESSIONS[req.params.id?.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  if (room.players[userId]) {
    room.players[userId].ready = !room.players[userId].ready;
  }

  // Check if ALL players are ready -> Start Game
  const allReady = Object.values(room.players).every(p => p.ready);
  if (allReady && Object.keys(room.players).length >= (room.isMultiplayer ? 2 : 1)) {
    room.status = 'observe';
    room.timerLeft = room.mode === 'story' ? 20 : 15; // Set official observation countdown
    room.chat.push({
      id: `sys_start_${Date.now()}`,
      userId: 'system',
      username: 'System Coordinator',
      avatar: '📢',
      text: 'Operation Memory Heist has begun! Memorize details of the Indian scene immediately.',
      timestamp: new Date().toISOString()
    });
    // Reset players readiness so it can be used for tracking answers submission completion
    Object.values(room.players).forEach(p => {
      p.ready = false;
    });
  }

  res.json(room);
});

app.post('/api/rooms/:id/chat', (req, res) => {
  const { userId, text } = req.body;
  const room = SESSIONS[req.params.id?.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Active lobby not found' });

  // Discourage typing if chat locked
  if (room.status === 'answer' || room.status === 'results') {
    return res.status(403).json({ error: 'Chat is locked during answers!' });
  }

  const p = room.players[userId];
  if (!p) return res.status(403).json({ error: 'Player is not in this room' });

  room.chat.push({
    id: `chat_${Date.now()}`,
    userId,
    username: p.username,
    avatar: p.avatar,
    text,
    timestamp: new Date().toISOString()
  });

  res.json(room);
});

// Update typing indicator
app.post('/api/rooms/:id/typing', (req, res) => {
  const { userId, isTyping } = req.body;
  const room = SESSIONS[req.params.id?.toUpperCase()];
  if (room && room.players[userId]) {
    room.players[userId].typing = isTyping;
  }
  res.json({ success: true });
});

// Answers submit
app.post('/api/rooms/:id/submit-answers', (req, res) => {
  const { userId, answers, timeTaken } = req.body;
  const room = SESSIONS[req.params.id?.toUpperCase()];
  if (!room) return res.status(404).json({ error: 'Game expired' });

  const p = room.players[userId];
  if (p) {
    p.answersSubmitted = answers || {};
    p.completionTime = timeTaken || 15;
    p.ready = true; // Signals done with answers
  }

  // If everyone submits answers early, transition to results immediately to save time!
  const everyoneSubmitted = Object.values(room.players).every(player => player.ready);
  if (everyoneSubmitted && room.status === 'answer') {
    evaluateSessionResults(room);
  }

  res.json(room);
});

// Mount Vite middleware for dev or standard Static builds
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Memory Heist Server Running securely on http://localhost:${PORT}`);
  });
}

startServer();
