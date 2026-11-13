// Dashboard & Overview Page Controller
import { store } from '../store.js';
import { openPOS, printThermalReceipt } from '../pos.js';

export function renderDashboard() {
  const container = document.getElementById('page-dashboard');
  if (!container) return;

  const cashDrawerTotal = store.getCashDrawerTotal();
  const vodaTotal = store.getVodafoneTotalBalance();
  const lowStockItems = store.getLowStockItems();

  const today = new Date().toDateString();
  const todaySales = store.state.sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

  // Combine recent activity (sales + vodafone transactions)
  const recentActivities = [
    ...store.state.sales.map(s => ({
      id: s.id,
      kind: 'sale',
      title: `فاتورة بيع #${s.invoiceNumber}`,
      subtitle: `${s.items.length} أصناف (${s.customerName || 'نقدي'})`,
      amount: s.total,
      typeClass: 'text-emerald-600 bg-emerald-50',
      typeLabel: 'مبيعات',
      timestamp: s.timestamp,
      raw: s
    })),
    ...store.state.vodafoneTransactions.map(tx => ({
      id: tx.id,
      kind: 'vodafone',
      title: tx.type === 'send' ? `تحويل كاش (خط ${tx.lineId})` : `استلام كاش (خط ${tx.lineId})`,
      subtitle: `عمولة: ${tx.commission} ج.م | هاتف: ${tx.customerPhone || 'بدون'}`,
      amount: tx.amount,
      typeClass: tx.type === 'send' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50',
      typeLabel: tx.type === 'send' ? 'تحويل رصيد' : 'استلام رصيد',
      timestamp: tx.timestamp,
      raw: tx
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- 4 Top KPI Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Metric 1: Cash Drawer -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                نقدية درج الكاشير الفعلي
              </span>
              <div class="flex items-baseline gap-1 mt-2">
                <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${cashDrawerTotal.toFixed(2)}</span>
                <span class="text-sm font-bold text-slate-500">ج.م</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span class="material-symbols-outlined text-[26px]">point_of_sale</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>رصيد الافتتاح: ${Number(store.state.cashDrawer.openingBalance).toFixed(2)} ج.م</span>
            <button onclick="window.dashboardModule.openCashModal()" class="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors">
              <span class="material-symbols-outlined text-[15px]">tune</span>
              ضبط الرصيد
            </button>
          </div>
        </div>

        <!-- Metric 2: Vodafone Total Balance -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                إجمالي رصيد محافظ الكاش
              </span>
              <div class="flex items-baseline gap-1 mt-2">
                <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${vodaTotal.toFixed(2)}</span>
                <span class="text-sm font-bold text-slate-500">ج.م</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span class="material-symbols-outlined text-[26px]">account_balance_wallet</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span class="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full font-code-mono">18 خط نشط</span>
            <button onclick="window.navigateTo('vodafone')" class="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors">
              <span>إدارة المحافظ</span>
              <span class="material-symbols-outlined text-[14px]">arrow_back</span>
            </button>
          </div>
        </div>

        <!-- Metric 3: Today's Sales -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                مبيعات اليوم الإجمالية
              </span>
              <div class="flex items-baseline gap-1 mt-2">
                <span class="text-3xl font-extrabold text-indigo-600 font-code-mono">${todaySalesTotal.toFixed(2)}</span>
                <span class="text-sm font-bold text-slate-500">ج.م</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span class="material-symbols-outlined text-[26px]">shopping_cart_checkout</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>${todaySales.length} عمليات بيع مكتملة</span>
            <span class="font-code-mono text-slate-400">الوردية #402</span>
          </div>
        </div>

        <!-- Metric 4: Low Stock Warnings -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${lowStockItems.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}"></span>
                نواقص ومخزون حرج
              </span>
              <div class="flex items-baseline gap-1 mt-2">
                <span class="text-3xl font-extrabold ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'} font-code-mono">${lowStockItems.length}</span>
                <span class="text-sm font-bold text-slate-500">أصناف</span>
              </div>
            </div>
            <div class="w-12 h-12 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'} flex items-center justify-center">
              <span class="material-symbols-outlined text-[26px]">${lowStockItems.length > 0 ? 'warning' : 'verified'}</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>${lowStockItems.length > 0 ? 'تتطلب توريد فوري' : 'جميع الأصناف كافية'}</span>
            <span class="font-bold text-slate-700">المخزون السليم</span>
          </div>
        </div>
      </section>

      <!-- Quick Action Bar & Rapid Barcode Dispatch -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 w-full lg:w-auto">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[28px]">barcode_scanner</span>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">المسح المباشر والإجراءات السريعة</h3>
            <p class="text-xs text-slate-500">امسح باركود أي منتج أو هاتف أو ابدأ عملية بيع فورية</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <button onclick="window.posModule.openPOS()" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all">
            <span class="material-symbols-outlined text-[20px]">bolt</span>
            <span>نقطة بيع سريعة (POS)</span>
            <kbd class="bg-blue-800 text-[11px] font-code-mono px-1.5 py-0.5 rounded">F2</kbd>
          </button>

          <button onclick="window.openNewProductModal()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all">
            <span class="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ صنف جديد</span>
            <kbd class="bg-white text-slate-600 border border-slate-200 text-[11px] font-code-mono px-1.5 py-0.5 rounded">F1</kbd>
          </button>

          <button onclick="window.navigateTo('vodafone')" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all">
            <span class="material-symbols-outlined text-[20px]">send_to_mobile</span>
            <span>تحويل محفظة كاش</span>
          </button>
        </div>
      </section>

      <!-- Main Content Grid: Recent Transactions Log & Low Stock Table -->
      <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Recent Transactions Log (2 Cols) -->
        <div class="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-600">history</span>
              <h3 class="font-bold text-slate-900 text-base">سجل العمليات والمبيعات الأحدث</h3>
            </div>
            <span class="text-xs text-slate-500 font-code-mono">آخر ${recentActivities.length} حركة</span>
          </div>

          <div class="overflow-x-auto flex-1">
            ${recentActivities.length === 0 ? `
              <div class="p-12 flex flex-col items-center justify-center text-center text-slate-400">
                <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">receipt_long</span>
                <p class="font-bold text-base text-slate-700">لا توجد حركات بيع أو تحويل مسجلة حتى الآن</p>
                <p class="text-xs text-slate-400 mt-1">ابدأ بأول عملية بيع عبر قارئ الباركود أو تحويل فودافون كاش</p>
              </div>
            ` : `
              <table class="w-full text-right border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                    <th class="py-3 px-4">نوع العملية</th>
                    <th class="py-3 px-4">البيان والتفاصيل</th>
                    <th class="py-3 px-4">المبلغ</th>
                    <th class="py-3 px-4">التوقيت</th>
                    <th class="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${recentActivities.map(act => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-full font-bold text-[11px] ${act.typeClass}">
                          ${act.typeLabel}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <div class="font-bold text-slate-800">${act.title}</div>
                        <div class="text-[11px] text-slate-500">${act.subtitle}</div>
                      </td>
                      <td class="py-3 px-4 font-bold text-slate-900 font-code-mono text-sm">
                        ${Number(act.amount).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 text-slate-500 font-code-mono text-[11px]">
                        ${new Date(act.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          ${act.kind === 'sale' ? `
                            <button onclick='window.posModule.printThermalReceipt(${JSON.stringify(act.raw)})' class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="طباعة إيصال">
                              <span class="material-symbols-outlined text-[17px]">print</span>
                            </button>
                            <button onclick="window.dashboardModule.deleteSale('${act.id}')" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors" title="حذف الفاتورة واسترجاع المخزون">
                              <span class="material-symbols-outlined text-[17px]">delete</span>
                            </button>
                          ` : `
                            <button onclick="window.dashboardModule.deleteVodafoneTx('${act.id}')" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors" title="حذف معاملة الكاش وتعديل الرصيد">
                              <span class="material-symbols-outlined text-[17px]">delete</span>
                            </button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Low Stock Alerts / Critical Inventory (1 Col) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-rose-600">inventory_2</span>
              <h3 class="font-bold text-slate-900 text-base">تنبيهات النواقص بالمخزن</h3>
            </div>
            <span class="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full font-code-mono">${lowStockItems.length}</span>
          </div>

          <div class="p-4 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[420px]">
            ${lowStockItems.length === 0 ? `
              <div class="flex flex-col items-center justify-center py-12 text-center text-slate-400 flex-1">
                <span class="material-symbols-outlined text-[48px] text-emerald-400 mb-2">check_circle</span>
                <p class="font-bold text-slate-700 text-sm">جميع مستويات المخزون آمنة ومكتملة</p>
                <span class="text-xs text-slate-400 mt-1">لا توجد أصناف تحت حد الطلب الأدنى</span>
              </div>
            ` : lowStockItems.map(item => `
              <div class="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <div class="font-bold text-slate-800 text-xs">${item.name}</div>
                  <div class="text-[11px] text-slate-500">${item.section} | باركود: ${item.barcode}</div>
                </div>
                <div class="text-left">
                  <div class="text-xs font-bold text-rose-600 font-code-mono">${item.quantity} متبقي</div>
                  <div class="text-[10px] text-slate-400">الحد: ${item.minStock}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

// Module actions for window
window.dashboardModule = {
  openCashModal: () => {
    const modal = document.getElementById('modal-opening-cash');
    if (modal) {
      const input = document.getElementById('cash-opening-input');
      if (input) input.value = store.state.cashDrawer.openingBalance || 0;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  deleteSale: (saleId) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟ سيتم إعادة الكميات المباعة إلى رصيد المخزن تلقائياً.")) {
      store.deleteSale(saleId);
      window.showToast?.("تم حذف الفاتورة واستعادة كميات المخزن بنجاح", "check_circle");
      renderDashboard();
    }
  },
  deleteVodafoneTx: (txId) => {
    if (confirm("هل أنت متأكد من حذف هذه المعاملة؟ سيتم التراجع عن أثرها في رصيد المحفظة.")) {
      store.deleteVodafoneTransaction(txId);
      window.showToast?.("تم حذف المعاملة وتعديل رصيد المحفظة", "check_circle");
      renderDashboard();
    }
  }
};
