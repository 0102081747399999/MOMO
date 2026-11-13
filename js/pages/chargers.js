// Chargers & Cables Inventory Page Controller
import { store } from '../store.js';
import { addToCart } from '../pos.js';

let activeCategory = 'all'; // all, complete, adapter, typec, micro, pin
let searchQuery = '';

export function renderChargersPage() {
  const container = document.getElementById('page-chargers');
  if (!container) return;

  const allItems = store.state.chargers;

  // Filter items
  const filtered = allItems.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.barcode.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  // Calculate totals
  const totalQty = allItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const costVal = allItems.reduce((sum, i) => sum + ((Number(i.buyPrice) || 0) * (Number(i.quantity) || 0)), 0);
  const retailVal = allItems.reduce((sum, i) => sum + ((Number(i.sellPrice) || 0) * (Number(i.quantity) || 0)), 0);
  const lowStockCount = allItems.filter(i => (Number(i.quantity) || 0) <= (Number(i.minStock) || 3)).length;

  // Sub-category counts
  const countComplete = allItems.filter(i => i.category === 'complete').length;
  const countAdapter = allItems.filter(i => i.category === 'adapter').length;
  const countTypeC = allItems.filter(i => i.category === 'typec').length;
  const countMicro = allItems.filter(i => i.category === 'micro').length;
  const countPin = allItems.filter(i => i.category === 'pin').length;

  const categoryLabels = {
    all: 'كل الأصناف',
    complete: 'شاحن كامل',
    adapter: 'رأس شاحن',
    typec: 'وصلة شحن عريضة (Type-C)',
    micro: 'وصلة شحن عادية (Micro-USB)',
    pin: 'وصلة شحن رفيعة (Pin)'
  };

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- 4 Top KPI Metric Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">إجمالي قطع الشواحن والوصلات</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${totalQty}</span>
            <span class="text-xs text-slate-500">قطعة بالمخزن</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">إجمالي رأس مال التكلفة</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${costVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">القيمة البيعية الإجمالية</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-emerald-600 font-code-mono">${retailVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">نواقص دون الحد الأدنى</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'} font-code-mono">${lowStockCount}</span>
            <span class="text-xs text-slate-500">صنف بحاجة لتوريد</span>
          </div>
        </div>
      </section>

      <!-- Category Tabs & Rapid Barcode Search -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <!-- 5 Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" id="category-filters">
          ${[
            { id: 'all', label: 'كل الأصناف', count: allItems.length },
            { id: 'complete', label: 'شاحن كامل', count: countComplete },
            { id: 'adapter', label: 'رأس شاحن', count: countAdapter },
            { id: 'typec', label: 'وصلة شحن عريضة (Type-C)', count: countTypeC },
            { id: 'micro', label: 'وصلة شحن عادية (Micro)', count: countMicro },
            { id: 'pin', label: 'وصلة شحن رفيعة (Pin)', count: countPin }
          ].map(cat => `
            <button onclick="window.chargersModule.setCategory('${cat.id}')" 
              class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeCategory === cat.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }">
              <span>${cat.label}</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-code-mono ${
                activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }">${cat.count}</span>
            </button>
          `).join('')}
        </div>

        <!-- Search Bar, Barcode Receiver & Add Button -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">search</span>
            <input type="text" id="chargers-search-input" value="${searchQuery}" 
              oninput="window.chargersModule.handleSearch(this.value)"
              placeholder="ابحث باسم الشاحن، الوصلة، أو امسح الباركود مباشرة..."
              class="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto justify-end">
            <button onclick="window.chargersModule.openAddModal()" 
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ إضافة صنف جديد (شاحن / وصلة)</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Inventory Data Table -->
      <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">cable</span>
            <h3 class="font-bold text-slate-900 text-base">جدول مخزون الشواحن والوصلات (${categoryLabels[activeCategory]})</h3>
          </div>
          <span class="text-xs text-slate-500 font-code-mono">${filtered.length} أصناف معروضة</span>
        </div>

        <div class="overflow-x-auto">
          ${filtered.length === 0 ? `
            <div class="p-16 flex flex-col items-center justify-center text-center text-slate-400">
              <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">inventory_2</span>
              <p class="font-bold text-base text-slate-700">لا توجد أصناف في هذا القسم حالياً (المخزن فارغ)</p>
              <p class="text-xs text-slate-400 mt-1">اضغط على زر "+ إضافة صنف جديد" أعلاه أو امسح باركود المنتج لإدخاله للمخزن</p>
              <button onclick="window.chargersModule.openAddModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>إدخال صنف جديد الآن</span>
              </button>
            </div>
          ` : `
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                  <th class="py-3 px-4">الباركود</th>
                  <th class="py-3 px-4">اسم الصنف والمواصفات</th>
                  <th class="py-3 px-4">القسم الفرعي</th>
                  <th class="py-3 px-4">سعر التكلفة</th>
                  <th class="py-3 px-4">سعر البيع</th>
                  <th class="py-3 px-4">هامش الربح</th>
                  <th class="py-3 px-4 text-center">الرصيد بالمخزن</th>
                  <th class="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${filtered.map(item => {
                  const margin = item.sellPrice - item.buyPrice;
                  const marginPct = item.buyPrice > 0 ? Math.round((margin / item.buyPrice) * 100) : 0;
                  const isLow = item.quantity <= item.minStock;
                  return `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-3 px-4 font-code-mono text-slate-600 font-bold">
                        <span class="px-2 py-1 bg-slate-100 rounded text-[11px]">${item.barcode}</span>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-slate-800 text-sm">${item.name}</div>
                        ${item.spec ? `<div class="text-[11px] text-slate-400">${item.spec}</div>` : ''}
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          ${categoryLabels[item.category] || item.category}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-code-mono text-slate-600">
                        ${Number(item.buyPrice).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 font-code-mono font-bold text-slate-900 text-sm">
                        ${Number(item.sellPrice).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 font-code-mono text-emerald-600 font-bold">
                        +${margin.toFixed(2)} ج.م (${marginPct}%)
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="px-2.5 py-1 rounded-full font-code-mono font-bold text-xs ${
                          isLow ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' : 'bg-emerald-50 text-emerald-700'
                        }">
                          ${item.quantity} قطعة
                        </span>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          <button onclick="window.chargersModule.quickSellItem('${item.id}')" 
                            class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="إضافة لسلة البيع">
                            <span class="material-symbols-outlined text-[17px]">shopping_cart</span>
                          </button>
                          <button onclick="window.chargersModule.openEditModal('${item.id}')" 
                            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="تعديل بيانات الصنف">
                            <span class="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button onclick="window.chargersModule.confirmDelete('${item.id}')" 
                            class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors" title="حذف الصنف">
                            <span class="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </section>
    </div>
  `;
}

window.chargersModule = {
  setCategory: (cat) => {
    activeCategory = cat;
    renderChargersPage();
  },
  handleSearch: (val) => {
    searchQuery = val;
    renderChargersPage();
  },
  quickSellItem: (id) => {
    const item = store.state.chargers.find(c => c.id === id);
    if (item) {
      addToCart({ ...item, table: 'chargers' });
      window.posModule.openPOS();
    }
  },
  openAddModal: (prefilledBarcode = '') => {
    const modal = document.getElementById('modal-charger-item');
    if (modal) {
      document.getElementById('charger-item-modal-title').innerText = "إضافة صنف جديد (شاحن / وصلة)";
      document.getElementById('charger-edit-id').value = '';
      document.getElementById('charger-f-barcode').value = prefilledBarcode || store.generateBarcode();
      document.getElementById('charger-f-name').value = '';
      document.getElementById('charger-f-category').value = activeCategory === 'all' ? 'complete' : activeCategory;
      document.getElementById('charger-f-spec').value = '';
      document.getElementById('charger-f-cost').value = '';
      document.getElementById('charger-f-price').value = '';
      document.getElementById('charger-f-quantity').value = '1';
      document.getElementById('charger-f-min-stock').value = '3';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  openEditModal: (id) => {
    const item = store.state.chargers.find(c => c.id === id);
    if (!item) return;
    const modal = document.getElementById('modal-charger-item');
    if (modal) {
      document.getElementById('charger-item-modal-title').innerText = "تعديل بيانات الصنف";
      document.getElementById('charger-edit-id').value = item.id;
      document.getElementById('charger-f-barcode').value = item.barcode;
      document.getElementById('charger-f-name').value = item.name;
      document.getElementById('charger-f-category').value = item.category;
      document.getElementById('charger-f-spec').value = item.spec || '';
      document.getElementById('charger-f-cost').value = item.buyPrice;
      document.getElementById('charger-f-price').value = item.sellPrice;
      document.getElementById('charger-f-quantity').value = item.quantity;
      document.getElementById('charger-f-min-stock').value = item.minStock || 3;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  saveItem: (e) => {
    e.preventDefault();
    const id = document.getElementById('charger-edit-id').value;
    const itemData = {
      barcode: document.getElementById('charger-f-barcode').value.trim(),
      name: document.getElementById('charger-f-name').value.trim(),
      category: document.getElementById('charger-f-category').value,
      spec: document.getElementById('charger-f-spec').value.trim(),
      buyPrice: Number(document.getElementById('charger-f-cost').value) || 0,
      sellPrice: Number(document.getElementById('charger-f-price').value) || 0,
      quantity: Number(document.getElementById('charger-f-quantity').value) || 0,
      minStock: Number(document.getElementById('charger-f-min-stock').value) || 3
    };

    if (id) {
      store.updateCharger(id, itemData);
      window.showToast?.("تم تحديث بيانات الصنف بنجاح", "check_circle");
    } else {
      store.addCharger(itemData);
      window.showToast?.("تمت إضافة الصنف الجديد إلى المخزن", "add_circle");
    }

    const modal = document.getElementById('modal-charger-item');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    renderChargersPage();
  },
  confirmDelete: (id) => {
    if (confirm("هل تريد بالتأكيد حذف هذا الصنف من المخزن؟")) {
      store.deleteCharger(id);
      window.showToast?.("تم حذف الصنف من المخزن", "delete");
      renderChargersPage();
    }
  }
};
