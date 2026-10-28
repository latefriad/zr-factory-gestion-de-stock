import React from 'react';
import { Printer, X, CheckCircle, Download } from 'lucide-react';

export function InvoiceModal({ order, isOpen, onClose, t }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const total = parseFloat(order.Total_Price_DA || 0);
  const paid = parseFloat(order.Paid_Amount_DA || 0);
  const remaining = parseFloat(order.Remaining_DA || (total - paid));

  // Safely extract items array whether stored as Array or JSON string
  const orderItemsList = Array.isArray(order.items)
    ? order.items
    : (typeof order.items === 'string' && order.items.trim().startsWith('[')
        ? (() => { try { return JSON.parse(order.items); } catch(e) { return []; } })()
        : []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
        
        {/* Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span className="font-extrabold text-xs sm:text-sm truncate">معاينة وصل التسليم (Bon de Livraison)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 text-slate-900 bg-white overflow-y-auto flex-1" id="printable-receipt">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 sm:pb-5 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">ZR FACTORY</span>
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">DTF PRO</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                طباعة وتخصيص الملابس عند الطلب (Print on Demand)
              </p>
              <p className="text-[11px] text-slate-400">
                الهاتف: 0550 00 00 00 | الجزائر العاصمة
              </p>
            </div>

            <div className="text-left">
              <span className="text-lg font-black uppercase text-brand-700 block">
                BON DE LIVRAISON
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 block">
                N°: {order.Order_ID}
              </span>
              <span className="text-[11px] text-slate-500 block">
                التاريخ: {order.Date ? order.Date.slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </span>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">العميل / العلامة التجارية:</span>
              <span className="font-extrabold text-sm text-slate-900">{order.Client_Name}</span>
              {order.Client_Phone && (
                <span className="block text-slate-600 font-mono mt-0.5">{order.Client_Phone}</span>
              )}
            </div>
            <div className="text-left">
              <span className="text-slate-400 font-bold block mb-0.5">حالة الطلبية:</span>
              <span className="font-extrabold text-slate-800 uppercase">{order.Status || 'Validé'}</span>
              {order.Notes && (
                <span className="block text-[11px] text-slate-500 mt-0.5">{order.Notes}</span>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase">
                <th className="py-2 px-2 text-right">المنتج والتفاصيل</th>
                <th className="py-2 px-2 text-center">الكمية</th>
                <th className="py-2 px-2 text-left">سعر الوحدة (دج)</th>
                <th className="py-2 px-2 text-left">المجموع (دج)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orderItemsList.length > 0 ? (
                orderItemsList.map((it, idx) => {
                  const qty = parseInt(it.quantity) || 1;
                  const unitPr = parseFloat(it.unitSellingPrice || (total / (order.Quantity || 1)));
                  const lineTotal = unitPr * qty;

                  return (
                    <tr key={idx}>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-900">{it.productName || it.product || order.Blank_Item}</div>
                        <div className="text-[11px] text-slate-500">
                          اللون: <span className="font-bold text-slate-800">{it.color}</span> | المقاس: <span className="font-bold text-slate-800">{it.size}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-extrabold text-sm font-mono">
                        {qty}
                      </td>
                      <td className="py-2.5 px-2 text-left font-bold font-mono">
                        {unitPr.toLocaleString()} {t.currency}
                      </td>
                      <td className="py-2.5 px-2 text-left font-extrabold text-slate-900 font-mono">
                        {lineTotal.toLocaleString()} {t.currency}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900">{order.Blank_Item}</div>
                    <div className="text-[11px] text-slate-500">
                      {order.Color ? `${order.Color} - مقاس ${order.Size}` : ''} | {order.Print_Details}
                    </div>
                    {order.Design_Ref && (
                      <div className="text-[10px] text-slate-400">التصميم: {order.Design_Ref}</div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-extrabold text-sm">
                    {order.Quantity}
                  </td>
                  <td className="py-3 px-2 text-left font-bold">
                    {(total / (order.Quantity || 1)).toLocaleString()} {t.currency}
                  </td>
                  <td className="py-3 px-2 text-left font-extrabold text-slate-900">
                    {total.toLocaleString()} {t.currency}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total & Debt Breakdown */}
          <div className="border-t-2 border-slate-900 pt-3 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المبلغ الإجمالي:</span>
                <span className="font-extrabold text-slate-900 text-sm">{total.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>التسبيق المدفوع:</span>
                <span>{paid.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-extrabold text-sm pt-1 border-t border-slate-200">
                <span>المتبقي للدفع (Reste):</span>
                <span>{remaining.toLocaleString()} {t.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
            <div>
              <span className="font-bold text-slate-500 block mb-12">توقيع واستلام الزبون:</span>
              <div className="border-b border-slate-300 w-36 mx-auto"></div>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-12">ختم وإمضاء المصنع (ZR FACTORY):</span>
              <div className="border-b border-slate-300 w-36 mx-auto"></div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-4">
            شكراً لتعاملكم مع ZR Factory • جودة الطباعة ودقة المواعيد
          </p>

        </div>

      </div>
    </div>
  );
}
