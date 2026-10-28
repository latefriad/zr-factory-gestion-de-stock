import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  TrendingDown, 
  CheckCircle2, 
  Trash2,
  Edit2,
  Plus,
  Minus,
  RefreshCw,
  Box,
  Droplets,
  Eye,
  Grid,
  List,
  Sparkles,
  Copy,
  X
} from 'lucide-react';

export function Stock({ 
  data, 
  t, 
  onAddStockItem, 
  onAddStockItemsBatch,
  onEditStockItem, 
  onEditMasterProduct,
  onDeleteStockItem, 
  onAdjustStockQty,
  onAddWaste, 
  onDeleteWaste,
  isSubmitting 
}) {
  const [activeTab, setActiveTab] = useState('blanks');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddBlankOpen, setIsAddBlankOpen] = useState(false);
  const [isAddConsumableOpen, setIsAddConsumableOpen] = useState(false);
  const [isLogWasteOpen, setIsLogWasteOpen] = useState(false);

  // POPUP STATE FOR PRODUCT AVAILABILITY & VARIANTS
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Add Variant inside Pop-up
  const [newVariantColor, setNewVariantColor] = useState('Noir');
  const [newVariantSize, setNewVariantSize] = useState('M');
  const [newVariantQty, setNewVariantQty] = useState(20);

  // Edit State
  const [editingBlank, setEditingBlank] = useState(null);
  const [editingConsumable, setEditingConsumable] = useState(null);
  const [editingMasterProduct, setEditingMasterProduct] = useState(null);
  const [masterEditName, setMasterEditName] = useState('');
  const [masterEditCategory, setMasterEditCategory] = useState('');
  const [masterEditCost, setMasterEditCost] = useState('');
  const [masterEditPrice, setMasterEditPrice] = useState('');

  // New Product with Multi-Variants Generator Form
  const [blankCategory, setBlankCategory] = useState('T-Shirt');
  const [blankName, setBlankName] = useState('');
  const [selectedColors, setSelectedColors] = useState(['Noir', 'Blanc']);
  const [customColorInput, setCustomColorInput] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L', 'XL']);
  const [defaultQtyPerVariant, setDefaultQtyPerVariant] = useState(20);
  const [blankMinAlert, setBlankMinAlert] = useState(5);
  const [blankCostDA, setBlankCostDA] = useState(650);
  const [blankPriceDA, setBlankPriceDA] = useState(1200);

  // Variant Matrix for custom quantity per (Color, Size)
  const [variantMatrix, setVariantMatrix] = useState({});
  const [matrixQuickFillQty, setMatrixQuickFillQty] = useState(10);

  // Pop-up Multi-Size state for existing product
  const [popupAddMode, setPopupAddMode] = useState('multi'); // 'single' or 'multi'
  const [popupMultiColor, setPopupMultiColor] = useState('Blanc');
  const [popupMultiSizes, setPopupMultiSizes] = useState({ 'S': 0, 'M': 5, 'L': 2, 'XL': 0, '2XL': 0 });

  // New Consumable Form
  const [csmCategory, setCsmCategory] = useState('DTF Film');
  const [csmName, setCsmName] = useState('');
  const [csmQty, setCsmQty] = useState(2);
  const [csmUnit, setCsmUnit] = useState('Rouleau');
  const [csmMinAlert, setCsmMinAlert] = useState(1);
  const [csmCostDA, setCsmCostDA] = useState(12000);

  // Log Waste Form
  const [wasteItem, setWasteItem] = useState('');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState('خطأ في المحاذاة أو الضغط الحراري (Décalage / Pression)');
  const [wasteCostDA, setWasteCostDA] = useState(650);

  const blanks = data.stock_blanks || [];
  const consumables = data.stock_consumables || [];
  const waste = data.waste || [];

  // Group blanks by Product Name to create Master Products
  const groupedProducts = React.useMemo(() => {
    const map = {};
    blanks.forEach(item => {
      const name = item.Item_Name ? item.Item_Name.trim() : 'T-Shirt Standard';
      if (!map[name]) {
        map[name] = {
          name,
          category: item.Category || 'T-Shirt',
          unitCost: parseFloat(item.Unit_Cost_DA) || 0,
          unitPrice: parseFloat(item.Unit_Price_DA) || 0,
          totalQty: 0,
          variants: [],
          colors: new Set(),
          sizes: new Set()
        };
      }
      const qty = parseFloat(item.Quantity) || 0;
      map[name].totalQty += qty;
      map[name].variants.push(item);
      if (item.Color) map[name].colors.add(item.Color.trim());
      if (item.Size) map[name].sizes.add(item.Size.trim());
    });

    return Object.values(map).map(p => ({
      ...p,
      colors: Array.from(p.colors),
      sizes: Array.from(p.sizes)
    }));
  }, [blanks]);

  // Keep selectedProductDetails updated live with blanks data
  const currentSelectedProduct = selectedProductDetails 
    ? groupedProducts.find(p => p.name === selectedProductDetails.name) || selectedProductDetails
    : null;

  // Multi-variant creation handler with custom quantities per (Color, Size)
  const handleAddProductWithVariants = async (e) => {
    e.preventDefault();
    if (!blankName.trim()) {
      alert('يرجى كتابة اسم المنتج');
      return;
    }
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      alert('يرجى اختيار لون واحد ومقاس واحد على الأقل');
      return;
    }

    const itemsToAdd = [];
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        const qty = getVariantQty(color, size);
        itemsToAdd.push({
          category: blankCategory,
          item_name: blankName.trim(),
          color: color.trim(),
          size: size.trim(),
          quantity: qty,
          min_alert: parseInt(blankMinAlert) || 5,
          unit_cost_da: parseFloat(blankCostDA) || 0,
          unit_price_da: parseFloat(blankPriceDA) || 0
        });
      }
    }

    if (onAddStockItemsBatch) {
      await onAddStockItemsBatch('blank', itemsToAdd);
    } else {
      for (const item of itemsToAdd) {
        await onAddStockItem('blank', item);
      }
    }

    setIsAddBlankOpen(false);
    setBlankName('');
    setVariantMatrix({});
  };

  // Add single variant from inside the pop-up
  const handleAddVariantInsideModal = (e) => {
    e.preventDefault();
    if (!currentSelectedProduct) return;

    onAddStockItem('blank', {
      category: currentSelectedProduct.category,
      item_name: currentSelectedProduct.name,
      color: newVariantColor.trim(),
      size: newVariantSize.trim(),
      quantity: parseInt(newVariantQty) || 0,
      min_alert: 5,
      unit_cost_da: currentSelectedProduct.unitCost,
      unit_price_da: currentSelectedProduct.unitPrice
    });

    setNewVariantQty(20);
  };

  const handleEditBlankSubmit = (e) => {
    e.preventDefault();
    if (!editingBlank) return;
    onEditStockItem('blank', editingBlank);
    setEditingBlank(null);
  };

  const handleOpenMasterEdit = (prod) => {
    setEditingMasterProduct(prod);
    setMasterEditName(prod.name);
    setMasterEditCategory(prod.category || 'T-Shirt');
    setMasterEditCost(prod.unitCost || 0);
    setMasterEditPrice(prod.unitPrice || 0);
  };

  const handleEditMasterProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingMasterProduct || !masterEditName.trim()) return;
    if (onEditMasterProduct) {
      await onEditMasterProduct(editingMasterProduct.name, {
        item_name: masterEditName.trim(),
        category: masterEditCategory.trim(),
        unit_cost_da: parseFloat(masterEditCost) || 0,
        unit_price_da: parseFloat(masterEditPrice) || 0
      });
    }
    setEditingMasterProduct(null);
  };

  const handleAddConsumableSubmit = (e) => {
    e.preventDefault();
    if (!csmName.trim()) {
      alert('يرجى إدخال اسم المادة');
      return;
    }
    onAddStockItem('consumable', {
      category: csmCategory,
      item_name: csmName.trim(),
      quantity: parseFloat(csmQty) || 0,
      unit: csmUnit,
      min_alert: parseFloat(csmMinAlert) || 1,
      unit_cost_da: parseFloat(csmCostDA) || 0
    });
    setIsAddConsumableOpen(false);
    setCsmName('');
  };

  const handleEditConsumableSubmit = (e) => {
    e.preventDefault();
    if (!editingConsumable) return;
    onEditStockItem('consumable', editingConsumable);
    setEditingConsumable(null);
  };

  const handleAddWasteSubmit = (e) => {
    e.preventDefault();
    onAddWaste({
      item_name: wasteItem || (blanks[0] ? blanks[0].Item_Name : 'T-Shirt'),
      quantity: parseInt(wasteQty) || 1,
      reason: wasteReason,
      loss_cost_da: parseFloat(wasteCostDA) || 0
    });
    setIsLogWasteOpen(false);
  };

  const handleDeleteItem = (type, id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف (${name}) نهائياً؟`)) {
      onDeleteStockItem(type, id);
    }
  };

  // Pre-set standard colors
  const standardColors = ['Noir', 'Blanc', 'Gris', 'Bleu Marine', 'Rouge', 'Beige', 'Vert Bouteille', 'Bordeaux'];
  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

  const toggleColor = (c) => {
    if (selectedColors.includes(c)) {
      setSelectedColors(selectedColors.filter(item => item !== c));
    } else {
      setSelectedColors([...selectedColors, c]);
    }
  };

  const toggleSize = (s) => {
    if (selectedSizes.includes(s)) {
      setSelectedSizes(selectedSizes.filter(item => item !== s));
    } else {
      setSelectedSizes([...selectedSizes, s]);
    }
  };

  const addCustomColor = () => {
    if (!customColorInput.trim()) return;
    if (!selectedColors.includes(customColorInput.trim())) {
      setSelectedColors([...selectedColors, customColorInput.trim()]);
    }
    setCustomColorInput('');
  };

  // Helper for color indicator circle
  const getColorDotBg = (colorName) => {
    const c = (colorName || '').toLowerCase();
    if (c.includes('blanc') || c.includes('white')) return 'bg-white border border-slate-300';
    if (c.includes('noir') || c.includes('black')) return 'bg-slate-900 border border-slate-800';
    if (c.includes('gris') || c.includes('grey') || c.includes('gray')) return 'bg-slate-400';
    if (c.includes('bleu') || c.includes('blue')) return 'bg-blue-600';
    if (c.includes('rouge') || c.includes('red')) return 'bg-rose-600';
    if (c.includes('vert') || c.includes('green')) return 'bg-emerald-600';
    if (c.includes('beige') || c.includes('camel')) return 'bg-amber-200 border border-amber-300';
    if (c.includes('bordeaux')) return 'bg-rose-900';
    return 'bg-brand-500';
  };

  // Variant Matrix helpers
  const getVariantQty = (color, size) => {
    const key = `${color}___${size}`;
    if (variantMatrix[key] !== undefined) {
      return variantMatrix[key];
    }
    return parseInt(defaultQtyPerVariant) || 0;
  };

  const handleSetVariantQty = (color, size, val) => {
    const key = `${color}___${size}`;
    const qty = Math.max(0, parseInt(val) || 0);
    setVariantMatrix(prev => ({
      ...prev,
      [key]: qty
    }));
  };

  const handleAdjustVariantQty = (color, size, delta) => {
    const current = getVariantQty(color, size);
    const next = Math.max(0, current + delta);
    handleSetVariantQty(color, size, next);
  };

  const handleApplyQuickFillToAll = (val) => {
    const target = Math.max(0, parseInt(val) || 0);
    const newMatrix = {};
    selectedColors.forEach(c => {
      selectedSizes.forEach(s => {
        newMatrix[`${c}___${s}`] = target;
      });
    });
    setVariantMatrix(newMatrix);
  };

  const handleCopyColorQuantities = (sourceColor) => {
    setVariantMatrix(prev => {
      const updated = { ...prev };
      selectedColors.forEach(targetColor => {
        if (targetColor !== sourceColor) {
          selectedSizes.forEach(s => {
            const srcKey = `${sourceColor}___${s}`;
            const targetKey = `${targetColor}___${s}`;
            updated[targetKey] = prev[srcKey] !== undefined ? prev[srcKey] : (parseInt(defaultQtyPerVariant) || 0);
          });
        }
      });
      return updated;
    });
  };

  const handleResetAllToZero = () => {
    handleApplyQuickFillToAll(0);
  };

  const totalMatrixPieces = React.useMemo(() => {
    let sum = 0;
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        sum += getVariantQty(color, size);
      });
    });
    return sum;
  }, [selectedColors, selectedSizes, variantMatrix, defaultQtyPerVariant]);

  const totalMatrixCost = totalMatrixPieces * (parseFloat(blankCostDA) || 0);
  const totalMatrixValue = totalMatrixPieces * (parseFloat(blankPriceDA) || 0);

  // Pop-up Multi-Size helpers inside existing product details
  const handleSetPopupMultiSizeQty = (sz, val) => {
    const q = Math.max(0, parseInt(val) || 0);
    setPopupMultiSizes(prev => ({ ...prev, [sz]: q }));
  };

  const handleAdjustPopupMultiSizeQty = (sz, delta) => {
    const cur = parseInt(popupMultiSizes[sz]) || 0;
    handleSetPopupMultiSizeQty(sz, cur + delta);
  };

  const handleAddMultiVariantsInsideModal = async (e) => {
    e.preventDefault();
    if (!currentSelectedProduct) return;
    if (!popupMultiColor.trim()) {
      alert('يرجى كتابة أو اختيار اللون');
      return;
    }

    const itemsToAdd = [];
    Object.entries(popupMultiSizes).forEach(([sz, q]) => {
      const qtyNum = parseInt(q) || 0;
      if (qtyNum > 0) {
        itemsToAdd.push({
          category: currentSelectedProduct.category,
          item_name: currentSelectedProduct.name,
          color: popupMultiColor.trim(),
          size: sz.trim(),
          quantity: qtyNum,
          min_alert: 5,
          unit_cost_da: currentSelectedProduct.unitCost,
          unit_price_da: currentSelectedProduct.unitPrice
        });
      }
    });

    if (itemsToAdd.length === 0) {
      alert('يرجى تحديد كمية أكبر من 0 لمقاس واحد على الأقل (مثلاً: 5 في M أو 2 في L)');
      return;
    }

    if (onAddStockItemsBatch) {
      await onAddStockItemsBatch('blank', itemsToAdd);
    } else {
      for (const item of itemsToAdd) {
        await onAddStockItem('blank', item);
      }
    }

    setPopupMultiSizes({ 'S': 0, 'M': 5, 'L': 2, 'XL': 0, '2XL': 0 });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            <span>{t.stock} (المنتجات، الألوان والمقاسات المتوفرة)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            انقر على أي منتج لعرض نافذة الألوان والمقاسات المتوفرة (Disponibilité)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'blanks' && (
            <>
              {/* View toggle */}
              <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  title="عرض المنتجات كبطاقات"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">البطاقات</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  title="عرض مفصل كجدول"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">الجدول</span>
                </button>
              </div>

              <button
                onClick={() => setIsAddBlankOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ إضافة منتج مع مقاسات وألوان</span>
              </button>
            </>
          )}

          {activeTab === 'consumables' && (
            <button
              onClick={() => setIsAddConsumableOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addConsumable}</span>
            </button>
          )}

          {activeTab === 'waste' && (
            <button
              onClick={() => setIsLogWasteOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4" />
              <span>{t.logWaste}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('blanks')}
            className={`pb-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'blanks'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>الملابس والمنتجات الخام (Blanks)</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {groupedProducts.length} منتج
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consumables')}
            className={`pb-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'consumables'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>{t.consumablesTab}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {consumables.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={`pb-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'waste'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{t.wasteTab}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {waste.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن منتج، مقاس، أو لون..."
            className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* TAB 1: BLANKS (CARDS VIEW WITH CLICKABLE POP-UP) */}
      {activeTab === 'blanks' && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groupedProducts
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((prod, idx) => {
              const isLow = prod.totalQty <= 15;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedProductDetails(prod)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-500 transition-all cursor-pointer p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {prod.category}
                        </span>
                        <h3 className="font-black text-slate-900 text-base mt-1 group-hover:text-brand-600 transition">
                          {prod.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMasterEdit(prod);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                          title="تعديل اسم أو سعر المنتج"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap ${
                          isLow ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.totalQty} قطعة
                        </span>
                      </div>
                    </div>

                    {/* Colors Available */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">
                        الألوان المتوفرة ({prod.colors.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.colors.map((color, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full border border-slate-300 ${
                              color.toLowerCase().includes('blanc') ? 'bg-white' :
                              color.toLowerCase().includes('noir') ? 'bg-slate-900' :
                              color.toLowerCase().includes('gris') ? 'bg-slate-400' :
                              color.toLowerCase().includes('rouge') ? 'bg-rose-600' :
                              color.toLowerCase().includes('bleu') ? 'bg-blue-800' :
                              'bg-brand-500'
                            }`}></span>
                            <span>{color}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sizes Available */}
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">
                        المقاسات المتوفرة ({prod.sizes.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map((size, i) => (
                          <span
                            key={i}
                            className="text-xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Pop-up trigger */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">سعر الشراء: </span>
                      <span className="font-bold text-slate-800">{prod.unitCost} {t.currency}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 font-extrabold text-brand-600 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition">
                      <Eye className="w-4 h-4" />
                      <span>عرض التوفر والمقاسات</span>
                    </div>
                  </div>
                </div>
              );
            })}

          {groupedProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              لا توجد منتجات مسجلة. اضغط على "+ إضافة منتج مع مقاسات وألوان" لإنشاء أول منتج!
            </div>
          )}
        </div>
      )}

      {/* TAB 1: BLANKS (DETAILED TABLE VIEW) */}
      {activeTab === 'blanks' && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right min-w-[720px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-3">الكود</th>
                  <th className="py-3 px-3">اسم المادة</th>
                  <th className="py-3 px-3">اللون</th>
                  <th className="py-3 px-3">المقاس</th>
                  <th className="py-3 px-3 text-center">الكمية (+ / - سريع)</th>
                  <th className="py-3 px-3">سعر الشراء</th>
                  <th className="py-3 px-3">سعر البيع</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-3 text-center">تعديل / حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blanks
                  .filter(b => b.Item_Name && b.Item_Name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => {
                    const qty = parseFloat(item.Quantity) || 0;
                    const minAlert = parseFloat(item.Min_Alert) || 5;
                    const isLow = qty <= minAlert;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {item.ID}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {item.Item_Name}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700">
                          {item.Color}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-extrabold text-xs">
                            {item.Size}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => onAdjustStockQty('blank', item.ID, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 border text-slate-700 font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`font-extrabold px-1.5 ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                              {qty}
                            </span>
                            <button
                              onClick={() => onAdjustStockQty('blank', item.ID, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 border text-slate-700 font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-bold">
                          {parseFloat(item.Unit_Cost_DA || 0).toLocaleString()} {t.currency}
                        </td>
                        <td className="py-3 px-3 text-brand-700 font-extrabold">
                          {parseFloat(item.Unit_Price_DA || 0).toLocaleString()} {t.currency}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isLow ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                              منخفض
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              متوفر
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingBlank(item)}
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem('blank', item.ID, item.Item_Name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POP-UP MODAL: PRODUCT AVAILABILITY & VARIANTS MATRIX (DISPONIBILITE) */}
      {currentSelectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Pop-up Header */}
            <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-4 sm:p-6 flex items-start justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
                  {currentSelectedProduct.category}
                </span>
                <h3 className="text-lg sm:text-2xl font-black mt-1 truncate">
                  {currentSelectedProduct.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  إجمالي المخزون المتوفر: <span className="font-extrabold text-amber-300 text-sm">{currentSelectedProduct.totalQty} قطعة</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenMasterEdit(currentSelectedProduct)}
                  className="px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-xs"
                  title="تعديل اسم أو سعر المنتج الشامل"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden xs:inline">تعديل المنتج</span>
                </button>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Pop-up Body: Availability Grid */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 mb-2.5 sm:mb-3 flex items-center justify-between">
                  <span>جدول توفر الألوان والمقاسات (Disponibilité)</span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-normal">
                    انقر (+ / -) للتعديل السريع
                  </span>
                </h4>

                {/* Variants List / Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                  {currentSelectedProduct.variants.map((v, i) => {
                    const qty = parseFloat(v.Quantity) || 0;
                    const isZero = qty === 0;
                    const isLow = qty <= 5 && !isZero;

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          isZero ? 'bg-slate-50 border-slate-200 opacity-60' :
                          isLow ? 'bg-rose-50/60 border-rose-200' :
                          'bg-white border-slate-200 hover:border-brand-500 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-full border border-slate-300 ${
                              v.Color && v.Color.toLowerCase().includes('blanc') ? 'bg-white' :
                              v.Color && v.Color.toLowerCase().includes('noir') ? 'bg-slate-900' :
                              'bg-brand-500'
                            }`}></span>
                            <span>{v.Color}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-black text-xs">
                              {v.Size}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBlank(v);
                              }}
                              className="p-1 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                              title="تعديل هذا المقاس/اللون"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem('blank', v.ID, `${v.Item_Name} (${v.Color} - ${v.Size})`);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="حذف هذا المتغير"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">المتوفر</span>
                            <span className={`text-base font-black ${
                              isZero ? 'text-slate-400' : isLow ? 'text-rose-600' : 'text-emerald-700'
                            }`}>
                              {qty} قطعة
                            </span>
                          </div>

                          {/* Stepper Buttons (+ / -) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAdjustStockQty('blank', v.ID, -1)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition"
                              title="إنقاص 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onAdjustStockQty('blank', v.ID, 1)}
                              className="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm transition"
                              title="زيادة 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Variant(s) to this Product */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-brand-600" />
                    <span>إضافة مقاسات جديدة لهذا المنتج</span>
                  </h5>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPopupAddMode('multi')}
                      className={`px-2.5 py-1 rounded-md transition ${popupAddMode === 'multi' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      عدة مقاسات (5M, 2L, ...)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopupAddMode('single')}
                      className={`px-2.5 py-1 rounded-md transition ${popupAddMode === 'single' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      مقاس فردي واحد
                    </button>
                  </div>
                </div>

                {popupAddMode === 'multi' ? (
                  <form onSubmit={handleAddMultiVariantsInsideModal} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <div className="w-full sm:w-48">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">اللون المستهدف:</label>
                        <input
                          type="text"
                          required
                          value={popupMultiColor}
                          onChange={(e) => setPopupMultiColor(e.target.value)}
                          placeholder="اللون (مثال: Blanc, Noir)..."
                          className="w-full px-3 py-1.5 text-xs font-bold border rounded-xl bg-white outline-none"
                        />
                      </div>
                      
                      {/* Color Suggestions from existing product colors */}
                      {currentSelectedProduct.colors && currentSelectedProduct.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 sm:pt-4">
                          <span className="text-[10px] text-slate-400">ألوان المنتج:</span>
                          {currentSelectedProduct.colors.map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setPopupMultiColor(c)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                                popupMultiColor === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Size Steppers Matrix */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        حدد الكمية لكل مقاس في اللون ({popupMultiColor}):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {standardSizes.map(sz => {
                          const val = popupMultiSizes[sz] !== undefined ? popupMultiSizes[sz] : 0;
                          return (
                            <div key={sz} className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center shadow-xs">
                              <span className="text-[11px] font-black text-slate-700 mb-1">مقاس {sz}</span>
                              <div className="flex items-center w-full gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustPopupMultiSizeQty(sz, -1)}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={val}
                                  onChange={(e) => handleSetPopupMultiSizeQty(sz, e.target.value)}
                                  className="w-full text-center font-mono font-bold text-xs text-slate-900 py-0.5 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAdjustPopupMultiSizeQty(sz, 1)}
                                  className="w-5 h-5 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-600">
                        مجموع القطع المراد إضافتها: <strong className="text-brand-700">{Object.values(popupMultiSizes).reduce((a, b) => a + (parseInt(b) || 0), 0)} قطعة</strong>
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'جاري الإضافة...' : '+ إضافة هذه المقاسات للتشكيلة'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddVariantInsideModal} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2 sm:col-span-1">
                      <input
                        type="text"
                        required
                        value={newVariantColor}
                        onChange={(e) => setNewVariantColor(e.target.value)}
                        placeholder="اللون (Rouge)"
                        className="w-full px-3 py-1.5 text-xs font-bold border rounded-xl bg-white outline-none"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="text"
                        required
                        value={newVariantSize}
                        onChange={(e) => setNewVariantSize(e.target.value)}
                        placeholder="المقاس (M)"
                        className="w-full px-3 py-1.5 text-xs font-bold border rounded-xl bg-white outline-none text-center"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        min="0"
                        value={newVariantQty}
                        onChange={(e) => setNewVariantQty(e.target.value)}
                        placeholder="الكمية"
                        className="w-full px-3 py-1.5 text-xs font-bold border rounded-xl bg-white outline-none text-center"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        + إضافة للتشكيلة
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Pop-up Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition text-center"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: CONSUMABLES TABLE */}
      {activeTab === 'consumables' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">الكود</th>
                  <th className="py-3 px-4">الصنف</th>
                  <th className="py-3 px-4">اسم المادة</th>
                  <th className="py-3 px-4 text-center">الكمية (+ / -)</th>
                  <th className="py-3 px-4">الوحدة</th>
                  <th className="py-3 px-4">سعر الشراء (دج)</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">تعديل / حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumables
                  .filter(c => c.Item_Name && c.Item_Name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((c, idx) => {
                    const qty = parseFloat(c.Quantity) || 0;
                    const isLow = qty <= (parseFloat(c.Min_Alert) || 1);

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{c.ID}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">{c.Category}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{c.Item_Name}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                            <button
                              onClick={() => onAdjustStockQty('consumable', c.ID, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 border text-slate-700 font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`font-extrabold px-1.5 ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>{qty}</span>
                            <button
                              onClick={() => onAdjustStockQty('consumable', c.ID, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 border text-slate-700 font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-bold">{c.Unit}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {parseFloat(c.Unit_Cost_DA || 0).toLocaleString()} {t.currency}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isLow ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                              أوشك على النفاد
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              متوفر
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditingConsumable(c)}
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem('consumable', c.ID, c.Item_Name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WASTE TABLE */}
      {activeTab === 'waste' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم التالف</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">المنتج التالف</th>
                  <th className="py-3 px-4 text-center">الكمية</th>
                  <th className="py-3 px-4">سبب التلف</th>
                  <th className="py-3 px-4">تكلفة الخسارة (دج)</th>
                  <th className="py-3 px-4 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waste.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{w.ID}</td>
                    <td className="py-3.5 px-4 text-slate-500">{w.Date ? w.Date.slice(0, 10) : '-'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{w.Item_Name}</td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-rose-600">{w.Quantity} قطع</td>
                    <td className="py-3.5 px-4 text-slate-600">{w.Reason}</td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600">
                      {parseFloat(w.Loss_Cost_DA || 0).toLocaleString()} {t.currency}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteWaste(w.ID)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT WITH MULTI-VARIANTS (COLORS & SIZES GENERATOR) */}
      {isAddBlankOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  إضافة منتج خام مع تفصيل المقاسات والكميات (Variantes)
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  حدد المقاسات والكميات الدقيقة المتوفرة لديك لكل لون على حدة (مثلاً: 5 في M و 2 في L)
                </p>
              </div>
              <button onClick={() => setIsAddBlankOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductWithVariants} className="space-y-4 overflow-y-auto flex-1 pr-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                  <select
                    value={blankCategory}
                    onChange={(e) => setBlankCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  >
                    <option value="T-Shirt">T-Shirt (تيشيرت)</option>
                    <option value="Hoodie">Hoodie (هودي)</option>
                    <option value="Sweatshirt">Sweatshirt (سويتشيرت)</option>
                    <option value="Polo">Polo (بولو)</option>
                    <option value="Tote Bag">Tote Bag (حقيبة قماش)</option>
                    <option value="Mug">Mug (كوب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={blankName}
                    onChange={(e) => setBlankName(e.target.value)}
                    placeholder="مثال: T-Shirt Oversize 240g"
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              {/* Colors selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الألوان المتوفرة (انقر للاختيار):
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {standardColors.map((color, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 ${
                        selectedColors.includes(color)
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${getColorDotBg(color)}`}></span>
                      <span>{color}</span>
                    </button>
                  ))}
                </div>

                {/* Add custom color */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="أو اكتب لون مخصص (مثال: Kaki, Camel)..."
                    className="flex-1 px-3 py-1.5 text-xs font-medium border rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                  >
                    + إضافة لون
                  </button>
                </div>
              </div>

              {/* Sizes selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المقاسات المتوفرة (انقر للاختيار):
                </label>
                <div className="flex flex-wrap gap-2">
                  {standardSizes.map((size, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => toggleSize(size)}
                      className={`w-12 py-1.5 text-xs font-black rounded-lg border transition ${
                        selectedSizes.includes(size)
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing & Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشراء للقطعة (دج)</label>
                  <input
                    type="number"
                    min="0"
                    value={blankCostDA}
                    onChange={(e) => setBlankCostDA(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر البيع المقترح (دج)</label>
                  <input
                    type="number"
                    min="0"
                    value={blankPriceDA}
                    onChange={(e) => setBlankPriceDA(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl text-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تنبيه الحد الأدنى (قطع)</label>
                  <input
                    type="number"
                    min="1"
                    value={blankMinAlert}
                    onChange={(e) => setBlankMinAlert(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl text-rose-600 text-center font-mono"
                  />
                </div>
              </div>

              {/* DETAILED QUANTITY MATRIX PER COLOR & SIZE */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>تحديد كمية كل مقاس بدقة (5M, 2L, ...)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      حدد عدد القطع الموجودة لديك في كل مقاس لكل لون على حدة
                    </p>
                  </div>

                  {/* Quick Fill Toolbar */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600">ملء سريع:</span>
                    <input
                      type="number"
                      min="0"
                      value={matrixQuickFillQty}
                      onChange={(e) => setMatrixQuickFillQty(e.target.value)}
                      className="w-14 px-2 py-1 text-xs font-black border rounded-lg bg-white text-center font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyQuickFillToAll(matrixQuickFillQty)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold transition"
                      title="تطبيق هذا الرقم على كل المقاسات والألوان"
                    >
                      تطبيق للكل
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAllToZero}
                      className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold transition"
                      title="تصفير كل المقاسات (0)"
                    >
                      تصفير
                    </button>
                  </div>
                </div>

                {/* Color Cards with Size Steppers */}
                {selectedColors.length === 0 || selectedSizes.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800 font-bold">
                    يرجى اختيار لون واحد ومقاس واحد على الأقل أعلاه لتحديد الكميات
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                    {selectedColors.map(color => {
                      const colorTotal = selectedSizes.reduce((sum, size) => sum + getVariantQty(color, size), 0);
                      
                      return (
                        <div key={color} className="bg-slate-50/90 p-3 sm:p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition">
                          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full shadow-xs ${getColorDotBg(color)}`}></span>
                              <span className="font-black text-xs text-slate-900">{color}</span>
                              <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-mono">
                                المجموع: <strong className="text-brand-700 font-extrabold">{colorTotal}</strong> قطعة
                              </span>
                            </div>

                            {selectedColors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleCopyColorQuantities(color)}
                                className="text-[11px] text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline"
                                title="نسخ مقاسات هذا اللون إلى باقي الألوان"
                              >
                                <Copy className="w-3 h-3" />
                                <span>نسخ هذا التوزيع لباقي الألوان</span>
                              </button>
                            )}
                          </div>

                          {/* Size inputs grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {selectedSizes.map(size => {
                              const currentQty = getVariantQty(color, size);
                              return (
                                <div key={size} className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                                  <span className="text-[11px] font-black text-slate-700 mb-1">
                                    مقاس {size}
                                  </span>
                                  <div className="flex items-center w-full gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustVariantQty(color, size, -1)}
                                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0"
                                      title="إنقاص 1"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentQty}
                                      onChange={(e) => handleSetVariantQty(color, size, e.target.value)}
                                      className="w-full text-center font-mono font-black text-xs text-slate-900 border border-slate-200 rounded-lg py-1 focus:ring-1 focus:ring-brand-500 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustVariantQty(color, size, 1)}
                                      className="w-6 h-6 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center shrink-0"
                                      title="زيادة 1"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Financial & Stock Summary */}
              <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-3.5 rounded-2xl border border-brand-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">التشكيلات والمقاسات</span>
                  <span className="text-sm font-black text-slate-900">{selectedColors.length * selectedSizes.length} تشكيلة</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">إجمالي القطع في المخزن</span>
                  <span className="text-sm font-black text-brand-700 font-mono">{totalMatrixPieces} قطعة</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">رأس مال المخزون</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{totalMatrixCost.toLocaleString()} دج</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">القيمة البيعية المتوقعة</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">{totalMatrixValue.toLocaleString()} دج</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddBlankOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ في الشيت...' : `حفظ كل المقاسات (${totalMatrixPieces} قطعة)`}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONSUMABLE */}
      {isAddConsumableOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900">{t.addConsumable}</h3>
              <button onClick={() => setIsAddConsumableOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddConsumableSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                  <select
                    value={csmCategory}
                    onChange={(e) => setCsmCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  >
                    <option value="DTF Film">رول فيلم DTF (Film)</option>
                    <option value="Poudre">بودرة DTF (Powder)</option>
                    <option value="Encre">حبر DTF (Ink)</option>
                    <option value="Emballage">أكياس وتغليف</option>
                    <option value="Autre">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة</label>
                  <input
                    type="text"
                    required
                    value={csmName}
                    onChange={(e) => setCsmName(e.target.value)}
                    placeholder="مثال: Rouleau DTF 60cm x 100m"
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    step="0.1"
                    value={csmQty}
                    onChange={(e) => setCsmQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوحدة</label>
                  <select
                    value={csmUnit}
                    onChange={(e) => setCsmUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  >
                    <option value="Rouleau">رول (Rouleau)</option>
                    <option value="Kg">كغ (Kg)</option>
                    <option value="Litre">لتر (Litre)</option>
                    <option value="Pièce">قطعة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشراء (دج)</label>
                  <input
                    type="number"
                    value={csmCostDA}
                    onChange={(e) => setCsmCostDA(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddConsumableOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'جاري الحفظ...' : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG WASTE */}
      {isLogWasteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 space-y-4 my-auto overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-extrabold text-base text-rose-700 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                <span>{t.logWaste}</span>
              </h3>
              <button onClick={() => setIsLogWasteOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWasteSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المنتج التالف</label>
                <select
                  value={wasteItem}
                  onChange={(e) => setWasteItem(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                >
                  {blanks.map(b => (
                    <option key={b.ID} value={`${b.Item_Name} (${b.Color} - ${b.Size})`}>
                      {b.Item_Name} ({b.Color} - {b.Size})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية التالفة</label>
                  <input
                    type="number"
                    min="1"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تكلفة الخسارة (دج)</label>
                  <input
                    type="number"
                    value={wasteCostDA}
                    onChange={(e) => setWasteCostDA(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب التلف</label>
                <input
                  type="text"
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsLogWasteOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تسجيل التالف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INDIVIDUAL VARIANT / BLANK ITEM */}
      {editingBlank && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    تعديل المتغير: {editingBlank.Item_Name} ({editingBlank.ID})
                  </h3>
                  <p className="text-[11px] text-slate-500">تعديل اللون، المقاس، الكمية وسعر القطعة</p>
                </div>
              </div>
              <button onClick={() => setEditingBlank(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBlankSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    value={editingBlank.Item_Name}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Item_Name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                  <input
                    type="text"
                    value={editingBlank.Category || 'T-Shirt'}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللون</label>
                  <input
                    type="text"
                    required
                    value={editingBlank.Color}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Color: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المقاس</label>
                  <input
                    type="text"
                    required
                    value={editingBlank.Size}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Size: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية المتوفرة</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingBlank.Quantity}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-extrabold border border-slate-300 rounded-xl text-center text-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشراء (دج)</label>
                  <input
                    type="number"
                    value={editingBlank.Unit_Cost_DA}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Unit_Cost_DA: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر البيع المقترح (دج)</label>
                  <input
                    type="number"
                    value={editingBlank.Unit_Price_DA}
                    onChange={(e) => setEditingBlank({ ...editingBlank, Unit_Price_DA: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl text-emerald-700 font-extrabold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBlank(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CONSUMABLE */}
      {editingConsumable && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>تعديل مادة الاستهلاك: {editingConsumable.Item_Name}</span>
              </h3>
              <button onClick={() => setEditingConsumable(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditConsumableSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة</label>
                <input
                  type="text"
                  required
                  value={editingConsumable.Item_Name}
                  onChange={(e) => setEditingConsumable({ ...editingConsumable, Item_Name: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصنف</label>
                  <input
                    type="text"
                    value={editingConsumable.Category}
                    onChange={(e) => setEditingConsumable({ ...editingConsumable, Category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={editingConsumable.Unit}
                    onChange={(e) => setEditingConsumable({ ...editingConsumable, Unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    value={editingConsumable.Quantity}
                    onChange={(e) => setEditingConsumable({ ...editingConsumable, Quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشراء (دج)</label>
                  <input
                    type="number"
                    value={editingConsumable.Unit_Cost_DA}
                    onChange={(e) => setEditingConsumable({ ...editingConsumable, Unit_Cost_DA: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingConsumable(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MASTER PRODUCT (ACROSS ALL VARIANTS) */}
      {editingMasterProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    تعديل المنتج: {editingMasterProduct.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">تحديث الاسم والأسعار لجميع الألوان والمقاسات</p>
                </div>
              </div>
              <button onClick={() => setEditingMasterProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMasterProductSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={masterEditName}
                  onChange={(e) => setMasterEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصنف (Catégorie)</label>
                <input
                  type="text"
                  required
                  value={masterEditCategory}
                  onChange={(e) => setMasterEditCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر الشراء (دج)</label>
                  <input
                    type="number"
                    value={masterEditCost}
                    onChange={(e) => setMasterEditCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سعر البيع (دج)</label>
                  <input
                    type="number"
                    value={masterEditPrice}
                    onChange={(e) => setMasterEditPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl text-emerald-700 font-extrabold"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                💡 سيتم تحديث هذا الاسم والأسعار عبر كافة مقاسات وألوان هذا المنتج في جدول المخزون.
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMasterProduct(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تحديث المنتج والمتغيرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
