import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DiaryEntry, MoodCheckIn } from '../types';
import { storageService } from '../services/storageService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  BookOpen, Plus, Heart, Calendar, Search, Tag, Eye, EyeOff, Save, 
  Trash2, Smile, ArrowLeft, Star, BarChart3, LineChart, Sparkles 
} from 'lucide-react';

interface DiaryProps {
  entries: DiaryEntry[];
  onDataUpdate: () => void;
  triggerXP: (amount: number, reason: string) => void;
}

const MOODS = [
  { label: 'Great', value: 5, emoji: '😎', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200' },
  { label: 'Good', value: 4, emoji: '😊', color: 'text-zinc-600 bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:text-zinc-300 dark:border-zinc-700' },
  { label: 'Neutral', value: 3, emoji: '😐', color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20 border-slate-200' },
  { label: 'Tired', value: 2, emoji: '😴', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200' },
  { label: 'Anxious', value: 2, emoji: '🥺', color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20 border-pink-200' },
  { label: 'Stressed', value: 1.5, emoji: '😫', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200' },
  { label: 'Down', value: 1, emoji: '😞', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200' }
];

const EMOJIS = ['🚀', '🧘', '🎓', '🎨', '🔥', '🎉', '💡', '🌟', '❤️', '🧠', '💼', '🏡'];

export default function Diary({ entries, onDataUpdate, triggerXP }: DiaryProps) {
  // Navigation states
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('Neutral');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Active Entry Edit states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [emojiReaction, setEmojiReaction] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageAttachments, setImageAttachments] = useState<string[]>([]);
  const [isPrivacyBlurred, setIsPrivacyBlurred] = useState(false);

  // Autosave Timer ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Trigger Mood Check-In to start writing
  const handleStartNewEntry = () => {
    setSelectedMood('Neutral');
    setShowMoodCheckIn(true);
  };

  const handleMoodConfirm = (moodLabel: string) => {
    setShowMoodCheckIn(false);
    
    // Create new shell entry
    const newId = `diary-${Date.now()}`;
    const newEntry: DiaryEntry = {
      id: newId,
      title: 'Daily Reflection',
      content: '',
      mood: moodLabel,
      tags: ['reflection'],
      emojiReaction: '📝',
      images: [],
      date: new Date().toISOString().split('T')[0],
      isFavorite: false,
      wordCount: 0
    };

    // Save and Update
    const current = storageService.getDiaryEntries();
    storageService.saveDiaryEntries([newEntry, ...current]);
    
    // Increment Mood log in storage
    const moodHist = storageService.getMoodHistory();
    const moodScore = MOODS.find(m => m.label === moodLabel)?.value || 3;
    const newCheckIn: MoodCheckIn = {
      id: `mh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      score: moodScore * 2, // scale 1-5 score to 1-10
      mood: moodLabel,
      notes: 'Logged via diary check-in.'
    };
    storageService.saveMoodHistory([newCheckIn, ...moodHist]);

    // Update level XP
    triggerXP(250, `Completed daily emotional mood check-in: ${moodLabel}`);
    
    // Set Active Workspace
    setActiveEntryId(newId);
    setTitle(newEntry.title);
    setContent(newEntry.content);
    setTags(newEntry.tags);
    setEmojiReaction(newEntry.emojiReaction || '📝');
    setIsFavorite(newEntry.isFavorite);
    setImageAttachments(newEntry.images);
    setAutosaveStatus('saved');

    onDataUpdate();
  };

  // Open an existing entry
  const handleOpenEntry = (entry: DiaryEntry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setTags(entry.tags);
    setEmojiReaction(entry.emojiReaction || '📝');
    setIsFavorite(entry.isFavorite);
    setImageAttachments(entry.images);
    setAutosaveStatus('saved');
  };

  // Autosave handler on changes
  useEffect(() => {
    if (!activeEntryId) return;

    setAutosaveStatus('dirty');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      setAutosaveStatus('saving');
      
      const current = storageService.getDiaryEntries();
      const updated = current.map(e => e.id === activeEntryId ? {
        ...e,
        title,
        content,
        tags,
        emojiReaction,
        images: imageAttachments,
        isFavorite,
        wordCount: content.split(/\s+/).filter(Boolean).length
      } : e);
      
      storageService.saveDiaryEntries(updated);
      setAutosaveStatus('saved');
      onDataUpdate();
    }, 1500); // Debounce autosave 1.5 seconds

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, content, tags, emojiReaction, isFavorite, imageAttachments, activeEntryId]);

  // Save manual override
  const handleSaveManual = () => {
    if (!activeEntryId) return;
    setAutosaveStatus('saving');
    
    const current = storageService.getDiaryEntries();
    const updated = current.map(e => e.id === activeEntryId ? {
      ...e,
      title,
      content,
      tags,
      emojiReaction,
      images: imageAttachments,
      isFavorite,
      wordCount: content.split(/\s+/).filter(Boolean).length
    } : e);
    
    storageService.saveDiaryEntries(updated);
    setAutosaveStatus('saved');
    triggerXP(50, "Manually saved diary reflection");
    onDataUpdate();
  };

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Delete this diary entry permanently?")) {
      const remaining = storageService.getDiaryEntries().filter(e => e.id !== id);
      storageService.saveDiaryEntries(remaining);
      setActiveEntryId(null);
      onDataUpdate();
    }
  };

  // Image upload simulator
  const handleSimulateImageUpload = () => {
    const imagesList = [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&auto=format&fit=crop&q=60'
    ];
    const randomImage = imagesList[Math.floor(Math.random() * imagesList.length)];
    setImageAttachments([...imageAttachments, randomImage]);
    triggerXP(100, "Attached visual memory card to journal entry");
  };

  // Tag interactions
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tagInput.trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Filtered entries memo
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
      const matchesFavorite = !favoriteFilter || entry.isFavorite;
      const matchesDate = !dateFilter || entry.date === dateFilter;

      return matchesSearch && matchesMood && matchesFavorite && matchesDate;
    });
  }, [entries, searchQuery, selectedMoodFilter, favoriteFilter, dateFilter]);

  // Mood Trends Area Chart calculations
  const moodTrendData = useMemo(() => {
    const reversed = [...entries].reverse();
    return reversed.map(e => {
      const mScore = MOODS.find(m => m.label === e.mood)?.value || 3;
      return {
        date: e.date,
        MoodScore: mScore,
        Mood: e.mood
      };
    });
  }, [entries]);

  // Overall Statistics calculations
  const statsSummary = useMemo(() => {
    const totalEntries = entries.length;
    const favoriteCount = entries.filter(e => e.isFavorite).length;
    
    // Writing streak (simplified consecutive days check)
    let streak = 0;
    if (totalEntries > 0) {
      const dates = entries.map(e => e.date).sort();
      streak = 1;
      for (let i = dates.length - 1; i > 0; i--) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i-1]);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) streak++;
        else if (diff > 1) break;
      }
    }

    return { totalEntries, favoriteCount, streak };
  }, [entries]);

  return (
    <div id="diary-container" className="space-y-6">

      {/* 1. Module Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Private Diary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reflect, track emotional states, bookmark insights, and maintain absolute privacy.
          </p>
        </div>
        <button 
          id="btn-new-diary-entry"
          onClick={handleStartNewEntry}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4" /> Check In & Write
        </button>
      </div>

      {activeEntryId ? (
        // ================= WORKSPACE VIEW =================
        <div className="grid grid-cols-12 gap-6">
          
          {/* Main Edit Canvas */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <button 
                onClick={() => setActiveEntryId(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to list
              </button>
              
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  autosaveStatus === 'saved' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' :
                  autosaveStatus === 'saving' ? 'text-zinc-800 bg-zinc-100 dark:text-zinc-200 dark:bg-zinc-800' :
                  'text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                }`}>
                  {autosaveStatus === 'saved' ? 'Autosaved' : autosaveStatus === 'saving' ? 'Saving...' : 'Draft edited'}
                </span>
                
                <button 
                  onClick={handleSaveManual}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                  title="Force manual save"
                >
                  <Save className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setIsPrivacyBlurred(!isPrivacyBlurred)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                  title={isPrivacyBlurred ? "Unblur text" : "Blur text (Privacy Mode)"}
                >
                  {isPrivacyBlurred ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button 
                  onClick={() => handleDeleteEntry(activeEntryId)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-xl transition"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Entry Details */}
            <div className="space-y-2">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your journal reflection..."
                className="w-full text-lg font-extrabold text-slate-800 dark:text-white outline-none"
              />
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>Word Count: {content.split(/\s+/).filter(Boolean).length}</span>
              </div>
            </div>

            {/* Core Content area */}
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              placeholder="Reflect on your achievements, academic focus, struggles, and wellness today..."
              className={`w-full min-h-[220px] text-sm text-slate-700 dark:text-slate-350 outline-none resize-none leading-relaxed font-medium ${isPrivacyBlurred ? 'filter blur-md select-none' : ''}`}
            />

            {/* Image Attachments */}
            {imageAttachments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memories Attached</p>
                <div className="flex flex-wrap gap-2">
                  {imageAttachments.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={img} alt="attachment" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImageAttachments(imageAttachments.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-[9px] font-black uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive metadata additions (Emojis & Tags) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              {/* Emojis Reactions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emoji Mood Reaction</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJIS.map(emo => (
                    <button 
                      key={emo}
                      onClick={() => setEmojiReaction(emo)}
                      className={`text-base p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition ${emojiReaction === emo ? 'bg-zinc-100 border border-zinc-300 scale-110 dark:bg-zinc-800 dark:border-zinc-700' : ''}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags additions */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Categorization Tags</label>
                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="add tag..."
                    className="flex-1 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 text-xs px-3 py-1.5 rounded-xl text-white dark:text-white placeholder-slate-400 outline-none"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition">Add</button>
                </form>
                <div className="flex flex-wrap gap-1">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold rounded-lg flex items-center gap-1">
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-slate-600">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Quick Context Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-44">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">Writing Assist</span>
                <h4 className="text-base font-black mt-1 leading-snug">Attach a photo souvenir to lock in your memories.</h4>
              </div>
              <button 
                onClick={handleSimulateImageUpload}
                className="w-full py-2 bg-white text-black hover:bg-zinc-100 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg"
              >
                Simulate Photo Upload
              </button>
            </div>

            {/* Favorite Indicator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white">Bookmark Entry</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle favorite status for quick navigation list filtering.</p>
              </div>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-2xl border transition ${isFavorite ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        // ================= DIRECTORY LIST VIEW =================
        <div className="grid grid-cols-12 gap-6">
          
          {/* List Sidebar & Search Filters */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm self-start">
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search keywords or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white dark:text-white placeholder-slate-400 outline-none"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Filter Mood</label>
              <select 
                value={selectedMoodFilter}
                onChange={(e) => setSelectedMoodFilter(e.target.value)}
                className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl px-2.5 py-2 outline-none text-white dark:text-white"
              >
                <option value="all" className="bg-slate-900 text-white">All Moods</option>
                {MOODS.map(m => (
                  <option key={m.label} value={m.label} className="bg-slate-900 text-white">{m.emoji} {m.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Filter Date</label>
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl px-2.5 py-1.5 outline-none text-xs text-white dark:text-white"
                />
              </div>

              <div className="flex items-end mb-1">
                <button 
                  onClick={() => setFavoriteFilter(!favoriteFilter)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${favoriteFilter ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" /> Bookmarks
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Streak</p>
                  <p className="text-sm font-black text-black dark:text-white">{statsSummary.streak}d</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Entries</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{statsSummary.totalEntries}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Bookmarks</p>
                  <p className="text-sm font-black text-amber-500">{statsSummary.favoriteCount}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Main Entries Grid */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Mood Trends Area Chart */}
            {entries.length > 1 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl h-44 flex flex-col justify-between shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <LineChart className="w-4 h-4 text-zinc-500" /> Emotional Wellness Waveform
                </h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodTrendData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis domain={[1, 5]} tick={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="MoodScore" stroke="#71717a" fill="#27272a" fillOpacity={0.15} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* List entries */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Entries logs</h3>
              {filteredEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEntries.map(ent => {
                    const moodStyles = MOODS.find(m => m.label === ent.mood) || MOODS[2];
                    return (
                      <div 
                        key={ent.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 hover:shadow-md transition flex flex-col justify-between space-y-3 cursor-pointer group"
                        onClick={() => handleOpenEntry(ent)}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase flex items-center gap-1 ${moodStyles.color}`}>
                              <span>{moodStyles.emoji}</span> {ent.mood}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {ent.date}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition pt-1">
                            {ent.title}
                          </h4>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {ent.content || <span className="italic text-slate-400">Empty reflection... click to write.</span>}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 dark:border-slate-850">
                          <div className="flex flex-wrap gap-1">
                            {ent.tags.slice(0, 2).map(t => (
                              <span key={t} className="text-[9px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-850 px-1.5 py-0.5 rounded-md">
                                #{t}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {ent.isFavorite && <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />}
                            {ent.images && ent.images.length > 0 && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 font-bold px-1.5 rounded-md">+{ent.images.length} Pic</span>}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 p-10 rounded-3xl text-center space-y-3">
                  <Smile className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching diary entries found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try adjusting your filters, searching for alternate keywords, or check in to write a new reflection.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ================= MOOD CHECK-IN MODAL ================= */}
      {showMoodCheckIn && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-center">
            <h4 className="text-base font-black text-slate-900 dark:text-white">Emotional Mood Check-In</h4>
            <p className="text-xs text-slate-500">How is your focus, motivation, and energy feeling right now, Alex?</p>
            
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {MOODS.map(m => (
                <button 
                  key={m.label}
                  onClick={() => handleMoodConfirm(m.label)}
                  className="p-3 bg-slate-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-slate-150 dark:bg-slate-850 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-2xl flex flex-col items-center space-y-1.5 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">{m.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{m.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowMoodCheckIn(false)}
              className="w-full py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 transition"
            >
              Cancel Check-In
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
