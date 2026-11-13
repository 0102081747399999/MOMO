// Main Application Bootstrap & Router
import { initFirebase } from './firebase-app.js';
import { store } from './store.js';
import { initBarcodeScanner, playSound } from './scanner.js';
import { initPOS, openPOS, closePOS, addToCart, renderCart, updateCartQuantity, removeCartItem, clearCart, setDiscount, setPaymentMethod, checkout, printThermalReceipt } from './pos.js';

import { renderDashboard } from './pages/dashboard.js';
import { renderVodafonePage } from './pages/vodafone.js';
import { renderChargersPage } from './pages/chargers.js';
import { renderPhonesPage } from './pages/phones.js';
import { renderHeadphonesPage } from './pages/headphones.js';
import { renderSpeakersPage } from './pages/speakers.js';

let currentPage = 'dashboard';

// Expose modules to global window for inline onclick handlers
window.posModule = {
  openPOS,
  closePOS,
  addToCart,
  renderCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
  setDiscount,
  setPaymentMethod,
  checkout,
  printThermalReceipt
};

export function navigateTo(pageId) {
  currentPage = pageId;

  // Update page visibility
  const pages = ['dashboard', 'vodafone', 'chargers', 'phones', 'headphones', 'speakers'];
  pages.forEach(p => {
    const el = document.getElementById(`page-${p}`);
    if (el) {
      if (p === pageId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  // Update navigation sidebar active class
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add('nav-active');
      btn.classList.remove('text-slate-400', 'hover:bg-slate-800/60');
    } else {
      btn.classList.remove('nav-active');
      btn.classList.add('text-slate-400', 'hover:bg-slate-800/60');
    }
  });

  // Render content
  renderCurrentPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navigateTo = navigateTo;

function renderCurrentPage() {
  updateTopBar();
  switch (currentPage) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'vodafone':
      renderVodafonePage();
      break;
    case 'chargers':
      renderChargersPage();
      break;
    case 'phones':
      renderPhonesPage();
      break;
    case 'headphones':
      renderHeadphonesPage();
      break;
    case 'speakers':
      renderSpeakersPage();
      break;
  }
}

function updateTopBar() {
  const drawerCashEl = document.getElementById('topbar-cash-drawer');
  if (drawerCashEl) {
    drawerCashEl.innerText = `${store.getCashDrawerTotal().toFixed(2)} ج.م`;
  }
  const sidebarDrawerEl = document.getElementById('sidebar-cash-drawer');
  if (sidebarDrawerEl) {
    sidebarDrawerEl.innerText = store.getCashDrawerTotal().toFixed(2);
  }
}

// Global Toast System
export function showToast(message, icon = 'check_circle') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item bg-[#0A192F] text-white border border-slate-700/80 shadow-2xl';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-blue-400 text-[22px]">${icon}</span>
    <span class="text-xs font-bold flex-1 leading-relaxed">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

// Universal Add New Product Modal Trigger (F1)
window.openNewProductModal = () => {
  if (currentPage === 'chargers') {
    window.chargersModule?.openAddModal();
  } else if (currentPage === 'phones') {
    window.phonesModule?.openAddModal();
  } else if (currentPage === 'headphones') {
    window.headphonesModule?.openAddModal();
  } else if (currentPage === 'speakers') {
    window.speakersModule?.openAddModal();
  } else {
    // Show fast selection picker
    const choice = prompt("اختر القسم لإضافة صنف جديد إليه:\n1. شاحن أو وصلة\n2. هاتف ذكي (IMEI)\n3. سماعات\n4. صبات ومكبرات", "1");
    if (choice === "1") {
      navigateTo('chargers');
      setTimeout(() => window.chargersModule?.openAddModal(), 100);
    } else if (choice === "2") {
      navigateTo('phones');
      setTimeout(() => window.phonesModule?.openAddModal(), 100);
    } else if (choice === "3") {
      navigateTo('headphones');
      setTimeout(() => window.headphonesModule?.openAddModal(), 100);
    } else if (choice === "4") {
      navigateTo('speakers');
      setTimeout(() => window.speakersModule?.openAddModal(), 100);
    }
  }
};

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Firebase
  initFirebase();

  // 2. Initialize Barcode Scanner
  initBarcodeScanner();

  // 3. Initialize POS & Cart
  initPOS();

  // 4. Listen for store updates
  store.subscribe(() => {
    updateTopBar();
  });

  // 5. Listen for Firebase status changes
  window.addEventListener('firebase-sync-status', (e) => {
    const status = e.detail;
    const badge = document.getElementById('firebase-status-badge');
    const text = document.getElementById('firebase-status-text');
    const dot = document.getElementById('firebase-status-dot');
    if (badge && text && dot) {
      text.innerText = status.statusText;
      if (status.connected) {
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
      } else {
        dot.className = "w-2 h-2 rounded-full bg-amber-400";
      }
    }
  });

  // 6. Handle Barcode Scans on Inventory pages (outside POS)
  window.addEventListener('barcode-scanned', (e) => {
    const code = e.detail.barcode;
    const posModal = document.getElementById('pos-modal');
    if (posModal && !posModal.classList.contains('hidden')) {
      return; // Already handled by POS
    }

    const item = store.findByBarcode(code);
    if (item) {
      playSound('success');
      if (confirm(`تم العثور على الصنف: "${item.name}" (الكمية الحالية: ${item.quantity || 1})\nهل تريد إضافته لسلة البيع السريعة (POS)؟`)) {
        addToCart(item);
        openPOS();
      }
    } else {
      // New item not found -> offer to create it with scanned barcode pre-filled
      playSound('scan');
      if (currentPage === 'chargers') {
        window.chargersModule?.openAddModal(code);
      } else if (currentPage === 'phones') {
        window.phonesModule?.openAddModal(code);
      } else if (currentPage === 'headphones') {
        window.headphonesModule?.openAddModal(code);
      } else if (currentPage === 'speakers') {
        window.speakersModule?.openAddModal(code);
      } else {
        if (confirm(`باركود جديد غير مسجل: ${code}\nهل تريد فتح قسم الشواحن لإضافته الآن؟`)) {
          navigateTo('chargers');
          setTimeout(() => window.chargersModule?.openAddModal(code), 100);
        }
      }
    }
  });

  // 7. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault();
      window.openNewProductModal();
    } else if (e.key === 'F2') {
      e.preventDefault();
      const posModal = document.getElementById('pos-modal');
      if (posModal && !posModal.classList.contains('hidden')) {
        closePOS();
      } else {
        openPOS();
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="بحث"]');
      if (searchInputs.length > 0) searchInputs[0].focus();
    } else if (e.key === 'F4') {
      e.preventDefault();
      navigateTo('vodafone');
    } else if (e.key === 'Escape') {
      closePOS();
      document.querySelectorAll('.app-modal').forEach(m => {
        m.classList.add('hidden');
        m.classList.remove('flex');
      });
    }
  });

  // Initial Route
  navigateTo('dashboard');
});

