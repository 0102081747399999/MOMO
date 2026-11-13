// Central Store & State Management with Firebase Sync & LocalStorage Backup
import { cloudSave, cloudDelete, cloudFetchCollection } from './firebase-app.js';

const STORAGE_KEY = 'central_pos_data_v1';

// Initial Empty State (STRICTLY 0 dummy products)
const defaultState = {
  chargers: [],
  phones: [],
  headphones: [],
  speakers: [],
  vodafoneLines: Array.from({ length: 18 }, (_, i) => ({
    lineId: i + 1,
    name: `خط ${i + 1}`,
    phoneNumber: '',
    balance: 0,
    monthlyLimit: 100000,
    usedLimit: 0,
    status: 'active'
  })),
  vodafoneTransactions: [],
  sales: [],
  cashDrawer: {
    openingBalance: 0,
    shiftNumber: 402,
    shiftStartTime: new Date().toISOString(),
    adjustments: [] // { type: 'in'|'out', amount, reason, timestamp }
  }
};

class Store {
  constructor() {
    this.state = this.loadInitialState();
    this.listeners = new Set();
    this.syncWithCloud();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure 18 lines exist
        if (!parsed.vodafoneLines || parsed.vodafoneLines.length < 18) {
          parsed.vodafoneLines = defaultState.vodafoneLines;
        }
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = 'state-changed') {
    this.listeners.forEach(fn => fn(this.state, event));
    window.dispatchEvent(new CustomEvent('store-updated', { detail: { event, state: this.state } }));
  }

  // Asynchronous cloud sync on startup
  async syncWithCloud() {
    try {
      const cloudSales = await cloudFetchCollection('sales');
      if (cloudSales && cloudSales.length > 0 && this.state.sales.length === 0) {
        this.state.sales = cloudSales;
      }
      const cloudChargers = await cloudFetchCollection('chargers');
      if (cloudChargers && cloudChargers.length > 0 && this.state.chargers.length === 0) {
        this.state.chargers = cloudChargers;
      }
      const cloudPhones = await cloudFetchCollection('phones');
      if (cloudPhones && cloudPhones.length > 0 && this.state.phones.length === 0) {
        this.state.phones = cloudPhones;
      }
      const cloudHeadphones = await cloudFetchCollection('headphones');
      if (cloudHeadphones && cloudHeadphones.length > 0 && this.state.headphones.length === 0) {
        this.state.headphones = cloudHeadphones;
      }
      const cloudSpeakers = await cloudFetchCollection('speakers');
      if (cloudSpeakers && cloudSpeakers.length > 0 && this.state.speakers.length === 0) {
        this.state.speakers = cloudSpeakers;
      }
      const cloudVoda = await cloudFetchCollection('vodafone_lines');
      if (cloudVoda && cloudVoda.length === 18) {
        this.state.vodafoneLines = cloudVoda;
      }
      this.save();
    } catch (err) {
      console.log("Cloud sync check completed:", err?.message || "ready");
    }
  }

  // ===================== Cash Drawer Logic =====================
  getCashDrawerTotal() {
    let cash = Number(this.state.cashDrawer.openingBalance) || 0;

    // Add cash sales
    this.state.sales.forEach(s => {
      if (s.paymentMethod === 'cash') {
        cash += Number(s.total) || 0;
      }
    });

    // Vodafone cash operations
    this.state.vodafoneTransactions.forEach(tx => {
      if (tx.type === 'send') {
        // Shop sends wallet credit to customer -> customer pays cash to drawer (+ commission)
        cash += (Number(tx.amount) || 0) + (Number(tx.commission) || 0);
      } else if (tx.type === 'receive') {
        // Customer sends wallet credit to shop -> shop hands cash to customer from drawer (- commission)
        cash -= Math.max(0, (Number(tx.amount) || 0) - (Number(tx.commission) || 0));
      }
    });

    // Manual adjustments
    (this.state.cashDrawer.adjustments || []).forEach(adj => {
      if (adj.type === 'in') cash += Number(adj.amount) || 0;
      else if (adj.type === 'out') cash -= Number(adj.amount) || 0;
    });

    return cash;
  }

  setOpeningBalance(amount) {
    this.state.cashDrawer.openingBalance = Number(amount) || 0;
    this.save();
    cloudSave('cash_drawer', 'current_shift', this.state.cashDrawer);
  }

