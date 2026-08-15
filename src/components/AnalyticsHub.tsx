import React, { useMemo } from 'react';
import { Subject, Exam, DiaryEntry, Goal, LessonProgress } from '../types';
import { storageService } from '../services/storageService';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';
import { 
  BarChart3, TrendingUp, Calendar, Smile, ShieldAlert, Sparkles, 
  Clock, Award, ThumbsUp, Activity, Compass, Bookmark 
} from 'lucide-react';

interface AnalyticsHubProps {
  subjects: Subject[];
  exams: Exam[];
  entries: DiaryEntry[];
  goals: Goal[];
  progress: LessonProgress[];
}

export default function AnalyticsHub({ subjects, exams, entries, goals, progress }: AnalyticsHubProps) {
  
  // Aggregate stats using useMemo
  const stats = useMemo(() => {
    const totalExams = exams.length;
    const totalDiaryEntries = entries.length;
    const totalGoals = goals.length;
    
    // 1. Averages
    const activeExams = exams.filter(e => e.totalMarks > 0);
    const overallAvg = activeExams.length > 0
      ? activeExams.reduce((sum, e) => sum + (e.marks / e.totalMarks) * 100, 0) / activeExams.length
      : 0;

    // 2. Goal completion
    const completedGoals = goals.filter(g => g.progress === 100).length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // 3. Lessons completion
    const completedLessons = progress.filter(p => p.completed).length;

    // 4. Subject Comparison Bar Chart Data
    const barData = subjects.map(sub => {
      const subExams = exams.filter(e => e.subjectId === sub.id);
      const avg = subExams.length > 0
        ? subExams.reduce((sum, e) => sum + (e.marks/e.totalMarks)*100, 0) / subExams.length
        : 0;
      return {
        name: sub.name,
        Average: Math.round(avg),
        TargetRank: sub.targetRank
      };
    });

    // 5. Emotional Mood score history mapping (Area Chart)
    const moodMap: Record<string, number> = { 'Great': 5, 'Good': 4, 'Neutral': 3, 'Tired': 2.5, 'Anxious': 2, 'Stressed': 1.5, 'Down': 1 };
    const moodHistoryData = [...entries].reverse().map(e => ({
      date: e.date,
      MoodScore: moodMap[e.mood] || 3,
      Mood: e.mood
    }));

    // 6. Habit consistency score calculation (out of 100)
    // Formula: blend of study streak + diary entries frequency + goal compliance
    const studyStreak = 14; // Default preloaded
    const diaryFrequency = Math.min(100, (totalDiaryEntries * 15));
    const goalScore = goalCompletionRate;
    const habitConsistency = Math.round((studyStreak * 2.5) + (diaryFrequency * 0.4) + (goalScore * 0.35));

    // 7. PREDICTIVE ANALYTICS ENGINE
    // Let's inspect the math trends slope of last 4 exams to predict future final GPA
    let predictedGPA = Math.round(overallAvg);
    let slopeState: 'improving' | 'stable' | 'declining' = 'stable';
    if (activeExams.length > 2) {
      const percentages = activeExams.map(e => (e.marks/e.totalMarks)*100);
      const count = percentages.length;
      const lastHalf = percentages.slice(Math.floor(count/2));
      const firstHalf = percentages.slice(0, Math.floor(count/2));
      const lastAvg = lastHalf.reduce((a,b) => a+b, 0) / lastHalf.length;
      const firstAvg = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length;
      const diff = lastAvg - firstAvg;

      predictedGPA = Math.round(Math.max(50, Math.min(100, overallAvg + (diff * 0.4))));
      if (diff > 2) slopeState = 'improving';
      else if (diff < -2) slopeState = 'declining';
    }

    return {
      overallAvg: Math.round(overallAvg),
      totalExams,
      totalDiaryEntries,
      goalCompletionRate,
      completedLessons,
      barData,
      moodHistoryData,
      habitConsistency: Math.min(100, habitConsistency),
      predictedGPA,
      slopeState
    };
  }, [subjects, exams, entries, goals, progress]);

  return (
    <div id="analytics-hub-container" className="space-y-6">

      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Executive Analytics Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated lifecycle metrics, habit consistencies, emotional trends, and future performance forecast diagnostics.
          </p>
        </div>
      </div>

      {/* 2. Executive Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-500" /> Academic GPA Average
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.overallAvg}%</span>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">Top Tier</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Habit Consistency
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.habitConsistency}% Score
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-500" /> Goals Success
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.goalCompletionRate}% Met
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-500" /> Lessons study blocks
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.completedLessons} Cleared
          </p>
        </div>

      </div>

      {/* 3. Dynamic Charts Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Recharts ComposedChart comparing actual averages vs target ranks */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col h-80 shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Subject Averages & Target Ranks
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.barData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" domain={[1, 15]} reversed tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="Average" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="TargetRank" name="Target Rank" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts AreaChart mapping Mood history over time */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col h-80 shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1">
            <Smile className="w-4 h-4 text-emerald-500" /> Mood Waveform Mapping
          </h3>
          <div className="flex-1 min-h-0">
            {stats.moodHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.moodHistoryData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis domain={[1, 5]} tick={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="MoodScore" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-20 text-slate-400 text-xs">Register your first private diary mood check-in to build historical waves.</p>
            )}
          </div>
        </div>

      </div>

      {/* 4. PREDICTIVE ANALYTICS DIAGNOSTIC CARD */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🔮</span>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Predictive GPA & Habit Forecast</span>
          </div>

          <h4 className="text-base font-black">
            Forecasted Final Score Average: <span className="text-indigo-400 font-extrabold text-lg">{stats.predictedGPA}%</span>
          </h4>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            By analyzing your scores trajectory slopes, your current momentum suggests a final index of {stats.predictedGPA}%. Your habit consistency score is currently <strong>{stats.habitConsistency}%</strong>. 
            {stats.slopeState === 'improving' ? " Outstanding! Your performance shows positive upward acceleration." :
             stats.slopeState === 'declining' ? " Heads up! Recent averages have shown minor decline. We advise utilizing Pomodoro techniques in focus areas." :
             " Excellent consistency. Your scores are stable and pacing predictably toward targets."}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700/50 p-4 rounded-2xl shrink-0 text-center space-y-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Growth Trend</p>
          <p className={`text-base font-black ${stats.slopeState === 'improving' ? 'text-emerald-400' : stats.slopeState === 'declining' ? 'text-rose-400' : 'text-indigo-400'}`}>
            {stats.slopeState === 'improving' ? '🚀 POSITIVE ACCELERATION' : stats.slopeState === 'declining' ? '⚠️ ADVISE CONSOLIDATION' : '⚡ HIGHLY STABLE'}
          </p>
        </div>

      </div>

    </div>
  );
}
