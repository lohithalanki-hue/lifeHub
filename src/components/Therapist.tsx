import React, { useState, useEffect, useRef } from 'react';
import { TherapistMessage } from '../types';
import { storageService } from '../services/storageService';
import { 
  Heart, Send, ShieldAlert, Sparkles, RefreshCw, Compass, AlertCircle, 
  HelpCircle, Moon, Activity, ChevronRight, CheckCircle, Info 
} from 'lucide-react';

interface TherapistProps {
  onDataUpdate: () => void;
  triggerXP: (amount: number, reason: string) => void;
}

const COPING_DECK = [
  {
    title: 'De-escalate Exam Anxiety',
    desc: 'When papers loom, anxiety blocks memory. Dethrone the pressure by treating exams as snapshots of current learning, not final measures of your capability.',
    tips: ['Study in Pomodoro segments (25 mins on, 5 mins walk).', 'Log active queries in a notebook to dump stress.', 'Hydrate and maintain a consistent 7-8 hour sleep schedule.']
  },
  {
    title: 'Smash Burnout & Procrastination',
    desc: 'Burnout is chronic energy deficits. Procrastination is a mood-regulation failure, not laziness. Break down massive goals into microscopic elements.',
    tips: ['The 2-Minute Rule: Just commit to editing 1 timeline clip.', 'Unsubscribe from digital fatigue; study with local files.', 'Award micro-rewards (coins) to lock in habits.']
  },
  {
    title: 'Better Sleep Hygiene',
    desc: 'Sleep consolidation transfers temporary memories into long-term structures. Irregular sleep patterns increase vulnerability to stress by 50%.',
    tips: ['Cut screen times 45 minutes before sleep.', 'Maintain a standard wake-up hour (even on weekends).', 'Keep your workspace distinct from your sleep space.']
  }
];

