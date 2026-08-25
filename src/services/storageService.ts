import { Subject, Exam, JEEWeeklyExam, JEEAcademicGoal, DiaryEntry, Lesson, LessonProgress, Goal, CalendarEvent, UserStats, AppSettings, MoodCheckIn, ShopItem } from '../types';

const STORAGE_PREFIX = 'lifehub_';

export const DEFAULT_SHOP_ITEMS: ShopItem[] = [];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', color: 'indigo', targetMarks: 90, targetRank: 30 },
  { id: 'sub-2', name: 'Physics', color: 'purple', targetMarks: 85, targetRank: 40 },
  { id: 'sub-3', name: 'Chemistry', color: 'emerald', targetMarks: 85, targetRank: 35 },
];

export const INITIAL_JEE_EXAMS: JEEWeeklyExam[] = [];
export const INITIAL_JEE_GOAL: JEEAcademicGoal = {
  targetTotalMarks: 260, targetMaths: 90, targetPhysics: 85, targetChemistry: 85,
  targetRank: 30, targetMathsRank: 25, targetPhysicsRank: 35, targetChemistryRank: 35,
  targetPercentage: 86.6, targetExamName: 'JEE Advanced / Target Weekly Benchmark'
};

const INITIAL_EXAMS: Exam[] = [];
const INITIAL_DIARY: DiaryEntry[] = [];
const INITIAL_LESSONS: Lesson[] = [];
const INITIAL_GOALS: Goal[] = [];
const INITIAL_STATS: UserStats = {
  xp: 0, level: 1, coins: 200,
  streaks: { study: 0, diary: 0, skill: 0, lastStudyDate: '', lastDiaryDate: '', lastSkillDate: '' },
  unlockedAchievements: ['ach-1'], username: 'Alex', userTitle: 'Aspirant', inventory: [],
  equippedBadges: [], equippedTitle: 'Aspirant', equippedAura: undefined,
  equippedSoundPack: 'default', activeBoosters: []
};
const INITIAL_SETTINGS: AppSettings = {
  theme: 'high-density', font: 'sans', accentColor: 'indigo',
  notifications: { studying: true, diary: true, skill: true, news: false, goals: true, exams: true },
  newsCategories: ['Technology', 'AI', 'Science', 'Education', 'Health'], privacyMode: false, autoSaveInterval: 10
};
const INITIAL_MOOD_HISTORY: MoodCheckIn[] = [];

export const ALL_ACHIEVEMENTS = [
  { id: 'ach-1', title: 'First Steps', description: 'Log in to LifeHub and create your profile.', icon: '🎯', xpReward: 200, category: 'general' },
  { id: 'ach-2', title: 'Study Champion', description: 'Maintain a 10-day study consistency streak.', icon: '🏆', xpReward: 500, category: 'academics' },
  { id: 'ach-3', title: 'Unstoppable Mind', description: 'Achieve a 90% overall academic score.', icon: '⚡', xpReward: 800, category: 'academics' },
  { id: 'ach-4', title: 'Video Editing Rookie', description: 'Complete your first structured editing lesson.', icon: '🎬', xpReward: 300, category: 'skills' },
  { id: 'ach-5', title: 'Creative Editor', description: 'Unlock the Intermediate Mastery badge.', icon: '🎨', xpReward: 600, category: 'skills' },
  { id: 'ach-6', title: 'Emotional Clarity', description: 'Log 5 private diary entries with mood tracking.', icon: '📖', xpReward: 400, category: 'diary' },
  { id: 'ach-7', title: 'Zen Master', description: 'Complete 3 breathing check-ins with AI Therapist.', icon: '🧘', xpReward: 400, category: 'therapist' },
];

export interface LevelReward { level: number; title: string; coins: number; perk: string; perkIcon: string; description: string; }
export const getLevelReward = (level: number): LevelReward => ({
  level, title: `Level ${level}`, coins: level * 100, perk: 'LifeHub progression reward', perkIcon: '⭐', description: `Reward for reaching level ${level}.`
});

