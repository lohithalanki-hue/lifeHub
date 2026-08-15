import React from 'react';
import { AppSettings, UserStats } from '../types';
import { ALL_ACHIEVEMENTS, getLevelReward } from '../services/storageService';
import { 
  Settings, User, Award, Flame, Coins, ShieldAlert, Sparkles, 
  Moon, Sun, Eye, Trash2, CheckCircle2, RefreshCw, Save, Check,
  ShoppingBag, AlertTriangle, X
} from 'lucide-react';

interface ProfileSettingsProps {
  stats: UserStats;
  settings: AppSettings;
  onSettingsUpdate: (newSettings: AppSettings) => void;
  onFactoryReset: () => void;
  triggerXP: (amount: number, reason: string) => void;
  onStatsUpdate: (newStats: UserStats) => void;
  onOpenShop?: () => void;
}

export default function ProfileSettings({ 
  stats, settings, onSettingsUpdate, onFactoryReset, triggerXP, onStatsUpdate, onOpenShop
}: ProfileSettingsProps) {

  const [username, setUsername] = React.useState(stats.username || 'Alex');
  const [userTitle, setUserTitle] = React.useState(stats.userTitle || 'Aspirant');
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = React.useState(false);

  React.useEffect(() => {
    setUsername(stats.username || 'Alex');
    setUserTitle(stats.userTitle || 'Aspirant');
  }, [stats.username, stats.userTitle]);

  // Update specific setting keys (WITHOUT adding XP, as requested by the user)
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onSettingsUpdate(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onStatsUpdate({
      ...stats,
      username: username.trim(),
      userTitle: userTitle.trim() || 'Vertical Developer'
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleConfirmFactoryReset = () => {
    setShowResetConfirmModal(false);
    onFactoryReset();
  };

  return (
    <div id="profile-settings-container" className="space-y-6">

      {/* 1. Module Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" /> Profile & System Setup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your level progression, browse unlocked achievements badges, and configure visual styles.
          </p>
        </div>

        {onOpenShop && (
          <button
            onClick={onOpenShop}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-md flex items-center gap-2 transition hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" /> Open Coin Rewards Shop
          </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* 2. LEFT COLUMN: GAMIFIED PROFILE & BADGES LOCKER */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* Level Progress widget */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Growth progression</span>
                <h3 className="text-base font-black">{stats.username || 'Alex'} — Level {stats.level}</h3>
                <p className="text-xs text-slate-400 font-medium">{stats.userTitle || 'Vertical Developer'}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700/50 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Coins</span>
                <span className="text-xs font-black text-yellow-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {stats.coins}
                </span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>XP progression</span>
                <span>{stats.xp} / {stats.level * 1000} XP</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/30">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(stats.xp / (stats.level * 1000)) * 100}%` }} />
              </div>
            </div>

            {/* Streak indices overview */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-slate-800 text-xs">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Study Streak</p>
                <p className="text-base font-black text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-current" /> {stats.streaks.study}d
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Diary Streak</p>
                <p className="text-base font-black text-pink-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-current" /> {stats.streaks.diary}d
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Skill Streak</p>
                <p className="text-base font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-current" /> {stats.streaks.skill}d
                </p>
              </div>
            </div>

          </div>

          {/* LEVEL-UP REWARDS & PROGRESSION MAP */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Reward System & Next Level Treasure
              </h4>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {stats.level * 1000 - stats.xp} XP left to Level {stats.level + 1}
              </span>
            </div>

            {/* Next Reward Spotlight Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-[-15px] bottom-[-15px] text-8xl opacity-10 font-black">
                {stats.level + 1}
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Next Reward at Level {stats.level + 1}
                  </span>
                  <span className="text-yellow-300 font-black text-xs flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-300 fill-current" /> +{getLevelReward(stats.level + 1).coins} Coins
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {getLevelReward(stats.level + 1).perkIcon}
                  </div>
                  <div>
                    <h5 className="text-sm font-black tracking-tight">{getLevelReward(stats.level + 1).title}</h5>
                    <p className="text-xs text-indigo-100 font-semibold mt-0.5">{getLevelReward(stats.level + 1).perk}</p>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-55 leading-relaxed pt-1.5 border-t border-white/10">
                  {getLevelReward(stats.level + 1).description}
                </p>

                {/* Progress Mini Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-indigo-100">
                    <span>XP Progress</span>
                    <span>{stats.xp} / {stats.level * 1000} XP ({Math.round(Math.min(100, (stats.xp / (stats.level * 1000)) * 100))}%)</span>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-300 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.xp / (stats.level * 1000)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chronological Levels Map Timeline */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider block">Progression Map Path</span>
              
              <div className="relative pl-4 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                
                {/* Level L - 1 (Claimed) */}
                {stats.level > 1 && (
                  <div className="relative flex items-start gap-3 text-slate-500">
                    <div className="absolute left-[-11px] top-1.5 w-4.5 h-4.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[10px] text-white font-black">
                      ✓
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 flex-1 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[9px] uppercase text-emerald-500 block">Level {stats.level - 1} Unlocked</span>
                        <span className="font-black text-slate-700 dark:text-slate-300">{getLevelReward(stats.level - 1).title}</span>
                      </div>
                      <span className="text-[10px] text-slate-450 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-yellow-500" /> +{getLevelReward(stats.level - 1).coins}
                      </span>
                    </div>
                  </div>
                )}

                {/* Level L (Current Level Status) */}
                <div className="relative flex items-start gap-3">
                  <div className="absolute left-[-11px] top-1.5 w-4.5 h-4.5 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[9px] text-white font-black animate-pulse" />
                  <div className="absolute left-[-11px] top-1.5 w-4.5 h-4.5 bg-indigo-600 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[9px] text-white font-black">
                    ⭐
                  </div>
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 flex-1 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[9px] uppercase text-indigo-500 block">Level {stats.level} Current</span>
                      <span className="font-black text-slate-800 dark:text-white">{getLevelReward(stats.level).title}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">{getLevelReward(stats.level).perkIcon} {getLevelReward(stats.level).perk}</p>
                    </div>
                    <span className="text-[11px] font-black text-yellow-650 dark:text-yellow-400 flex items-center gap-1 shrink-0 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-lg border border-yellow-100/50">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" /> Active
                    </span>
                  </div>
                </div>

                {/* Level L + 1 (Next Reward) */}
                <div className="relative flex items-start gap-3">
                  <div className="absolute left-[-11px] top-1.5 w-4.5 h-4.5 bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[9px] text-slate-500 font-black">
                    {stats.level + 1}
                  </div>
                  <div className="bg-white dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 flex-1 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[9px] uppercase text-indigo-400 block">Level {stats.level + 1} Next Unlock</span>
                      <span className="font-black text-slate-700 dark:text-slate-350">{getLevelReward(stats.level + 1).title}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">{getLevelReward(stats.level + 1).perkIcon} {getLevelReward(stats.level + 1).perk}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                      <Coins className="w-3.5 h-3.5" /> +{getLevelReward(stats.level + 1).coins}
                    </span>
                  </div>
                </div>

                {/* Level L + 2 (Locked Milestone) */}
                <div className="relative flex items-start gap-3 opacity-60">
                  <div className="absolute left-[-11px] top-1.5 w-4.5 h-4.5 bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[9px] text-slate-400 font-bold">
                    {stats.level + 2}
                  </div>
                  <div className="bg-slate-50/40 dark:bg-slate-950/10 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 flex-1 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[9px] uppercase text-slate-400 block">Level {stats.level + 2} Milestone</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{getLevelReward(stats.level + 2).title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-450 shrink-0">
                      {getLevelReward(stats.level + 2).perkIcon}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulation Actions - Gives instant interaction & life */}
            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-700 dark:text-slate-300">Gamification Sandbox</h5>
                  <p className="text-[10px] text-slate-400">Instantly trigger XP to test the reward system!</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">Developer Tool</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => triggerXP(250, "Simulated Study Session: Reviewing advanced formulas")}
                  className="py-1.5 bg-white dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1"
                >
                  📖 +250 XP
                </button>
                <button 
                  onClick={() => triggerXP(500, "Simulated Focus Run: Completed complete video edit timeline")}
                  className="py-1.5 bg-white dark:bg-slate-850 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1"
                >
                  ⚡ +500 XP
                </button>
                <button 
                  onClick={() => triggerXP(1000, "Simulated Mega Milestone: Dynamic Level-Up Test")}
                  className="py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1 shadow-sm"
                >
                  ⭐ +1000 XP
                </button>
              </div>
            </div>

          </div>

          {/* Active Quests & Milestones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-500" /> Active Daily Quests & Focus Milestones
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
              Complete these educational and emotional health activities to claim rewards and increase your growth level!
            </p>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white">Write in Private Diary</h5>
                  <p className="text-[10px] text-slate-400">Document your thoughts and emotional state</p>
                </div>
                <span className="text-[10px] font-black text-pink-500 bg-pink-50 dark:bg-pink-950/20 px-2 py-1 rounded-lg">+250 XP</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white">Complete a Pomodoro Block</h5>
                  <p className="text-[10px] text-slate-400">Study uninterrupted for 25 or 50 minutes</p>
                </div>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-lg">+500 XP</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white">Solve Technical Skill Quiz</h5>
                  <p className="text-[10px] text-slate-400">Pass a video timeline or grading quiz</p>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">+300 XP</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white">Log Academic Exam Marks</h5>
                  <p className="text-[10px] text-slate-400">Track scores and compile rank trends</p>
                </div>
                <span className="text-[10px] font-black text-purple-500 bg-purple-50 dark:bg-purple-950/20 px-2 py-1 rounded-lg">+200 XP</span>
              </div>
            </div>
          </div>

          {/* Badges Locker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <Award className="w-4 h-4 text-indigo-500" /> Badges Locker ({stats.unlockedAchievements.length} / {ALL_ACHIEVEMENTS.length})
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_ACHIEVEMENTS.map(ach => {
                const isUnlocked = stats.unlockedAchievements.includes(ach.id);
                return (
                  <div 
                    key={ach.id} 
                    className={`p-3.5 border rounded-2xl text-center space-y-1.5 transition ${
                      isUnlocked 
                        ? 'bg-indigo-50/20 border-indigo-200 text-slate-800 dark:bg-indigo-950/20 dark:border-indigo-900/60' 
                        : 'bg-slate-50 border-slate-150 opacity-45 dark:bg-slate-950/20 dark:border-slate-800'
                    }`}
                  >
                    <span className={`text-2xl block ${isUnlocked ? 'scale-110 filter-none' : 'filter grayscale'}`}>{ach.icon}</span>
                    <h5 className="text-[11px] font-black truncate text-slate-800 dark:text-white">{ach.title}</h5>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 leading-snug">{ach.description}</p>
                    {isUnlocked ? (
                      <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full inline-block">Unlocked ✓</span>
                    ) : (
                      <span className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block">+{ach.xpReward} XP Reward</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. RIGHT COLUMN: PROFILE EDITOR & SYSTEM CONFIGURATION */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* Functional User Profile Editor Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50 dark:border-slate-800">
              Customize Profile
            </h4>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Display Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none placeholder-slate-450"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Professional/Academic Title Bio</label>
                <input 
                  type="text" 
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  placeholder="e.g. Vertical Developer"
                  className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none placeholder-slate-450"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                {showSaveSuccess ? (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 animate-fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved changes successfully!
                  </span>
                ) : <span />}

                <button 
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Visual Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-50 dark:border-slate-800">Visual Customization</h4>
            
            {/* Theme selection */}
            <div className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Visual Theme presets</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateSetting('theme', 'high-density')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${settings.theme === 'high-density' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  📊 High Density
                </button>
                <button 
                  onClick={() => updateSetting('theme', 'light')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${settings.theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  ☀️ Light Mode
                </button>
                <button 
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${settings.theme === 'dark' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  🌙 Dark Mode
                </button>
              </div>
            </div>

            {/* Accent choice */}
            <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Monochromatic Accent Presets</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'indigo', name: "Midnight Ink 🖤", desc: "Pure high-contrast inkwell blacks & solid whites", previewClass: "bg-black dark:bg-white" },
                  { id: 'violet', name: "Asphalt Slate 🌑", desc: "Cool corporate carbon shades & slate greys", previewClass: "bg-slate-800 dark:bg-slate-300" },
                  { id: 'rose', name: "Industrial Steel ⚙️", desc: "Mechanical titanium, neutral grey structures", previewClass: "bg-neutral-700 dark:bg-neutral-300" },
                  { id: 'emerald', name: "Silver Mist 🌫️", desc: "Elegant luxury satin platinum & titanium silvers", previewClass: "bg-zinc-600 dark:bg-zinc-400" },
                  { id: 'amber', name: "Brutalist Obsidian 🧱", desc: "Deep pitch charcoal with wired grid borders", previewClass: "bg-zinc-950 dark:bg-zinc-100" }
                ].map(themeOpt => {
                  const isActive = settings.accentColor === themeOpt.id;
                  return (
                    <button 
                      key={themeOpt.id}
                      type="button"
                      onClick={() => updateSetting('accentColor', themeOpt.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                        isActive 
                          ? 'bg-black text-white dark:bg-white dark:text-black border-zinc-800 dark:border-zinc-200 shadow-md scale-[1.02]' 
                          : 'bg-slate-50 border-slate-150 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shrink-0 border border-black/10 dark:border-white/10 ${themeOpt.previewClass}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs">{themeOpt.name}</span>
                          {isActive && <span className="text-[9px] font-bold bg-white/20 dark:bg-black/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">Active</span>}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-slate-450 dark:text-slate-550'}`}>{themeOpt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font selection */}
            <div className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Typographical Pairings</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateSetting('font', 'sans')}
                  className={`py-2 rounded-xl text-xs font-bold border transition font-sans ${settings.font === 'sans' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  Space Grotesk
                </button>
                <button 
                  onClick={() => updateSetting('font', 'serif')}
                  className={`py-2 rounded-xl text-xs font-bold border transition font-serif ${settings.font === 'serif' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  Merriweather
                </button>
                <button 
                  onClick={() => updateSetting('font', 'mono')}
                  className={`py-2 rounded-xl text-xs font-bold border transition font-mono ${settings.font === 'mono' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400' : 'bg-slate-50 border-slate-150 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  JetBrains Mono
                </button>
              </div>
            </div>

            {/* System notification flags toggling */}
            <div className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Active Reminders triggers</label>
              
              <div className="space-y-2 font-bold">
                <div className="flex items-center justify-between">
                  <span>Study reminders</span>
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.studying} 
                    onChange={(e) => updateSetting('notifications', { ...settings.notifications, studying: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Private diary notification</span>
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.diary} 
                    onChange={(e) => updateSetting('notifications', { ...settings.notifications, diary: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Quiz completion celebration alerts</span>
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.skill} 
                    onChange={(e) => updateSetting('notifications', { ...settings.notifications, skill: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Factory Reset button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button 
                id="btn-factory-reset"
                onClick={() => setShowResetConfirmModal(true)}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Reset Database (Factory Reset)
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FACTORY RESET CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Confirm System Factory Reset?
                </h3>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Irreversible Complete Database Reset
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-slate-700 dark:text-zinc-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-rose-800 dark:text-rose-300">
                This action will wipe all customized data and restore LifeHub to its pristine initial state:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                <li>All JEE weekly exam scores, rank records, and subject milestones</li>
                <li>All personal diary notes, mood logs, and therapy conversation history</li>
                <li>All planner goals, task progress, and streak counters</li>
                <li>All earned coins, inventory badges, and custom equippable titles</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
              >
                Cancel & Keep My Data
              </button>
              <button
                type="button"
                id="btn-confirm-wipe-data"
                onClick={handleConfirmFactoryReset}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Wipe & Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
