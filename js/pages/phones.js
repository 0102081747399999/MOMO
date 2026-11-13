// Mobile Phones Sales & Inventory Page Controller (IMEI Tracking)
import { store } from '../store.js';
import { playSound } from '../scanner.js';

let activePhoneFilter = 'available'; // 'available' | 'sold' | 'all'
let phoneSearchQuery = '';

export function renderPhonesPage() {
  const container = document.getElementById('page-phones');
  if (!container) return;

  const allPhones = store.state.phones;

  // Filter
  const filtered = allPhones.filter(p => {
    const matchFilter = activePhoneFilter === 'all' || p.status === activePhoneFilter;
    const matchSearch = !phoneSearchQuery ||
      p.brand.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
      p.imei.includes(phoneSearchQuery) ||
      (p.customerName && p.customerName.toLowerCase().includes(phoneSearchQuery.toLowerCase())) ||
      (p.customerPhone && p.customerPhone.includes(phoneSearchQuery));
    return matchFilter && matchSearch;
  });

  const availableCount = allPhones.filter(p => p.status === 'available').length;
  const soldCount = allPhones.filter(p => p.status === 'sold').length;

  const totalCost = allPhones.filter(p => p.status === 'available').reduce((sum, p) => sum + (Number(p.costPrice) || 0), 0);
  const totalRetail = allPhones.filter(p => p.status === 'available').reduce((sum, p) => sum + (Number(p.sellPrice) || 0), 0);

  // Today's sold phones profit
  const today = new Date().toDateString();
  const soldToday = allPhones.filter(p => p.status === 'sold' && p.soldDate && new Date(p.soldDate).toDateString() === today);
  const todayProfit = soldToday.reduce((sum, p) => sum + ((Number(p.sellPrice) || 0) - (Number(p.costPrice) || 0)), 0);

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- 4 Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">هواتف متوفرة بالمخزن</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${availableCount}</span>
            <span class="text-xs text-slate-500">جهاز جاهز للبيع</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">رأس مال هواتف المخزن</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${totalCost.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م تكلفة</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">أجهزة تم بيعها اليوم</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-blue-600 font-code-mono">${soldToday.length}</span>
            <span class="text-xs text-slate-500">مبايعات اليوم</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-500">صافي ربح بيع الهواتف اليوم</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-3xl font-extrabold text-emerald-600 font-code-mono">+${todayProfit.toFixed(2)}</span>
            <span class="text-xs text-slate-500">ج.م أرباح</span>
          </div>
        </div>
      </section>

      <!-- Operations Bar: Filters, Search & Add Phone -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-2">
          <button onclick="window.phonesModule.setFilter('available')" 
            class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              activePhoneFilter === 'available' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
            }">
            <span>بالمخزن (متاح)</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-code-mono ${
              activePhoneFilter === 'available' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }">${availableCount}</span>
          </button>

          <button onclick="window.phonesModule.setFilter('sold')" 
            class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              activePhoneFilter === 'sold' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
            }">
            <span>تم البيع (فواتير)</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-code-mono ${
              activePhoneFilter === 'sold' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }">${soldCount}</span>
          </button>

          <button onclick="window.phonesModule.setFilter('all')" 
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activePhoneFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
            }">
            <span>الكل (${allPhones.length})</span>
          </button>
        </div>

        <!-- Search input -->
        <div class="relative flex-1 max-w-md w-full">
          <span class="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[20px]">qr_code_scanner</span>
          <input type="text" value="${phoneSearchQuery}" oninput="window.phonesModule.handleSearch(this.value)"
            placeholder="امسح أو ابحث بـ IMEI (15 رقماً)، الموديل، الماركة..." 
            class="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs font-code-mono focus:outline-none focus:border-blue-500">
        </div>

        <!-- Add Phone Trigger -->
        <button onclick="window.phonesModule.openAddModal()" 
          class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap">
          <span class="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ إضافة هاتف جديد للمخزن</span>
        </button>
      </section>

      <!-- Phones Data Table -->
      <section class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">smartphone</span>
            <h3 class="font-bold text-slate-900 text-base">سجل وجرد الهواتف الذكية</h3>
          </div>
          <span class="text-xs text-slate-500 font-code-mono">${filtered.length} جهاز</span>
        </div>

        <div class="overflow-x-auto">
          ${filtered.length === 0 ? `
            <div class="p-16 flex flex-col items-center justify-center text-center text-slate-400">
              <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">devices</span>
              <p class="font-bold text-base text-slate-700">لا توجد هواتف مسجلة حالياً (المخزن فارغ)</p>
              <p class="text-xs text-slate-400 mt-1">أدخل أول هاتف للمخزن مع تسجيل رقم الـ IMEI وسعر الشراء والبيع</p>
              <button onclick="window.phonesModule.openAddModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة هاتف جديد الآن</span>
              </button>
            </div>
          ` : `
            <table class="w-full text-right border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                  <th class="py-3 px-4">رقم IMEI والسيريال</th>
                  <th class="py-3 px-4">الجهاز والموديل</th>
                  <th class="py-3 px-4">المواصفات واللون</th>
                  <th class="py-3 px-4">سعر التكلفة</th>
                  <th class="py-3 px-4">سعر البيع</th>
                  <th class="py-3 px-4">الحالة والعميل</th>
                  <th class="py-3 px-4 text-center">الإجراءات والمبايعة</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${filtered.map(p => {
                  const isAvailable = p.status === 'available';
                  return `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-3 px-4 font-code-mono text-slate-700 font-bold">
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-slate-400 text-[16px]">fingerprint</span>
                          <span class="bg-slate-100 px-2 py-0.5 rounded text-[11px]">${p.imei}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-slate-900 text-sm">${p.brand} ${p.model}</div>
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        <span>${p.storage || '—'}</span>
                        ${p.color ? ` | <span class="text-slate-400">${p.color}</span>` : ''}
                      </td>
                      <td class="py-3 px-4 font-code-mono text-slate-600">
                        ${Number(p.costPrice).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 font-code-mono font-bold text-slate-900 text-sm">
                        ${Number(p.sellPrice).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4">
                        ${isAvailable ? `
                          <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[11px] flex items-center gap-1 w-fit">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            جاهز بالمخزن
                          </span>
                        ` : `
                          <div class="flex flex-col">
                            <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px] w-fit">
                              تم البيع: ${p.customerName || 'عميل نقدي'}
                            </span>
                            <span class="text-[10px] text-slate-400 font-code-mono">${p.customerPhone || ''}</span>
                          </div>
                        `}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          ${isAvailable ? `
                            <button onclick="window.phonesModule.openSellModal('${p.id}')" 
                              class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all">
                              <span class="material-symbols-outlined text-[15px]">point_of_sale</span>
                              <span>مبايعة</span>
                            </button>
                            <button onclick="window.phonesModule.openEditModal('${p.id}')" 
                              class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="تعديل">
                              <span class="material-symbols-outlined text-[17px]">edit</span>
                            </button>
                          ` : `
                            <button onclick="window.phonesModule.printWarranty('${p.id}')" 
                              class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all" title="طباعة شهادة الضمان والمبايعة">
                              <span class="material-symbols-outlined text-[15px]">print</span>
                              <span>ضمان</span>
                            </button>
                          `}
                          <button onclick="window.phonesModule.confirmDelete('${p.id}')" 
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

window.phonesModule = {
  setFilter: (f) => {
    activePhoneFilter = f;
    renderPhonesPage();
  },
  handleSearch: (val) => {
    phoneSearchQuery = val;
    renderPhonesPage();
  },
  openAddModal: (prefilledImei = '') => {
    const modal = document.getElementById('modal-phone-item');
    if (modal) {
      document.getElementById('phone-modal-title').innerText = "إضافة هاتف جديد للمخزن";
      document.getElementById('phone-edit-id').value = '';
      document.getElementById('phone-f-imei').value = prefilledImei || '';
      document.getElementById('phone-f-brand').value = '';
      document.getElementById('phone-f-model').value = '';
      document.getElementById('phone-f-color').value = '';
      document.getElementById('phone-f-storage').value = '128GB';
      document.getElementById('phone-f-cost').value = '';
      document.getElementById('phone-f-price').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  openEditModal: (id) => {
    const p = store.state.phones.find(item => item.id === id);
    if (!p) return;
    const modal = document.getElementById('modal-phone-item');
    if (modal) {
      document.getElementById('phone-modal-title').innerText = "تعديل بيانات الهاتف";
      document.getElementById('phone-edit-id').value = p.id;
      document.getElementById('phone-f-imei').value = p.imei;
      document.getElementById('phone-f-brand').value = p.brand;
      document.getElementById('phone-f-model').value = p.model;
      document.getElementById('phone-f-color').value = p.color || '';
      document.getElementById('phone-f-storage').value = p.storage || '';
      document.getElementById('phone-f-cost').value = p.costPrice;
      document.getElementById('phone-f-price').value = p.sellPrice;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  savePhone: (e) => {
    e.preventDefault();
    const id = document.getElementById('phone-edit-id').value;
    const phoneData = {
      imei: document.getElementById('phone-f-imei').value.trim(),
      brand: document.getElementById('phone-f-brand').value.trim(),
      model: document.getElementById('phone-f-model').value.trim(),
      color: document.getElementById('phone-f-color').value.trim(),
      storage: document.getElementById('phone-f-storage').value.trim(),
      costPrice: Number(document.getElementById('phone-f-cost').value) || 0,
      sellPrice: Number(document.getElementById('phone-f-price').value) || 0
    };

    if (id) {
      store.updatePhone(id, phoneData);
      window.showToast?.("تم تحديث بيانات الهاتف بنجاح", "check_circle");
    } else {
      store.addPhone(phoneData);
      window.showToast?.("تمت إضافة الهاتف للمخزن", "add_circle");
    }

    const modal = document.getElementById('modal-phone-item');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    renderPhonesPage();
  },
  openSellModal: (id) => {
    const p = store.state.phones.find(item => item.id === id);
    if (!p) return;
    const modal = document.getElementById('modal-sell-phone');
    if (modal) {
      document.getElementById('sell-phone-id').value = p.id;
      document.getElementById('sell-phone-title').innerText = `تسجيل مبايعة: ${p.brand} ${p.model} (IMEI: ${p.imei})`;
      document.getElementById('sell-phone-price-preview').innerText = `${Number(p.sellPrice).toFixed(2)} ج.م`;
      document.getElementById('sell-customer-name').value = '';
      document.getElementById('sell-customer-phone').value = '';
      document.getElementById('sell-customer-nid').value = '';
      document.getElementById('sell-warranty-days').value = '30';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  submitPhoneSale: (e) => {
    e.preventDefault();
    const id = document.getElementById('sell-phone-id').value;
    const customerData = {
      name: document.getElementById('sell-customer-name').value.trim(),
      phone: document.getElementById('sell-customer-phone').value.trim(),
      nationalId: document.getElementById('sell-customer-nid').value.trim(),
      warrantyDays: Number(document.getElementById('sell-warranty-days').value) || 30,
      paymentMethod: document.getElementById('sell-payment-method').value || 'cash'
    };

    const res = store.sellPhone(id, customerData);
    if (res) {
      playSound('success');
      window.showToast?.("تم تسجيل مبايعة الهاتف بنجاح وإصدار الفاتورة", "check_circle");
      const modal = document.getElementById('modal-sell-phone');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      renderPhonesPage();

      // Ask to print warranty slip
      setTimeout(() => {
        if (confirm("هل تريد طباعة إيصال المبايعة وشهادة الضمان الحرارية للعميل الآن؟")) {
          window.phonesModule.printWarranty(id);
        }
      }, 200);
    }
  },
  printWarranty: (id) => {
    const p = store.state.phones.find(item => item.id === id);
    if (!p) return;

    const printArea = document.getElementById('thermal-receipt-print-area');
    if (!printArea) return;

    const dateStr = p.soldDate ? new Date(p.soldDate).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG');

    printArea.innerHTML = `
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        <h2 style="margin: 0; font-size: 16px; font-weight: 900;">سنترال بلس</h2>
        <p style="margin: 2px 0; font-size: 11px; font-weight: bold;">عقد مبايعة هاتف ذكي وشهادة ضمان معتمد</p>
      </div>

      <div style="font-size: 11px; margin-bottom: 8px;">
        <div><b>رقم الفاتورة:</b> ${p.invoiceNumber || '—'}</div>
        <div><b>التاريخ:</b> ${dateStr}</div>
        <div><b>الجهاز:</b> ${p.brand} ${p.model} (${p.storage || ''})</div>
        <div><b>اللون:</b> ${p.color || '—'}</div>
        <div style="font-size: 12px; margin: 4px 0;"><b>IMEI:</b> <span style="font-family: monospace; font-weight: bold;">${p.imei}</span></div>
        <div style="border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
          <div><b>اسم المشتري:</b> ${p.customerName || 'عميل نقدي'}</div>
          <div><b>رقم الهاتف:</b> ${p.customerPhone || '—'}</div>
          ${p.customerNationalId ? `<div><b>الرقم القومي:</b> ${p.customerNationalId}</div>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 6px; border-top: 1px solid #000; padding-top: 4px;">
          <span>سعر البيع:</span>
          <span>${Number(p.sellPrice).toFixed(2)} ج.م</span>
        </div>
      </div>

      <div style="border-top: 1px dashed #000; padding-top: 6px; font-size: 10px; text-align: right;">
        <p style="margin: 2px 0;"><b>شروط الضمان (${p.warrantyDays || 30} يوماً):</b></p>
        <p style="margin: 2px 0;">1. الضمان يسري ضد عيوب الصناعة الفنية فقط.</p>
        <p style="margin: 2px 0;">2. يسقط الضمان في حالة الكسر أو السوائل أو فتح الجهاز خارج المحل.</p>
        <p style="margin: 2px 0;">3. لا يُعتد بالضمان بدون هذا الإيصال ومطابقة رقم السيريال IMEI.</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 10px; border-top: 1px solid #000; padding-top: 8px;">
        <div style="text-align: center;">
          <span>توقيع الكاشير / المحل</span><br><br>
          <span>......................</span>
        </div>
        <div style="text-align: center;">
          <span>توقيع المشتري بالاستلام</span><br><br>
          <span>......................</span>
        </div>
      </div>
    `;

    setTimeout(() => window.print(), 150);
  },
  confirmDelete: (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الهاتف وسجله نهائياً؟")) {
      store.deletePhone(id);
      window.showToast?.("تم حذف الهاتف من المخزن", "delete");
      renderPhonesPage();
    }
  }
};
