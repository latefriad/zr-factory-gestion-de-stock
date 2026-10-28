import React, { useState } from 'react';
import { 
  Calculator, 
  X, 
  Layers, 
  Ruler, 
  Coins, 
  Box, 
  Sparkles, 
  Plus,
  Trash2
} from 'lucide-react';
import { calculateDtfPrint } from '../utils/dtfCalculator';

export function DtfCalculatorModal({ isOpen, onClose, t, onApplyToOrder }) {
  const [logos, setLogos] = useState([
    { id: 1, position: 'الصدر (Poitrine)', widthCm: 12, heightCm: 12 },
    { id: 2, position: 'الظهر (Dos)', widthCm: 28, heightCm: 35 }
  ]);

  const [meterPriceDA, setMeterPriceDA] = useState(1500);
  const [quantity, setQuantity] = useState(10);
  const [blankCostDA, setBlankCostDA] = useState(650);
  const [emballageCostDA, setEmballageCostDA] = useState(50);
  const [pressLaborDA, setPressLaborDA] = useState(50);
  const [sellingPriceDA, setSellingPriceDA] = useState(1600);

  if (!isOpen) return null;

  const handleAddLogo = () => {
    const nextId = logos.length + 1;
    let defaultPos = `لوجو ${nextId}`;
    if (nextId === 3) defaultPos = 'الكم الأيمن (Manche D)';
    if (nextId === 4) defaultPos = 'الكم الأيسر (Manche G)';
    if (nextId === 5) defaultPos = 'شعار العنق (Col / Nuque)';

    setLogos([
      ...logos,
      { id: Date.now(), position: defaultPos, widthCm: 10, heightCm: 10 }
    ]);
  };

  const handleRemoveLogo = (id) => {
    if (logos.length <= 1) return;
    setLogos(logos.filter(l => l.id !== id));
  };

  const handleUpdateLogo = (id, field, value) => {
    setLogos(logos.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const result = calculateDtfPrint({
    logos,
    meterPriceDA,
    rollWidthCm: 58,
    quantity,
    blankCostDA,
    emballageCostDA,
    pressLaborDA,
    sellingPriceDA
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-xl">
                حاسبة أمتار وتكلفة الـ DTF (عدة شعارات)
              </h3>
              <p className="text-[11px] sm:text-xs text-brand-200 line-clamp-1">
                حساب التكلفة لـ 1، 2، 3 أو 5 لوجوهات في نفس التيشيرت أو الهودي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto flex-1">
          
          {/* Inputs Section */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-brand-600" />
                الشعارات على القطعة ({logos.length} لوجو)
              </h4>

              <button
                type="button"
                onClick={handleAddLogo}
                className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ لوجو آخر</span>
              </button>
            </div>

            {/* Logos Builder */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {logos.map((logo, idx) => {
                const area = (parseFloat(logo.widthCm) || 0) * (parseFloat(logo.heightCm) || 0);
                const cost = Math.round(area * (meterPriceDA / 5800));

                return (
                  <div key={logo.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-indigo-900 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 text-[10px] flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={logo.position}
                          onChange={(e) => handleUpdateLogo(logo.id, 'position', e.target.value)}
                          className="bg-transparent border-b border-dashed border-slate-300 text-xs font-bold px-1 outline-none w-32 focus:border-indigo-600"
                        />
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-indigo-700">
                          {cost} {t.currency}
                        </span>
                        {logos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLogo(logo.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="58"
                          value={logo.widthCm}
                          onChange={(e) => handleUpdateLogo(logo.id, 'widthCm', e.target.value)}
                          className="w-14 px-1.5 py-1 text-center font-bold border rounded bg-white"
                        />
                        <span className="text-[10px] text-slate-500">عرض (سم)</span>
                      </div>
                      <span>×</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={logo.heightCm}
                          onChange={(e) => handleUpdateLogo(logo.id, 'heightCm', e.target.value)}
                          className="w-14 px-1.5 py-1 text-center font-bold border rounded bg-white"
                        />
                        <span className="text-[10px] text-slate-500">ارتفاع (سم)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mr-auto">({area} سم²)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity & Meter Price */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.quantity} (عدد القطع)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سعر المتر DTF (دج)
                </label>
                <input
                  type="number"
                  value={meterPriceDA}
                  onChange={(e) => setMeterPriceDA(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* Extra Costs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  التيشيرت الخام
                </label>
                <input
                  type="number"
                  value={blankCostDA}
                  onChange={(e) => setBlankCostDA(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  التغليف (Sac)
                </label>
                <input
                  type="number"
                  value={emballageCostDA}
                  onChange={(e) => setEmballageCostDA(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                  الكبس والمصنعية
                </label>
                <input
                  type="number"
                  value={pressLaborDA}
                  onChange={(e) => setPressLaborDA(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold border rounded-lg"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                سعر البيع المقترح للقطعة (دج)
              </label>
              <input
                type="number"
                value={sellingPriceDA}
                onChange={(e) => setSellingPriceDA(e.target.value)}
                className="w-full px-3 py-2 text-sm font-extrabold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Results Summary Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                <span>النتيجة الإجمالية للقطعة</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {logos.length} شعارات / قطعة
                </span>
              </h4>

              {/* Area & Meter Metrics */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي مساحة الشعارات بالقطعة:</span>
                  <span className="font-bold text-slate-900">{result.totalAreaPerPieceCm2} سم²</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي أمتار DTF للطلبية ({quantity} قطع):</span>
                  <span className="font-bold text-purple-700">{result.totalLinearMeters} متر (رول 58سم)</span>
                </div>
              </div>

              {/* Cost breakdown per unit */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>تكلفة طباعة الـ DTF (لكل الشعارات):</span>
                  <span className="font-bold text-indigo-700">{result.dtfUnitCost} {t.currency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>سعر التيشيرت الخام:</span>
                  <span className="font-bold text-slate-900">{result.blankCost} {t.currency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>التغليف والكبس:</span>
                  <span className="font-bold text-slate-900">{result.emballageCost + result.pressCost} {t.currency}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold pt-1.5 border-t border-slate-100 text-sm">
                  <span>التكلفة الإجمالية للقطعة الواحدة:</span>
                  <span className="text-rose-600">{result.totalUnitCost} {t.currency}</span>
                </div>
              </div>

              {/* Revenue & Profit Banner */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-emerald-100 font-medium">إجمالي المدخول ({quantity} قطع):</span>
                  <span className="text-sm font-bold">{result.totalRevenue.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-100 font-medium">صافي الربح المتوقع:</span>
                  <span className="text-xl font-extrabold text-amber-300">
                    + {result.estimatedProfit.toLocaleString()} {t.currency}
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    هامش ربح: {result.profitMarginPercent}%
                  </span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-2">
              {onApplyToOrder && (
                <button
                  onClick={() => {
                    onApplyToOrder({
                      logos,
                      quantity,
                      dtfCost: result.dtfUnitCost,
                      blankCost: result.blankCost,
                      emballageCost: result.emballageCost,
                      unitSellingPrice: result.actualSellingPrice,
                      totalPrice: result.totalRevenue
                    });
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تطبيق الحساب على طلب جديد</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                {t.cancel}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
