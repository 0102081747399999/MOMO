// Point of Sale (POS) Module, Cart State & Thermal Receipt Generation
import { store } from './store.js';
import { playSound } from './scanner.js';

let cart = []; // Array of { id, name, price, costPrice, quantity, table, barcode, isPhone }
let activeDiscount = 0;
let activePaymentMethod = 'cash';
let activeVodafoneLine = 1;

export function initPOS() {
  // Listen for global barcode scan events when POS modal is active or globally
  window.addEventListener('barcode-scanned', (e) => {
    const code = e.detail.barcode;
    const posModal = document.getElementById('pos-modal');
    // If POS modal is open, directly add to POS cart
    if (posModal && !posModal.classList.contains('hidden')) {
      handlePOSScan(code);
    }
  });

  renderCart();
}

export function openPOS() {
  const modal = document.getElementById('pos-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const input = document.getElementById('pos-barcode-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }
}

export function closePOS() {
  const modal = document.getElementById('pos-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function addToCart(item) {
  if (item.isPhone) {
    // Phone is unique by IMEI
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      alert("هذا الهاتف مضاف بالفعل في سلة المبيعات!");
      return;
    }
    cart.push({
      id: item.id,
      name: `${item.brand} ${item.model} (${item.storage}) - IMEI: ${item.imei}`,
      price: Number(item.sellPrice) || 0,
      costPrice: Number(item.costPrice) || 0,
      quantity: 1,
      table: 'phones',
      barcode: item.imei,
      isPhone: true
    });
  } else {
    // Standard accessory item
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.quantity >= (item.quantity || 999)) {
        alert("الكمية المطلوبة تتجاوز المخزون المتاح!");
        return;
      }
      existing.quantity += 1;
    } else {
      if (item.quantity <= 0) {
        alert("تنبيه: هذا الصنف نفد من المخزون (0 رصيد)!");
      }
      cart.push({
        id: item.id,
        name: item.name,
        price: Number(item.sellPrice) || 0,
        costPrice: Number(item.buyPrice) || 0,
        quantity: 1,
        table: item.table,
        barcode: item.barcode,
        isPhone: false
      });
    }
  }

  playSound('scan');
  renderCart();
}

export function handlePOSScan(code) {
  const item = store.findByBarcode(code);
  if (item) {
    addToCart(item);
  } else {
    playSound('error');
    alert(`لم يتم العثور على صنف بالباركود: ${code} في أي من الأقسام. يمكنك إضافته من زر "صنف جديد" (F1)`);
  }
}

export function updateCartQuantity(index, newQty) {
  if (newQty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQty;
  }
  renderCart();
}

export function removeCartItem(index) {
  cart.splice(index, 1);
  renderCart();
}

export function clearCart() {
  cart = [];
  activeDiscount = 0;
  renderCart();
}

export function setDiscount(val) {
  activeDiscount = Math.max(0, Number(val) || 0);
  renderCart();
}

export function setPaymentMethod(method) {
  activePaymentMethod = method;
  const lineSelectContainer = document.getElementById('pos-voda-select-container');
  if (lineSelectContainer) {
    if (method === 'vodafone') {
      lineSelectContainer.classList.remove('hidden');
    } else {
      lineSelectContainer.classList.add('hidden');
    }
  }
}

