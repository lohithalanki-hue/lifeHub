import React, { useState, useMemo } from 'react';
import { Subject, Exam, JEEWeeklyExam, JEEAcademicGoal } from '../types';
import { storageService } from '../services/storageService';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, AreaChart, Area, ReferenceLine
} from 'recharts';
import { 
  Plus, Edit3, Trash2, Calendar, Award, CheckCircle, AlertCircle, 
  Sparkles, BookOpen, ChevronRight, BarChart3, Target, TrendingUp, 
  TrendingDown, Minus, Flame, Compass, ArrowUpRight, ArrowDownRight, 
  Filter, Search, RefreshCw, Trophy, ShieldCheck, Zap, FileText,
  Sliders, Eye, Check, X, Share2, HelpCircle, ChevronDown, Layers
} from 'lucide-react';

interface AcademicsProps {
  subjects?: Subject[];
  exams?: Exam[];
  onDataUpdate?: () => void;
  triggerXP?: (amount: number, reason: string) => void;
}

export default function Academics({ onDataUpdate, triggerXP }: AcademicsProps) {
  // 1. State
  const [exams, setExams] = useState<JEEWeeklyExam[]>(() => storageService.getJEEExams());
  const [goals, setGoals] = useState<JEEAcademicGoal>(() => storageService.getJEEGoals());
  
  // Modals & UI States
  const [showExamModal, setShowExamModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedExamDetail, setSelectedExamDetail] = useState<JEEWeeklyExam | null>(null);
  const [editingExam, setEditingExam] = useState<JEEWeeklyExam | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'total' | 'subjects' | 'ranks' | 'percentage' | 'radar'>('total');

  // Filter & Search in History
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'rank-asc' | 'maths-desc' | 'physics-desc' | 'chem-desc'>('date-desc');
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<'all' | 'maths' | 'physics' | 'chem'>('all');

  // Form States for Exam Entry / Edit
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMaths, setFormMaths] = useState('80');
  const [formMathsMax, setFormMathsMax] = useState('100');
  const [formMathsRank, setFormMathsRank] = useState('40');
  const [formPhysics, setFormPhysics] = useState('75');
  const [formPhysicsMax, setFormPhysicsMax] = useState('100');
  const [formPhysicsRank, setFormPhysicsRank] = useState('50');
  const [formChem, setFormChem] = useState('75');
  const [formChemMax, setFormChemMax] = useState('100');
  const [formChemRank, setFormChemRank] = useState('45');
  const [formRank, setFormRank] = useState('42');
  const [formNotes, setFormNotes] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Moderate' | 'Challenging' | 'Tough'>('Moderate');

  // Form States for Target Goals
  const [goalTotal, setGoalTotal] = useState(goals.targetTotalMarks.toString());
  const [goalMaths, setGoalMaths] = useState(goals.targetMaths.toString());
  const [goalPhysics, setGoalPhysics] = useState(goals.targetPhysics.toString());
  const [goalChem, setGoalChem] = useState(goals.targetChemistry.toString());
  const [goalRank, setGoalRank] = useState(goals.targetRank.toString());
  const [goalMathsRank, setGoalMathsRank] = useState(goals.targetMathsRank ? goals.targetMathsRank.toString() : '25');
  const [goalPhysicsRank, setGoalPhysicsRank] = useState(goals.targetPhysicsRank ? goals.targetPhysicsRank.toString() : '35');
  const [goalChemRank, setGoalChemRank] = useState(goals.targetChemistryRank ? goals.targetChemistryRank.toString() : '35');
  const [goalPercentage, setGoalPercentage] = useState(goals.targetPercentage.toString());

  // Calculated Real-Time Sum in Form
  const currentMaths = Number(formMaths) || 0;
  const currentPhys = Number(formPhysics) || 0;
  const currentChem = Number(formChem) || 0;
  const currentTotalCalculated = currentMaths + currentPhys + currentChem;

  const currentMathsMax = Number(formMathsMax) || 100;
  const currentPhysMax = Number(formPhysicsMax) || 100;
  const currentChemMax = Number(formChemMax) || 100;
  const currentTotalMaxCalculated = currentMathsMax + currentPhysMax + currentChemMax;
  
  const currentPercentageCalculated = currentTotalMaxCalculated > 0 
    ? ((currentTotalCalculated / currentTotalMaxCalculated) * 100).toFixed(1) 
    : '0.0';

  // Chronologically sorted exams
  const chronoExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  const latestExam = chronoExams.length > 0 ? chronoExams[chronoExams.length - 1] : null;
  const previousExam = chronoExams.length > 1 ? chronoExams[chronoExams.length - 2] : null;

  // Comprehensive Analytics Engine
  const analytics = useMemo(() => {
    if (chronoExams.length === 0) return null;
    const count = chronoExams.length;

    const calculateSubjectMetrics = (
      name: string,
      getScore: (e: JEEWeeklyExam) => number,
      getMax: (e: JEEWeeklyExam) => number,
      getRank: (e: JEEWeeklyExam) => number | undefined,
      color: string
    ) => {
      const scores = chronoExams.map(getScore);
      const maxes = chronoExams.map(getMax);
      const percentages = chronoExams.map((e) => (getScore(e) / getMax(e)) * 100);
      const subjectRanks = chronoExams.map(getRank).filter((r): r is number => typeof r === 'number' && r > 0);

      const latestScore = scores[count - 1];
      const latestMax = maxes[count - 1];
      const latestPct = percentages[count - 1];
      const latestSubRank = getRank(chronoExams[count - 1]);

      const prevScore = count > 1 ? scores[count - 2] : latestScore;
      const prevSubRank = count > 1 ? getRank(chronoExams[count - 2]) : latestSubRank;
      const deltaFromPrev = latestScore - prevScore;
      const rankDelta = (prevSubRank !== undefined && latestSubRank !== undefined) ? prevSubRank - latestSubRank : 0;

      const last4 = scores.slice(Math.max(0, count - 4));
      const deltaLast4 = last4.length > 1 ? last4[last4.length - 1] - last4[0] : deltaFromPrev;

      const avgScore = scores.reduce((a, b) => a + b, 0) / count;
      const avgPct = percentages.reduce((a, b) => a + b, 0) / count;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const highestPct = Math.max(...percentages);
      const lowestPct = Math.min(...percentages);
      const bestSubjectRank = subjectRanks.length > 0 ? Math.min(...subjectRanks) : undefined;

      let stdDev = 0;
      if (percentages.length > 1) {
        const mean = avgPct;
        const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / count;
        stdDev = Math.sqrt(variance);
      }
      const consistencyScore = Math.max(10, Math.min(100, Math.round(100 - (stdDev * 2.2))));

      let trend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
      if (percentages.length >= 2) {
        const half = Math.floor(percentages.length / 2);
        const firstHalfAvg = percentages.slice(0, Math.max(1, half)).reduce((a, b) => a + b, 0) / Math.max(1, half);
        const secondHalfAvg = percentages.slice(half).reduce((a, b) => a + b, 0) / (percentages.length - half);
        const diff = secondHalfAvg - firstHalfAvg;
        if (diff > 2.5) trend = 'Improving';
        else if (diff < -2.5) trend = 'Declining';
      }

      return {
        name,
        color,
        latestScore,
        latestMax,
        latestPct,
        latestSubRank,
        prevScore,
        deltaFromPrev,
        rankDelta,
        bestSubjectRank,
        deltaLast4,
        avgScore,
        avgPct,
        highestScore,
        lowestScore,
        highestPct,
        lowestPct,
        consistencyScore,
        trend
      };
    };

    const maths = calculateSubjectMetrics('Mathematics', e => e.mathsMarks, e => e.mathsMaxMarks, e => e.mathsRank, '#6366f1');
    const physics = calculateSubjectMetrics('Physics', e => e.physicsMarks, e => e.physicsMaxMarks, e => e.physicsRank, '#a855f7');
    const chem = calculateSubjectMetrics('Chemistry', e => e.chemMarks, e => e.chemMaxMarks, e => e.chemRank, '#10b981');

    const totalScores = chronoExams.map(e => e.totalMarks);
    const totalMaxes = chronoExams.map(e => e.totalMaxMarks);
    const overallPercentages = chronoExams.map(e => (e.totalMarks / e.totalMaxMarks) * 100);
    const ranks = chronoExams.map(e => e.rank);

    const latestTotal = totalScores[count - 1];
    const latestTotalMax = totalMaxes[count - 1];
    const latestPercentage = overallPercentages[count - 1];
    const prevTotal = count > 1 ? totalScores[count - 2] : latestTotal;
    const deltaTotal = latestTotal - prevTotal;

    const avgTotal = totalScores.reduce((a, b) => a + b, 0) / count;
    const avgPercentage = overallPercentages.reduce((a, b) => a + b, 0) / count;

    let overallTrend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
    if (overallPercentages.length >= 2) {
      const half = Math.floor(overallPercentages.length / 2);
      const firstAvg = overallPercentages.slice(0, Math.max(1, half)).reduce((a, b) => a + b, 0) / Math.max(1, half);
      const secAvg = overallPercentages.slice(half).reduce((a, b) => a + b, 0) / (overallPercentages.length - half);
      if (secAvg - firstAvg > 2) overallTrend = 'Improving';
      else if (secAvg - firstAvg < -2) overallTrend = 'Declining';
    }

    const latestRank = ranks[count - 1];
    const prevRank = count > 1 ? ranks[count - 2] : latestRank;
    const rankDelta = prevRank - latestRank;
    const bestRank = Math.min(...ranks);
    const worstRank = Math.max(...ranks);
    const avgRank = Math.round(ranks.reduce((a, b) => a + b, 0) / count);

    const subjectList = [maths, physics, chem];
    const strongestSubject = [...subjectList].sort((a, b) => b.latestPct - a.latestPct)[0];
    const weakestSubject = [...subjectList].sort((a, b) => a.latestPct - b.latestPct)[0];
    const mostImprovedSubject = [...subjectList].sort((a, b) => b.deltaFromPrev - a.deltaFromPrev)[0];
    const mostConsistentSubject = [...subjectList].sort((a, b) => b.consistencyScore - a.consistencyScore)[0];
    const attentionSubject = subjectList.find(s => s.trend === 'Declining') || weakestSubject;

    const personalBests = {
      highestTotal: Math.max(...totalScores),
      highestMaths: Math.max(...chronoExams.map(e => e.mathsMarks)),
      highestPhysics: Math.max(...chronoExams.map(e => e.physicsMarks)),
      highestChem: Math.max(...chronoExams.map(e => e.chemMarks)),
      bestOverallRank: Math.min(...ranks),
      bestMathsRank: maths.bestSubjectRank || Math.min(...chronoExams.map(e => e.mathsRank || 999)),
      bestPhysicsRank: physics.bestSubjectRank || Math.min(...chronoExams.map(e => e.physicsRank || 999)),
      bestChemRank: chem.bestSubjectRank || Math.min(...chronoExams.map(e => e.chemRank || 999)),
      highestPercentage: Math.max(...overallPercentages).toFixed(1),
      biggestScoreJump: Math.max(0, ...chronoExams.map((e, idx) => idx > 0 ? e.totalMarks - chronoExams[idx - 1].totalMarks : 0)),
      biggestRankJump: Math.max(0, ...chronoExams.map((e, idx) => idx > 0 ? chronoExams[idx - 1].rank - e.rank : 0)),
      testsCount: count
    };

    return {
      maths,
      physics,
      chem,
      overall: {
        latestTotal,
        latestTotalMax,
        latestPercentage,
        prevTotal,
        deltaTotal,
        avgTotal: Math.round(avgTotal),
        avgPercentage: avgPercentage.toFixed(1),
        overallTrend,
        totalImprovementSinceStart: latestTotal - totalScores[0],
        latestRank,
        prevRank,
        rankDelta,
        bestRank,
        worstRank,
        avgRank
      },
      insights: {
        strongestSubject,
        weakestSubject,
        mostImprovedSubject,
        mostConsistentSubject,
        attentionSubject
      },
      personalBests
    };
  }, [chronoExams]);

  // Chart Data Preparation (Scores, PCM lines, Subject & Overall Ranks, Percentages)
  const chartData = useMemo(() => {
    return chronoExams.map((exam, index) => {
      const pct = ((exam.totalMarks / exam.totalMaxMarks) * 100).toFixed(1);
      return {
        name: `T${index + 1}`,
        fullName: exam.name,
        date: exam.date,
        Total: exam.totalMarks,
        TargetTotal: goals.targetTotalMarks,
        Mathematics: exam.mathsMarks,
        Physics: exam.physicsMarks,
        Chemistry: exam.chemMarks,
        MathsRank: exam.mathsRank || exam.rank,
        PhysicsRank: exam.physicsRank || exam.rank,
        ChemRank: exam.chemRank || exam.rank,
        OverallRank: exam.rank,
        Percentage: parseFloat(pct),
        TargetPercentage: goals.targetPercentage
      };
    });
  }, [chronoExams, goals]);

  // Radar Comparison Data
  const radarData = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        attribute: 'Latest %',
        Mathematics: Math.round(analytics.maths.latestPct),
        Physics: Math.round(analytics.physics.latestPct),
        Chemistry: Math.round(analytics.chem.latestPct),
      },
      {
        attribute: 'Average %',
        Mathematics: Math.round(analytics.maths.avgPct),
        Physics: Math.round(analytics.physics.avgPct),
        Chemistry: Math.round(analytics.chem.avgPct),
      },
      {
        attribute: 'Consistency',
        Mathematics: analytics.maths.consistencyScore,
        Physics: analytics.physics.consistencyScore,
        Chemistry: analytics.chem.consistencyScore,
      },
      {
        attribute: 'Best %',
        Mathematics: Math.round(analytics.maths.highestPct),
        Physics: Math.round(analytics.physics.highestPct),
        Chemistry: Math.round(analytics.chem.highestPct),
      },
      {
        attribute: 'Target Align',
        Mathematics: Math.min(100, Math.round((analytics.maths.latestScore / goals.targetMaths) * 100)),
        Physics: Math.min(100, Math.round((analytics.physics.latestScore / goals.targetPhysics) * 100)),
        Chemistry: Math.min(100, Math.round((analytics.chem.latestScore / goals.targetChemistry) * 100)),
      }
    ];
  }, [analytics, goals]);

  // Filtered & Sorted History
  const filteredExams = useMemo(() => {
    let result = [...exams];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        e.date.includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'score-desc') return b.totalMarks - a.totalMarks;
      if (sortBy === 'score-asc') return a.totalMarks - b.totalMarks;
      if (sortBy === 'rank-asc') return a.rank - b.rank;
      if (sortBy === 'maths-desc') return b.mathsMarks - a.mathsMarks;
      if (sortBy === 'physics-desc') return b.physicsMarks - a.physicsMarks;
      if (sortBy === 'chem-desc') return b.chemMarks - a.chemMarks;
      return 0;
    });

    return result;
  }, [exams, searchQuery, sortBy]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingExam(null);
    setFormName(`Weekly Test ${exams.length + 1} — PCM Test`);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMaths('82');
    setFormMathsMax('100');
    setFormMathsRank('35');
    setFormPhysics('78');
    setFormPhysicsMax('100');
    setFormPhysicsRank('48');
    setFormChem('76');
    setFormChemMax('100');
    setFormChemRank('52');
    setFormRank('40');
    setFormNotes('');
    setFormDifficulty('Moderate');
    setShowExamModal(true);
  };

  const handleOpenEditModal = (exam: JEEWeeklyExam) => {
    setEditingExam(exam);
    setFormName(exam.name);
    setFormDate(exam.date);
    setFormMaths(exam.mathsMarks.toString());
    setFormMathsMax(exam.mathsMaxMarks.toString());
    setFormMathsRank(exam.mathsRank ? exam.mathsRank.toString() : '');
    setFormPhysics(exam.physicsMarks.toString());
    setFormPhysicsMax(exam.physicsMaxMarks.toString());
    setFormPhysicsRank(exam.physicsRank ? exam.physicsRank.toString() : '');
    setFormChem(exam.chemMarks.toString());
    setFormChemMax(exam.chemMaxMarks.toString());
    setFormChemRank(exam.chemRank ? exam.chemRank.toString() : '');
    setFormRank(exam.rank.toString());
    setFormNotes(exam.notes || '');
    setFormDifficulty(exam.difficulty || 'Moderate');
    setShowExamModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();

    const mMarks = Number(formMaths) || 0;
    const mMax = Number(formMathsMax) || 100;
    const mRank = formMathsRank ? Number(formMathsRank) : undefined;
    const pMarks = Number(formPhysics) || 0;
    const pMax = Number(formPhysicsMax) || 100;
    const pRank = formPhysicsRank ? Number(formPhysicsRank) : undefined;
    const cMarks = Number(formChem) || 0;
    const cMax = Number(formChemMax) || 100;
    const cRank = formChemRank ? Number(formChemRank) : undefined;

    const total = mMarks + pMarks + cMarks;
    const totalMax = mMax + pMax + cMax;
    const pct = totalMax > 0 ? parseFloat(((total / totalMax) * 100).toFixed(1)) : 0;
    const rank = Number(formRank) || 1;

    if (editingExam) {
      const updated: JEEWeeklyExam = {
        ...editingExam,
        name: formName || `Weekly Test ${editingExam.weekNumber || 1}`,
        date: formDate,
        mathsMarks: mMarks,
        mathsMaxMarks: mMax,
        mathsRank: mRank,
        physicsMarks: pMarks,
        physicsMaxMarks: pMax,
        physicsRank: pRank,
        chemMarks: cMarks,
        chemMaxMarks: cMax,
        chemRank: cRank,
        totalMarks: total,
        totalMaxMarks: totalMax,
        percentage: pct,
        rank,
        notes: formNotes,
        difficulty: formDifficulty
      };
      storageService.updateJEEExam(editingExam.id, updated);
      setExams(storageService.getJEEExams());
      if (triggerXP) triggerXP(200, 'Updated Weekly JEE Test Record');
    } else {
      const newExam: Omit<JEEWeeklyExam, 'id'> = {
        name: formName || `Weekly Test ${exams.length + 1}`,
        weekNumber: exams.length + 1,
        date: formDate,
        mathsMarks: mMarks,
        mathsMaxMarks: mMax,
        mathsRank: mRank,
        physicsMarks: pMarks,
        physicsMaxMarks: pMax,
        physicsRank: pRank,
        chemMarks: cMarks,
        chemMaxMarks: cMax,
        chemRank: cRank,
        totalMarks: total,
        totalMaxMarks: totalMax,
        percentage: pct,
        rank,
        notes: formNotes,
        difficulty: formDifficulty
      };
      const created = storageService.addJEEExam(newExam);
      setExams(storageService.getJEEExams());
      if (triggerXP) triggerXP(500, 'Logged New JEE Weekly Test Results');
      setSelectedExamDetail(created);
    }

    setShowExamModal(false);
    if (onDataUpdate) onDataUpdate();
  };

  const handleDeleteExam = (id: string) => {
    storageService.deleteJEEExam(id);
    setExams(storageService.getJEEExams());
    setDeleteConfirmId(null);
    if (selectedExamDetail?.id === id) setSelectedExamDetail(null);
    if (onDataUpdate) onDataUpdate();
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedGoals: JEEAcademicGoal = {
      targetTotalMarks: Number(goalTotal) || 260,
      targetMaths: Number(goalMaths) || 90,
      targetPhysics: Number(goalPhysics) || 85,
      targetChemistry: Number(goalChem) || 85,
      targetRank: Number(goalRank) || 30,
      targetMathsRank: goalMathsRank ? Number(goalMathsRank) : 25,
      targetPhysicsRank: goalPhysicsRank ? Number(goalPhysicsRank) : 35,
      targetChemistryRank: goalChemRank ? Number(goalChemRank) : 35,
      targetPercentage: Number(goalPercentage) || 86.6,
      targetExamName: 'JEE Advanced / Weekly Benchmark'
    };
    storageService.saveJEEGoals(updatedGoals);
    setGoals(updatedGoals);
    setShowGoalsModal(false);
    if (triggerXP) triggerXP(150, 'Updated JEE Target Benchmarks');
  };

  const renderTrendBadge = (trend: 'Improving' | 'Stable' | 'Declining') => {
    if (trend === 'Improving') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <TrendingUp className="w-3 h-3" /> Improving
        </span>
      );
    }
    if (trend === 'Declining') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <TrendingDown className="w-3 h-3" /> Declining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
        <Minus className="w-3 h-3" /> Stable
      </span>
    );
  };

  return (
    <div id="academics-jee-portal" className="space-y-6 pb-12 animate-fade-in">

      {/* =========================================================================
          1. TOP EXECUTIVE TELEMETRY HEADER (Overview & Quick Actions)
          ========================================================================= */}
      <div id="jee-top-dashboard" className="glass-card-primary p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/15 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full glass-pill text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                JEE Weekly Academic Portal
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {latestExam ? `Latest: ${latestExam.name}` : 'No test records'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Performance Terminal</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl">
              Real-time competitive exam analytics, independent subject breakdown (PCM) with individual subject ranks & overall trajectory.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-add-weekly-exam"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-100 transition shadow-lg active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Weekly Test</span>
            </button>

            <button
              id="btn-set-jee-goals"
              onClick={() => setShowGoalsModal(true)}
              className="px-3.5 py-2.5 rounded-2xl glass-card-nested text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-white/15 transition active:scale-95 shrink-0"
            >
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Target Goals</span>
            </button>

            {latestExam && (
              <button
                id="btn-open-report-card"
                onClick={() => setShowReportModal(true)}
                className="px-3.5 py-2.5 rounded-2xl glass-card-nested text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-white/15 transition active:scale-95 shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Weekly Report</span>
              </button>
            )}
          </div>
        </div>

        {/* 7 Core Telemetry Cards in Top Matrix */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
            
            {/* 1. TOTAL SCORE */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Total Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{analytics.overall.latestTotal}</span>
                <span className="text-[10px] text-zinc-400 font-mono">/{analytics.overall.latestTotalMax}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {analytics.overall.deltaTotal >= 0 ? (
                  <span className="text-emerald-400">+{analytics.overall.deltaTotal} marks</span>
                ) : (
                  <span className="text-rose-400">{analytics.overall.deltaTotal} marks</span>
                )}
              </div>
            </div>

            {/* 2. OVERALL RANK */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
              <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">Overall Rank</span>
              <div className="text-xl font-black text-purple-400 font-mono">
                #{analytics.overall.latestRank}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {analytics.overall.rankDelta > 0 ? (
                  <span className="text-emerald-400">+{analytics.overall.rankDelta} pos jump</span>
                ) : analytics.overall.rankDelta < 0 ? (
                  <span className="text-rose-400">{analytics.overall.rankDelta} pos</span>
                ) : (
                  <span className="text-zinc-400">Stable</span>
                )}
              </div>
            </div>

            {/* 3. PERCENTAGE */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Percentage</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {analytics.overall.latestPercentage.toFixed(1)}%
              </div>
              <div className="text-[10px] text-zinc-400 font-bold">
                Avg: {analytics.overall.avgPercentage}%
              </div>
            </div>

            {/* 4. MATHEMATICS (Score & Rank) */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1 border-l-2 border-indigo-500">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Maths</span>
                {analytics.maths.latestSubRank && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Rank #{analytics.maths.latestSubRank}
                  </span>
                )}
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {analytics.maths.latestScore}<span className="text-[10px] text-zinc-400">/{analytics.maths.latestMax}</span>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">
                {analytics.maths.deltaFromPrev >= 0 ? `+${analytics.maths.deltaFromPrev}` : analytics.maths.deltaFromPrev} vs last
              </div>
            </div>

            {/* 5. PHYSICS (Score & Rank) */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1 border-l-2 border-purple-500">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider">Physics</span>
                {analytics.physics.latestSubRank && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Rank #{analytics.physics.latestSubRank}
                  </span>
                )}
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {analytics.physics.latestScore}<span className="text-[10px] text-zinc-400">/{analytics.physics.latestMax}</span>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">
                {analytics.physics.deltaFromPrev >= 0 ? `+${analytics.physics.deltaFromPrev}` : analytics.physics.deltaFromPrev} vs last
              </div>
            </div>

            {/* 6. CHEMISTRY (Score & Rank) */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1 border-l-2 border-emerald-500">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Chemistry</span>
                {analytics.chem.latestSubRank && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Rank #{analytics.chem.latestSubRank}
                  </span>
                )}
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {analytics.chem.latestScore}<span className="text-[10px] text-zinc-400">/{analytics.chem.latestMax}</span>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">
                {analytics.chem.deltaFromPrev >= 0 ? `+${analytics.chem.deltaFromPrev}` : analytics.chem.deltaFromPrev} vs last
              </div>
            </div>

            {/* 7. OVERALL TRAJECTORY */}
            <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Trajectory</span>
              <div className="pt-0.5">
                {renderTrendBadge(analytics.overall.overallTrend)}
              </div>
              <div className="text-[10px] font-bold text-emerald-400">
                +{analytics.overall.totalImprovementSinceStart} pts since T1
              </div>
            </div>

          </div>
        )}
      </div>

      {/* =========================================================================
          2. PERFORMANCE VISUALIZATION TERMINAL — PLACED ON TOP!
          (Total Score, PCM Lines, Subject Ranks & Overall Rank, Percentage, Radar)
          ========================================================================= */}
      <div id="jee-charts-top-container" className="glass-card p-6 rounded-3xl space-y-6">
        
        {/* Chart Header & Tab Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Visual Analytics Stream</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Performance, PCM Trajectory & Rank Progressions</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 glass-card-nested p-1 rounded-2xl flex-wrap text-xs font-bold">
            <button
              onClick={() => setActiveChartTab('total')}
              className={`px-3 py-1.5 rounded-xl transition ${activeChartTab === 'total' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Total Score Trend
            </button>
            <button
              onClick={() => setActiveChartTab('subjects')}
              className={`px-3 py-1.5 rounded-xl transition ${activeChartTab === 'subjects' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              PCM Subject Scores
            </button>
            <button
              onClick={() => setActiveChartTab('ranks')}
              className={`px-3 py-1.5 rounded-xl transition ${activeChartTab === 'ranks' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Subject & Overall Ranks
            </button>
            <button
              onClick={() => setActiveChartTab('percentage')}
              className={`px-3 py-1.5 rounded-xl transition ${activeChartTab === 'percentage' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Percentage Curve
            </button>
            <button
              onClick={() => setActiveChartTab('radar')}
              className={`px-3 py-1.5 rounded-xl transition ${activeChartTab === 'radar' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              Subject Radar Matrix
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <BookOpen className="w-8 h-8 mb-2 opacity-50 text-indigo-400" />
              <p className="text-sm font-bold">No test data recorded yet</p>
              <p className="text-xs">Click "Add Weekly Test" above to log your first JEE weekly exam score.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'total' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <YAxis domain={[100, 300]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <ReferenceLine y={goals.targetTotalMarks} label={{ value: `Target: ${goals.targetTotalMarks}`, fill: '#10b981', fontSize: 10 }} stroke="#10b981" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#totalScoreGrad)" name="Total Score (/300)" />
                </AreaChart>
              ) : activeChartTab === 'subjects' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <YAxis domain={[40, 100]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Mathematics" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Maths Marks" />
                  <Line type="monotone" dataKey="Physics" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Physics Marks" />
                  <Line type="monotone" dataKey="Chemistry" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Chemistry Marks" />
                </LineChart>
              ) : activeChartTab === 'ranks' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  {/* Invert Y Axis so Rank 1 is on TOP */}
                  <YAxis 
                    reversed 
                    domain={[1, 180]} 
                    stroke="#71717a" 
                    tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                    label={{ value: 'Rank (Lower is Better ↗)', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [`Rank #${value}`, name]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <ReferenceLine y={goals.targetRank} label={{ value: `Target: <${goals.targetRank}`, fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="OverallRank" stroke="#ffffff" strokeWidth={3} dot={{ r: 5, fill: '#ffffff' }} activeDot={{ r: 7 }} name="Overall Rank" />
                  <Line type="monotone" dataKey="MathsRank" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3.5, fill: '#6366f1' }} name="Maths Rank" />
                  <Line type="monotone" dataKey="PhysicsRank" stroke="#a855f7" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3.5, fill: '#a855f7' }} name="Physics Rank" />
                  <Line type="monotone" dataKey="ChemRank" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3.5, fill: '#10b981' }} name="Chem Rank" />
                </LineChart>
              ) : activeChartTab === 'percentage' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <YAxis domain={[50, 100]} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Percentage" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#pctGrad)" name="Accuracy %" />
                </AreaChart>
              ) : (
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="attribute" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.15)" tick={{ fill: '#71717a', fontSize: 9 }} />
                  <Radar name="Mathematics" dataKey="Mathematics" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Radar name="Physics" dataKey="Physics" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Radar name="Chemistry" dataKey="Chemistry" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 12, 20, 0.95)', 
                      borderColor: 'rgba(255,255,255,0.15)', 
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                </RadarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. CORE SUBJECT BREAKDOWN CARDS (Placed on BOTTOM below graphs!)
          (Mathematics, Physics, Chemistry Cards with Marks, Ranks & Consistency)
          ========================================================================= */}
      {analytics && (
        <div id="jee-subject-cards-container" className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Individual PCM Breakdown</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Subject Detail & Rank Analysis</h3>
            </div>

            <div className="flex items-center gap-1.5 glass-card-nested p-1 rounded-2xl text-xs font-bold self-start">
              <button
                onClick={() => setSelectedSubjectTab('all')}
                className={`px-3 py-1 rounded-xl transition ${selectedSubjectTab === 'all' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setSelectedSubjectTab('maths')}
                className={`px-3 py-1 rounded-xl transition ${selectedSubjectTab === 'maths' ? 'bg-indigo-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                Maths
              </button>
              <button
                onClick={() => setSelectedSubjectTab('physics')}
                className={`px-3 py-1 rounded-xl transition ${selectedSubjectTab === 'physics' ? 'bg-purple-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                Physics
              </button>
              <button
                onClick={() => setSelectedSubjectTab('chem')}
                className={`px-3 py-1 rounded-xl transition ${selectedSubjectTab === 'chem' ? 'bg-emerald-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
              >
                Chemistry
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. MATHEMATICS CARD */}
            {(selectedSubjectTab === 'all' || selectedSubjectTab === 'maths') && (
              <div className="glass-card p-6 rounded-3xl space-y-5 flex flex-col justify-between border-t-2 border-indigo-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Calculus & Algebra</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      Mathematics
                    </h4>
                  </div>
                  {renderTrendBadge(analytics.maths.trend)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Latest Score</span>
                    <span className="text-base font-black text-white font-mono">{analytics.maths.latestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">/{analytics.maths.latestMax}</span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-indigo-400 uppercase font-bold block">Subject Rank</span>
                    <span className="text-base font-black text-indigo-400 font-mono">
                      {analytics.maths.latestSubRank ? `#${analytics.maths.latestSubRank}` : '—'}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">
                      {analytics.maths.rankDelta > 0 ? `+${analytics.maths.rankDelta} jump` : 'Latest'}
                    </span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Best / Peak</span>
                    <span className="text-base font-black text-white font-mono">{analytics.maths.highestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">Rank #{analytics.maths.bestSubjectRank || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Average Score:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.round(analytics.maths.avgScore)}/100 ({analytics.maths.avgPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Score vs Last Test:</span>
                    <span className={`font-mono font-bold ${analytics.maths.deltaFromPrev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analytics.maths.deltaFromPrev >= 0 ? `+${analytics.maths.deltaFromPrev}` : analytics.maths.deltaFromPrev} marks
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Consistency Score:</span>
                    <span className="font-mono font-bold text-indigo-400">{analytics.maths.consistencyScore}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-400">Target Benchmark:</span>
                    <span className="font-mono font-bold text-white">
                      {goals.targetMaths}/100 {goals.targetMathsRank ? `(Rank <${goals.targetMathsRank})` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span>Target Progress</span>
                    <span>{analytics.maths.latestScore} / {goals.targetMaths}</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (analytics.maths.latestScore / goals.targetMaths) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PHYSICS CARD */}
            {(selectedSubjectTab === 'all' || selectedSubjectTab === 'physics') && (
              <div className="glass-card p-6 rounded-3xl space-y-5 flex flex-col justify-between border-t-2 border-purple-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">Mechanics & Electromagnetism</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Physics
                    </h4>
                  </div>
                  {renderTrendBadge(analytics.physics.trend)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Latest Score</span>
                    <span className="text-base font-black text-white font-mono">{analytics.physics.latestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">/{analytics.physics.latestMax}</span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-purple-400 uppercase font-bold block">Subject Rank</span>
                    <span className="text-base font-black text-purple-400 font-mono">
                      {analytics.physics.latestSubRank ? `#${analytics.physics.latestSubRank}` : '—'}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">
                      {analytics.physics.rankDelta > 0 ? `+${analytics.physics.rankDelta} jump` : 'Latest'}
                    </span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Best / Peak</span>
                    <span className="text-base font-black text-white font-mono">{analytics.physics.highestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">Rank #{analytics.physics.bestSubjectRank || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Average Score:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.round(analytics.physics.avgScore)}/100 ({analytics.physics.avgPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Score vs Last Test:</span>
                    <span className={`font-mono font-bold ${analytics.physics.deltaFromPrev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analytics.physics.deltaFromPrev >= 0 ? `+${analytics.physics.deltaFromPrev}` : analytics.physics.deltaFromPrev} marks
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Consistency Score:</span>
                    <span className="font-mono font-bold text-purple-400">{analytics.physics.consistencyScore}% (Peak)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-400">Target Benchmark:</span>
                    <span className="font-mono font-bold text-white">
                      {goals.targetPhysics}/100 {goals.targetPhysicsRank ? `(Rank <${goals.targetPhysicsRank})` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span>Target Progress</span>
                    <span>{analytics.physics.latestScore} / {goals.targetPhysics}</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-purple-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (analytics.physics.latestScore / goals.targetPhysics) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CHEMISTRY CARD */}
            {(selectedSubjectTab === 'all' || selectedSubjectTab === 'chem') && (
              <div className="glass-card p-6 rounded-3xl space-y-5 flex flex-col justify-between border-t-2 border-emerald-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Organic & Inorganic</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Chemistry
                    </h4>
                  </div>
                  {renderTrendBadge(analytics.chem.trend)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Latest Score</span>
                    <span className="text-base font-black text-white font-mono">{analytics.chem.latestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">/{analytics.chem.latestMax}</span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-emerald-400 uppercase font-bold block">Subject Rank</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {analytics.chem.latestSubRank ? `#${analytics.chem.latestSubRank}` : '—'}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">
                      {analytics.chem.rankDelta > 0 ? `+${analytics.chem.rankDelta} jump` : 'Latest'}
                    </span>
                  </div>
                  <div className="glass-card-nested p-2.5 rounded-2xl">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block">Best / Peak</span>
                    <span className="text-base font-black text-white font-mono">{analytics.chem.highestScore}</span>
                    <span className="text-[9px] text-zinc-400 block">Rank #{analytics.chem.bestSubjectRank || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Average Score:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.round(analytics.chem.avgScore)}/100 ({analytics.chem.avgPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Score vs Last Test:</span>
                    <span className={`font-mono font-bold ${analytics.chem.deltaFromPrev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {analytics.chem.deltaFromPrev >= 0 ? `+${analytics.chem.deltaFromPrev}` : analytics.chem.deltaFromPrev} marks
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Consistency Score:</span>
                    <span className="font-mono font-bold text-emerald-400">{analytics.chem.consistencyScore}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-400">Target Benchmark:</span>
                    <span className="font-mono font-bold text-white">
                      {goals.targetChemistry}/100 {goals.targetChemistryRank ? `(Rank <${goals.targetChemistryRank})` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span>Target Progress</span>
                    <span>{analytics.chem.latestScore} / {goals.targetChemistry}</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (analytics.chem.latestScore / goals.targetChemistry) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          4. AI ACADEMIC DIAGNOSTICS & STRENGTHS MATRIX CARDS
          ========================================================================= */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: AI Performance Analysis Feed */}
          <div className="lg:col-span-7 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Academic Diagnostics</h3>
                  <span className="text-[10px] text-zinc-400">Data-driven performance insights from test history</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full glass-card-nested text-zinc-300">
                {analytics.personalBests.testsCount} Tests Analyzed
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-2xl glass-card-nested flex items-start gap-3 border-l-2 border-indigo-500">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Strongest Subject: {analytics.insights.strongestSubject.name} ({analytics.insights.strongestSubject.latestScore}/{analytics.insights.strongestSubject.latestMax})
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {analytics.insights.strongestSubject.name} is currently your highest scoring domain ({analytics.insights.strongestSubject.latestPct.toFixed(1)}% accuracy). Maintain solving speed and solve 5 Advanced level problems daily.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card-nested flex items-start gap-3 border-l-2 border-emerald-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Most Consistent Subject: {analytics.insights.mostConsistentSubject.name} ({analytics.insights.mostConsistentSubject.consistencyScore}% stability)
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Minimal score fluctuation detected in {analytics.insights.mostConsistentSubject.name}. Your foundational grasp in this domain provides a rock-solid buffer against difficult exam papers.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card-nested flex items-start gap-3 border-l-2 border-amber-500">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Attention Focus: {analytics.insights.attentionSubject.name} (Delta: {analytics.insights.attentionSubject.deltaFromPrev >= 0 ? `+${analytics.insights.attentionSubject.deltaFromPrev}` : analytics.insights.attentionSubject.deltaFromPrev})
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Allocate 45 minutes of evening revision to formula derivations and question drill-downs in {analytics.insights.attentionSubject.name} to accelerate overall rank to &lt;{goals.targetRank}.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Weekly trajectory rating:</span>
              </span>
              <span className="font-bold text-emerald-400">High Competitive Momentum ↗</span>
            </div>
          </div>

          {/* Right: Target Goals & Benchmarks Progress */}
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Target Benchmarks</h3>
                  <span className="text-[10px] text-zinc-400">Target goals for next milestone</span>
                </div>
              </div>
              <button 
                onClick={() => setShowGoalsModal(true)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-3">
              {/* Total Score Goal */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-zinc-300">Total Score Goal</span>
                  <span className="text-white">{analytics.overall.latestTotal} / {goals.targetTotalMarks}</span>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (analytics.overall.latestTotal / goals.targetTotalMarks) * 100)}%` }} 
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block text-right font-mono">
                  {Math.max(0, goals.targetTotalMarks - analytics.overall.latestTotal)} marks to target
                </span>
              </div>

              {/* Overall Rank Goal */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-zinc-300">Target Rank Standing</span>
                  <span className="text-purple-400">Current: #{analytics.overall.latestRank} | Target: &lt;#{goals.targetRank}</span>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(10, ((150 - analytics.overall.latestRank) / (150 - goals.targetRank)) * 100))}%` }} 
                  />
                </div>
              </div>

              {/* Subject Targets Summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div className="p-2 rounded-xl glass-card-nested">
                  <span className="text-[9px] text-indigo-400 uppercase font-bold block">Maths Target</span>
                  <span className="text-xs font-mono font-bold text-white">{goals.targetMaths} / 100</span>
                  {goals.targetMathsRank && <span className="text-[9px] text-zinc-400 block font-mono">Rank &lt;{goals.targetMathsRank}</span>}
                </div>
                <div className="p-2 rounded-xl glass-card-nested">
                  <span className="text-[9px] text-purple-400 uppercase font-bold block">Phys Target</span>
                  <span className="text-xs font-mono font-bold text-white">{goals.targetPhysics} / 100</span>
                  {goals.targetPhysicsRank && <span className="text-[9px] text-zinc-400 block font-mono">Rank &lt;{goals.targetPhysicsRank}</span>}
                </div>
                <div className="p-2 rounded-xl glass-card-nested">
                  <span className="text-[9px] text-emerald-400 uppercase font-bold block">Chem Target</span>
                  <span className="text-xs font-mono font-bold text-white">{goals.targetChemistry} / 100</span>
                  {goals.targetChemistryRank && <span className="text-[9px] text-zinc-400 block font-mono">Rank &lt;{goals.targetChemistryRank}</span>}
                </div>
              </div>

            </div>

            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Target Benchmark: <strong>{goals.targetPercentage}% Accuracy</strong> for Tier 1 Rank.</span>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          5. PERSONAL RECORDS / HALL OF FAME
          ========================================================================= */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          
          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Peak Total Score</span>
            <div className="text-lg font-black text-white font-mono">{analytics.personalBests.highestTotal}</div>
            <span className="text-[9px] text-zinc-400 block">Personal Record</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">Best Overall Rank</span>
            <div className="text-lg font-black text-purple-400 font-mono">#{analytics.personalBests.bestOverallRank}</div>
            <span className="text-[9px] text-zinc-400 block">Top Tier</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Best Maths</span>
            <div className="text-lg font-black text-indigo-400 font-mono">{analytics.personalBests.highestMaths}/100</div>
            <span className="text-[9px] text-zinc-400 block">Rank #{analytics.personalBests.bestMathsRank}</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">Best Physics</span>
            <div className="text-lg font-black text-purple-400 font-mono">{analytics.personalBests.highestPhysics}/100</div>
            <span className="text-[9px] text-zinc-400 block">Rank #{analytics.personalBests.bestPhysicsRank}</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Best Chemistry</span>
            <div className="text-lg font-black text-emerald-400 font-mono">{analytics.personalBests.highestChem}/100</div>
            <span className="text-[9px] text-zinc-400 block">Rank #{analytics.personalBests.bestChemRank}</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider block">Max Percentage</span>
            <div className="text-lg font-black text-amber-400 font-mono">{analytics.personalBests.highestPercentage}%</div>
            <span className="text-[9px] text-zinc-400 block">Peak Attempt</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Biggest Rank Jump</span>
            <div className="text-lg font-black text-emerald-400 font-mono">+{analytics.personalBests.biggestRankJump} pos</div>
            <span className="text-[9px] text-zinc-400 block">Single Test Gain</span>
          </div>

          <div className="glass-card-nested p-3.5 rounded-2xl space-y-1">
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Total Tests Taken</span>
            <div className="text-lg font-black text-white font-mono">{analytics.personalBests.testsCount}</div>
            <span className="text-[9px] text-emerald-400 font-bold block">100% On-Track</span>
          </div>

        </div>
      )}

      {/* =========================================================================
          6. HISTORICAL WEEKLY TEST REGISTRY
          ========================================================================= */}
      <div className="glass-card p-6 rounded-3xl space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Historical Records</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Weekly Test Registry</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full glass-card-nested text-zinc-400">
                {filteredExams.length} Recorded
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-48"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 glass-card-nested px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-zinc-900 text-white">Date (Newest)</option>
                <option value="date-asc" className="bg-zinc-900 text-white">Date (Oldest)</option>
                <option value="score-desc" className="bg-zinc-900 text-white">Total Score (High → Low)</option>
                <option value="score-asc" className="bg-zinc-900 text-white">Total Score (Low → High)</option>
                <option value="rank-asc" className="bg-zinc-900 text-white">Rank (Best #1 First)</option>
                <option value="maths-desc" className="bg-zinc-900 text-white">Mathematics (Highest)</option>
                <option value="physics-desc" className="bg-zinc-900 text-white">Physics (Highest)</option>
                <option value="chem-desc" className="bg-zinc-900 text-white">Chemistry (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-3 px-3">Week / Test Name</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-center">Maths (Marks & Rank)</th>
                <th className="py-3 px-3 text-center">Physics (Marks & Rank)</th>
                <th className="py-3 px-3 text-center">Chemistry (Marks & Rank)</th>
                <th className="py-3 px-3 text-center">Total Score</th>
                <th className="py-3 px-3 text-center">Percentage</th>
                <th className="py-3 px-3 text-center">Overall Rank</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExams.map((exam) => (
                <tr 
                  key={exam.id}
                  className="hover:bg-white/5 transition group cursor-pointer"
                  onClick={() => setSelectedExamDetail(exam)}
                >
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{exam.name}</span>
                    {exam.difficulty && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 font-normal">
                        {exam.difficulty}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-zinc-400 font-mono">
                    {exam.date}
                  </td>

                  {/* Maths */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-bold text-indigo-400">{exam.mathsMarks}</span>
                    <span className="text-[10px] text-zinc-500">/{exam.mathsMaxMarks}</span>
                    {exam.mathsRank && (
                      <span className="block text-[9px] text-indigo-300 font-sans font-bold">
                        Rank #{exam.mathsRank}
                      </span>
                    )}
                  </td>

                  {/* Physics */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-bold text-purple-400">{exam.physicsMarks}</span>
                    <span className="text-[10px] text-zinc-500">/{exam.physicsMaxMarks}</span>
                    {exam.physicsRank && (
                      <span className="block text-[9px] text-purple-300 font-sans font-bold">
                        Rank #{exam.physicsRank}
                      </span>
                    )}
                  </td>

                  {/* Chemistry */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="font-bold text-emerald-400">{exam.chemMarks}</span>
                    <span className="text-[10px] text-zinc-500">/{exam.chemMaxMarks}</span>
                    {exam.chemRank && (
                      <span className="block text-[9px] text-emerald-300 font-sans font-bold">
                        Rank #{exam.chemRank}
                      </span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 text-center font-mono font-black text-white">
                    {exam.totalMarks}<span className="text-[10px] text-zinc-500">/{exam.totalMaxMarks}</span>
                  </td>

                  {/* Percentage */}
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                    {exam.percentage.toFixed(1)}%
                  </td>

                  {/* Rank */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-black px-2 py-0.5 rounded-full glass-pill text-white">
                      #{exam.rank}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                        title="Edit Exam Result"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === exam.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 bg-zinc-800 text-zinc-300 rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(exam.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
                          title="Delete Exam Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================================================
          MODAL 1: ADD / EDIT WEEKLY EXAM RESULT
          (With Maths Rank, Physics Rank, Chem Rank, and NO candidate count)
          ========================================================================= */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-modal w-full max-w-xl p-6 rounded-3xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Competitive Exam Entry</span>
                <h3 className="text-lg font-black text-white">
                  {editingExam ? 'Edit Weekly Exam Result' : 'Log New Weekly Test'}
                </h3>
              </div>
              <button 
                onClick={() => setShowExamModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              
              {/* Exam Name & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Exam Name / Week</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Weekly Test 9 — Complex Numbers"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Test Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* 3 Core Subjects: Marks & Subject Ranks */}
              <div className="p-4 rounded-2xl glass-card-nested space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Subject Scores & Ranks (PCM)</span>
                
                {/* Mathematics */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-3 text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Maths:
                  </span>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      min="0"
                      max="200"
                      value={formMaths}
                      onChange={(e) => setFormMaths(e.target.value)}
                      placeholder="Marks"
                      className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white text-center font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-[11px] text-zinc-400">
                    <span>/</span>
                    <input
                      type="number"
                      required
                      min="10"
                      value={formMathsMax}
                      onChange={(e) => setFormMathsMax(e.target.value)}
                      className="w-14 px-1.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-zinc-400 text-center font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={formMathsRank}
                      onChange={(e) => setFormMathsRank(e.target.value)}
                      placeholder="Maths Rank #"
                      className="w-full px-2 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 text-center font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Physics */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-3 text-xs font-bold text-purple-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Physics:
                  </span>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      min="0"
                      max="200"
                      value={formPhysics}
                      onChange={(e) => setFormPhysics(e.target.value)}
                      placeholder="Marks"
                      className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white text-center font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-[11px] text-zinc-400">
                    <span>/</span>
                    <input
                      type="number"
                      required
                      min="10"
                      value={formPhysicsMax}
                      onChange={(e) => setFormPhysicsMax(e.target.value)}
                      className="w-14 px-1.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-zinc-400 text-center font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={formPhysicsRank}
                      onChange={(e) => setFormPhysicsRank(e.target.value)}
                      placeholder="Physics Rank #"
                      className="w-full px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-300 text-center font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-3 text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Chem:
                  </span>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      min="0"
                      max="200"
                      value={formChem}
                      onChange={(e) => setFormChem(e.target.value)}
                      placeholder="Marks"
                      className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white text-center font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-[11px] text-zinc-400">
                    <span>/</span>
                    <input
                      type="number"
                      required
                      min="10"
                      value={formChemMax}
                      onChange={(e) => setFormChemMax(e.target.value)}
                      className="w-14 px-1.5 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-zinc-400 text-center font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={formChemRank}
                      onChange={(e) => setFormChemRank(e.target.value)}
                      placeholder="Chem Rank #"
                      className="w-full px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 text-center font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Auto calculated total preview */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-zinc-400">Auto Calculated Total:</span>
                  <span className="text-indigo-400">
                    {currentTotalCalculated} / {currentTotalMaxCalculated} ({currentPercentageCalculated}%)
                  </span>
                </div>
              </div>

              {/* Overall Rank & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Overall Test Rank (Lower is Better)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formRank}
                    onChange={(e) => setFormRank(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Difficulty Rating</label>
                  <select
                    value={formDifficulty}
                    onChange={(e: any) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Tough">Tough</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Test Reflections / Bottlenecks</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Key observations (e.g. Time management was tight in Mechanics numericals...)"
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 rounded-xl glass-card-nested text-xs text-zinc-300 font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-100 transition shadow-lg"
                >
                  {editingExam ? 'Save Changes' : 'Record Test Result'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: TARGET BENCHMARKS & GOALS SETTING
          ========================================================================= */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-modal w-full max-w-md p-6 rounded-3xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Preparation Benchmarks</span>
                <h3 className="text-lg font-black text-white">Set Target Academic Goals</h3>
              </div>
              <button 
                onClick={() => setShowGoalsModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Target Total Score (out of 300)</label>
                <input
                  type="number"
                  required
                  min="50"
                  max="300"
                  value={goalTotal}
                  onChange={(e) => setGoalTotal(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-indigo-400 uppercase">Maths Target</label>
                  <input
                    type="number"
                    value={goalMaths}
                    onChange={(e) => setGoalMaths(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-purple-400 uppercase">Physics Target</label>
                  <input
                    type="number"
                    value={goalPhysics}
                    onChange={(e) => setGoalPhysics(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-emerald-400 uppercase">Chem Target</label>
                  <input
                    type="number"
                    value={goalChem}
                    onChange={(e) => setGoalChem(e.target.value)}
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Target Overall Rank</label>
                  <input
                    type="number"
                    min="1"
                    value={goalRank}
                    onChange={(e) => setGoalRank(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Target Accuracy %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalPercentage}
                    onChange={(e) => setGoalPercentage(e.target.value)}
                    placeholder="e.g. 86.6"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-indigo-400 uppercase">Maths Rank Goal</label>
                  <input
                    type="number"
                    value={goalMathsRank}
                    onChange={(e) => setGoalMathsRank(e.target.value)}
                    placeholder="<25"
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-purple-400 uppercase">Phys Rank Goal</label>
                  <input
                    type="number"
                    value={goalPhysicsRank}
                    onChange={(e) => setGoalPhysicsRank(e.target.value)}
                    placeholder="<35"
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-emerald-400 uppercase">Chem Rank Goal</label>
                  <input
                    type="number"
                    value={goalChemRank}
                    onChange={(e) => setGoalChemRank(e.target.value)}
                    placeholder="<35"
                    className="w-full px-2 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 rounded-xl glass-card-nested text-xs text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-100 transition shadow"
                >
                  Save Targets
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: WEEKLY REPORT CARD
          ========================================================================= */}
      {showReportModal && latestExam && analytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-modal w-full max-w-lg p-6 rounded-3xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider block">Official Briefing</span>
                <h3 className="text-lg font-black text-white">{latestExam.name} Report</h3>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300">
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="glass-card-nested p-3 rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Total Score</span>
                  <span className="text-lg font-black text-white font-mono">{latestExam.totalMarks}/{latestExam.totalMaxMarks}</span>
                </div>
                <div className="glass-card-nested p-3 rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Overall Rank</span>
                  <span className="text-lg font-black text-purple-400 font-mono">#{latestExam.rank}</span>
                </div>
                <div className="glass-card-nested p-3 rounded-2xl">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Percentage</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{latestExam.percentage}%</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="p-3.5 rounded-2xl glass-card-nested space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subject Breakdown & Ranks</span>
                <div className="flex justify-between items-center py-1 border-b border-white/5 font-mono">
                  <span className="text-indigo-400 font-bold">Mathematics</span>
                  <span className="text-white font-bold">
                    {latestExam.mathsMarks} / {latestExam.mathsMaxMarks} {latestExam.mathsRank ? `(Rank #${latestExam.mathsRank})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5 font-mono">
                  <span className="text-purple-400 font-bold">Physics</span>
                  <span className="text-white font-bold">
                    {latestExam.physicsMarks} / {latestExam.physicsMaxMarks} {latestExam.physicsRank ? `(Rank #${latestExam.physicsRank})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 font-mono">
                  <span className="text-emerald-400 font-bold">Chemistry</span>
                  <span className="text-white font-bold">
                    {latestExam.chemMarks} / {latestExam.chemMaxMarks} {latestExam.chemRank ? `(Rank #${latestExam.chemRank})` : ''}
                  </span>
                </div>
              </div>

              {/* Key Observations */}
              <div className="p-3.5 rounded-2xl glass-card-nested space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Data-Driven Summary</span>
                <p className="leading-relaxed text-zinc-300">
                  You scored <strong>{latestExam.totalMarks} marks ({latestExam.percentage}%)</strong>, securing overall rank <strong>#{latestExam.rank}</strong>. Highest marks recorded in <strong>{analytics.insights.strongestSubject.name}</strong>.
                </p>
                {latestExam.notes && (
                  <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-white/5">
                    "{latestExam.notes}"
                  </p>
                )}
              </div>

            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: DETAILED EXAM VIEW
          ========================================================================= */}
      {selectedExamDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-modal w-full max-w-lg p-6 rounded-3xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Exam Analysis</span>
                <h3 className="text-lg font-black text-white">{selectedExamDetail.name}</h3>
                <span className="text-xs font-mono text-zinc-400">{selectedExamDetail.date}</span>
              </div>
              <button 
                onClick={() => setSelectedExamDetail(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="glass-card-nested p-3 rounded-2xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">Total Score</span>
                <span className="text-xl font-black text-white font-mono">{selectedExamDetail.totalMarks}</span>
                <span className="text-[9px] text-zinc-400 block">/{selectedExamDetail.totalMaxMarks}</span>
              </div>
              <div className="glass-card-nested p-3 rounded-2xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">Overall Rank</span>
                <span className="text-xl font-black text-purple-400 font-mono">#{selectedExamDetail.rank}</span>
                <span className="text-[9px] text-zinc-400 block">Standing</span>
              </div>
              <div className="glass-card-nested p-3 rounded-2xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block">Percentage</span>
                <span className="text-xl font-black text-amber-400 font-mono">{selectedExamDetail.percentage}%</span>
                <span className="text-[9px] text-zinc-400 block">Accuracy</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card-nested space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subject Level Performance & Ranks</span>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold">Mathematics</span>
                  <span className="text-white">
                    {selectedExamDetail.mathsMarks} / {selectedExamDetail.mathsMaxMarks} {selectedExamDetail.mathsRank ? `(Rank #${selectedExamDetail.mathsRank})` : ''}
                  </span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(selectedExamDetail.mathsMarks / selectedExamDetail.mathsMaxMarks) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold">Physics</span>
                  <span className="text-white">
                    {selectedExamDetail.physicsMarks} / {selectedExamDetail.physicsMaxMarks} {selectedExamDetail.physicsRank ? `(Rank #${selectedExamDetail.physicsRank})` : ''}
                  </span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(selectedExamDetail.physicsMarks / selectedExamDetail.physicsMaxMarks) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">Chemistry</span>
                  <span className="text-white">
                    {selectedExamDetail.chemMarks} / {selectedExamDetail.chemMaxMarks} {selectedExamDetail.chemRank ? `(Rank #${selectedExamDetail.chemRank})` : ''}
                  </span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(selectedExamDetail.chemMarks / selectedExamDetail.chemMaxMarks) * 100}%` }} />
                </div>
              </div>
            </div>

            {selectedExamDetail.notes && (
              <div className="p-3.5 rounded-2xl glass-card-nested space-y-1 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Notes & Reflections</span>
                <p className="text-zinc-300 italic">"{selectedExamDetail.notes}"</p>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedExamDetail(null);
                  handleOpenEditModal(selectedExamDetail);
                }}
                className="px-3.5 py-1.5 rounded-xl glass-card-nested text-xs font-bold text-zinc-300 hover:text-white"
              >
                Edit Exam
              </button>
              <button
                onClick={() => setSelectedExamDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
