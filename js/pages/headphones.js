// Headphones & Earphones Page Controller
import { store } from '../store.js';
import { addToCart } from '../pos.js';

let activeCategory = 'all'; // all, silicone, classic, bluetooth
let searchQuery = '';

export function renderHeadphonesPage() {
  const container = document.getElementById('page-headphones');
  if (!container) return;

  const allItems = store.state.headphones;

  const filtered = allItems.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.barcode.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const totalQty = allItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const costVal = allItems.reduce((sum, i) => sum + ((Number(i.buyPrice) || 0) * (Number(i.quantity) || 0)), 0);
  const retailVal = allItems.reduce((sum, i) => sum + ((Number(i.sellPrice) || 0) * (Number(i.quantity) || 0)), 0);
  const lowStockCount = allItems.filter(i => (Number(i.quantity) || 0) <= (Number(i.minStock) || 3)).length;

  const countSilicone = allItems.filter(i => i.category === 'silicone').length;
  const countClassic = allItems.filter(i => i.category === 'classic').length;
  const countBluetooth = allItems.filter(i => i.category === 'bluetooth').length;

  const categoryLabels = {
    all: 'كل السماعات',
    silicone: 'سماعة جلدة (In-Ear / Silicone Tip)',
    classic: 'سماعة عضم (Hard-Shell / Classic)',
    bluetooth: 'سماعة بلوتوث (Wireless Earbuds)'
  };

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- 4 Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">إجمالي قطع السماعات بالمخزن</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${totalQty}</span>
            <span class="text-xs text-slate-500">سماعة</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">رأس مال شراء السماعات</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${costVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م تكلفة</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">القيمة البيعية التقديرية</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-emerald-600 font-code-mono">${retailVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م بيع</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">سماعات قاربت على النفاد</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'} font-code-mono">${lowStockCount}</span>
            <span class="text-xs text-slate-500">صنف بحاجة لتوريد</span>
          </div>
        </div>
      </section>

      <!-- Category Filter Tabs & Barcode Search -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <!-- 3 Sub-category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          ${[
            { id: 'all', label: 'كل السماعات', count: allItems.length },
            { id: 'silicone', label: 'سماعة جلدة (In-Ear)', count: countSilicone },
            { id: 'classic', label: 'سماعة عضم (Hard-Shell)', count: countClassic },
            { id: 'bluetooth', label: 'سماعة بلوتوث (Wireless)', count: countBluetooth }
          ].map(cat => `
            <button onclick="window.headphonesModule.setCategory('${cat.id}')" 
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

        <!-- Search Bar & Add Button -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">search</span>
            <input type="text" value="${searchQuery}" oninput="window.headphonesModule.handleSearch(this.value)"
              placeholder="ابحث باسم السماعة، الماركة، أو امسح الباركود مباشرة..."
              class="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          </div>

          <button onclick="window.headphonesModule.openAddModal()" 
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ إضافة سماعة جديدة للمخزن</span>
          </button>
        </div>
      </section>

      <!-- Headphones Inventory Table -->
      <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">headphones</span>
            <h3 class="font-bold text-slate-900 text-base">جدول قسم السماعات والصوتيات (${categoryLabels[activeCategory]})</h3>
          </div>
          <span class="text-xs text-slate-500 font-code-mono">${filtered.length} صنف</span>
        </div>

        <div class="overflow-x-auto">
          ${filtered.length === 0 ? `
            <div class="p-16 flex flex-col items-center justify-center text-center text-slate-400">
              <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">headphones</span>
              <p class="font-bold text-base text-slate-700">لا توجد سماعات مسجلة في هذا القسم (المخزن فارغ)</p>
              <p class="text-xs text-slate-400 mt-1">اضغط على زر "+ إضافة سماعة جديدة" أو امسح باركود العلبة</p>
              <button onclick="window.headphonesModule.openAddModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة سماعة جديدة الآن</span>
              </button>
            </div>
          ` : `
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                  <th class="py-3 px-4">الباركود</th>
                  <th class="py-3 px-4">اسم السماعة والموديل</th>
                  <th class="py-3 px-4">التصنيف</th>
                  <th class="py-3 px-4">سعر التكلفة</th>
                  <th class="py-3 px-4">سعر البيع</th>
                  <th class="py-3 px-4">هامش الربح</th>
                  <th class="py-3 px-4 text-center">الكمية بالمخزن</th>
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
                        ${item.brand ? `<div class="text-[11px] text-slate-400">ماركة: ${item.brand}</div>` : ''}
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
                          <button onclick="window.headphonesModule.quickSellItem('${item.id}')" 
                            class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="إضافة لسلة البيع">
                            <span class="material-symbols-outlined text-[17px]">shopping_cart</span>
                          </button>
                          <button onclick="window.headphonesModule.openEditModal('${item.id}')" 
                            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="تعديل">
                            <span class="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button onclick="window.headphonesModule.confirmDelete('${item.id}')" 
                            class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors" title="حذف">
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

window.headphonesModule = {
  setCategory: (cat) => {
    activeCategory = cat;
    renderHeadphonesPage();
  },
  handleSearch: (val) => {
    searchQuery = val;
    renderHeadphonesPage();
  },
  quickSellItem: (id) => {
    const item = store.state.headphones.find(h => h.id === id);
    if (item) {
      addToCart({ ...item, table: 'headphones' });
      window.posModule.openPOS();
    }
  },
  openAddModal: (prefilledBarcode = '') => {
    const modal = document.getElementById('modal-headphone-item');
    if (modal) {
      document.getElementById('headphone-item-modal-title').innerText = "إضافة سماعة جديدة للمخزن";
      document.getElementById('headphone-edit-id').value = '';
      document.getElementById('headphone-f-barcode').value = prefilledBarcode || store.generateBarcode();
      document.getElementById('headphone-f-name').value = '';
      document.getElementById('headphone-f-category').value = activeCategory === 'all' ? 'silicone' : activeCategory;
      document.getElementById('headphone-f-brand').value = '';
      document.getElementById('headphone-f-cost').value = '';
      document.getElementById('headphone-f-price').value = '';
      document.getElementById('headphone-f-quantity').value = '1';
      document.getElementById('headphone-f-min-stock').value = '3';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  openEditModal: (id) => {
    const item = store.state.headphones.find(h => h.id === id);
    if (!item) return;
    const modal = document.getElementById('modal-headphone-item');
    if (modal) {
      document.getElementById('headphone-item-modal-title').innerText = "تعديل بيانات السماعة";
      document.getElementById('headphone-edit-id').value = item.id;
      document.getElementById('headphone-f-barcode').value = item.barcode;
      document.getElementById('headphone-f-name').value = item.name;
      document.getElementById('headphone-f-category').value = item.category;
      document.getElementById('headphone-f-brand').value = item.brand || '';
      document.getElementById('headphone-f-cost').value = item.buyPrice;
      document.getElementById('headphone-f-price').value = item.sellPrice;
      document.getElementById('headphone-f-quantity').value = item.quantity;
      document.getElementById('headphone-f-min-stock').value = item.minStock || 3;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  saveItem: (e) => {
    e.preventDefault();
    const id = document.getElementById('headphone-edit-id').value;
    const itemData = {
      barcode: document.getElementById('headphone-f-barcode').value.trim(),
      name: document.getElementById('headphone-f-name').value.trim(),
      category: document.getElementById('headphone-f-category').value,
      brand: document.getElementById('headphone-f-brand').value.trim(),
      buyPrice: Number(document.getElementById('headphone-f-cost').value) || 0,
      sellPrice: Number(document.getElementById('headphone-f-price').value) || 0,
      quantity: Number(document.getElementById('headphone-f-quantity').value) || 0,
      minStock: Number(document.getElementById('headphone-f-min-stock').value) || 3
    };

    if (id) {
      store.updateHeadphone(id, itemData);
      window.showToast?.("تم تحديث بيانات السماعة بنجاح", "check_circle");
    } else {
      store.addHeadphone(itemData);
      window.showToast?.("تمت إضافة السماعة الجديدة للمخزن", "add_circle");
    }

    const modal = document.getElementById('modal-headphone-item');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    renderHeadphonesPage();
  },
  confirmDelete: (id) => {
    if (confirm("هل تريد بالتأكيد حذف هذه السماعة من المخزن؟")) {
      store.deleteHeadphone(id);
      window.showToast?.("تم حذف السماعة من المخزن", "delete");
      renderHeadphonesPage();
    }
  }
};
