import React, { useState } from 'react';
import { ShopItem, UserStats } from '../types';
import { storageService, DEFAULT_SHOP_ITEMS } from '../services/storageService';
import { 
  ShoppingBag, Sparkles, Coins, Award, Shield, Zap, 
  Volume2, Gift, Check, CheckCircle2, Star, Flame, 
  Layers, ChevronRight, RefreshCw, AlertCircle, ArrowUpRight, Crown
} from 'lucide-react';

interface ShopProps {
  stats: UserStats;
  onDataUpdate: () => void;
  triggerXP: (amount: number, reason: string) => void;
  onOpenProfile?: () => void;
}

const RARITY_COLORS: Record<string, { badge: string; border: string; glow: string; text: string }> = {
  Common: {
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    border: 'border-slate-300/40 dark:border-slate-700/40',
    glow: 'hover:shadow-slate-500/10',
    text: 'text-slate-400'
  },
  Rare: {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'border-blue-500/30 dark:border-blue-500/30',
    glow: 'hover:shadow-blue-500/20',
    text: 'text-blue-400'
  },
  Epic: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    border: 'border-purple-500/35 dark:border-purple-500/35',
    glow: 'hover:shadow-purple-500/25',
    text: 'text-purple-400'
  },
  Legendary: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'border-amber-500/40 dark:border-amber-500/40',
    glow: 'hover:shadow-amber-500/30',
    text: 'text-amber-400'
  },
  Mythic: {
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/45 dark:border-rose-500/45',
    glow: 'hover:shadow-rose-500/35 animate-pulse',
    text: 'text-rose-400'
  }
};

