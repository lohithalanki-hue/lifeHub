import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Subject, Exam, DiaryEntry, Goal, LessonProgress, UserStats, AppSettings 
} from './types';
import { storageService, getLevelReward } from './services/storageService';

// Import sub-components
import Academics from './components/Academics';
import Diary from './components/Diary';
import Therapist from './components/Therapist';
import SkillMastery from './components/SkillMastery';
import GoalsCalendar from './components/GoalsCalendar';
import DailyNews from './components/DailyNews';
import AnalyticsHub from './components/AnalyticsHub';
import ProfileSettings from './components/ProfileSettings';
import Shop from './components/Shop';

// Lucide icons
import { 
  Home, BookOpen, Heart, Film, Calendar, Globe, BarChart3, 
  Settings, Flame, Award, Coins, Sparkles, Clock, Play, Pause, 
  RotateCcw, Info, CheckCircle2, ChevronRight, ChevronLeft, X, AlertCircle, 
  RefreshCw, Edit3, Sun, Moon, Zap, Target, Volume2, VolumeX, Send, ArrowUpRight, Check,
  ShoppingBag
} from 'lucide-react';

interface AlertNotification {
  id: string;
  title: string;
  desc: string;
  type: 'xp' | 'level' | 'achievement' | 'reset';
}

interface DailyQuest {
  id: string;
  title: string;
  desc: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
  category: 'focus' | 'diary' | 'goal' | 'wellness';
}

