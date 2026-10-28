import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Printer, 
  Package, 
  Users, 
  TrendingDown, 
  Calculator,
  CheckCircle2,
  AlertCircle,
  Coins
} from 'lucide-react';

import { translations } from './translations';
import { 
  fetchAllData, 
  saveCacheData,
  addOrderApi, 
  editOrderApi,
  deleteOrderApi,
  updateOrderStatusApi, 
  addStockItemApi, 
  editStockItemApi,
  deleteStockItemApi,
  adjustStockQtyApi,
  addClientApi, 
  editClientApi,
  deleteClientApi,
  addExpenseApi, 
  editExpenseApi,
  deleteExpenseApi,
  addWasteApi,
  deleteWasteApi
} from './api';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Stock } from './components/Stock';
import { Clients } from './components/Clients';
import { Expenses } from './components/Expenses';
import { PartnersProfit } from './components/PartnersProfit';
import { DtfCalculatorModal } from './components/DtfCalculatorModal';
import { InvoiceModal } from './components/InvoiceModal';

export function App() {
  const [lang, setLang] = useState('ar');
  const t = translations[lang] || translations.ar;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Main Database State
  const [data, setData] = useState({
    stock_blanks: [],
    stock_consumables: [],
    clients: [],
    orders: [],
    expenses: [],
    waste: [],
    movements: []
  });

  // Partners Data (Withdrawals & Clôtures) persisted in localStorage
  const [partnersData, setPartnersData] = useState(() => {
    try {
      const saved = localStorage.getItem('zr_factory_partners_data');
      return saved ? JSON.parse(saved) : { withdrawals: [], clotures: [] };
    } catch (e) {
      return { withdrawals: [], clotures: [] };
    }
  });

  const savePartnersData = (updated) => {
    setPartnersData(updated);
    try {
      localStorage.setItem('zr_factory_partners_data', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save partners data', e);
    }
  };

  // Modals state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isNewOrderDirectOpen, setIsNewOrderDirectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const loadData = async () => {
    setIsSyncing(true);
    const res = await fetchAllData();
    if (res.data) {
      setData(res.data);
      const time = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastUpdated(time);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Helper to persist optimistic updates
  const updateLocalStateAndCache = (updater) => {
    setData(prev => {
      const next = updater(prev);
      saveCacheData(next);
      return next;
    });
  };

  // ------------------------------------------------
  // ORDER HANDLERS (Instant Front Update + Sheet Sync)
  // ------------------------------------------------
  const handleAddOrder = async (orderPayload) => {
    setIsSubmitting(true);
    
    // 1. Instant optimistic update on front
    const tempId = 'ORD-' + (data.orders.length + 1001);
    const newOrderObj = {
      Order_ID: tempId,
      Date: orderPayload.date,
      Client_Name: orderPayload.client_name,
      Client_Phone: orderPayload.client_phone,
      Blank_Item: orderPayload.blank_item,
      Color: orderPayload.color,
      Size: orderPayload.size,
      Quantity: orderPayload.quantity,
      Print_Details: orderPayload.print_details,
      Design_Ref: orderPayload.design_ref,
      Carrier: orderPayload.carrier,
      Tracking_Number: orderPayload.tracking_number,
      Total_Price_DA: orderPayload.total_price_da,
      Paid_Amount_DA: orderPayload.paid_amount_da,
      Remaining_DA: orderPayload.total_price_da - orderPayload.paid_amount_da,
      Status: orderPayload.status || 'En attente Confirmation',
      Notes: orderPayload.notes,
      items: orderPayload.items || []
    };

    updateLocalStateAndCache(prev => {
      let updatedBlanks = [...prev.stock_blanks];
      if (orderPayload.items && orderPayload.items.length > 0) {
        for (const it of orderPayload.items) {
          updatedBlanks = updatedBlanks.map(b => {
            if (
              b.Item_Name?.trim().toLowerCase() === it.productName?.trim().toLowerCase() &&
              b.Color?.trim().toLowerCase() === it.color?.trim().toLowerCase() &&
              b.Size?.trim().toLowerCase() === it.size?.trim().toLowerCase()
            ) {
              return {
                ...b,
                Quantity: Math.max(0, (parseInt(b.Quantity) || 0) - (parseInt(it.quantity) || 0))
              };
            }
            return b;
          });
        }
      } else {
        updatedBlanks = updatedBlanks.map(b => {
          if (
            b.Item_Name?.trim().toLowerCase() === orderPayload.blank_item?.trim().toLowerCase() &&
            b.Color?.trim().toLowerCase() === orderPayload.color?.trim().toLowerCase() &&
            b.Size?.trim().toLowerCase() === orderPayload.size?.trim().toLowerCase()
          ) {
            return {
              ...b,
              Quantity: Math.max(0, (parseInt(b.Quantity) || 0) - (parseInt(orderPayload.quantity) || 0))
            };
          }
          return b;
        });
      }

      return {
        ...prev,
        stock_blanks: updatedBlanks,
        orders: [newOrderObj, ...prev.orders]
      };
    });
    showToast('✅ تم تسجيل الطلب وخصم كميات المقاسات من المخزون!');

    // 2. Send to Google Sheets in background
    try {
      await addOrderApi(orderPayload);
      
      // Also sync individual variant decrements in background for 100% guarantee
      if (orderPayload.items && orderPayload.items.length > 0) {
        for (const it of orderPayload.items) {
          if (it.stockItemId) {
            adjustStockQtyApi('blank', it.stockItemId, -it.quantity).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn("Background sheet sync:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => loadData(), 2500);
    }
  };

  const handleEditOrder = async (updatedOrder) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      orders: prev.orders.map(o => String(o.Order_ID).trim() === String(updatedOrder.Order_ID).trim() ? updatedOrder : o)
    }));
    showToast('✅ تم حفظ تعديل الطلب');
    await editOrderApi(updatedOrder);
  };

  const handleDeleteOrder = async (orderId) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      orders: prev.orders.filter(o => String(o.Order_ID).trim() !== String(orderId).trim())
    }));
    showToast('🗑️ تم حذف الطلب بنجاح من الشاشة');
    await deleteOrderApi(orderId);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const targetOrder = data.orders.find(o => String(o.Order_ID).trim() === String(orderId).trim());
    
    // Return to stock automatically on Retour if order was not already a return
    if ((newStatus.includes('Retour') || newStatus.includes('مرتجع')) && targetOrder && !targetOrder.Status?.includes('Retour')) {
      if (targetOrder.items && targetOrder.items.length > 0) {
        for (const it of targetOrder.items) {
          const matchingBlank = data.stock_blanks.find(b => 
            b.Item_Name?.trim().toLowerCase() === it.productName?.trim().toLowerCase() &&
            b.Color?.trim().toLowerCase() === it.color?.trim().toLowerCase() &&
            b.Size?.trim().toLowerCase() === it.size?.trim().toLowerCase()
          );
          if (matchingBlank) {
            handleAdjustStockQty('blank', matchingBlank.ID, it.quantity);
          }
        }
        showToast(`📦 إدارة المرتجعات: تم استرجاع (${targetOrder.Quantity}) قطع لجميع المقاسات والألوان!`);
      } else if (targetOrder.Blank_Item) {
        const matchingBlank = data.stock_blanks.find(b => 
          b.Item_Name && b.Item_Name.trim() === targetOrder.Blank_Item.trim() &&
          (!targetOrder.Color || b.Color === targetOrder.Color) &&
          (!targetOrder.Size || b.Size === targetOrder.Size)
        );
        if (matchingBlank) {
          const qty = parseInt(targetOrder.Quantity) || 1;
          handleAdjustStockQty('blank', matchingBlank.ID, qty);
          showToast(`📦 إدارة المرتجعات: تم استرجاع (${qty}) قطع صالحة لمخزون الملابس الخام!`);
        }
      }
    }

    updateLocalStateAndCache(prev => ({
      ...prev,
      orders: prev.orders.map(o => String(o.Order_ID).trim() === String(orderId).trim() ? { ...o, Status: newStatus } : o)
    }));
    showToast(`✅ تم تحديث حالة الطلب إلى: ${newStatus}`);
    await updateOrderStatusApi(orderId, newStatus);
  };

  // ------------------------------------------------
  // STOCK HANDLERS
  // ------------------------------------------------
  const handleAddStockItem = async (type, item) => {
    setIsSubmitting(true);
    const key = type === 'blank' ? 'stock_blanks' : 'stock_consumables';
    const tempId = (type === 'blank' ? 'BLK-' : 'CSM-') + (data[key].length + 101);

    updateLocalStateAndCache(prev => ({
      ...prev,
      [key]: [{ ...item, ID: tempId, Quantity: item.quantity, Item_Name: item.item_name, Unit_Cost_DA: item.unit_cost_da, Unit_Price_DA: item.unit_price_da }, ...prev[key]]
    }));
    showToast('✅ تم إضافة المادة للمخزون');

    try {
      await addStockItemApi(type, item);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => loadData(), 2500);
    }
  };

  const handleEditStockItem = async (type, item) => {
    const key = type === 'blank' ? 'stock_blanks' : 'stock_consumables';
    updateLocalStateAndCache(prev => ({
      ...prev,
      [key]: prev[key].map(i => String(i.ID).trim() === String(item.ID).trim() ? item : i)
    }));
    showToast('✅ تم تحديث بيانات المادة في المخزون');
    await editStockItemApi(type, item);
  };

  const handleEditMasterProduct = async (oldName, updatedData) => {
    const affectedBlanks = data.stock_blanks.filter(b => b.Item_Name && b.Item_Name.trim() === oldName.trim());
    if (affectedBlanks.length === 0) return;

    const updatedBlanks = data.stock_blanks.map(b => {
      if (b.Item_Name && b.Item_Name.trim() === oldName.trim()) {
        return {
          ...b,
          Item_Name: updatedData.item_name || b.Item_Name,
          Category: updatedData.category || b.Category,
          Unit_Cost_DA: updatedData.unit_cost_da !== undefined ? parseFloat(updatedData.unit_cost_da) : b.Unit_Cost_DA,
          Unit_Price_DA: updatedData.unit_price_da !== undefined ? parseFloat(updatedData.unit_price_da) : b.Unit_Price_DA,
        };
      }
      return b;
    });

    updateLocalStateAndCache(prev => ({
      ...prev,
      stock_blanks: updatedBlanks
    }));
    showToast('✅ تم تحديث بيانات المنتج وكافة متغيراته بنجاح');

    // Sync each affected blank to Google Sheets
    for (const b of affectedBlanks) {
      await editStockItemApi('blank', {
        ...b,
        Item_Name: updatedData.item_name || b.Item_Name,
        Category: updatedData.category || b.Category,
        Unit_Cost_DA: updatedData.unit_cost_da !== undefined ? parseFloat(updatedData.unit_cost_da) : b.Unit_Cost_DA,
        Unit_Price_DA: updatedData.unit_price_da !== undefined ? parseFloat(updatedData.unit_price_da) : b.Unit_Price_DA,
      });
    }
  };

  const handleDeleteStockItem = async (type, id) => {
    const key = type === 'blank' ? 'stock_blanks' : 'stock_consumables';
    updateLocalStateAndCache(prev => ({
      ...prev,
      [key]: prev[key].filter(i => String(i.ID).trim() !== String(id).trim())
    }));
    showToast('🗑️ تم حذف المادة من المخزون');
    await deleteStockItemApi(type, id);
  };

  const handleAdjustStockQty = async (type, id, delta) => {
    const key = type === 'blank' ? 'stock_blanks' : 'stock_consumables';
    updateLocalStateAndCache(prev => ({
      ...prev,
      [key]: prev[key].map(i => {
        if (String(i.ID).trim() === String(id).trim()) {
          const current = parseFloat(i.Quantity) || 0;
          return { ...i, Quantity: Math.max(0, current + delta) };
        }
        return i;
      })
    }));
    await adjustStockQtyApi(type, id, delta);
  };

  const handleAddWaste = async (waste) => {
    setIsSubmitting(true);
    const tempId = 'WST-' + (data.waste.length + 101);
    updateLocalStateAndCache(prev => ({
      ...prev,
      waste: [{ ...waste, ID: tempId, Date: new Date().toISOString().slice(0, 10), Item_Name: waste.item_name, Loss_Cost_DA: waste.loss_cost_da }, ...prev.waste]
    }));
    showToast('✅ تم تسجيل التالف');

    try {
      await addWasteApi(waste);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => loadData(), 2500);
    }
  };

  const handleDeleteWaste = async (wasteId) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      waste: prev.waste.filter(w => String(w.ID).trim() !== String(wasteId).trim())
    }));
    showToast('🗑️ تم حذف سجل التالف');
    await deleteWasteApi(wasteId);
  };

  // ------------------------------------------------
  // CLIENT HANDLERS
  // ------------------------------------------------
  const handleAddClient = async (client) => {
    setIsSubmitting(true);
    const tempId = 'CLI-' + (data.clients.length + 101);
    updateLocalStateAndCache(prev => ({
      ...prev,
      clients: [{ ...client, ID: tempId, Name_or_Brand: client.name, Total_Orders: 0, Total_Spent_DA: 0, Remaining_Debt_DA: 0 }, ...prev.clients]
    }));
    showToast('✅ تم تسجيل العميل');

    try {
      await addClientApi(client);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => loadData(), 2500);
    }
  };

  const handleEditClient = async (client) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      clients: prev.clients.map(c => String(c.ID).trim() === String(client.ID).trim() ? client : c)
    }));
    showToast('✅ تم تحديث بيانات العميل والدين');
    await editClientApi(client);
  };

  const handleDeleteClient = async (clientId) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      clients: prev.clients.filter(c => String(c.ID).trim() !== String(clientId).trim())
    }));
    showToast('🗑️ تم حذف العميل من السجل');
    await deleteClientApi(clientId);
  };

  // ------------------------------------------------
  // EXPENSE HANDLERS
  // ------------------------------------------------
  const handleAddExpense = async (expense) => {
    setIsSubmitting(true);
    const tempId = 'EXP-' + (data.expenses.length + 101);
    updateLocalStateAndCache(prev => ({
      ...prev,
      expenses: [{ ...expense, ID: tempId, Amount_DA: expense.amount_da, Description: expense.description, Category: expense.category, Date: expense.date, Payment_Method: expense.payment_method }, ...prev.expenses]
    }));
    showToast('✅ تم تسجيل المصروف');

    try {
      await addExpenseApi(expense);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => loadData(), 2500);
    }
  };

  const handleEditExpense = async (expense) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => String(e.ID).trim() === String(expense.ID).trim() ? expense : e)
    }));
    showToast('✅ تم تعديل المصروف');
    await editExpenseApi(expense);
  };

  const handleDeleteExpense = async (expenseId) => {
    updateLocalStateAndCache(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => String(e.ID).trim() !== String(expenseId).trim())
    }));
    showToast('🗑️ تم حذف المصروف');
    await deleteExpenseApi(expenseId);
  };

  // ------------------------------------------------
  // PARTNERS & PROFIT (30% / 30% / 40%) HANDLERS
  // ------------------------------------------------
  const handleAddWithdrawal = async (withdrawal) => {
    const updated = {
      ...partnersData,
      withdrawals: [withdrawal, ...partnersData.withdrawals]
    };
    savePartnersData(updated);
    showToast(`✅ تم تسجيل سحب ${withdrawal.amount_da.toLocaleString()} دج لـ ${withdrawal.partner}`);

    // Sync to Google Sheet as an Expense for audit trail
    try {
      await addExpenseApi({
        date: withdrawal.date,
        category: 'Salaries',
        description: `سحب أرباح شريك: ${withdrawal.partner} (${withdrawal.notes || withdrawal.payment_method})`,
        amount_da: withdrawal.amount_da,
        payment_method: withdrawal.payment_method
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteWithdrawal = (withdrawalId) => {
    const updated = {
      ...partnersData,
      withdrawals: partnersData.withdrawals.filter(w => w.id !== withdrawalId)
    };
    savePartnersData(updated);
    showToast('🗑️ تم إلغاء السحب وإرجاع المبلغ للرصيد');
  };

  const handleAddCloture = (cloture) => {
    const updated = {
      ...partnersData,
      clotures: [cloture, ...partnersData.clotures]
    };
    savePartnersData(updated);
    showToast('🔒 تم حفظ إقفال الدورة بنجاح');
  };

  const handleDeleteCloture = (clotureId) => {
    const updated = {
      ...partnersData,
      clotures: partnersData.clotures.filter(c => c.id !== clotureId)
    };
    savePartnersData(updated);
    showToast('🗑️ تم حذف الإقفال');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        t={t}
        isSyncing={isSyncing}
        lastUpdated={lastUpdated}
        onRefresh={loadData}
      />

      {/* Main Navigation - Desktop & Tablet Top Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-20 shadow-xs no-print hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>{t.orders}</span>
              {data.orders.length > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {data.orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.stock}</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.clients}</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>{t.expenses}</span>
            </button>

            {/* Partners & Profit Sharing (30% / 30% / 40%) */}
            <button
              onClick={() => setActiveTab('partners')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                activeTab === 'partners'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/25'
                  : 'text-amber-800 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span>الأرباح والشركاء (30/30/40)</span>
            </button>

            <div className="mr-auto rtl:mr-auto rtl:ml-0 ltr:ml-auto ltr:mr-0 pl-2">
              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>حاسبة أمتار DTF</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Top Quick Action Bar */}
      <div className="md:hidden bg-slate-900 text-white px-3 py-2 flex items-center justify-between shadow-sm sticky top-14 z-20 no-print">
        <span className="text-[11px] font-extrabold text-slate-300">
          {activeTab === 'dashboard' && 'لوحة التحكم والتحليل'}
          {activeTab === 'orders' && `الطلبات (${data.orders.length})`}
          {activeTab === 'stock' && 'المخزون والمتغيرات'}
          {activeTab === 'clients' && 'العملاء والديون'}
          {activeTab === 'expenses' && 'مصاريف المصنع'}
          {activeTab === 'partners' && 'الأرباح والشركاء (30% / 30% / 40%)'}
        </span>
        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500 text-slate-950 shadow-sm"
        >
          <Calculator className="w-3 h-3" />
          <span>حاسبة DTF</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* View Router */}
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            t={t}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewOrder={() => {
              setActiveTab('orders');
              setIsNewOrderDirectOpen(true);
            }}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenNewExpense={() => setActiveTab('expenses')}
            onOpenAddStock={() => setActiveTab('stock')}
          />
        )}

        {activeTab === 'orders' && (
          <Orders
            data={data}
            t={t}
            onAddOrder={handleAddOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            onPrintInvoice={(order) => setSelectedInvoiceOrder(order)}
            isSubmitting={isSubmitting}
            initialNewOrderOpen={isNewOrderDirectOpen}
          />
        )}

        {activeTab === 'stock' && (
          <Stock
            data={data}
            t={t}
            onAddStockItem={handleAddStockItem}
            onEditStockItem={handleEditStockItem}
            onEditMasterProduct={handleEditMasterProduct}
            onDeleteStockItem={handleDeleteStockItem}
            onAdjustStockQty={handleAdjustStockQty}
            onAddWaste={handleAddWaste}
            onDeleteWaste={handleDeleteWaste}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'clients' && (
          <Clients
            data={data}
            t={t}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'expenses' && (
          <Expenses
            data={data}
            t={t}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            isSubmitting={isSubmitting}
          />
        )}

        {activeTab === 'partners' && (
          <PartnersProfit
            data={data}
            t={t}
            partnersData={partnersData}
            onAddWithdrawal={handleAddWithdrawal}
            onDeleteWithdrawal={handleDeleteWithdrawal}
            onAddCloture={handleAddCloture}
            onDeleteCloture={handleDeleteCloture}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (App-like experience on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1 shadow-lg no-print">
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-brand-600 font-extrabold bg-brand-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">{t.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeTab === 'orders' ? 'text-brand-600 font-extrabold bg-brand-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Printer className="w-4 h-4 mb-0.5" />
              {data.orders.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[8px] font-bold px-1 rounded-full">
                  {data.orders.length}
                </span>
              )}
            </div>
            <span className="text-[9px]">{t.orders}</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'stock' ? 'text-brand-600 font-extrabold bg-brand-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">{t.stock}</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'clients' ? 'text-brand-600 font-extrabold bg-brand-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">{t.clients}</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'expenses' ? 'text-brand-600 font-extrabold bg-brand-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">{t.expenses}</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'partners' ? 'text-amber-600 font-extrabold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 mb-0.5 text-amber-500" />
            <span className="text-[9px] font-bold">الأرباح</span>
          </button>
        </div>
      </nav>

      {/* DTF Smart Calculator Modal */}
      <DtfCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        t={t}
        onApplyToOrder={(calcData) => {
          setActiveTab('orders');
          setIsNewOrderDirectOpen(true);
        }}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        t={t}
      />

    </div>
  );
}
export default App;
