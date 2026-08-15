import { Subject, Exam, JEEWeeklyExam, JEEAcademicGoal, DiaryEntry, Lesson, LessonProgress, Goal, CalendarEvent, UserStats, AppSettings, MoodCheckIn, ShopItem } from '../types';

const STORAGE_PREFIX = 'lifehub_';

export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  // Badges
  {
    id: 'badge-apex-ranker',
    name: 'Apex JEE Ranker',
    category: 'badge',
    description: 'Top 0.01% elite percentile aura. Awarded to masters of PCM.',
    icon: '🏆',
    price: 500,
    rarity: 'Mythic',
    perkText: 'Legendary prestige badge shown on profile and telemetry matrix.',
    badgeId: 'badge-apex-ranker'
  },
  {
    id: 'badge-air1',
    name: 'AIR 1 Aspirant',
    category: 'badge',
    description: 'Dedicated to conquering the JEE Advanced apex summit.',
    icon: '🎯',
    price: 350,
    rarity: 'Legendary',
    perkText: 'Marks you as an elite high-rank aspirant with uncompromising discipline.',
    badgeId: 'badge-air1'
  },
  {
    id: 'badge-calculus-titan',
    name: 'Calculus Titan',
    category: 'badge',
    description: 'Master of definite integrals, differential geometry, and limits.',
    icon: '📐',
    price: 250,
    rarity: 'Epic',
    perkText: 'High proficiency badge for advanced calculus problem solvers.',
    badgeId: 'badge-calculus-titan'
  },
  {
    id: 'badge-quantum-mind',
    name: 'Quantum Mind',
    category: 'badge',
    description: 'Deep quantum intuition in Modern Physics and Physical Chemistry.',
    icon: '⚛️',
    price: 250,
    rarity: 'Epic',
    perkText: 'Demonstrates theoretical physics excellence and numerical speed.',
    badgeId: 'badge-quantum-mind'
  },
  {
    id: 'badge-overclocker',
    name: 'The Overclocker',
    category: 'badge',
    description: 'Unstoppable high-velocity deep work engine that crushes burnout.',
    icon: '🔥',
    price: 400,
    rarity: 'Legendary',
    perkText: 'Exhibits relentless stamina in 8+ hour deep work sprints.',
    badgeId: 'badge-overclocker'
  },
  {
    id: 'badge-diamond-focus',
    name: 'Diamond Focus',
    category: 'badge',
    description: 'Unshakable concentration under intense exam clock pressure.',
    icon: '💎',
    price: 300,
    rarity: 'Epic',
    perkText: 'Zen-like calm during mock test pressure and tricky questions.',
    badgeId: 'badge-diamond-focus'
  },
  {
    id: 'badge-cosmic-polymath',
    name: 'Cosmic Polymath',
    category: 'badge',
    description: 'Mastery across all disciplines of sciences, engineering, and arts.',
    icon: '🌌',
    price: 600,
    rarity: 'Mythic',
    perkText: 'Supreme polymath distinction across all intellectual domains.',
    badgeId: 'badge-cosmic-polymath'
  },
  {
    id: 'badge-midnight-coder',
    name: 'Midnight Coder',
    category: 'badge',
    description: 'Burning midnight oil building systems and shipping pristine code.',
    icon: '💻',
    price: 150,
    rarity: 'Rare',
    perkText: 'Craftsman insignia for late-night programming flow states.',
    badgeId: 'badge-midnight-coder'
  },
  {
    id: 'badge-relentless-beast',
    name: 'Relentless Beast',
    category: 'badge',
    description: 'Never backs down from grueling 14-hour study sessions.',
    icon: '🦁',
    price: 280,
    rarity: 'Epic',
    perkText: 'Raw willpower and determination through any academic obstacle.',
    badgeId: 'badge-relentless-beast'
  },
  {
    id: 'badge-math-wizard',
    name: 'Godspeed Math Wizard',
    category: 'badge',
    description: 'Solves complex coordinate geometry and algebra at lightspeed.',
    icon: '⚡',
    price: 380,
    rarity: 'Legendary',
    perkText: 'Speed solver badge celebrating lightning-fast algebra calculation.',
    badgeId: 'badge-math-wizard'
  },
  {
    id: 'badge-void-walker',
    name: 'Void Walker',
    category: 'badge',
    description: 'Silent hyper-focus in the quietest hours when the world sleeps.',
    icon: '🕶️',
    price: 120,
    rarity: 'Rare',
    perkText: 'Stealth productivity mode for distraction-free execution.',
    badgeId: 'badge-void-walker'
  },
  {
    id: 'badge-zen-master',
    name: 'Zen Sovereign',
    category: 'badge',
    description: 'Emotional equanimity and stress resilience in high-stakes tests.',
    icon: '🧘',
    price: 100,
    rarity: 'Common',
    perkText: 'Inner peace badge celebrating mindful breathing & therapy check-ins.',
    badgeId: 'badge-zen-master'
  },

  // Titles
  {
    id: 'title-calculus-god',
    name: '⚡ Grandmaster of Calculus',
    category: 'title',
    description: 'Equip an electric title above your name on dashboard & headers.',
    icon: '⚡',
    price: 200,
    rarity: 'Epic',
    titleValue: '⚡ Grandmaster of Calculus'
  },
  {
    id: 'title-iitian',
    name: '🎯 Future IITian',
    category: 'title',
    description: 'Sets your active profile identity to the Future IITian title.',
    icon: '🎯',
    price: 280,
    rarity: 'Epic',
    titleValue: '🎯 Future IITian'
  },
  {
    id: 'title-percentile',
    name: '🧠 The 99.9th Percentile',
    category: 'title',
    description: 'Elite percentile accolade for competitive academic dominance.',
    icon: '🧠',
    price: 350,
    rarity: 'Legendary',
    titleValue: '🧠 The 99.9th Percentile'
  },
  {
    id: 'title-prodigy',
    name: '👑 Academic Prodigy',
    category: 'title',
    description: 'The highest tier intellectual title in the LifeHub ecosystem.',
    icon: '👑',
    price: 500,
    rarity: 'Mythic',
    titleValue: '👑 Academic Prodigy'
  },
  {
    id: 'title-high-achiever',
    name: '🔥 Relentless High Achiever',
    category: 'title',
    description: 'Inspiring title for self-driven individuals aiming for the top.',
    icon: '🔥',
    price: 180,
    rarity: 'Rare',
    titleValue: '🔥 Relentless High Achiever'
  },
  {
    id: 'title-deepwork',
    name: '💎 Master of Deep Work',
    category: 'title',
    description: 'Title honoring absolute discipline, flow states, and focus.',
    icon: '💎',
    price: 160,
    rarity: 'Rare',
    titleValue: '💎 Master of Deep Work'
  },

  // Avatar Auras & Frame FX
  {
    id: 'aura-neon-cyan',
    name: 'Cyberpunk Neon Cyan Aura',
    category: 'aura',
    description: 'Emits a glowing cyan luminescent aura around your avatar.',
    icon: '💠',
    price: 250,
    rarity: 'Epic',
    auraClass: 'ring-4 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.75)]'
  },
  {
    id: 'aura-golden-sovereign',
    name: 'Golden Sovereign Aura',
    category: 'aura',
    description: 'A radiant golden emperor frame with pulsing solar illumination.',
    icon: '👑',
    price: 400,
    rarity: 'Mythic',
    auraClass: 'ring-4 ring-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.85)] animate-pulse'
  },
  {
    id: 'aura-matrix-emerald',
    name: 'Emerald Matrix Pulse',
    category: 'aura',
    description: 'Digital matrix green glow celebrating growth and vitality.',
    icon: '🟢',
    price: 200,
    rarity: 'Rare',
    auraClass: 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]'
  },
  {
    id: 'aura-obsidian-void',
    name: 'Obsidian Void Nova',
    category: 'aura',
    description: 'Deep ultraviolet void energy that commands respect.',
    icon: '🌑',
    price: 320,
    rarity: 'Legendary',
    auraClass: 'ring-4 ring-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]'
  },
  {
    id: 'aura-cosmic-nebula',
    name: 'Cosmic Starlight Nebula',
    category: 'aura',
    description: 'Interstellar galaxy gradient that shines with celestial radiance.',
    icon: '🌌',
    price: 450,
    rarity: 'Mythic',
    auraClass: 'ring-4 ring-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.9)] animate-pulse'
  },

  // Boosters & Power-ups
  {
    id: 'booster-2x-xp',
    name: '2x Focus XP Surge (24h)',
    category: 'booster',
    description: 'Doubles all XP gained from focus sessions & daily tasks for 24h.',
    icon: '⚡',
    price: 150,
    rarity: 'Rare',
    perkText: 'Instant active booster: 2.0x XP multiplier on all activities.'
  },
  {
    id: 'booster-streak-shield',
    name: 'Streak Shield Protection',
    category: 'booster',
    description: 'Immunity shield protecting your streaks against missed days.',
    icon: '🛡️',
    price: 120,
    rarity: 'Rare',
    perkText: 'Permanent consumable reserve that auto-saves streak on absence.'
  },
  {
    id: 'booster-elixir',
    name: 'Instant XP Elixir (+500 XP)',
    category: 'booster',
    description: 'Instantly grants +500 XP directly to your level progression.',
    icon: '🧪',
    price: 80,
    rarity: 'Common',
    perkText: 'One-time instant XP injection for rapid level-up gratification.'
  },

  // Audio FX Themes
  {
    id: 'sound-retro-8bit',
    name: 'Arcade 8-Bit Retro Soundpack',
    category: 'sound',
    description: 'Chiptune arpeggios and coin jingles for app interactions.',
    icon: '👾',
    price: 150,
    rarity: 'Rare',
    perkText: 'Synthesized 8-bit sound effects for clicks, focus, and level ups.'
  },
  {
    id: 'sound-cyberpunk',
    name: 'Cyberpunk Synth Soundpack',
    category: 'sound',
    description: 'Rich analog synthesizer pads and futuristic frequency sweeps.',
    icon: '🎹',
    price: 180,
    rarity: 'Epic',
    perkText: 'Atmospheric sci-fi sound effects with resonant filter sweeps.'
  },
  {
    id: 'sound-zen-bell',
    name: 'Zen Tibetan Singing Bowls',
    category: 'sound',
    description: 'Harmonic singing bowls and meditation bells for deep tranquility.',
    icon: '🔔',
    price: 120,
    rarity: 'Common',
    perkText: 'Soothing acoustic meditation chimes.'
  },

  // Mystery Gacha Box
  {
    id: 'mystery-chest',
    name: 'Mystery Artifact Capsule',
    category: 'mystery',
    description: 'Spin the mystery wheel! Win rare badges, titles, or 1,000 Coins!',
    icon: '🎁',
    price: 100,
    rarity: 'Epic',
    perkText: 'Guaranteed high-tier item, exclusive badge, or massive coin jackpot!'
  }
];

