// Speakers & Sound Systems Page Controller
import { store } from '../store.js';
import { addToCart } from '../pos.js';

let activeCategory = 'all'; // all, small, medium, large
let searchQuery = '';

export function renderSpeakersPage() {
  const container = document.getElementById('page-speakers');
  if (!container) return;

  const allItems = store.state.speakers;

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

  const countSmall = allItems.filter(i => i.category === 'small').length;
  const countMedium = allItems.filter(i => i.category === 'medium').length;
  const countLarge = allItems.filter(i => i.category === 'large').length;

  const categoryLabels = {
    all: 'كل الصبات',
    small: 'صب صغير (Small Speaker)',
    medium: 'صب وسط (Medium Speaker)',
    large: 'صب كبير (Large Speaker)'
  };

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- 4 Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">إجمالي قطع الصبات بالمخزن</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${totalQty}</span>
            <span class="text-xs text-slate-500">صب ومكبر صوت</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">رأس مال شراء الصبات</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${costVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م تكلفة</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">القيمة البيعية المتوقعة</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-emerald-600 font-code-mono">${retailVal.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م بيع</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">صبات قاربت على النفاد</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'} font-code-mono">${lowStockCount}</span>
            <span class="text-xs text-slate-500">صنف بحاجة لتوريد</span>
          </div>
        </div>
      </section>

      <!-- Category Filter Tabs & Barcode Search -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <!-- 3 Size Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          ${[
            { id: 'all', label: 'كل الصبات', count: allItems.length },
            { id: 'small', label: 'صب صغير (ميني)', count: countSmall },
            { id: 'medium', label: 'صب وسط (محمول)', count: countMedium },
            { id: 'large', label: 'صب كبير (حفلات / ترولي)', count: countLarge }
          ].map(cat => `
            <button onclick="window.speakersModule.setCategory('${cat.id}')" 
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
            <input type="text" value="${searchQuery}" oninput="window.speakersModule.handleSearch(this.value)"
              placeholder="ابحث باسم الصب، الحجم، الموديل، أو امسح الباركود..."
              class="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          </div>

          <button onclick="window.speakersModule.openAddModal()" 
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ إضافة صب جديد للمخزن</span>
          </button>
        </div>
      </section>

      <!-- Speakers Inventory Table -->
      <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">speaker</span>
            <h3 class="font-bold text-slate-900 text-base">جدول قسم الصبات والمكبرات (${categoryLabels[activeCategory]})</h3>
          </div>
          <span class="text-xs text-slate-500 font-code-mono">${filtered.length} صنف</span>
        </div>

        <div class="overflow-x-auto">
          ${filtered.length === 0 ? `
            <div class="p-16 flex flex-col items-center justify-center text-center text-slate-400">
              <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">speaker_group</span>
              <p class="font-bold text-base text-slate-700">لا توجد صبات مسجلة في هذا القسم (المخزن فارغ)</p>
              <p class="text-xs text-slate-400 mt-1">اضغط على زر "+ إضافة صب جديد" أو امسح باركود الكرتونة</p>
              <button onclick="window.speakersModule.openAddModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة صب جديد الآن</span>
              </button>
            </div>
          ` : `
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                  <th class="py-3 px-4">الباركود</th>
                  <th class="py-3 px-4">اسم الصب والموديل</th>
                  <th class="py-3 px-4">فئة الحجم</th>
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
                          <button onclick="window.speakersModule.quickSellItem('${item.id}')" 
                            class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="إضافة لسلة البيع">
                            <span class="material-symbols-outlined text-[17px]">shopping_cart</span>
                          </button>
                          <button onclick="window.speakersModule.openEditModal('${item.id}')" 
                            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="تعديل">
                            <span class="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button onclick="window.speakersModule.confirmDelete('${item.id}')" 
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

window.speakersModule = {
  setCategory: (cat) => {
    activeCategory = cat;
    renderSpeakersPage();
  },
  handleSearch: (val) => {
    searchQuery = val;
    renderSpeakersPage();
  },
  quickSellItem: (id) => {
    const item = store.state.speakers.find(s => s.id === id);
    if (item) {
      addToCart({ ...item, table: 'speakers' });
      window.posModule.openPOS();
    }
  },
  openAddModal: (prefilledBarcode = '') => {
    const modal = document.getElementById('modal-speaker-item');
    if (modal) {
      document.getElementById('speaker-item-modal-title').innerText = "إضافة صب جديد للمخزن";
      document.getElementById('speaker-edit-id').value = '';
      document.getElementById('speaker-f-barcode').value = prefilledBarcode || store.generateBarcode();
      document.getElementById('speaker-f-name').value = '';
      document.getElementById('speaker-f-category').value = activeCategory === 'all' ? 'small' : activeCategory;
      document.getElementById('speaker-f-brand').value = '';
      document.getElementById('speaker-f-cost').value = '';
      document.getElementById('speaker-f-price').value = '';
      document.getElementById('speaker-f-quantity').value = '1';
      document.getElementById('speaker-f-min-stock').value = '3';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  openEditModal: (id) => {
    const item = store.state.speakers.find(s => s.id === id);
    if (!item) return;
    const modal = document.getElementById('modal-speaker-item');
    if (modal) {
      document.getElementById('speaker-item-modal-title').innerText = "تعديل بيانات الصب";
      document.getElementById('speaker-edit-id').value = item.id;
      document.getElementById('speaker-f-barcode').value = item.barcode;
      document.getElementById('speaker-f-name').value = item.name;
      document.getElementById('speaker-f-category').value = item.category;
      document.getElementById('speaker-f-brand').value = item.brand || '';
      document.getElementById('speaker-f-cost').value = item.buyPrice;
      document.getElementById('speaker-f-price').value = item.sellPrice;
      document.getElementById('speaker-f-quantity').value = item.quantity;
      document.getElementById('speaker-f-min-stock').value = item.minStock || 3;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  saveItem: (e) => {
    e.preventDefault();
    const id = document.getElementById('speaker-edit-id').value;
    const itemData = {
      barcode: document.getElementById('speaker-f-barcode').value.trim(),
      name: document.getElementById('speaker-f-name').value.trim(),
      category: document.getElementById('speaker-f-category').value,
      brand: document.getElementById('speaker-f-brand').value.trim(),
      buyPrice: Number(document.getElementById('speaker-f-cost').value) || 0,
      sellPrice: Number(document.getElementById('speaker-f-price').value) || 0,
      quantity: Number(document.getElementById('speaker-f-quantity').value) || 0,
      minStock: Number(document.getElementById('speaker-f-min-stock').value) || 3
    };

    if (id) {
      store.updateSpeaker(id, itemData);
      window.showToast?.("تم تحديث بيانات الصب بنجاح", "check_circle");
    } else {
      store.addSpeaker(itemData);
      window.showToast?.("تمت إضافة الصب الجديد للمخزن", "add_circle");
    }

    const modal = document.getElementById('modal-speaker-item');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    renderSpeakersPage();
  },
  confirmDelete: (id) => {
    if (confirm("هل تريد بالتأكيد حذف هذا الصب من المخزن؟")) {
      store.deleteSpeaker(id);
      window.showToast?.("تم حذف الصب من المخزن", "delete");
      renderSpeakersPage();
    }
  }
};
