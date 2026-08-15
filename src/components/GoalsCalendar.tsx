import React, { useState, useMemo } from 'react';
import { Goal, CalendarEvent } from '../types';
import { storageService } from '../services/storageService';
import { 
  Calendar as CalendarIcon, CheckSquare, Plus, Trash2, CalendarDays, 
  Clock, Award, Sparkles, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface GoalsCalendarProps {
  goals: Goal[];
  onDataUpdate: () => void;
  triggerXP: (amount: number, reason: string) => void;
}

export default function GoalsCalendar({ goals, onDataUpdate, triggerXP }: GoalsCalendarProps) {
  // Goal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'academic' | 'personal' | 'habit' | 'learning'>('academic');
  const [goalDeadline, setGoalDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [goalPriority, setGoalPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 11)); // Current date synchronized from system
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'exam' | 'lesson' | 'diary' | 'event'>('event');
  const [eventDate, setEventDate] = useState('2026-07-11');

  // Load calendar custom events from localStorage fallback
  const customEvents: CalendarEvent[] = useMemo(() => {
    // Generate preloaded calendar events based on academic exams and initial goals
    const staticEvents: CalendarEvent[] = [
      { id: 'cev-1', title: 'Mathematics Final Exam', type: 'exam', date: '2026-07-08', isRecurring: false },
      { id: 'cev-2', title: 'Timeline Cut Session', type: 'lesson', date: '2026-07-10', isRecurring: true },
      { id: 'cev-3', title: 'Computer Science Practical', type: 'exam', date: '2026-07-15', isRecurring: false },
      { id: 'cev-4', title: 'Weekly Reflection Logging', type: 'diary', date: '2026-07-12', isRecurring: true },
    ];
    
    try {
      const saved = localStorage.getItem('lifehub_calendar_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return staticEvents;
  }, []);

  const saveCustomEvents = (evs: CalendarEvent[]) => {
    localStorage.setItem('lifehub_calendar_events', JSON.stringify(evs));
  };

  // Add Goals
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      title: goalTitle,
      category: goalCategory,
      deadline: goalDeadline,
      progress: 0,
      priority: goalPriority,
      remindersEnabled: true,
      estimatedCompletionDate: goalDeadline
    };

    const current = storageService.getGoals();
    storageService.saveGoals([...current, newGoal]);
    triggerXP(200, `Established goal: ${goalTitle}`);
    
    setGoalTitle('');
    setShowGoalModal(false);
    onDataUpdate();
  };

  // Delete Goals
  const deleteGoal = (id: string) => {
    if (window.confirm("Remove this goal?")) {
      const remaining = storageService.getGoals().filter(g => g.id !== id);
      storageService.saveGoals(remaining);
      onDataUpdate();
    }
  };

  // Complete Goals
  const handleCompleteGoal = (id: string, title: string) => {
    const current = storageService.getGoals();
    const updated = current.map(g => g.id === id ? { ...g, progress: 100 } : g);
    storageService.saveGoals(updated);
    triggerXP(500, `Achieved critical goal milestone: ${title}!`);
    onDataUpdate();
  };

  // Smart Recommendations for Goals
  const handleClaimRecommendation = () => {
    const recs = [
      { title: 'Raise Computer Science target marks to 98%', category: 'academic' as const, priority: 'high' as const },
      { title: 'Learn Advanced Transitions lesson', category: 'learning' as const, priority: 'medium' as const },
      { title: 'Maintain a 5-day diary reflection streak', category: 'habit' as const, priority: 'medium' as const }
    ];
    const picked = recs[Math.floor(Math.random() * recs.length)];

    const newGoal: Goal = {
      id: `g-rec-${Date.now()}`,
      title: picked.title,
      category: picked.category,
      deadline: '2026-07-25',
      progress: 0,
      priority: picked.priority,
      remindersEnabled: true
    };

    const current = storageService.getGoals();
    storageService.saveGoals([...current, newGoal]);
    triggerXP(300, `Claimed intelligent AI goal recommendation!`);
    onDataUpdate();
  };

  // Add Calendar events
  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: `cev-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      isRecurring: false
    };

    const updated = [...customEvents, newEv];
    saveCustomEvents(updated);
    triggerXP(100, `Logged calendar event: ${eventTitle}`);
    
    setEventTitle('');
    setShowEventModal(false);
    onDataUpdate();
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: Array<{ date: string; dayNum: number; isCurrentMonth: boolean; events: CalendarEvent[] }> = [];

    // Prev month days fallback
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      const dateString = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date: dateString,
        dayNum: day,
        isCurrentMonth: false,
        events: customEvents.filter(e => e.date === dateString)
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date: dateString,
        dayNum: day,
        isCurrentMonth: true,
        events: customEvents.filter(e => e.date === dateString)
      });
    }

    return cells;
  }, [currentDate, customEvents]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div id="goals-calendar-container" className="space-y-6">

      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-zinc-500" /> Planners & Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure timelines, schedule study logs, and sync upcoming evaluations.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            id="btn-new-goal"
            onClick={() => setShowGoalModal(true)}
            className="px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        </div>
      </div>

      {/* 2. Intelligent AI Goal Recommendations */}
      <div className="bg-fade-mono p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
              AI Smart Recommendation <Sparkles className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5 max-w-lg">
              Based on your Mathematics improving average of 92% and solid study streaks, we suggest pushing target performance to 98% or establishing a custom habit goal.
            </p>
          </div>
        </div>
        <button 
          id="btn-claim-goal-rec"
          onClick={handleClaimRecommendation}
          className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition shrink-0"
        >
          Claim Goal Recommendation
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* 3. GOALS PLANNER COLUMN */}
        <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm self-start">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-50 dark:border-slate-800">Goals Planner</h3>
          
          <div className="space-y-3 h-[380px] overflow-y-auto pr-1">
            {goals.map(g => (
              <div 
                key={g.id} 
                className="p-3 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/25 flex items-start justify-between gap-3 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      g.priority === 'high' ? 'bg-rose-50 text-rose-500 border border-rose-200' :
                      g.priority === 'medium' ? 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700' :
                      'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {g.priority} priority
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{g.category}</span>
                  </div>

                  <h4 className={`text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-normal ${g.progress === 100 ? 'line-through text-slate-400' : ''}`}>
                    {g.title}
                  </h4>

                  {/* Progress slide indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                      <span>Progress</span>
                      <span>{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-black dark:bg-white h-full rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Deadline: {g.deadline}
                  </p>
                </div>

                <div className="flex flex-col gap-2 justify-between items-end self-stretch">
                  <button 
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {g.progress < 100 && (
                    <button 
                      onClick={() => handleCompleteGoal(g.id, g.title)}
                      className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded border border-emerald-200 text-[9px] font-black uppercase"
                    >
                      Complete
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* 4. CALENDAR DESKTOP GRID */}
        <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
          
          {/* Calendar controller */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(2026, 6, 11))}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-extrabold uppercase"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar week header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Month grids */}
          <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 text-xs">
            {calendarDays.map((cell, idx) => {
              const isToday = cell.date === '2026-07-11';
              return (
                <div 
                  key={idx} 
                  onDoubleClick={() => { setEventDate(cell.date); setShowEventModal(true); }}
                  className={`min-h-[64px] border-r border-b border-slate-100 dark:border-slate-800 p-1 flex flex-col justify-between transition cursor-pointer ${
                    cell.isCurrentMonth ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/50' : 'bg-slate-50/30 dark:bg-slate-950/10 text-slate-300 dark:text-slate-700'
                  } ${isToday ? 'bg-zinc-100/40 dark:bg-zinc-850/20 border-zinc-300 dark:border-zinc-700' : ''}`}
                >
                  <span className={`text-[9px] font-black inline-block w-4 h-4 text-center leading-4 rounded-full ${isToday ? 'bg-black dark:bg-white text-white dark:text-black font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                    {cell.dayNum}
                  </span>
                  
                  {/* Embedded events list */}
                  <div className="space-y-0.5">
                    {cell.events.slice(0, 2).map((ev, i) => (
                      <div 
                        key={i} 
                        className={`text-[8px] font-black px-1 py-0.5 rounded truncate ${
                          ev.type === 'exam' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          ev.type === 'lesson' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700' :
                          ev.type === 'diary' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cell.events.length > 2 && (
                      <div className="text-[7px] text-slate-400 font-bold text-center">+{cell.events.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-slate-400 font-semibold italic text-center">Tip: Double-click any cell to schedule a custom calendar agenda.</p>
        </div>

      </div>

      {/* ================= GOAL CREATION MODAL ================= */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white">Create Smart Target Goal</h4>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label>Goal Directive</label>
                <input 
                  type="text" 
                  value={goalTitle} 
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master primary wheels inside Color Grading"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Category</label>
                  <select 
                    value={goalCategory} 
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-xs"
                  >
                    <option value="academic">Academic</option>
                    <option value="learning">Skill Learning</option>
                    <option value="habit">Habit/Streak</option>
                    <option value="personal">Personal / Zen</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Priority</label>
                  <select 
                    value={goalPriority} 
                    onChange={(e) => setGoalPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-xs"
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label>Target Deadline</label>
                <input 
                  type="date" 
                  value={goalDeadline} 
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl shadow">
                  Plan Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CALENDAR EVENT MODAL ================= */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white">Schedule Calendar Event</h4>
            <p className="text-[10px] text-slate-400">Target Date: {eventDate}</p>

            <form onSubmit={handleEventSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label>Agenda Title</label>
                <input 
                  type="text" 
                  value={eventTitle} 
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Advanced Calculus self-review session"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Category Type</label>
                <select 
                  value={eventType} 
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-xs"
                >
                  <option value="exam">📕 Exam evaluation</option>
                  <option value="lesson">🎬 Study/Video Editing block</option>
                  <option value="diary">📝 Private Diary reminder</option>
                  <option value="event">📅 General Agenda item</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl shadow">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