// 1. Core Initial Data
const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', color: 'indigo', targetMarks: 90, targetRank: 30 },
  { id: 'sub-2', name: 'Physics', color: 'purple', targetMarks: 85, targetRank: 40 },
  { id: 'sub-3', name: 'Chemistry', color: 'emerald', targetMarks: 85, targetRank: 35 },
];

export const INITIAL_JEE_EXAMS: JEEWeeklyExam[] = [
  {
    id: 'jee-1',
    name: 'Weekly Test 1 — Foundation Review',
    weekNumber: 1,
    date: '2026-06-08',
    mathsMarks: 64,
    mathsMaxMarks: 100,
    mathsRank: 130,
    physicsMarks: 58,
    physicsMaxMarks: 100,
    physicsRank: 165,
    chemMarks: 62,
    chemMaxMarks: 100,
    chemRank: 140,
    totalMarks: 184,
    totalMaxMarks: 300,
    percentage: 61.3,
    rank: 142,
    notes: 'Initial test: Time management was a major bottleneck in Physics numericals.',
    difficulty: 'Moderate'
  },
  {
    id: 'jee-2',
    name: 'Weekly Test 2 — Mechanics & Algebra',
    weekNumber: 2,
    date: '2026-06-15',
    mathsMarks: 72,
    mathsMaxMarks: 100,
    mathsRank: 95,
    physicsMarks: 64,
    physicsMaxMarks: 100,
    physicsRank: 138,
    chemMarks: 68,
    chemMaxMarks: 100,
    chemRank: 112,
    totalMarks: 204,
    totalMaxMarks: 300,
    percentage: 68.0,
    rank: 118,
    notes: 'Significant improvement in Coordinate Geometry. Chemistry physical questions were smooth.',
    difficulty: 'Moderate'
  },
  {
    id: 'jee-3',
    name: 'Weekly Test 3 — Thermodynamics & Calculus I',
    weekNumber: 3,
    date: '2026-06-22',
    mathsMarks: 76,
    mathsMaxMarks: 100,
    mathsRank: 78,
    physicsMarks: 69,
    physicsMaxMarks: 100,
    physicsRank: 115,
    chemMarks: 65,
    chemMaxMarks: 100,
    chemRank: 122,
    totalMarks: 210,
    totalMaxMarks: 300,
    percentage: 70.0,
    rank: 98,
    notes: 'Broke into the top 100! Calculus limits and continuity concepts paid off.',
    difficulty: 'Challenging'
  },
  {
    id: 'jee-4',
    name: 'Weekly Test 4 — Rotational Dynamics & Chemical Bonding',
    weekNumber: 4,
    date: '2026-06-29',
    mathsMarks: 74,
    mathsMaxMarks: 100,
    mathsRank: 84,
    physicsMarks: 66,
    physicsMaxMarks: 100,
    physicsRank: 120,
    chemMarks: 78,
    chemMaxMarks: 100,
    chemRank: 64,
    totalMarks: 218,
    totalMaxMarks: 300,
    percentage: 72.7,
    rank: 88,
    notes: 'Inorganic & Bonding were high-scoring. Need more practice in Moment of Inertia.',
    difficulty: 'Tough'
  },
  {
    id: 'jee-5',
    name: 'Weekly Test 5 — Integral Calculus & Electromagnetism',
    weekNumber: 5,
    date: '2026-07-06',
    mathsMarks: 82,
    mathsMaxMarks: 100,
    mathsRank: 62,
    physicsMarks: 74,
    physicsMaxMarks: 100,
    physicsRank: 86,
    chemMarks: 75,
    chemMaxMarks: 100,
    chemRank: 79,
    totalMarks: 231,
    totalMaxMarks: 300,
    percentage: 77.0,
    rank: 72,
    notes: 'Integration by parts executed quickly. Electrostatics derivations accurate.',
    difficulty: 'Moderate'
  },
  {
    id: 'jee-6',
    name: 'Weekly Test 6 — Organic Chemistry & Optics',
    weekNumber: 6,
    date: '2026-07-13',
    mathsMarks: 80,
    mathsMaxMarks: 100,
    mathsRank: 68,
    physicsMarks: 78,
    physicsMaxMarks: 100,
    physicsRank: 74,
    chemMarks: 84,
    chemMaxMarks: 100,
    chemRank: 48,
    totalMarks: 242,
    totalMaxMarks: 300,
    percentage: 80.7,
    rank: 59,
    notes: 'Reaction mechanisms thoroughly memorized. Optics ray diagrams were crisp.',
    difficulty: 'Moderate'
  },
  {
    id: 'jee-7',
    name: 'Weekly Test 7 — Modern Physics & Vector 3D',
    weekNumber: 7,
    date: '2026-07-20',
    mathsMarks: 88,
    mathsMaxMarks: 100,
    mathsRank: 41,
    physicsMarks: 82,
    physicsMaxMarks: 100,
    physicsRank: 55,
    chemMarks: 79,
    chemMaxMarks: 100,
    chemRank: 60,
    totalMarks: 249,
    totalMaxMarks: 300,
    percentage: 83.0,
    rank: 46,
    notes: 'Vectors & 3D geometry gave maximum accuracy (24/25). Highest score till date!',
    difficulty: 'Challenging'
  },
  {
    id: 'jee-8',
    name: 'Weekly Test 8 — Full Part-Syllabus Mock I',
    weekNumber: 8,
    date: '2026-07-27',
    mathsMarks: 89,
    mathsMaxMarks: 100,
    mathsRank: 32,
    physicsMarks: 85,
    physicsMaxMarks: 100,
    physicsRank: 45,
    chemMarks: 83,
    chemMaxMarks: 100,
    chemRank: 50,
    totalMarks: 257,
    totalMaxMarks: 300,
    percentage: 85.7,
    rank: 38,
    notes: 'All-around stellar execution! 257/300 reached. Rank 38 achieved.',
    difficulty: 'Challenging'
  }
];