// Sidebar Toggle for Mobile / Tablet
window.toggleSidebar = () => {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('translate-x-full');
  }
};

// Modal Close Helper
window.closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// Save Opening Cash Drawer Modal Form
window.saveOpeningCash = (e) => {
  e.preventDefault();
  const amt = Number(document.getElementById('cash-opening-input')?.value) || 0;
  store.setOpeningBalance(amt);
  window.closeModal('modal-opening-cash');
  showToast("تم تحديث رصيد البداية لدرج الكاشير", "check_circle");
  renderCurrentPage();
};

// Save Vodafone Line Settings Form
window.saveVodafoneLineSettings = (e) => {
  e.preventDefault();
  const lineId = Number(document.getElementById('edit-voda-line-id').value);
  const name = document.getElementById('edit-voda-line-name').value.trim();
  const phone = document.getElementById('edit-voda-line-phone').value.trim();
  const limit = Number(document.getElementById('edit-voda-line-limit').value) || 100000;
  const balance = Number(document.getElementById('edit-voda-line-balance').value) || 0;

  store.updateVodafoneLine(lineId, {
    name,
    phoneNumber: phone,
    monthlyLimit: limit,
    balance: balance
  });

  window.closeModal('modal-edit-voda-line');
  showToast(`تم حفظ وتحديث إعدادات الخط ${lineId}`, "check_circle");
  renderCurrentPage();
};

// Backup and Restore
window.exportBackupFile = () => {
  const jsonStr = store.exportBackup();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `central_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("تم تنزيل النسخة الاحتياطية للبيانات بنجاح", "file_download");
};

window.importBackupFile = (input) => {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      store.importBackup(e.target.result);
      showToast("تم استعادة قاعدة البيانات بنجاح", "cloud_done");
      renderCurrentPage();
    } catch (err) {
      alert("خطأ أثناء استعادة النسخة: " + err.message);
    }
  };
  reader.readAsText(file);
};
