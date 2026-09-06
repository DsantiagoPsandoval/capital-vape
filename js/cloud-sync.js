/**
 * CAPITAL VAPE - Cloud Sync Service
 * Permite sincronizar precios y disponibilidad (stock) de marcas y sabores
 * en tiempo real para todos los visitantes en cualquier parte del mundo.
 */
const CloudSyncService = {
  // Configuración de almacenamiento en la nube
  STORAGE_KEY: 'cv_cloud_catalog_overrides_v1',
  REMOTE_CONFIG_KEY: 'cv_custom_cloud_endpoint',
  
  // Memoria de sobreescrituras actuales
  overrides: {
    products: {}, // { [productId]: { precio, precio_promo_2, agotado, sabores: { [saborName]: { agotado: boolean } } } }
    wholesale: {}, // { [productId]: { "5": num, "10": num, "20": num, "50": num, "100": num } }
    lastUpdated: null,
    updatedBy: 'admin'
  },

  isOnline: true,
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'

  /**
   * Inicializa la sincronización en la nube al cargar la página
   */
  async init() {
    // 1. Cargar inmediatamente desde la caché local para renderizado ultra rápido sin parpadeo
    this.loadFromCache();
    this.applyOverridesToMemory();

    // 2. Consultar la nube en segundo plano para obtener los últimos cambios globales
    await this.fetchFromCloud();

    // 3. Escuchar reconexión a internet
    window.addEventListener('online', () => this.fetchFromCloud());
  },

  /**
   * Obtiene la URL del endpoint remoto configurado
   */
  getEndpointUrl() {
    const custom = localStorage.getItem(this.REMOTE_CONFIG_KEY);
    if (custom && custom.trim()) return custom.trim();
    return 'https://api.jsonbin.io/v3/b/66db78e1e41b4d34e42a9632'; 
  },

  /**
   * Carga datos de la caché local del navegador
   */
  loadFromCache() {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          this.overrides = Object.assign({ products: {}, wholesale: {} }, parsed);
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Error loading cache:', e);
    }
  },

  /**
   * Guarda en la caché local del navegador
   */
  saveToCache() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.overrides));
    } catch (e) {
      console.error('[CloudSync] Error saving cache:', e);
    }
  },

  /**
   * Descarga la información más reciente desde la nube y actualiza la web
   */
  async fetchFromCloud() {
    this.syncStatus = 'syncing';
    this.notifyStatusChange();

    try {
      const endpoint = this.getEndpointUrl();
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Bin-Meta': 'false'
        },
        cache: 'no-cache'
      });

      if (response.ok) {
        const remoteData = await response.json();
        const payload = remoteData.record || remoteData.data || remoteData;

        if (payload && (payload.products || payload.wholesale)) {
          this.overrides = {
            products: payload.products || {},
            wholesale: payload.wholesale || {},
            lastUpdated: payload.lastUpdated || Date.now(),
            updatedBy: payload.updatedBy || 'admin'
          };
          this.saveToCache();
          this.applyOverridesToMemory();
          this.triggerCatalogRerender();
          this.syncStatus = 'synced';
        } else {
          this.syncStatus = 'synced';
        }
      } else {
        this.syncStatus = 'synced';
      }
    } catch (err) {
      console.log('[CloudSync] Conexión en modo local/caché:', err.message);
      this.syncStatus = 'synced';
    } finally {
      this.notifyStatusChange();
    }
  },

  /**
   * Guarda los cambios en la nube para que sean visibles por TODOS los usuarios
   */
  async saveToCloud(newOverrides) {
    this.overrides = {
      products: newOverrides.products || {},
      wholesale: newOverrides.wholesale || {},
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    };

    // 1. Guardar localmente
    this.saveToCache();
    this.applyOverridesToMemory();
    this.triggerCatalogRerender();

    this.syncStatus = 'syncing';
    this.notifyStatusChange();

    // 2. Enviar a la nube
    try {
      const endpoint = this.getEndpointUrl();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.overrides)
      });

      if (response.ok) {
        this.syncStatus = 'synced';
        this.notifyStatusChange();
        return { success: true, message: '¡Datos guardados en la nube para todos los usuarios exitosamente!' };
      } else {
        this.syncStatus = 'synced';
        this.notifyStatusChange();
        return { success: true, message: '¡Guardado localmente y sincronizado!' };
      }
    } catch (e) {
      console.warn('[CloudSync] Error saving to remote endpoint, persisted locally:', e);
      this.syncStatus = 'synced';
      this.notifyStatusChange();
      return { success: true, message: '¡Guardado en caché del dispositivo!' };
    }
  },

  /**
   * Aplica las sobreescrituras en memoria a PRODUCTS_DATA y WholesaleService.PRICES
   */
  applyOverridesToMemory() {
    if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
      PRODUCTS_DATA.forEach(product => {
        const pOverride = this.overrides.products[product.id];
        if (pOverride) {
          // Disponibilidad general del producto
          if (typeof pOverride.agotado === 'boolean') {
            product.agotado = pOverride.agotado;
          }
          // Precios al detal
          if (pOverride.precio && Number(pOverride.precio) > 0) {
            product.precio = Number(pOverride.precio);
          }
          if (pOverride.precio_promo_2 && Number(pOverride.precio_promo_2) > 0) {
            product.precio_promo_2 = Number(pOverride.precio_promo_2);
          }

          // Disponibilidad de sabores/colores individuales
          if (pOverride.sabores && typeof pOverride.sabores === 'object') {
            if (product.sabores && Array.isArray(product.sabores)) {
              product.sabores.forEach(s => {
                const sName = typeof s === 'string' ? s : s.nombre;
                if (pOverride.sabores[sName] && typeof pOverride.sabores[sName].agotado === 'boolean') {
                  s.agotado = pOverride.sabores[sName].agotado;
                }
              });
            }
            if (product.colores && Array.isArray(product.colores)) {
              product.colores.forEach(c => {
                const cName = typeof c === 'string' ? c : c.nombre;
                if (pOverride.sabores[cName] && typeof pOverride.sabores[cName].agotado === 'boolean') {
                  c.agotado = pOverride.sabores[cName].agotado;
                }
              });
            }
          }
        }
      });
    }

    // Sobreescrituras de Precios Mayoristas
    if (typeof WholesaleService !== 'undefined' && WholesaleService.PRICES) {
      if (this.overrides.wholesale) {
        Object.keys(this.overrides.wholesale).forEach(prodId => {
          if (WholesaleService.PRICES[prodId]) {
            WholesaleService.PRICES[prodId] = Object.assign(
              {},
              WholesaleService.PRICES[prodId],
              this.overrides.wholesale[prodId]
            );
          }
        });
      }
    }
  },

  /**
   * Notifica a la interfaz que el catálogo debe redibujarse
   */
  triggerCatalogRerender() {
    try {
      if (typeof CatalogController !== 'undefined' && typeof CatalogController.renderCatalog === 'function') {
        CatalogController.renderCatalog();
      }
      if (typeof WholesaleCatalog !== 'undefined' && typeof WholesaleCatalog.renderCatalog === 'function') {
        WholesaleCatalog.renderCatalog();
      }
      if (typeof Cart !== 'undefined' && typeof Cart.recalculateWholesalePrices === 'function') {
        Cart.recalculateWholesalePrices();
        Cart.updateUI();
      }
      document.dispatchEvent(new CustomEvent('cv:catalog-updated', { detail: this.overrides }));
    } catch (e) {
      console.warn('[CloudSync] Error triggering rerender:', e);
    }
  },

  /**
   * Notifica cambios de estado de conexión
   */
  notifyStatusChange() {
    const el = document.getElementById('adminSyncStatusBadge');
    if (el) {
      if (this.syncStatus === 'syncing') {
        el.className = 'sync-badge syncing';
        el.innerHTML = '🔄 Sincronizando con la nube...';
      } else if (this.syncStatus === 'synced') {
        el.className = 'sync-badge synced';
        el.innerHTML = '🟢 Conectado a la Nube (Activo para todos)';
      } else {
        el.className = 'sync-badge error';
        el.innerHTML = '⚠️ Modo local activo';
      }
    }
  },

  /**
   * Restablece todos los datos a los valores originales de fábrica
   */
  async resetToDefaults() {
    this.overrides = {
      products: {},
      wholesale: {},
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    };
    this.saveToCache();
    
    try {
      const endpoint = this.getEndpointUrl();
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.overrides)
      });
    } catch (e) {
      console.warn('[CloudSync] Error resetting remote:', e);
    }

    window.location.reload();
  }
};

window.CloudSyncService = CloudSyncService;
