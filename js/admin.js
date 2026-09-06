/**
 * CAPITAL VAPE - Panel de Administración y Control de Stock / Precios
 * Credenciales por defecto: admin / CapitalVape2026*
 */
const AdminService = {
  CREDENTIALS: {
    user: 'admin',
    pass: 'CapitalVape2026*'
  },
  SESSION_KEY: 'cv_admin_logged_in_session',

  currentCategory: 'all',
  searchQuery: '',
  draftOverrides: {
    products: {},
    wholesale: {}
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Escuchar cambios de hash #admin
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin') {
        this.open();
      }
    });

    if (window.location.hash === '#admin') {
      setTimeout(() => this.open(), 300);
    }
  },

  isAuthenticated() {
    return localStorage.getItem(this.SESSION_KEY) === 'true';
  },

  open() {
    if (this.isAuthenticated()) {
      this.openDashboard();
    } else {
      this.openLoginModal();
    }
  },

  openLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const userIn = document.getElementById('adminUserInput');
      if (userIn) setTimeout(() => userIn.focus(), 150);
    }
  },

  closeLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.style.display = 'none';
      if (!this.isDashboardOpen()) {
        document.body.style.overflow = '';
      }
    }
  },

  login(event) {
    if (event) event.preventDefault();
    const userIn = document.getElementById('adminUserInput');
    const passIn = document.getElementById('adminPassInput');
    const alertEl = document.getElementById('adminLoginAlert');

    const user = userIn ? userIn.value.trim() : '';
    const pass = passIn ? passIn.value.trim() : '';

    if (user === this.CREDENTIALS.user && pass === this.CREDENTIALS.pass) {
      localStorage.setItem(this.SESSION_KEY, 'true');
      if (alertEl) alertEl.style.display = 'none';
      this.closeLoginModal();
      this.openDashboard();
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ ¡Sesión de Administrador iniciada correctamente!', 'success');
      }
    } else {
      if (alertEl) {
        alertEl.textContent = '❌ Usuario o contraseña incorrectos.';
        alertEl.style.display = 'block';
      }
    }
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    this.closeDashboard();
    if (typeof Toast !== 'undefined') {
      Toast.show('Sesión de administrador cerrada.', 'info');
    }
  },

  isDashboardOpen() {
    const d = document.getElementById('adminDashboardModal');
    return d && d.style.display !== 'none';
  },

  openDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (!modal) return;

    // Clonar sobreescrituras actuales en draft
    if (typeof CloudSyncService !== 'undefined') {
      this.draftOverrides = JSON.parse(JSON.stringify(CloudSyncService.overrides || { products: {}, wholesale: {} }));
    }

    this.renderDashboard();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closeDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  setCategory(cat) {
    this.currentCategory = cat;
    this.renderProductList();
  },

  setSearch(q) {
    this.searchQuery = q.toLowerCase().trim();
    this.renderProductList();
  },

  renderDashboard() {
    const body = document.getElementById('adminDashboardBody');
    if (!body) return;

    body.innerHTML = `
      <div class="admin-toolbar">
        <div class="admin-search-box">
          <input type="text" 
                 class="admin-input-search" 
                 placeholder="🔍 Buscar producto o sabor..." 
                 oninput="AdminService.setSearch(this.value)" 
                 value="${this.searchQuery}">
        </div>
        <div class="admin-category-filters">
          <button type="button" class="admin-filter-pill ${this.currentCategory === 'all' ? 'active' : ''}" onclick="AdminService.setCategory('all')">Todos</button>
          <button type="button" class="admin-filter-pill ${this.currentCategory === 'desechables' ? 'active' : ''}" onclick="AdminService.setCategory('desechables')">Desechables</button>
          <button type="button" class="admin-filter-pill ${this.currentCategory === 'pods' ? 'active' : ''}" onclick="AdminService.setCategory('pods')">Pods</button>
          <button type="button" class="admin-filter-pill ${this.currentCategory === 'liquidos' ? 'active' : ''}" onclick="AdminService.setCategory('liquidos')">Líquidos</button>
          <button type="button" class="admin-filter-pill ${this.currentCategory === 'accesorios' ? 'active' : ''}" onclick="AdminService.setCategory('accesorios')">Accesorios</button>
        </div>
      </div>

      <div class="admin-stats-bar" id="adminStatsBar"></div>

      <div class="admin-products-list" id="adminProductsList">
        <!-- Rendered by renderProductList() -->
      </div>
    `;

    this.renderProductList();
  },

  renderProductList() {
    const container = document.getElementById('adminProductsList');
    const statsContainer = document.getElementById('adminStatsBar');
    if (!container || typeof PRODUCTS_DATA === 'undefined') return;

    let list = [...PRODUCTS_DATA];

    if (this.currentCategory !== 'all') {
      list = list.filter(p => p.categoria === this.currentCategory);
    }

    if (this.searchQuery) {
      list = list.filter(p => {
        const matchName = p.nombre.toLowerCase().includes(this.searchQuery);
        const matchSub = (p.subtitulo || '').toLowerCase().includes(this.searchQuery);
        const matchFlavors = (p.sabores || []).some(s => (typeof s === 'string' ? s : s.nombre).toLowerCase().includes(this.searchQuery));
        return matchName || matchSub || matchFlavors;
      });
    }

    // Stats
    const totalProd = PRODUCTS_DATA.length;
    const outOfStockProd = PRODUCTS_DATA.filter(p => this.isProductOutOfStock(p.id)).length;
    const inStockProd = totalProd - outOfStockProd;

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-badge">Total Productos: <strong>${totalProd}</strong></div>
        <div class="stat-badge in-stock">Disponibles: <strong>${inStockProd}</strong></div>
        <div class="stat-badge out-stock">Agotados: <strong>${outOfStockProd}</strong></div>
      `;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-state">
          No se encontraron productos que coincidan con los filtros.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(prod => this.renderProductCard(prod)).join('');
  },

  isProductOutOfStock(productId) {
    if (this.draftOverrides.products[productId] && typeof this.draftOverrides.products[productId].agotado === 'boolean') {
      return this.draftOverrides.products[productId].agotado;
    }
    const orig = PRODUCTS_DATA.find(p => p.id === productId);
    return orig ? !!orig.agotado : false;
  },

  getProductRetailPrice(productId) {
    if (this.draftOverrides.products[productId] && this.draftOverrides.products[productId].precio) {
      return Number(this.draftOverrides.products[productId].precio);
    }
    const orig = PRODUCTS_DATA.find(p => p.id === productId);
    return orig ? orig.precio : 0;
  },

  getProductPromoPrice(productId) {
    if (this.draftOverrides.products[productId] && this.draftOverrides.products[productId].precio_promo_2) {
      return Number(this.draftOverrides.products[productId].precio_promo_2);
    }
    const orig = PRODUCTS_DATA.find(p => p.id === productId);
    return orig ? orig.precio_promo_2 : 0;
  },

  isFlavorOutOfStock(productId, flavorName) {
    const pOv = this.draftOverrides.products[productId];
    if (pOv && pOv.sabores && pOv.sabores[flavorName] && typeof pOv.sabores[flavorName].agotado === 'boolean') {
      return pOv.sabores[flavorName].agotado;
    }
    const orig = PRODUCTS_DATA.find(p => p.id === productId);
    if (!orig) return false;
    const fl = (orig.sabores || []).find(s => (typeof s === 'string' ? s : s.nombre) === flavorName) ||
               (orig.colores || []).find(c => (typeof c === 'string' ? c : c.nombre) === flavorName);
    return fl ? !!fl.agotado : false;
  },

  getWholesaleTierPrice(productId, tier) {
    const wsOv = this.draftOverrides.wholesale[productId];
    if (wsOv && wsOv[String(tier)]) {
      return Number(wsOv[String(tier)]);
    }
    if (typeof WholesaleService !== 'undefined' && WholesaleService.PRICES[productId]) {
      return WholesaleService.PRICES[productId][String(tier)] || 0;
    }
    return 0;
  },

  renderProductCard(prod) {
    const isOutOfStock = this.isProductOutOfStock(prod.id);
    const retailPrice = this.getProductRetailPrice(prod.id);
    const promoPrice = this.getProductPromoPrice(prod.id);

    const flavors = prod.sabores || prod.colores || [];
    const hasFlavors = flavors.length > 0;

    const ws5 = this.getWholesaleTierPrice(prod.id, 5);
    const ws10 = this.getWholesaleTierPrice(prod.id, 10);
    const ws20 = this.getWholesaleTierPrice(prod.id, 20);
    const ws50 = this.getWholesaleTierPrice(prod.id, 50);
    const ws100 = this.getWholesaleTierPrice(prod.id, 100);

    return `
      <div class="admin-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}" id="adminCard_${prod.id}">
        <div class="admin-card-header">
          <div class="admin-prod-info">
            <img src="${prod.imagen || 'assets/logo/logo.png'}" class="admin-prod-thumb" alt="${prod.nombre}">
            <div>
              <div class="admin-prod-title">${prod.nombre}</div>
              <div class="admin-prod-sub">${prod.subtitulo || prod.categoria.toUpperCase()}</div>
            </div>
          </div>

          <!-- Product Global Stock Switch -->
          <div class="admin-stock-toggle-box">
            <button type="button" 
                    class="admin-stock-toggle-btn ${isOutOfStock ? 'state-agotado' : 'state-disponible'}" 
                    onclick="AdminService.toggleProductStock('${prod.id}')">
              ${isOutOfStock ? '❌ AGOTADO' : '✅ DISPONIBLE'}
            </button>
          </div>
        </div>

        <div class="admin-card-body">
          <!-- Retail Price Fields -->
          <div class="admin-price-fields-grid">
            <div class="admin-input-group">
              <label>Precio Detal ($):</label>
              <input type="number" 
                     class="admin-input-num" 
                     value="${retailPrice}" 
                     onchange="AdminService.updateProductPrice('${prod.id}', 'precio', this.value)">
            </div>
            <div class="admin-input-group">
              <label>Promo 2x ($):</label>
              <input type="number" 
                     class="admin-input-num" 
                     value="${promoPrice}" 
                     onchange="AdminService.updateProductPrice('${prod.id}', 'precio_promo_2', this.value)">
            </div>
          </div>

          <!-- Accordion Controls -->
          <div class="admin-accordion-actions">
            <button type="button" class="btn-admin-expand" onclick="AdminService.toggleAccordion('wsBox_${prod.id}')">
              📦 Precios Mayoristas (5 a 100+ uds) ▾
            </button>
            ${hasFlavors ? `
              <button type="button" class="btn-admin-expand" onclick="AdminService.toggleAccordion('flavorsBox_${prod.id}')">
                🍓 Sabores / Variantes (${flavors.length}) ▾
              </button>
            ` : ''}
          </div>

          <!-- Wholesale Tiers Form (Collapsible) -->
          <div class="admin-collapsible-box" id="wsBox_${prod.id}" style="display: none;">
            <div class="admin-section-subtitle">Tarifas Mayoristas por Rango de Volumen ($ c/u):</div>
            <div class="admin-ws-tiers-grid">
              <div class="admin-input-group">
                <label>5 - 9 uds:</label>
                <input type="number" class="admin-input-num" value="${ws5}" onchange="AdminService.updateWholesalePrice('${prod.id}', '5', this.value)">
              </div>
              <div class="admin-input-group">
                <label>10 - 19 uds:</label>
                <input type="number" class="admin-input-num" value="${ws10}" onchange="AdminService.updateWholesalePrice('${prod.id}', '10', this.value)">
              </div>
              <div class="admin-input-group">
                <label>20 - 49 uds:</label>
                <input type="number" class="admin-input-num" value="${ws20}" onchange="AdminService.updateWholesalePrice('${prod.id}', '20', this.value)">
              </div>
              <div class="admin-input-group">
                <label>50 - 99 uds:</label>
                <input type="number" class="admin-input-num" value="${ws50}" onchange="AdminService.updateWholesalePrice('${prod.id}', '50', this.value)">
              </div>
              <div class="admin-input-group">
                <label>100+ uds:</label>
                <input type="number" class="admin-input-num" value="${ws100}" onchange="AdminService.updateWholesalePrice('${prod.id}', '100', this.value)">
              </div>
            </div>
          </div>

          <!-- Flavors Stock Management (Collapsible) -->
          ${hasFlavors ? `
            <div class="admin-collapsible-box" id="flavorsBox_${prod.id}" style="display: none;">
              <div class="admin-section-subtitle">Disponibilidad de Sabores Individuales:</div>
              <div class="admin-flavors-grid">
                ${flavors.map(fl => {
                  const fName = typeof fl === 'string' ? fl : fl.nombre;
                  const fOut = this.isFlavorOutOfStock(prod.id, fName);
                  return `
                    <div class="admin-flavor-item ${fOut ? 'is-out' : ''}">
                      <span class="admin-flavor-name">${fName}</span>
                      <button type="button" 
                              class="admin-flavor-toggle-btn ${fOut ? 'state-agotado' : 'state-disponible'}" 
                              onclick="AdminService.toggleFlavorStock('${prod.id}', '${fName}')">
                        ${fOut ? 'Agotado' : 'Disponible'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  toggleAccordion(boxId) {
    const el = document.getElementById(boxId);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  },

  toggleProductStock(productId) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    const current = this.isProductOutOfStock(productId);
    this.draftOverrides.products[productId].agotado = !current;
    this.renderProductList();
  },

  updateProductPrice(productId, field, value) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    this.draftOverrides.products[productId][field] = Number(value);
  },

  updateWholesalePrice(productId, tier, value) {
    if (!this.draftOverrides.wholesale[productId]) {
      this.draftOverrides.wholesale[productId] = {};
    }
    this.draftOverrides.wholesale[productId][String(tier)] = Number(value);
  },

  toggleFlavorStock(productId, flavorName) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    if (!this.draftOverrides.products[productId].sabores) {
      this.draftOverrides.products[productId].sabores = {};
    }
    const current = this.isFlavorOutOfStock(productId, flavorName);
    this.draftOverrides.products[productId].sabores[flavorName] = {
      agotado: !current
    };
    this.renderProductList();
  },

  /**
   * Guarda todas las modificaciones en la nube y notifica
   */
  async saveAllChanges() {
    const saveBtn = document.getElementById('btnAdminSaveCloud');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Guardando en la nube...';
    }

    if (typeof CloudSyncService !== 'undefined') {
      const res = await CloudSyncService.saveToCloud(this.draftOverrides);
      if (typeof Toast !== 'undefined') {
        Toast.show(res.message || '✓ ¡Cambios guardados con éxito para todo el mundo!', 'success');
      }
    }

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '☁️ GUARDAR CAMBIOS PARA TODOS';
    }
  },

  /**
   * Restablece valores de fábrica
   */
  async resetDefaults() {
    if (confirm('⚠️ ¿Estás seguro de restablecer todos los precios y disponibilidades a los valores originales de fábrica?')) {
      if (typeof CloudSyncService !== 'undefined') {
        await CloudSyncService.resetToDefaults();
      }
    }
  },

  /**
   * Copia la configuración JSON al portapapeles
   */
  exportJSON() {
    const jsonStr = JSON.stringify(this.draftOverrides, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Configuración copiada al portapapeles en formato JSON.', 'success');
      }
    }).catch(e => {
      alert(jsonStr);
    });
  }
};

window.AdminService = AdminService;
document.addEventListener('DOMContentLoaded', () => {
  AdminService.init();
});
