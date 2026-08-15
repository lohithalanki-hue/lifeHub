import React, { useState, useMemo } from 'react';
import { Lesson, LessonProgress } from '../types';
import { storageService } from '../services/storageService';
import { 
  Film, Video, Award, Clock, ArrowRight, CheckCircle, Bookmark, 
  Download, Plus, Edit3, CheckCircle2, ChevronRight, Lock, Play, 
  HelpCircle, AlertCircle, FileText 
} from 'lucide-react';

interface SkillMasteryProps {
  progress: LessonProgress[];
  onDataUpdate: () => void;
  triggerXP: (amount: number, reason: string) => void;
}

export default function SkillMastery({ progress, onDataUpdate, triggerXP }: SkillMasteryProps) {
  const lessons = storageService.getLessons();

  // Navigation tab states
  const [activeTier, setActiveTier] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'>('Beginner');
  const [activeLessonId, setActiveLessonId] = useState<string | null>('les-1');

  // Quiz interactive state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResultsCorrect, setQuizResultsCorrect] = useState<boolean | null>(null);

  // Lesson workspace details state
  const [lessonNotes, setLessonNotes] = useState<string>('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // 1. STATS MEMOS
  const stats = useMemo(() => {
    const totalCount = lessons.length;
    const completedList = progress.filter(p => p.completed).map(p => p.lessonId);
    const completedCount = completedList.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Calculate total hours (simulation based on 1.5h per completed lesson + studied metrics)
    const hoursStudied = 12 + (completedCount * 1.5);
    const remainingTime = Math.max(0, (totalCount - completedCount) * 1.5);

    // Recommend Next Lesson automatically
    let recommendedNext: Lesson | null = null;
    for (const les of lessons) {
      if (!completedList.includes(les.id)) {
        recommendedNext = les;
        break;
      }
    }

    return {
      totalCount,
      completedCount,
      completionPercent,
      hoursStudied: hoursStudied.toFixed(1),
      remainingTime: remainingTime.toFixed(1),
      recommendedNext,
      completedList
    };
  }, [lessons, progress]);

  // Load lesson details
  const activeLesson = useMemo(() => {
    const les = lessons.find(l => l.id === activeLessonId);
    if (les) {
      // Find matching notes
      const prog = progress.find(p => p.lessonId === les.id);
      setLessonNotes(prog ? prog.notes : '');
      // Reset quiz
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
      setQuizResultsCorrect(null);
    }
    return les;
  }, [activeLessonId, lessons]);

  // Mark Lesson Completion
  const toggleLessonComplete = (lessonId: string, title: string) => {
    const currentProg = [...progress];
    const matchIdx = currentProg.findIndex(p => p.lessonId === lessonId);

    let nextCompletedState = true;
    if (matchIdx >= 0) {
      nextCompletedState = !currentProg[matchIdx].completed;
      currentProg[matchIdx] = {
        ...currentProg[matchIdx],
        completed: nextCompletedState,
        completedAt: nextCompletedState ? new Date().toISOString().split('T')[0] : undefined
      };
    } else {
      currentProg.push({
        lessonId,
        completed: true,
        bookmarked: false,
        notes: '',
        completedAt: new Date().toISOString().split('T')[0]
      });
    }

    storageService.saveLessonProgress(currentProg);
    
    if (nextCompletedState) {
      triggerXP(500, `Completed learning lesson: ${title}!`);
    } else {
      triggerXP(-200, `Reset completion of lesson: ${title}`);
    }

    onDataUpdate();
  };

  // Toggle bookmark lesson
  const toggleBookmarkLesson = (lessonId: string) => {
    const currentProg = [...progress];
    const matchIdx = currentProg.findIndex(p => p.lessonId === lessonId);

    if (matchIdx >= 0) {
      currentProg[matchIdx].bookmarked = !currentProg[matchIdx].bookmarked;
    } else {
      currentProg.push({
        lessonId,
        completed: false,
        bookmarked: true,
        notes: ''
      });
    }

    storageService.saveLessonProgress(currentProg);
    triggerXP(50, `Toggled lesson bookmark`);
    onDataUpdate();
  };

  // Save notes handler
  const handleSaveNotes = () => {
    if (!activeLessonId) return;
    const currentProg = [...progress];
    const matchIdx = currentProg.findIndex(p => p.lessonId === activeLessonId);

    if (matchIdx >= 0) {
      currentProg[matchIdx].notes = lessonNotes;
    } else {
      currentProg.push({
        lessonId: activeLessonId,
        completed: false,
        bookmarked: false,
        notes: lessonNotes
      });
    }

    storageService.saveLessonProgress(currentProg);
    triggerXP(100, `Saved lesson study notes`);
    onDataUpdate();
  };

  // Quiz submission
  const handleQuizSubmit = (correctIdx: number) => {
    if (selectedQuizOption === null || quizSubmitted) return;
    
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === correctIdx;
    setQuizResultsCorrect(isCorrect);

    if (isCorrect) {
      triggerXP(300, `Answered lesson quiz correctly! (+300 XP, +50 Coins)`);
    } else {
      triggerXP(50, `Completed lesson quiz attempt`);
    }
  };

  // Check locks (Beginner tier is unlocked, next tiers need previous tiers completed)
  const isTierLocked = (tier: string) => {
    if (tier === 'Beginner') return false;
    
    const beginnerLessons = lessons.filter(l => l.level === 'Beginner').map(l => l.id);
    const beginnerProgress = progress.filter(p => beginnerLessons.includes(p.lessonId) && p.completed);
    
    if (tier === 'Intermediate') {
      return beginnerProgress.length < beginnerLessons.length;
    }

    const intermediateLessons = lessons.filter(l => l.level === 'Intermediate').map(l => l.id);
    const intermediateProgress = progress.filter(p => intermediateLessons.includes(p.lessonId) && p.completed);

    if (tier === 'Advanced') {
      return beginnerProgress.length < beginnerLessons.length || intermediateProgress.length < intermediateLessons.length;
    }

    return true; // Professional lock simulation
  };

  return (
    <div id="skill-mastery-container" className="space-y-6">

      {/* 1. Module Title Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-zinc-500" /> Skill Mastery: Video Editing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accelerate your professional vertical creator abilities with interactive curricula and certifications.
          </p>
        </div>
        
        {/* Certificate Claim Area */}
        {stats.completionPercent >= 50 && (
          <button 
            id="btn-claim-certificate"
            onClick={() => { setShowCertificateModal(true); triggerXP(500, "Claimed Video Editing Completion Certificate!"); }}
            className="px-4 py-2 bg-gradient-to-tr from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-100 dark:shadow-none animate-bounce"
          >
            Claim Certificate 🎓
          </button>
        )}
      </div>

      {/* 2. Top level Mastery Indices cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Skill Mastery
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.completionPercent}%</span>
            <span className="text-[10px] text-zinc-500 font-bold">Grade: Intermediate</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Hours Studied
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.hoursStudied} Hours
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Video className="w-3.5 h-3.5" /> Lessons Completed
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.completedCount} / {stats.totalCount}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" /> Est. Remaining
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {stats.remainingTime}h Remaining
          </p>
        </div>
      </div>

      {/* Recommended recommendation block */}
      {stats.recommendedNext && (
        <div 
          onClick={() => { setActiveTier(stats.recommendedNext!.level); setActiveLessonId(stats.recommendedNext!.id); }}
          className="bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🎬</span>
            <div>
              <span className="text-[9px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">Next Recommended Lesson</span>
              <h4 className="text-xs font-black text-slate-800 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-350 transition mt-0.5">{stats.recommendedNext.title}</h4>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition" />
        </div>
      )}

      {/* 3. CORE TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Side: Tier Selector and Lessons Checklist */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Tier buttons */}
          <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-150 dark:border-slate-800">
            {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(tier => {
              const locked = isTierLocked(tier);
              return (
                <button 
                  key={tier}
                  onClick={() => { if (!locked) setActiveTier(tier as any); }}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 ${
                    activeTier === tier 
                      ? 'bg-white dark:bg-slate-900 text-black dark:text-white font-black shadow-sm' 
                      : locked 
                        ? 'opacity-40 text-slate-400 cursor-not-allowed' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                  }`}
                  title={locked ? "Unlock previous tiers first" : ""}
                >
                  {locked && <Lock className="w-3 h-3" />} {tier}
                </button>
              );
            })}
          </div>

          {/* Lessons list card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm h-[380px] overflow-y-auto">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">Lessons list</h4>
            
            <div className="space-y-2">
              {lessons.filter(l => l.level === activeTier).map(les => {
                const isCompleted = stats.completedList.includes(les.id);
                const isActive = activeLessonId === les.id;
                const progObj = progress.find(p => p.lessonId === les.id);

                return (
                  <div 
                    key={les.id}
                    onClick={() => setActiveLessonId(les.id)}
                    className={`p-3 border rounded-2xl cursor-pointer transition flex items-start justify-between gap-2 ${
                      isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700' 
                        : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 dark:bg-slate-950/10 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{les.duration} • {les.difficulty}</span>
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug">{les.title}</h5>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0">
                      {progObj?.bookmarked && <Bookmark className="w-3.5 h-3.5 text-zinc-500 fill-current" />}
                      {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Active Lesson workspace */}
        <div className="col-span-12 lg:col-span-8">
          {activeLesson ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm overflow-hidden">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-widest">{activeLesson.level} Path</span>
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">{activeLesson.title}</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleBookmarkLesson(activeLesson.id)}
                    className={`p-2 rounded-xl border transition ${progress.find(p => p.lessonId === activeLesson.id)?.bookmarked ? 'bg-zinc-100 border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => toggleLessonComplete(activeLesson.id, activeLesson.title)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition ${
                      stats.completedList.includes(activeLesson.id) 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-black dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold border border-zinc-900 dark:border-zinc-200 shadow-md'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {stats.completedList.includes(activeLesson.id) ? 'Completed ✓' : 'Mark Completed'}
                  </button>
                </div>
              </div>

              {/* YouTube safe Embed player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner relative flex items-center justify-center">
                <iframe 
                  id={`yt-player-${activeLesson.id}`}
                  className="w-full h-full border-none"
                  src={activeLesson.youtubeUrl}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Description and assignment objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-4 h-4 text-zinc-500" /> Lesson Core Concept
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{activeLesson.description}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-4 h-4 text-emerald-500" /> Homework Assignment
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium italic">{activeLesson.assignment}</p>
                </div>
              </div>

              {/* INTERACTIVE LESSON QUIZ */}
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-zinc-500" /> Interactive Lesson Quiz (+300 XP)
                </h4>
                
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-350 leading-relaxed">{activeLesson.quiz.question}</p>
                
                <div className="space-y-2">
                  {activeLesson.quiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === activeLesson.quiz.correctAnswer;
                    
                    return (
                      <button 
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-bold leading-normal transition border ${
                          quizSubmitted 
                            ? isCorrect 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                              : isSelected 
                                ? 'bg-rose-50 border-rose-300 text-rose-800' 
                                : 'bg-white border-slate-200 text-slate-400 opacity-60'
                            : isSelected 
                              ? 'bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:text-white dark:border-zinc-700' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="font-black mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button 
                    onClick={() => handleQuizSubmit(activeLesson.quiz.correctAnswer)}
                    disabled={selectedQuizOption === null}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="p-3.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700 rounded-xl space-y-1 text-xs">
                    <p className={`font-black uppercase tracking-widest text-[10px] ${quizResultsCorrect ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {quizResultsCorrect ? '✓ Correct Answer!' : '✗ Let\'s review this:'}
                    </p>
                    <p className="text-slate-600 leading-normal">{activeLesson.quiz.explanation}</p>
                  </div>
                )}
              </div>

              {/* PDF downloadable resources & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Simulated Downloads */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">Downloadable Materials</h4>
                  <div className="space-y-2">
                    {activeLesson.resources.map((resName, i) => (
                      <button 
                        key={i}
                        onClick={() => triggerXP(50, `Downloaded file resource: ${resName}`)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-slate-150 dark:border-slate-800 rounded-xl text-left text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-1.5 truncate"><FileText className="w-4 h-4 text-zinc-500" /> {resName}</span>
                        <Download className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Study Notes Textbox */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider block">Study Journal / Notes</h4>
                  <textarea 
                    value={lessonNotes}
                    onChange={(e) => setLessonNotes(e.target.value)}
                    placeholder="Log important shortcuts, coloring matrices, or video timelines benchmarks here..."
                    className="w-full h-24 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-350 rounded-xl outline-none resize-none font-bold"
                  />
                  <button 
                    onClick={handleSaveNotes}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-xl transition"
                  >
                    Save Notes
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <p className="text-center py-20 text-slate-400 text-xs">Select a lesson from the roster list to initiate learning.</p>
          )}
        </div>

      </div>

      {/* ================= CERTIFICATE OF COMPLETION MODAL ================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 w-full max-w-2xl space-y-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400" />
            
            <h3 className="text-xl font-black text-slate-900 mt-2">Professional Skill Certification</h3>
            <p className="text-xs text-slate-500">Alex's official study progress has successfully met all Beginner Video Editing benchmarks.</p>
            
            {/* Elegant Certificate SVG Display */}
            <div className="border-[8px] border-amber-500/30 p-8 rounded-2xl bg-amber-50/10 space-y-4 max-w-lg mx-auto border-double relative">
              <span className="text-4xl absolute right-4 top-4 opacity-40">🎓</span>
              <span className="text-xs uppercase font-extrabold text-amber-600 block tracking-widest">Certificate of Mastery</span>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide">Alex</h4>
              <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-normal">Has successfully cleared all structured evaluations, assignments, and theoretical evaluations in the field of:</p>
              <h5 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Digital Video Editing & Color Grading</h5>
              <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold border-t border-slate-200/50 pt-4 px-4">
                <span>Verification ID: LHVE-4250</span>
                <span>Instructor: LifeHub AI Director</span>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Print Certificate
              </button>
              <button 
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