  addCashAdjustment(type, amount, reason) {
    if (!this.state.cashDrawer.adjustments) this.state.cashDrawer.adjustments = [];
    this.state.cashDrawer.adjustments.push({
      id: 'ADJ-' + Date.now(),
      type,
      amount: Number(amount) || 0,
      reason: reason || (type === 'in' ? 'توريد نقدية' : 'سحب نقدية'),
      timestamp: new Date().toISOString()
    });
    this.save();
    cloudSave('cash_drawer', 'current_shift', this.state.cashDrawer);
  }

  // ===================== Chargers & Cables =====================
  addCharger(item) {
    const newItem = {
      id: item.id || 'CHG-' + Date.now(),
      barcode: item.barcode ? String(item.barcode).trim() : this.generateBarcode(),
      name: item.name.trim(),
      category: item.category || 'complete', // complete, adapter, typec, micro, pin
      spec: item.spec || '',
      buyPrice: Number(item.buyPrice) || 0,
      sellPrice: Number(item.sellPrice) || 0,
      quantity: Number(item.quantity) || 0,
      minStock: Number(item.minStock) || 3,
      createdAt: new Date().toISOString()
    };
    this.state.chargers.unshift(newItem);
    this.save();
    cloudSave('chargers', newItem.id, newItem);
    return newItem;
  }

