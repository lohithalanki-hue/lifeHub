export interface Subject {
  id: string;
  name: string;
  color: string;
  targetMarks: number;
  targetRank: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  marks: number;
  totalMarks: number;
  date: string;
  remarks: string;
  teacherComments?: string;
  rank?: number;
}

export interface JEEWeeklyExam {
  id: string;
  name: string; // e.g. "Weekly Test 1", "Weekly Test 8", "Part Test 3"
  weekNumber?: number;
  date: string; // YYYY-MM-DD
  mathsMarks: number;
  mathsMaxMarks: number;
  mathsRank?: number;
  physicsMarks: number;
  physicsMaxMarks: number;
  physicsRank?: number;
  chemMarks: number;
  chemMaxMarks: number;
  chemRank?: number;
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  rank: number; // Overall Rank
  totalCandidates?: number;
  percentile?: number;
  notes?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Tough';
}

export interface JEEAcademicGoal {
  targetTotalMarks: number;
  targetMaths: number;
  targetPhysics: number;
  targetChemistry: number;
  targetRank: number;
  targetMathsRank?: number;
  targetPhysicsRank?: number;
  targetChemistryRank?: number;
  targetPercentage: number;
  targetExamName?: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string; // "Great" | "Good" | "Neutral" | "Tired" | "Anxious" | "Stressed" | "Down"
  tags: string[];
  emojiReaction?: string;
  images: string[];
  date: string; // ISO format YYYY-MM-DD
  isFavorite: boolean;
  wordCount: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  source: string;
  credibility: number;
  readingTime: string;
  date: string;
}

export interface TherapistMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string; // ISO time
}

export interface MoodCheckIn {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  score: number; // 1 to 10
  mood: string;
  notes?: string;
}

export interface Lesson {
  id: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  title: string;
  description: string;
  duration: string; // e.g. "15 mins"
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  youtubeUrl: string;
  assignment: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  resources: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bookmarked: boolean;
  notes: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'academic' | 'personal' | 'habit' | 'learning';
  deadline: string;
  progress: number; // 0 to 100
  priority: 'high' | 'medium' | 'low';
  remindersEnabled: boolean;
  estimatedCompletionDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'exam' | 'lesson' | 'diary' | 'event';
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'badge' | 'title' | 'aura' | 'booster' | 'sound' | 'mystery';
  description: string;
  icon: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  perkText?: string;
  auraClass?: string;
  titleValue?: string;
  badgeId?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  streaks: {
    study: number;
    diary: number;
    skill: number;
    lastStudyDate?: string;
    lastDiaryDate?: string;
    lastSkillDate?: string;
  };
  unlockedAchievements: string[];
  username?: string;
  userTitle?: string;
  inventory?: string[]; // IDs of purchased shop items
  equippedBadges?: string[]; // IDs of up to 3 showcase badges
  equippedTitle?: string; // Currently active custom title
  equippedAura?: string; // Currently active visual aura ID
  equippedSoundPack?: 'default' | 'retro-8bit' | 'cyberpunk-synth' | 'zen-bell';
  activeBoosters?: {
    id: string;
    type: string;
    name: string;
    multiplier: number;
    expiresAt: string;
  }[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'high-density';
  font: 'sans' | 'serif' | 'mono';
  accentColor: string; // Tailwind color name e.g. 'indigo', 'violet', 'rose', 'emerald'
  notifications: {
    studying: boolean;
    diary: boolean;
    skill: boolean;
    news: boolean;
    goals: boolean;
    exams: boolean;
  };
  newsCategories: string[];
  privacyMode: boolean;
  autoSaveInterval: number; // in seconds
}