export const INITIAL_JEE_GOAL: JEEAcademicGoal = {
  targetTotalMarks: 260,
  targetMaths: 90,
  targetPhysics: 85,
  targetChemistry: 85,
  targetRank: 30,
  targetMathsRank: 25,
  targetPhysicsRank: 35,
  targetChemistryRank: 35,
  targetPercentage: 86.6,
  targetExamName: 'JEE Advanced / Target Weekly Benchmark'
};

const INITIAL_EXAMS: Exam[] = [
  // Mathematics exams showing upward trend
  { id: 'ex-1', subjectId: 'sub-1', marks: 78, totalMarks: 100, date: '2026-06-10', remarks: 'Good attempt, need to work on calculus formulas.', teacherComments: 'Alex displays logical thinking. Needs more practice on integrations.', rank: 12 },
  { id: 'ex-2', subjectId: 'sub-1', marks: 84, totalMarks: 100, date: '2026-06-25', remarks: 'Definite improvement in algebra section.', teacherComments: 'Excellent improvement!', rank: 8 },
  { id: 'ex-3', subjectId: 'sub-1', marks: 92, totalMarks: 100, date: '2026-07-08', remarks: 'Excellent score, calculus is fully cleared!', teacherComments: 'Superb work. Keep this consistency up!', rank: 2 },
  
  // Computer Science - outstanding performance
  { id: 'ex-4', subjectId: 'sub-2', marks: 90, totalMarks: 100, date: '2026-06-15', remarks: 'Strong programming concepts.', teacherComments: 'Brilliant algorithms design.', rank: 4 },
  { id: 'ex-5', subjectId: 'sub-2', marks: 96, totalMarks: 100, date: '2026-07-02', remarks: 'Near perfect code. Full marks in practicals!', teacherComments: 'Outstanding architecture Alex!', rank: 1 },

  // Advanced Science - consistency
  { id: 'ex-6', subjectId: 'sub-3', marks: 82, totalMarks: 100, date: '2026-06-12', remarks: 'Solid physics derivations.', teacherComments: 'Well-written laboratory journal.', rank: 9 },
  { id: 'ex-7', subjectId: 'sub-3', marks: 87, totalMarks: 100, date: '2026-06-28', remarks: 'Improved organic chemistry grasp.', teacherComments: 'Active participation in science seminars.', rank: 4 },

  // Literature
  { id: 'ex-8', subjectId: 'sub-4', marks: 75, totalMarks: 100, date: '2026-06-20', remarks: 'Grammar was solid, analysis needs deeper arguments.', teacherComments: 'Expresses thoughts eloquently.', rank: 14 },
  { id: 'ex-9', subjectId: 'sub-4', marks: 82, totalMarks: 100, date: '2026-07-05', remarks: 'Creative interpretation of Hamlet.', teacherComments: 'Deeper analytical tone has developed!', rank: 6 },
];

