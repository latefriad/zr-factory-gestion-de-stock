import React, { useState } from 'react';
import { 
  Printer, 
  RefreshCw, 
  Globe, 
  Settings, 
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Calculator,
  LayoutDashboard,
  Package,
  Users,
  TrendingDown,
  Coins
} from 'lucide-react';
import { getApiUrl, setApiUrl } from '../api';

export function Header({ 
  lang, 
  setLang, 
  t, 
  isSyncing, 
  lastUpdated, 
  onRefresh,
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed,
  activeTab,
  onOpenCalculator,
  onOpenNewOrder,
  showSettings,
  setShowSettings
}) {
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveUrl = () => {
    setApiUrl(apiUrlInput.trim());
    setSaveMsg('✅ تم حفظ الرابط بنجاح');
    setTimeout(() => {
      setSaveMsg('');
      if (setShowSettings) setShowSettings(false);
      onRefresh();
    }, 1200);
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: t.dashboard, subtitle: 'نظرة عامة على أداء ومؤشرات المصنع', icon: LayoutDashboard };
      case 'orders':
        return { title: t.orders, subtitle: 'متابعة مراحل الإنتاج، التسليم وبوالص الشحن', icon: Printer };
      case 'stock':
        return { title: t.stock, subtitle: 'إدارة الملابس الخام، الألوان، المقاسات والمواد', icon: Package };
      case 'clients':
        return { title: t.clients, subtitle: 'سجل العملاء، العلامات التجارية والديون في السوق', icon: Users };
      case 'expenses':
        return { title: t.expenses, subtitle: 'مصاريف التشغيل، الإيجار والمشتريات اليومية', icon: TrendingDown };
      case 'partners':
        return { title: lang === 'ar' ? 'الأرباح وتوزيع الشركاء' : 'Partners & Profits', subtitle: 'توزيع الأرباح (30% رياض / 30% زكرياء / 40% المشروع)', icon: Coins };
      default:
        return { title: t.factoryName, subtitle: t.factorySubtitle, icon: Printer };
    }
  };

  const currentSection = getSectionTitle();
  const SectionIcon = currentSection.icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Left Side: Sidebar Toggle & Section Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Trigger (Hamburger) */}
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              title="فتح القائمة الجانبية"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={onToggleDesktopSidebar}
              className="hidden md:flex p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              title={isSidebarCollapsed ? "توسيع القائمة الجانبية" : "تصغير القائمة الجانبية"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Active Page Header & Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 hidden sm:flex">
                <SectionIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {currentSection.title}
                  </h1>
                  <span className="hidden lg:inline bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    ZR FACTORY
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate hidden md:block">
                  {currentSection.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Action Pills & Sync Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Quick Actions (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenNewOrder}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.newOrderBtn}</span>
              </button>

              <button
                onClick={onOpenCalculator}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">حاسبة DTF</span>
              </button>
            </div>

            {/* Sync Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden md:inline text-slate-600 font-medium text-[11px]">
                {isSyncing ? t.syncing : t.connectedToSheet}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title={t.refresh}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition border border-slate-200 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="إعدادات الرابط"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Settings Modal Bar */}
      {showSettings && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Sheets Web App URL (رابط الـ Apps Script):
              </label>
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                {t.save}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
          {saveMsg && (
            <p className="text-center text-xs font-bold text-emerald-600 mt-2">{saveMsg}</p>
          )}
        </div>
      )}
    </header>
  );
}
