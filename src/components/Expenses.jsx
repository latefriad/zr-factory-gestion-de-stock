import React, { useState } from 'react';
import { 
  TrendingDown, 
  PlusCircle, 
  Search, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Tag, 
  Edit2,
  Trash2,
  X 
} from 'lucide-react';

export function Expenses({ data, t, onAddExpense, onEditExpense, onDeleteExpense, isSubmitting }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [category, setCategory] = useState('Consommables');
  const [description, setDescription] = useState('');
  const [amountDA, setAmountDA] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const expenses = data.expenses || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.Amount_DA) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amountDA) return;
    onAddExpense({
      date,
      category,
      description: description.trim(),
      amount_da: parseFloat(amountDA) || 0,
      payment_method: paymentMethod
    });
    setIsAddOpen(false);
    setDescription('');
    setAmountDA('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    onEditExpense(editingExpense);
    setEditingExpense(null);
  };

  const handleDelete = (id, desc) => {
    if (window.confirm(`هل أنت متأكد من حذف هذا المصروف (${desc})؟`)) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 shrink-0" />
            <span>{t.expenses} وتكاليف المصنع</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تسجيل وتعديل فواتير الشراء، الكهرباء، الكراء، الصيانة، وأجور العمال
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addExpenseBtn}</span>
        </button>
      </div>

      {/* Total Expenses Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-rose-800 text-white p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-[11px] sm:text-xs text-rose-200 font-bold uppercase">إجمالي مصاريف المصنع المسجلة</span>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1">
            {totalExpenses.toLocaleString()} <span className="text-sm font-semibold">{t.currency}</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-rose-200" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">رقم المصروف</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">الصنف</th>
                <th className="py-3 px-4">الوصف</th>
                <th className="py-3 px-4">المبلغ (دج)</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4 text-center">تعديل / حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {exp.ID}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {exp.Date ? exp.Date.slice(0, 10) : '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
                      {exp.Category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {exp.Description}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm">
                    {parseFloat(exp.Amount_DA || 0).toLocaleString()} {t.currency}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    {exp.Payment_Method || 'Cash'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        title="تعديل المصروف"
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.ID, exp.Description)}
                        title="حذف المصروف"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    لم يتم تسجيل أي مصاريف بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT EXPENSE MODAL */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-rose-600" />
                <span>تعديل المصروف: {editingExpense.ID}</span>
              </h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                <select
                  value={editingExpense.Category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, Category: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                >
                  <option value="Marketing & Ads">1. تسويق وإعلانات ممولة (Meta Ads / TikTok Ads)</option>
                  <option value="Blanks">2. شراء ملابس خام (T-shirts / Hoodies)</option>
                  <option value="Consommables">3. مستلزمات DTF (أفلام، بودرة، أحبار)</option>
                  <option value="Emballage">4. أكياس وشحن وتغليف (Packaging)</option>
                  <option value="Salaries">5. أجور ورواتب العمال (Salaires)</option>
                  <option value="Electricity">6. كهرباء وغاز (Énergie)</option>
                  <option value="Rent">7. إيجار المصنع (Loyer)</option>
                  <option value="Maintenance">8. صيانة آلات وطابعات</option>
                  <option value="Other">9. مصاريف عامة أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف المصروف</label>
                <input
                  type="text"
                  required
                  value={editingExpense.Description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, Description: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (دج)</label>
                  <input
                    type="number"
                    required
                    value={editingExpense.Amount_DA}
                    onChange={(e) => setEditingExpense({ ...editingExpense, Amount_DA: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-extrabold text-rose-600 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={editingExpense.Payment_Method}
                    onChange={(e) => setEditingExpense({ ...editingExpense, Payment_Method: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  >
                    <option value="Cash">نقداً (Cash)</option>
                    <option value="BaridiMob">بريدي موب (BaridiMob)</option>
                    <option value="CCP">حساب بريدي (CCP)</option>
                    <option value="Banque">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-rose-700 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                <span>{t.addExpenseBtn}</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                >
                  <option value="Marketing & Ads">1. تسويق وإعلانات ممولة (Meta Ads / TikTok Ads)</option>
                  <option value="Blanks">2. شراء ملابس خام (T-shirts / Hoodies)</option>
                  <option value="Consommables">3. مستلزمات DTF (أفلام، بودرة، أحبار)</option>
                  <option value="Emballage">4. أكياس وشحن وتغليف (Packaging)</option>
                  <option value="Salaries">5. أجور ورواتب العمال (Salaires)</option>
                  <option value="Electricity">6. كهرباء وغاز (Énergie)</option>
                  <option value="Rent">7. إيجار المصنع (Loyer)</option>
                  <option value="Maintenance">8. صيانة آلات وطابعات</option>
                  <option value="Other">9. مصاريف عامة أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف المصروف *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: فاتورة كهرباء شهر أكتوبر أو رول فيلم"
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (دج) *</label>
                  <input
                    type="number"
                    required
                    value={amountDA}
                    onChange={(e) => setAmountDA(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2 text-sm font-extrabold text-rose-600 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  >
                    <option value="Cash">نقداً (Cash)</option>
                    <option value="BaridiMob">بريدي موب (BaridiMob)</option>
                    <option value="CCP">حساب بريدي (CCP)</option>
                    <option value="Banque">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'جاري الحفظ...' : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