const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    title: 'Launching my Skill-Mastery Journey!',
    content: 'Today is officially Day 1 of LifeHub and my learning path in **Video Editing**! I registered for the timeline basics lesson. Visual color correction has always intrigued me, so setting a firm goal of 20 minutes of editing practice daily. Academically, calculus exam results came back at 92%! All those quiet evening review hours paid off.',
    mood: 'Great',
    tags: ['goals', 'milestone', 'academics'],
    emojiReaction: '🚀',
    images: [],
    date: '2026-07-08',
    isFavorite: true,
    wordCount: 72
  },
  {
    id: 'diary-2',
    title: 'Managing Stress & Finding Stillness',
    content: 'Felt a bit anxious in the afternoon due to the impending advanced science quiz. Talked with "Therapist" inside LifeHub - she guided me through a calming box breathing exercise (4s inhale, 4s hold, 4s exhale) and suggested breaking down the preparation into microscopic cards. It worked beautifully. Scored an 87% on the chemistry quiz subsequently. Consistency compound interest is real!',
    mood: 'Anxious',
    tags: ['mindfulness', 'anxiety', 'reflection'],
    emojiReaction: '🧘',
    images: [],
    date: '2026-07-10',
    isFavorite: false,
    wordCount: 78
  }
];

const INITIAL_LESSONS: Lesson[] = [
  // Beginner
  {
    id: 'les-1',
    level: 'Beginner',
    title: 'Mastering the Video Timeline & Workspace',
    description: 'Learn the core layouts of modern editing suites (Premiere, Resolve, FCP). Understand how tracks, magnet snaps, tracks hierarchies, and timeline scrubbing interact.',
    duration: '15 mins',
    difficulty: 'Easy',
    youtubeUrl: 'https://www.youtube.com/embed/HscI_OEGfDk',
    assignment: 'Import 3 raw video files, stack them in the timeline, create clean razor cuts, and delete gaps.',
    quiz: {
      question: 'In video editing, what is the default track order layer dominance for overlapping visual elements?',
      options: [
        'Lower video tracks overlay on top of higher tracks.',
        'Higher video tracks overlay on top of lower tracks.',
        'All overlapping tracks blend transparently by default.',
        'Dominance is decided entirely by audio track position.'
      ],
      correctAnswer: 1,
      explanation: 'Video tracks have vertical dominance: video track 2 (V2) overlays on top of video track 1 (V1). This allows you to stack titles, overlays, and B-roll above your primary storyline.'
    },
    resources: ['Workspace shortcuts cheat sheet.pdf', 'Sample B-roll files.zip']
  },
  {
    id: 'les-2',
    level: 'Beginner',
    title: 'Understanding Cut Types: Jump cuts, L-cuts, & J-cuts',
    description: 'Master the auditory-visual pacing rules. Learn how to let audio lead video transitions or vice versa to create seamless, invisible cuts.',
    duration: '20 mins',
    difficulty: 'Easy',
    youtubeUrl: 'https://www.youtube.com/embed/93IuMh_1Pxs',
    assignment: 'Create an L-cut where an interviewee’s voice begins 2 seconds before their video frame appears.',
    quiz: {
      question: 'What is the precise definition of a J-cut?',
      options: [
        'The audio of the upcoming scene starts before the visual cut occurs.',
        'The video of the upcoming scene starts before the audio cut occurs.',
        'The clip is speed ramped in a J-curve shape.',
        'The editing timeline snaps to a joint anchor.'
      ],
      correctAnswer: 0,
      explanation: 'In a J-cut, the audio of the NEXT shot plays before the video cuts to it (making a J shape in the timeline). It makes audio-video transitions feel incredibly organic and less abrupt.'
    },
    resources: ['Invisible cuts audio loops.wav']
  },
  // Intermediate
  {
    id: 'les-3',
    level: 'Intermediate',
    title: 'The Principles of Cinematic Color Grading',
    description: 'Differentiate between LUTs, primary wheels, curves, and scopes. Understand vectorscopes and waveforms to ensure accurate skintones and creative grading.',
    duration: '25 mins',
    difficulty: 'Medium',
    youtubeUrl: 'https://www.youtube.com/embed/8vR_hIsk-28',
    assignment: 'Correct an overexposed outdoor B-roll clip, align skin tones on the vectorscope skin-indicator line, and apply an artistic warm tone grading.',
    quiz: {
      question: 'Which tool is primary for checking exact exposure limits (crushed blacks or blown-out highlights)?',
      options: [
        'Vectorscope',
        'Waveform Monitor / Histogram',
        'RGB Parade Wheels',
        'Hue vs Saturation Curve'
      ],
      correctAnswer: 1,
      explanation: 'Waveforms and Histograms map the luminance values of an image from absolute black (0) to pure white (100 or 1023), letting you see exactly where details are clipping.'
    },
    resources: ['Log to Rec709 Conversion LUTs.cube']
  },
  {
    id: 'les-4',
    level: 'Intermediate',
    title: 'Masking & Keyframing Fundamentals',
    description: 'Learn to track moving subjects manually or using AI tracker brushes. Apply effects exclusively to specific regions and animate them over time.',
    duration: '30 mins',
    difficulty: 'Medium',
    youtubeUrl: 'https://www.youtube.com/embed/9LzYpD_s1p4',
    assignment: 'Create a dynamic text reveal mask hiding behind a physical building edge as the camera pans.',
    quiz: {
      question: 'To animate a static mask to follow a moving subject across 10 seconds, what must you create?',
      options: [
        'Adjustment layers on every frame',
        'Vectorscope markers',
        'Keyframes on the mask path property',
        'Compound nested clips'
      ],
      correctAnswer: 2,
      explanation: 'Keyframes pin a parameter value to a specific frame. By creating keyframes on the "Mask Path" property, the computer interpolates the shape between your markers, tracking the subject.'
    },
    resources: ['Sample tracking footage.mp4']
  },
  // Advanced
  {
    id: 'les-5',
    level: 'Advanced',
    title: 'Speed Ramping & Pitch Preservation',
    description: 'Learn to manipulate clip speeds smoothly using bezier handles rather than rigid cuts. Keep audio frequencies matched during extreme speed shifts.',
    duration: '35 mins',
    difficulty: 'Hard',
    youtubeUrl: 'https://www.youtube.com/embed/DizQY5Y0qjY',
    assignment: 'Shoot a simple action motion, import it, speed ramp from 100% down to 25% on the beat drop, and ramp back up with pitch preservation.',
    quiz: {
      question: 'Why should speed-ramped action clips be recorded at higher framerates (e.g., 60fps or 120fps)?',
      options: [
        'To prevent video file corruption.',
        'To ensure smooth slow-motion frames without artificial stuttering.',
        'Higher framerates automatically apply cinematic color LUTs.',
        'To increase the master audio volume.'
      ],
      correctAnswer: 1,
      explanation: 'Slow motion expands time. If a 24fps timeline plays a clip at 25% speed, you need 96 source frames per second. Recording at 120fps ensures there are enough physical frames to keep the motion buttery-smooth.'
    },
    resources: ['Framerate chart & slow-motion formulas.pdf']
  }
];

