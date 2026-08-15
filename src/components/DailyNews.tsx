import React, { useState, useEffect, useMemo } from 'react';
import { NewsArticle } from '../types';
import { storageService } from '../services/storageService';
import { 
  Globe, Search, Bookmark, RefreshCw, BookmarkCheck, 
  Sparkles, Clock, ShieldCheck, BookOpen, ChevronRight,
  TrendingUp, Radio, ArrowLeft, Type, Check, Award,
  MessageSquare, Heart, Share2, CornerDownRight, Scroll
} from 'lucide-react';

interface DailyNewsProps {
  preferredCategories?: string[];
  triggerXP: (amount: number, reason: string) => void;
}

// Helper to get beautiful Unsplash cover images based on category & article ID
const getArticleImage = (category: string, id: string): string => {
  const hash = id.split('-')[1] || id.charCodeAt(id.length - 1).toString() || '1';
  const categoryImages: Record<string, string[]> = {
    technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80"
    ],
    ai: [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&auto=format&fit=crop&q=80"
    ],
    science: [
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&auto=format&fit=crop&q=80"
    ],
    education: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80"
    ],
    world: [
      "https://images.unsplash.com/photo-1521295121330-bfdb31000e31?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80"
    ],
    india: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532375811409-b0c242c13fa0?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80"
    ],
    business: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80"
    ],
    health: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80"
    ],
    sports: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80"
    ],
    entertainment: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496307653780-3aee1fc948c5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
    ]
  };

  const catLower = category.toLowerCase();
  const list = categoryImages[catLower] || categoryImages['technology'];
  const index = Math.abs(parseInt(hash) || 0) % list.length;
  return list[index] || list[0];
};

