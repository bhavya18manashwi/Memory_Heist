/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from '@google/genai';

// --- Shared Data and Mock DBs ---
const DB_USER_KEY = 'heist_users_db_local';
const DB_SESSION_KEY = 'heist_sessions_db_local';

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_heist', title: 'First Heist', description: 'Complete your first memory challenge.', badge: '🕵️‍♂️' },
  { id: 'perfect_recall', title: 'Perfect Recall', description: 'Get a perfect 100% score on any challenge.', badge: '🧠' },
  { id: 'speed_observer', title: 'Speed Observer', description: 'Submit all answers with more than 15 seconds remaining.', badge: '⚡' },
  { id: 'memory_master', title: 'Memory Master', description: 'Reach 10,000 Total XP.', badge: '👑' },
  { id: 'daily_champion', title: 'Daily Champion', description: 'Submit score for the Daily Heist Co-Op.', badge: '📅' },
  { id: 'multiplayer_winner', title: 'Multiplayer Winner', description: 'Secure 1st place in a multiplayer match.', badge: '🏆' },
];

const LEADERBOARD_BOTS = [
  { userId: 'bot_1', username: 'SherlockSharma', avatar: '🕵️‍♂️ Sherlock', rank: 'Memory Master', score: 18500, accuracy: 96, xp: 12500 },
  { userId: 'bot_2', username: 'ChaiCaptain', avatar: '☕ Chai Lover', rank: 'Gold III', score: 14200, accuracy: 91, xp: 9400 },
  { userId: 'bot_3', username: 'MetroRider26', avatar: '🚇 Metro Raider', rank: 'Gold II', score: 12900, accuracy: 89, xp: 8100 },
  { userId: 'bot_4', username: 'DholBeats', avatar: '🥁 Dhol Star', rank: 'Silver III', score: 10400, accuracy: 84, xp: 6200 },
  { userId: 'bot_5', username: 'AmberCrown', avatar: '👑 Royal Fort', rank: 'Silver I', score: 7100, accuracy: 78, xp: 4500 },
];

const DAILY_CHALLENGE = {
  date: '2026-06-09',
  theme: 'Cricket Stadium',
  mode: 'mixed',
  title: 'Daily Curated Challenge: Wankhede Stadium',
  description: 'The roaring crowds have gone home. Pinned to the sightscreen is a glowing message. Focus on the boundary flags, cricket willow placements, and central pitch markings!',
  objects: [
    { name: 'VIP Spectator Pass', color: 'Royal Purple', position: 'Pinned to the sightscreen board' },
    { name: 'Signed League Leather Ball', color: 'Bright Crimson', position: 'Near the boundary rope' },
    { name: 'English Willow Bat', color: 'Light Wood Amber', position: 'Leaning on the VIP table sideline' }
  ],
  numbersSequence: '492816',
  questions: [
    {
      id: 'dc_q_1',
      text: 'What was the exact digit sequence printed as the sync pin code on the stadium dashboard?',
      options: ['492816', '492800', '495516', '412816'],
      correctAnswer: '492816',
      points: 250
    },
    {
      id: 'dc_q_2',
      text: 'Which color characterized the VIP Spectator Pass pinned to the sightscreen board?',
      options: ['Royal Purple', 'Matte Black', 'Bright Crimson', 'Electric Yellow'],
      correctAnswer: 'Royal Purple',
      points: 200
    },
    {
      id: 'dc_q_3',
      text: 'What was the exact position of the Signed League Leather Ball in the observed stadium layout?',
      options: ['Near the boundary rope', 'On the spectator glass table', 'Beside the grass rollers', 'Leaning on the VIP table sideline'],
      correctAnswer: 'Near the boundary rope',
      points: 200
    }
  ]
};

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
  }
};