const INITIAL_GOALS: Goal[] = [
  { id: 'g-1', title: 'Achieve overall academic mark of 90%', category: 'academic', deadline: '2026-08-30', progress: 85, priority: 'high', remindersEnabled: true, estimatedCompletionDate: '2026-08-25' },
  { id: 'g-2', title: 'Complete Beginner Level of Video Editing', category: 'learning', deadline: '2026-07-20', progress: 100, priority: 'high', remindersEnabled: true, estimatedCompletionDate: '2026-07-08' },
  { id: 'g-3', title: 'Complete Intermediate Level of Video Editing', category: 'learning', deadline: '2026-08-15', progress: 30, priority: 'medium', remindersEnabled: true, estimatedCompletionDate: '2026-08-12' },
  { id: 'g-4', title: 'Write in private diary 4 times a week', category: 'habit', deadline: '2026-12-31', progress: 75, priority: 'medium', remindersEnabled: true, estimatedCompletionDate: '2026-12-31' },
  { id: 'g-5', title: 'Practice Box Breathing after study blocks', category: 'personal', deadline: '2026-09-01', progress: 50, priority: 'low', remindersEnabled: false, estimatedCompletionDate: '2026-08-28' },
];

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1, // Fresh starting level 1
  coins: 200, // Starter coins
  streaks: {
    study: 0,
    diary: 0,
    skill: 0,
    lastStudyDate: '',
    lastDiaryDate: '',
    lastSkillDate: '',
  },
  unlockedAchievements: ['ach-1'],
  username: 'Alex',
  userTitle: 'Aspirant',
  inventory: [],
  equippedBadges: [],
  equippedTitle: 'Aspirant',
  equippedAura: undefined,
  equippedSoundPack: 'default',
  activeBoosters: []
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'high-density',
  font: 'sans',
  accentColor: 'indigo',
  notifications: {
    studying: true,
    diary: true,
    skill: true,
    news: false,
    goals: true,
    exams: true
  },
  newsCategories: ['Technology', 'AI', 'Science', 'Education', 'Health'],
  privacyMode: false,
  autoSaveInterval: 10
};

export const ALL_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'First Steps', description: 'Log in to LifeHub and create your profile.', icon: '🎯', xpReward: 200, category: 'general' },
  { id: 'ach-2', title: 'Study Champion', description: 'Maintain a 10-day study consistency streak.', icon: '🏆', xpReward: 500, category: 'academics' },
  { id: 'ach-3', title: 'Unstoppable Mind', description: 'Achieve a 90% overall academic score.', icon: '⚡', xpReward: 800, category: 'academics' },
  { id: 'ach-4', title: 'Video Editing Rookie', description: 'Complete your first structured editing lesson.', icon: '🎬', xpReward: 300, category: 'skills' },
  { id: 'ach-5', title: 'Creative Editor', description: 'Unlock the Intermediate Mastery badge.', icon: '🎨', xpReward: 600, category: 'skills' },
  { id: 'ach-6', title: 'Emotional Clarity', description: 'Log 5 private diary entries with mood tracking.', icon: '📖', xpReward: 400, category: 'diary' },
  { id: 'ach-7', title: 'Zen Master', description: 'Complete 3 breathing check-ins with AI Therapist.', icon: '🧘', xpReward: 400, category: 'therapist' },
];

export interface LevelReward {
  level: number;
  title: string;
  coins: number;
  perk: string;
  perkIcon: string;
  description: string;
}