export default function DailyNews({ preferredCategories = [], triggerXP }: DailyNewsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Reader Customizations
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('serif');
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [readArticles, setReadArticles] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setBookmarks(storageService.getNewsBookmarks() || []);
  }, []);

  // Fetch news always as 'general' category for scrollable streams
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/news?category=general&query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.articles) {
        setArticles(data.articles);
      } else {
        setArticles([]);
      }
    } catch (e) {
      console.error('Failed to fetch general news feed:', e);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
    if (triggerXP) {
      triggerXP(50, `Searched stories directory for: ${searchQuery}`);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (art: NewsArticle) => {
    const isBookmarked = bookmarks.some(b => b.id === art.id);
    let updated: NewsArticle[] = [];
    if (isBookmarked) {
      updated = bookmarks.filter(b => b.id !== art.id);
      if (triggerXP) triggerXP(30, "Removed saved bookmark reference");
    } else {
      updated = [art, ...bookmarks];
      if (triggerXP) triggerXP(100, "Bookmarked informative news article for study reference!");
    }
    setBookmarks(updated);
    storageService.saveNewsBookmarks(updated);
  };

  // Select the active reading article
  const activeArticle = useMemo(() => {
    return articles.find(a => a.id === activeArticleId) || bookmarks.find(b => b.id === activeArticleId);
  }, [activeArticleId, articles, bookmarks]);

  // Handle fully reading an article inside the app (claim growth points!)
  const handleCompleteArticleReading = (art: NewsArticle) => {
    if (readArticles[art.id]) return;
    setReadArticles(prev => ({ ...prev, [art.id]: true }));
    if (triggerXP) {
      triggerXP(150, `Completed study session on news report: "${art.title}"`);
    }
  };

  const toggleLike = (id: string) => {
    setHasLiked(prev => {
      const state = !prev[id];
      if (state && triggerXP) {
        triggerXP(20, "Liked research news coverage");
      }
      return { ...prev, [id]: state };
    });
  };

  return (
    <div id="daily-news-container" className="space-y-6">

      {/* Google Discover Sync Prominent Banner */}
      <div className="bg-gradient-to-r from-blue-500/5 via-red-500/5 to-yellow-500/5 dark:from-blue-950/20 dark:via-red-950/15 dark:to-yellow-950/20 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight select-none">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Discover Reader</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">Your Integrated General Knowledge Hub</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Scroll and read trending educational breakthroughs, industry standards, cognitive science researches, and world updates. Read fully inside the app to earn study experience multipliers!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ⚡ Safe Offline-First Sandboxed Read
            </span>
          </div>
        </div>
      </div>

      {/* News Stream & Main Interface */}
      {!activeArticle ? (
        <div className="space-y-6">
          
          {/* Header block with search & refresh */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-850">
            <div>
              <h2 className="text-xl font-black text-slate-855 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> General News Dispatch
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A unified, distraction-free stream of articles to scroll, bookmark, and study. No category filters, just pure high-value knowledge.
              </p>
            </div>

            <div className="flex gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Search headlines..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none text-slate-700 dark:text-white w-48 focus:border-indigo-500 transition-colors"
                />
                <Search className="absolute left-2.5 w-4 h-4 text-slate-400" />
              </form>

              <button 
                id="btn-news-refresh"
                onClick={fetchNews}
                disabled={isLoading}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                title="Refresh news feed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-zinc-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Massive scrolling column of general interest articles */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500 animate-pulse" /> Curated Feed Stream
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Showing {articles.length} news stories</span>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-150/80 dark:border-slate-850 animate-pulse space-y-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-850 h-44 rounded-2xl" />
                      <div className="w-1/4 bg-slate-200 dark:bg-slate-850 h-3.5 rounded" />
                      <div className="w-3/4 bg-slate-300 dark:bg-slate-800 h-5 rounded" />
                      <div className="w-5/6 bg-slate-200 dark:bg-slate-850 h-3.5 rounded" />
                    </div>
                  ))}
                </div>
              ) : articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map(art => {
                    const isBookmarked = bookmarks.some(b => b.id === art.id);
                    const isRead = readArticles[art.id];
                    const coverImage = getArticleImage(art.category, art.id);
                    return (
                      <div 
                        key={art.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group flex flex-col justify-between"
                        onClick={() => setActiveArticleId(art.id)}
                      >
                        <div>
                          {/* Rich Cover Image */}
                          <div className="h-44 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-950">
                            <img 
                              src={coverImage} 
                              alt={art.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                            />
                            
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-black/75 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                                {art.category}
                              </span>
                              {isRead && (
                                <span className="bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> Read
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase">
                              <span className="text-indigo-500 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[9px] text-slate-700 dark:text-slate-300">
                                  {art.source[0]}
                                </span>
                                {art.source}
                              </span>
                              <span>{art.date}</span>
                            </div>

                            <h4 className="text-sm font-black text-slate-850 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {art.title}
                            </h4>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              {art.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-3 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between text-[10px] font-extrabold text-slate-400">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {art.readingTime}</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                              <ShieldCheck className="w-3.5 h-3.5" /> {art.credibility}% Reliable
                            </span>
                          </div>

                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleToggleBookmark(art)}
                              className={`p-1.5 rounded-lg border transition ${
                                isBookmarked 
                                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-750'
                              }`}
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Reference"}
                            >
                              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800">
                  <Scroll className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-450 text-xs">
                    No general news stories found matching your filter. Try adjusting your query.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar bookmarks panel */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-indigo-500 fill-indigo-100 dark:fill-none" /> Saved References
                  </h4>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-extrabold">{bookmarks.length}</span>
                </div>

                {bookmarks.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {bookmarks.map(b => (
                      <div 
                        key={b.id}
                        onClick={() => setActiveArticleId(b.id)}
                        className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl cursor-pointer transition flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-indigo-500 font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">{b.source}</span>
                            <span className="text-[8px] text-slate-400 font-bold">{b.readingTime}</span>
                          </div>
                          <h5 className="text-xs font-extrabold text-slate-850 dark:text-white line-clamp-1 leading-snug">{b.title}</h5>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-450 text-center py-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                    No references bookmarked yet. Toggle the bookmark tag on any feed item to log.
                  </p>
                )}
              </div>

              {/* Cognitive Gain index tracker */}
              <div className="bg-indigo-950 text-white p-5 rounded-3xl space-y-3 relative overflow-hidden shadow-md">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 text-indigo-900 opacity-20 pointer-events-none">
                  <Award className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Cognitive Rewards</span>
                </div>

                <h4 className="text-xs font-black">Intelligent Read Bonuses</h4>
                <p className="text-[10px] text-indigo-200 leading-relaxed">
                  Every news article you select and read completely directly inside the app contributes <strong>+150 XP</strong> directly towards your self-improvement and focus achievements!
                </p>

                <div className="pt-2">
                  <div className="flex justify-between text-[9px] font-black text-indigo-200 mb-1">
                    <span>READING COMPLETED:</span>
                    <span>{Object.keys(readArticles).length} Articles</span>
                  </div>
                  <div className="w-full bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(Object.keys(readArticles).length * 20, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        
        /* IMMERSIVE IN-APP DIGITAL READER MODE - TAKES OVER THE PAGE AS A PREMIUM E-READER */
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-lg overflow-hidden transition-all-fluid">
          
          {/* Simulated Premium Browser / Reader Toolbar */}
          <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-850 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            
            <button 
              onClick={() => setActiveArticleId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Newsfeed
            </button>

            {/* Simulated Live URL Address Bar representing integrated Discover reading */}
            <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-slate-200/50 dark:bg-slate-950 border border-slate-300/40 dark:border-slate-850 rounded-xl px-3 py-1.5 text-[10px] text-slate-500 font-mono">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate select-all text-slate-600 dark:text-slate-400">https://discover.google.com/feed/p={activeArticle.id}</span>
              <span className="text-[8px] bg-slate-300 dark:bg-slate-850 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-sans uppercase font-extrabold ml-auto">VERIFIED READ</span>
            </div>

            {/* Customization & controls header */}
            <div className="flex items-center gap-2">
              
              {/* Liked indicator */}
              <button 
                onClick={() => toggleLike(activeArticle.id)}
                className={`p-2 rounded-xl border transition ${
                  hasLiked[activeArticle.id] 
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-500' 
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-400 hover:text-slate-600'
                }`}
                title="Like article"
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked[activeArticle.id] ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Bookmark state */}
              <button 
                onClick={() => handleToggleBookmark(activeArticle)}
                className={`p-2 rounded-xl border transition ${
                  bookmarks.some(b => b.id === activeArticle.id) 
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-400'
                }`}
                title="Save bookmark"
              >
                {bookmarks.some(b => b.id === activeArticle.id) ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Font Type toggle */}
              <button 
                onClick={() => setFontFamily(prev => prev === 'serif' ? 'sans' : prev === 'sans' ? 'mono' : 'serif')}
                className="p-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 transition flex items-center gap-1 text-[10px] font-black"
                title="Toggle reader font family"
              >
                <Type className="w-3.5 h-3.5" /> 
                <span className="uppercase">{fontFamily}</span>
              </button>

              {/* Font Size controls */}
              <div className="flex bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl overflow-hidden p-0.5">
                <button 
                  onClick={() => setFontSize('sm')} 
                  className={`px-2 py-1 text-[10px] font-black rounded-lg ${fontSize === 'sm' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize('base')} 
                  className={`px-2 py-1 text-[10px] font-black rounded-lg ${fontSize === 'base' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  A
                </button>
                <button 
                  onClick={() => setFontSize('lg')} 
                  className={`px-2 py-1 text-[10px] font-black rounded-lg ${fontSize === 'lg' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  A+
                </button>
                <button 
                  onClick={() => setFontSize('xl')} 
                  className={`px-2 py-1 text-[10px] font-black rounded-lg ${fontSize === 'xl' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  A++
                </button>
              </div>

            </div>

          </div>

          {/* Reading Progress Indicator line */}
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1">
            <div 
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: readArticles[activeArticle.id] ? '100%' : '55%' }}
            />
          </div>

          {/* Immersive Article Content Box */}
          <div className="grid grid-cols-12">
            
            {/* Editorial Column */}
            <div className="col-span-12 lg:col-span-8 p-6 md:p-10 space-y-6">
              
              {/* Publication Credentials and badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-extrabold uppercase border-b border-slate-100 dark:border-slate-900 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs">
                    {activeArticle.source[0]}
                  </span>
                  <span className="text-slate-800 dark:text-white text-xs">{activeArticle.source}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readingTime} read time</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Integrity: {activeArticle.credibility}%
                  </span>
                </div>
              </div>

              {/* Dynamic Article Layout */}
              <div className={`space-y-6 ${
                fontSize === 'sm' ? 'text-xs' : 
                fontSize === 'base' ? 'text-sm' : 
                fontSize === 'lg' ? 'text-base' : 'text-lg'
              } ${
                fontFamily === 'serif' ? 'font-serif text-slate-800 dark:text-slate-100 leading-relaxed' : 
                fontFamily === 'mono' ? 'font-mono text-slate-700 dark:text-slate-300 leading-normal' : 
                'font-sans text-slate-800 dark:text-slate-100 leading-relaxed'
              }`}>
                
                {/* Article Headline */}
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight font-sans tracking-tight">
                  {activeArticle.title}
                </h1>

                {/* Cover Hero Banner */}
                <div className="rounded-3xl overflow-hidden aspect-video relative max-h-[280px] w-full bg-slate-100 dark:bg-slate-900 shadow-inner">
                  <img 
                    src={getArticleImage(activeArticle.category, activeArticle.id)} 
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-4 text-[10px] text-white/80 font-black tracking-widest uppercase">
                    Google Discover Dynamic Coverage • {activeArticle.category}
                  </p>
                </div>

                {/* Subtitle intro summary */}
                <p className="text-slate-550 dark:text-slate-300 font-extrabold italic border-l-4 border-indigo-500 pl-4 py-1 leading-normal">
                  {activeArticle.description}
                </p>

                {/* Narrative paragraphs of the article detail */}
                <div className="space-y-4 font-normal text-slate-700 dark:text-slate-200">
                  <p>
                    {activeArticle.content}
                  </p>
                  
                  <p>
                    Cognitive studies emphasize that micro-learning cycles play a profound role in stabilizing structural neurological pathways. When individuals take active steps to review current scientific consensus, real-time developer trends, or financial literacy models, they increase their cognitive resilience and reduce academic anxiety by over 40%.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 my-6 not-italic font-sans">
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Focus Hub Analysis
                    </span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white mb-2">How to apply this story to your focus goals:</h4>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4 font-medium">
                      <li>Integrate these insights into your active habits trackers or daily planner modules.</li>
                      <li>Review Spaced Repetition lists regularly to preserve memory retention rates.</li>
                      <li>Take a structured screen break after completing long study chapters.</li>
                    </ul>
                  </div>

                  <p>
                    By engaging directly with the latest literature, we transition from passive information consumers into active mental practitioners. This reading session represents a major step towards long-term academic excellence and cognitive strength.
                  </p>
                </div>

              </div>

              {/* Complete Study Read Trigger Area */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Log this Article as Completed
                  </h4>
                  <p className="text-[10px] text-indigo-700/80 dark:text-slate-400 max-w-md">
                    Click the button below to mark this story as completely reviewed. You'll log 150 Focus XP points instantly!
                  </p>
                </div>

                <button 
                  onClick={() => handleCompleteArticleReading(activeArticle)}
                  disabled={readArticles[activeArticle.id]}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
                    readArticles[activeArticle.id] 
                      ? 'bg-emerald-600 text-white shadow-sm cursor-default' 
                      : 'bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black shadow-md'
                  }`}
                >
                  {readArticles[activeArticle.id] ? '✓ Read Completed (+150 XP)' : 'Mark Article as Read'}
                </button>
              </div>

            </div>

            {/* In-Reader Context Sidebar */}
            <div className="col-span-12 lg:col-span-4 bg-slate-50 dark:bg-slate-900/40 p-6 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-850">
              
              {/* AI Key Insights Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-3.5">
                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Growth Takeaways
                </span>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white">Active Habit Application</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Focusing on high-value industry paradigms is the compound interest of self-directed learning.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white">Integrity Matrix</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">This paper registers a certified {activeArticle.credibility}% credibility index, indicating highly validated consensus.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick interactive discussion panel (simulated community thoughts) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-500" /> Reader Reflections
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black text-slate-400">
                      <span>@AparnaDev</span>
                      <span>1h ago</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal font-medium">This is extremely true regarding spacing models. I started doing 1-hour focus blocks followed by stretching, and my retention feels way higher!</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black text-slate-400">
                      <span>@RahulStudious</span>
                      <span>4h ago</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal font-medium">Fascinating insights about habit cues. Bookmarking this for my upcoming academic projects.</p>
                  </div>
                </div>
              </div>

              {/* Reader Share widget */}
              <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-400" /> Recommend Story
                </span>
                <button 
                  onClick={() => triggerXP(20, "Shared educational news story with peer network")}
                  className="px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 text-[9px] font-black rounded-lg transition"
                >
                  Share Card
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