function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    if (val !== null) {
      const parsed = JSON.parse(val) as T;
      return parsed ?? defaultValue;
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
  getJEEExams: (): JEEWeeklyExam[] => loadItem('jee_weekly_exams', INITIAL_JEE_EXAMS),
  saveJEEExams: (value: JEEWeeklyExam[]) => saveItem('jee_weekly_exams', value),
  addJEEExam(exam: Omit<JEEWeeklyExam, 'id'>): JEEWeeklyExam { const item = { ...exam, id: `jee-${Date.now()}` }; const all = [item, ...this.getJEEExams()]; this.saveJEEExams(all); return item; },
  updateJEEExam(id: string, updatedExam: Partial<JEEWeeklyExam>) { this.saveJEEExams(this.getJEEExams().map(e => e.id === id ? { ...e, ...updatedExam } : e)); },
  deleteJEEExam(id: string) { this.saveJEEExams(this.getJEEExams().filter(e => e.id !== id)); },
  getJEEGoals: (): JEEAcademicGoal => loadItem('jee_academic_goals', INITIAL_JEE_GOAL),
  saveJEEGoals: (value: JEEAcademicGoal) => saveItem('jee_academic_goals', value),
  getSubjects: (): Subject[] => loadItem('subjects', INITIAL_SUBJECTS),
  saveSubjects: (value: Subject[]) => saveItem('subjects', value),
  getExams: (): Exam[] => loadItem('exams', INITIAL_EXAMS),
  saveExams: (value: Exam[]) => saveItem('exams', value),
  getDiaryEntries: (): DiaryEntry[] => loadItem('diary', INITIAL_DIARY),
  saveDiaryEntries: (value: DiaryEntry[]) => saveItem('diary', value),
  getLessons: (): Lesson[] => INITIAL_LESSONS,
  getLessonProgress(): LessonProgress[] { return loadItem('lesson_progress', []); },
  saveLessonProgress: (value: LessonProgress[]) => saveItem('lesson_progress', value),
  getGoals: (): Goal[] => loadItem('goals', INITIAL_GOALS),
  saveGoals: (value: Goal[]) => saveItem('goals', value),
  getTherapistHistory: (): any[] => loadItem('therapist_chat', []),
  saveTherapistHistory: (value: any[]) => saveItem('therapist_chat', value),
  getMoodHistory: (): MoodCheckIn[] => loadItem('mood_history', INITIAL_MOOD_HISTORY),
  saveMoodHistory: (value: MoodCheckIn[]) => saveItem('mood_history', value),
  getStats(): UserStats { const stats = loadItem('user_stats', INITIAL_STATS); if (!stats || typeof stats !== 'object') return { ...INITIAL_STATS }; if (typeof stats.level !== 'number' || stats.level < 1) stats.level = 1; if (typeof stats.xp !== 'number' || stats.xp < 0) stats.xp = 0; return stats; },
  saveStats: (value: UserStats) => saveItem('user_stats', value),
  getNewsBookmarks: (): any[] => loadItem('news_bookmarks', []),
  saveNewsBookmarks: (value: any[]) => saveItem('news_bookmarks', value),
  getSettings: (): AppSettings => loadItem('settings', INITIAL_SETTINGS),
  saveSettings: (value: AppSettings) => saveItem('settings', value),
  addXP(amount: number) { const stats = this.getStats(); stats.xp += amount; this.saveStats(stats); return { levelUp: false, newLevel: stats.level, newXP: stats.xp, newlyUnlocked: [] as string[] }; },
  getShopItems: (): ShopItem[] => loadItem('shop_items', DEFAULT_SHOP_ITEMS),
  buyShopItem: (_itemId: string) => ({ success: false, message: 'Shop catalog is temporarily unavailable.' }),
  equipBadge(badgeId: string) { const stats = this.getStats(); stats.equippedBadges = stats.equippedBadges?.includes(badgeId) ? stats.equippedBadges.filter(id => id !== badgeId) : [...(stats.equippedBadges || []), badgeId].slice(-3); this.saveStats(stats); return stats; },
  equipTitle(titleValue: string) { const stats = this.getStats(); stats.equippedTitle = titleValue; stats.userTitle = titleValue; this.saveStats(stats); return stats; },
  equipAura(auraId: string) { const stats = this.getStats(); stats.equippedAura = stats.equippedAura === auraId ? undefined : auraId; this.saveStats(stats); return stats; },
  equipSoundPack(soundPack: 'default' | 'retro-8bit' | 'cyberpunk-synth' | 'zen-bell') { const stats = this.getStats(); stats.equippedSoundPack = soundPack; this.saveStats(stats); return stats; },
  factoryReset() { try { localStorage.clear(); } catch (err) { console.error('Factory reset failed:', err); } }
};
