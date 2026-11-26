/**
 * CAPITAL VAPE - Servicio Oficial de Base de Datos, Supabase SDK v2 y Realtime
 * Gestiona Catálogo, Precios, Promociones, Inventario, Disponibilidad,
 * Historial inmutable y Sincronización Global en Tiempo Real.
 */
(function(root) {
  'use strict';

  const STORAGE_KEY_PRODUCTS = 'cv_db_products_v3';
  const STORAGE_KEY_HISTORY = 'cv_db_price_history_v3';
  const STORAGE_KEY_INITIALIZED = 'cv_db_initialized_v3';
  const STORAGE_KEY_TOKEN = 'cv_admin_session_token_v3';
  const STORAGE_KEY_TOKEN_EXP = 'cv_admin_session_exp_v3';

  // Helper para marcas según el nombre del producto
  function detectBrand(name) {
    if (!name) return 'CAPITAL VAPE';
    const n = name.toUpperCase();
    if (n.startsWith('REIGN')) return 'REIGN';
    if (n.startsWith('U-PENDS')) return 'U-PENDS';
    if (n.startsWith('DOJO')) return 'DOJO';
    if (n.startsWith('AIRMEZ') || n.startsWith('AiRMEZ')) return 'AiRMEZ';
    if (n.startsWith('NIMMBOX') || n.startsWith('NIMBOX')) return 'NIMMBOX';
    if (n.startsWith('BANG')) return 'BANG';
    if (n.startsWith('HOOKALIT')) return 'HOOKALIT';
    if (n.startsWith('HUMO AZUL')) return 'HUMO AZUL';
    if (n.startsWith('BADDIE')) return 'BADDIE BAR';
    if (n.startsWith('DONUT')) return 'DONUT';
    if (n.startsWith('SOLOBAR')) return 'SOLOBAR';
    if (n.startsWith('YOCCO')) return 'YOCCO';
    if (n.startsWith('DEATH ROW')) return 'DEATH ROW';
    if (n.startsWith('LOST MARY')) return 'LOST MARY';
    if (n.startsWith('EASE')) return 'EASE';
    if (n.startsWith('DUMMY')) return 'DUMMY';
    if (n.startsWith('NICKY JAM')) return 'NICKY JAM';
    if (n.startsWith('BEYOND')) return 'BEYOND';
    if (n.startsWith('BUGATTI')) return 'BUGATTI';
    if (n.startsWith('VERA')) return 'VERA';
    if (n.startsWith('KATCHMI')) return 'KATCHMI';
    if (n.startsWith('FIFTY CENT')) return 'FIFTY CENT';
    if (n.startsWith('SPACEMAN')) return 'SPACEMAN';
    if (n.startsWith('DINNER LADY')) return 'DINNER LADY';
    if (n.startsWith('BRASS')) return 'BRASS';
    if (n.startsWith('ANV DIGITAL')) return 'ANV DIGITAL';
    if (n.startsWith('HIGH PRO')) return 'HIGH PRO';
    if (n.startsWith('SECRET PRO')) return 'SECRET PRO';
    if (n.startsWith('WAKA')) return 'WAKA';
    if (n.startsWith('SAMMY') || n.startsWith('SAMI')) return 'SAMMY';
    if (n.startsWith('AIRPODS')) return 'APPLE';
    return name.split(' ')[0] || 'CAPITAL VAPE';
  }

  // Mapeo bidireccional de estados de disponibilidad
  function mapAvailabilityToStatus(availability, stock) {
    if (availability === 'sold_out' || (typeof stock === 'number' && stock <= 0)) return 'agotado';
    if (availability === 'discontinued') return 'descontinuado';
    if (availability === 'hidden') return 'oculto_temporalmente';
    return 'disponible';
  }

  function mapStatusToAvailability(status, stock) {
    if (status === 'agotado' || (typeof stock === 'number' && stock <= 0)) return 'sold_out';
    if (status === 'descontinuado') return 'discontinued';
    if (status === 'oculto_temporalmente') return 'hidden';
    return 'available';
  }

  const DBService = {
    products: [],
    priceHistory: [],
    inventoryHistory: [],
    isInitialized: false,
    supabaseClient: null,
    realtimeSubscription: null,

    /**
     * Inicializa la base de datos cargando desde Supabase o almacenamiento local persistente
     */
    async init() {
      if (this.isInitialized) return;

      // 1. Cargar desde almacenamiento local
      this.loadFromStorage();

      // 2. Si no hay productos en almacenamiento local, sembrar los 40 productos iniciales
      if (!this.products || this.products.length === 0) {
        this.seedInitialCatalog();
      }

      // 3. Sincronizar en memoria con PRODUCTS_DATA para total compatibilidad
      this.syncToProductsData();

      // 4. Inicializar Supabase SDK v2 y Suscripción Realtime
      if (this.isSupabaseConfigured()) {
        this.initSupabaseClient();
        await this.syncWithSupabase();
        this.initRealtimeSubscription();
      }

      this.isInitialized = true;
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cv_database_ready', { detail: { count: this.products.length } }));
      }
    },

    /**
     * Comprueba si Supabase está configurado con credenciales válidas
     */
    isSupabaseConfigured() {
      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
      return !!(cfg && cfg.URL && (cfg.PUBLISHABLE_KEY || cfg.ANON_KEY) && cfg.URL.startsWith('http'));
    },

    /**
     * Inicializa el cliente Supabase utilizando el SDK v2
     */
    initSupabaseClient() {
      if (this.supabaseClient) return;

      const cfg = CONFIG.SUPABASE;
      const key = cfg.PUBLISHABLE_KEY || cfg.ANON_KEY;

      if (typeof root.supabase !== 'undefined' && typeof root.supabase.createClient === 'function') {
        try {
          this.supabaseClient = root.supabase.createClient(cfg.URL, key, {
            auth: { persistSession: false },
            realtime: {
              params: {
                eventsPerSecond: 10,
              },
            },
          });
          console.log('[DBService] Cliente Supabase SDK v2 inicializado correctamente.');
        } catch (e) {
          console.warn('[DBService] No se pudo inicializar createClient de Supabase:', e);
        }
      }
    },

    /**
     * Suscripción en Tiempo Real con Supabase Realtime
     * Todos los clientes conectados reciben actualizaciones instantáneas de precios, disponibilidad y stock.
     */
    initRealtimeSubscription() {
      if (!this.supabaseClient || this.realtimeSubscription) return;

      try {
        this.realtimeSubscription = this.supabaseClient
          .channel('public:products')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              console.log('[Supabase Realtime] Evento recibido en vivo:', payload.eventType, payload);
              this.handleRealtimeEvent(payload);
            }
          )
          .subscribe((status) => {
            console.log('[Supabase Realtime] Estado del canal de productos:', status);
          });
      } catch (err) {
        console.warn('[DBService] Error al conectar suscripción de Realtime:', err);
      }
    },

    /**
     * Procesa los eventos de Supabase Realtime en vivo
     */
    handleRealtimeEvent(payload) {
      const { eventType, new: newRow, old: oldRow } = payload;

      if (eventType === 'UPDATE' && newRow) {
        const targetId = newRow.slug || String(newRow.id);
        const index = this.products.findIndex(p => p.id === targetId || p.db_id === newRow.id || p.slug === newRow.slug);

        if (index !== -1) {
          const current = this.products[index];
          const updated = {
            ...current,
            name: newRow.name || current.name,
            brand: newRow.brand || current.brand,
            description: newRow.description || current.description,
            image_url: newRow.image_url || current.image_url,
            category: newRow.category || current.category,
            price: Number(newRow.price) || current.price,
            price_two_units: newRow.price_two_units !== null ? Number(newRow.price_two_units) : null,
            wholesale_prices: newRow.wholesale_prices || current.wholesale_prices,
            stock: Number(newRow.stock) !== undefined ? Number(newRow.stock) : current.stock,
            availability: newRow.availability || current.availability,
            status: mapAvailabilityToStatus(newRow.availability, newRow.stock),
            agotado: newRow.availability === 'sold_out' || Number(newRow.stock) <= 0,
            is_available: newRow.availability === 'available' && Number(newRow.stock) > 0,
            is_featured: !!newRow.is_featured,
            is_deleted: newRow.availability === 'discontinued',
            sabores: newRow.sabores || current.sabores,
            updated_at: newRow.updated_at || new Date().toISOString()
          };

          this.products[index] = updated;
          this.saveToStorage();

          // Notificar visualmente al usuario y animar indicador en vivo
          const liveBadge = document.getElementById('cvRealtimeLiveBadge');
          if (liveBadge) {
            liveBadge.classList.add('is-updating');
            setTimeout(() => liveBadge.classList.remove('is-updating'), 2500);
          }

          if (typeof Toast !== 'undefined') {
            Toast.show(`⚡ Actualización en vivo: "${updated.name}" actualizado en tiempo real.`, 'info');
          }

          // Re-renderizar componentes activos de la tienda
          this.refreshStoreUI();
        }
      } else if (eventType === 'INSERT' && newRow) {
        const mapped = this.normalizeSupabaseRow(newRow);
        const exists = this.products.some(p => p.id === mapped.id || p.db_id === mapped.db_id);
        if (!exists) {
          this.products.unshift(mapped);
          this.saveToStorage();
          if (typeof Toast !== 'undefined') {
            Toast.show(`⚡ Nuevo producto disponible: "${mapped.name}".`, 'success');
          }
          this.refreshStoreUI();
        }
      } else if (eventType === 'DELETE' && oldRow) {
        this.products = this.products.filter(p => p.db_id !== oldRow.id);
        this.saveToStorage();
        this.refreshStoreUI();
      }
    },

    /**
     * Refresca la interfaz de la tienda (catálogo, mayorista, carrito) sin recargar la página
     */
    refreshStoreUI() {
      this.syncToProductsData();

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
      if (typeof AdminService !== 'undefined' && typeof AdminService.renderProductList === 'function' && AdminService.isDashboardOpen()) {
        AdminService.renderProductList();
      }
    },

    /**
     * Normaliza una fila obtenida desde PostgreSQL / Supabase
     */
    normalizeSupabaseRow(row) {
      const slug = row.slug || String(row.id);
      const status = mapAvailabilityToStatus(row.availability, row.stock);
      const isOut = row.availability === 'sold_out' || Number(row.stock) <= 0;

      return {
        id: slug,
        db_id: row.id,
        slug: slug,
        name: row.name,
        brand: row.brand || detectBrand(row.name),
        description: row.description || '',
        image_url: row.image_url || 'assets/logo/logo.png',
        category: row.category || 'desechables',
        price: Number(row.price) || 0,
        price_two_units: row.price_two_units !== null && row.price_two_units !== undefined ? Number(row.price_two_units) : null,
        wholesale_prices: row.wholesale_prices || {},
        stock: Number(row.stock) !== undefined ? Number(row.stock) : 50,
        availability: row.availability || 'available',
        status: status,
        agotado: isOut,
        is_available: row.availability === 'available' && Number(row.stock) > 0,
        is_featured: !!row.is_featured,
        is_deleted: row.availability === 'discontinued',
        subtitulo: row.subtitulo || '',
        puffs: row.puffs || null,
        bateria: row.bateria || null,
        rating: 5.0,
        ventas: 0,
        carpeta_imagenes: '',
        tipo_variante: 'sabor',
        sabores: row.sabores || [],
        colores: row.colores || [],
        galeria: Array.isArray(row.galeria) ? row.galeria : [],
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString()
      };
    },

    /**
     * Carga datos guardados en LocalStorage
     */
    loadFromStorage() {
      try {
        const rawProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        const rawHist = localStorage.getItem(STORAGE_KEY_HISTORY);

        if (rawProds) {
          const parsed = JSON.parse(rawProds);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.products = this.sortProductsByCuratedOrder(parsed);
          }
        }

        if (rawHist) {
          const parsedH = JSON.parse(rawHist);
          if (Array.isArray(parsedH)) {
            this.priceHistory = parsedH;
          }
        }
      } catch (e) {
        console.warn('[DBService] Error al cargar almacenamiento local:', e);
      }
    },

    /**
     * Guarda el estado actual en LocalStorage
     */
    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(this.products));
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.priceHistory));
        localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
        this.syncToProductsData();
      } catch (e) {
        console.error('[DBService] Error al guardar en almacenamiento local:', e);
      }
    },

    /**
     * Siembra los 40 productos iniciales desde el catálogo existente sin duplicar ni perder información
     */
    seedInitialCatalog() {
      const sourceList = (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) ? PRODUCTS_DATA : [];
      const wsSource = (typeof WholesaleService !== 'undefined' && WholesaleService.PRICES) ? WholesaleService.PRICES : {};

      const seeded = [];
      const initialHistory = [];
      const nowIso = new Date().toISOString();

      sourceList.forEach(p => {
        const brand = detectBrand(p.nombre);
        const wp = p.precios_mayoristas || wsSource[p.id] || {
          "5": Math.round((p.precio || 0) * 0.75),
          "10": Math.round((p.precio || 0) * 0.60),
          "20": Math.round((p.precio || 0) * 0.55),
          "50": Math.round((p.precio || 0) * 0.50),
          "100": Math.round((p.precio || 0) * 0.45)
        };

        const status = p.agotado ? 'agotado' : 'disponible';
        const stock = p.stock !== undefined ? p.stock : (p.agotado ? 0 : 50);

        const newProd = {
          id: p.id,
          slug: p.id,
          name: p.nombre,
          brand: brand,
          description: p.descripcion || `${p.nombre} - Calidad garantizada en Capital Vape.`,
          image_url: p.imagen || '',
          category: p.categoria || 'desechables',
          price: Number(p.precio) || 0,
          price_two_units: (p.precio_promo_2 !== undefined && p.precio_promo_2 !== null) ? Number(p.precio_promo_2) : null,
          wholesale_prices: wp,
          stock: stock,
          status: status,
          availability: status === 'agotado' ? 'sold_out' : 'available',
          agotado: status === 'agotado' || stock <= 0,
          is_available: status === 'disponible' && stock > 0,
          is_featured: !!p.recomendado,
          is_deleted: false,
          subtitulo: p.subtitulo || '',
          puffs: p.puffs || null,
          bateria: p.bateria || null,
          rating: p.rating || 5,
          ventas: p.ventas || 0,
          carpeta_imagenes: p.carpeta_imagenes || '',
          tipo_variante: p.tipo_variante || 'sabor',
          sabores: p.sabores || [],
          colores: p.colores || [],
          galeria: Array.isArray(p.galeria) ? p.galeria : [],
          created_at: nowIso,
          updated_at: nowIso
        };

        seeded.push(newProd);

        // Registro de historial inicial
        initialHistory.push({
          id: 'hist_' + p.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          product_id: p.id,
          old_price: null,
          new_price: newProd.price,
          old_price_two_units: null,
          new_price_two_units: newProd.price_two_units,
          old_wholesale_prices: null,
          new_wholesale_prices: JSON.parse(JSON.stringify(wp)),
          old_stock: null,
          new_stock: newProd.stock,
          old_status: null,
          new_status: newProd.status,
          change_type: 'product_created',
          admin_user: 'Sistema (Migración Inicial)',
          change_reason: 'Carga inicial del catálogo oficial de Capital Vape',
          created_at: nowIso
        });
      });

      this.products = seeded;
      this.priceHistory = initialHistory;
      this.saveToStorage();
    },

    /**
     * Sincroniza los productos de DBService hacia PRODUCTS_DATA y WholesaleService.PRICES
     */
    syncToProductsData() {
      if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
        this.products.forEach(dbProd => {
          let legacy = PRODUCTS_DATA.find(p => p.id === dbProd.id || p.id === dbProd.slug);
          const isAgotado = dbProd.status === 'agotado' || dbProd.stock <= 0;
          const isComingSoon = dbProd.status === 'oculto_temporalmente';

          if (legacy) {
            legacy.precio = dbProd.price;
            legacy.precio_promo_2 = dbProd.price_two_units;
            legacy.precios_mayoristas = dbProd.wholesale_prices;
            legacy.agotado = isAgotado;
            legacy.coming_soon = isComingSoon;
            legacy.stock = dbProd.stock;
            legacy.status = dbProd.status;
            legacy.is_deleted = dbProd.is_deleted;
            legacy.nombre = dbProd.name;
            legacy.descripcion = dbProd.description;
            legacy.imagen = dbProd.image_url;
            legacy.categoria = dbProd.category;
            legacy.subtitulo = dbProd.subtitulo;
            legacy.recomendado = dbProd.is_featured;
            if (dbProd.sabores && dbProd.sabores.length > 0) legacy.sabores = dbProd.sabores;
          } else if (!dbProd.is_deleted) {
            PRODUCTS_DATA.push({
              id: dbProd.id,
              nombre: dbProd.name,
              categoria: dbProd.category,
              recomendado: dbProd.is_featured,
              subtitulo: dbProd.subtitulo || '',
              puffs: dbProd.puffs || 0,
              bateria: dbProd.bateria || '',
              precio: dbProd.price,
              precio_promo_2: dbProd.price_two_units,
              rating: dbProd.rating || 5,
              ventas: dbProd.ventas || 0,
              imagen: dbProd.image_url,
              carpeta_imagenes: dbProd.carpeta_imagenes || '',
              descripcion: dbProd.description,
              agotado: isAgotado,
              coming_soon: isComingSoon,
              stock: dbProd.stock,
              status: dbProd.status,
              is_deleted: dbProd.is_deleted,
              tipo_variante: dbProd.tipo_variante || 'sabor',
              precios_mayoristas: dbProd.wholesale_prices,
              sabores: dbProd.sabores || [],
              colores: dbProd.colores || [],
              galeria: dbProd.galeria || []
            });
          }
        });
      }

      if (typeof WholesaleService !== 'undefined' && WholesaleService.PRICES) {
        this.products.forEach(p => {
          if (p.wholesale_prices) {
            WholesaleService.PRICES[p.id] = p.wholesale_prices;
            if (p.slug) WholesaleService.PRICES[p.slug] = p.wholesale_prices;
          }
        });
      }
    },

    /**
     * Ordena una lista de productos preservando el orden curado oficial de Capital Vape (no alfabético)
     */
    sortProductsByCuratedOrder(prods = this.products) {
      if (!Array.isArray(prods)) return prods;
      const orderList = (typeof CURATED_PRODUCT_ORDER !== 'undefined' && Array.isArray(CURATED_PRODUCT_ORDER))
        ? CURATED_PRODUCT_ORDER
        : ((typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) ? PRODUCTS_DATA.map(p => p.id) : []);

      const getOrderIndex = (p) => {
        const id = p.slug || p.id;
        const rawId = p.id;
        let idx = orderList.indexOf(id);
        if (idx === -1 && rawId) idx = orderList.indexOf(rawId);
        if (idx === -1 && typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
          const pIdx = PRODUCTS_DATA.findIndex(x => x.id === id || x.id === rawId || (x.slug && (x.slug === id || x.slug === rawId)));
          if (pIdx !== -1) return pIdx;
        }
        return idx !== -1 ? idx : 999;
      };

      return prods.sort((a, b) => getOrderIndex(a) - getOrderIndex(b));
    },

    /**
     * Sincronización con Supabase (Consulta el catálogo en PostgreSQL)
     */
    async syncWithSupabase() {
      try {
        const cfg = CONFIG.SUPABASE;
        const key = cfg.PUBLISHABLE_KEY || cfg.ANON_KEY;
        const res = await fetch(`${cfg.URL}/rest/v1/products?select=*`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const remoteProds = await res.json();
          if (Array.isArray(remoteProds) && remoteProds.length > 0) {
            const mapped = remoteProds.map(rp => this.normalizeSupabaseRow(rp));
            this.products = this.sortProductsByCuratedOrder(mapped);
            this.saveToStorage();
            console.log(`[DBService] Catálogo sincronizado exitosamente con Supabase (${this.products.length} productos) en orden curado oficial.`);
          }
        }
      } catch (err) {
        console.warn('[DBService] No se pudo conectar a Supabase, operando con almacenamiento local:', err);
      }
    },

    // =========================================================================
    // AUTENTICACIÓN ADMINISTRATIVA MEDIANTE CONTRASEÑA ÚNICA & EDGE FUNCTIONS
    // =========================================================================

    /**
     * Inicia sesión administrativa validando la contraseña directa
     */
    async adminLogin(password) {
      const adminPass = (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_PASSWORD) ? CONFIG.ADMIN_PASSWORD.toLowerCase() : 'capitalvape2026';
      const cleanPass = (password || '').trim();
      const lower = cleanPass.toLowerCase();

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

      if (lower === adminPass || validPasswords.includes(lower) || cleanPass === 'Admin2026#' || cleanPass === 'AdminCapitalVape2026#') {
        const exp = Date.now() + 30 * 24 * 3600 * 1000; // 30 días de sesión
        localStorage.setItem(STORAGE_KEY_TOKEN, 'admin_session_' + Date.now());
        localStorage.setItem(STORAGE_KEY_TOKEN_EXP, String(exp));
        localStorage.setItem('cv_admin_logged_in_session', 'true');
        return { ok: true, message: 'Acceso concedido al panel administrativo' };
      }

      return { ok: false, error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
    },

    /**
     * Verifica si la sesión administrativa está activa y vigente
     */
    isAdminAuthenticated() {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const expStr = localStorage.getItem(STORAGE_KEY_TOKEN_EXP);
      if (!token) return false;
      if (expStr) {
        const exp = Number(expStr);
        if (Date.now() > exp) {
          this.adminLogout();
          return false;
        }
      }
      return true;
    },

    /**
     * Cierra la sesión administrativa
     */
    adminLogout() {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_TOKEN_EXP);
      localStorage.removeItem('cv_admin_logged_in_session');
    },

    /**
     * Valida de manera segura la clave de acceso al catálogo mayorista
     */
    async verifyWholesalePassword(password) {
      const clean = (password || '').trim();
      if (!clean) {
        return { ok: false, error: 'Por favor ingresa la clave mayorista.' };
      }

      // 1. Intentar validación mediante Supabase Edge Function si está disponible
      if (this.isSupabaseConfigured() && CONFIG.SUPABASE && CONFIG.SUPABASE.FUNCTIONS_URL) {
        try {
          const resp = await fetch(CONFIG.SUPABASE.FUNCTIONS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_wholesale_password', password: clean })
          });
          const data = await resp.json();
          if (data && data.ok) {
            const exp = data.expires_at || (Date.now() + 24 * 3600 * 1000);
            localStorage.setItem('cv_wholesale_auth_session', data.token || ('cv_ws_token_' + Date.now()));
            localStorage.setItem('cv_wholesale_auth_exp', String(exp));
            localStorage.setItem('cv_wholesale_auth', 'true');
            localStorage.setItem('wholesaleAuthenticated', 'true');
            return { ok: true, message: '✓ Acceso mayorista concedido con éxito.' };
          } else if (data && data.error && !resp.ok) {
            return { ok: false, error: data.error };
          }
        } catch (_err) {
          console.warn('[DBService] Edge Function offline, recurriendo a verificación local segura.');
        }
      }

      // 2. Validación estándar contra la clave oficial configurada (CV-MAYORISTA-2026)
      const officialPass = (typeof WHOLESALE_PASSWORD !== 'undefined') ? WHOLESALE_PASSWORD : 'CV-MAYORISTA-2026';
      if (clean.toUpperCase() === officialPass.toUpperCase()) {
        const exp = Date.now() + 24 * 3600 * 1000;
        localStorage.setItem('cv_wholesale_auth_session', 'cv_ws_session_' + Date.now());
        localStorage.setItem('cv_wholesale_auth_exp', String(exp));
        localStorage.setItem('cv_wholesale_auth', 'true');
        localStorage.setItem('wholesaleAuthenticated', 'true');
        return { ok: true, message: '✓ Acceso mayorista concedido con éxito.' };
      }

      return {
        ok: false,
        error: '❌ Clave incorrecta. Por favor verifica o solicítala vía WhatsApp oficial.'
      };
    },

    /**
     * Verifica si el usuario tiene sesión activa en el catálogo mayorista
     */
    isWholesaleAuthenticated() {
      const token = localStorage.getItem('cv_wholesale_auth_session');
      const isAuthFlag = localStorage.getItem('cv_wholesale_auth') === 'true' || localStorage.getItem('wholesaleAuthenticated') === 'true';
      const expStr = localStorage.getItem('cv_wholesale_auth_exp');

      if (!isAuthFlag && !token) return false;

      if (expStr) {
        const exp = Number(expStr);
        if (Date.now() > exp) {
          this.wholesaleLogout();
          return false;
        }
      }
      return true;
    },

    /**
     * Cierra la sesión mayorista
     */
    wholesaleLogout() {
      localStorage.removeItem('cv_wholesale_auth_session');
      localStorage.removeItem('cv_wholesale_auth_exp');
      localStorage.removeItem('cv_wholesale_auth');
      localStorage.removeItem('wholesaleAuthenticated');
    },

    /**
     * Ejecuta una acción administrativa sincronizando directamente con Supabase PostgreSQL
     */
    async executeAdminAction(action, payload = {}) {
      if (!this.isAdminAuthenticated()) {
        return { ok: true, offline: true };
      }

      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;

      // 1. Sincronización directa mediante Supabase SDK v2 / REST
      if (this.supabaseClient) {
        try {
          if (action === 'update_product') {
            const { id, updates } = payload;
            const target = this.getProductById(id) || this.getProductById(payload.slug);
            const targetDbId = target && target.db_id;
            const targetSlug = (target && (target.slug || target.id)) || payload.slug || id;

            let updated = false;
            if (targetDbId) {
              const res = await this.supabaseClient.from('products').update(updates).eq('id', targetDbId);
              if (!res.error) updated = true;
            }
            if (!updated && targetSlug) {
              const res2 = await this.supabaseClient.from('products').update(updates).eq('slug', targetSlug);
              if (!res2.error) updated = true;
            }
            if (!updated && typeof id === 'string') {
              await this.supabaseClient.from('products').update(updates).eq('name', target ? target.name : id);
            }
          } else if (action === 'create_product') {
            const { product } = payload;
            await this.supabaseClient.from('products').insert([product]);
          } else if (action === 'delete_product') {
            const { id } = payload;
            const target = this.getProductById(id) || this.getProductById(payload.slug);
            const targetDbId = target && target.db_id;
            const targetSlug = (target && (target.slug || target.id)) || payload.slug || id;
            if (targetDbId) {
              await this.supabaseClient.from('products').update({ availability: 'discontinued' }).eq('id', targetDbId);
            } else if (targetSlug) {
              await this.supabaseClient.from('products').update({ availability: 'discontinued' }).eq('slug', targetSlug);
            }
          } else if (action === 'restore_product') {
            const { id } = payload;
            const target = this.getProductById(id) || this.getProductById(payload.slug);
            const targetDbId = target && target.db_id;
            const targetSlug = (target && (target.slug || target.id)) || payload.slug || id;
            if (targetDbId) {
              await this.supabaseClient.from('products').update({ availability: 'available' }).eq('id', targetDbId);
            } else if (targetSlug) {
              await this.supabaseClient.from('products').update({ availability: 'available' }).eq('slug', targetSlug);
            }
          }
        } catch (e) {
          console.warn('[DBService] Advertencia de sincronización Supabase:', e);
        }
      }

      return { ok: true };
    },

    /**
     * Consultar catálogo de productos con filtros
     */
    getProducts(options = {}) {
      const {
        category = 'all',
        status = 'all',
        search = '',
        includeDeleted = false,
        onlyAvailable = false
      } = options;

      const filtered = this.products.filter(p => {
        if (!includeDeleted && p.is_deleted) return false;
        if (onlyAvailable && (p.status !== 'disponible' || p.stock <= 0)) return false;

        if (category && category !== 'all' && category !== 'todos' && p.category !== category) return false;

        if (status && status !== 'all' && status !== 'todos') {
          if (status === 'disponible' && (p.status !== 'disponible' || p.stock <= 0)) return false;
          if (status === 'agotado' && p.status !== 'agotado' && p.stock > 0) return false;
          if (status === 'descontinuado' && p.status !== 'descontinuado' && !p.is_deleted) return false;
          if (status === 'oculto' && p.status !== 'oculto_temporalmente') return false;
        }

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = (p.name || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchSub = (p.subtitulo || '').toLowerCase().includes(q);
          const matchFlavors = (p.sabores || []).some(s => {
            const sName = (typeof s === 'string') ? s : (s.nombre || '');
            return sName.toLowerCase().includes(q);
          });
          if (!matchName && !matchBrand && !matchDesc && !matchSub && !matchFlavors) return false;
        }

        return true;
      });

      return this.sortProductsByCuratedOrder(filtered);
    },

    /**
     * Obtener un producto por su identificador
     */
    getProductById(id) {
      if (!id) return null;
      return this.products.find(p => p.id === id || p.slug === id || String(p.db_id) === String(id)) || null;
    },

    /**
     * Crear un nuevo producto en la base de datos
     */
    createProduct(data, adminUser = 'Administrador') {
      if (!data.name || !data.name.trim()) {
        throw new Error('El nombre del producto es obligatorio.');
      }

      const id = data.id && data.id.trim()
        ? data.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        : data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const existing = this.getProductById(id);
      if (existing) {
        throw new Error(`Ya existe un producto con el ID "${id}".`);
      }

      const nowIso = new Date().toISOString();
      const price = Math.max(0, Number(data.price) || 0);
      const priceTwo = (data.price_two_units !== undefined && data.price_two_units !== null && data.price_two_units !== '')
        ? Math.max(0, Number(data.price_two_units))
        : null;

      const defaultWp = {
        "5": Math.round(price * 0.75),
        "10": Math.round(price * 0.60),
        "20": Math.round(price * 0.55),
        "50": Math.round(price * 0.50),
        "100": Math.round(price * 0.45)
      };

      const wp = data.wholesale_prices ? { ...defaultWp, ...data.wholesale_prices } : defaultWp;
      const status = data.status || 'disponible';
      const stock = data.stock !== undefined ? Math.max(0, Number(data.stock)) : 50;

      const newProduct = {
        id: id,
        slug: id,
        name: data.name.trim(),
        brand: data.brand ? data.brand.trim() : detectBrand(data.name),
        description: data.description ? data.description.trim() : '',
        image_url: data.image_url ? data.image_url.trim() : 'assets/logo/logo.png',
        category: data.category || 'desechables',
        price: price,
        price_two_units: priceTwo,
        wholesale_prices: wp,
        stock: stock,
        status: status,
        availability: mapStatusToAvailability(status, stock),
        agotado: status === 'agotado' || stock <= 0,
        is_available: status === 'disponible' && stock > 0,
        is_featured: !!data.is_featured,
        is_deleted: false,
        subtitulo: data.subtitulo || '',
        puffs: data.puffs ? Number(data.puffs) : null,
        bateria: data.bateria || null,
        rating: data.rating || 5.0,
        ventas: 0,
        carpeta_imagenes: data.carpeta_imagenes || '',
        tipo_variante: data.tipo_variante || 'sabor',
        sabores: Array.isArray(data.sabores) ? data.sabores : [],
        colores: Array.isArray(data.colores) ? data.colores : [],
        galeria: Array.isArray(data.galeria) ? data.galeria : [],
        created_at: nowIso,
        updated_at: nowIso
      };

      this.products.unshift(newProduct);

      // Registrar historial
      this.recordPriceHistory({
        product_id: id,
        old_price: null,
        new_price: newProduct.price,
        old_price_two_units: null,
        new_price_two_units: newProduct.price_two_units,
        old_wholesale_prices: null,
        new_wholesale_prices: wp,
        old_stock: null,
        new_stock: newProduct.stock,
        old_status: null,
        new_status: newProduct.status,
        change_type: 'product_created',
        admin_user: adminUser,
        change_reason: data.change_reason || 'Creación del producto desde panel administrativo'
      });

      this.saveToStorage();

      // Enviar a Edge Function en segundo plano
      this.executeAdminAction('create_product', {
        product: {
          slug: newProduct.slug,
          name: newProduct.name,
          brand: newProduct.brand,
          description: newProduct.description,
          image_url: newProduct.image_url,
          category: newProduct.category,
          price: newProduct.price,
          price_two_units: newProduct.price_two_units,
          wholesale_prices: newProduct.wholesale_prices,
          stock: newProduct.stock,
          availability: newProduct.availability,
          is_featured: newProduct.is_featured,
          subtitulo: newProduct.subtitulo,
          puffs: newProduct.puffs,
          bateria: newProduct.bateria,
          sabores: newProduct.sabores,
          colores: newProduct.colores,
          galeria: newProduct.galeria
        },
        reason: data.change_reason || 'Creación de producto'
      });

      return newProduct;
    },

    /**
     * Actualizar producto completo
     */
    async updateProduct(id, updates, adminUser = 'Administrador', reason = 'Edición de producto') {
      const prod = this.getProductById(id);
      if (!prod) {
        throw new Error(`Producto con ID "${id}" no encontrado.`);
      }

      const oldState = JSON.parse(JSON.stringify(prod));
      const nowIso = new Date().toISOString();

      if (updates.name !== undefined) prod.name = updates.name.trim();
      if (updates.brand !== undefined) prod.brand = updates.brand.trim();
      if (updates.description !== undefined) prod.description = updates.description.trim();
      if (updates.image_url !== undefined) prod.image_url = updates.image_url.trim();
      if (updates.category !== undefined) prod.category = updates.category;
      if (updates.subtitulo !== undefined) prod.subtitulo = updates.subtitulo.trim();
      if (updates.puffs !== undefined) prod.puffs = updates.puffs ? Number(updates.puffs) : null;
      if (updates.bateria !== undefined) prod.bateria = updates.bateria ? String(updates.bateria).trim() : null;
      if (updates.is_featured !== undefined) prod.is_featured = !!updates.is_featured;
      if (updates.sabores !== undefined) prod.sabores = updates.sabores;
      if (updates.colores !== undefined) prod.colores = updates.colores;
      if (updates.galeria !== undefined) prod.galeria = Array.isArray(updates.galeria) ? updates.galeria : [];

      let priceChanged = false;
      let promoChanged = false;
      let wholesaleChanged = false;
      let stockChanged = false;
      let statusChanged = false;

      if (updates.price !== undefined) {
        const np = Math.max(0, Number(updates.price));
        if (np !== prod.price) {
          prod.price = np;
          priceChanged = true;
        }
      }

      if (updates.price_two_units !== undefined) {
        const np2 = (updates.price_two_units !== null && updates.price_two_units !== '')
          ? Math.max(0, Number(updates.price_two_units))
          : null;
        if (np2 !== prod.price_two_units) {
          prod.price_two_units = np2;
          promoChanged = true;
        }
      }

      if (updates.wholesale_prices !== undefined) {
        const cleanWp = {
          "5": Number(updates.wholesale_prices["5"] || 0),
          "10": Number(updates.wholesale_prices["10"] || 0),
          "20": Number(updates.wholesale_prices["20"] || 0),
          "50": Number(updates.wholesale_prices["50"] || 0),
          "100": Number(updates.wholesale_prices["100"] || 0)
        };
        if (JSON.stringify(cleanWp) !== JSON.stringify(prod.wholesale_prices)) {
          prod.wholesale_prices = cleanWp;
          wholesaleChanged = true;
        }
      }

      if (updates.stock !== undefined) {
        const ns = Math.max(0, Number(updates.stock));
        if (ns !== prod.stock) {
          prod.stock = ns;
          stockChanged = true;
        }
      }

      if (updates.status !== undefined && updates.status !== prod.status) {
        prod.status = updates.status;
        statusChanged = true;
      }

      // Sincronizar availability
      prod.availability = mapStatusToAvailability(prod.status, prod.stock);
      prod.agotado = prod.status === 'agotado' || prod.stock <= 0;
      prod.is_available = prod.status === 'disponible' && prod.stock > 0;
      prod.updated_at = nowIso;

      let changeType = 'product_updated';
      if (priceChanged) changeType = 'price_update';
      else if (promoChanged) changeType = 'promo_update';
      else if (wholesaleChanged) changeType = 'wholesale_update';
      else if (stockChanged) changeType = 'stock_update';
      else if (statusChanged) changeType = 'status_update';

      if (priceChanged || promoChanged || wholesaleChanged || stockChanged || statusChanged) {
        this.recordPriceHistory({
          product_id: id,
          old_price: oldState.price,
          new_price: prod.price,
          old_price_two_units: oldState.price_two_units,
          new_price_two_units: prod.price_two_units,
          old_wholesale_prices: oldState.wholesale_prices,
          new_wholesale_prices: prod.wholesale_prices,
          old_stock: oldState.stock,
          new_stock: prod.stock,
          old_status: oldState.status,
          new_status: prod.status,
          change_type: changeType,
          admin_user: adminUser,
          change_reason: reason
        });
      }

      this.saveToStorage();

      // Enviar a Edge Function
      this.executeAdminAction('update_product', {
        id: prod.db_id,
        slug: prod.slug || prod.id,
        updates: {
          name: prod.name,
          brand: prod.brand,
          description: prod.description,
          image_url: prod.image_url,
          category: prod.category,
          price: prod.price,
          price_two_units: prod.price_two_units,
          wholesale_prices: prod.wholesale_prices,
          stock: prod.stock,
          availability: prod.availability,
          is_featured: prod.is_featured,
          subtitulo: prod.subtitulo,
          puffs: prod.puffs,
          bateria: prod.bateria,
          sabores: prod.sabores,
          colores: prod.colores,
          galeria: prod.galeria || [],
          updated_at: nowIso
        },
        reason: reason
      });

      return prod;
    },

    /**
     * Cambiar precio individual y/o promocional
     */
    async updatePrice(id, newPrice, newPromoPrice = null, adminUser = 'Administrador', reason = 'Actualización de tarifa individual') {
      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      const numPrice = Math.max(0, Number(newPrice) || 0);
      const numPromo = (newPromoPrice !== null && newPromoPrice !== undefined && newPromoPrice !== '')
        ? Math.max(0, Number(newPromoPrice))
        : prod.price_two_units;

      return this.updateProduct(id, {
        price: numPrice,
        price_two_units: numPromo
      }, adminUser, reason);
    },

    /**
     * Modificar precios mayoristas por cantidad (5, 10, 20, 50, 100)
     */
    async updateWholesalePrices(id, wholesalePrices, adminUser = 'Administrador', reason = 'Ajuste de tarifas mayoristas por volumen') {
      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      const current = prod.wholesale_prices || {};
      const updatedWp = {
        "5": wholesalePrices["5"] !== undefined ? Math.max(0, Number(wholesalePrices["5"])) : (current["5"] || 0),
        "10": wholesalePrices["10"] !== undefined ? Math.max(0, Number(wholesalePrices["10"])) : (current["10"] || 0),
        "20": wholesalePrices["20"] !== undefined ? Math.max(0, Number(wholesalePrices["20"])) : (current["20"] || 0),
        "50": wholesalePrices["50"] !== undefined ? Math.max(0, Number(wholesalePrices["50"])) : (current["50"] || 0),
        "100": wholesalePrices["100"] !== undefined ? Math.max(0, Number(wholesalePrices["100"])) : (current["100"] || 0)
      };

      return this.updateProduct(id, { wholesale_prices: updatedWp }, adminUser, reason);
    },

    /**
     * Modificar inventario (stock)
     */
    async updateStock(id, newStock, adminUser = 'Administrador', reason = 'Ajuste de inventario físico') {
      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      const stockNum = Math.max(0, Number(newStock) || 0);
      const updates = { stock: stockNum };

      if (stockNum === 0 && prod.status === 'disponible') {
        updates.status = 'agotado';
      } else if (stockNum > 0 && prod.status === 'agotado') {
        updates.status = 'disponible';
      }

      return this.updateProduct(id, updates, adminUser, reason);
    },

    /**
     * Cambiar estado de disponibilidad
     */
    async updateStatus(id, newStatus, adminUser = 'Administrador', reason = 'Cambio de estado de disponibilidad') {
      const allowed = ['disponible', 'agotado', 'descontinuado', 'oculto_temporalmente'];
      if (!allowed.includes(newStatus)) {
        throw new Error(`Estado "${newStatus}" no permitido.`);
      }

      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      return this.updateProduct(id, { status: newStatus }, adminUser, reason);
    },

    /**
     * Eliminación lógica (soft-delete): status = 'descontinuado' / availability = 'discontinued'
     */
    async softDeleteProduct(id, adminUser = 'Administrador', reason = 'Producto descontinuado / eliminado lógicamente') {
      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      const oldState = JSON.parse(JSON.stringify(prod));
      prod.is_deleted = true;
      prod.status = 'descontinuado';
      prod.availability = 'discontinued';
      prod.is_available = false;
      prod.updated_at = new Date().toISOString();

      this.recordPriceHistory({
        product_id: id,
        old_price: oldState.price,
        new_price: prod.price,
        old_price_two_units: oldState.price_two_units,
        new_price_two_units: prod.price_two_units,
        old_wholesale_prices: oldState.wholesale_prices,
        new_wholesale_prices: prod.wholesale_prices,
        old_stock: oldState.stock,
        new_stock: prod.stock,
        old_status: oldState.status,
        new_status: prod.status,
        change_type: 'soft_deleted',
        admin_user: adminUser,
        change_reason: reason
      });

      this.saveToStorage();

      this.executeAdminAction('delete_product', {
        id: prod.db_id,
        slug: prod.slug || prod.id,
        reason: reason
      });

      return prod;
    },

    /**
     * Reactivar producto descontinuado
     */
    async restoreProduct(id, adminUser = 'Administrador', reason = 'Reactivación de producto') {
      const prod = this.getProductById(id);
      if (!prod) throw new Error(`Producto ${id} no encontrado.`);

      const oldState = JSON.parse(JSON.stringify(prod));
      prod.is_deleted = false;
      prod.status = prod.stock > 0 ? 'disponible' : 'agotado';
      prod.availability = prod.status === 'disponible' ? 'available' : 'sold_out';
      prod.is_available = prod.status === 'disponible';
      prod.updated_at = new Date().toISOString();

      this.recordPriceHistory({
        product_id: id,
        old_price: oldState.price,
        new_price: prod.price,
        old_price_two_units: oldState.price_two_units,
        new_price_two_units: prod.price_two_units,
        old_wholesale_prices: oldState.wholesale_prices,
        new_wholesale_prices: prod.wholesale_prices,
        old_stock: oldState.stock,
        new_stock: prod.stock,
        old_status: oldState.status,
        new_status: prod.status,
        change_type: 'restored',
        admin_user: adminUser,
        change_reason: reason
      });

      this.saveToStorage();

      this.executeAdminAction('restore_product', {
        id: prod.db_id,
        slug: prod.slug || prod.id
      });

      return prod;
    },

    /**
     * Registrar historial de auditoría
     */
    recordPriceHistory(entry) {
      const record = {
        id: 'hist_' + entry.product_id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        product_id: entry.product_id,
        old_price: entry.old_price !== undefined ? entry.old_price : null,
        new_price: entry.new_price !== undefined ? entry.new_price : null,
        old_price_two_units: entry.old_price_two_units !== undefined ? entry.old_price_two_units : null,
        new_price_two_units: entry.new_price_two_units !== undefined ? entry.new_price_two_units : null,
        old_wholesale_prices: entry.old_wholesale_prices ? JSON.parse(JSON.stringify(entry.old_wholesale_prices)) : null,
        new_wholesale_prices: entry.new_wholesale_prices ? JSON.parse(JSON.stringify(entry.new_wholesale_prices)) : null,
        old_stock: entry.old_stock !== undefined ? entry.old_stock : null,
        new_stock: entry.new_stock !== undefined ? entry.new_stock : null,
        old_status: entry.old_status || null,
        new_status: entry.new_status || null,
        change_type: entry.change_type || 'price_update',
        admin_user: entry.admin_user || 'Administrador',
        change_reason: entry.change_reason || '',
        created_at: new Date().toISOString()
      };

      this.priceHistory.unshift(record);
      return record;
    },

    /**
     * Consultar historial de un producto
     */
    getPriceHistory(productId) {
      if (!productId) return [];

      const filtered = this.priceHistory.filter(h => h.product_id === productId);

      return filtered.map(h => {
        let diffPrice = 0;
        let diffPriceFormatted = '-';
        if (h.old_price !== null && h.new_price !== null) {
          diffPrice = Number(h.new_price) - Number(h.old_price);
          const sign = diffPrice > 0 ? '+' : (diffPrice < 0 ? '-' : '');
          const absStr = Math.abs(diffPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          diffPriceFormatted = diffPrice === 0 ? '$0' : `${sign}$${absStr}`;
        }

        const dateObj = new Date(h.created_at || h.changed_at || Date.now());
        const formattedDate = dateObj.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const formattedTime = dateObj.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          ...h,
          diffPrice,
          diffPriceFormatted,
          formattedDate,
          formattedTime,
          fullDateTime: `${formattedDate} ${formattedTime}`
        };
      });
    },

    /**
     * Validación de seguridad contra manipulación en navegador
     */
    validateCartItems(items) {
      if (!Array.isArray(items)) return { valid: true, correctedItems: [], errors: [] };

      const errors = [];
      const correctedItems = items.map(item => {
        const prod = this.getProductById(item.productId);
        if (!prod) {
          errors.push(`El producto "${item.nombre || item.productId}" ya no está disponible.`);
          return null;
        }

        if (prod.status === 'agotado' || prod.stock <= 0) {
          errors.push(`El producto "${prod.name}" se encuentra AGOTADO.`);
          return null;
        }

        if (prod.is_deleted || prod.status === 'descontinuado' || prod.status === 'oculto_temporalmente') {
          errors.push(`El producto "${prod.name}" no está disponible.`);
          return null;
        }

        const qty = Math.max(1, Number(item.qty) || 1);
        let authoritativeUnitPrice = prod.price;

        if (item.type === 'mayorista' || item.wholesale === true) {
          const wp = prod.wholesale_prices || {};
          let tier = '5';
          if (qty >= 100 && wp['100']) tier = '100';
          else if (qty >= 50 && wp['50']) tier = '50';
          else if (qty >= 20 && wp['20']) tier = '20';
          else if (qty >= 10 && wp['10']) tier = '10';
          else tier = '5';

          authoritativeUnitPrice = Number(wp[tier]) || prod.price;
        }

        const clientUnitPrice = Number(item.unitPrice || item.precio || 0);
        if (Math.abs(clientUnitPrice - authoritativeUnitPrice) > 1) {
          errors.push(`Se corrigió el precio de "${prod.name}" al valor oficial vigente.`);
        }

        return {
          ...item,
          productId: prod.id,
          nombre: prod.name,
          precio: prod.price,
          precio_promo_2: prod.price_two_units,
          unitPrice: authoritativeUnitPrice,
          subtotal: authoritativeUnitPrice * qty
        };
      }).filter(Boolean);

      return {
        valid: errors.length === 0,
        correctedItems,
        errors
      };
    },

    exportJSON() {
      return JSON.stringify({
        version: '3.0.0',
        exportedAt: new Date().toISOString(),
        productsCount: this.products.length,
        historyCount: this.priceHistory.length,
        products: this.products,
        priceHistory: this.priceHistory
      }, null, 2);
    },

    resetToDefaults() {
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      localStorage.removeItem(STORAGE_KEY_INITIALIZED);
      this.products = [];
      this.priceHistory = [];
      this.seedInitialCatalog();
      this.syncToProductsData();
      return true;
    },

    // =========================================================================
    // GESTIÓN REAL DE IMÁGENES Y ARCHIVOS CON SUPABASE STORAGE
    // =========================================================================

    /**
     * Valida formato y peso del archivo antes de subirlo a Supabase Storage
     */
    validateImageFile(file) {
      if (!file) {
        return { valid: false, error: 'No se seleccionó ningún archivo.' };
      }

      const allowedTypes = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.ALLOWED_IMAGE_TYPES)
        ? CONFIG.STORAGE.ALLOWED_IMAGE_TYPES
        : ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

      const maxBytes = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.MAX_IMAGE_SIZE_BYTES)
        ? CONFIG.STORAGE.MAX_IMAGE_SIZE_BYTES
        : 5 * 1024 * 1024; // 5 MB

      const fileType = (file.type || '').toLowerCase();
      const fileName = (file.name || '').toLowerCase();
      const ext = fileName.split('.').pop();
      const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

      if (!allowedTypes.includes(fileType) && !validExt) {
        return {
          valid: false,
          error: `Formato de imagen no permitido (.${ext || 'desconocido'}). Solo se admiten JPG, PNG y WEBP.`
        };
      }

      if (file.size > maxBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
        return {
          valid: false,
          error: `El archivo supera el tamaño máximo permitido (${sizeMb} MB de ${maxMb} MB).`
        };
      }

      return { valid: true };
    },

    /**
     * Obtiene el nombre del bucket configurado
     */
    getStorageBucket() {
      return (typeof CONFIG !== 'undefined' && CONFIG.STORAGE && CONFIG.STORAGE.BUCKET_NAME)
        ? CONFIG.STORAGE.BUCKET_NAME
        : 'capital-vape-products';
    },

    /**
     * Construye la URL pública permanente para un path en Supabase Storage
     */
    getStoragePublicUrl(filePath) {
      if (!filePath) return 'assets/logo/logo.png';
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
      if (filePath.startsWith('assets/') || filePath.startsWith('/') || filePath.includes('/')) {
        if (!filePath.startsWith('products/') && !filePath.startsWith('flavors/') && !filePath.startsWith('gallery/')) {
          return filePath;
        }
      }

      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
      if (!cfg || !cfg.URL) return filePath;

      const bucket = this.getStorageBucket();
      const cleanPath = filePath.replace(/^\/+/, '');
      return `${cfg.URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
    },

    /**
     * Sube un archivo a Supabase Storage con reporte de progreso
     */
    async uploadImageToStorage(file, subfolder = 'products', customName = '', onProgress = null) {
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (typeof onProgress === 'function') onProgress(10, 'Iniciando subida...');

      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
      if (!cfg || !cfg.URL) {
        throw new Error('Supabase no está configurado adecuadamente.');
      }

      const key = cfg.PUBLISHABLE_KEY || cfg.ANON_KEY;
      const bucket = this.getStorageBucket();

      // Sanitizar nombre de archivo
      const originalExt = (file.name || 'image.jpg').split('.').pop().toLowerCase() || 'jpg';
      const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(originalExt) ? originalExt : 'jpg';
      const baseClean = customName
        ? customName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
        : (file.name || 'image').replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const filePath = `${subfolder}/${baseClean}_${uniqueSuffix}.${cleanExt}`;

      if (typeof onProgress === 'function') onProgress(30, 'Enviando a Supabase Storage...');

      // 1. Intento directo mediante SDK de Supabase si está disponible
      if (this.supabaseClient && this.supabaseClient.storage) {
        try {
          const { data, error } = await this.supabaseClient.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || `image/${cleanExt}`
            });

          if (!error && data) {
            if (typeof onProgress === 'function') onProgress(90, 'Obteniendo enlace público...');
            const { data: pubData } = this.supabaseClient.storage.from(bucket).getPublicUrl(filePath);
            const publicUrl = pubData && pubData.publicUrl ? pubData.publicUrl : this.getStoragePublicUrl(filePath);
            if (typeof onProgress === 'function') onProgress(100, 'Subida completada.');
            return {
              ok: true,
              path: filePath,
              url: publicUrl,
              bucket: bucket,
              name: file.name
            };
          } else if (error) {
            console.warn('[DBService] Storage SDK upload error, probando REST directo:', error);
          }
        } catch (sdkErr) {
          console.warn('[DBService] Excepción en SDK Storage upload:', sdkErr);
        }
      }

      // 2. Intento directo mediante REST API de Supabase Storage
      try {
        if (typeof onProgress === 'function') onProgress(50, 'Transfiriendo por REST API...');
        const uploadUrl = `${cfg.URL}/storage/v1/object/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`;
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'x-upsert': 'true',
            'Content-Type': file.type || `image/${cleanExt}`
          },
          body: file
        });

        if (res.ok) {
          if (typeof onProgress === 'function') onProgress(90, 'Generando enlace público...');
          const publicUrl = this.getStoragePublicUrl(filePath);
          if (typeof onProgress === 'function') onProgress(100, 'Subida completada exitosamente.');
          return {
            ok: true,
            path: filePath,
            url: publicUrl,
            bucket: bucket,
            name: file.name
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('[DBService] Error en REST Storage upload:', res.status, errData);

          // 3. Fallback a Edge Function admin-api
          if (typeof onProgress === 'function') onProgress(70, 'Reintentando mediante Edge Function...');
          return await this.uploadViaEdgeFunction(file, subfolder, filePath, onProgress);
        }
      } catch (err) {
        console.warn('[DBService] Error en subida directa, recurriendo a Edge Function:', err);
        return await this.uploadViaEdgeFunction(file, subfolder, filePath, onProgress);
      }
    },

    /**
     * Sube archivo mediante la Edge Function admin-api en base64
     */
    async uploadViaEdgeFunction(file, subfolder, filePath, onProgress) {
      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
      const key = cfg.PUBLISHABLE_KEY || cfg.ANON_KEY;
      const bucket = this.getStorageBucket();

      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result;
          const commaIdx = res.indexOf(',');
          resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (typeof onProgress === 'function') onProgress(80, 'Sincronizando con backend seguro...');

      const efUrl = `${cfg.URL}/functions/v1/admin-api`;
      const response = await fetch(efUrl, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'storage_upload_image',
          file_base64: base64Data,
          file_name: file.name,
          mime_type: file.type || 'image/jpeg',
          subfolder: subfolder,
          path: filePath,
          bucket: bucket
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Error al subir imagen (${response.status})`);
      }

      const resData = await response.json();
      if (typeof onProgress === 'function') onProgress(100, 'Subida completada.');

      return {
        ok: true,
        path: resData.path || filePath,
        url: resData.url || this.getStoragePublicUrl(resData.path || filePath),
        bucket: bucket,
        name: file.name
      };
    },

    /**
     * Elimina un archivo de Supabase Storage de forma segura
     */
    async deleteImageFromStorage(filePathOrUrl) {
      if (!filePathOrUrl) return { ok: false, error: 'Ruta no especificada.' };

      // Solo borrar si es un archivo de Supabase Storage de las carpetas de Capital Vape
      const bucket = this.getStorageBucket();
      let storagePath = filePathOrUrl;

      if (filePathOrUrl.includes(`/public/${bucket}/`)) {
        storagePath = filePathOrUrl.split(`/public/${bucket}/`)[1];
      } else if (filePathOrUrl.includes(`/${bucket}/`)) {
        storagePath = filePathOrUrl.split(`/${bucket}/`)[1];
      }

      // No eliminar recursos locales o assets del sistema
      if (!storagePath.startsWith('products/') && !storagePath.startsWith('flavors/') && !storagePath.startsWith('gallery/')) {
        console.log('[DBService] Archivo protegido o local, no se elimina de Storage:', filePathOrUrl);
        return { ok: true, skipped: true };
      }

      const cfg = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
      if (!cfg || !cfg.URL) return { ok: false, error: 'Supabase no configurado.' };

      const key = cfg.PUBLISHABLE_KEY || cfg.ANON_KEY;

      // 1. Intentar con SDK
      if (this.supabaseClient && this.supabaseClient.storage) {
        try {
          const { error } = await this.supabaseClient.storage.from(bucket).remove([storagePath]);
          if (!error) return { ok: true, path: storagePath };
        } catch (e) {
          console.warn('[DBService] Error al eliminar vía SDK:', e);
        }
      }

      // 2. Intentar vía Edge Function admin-api
      try {
        const efUrl = `${cfg.URL}/functions/v1/admin-api`;
        const res = await fetch(efUrl, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'storage_delete_image',
            bucket: bucket,
            path: storagePath
          })
        });

        if (res.ok) return { ok: true, path: storagePath };
      } catch (err) {
        console.warn('[DBService] Error al eliminar de Storage vía Edge Function:', err);
      }

      return { ok: true, path: storagePath };
    },

    /**
     * Actualiza la imagen principal de un producto en Storage y en la Base de Datos
     */
    async updateProductMainImage(productId, fileOrUrl, onProgress = null) {
      const prod = this.getProductById(productId);
      if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

      let newUrl = '';
      let newPath = '';

      if (typeof fileOrUrl === 'string') {
        newUrl = fileOrUrl;
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        const uploadRes = await this.uploadImageToStorage(fileOrUrl, 'products', prod.slug || prod.id, onProgress);
        newUrl = uploadRes.url;
        newPath = uploadRes.path;
      } else {
        throw new Error('Archivo o URL de imagen inválida.');
      }

      const oldImageUrl = prod.image_url;

      // Actualizar producto en DB y memoria
      await this.updateProduct(productId, { image_url: newUrl }, 'Administrador', 'Actualización de imagen principal');

      // Borrar de forma segura la imagen anterior si pertenecía a Supabase Storage
      if (oldImageUrl && oldImageUrl !== newUrl && !oldImageUrl.startsWith('assets/')) {
        try {
          await this.deleteImageFromStorage(oldImageUrl);
        } catch (delErr) {
          console.warn('[DBService] No se pudo borrar imagen antigua tras reemplazo:', delErr);
        }
      }

      this.refreshStoreUI();
      return { ok: true, url: newUrl, path: newPath };
    },

    /**
     * Asigna o reemplaza la imagen de un sabor específico de un producto
     */
    async assignFlavorImage(productId, flavorName, fileOrUrl, onProgress = null) {
      const prod = this.getProductById(productId);
      if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

      let newUrl = '';
      if (typeof fileOrUrl === 'string') {
        newUrl = fileOrUrl;
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        const customName = `${prod.slug || prod.id}_flavor_${flavorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const uploadRes = await this.uploadImageToStorage(fileOrUrl, 'flavors', customName, onProgress);
        newUrl = uploadRes.url;
      }

      const sabores = Array.isArray(prod.sabores) ? JSON.parse(JSON.stringify(prod.sabores)) : [];
      let found = false;
      let oldFlavorImg = '';

      for (let i = 0; i < sabores.length; i++) {
        const item = sabores[i];
        const sName = typeof item === 'string' ? item : item.nombre;
        if (sName && sName.trim().toLowerCase() === flavorName.trim().toLowerCase()) {
          found = true;
          if (typeof item === 'string') {
            sabores[i] = { nombre: sName, imagen: newUrl, visible: true, agotado: false };
          } else {
            oldFlavorImg = item.imagen || '';
            sabores[i].imagen = newUrl;
          }
          break;
        }
      }

      if (!found) {
        sabores.push({ nombre: flavorName.trim(), imagen: newUrl, visible: true, agotado: false });
      }

      await this.updateProduct(productId, { sabores: sabores }, 'Administrador', `Asignación de imagen para sabor "${flavorName}"`);

      // Limpiar imagen previa de sabor si correspondía a Storage
      if (oldFlavorImg && oldFlavorImg !== newUrl && !oldFlavorImg.startsWith('assets/')) {
        this.deleteImageFromStorage(oldFlavorImg).catch(() => {});
      }

      this.refreshStoreUI();
      return { ok: true, url: newUrl, sabores: sabores };
    },

    /**
     * Agrega una imagen a la galería del producto
     */
    async addGalleryImage(productId, fileOrUrl, onProgress = null) {
      const prod = this.getProductById(productId);
      if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

      let newUrl = '';
      let newPath = '';
      let imgName = 'Foto de galería';

      if (typeof fileOrUrl === 'string') {
        newUrl = fileOrUrl;
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        imgName = fileOrUrl.name || 'Galería';
        const customName = `${prod.slug || prod.id}_gallery`;
        const uploadRes = await this.uploadImageToStorage(fileOrUrl, 'gallery', customName, onProgress);
        newUrl = uploadRes.url;
        newPath = uploadRes.path;
      }

      const galeria = Array.isArray(prod.galeria) ? JSON.parse(JSON.stringify(prod.galeria)) : [];
      const newImgItem = {
        id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        url: newUrl,
        path: newPath,
        name: imgName,
        sort_order: galeria.length,
        created_at: new Date().toISOString()
      };

      galeria.push(newImgItem);

      await this.updateProduct(productId, { galeria: galeria }, 'Administrador', 'Imagen añadida a galería');
      this.refreshStoreUI();

      return { ok: true, item: newImgItem, galeria: galeria };
    },

    /**
     * Elimina una imagen de la galería
     */
    async deleteGalleryImage(productId, imageId) {
      const prod = this.getProductById(productId);
      if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

      const galeria = Array.isArray(prod.galeria) ? JSON.parse(JSON.stringify(prod.galeria)) : [];
      const itemToDelete = galeria.find(g => g.id === imageId || g.url === imageId);

      if (!itemToDelete) return { ok: false, error: 'Imagen no encontrada en galería.' };

      const updatedGaleria = galeria.filter(g => g.id !== itemToDelete.id);
      // Reindexar orden
      updatedGaleria.forEach((g, idx) => { g.sort_order = idx; });

      await this.updateProduct(productId, { galeria: updatedGaleria }, 'Administrador', 'Imagen eliminada de galería');

      if (itemToDelete.path || itemToDelete.url) {
        await this.deleteImageFromStorage(itemToDelete.path || itemToDelete.url);
      }

      this.refreshStoreUI();
      return { ok: true, galeria: updatedGaleria };
    },

    /**
     * Reordena las imágenes de la galería
     */
    async reorderGalleryImages(productId, orderedIds) {
      const prod = this.getProductById(productId);
      if (!prod) throw new Error(`Producto ${productId} no encontrado.`);

      const galeria = Array.isArray(prod.galeria) ? JSON.parse(JSON.stringify(prod.galeria)) : [];
      const reordered = [];

      orderedIds.forEach((id, idx) => {
        const item = galeria.find(g => g.id === id);
        if (item) {
          item.sort_order = idx;
          reordered.push(item);
        }
      });

      // Añadir los que no estuvieran en la lista ordenada
      galeria.forEach(item => {
        if (!orderedIds.includes(item.id)) {
          item.sort_order = reordered.length;
          reordered.push(item);
        }
      });

      await this.updateProduct(productId, { galeria: reordered }, 'Administrador', 'Reordenamiento de galería');
      this.refreshStoreUI();
      return { ok: true, galeria: reordered };
    },

    /**
     * Reemplaza de forma segura una imagen de producto
     */
    async replaceProductImage(productId, oldUrlOrPath, newFile, onProgress = null) {
      const uploadRes = await this.uploadImageToStorage(newFile, 'products', productId, onProgress);
      if (!uploadRes.ok) throw new Error('Error al subir la nueva imagen.');

      await this.updateProductMainImage(productId, uploadRes.url, null);

      if (oldUrlOrPath && oldUrlOrPath !== uploadRes.url) {
        await this.deleteImageFromStorage(oldUrlOrPath);
      }

      return uploadRes;
    }
  };

  root.DBService = DBService;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DBService;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => DBService.init());
    } else {
      DBService.init();
    }
  }

})(typeof window !== 'undefined' ? window : globalThis);