export const getLevelReward = (level: number): LevelReward => {
  const predefinedRewards: Record<number, Omit<LevelReward, 'level'>> = {
    1: {
      title: "Initiate Aspirant",
      coins: 200,
      perk: "Access to Full LifeHub Suite",
      perkIcon: "🚀",
      description: "Foundational tier. Full access to JEE Analytics, Private Reflection Diary, Focus Tools, and Skill Mastery."
    },
    2: {
      title: "Self-Discipline Novice",
      coins: 500,
      perk: "Emerald Accent Color & 'Novice' Profile Tag",
      perkIcon: "🌱",
      description: "Unlocks the special Emerald profile accent options and adds 'Novice Practitioner' title status."
    },
    3: {
      title: "Focus Apprentice",
      coins: 750,
      perk: "Ambient Focus Soundboards",
      perkIcon: "🎵",
      description: "Unlocks premium lo-fi white noise generator modes in the workspace."
    },
    4: {
      title: "Cognitive Trailblazer",
      coins: 1000,
      perk: "Custom Silver Avatar Outer Ring",
      perkIcon: "🛡️",
      description: "Equips a glowing Silver Outer Ring around your user profile icon on the main dashboard."
    },
    5: {
      title: "Zen Scholar",
      coins: 1500,
      perk: "AI Therapist: Extended Reflection Modules",
      perkIcon: "🧘",
      description: "Unlocks the 'Sovereign Zen' meditation mode with deep-listening reflection cycles."
    },
    6: {
      title: "Chronos Architect",
      coins: 1800,
      perk: "XP Focus Multiplier (1.2x boost)",
      perkIcon: "⚡",
      description: "Your daily focus sessions and educational quizzes now award a continuous 1.2x XP multiplier."
    },
    7: {
      title: "Efficiency Optimizer",
      coins: 2200,
      perk: "Gold Profile Badge & 'Optimizer' Status",
      perkIcon: "🥇",
      description: "Unlocks the premium Gold Badge on the profile and labels you as an 'Efficiency Optimizer'."
    },
    8: {
      title: "Deep Work Vanguard",
      coins: 2600,
      perk: "Custom Neon Avatar Glow",
      perkIcon: "✨",
      description: "Applies a pulsing neon violet glow effect around your username on the main planner."
    },
    9: {
      title: "Academic Sovereign",
      coins: 3000,
      perk: "Premium News Curation Slots",
      perkIcon: "📰",
      description: "Increases study search depth to fetch 40+ simultaneous stories and unlocks executive summaries."
    },
    10: {
      title: "Transcendent Mind",
      coins: 5000,
      perk: "Double Coins Passive Earning",
      perkIcon: "👑",
      description: "Permanently doubles all coin gains across all daily planners, quizzes, and tasks!"
    }
  };

  if (predefinedRewards[level]) {
    return { level, ...predefinedRewards[level] };
  }

  // Procedural rewards for higher levels
  const levelMult = Math.floor(level / 10) + 1;
  const coins = level * 500;
  
  const procedurals = [
    { title: "Cognitive Overlord", perk: `Aura Grade ${levelMult} Profile Border`, perkIcon: "🎨" },
    { title: "Flow Emperor/Empress", perk: `Bonus XP Booster (${1.2 + (level / 100)}x)`, perkIcon: "🚀" },
    { title: "Master of Mindfulness", perk: `Special Edition Zen Sound Pack V${levelMult}`, perkIcon: "🔔" },
    { title: "Chronological Sovereign", perk: `Supercharger Coin passive (+${level * 10} daily)`, perkIcon: "💎" }
  ];
  const choice = procedurals[level % procedurals.length];
  
  return {
    level,
    title: `${choice.title} (Tier ${levelMult})`,
    coins,
    perk: choice.perk,
    perkIcon: choice.perkIcon,
    description: `Procedural elite milestone reward. Grants a massive ${coins} Coins bonus and activates the legendary ${choice.perk}.`
  };
};

const INITIAL_MOOD_HISTORY: MoodCheckIn[] = [
  { id: 'mh-1', date: '2026-07-05', score: 8, mood: 'Good', notes: 'Felt very motivated today.' },
  { id: 'mh-2', date: '2026-07-06', score: 9, mood: 'Great', notes: 'Calculus homework went incredibly well.' },
  { id: 'mh-3', date: '2026-07-07', score: 6, mood: 'Tired', notes: 'Woke up late, need to reset sleep cycle.' },
  { id: 'mh-4', date: '2026-07-08', score: 9, mood: 'Great', notes: 'First video editing lesson completed!' },
  { id: 'mh-5', date: '2026-07-09', score: 5, mood: 'Stressed', notes: 'Lots of chemistry homework due.' },
  { id: 'mh-6', date: '2026-07-10', score: 8, mood: 'Good', notes: 'Guided box breathing with Therapist helped.' },
];

