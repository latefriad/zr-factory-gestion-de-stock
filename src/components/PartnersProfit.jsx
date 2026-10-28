import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  PiggyBank, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  Printer, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  PlusCircle, 
  FileText, 
  X, 
  Building2, 
  Sparkles,
  Percent,
  Check
} from 'lucide-react';

export function PartnersProfit({ 
  data, 
  t, 
  partnersData, 
  onAddWithdrawal, 
  onDeleteWithdrawal, 
  onAddCloture, 
  onDeleteCloture 
}) {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isClotureOpen, setIsClotureOpen] = useState(false);
  const [selectedClotureToPrint, setSelectedClotureToPrint] = useState(null);
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState('ALL');
  const [calcBasis, setCalcBasis] = useState('collected'); // 'collected' (paid amount) or 'total' (total order value)

  // Form states for Withdrawal
  const [withdrawPartner, setWithdrawPartner] = useState('Riad');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().slice(0, 10));
  const [withdrawMethod, setWithdrawMethod] = useState('Cash');
  const [withdrawNotes, setWithdrawNotes] = useState('');

  // Form states for Clôture
  const [clotureTitle, setClotureTitle] = useState(`إقفال دورة: ${new Date().toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' })}`);
  const [clotureNotes, setClotureNotes] = useState('');

  const orders = data.orders || [];
  const expenses = data.expenses || [];
  const waste = data.waste || [];
  const withdrawals = partnersData?.withdrawals || [];
  const clotures = partnersData?.clotures || [];

  // 1. Financial totals
  const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.Total_Price_DA) || 0), 0);
  const totalPaidRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.Paid_Amount_DA) || 0), 0);
  const effectiveRevenue = calcBasis === 'collected' ? totalPaidRevenue : totalRevenue;

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.Amount_DA) || 0), 0);
  const totalLoss = waste.reduce((sum, wst) => sum + (parseFloat(wst.Loss_Cost_DA) || 0), 0);
  
  // Total Net Profit
  const netProfitTotal = Math.max(0, effectiveRevenue - totalExpenses - totalLoss);

  // 2. 30% / 30% / 40% Shares
  const riadShareEarned = Math.round(netProfitTotal * 0.30);
  const zakariaShareEarned = Math.round(netProfitTotal * 0.30);
  const projectShareEarned = Math.round(netProfitTotal * 0.40);

  // 3. Withdrawals by Partner
  const riadWithdrawn = withdrawals
    .filter(w => w.partner === 'Riad')
    .reduce((sum, w) => sum + (parseFloat(w.amount_da) || 0), 0);

  const zakariaWithdrawn = withdrawals
    .filter(w => w.partner === 'Zakaria')
    .reduce((sum, w) => sum + (parseFloat(w.amount_da) || 0), 0);

  const projectWithdrawn = withdrawals
    .filter(w => w.partner === 'Project')
    .reduce((sum, w) => sum + (parseFloat(w.amount_da) || 0), 0);

  const totalAllWithdrawn = riadWithdrawn + zakariaWithdrawn + projectWithdrawn;

  // 4. Balances available for each
  const riadBalance = riadShareEarned - riadWithdrawn;
  const zakariaBalance = zakariaShareEarned - zakariaWithdrawn;
  const projectBalance = projectShareEarned - projectWithdrawn;

  // 5. Total Net Profits remaining in Vault
  // "when riad or zakaria withrdrow minus in binifts total"
  const remainingVaultProfits = netProfitTotal - totalAllWithdrawn;

  // Quick withdrawal trigger helper
  const handleOpenWithdrawFor = (partner) => {
    setWithdrawPartner(partner);
    setWithdrawAmount('');
    setIsWithdrawOpen(true);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const payload = {
      id: 'WTH-' + Date.now().toString().slice(-6),
      partner: withdrawPartner,
      amount_da: amount,
      date: withdrawDate,
      payment_method: withdrawMethod,
      notes: withdrawNotes.trim()
    };

    onAddWithdrawal(payload);
    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    setWithdrawNotes('');
  };

  const handleClotureSubmit = (e) => {
    e.preventDefault();
    const clotureRecord = {
      id: 'CLO-' + Date.now().toString().slice(-6),
      title: clotureTitle.trim(),
      date: new Date().toISOString().slice(0, 10),
      calc_basis: calcBasis,
      total_revenue: effectiveRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfitTotal,
      riad_share: riadShareEarned,
      riad_withdrawn: riadWithdrawn,
      riad_balance: riadBalance,
      zakaria_share: zakariaShareEarned,
      zakaria_withdrawn: zakariaWithdrawn,
      zakaria_balance: zakariaBalance,
      project_share: projectShareEarned,
      project_withdrawn: projectWithdrawn,
      project_balance: projectBalance,
      total_withdrawn: totalAllWithdrawn,
      remaining_vault: remainingVaultProfits,
      notes: clotureNotes.trim()
    };

    onAddCloture(clotureRecord);
    setIsClotureOpen(false);
    setSelectedClotureToPrint(clotureRecord);
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (selectedPartnerFilter === 'ALL') return true;
    return w.partner === selectedPartnerFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>توزيع الأرباح وحساب الشركاء</span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  30% / 30% / 40%
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                حساب صافي الأرباح، حصة رياض 30%، زكرياء 30%، صندوق الورشة 40%، السحوبات، والتقفيل الدوري
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل سحب أرباح</span>
          </button>

          <button
            onClick={() => setIsClotureOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 border border-slate-700"
          >
            <Lock className="w-4 h-4" />
            <span>تقفيل الدورة (Clôture)</span>
          </button>
        </div>
      </div>

      {/* Financial Basis Selector */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">أساس احتساب صافي الأرباح:</span>
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setCalcBasis('collected')}
              className={`px-3 py-1 rounded-lg transition ${
                calcBasis === 'collected' 
                  ? 'bg-white text-brand-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              السيولة المحصلة فعلياً (Encaissements)
            </button>
            <button
              onClick={() => setCalcBasis('total')}
              className={`px-3 py-1 rounded-lg transition ${
                calcBasis === 'total' 
                  ? 'bg-white text-brand-700 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              إجمالي قيمة الطلبيات (Chiffre d'Affaires)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          المداخيل: <span className="font-extrabold text-slate-800 font-mono">{effectiveRevenue.toLocaleString()} دج</span> | 
          المصاريف: <span className="font-extrabold text-rose-600 font-mono">{totalExpenses.toLocaleString()} دج</span>
        </div>
      </div>

      {/* Main Profits & Vault Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Total Net Profit Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              صافي أرباح المصنع الكلية
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              قبل السحوبات
            </span>
          </div>

          <div className="mt-4 relative z-10">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {netProfitTotal.toLocaleString()} <span className="text-lg font-bold text-slate-400">{t.currency}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              صافي الأرباح بعد طرح كافة تكاليف الملابس، استهلاك DTF، والتسويق والإيجار.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs relative z-10">
            <div className="bg-white/5 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">رياض (30%)</div>
              <div className="font-bold text-amber-300 font-mono">{riadShareEarned.toLocaleString()} دج</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">زكرياء (30%)</div>
              <div className="font-bold text-blue-300 font-mono">{zakariaShareEarned.toLocaleString()} دج</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">المشروع (40%)</div>
              <div className="font-bold text-emerald-300 font-mono">{projectShareEarned.toLocaleString()} دج</div>
            </div>
          </div>
        </div>

        {/* Vault Remaining After Withdrawals */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              الرصيد الصافي المتبقي في الخزينة
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              بعد خصم السحوبات
            </span>
          </div>

          <div className="mt-4 relative z-10">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              {remainingVaultProfits.toLocaleString()} <span className="text-lg font-bold text-emerald-200/60">{t.currency}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              السيولة الحالية المتبقية في صندوق المصنع بعد جميع سحوبات رياض وزكرياء.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-400">إجمالي ما تم سحبه حتى الآن:</span>
            <span className="font-bold font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">
              - {totalAllWithdrawn.toLocaleString()} دج
            </span>
          </div>
        </div>

      </div>

      {/* The 3 Golden Cards: Riad (30%), Zakaria (30%), Project (40%) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* RIAD CARD (30%) */}
        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-md shadow-amber-500/5 hover:border-amber-400 transition flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">رياض (Riad)</h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    شريك بنسبة 30%
                  </span>
                </div>
              </div>
              <Percent className="w-5 h-5 text-amber-500" />
            </div>

            <div className="mt-4 space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>إجمالي الأرباح المستحقة:</span>
                <span className="font-extrabold text-slate-900 font-mono">{riadShareEarned.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>ما تم سحبه:</span>
                <span className="font-extrabold font-mono">- {riadWithdrawn.toLocaleString()} دج</span>
              </div>
              
              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">الرصيد المتاح للسحب:</span>
                <span className={`text-base font-black font-mono ${riadBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {riadBalance.toLocaleString()} دج
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenWithdrawFor('Riad')}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-700" />
            <span>سحب من أرباح رياض</span>
          </button>
        </div>

        {/* ZAKARIA CARD (30%) */}
        <div className="bg-white rounded-3xl p-5 border border-blue-200/80 shadow-md shadow-blue-500/5 hover:border-blue-400 transition flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-sm">
                  Z
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">زكرياء (Zakaria)</h3>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    شريك بنسبة 30%
                  </span>
                </div>
              </div>
              <Percent className="w-5 h-5 text-blue-500" />
            </div>

            <div className="mt-4 space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>إجمالي الأرباح المستحقة:</span>
                <span className="font-extrabold text-slate-900 font-mono">{zakariaShareEarned.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>ما تم سحبه:</span>
                <span className="font-extrabold font-mono">- {zakariaWithdrawn.toLocaleString()} دج</span>
              </div>
              
              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">الرصيد المتاح للسحب:</span>
                <span className={`text-base font-black font-mono ${zakariaBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {zakariaBalance.toLocaleString()} دج
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenWithdrawFor('Zakaria')}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-blue-700" />
            <span>سحب من أرباح زكرياء</span>
          </button>
        </div>

        {/* PROJECT VAULT CARD (40%) */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-md shadow-emerald-500/5 hover:border-emerald-400 transition flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
                  P
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">صندوق المشروع (Project)</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    احتياطي الورشة 40%
                  </span>
                </div>
              </div>
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="mt-4 space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>مخصصات تطوير المصنع:</span>
                <span className="font-extrabold text-slate-900 font-mono">{projectShareEarned.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>مصاريف واستثمارات مسحوبة:</span>
                <span className="font-extrabold font-mono">- {projectWithdrawn.toLocaleString()} دج</span>
              </div>
              
              <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">رصيد احتياطي المشروع:</span>
                <span className={`text-base font-black font-mono ${projectBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {projectBalance.toLocaleString()} دج
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleOpenWithdrawFor('Project')}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
            <span>صرف من صندوق المشروع</span>
          </button>
        </div>

      </div>

      {/* WITHDRAWALS HISTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>سجل عمليات سحب الأرباح (Historique des Retraits)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              كل سحب يتم خصمه فوراً من رصيد الشريك ومن السيولة الإجمالية للخزينة
            </p>
          </div>

          {/* Filter by Partner */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedPartnerFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${selectedPartnerFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              الكل ({withdrawals.length})
            </button>
            <button
              onClick={() => setSelectedPartnerFilter('Riad')}
              className={`px-2.5 py-1 rounded-lg transition ${selectedPartnerFilter === 'Riad' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'}`}
            >
              رياض
            </button>
            <button
              onClick={() => setSelectedPartnerFilter('Zakaria')}
              className={`px-2.5 py-1 rounded-lg transition ${selectedPartnerFilter === 'Zakaria' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-500'}`}
            >
              زكرياء
            </button>
            <button
              onClick={() => setSelectedPartnerFilter('Project')}
              className={`px-2.5 py-1 rounded-lg transition ${selectedPartnerFilter === 'Project' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'}`}
            >
              المشروع
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right min-w-[650px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3">رقم العملية</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">الشريك المستفيد</th>
                <th className="py-2.5 px-3">المبلغ المسحوب</th>
                <th className="py-2.5 px-3">طريقة الدفع</th>
                <th className="py-2.5 px-3">الملاحظة</th>
                <th className="py-2.5 px-3 text-center">إلغاء / حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithdrawals.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {w.id}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">
                    {w.date}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {w.partner === 'Riad' && (
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        رياض (30%)
                      </span>
                    )}
                    {w.partner === 'Zakaria' && (
                      <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                        زكرياء (30%)
                      </span>
                    )}
                    {w.partner === 'Project' && (
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        صندوق المشروع (40%)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-black text-rose-600 font-mono text-sm">
                    - {parseFloat(w.amount_da).toLocaleString()} دج
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {w.payment_method}
                  </td>
                  <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                    {w.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف عملية السحب (${w.id}) وإعادة المبلغ (${parseFloat(w.amount_da).toLocaleString()} دج) للرصيد؟`)) {
                          onDeleteWithdrawal(w.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="حذف العملية وإرجاع المبلغ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    لا توجد أي سحوبات مسجلة بعد في هذه الفئة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLOTURES ARCHIVE */}
      {clotures.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>أرشيف التقفيلات الدورية (Historique des Clôtures)</span>
              </h3>
              <p className="text-xs text-slate-400">
                سجل إقفالات الفترات الشهرية والأسبوعية المحفوظة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clotures.map((clo, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{clo.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">تاريخ الإقفال: {clo.date}</span>
                  </div>
                  <button
                    onClick={() => setSelectedClotureToPrint(clo)}
                    className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>عرض الوصل</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-white p-2 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[9px]">صافي الربح</span>
                    <span className="font-bold font-mono text-emerald-700">{clo.net_profit.toLocaleString()} دج</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">سحب رياض (30%)</span>
                    <span className="font-bold font-mono text-amber-700">{clo.riad_withdrawn.toLocaleString()} دج</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">سحب زكرياء (30%)</span>
                    <span className="font-bold font-mono text-blue-700">{clo.zakaria_withdrawn.toLocaleString()} دج</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                  <span>المتبقي في الخزينة: <strong className="text-slate-900 font-mono">{clo.remaining_vault.toLocaleString()} دج</strong></span>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف إقفال (${clo.title})؟`)) {
                        onDeleteCloture(clo.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">سحب أرباح جديد (Retrait)</h3>
                  <p className="text-[11px] text-slate-400">يخصم من حصة الشريك ومن الرصيد الإجمالي للخزينة</p>
                </div>
              </div>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Partner Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الشريك المستفيد *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawPartner('Riad')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      withdrawPartner === 'Riad'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    رياض (30%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawPartner('Zakaria')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      withdrawPartner === 'Zakaria'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    زكرياء (30%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawPartner('Project')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      withdrawPartner === 'Project'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    المشروع (40%)
                  </button>
                </div>

                {/* Available Balance Reminder */}
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">الرصيد المتاح حالياً للمستفيد:</span>
                  <span className="font-extrabold font-mono text-emerald-600 text-sm">
                    {withdrawPartner === 'Riad' && `${riadBalance.toLocaleString()} دج`}
                    {withdrawPartner === 'Zakaria' && `${zakariaBalance.toLocaleString()} دج`}
                    {withdrawPartner === 'Project' && `${projectBalance.toLocaleString()} دج`}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المراد سحبه (دج) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="مثال: 15000"
                  className="w-full px-3 py-2 text-sm font-black font-mono text-slate-900 border rounded-xl"
                />
                {parseFloat(withdrawAmount) > (withdrawPartner === 'Riad' ? riadBalance : withdrawPartner === 'Zakaria' ? zakariaBalance : projectBalance) && (
                  <p className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>تنبيه: المبلغ المطلوب أكبر من الرصيد المتاح لهذا الشريك!</span>
                  </p>
                )}
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السحب</label>
                  <input
                    type="date"
                    value={withdrawDate}
                    onChange={(e) => setWithdrawDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-white"
                  >
                    <option value="Cash">نقداً (Cash)</option>
                    <option value="BaridiMob">بريدي موب (BaridiMob)</option>
                    <option value="CCP">حساب بريدي (CCP)</option>
                    <option value="Banque">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات / سبب السحب</label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="سحب دفعة أرباح شخصية، تحويل..."
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  تأكيد وخصم السحب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOTURE MODAL */}
      {isClotureOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">تقفيل الدورة المالية (Clôture de Période)</h3>
                  <p className="text-[11px] text-slate-400">حفظ لقطة رسمية للأرباح، حصص الشركاء، والمبالغ المسحوبة</p>
                </div>
              </div>
              <button onClick={() => setIsClotureOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClotureSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم أو عنوان الإقفال *</label>
                <input
                  type="text"
                  required
                  value={clotureTitle}
                  onChange={(e) => setClotureTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              {/* Summary snapshot review */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">
                  ملخص الأرقام في تاريخ اليوم ({new Date().toISOString().slice(0, 10)}):
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">إجمالي المداخيل:</span>
                  <span className="font-bold font-mono">{effectiveRevenue.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">إجمالي المصاريف:</span>
                  <span className="font-bold font-mono text-rose-600">{totalExpenses.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="font-bold text-slate-800">صافي الربح الإجمالي:</span>
                  <span className="font-black font-mono text-emerald-700">{netProfitTotal.toLocaleString()} دج</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-[10px]">
                  <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                    <span className="block text-amber-800 font-bold">رياض (30%)</span>
                    <span className="font-mono">{riadShareEarned.toLocaleString()} دج</span>
                  </div>
                  <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-200">
                    <span className="block text-blue-800 font-bold">زكرياء (30%)</span>
                    <span className="font-mono">{zakariaShareEarned.toLocaleString()} دج</span>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    <span className="block text-emerald-800 font-bold">المشروع (40%)</span>
                    <span className="font-mono">{projectShareEarned.toLocaleString()} دج</span>
                  </div>
                </div>
                <div className="flex justify-between pt-1 text-slate-500">
                  <span>إجمالي السحوبات السابقة:</span>
                  <span className="font-bold font-mono text-rose-600">- {totalAllWithdrawn.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t">
                  <span>الرصيد المتبقي في الخزينة:</span>
                  <span className="font-mono text-emerald-700">{remainingVaultProfits.toLocaleString()} دج</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الإقفال</label>
                <input
                  type="text"
                  value={clotureNotes}
                  onChange={(e) => setClotureNotes(e.target.value)}
                  placeholder="تم تسليم الأرباح نقداً والاتفاق على الرصيد المرحّل..."
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsClotureOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>تأكيد وحفظ الإقفال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE BON DE CLÔTURE MODAL */}
      {selectedClotureToPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
            {/* Header / Actions */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-sm">وصل إقفال الدورة المالية والشركاء (Procès-Verbal)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 sm:px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setSelectedClotureToPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white overflow-y-auto flex-1 font-sans">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-900">ZR FACTORY</span>
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">DTF PRINT</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    محضر تقفيل الحسابات وتوزيع أرباح الشركاء (30% / 30% / 40%)
                  </p>
                </div>
                <div className="text-left font-mono text-xs">
                  <div className="font-black text-sm text-brand-750">CLÔTURE N°: {selectedClotureToPrint.id}</div>
                  <div className="text-slate-500">التاريخ: {selectedClotureToPrint.date}</div>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900">{selectedClotureToPrint.title}</h3>
                {selectedClotureToPrint.notes && (
                  <p className="text-xs text-slate-500 mt-1 italic">{selectedClotureToPrint.notes}</p>
                )}
              </div>

              {/* Table of Distribution */}
              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">الطرف / الشريك</th>
                      <th className="py-2.5 px-3 text-center">النسبة</th>
                      <th className="py-2.5 px-3">الأرباح المستحقة</th>
                      <th className="py-2.5 px-3">المبالغ المسحوبة</th>
                      <th className="py-2.5 px-3">الرصيد المتبقي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-amber-900">رياض (Riad)</td>
                      <td className="py-2.5 px-3 text-center font-bold">30%</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{selectedClotureToPrint.riad_share.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">- {selectedClotureToPrint.riad_withdrawn.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-700">{selectedClotureToPrint.riad_balance.toLocaleString()} دج</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-blue-900">زكرياء (Zakaria)</td>
                      <td className="py-2.5 px-3 text-center font-bold">30%</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{selectedClotureToPrint.zakaria_share.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">- {selectedClotureToPrint.zakaria_withdrawn.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-700">{selectedClotureToPrint.zakaria_balance.toLocaleString()} دج</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-emerald-900">صندوق الورشة والمشروع</td>
                      <td className="py-2.5 px-3 text-center font-bold">40%</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{selectedClotureToPrint.project_share.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600 font-bold">- {selectedClotureToPrint.project_withdrawn.toLocaleString()} دج</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-700">{selectedClotureToPrint.project_balance.toLocaleString()} دج</td>
                    </tr>
                    <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
                      <td className="py-3 px-3">المجموع الكلي</td>
                      <td className="py-3 px-3 text-center">100%</td>
                      <td className="py-3 px-3 font-mono text-slate-900">{selectedClotureToPrint.net_profit.toLocaleString()} دج</td>
                      <td className="py-3 px-3 font-mono text-rose-600">- {selectedClotureToPrint.total_withdrawn.toLocaleString()} دج</td>
                      <td className="py-3 px-3 font-mono text-emerald-700">{selectedClotureToPrint.remaining_vault.toLocaleString()} دج</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 text-center h-28 flex flex-col justify-between">
                  <span className="font-bold text-slate-700">توقيع ومصادقة: رياض (Riad)</span>
                  <div className="border-b border-dashed border-slate-300"></div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 text-center h-28 flex flex-col justify-between">
                  <span className="font-bold text-slate-700">توقيع ومصادقة: زكرياء (Zakaria)</span>
                  <div className="border-b border-dashed border-slate-300"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
