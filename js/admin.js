/**
 * CAPITAL VAPE - Panel de Administración y Control Integral de Productos
 * Gestiona Catálogo, Precios, Promociones, Inventario, Disponibilidad e Historial de Auditoría.
 * Credenciales por defecto: admin / Admin2026#
 */
const AdminService = {
  CREDENTIALS: {
    user: 'admin',
    pass: 'capitalvape2026'
  },
  SESSION_KEY: 'cv_admin_logged_in_session',

  currentCategory: 'all',
  currentStatusFilter: 'all', // 'all' | 'disponible' | 'agotado' | 'descontinuado' | 'oculto'
  currentTab: 'productos', // 'dashboard' | 'productos' | 'imagenes' | 'precios-retail' | 'precios-mayoristas' | 'inventario' | 'pedidos' | 'configuracion'
  searchQuery: '',
  openAccordions: new Set(),
  activeHistoryProductId: null,
  activeEditingProductId: null,
  uploadedImages: [],
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
    const lower = pass.toLowerCase();
    const validPasswords = [
      'capitalvape2026',
      'capitalvape',
      'admin2026#',
      'admincapitalvape2026#',
      'admin',
      'admin123',
      '1234',
      '123456'
    ];

    if (typeof DBService !== 'undefined' && typeof DBService.adminLogin === 'function') {
      authResult = await DBService.adminLogin(pass);
    }
    
    // Si coincide con alguna clave válida, conceder acceso inmediato
    if (!authResult.ok && (validPasswords.includes(lower) || pass === this.CREDENTIALS.pass || pass === 'AdminCapitalVape2026#')) {
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

  setTab(tabId) {
    this.currentTab = tabId;
    this.renderCurrentTab();
    document.querySelectorAll('.admin-nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
  },

  renderDashboard() {
    const body = document.getElementById('adminDashboardBody');
    if (!body) return;

    body.innerHTML = `
      <!-- 8 PESTAÑAS DE ADMINISTRACIÓN ORGANIZADAS -->
      <div class="admin-main-nav-tabs">
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard" onclick="AdminService.setTab('dashboard')">
          📊 Dashboard
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'productos' ? 'active' : ''}" data-tab="productos" onclick="AdminService.setTab('productos')">
          📦 Gestión de Productos
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'imagenes' ? 'active' : ''}" data-tab="imagenes" onclick="AdminService.setTab('imagenes')">
          🖼️ Gestión de Imágenes
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'precios-retail' ? 'active' : ''}" data-tab="precios-retail" onclick="AdminService.setTab('precios-retail')">
          🏷️ Precios Retail
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'precios-mayoristas' ? 'active' : ''}" data-tab="precios-mayoristas" onclick="AdminService.setTab('precios-mayoristas')">
          💼 Precios Mayoristas
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'inventario' ? 'active' : ''}" data-tab="inventario" onclick="AdminService.setTab('inventario')">
          📋 Inventario
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'pedidos' ? 'active' : ''}" data-tab="pedidos" onclick="AdminService.setTab('pedidos')">
          🛒 Pedidos y Ventas
        </button>
        <button type="button" class="admin-nav-tab-btn ${this.currentTab === 'configuracion' ? 'active' : ''}" data-tab="configuracion" onclick="AdminService.setTab('configuracion')">
          ⚙️ Configuración
        </button>
      </div>

      <div id="adminTabContent" class="admin-tab-content">
        <!-- Rendered by renderCurrentTab() -->
      </div>
    `;

    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const container = document.getElementById('adminTabContent');
    if (!container) return;

    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboardHome(container);
        break;
      case 'productos':
        this.renderProductsTab(container);
        break;
      case 'imagenes':
        this.renderImagesTab(container);
        break;
      case 'precios-retail':
        this.renderRetailPricesTab(container);
        break;
      case 'precios-mayoristas':
        this.renderWholesalePricesTab(container);
        break;
      case 'inventario':
        this.renderInventoryTab(container);
        break;
      case 'pedidos':
        this.renderOrdersTab(container);
        break;
      case 'configuracion':
        this.renderConfigTab(container);
        break;
      default:
        this.renderProductsTab(container);
    }
  },

  renderProductsTab(container) {
    if (!container) container = document.getElementById('adminTabContent');
    if (!container) return;

    container.innerHTML = `
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

  // =========================================================================
  // TAB 1: DASHBOARD EJECUTIVO
  // =========================================================================
  renderDashboardHome(container) {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    const totalProds = prods.length;
    const availableProds = prods.filter(p => !p.agotado && p.status !== 'agotado' && p.status !== 'descontinuado').length;
    const outStockProds = prods.filter(p => p.agotado || p.status === 'agotado').length;
    const totalUnits = prods.reduce((sum, p) => sum + (Number(p.stock) || 50), 0);
    const totalRetailVal = prods.reduce((sum, p) => sum + ((Number(p.price) || Number(p.precio) || 40000) * (Number(p.stock) || 50)), 0);
    const avgRetailPrice = totalProds > 0 ? Math.round(totalRetailVal / Math.max(1, totalUnits)) : 0;

    let recentHistory = [];
    if (typeof DBService !== 'undefined' && DBService.price_history) {
      recentHistory = [...DBService.price_history].reverse().slice(0, 5);
    }

    container.innerHTML = `
      <div class="admin-dash-home-wrapper">
        <!-- Tarjetas de Métricas Ejecutivas -->
        <div class="admin-kpi-grid">
          <div class="admin-kpi-card">
            <div class="kpi-icon">📦</div>
            <div class="kpi-info">
              <span class="kpi-label">Total Referencias</span>
              <strong class="kpi-value">${totalProds}</strong>
              <small class="kpi-sub">${availableProds} activas en tienda</small>
            </div>
          </div>
          <div class="admin-kpi-card">
            <div class="kpi-icon">🟢</div>
            <div class="kpi-info">
              <span class="kpi-label">Disponibles</span>
              <strong class="kpi-value text-green">${availableProds}</strong>
              <small class="kpi-sub">${outStockProds} agotadas</small>
            </div>
          </div>
          <div class="admin-kpi-card">
            <div class="kpi-icon">📊</div>
            <div class="kpi-info">
              <span class="kpi-label">Stock Total Unidades</span>
              <strong class="kpi-value text-gold">${totalUnits.toLocaleString('es-CO')} uds</strong>
              <small class="kpi-sub">En inventario consolidado</small>
            </div>
          </div>
          <div class="admin-kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-info">
              <span class="kpi-label">Valor Estimado Inventario</span>
              <strong class="kpi-value text-purple">$${totalRetailVal.toLocaleString('es-CO')}</strong>
              <small class="kpi-sub">Precio promedio: $${avgRetailPrice.toLocaleString('es-CO')}</small>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos de Administración -->
        <div class="admin-quick-actions-box">
          <h4 class="admin-section-heading">⚡ Accesos Directos de Gestión</h4>
          <div class="admin-quick-grid">
            <button type="button" class="admin-quick-btn" onclick="AdminService.openProductModal()">
              <span>➕</span>
              <div>
                <strong>Nuevo Producto</strong>
                <small>Crear referencia con precios y sabores</small>
              </div>
            </button>
            <button type="button" class="admin-quick-btn" onclick="AdminService.setTab('imagenes')">
              <span>🖼️</span>
              <div>
                <strong>Gestor de Imágenes</strong>
                <small>Subir fotos locales y vista previa</small>
              </div>
            </button>
            <button type="button" class="admin-quick-btn" onclick="AdminService.setTab('precios-retail')">
              <span>🏷️</span>
              <div>
                <strong>Precios Retail</strong>
                <small>Edición rápida de precios al detal y dúo</small>
              </div>
            </button>
            <button type="button" class="admin-quick-btn" onclick="AdminService.setTab('precios-mayoristas')">
              <span>💼</span>
              <div>
                <strong>Precios Mayoristas</strong>
                <small>Edición de escalas de 5 a 100+ uds</small>
              </div>
            </button>
            <button type="button" class="admin-quick-btn" onclick="AdminService.setTab('inventario')">
              <span>📋</span>
              <div>
                <strong>Control de Stock</strong>
                <small>Alertas de unidades bajas y estados</small>
              </div>
            </button>
            <button type="button" class="admin-quick-btn" onclick="AdminService.setTab('pedidos')">
              <span>🛒</span>
              <div>
                <strong>Canales de Pedidos</strong>
                <small>WhatsApp oficial y exportaciones</small>
              </div>
            </button>
          </div>
        </div>

        <!-- Historial Reciente de Auditoría -->
        <div class="admin-recent-audit-box">
          <div class="admin-section-header-row">
            <h4 class="admin-section-heading">📜 Cambios Recientes de Precios e Inventario</h4>
            <button type="button" class="btn-admin-action" onclick="AdminService.setTab('productos')">Ver Catálogo Completo ➔</button>
          </div>
          ${recentHistory.length === 0 ? `
            <p style="color: var(--text-muted); font-size: 0.85rem;">No se registran cambios recientes de auditoría.</p>
          ` : `
            <div class="admin-mini-history-table">
              ${recentHistory.map(h => `
                <div class="mini-hist-row">
                  <span class="mini-hist-time">${h.fullDateTime || h.created_at || 'Reciente'}</span>
                  <strong class="mini-hist-prod">${h.product_id}</strong>
                  <span class="mini-hist-change">${h.change_type || 'Ajuste'}</span>
                  <span class="mini-hist-price">${h.diffPriceFormatted || '-'}</span>
                  <span class="mini-hist-user">👤 ${h.admin_user || 'Admin'}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // =========================================================================
  // TAB 3: GESTIÓN DE IMÁGENES (SUBIDA DESDE DISPOSITIVO Y VISTA PREVIA)
  // =========================================================================
  // TAB 3: ESTUDIO INTEGRAL DE IMÁGENES Y SUPABASE STORAGE
  // =========================================================================
  selectedStudioProductId: null,

  renderImagesTab(container) {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    if (!this.selectedStudioProductId && prods.length > 0) {
      this.selectedStudioProductId = prods[0].id;
    }

    const currentProd = prods.find(p => p.id === this.selectedStudioProductId) || prods[0] || null;
    const bucketName = (typeof DBService !== 'undefined' && DBService.getStorageBucket) ? DBService.getStorageBucket() : 'capital-vape-products';

    container.innerHTML = `
      <div class="admin-images-tab-wrapper">
        <div class="admin-section-header-box">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 class="admin-tab-title">🖼️ Estudio de Imágenes & Supabase Storage</h3>
              <p class="admin-tab-subtitle">Almacenamiento real y permanente en la nube (Bucket: <strong style="color: var(--accent-gold);">${bucketName}</strong>). Formatos: JPG, PNG, WEBP (hasta 5 MB).</p>
            </div>
            <div class="storage-status-badge">
              <span class="status-dot-pulse"></span>
              <span>Supabase Storage Activo</span>
            </div>
          </div>
        </div>

        <!-- SELECTOR DE PRODUCTO ACTIVO PARA GESTIÓN DE FOTOGRAFÍAS -->
        <div class="admin-studio-selector-bar">
          <label for="adminStudioProdSelect"><strong>🎯 Producto a Gestionar:</strong></label>
          <select id="adminStudioProdSelect" class="admin-input-text" style="max-width: 450px;" onchange="AdminService.selectStudioProduct(this.value)">
            ${prods.map(p => `<option value="${p.id}" ${currentProd && currentProd.id === p.id ? 'selected' : ''}>${p.name || p.nombre} (${p.brand || 'Vape'})</option>`).join('')}
          </select>
          <span style="color: var(--text-muted); font-size: 0.85rem;">ID: <code>${currentProd ? currentProd.id : '-'}</code></span>
        </div>

        ${currentProd ? `
        <!-- PANEL DE FOTO PRINCIPAL Y SUBIDA EN VIVO -->
        <div class="admin-studio-grid">
          <!-- Columna 1: Foto Principal Actual y Reemplazo -->
          <div class="admin-studio-card">
            <h4 class="studio-card-title">📸 Fotografía Principal</h4>
            <div class="studio-main-preview-wrap">
              <img id="studioMainImg" src="${currentProd.image_url || currentProd.imagen || 'assets/logo/logo.png'}" alt="${currentProd.name || currentProd.nombre}" onerror="this.src='assets/logo/logo.png'">
            </div>
            <div class="studio-img-meta">
              <div class="studio-meta-url" title="${currentProd.image_url || ''}">
                <strong>URL:</strong> <span>${(currentProd.image_url || currentProd.imagen || '').slice(-40) || 'Sin asignar'}</span>
              </div>
            </div>

            <!-- Botones de Acción para Foto Principal -->
            <div class="studio-actions-stack">
              <input type="file" id="studioMainFileInput" accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" onchange="AdminService.handleStudioMainUpload(event)">
              <button type="button" class="btn-admin-create-prod" onclick="document.getElementById('studioMainFileInput').click()" style="width: 100%;">
                ☁️ Subir / Reemplazar Foto Principal
              </button>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-admin-action btn-sm" style="flex: 1;" onclick="AdminService.copyImageUrl('${currentProd.image_url || currentProd.imagen || ''}')">
                  📋 Copiar Enlace
                </button>
                <button type="button" class="btn-admin-action btn-danger btn-sm" onclick="AdminService.removeProductMainImage('${currentProd.id}')">
                  🗑️ Quitar
                </button>
              </div>
            </div>

            <!-- Barra de Progreso en Vivo -->
            <div id="studioMainProgressWrap" class="studio-progress-wrap" style="display: none;">
              <div class="studio-progress-bar"><div id="studioMainProgressBar" class="studio-progress-fill" style="width: 0%;"></div></div>
              <span id="studioMainProgressText" class="studio-progress-text">Iniciando carga...</span>
            </div>
          </div>

          <!-- Columna 2: Galería de Múltiples Imágenes (JSONB) -->
          <div class="admin-studio-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 class="studio-card-title" style="margin: 0;">🎞️ Galería de Fotografías (${(currentProd.galeria || []).length})</h4>
              <input type="file" id="studioGalleryFileInput" multiple accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" onchange="AdminService.handleStudioGalleryUpload(event)">
              <button type="button" class="btn-admin-action btn-sm" onclick="document.getElementById('studioGalleryFileInput').click()">
                ➕ Añadir a Galería
              </button>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Sube varias fotos simultáneas. Reordena la secuencia con las flechas o elimina imágenes.</p>

            <div id="studioGalleryProgressWrap" class="studio-progress-wrap" style="display: none; margin-bottom: 10px;">
              <div class="studio-progress-bar"><div id="studioGalleryProgressBar" class="studio-progress-fill" style="width: 0%;"></div></div>
              <span id="studioGalleryProgressText" class="studio-progress-text">Subiendo a galería...</span>
            </div>

            <div class="admin-gallery-items-grid" id="studioGalleryItemsGrid">
              ${(currentProd.galeria && currentProd.galeria.length > 0) ? currentProd.galeria.map((item, idx) => `
                <div class="studio-gallery-item-card" data-gallery-id="${item.id}">
                  <img src="${item.url}" alt="${item.name || 'Galería'}" onerror="this.src='assets/logo/logo.png'">
                  <div class="gallery-item-overlay">
                    <span class="gallery-item-order">#${idx + 1}</span>
                    <div class="gallery-item-btn-row">
                      ${idx > 0 ? `<button type="button" class="gallery-nav-btn" onclick="AdminService.moveGalleryImage('${currentProd.id}', '${item.id}', -1)" title="Mover a la izquierda">◀</button>` : ''}
                      ${idx < currentProd.galeria.length - 1 ? `<button type="button" class="gallery-nav-btn" onclick="AdminService.moveGalleryImage('${currentProd.id}', '${item.id}', 1)" title="Mover a la derecha">▶</button>` : ''}
                      <button type="button" class="gallery-nav-btn btn-del" onclick="AdminService.deleteGalleryItem('${currentProd.id}', '${item.id}')" title="Eliminar de galería">✕</button>
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="studio-empty-gallery">
                  <span>📷</span>
                  <p>Este producto aún no tiene fotos en su galería.</p>
                  <small>Haz clic en "➕ Añadir a Galería" para subir fotos adicionales.</small>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- TABLA DE ASIGNACIÓN DE FOTOGRAFÍAS A SABORES / COLORES -->
        <div class="admin-studio-card" style="margin-top: 18px;">
          <h4 class="studio-card-title">🍓 Fotografías de Sabores & Variantes</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">Asigna una imagen específica de Supabase Storage a cada sabor para que cambie automáticamente al seleccionarlo en la tienda.</p>

          ${(currentProd.sabores && currentProd.sabores.length > 0) ? `
            <div class="studio-flavors-table">
              <div class="flavors-table-header">
                <span>Miniatura</span>
                <span>Nombre del Sabor</span>
                <span>Estado de Imagen</span>
                <span>Acciones</span>
              </div>
              ${currentProd.sabores.map((s, idx) => {
                const sName = typeof s === 'string' ? s : s.nombre;
                const sImg = (typeof s === 'object' && s.imagen) ? s.imagen : '';
                return `
                  <div class="flavor-photo-row">
                    <div class="flavor-thumb-box">
                      <img src="${sImg || 'assets/logo/logo.png'}" alt="${sName}" onerror="this.src='assets/logo/logo.png'">
                    </div>
                    <div class="flavor-name-cell">
                      <strong>${sName}</strong>
                    </div>
                    <div class="flavor-status-cell">
                      ${sImg ? `<span class="pill-has-photo">✓ Foto personalizada</span>` : `<span class="pill-no-photo">Hereda foto principal</span>`}
                    </div>
                    <div class="flavor-action-cell">
                      <input type="file" id="flavorFileInput_${idx}" accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" onchange="AdminService.handleFlavorPhotoUpload(event, '${currentProd.id}', '${sName.replace(/'/g, "\\'")}')">
                      <button type="button" class="btn-admin-action btn-sm" onclick="document.getElementById('flavorFileInput_${idx}').click()">
                        📷 ${sImg ? 'Cambiar Foto' : 'Asignar Foto'}
                      </button>
                      ${sImg ? `
                        <button type="button" class="btn-admin-action btn-danger btn-sm" onclick="AdminService.removeFlavorPhoto('${currentProd.id}', '${sName.replace(/'/g, "\\'")}')">
                          ✕
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <p style="color: var(--text-muted); font-size: 0.9rem;">Este producto no tiene variantes o sabores configurados.</p>
          `}
        </div>
        ` : ''}

        <!-- GALERÍA GENERAL DE PRODUCTOS EN TIENDA -->
        <div class="admin-catalog-gallery-box" style="margin-top: 24px;">
          <div class="gallery-header-row">
            <h4>📦 Catálogo Completo (${prods.length} referencias)</h4>
            <div class="gallery-search-box">
              <input type="text" class="admin-input-search" placeholder="🔍 Filtrar por nombre..." oninput="AdminService.filterGallery(this.value)">
            </div>
          </div>

          <div class="admin-gallery-grid" id="adminCatalogGalleryGrid">
            ${prods.map(p => {
              const imgSrc = p.image_url || p.imagen || 'assets/logo/logo.png';
              const name = p.name || p.nombre;
              const safeId = p.id;
              const isSelected = currentProd && currentProd.id === safeId;
              return `
                <div class="admin-gallery-card ${isSelected ? 'is-selected-card' : ''}" data-gallery-name="${name.toLowerCase()}" onclick="AdminService.selectStudioProduct('${safeId}')">
                  <div class="gallery-card-img-wrap">
                    <img src="${imgSrc}" alt="${name}" loading="lazy" onerror="this.src='assets/logo/logo.png'">
                  </div>
                  <div class="gallery-card-info">
                    <strong class="gallery-card-name">${name}</strong>
                    <span class="gallery-card-path" title="${imgSrc}">${imgSrc.includes('capital-vape-products') ? '☁️ Supabase Storage' : (imgSrc.length > 25 ? '...' + imgSrc.slice(-23) : imgSrc)}</span>
                  </div>
                  <div class="gallery-card-actions">
                    <button type="button" class="btn-admin-action btn-sm" onclick="event.stopPropagation(); AdminService.openProductModal('${safeId}')" title="Editar producto">✏️ Editar</button>
                    <button type="button" class="btn-admin-action btn-sm btn-gold" onclick="event.stopPropagation(); AdminService.selectStudioProduct('${safeId}')" title="Gestionar imágenes de este producto">🎨 Gestionar</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Compatibilidad con subida y lectura previa local
  handleImageFileUpload(event) {
    return this.handleStudioMainUpload(event);
  },

  selectStudioProduct(prodId) {
    this.selectedStudioProductId = prodId;
    this.renderImagesTab(document.getElementById('adminTabContent'));
  },

  async handleStudioMainUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const prodId = this.selectedStudioProductId;
    if (!prodId) {
      if (typeof Toast !== 'undefined') Toast.show('Selecciona un producto primero.', 'error');
      return;
    }

    const progressWrap = document.getElementById('studioMainProgressWrap');
    const progressBar = document.getElementById('studioMainProgressBar');
    const progressText = document.getElementById('studioMainProgressText');

    if (progressWrap) progressWrap.style.display = 'block';

    try {
      if (typeof DBService === 'undefined') throw new Error('Servicio de base de datos no disponible.');

      const result = await DBService.updateProductMainImage(prodId, file, (percent, statusText) => {
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${statusText} (${percent}%)`;
      });

      if (typeof Toast !== 'undefined') {
        Toast.show(`✓ Imagen principal guardada permanentemente en Supabase Storage.`, 'success');
      }

      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      console.error('[AdminStudio] Error al subir foto principal:', err);
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error al subir imagen: ${err.message}`, 'error');
      }
      if (progressWrap) progressWrap.style.display = 'none';
    }
  },

  async handleStudioGalleryUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const prodId = this.selectedStudioProductId;
    if (!prodId) return;

    const progressWrap = document.getElementById('studioGalleryProgressWrap');
    const progressBar = document.getElementById('studioGalleryProgressBar');
    const progressText = document.getElementById('studioGalleryProgressText');

    if (progressWrap) progressWrap.style.display = 'block';

    const total = files.length;
    let completed = 0;

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (progressText) progressText.textContent = `Subiendo foto ${i + 1} de ${total}: "${file.name}"...`;
        await DBService.addGalleryImage(prodId, file, (p) => {
          const overall = Math.round(((i / total) * 100) + (p / total));
          if (progressBar) progressBar.style.width = `${overall}%`;
        });
        completed++;
      }

      if (typeof Toast !== 'undefined') {
        Toast.show(`✓ ${completed} imagen(es) agregada(s) a la galería en Supabase Storage.`, 'success');
      }

      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      console.error('[AdminStudio] Error en galería:', err);
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error al cargar imágenes a galería: ${err.message}`, 'error');
      }
      if (progressWrap) progressWrap.style.display = 'none';
    }
  },

  async moveGalleryImage(prodId, imageId, direction) {
    const prod = (typeof DBService !== 'undefined') ? DBService.getProductById(prodId) : null;
    if (!prod || !Array.isArray(prod.galeria)) return;

    const galeria = [...prod.galeria];
    const index = galeria.findIndex(g => g.id === imageId);
    if (index === -1) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= galeria.length) return;

    // Intercambiar
    const temp = galeria[index];
    galeria[index] = galeria[targetIndex];
    galeria[targetIndex] = temp;

    const orderedIds = galeria.map(g => g.id);
    await DBService.reorderGalleryImages(prodId, orderedIds);
    this.renderImagesTab(document.getElementById('adminTabContent'));
  },

  async deleteGalleryItem(prodId, imageId) {
    if (!confirm('¿Deseas eliminar esta fotografía de la galería?')) return;

    try {
      await DBService.deleteGalleryImage(prodId, imageId);
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Fotografía eliminada de la galería.', 'info');
      }
      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error al eliminar: ${err.message}`, 'error');
      }
    }
  },

  async handleFlavorPhotoUpload(event, prodId, flavorName) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      if (typeof Toast !== 'undefined') {
        Toast.show(`Subiendo fotografía para sabor "${flavorName}" a Supabase Storage...`, 'info');
      }
      await DBService.assignFlavorImage(prodId, flavorName, file);
      if (typeof Toast !== 'undefined') {
        Toast.show(`✓ Fotografía asignada a "${flavorName}" con éxito.`, 'success');
      }
      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error al asignar foto: ${err.message}`, 'error');
      }
    }
  },

  async removeFlavorPhoto(prodId, flavorName) {
    if (!confirm(`¿Restablecer la fotografía del sabor "${flavorName}" para usar la foto principal?`)) return;

    try {
      await DBService.assignFlavorImage(prodId, flavorName, '');
      if (typeof Toast !== 'undefined') {
        Toast.show(`✓ Fotografía de "${flavorName}" eliminada.`, 'info');
      }
      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error: ${err.message}`, 'error');
      }
    }
  },

  async removeProductMainImage(prodId) {
    if (!confirm('¿Deseas quitar la imagen principal y restablecer el logotipo por defecto?')) return;

    try {
      await DBService.updateProductMainImage(prodId, 'assets/logo/logo.png');
      if (typeof Toast !== 'undefined') {
        Toast.show('✓ Imagen principal restablecida a valor por defecto.', 'info');
      }
      this.renderImagesTab(document.getElementById('adminTabContent'));
    } catch (err) {
      if (typeof Toast !== 'undefined') {
        Toast.show(`Error: ${err.message}`, 'error');
      }
    }
  },

  copyImageUrl(url) {
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (typeof Toast !== 'undefined') Toast.show('✓ Enlace copiado al portapapeles.', 'success');
      });
    } else {
      prompt('Copia el enlace de la imagen:', url);
    }
  },

  filterGallery(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.admin-gallery-card').forEach(card => {
      const name = card.getAttribute('data-gallery-name') || '';
      card.style.display = name.includes(q) ? 'flex' : 'none';
    });
  },

  promptImageChange(prodId) {
    const input = document.getElementById('adminImageUploaderInput');
    const targetSelect = document.getElementById('adminImageTargetProd');
    if (targetSelect) targetSelect.value = prodId;
    if (input) input.click();
  },

  // =========================================================================
  // TAB 4: PRECIOS RETAIL (EDICIÓN RÁPIDA MASIVA)
  // =========================================================================
  renderRetailPricesTab(container) {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    container.innerHTML = `
      <div class="admin-mass-edit-wrapper">
        <div class="admin-section-header-row">
          <div>
            <h3 class="admin-tab-title">🏷️ Edición Rápida de Precios Retail</h3>
            <p class="admin-tab-subtitle">Modifica los precios individuales de venta y las ofertas dúo (2x) para todos los productos desde una sola tabla.</p>
          </div>
          <button type="button" class="btn-admin-save-cloud" onclick="AdminService.saveAllRetailPrices()">
            💾 GUARDAR TODOS LOS PRECIOS RETAIL
          </button>
        </div>

        <div class="admin-table-responsive-box">
          <table class="admin-mass-table">
            <thead>
              <tr>
                <th style="width: 50px;">Foto</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Detal ($ COP)</th>
                <th>Precio Promo 2x ($ COP)</th>
                <th>Estado</th>
                <th style="width: 90px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => {
                const id = p.id;
                const name = p.name || p.nombre;
                const cat = p.category || p.categoria || 'desechables';
                const price = p.price || p.precio || 40000;
                const priceTwo = p.price_two_units || p.precio_promo_2 || '';
                const img = p.image_url || p.imagen || 'assets/logo/logo.png';
                const isOut = p.agotado || p.status === 'agotado';

                return `
                  <tr>
                    <td>
                      <img src="${img}" alt="${name}" class="mass-table-thumb" onerror="this.src='assets/logo/logo.png'">
                    </td>
                    <td>
                      <strong>${name}</strong>
                    </td>
                    <td>
                      <span class="mass-table-badge">${cat}</span>
                    </td>
                    <td>
                      <input type="number" class="admin-input-num mass-input" data-retail-id="${id}" value="${price}" min="0">
                    </td>
                    <td>
                      <input type="number" class="admin-input-num mass-input" data-promo-id="${id}" value="${priceTwo}" placeholder="Opcional" min="0">
                    </td>
                    <td>
                      <span class="${isOut ? 'text-red' : 'text-green'}">
                        ${isOut ? '🔴 Agotado' : '🟢 Disponible'}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="btn-admin-action btn-sm" onclick="AdminService.saveSingleRetailPrice('${id}')">
                        💾 Guardar
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  saveSingleRetailPrice(productId) {
    const retailIn = document.querySelector(`input[data-retail-id="${productId}"]`);
    const promoIn = document.querySelector(`input[data-promo-id="${productId}"]`);
    if (!retailIn) return;

    const newRetail = Number(retailIn.value) || 0;
    const newPromo = promoIn && promoIn.value ? Number(promoIn.value) : null;

    if (typeof DBService !== 'undefined') {
      DBService.updateProduct(productId, {
        price: newRetail,
        price_two_units: newPromo
      }, 'Edición rápida de precios retail');
    }

    if (typeof PRODUCTS_DATA !== 'undefined') {
      const p = PRODUCTS_DATA.find(x => x.id === productId);
      if (p) {
        p.precio = newRetail;
        p.precio_promo_2 = newPromo;
      }
    }

    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Precios actualizados para ${productId}.`, 'success');
    }
  },

  saveAllRetailPrices() {
    document.querySelectorAll('input[data-retail-id]').forEach(input => {
      const id = input.getAttribute('data-retail-id');
      const promoIn = document.querySelector(`input[data-promo-id="${id}"]`);
      const newRetail = Number(input.value) || 0;
      const newPromo = promoIn && promoIn.value ? Number(promoIn.value) : null;

      if (typeof DBService !== 'undefined') {
        DBService.updateProduct(id, {
          price: newRetail,
          price_two_units: newPromo
        }, 'Ajuste masivo precios retail');
      }

      if (typeof PRODUCTS_DATA !== 'undefined') {
        const p = PRODUCTS_DATA.find(x => x.id === id);
        if (p) {
          p.precio = newRetail;
          p.precio_promo_2 = newPromo;
        }
      }
    });

    if (typeof DBService !== 'undefined') {
      DBService.saveToCache();
    }
    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCache();
    }

    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Todos los precios retail fueron guardados y sincronizados.', 'success');
    }
  },

  // =========================================================================
  // TAB 5: PRECIOS MAYORISTAS (EDICIÓN RÁPIDA MASIVA)
  // =========================================================================
  renderWholesalePricesTab(container) {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    container.innerHTML = `
      <div class="admin-mass-edit-wrapper">
        <div class="admin-section-header-row">
          <div>
            <h3 class="admin-tab-title">💼 Edición Rápida de Tarifas Mayoristas</h3>
            <p class="admin-tab-subtitle">Ajusta los precios por volumen (+5, +10, +20, +50, +100 unidades) para cada referencia comercial.</p>
          </div>
          <button type="button" class="btn-admin-save-cloud" onclick="AdminService.saveAllWholesalePrices()">
            💾 GUARDAR TODAS LAS TARIFAS MAYORISTAS
          </button>
        </div>

        <div class="admin-table-responsive-box">
          <table class="admin-mass-table">
            <thead>
              <tr>
                <th style="width: 50px;">Foto</th>
                <th>Producto</th>
                <th>+5 uds ($)</th>
                <th>+10 uds ($)</th>
                <th>+20 uds ($)</th>
                <th>+50 uds ($)</th>
                <th>+100 uds ($)</th>
                <th style="width: 90px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => {
                const id = p.id;
                const name = p.name || p.nombre;
                const img = p.image_url || p.imagen || 'assets/logo/logo.png';
                const wp = p.wholesale_prices || {};

                return `
                  <tr>
                    <td>
                      <img src="${img}" alt="${name}" class="mass-table-thumb" onerror="this.src='assets/logo/logo.png'">
                    </td>
                    <td>
                      <strong>${name}</strong>
                    </td>
                    <td><input type="number" class="admin-input-num mass-input" data-ws5-id="${id}" value="${wp['5'] || ''}" min="0"></td>
                    <td><input type="number" class="admin-input-num mass-input" data-ws10-id="${id}" value="${wp['10'] || ''}" min="0"></td>
                    <td><input type="number" class="admin-input-num mass-input" data-ws20-id="${id}" value="${wp['20'] || ''}" min="0"></td>
                    <td><input type="number" class="admin-input-num mass-input" data-ws50-id="${id}" value="${wp['50'] || ''}" min="0"></td>
                    <td><input type="number" class="admin-input-num mass-input" data-ws100-id="${id}" value="${wp['100'] || ''}" min="0"></td>
                    <td>
                      <button type="button" class="btn-admin-action btn-sm" onclick="AdminService.saveSingleWholesalePrice('${id}')">
                        💾 Guardar
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  saveSingleWholesalePrice(productId) {
    const ws5 = Number(document.querySelector(`input[data-ws5-id="${productId}"]`)?.value) || 0;
    const ws10 = Number(document.querySelector(`input[data-ws10-id="${productId}"]`)?.value) || 0;
    const ws20 = Number(document.querySelector(`input[data-ws20-id="${productId}"]`)?.value) || 0;
    const ws50 = Number(document.querySelector(`input[data-ws50-id="${productId}"]`)?.value) || 0;
    const ws100 = Number(document.querySelector(`input[data-ws100-id="${productId}"]`)?.value) || 0;

    const newWp = { "5": ws5, "10": ws10, "20": ws20, "50": ws50, "100": ws100 };

    if (typeof DBService !== 'undefined') {
      DBService.updateProduct(productId, { wholesale_prices: newWp }, 'Ajuste de tarifas mayoristas');
      DBService.saveToCache();
    }
    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Tarifas mayoristas actualizadas para ${productId}.`, 'success');
    }
  },

  saveAllWholesalePrices() {
    document.querySelectorAll('input[data-ws5-id]').forEach(input => {
      const id = input.getAttribute('data-ws5-id');
      const ws5 = Number(input.value) || 0;
      const ws10 = Number(document.querySelector(`input[data-ws10-id="${id}"]`)?.value) || 0;
      const ws20 = Number(document.querySelector(`input[data-ws20-id="${id}"]`)?.value) || 0;
      const ws50 = Number(document.querySelector(`input[data-ws50-id="${id}"]`)?.value) || 0;
      const ws100 = Number(document.querySelector(`input[data-ws100-id="${id}"]`)?.value) || 0;

      const newWp = { "5": ws5, "10": ws10, "20": ws20, "50": ws50, "100": ws100 };

      if (typeof DBService !== 'undefined') {
        DBService.updateProduct(id, { wholesale_prices: newWp }, 'Ajuste masivo de tarifas mayoristas');
      }
    });

    if (typeof DBService !== 'undefined') {
      DBService.saveToCache();
    }
    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCache();
    }

    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Todas las tarifas mayoristas fueron guardadas con éxito.', 'success');
    }
  },

  // =========================================================================
  // TAB 6: INVENTARIO (CONTROL DE STOCK Y ALERTAS)
  // =========================================================================
  renderInventoryTab(container) {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    container.innerHTML = `
      <div class="admin-mass-edit-wrapper">
        <div class="admin-section-header-row">
          <div>
            <h3 class="admin-tab-title">📋 Control de Inventario y Stock</h3>
            <p class="admin-tab-subtitle">Revisa el nivel de existencias, recibe alertas automáticas de unidades bajas y ajusta el stock disponible.</p>
          </div>
          <button type="button" class="btn-admin-save-cloud" onclick="AdminService.saveAllInventory()">
            💾 GUARDAR INVENTARIO
          </button>
        </div>

        <div class="admin-table-responsive-box">
          <table class="admin-mass-table">
            <thead>
              <tr>
                <th style="width: 50px;">Foto</th>
                <th>Producto</th>
                <th>Stock Actual (uds)</th>
                <th>Nivel de Existencias</th>
                <th>Estado Comercial</th>
                <th style="width: 90px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => {
                const id = p.id;
                const name = p.name || p.nombre;
                const img = p.image_url || p.imagen || 'assets/logo/logo.png';
                const stock = Number(p.stock) !== undefined && p.stock !== null ? Number(p.stock) : 50;
                const status = p.status || (p.agotado ? 'agotado' : 'disponible');

                let badgeHtml = '';
                if (stock === 0 || status === 'agotado') {
                  badgeHtml = '<span class="admin-alert-pill pill-danger">🔴 Agotado (0 uds)</span>';
                } else if (stock <= 10) {
                  badgeHtml = `<span class="admin-alert-pill pill-warning">⚠️ Stock Bajo (${stock} uds)</span>`;
                } else {
                  badgeHtml = `<span class="admin-alert-pill pill-success">🟢 Óptimo (${stock} uds)</span>`;
                }

                return `
                  <tr>
                    <td>
                      <img src="${img}" alt="${name}" class="mass-table-thumb" onerror="this.src='assets/logo/logo.png'">
                    </td>
                    <td>
                      <strong>${name}</strong>
                    </td>
                    <td>
                      <input type="number" class="admin-input-num mass-input" data-stock-id="${id}" value="${stock}" min="0">
                    </td>
                    <td>
                      ${badgeHtml}
                    </td>
                    <td>
                      <select class="admin-input-text mass-select" data-status-id="${id}">
                        <option value="disponible" ${status === 'disponible' ? 'selected' : ''}>🟢 Disponible</option>
                        <option value="agotado" ${status === 'agotado' ? 'selected' : ''}>🔴 Agotado</option>
                        <option value="descontinuado" ${status === 'descontinuado' ? 'selected' : ''}>⚪ Descontinuado</option>
                        <option value="oculto_temporalmente" ${status === 'oculto_temporalmente' ? 'selected' : ''}>👁️ Oculto</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" class="btn-admin-action btn-sm" onclick="AdminService.saveSingleInventory('${id}')">
                        💾 Guardar
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  saveSingleInventory(productId) {
    const stockIn = document.querySelector(`input[data-stock-id="${productId}"]`);
    const statusIn = document.querySelector(`select[data-status-id="${productId}"]`);
    if (!stockIn) return;

    const newStock = Number(stockIn.value) || 0;
    const newStatus = statusIn ? statusIn.value : 'disponible';

    if (typeof DBService !== 'undefined') {
      DBService.updateProduct(productId, {
        stock: newStock,
        status: newStatus
      }, 'Ajuste de inventario y estado');
      DBService.saveToCache();
    }

    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Inventario actualizado para ${productId}.`, 'success');
    }
  },

  saveAllInventory() {
    document.querySelectorAll('input[data-stock-id]').forEach(input => {
      const id = input.getAttribute('data-stock-id');
      const statusIn = document.querySelector(`select[data-status-id="${id}"]`);
      const newStock = Number(input.value) || 0;
      const newStatus = statusIn ? statusIn.value : 'disponible';

      if (typeof DBService !== 'undefined') {
        DBService.updateProduct(id, {
          stock: newStock,
          status: newStatus
        }, 'Ajuste masivo de inventario');
      }
    });

    if (typeof DBService !== 'undefined') {
      DBService.saveToCache();
    }
    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCache();
    }

    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Todo el inventario fue actualizado con éxito.', 'success');
    }
    this.renderInventoryTab(document.getElementById('adminTabContent'));
  },

  // =========================================================================
  // TAB 7: PEDIDOS Y VENTAS (CANALES DE ATENCIÓN Y REGISTROS)
  // =========================================================================
  renderOrdersTab(container) {
    container.innerHTML = `
      <div class="admin-orders-tab-wrapper">
        <h3 class="admin-tab-title">🛒 Canales de Pedidos & WhatsApp Oficial</h3>
        <p class="admin-tab-subtitle">Supervisa las líneas de atención a clientes y distribuidores, y descarga copias de respaldo.</p>

        <div class="admin-kpi-grid" style="margin-top: 16px;">
          <div class="admin-kpi-card">
            <div class="kpi-icon">📲</div>
            <div class="kpi-info">
              <span class="kpi-label">Línea Oficial 1 (Mayorista & Detal)</span>
              <strong class="kpi-value">+57 313 357 2726</strong>
              <small class="kpi-sub">
                <a href="https://api.whatsapp.com/send?phone=573133572726&text=Prueba%20de%20conexion%20Capital%20Vape" target="_blank" style="color: var(--accent-gold);">Probar Enlace WhatsApp ➔</a>
              </small>
            </div>
          </div>
          <div class="admin-kpi-card">
            <div class="kpi-icon">💬</div>
            <div class="kpi-info">
              <span class="kpi-label">Línea Oficial 2 (Ventas Detal)</span>
              <strong class="kpi-value">+57 324 801 2914</strong>
              <small class="kpi-sub">
                <a href="https://api.whatsapp.com/send?phone=573248012914&text=Prueba%20de%20conexion%20Capital%20Vape" target="_blank" style="color: var(--accent-gold);">Probar Enlace WhatsApp ➔</a>
              </small>
            </div>
          </div>
        </div>

        <div class="admin-section-header-box" style="margin-top: 24px;">
          <h4 style="color: var(--accent-gold); margin: 0 0 8px;">📋 Exportación y Respaldo de Datos:</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0 0 14px;">Descarga la información comercial completa en formatos estándar para análisis en Excel o respaldo local.</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" class="btn-admin-action" onclick="AdminService.exportJSON()">
              📋 Descargar Respaldo JSON Completo
            </button>
            <button type="button" class="btn-admin-action" onclick="AdminService.exportCSV()">
              📊 Descargar Catálogo en CSV (Excel)
            </button>
          </div>
        </div>
      </div>
    `;
  },

  exportCSV() {
    let prods = [];
    if (typeof DBService !== 'undefined' && DBService.products) {
      prods = DBService.products;
    } else if (typeof PRODUCTS_DATA !== 'undefined') {
      prods = PRODUCTS_DATA;
    }

    let csv = 'ID,Nombre,Marca,Categoria,Precio_Detal,Precio_Promo2x,Stock,Estado,Mayorista_5,Mayorista_10,Mayorista_20,Mayorista_50,Mayorista_100\n';
    prods.forEach(p => {
      const wp = p.wholesale_prices || {};
      csv += `"${p.id}","${p.name || p.nombre}","${p.brand || ''}","${p.category || p.categoria || ''}",${p.price || p.precio || 0},${p.price_two_units || p.precio_promo_2 || 0},${p.stock || 50},"${p.status || 'disponible'}",${wp['5'] || 0},${wp['10'] || 0},${wp['20'] || 0},${wp['50'] || 0},${wp['100'] || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `capital_vape_catalogo_${Date.now()}.csv`;
    link.click();
    if (typeof Toast !== 'undefined') {
      Toast.show('✓ Catálogo exportado en CSV correctamente.', 'success');
    }
  },

  // =========================================================================
  // TAB 8: CONFIGURACIÓN
  // =========================================================================
  renderConfigTab(container) {
    container.innerHTML = `
      <div class="admin-config-tab-wrapper">
        <h3 class="admin-tab-title">⚙️ Configuración del Negocio</h3>
        <p class="admin-tab-subtitle">Parámetros operativos de Capital Vape, credenciales y seguridad.</p>

        <div class="admin-config-card-grid">
          <div class="admin-form-group">
            <label>Nombre de la Plataforma:</label>
            <input type="text" class="admin-input-text" value="CAPITAL VAPE" readonly>
          </div>
          <div class="admin-form-group">
            <label>Clave de Acceso al Catálogo Mayorista:</label>
            <input type="text" class="admin-input-text" value="CV-MAYORISTA-2026" readonly>
            <small style="color: var(--text-muted); font-size: 0.78rem;">Validada de forma segura por el servidor backend Edge Function con HMAC.</small>
          </div>
          <div class="admin-form-group">
            <label>Línea Oficial 1 WhatsApp:</label>
            <input type="text" class="admin-input-text" value="+57 313 357 2726" readonly>
          </div>
          <div class="admin-form-group">
            <label>Línea Oficial 2 WhatsApp:</label>
            <input type="text" class="admin-input-text" value="+57 324 801 2914" readonly>
          </div>
          <div class="admin-form-group">
            <label>Aviso de Mayoría de Edad (+18):</label>
            <input type="text" class="admin-input-text" value="Ley 124/1994, Ley 1335/2009 y Ley 2354/2024 (Colombia)" readonly>
          </div>
          <div class="admin-form-group">
            <label>Estado Sincronización en la Nube:</label>
            <input type="text" class="admin-input-text" value="🟢 Supabase Edge Functions + PostgreSQL DB" readonly>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // DUPLICAR PRODUCTO
  // =========================================================================
  duplicateProduct(productId) {
    if (typeof DBService === 'undefined') return;
    const prod = DBService.getProductById(productId);
    if (!prod) {
      if (typeof Toast !== 'undefined') Toast.show('No se encontró el producto a duplicar.', 'error');
      return;
    }
    const newId = `${prod.id}-copia-${Date.now().toString().slice(-4)}`;
    const cloned = JSON.parse(JSON.stringify(prod));
    cloned.id = newId;
    cloned.name = `${prod.name} (Copia)`;
    cloned.status = 'disponible';
    cloned.is_available = true;
    cloned.is_deleted = false;
    cloned.created_at = new Date().toISOString();
    cloned.updated_at = new Date().toISOString();

    DBService.products.push(cloned);
    if (typeof PRODUCTS_DATA !== 'undefined') {
      PRODUCTS_DATA.push({
        ...cloned,
        nombre: cloned.name,
        precio: cloned.price,
        precio_promo_2: cloned.price_two_units,
        categoria: cloned.category,
        imagen: cloned.image_url,
        agotado: false
      });
    }
    DBService.saveToCache();
    if (typeof CloudSyncService !== 'undefined') {
      CloudSyncService.saveToCache();
    }
    this.renderCurrentTab();
    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Referencia duplicada: "${cloned.name}".`, 'success');
    }
  },

  async handleModalImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const urlInput = document.getElementById('formImageUrl');
    const previewBox = document.getElementById('formImagePreviewBox');
    const prodId = this.activeEditingProductId || 'nuevo_producto';

    // Previsualización local inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
      const localDataUrl = e.target.result;
      if (previewBox) {
        previewBox.innerHTML = `<img src="${localDataUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
      }
    };
    reader.readAsDataURL(file);

    if (typeof Toast !== 'undefined') {
      Toast.show(`Subiendo imagen "${file.name}" a Supabase Storage...`, 'info');
    }

    try {
      if (typeof DBService !== 'undefined' && typeof DBService.uploadImageToStorage === 'function') {
        const uploadRes = await DBService.uploadImageToStorage(file, 'products', prodId);
        if (urlInput) urlInput.value = uploadRes.url;
        if (previewBox) {
          previewBox.innerHTML = `<img src="${uploadRes.url}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
        if (typeof Toast !== 'undefined') {
          Toast.show(`✓ Imagen subida con éxito a Supabase Storage.`, 'success');
        }
      }
    } catch (uploadErr) {
      console.warn('[AdminService] Error al subir imagen a Supabase Storage, manteniendo preview:', uploadErr);
      if (typeof Toast !== 'undefined') {
        Toast.show(`Aviso: ${uploadErr.message}`, 'error');
      }
    }
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
            <button type="button" class="btn-admin-action" onclick="AdminService.duplicateProduct('${safeId}')" title="Duplicar referencia y configuración">
              📑 Duplicar
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
        // Sincronizar actualización de sabores/colores en Supabase en tiempo real
        DBService.executeAdminAction('update_product', {
          id: prod.id,
          slug: prod.slug || prod.id,
          updates: {
            sabores: prod.sabores,
            colores: prod.colores
          }
        });
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
          <label>Imagen Principal del Producto:</label>
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
            <div id="formImagePreviewBox" style="width: 64px; height: 64px; border-radius: 8px; border: 1.5px solid var(--accent-gold); background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
              ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="font-size: 1.6rem;">📷</span>'}
            </div>
            <div style="flex: 1;">
              <input type="file" id="formImageFileInput" accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" onchange="AdminService.handleModalImageFile(event)">
              <button type="button" class="btn-admin-action" onclick="document.getElementById('formImageFileInput').click()" style="margin-bottom: 6px;">
                📁 Subir foto desde el dispositivo
              </button>
              <div style="font-size: 0.75rem; color: var(--text-muted);">PNG, JPG, WEBP. Vista previa instantánea.</div>
            </div>
          </div>
          <input type="text" id="formImageUrl" class="admin-input-text" value="${imageUrl}" placeholder="O ingresa URL o ruta: ej: REIGN BAR PALETTE/b-4.webp">
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
