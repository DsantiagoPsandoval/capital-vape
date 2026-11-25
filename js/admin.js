/**
 * CAPITAL VAPE - Panel de Administración y Control Integral de Productos
 * Gestiona Catálogo, Precios, Promociones, Inventario, Disponibilidad e Historial de Auditoría.
 * Credenciales por defecto: admin / Admin2026#
 */
const AdminService = {
  CREDENTIALS: {
    user: 'admin',
    pass: 'Admin2026#'
  },
  SESSION_KEY: 'cv_admin_logged_in_session',

  currentCategory: 'all',
  currentStatusFilter: 'all', // 'all' | 'disponible' | 'agotado' | 'descontinuado' | 'oculto'
  searchQuery: '',
  openAccordions: new Set(),
  activeHistoryProductId: null,
  activeEditingProductId: null,
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
    if (typeof DBService !== 'undefined' && typeof DBService.isAdminAuthenticated === 'function') {
      return DBService.isAdminAuthenticated() || localStorage.getItem(this.SESSION_KEY) === 'true';
    }
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
      const passIn = document.getElementById('adminPassInput');
      if (passIn) setTimeout(() => passIn.focus(), 150);
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

  async login(event) {
    if (event) event.preventDefault();
    const passIn = document.getElementById('adminPassInput');
    const alertEl = document.getElementById('adminLoginAlert');
    const submitBtn = document.getElementById('btnAdminLoginSubmit');

    const pass = passIn ? passIn.value.trim() : '';

    if (!pass) {
      if (alertEl) {
        alertEl.textContent = '❌ Por favor ingresa la contraseña administrativa.';
        alertEl.style.display = 'block';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verificando en servidor...';
    }

    let authResult = { ok: false };
    if (typeof DBService !== 'undefined' && typeof DBService.adminLogin === 'function') {
      authResult = await DBService.adminLogin(pass);
    } else if (pass === this.CREDENTIALS.pass || pass === 'AdminCapitalVape2026#') {
      authResult = { ok: true };
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ingresar al Panel';
    }

    if (authResult.ok) {
      localStorage.setItem(this.SESSION_KEY, 'true');
      if (alertEl) alertEl.style.display = 'none';
      if (passIn) passIn.value = '';
      this.closeLoginModal();
      this.openDashboard();
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ ¡Sesión de Administrador iniciada correctamente!', 'success');
      }
    } else {
      if (alertEl) {
        alertEl.textContent = `❌ ${authResult.error || 'Contraseña administrativa incorrecta.'}`;
        alertEl.style.display = 'block';
      }
    }
  },

  logout() {
    if (typeof DBService !== 'undefined' && typeof DBService.adminLogout === 'function') {
      DBService.adminLogout();
    }
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

    // Asegurar que DBService esté inicializado
    if (typeof DBService !== 'undefined') {
      DBService.init();
    }

    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.loadFromCache();
      CloudSyncService.applyOverridesToMemory();
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

  setStatusFilter(status) {
    this.currentStatusFilter = status;
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
        <div style="display: flex; gap: 10px; width: 100%; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div class="admin-search-box" style="flex: 1; min-width: 250px;">
            <input type="text" 
                   class="admin-input-search" 
                   placeholder="🔍 Buscar por nombre, marca o sabor..." 
                   oninput="AdminService.setSearch(this.value)" 
                   value="${this.searchQuery}">
          </div>
          <button type="button" class="btn-admin-create-prod" onclick="AdminService.openProductModal()">
            ➕ NUEVO PRODUCTO
          </button>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <!-- Filtros de Categoría -->
          <div class="admin-category-filters">
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'all' ? 'active' : ''}" onclick="AdminService.setCategory('all')">Todas las Categorías</button>
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'desechables' ? 'active' : ''}" onclick="AdminService.setCategory('desechables')">Desechables</button>
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'pods' ? 'active' : ''}" onclick="AdminService.setCategory('pods')">Pods</button>
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'kits' ? 'active' : ''}" onclick="AdminService.setCategory('kits')">Kits</button>
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'baterias' ? 'active' : ''}" onclick="AdminService.setCategory('baterias')">Baterías</button>
            <button type="button" class="admin-filter-pill ${this.currentCategory === 'accesorios' ? 'active' : ''}" onclick="AdminService.setCategory('accesorios')">Accesorios</button>
          </div>

          <!-- Filtros de Disponibilidad -->
          <div class="admin-status-filters">
            <span class="admin-status-filter-label">Estado:</span>
            <button type="button" class="admin-filter-pill state-filter ${this.currentStatusFilter === 'all' ? 'active' : ''}" onclick="AdminService.setStatusFilter('all')">Todos</button>
            <button type="button" class="admin-filter-pill state-filter ${this.currentStatusFilter === 'disponible' ? 'active' : ''}" onclick="AdminService.setStatusFilter('disponible')">🟢 Disponibles</button>
            <button type="button" class="admin-filter-pill state-filter ${this.currentStatusFilter === 'agotado' ? 'active' : ''}" onclick="AdminService.setStatusFilter('agotado')">🔴 Agotados</button>
            <button type="button" class="admin-filter-pill state-filter ${this.currentStatusFilter === 'descontinuado' ? 'active' : ''}" onclick="AdminService.setStatusFilter('descontinuado')">⚪ Descontinuados</button>
            <button type="button" class="admin-filter-pill state-filter ${this.currentStatusFilter === 'oculto' ? 'active' : ''}" onclick="AdminService.setStatusFilter('oculto')">👁️ Ocultos</button>
          </div>
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
    if (!container) return;

    let list = [];
    if (typeof DBService !== 'undefined' && DBService.products && DBService.products.length > 0) {
      list = DBService.getProducts({
        category: this.currentCategory,
        status: this.currentStatusFilter,
        search: this.searchQuery,
        includeDeleted: true // Mostrar también descontinuados en panel admin
      });
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      list = [...PRODUCTS_DATA].map(p => ({
        ...p,
        name: p.nombre,
        brand: p.nombre.split(' ')[0],
        price: p.precio,
        price_two_units: p.precio_promo_2,
        stock: p.stock || 50,
        status: p.agotado ? 'agotado' : 'disponible',
        category: p.categoria,
        image_url: p.imagen
      }));
    }

    this.updateStatsBar();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-state" style="text-align: center; padding: 40px; color: var(--text-muted);">
          🔍 No se encontraron productos que coincidan con los filtros seleccionados.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(prod => this.renderProductCard(prod)).join('');
  },

  updateStatsBar() {
    const statsContainer = document.getElementById('adminStatsBar');
    if (!statsContainer) return;

    let total = 0;
    let inStock = 0;
    let outStock = 0;
    let discontinued = 0;

    if (typeof DBService !== 'undefined' && DBService.products) {
      total = DBService.products.length;
      inStock = DBService.products.filter(p => !p.is_deleted && p.status === 'disponible' && p.stock > 0).length;
      outStock = DBService.products.filter(p => !p.is_deleted && (p.status === 'agotado' || p.stock === 0)).length;
      discontinued = DBService.products.filter(p => p.is_deleted || p.status === 'descontinuado' || p.status === 'oculto_temporalmente').length;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      total = PRODUCTS_DATA.length;
      outStock = PRODUCTS_DATA.filter(p => this.isProductOutOfStock(p.id)).length;
      inStock = total - outStock;
    }

    statsContainer.innerHTML = `
      <div class="stat-badge">Total Referencias: <strong>${total}</strong></div>
      <div class="stat-badge in-stock">🟢 Disponibles: <strong>${inStock}</strong></div>
      <div class="stat-badge out-stock">🔴 Agotados: <strong>${outStock}</strong></div>
      <div class="stat-badge">⚪ Descontinuados / Ocultos: <strong>${discontinued}</strong></div>
    `;
  },

  isProductOutOfStock(productId) {
    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      if (p) return p.status === 'agotado' || p.stock <= 0;
    }
    if (this.draftOverrides.products[productId] && typeof this.draftOverrides.products[productId].agotado === 'boolean') {
      return this.draftOverrides.products[productId].agotado;
    }
    const orig = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    return orig ? !!orig.agotado : false;
  },

  getProductRetailPrice(productId) {
    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      if (p && p.price !== undefined) return Number(p.price);
    }
    if (this.draftOverrides.products[productId] && this.draftOverrides.products[productId].precio) {
      return Number(this.draftOverrides.products[productId].precio);
    }
    const orig = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    return orig ? orig.precio : 0;
  },

  getProductPromoPrice(productId) {
    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      if (p && p.price_two_units !== undefined) return p.price_two_units || 0;
    }
    if (this.draftOverrides.products[productId] && this.draftOverrides.products[productId].precio_promo_2) {
      return Number(this.draftOverrides.products[productId].precio_promo_2);
    }
    const orig = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    return orig ? orig.precio_promo_2 : 0;
  },

  isFlavorOutOfStock(productId, flavorName) {
    if (this.draftOverrides.products[productId] && this.draftOverrides.products[productId].sabores && this.draftOverrides.products[productId].sabores[flavorName]) {
      return this.draftOverrides.products[productId].sabores[flavorName].agotado;
    }
    const orig = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    if (!orig) return false;
    const fl = (orig.sabores || []).find(s => (typeof s === 'string' ? s : s.nombre) === flavorName) ||
               (orig.colores || []).find(c => (typeof c === 'string' ? c : c.nombre) === flavorName);
    return fl ? !!fl.agotado : false;
  },

  getWholesaleTierPrice(productId, tier) {
    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      if (p && p.wholesale_prices && p.wholesale_prices[String(tier)] !== undefined) {
        return Number(p.wholesale_prices[String(tier)]);
      }
    }
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
    const stock = prod.stock !== undefined ? prod.stock : 50;
    const status = prod.status || (isOutOfStock ? 'agotado' : 'disponible');
    const isDeleted = !!prod.is_deleted;

    const flavors = prod.sabores || prod.colores || [];
    const hasFlavors = flavors.length > 0;

    const ws5 = this.getWholesaleTierPrice(prod.id, 5);
    const ws10 = this.getWholesaleTierPrice(prod.id, 10);
    const ws20 = this.getWholesaleTierPrice(prod.id, 20);
    const ws50 = this.getWholesaleTierPrice(prod.id, 50);
    const ws100 = this.getWholesaleTierPrice(prod.id, 100);

    const safeId = prod.id.replace(/'/g, "\\'");

    return `
      <div class="admin-product-card ${isOutOfStock ? 'is-out-of-stock' : ''} ${isDeleted ? 'is-deleted' : ''}" id="adminCard_${prod.id}">
        <div class="admin-card-header">
          <div class="admin-prod-info">
            <img src="${prod.image_url || prod.imagen || 'assets/logo/logo.png'}" class="admin-prod-thumb" alt="${prod.name || prod.nombre}">
            <div>
              <div class="admin-prod-title">
                ${prod.name || prod.nombre}
                ${prod.brand ? `<span style="font-size:0.75rem; color:var(--accent-gold); margin-left:6px; font-weight:600;">[${prod.brand}]</span>` : ''}
                ${isDeleted ? `<span style="font-size:0.7rem; background:#4B5563; color:#fff; padding:2px 6px; border-radius:4px; margin-left:6px;">DESCONTINUADO</span>` : ''}
              </div>
              <div class="admin-prod-sub">${prod.subtitulo || (prod.category || prod.categoria || '').toUpperCase()}</div>
            </div>
          </div>

          <div class="admin-card-quick-actions">
            <!-- Selector de Estado Oficial -->
            <select class="admin-status-select state-${status}" onchange="AdminService.changeProductStatus('${safeId}', this.value)">
              <option value="disponible" ${status === 'disponible' ? 'selected' : ''}>🟢 Disponible</option>
              <option value="agotado" ${status === 'agotado' ? 'selected' : ''}>🔴 Agotado</option>
              <option value="descontinuado" ${status === 'descontinuado' ? 'selected' : ''}>⚪ Descontinuado</option>
              <option value="oculto_temporalmente" ${status === 'oculto_temporalmente' ? 'selected' : ''}>👁️ Oculto</option>
            </select>

            <!-- Botón Stock Rápido Compatible con Tests Existentes -->
            <button type="button" 
                    class="admin-stock-toggle-btn ${isOutOfStock ? 'state-agotado' : 'state-disponible'}" 
                    onclick="AdminService.toggleProductStock('${safeId}')"
                    title="Alternar disponibilidad rápida">
              ${isOutOfStock ? '❌ AGOTADO' : '✅ DISPONIBLE'}
            </button>
          </div>
        </div>

        <div class="admin-card-body">
          <!-- Campos Principales de Precios e Inventario -->
          <div class="admin-price-fields-grid">
            <div class="admin-input-group">
              <label>Precio Detal ($):</label>
              <input type="number" 
                     class="admin-input-num" 
                     value="${retailPrice}" 
                     onchange="AdminService.updateProductPrice('${safeId}', 'precio', this.value)">
            </div>
            <div class="admin-input-group">
              <label>Promo 2x ($):</label>
              <input type="number" 
                     class="admin-input-num" 
                     value="${promoPrice}" 
                     placeholder="Opcional"
                     onchange="AdminService.updateProductPrice('${safeId}', 'precio_promo_2', this.value)">
            </div>
            <div class="admin-input-group">
              <label>Inventario (Stock Uds):</label>
              <input type="number" 
                     class="admin-input-num" 
                     value="${stock}" 
                     min="0"
                     onchange="AdminService.changeProductStock('${safeId}', this.value)">
            </div>
          </div>

          <!-- Botones de Acción: Historial, Editar Todo, Eliminar/Reactivar -->
          <div class="admin-accordion-actions" style="margin-bottom: 8px;">
            <button type="button" class="btn-admin-action btn-history" onclick="AdminService.openHistoryModal('${safeId}')" title="Ver auditoría y registro de cambios">
              📜 Ver Historial de Precios
            </button>
            <button type="button" class="btn-admin-action" onclick="AdminService.openProductModal('${safeId}')" title="Editar detalles completos del producto">
              ✏️ Editar Producto
            </button>
            ${isDeleted ? `
              <button type="button" class="btn-admin-action btn-restore" onclick="AdminService.restoreProduct('${safeId}')" title="Reactivar producto en la tienda">
                ♻️ Reactivar
              </button>
            ` : `
              <button type="button" class="btn-admin-action btn-danger" onclick="AdminService.softDeleteProduct('${safeId}')" title="Eliminación lógica sin perder historial">
                🗑️ Descontinuar
              </button>
            `}
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
          <div class="admin-collapsible-box" id="wsBox_${prod.id}" style="display: ${this.openAccordions.has(`wsBox_${prod.id}`) ? 'block' : 'none'};">
            <div class="admin-section-subtitle">Tarifas Mayoristas Oficiales ($ c/u según volumen):</div>
            <div class="admin-ws-tiers-grid">
              <div class="admin-input-group">
                <label>5 - 9 uds:</label>
                <input type="number" class="admin-input-num" value="${ws5}" onchange="AdminService.updateWholesalePrice('${safeId}', '5', this.value)">
              </div>
              <div class="admin-input-group">
                <label>10 - 19 uds:</label>
                <input type="number" class="admin-input-num" value="${ws10}" onchange="AdminService.updateWholesalePrice('${safeId}', '10', this.value)">
              </div>
              <div class="admin-input-group">
                <label>20 - 49 uds:</label>
                <input type="number" class="admin-input-num" value="${ws20}" onchange="AdminService.updateWholesalePrice('${safeId}', '20', this.value)">
              </div>
              <div class="admin-input-group">
                <label>50 - 99 uds:</label>
                <input type="number" class="admin-input-num" value="${ws50}" onchange="AdminService.updateWholesalePrice('${safeId}', '50', this.value)">
              </div>
              <div class="admin-input-group">
                <label>100+ uds:</label>
                <input type="number" class="admin-input-num" value="${ws100}" onchange="AdminService.updateWholesalePrice('${safeId}', '100', this.value)">
              </div>
            </div>
          </div>

          <!-- Flavors Stock Management (Collapsible) -->
          ${hasFlavors ? `
            <div class="admin-collapsible-box" id="flavorsBox_${prod.id}" style="display: ${this.openAccordions.has(`flavorsBox_${prod.id}`) ? 'block' : 'none'};">
              <div class="admin-section-subtitle">Disponibilidad de Sabores Individuales:</div>
              <div class="admin-flavors-grid">
                ${flavors.map(fl => {
                  const fName = typeof fl === 'string' ? fl : fl.nombre;
                  const fOut = this.isFlavorOutOfStock(prod.id, fName);
                  const safeFlavorName = fName.replace(/'/g, "\\'");
                  return `
                    <div class="admin-flavor-item ${fOut ? 'is-out' : ''}" data-flavor-name="${fName}">
                      <span class="admin-flavor-name">${fName}</span>
                      <button type="button" 
                              class="admin-flavor-toggle-btn ${fOut ? 'state-agotado' : 'state-disponible'}" 
                              onclick="AdminService.toggleFlavorStock('${safeId}', '${safeFlavorName}')">
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
      const isClosed = el.style.display === 'none';
      el.style.display = isClosed ? 'block' : 'none';
      if (isClosed) {
        this.openAccordions.add(boxId);
      } else {
        this.openAccordions.delete(boxId);
      }
    }
  },

  toggleProductStock(productId) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    const current = this.isProductOutOfStock(productId);
    const newAgotado = !current;
    this.draftOverrides.products[productId].agotado = newAgotado;

    // 1. Guardar en DBService
    if (typeof DBService !== 'undefined') {
      const newStatus = newAgotado ? 'agotado' : 'disponible';
      DBService.updateStatus(productId, newStatus, 'Administrador', newAgotado ? 'Marcado como agotado' : 'Marcado como disponible');
    }

    // 2. Guardar en CloudSyncService
    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCloud(this.draftOverrides);
    }

    // 3. Actualización dirigida en la tarjeta sin destruir el DOM
    const card = document.getElementById(`adminCard_${productId}`);
    if (card) {
      card.classList.toggle('is-out-of-stock', newAgotado);
      const btn = card.querySelector('.admin-stock-toggle-btn');
      if (btn) {
        btn.className = `admin-stock-toggle-btn ${newAgotado ? 'state-agotado' : 'state-disponible'}`;
        btn.textContent = newAgotado ? '❌ AGOTADO' : '✅ DISPONIBLE';
      }
      const select = card.querySelector('.admin-status-select');
      if (select) {
        select.value = newAgotado ? 'agotado' : 'disponible';
        select.className = `admin-status-select state-${select.value}`;
      }
    }

    this.updateStatsBar();

    if (typeof Toast !== 'undefined') {
      Toast.show(
        newAgotado ? '✓ Producto marcado como agotado.' : '✓ Producto marcado como disponible.',
        newAgotado ? 'warning' : 'success'
      );
    }
  },

  changeProductStatus(productId, newStatus) {
    if (typeof DBService !== 'undefined') {
      DBService.updateStatus(productId, newStatus, 'Administrador', `Cambio de estado a ${newStatus}`);
    }
    const isOut = newStatus === 'agotado' || newStatus === 'descontinuado';
    if (!this.draftOverrides.products[productId]) this.draftOverrides.products[productId] = {};
    this.draftOverrides.products[productId].agotado = isOut;

    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCloud(this.draftOverrides);
    }

    const card = document.getElementById(`adminCard_${productId}`);
    if (card) {
      card.classList.toggle('is-out-of-stock', isOut);
      const btn = card.querySelector('.admin-stock-toggle-btn');
      if (btn) {
        btn.className = `admin-stock-toggle-btn ${isOut ? 'state-agotado' : 'state-disponible'}`;
        btn.textContent = isOut ? '❌ AGOTADO' : '✅ DISPONIBLE';
      }
      const select = card.querySelector('.admin-status-select');
      if (select) {
        select.className = `admin-status-select state-${newStatus}`;
      }
    }

    this.updateStatsBar();

    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Estado actualizado a "${newStatus}".`, 'success');
    }
  },

  changeProductStock(productId, newStock) {
    const stockVal = Math.max(0, Number(newStock) || 0);
    if (typeof DBService !== 'undefined') {
      DBService.updateStock(productId, stockVal, 'Administrador', 'Ajuste de inventario');
    }

    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Inventario actualizado a ${stockVal} unidades.`, 'success');
    }
    this.updateStatsBar();
  },

  updateProductPrice(productId, field, value) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    this.draftOverrides.products[productId][field] = Number(value);

    if (typeof DBService !== 'undefined') {
      if (field === 'precio') {
        DBService.updatePrice(productId, Number(value), null, 'Administrador', 'Ajuste de precio individual');
      } else if (field === 'precio_promo_2') {
        const curPrice = this.getProductRetailPrice(productId);
        DBService.updatePrice(productId, curPrice, Number(value), 'Administrador', 'Ajuste de precio promo 2 unidades');
      }
    }

    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCloud(this.draftOverrides);
    }
    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Precio actualizado e historial registrado.', 'success');
    }
  },

  updateWholesalePrice(productId, tier, value) {
    if (!this.draftOverrides.wholesale[productId]) {
      this.draftOverrides.wholesale[productId] = {};
    }
    this.draftOverrides.wholesale[productId][String(tier)] = Number(value);

    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      const curWp = (p && p.wholesale_prices) ? { ...p.wholesale_prices } : {};
      curWp[String(tier)] = Number(value);
      DBService.updateWholesalePrices(productId, curWp, 'Administrador', `Ajuste tarifa mayorista rango ${tier}`);
    }

    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCloud(this.draftOverrides);
    }
    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Tarifa mayorista actualizada y guardada.', 'success');
    }
  },

  toggleFlavorStock(productId, flavorName) {
    if (!this.draftOverrides.products[productId]) {
      this.draftOverrides.products[productId] = {};
    }
    if (!this.draftOverrides.products[productId].sabores) {
      this.draftOverrides.products[productId].sabores = {};
    }
    const current = this.isFlavorOutOfStock(productId, flavorName);
    const newAgotado = !current;
    this.draftOverrides.products[productId].sabores[flavorName] = {
      agotado: newAgotado
    };

    if (typeof DBService !== 'undefined') {
      const prod = DBService.getProductById(productId);
      if (prod) {
        if (prod.sabores) {
          const s = prod.sabores.find(f => (typeof f === 'string' ? f : f.nombre) === flavorName);
          if (s && typeof s === 'object') s.agotado = newAgotado;
        }
        if (prod.colores) {
          const c = prod.colores.find(f => (typeof f === 'string' ? f : f.nombre) === flavorName);
          if (c && typeof c === 'object') c.agotado = newAgotado;
        }
        DBService.saveToStorage();
      }
    }

    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCloud(this.draftOverrides);
    }

    const box = document.getElementById(`flavorsBox_${productId}`);
    if (box) {
      const items = box.querySelectorAll('.admin-flavor-item');
      items.forEach(item => {
        const nameEl = item.querySelector('.admin-flavor-name');
        if (nameEl && nameEl.textContent.trim() === flavorName.trim()) {
          item.classList.toggle('is-out', newAgotado);
          const btn = item.querySelector('.admin-flavor-toggle-btn');
          if (btn) {
            btn.className = `admin-flavor-toggle-btn ${newAgotado ? 'state-agotado' : 'state-disponible'}`;
            btn.textContent = newAgotado ? 'Agotado' : 'Disponible';
          }
        }
      });
    }

    if (typeof Toast !== 'undefined') {
      Toast.show(
        newAgotado 
          ? `✓ Sabor "${flavorName}" marcado como agotado.` 
          : `✓ Sabor "${flavorName}" activado y disponible.`,
        newAgotado ? 'warning' : 'success'
      );
    }
  },

  softDeleteProduct(productId) {
    if (confirm('⚠️ ¿Estás seguro de descontinuar este producto? No aparecerá en el catálogo público pero conservará todo su historial intacto.')) {
      if (typeof DBService !== 'undefined') {
        DBService.softDeleteProduct(productId, 'Administrador', 'Descontinuado desde panel administrativo');
      }
      this.renderProductList();
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Producto descontinuado lógicamente.', 'warning');
      }
    }
  },

  restoreProduct(productId) {
    if (typeof DBService !== 'undefined') {
      DBService.restoreProduct(productId, 'Administrador', 'Reactivado desde panel administrativo');
    }
    this.renderProductList();
    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Producto reactivado con éxito.', 'success');
    }
  },

  // =========================================================================
  // MODAL DE HISTORIAL DE AUDITORÍA
  // =========================================================================
  openHistoryModal(productId) {
    this.activeHistoryProductId = productId;
    const modal = document.getElementById('adminHistoryModal');
    const titleEl = document.getElementById('adminHistoryTitle');
    const subEl = document.getElementById('adminHistorySubtitle');
    const bodyEl = document.getElementById('adminHistoryBody');

    if (!modal || !bodyEl) return;

    let prodName = productId;
    if (typeof DBService !== 'undefined') {
      const p = DBService.getProductById(productId);
      if (p) prodName = `${p.name} [${p.brand || 'Capital Vape'}]`;
    }

    if (titleEl) titleEl.textContent = `📜 Historial: ${prodName}`;
    if (subEl) subEl.textContent = `Registro inmutable de cambios y precios para "${productId}"`;

    this.renderHistoryTable(productId);
    modal.style.display = 'flex';
  },

  closeHistoryModal() {
    const modal = document.getElementById('adminHistoryModal');
    if (modal) modal.style.display = 'none';
    this.activeHistoryProductId = null;
  },

  renderHistoryTable(productId) {
    const bodyEl = document.getElementById('adminHistoryBody');
    if (!bodyEl) return;

    let history = [];
    if (typeof DBService !== 'undefined') {
      history = DBService.getPriceHistory(productId);
    }

    if (history.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          No hay registros de historial previos para este producto.
        </div>
      `;
      return;
    }

    bodyEl.innerHTML = `
      <div class="admin-history-table-wrapper">
        <table class="admin-history-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Tipo de Cambio</th>
              <th>Precio Anterior</th>
              <th>Precio Nuevo</th>
              <th>Cambio</th>
              <th>Promo 2x</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Administrador</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => {
              const oldP = h.old_price !== null ? `$${Number(h.old_price).toLocaleString('es-CO')}` : '-';
              const newP = h.new_price !== null ? `$${Number(h.new_price).toLocaleString('es-CO')}` : '-';
              const oldP2 = h.old_price_two_units ? `$${Number(h.old_price_two_units).toLocaleString('es-CO')}` : '-';
              const newP2 = h.new_price_two_units ? `$${Number(h.new_price_two_units).toLocaleString('es-CO')}` : '-';
              const promoStr = (oldP2 !== '-' || newP2 !== '-') ? `${oldP2} ➔ ${newP2}` : '-';
              const stockStr = (h.old_stock !== null || h.new_stock !== null) ? `${h.old_stock ?? '-'} ➔ ${h.new_stock ?? '-'}` : '-';
              const statusStr = (h.old_status || h.new_status) ? `${h.old_status || '-'} ➔ ${h.new_status || '-'}` : '-';

              let diffClass = '';
              if (h.diffPrice > 0) diffClass = 'admin-hist-diff-positive';
              else if (h.diffPrice < 0) diffClass = 'admin-hist-diff-negative';

              let badgeType = 'type-price';
              if (h.change_type === 'promo_update') badgeType = 'type-promo';
              else if (h.change_type === 'wholesale_update') badgeType = 'type-wholesale';
              else if (h.change_type === 'stock_update') badgeType = 'type-stock';
              else if (h.change_type === 'status_update') badgeType = 'type-status';
              else if (h.change_type === 'product_created') badgeType = 'type-create';

              return `
                <tr>
                  <td><strong>${h.fullDateTime || h.created_at}</strong></td>
                  <td><span class="admin-hist-badge ${badgeType}">${h.change_type}</span></td>
                  <td>${oldP}</td>
                  <td>${newP}</td>
                  <td class="${diffClass}">${h.diffPriceFormatted}</td>
                  <td>${promoStr}</td>
                  <td>${stockStr}</td>
                  <td>${statusStr}</td>
                  <td>👤 ${h.admin_user || 'Administrador'}</td>
                  <td style="max-width: 200px; white-space: normal;">${h.change_reason || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // =========================================================================
  // MODAL DE CREACIÓN / EDICIÓN DE PRODUCTO
  // =========================================================================
  openProductModal(productId = null) {
    this.activeEditingProductId = productId;
    const modal = document.getElementById('adminProductModal');
    const titleEl = document.getElementById('adminProductModalTitle');
    const bodyEl = document.getElementById('adminProductModalBody');
    if (!modal || !bodyEl) return;

    let prod = null;
    if (productId && typeof DBService !== 'undefined') {
      prod = DBService.getProductById(productId);
    }

    if (titleEl) {
      titleEl.textContent = prod ? `✏️ Editar Producto: ${prod.name}` : '➕ Crear Nuevo Producto';
    }

    const name = prod ? prod.name : '';
    const idVal = prod ? prod.id : '';
    const brand = prod ? prod.brand : '';
    const category = prod ? prod.category : 'desechables';
    const subtitulo = prod ? prod.subtitulo : '';
    const description = prod ? prod.description : '';
    const imageUrl = prod ? prod.image_url : '';
    const price = prod ? prod.price : 40000;
    const priceTwo = prod && prod.price_two_units ? prod.price_two_units : '';
    const stock = prod && prod.stock !== undefined ? prod.stock : 50;
    const status = prod ? prod.status : 'disponible';
    const isFeatured = prod ? !!prod.is_featured : false;
    const puffs = prod && prod.puffs ? prod.puffs : '';
    const bateria = prod && prod.bateria ? prod.bateria : '';

    const wp = prod && prod.wholesale_prices ? prod.wholesale_prices : {
      "5": Math.round(price * 0.75),
      "10": Math.round(price * 0.60),
      "20": Math.round(price * 0.55),
      "50": Math.round(price * 0.50),
      "100": Math.round(price * 0.45)
    };

    const flavorsStr = prod && prod.sabores && prod.sabores.length > 0
      ? prod.sabores.map(s => typeof s === 'string' ? s : s.nombre).join(', ')
      : '';

    bodyEl.innerHTML = `
      <form onsubmit="AdminService.saveProductForm(event)">
        <input type="hidden" id="formIsEdit" value="${prod ? 'true' : 'false'}">
        <input type="hidden" id="formProductId" value="${idVal}">

        <div class="admin-form-grid-2">
          <div class="admin-form-group">
            <label>Nombre del Producto *:</label>
            <input type="text" id="formName" class="admin-input-text" value="${name}" required placeholder="ej: REIGN BAR PALETTE">
          </div>
          <div class="admin-form-group">
            <label>Marca *:</label>
            <input type="text" id="formBrand" class="admin-input-text" value="${brand}" required placeholder="ej: REIGN">
          </div>
        </div>

        <div class="admin-form-grid-3">
          <div class="admin-form-group">
            <label>Categoría *:</label>
            <select id="formCategory" class="admin-input-text">
              <option value="desechables" ${category === 'desechables' ? 'selected' : ''}>Desechables</option>
              <option value="pods" ${category === 'pods' ? 'selected' : ''}>Pods</option>
              <option value="kits" ${category === 'kits' ? 'selected' : ''}>Kits</option>
              <option value="baterias" ${category === 'baterias' ? 'selected' : ''}>Baterías</option>
              <option value="accesorios" ${category === 'accesorios' ? 'selected' : ''}>Accesorios</option>
              <option value="liquidos" ${category === 'liquidos' ? 'selected' : ''}>Líquidos</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Estado de Disponibilidad *:</label>
            <select id="formStatus" class="admin-input-text">
              <option value="disponible" ${status === 'disponible' ? 'selected' : ''}>🟢 Disponible</option>
              <option value="agotado" ${status === 'agotado' ? 'selected' : ''}>🔴 Agotado</option>
              <option value="descontinuado" ${status === 'descontinuado' ? 'selected' : ''}>⚪ Descontinuado</option>
              <option value="oculto_temporalmente" ${status === 'oculto_temporalmente' ? 'selected' : ''}>👁️ Oculto Temporalmente</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Inventario (Stock Uds) *:</label>
            <input type="number" id="formStock" class="admin-input-text" value="${stock}" min="0" required>
          </div>
        </div>

        <div class="admin-form-grid-2">
          <div class="admin-form-group">
            <label>Precio Individual de Venta ($ COP) *:</label>
            <input type="number" id="formPrice" class="admin-input-text" value="${price}" min="0" required>
          </div>
          <div class="admin-form-group">
            <label>Precio Promo 2 Unidades ($ COP):</label>
            <input type="number" id="formPriceTwo" class="admin-input-text" value="${priceTwo}" min="0" placeholder="Opcional">
          </div>
        </div>

        <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px dashed var(--border-color); margin-bottom: 14px;">
          <div class="admin-section-subtitle">📦 Precios Mayoristas Flexibles ($ c/u según volumen):</div>
          <div class="admin-ws-tiers-grid">
            <div class="admin-input-group">
              <label>5 - 9 uds:</label>
              <input type="number" id="formWs5" class="admin-input-num" value="${wp['5'] || 0}" min="0">
            </div>
            <div class="admin-input-group">
              <label>10 - 19 uds:</label>
              <input type="number" id="formWs10" class="admin-input-num" value="${wp['10'] || 0}" min="0">
            </div>
            <div class="admin-input-group">
              <label>20 - 49 uds:</label>
              <input type="number" id="formWs20" class="admin-input-num" value="${wp['20'] || 0}" min="0">
            </div>
            <div class="admin-input-group">
              <label>50 - 99 uds:</label>
              <input type="number" id="formWs50" class="admin-input-num" value="${wp['50'] || 0}" min="0">
            </div>
            <div class="admin-input-group">
              <label>100+ uds:</label>
              <input type="number" id="formWs100" class="admin-input-num" value="${wp['100'] || 0}" min="0">
            </div>
          </div>
        </div>

        <div class="admin-form-group">
          <label>URL o Ruta de la Imagen Principal:</label>
          <input type="text" id="formImageUrl" class="admin-input-text" value="${imageUrl}" placeholder="ej: REIGN BAR PALETTE/b-4.webp o https://...">
        </div>

        <div class="admin-form-group">
          <label>Subtítulo Comercial:</label>
          <input type="text" id="formSubtitulo" class="admin-input-text" value="${subtitulo}" placeholder="ej: 50.000 Puffs • 1200 mAh • Sistema Dual">
        </div>

        <div class="admin-form-group">
          <label>Descripción Completa:</label>
          <textarea id="formDescription" class="admin-form-textarea" placeholder="Descripción atractiva del producto...">${description}</textarea>
        </div>

        <div class="admin-form-group">
          <label>Sabores / Variantes (separados por coma):</label>
          <input type="text" id="formFlavors" class="admin-input-text" value="${flavorsStr}" placeholder="ej: Menta Helada, Fresa Kiwi, Frambuesa Azul">
        </div>

        <div class="admin-form-group">
          <label>Motivo del Cambio (para el historial de auditoría):</label>
          <input type="text" id="formReason" class="admin-input-text" placeholder="ej: Ajuste por nueva temporada / reposición de stock">
        </div>

        <div class="admin-form-group">
          <label class="admin-checkbox-label">
            <input type="checkbox" id="formIsFeatured" ${isFeatured ? 'checked' : ''}>
            ⭐ Destacar este producto en el catálogo (Recomendado)
          </label>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px;">
          <button type="button" class="btn-admin-secondary" onclick="AdminService.closeProductModal()">
            Cancelar
          </button>
          <button type="submit" class="btn-admin-create-prod" style="padding: 10px 24px;">
            💾 Guardar Producto
          </button>
        </div>
      </form>
    `;

    modal.style.display = 'flex';
  },

  closeProductModal() {
    const modal = document.getElementById('adminProductModal');
    if (modal) modal.style.display = 'none';
    this.activeEditingProductId = null;
  },

  async saveProductForm(event) {
    if (event) event.preventDefault();

    const isEdit = document.getElementById('formIsEdit').value === 'true';
    const prodId = document.getElementById('formProductId').value;
    const name = document.getElementById('formName').value.trim();
    const brand = document.getElementById('formBrand').value.trim();
    const category = document.getElementById('formCategory').value;
    const status = document.getElementById('formStatus').value;
    const stock = Number(document.getElementById('formStock').value) || 0;
    const price = Number(document.getElementById('formPrice').value) || 0;
    const priceTwoVal = document.getElementById('formPriceTwo').value;
    const priceTwo = priceTwoVal !== '' ? Number(priceTwoVal) : null;
    const imageUrl = document.getElementById('formImageUrl').value.trim();
    const subtitulo = document.getElementById('formSubtitulo').value.trim();
    const description = document.getElementById('formDescription').value.trim();
    const flavorsRaw = document.getElementById('formFlavors').value.trim();
    const reason = document.getElementById('formReason').value.trim() || (isEdit ? 'Actualización desde panel administrativo' : 'Creación de producto');
    const isFeatured = document.getElementById('formIsFeatured').checked;

    const wp = {
      "5": Number(document.getElementById('formWs5').value) || Math.round(price * 0.75),
      "10": Number(document.getElementById('formWs10').value) || Math.round(price * 0.60),
      "20": Number(document.getElementById('formWs20').value) || Math.round(price * 0.55),
      "50": Number(document.getElementById('formWs50').value) || Math.round(price * 0.50),
      "100": Number(document.getElementById('formWs100').value) || Math.round(price * 0.45)
    };

    // Procesar sabores
    let sabores = [];
    if (flavorsRaw) {
      sabores = flavorsRaw.split(',').map(s => s.trim()).filter(Boolean).map(sName => ({
        nombre: sName,
        img: imageUrl || '',
        agotado: false
      }));
    }

    try {
      if (typeof DBService !== 'undefined') {
        if (isEdit && prodId) {
          await DBService.updateProduct(prodId, {
            name,
            brand,
            category,
            status,
            stock,
            price,
            price_two_units: priceTwo,
            wholesale_prices: wp,
            image_url: imageUrl,
            subtitulo,
            description,
            is_featured: isFeatured,
            sabores: sabores.length > 0 ? sabores : undefined
          }, 'Administrador', reason);
        } else {
          await DBService.createProduct({
            name,
            brand,
            category,
            status,
            stock,
            price,
            price_two_units: priceTwo,
            wholesale_prices: wp,
            image_url: imageUrl,
            subtitulo,
            description,
            is_featured: isFeatured,
            sabores,
            change_reason: reason
          }, 'Administrador');
        }
      }

      this.closeProductModal();
      this.renderProductList();

      if (typeof Toast !== 'undefined') {
        Toast.show(isEdit ? '✓ ¡Producto actualizado con éxito!' : '✓ ¡Nuevo producto creado con éxito!', 'success');
      }

      // Re-renderizar catálogo público si está abierto en la misma ventana
      if (typeof CatalogController !== 'undefined' && CatalogController.renderCatalog) {
        CatalogController.renderCatalog();
      }
      if (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.renderCatalog) {
        WholesaleCatalog.renderCatalog();
      }
    } catch (err) {
      alert('Error al guardar el producto: ' + err.message);
    }
  },

  async saveAllChanges() {
    const saveBtn = document.getElementById('btnAdminSaveCloud');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Guardando en la nube...';
    }

    if (typeof DBService !== 'undefined') {
      DBService.saveToStorage();
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

  async resetDefaults() {
    if (confirm('⚠️ ¿Estás seguro de restablecer todos los precios y disponibilidades a los valores originales de fábrica?')) {
      if (typeof DBService !== 'undefined') {
        DBService.resetToDefaults();
      }
      if (typeof CloudSyncService !== 'undefined') {
        await CloudSyncService.resetToDefaults();
      }
      this.renderProductList();
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Catálogo y precios restablecidos a valores de fábrica.', 'info');
      }
    }
  },

  exportJSON() {
    let jsonStr = '';
    if (typeof DBService !== 'undefined') {
      jsonStr = DBService.exportJSON();
    } else {
      jsonStr = JSON.stringify(this.draftOverrides, null, 2);
    }

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        if (typeof Toast !== 'undefined') {
          Toast.show('✓ Base de datos copiada al portapapeles en formato JSON.', 'success');
        }
      }).catch(e => alert(jsonStr));
    } else {
      alert(jsonStr);
    }
  }
};

window.AdminService = AdminService;
document.addEventListener('DOMContentLoaded', () => {
  AdminService.init();
});