// 2. Storage Engine Functions
function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    if (val !== null) {
      return JSON.parse(val) as T;
    }
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
  }
  return defaultValue;
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export const storageService = {
  // JEE Weekly Exams
  getJEEExams(): JEEWeeklyExam[] {
    return loadItem('jee_weekly_exams', INITIAL_JEE_EXAMS);
  },
  saveJEEExams(exams: JEEWeeklyExam[]): void {
    saveItem('jee_weekly_exams', exams);
  },
  addJEEExam(exam: Omit<JEEWeeklyExam, 'id'>): JEEWeeklyExam {
    const exams = this.getJEEExams();
    const newExam: JEEWeeklyExam = {
      ...exam,
      id: `jee-${Date.now()}`
    };
    exams.unshift(newExam); // Keep most recent test accessible
    this.saveJEEExams(exams);
    return newExam;
  },
  updateJEEExam(id: string, updatedExam: Partial<JEEWeeklyExam>): void {
    const exams = this.getJEEExams();
    const index = exams.findIndex(e => e.id === id);
    if (index !== -1) {
      exams[index] = { ...exams[index], ...updatedExam };
      this.saveJEEExams(exams);
    }
  },
  deleteJEEExam(id: string): void {
    const exams = this.getJEEExams();
    const filtered = exams.filter(e => e.id !== id);
    this.saveJEEExams(filtered);
  },

  // JEE Academic Goals
  getJEEGoals(): JEEAcademicGoal {
    return loadItem('jee_academic_goals', INITIAL_JEE_GOAL);
  },
  saveJEEGoals(goals: JEEAcademicGoal): void {
    saveItem('jee_academic_goals', goals);
  },

  // Subjects
  getSubjects(): Subject[] {
    return loadItem('subjects', INITIAL_SUBJECTS);
  },
  saveSubjects(subjects: Subject[]): void {
    saveItem('subjects', subjects);
  },

  // Exams
  getExams(): Exam[] {
    return loadItem('exams', INITIAL_EXAMS);
  },
  saveExams(exams: Exam[]): void {
    saveItem('exams', exams);
  },

  // Diary Entries
  getDiaryEntries(): DiaryEntry[] {
    return loadItem('diary', INITIAL_DIARY);
  },
  saveDiaryEntries(entries: DiaryEntry[]): void {
    saveItem('diary', entries);
  },

  // Lessons Static Data
  getLessons(): Lesson[] {
    return INITIAL_LESSONS; // Lessons are structured curriculum
  },

  // Lessons Progress
  getLessonProgress(): LessonProgress[] {
    // Beginner's first lesson preloaded as completed for beautiful dashboard display
    const defaultProgress: LessonProgress[] = [
      { lessonId: 'les-1', completed: true, bookmarked: false, notes: 'Timeline track overlapping works bottom-to-top. Color labels help organize track clips.', completedAt: '2026-07-08' },
      { lessonId: 'les-2', completed: false, bookmarked: true, notes: '' },
    ];
    return loadItem('lesson_progress', defaultProgress);
  },
  saveLessonProgress(progress: LessonProgress[]): void {
    saveItem('lesson_progress', progress);
  },

  // Goals
  getGoals(): Goal[] {
    return loadItem('goals', INITIAL_GOALS);
  },
  saveGoals(goals: Goal[]): void {
    saveItem('goals', goals);
  },

  // Therapist Chat History
  getTherapistHistory(): any[] {
    const defaultChat = [
      { id: 'chat-init-1', role: 'model', content: "Hi Alex! I am Therapist, your companion in LifeHub. How is your energy and focus feeling today? Remember, I'm here to support your daily wellness, help manage stress, or guide you through a calming breathing exercise. Let me know what is on your mind.", timestamp: new Date(Date.now() - 3600000).toISOString() }
    ];
    return loadItem('therapist_chat', defaultChat);
  },
  saveTherapistHistory(chat: any[]): void {
    saveItem('therapist_chat', chat);
  },

  // Mood Check-ins
  getMoodHistory(): MoodCheckIn[] {
    return loadItem('mood_history', INITIAL_MOOD_HISTORY);
  },
  saveMoodHistory(history: MoodCheckIn[]): void {
    saveItem('mood_history', history);
  },

  // User Stats & Gamification Engine
  getStats(): UserStats {
    const stats = loadItem('user_stats', INITIAL_STATS);
    if (!stats || typeof stats.level !== 'number' || stats.level < 1) {
      stats.level = 1;
    }
    if (typeof stats.xp !== 'number' || stats.xp < 0) {
      stats.xp = 0;
    }
    // Normalize XP if it exceeds level threshold
    let changed = false;
    while (stats.xp >= stats.level * 1000 && stats.level < 100) {
      stats.xp -= stats.level * 1000;
      stats.level += 1;
      changed = true;
    }
    if (changed) {
      saveItem('user_stats', stats);
    }
    return stats;
  },
  saveStats(stats: UserStats): void {
    saveItem('user_stats', stats);
  },

  // News Bookmarks
  getNewsBookmarks(): any[] {
    return loadItem('news_bookmarks', []);
  },
  saveNewsBookmarks(bookmarks: any[]): void {
    saveItem('news_bookmarks', bookmarks);
  },

  // Settings
  getSettings(): AppSettings {
    return loadItem('settings', INITIAL_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    saveItem('settings', settings);
  },

  // Trigger Gamification Action (Returns levelUp boolean & unlocked achievement string[])
  addXP(amount: number): { levelUp: boolean; newLevel: number; newXP: number; newlyUnlocked: string[] } {
    const stats = this.getStats();
    let currentXP = stats.xp + amount;
    let currentLevel = stats.level;
    let levelUp = false;

    // Check level up (1000 XP per level threshold)
    while (currentXP >= currentLevel * 1000) {
      currentXP -= currentLevel * 1000;
      currentLevel += 1;
      levelUp = true;
      const rewards = getLevelReward(currentLevel);
      stats.coins += rewards.coins; // Award dynamic coins from custom level reward!
    }

    stats.xp = currentXP;
    stats.level = currentLevel;

    // Check and trigger achievements dynamically
    const newlyUnlocked: string[] = [];
    const unlockedSet = new Set(stats.unlockedAchievements);

    // Achievement: Focus Legend / Complete lessons
    const progress = this.getLessonProgress();
    const completedCount = progress.filter(p => p.completed).length;
    if (completedCount >= 1 && !unlockedSet.has('ach-4')) {
      stats.unlockedAchievements.push('ach-4');
      newlyUnlocked.push('ach-4');
    }
    if (completedCount >= 3 && !unlockedSet.has('ach-5')) {
      stats.unlockedAchievements.push('ach-5');
      newlyUnlocked.push('ach-5');
    }

    // Achievement: Academic Trend
    const exams = this.getExams();
    const mathExams = exams.filter(e => e.subjectId === 'sub-1');
    const hasMathA = mathExams.some(e => (e.marks / e.totalMarks) >= 0.9);
    if (hasMathA && !unlockedSet.has('ach-3')) {
      stats.unlockedAchievements.push('ach-3');
      newlyUnlocked.push('ach-3');
    }

    // Save stats
    this.saveStats(stats);

    return {
      levelUp,
      newLevel: currentLevel,
      newXP: currentXP,
      newlyUnlocked
    };
  },

  // Shop & Inventory Services
  getShopItems(): ShopItem[] {
    return loadItem('shop_items', DEFAULT_SHOP_ITEMS);
  },

  buyShopItem(itemId: string): { 
    success: boolean; 
    message: string; 
    item?: ShopItem; 
    coinsRemaining?: number; 
    mysteryReward?: { type: 'badge' | 'title' | 'coins' | 'xp'; text: string; rewardItem?: any };
  } {
    const stats = this.getStats();
    const shopItems = this.getShopItems();
    const item = shopItems.find(i => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Item not found in shop catalog.' };
    }

    if (stats.coins < item.price) {
      return { 
        success: false, 
        message: `Insufficient coins. You have ${stats.coins} coins but this item costs ${item.price} coins.` 
      };
    }

    const inventory = new Set(stats.inventory || []);

    // Handle Mystery Artifact Capsule
    if (item.category === 'mystery') {
      stats.coins -= item.price;
      const unownedBadges = shopItems.filter(i => (i.category === 'badge' || i.category === 'title') && !inventory.has(i.id));
      
      const roll = Math.random();
      let mysteryReward: { type: 'badge' | 'title' | 'coins' | 'xp'; text: string; rewardItem?: any };

      if (roll < 0.45 && unownedBadges.length > 0) {
        // Win a random unowned Badge or Title!
        const wonItem = unownedBadges[Math.floor(Math.random() * unownedBadges.length)];
        inventory.add(wonItem.id);
        stats.inventory = Array.from(inventory);
        mysteryReward = {
          type: wonItem.category as 'badge' | 'title',
          text: `🎉 JACKPOT! You unboxed the ${wonItem.rarity} ${wonItem.name}!`,
          rewardItem: wonItem
        };
      } else if (roll < 0.75) {
        // Win 250 - 750 Coins!
        const bonusCoins = Math.floor(Math.random() * 500) + 250;
        stats.coins += bonusCoins;
        mysteryReward = {
          type: 'coins',
          text: `💰 GOLD RUSH! You won a jackpot of +${bonusCoins} Coins!`,
        };
      } else {
        // Win +600 XP Surge
        stats.xp += 600;
        mysteryReward = {
          type: 'xp',
          text: `⚡ XP SURGE! You received +600 XP directly to your progression!`,
        };
      }

      this.saveStats(stats);
      return {
        success: true,
        message: mysteryReward.text,
        item,
        coinsRemaining: stats.coins,
        mysteryReward
      };
    }

    // Check if non-consumable already owned
    if (item.category !== 'booster' && inventory.has(item.id)) {
      return { success: false, message: `You already own ${item.name}!` };
    }

    // Deduct coins
    stats.coins -= item.price;

    // Handle Consumables & Boosters
    if (item.id === 'booster-elixir') {
      stats.xp += 500;
    } else if (item.id === 'booster-2x-xp') {
      const activeBoosters = stats.activeBoosters || [];
      activeBoosters.push({
        id: `boost-${Date.now()}`,
        type: '2x_xp',
        name: '2x Focus XP Surge',
        multiplier: 2.0,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      });
      stats.activeBoosters = activeBoosters;
    } else if (item.id === 'booster-streak-shield') {
      const activeBoosters = stats.activeBoosters || [];
      activeBoosters.push({
        id: `shield-${Date.now()}`,
        type: 'streak_shield',
        name: 'Streak Shield Protection',
        multiplier: 1.0,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
      });
      stats.activeBoosters = activeBoosters;
    }

    // Add to inventory
    inventory.add(item.id);
    stats.inventory = Array.from(inventory);

    // Auto-equip if first badge or title
    if (item.category === 'badge') {
      const equipped = stats.equippedBadges || [];
      if (equipped.length < 3 && !equipped.includes(item.id)) {
        stats.equippedBadges = [...equipped, item.id];
      }
    } else if (item.category === 'title' && item.titleValue) {
      stats.equippedTitle = item.titleValue;
      stats.userTitle = item.titleValue;
    } else if (item.category === 'aura') {
      stats.equippedAura = item.id;
    } else if (item.category === 'sound') {
      stats.equippedSoundPack = item.id.replace('sound-', '') as any;
    }

    this.saveStats(stats);

    return {
      success: true,
      message: `Successfully purchased "${item.name}"!`,
      item,
      coinsRemaining: stats.coins
    };
  },

  equipBadge(badgeId: string): UserStats {
    const stats = this.getStats();
    const equipped = stats.equippedBadges || [];
    if (equipped.includes(badgeId)) {
      // Toggle off / unequip
      stats.equippedBadges = equipped.filter(id => id !== badgeId);
    } else {
      // Max 3 showcase badges
      if (equipped.length >= 3) {
        stats.equippedBadges = [...equipped.slice(1), badgeId];
      } else {
        stats.equippedBadges = [...equipped, badgeId];
      }
    }
    this.saveStats(stats);
    return stats;
  },

  equipTitle(titleValue: string): UserStats {
    const stats = this.getStats();
    stats.equippedTitle = titleValue;
    stats.userTitle = titleValue;
    this.saveStats(stats);
    return stats;
  },

  equipAura(auraId: string): UserStats {
    const stats = this.getStats();
    stats.equippedAura = stats.equippedAura === auraId ? undefined : auraId;
    this.saveStats(stats);
    return stats;
  },

  equipSoundPack(soundPack: 'default' | 'retro-8bit' | 'cyberpunk-synth' | 'zen-bell'): UserStats {
    const stats = this.getStats();
    stats.equippedSoundPack = soundPack;
    this.saveStats(stats);
    return stats;
  },

  // Reset all to default (Factory reset)
  factoryReset(): void {
    try {
      localStorage.clear();
      // Also specifically set back initial defaults so memory and loadItem return pure initial states
      saveItem('jee_weekly_exams', INITIAL_JEE_EXAMS);
      saveItem('jee_academic_goals', INITIAL_JEE_GOAL);
      saveItem('subjects', INITIAL_SUBJECTS);
      saveItem('exams', INITIAL_EXAMS);
      saveItem('diary', INITIAL_DIARY);
      saveItem('goals', INITIAL_GOALS);
      saveItem('mood_history', INITIAL_MOOD_HISTORY);
      saveItem('user_stats', INITIAL_STATS);
      saveItem('settings', INITIAL_SETTINGS);
      saveItem('shop_items', DEFAULT_SHOP_ITEMS);
    } catch (e) {
      console.error("Factory reset failed:", e);
    }
  }
};