// Helpers
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateRoomCode(): string {
  const numbers = '0123456789';
  let code = 'MH';
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

// Procedural Generators
function generateObjectsChallenge(theme: string) {
  const data = OBJ_POOL_BY_THEME[theme] || OBJ_POOL_BY_THEME['Indian Railway Station'];
  const shuffledNames = shuffleArray(data.names).slice(0, 3);
  const shuffledColors = shuffleArray(data.colors);
  const shuffledPositions = shuffleArray(data.positions);
  
  const chosenObjects = shuffledNames.map((name, i) => ({
    name,
    color: shuffledColors[i],
    position: shuffledPositions[i]
  }));
  
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

// Local Database Interface Helpers
function getLocalUsers(): Record<string, any> {
  try {
    const raw = localStorage.getItem(DB_USER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, any>) {
  try {
    localStorage.setItem(DB_USER_KEY, JSON.stringify(users));
  } catch {}
}

function getLocalSessions(): Record<string, any> {
  try {
    const raw = sessionStorage.getItem(DB_SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSessions(sessions: Record<string, any>) {
  try {
    sessionStorage.setItem(DB_SESSION_KEY, JSON.stringify(sessions));
  } catch {}
}

// Session Score Evaluator
function evaluateSessionResults(session: any) {
  if (session.status === 'results') return;
  session.status = 'results';
  session.timerLeft = 0;

  const users = getLocalUsers();

  Object.keys(session.players).forEach(userId => {
    const player = session.players[userId];
    session.questions.forEach((q: any) => {
      if (!player.answersSubmitted || !player.answersSubmitted[q.id]) {
        if (!player.answersSubmitted) player.answersSubmitted = {};
        player.answersSubmitted[q.id] = '';
      }
    });
    
    let correct = 0;
    let earned = 0;
    session.questions.forEach((q: any) => {
      if (player.answersSubmitted[q.id] === q.correctAnswer) {
        correct++;
        const speedBonus = player.completionTime > 0 ? Math.max(0, Math.floor((30 - player.completionTime) * 2)) : 0;
        earned += q.points + speedBonus;
      }
    });
    
    const accuracy = Math.round((correct / session.questions.length) * 100);
    player.score = earned;
    player.answersCorrectPercent = accuracy;

    if (users[userId]) {
      const up = users[userId];
      up.stats.gamesPlayed += 1;
      up.stats.totalScore += player.score;
      up.stats.xp += player.score;
      up.stats.accuracy = Math.round(((up.stats.accuracy * (up.stats.gamesPlayed - 1)) + accuracy) / up.stats.gamesPlayed);
      
      if (accuracy === 100 && !up.stats.achievementsUnlocked.includes('perfect_recall')) {
        up.stats.achievementsUnlocked.push('perfect_recall');
      }
      if (up.stats.xp > 10000 && !up.stats.achievementsUnlocked.includes('memory_master')) {
        up.stats.achievementsUnlocked.push('memory_master');
      }
      if (up.stats.gamesPlayed === 1 && !up.stats.achievementsUnlocked.includes('first_heist')) {
        up.stats.achievementsUnlocked.push('first_heist');
      }

      if (up.stats.xp > 8000) up.stats.rank = 'Gold Champion';
      else if (up.stats.xp > 4050) up.stats.rank = 'Silver Elite';
      else if (up.stats.xp > 1500) up.stats.rank = 'Bronze Master';
    }
  });

  let bestScore = -1;
  let winnerId = '';
  Object.keys(session.players).forEach(userId => {
    if (session.players[userId].score > bestScore) {
      bestScore = session.players[userId].score;
      winnerId = userId;
    }
  });

  if (winnerId && users[winnerId]) {
    if (!users[winnerId].stats.achievementsUnlocked.includes('multiplayer_winner')) {
      users[winnerId].stats.achievementsUnlocked.push('multiplayer_winner');
    }
  }

  saveLocalUsers(users);
}

// Background Interval for Client Fallback Timer Loop
setInterval(() => {
  const sessions = getLocalSessions();
  let changed = false;

  for (const roomId in sessions) {
    const session = sessions[roomId];
    if (session.status === 'lobby') continue;
    if (session.status === 'observe' && !session.isMultiplayer && session.started === false) continue;

    if (session.timerLeft > 0) {
      session.timerLeft -= 1;
      changed = true;
    } else {
      changed = true;
      if (session.status === 'observe') {
        if (session.isMultiplayer) {
          session.status = 'discuss';
          session.timerLeft = 30;
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
          session.timerLeft = 30;
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
        session.timerLeft = 30;
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

  if (changed) {
    saveLocalSessions(sessions);
  }
}, 1000);

// Core Mock Request Processor
export async function handleClientFallback(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : {};

  // Helper helper to return a response-like JSON structure
  const jsonResponse = (data: any, status: number = 200) => {
    return Promise.resolve(new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    }));
  };

  // 1. Auth Register
  if (url.endsWith('/api/auth/register') && method === 'POST') {
    const { name, username, email, avatar } = body;
    if (!name || !username || !email) {
      return jsonResponse({ error: 'Full name, email and unique username required' }, 400);
    }
    const users = getLocalUsers();
    const userId = `usr_${Math.floor(1000 + Math.random() * 9000)}`;
    users[userId] = {
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
        xp: 150,
        bestStreak: 1,
        achievementsUnlocked: []
      }
    };
    saveLocalUsers(users);
    return jsonResponse({ message: 'Register successful', user: users[userId] });
  }

  // 2. Auth Login
  if (url.endsWith('/api/auth/login') && method === 'POST') {
    const { email } = body;
    const users = getLocalUsers();
    let user = Object.values(users).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
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
      users[user.id] = user;
      saveLocalUsers(users);
    }
    return jsonResponse({ message: 'Login successful', user });
  }

  // 3. User Sync
  if (url.endsWith('/api/users/sync') && method === 'POST') {
    const { user } = body;
    if (!user || !user.id) {
      return jsonResponse({ error: 'Invalid user payload' }, 400);
    }
    const users = getLocalUsers();
    users[user.id] = user;
    saveLocalUsers(users);
    return jsonResponse(users[user.id]);
  }

  // 4. Get User Profile or Update User Profile
  const userMatch = url.match(/\/api\/users\/([^/?#]+)/);
  if (userMatch) {
    const userId = userMatch[1];
    const users = getLocalUsers();
    const user = users[userId];
    if (!user) {
      return jsonResponse({ error: 'User does not exist' }, 404);
    }
    if (method === 'PUT') {
      const { name, username, avatar } = body;
      if (name) user.name = name;
      if (username) user.username = username;
      if (avatar) user.avatar = avatar;
      saveLocalUsers(users);
      return jsonResponse({ message: 'Profile updated', user });
    }
    return jsonResponse(user);
  }

  // 5. Fetch Leaderboards
  if (url.includes('/api/leaderboards')) {
    const users = getLocalUsers();
    const playersList = Object.values(users).map((u: any) => ({
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
      rank: u.stats.rank,
      score: u.stats.totalScore,
      accuracy: u.stats.accuracy,
      xp: u.stats.xp
    }));
    const fullLeaderboard = [...playersList, ...LEADERBOARD_BOTS].sort((a, b) => b.score - a.score);
    return jsonResponse({
      daily: fullLeaderboard,
      weekly: fullLeaderboard,
      allTime: fullLeaderboard
    });
  }

  // 6. Get Achievements List
  if (url.includes('/api/achievements')) {
    return jsonResponse(DEFAULT_ACHIEVEMENTS);
  }

  // 7. Daily challenge
  if (url.includes('/api/daily-challenge')) {
    return jsonResponse(DAILY_CHALLENGE);
  }

  // 8. Room Create
  if (url.endsWith('/api/rooms/create') && method === 'POST') {
    const { userId, mode, theme, isMultiplayer } = body;
    const users = getLocalUsers();
    const user = users[userId];
    
    const roomCode = generateRoomCode();
    let challenge;
    if (mode && theme) {
      if (theme === 'Cricket Stadium' && mode === 'mixed') {
        challenge = JSON.parse(JSON.stringify(DAILY_CHALLENGE));
      } else {
        challenge = generateProceduralChallenge(mode, theme);
      }
    } else {
      challenge = generateProceduralChallenge('mixed', 'Cricket Stadium');
    }

    const sessions = getLocalSessions();
    const session = {
      id: roomCode,
      code: roomCode,
      hostId: userId,
      hostName: user ? user.username : 'Unknown Agent',
      hostAvatar: user ? user.avatar : '🕵️‍♂️ Sherlock',
      mode: mode || 'mixed',
      theme: theme || 'Cricket Stadium',
      status: isMultiplayer ? 'lobby' : 'observe',
      isMultiplayer: !!isMultiplayer,
      started: !isMultiplayer ? false : true,
      timerLeft: challenge.mode === 'story' ? 20 : 15,
      players: {
        [userId]: {
          userId,
          username: user ? user.username : 'Unknown Agent',
          avatar: user ? user.avatar : '🕵️‍♂️ Sherlock',
          ready: false,
          score: 0,
          completionTime: 0,
          answersCorrectPercent: 0,
          answersSubmitted: {}
        }
      },
      scene: {
        theme: theme || 'Cricket Stadium',
        mode: mode || 'mixed',
        title: challenge.title || `Heist at ${theme || 'Cricket Stadium'}`,
        description: challenge.description || 'Identify and memorize key layout patterns.',
        objects: challenge.objects || [],
        numbersSequence: challenge.numbersSequence || '',
        patternGrid: challenge.patternGrid || null,
        storyText: challenge.storyText || '',
        generatedBy: challenge.generatedBy || 'procedural-quota'
      },
      questions: challenge.questions,
      objects: challenge.objects || [],
      numbersSequence: challenge.numbersSequence || '',
      patternGrid: challenge.patternGrid || null,
      storyText: challenge.storyText || '',
      chat: [
        {
          id: 'sys_welcome',
          userId: 'system',
          username: 'Operations AI',
          avatar: '🤖',
          text: `Operation room initialized. Area: ${theme || 'Cricket Stadium'}. Mode: ${mode || 'mixed'}. Get ready to memorize!`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    sessions[roomCode] = session;
    saveLocalSessions(sessions);
    return jsonResponse(session);
  }

  // 9. Room Join
  if (url.endsWith('/api/rooms/join') && method === 'POST') {
    const { code, roomCode, userId } = body;
    const inputCode = code || roomCode;
    if (!inputCode) return jsonResponse({ error: 'Please submit a 6-character Code' }, 400);
    const resolvedRoomCode = inputCode.toUpperCase();
    const sessions = getLocalSessions();
    const room = sessions[resolvedRoomCode];
    if (!room) return jsonResponse({ error: 'Room was not found' }, 404);

    const users = getLocalUsers();
    const user = users[userId];

    if (!room.players[userId]) {
      room.players[userId] = {
        userId,
        username: user ? user.username : 'Unknown Agent',
        avatar: user ? user.avatar : '🕵️‍♂️ Sherlock',
        ready: false,
        score: 0,
        completionTime: 0,
        answersCorrectPercent: 0,
        answersSubmitted: {}
      };
      
      room.chat.push({
        id: `join_${Date.now()}`,
        userId: 'system',
        username: 'System Lobbyist',
        avatar: '🚪',
        text: `${user ? user.username : 'Unknown Agent'} entered the ready room!`,
        timestamp: new Date().toISOString()
      });
    }

    saveLocalSessions(sessions);
    return jsonResponse(room);
  }

  // 10. Room Toggle Ready
  const readyMatch = url.match(/\/api\/rooms\/([^/]+)\/ready/);
  if (readyMatch) {
    const roomId = readyMatch[1].toUpperCase();
    const { userId } = body;
    const sessions = getLocalSessions();
    const room = sessions[roomId];
    if (!room) return jsonResponse({ error: 'Game expired' }, 404);

    const p = room.players[userId];
    if (p) {
      p.ready = !p.ready;
    }

    const allReady = Object.values(room.players).every((player: any) => player.ready);
    if (allReady && room.status === 'lobby') {
      room.status = 'observe';
      room.timerLeft = room.mode === 'story' ? 20 : 15;
      Object.values(room.players).forEach((player: any) => {
        player.ready = false;
      });
      room.chat.push({
        id: `ready_${Date.now()}`,
        userId: 'system',
        username: 'Intelligence Bureau',
        avatar: '🚨',
        text: 'All players are locked in! Transitioning to target layout. Operation Live!',
        timestamp: new Date().toISOString()
      });
    }

    saveLocalSessions(sessions);
    return jsonResponse(room);
  }

  // 11. Room Send Chat
  const chatMatch = url.match(/\/api\/rooms\/([^/]+)\/chat/);
  if (chatMatch) {
    const roomId = chatMatch[1].toUpperCase();
    const { message } = body;
    const sessions = getLocalSessions();
    const room = sessions[roomId];
    if (!room) return jsonResponse({ error: 'Game expired' }, 404);

    room.chat.push({
      id: message.id || `msg_${Date.now()}`,
      userId: message.userId,
      username: message.username,
      avatar: message.avatar,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString()
    });

    saveLocalSessions(sessions);
    return jsonResponse(room);
  }

  // 12. Submit Answers
  const answersMatch = url.match(/\/api\/rooms\/([^/]+)\/submit-answers/);
  if (answersMatch) {
    const roomId = answersMatch[1].toUpperCase();
    const { userId, answers, timeTaken } = body;
    const sessions = getLocalSessions();
    const room = sessions[roomId];
    if (!room) return jsonResponse({ error: 'Game expired' }, 404);

    const p = room.players[userId];
    if (p) {
      p.answersSubmitted = answers || {};
      p.completionTime = timeTaken || 15;
      p.ready = true;
    }

    const everyoneSubmitted = Object.values(room.players).every((player: any) => player.ready);
    if (everyoneSubmitted && room.status === 'answer') {
      evaluateSessionResults(room);
    }

    saveLocalSessions(sessions);
    return jsonResponse(room);
  }

  // 13. Get Room Details or Start Solo Room (Active Screen sync)
  const roomGetMatch = url.match(/\/api\/rooms\/([^/?#]+)/);
  if (roomGetMatch) {
    const roomId = roomGetMatch[1].toUpperCase();
    const sessions = getLocalSessions();
    const room = sessions[roomId];
    if (!room) return jsonResponse({ error: 'Game expired' }, 404);

    if (!room.isMultiplayer && room.status === 'observe' && room.started === false) {
      room.started = true;
      room.timerLeft = room.mode === 'story' ? 20 : 15;
    }

    saveLocalSessions(sessions);
    return jsonResponse(room);
  }

  return jsonResponse({ error: 'Unknown fallback API endpoint' }, 404);
}