export default function Shop({ stats, onDataUpdate, triggerXP, onOpenProfile }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'badge' | 'title' | 'aura' | 'booster' | 'sound' | 'mystery'>('all');
  const [shopItems] = useState<ShopItem[]>(storageService.getShopItems());
  const [isOpeningMystery, setIsOpeningMystery] = useState(false);
  const [mysteryResult, setMysteryResult] = useState<any | null>(null);
  const [purchaseToast, setPurchaseToast] = useState<{ message: string; isSuccess: boolean } | null>(null);

  const inventorySet = new Set(stats.inventory || []);
  const equippedBadges = stats.equippedBadges || [];

  const showToast = (message: string, isSuccess: boolean) => {
    setPurchaseToast({ message, isSuccess });
    setTimeout(() => setPurchaseToast(null), 3800);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (stats.coins < item.price) {
      showToast(`Need ${item.price - stats.coins} more coins to purchase ${item.name}!`, false);
      return;
    }

    const result = storageService.buyShopItem(item.id);
    if (result.success) {
      onDataUpdate();
      showToast(result.message, true);
      triggerXP(50, `Shop Purchase: Acquired "${item.name}"`);
    } else {
      showToast(result.message, false);
    }
  };

  const handleOpenMysteryChest = () => {
    if (stats.coins < 100) {
      showToast('You need at least 100 coins to roll the Mystery Capsule!', false);
      return;
    }

    setIsOpeningMystery(true);
    setMysteryResult(null);

    setTimeout(() => {
      const result = storageService.buyShopItem('mystery-chest');
      setIsOpeningMystery(false);
      if (result.success && result.mysteryReward) {
        setMysteryResult(result.mysteryReward);
        onDataUpdate();
        triggerXP(100, `Opened Mystery Capsule: ${result.mysteryReward.text}`);
      } else {
        showToast(result.message, false);
      }
    }, 1200);
  };

  const handleEquipBadge = (badgeId: string) => {
    storageService.equipBadge(badgeId);
    onDataUpdate();
  };

  const handleEquipTitle = (titleValue: string) => {
    storageService.equipTitle(titleValue);
    onDataUpdate();
    showToast(`Equipped title: "${titleValue}"`, true);
  };

  const handleEquipAura = (auraId: string) => {
    storageService.equipAura(auraId);
    onDataUpdate();
    showToast(`Active Aura updated!`, true);
  };

  const handleEquipSoundPack = (soundPack: any) => {
    storageService.equipSoundPack(soundPack);
    onDataUpdate();
    showToast(`Equipped Audio Theme: ${soundPack}`, true);
  };

  const filteredItems = shopItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div id="shop-module-container" className="space-y-6 animate-fade-in">
      
      {/* Floating purchase notification */}
      {purchaseToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
            purchaseToast.isSuccess 
              ? 'bg-zinc-900 text-white border-emerald-500/50 shadow-emerald-500/20' 
              : 'bg-zinc-900 text-white border-rose-500/50 shadow-rose-500/20'
          }`}>
            {purchaseToast.isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <p className="text-xs font-bold">{purchaseToast.message}</p>
          </div>
        </div>
      )}

      {/* 1. HERO COIN VAULT & SHOP HEADER */}
      <div className="glass-card-primary p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-[-10px] top-[-10px] w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Rewards & Badge Emporium
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full glass-card-nested text-slate-600 dark:text-zinc-300">
              {inventorySet.size} Items Owned
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Exchange Your Earned Coins for Elite Prestige
          </h2>

          <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            Unlock rare insignia badges, competitive titles, luminous avatar auras, focus power-ups, and audio soundpacks earned through your daily JEE study sprints and consistency streaks.
          </p>
        </div>

        {/* Live Coin Wallet Card */}
        <div className="z-10 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 p-4 md:p-5 rounded-3xl shrink-0 flex items-center gap-4 shadow-xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            <Coins className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider block">
              Available Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {stats.coins.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-500">Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CURRENT EQUIPPED PREVIEW BAR */}
      <div className="glass-card-nested p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" /> Active Profile Loadout Showcase
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">
            Equipped badges appear across your headers & dashboard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Active Title Card */}
          <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Equipped Title</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{stats.userTitle || 'Vertical Developer'}</span>
            </div>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Active Aura Card */}
          <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Equipped Avatar Aura</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {stats.equippedAura ? shopItems.find(i => i.id === stats.equippedAura)?.name || 'Custom Glow' : 'Default Pure'}
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          {/* Active Badges Showcase */}
          <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Showcase Badges ({equippedBadges.length}/3)
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                {equippedBadges.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No badges pinned</span>
                ) : (
                  equippedBadges.map(bId => {
                    const badge = shopItems.find(i => i.id === bId);
                    return (
                      <span 
                        key={bId} 
                        className="text-sm p-1 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10" 
                        title={badge?.name}
                      >
                        {badge?.icon || '🏆'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* 3. MYSTERY ARTIFACT GACHA CAPSULE BANNER */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/40 p-6 rounded-3xl shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-3xl shadow-2xl transition-all duration-500 ${isOpeningMystery ? 'animate-spin scale-110' : 'hover:scale-105'}`}>
              🎁
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30">
                  Mystery Capsule
                </span>
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Coins className="w-3 h-3" /> 100 Coins / Roll
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                Artifact Capsule: High-Tier Badges & Coin Jackpots
              </h3>
              <p className="text-xs text-purple-200/80">
                Roll the mystery wheel for a chance to win exclusive badges, rare titles, or massive gold jackpots up to 750 Coins!
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenMysteryChest}
            disabled={isOpeningMystery || stats.coins < 100}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shrink-0 ${
              stats.coins >= 100 && !isOpeningMystery
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-105 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {isOpeningMystery ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Unboxing Artifact...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" /> Roll Capsule (100 Coins)
              </>
            )}
          </button>
        </div>

        {/* Mystery Result Reveal Banner */}
        {mysteryResult && (
          <div className="mt-4 p-4 rounded-2xl bg-white/10 dark:bg-black/40 border border-purple-400/50 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mysteryResult.type === 'coins' ? '💰' : mysteryResult.type === 'xp' ? '⚡' : '🏆'}</span>
              <div>
                <p className="text-xs font-black text-white">{mysteryResult.text}</p>
                <p className="text-[10px] text-purple-200">The rewards have been credited directly to your account!</p>
              </div>
            </div>
            <button 
              onClick={() => setMysteryResult(null)}
              className="text-[10px] font-bold text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 4. CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Items', icon: Layers },
          { id: 'badge', label: 'Badges & Insignias', icon: Award },
          { id: 'title', label: 'Titles & Accolades', icon: Zap },
          { id: 'aura', label: 'Avatar Auras & Frames', icon: Sparkles },
          { id: 'booster', label: 'Power-ups & XP', icon: Flame },
          { id: 'sound', label: 'Audio Soundpacks', icon: Volume2 }
        ].map(cat => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                  : 'glass-card-nested text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. SHOP CATALOG GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => {
          const isOwned = inventorySet.has(item.id);
          const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common;
          const isBadgeEquipped = equippedBadges.includes(item.id);
          const isTitleEquipped = stats.userTitle === item.titleValue;
          const isAuraEquipped = stats.equippedAura === item.id;
          const canAfford = stats.coins >= item.price;

          return (
            <div
              key={item.id}
              className={`glass-card-interactive p-5 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] border ${rarityStyle.border} ${rarityStyle.glow} shadow-sm relative overflow-hidden`}
            >
              {/* Top Row: Rarity badge & Price */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${rarityStyle.badge}`}>
                    {item.rarity} {item.category}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-black text-amber-500 font-mono">
                    <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.price}</span>
                  </div>
                </div>

                {/* Item Icon and Name */}
                <div className="flex items-start gap-3.5 pt-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Perk highlight pill */}
                {item.perkText && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] text-slate-600 dark:text-zinc-300 font-semibold border border-slate-100 dark:border-white/5 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{item.perkText}</span>
                  </div>
                )}
              </div>

              {/* Action Button Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-4">
                {isOwned ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" /> Owned
                    </span>

                    {/* Badge equip toggle */}
                    {item.category === 'badge' && (
                      <button
                        onClick={() => handleEquipBadge(item.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                          isBadgeEquipped
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                            : 'glass-card-nested text-slate-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {isBadgeEquipped ? '★ Pinned (1 of 3)' : '+ Pin to Showcase'}
                      </button>
                    )}

                    {/* Title equip toggle */}
                    {item.category === 'title' && item.titleValue && (
                      <button
                        onClick={() => handleEquipTitle(item.titleValue!)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                          isTitleEquipped
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'glass-card-nested text-slate-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {isTitleEquipped ? '✓ Active Title' : 'Set as Title'}
                      </button>
                    )}

                    {/* Aura equip toggle */}
                    {item.category === 'aura' && (
                      <button
                        onClick={() => handleEquipAura(item.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                          isAuraEquipped
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'glass-card-nested text-slate-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {isAuraEquipped ? '✓ Active Aura' : 'Equip Aura'}
                      </button>
                    )}

                    {/* Sound pack equip toggle */}
                    {item.category === 'sound' && (
                      <button
                        onClick={() => handleEquipSoundPack(item.id.replace('sound-', '') as any)}
                        className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider glass-card-nested text-slate-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        Activate Sound
                      </button>
                    )}

                    {/* Consumable booster notice */}
                    {item.category === 'booster' && (
                      <span className="text-[10px] text-slate-400 font-bold">Consumable Active</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      canAfford
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 active:scale-95'
                        : 'bg-slate-100 text-slate-400 dark:bg-zinc-800/60 dark:text-zinc-500 cursor-not-allowed border border-slate-200/50 dark:border-white/5'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{canAfford ? `Purchase for ${item.price} Coins` : `Need ${item.price - stats.coins} More Coins`}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