export function renderCart() {
  const container = document.getElementById('pos-cart-items');
  const countBadge = document.getElementById('pos-cart-count');
  const subtotalEl = document.getElementById('pos-subtotal');
  const discountEl = document.getElementById('pos-discount-display');
  const totalEl = document.getElementById('pos-total');
  const checkoutBtn = document.getElementById('pos-checkout-btn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span class="material-symbols-outlined text-[48px] text-slate-300 mb-2">shopping_basket</span>
        <p class="font-headline-sm text-base">سلة البيع فارغة حالياً</p>
        <span class="text-xs text-slate-400 mt-1">امسح باركود المنتج أو ابحث لإضافته للفاتورة</span>
      </div>
    `;
    if (countBadge) countBadge.innerText = '0 صنف';
    if (subtotalEl) subtotalEl.innerText = '0.00';
    if (discountEl) discountEl.innerText = '0.00';
    if (totalEl) totalEl.innerText = '0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - activeDiscount);

  let html = '';
  cart.forEach((item, index) => {
    html += `
      <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all">
        <div class="flex flex-col flex-1 pl-2">
          <span class="font-bold text-slate-800 text-sm leading-tight">${item.name}</span>
          <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span class="font-code-mono">${item.price.toFixed(2)} ج.م</span>
            <span>×</span>
            <span class="font-bold text-blue-600">${item.quantity}</span>
            <span>=</span>
            <span class="font-bold text-slate-900 font-code-mono">${(item.price * item.quantity).toFixed(2)} ج.م</span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          ${item.isPhone ? '' : `
            <button onclick="window.posModule.updateCartQuantity(${index}, ${item.quantity - 1})" class="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-base">-</button>
            <span class="w-6 text-center font-bold font-code-mono text-sm">${item.quantity}</span>
            <button onclick="window.posModule.updateCartQuantity(${index}, ${item.quantity + 1})" class="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-base">+</button>
          `}
          <button onclick="window.posModule.removeCartItem(${index})" class="w-7 h-7 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center ml-1">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (countBadge) countBadge.innerText = `${cart.length} أصناف`;
  if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
  if (discountEl) discountEl.innerText = activeDiscount.toFixed(2);
  if (totalEl) totalEl.innerText = total.toFixed(2);
  if (checkoutBtn) checkoutBtn.disabled = false;
}

export function checkout() {
  if (cart.length === 0) return;

  const customerName = document.getElementById('pos-customer-name')?.value?.trim() || 'عميل نقدي';
  const customerPhone = document.getElementById('pos-customer-phone')?.value?.trim() || '';
  const vodafoneLineId = activePaymentMethod === 'vodafone' ? 
    Number(document.getElementById('pos-voda-line-select')?.value || 1) : null;

  try {
    const sale = store.executeSale({
      items: cart,
      discount: activeDiscount,
      paymentMethod: activePaymentMethod,
      vodafoneLineId,
      customerName,
      customerPhone
    });

    playSound('success');
    printThermalReceipt(sale);

    // Clear cart and close
    clearCart();
    closePOS();

    // Trigger toast notification
    window.showToast?.(`تم تسجيل الفاتورة بنجاح رقم #${sale.invoiceNumber}`, 'check_circle');

  } catch (err) {
    playSound('error');
    alert("خطأ أثناء إتمام العملية: " + err.message);
  }
}

export function printThermalReceipt(sale) {
  const printArea = document.getElementById('thermal-receipt-print-area');
  if (!printArea) return;

  const dateStr = new Date(sale.timestamp).toLocaleString('ar-EG', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  let itemsHtml = '';
  sale.items.forEach((item, idx) => {
    itemsHtml += `
      <tr>
        <td style="text-align: right; padding: 3px 0;">${idx + 1}. ${item.name}</td>
        <td style="text-align: center; padding: 3px 0;">${item.quantity}</td>
        <td style="text-align: left; padding: 3px 0;">${Number(item.price).toFixed(2)}</td>
        <td style="text-align: left; padding: 3px 0; font-weight: bold;">${Number(item.total).toFixed(2)}</td>
      </tr>
    `;
  });

  const paymentMethodLabel = sale.paymentMethod === 'vodafone' ? 
    `فودافون كاش (خط ${sale.vodafoneLineId})` : 'نقداً من الدرج';

  printArea.innerHTML = `
    <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
      <h2 style="margin: 0; font-size: 16px; font-weight: 800;">سنترال بلس</h2>
      <p style="margin: 2px 0; font-size: 11px;">مبيعات الموبايل والإكسسوار ومحافظ الكاش</p>
      <p style="margin: 2px 0; font-size: 10px;">الفرع الرئيسي - خدمة عملاء متكاملة</p>
    </div>

    <div style="font-size: 10px; margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between;">
        <span>رقم الفاتورة:</span>
        <span style="font-weight: bold;">${sale.invoiceNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>التاريخ والوقت:</span>
        <span>${dateStr}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>الكاشير:</span>
        <span>أحمد (وردية 402)</span>
      </div>
      ${sale.customerName ? `
        <div style="display: flex; justify-content: space-between;">
          <span>العميل:</span>
          <span>${sale.customerName}</span>
        </div>
      ` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 6px 0;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="text-align: right; padding: 4px 0;">الصنف</th>
          <th style="text-align: center; padding: 4px 0;">العدد</th>
          <th style="text-align: left; padding: 4px 0;">السعر</th>
          <th style="text-align: left; padding: 4px 0;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="font-size: 11px; margin-top: 6px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>المجموع:</span>
        <span>${sale.subtotal.toFixed(2)} ج.م</span>
      </div>
      ${sale.discount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #ba1a1a;">
          <span>الخصم:</span>
          <span>-${sale.discount.toFixed(2)} ج.م</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
        <span>الصافي المطلوب:</span>
        <span>${sale.total.toFixed(2)} ج.م</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 3px;">
        <span>طريقة الدفع:</span>
        <span>${paymentMethodLabel}</span>
      </div>
    </div>

    <div style="text-align: center; border-top: 1px dashed #000; padding-top: 8px; margin-top: 10px; font-size: 10px;">
      <p style="margin: 0; font-weight: bold;">شكراً لزيارتكم سنترال بلس!</p>
      <p style="margin: 2px 0;">البضاعة المباعة ترد وتستبدل خلال 14 يوماً بالفاتورة</p>
      <div style="font-family: monospace; font-size: 14px; letter-spacing: 4px; margin-top: 6px;">* ${sale.invoiceNumber} *</div>
    </div>
  `;

  // Print automatically
  setTimeout(() => {
    window.print();
  }, 150);
}
