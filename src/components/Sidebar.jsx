import React from 'react';
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
  PanelLeftClose, 
  PanelLeftOpen, 
  RefreshCw, 
  Globe, 
  Settings, 
  X,
  Layers,
  Sparkles,
  ExternalLink
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

  // Low stock alert count
  const lowStockCount = blanks.filter(b => (parseFloat(b.Quantity) || 0) <= (parseFloat(b.Min_Alert) || 5)).length;

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
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30
          h-screen bg-slate-900 text-slate-300 border-r border-slate-800
          flex flex-col justify-between shrink-0 select-none
          transition-all duration-300 ease-in-out no-print shadow-xl md:shadow-none
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64 w-72'}
        `}
        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
      >
        {/* TOP BRAND & LOGO SECTION */}
        <div className={`p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center shrink-0 ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div 
              onClick={() => { if (isCollapsed) setIsCollapsed(false); }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 shrink-0 cursor-pointer"
              title={t.factoryName}
            >
              <Printer className="w-5 h-5" />
            </div>
            
            {/* Brand title (hidden if collapsed on desktop) */}
            <div className={`min-w-0 transition-opacity duration-200 ${isCollapsed ? 'md:hidden' : 'block'}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight truncate">
                  {t.factoryName}
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  DTF
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {t.factorySubtitle || 'إدارة المخزون وورشة الطباعة'}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse toggle button on desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ${isCollapsed ? 'md:hidden' : ''}`}
            title="تصغير القائمة"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="p-3 border-b border-slate-800/60 space-y-2 shrink-0">
          {/* New Order Trigger */}
          <button
            onClick={() => {
              onOpenNewOrder();
              if (isOpenMobile) setIsOpenMobile(false);
            }}
            className={`
              w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500
              text-white rounded-xl text-xs font-black shadow-md shadow-brand-600/25
              flex items-center justify-center gap-2 transition transform active:scale-98
              ${isCollapsed ? 'md:px-2 md:justify-center' : ''}
            `}
            title={t.newOrderBtn}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} truncate`}>
              {t.newOrderBtn}
            </span>
          </button>

          {/* DTF Calculator Trigger */}
          <button
            onClick={() => {
              onOpenCalculator();
              if (isOpenMobile) setIsOpenMobile(false);
            }}
            className={`
              w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30
              rounded-xl text-xs font-bold transition flex items-center justify-center gap-2
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
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
          <div className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${isCollapsed ? 'md:hidden' : 'block'}`}>
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
                  transition-all group relative
                  ${isActive 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'}
                  ${isCollapsed ? 'md:justify-center md:px-2' : ''}
                `}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                <span className={`truncate flex-1 text-right ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>

                {item.badge && (
                  <span className={`
                    text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0
                    ${isCollapsed ? 'md:hidden' : 'inline-block'}
                    ${isActive ? 'bg-white/20 text-white' : item.badgeColor}
                  `}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed desktop view */}
                {isCollapsed && (
                  <div 
                    className="hidden md:group-hover:flex absolute top-1/2 -translate-y-1/2 bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: 'calc(100% + 12px)' }}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full font-mono font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* BOTTOM CONTROLS & FOOTER */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0 space-y-2">
          {/* Sync indicator */}
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
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition border border-slate-700/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />
            </button>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition border border-slate-700/50 font-bold text-[10px]"
            >
              <Globe className="w-3.5 h-3.5 mr-0.5" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="إعدادات الرابط"
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition border border-slate-700/50"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