export default function Therapist({ onDataUpdate, triggerXP }: TherapistProps) {
  // Chat History
  const [messages, setMessages] = useState<TherapistMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Breathing Exercise Loop States
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathingCounter, setBreathingCounter] = useState(4);
  
  // Interactive Grounding Prompts
  const [activeGroundingStep, setActiveGroundingStep] = useState(0); // 0 to 5 for 5-4-3-2-1 technique
  const [groundingLogs, setGroundingLogs] = useState<string[]>([]);
  const [groundingInput, setGroundingInput] = useState('');

  // Active Tool Panel
  const [activeTool, setActiveTool] = useState<'chat' | 'breathing' | 'grounding' | 'coping'>('chat');

  // Chat scroll anchor
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat log
  useEffect(() => {
    setMessages(storageService.getTherapistHistory());
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Breathing Loop Controller
  useEffect(() => {
    if (!isBreathingActive) {
      setBreathingStep('idle');
      return;
    }

    setBreathingStep('inhale');
    setBreathingCounter(4);

    const interval = setInterval(() => {
      setBreathingCounter((prev) => {
        if (prev <= 1) {
          // transition step
          setBreathingStep((currentStep) => {
            if (currentStep === 'inhale') {
              triggerXP(20, 'Box Breathing: Completed inhalation phase');
              return 'hold';
            }
            if (currentStep === 'hold') {
              triggerXP(20, 'Box Breathing: Completed retention phase');
              return 'exhale';
            }
            // completed exhale, back to inhale
            triggerXP(30, 'Completed full box breathing cycle!');
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // Handle messages dispatch to /api/chat proxy
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userText = inputText;
    setInputText('');
    setIsGenerating(true);

    const newUserMsg: TherapistMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    storageService.saveTherapistHistory(updatedMessages);

    try {
      // API call to the proxy route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          mood: 'Neutral'
        })
      });

      const data = await response.json();
      
      const therapistMsg: TherapistMessage = {
        id: `msg-${Date.now()}-reply`,
        role: 'model',
        content: data.response || "I am here, and I am listening. Tell me more.",
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...updatedMessages, therapistMsg];
      setMessages(finalHistory);
      storageService.saveTherapistHistory(finalHistory);

      // Reward XP for wellness journaling dialogue
      triggerXP(100, "Conversed with Therapist regarding digital wellness");

    } catch (err) {
      console.error('Therapist API call error:', err);
      
      const errorMsg: TherapistMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        content: "I'm having a brief connection flutter, but I am still with you. Remember: take a long, deep breath. The consistency of your effort is what matters. How does your chest feel right now?",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      onDataUpdate();
    }
  };

  // Grounding Exercise next
  const handleGroundingNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groundingInput.trim()) return;

    const logs = [...groundingLogs, groundingInput];
    setGroundingLogs(logs);
    setGroundingInput('');

    if (activeGroundingStep < 4) {
      setActiveGroundingStep(activeGroundingStep + 1);
    } else {
      // Completed grounding!
      triggerXP(300, 'Completed full 5-4-3-2-1 Grounding cycle!');
      setActiveGroundingStep(5);
    }
  };

  const handleResetGrounding = () => {
    setActiveGroundingStep(0);
    setGroundingLogs([]);
    setGroundingInput('');
  };

  // Quick Therapist prompt button helper
  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    setActiveTool('chat');
  };

  return (
    <div id="therapist-container" className="space-y-6">

      {/* 1. Header and Disclaimers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" /> AI Therapist Companion
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reassuring stress-reduction companion. This system is a supportive journal, not certified medical advice.
          </p>
        </div>
        
        {/* Navigation Tabs inside Module */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button 
            id="tab-therapist-chat"
            onClick={() => setActiveTool('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTool === 'chat' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-250'}`}
          >
            Empathetic Session
          </button>
          <button 
            id="tab-therapist-breathing"
            onClick={() => setActiveTool('breathing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTool === 'breathing' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-250'}`}
          >
            Box Breathing
          </button>
          <button 
            id="tab-therapist-grounding"
            onClick={() => { setActiveTool('grounding'); handleResetGrounding(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTool === 'grounding' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-250'}`}
          >
            5-4-3-2-1 Reset
          </button>
          <button 
            id="tab-therapist-coping"
            onClick={() => setActiveTool('coping')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTool === 'coping' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-250'}`}
          >
            Coping Desks
          </button>
        </div>
      </div>

      {/* Disclaimers Notification */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-3 rounded-2xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-400 font-medium">
        <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block">Emergency Crisis Guardrail</span>
          If you are experiencing a severe mental health crisis, self-harm, or severe emotional distress, please seek immediate help. You can call or text the Suicide & Crisis Lifeline at <strong>988</strong> (US/Canada), or contact your local emergency services instantly. I am a machine, not a doctor.
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* 2. MAIN TOOL PANEL */}
        <div className="col-span-12 lg:col-span-8">

          {/* Tab 1: ACTIVE EMPATHETIC SESSION (Chat workspace) */}
          {activeTool === 'chat' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl flex flex-col h-[400px] shadow-sm overflow-hidden">
              {/* Chat messages stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex ${m.role === 'model' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                      m.role === 'model' 
                        ? 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800' 
                        : 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black shadow-md border border-zinc-700/20'
                    }`}>
                      {m.role === 'model' && (
                        <span className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest block mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Therapist
                        </span>
                      )}
                      <p className="whitespace-pre-line">{m.content}</p>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                      <span>Therapist is absorbing your thoughts...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input typing desk */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="How is your stress level or procrastination feeling today?..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-xs px-4 py-2.5 rounded-2xl outline-none text-white placeholder-slate-400"
                  disabled={isGenerating}
                />
                <button 
                  type="submit" 
                  className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-zinc-850 dark:hover:bg-zinc-100 transition shadow-lg disabled:opacity-45 disabled:cursor-not-allowed"
                  disabled={isGenerating || !inputText.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: INTERACTIVE BOX BREATHING MODULE */}
          {activeTool === 'breathing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-8 shadow-sm h-[400px]">
              
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-800 dark:text-white">Guided Box Breathing</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Box Breathing is an elite nervous system reset used to reduce acute anxiety, stabilize blood pressure, and restore cognitive clarity instantly.
                </p>
              </div>

               {/* Visual expanding bubble */}
              <div className="relative flex items-center justify-center w-48 h-48">
                {/* Outer ripple rings */}
                {isBreathingActive && (
                  <div className={`absolute inset-0 rounded-full bg-zinc-800/10 dark:bg-white/10 blur-xl transition-transform duration-1000 ${
                    breathingStep === 'inhale' ? 'scale-125' :
                    breathingStep === 'hold' ? 'scale-125 opacity-100' :
                    'scale-100'
                  }`} />
                )}

                {/* Breathing ball */}
                <div 
                  className={`w-36 h-36 rounded-full bg-black dark:bg-white text-white dark:text-black flex flex-col items-center justify-center shadow-xl border border-zinc-800 dark:border-zinc-200 transition-all duration-[4000ms] cubic-bezier(0.4, 0, 0.2, 1) ${
                    breathingStep === 'inhale' ? 'scale-[1.3]' :
                    breathingStep === 'hold' ? 'scale-[1.3] brightness-110' :
                    'scale-100'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                    {breathingStep === 'idle' ? 'Ready' : breathingStep}
                  </span>
                  <span className="text-2xl font-black mt-1">
                    {breathingStep === 'idle' ? '🧘' : breathingCounter}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-extrabold text-slate-600 dark:text-slate-350">
                  {breathingStep === 'idle' ? 'Click start to trigger your 4-4-4 breathing loop.' :
                   breathingStep === 'inhale' ? 'Inhale slowly: fill your chest and feel the energy...' :
                   breathingStep === 'hold' ? 'Hold peacefully: settle your heart rate...' :
                   'Exhale fully: release anxiety, study blockages, and fatigue...'}
                </p>
                
                <button 
                  id="btn-breathing-control"
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${isBreathingActive ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-white border border-zinc-700/50 dark:border-zinc-300' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-100 shadow'}`}
                >
                  {isBreathingActive ? 'Stop Breathing Loop' : 'Start Breathing Loop'}
                </button>
              </div>

            </div>
          )}

          {/* Tab 3: 5-4-3-2-1 GROUNDING RESET */}
          {activeTool === 'grounding' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm h-[400px] flex flex-col justify-between">
              
              <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-800 dark:text-white">5-4-3-2-1 Grounding Reset</h3>
                <p className="text-[10px] text-slate-400">Reduce overthinking and escape panic states by anchoring yourself in the physical room.</p>
              </div>

              {activeGroundingStep === 0 && (
                <div className="space-y-4 text-center my-auto">
                  <Compass className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Ready to anchor your mind?</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">We will walk through 5 steps of listing things you see, touch, hear, smell, and taste to immediately halt fight-or-flight loops.</p>
                  <button 
                    id="btn-start-grounding"
                    onClick={() => setActiveGroundingStep(1)}
                    className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-100 border border-zinc-900 dark:border-zinc-200 font-extrabold text-xs rounded-xl transition uppercase tracking-wider shadow"
                  >
                    Begin Grounding
                  </button>
                </div>
              )}

              {activeGroundingStep >= 1 && activeGroundingStep <= 5 && (
                <div className="space-y-4 my-auto">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500">Step {activeGroundingStep} of 5</span>
                    <span className="text-[10px] font-black uppercase text-zinc-800 bg-zinc-100 dark:text-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {activeGroundingStep === 1 ? '5 Visuals' :
                       activeGroundingStep === 2 ? '4 Touches' :
                       activeGroundingStep === 3 ? '3 Sounds' :
                       activeGroundingStep === 4 ? '2 Smells' :
                       '1 Taste'}
                    </span>
                  </div>

                  {activeGroundingStep < 5 ? (
                    <form onSubmit={handleGroundingNext} className="space-y-3">
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                        {activeGroundingStep === 1 ? 'Write down 5 distinct things you see in the room right now:' :
                         activeGroundingStep === 2 ? 'Describe 4 physical textures you can feel (e.g., table grain, jacket):' :
                         activeGroundingStep === 3 ? 'Listen closely. What are 3 auditory sounds you hear around you?' :
                         'Identify 2 subtle smells in your workspace environment:'}
                      </p>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={groundingInput}
                          onChange={(e) => setGroundingInput(e.target.value)}
                          placeholder="Type and submit..."
                          className="flex-1 bg-slate-800 border border-slate-700 text-xs px-3.5 py-2 rounded-xl outline-none text-white placeholder-slate-400"
                          required
                        />
                        <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-100 border border-zinc-900 dark:border-zinc-200 text-xs font-black rounded-xl transition shadow">Next Step</button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">Grounding Completed Successfully!</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Your heart rate is grounded, and brain patterns have returned to a focused, active beta wave state. Keep up the high concentration, Alex!</p>
                      <button 
                        onClick={handleResetGrounding}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 rounded-xl text-xs font-extrabold"
                      >
                        Reset Grounding
                      </button>
                    </div>
                  )}

                  {/* Logs of entries */}
                  {groundingLogs.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 space-y-1 font-bold">
                      <p className="uppercase text-[8px] text-slate-500">Your groundings logs:</p>
                      <div className="flex flex-wrap gap-1">
                        {groundingLogs.map((log, i) => (
                          <span key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-450">
                            {log}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* Tab 4: COPING DECKS FOR MENTAL STRATEGY */}
          {activeTool === 'coping' && (
            <div className="space-y-4">
              {COPING_DECK.map((desk, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> {desk.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">{desk.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5">
                    {desk.tips.map((tip, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-50 dark:border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-normal">
                        {i+1}. {tip}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* 3. QUICK CHAT IDEAS SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-4 h-4 text-slate-400" /> Quick Session Starters
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">Click any query category below to initiate a structured empathetic journaling conversation with Therapist.</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => handleQuickPrompt("I feel overwhelmed with computer science homework and calculus.")}
                className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-slate-150 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-2xl transition flex items-center justify-between"
              >
                <span>Exam Pressure & Calculus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleQuickPrompt("I keep putting off my video editing practice lessons.")}
                className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-slate-150 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-2xl transition flex items-center justify-between"
              >
                <span>Procrastination & Skills</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleQuickPrompt("I can't fall asleep because my brain keeps mapping algorithms.")}
                className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-slate-150 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-2xl transition flex items-center justify-between"
              >
                <span>Sleep Cycle Overdrive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calming visual aid card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-white relative overflow-hidden flex flex-col justify-between h-44 shadow-lg">
            <div className="absolute left-[-20px] bottom-[-20px] w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Active Reflection</span>
              <h4 className="text-base font-black leading-snug">"Be kind to your mind today. Your academic metrics do not measure your inner value."</h4>
            </div>
            <p className="text-[10px] text-zinc-300 font-bold">— Therapist</p>
          </div>

        </div>

      </div>

    </div>
  );
}