  updateCharger(id, updates) {
    const idx = this.state.chargers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.chargers[idx] = { ...this.state.chargers[idx], ...updates };
      this.save();
      cloudSave('chargers', id, this.state.chargers[idx]);
      return this.state.chargers[idx];
    }
    return null;
  }

  deleteCharger(id) {
    this.state.chargers = this.state.chargers.filter(c => c.id !== id);
    this.save();
    cloudDelete('chargers', id);
  }

  // ===================== Phones Management =====================
  addPhone(phone) {
    const newPhone = {
      id: phone.id || 'PH-' + Date.now(),
      imei: String(phone.imei).trim(),
      brand: phone.brand.trim(),
      model: phone.model.trim(),
      color: phone.color || '',
      storage: phone.storage || '',
      costPrice: Number(phone.costPrice) || 0,
      sellPrice: Number(phone.sellPrice) || 0,
      status: phone.status || 'available', // 'available' | 'sold'
      customerName: phone.customerName || '',
      customerPhone: phone.customerPhone || '',
      customerNationalId: phone.customerNationalId || '',
      warrantyDays: Number(phone.warrantyDays) || 30,
      soldDate: phone.soldDate || null,
      invoiceNumber: phone.invoiceNumber || '',
      createdAt: new Date().toISOString()
    };
    this.state.phones.unshift(newPhone);
    this.save();
    cloudSave('phones', newPhone.id, newPhone);
    return newPhone;
  }

  updatePhone(id, updates) {
    const idx = this.state.phones.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.phones[idx] = { ...this.state.phones[idx], ...updates };
      this.save();
      cloudSave('phones', id, this.state.phones[idx]);
      return this.state.phones[idx];
    }
    return null;
  }

  sellPhone(id, customerData) {
    const idx = this.state.phones.findIndex(p => p.id === id);
    if (idx !== -1) {
      const invNum = 'INV-PH-' + Math.floor(1000 + Math.random() * 9000);
      this.state.phones[idx].status = 'sold';
      this.state.phones[idx].customerName = customerData.name || '';
      this.state.phones[idx].customerPhone = customerData.phone || '';
      this.state.phones[idx].customerNationalId = customerData.nationalId || '';
      this.state.phones[idx].warrantyDays = Number(customerData.warrantyDays) || 30;
      this.state.phones[idx].soldDate = new Date().toISOString();
      this.state.phones[idx].invoiceNumber = invNum;

      // Add to sales
      const sale = {
        id: 'SALE-' + Date.now(),
        invoiceNumber: invNum,
        items: [{
          id: this.state.phones[idx].id,
          name: `${this.state.phones[idx].brand} ${this.state.phones[idx].model} (${this.state.phones[idx].storage}) - IMEI: ${this.state.phones[idx].imei}`,
          category: 'phone',
          price: this.state.phones[idx].sellPrice,
          costPrice: this.state.phones[idx].costPrice,
          quantity: 1,
          total: this.state.phones[idx].sellPrice
        }],
        subtotal: this.state.phones[idx].sellPrice,
        discount: 0,
        total: this.state.phones[idx].sellPrice,
        paidAmount: this.state.phones[idx].sellPrice,
        paymentMethod: customerData.paymentMethod || 'cash',
        customerName: customerData.name || '',
        customerPhone: customerData.phone || '',
        timestamp: new Date().toISOString()
      };

      this.state.sales.unshift(sale);
      this.save();
      cloudSave('phones', id, this.state.phones[idx]);
      cloudSave('sales', sale.id, sale);
      return { phone: this.state.phones[idx], sale };
    }
    return null;
  }

  deletePhone(id) {
    this.state.phones = this.state.phones.filter(p => p.id !== id);
    this.save();
    cloudDelete('phones', id);
  }

  // ===================== Headphones =====================
  addHeadphone(item) {
    const newItem = {
      id: item.id || 'HD-' + Date.now(),
      barcode: item.barcode ? String(item.barcode).trim() : this.generateBarcode(),
      name: item.name.trim(),
      category: item.category || 'silicone', // silicone, classic, bluetooth
      brand: item.brand || '',
      buyPrice: Number(item.buyPrice) || 0,
      sellPrice: Number(item.sellPrice) || 0,
      quantity: Number(item.quantity) || 0,
      minStock: Number(item.minStock) || 3,
      createdAt: new Date().toISOString()
    };
    this.state.headphones.unshift(newItem);
    this.save();
    cloudSave('headphones', newItem.id, newItem);
    return newItem;
  }

  updateHeadphone(id, updates) {
    const idx = this.state.headphones.findIndex(h => h.id === id);
    if (idx !== -1) {
      this.state.headphones[idx] = { ...this.state.headphones[idx], ...updates };
      this.save();
      cloudSave('headphones', id, this.state.headphones[idx]);
      return this.state.headphones[idx];
    }
    return null;
  }

  deleteHeadphone(id) {
    this.state.headphones = this.state.headphones.filter(h => h.id !== id);
    this.save();
    cloudDelete('headphones', id);
  }

  // ===================== Speakers =====================
  addSpeaker(item) {
    const newItem = {
      id: item.id || 'SPK-' + Date.now(),
      barcode: item.barcode ? String(item.barcode).trim() : this.generateBarcode(),
      name: item.name.trim(),
      category: item.category || 'small', // small, medium, large
      brand: item.brand || '',
      buyPrice: Number(item.buyPrice) || 0,
      sellPrice: Number(item.sellPrice) || 0,
      quantity: Number(item.quantity) || 0,
      minStock: Number(item.minStock) || 3,
      createdAt: new Date().toISOString()
    };
    this.state.speakers.unshift(newItem);
    this.save();
    cloudSave('speakers', newItem.id, newItem);
    return newItem;
  }

  updateSpeaker(id, updates) {
    const idx = this.state.speakers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.speakers[idx] = { ...this.state.speakers[idx], ...updates };
      this.save();
      cloudSave('speakers', id, this.state.speakers[idx]);
      return this.state.speakers[idx];
    }
    return null;
  }

  deleteSpeaker(id) {
    this.state.speakers = this.state.speakers.filter(s => s.id !== id);
    this.save();
    cloudDelete('speakers', id);
  }

  // ===================== Vodafone Cash (18 Lines) =====================
  getVodafoneTotalBalance() {
    return this.state.vodafoneLines.reduce((acc, line) => acc + (Number(line.balance) || 0), 0);
  }

  getVodafoneTotalRemainingCap() {
    return this.state.vodafoneLines.reduce((acc, line) => {
      const limit = Number(line.monthlyLimit) || 100000;
      const used = Number(line.usedLimit) || 0;
      return acc + Math.max(0, limit - used);
    }, 0);
  }

  getVodafoneTodayCommissions() {
    const today = new Date().toDateString();
    return this.state.vodafoneTransactions
      .filter(tx => new Date(tx.timestamp).toDateString() === today)
      .reduce((acc, tx) => acc + (Number(tx.commission) || 0), 0);
  }

  updateVodafoneLine(lineId, updates) {
    const idx = this.state.vodafoneLines.findIndex(l => l.lineId === Number(lineId));
    if (idx !== -1) {
      this.state.vodafoneLines[idx] = { ...this.state.vodafoneLines[idx], ...updates };
      this.save();
      cloudSave('vodafone_lines', String(lineId), this.state.vodafoneLines[idx]);
      return this.state.vodafoneLines[idx];
    }
    return null;
  }

  resetVodafoneLine(lineId) {
    const idx = this.state.vodafoneLines.findIndex(l => l.lineId === Number(lineId));
    if (idx !== -1) {
      this.state.vodafoneLines[idx].balance = 0;
      this.state.vodafoneLines[idx].usedLimit = 0;
      // Remove transactions for this line
      this.state.vodafoneTransactions = this.state.vodafoneTransactions.filter(tx => tx.lineId !== Number(lineId));
      this.save();
      cloudSave('vodafone_lines', String(lineId), this.state.vodafoneLines[idx]);
    }
  }

  executeVodafoneTransaction({ lineId, type, amount, commission, customerPhone, notes }) {
    const idx = this.state.vodafoneLines.findIndex(l => l.lineId === Number(lineId));
    if (idx === -1) throw new Error("الخط المحدد غير موجود");

    const line = this.state.vodafoneLines[idx];
    const amt = Number(amount) || 0;
    const comm = Number(commission) || 0;
    const balanceBefore = Number(line.balance) || 0;
    let balanceAfter = balanceBefore;

    if (type === 'send') {
      // Sending cash out from wallet to customer/recipient
      if (balanceBefore < amt) {
        throw new Error("رصيد المحفظة غير كافٍ لإتمام التحويل");
      }
      balanceAfter = balanceBefore - amt;
      line.usedLimit = (Number(line.usedLimit) || 0) + amt;
    } else if (type === 'receive') {
      // Receiving money from customer into shop's wallet
      balanceAfter = balanceBefore + amt;
      line.usedLimit = (Number(line.usedLimit) || 0) + amt;
    }

    line.balance = balanceAfter;

    const tx = {
      id: 'VTX-' + Date.now(),
      lineId: Number(lineId),
      type, // 'send' (تحويل/إرسال) | 'receive' (استلام/سحب)
      amount: amt,
      commission: comm,
      balanceBefore,
      balanceAfter,
      customerPhone: customerPhone ? String(customerPhone).trim() : '',
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    this.state.vodafoneTransactions.unshift(tx);
    this.save();

    cloudSave('vodafone_lines', String(lineId), line);
    cloudSave('vodafone_transactions', tx.id, tx);
    cloudSave('cash_drawer', 'current_shift', this.state.cashDrawer);

    return tx;
  }

  deleteVodafoneTransaction(txId) {
    const tx = this.state.vodafoneTransactions.find(t => t.id === txId);
    if (!tx) return;

    // Rollback line balance
    const line = this.state.vodafoneLines.find(l => l.lineId === tx.lineId);
    if (line) {
      if (tx.type === 'send') {
        line.balance = (Number(line.balance) || 0) + Number(tx.amount);
        line.usedLimit = Math.max(0, (Number(line.usedLimit) || 0) - Number(tx.amount));
      } else if (tx.type === 'receive') {
        line.balance = Math.max(0, (Number(line.balance) || 0) - Number(tx.amount));
        line.usedLimit = Math.max(0, (Number(line.usedLimit) || 0) - Number(tx.amount));
      }
      cloudSave('vodafone_lines', String(line.lineId), line);
    }

    this.state.vodafoneTransactions = this.state.vodafoneTransactions.filter(t => t.id !== txId);
    this.save();
    cloudDelete('vodafone_transactions', txId);
  }

  // ===================== POS & Sales Execution =====================
  executeSale({ items, discount = 0, paymentMethod = 'cash', vodafoneLineId = null, customerName = '', customerPhone = '' }) {
    if (!items || items.length === 0) throw new Error("سلة المشتريات فارغة");

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const disc = Number(discount) || 0;
    const total = Math.max(0, subtotal - disc);
    const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    // Deduct inventory
    items.forEach(cartItem => {
      if (cartItem.table === 'chargers') {
        const item = this.state.chargers.find(c => c.id === cartItem.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity - cartItem.quantity);
          cloudSave('chargers', item.id, item);
        }
      } else if (cartItem.table === 'headphones') {
        const item = this.state.headphones.find(h => h.id === cartItem.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity - cartItem.quantity);
          cloudSave('headphones', item.id, item);
        }
      } else if (cartItem.table === 'speakers') {
        const item = this.state.speakers.find(s => s.id === cartItem.id);
        if (item) {
          item.quantity = Math.max(0, item.quantity - cartItem.quantity);
          cloudSave('speakers', item.id, item);
        }
      }
    });

    // If paid via Vodafone Cash, increase that line's balance
    if (paymentMethod === 'vodafone' && vodafoneLineId) {
      const line = this.state.vodafoneLines.find(l => l.lineId === Number(vodafoneLineId));
      if (line) {
        line.balance = (Number(line.balance) || 0) + total;
        cloudSave('vodafone_lines', String(line.lineId), line);
      }
    }

    const sale = {
      id: 'SALE-' + Date.now(),
      invoiceNumber,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        costPrice: i.costPrice || 0,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal,
      discount: disc,
      total,
      paidAmount: total,
      paymentMethod,
      vodafoneLineId,
      customerName,
      customerPhone,
      timestamp: new Date().toISOString()
    };

    this.state.sales.unshift(sale);
    this.save();
    cloudSave('sales', sale.id, sale);
    return sale;
  }

  deleteSale(saleId) {
    const sale = this.state.sales.find(s => s.id === saleId);
    if (!sale) return;

    // Restore stock
    sale.items.forEach(cartItem => {
      let found = this.state.chargers.find(c => c.id === cartItem.id);
      if (found) {
        found.quantity += cartItem.quantity;
        cloudSave('chargers', found.id, found);
        return;
      }
      found = this.state.headphones.find(h => h.id === cartItem.id);
      if (found) {
        found.quantity += cartItem.quantity;
        cloudSave('headphones', found.id, found);
        return;
      }
      found = this.state.speakers.find(s => s.id === cartItem.id);
      if (found) {
        found.quantity += cartItem.quantity;
        cloudSave('speakers', found.id, found);
      }
    });

    // Rollback Vodafone if paid via line
    if (sale.paymentMethod === 'vodafone' && sale.vodafoneLineId) {
      const line = this.state.vodafoneLines.find(l => l.lineId === Number(sale.vodafoneLineId));
      if (line) {
        line.balance = Math.max(0, (Number(line.balance) || 0) - Number(sale.total));
        cloudSave('vodafone_lines', String(line.lineId), line);
      }
    }

    this.state.sales = this.state.sales.filter(s => s.id !== saleId);
    this.save();
    cloudDelete('sales', saleId);
  }

  // Find any product across all inventory by barcode or IMEI
  findByBarcode(code) {
    if (!code) return null;
    const clean = String(code).trim().toLowerCase();

    // Check chargers
    const chg = this.state.chargers.find(c => String(c.barcode).trim().toLowerCase() === clean);
    if (chg) return { ...chg, table: 'chargers', categoryLabel: 'شاحن/وصلة' };

    // Check headphones
    const hdp = this.state.headphones.find(h => String(h.barcode).trim().toLowerCase() === clean);
    if (hdp) return { ...hdp, table: 'headphones', categoryLabel: 'سماعة' };

    // Check speakers
    const spk = this.state.speakers.find(s => String(s.barcode).trim().toLowerCase() === clean);
    if (spk) return { ...spk, table: 'speakers', categoryLabel: 'صب/مكبر' };

    // Check phones
    const ph = this.state.phones.find(p => String(p.imei).trim().toLowerCase() === clean);
    if (ph) return { ...ph, table: 'phones', categoryLabel: 'هاتف ذكي', isPhone: true };

    return null;
  }

  // Get low-stock items across all inventory
  getLowStockItems() {
    const list = [];
    this.state.chargers.forEach(c => {
      if (c.quantity <= c.minStock) list.push({ ...c, section: 'الشواحن والوصلات' });
    });
    this.state.headphones.forEach(h => {
      if (h.quantity <= h.minStock) list.push({ ...h, section: 'السماعات' });
    });
    this.state.speakers.forEach(s => {
      if (s.quantity <= s.minStock) list.push({ ...s, section: 'الصبات' });
    });
    return list;
  }

  generateBarcode() {
    return '622' + Math.floor(100000000 + Math.random() * 900000000);
  }

  exportBackup() {
    return JSON.stringify(this.state, null, 2);
  }

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.vodafoneLines || !Array.isArray(data.vodafoneLines)) {
        throw new Error("تنسيق ملف النسخة الاحتياطية غير صالح");
      }
      this.state = data;
      this.save();
      return true;
    } catch (e) {
      throw new Error("فشل استيراد النسخة الاحتياطية: " + e.message);
    }
  }
}

export const store = new Store();
