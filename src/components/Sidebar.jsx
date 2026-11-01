import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Printer, 
  Package, 
  Users, 
  TrendingDown, 
  Coins, 
  Calculator, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Globe, 
  Settings, 
  X,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function Sidebar({
  activeTab,
  setActiveTab,
  t,
  data,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  onOpenCalculator,
  onOpenNewOrder,
  lang,
  setLang,
  onRefresh,
  isSyncing,
  lastUpdated,
  onOpenSettings
}) {
  const orders = data.orders || [];
  const blanks = data.stock_blanks || [];
  const clients = data.clients || [];
  const expenses = data.expenses || [];
  const waste = data.waste || [];

  // Low stock alert count
  const lowStockCount = blanks.filter(b => (parseFloat(b.Quantity) || 0) <= (parseFloat(b.Min_Alert) || 5)).length;

  // Rentabilité & Profitability Live Calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.Total_Price_DA) || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.Amount_DA) || 0), 0);
  const totalLoss = waste.reduce((sum, wst) => sum + (parseFloat(wst.Loss_Cost_DA) || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalLoss;
  const rentabilityMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Keyboard shortcut: Cmd+B or Ctrl+B to smoothly retract/expand sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCollapsed]);

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
      badge: null,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'orders',
      label: t.orders,
      icon: Printer,
      badge: orders.length > 0 ? orders.length : null,
      badgeColor: 'bg-brand-500 text-white'
    },
    {
      id: 'stock',
      label: t.stock,
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} تنبيه` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'clients',
      label: t.clients,
      icon: Users,
      badge: clients.length > 0 ? clients.length : null,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'expenses',
      label: t.expenses,
      icon: TrendingDown,
      badge: null,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'partners',
      label: lang === 'ar' ? 'الأرباح والشركاء (30/30/40)' : 'Partners & Profits',
      icon: Coins,
      badge: '30/30/40',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (isOpenMobile) {
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay with Soft Blur */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Retractable Smooth Left Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30
          h-screen bg-slate-900/95 backdrop-blur-md text-slate-300 border-r border-slate-800/80
          flex flex-col justify-between shrink-0 select-none
          transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] no-print shadow-2xl md:shadow-none
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64 w-[280px] max-w-[85vw]'}
        `}
        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
      >
        {/* Floating Retractable Pill Button on Sidebar Right Border */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden md:flex absolute -right-3.5 top-6 z-50
            w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-brand-500
            text-slate-300 hover:text-white hover:bg-brand-600
            items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-115 active:scale-95
          `}
          title={isCollapsed ? 'توسيع القائمة (Ctrl+B)' : 'تصغير القائمة (Ctrl+B)'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <ChevronLeft className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>

        {/* TOP BRAND SECTION */}
        <div className={`p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center shrink-0 ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div 
              onClick={() => { if (isCollapsed) setIsCollapsed(false); }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0 cursor-pointer transform hover:scale-105 transition-transform"
              title={t.factoryName}
            >
              <Printer className="w-5 h-5" />
            </div>
            
            {/* Brand title (smooth fade on collapse) */}
            <div className={`min-w-0 transition-all duration-200 ${isCollapsed ? 'md:hidden opacity-0 pointer-events-none' : 'block opacity-100'}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight truncate">
                  {t.factoryName}
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  DTF PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {t.factorySubtitle || 'إدارة المخزون وورشة الطباعة'}
              </p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="p-3 border-b border-slate-800/60 space-y-2 shrink-0">
          {/* New Order Button */}
          <button
            onClick={() => {
              onOpenNewOrder();
              if (isOpenMobile) setIsOpenMobile(false);
            }}
            className={`
              w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500
              text-white rounded-xl text-xs font-black shadow-md shadow-brand-600/30
              flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-98
              ${isCollapsed ? 'md:px-2 md:justify-center' : ''}
            `}
            title={t.newOrderBtn}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} truncate`}>
              {t.newOrderBtn}
            </span>
          </button>

          {/* DTF Calculator Button */}
          <button
            onClick={() => {
              onOpenCalculator();
              if (isOpenMobile) setIsOpenMobile(false);
            }}
            className={`
              w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30
              rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-98
              ${isCollapsed ? 'md:px-2 md:justify-center' : ''}
            `}
            title={t.dtfCalculator}
          >
            <Calculator className="w-4 h-4 shrink-0 text-amber-400" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} truncate text-[11px]`}>
              {t.dtfCalculator}
            </span>
          </button>
        </div>

        {/* NAVIGATION LINKS LIST */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 sidebar-scroll">
          <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
            القائمة الرئيسية
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/30 font-black' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}
                  ${isCollapsed ? 'md:justify-center md:px-2' : ''}
                `}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-115 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                <span className={`truncate flex-1 text-right transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>

                {item.badge && (
                  <span className={`
                    text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 transition-opacity duration-200
                    ${isCollapsed ? 'md:hidden' : 'inline-block'}
                    ${isActive ? 'bg-white/20 text-white' : item.badgeColor}
                  `}>
                    {item.badge}
                  </span>
                )}

                {/* Smooth Floating Tooltip on collapsed desktop view */}
                {isCollapsed && (
                  <div 
                    className="hidden md:group-hover:flex absolute top-1/2 -translate-y-1/2 bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: 'calc(100% + 14px)' }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-mono font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* LIVE RENTABILITÉ & PROFITABILITY METRIC WIDGET */}
        <div className="px-3 py-2 shrink-0">
          {isCollapsed ? (
            /* Collapsed mini indicator */
            <div 
              onClick={() => handleSelectTab('partners')}
              className="hidden md:flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 cursor-pointer hover:border-emerald-400 transition transform hover:scale-105 group relative"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-black text-emerald-400 font-mono mt-0.5">
                +{rentabilityMargin}%
              </span>

              {/* Tooltip on hover */}
              <div 
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 bg-slate-950 text-white text-xs font-bold p-2.5 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none border border-emerald-500/40 flex-col gap-1"
                style={{ left: 'calc(100% + 14px)' }}
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>مردودية المصنع (Rentabilité): +{rentabilityMargin}%</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  صافي الربح: +{netProfit.toLocaleString()} دج
                </div>
              </div>
            </div>
          ) : (
            /* Expanded Full Rentabilité Widget */
            <div 
              onClick={() => handleSelectTab('partners')}
              className="bg-gradient-to-br from-slate-950 to-slate-900 p-3 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>مردودية المصنع (Rentabilité)</span>
                </span>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono">
                  +{rentabilityMargin}%
                </span>
              </div>
              
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">صافي الأرباح:</span>
                <span className="text-sm font-black text-white font-mono group-hover:text-emerald-300 transition-colors">
                  +{netProfit.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">دج</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS & FOOTER */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0 space-y-2">
          {/* Live Google Sheets Sync Status */}
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] ${isCollapsed ? 'md:justify-center md:px-1' : ''}`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className={`truncate ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <span className="text-slate-300 font-medium block truncate">
                {isSyncing ? t.syncing : t.connectedToSheet}
              </span>
              {lastUpdated && (
                <span className="text-slate-500 text-[9px] block font-mono">
                  {lastUpdated}
                </span>
              )}
            </div>
          </div>

          {/* Quick Tools Row (Refresh, Language, Settings) */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title={t.refresh}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition border border-slate-700/50 hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />
            </button>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition border border-slate-700/50 font-bold text-[10px] hover:scale-105 active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 mr-0.5" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="إعدادات الرابط"
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition border border-slate-700/50 hover:scale-105 active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
