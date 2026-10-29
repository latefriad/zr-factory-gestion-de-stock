import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Printer, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  Calculator,
  ArrowUpRight,
  Coins,
  Percent
} from 'lucide-react';

export function Dashboard({ 
  data, 
  t, 
  onNavigate, 
  onOpenNewOrder, 
  onOpenCalculator,
  onOpenNewExpense,
  onOpenAddStock
}) {
  const orders = data.orders || [];
  const blanks = data.stock_blanks || [];
  const consumables = data.stock_consumables || [];
  const expenses = data.expenses || [];
  const waste = data.waste || [];
  const clients = data.clients || [];

  // Financial Calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.Total_Price_DA) || 0), 0);
  const totalPaid = orders.reduce((sum, ord) => sum + (parseFloat(ord.Paid_Amount_DA) || 0), 0);
  const totalDebt = orders.reduce((sum, ord) => sum + (parseFloat(ord.Remaining_DA) || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.Amount_DA) || 0), 0);
  const totalLoss = waste.reduce((sum, wst) => sum + (parseFloat(wst.Loss_Cost_DA) || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalLoss;

  // Stock Market Valuation (Chiffre d'Affaires du Stock)
  const stockTotalPieces = blanks.reduce((sum, b) => sum + (parseFloat(b.Quantity) || 0), 0);
  const stockMarketCA = blanks.reduce((sum, b) => sum + ((parseFloat(b.Quantity) || 0) * (parseFloat(b.Unit_Price_DA) || 0)), 0);
  const stockCapitalCost = blanks.reduce((sum, b) => sum + ((parseFloat(b.Quantity) || 0) * (parseFloat(b.Unit_Cost_DA) || 0)), 0);
  const stockPotentialProfit = Math.max(0, stockMarketCA - stockCapitalCost);
  const stockMarginPct = stockMarketCA > 0 ? Math.round((stockPotentialProfit / stockMarketCA) * 100) : 0;

  // Operational KPIs according to POD Departments
  const confirmationOrders = orders.filter(o => o.Status?.includes('Confirmation') || o.Status === 'Pending' || o.Status === 'New');
  const inPrintOrders = orders.filter(o => o.Status === 'In Print' || o.Status?.includes('Print') || o.Status?.includes('طباعة'));
  const pressOrders = orders.filter(o => o.Status?.includes('Pressage') || o.Status?.includes('كبس'));
  const packagingOrders = orders.filter(o => o.Status?.includes('Packaging') || o.Status?.includes('QC') || o.Status?.includes('جودة'));
  const shippingOrders = orders.filter(o => o.Status?.includes('livraison') || o.Status === 'Ready' || o.Status?.includes('expédier'));
  const deliveredOrders = orders.filter(o => o.Status === 'Delivered' || o.Status?.includes('Livré'));
  const returnOrders = orders.filter(o => o.Status?.includes('Retour') || o.Status?.includes('مرتجع'));

  // Low stock alerts
  const lowStockBlanks = blanks.filter(b => parseFloat(b.Quantity) <= parseFloat(b.Min_Alert || 5));
  const lowStockConsumables = consumables.filter(c => parseFloat(c.Quantity) <= parseFloat(c.Min_Alert || 2));
  const totalAlerts = lowStockBlanks.length + lowStockConsumables.length;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            نظام تشغيل المصنع الذكي
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            مرحباً بك في {t.factoryName} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            متابعة فورية للمخزون، طباعة الـ DTF، فواتير العملاء، والتحليل المالي الدقيق للأرباح والمصاريف.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenNewOrder}
            className="flex-1 sm:flex-initial px-4 py-2 sm:py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.newOrderBtn}</span>
          </button>
          <button
            onClick={onOpenCalculator}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.openCalculator}</span>
          </button>
          <button
            onClick={onOpenNewExpense}
            className="w-full sm:w-auto px-3 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-rose-300 border border-white/15 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>{t.addExpenseBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">{t.totalRevenue}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-bold">{t.currency}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">محصل: {totalPaid.toLocaleString()} {t.currency}</span>
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">{t.totalExpenses}</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {totalExpenses.toLocaleString()} <span className="text-xs text-slate-500 font-bold">{t.currency}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            شامل السلعة، المواد والتشغيل
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">{t.netProfit}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netProfit.toLocaleString()} <span className="text-xs text-slate-500 font-bold">{t.currency}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            الأرباح الصافية الحقيقية للمصنع
          </p>
        </div>

        {/* Remaining Debts in Market */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">{t.remainingDebts}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {totalDebt.toLocaleString()} <span className="text-xs text-slate-500 font-bold">{t.currency}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>ديون متبقية بذمة الزبائن</span>
          </p>
        </div>

      </div>

      {/* Stock Market Valuation Banner (Chiffre d'Affaires du Stock & Valeur Marchande) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-indigo-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                رقم أعمال المخزون المتوفر (Chiffre d'Affaires du Stock)
              </h3>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                {stockTotalPieces} قطعة بالمستودع
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>القيمة السوقية للبيع (CA Marchand): <strong className="text-amber-300 font-mono text-sm">{stockMarketCA.toLocaleString()} دج</strong></span>
              <span>•</span>
              <span>رأس المال المستثمر (Capital): <strong className="text-slate-300 font-mono">{stockCapitalCost.toLocaleString()} دج</strong></span>
              <span>•</span>
              <span>الأرباح المتوقعة عند البيع: <strong className="text-emerald-400 font-mono">+{stockPotentialProfit.toLocaleString()} دج (+{stockMarginPct}%)</strong></span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('stock')}
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
        >
          <span>تفاصيل مخزون المنتجات</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Partners Profit Sharing Quick Preview Banner (30% / 30% / 40%) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                توزيع أرباح الشركاء (30% / 30% / 40%)
              </h3>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                مباشر
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              رياض: <strong className="text-amber-800 font-mono">{Math.round(Math.max(0, netProfit) * 0.30).toLocaleString()} دج (30%)</strong> | 
              زكرياء: <strong className="text-blue-800 font-mono">{Math.round(Math.max(0, netProfit) * 0.30).toLocaleString()} دج (30%)</strong> | 
              المشروع: <strong className="text-emerald-800 font-mono">{Math.round(Math.max(0, netProfit) * 0.40).toLocaleString()} دج (40%)</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('partners')}
          className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <span>إدارة السحوبات والتقفيل (Clôture)</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Production Pipeline Status Cards (6 POD Operational Stages) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span className="flex items-center gap-1.5 font-extrabold text-slate-900">
            <span>خط سير أقسام المصنع (POD Pipeline)</span>
          </span>
          <span className="text-slate-400 font-medium">متابعة الطلبات عبر مراحل الإنتاج والشحن والتحصيل</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* 1. Confirmation */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">1. الهاتف (CRM)</span>
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                {confirmationOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">تأكيد الطلبات</div>
          </div>

          {/* 2. DTF Print */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">2. الطباعة DTF</span>
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">
                {inPrintOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-indigo-900">تحت آلة الطباعة</div>
          </div>

          {/* 3. Heat Press */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-orange-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">3. الكبس</span>
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 text-xs font-black flex items-center justify-center">
                {pressOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-orange-950">محطة التثبيت الحراري</div>
          </div>

          {/* 4. QC & Packaging */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">4. الجودة (QC)</span>
              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">
                {packagingOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-purple-950">الفحص والتغليف</div>
          </div>

          {/* 5. Shipping */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">5. الشحن</span>
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">
                {shippingOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-blue-950">مع شركة التوصيل</div>
          </div>

          {/* 6. Delivered & COD */}
          <div 
            onClick={() => onNavigate('orders')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">6. التحصيل COD</span>
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                {deliveredOrders.length}
              </span>
            </div>
            <div className="text-xs font-extrabold text-emerald-900">مسلّم ومحصّل</div>
          </div>

        </div>
      </div>

      {/* Stock Alerts & Quick Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Printer className="w-4 h-4 text-brand-600" />
              <span>{t.recentOrders}</span>
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-xs text-right min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">رقم الطلب</th>
                  <th className="py-2.5 px-3">العميل</th>
                  <th className="py-2.5 px-3">المنتج الخام</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">المبلغ (دج)</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((ord, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {ord.Order_ID}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {ord.Client_Name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {ord.Blank_Item} {ord.Color ? `(${ord.Color} - ${ord.Size})` : ''}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-800">
                      {ord.Quantity}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {parseFloat(ord.Total_Price_DA || 0).toLocaleString()} {t.currency}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        ord.Status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.Status === 'In Print' ? 'bg-indigo-100 text-indigo-800' :
                        ord.Status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.Status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      لا توجد طلبات مسجلة بعد. اضغط على "+ طلب جديد" للبدء.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Low Stock Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${totalAlerts > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
                <span>{t.lowStockAlerts}</span>
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${totalAlerts > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                {totalAlerts} تنبيه
              </span>
            </div>

            <div className="space-y-2.5">
              {lowStockBlanks.map((b, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-rose-950">{b.Item_Name}</div>
                    <div className="text-[11px] text-rose-700 font-semibold">{b.Color} - مقاس {b.Size}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-700">{b.Quantity} قطع فقط</span>
                  </div>
                </div>
              ))}

              {lowStockConsumables.map((c, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-amber-950">{c.Item_Name}</div>
                    <div className="text-[11px] text-amber-700">{c.Category}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-700">{c.Quantity} {c.Unit}</span>
                  </div>
                </div>
              ))}

              {totalAlerts === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <span>المخزون ممتاز وفي المستويات الآمنة!</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('stock')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Package className="w-4 h-4 text-slate-600" />
              <span>إدارة وتوريد المخزون</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
