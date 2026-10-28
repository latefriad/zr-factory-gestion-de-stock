import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  DollarSign,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export function Clients({ data, t, onAddClient, onEditClient, onDeleteClient, isSubmitting }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);

  // New Client Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Alger');
  const [notes, setNotes] = useState('');

  const clients = data.clients || [];
  const orders = data.orders || [];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddClient({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      notes: notes.trim()
    });
    setIsAddClientOpen(false);
    setName('');
    setPhone('');
    setNotes('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingClient) return;
    onEditClient(editingClient);
    setEditingClient(null);
  };

  const handleDelete = (id, clientName) => {
    if (window.confirm(`هل أنت متأكد من حذف العميل (${clientName}) نهائياً؟`)) {
      onDeleteClient(id);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      (c.Name_or_Brand && c.Name_or_Brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.Phone && String(c.Phone).includes(searchQuery)) ||
      (c.City && c.City.toLowerCase().includes(searchQuery.toLowerCase()));
    const debt = parseFloat(c.Remaining_Debt_DA) || 0;
    const matchesDebt = filterDebtOnly ? debt > 0 : true;
    return matchesSearch && matchesDebt;
  });

  const totalMarketDebt = clients.reduce((sum, c) => sum + (parseFloat(c.Remaining_Debt_DA) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 shrink-0" />
            <span>{t.clients} ودفتر الديون</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            سجل كامل للعلامات التجارية والزبائن مع تتبع المبالغ غير المسددة
          </p>
        </div>

        <button
          onClick={() => setIsAddClientOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addClient}</span>
        </button>
      </div>

      {/* Debt Summary Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900">مجموع ديون المصنع العالقة عند الزبائن</div>
            <div className="text-lg font-extrabold text-amber-700">
              {totalMarketDebt.toLocaleString()} {t.currency}
            </div>
          </div>
        </div>

        <button
          onClick={() => setFilterDebtOnly(!filterDebtOnly)}
          className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition border text-center ${
            filterDebtOnly 
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
              : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
        >
          {filterDebtOnly ? 'عرض كل العملاء' : 'فلترة: العملاء المدينين فقط'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم، الماركة، رقم الهاتف، أو الولاية..."
          className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, idx) => {
          const debt = parseFloat(client.Remaining_Debt_DA) || 0;
          const totalSpent = parseFloat(client.Total_Spent_DA) || 0;
          const clientOrders = orders.filter(o => o.Client_Name && o.Client_Name.trim().toLowerCase() === client.Name_or_Brand.trim().toLowerCase());

          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {client.Name_or_Brand}
                  </h3>
                  <div className="flex items-center gap-1">
                    {debt > 0 ? (
                      <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                        دين: {debt.toLocaleString()} {t.currency}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                        خالص
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {client.Phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${client.Phone}`} className="hover:text-brand-600 font-mono font-semibold">
                        {client.Phone}
                      </a>
                    </div>
                  )}
                  {client.City && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.City}</span>
                    </div>
                  )}
                  {client.Notes && (
                    <div className="text-[11px] text-slate-400 italic">
                      "{client.Notes}"
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">الطلبات</div>
                    <div className="font-extrabold text-slate-800">{clientOrders.length || client.Total_Orders || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">إجمالي المشتريات</div>
                    <div className="font-extrabold text-brand-600">{totalSpent.toLocaleString()} {t.currency}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                <button
                  onClick={() => setSelectedClientHistory({ client, orders: clientOrders })}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>السجل ({clientOrders.length})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingClient(client)}
                    title="تعديل العميل"
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.ID, client.Name_or_Brand)}
                    title="حذف العميل"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا يوجد عملاء مطابقين للبحث.
          </div>
        )}
      </div>

      {/* EDIT CLIENT MODAL */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-600" />
                <span>تعديل العميل: {editingClient.Name_or_Brand}</span>
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل / Brand *</label>
                <input
                  type="text"
                  required
                  value={editingClient.Name_or_Brand}
                  onChange={(e) => setEditingClient({ ...editingClient, Name_or_Brand: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                <input
                  type="text"
                  value={editingClient.Phone}
                  onChange={(e) => setEditingClient({ ...editingClient, Phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / الولاية</label>
                <input
                  type="text"
                  value={editingClient.City}
                  onChange={(e) => setEditingClient({ ...editingClient, City: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تعديل مبلغ الدين المتبقي (دج)</label>
                <input
                  type="number"
                  value={editingClient.Remaining_Debt_DA}
                  onChange={(e) => setEditingClient({ ...editingClient, Remaining_Debt_DA: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-extrabold text-rose-600 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={editingClient.Notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, Notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Orders History Modal */}
      {selectedClientHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  سجل طلبات: {selectedClientHistory.client.Name_or_Brand}
                </h3>
                <p className="text-xs text-slate-500">
                  الهاتف: {selectedClientHistory.client.Phone || '-'} | المدينة: {selectedClientHistory.client.City || '-'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedClientHistory(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {selectedClientHistory.orders.map((ord, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">
                      {ord.Order_ID} - {ord.Blank_Item}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ord.Date ? ord.Date.slice(0, 10) : ''} | كمية: {ord.Quantity} | {ord.Print_Details}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">
                      {parseFloat(ord.Total_Price_DA || 0).toLocaleString()} {t.currency}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      حالة: {ord.Status}
                    </div>
                  </div>
                </div>
              ))}
              {selectedClientHistory.orders.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">لا توجد طلبات مسجلة بعد لهذا العميل.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900">{t.addClient}</h3>
              <button onClick={() => setIsAddClientOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل / Brand *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: Alpha Brand"
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0550123456"
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الولاية / المدينة</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Alger, Oran, Constantine..."
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تخفيض خاص، متجر إنستغرام، إلخ"
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
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