// Gentle Web Audio API Sound Synthesizer for tactile feedback
function playChime(type: 'click' | 'complete' | 'level') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'level') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.36);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch {
    // Silent fail if AudioContext is blocked
  }
}

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifehub_sidebar_minimized') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarMinimized(prev => {
      const next = !prev;
      try {
        localStorage.setItem('lifehub_sidebar_minimized', String(next));
      } catch {}
      return next;
    });
  };

  // State core models
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Motivational Quote
  const [quote, setQuote] = useState<{ text: string; author: string }>({
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  });
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toasts list
  const [toasts, setToasts] = useState<AlertNotification[]>([]);

  // Pomodoro Focus Timer State
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerPreset, setTimerPreset] = useState(25); // Current preset index: 25, 50, 15 minutes
  const [completedSessionsToday, setCompletedSessionsToday] = useState(2);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Quick Capture Console
  const [quickCaptureText, setQuickCaptureText] = useState('');
  const [quickCaptureType, setQuickCaptureType] = useState<'goal' | 'diary'>('goal');
  const [quickCaptureSuccess, setQuickCaptureSuccess] = useState(false);

  // Daily Quests system state
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: 'quest-1',
      title: 'Deep Focus Sprint',
      desc: 'Complete 1 Pomodoro session of 25+ mins',
      xpReward: 500,
      coinReward: 30,
      completed: true,
      claimed: false,
      category: 'focus'
    },
    {
      id: 'quest-2',
      title: 'Mindful Reflection',
      desc: 'Write 1 reflection in your private diary',
      xpReward: 300,
      coinReward: 20,
      completed: false,
      claimed: false,
      category: 'diary'
    },
    {
      id: 'quest-3',
      title: 'Academic Milestone',
      desc: 'Review 1 subject target rank & exams',
      xpReward: 250,
      coinReward: 15,
      completed: true,
      claimed: true,
      category: 'goal'
    },
    {
      id: 'quest-4',
      title: 'Zen Calibrate',
      desc: 'Box breathing with AI Therapist',
      xpReward: 200,
      coinReward: 10,
      completed: false,
      claimed: false,
      category: 'wellness'
    }
  ]);

  // Load all data from storageService on startup
  const syncEcosystemData = () => {
    setSubjects(storageService.getSubjects());
    setExams(storageService.getExams());
    setEntries(storageService.getDiaryEntries());
    setGoals(storageService.getGoals());
    setProgress(storageService.getLessonProgress());
    setStats(storageService.getStats());
    setSettings(storageService.getSettings());
  };

  const fetchWisdomQuote = async () => {
    setIsRefreshingQuote(true);
    try {
      const res = await fetch('/api/quote');
      const data = await res.json();
      const quoteText = data?.text || data?.quote;
      if (quoteText) {
        setQuote({ text: quoteText, author: data.author || 'Unknown' });
      }
    } catch {
      // Fallback inspirational quote pool
      const pool = [
        { text: "Consistency is what transforms average into excellence.", author: "Tony Robbins" },
        { text: "Focus is a muscle. The more you practice stillness, the sharper you become.", author: "Cal Newport" },
        { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
      ];
      const random = pool[Math.floor(Math.random() * pool.length)];
      setQuote(random);
    } finally {
      setTimeout(() => setIsRefreshingQuote(false), 400);
    }
  };

  useEffect(() => {
    syncEcosystemData();
    fetchWisdomQuote();
  }, []);

  // Update Theme class on HTML node dynamically
  useEffect(() => {
    if (!settings) return;
    const html = document.documentElement;
    html.classList.remove('dark', 'high-density');
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else if (settings.theme === 'high-density') {
      html.classList.add('high-density');
    }
  }, [settings]);

  // Fast theme toggle from top bar
  const cycleTheme = () => {
    if (!settings) return;
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const newSettings = { ...settings, theme: nextTheme as 'dark' | 'light' };
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
    if (!isSoundMuted) playChime('click');
    pushNotification('Theme Switched', `Active aesthetic: ${nextTheme.toUpperCase()}`, 'reset');
  };

  // Gamification: Trigger XP Gain & level up checking
  const triggerXP = (amount: number, reason: string) => {
    if (amount === 0) return;
    
    if (!isSoundMuted) playChime(amount >= 500 ? 'complete' : 'click');

    // 1. Update stats
    const currentStats = storageService.getStats();
    let newXP = currentStats.xp + amount;
    let newLevel = currentStats.level;
    let leveledUp = false;
    const gainedLevelRewards: any[] = [];

    // Check level up: each level threshold is level * 1000 XP
    while (newXP >= newLevel * 1000) {
      newXP -= newLevel * 1000;
      newLevel += 1;
      leveledUp = true;
      const rewards = getLevelReward(newLevel);
      gainedLevelRewards.push(rewards);
    }

    // Handle coin rewards
    const coinReward = Math.round(amount * 1);
    let levelUpCoinsBonus = 0;
    gainedLevelRewards.forEach(r => {
      levelUpCoinsBonus += r.coins;
    });
    const newCoins = currentStats.coins + coinReward + levelUpCoinsBonus;

    // Unlock achievements dynamically
    const unlockedAchievements = [...currentStats.unlockedAchievements];
    if (reason.includes("Exam") && !unlockedAchievements.includes("ach-2")) {
      unlockedAchievements.push("ach-2");
      pushNotification("Badge Unlocked! 📕", "Study Champion badge has been pinned!", "achievement");
    }
    if (reason.includes("Therapist") && !unlockedAchievements.includes("ach-3")) {
      unlockedAchievements.push("ach-3");
      pushNotification("Badge Unlocked! 💖", "Inner Peace zen therapist badge unlocked!", "achievement");
    }

    const nextStats: UserStats = {
      ...currentStats,
      xp: Math.max(0, newXP),
      level: newLevel,
      coins: newCoins,
      unlockedAchievements
    };

    storageService.saveStats(nextStats);
    setStats(nextStats);

    // 2. Add floating Toast
    if (amount > 0) {
      pushNotification(`+${amount} XP Gain`, reason, 'xp');
    }
    if (leveledUp) {
      if (!isSoundMuted) playChime('level');
      gainedLevelRewards.forEach(r => {
        pushNotification(
          `LEVEL UP! ⭐ Level ${r.level}`, 
          `Reward unlocked: "${r.title}"! Granting ${r.coins} Coins & Perk: ${r.perkIcon} ${r.perk}`, 
          'level'
        );
      });
    }
  };

  const pushNotification = (title: string, desc: string, type: 'xp' | 'level' | 'achievement' | 'reset') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, desc, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Claim Daily Quest Handler
  const handleClaimQuest = (questId: string) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.claimed || !quest.completed) return;

    setDailyQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
    triggerXP(quest.xpReward, `Completed Daily Quest: "${quest.title}" (+${quest.coinReward} Coins)`);
  };

  // Quick Capture Handler
  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCaptureText.trim()) return;

    if (quickCaptureType === 'goal') {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: quickCaptureText.trim(),
        category: 'learning',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        progress: 0,
        priority: 'medium',
        remindersEnabled: true
      };
      const updatedGoals = [newGoal, ...goals];
      storageService.saveGoals(updatedGoals);
      setGoals(updatedGoals);
      triggerXP(100, `Quick-Captured New Goal: "${newGoal.title}"`);
    } else {
      const newEntry: DiaryEntry = {
        id: `diary-${Date.now()}`,
        title: `Quick Note: ${new Date().toLocaleDateString()}`,
        content: quickCaptureText.trim(),
        mood: 'Good',
        tags: ['quick-capture', 'reflection'],
        images: [],
        date: new Date().toISOString().split('T')[0],
        isFavorite: false,
        wordCount: quickCaptureText.trim().split(/\s+/).length
      };
      const updatedEntries = [newEntry, ...entries];
      storageService.saveDiaryEntries(updatedEntries);
      setEntries(updatedEntries);
      triggerXP(150, `Quick-Captured Reflection Note into Private Diary`);
    }

    setQuickCaptureText('');
    setQuickCaptureSuccess(true);
    setTimeout(() => setQuickCaptureSuccess(false), 2500);
  };

  // Factory reset trigger handler
  const handleFactoryReset = () => {
    storageService.factoryReset();
    syncEcosystemData();
    pushNotification("Database Cleared", "LifeHub database was reset to defaults.", "reset");
    setActiveTab('dashboard');
  };

  // Pomodoro Focus Timer countdown tick
  useEffect(() => {
    if (!isTimerActive) return;

    const tick = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          setIsTimerActive(false);
          if (!isSoundMuted) playChime('complete');
          if (pomodoroMode === 'focus') {
            triggerXP(500, "Completed Pomodoro Focus session! Outstanding concentration.");
            setCompletedSessionsToday(c => c + 1);
            setDailyQuests(prevQ => prevQ.map(q => q.id === 'quest-1' ? { ...q, completed: true } : q));
            setPomodoroMode('break');
            setPomodoroTime(5 * 60); // 5 minutes break
          } else {
            triggerXP(100, "Completed Pomodoro Break cycle. Restoring focus!");
            setPomodoroMode('focus');
            setPomodoroTime(25 * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [isTimerActive, pomodoroMode, isSoundMuted]);

  // Pomodoro preset switcher
  const handlePomodoroPreset = (minutes: number) => {
    setTimerPreset(minutes);
    setPomodoroTime(minutes * 60);
    setIsTimerActive(false);
    if (!isSoundMuted) playChime('click');
  };

  // Format timer text
  const formattedTime = useMemo(() => {
    const mins = Math.floor(pomodoroTime / 60);
    const secs = pomodoroTime % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [pomodoroTime]);

  // Progress percentage for circular SVG timer
  const timerPercentage = useMemo(() => {
    const totalSecs = timerPreset * 60;
    const elapsed = totalSecs - pomodoroTime;
    return Math.min(100, Math.max(0, (elapsed / totalSecs) * 100));
  }, [pomodoroTime, timerPreset]);

  // Greeting based on hour
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (!stats || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-extrabold text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-white" />
        <span>Initializing LifeHub Core OS...</span>
      </div>
    );
  }

  const fontClass = 
    settings.font === 'mono' ? 'font-mono' :
    settings.font === 'serif' ? 'font-serif' : 'font-sans';

  const accentClass = `theme-accent-${settings.accentColor || 'indigo'}`;

  // Current view label
  const tabTitles: Record<string, { title: string; subtitle: string; icon: any }> = {
    dashboard: { title: 'Executive Dashboard', subtitle: 'Daily Mission Control & Focus Matrix', icon: Home },
    academics: { title: 'JEE Academic Portal', subtitle: 'Weekly JEE Tests, Subject Trajectory (PCM) & Rank Tracker', icon: BookOpen },
    diary: { title: 'Private Diary & Reflections', subtitle: 'Encrypted Daily Journaling & Mood Waves', icon: Flame },
    therapist: { title: 'AI Therapist & Mindfulness', subtitle: 'Cognitive Coping Tools, Box Breathing & Zen', icon: Heart },
    skill: { title: 'Skill Mastery Academy', subtitle: 'Video Editing Curriculum & Interactive Lessons', icon: Film },
    goals: { title: 'Planners & Calendar', subtitle: 'Interactive Milestones & Scheduled Deadlines', icon: Calendar },
    news: { title: 'Daily Curated News', subtitle: 'Global Tech, AI Breakthroughs & Science Intel', icon: Globe },
    analytics: { title: 'Executive Analytics', subtitle: 'Predictive Diagnostics & Trajectory Forecasting', icon: BarChart3 },
    shop: { title: 'Rewards & Badge Emporium', subtitle: 'Exchange Coins for Rare Badges, Titles, Auras & Mystery Capsules', icon: ShoppingBag },
    settings: { title: 'Profile & Preferences', subtitle: 'Hardware Control, Themes & Gamification Level Perks', icon: Settings },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles['dashboard'];
  const TabHeaderIcon = currentTabInfo.icon;

  return (
    <div id="app-wrapper" className={`min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ${fontClass} ${accentClass}`}>
      
      {/* 1. FLOATING REWARDS TOASTS FEED */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xl pointer-events-auto backdrop-blur-2xl transition-all duration-300 animate-slide-in text-xs font-bold leading-normal ${
              t.type === 'xp' ? 'bg-black/90 text-white border-zinc-700/60 dark:bg-zinc-900/90 dark:border-zinc-700' :
              t.type === 'level' ? 'bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-black border-amber-400/80 font-black' :
              t.type === 'achievement' ? 'bg-zinc-900/90 border-zinc-700 text-white' :
              'bg-zinc-900/90 border-zinc-700 text-white'
            }`}
          >
            <div className="text-xl shrink-0">
              {t.type === 'xp' ? '⚡' : t.type === 'level' ? '⭐' : t.type === 'achievement' ? '🎓' : '⚙️'}
            </div>
            <div className="flex-1 space-y-0.5">
              <h5 className="font-black tracking-tight">{t.title}</h5>
              <p className="text-zinc-300 dark:text-zinc-400 font-medium text-[11px]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row min-h-screen">

        {/* 2. LEFT SIDEBAR NAVIGATION */}
        <aside 
          id="main-navigation-sidebar" 
          className={`glass-sidebar text-slate-400 flex flex-col justify-between sticky top-0 h-screen shrink-0 z-40 transition-all duration-300 ${
            isSidebarMinimized 
              ? 'w-16 md:w-20 p-3 shadow-xl' 
              : 'w-60 md:w-64 p-5 shadow-2xl'
          }`}
        >
          
          <div className="space-y-6">
            {/* Logo and Toggle Controller Container */}
            <div className={`flex ${isSidebarMinimized ? 'flex-col items-center gap-3' : 'flex-row items-center justify-between'} transition-all duration-300`}>
              <div className="flex items-center space-x-2.5 overflow-hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="w-9 h-9 rounded-2xl bg-white text-black dark:bg-white dark:text-black flex items-center justify-center text-base font-black shadow-xl shrink-0 transition hover:scale-105">
                  L
                </div>
                <div className={`transition-all duration-300 ${isSidebarMinimized ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                  <span className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                    LifeHub <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </span>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest block whitespace-nowrap">Personal OS</span>
                </div>
              </div>

              {/* Arrow toggle button */}
              <button 
                id="btn-sidebar-toggle"
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-white/10 dark:hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all duration-200 shrink-0 border border-transparent hover:border-white/10"
                title={isSidebarMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarMinimized ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Quick gamification status */}
            <div className={`glass-card-nested p-3.5 space-y-2 transition-all duration-300 ${isSidebarMinimized ? 'opacity-0 h-0 overflow-hidden p-0 border-0' : 'opacity-100 h-auto'}`}>
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 whitespace-nowrap">
                <span className="flex items-center gap-1 text-white">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Level {stats.level}
                </span>
                <span className="font-mono text-zinc-300">{stats.xp} / {stats.level * 1000} XP</span>
              </div>
              <div className="w-full bg-zinc-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${Math.min(100, (stats.xp / (stats.level * 1000)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Navigation menu list */}
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: Home, badge: null },
                { id: 'academics', name: 'JEE Academics', icon: BookOpen, badge: 'PCM' },
                { id: 'diary', name: 'Private Diary', icon: Flame, badge: `${entries.length}` },
                { id: 'therapist', name: 'AI Therapist', icon: Heart, badge: 'Zen' },
                { id: 'skill', name: 'Skill Mastery', icon: Film, badge: null },
                { id: 'goals', name: 'Planners & Calendar', icon: Calendar, badge: `${goals.length}` },
                { id: 'news', name: 'Daily News', icon: Globe, badge: 'Live' },
                { id: 'analytics', name: 'Executive Analytics', icon: BarChart3, badge: null },
                { id: 'shop', name: 'Coin Rewards Shop', icon: ShoppingBag, badge: `${stats.coins}c` },
                { id: 'settings', name: 'Profile & Settings', icon: Settings, badge: null }
              ].map(item => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (!isSoundMuted) playChime('click');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between group ${
                      isActive 
                        ? 'bg-white text-black dark:bg-white dark:text-black shadow-lg' 
                        : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    } ${isSidebarMinimized ? 'justify-center px-2' : ''}`}
                    title={isSidebarMinimized ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition group-hover:scale-110 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`} />
                      <span className={`transition-all duration-300 ${isSidebarMinimized ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100 w-auto whitespace-nowrap'}`}>
                        {item.name}
                      </span>
                    </div>

                    {!isSidebarMinimized && item.badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-black/10 text-black' 
                          : 'bg-white/10 text-zinc-300 group-hover:bg-white/20 group-hover:text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile card in sidebar */}
          <div className={`border-t border-white/10 pt-4 flex items-center overflow-hidden ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('settings')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 text-white flex items-center justify-center text-xs font-black shrink-0 border border-white/10 shadow-md">
                {(stats.username || 'Alex')[0].toUpperCase()}
              </div>
              <div className={`transition-all duration-300 ${isSidebarMinimized ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100 w-auto'}`}>
                <p className="text-xs font-black text-white whitespace-nowrap">{stats.username || 'Alex'}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase whitespace-nowrap">{stats.userTitle || 'Growth Seeker'}</p>
              </div>
            </div>
          </div>

        </aside>

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

          {/* TOP EXECUTIVE FLOATING HEADER BAR */}
          <header className="glass-header sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-all">
            
            {/* Left: View title & breadcrumb */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 text-slate-850 dark:text-white shadow-sm">
                <TabHeaderIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>LifeHub</span>
                  <span>/</span>
                  <span className="text-slate-700 dark:text-zinc-300">{currentTabInfo.title}</span>
                </div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {currentTabInfo.subtitle}
                </h1>
              </div>
            </div>

            {/* Right: Live Telemetry Widgets (Streak, Level, Coins, Digital Clock & Theme) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Live Digital Clock Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-card-nested text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentTime}</span>
                <span className="text-slate-400 dark:text-zinc-400">•</span>
                <span className="text-[10px] uppercase font-sans font-extrabold text-slate-500 dark:text-zinc-400">{currentDateStr}</span>
              </div>

              {/* 14-Day Streak Flame */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-[11px] font-extrabold text-orange-600 dark:text-orange-400 shadow-sm animate-ember">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>14d Streak</span>
              </div>

              {/* Coins Counter (Clickable to open Shop) */}
              <button 
                id="header-coins-shop-btn"
                onClick={() => {
                  setActiveTab('shop');
                  if (!isSoundMuted) playChime('click');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/40 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 shadow-sm transition hover:scale-105 hover:bg-amber-500/25 active:scale-95 group"
                title="Click to Open Rewards & Badges Shop"
              >
                <Coins className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
                <span className="font-mono">{stats.coins}</span>
                <span className="text-[9px] uppercase tracking-wider hidden md:inline text-amber-500/80 font-black">Shop</span>
              </button>

              {/* Focus Session Live Status */}
              {isTimerActive && (
                <div 
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 cursor-pointer animate-pulse shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{formattedTime} Focus</span>
                </div>
              )}

              {/* Audio Sound FX Toggle */}
              <button 
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="p-2 rounded-2xl glass-card-nested text-slate-600 dark:text-zinc-300 transition hover:scale-105 active:scale-95"
                title={isSoundMuted ? "Sound Effects: Muted" : "Sound Effects: Active"}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Quick Theme Switcher */}
              <button 
                onClick={cycleTheme}
                className="p-2 rounded-2xl glass-card-nested text-slate-600 dark:text-zinc-300 transition hover:scale-105 active:scale-95"
                title="Toggle Dark / Light Theme"
              >
                {settings.theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

            </div>

          </header>

          {/* MAIN TAB CONTENT CONTAINER */}
          <main className="p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

            {/* TAB 1: DASHBOARD / EXECUTIVE MATRIX */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. HERO GREETING & WISDOM BANNER */}
                <div className="glass-card-primary p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Subtle decorative glow */}
                  <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

                  <div className="space-y-1.5 z-10 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {timeGreeting}, {stats.username || 'Alex'}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-card-nested text-slate-600 dark:text-zinc-300">
                        Level {stats.level} Scholar
                      </span>
                    </div>

                    <p className="text-sm md:text-base text-slate-850 dark:text-slate-100 font-bold leading-relaxed">
                      "{quote.text}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                      <span>— {quote.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 z-10">
                    <button 
                      onClick={fetchWisdomQuote}
                      disabled={isRefreshingQuote}
                      className="px-3.5 py-2 rounded-2xl glass-card-nested text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 transition active:scale-95 hover:bg-white/15"
                      title="Fetch new inspirational perspective"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQuote ? 'animate-spin' : ''}`} />
                      <span>Refresh Quote</span>
                    </button>
                  </div>

                </div>

                {/* 2. BENTO ROW 1: CIRCULAR FOCUS POMODORO + DAILY QUESTS MATRIX */}
                <div className="grid grid-cols-12 gap-6">

                  {/* Left: Interactive Circular Focus Pomodoro Terminal */}
                  <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Mindfulness & Focus</span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-zinc-400" /> Pomodoro Concentration Engine
                        </h3>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full glass-card-nested text-slate-700 dark:text-zinc-300">
                        {completedSessionsToday} Sessions Done
                      </span>
                    </div>

                    {/* Circular Countdown with SVG stroke progress */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6 my-auto">
                      
                      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                        
                        {/* Background SVG Ring */}
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                          <circle 
                            cx="50" cy="50" r="42" 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            className="text-white/10 dark:text-white/10" 
                            fill="transparent" 
                          />
                          <circle 
                            cx="50" cy="50" r="42" 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            strokeDasharray={263.89} 
                            strokeDashoffset={263.89 - (263.89 * timerPercentage) / 100} 
                            strokeLinecap="round" 
                            className={`transition-all duration-1000 ${
                              isTimerActive 
                                ? 'text-amber-500 dark:text-amber-400' 
                                : 'text-slate-800 dark:text-zinc-300'
                            }`}
                            fill="transparent" 
                          />
                        </svg>

                        {/* Inner Timer Board */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                            {pomodoroMode === 'focus' ? 'Focus Mode' : 'Rest Break'}
                          </span>
                          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                            {formattedTime}
                          </span>
                          <span className="text-[9px] font-extrabold text-amber-500 uppercase mt-0.5">
                            +500 XP
                          </span>
                        </div>

                      </div>

                      {/* Controls & Presets */}
                      <div className="space-y-4 text-center sm:text-left">
                        
                        {/* Preset buttons */}
                        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                          {[
                            { label: '25m Focus', mins: 25 },
                            { label: '50m Deep', mins: 50 },
                            { label: '15m Sprint', mins: 15 },
                            { label: '5m Rest', mins: 5 }
                          ].map(item => (
                            <button 
                              key={item.mins}
                              onClick={() => handlePomodoroPreset(item.mins)}
                              className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition ${
                                timerPreset === item.mins 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                                  : 'glass-card-nested text-slate-600 dark:text-zinc-300 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {/* Primary Start / Pause / Reset */}
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                          <button 
                            id="btn-pomodoro-toggle"
                            onClick={() => {
                              setIsTimerActive(!isTimerActive);
                              if (!isSoundMuted) playChime('click');
                            }}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-md ${
                              isTimerActive 
                                ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95'
                            }`}
                          >
                            {isTimerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            <span>{isTimerActive ? 'Pause' : 'Start Focus'}</span>
                          </button>

                          <button 
                            onClick={() => { 
                              setIsTimerActive(false); 
                              setPomodoroTime(timerPreset * 60); 
                              if (!isSoundMuted) playChime('click');
                            }}
                            className="p-2.5 rounded-2xl glass-card-nested text-slate-500 dark:text-zinc-300 transition hover:bg-white/15"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 italic">
                          Press Space or click Start to lock into flow.
                        </p>

                      </div>

                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>Reward upon cycle completion: <strong>+500 XP & 30 Coins</strong></span>
                      <span className="text-amber-500 font-bold">⚡ Focus Multiplier 1.5x</span>
                    </div>

                  </div>

                  {/* Right: Daily Quests & Gamified Micro-Habits Matrix */}
                  <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest block">Daily Quest Board</span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-amber-500" /> Today's Growth Objectives
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400">
                        {dailyQuests.filter(q => q.claimed).length} / {dailyQuests.length} Claimed
                      </span>
                    </div>

                    {/* Quest cards list */}
                    <div className="space-y-2.5 my-3">
                      {dailyQuests.map(quest => (
                        <div 
                          key={quest.id}
                          className={`p-3.5 rounded-2xl transition flex items-center justify-between gap-3 ${
                            quest.claimed 
                              ? 'glass-card-nested opacity-60' 
                              : quest.completed 
                                ? 'bg-amber-500/10 border border-amber-500/40' 
                                : 'glass-card-nested'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className={`text-xs font-black ${quest.claimed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {quest.title}
                              </h5>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded glass-pill text-slate-600 dark:text-zinc-300">
                                +{quest.xpReward} XP
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                              {quest.desc}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {quest.claimed ? (
                              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                                <Check className="w-3.5 h-3.5" /> Claimed
                              </span>
                            ) : quest.completed ? (
                              <button 
                                onClick={() => handleClaimQuest(quest.id)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shadow-sm transition active:scale-95 animate-pulse"
                              >
                                Claim ⚡
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setDailyQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true } : q));
                                  if (!isSoundMuted) playChime('click');
                                }}
                                className="px-3 py-1.5 rounded-xl glass-card-nested text-slate-700 dark:text-zinc-300 hover:text-white text-[10px] font-bold uppercase transition"
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Quests refresh every 24 hours</span>
                      <span className="text-amber-500 font-bold">Total Daily Pool: 1,250 XP</span>
                    </div>

                  </div>

                </div>

                {/* 3. BENTO ROW 2: QUICK CAPTURE STATION */}
                <div className="glass-card p-5 rounded-3xl shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-zinc-400" /> Quick-Capture Action Console
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Rapidly capture a thought, study milestone, or urgent goal without leaving the dashboard.
                      </p>
                    </div>

                    <form onSubmit={handleQuickCapture} className="flex-1 max-w-2xl flex items-center gap-2">
                      <div className="flex rounded-2xl glass-card-nested p-1 shrink-0 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setQuickCaptureType('goal')}
                          className={`px-2.5 py-1 rounded-xl transition ${quickCaptureType === 'goal' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-slate-500 dark:text-zinc-400'}`}
                        >
                          Goal
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCaptureType('diary')}
                          className={`px-2.5 py-1 rounded-xl transition ${quickCaptureType === 'diary' ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-slate-500 dark:text-zinc-400'}`}
                        >
                          Diary
                        </button>
                      </div>

                      <input 
                        type="text"
                        value={quickCaptureText}
                        onChange={(e) => setQuickCaptureText(e.target.value)}
                        placeholder={quickCaptureType === 'goal' ? "Enter a new goal to accomplish..." : "Jot a quick reflection note..."}
                        className="flex-1 px-4 py-2 bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />

                      <button
                        type="submit"
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase flex items-center gap-1 hover:opacity-90 transition shrink-0 shadow-md"
                      >
                        <Send className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </form>

                  </div>

                  {quickCaptureSuccess && (
                    <p className="text-[11px] text-emerald-500 font-bold mt-2 animate-fade-in flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Item captured successfully and synced to your ecosystem!
                    </p>
                  )}
                </div>

                {/* 4. BENTO ROW 3: 4-COLUMN ECOSYSTEM RADAR CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Card 1: JEE Academics snapshot */}
                  <div 
                    onClick={() => setActiveTab('academics')}
                    className="p-5 rounded-3xl glass-card-interactive shadow-sm cursor-pointer group flex flex-col justify-between h-44"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JEE Preparation</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Weekly Test Portal
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Maths, Physics & Chem (PCM) analytics & rank tracking.
                      </p>
                    </div>

                    <div className="text-[10px] font-extrabold text-indigo-400 flex items-center gap-1">
                      <span>View Test Analytics</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Card 2: Skill Mastery snapshot */}
                  <div 
                    onClick={() => setActiveTab('skill')}
                    className="p-5 rounded-3xl glass-card-interactive shadow-sm cursor-pointer group flex flex-col justify-between h-44"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        <Film className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Mastery</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Video Editing Core
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Interactive timelines, cut types & color grade modules.
                      </p>
                    </div>

                    <div className="text-[10px] font-extrabold text-purple-400 flex items-center gap-1">
                      <span>Resume Lessons</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Card 3: AI Therapist snapshot */}
                  <div 
                    onClick={() => setActiveTab('therapist')}
                    className="p-5 rounded-3xl glass-card-interactive shadow-sm cursor-pointer group flex flex-col justify-between h-44"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
                        <Heart className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zen & Therapy</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        AI Companion
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Box breathing, 5-4-3-2-1 grounding & emotional check-in.
                      </p>
                    </div>

                    <div className="text-[10px] font-extrabold text-rose-400 flex items-center gap-1">
                      <span>Start Session</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Card 4: Curated Daily News snapshot */}
                  <div 
                    onClick={() => setActiveTab('news')}
                    className="p-5 rounded-3xl glass-card-interactive shadow-sm cursor-pointer group flex flex-col justify-between h-44"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <Globe className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Global Intel</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Daily Tech Stream
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Verified AI discoveries, science breakthroughs & world news.
                      </p>
                    </div>

                    <div className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                      <span>Read Articles</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: ACADEMICS PORTAL */}
            {activeTab === 'academics' && (
              <Academics 
                subjects={subjects} 
                exams={exams} 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 3: PRIVATE DIARY */}
            {activeTab === 'diary' && (
              <Diary 
                entries={entries} 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 4: AI THERAPIST */}
            {activeTab === 'therapist' && (
              <Therapist 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 5: SKILL MASTERY */}
            {activeTab === 'skill' && (
              <SkillMastery 
                progress={progress} 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 6: GOALS PLANNERS & CALENDAR */}
            {activeTab === 'goals' && (
              <GoalsCalendar 
                goals={goals} 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 7: DAILY CURATED NEWS */}
            {activeTab === 'news' && (
              <DailyNews 
                preferredCategories={settings.preferredCategories || settings.newsCategories || []}
                triggerXP={triggerXP}
              />
            )}

            {/* TAB 8: EXECUTIVE ANALYTICS */}
            {activeTab === 'analytics' && (
              <AnalyticsHub 
                subjects={subjects} 
                exams={exams} 
                entries={entries} 
                goals={goals} 
                progress={progress}
              />
            )}

            {/* TAB 9: REWARDS & BADGE SHOP */}
            {activeTab === 'shop' && (
              <Shop 
                stats={stats} 
                onDataUpdate={syncEcosystemData}
                triggerXP={triggerXP}
                onOpenProfile={() => setActiveTab('settings')}
              />
            )}

            {/* TAB 10: PROFILE SETTINGS & HARDWARE CONTROL */}
            {activeTab === 'settings' && (
              <ProfileSettings 
                stats={stats} 
                settings={settings}
                onSettingsUpdate={(newSets) => { storageService.saveSettings(newSets); syncEcosystemData(); }}
                onFactoryReset={handleFactoryReset}
                triggerXP={triggerXP}
                onStatsUpdate={(newStats) => { storageService.saveStats(newStats); syncEcosystemData(); }}
                onOpenShop={() => setActiveTab('shop')}
              />
            )}

          </main>

        </div>

      </div>

    </div>
  );
}

