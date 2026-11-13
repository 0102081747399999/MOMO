// Vodafone Cash Management Page Controller (18 Dedicated Lines)
import { store } from '../store.js';
import { playSound } from '../scanner.js';

let selectedLineId = 1;

export function setSelectedLine(lineId) {
  selectedLineId = Number(lineId);
  renderVodafonePage();
}

export function renderVodafonePage() {
  const container = document.getElementById('page-vodafone');
  if (!container) return;

  const lines = store.state.vodafoneLines;
  const currentLine = lines.find(l => l.lineId === selectedLineId) || lines[0];

  const totalBalance = store.getVodafoneTotalBalance();
  const remainingCap = store.getVodafoneTotalRemainingCap();
  const todayCommissions = store.getVodafoneTodayCommissions();

  // Transactions for the currently selected line
  const lineTransactions = store.state.vodafoneTransactions.filter(tx => tx.lineId === selectedLineId);

  // Line monthly limit calculation
  const lineLimit = Number(currentLine.monthlyLimit) || 100000;
  const lineUsed = Number(currentLine.usedLimit) || 0;
  const lineRemaining = Math.max(0, lineLimit - lineUsed);
  const usedPercent = Math.min(100, Math.round((lineUsed / lineLimit) * 100));

  container.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- Top 4 KPI Cards -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Metric 1: Total Wallets Balance -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">إجمالي أرصدة الـ 18 محفظة</span>
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span class="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${totalBalance.toFixed(2)}</span>
              <span class="text-sm font-bold text-slate-500">ج.م</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>18 خط متاح ومفعّل</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: Remaining Combined Cap -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">المتبقي من السقف الشهري المجمّع</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span class="material-symbols-outlined text-[22px]">donut_large</span>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-extrabold text-slate-900 font-code-mono">${remainingCap.toLocaleString('en-US')}</span>
              <span class="text-sm font-bold text-slate-500">ج.م</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${Math.min(100, Math.round(((1800000 - remainingCap) / 1800000) * 100))}%"></div>
            </div>
          </div>
        </div>

        <!-- Metric 3: Today's Commissions -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500">عمولات اليوم الفورية</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span class="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-extrabold text-emerald-600 font-code-mono">${todayCommissions.toFixed(2)}</span>
              <span class="text-sm font-bold text-slate-500">ج.م</span>
            </div>
            <div class="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>أرباح العمليات</span>
              <span class="font-code-mono font-bold text-emerald-600">+ربح فوري</span>
            </div>
          </div>
        </div>

        <!-- Metric 4: Quick Action -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center gap-2">
          <button onclick="window.vodafoneModule.openEditModal(${currentLine.lineId})" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all">
            <span class="material-symbols-outlined text-[18px]">tune</span>
            <span>تعديل إعدادات الخط ${currentLine.lineId}</span>
          </button>
          <button onclick="window.vodafoneModule.confirmResetLine(${currentLine.lineId})" class="w-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
            <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>تصفير رصيد وسجل هذا الخط</span>
          </button>
        </div>
      </section>

      <!-- 18 Interactive Numbered Badges Matrix -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">sim_card</span>
            <h3 class="font-bold text-slate-900 text-sm">مصفوفة الخطوط الـ 18 المخصصة للسنترال (انقر لتحديد الخط)</h3>
            <span class="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full font-code-mono">18 خط</span>
          </div>
          <span class="text-xs text-slate-500">الخط النشط حالياً: <b class="text-blue-600">خط ${currentLine.lineId}</b></span>
        </div>

        <div class="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-18 gap-2 pt-1" id="wallets-grid">
          ${lines.map(line => {
            const isActive = line.lineId === selectedLineId;
            return `
              <button onclick="window.vodafoneModule.selectLine(${line.lineId})" 
                class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 text-center cursor-pointer border ${
                  isActive 
                    ? 'bg-[#0A192F] text-white border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-105' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }">
                <span class="text-[10px] ${isActive ? 'text-blue-300' : 'text-slate-400'} font-bold">خط</span>
                <span class="text-base font-extrabold font-code-mono my-0.5">${String(line.lineId).padStart(2, '0')}</span>
                <span class="text-[9px] font-code-mono truncate max-w-full ${isActive ? 'text-slate-300' : 'text-slate-500'}">
                  ${Number(line.balance).toFixed(0)}
                </span>
                <div class="w-1.5 h-1.5 rounded-full ${Number(line.balance) > 0 ? 'bg-emerald-400' : 'bg-slate-300'} mt-1"></div>
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Selected Line Dedicated Workstation (2-Column Layout) -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Column 1: Line Identity & Immediate Operation Form (5 Cols) -->
        <div class="lg:col-span-5 flex flex-col gap-5">
          <!-- Line Card -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">خط ${currentLine.lineId}</span>
                <span class="font-bold text-slate-800 text-sm">${currentLine.name}</span>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="window.vodafoneModule.openEditModal(${currentLine.lineId})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors" title="تعديل الرقم والسقف">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onclick="window.vodafoneModule.confirmResetLine(${currentLine.lineId})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors" title="تصفير السجل">
                  <span class="material-symbols-outlined text-[18px]">restart_alt</span>
                </button>
              </div>
            </div>

            <!-- Phone Number & Live Balance -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500">رقم الهاتف المربوط:</span>
                <button onclick="window.vodafoneModule.openEditModal(${currentLine.lineId})" class="font-code-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <span>${currentLine.phoneNumber || 'انقر لتعيين رقم الهاتف'}</span>
                  <span class="material-symbols-outlined text-[13px]">edit_note</span>
                </button>
              </div>

              <div class="flex items-baseline justify-between pt-1">
                <span class="text-xs font-bold text-slate-700">الرصيد الفعلي للمحفظة:</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-blue-600 font-code-mono">${Number(currentLine.balance).toFixed(2)}</span>
                  <span class="text-xs font-bold text-slate-400">ج.م</span>
                </div>
              </div>
            </div>

            <!-- Monthly Cap Progress -->
            <div class="flex flex-col gap-1.5 text-xs">
              <div class="flex justify-between items-center text-slate-500">
                <span>الحد الشهري المستهلك:</span>
                <span class="font-code-mono font-bold text-slate-800">${lineUsed.toLocaleString('en-US')} / ${lineLimit.toLocaleString('en-US')} ج.م</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${usedPercent}%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-400">
                <span>الاستهلاك: ${usedPercent}%</span>
                <span class="text-emerald-600 font-bold">المتبقي: ${lineRemaining.toLocaleString('en-US')} ج.م</span>
              </div>
            </div>
          </div>

          <!-- Transaction Dispatch Form -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div>
              <h4 class="font-bold text-slate-900 text-sm">تسجيل عملية فورية على الخط ${currentLine.lineId}</h4>
              <p class="text-[11px] text-slate-500">تحديث فوري لرصيد المحفظة مع درج الكاشير</p>
            </div>

            <form onsubmit="window.vodafoneModule.submitTransaction(event)" class="flex flex-col gap-3">
              <!-- Type toggle -->
              <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" id="btn-type-send" onclick="window.vodafoneModule.setTxType('send')" 
                  class="py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm">
                  تحويل رصيد للعميل (إرسال)
                </button>
                <button type="button" id="btn-type-receive" onclick="window.vodafoneModule.setTxType('receive')" 
                  class="py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900">
                  سحب نقدي للعميل (استلام)
                </button>
              </div>

              <!-- Amount -->
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">المبلغ المطلوب (ج.م) *</label>
                <input type="number" id="voda-amount" step="any" min="1" required placeholder="0.00" 
                  oninput="window.vodafoneModule.calcCommissionPreview(this.value)"
                  class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-lg font-bold font-code-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-left">
              </div>

              <!-- Commission -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1">العمولة المحصلة (ج.م)</label>
                  <input type="number" id="voda-commission" step="any" min="0" placeholder="0.00" 
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold font-code-mono text-emerald-600 focus:outline-none focus:border-blue-500 text-left">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1">رقم هاتف العميل</label>
                  <input type="tel" id="voda-customer-phone" placeholder="010XXXXXXXX" 
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-code-mono text-slate-900 focus:outline-none focus:border-blue-500 text-left">
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">ملاحظات إضافية (اختياري)</label>
                <input type="text" id="voda-notes" placeholder="مثال: تحويل لمحل الباشا / دفعة مورد..." 
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500">
              </div>

              <button type="submit" class="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all">
                <span class="material-symbols-outlined text-[20px]">check_circle</span>
                <span>تأكيد العملية وتحديث الرصيد فوراً</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Column 2: Dedicated Transaction Log for Selected Line (7 Cols) -->
        <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-600">receipt_long</span>
              <h3 class="font-bold text-slate-900 text-base">سجل معاملات الخط ${currentLine.lineId} (${currentLine.phoneNumber || 'بدون رقم'})</h3>
            </div>
            <span class="text-xs text-slate-500 font-code-mono">${lineTransactions.length} معاملة مسجلة</span>
          </div>

          <div class="overflow-x-auto flex-1">
            ${lineTransactions.length === 0 ? `
              <div class="p-16 flex flex-col items-center justify-center text-center text-slate-400">
                <span class="material-symbols-outlined text-[54px] text-slate-300 mb-2">account_balance_wallet</span>
                <p class="font-bold text-base text-slate-700">لا توجد حركات مسجلة لهذا الخط حتى الآن</p>
                <p class="text-xs text-slate-400 mt-1">سجل أول عملية تحويل أو استلام من النموذج المقابل</p>
              </div>
            ` : `
              <table class="w-full text-right border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold">
                    <th class="py-3 px-4">نوع المعاملة</th>
                    <th class="py-3 px-4">المبلغ</th>
                    <th class="py-3 px-4">العمولة</th>
                    <th class="py-3 px-4">رقم العميل</th>
                    <th class="py-3 px-4">الرصيد بعد</th>
                    <th class="py-3 px-4">التوقيت</th>
                    <th class="py-3 px-4 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${lineTransactions.map(tx => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          tx.type === 'send' ? 'text-blue-700 bg-blue-50' : 'text-emerald-700 bg-emerald-50'
                        }">
                          ${tx.type === 'send' ? 'تحويل رصيد (إرسال)' : 'سحب كاش (استلام)'}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-bold text-slate-900 font-code-mono text-sm">
                        ${Number(tx.amount).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 font-bold text-emerald-600 font-code-mono">
                        +${Number(tx.commission).toFixed(2)} ج.م
                      </td>
                      <td class="py-3 px-4 font-code-mono text-slate-600">
                        ${tx.customerPhone || '—'}
                      </td>
                      <td class="py-3 px-4 font-code-mono text-slate-500">
                        ${Number(tx.balanceAfter).toFixed(2)}
                      </td>
                      <td class="py-3 px-4 text-slate-400 font-code-mono text-[11px]">
                        ${new Date(tx.timestamp).toLocaleString('ar-EG', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button onclick="window.vodafoneModule.deleteTx('${tx.id}')" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors" title="حذف المعاملة">
                          <span class="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
      </section>
    </div>
  `;
}

let activeFormType = 'send';

window.vodafoneModule = {
  selectLine: (id) => setSelectedLine(id),
  setTxType: (type) => {
    activeFormType = type;
    const btnSend = document.getElementById('btn-type-send');
    const btnReceive = document.getElementById('btn-type-receive');
    if (btnSend && btnReceive) {
      if (type === 'send') {
        btnSend.className = "py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm";
        btnReceive.className = "py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900";
      } else {
        btnReceive.className = "py-2 text-xs font-bold rounded-lg transition-all bg-white text-emerald-600 shadow-sm";
        btnSend.className = "py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900";
      }
    }
  },
  calcCommissionPreview: (val) => {
    const amt = Number(val) || 0;
    const commInput = document.getElementById('voda-commission');
    if (commInput && (!commInput.value || commInput.dataset.auto === 'true')) {
      // Standard Central Telecom commission: minimum 5 EGP or 1%
      const comm = Math.max(5, Math.round(amt * 0.01));
      commInput.value = amt > 0 ? comm : '';
      commInput.dataset.auto = 'true';
    }
  },
  submitTransaction: (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('voda-amount')?.value) || 0;
    const commission = Number(document.getElementById('voda-commission')?.value) || 0;
    const customerPhone = document.getElementById('voda-customer-phone')?.value || '';
    const notes = document.getElementById('voda-notes')?.value || '';

    try {
      store.executeVodafoneTransaction({
        lineId: selectedLineId,
        type: activeFormType,
        amount,
        commission,
        customerPhone,
        notes
      });

      playSound('success');
      window.showToast?.(`تم تنفيذ المعاملة على خط ${selectedLineId} وتحديث النقدية بنجاح`, 'check_circle');

      // Clear input
      const amtEl = document.getElementById('voda-amount');
      if (amtEl) amtEl.value = '';
      const commEl = document.getElementById('voda-commission');
      if (commEl) commEl.value = '';

      renderVodafonePage();
    } catch (err) {
      playSound('error');
      alert(err.message);
    }
  },
  deleteTx: (txId) => {
    if (confirm("هل تريد بالتأكيد حذف هذه الحركة والتراجع عن أثرها في رصيد المحفظة؟")) {
      store.deleteVodafoneTransaction(txId);
      window.showToast?.("تم حذف المعاملة وتعديل الرصيد", "check_circle");
      renderVodafonePage();
    }
  },
  confirmResetLine: (lineId) => {
    if (confirm(`تحذير: هل أنت متأكد من تصفير رصيد وسجل الخط ${lineId} بالكامل؟ سيتم مسح جميع حركات هذا الخط.`)) {
      store.resetVodafoneLine(lineId);
      window.showToast?.(`تم تصفير الخط ${lineId} بنجاح`, "restart_alt");
      renderVodafonePage();
    }
  },
  openEditModal: (lineId) => {
    const line = store.state.vodafoneLines.find(l => l.lineId === Number(lineId));
    if (!line) return;
    const modal = document.getElementById('modal-edit-voda-line');
    if (modal) {
      document.getElementById('edit-voda-line-id').value = line.lineId;
      document.getElementById('edit-voda-line-title').innerText = `تعديل بيانات الخط ${line.lineId}`;
      document.getElementById('edit-voda-line-name').value = line.name;
      document.getElementById('edit-voda-line-phone').value = line.phoneNumber || '';
      document.getElementById('edit-voda-line-limit').value = line.monthlyLimit || 100000;
      document.getElementById('edit-voda-line-balance').value = line.balance || 0;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
};
