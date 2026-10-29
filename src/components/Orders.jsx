import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Printer, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Calculator, 
  ArrowRight,
  Truck,
  DollarSign,
  AlertCircle,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import { calculateDtfPrint } from '../utils/dtfCalculator';

export function Orders({ 
  data, 
  t, 
  onAddOrder, 
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus, 
  onPrintInvoice, 
  isSubmitting,
  initialNewOrderOpen = false
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialNewOrderOpen);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  // New Order Form State with Multi-Logo DTF & Variants (Product -> Color -> Size)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Product & Variant Selection
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [designRef, setDesignRef] = useState('');
  const [notes, setNotes] = useState('');
  const [carrier, setCarrier] = useState('Yalidine');
  const [trackingNumber, setTrackingNumber] = useState('');

  // MULTI-LOGO DTF STATE
  const [logos, setLogos] = useState([
    { id: 1, position: 'الصدر (Poitrine)', widthCm: 12, heightCm: 12 }
  ]);

  // MULTI-ITEM / MULTI-VARIANT ORDER ITEMS (e.g. 5x White S, 10x White L, 8x Green M)
  const [orderItems, setOrderItems] = useState([]);
  const [itemAddQty, setItemAddQty] = useState(1);
  const [itemAddPrice, setItemAddPrice] = useState(1500);
  const [customTotalOrderPrice, setCustomTotalOrderPrice] = useState(null);

  // Pricing & Costs
  const [meterPriceDA, setMeterPriceDA] = useState(1500);
  const [emballageCostDA, setEmballageCostDA] = useState(50);
  const [pressLaborDA, setPressLaborDA] = useState(50);
  const [unitSellingPrice, setUnitSellingPrice] = useState(1500);
  const [paidAmountDA, setPaidAmountDA] = useState(0);

  const orders = data.orders || [];
  const blanks = data.stock_blanks || [];
  const clients = data.clients || [];

  // Group blanks by Product Name
  const distinctProducts = React.useMemo(() => {
    const set = new Set();
    blanks.forEach(b => { if (b.Item_Name) set.add(b.Item_Name.trim()); });
    return Array.from(set);
  }, [blanks]);

  // Default product selection if empty
  React.useEffect(() => {
    if (!selectedProductName && distinctProducts.length > 0) {
      setSelectedProductName(distinctProducts[0]);
    }
  }, [distinctProducts, selectedProductName]);

  // Available colors for selected product
  const availableColors = React.useMemo(() => {
    if (!selectedProductName) return [];
    const set = new Set();
    blanks.forEach(b => {
      if (b.Item_Name && b.Item_Name.trim() === selectedProductName && b.Color) {
        set.add(b.Color.trim());
      }
    });
    return Array.from(set);
  }, [blanks, selectedProductName]);

  // Default color selection if empty or invalid
  React.useEffect(() => {
    if (availableColors.length > 0 && (!selectedColor || !availableColors.includes(selectedColor))) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  // Available sizes for selected product and color
  const availableSizesForColor = React.useMemo(() => {
    if (!selectedProductName || !selectedColor) return [];
    return blanks.filter(b => 
      b.Item_Name && b.Item_Name.trim() === selectedProductName &&
      b.Color && b.Color.trim() === selectedColor
    );
  }, [blanks, selectedProductName, selectedColor]);

  // Default size selection if empty
  React.useEffect(() => {
    if (availableSizesForColor.length > 0) {
      const match = availableSizesForColor.find(s => s.Size === selectedSize);
      if (!match) {
        setSelectedSize(availableSizesForColor[0].Size);
      }
    }
  }, [availableSizesForColor, selectedSize]);

  // Find the exact blank item record
  const currentBlankVariant = blanks.find(b => 
    b.Item_Name && b.Item_Name.trim() === selectedProductName &&
    b.Color && b.Color.trim() === selectedColor &&
    b.Size && b.Size.trim() === selectedSize
  ) || blanks[0] || null;

  const blankCostDA = currentBlankVariant ? (parseFloat(currentBlankVariant.Unit_Cost_DA) || 650) : 650;
  const blankPriceDA = currentBlankVariant ? (parseFloat(currentBlankVariant.Unit_Price_DA) || 1500) : 1500;
  const availableQty = currentBlankVariant ? (parseFloat(currentBlankVariant.Quantity) || 0) : 0;

  // Sync itemAddPrice and unitSellingPrice when variant changes
  React.useEffect(() => {
    if (currentBlankVariant?.Unit_Price_DA) {
      const pr = parseFloat(currentBlankVariant.Unit_Price_DA) || 1500;
      setItemAddPrice(pr);
      setUnitSellingPrice(pr);
    }
  }, [currentBlankVariant]);

  // MULTI-ITEM HANDLERS
  const handleAddItemToOrder = () => {
    if (!selectedProductName || !selectedColor || !selectedSize) {
      alert('يرجى تحديد نوع المنتج، اللون، والمقاس أولاً');
      return;
    }
    const qty = parseInt(itemAddQty) || parseInt(quantity) || 1;
    if (qty <= 0) return;

    const unitPrice = parseFloat(itemAddPrice) || parseFloat(unitSellingPrice) || blankPriceDA;
    const unitCost = blankCostDA;

    // Check if same variant is already added
    const existingIndex = orderItems.findIndex(
      it => it.productName === selectedProductName && it.color === selectedColor && it.size === selectedSize
    );

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].unitSellingPrice = unitPrice;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: Date.now() + Math.random(),
          productName: selectedProductName,
          color: selectedColor,
          size: selectedSize,
          quantity: qty,
          unitCostDA: unitCost,
          unitSellingPrice: unitPrice,
          availableStock: availableQty,
          stockItemId: currentBlankVariant?.ID
        }
      ]);
    }
  };

  const handleRemoveOrderItem = (itemId) => {
    setOrderItems(orderItems.filter(it => it.id !== itemId));
  };

  const handleUpdateOrderItemQty = (itemId, newQty) => {
    const q = parseInt(newQty) || 0;
    if (q <= 0) {
      handleRemoveOrderItem(itemId);
      return;
    }
    setOrderItems(orderItems.map(it => it.id === itemId ? { ...it, quantity: q } : it));
  };

  const handleUpdateOrderItemPrice = (itemId, newPrice) => {
    const pr = parseFloat(newPrice) || 0;
    setOrderItems(orderItems.map(it => it.id === itemId ? { ...it, unitSellingPrice: pr } : it));
  };

  // Total pieces: from orderItems if populated, otherwise fallback to itemAddQty / quantity
  const totalOrderPieces = orderItems.length > 0
    ? orderItems.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0)
    : (parseInt(itemAddQty) || parseInt(quantity) || 1);

  // Total garments raw cost
  const totalGarmentsCost = orderItems.length > 0
    ? orderItems.reduce((sum, it) => sum + ((parseFloat(it.unitCostDA) || 0) * (parseInt(it.quantity) || 0)), 0)
    : (blankCostDA * totalOrderPieces);

  // Total garments selling price (All garments * selling price)
  const totalGarmentsPrice = orderItems.length > 0
    ? orderItems.reduce((sum, it) => sum + ((parseFloat(it.unitSellingPrice) || 0) * (parseInt(it.quantity) || 0)), 0)
    : ((parseFloat(unitSellingPrice) || parseFloat(itemAddPrice) || 1500) * totalOrderPieces);

  // Average selling price and raw cost per piece for DTF profit analysis
  const avgSellingPricePerPiece = totalOrderPieces > 0 ? Math.round(totalGarmentsPrice / totalOrderPieces) : 1500;
  const avgBlankCostPerPiece = totalOrderPieces > 0 ? Math.round(totalGarmentsCost / totalOrderPieces) : 650;

  // Run dynamic calculation with multi-logo support for total pieces
  const calcResult = calculateDtfPrint({
    logos,
    meterPriceDA,
    rollWidthCm: 58,
    quantity: totalOrderPieces,
    blankCostDA: avgBlankCostPerPiece,
    emballageCostDA,
    pressLaborDA,
    sellingPriceDA: avgSellingPricePerPiece
  });

  // The actual auto-calculated price charged to the client is the total selling price of all garments!
  const autoCalculatedOrderPrice = totalGarmentsPrice;
  const totalOrderPrice = customTotalOrderPrice !== null ? customTotalOrderPrice : autoCalculatedOrderPrice;
  const remainingDue = Math.max(0, totalOrderPrice - (parseFloat(paidAmountDA) || 0));

  const handleAddLogo = () => {
    const nextId = logos.length + 1;
    let defaultPos = 'الظهر (Dos)';
    let defaultW = 28;
    let defaultH = 35;
    if (nextId === 3) { defaultPos = 'الكم (Manche)'; defaultW = 8; defaultH = 8; }
    if (nextId > 3) { defaultPos = `لوجو إضافي ${nextId}`; defaultW = 10; defaultH = 10; }

    setLogos([
      ...logos,
      { id: Date.now(), position: defaultPos, widthCm: defaultW, heightCm: defaultH }
    ]);
  };

  const handleRemoveLogo = (id) => {
    if (logos.length <= 1) return;
    setLogos(logos.filter(l => l.id !== id));
  };

  const handleUpdateLogo = (id, field, value) => {
    setLogos(logos.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleClientSelect = (e) => {
    const val = e.target.value;
    setClientName(val);
    const existing = clients.find(c => c.Name_or_Brand === val);
    if (existing) {
      setClientPhone(existing.Phone || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('يرجى كتابة اسم العميل أو العلامة التجارية');
      return;
    }

    // Determine final items array
    let finalItems = [...orderItems];
    if (finalItems.length === 0) {
      const singleQty = parseInt(itemAddQty) || parseInt(quantity) || 1;
      const singlePrice = parseFloat(unitSellingPrice) || parseFloat(itemAddPrice) || 1500;
      finalItems = [{
        id: Date.now(),
        productName: selectedProductName || 'T-Shirt',
        color: selectedColor || 'Noir',
        size: selectedSize || 'L',
        quantity: singleQty,
        unitCostDA: blankCostDA,
        unitSellingPrice: singlePrice,
        availableStock: availableQty,
        stockItemId: currentBlankVariant?.ID
      }];
    }

    const totalQty = finalItems.reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0);

    // Group items into a clear readable summary for display in tables and bordeaux
    const summaryParts = [];
    const groupedByProd = {};
    finalItems.forEach(it => {
      const p = it.productName || 'ملابس';
      if (!groupedByProd[p]) groupedByProd[p] = [];
      groupedByProd[p].push(`${it.quantity}x ${it.color} (${it.size})`);
    });
    for (const [prod, specs] of Object.entries(groupedByProd)) {
      summaryParts.push(`${prod}: ${specs.join(', ')}`);
    }
    const itemsSummary = summaryParts.join(' | ');

    const distinctColors = Array.from(new Set(finalItems.map(it => it.color).filter(Boolean)));
    const distinctSizes = Array.from(new Set(finalItems.map(it => it.size).filter(Boolean)));

    const printSummary = logos.map((l, i) => 
      `${l.position} [${l.widthCm}x${l.heightCm}سم]`
    ).join(' + ');

    const orderPayload = {
      date: new Date().toISOString().slice(0, 10),
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      blank_item: itemsSummary,
      color: distinctColors.join(', '),
      size: distinctSizes.join(', '),
      quantity: totalQty,
      print_details: `${logos.length} لوجو: ${printSummary}`,
      design_ref: designRef.trim(),
      carrier,
      tracking_number: trackingNumber.trim(),
      total_price_da: totalOrderPrice,
      paid_amount_da: parseFloat(paidAmountDA) || 0,
      status: 'En attente Confirmation',
      notes: notes ? `${notes} | التفاصيل: ${itemsSummary}` : `التفاصيل: ${itemsSummary}`,
      items: finalItems
    };

    onAddOrder(orderPayload);
    setIsModalOpen(false);
    setOrderItems([]);
    setCustomTotalOrderPrice(null);
    setQuantity(1);
    setItemAddQty(1);
    setPaidAmountDA(0);
    setDesignRef('');
    setTrackingNumber('');
    setNotes('');
    setLogos([{ id: 1, position: 'الصدر (Poitrine)', widthCm: 12, heightCm: 12 }]);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const remaining = (parseFloat(editingOrder.Total_Price_DA) || 0) - (parseFloat(editingOrder.Paid_Amount_DA) || 0);
    onEditOrder({
      ...editingOrder,
      Remaining_DA: remaining
    });
    setEditingOrder(null);
  };

  const confirmDelete = () => {
    if (!deletingOrder) return;
    onDeleteOrder(deletingOrder.Order_ID);
    setDeletingOrder(null);
  };

  const filteredOrders = orders.filter(ord => {
    let matchesFilter = true;
    const st = ord.Status || '';
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'Confirmation') {
        matchesFilter = st.includes('Confirmation') || st === 'Pending';
      } else if (filterStatus === 'In Print') {
        matchesFilter = st === 'In Print' || st.includes('Print') || st.includes('طباعة');
      } else if (filterStatus === 'Pressage') {
        matchesFilter = st.includes('Pressage') || st.includes('كبس');
      } else if (filterStatus === 'Packaging') {
        matchesFilter = st.includes('Packaging') || st.includes('QC') || st.includes('جودة');
      } else if (filterStatus === 'Livraison') {
        matchesFilter = st.includes('livraison') || st === 'Ready' || st.includes('توصيل');
      } else if (filterStatus === 'Delivered') {
        matchesFilter = st === 'Delivered' || st.includes('Livré') || st.includes('مسلّم');
      } else if (filterStatus === 'Returns') {
        matchesFilter = st.includes('Retour') || st.includes('مرتجع');
      } else {
        matchesFilter = st === filterStatus;
      }
    }
    const matchesSearch = 
      (ord.Client_Name && ord.Client_Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.Order_ID && String(ord.Order_ID).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.Blank_Item && ord.Blank_Item.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.Tracking_Number && String(ord.Tracking_Number).includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 shrink-0" />
            <span>{t.orders} وخط سير الأقسام التشغيلية (POD Workflow)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            تأكيد الطلبات، الطباعة، الكبس، الجودة، الشحن، وتحصيل الـ COD وإدارة المرتجعات
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.newOrderBtn} (حاسبة الشعارات)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        {/* Top: Search & Quick Counts */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، اسم العميل، الهاتف، أو رقم التتبع..."
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 justify-between sm:justify-end">
            <span>الطلبات المعروضة:</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-extrabold font-mono text-xs">
              {filteredOrders.length} من أصل {orders.length}
            </span>
          </div>
        </div>

        {/* Bottom: Workflow Pipeline Stages */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-slate-100">
          {[
            { id: 'ALL', label: 'الكل', count: orders.length },
            { id: 'Confirmation', label: '1. تأكيد الطلبات', count: orders.filter(o => (o.Status || '').includes('Confirmation') || o.Status === 'Pending').length },
            { id: 'In Print', label: '2. الطباعة DTF', count: orders.filter(o => o.Status === 'In Print' || (o.Status || '').includes('Print') || (o.Status || '').includes('طباعة')).length },
            { id: 'Pressage', label: '3. الكبس الحراري', count: orders.filter(o => (o.Status || '').includes('Pressage') || (o.Status || '').includes('كبس')).length },
            { id: 'Packaging', label: '4. مراقبة الجودة والتغليف', count: orders.filter(o => (o.Status || '').includes('Packaging') || (o.Status || '').includes('QC') || (o.Status || '').includes('جودة')).length },
            { id: 'Livraison', label: '5. الشحن والتوصيل', count: orders.filter(o => (o.Status || '').includes('livraison') || o.Status === 'Ready' || (o.Status || '').includes('توصيل')).length },
            { id: 'Delivered', label: '6. تم التسليم والتحصيل', count: orders.filter(o => o.Status === 'Delivered' || (o.Status || '').includes('Livré') || (o.Status || '').includes('مسلّم')).length },
            { id: 'Returns', label: '7. المرتجعات', count: orders.filter(o => (o.Status || '').includes('Retour') || (o.Status || '').includes('مرتجع')).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right min-w-[720px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3 px-3">رقم الطلب</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">العميل</th>
                <th className="py-3 px-3">المنتج الخام</th>
                <th className="py-3 px-3 text-center">الكمية</th>
                <th className="py-3 px-3">الشعارات والتفاصيل</th>
                <th className="py-3 px-3">الإجمالي (دج)</th>
                <th className="py-3 px-3">المتبقي (دج)</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-3 text-center">تعديل / وصل / حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord, idx) => {
                const total = parseFloat(ord.Total_Price_DA || 0);
                const remaining = parseFloat(ord.Remaining_DA || 0);
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {ord.Order_ID}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {ord.Date ? ord.Date.slice(0, 10) : '-'}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      <div>{ord.Client_Name}</div>
                      {ord.Client_Phone && (
                        <div className="text-[10px] text-slate-400 font-normal">{ord.Client_Phone}</div>
                      )}
                      {ord.Tracking_Number && (
                        <div className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          تتبع: {ord.Tracking_Number} ({ord.Carrier || 'Yalidine'})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-xs">
                      <div className="font-bold text-slate-900 leading-snug">{ord.Blank_Item}</div>
                      {(() => {
                        const parsedItems = Array.isArray(ord.items) 
                          ? ord.items 
                          : (typeof ord.items === 'string' && ord.items.trim().startsWith('[') 
                              ? (() => { try { return JSON.parse(ord.items); } catch(e) { return []; } })() 
                              : []);
                        return parsedItems.length > 1 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <span>📦 {parsedItems.length} تشكيلات ومقاسات</span>
                            </span>
                          </div>
                        ) : (
                          ord.Color && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              {ord.Color} | مقاس: {ord.Size}
                            </div>
                          )
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-slate-900 font-mono text-sm">
                      {ord.Quantity}
                      <span className="text-[9px] text-slate-400 block font-normal">قطع</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-sm truncate" title={ord.Print_Details}>
                      <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {ord.Print_Details || 'DTF Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {total.toLocaleString()} {t.currency}
                    </td>
                    <td className="py-3.5 px-3">
                      {remaining > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                          {remaining.toLocaleString()} {t.currency}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[10px]">
                          خالص 100%
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <select
                        value={ord.Status || 'Pending'}
                        onChange={(e) => onUpdateStatus(ord.Order_ID, e.target.value)}
                        className={`text-[10px] font-extrabold px-2 py-1 rounded-full border cursor-pointer outline-none transition ${
                          ord.Status === 'Delivered' || ord.Status?.includes('Livré') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          ord.Status === 'In Print' || ord.Status?.includes('Print') ? 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse' :
                          ord.Status?.includes('Pressage') ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          ord.Status?.includes('Packaging') || ord.Status?.includes('QC') ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          ord.Status?.includes('livraison') || ord.Status === 'Ready' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          ord.Status?.includes('Retour') ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="En attente Confirmation">1. قيد تأكيد الهاتف (CRM)</option>
                        <option value="Confirmé">2. مؤكد - جاهز للإنتاج</option>
                        <option value="In Print">3. محطة الطباعة DTF</option>
                        <option value="Pressage">4. محطة الكبس الحراري</option>
                        <option value="QC & Packaging">5. مراقبة الجودة والتغليف</option>
                        <option value="Ready">6. جاهز للتسليم لشركة الشحن</option>
                        <option value="En livraison">7. مع شركة التوصيل (In Transit)</option>
                        <option value="Delivered">8. تم التسليم والتحصيل COD</option>
                        <option value="Retour">9. طرد مرتجع (Retour Restock)</option>
                        <option value="Cancelled">10. ملغي (Annulé)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingOrder(ord)}
                          title="تعديل الطلب"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintInvoice(ord)}
                          title="طباعة وصل تسليم / طلب"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingOrder(ord)}
                          title="حذف الطلب نهائياً"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-14 px-4 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                        <Printer className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {searchQuery || filterStatus !== 'ALL'
                            ? 'لا توجد طلبات مطابقة للبحث أو التصفية المحددة'
                            : 'لا توجد أي طلبات مسجلة حالياً'}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {searchQuery || filterStatus !== 'ALL'
                            ? 'جرب البحث بكلمة أخرى أو اضغط على زر "الكل" لعرض كافة المراحل'
                            : 'اضغط على زر "+ طلب جديد" لتسجيل أول طلب وحساب تكلفة الأمتار والكبس'}
                        </p>
                      </div>
                      {(!searchQuery && filterStatus === 'ALL') && (
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="mt-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>+ تسجيل أول طلبية الآن</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                تأكيد حذف الطلب نهائياً
              </h3>
              <p className="text-xs text-slate-500">
                هل أنت متأكد من حذف الطلب <span className="font-bold text-slate-900">({deletingOrder.Order_ID})</span> الخاص بالعميل <span className="font-bold text-slate-900">({deletingOrder.Client_Name})</span>؟
              </p>
              <p className="text-[11px] text-rose-600 font-bold pt-1">
                لا يمكن التراجع عن هذه الخطوة!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، احذف الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-600" />
                <span>تعديل الطلب: {editingOrder.Order_ID}</span>
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العميل</label>
                  <input
                    type="text"
                    required
                    value={editingOrder.Client_Name}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Client_Name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={editingOrder.Client_Phone}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Client_Phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    value={editingOrder.Quantity}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ الإجمالي (دج)</label>
                  <input
                    type="number"
                    value={editingOrder.Total_Price_DA}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Total_Price_DA: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl text-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدفوع (دج)</label>
                  <input
                    type="number"
                    value={editingOrder.Paid_Amount_DA}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Paid_Amount_DA: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الشعارات</label>
                <input
                  type="text"
                  value={editingOrder.Print_Details}
                  onChange={(e) => setEditingOrder({ ...editingOrder, Print_Details: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الطلب في خط الإنتاج</label>
                  <select
                    value={editingOrder.Status || 'En attente Confirmation'}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Status: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-white"
                  >
                    <option value="En attente Confirmation">1. قيد تأكيد الهاتف (CRM)</option>
                    <option value="Confirmé">2. مؤكد - جاهز للإنتاج</option>
                    <option value="In Print">3. محطة الطباعة DTF</option>
                    <option value="Pressage">4. محطة الكبس الحراري</option>
                    <option value="QC & Packaging">5. مراقبة الجودة والتغليف</option>
                    <option value="Ready">6. جاهز للتسليم لشركة الشحن</option>
                    <option value="En livraison">7. مع شركة التوصيل (In Transit)</option>
                    <option value="Delivered">8. تم التسليم والتحصيل COD</option>
                    <option value="Retour">9. طرد مرتجع (Retour Restock)</option>
                    <option value="Cancelled">10. ملغي (Annulé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم بوليصة التتبع (Tracking N°)</label>
                  <input
                    type="text"
                    value={editingOrder.Tracking_Number || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Tracking_Number: e.target.value })}
                    placeholder="مثال: YAL-100234"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شركة التوصيل</label>
                  <select
                    value={editingOrder.Carrier || 'Yalidine'}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Carrier: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-white"
                  >
                    <option value="Yalidine">ياليدين (Yalidine Express)</option>
                    <option value="ZR Express">زد آر إكسبريس (ZR Express)</option>
                    <option value="Kazi Tour">كازي تور (Kazi Tour)</option>
                    <option value="Livraison Locale">توصيل محلي باليد</option>
                    <option value="Autre">ناقل آخر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملف التصميم / Gang Sheet (300 DPI)</label>
                  <input
                    type="text"
                    value={editingOrder.Design_Ref || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, Design_Ref: e.target.value })}
                    placeholder="رابط درايف أو اسم الملف"
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
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

      {/* NEW ORDER MODAL WITH VARIANT SELECTION (Product -> Color -> Size) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="bg-gradient-to-r from-brand-900 to-indigo-900 text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-xl">
                    طلب طباعة DTF جديد (اختيار المنتج واللون والمقاس المتوفر)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-brand-200 line-clamp-1">
                    حدد الماركة، نوع الملابس، اللون والمقاس المتوفر مع حاسبة الشعارات المتعددة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم العميل أو العلامة التجارية (Brand) *
                  </label>
                  <input
                    type="text"
                    required
                    list="clients-list"
                    value={clientName}
                    onChange={handleClientSelect}
                    placeholder="مثال: Alpha Brand Dz"
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <datalist id="clients-list">
                    {clients.map((c, i) => (
                      <option key={i} value={c.Name_or_Brand} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="مثال: 0550123456"
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* STEP 1: MULTI-PRODUCT & MULTI-VARIANT BUILDER */}
              <div className="bg-slate-50 p-3.5 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand-600" />
                      <span>1. منتجات وتشكيلات الطلبية (Multi-Produits, Couleurs & Tailles)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      اختر المنتج واللون والمقاس ثم اضغط «+ أضف للطلب» لإضافة مقاسات وألوان متعددة لنفس العميل
                    </p>
                  </div>

                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                    availableQty > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    المتوفر بالمستودع: {availableQty} قطعة
                  </span>
                </div>

                {/* Variant Picker Inputs */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  
                  {/* Master Product */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المنتج الخام *</label>
                    <select
                      value={selectedProductName}
                      onChange={(e) => setSelectedProductName(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      {distinctProducts.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اللون *</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      {availableColors.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المقاس *</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      {availableSizesForColor.map((s, i) => (
                        <option key={i} value={s.Size}>
                          {s.Size} (متوفر: {s.Quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الكمية (قطع)</label>
                    <input
                      type="number"
                      min="1"
                      value={itemAddQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setItemAddQty(val);
                        setQuantity(val);
                      }}
                      className="w-full px-2.5 py-2 text-xs font-extrabold border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  {/* Unit Selling Price */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">سعر بيع القطعة (دج)</label>
                    <input
                      type="number"
                      min="0"
                      value={itemAddPrice}
                      onChange={(e) => {
                        const pr = parseFloat(e.target.value) || 0;
                        setItemAddPrice(pr);
                        setUnitSellingPrice(pr);
                      }}
                      className="w-full px-2.5 py-2 text-xs font-black border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-brand-500 outline-none font-mono text-brand-700"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItemToOrder}
                      className="w-full py-2 px-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                      title="إضافة تشكيلة أخرى لنفس الطلبية"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">+ أضف</span>
                      <span className="sm:hidden">+ أضف للطلب</span>
                    </button>
                  </div>

                </div>

                {/* Order Items Table (Lignes de Commande) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span>قائمة تشكيلات الطلبية ({orderItems.length} تشكيلة)</span>
                    <span className="text-slate-500 font-mono">
                      مجموع القطع: <strong className="text-brand-700 text-sm">{totalOrderPieces}</strong> قطعة
                    </span>
                  </div>

                  {orderItems.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                          <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">المنتج</th>
                              <th className="py-2 px-2 text-center">اللون</th>
                              <th className="py-2 px-2 text-center">المقاس</th>
                              <th className="py-2 px-2 text-center">الكمية</th>
                              <th className="py-2 px-2 text-left">سعر القطعة (دج)</th>
                              <th className="py-2 px-3 text-left">الإجمالي (دج)</th>
                              <th className="py-2 px-2 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {orderItems.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition">
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {item.productName}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                    {item.color}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-center font-extrabold text-brand-700 font-mono">
                                  {item.size}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOrderItemQty(item.id, item.quantity - 1)}
                                      className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-bold font-mono text-xs">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOrderItemQty(item.id, item.quantity + 1)}
                                      className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-left">
                                  <input
                                    type="number"
                                    value={item.unitSellingPrice}
                                    onChange={(e) => handleUpdateOrderItemPrice(item.id, e.target.value)}
                                    className="w-20 px-1.5 py-1 text-xs font-bold border rounded-lg text-left"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-left font-black text-slate-900 font-mono">
                                  {(item.quantity * item.unitSellingPrice).toLocaleString()} {t.currency}
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOrderItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs">
                        <span className="text-slate-500">
                          مجموع قطع الطلب: <strong className="text-slate-900 font-mono text-sm">{totalOrderPieces}</strong> قطعة
                        </span>
                        <span className="text-slate-500">
                          مجموع أسعار الملابس الأساسية: <strong className="text-brand-700 font-mono text-sm">{totalGarmentsPrice.toLocaleString()} {t.currency}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      💡 يمكنك إضافة عدة تشكيلات ومقاسات وألوان في نفس الطلبية باختيارها والضغط على <strong>«+ أضف للطلب»</strong> أعلاه.
                    </div>
                  )}
                </div>

              </div>

              {/* STEP 2: MULTI-LOGO BUILDER */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-brand-50/70 p-3 sm:p-4 rounded-xl border border-indigo-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-indigo-950 uppercase flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <span>2. الشعارات المطبوعة على القطعة الواحدة ({logos.length} شعارات)</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleAddLogo}
                    className="self-start sm:self-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold transition shadow-sm flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ إضافة لوجو آخر للقطعة</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {logos.map((logo, index) => {
                    const logoArea = (parseFloat(logo.widthCm) || 0) * (parseFloat(logo.heightCm) || 0);
                    const logoCost = Math.round(logoArea * (meterPriceDA / 5800));

                    return (
                      <div key={logo.id} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={logo.position}
                              onChange={(e) => handleUpdateLogo(logo.id, 'position', e.target.value)}
                              placeholder="مكان الشعار"
                              className="text-xs font-bold px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none w-full sm:w-44 focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {logos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLogo(logo.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition md:hidden shrink-0"
                              title="حذف هذا الشعار"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 flex-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="58"
                              value={logo.widthCm}
                              onChange={(e) => handleUpdateLogo(logo.id, 'widthCm', e.target.value)}
                              className="w-16 px-2 py-1.5 text-xs font-extrabold border rounded-lg text-center outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-[11px] text-slate-500 font-bold">عرض (سم)</span>
                          </div>

                          <span className="text-slate-400 font-bold">×</span>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={logo.heightCm}
                              onChange={(e) => handleUpdateLogo(logo.id, 'heightCm', e.target.value)}
                              className="w-16 px-2 py-1.5 text-xs font-extrabold border rounded-lg text-center outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-[11px] text-slate-500 font-bold">ارتفاع (سم)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            = {logoCost} {t.currency} ({logoArea} سم²)
                          </span>

                          {logos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLogo(logo.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition hidden md:block shrink-0"
                              title="حذف هذا الشعار"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white p-3 rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">عدد الشعارات: </span>
                    <span className="font-extrabold text-indigo-900">{logos.length} شعار</span>
                  </div>
                  <div>
                    <span className="text-slate-500">طباعة الـ DTF للقطعة: </span>
                    <span className="font-extrabold text-indigo-700 text-sm">{calcResult.dtfUnitCost} {t.currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">التيشيرت الخام: </span>
                    <span className="font-bold text-slate-900">{blankCostDA} {t.currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">التكلفة الصافية للقطعة: </span>
                    <span className="font-extrabold text-rose-600 text-sm">{calcResult.totalUnitCost} {t.currency}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      تكلفة التغليف للقطعة (دج)
                    </label>
                    <input
                      type="number"
                      value={emballageCostDA}
                      onChange={(e) => setEmballageCostDA(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      تكلفة الكبس الحراري (دج)
                    </label>
                    <input
                      type="number"
                      value={pressLaborDA}
                      onChange={(e) => setPressLaborDA(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      سعر المتر DTF (دج)
                    </label>
                    <input
                      type="number"
                      value={meterPriceDA}
                      onChange={(e) => setMeterPriceDA(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {orderItems.length > 0 ? 'متوسط سعر البيع للقطعة' : 'سعر البيع للقطعة (دج) *'}
                  </label>
                  {orderItems.length > 0 ? (
                    <div className="px-3 py-2 text-sm font-extrabold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl">
                      {Math.round(totalGarmentsPrice / totalOrderPieces).toLocaleString()} {t.currency}
                      <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                        إجمالي {totalOrderPieces} قطع: {totalGarmentsPrice.toLocaleString()} {t.currency}
                      </span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        required
                        value={unitSellingPrice}
                        onChange={(e) => {
                          const p = parseFloat(e.target.value) || 0;
                          setUnitSellingPrice(p);
                          setItemAddPrice(p);
                        }}
                        className="w-full px-3 py-2 text-sm font-extrabold text-brand-700 bg-brand-50 border border-brand-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                        صافي ربحك في القطعة: +{(parseFloat(unitSellingPrice) || 0) - calcResult.totalUnitCost} {t.currency}
                      </span>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>المبلغ الإجمالي للطلب *</span>
                    <span className="text-[10px] font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-bold">
                      ({totalOrderPieces} قطع × {Math.round(totalGarmentsPrice / totalOrderPieces)} دج)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={customTotalOrderPrice !== null ? customTotalOrderPrice : totalOrderPrice}
                    onChange={(e) => setCustomTotalOrderPrice(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 text-base font-black text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                  />
                  {customTotalOrderPrice !== null ? (
                    <button
                      type="button"
                      onClick={() => setCustomTotalOrderPrice(null)}
                      className="text-[10px] text-brand-600 font-bold hover:underline mt-0.5 block"
                    >
                      إعادة الحساب التلقائي ({autoCalculatedOrderPrice.toLocaleString()} دج)
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      {totalOrderPieces} قطع × {Math.round(totalGarmentsPrice / totalOrderPieces)} دج = {autoCalculatedOrderPrice.toLocaleString()} دج
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التسبيق المدفوع (Acompte) دج
                  </label>
                  <input
                    type="number"
                    value={paidAmountDA}
                    onChange={(e) => setPaidAmountDA(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                  <span className="text-[10px] text-rose-600 font-bold mt-0.5 block">
                    المتبقي بذمته: {remainingDue.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              {/* Profit & Production Cost Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 p-3 rounded-xl border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">إجمالي قطع الطلبية</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{totalOrderPieces} قطع</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">المبلغ المطلوب من الزبون</span>
                  <span className="text-sm font-black text-brand-700 font-mono">{totalOrderPrice.toLocaleString()} {t.currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">تكلفة الإنتاج الإجمالية</span>
                  <span className="text-sm font-black text-slate-700 font-mono">{(calcResult.totalUnitCost * totalOrderPieces).toLocaleString()} {t.currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">صافي الربح المتوقع</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    +{(totalOrderPrice - (calcResult.totalUnitCost * totalOrderPieces)).toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              {/* Notes, Design Gang Sheet & Carrier Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملف التصميم / Gang Sheet (300 DPI)
                  </label>
                  <input
                    type="text"
                    value={designRef}
                    onChange={(e) => setDesignRef(e.target.value)}
                    placeholder="رابط درايف أو اسم الملف"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شركة التوصيل / الناقل
                  </label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="Yalidine">ياليدين (Yalidine Express)</option>
                    <option value="ZR Express">زد آر إكسبريس (ZR Express)</option>
                    <option value="Kazi Tour">كازي تور (Kazi Tour)</option>
                    <option value="Livraison Locale">توصيل محلي باليد (Main à main)</option>
                    <option value="Autre">ناقل آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم بوليصة الشحن (N° Suivi)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="مثال: YAL-554210"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 sm:pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition text-center"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ في الشيت...' : 'تأكيد وحفظ الطلب'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
