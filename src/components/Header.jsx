import React, { useState } from 'react';
import { 
  Printer, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  ExternalLink 
} from 'lucide-react';
import { getApiUrl, setApiUrl } from '../api';

export function Header({ lang, setLang, t, isSyncing, lastUpdated, onRefresh }) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveUrl = () => {
    setApiUrl(apiUrlInput.trim());
    setSaveMsg('✅ تم حفظ الرابط');
    setTimeout(() => {
      setSaveMsg('');
      setShowSettings(false);
      onRefresh();
    }, 1200);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 truncate">
                  {t.factoryName}
                </span>
                <span className="bg-amber-100 text-amber-800 text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                  DTF PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block">
                {t.factorySubtitle}
              </p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Sync Status Badge (Compact dot on mobile, full text on tablet/desktop) */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
              </span>
              <span className="hidden md:inline text-slate-600 font-medium">
                {isSyncing ? t.syncing : t.connectedToSheet}
              </span>
              {lastUpdated && (
                <span className="hidden lg:inline text-slate-400 text-[10px]">
                  ({lastUpdated})
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title={t.refresh}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin text-brand-600' : ''}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] sm:text-xs">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="إعدادات الرابط"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Settings Modal Bar */}
      {showSettings && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 transition-all">
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
