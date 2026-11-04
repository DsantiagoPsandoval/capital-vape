/**
 * CAPITAL VAPE - Carrito Global Unificado (Detal + Mayorista)
 * Maneja persistencia en localStorage, cálculo dinámico de precios mayoristas por volumen total,
 * subtotales independientes y total general.
 */
const Cart = {
  items: [], // [{ key, type: 'detal'|'mayorista', productId, nombre, subtitulo, imagen, variant, qty, unitPrice, subtotal, precio, precio_promo_2, activeTier }]
  destination: 'bogota', // 'bogota' | 'nacional'

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateUI();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('cv_cart_unified') || localStorage.getItem('cv_cart_items') || localStorage.getItem('capital_vape_cart');
      const rawItems = saved ? JSON.parse(saved) : [];
      
      // Normalizar items y compatibilidad con versiones previas
      const normalized = [];
      rawItems.forEach(item => {
        if (!item || !item.productId) return;

        // Recuperar metadatos de doble sabor si corresponde a REIGN BAR PALETTE en modalidad de 2 sabores
        let isDualFlavor = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
        let flavor1 = item.flavor1 || '';
        let flavor2 = item.flavor2 || '';
        if (isDualFlavor && (!flavor1 || !flavor2) && item.variant && item.variant.includes(' + ')) {
          const parts = item.variant.split(' + ');
          flavor1 = parts[0].trim();
          flavor2 = parts[1].trim();
        }
        
        if (item.type === 'mayorista') {
          const qty = Number(item.qty || item.packQty || 1);
          const key = `mayorista__${item.productId}__${item.variant || 'default'}`;
          const existing = normalized.find(n => n.key === key);
          if (existing) {
            existing.qty += qty;
          } else {
            normalized.push({
              key: key,
              type: 'mayorista',
              productId: item.productId,
              nombre: item.nombre,
              subtitulo: item.subtitulo || '',
              imagen: item.imagen,
              variant: item.variant || 'Surtido / A convenir',
              isDualFlavor: isDualFlavor,
              flavor1: flavor1,
              flavor2: flavor2,
              flavor1Img: item.flavor1Img || '',
              flavor2Img: item.flavor2Img || '',
              compositeImg: item.compositeImg || '',
              qty: qty
            });
          }
        } else {
          const qty = Number(item.qty || 1);
          const key = item.key || `detal__${item.productId}__${item.variant || 'default'}`;
          const existing = normalized.find(n => n.key === key);
          if (existing) {
            existing.qty += qty;
          } else {
            normalized.push({
              key: key,
              type: 'detal',
              productId: item.productId,
              nombre: item.nombre,
              subtitulo: item.subtitulo || '',
              imagen: item.imagen,
              precio: item.precio,
              precio_promo_2: item.precio_promo_2,
              variant: item.variant || '',
              isDualFlavor: isDualFlavor,
              flavor1: flavor1,
              flavor2: flavor2,
              flavor1Img: item.flavor1Img || '',
              flavor2Img: item.flavor2Img || '',
              compositeImg: item.compositeImg || '',
              qty: qty
            });
          }
        }
      });
      this.items = normalized;

      const savedDest = localStorage.getItem('cv_shipping_dest');
      if (savedDest) this.destination = savedDest;

      this.recalculateWholesalePrices();
    } catch (e) {
      console.error('Error loading cart:', e);
      this.items = [];
    }
  },

  saveToStorage() {
    localStorage.setItem('cv_cart_unified', JSON.stringify(this.items));
    localStorage.setItem('cv_cart_items', JSON.stringify(this.items));
    localStorage.setItem('capital_vape_cart', JSON.stringify(this.items));
    localStorage.setItem('cv_shipping_dest', this.destination);
  },

  setDestination(dest) {
    this.destination = dest;
    this.saveToStorage();
    this.updateUI();
  },

  /**
   * REGLA FUNDAMENTAL DE PRECIOS MAYORISTAS:
   * 1. Cantidad TOTAL de unidades mayoristas en el carrito
   * 2. Identificar el rango correspondiente:
   *    - 5 a 9 unidades   -> Rango 5
   *    - 10 a 19 unidades -> Rango 10
   *    - 20 a 49 unidades -> Rango 20
   *    - 50 a 99 unidades -> Rango 50
   *    - 100+ unidades    -> Rango 100
   * 3. Obtener el precio unitario del rango para cada producto
   * 4. Multiplicar todas las unidades de cada producto por ese precio unitario
   */
  recalculateWholesalePrices() {
    const wsItems = this.getWholesaleItems();
    if (wsItems.length === 0) return;

    // 1. Agrupar la cantidad total por REFERENCIA DE PRODUCTO (productId)
    // El sabor no define la referencia mayorista, la referencia principal es el producto.
    const qtyByProduct = {};
    wsItems.forEach(item => {
      qtyByProduct[item.productId] = (qtyByProduct[item.productId] || 0) + (Number(item.qty) || 0);
    });

    // 2. Calcular precio unitario y rango de descuento por cada referencia
    // y aplicarlo a todos los sabores pertenecientes a esa misma referencia
    wsItems.forEach(item => {
      const refTotalQty = qtyByProduct[item.productId] || (Number(item.qty) || 0);
      let unitPrice = 0;
      let activeTier = 5;

      if (typeof WholesaleService !== 'undefined') {
        activeTier = WholesaleService.getWholesaleTier(refTotalQty);
        unitPrice = WholesaleService.getProductWholesaleUnitPrice(item.productId, refTotalQty);
      } else {
        const prod = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
        unitPrice = prod ? prod.precio : 0;
      }

      item.unitPrice = unitPrice;
      item.subtotal = item.qty * unitPrice;
      item.activeTier = activeTier;
      item.refTotalQty = refTotalQty;
    });
  },

  // 1. Agregar Producto al Detal
  addItem(product, variant, qty = 1, extraMeta = null) {
    if (typeof product === 'string') {
      const found = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === product) : null;
      if (!found) return;
      product = found;
    }

    let resolvedVariant = variant || (product.sabores && product.sabores[0] ? product.sabores[0].nombre : (product.colores && product.colores[0] ? product.colores[0].nombre : ''));
    let isDualFlavor = (extraMeta && typeof extraMeta.isDualFlavor === 'boolean')
      ? extraMeta.isDualFlavor
      : (product.id === 'reign-bar-palette' && (!resolvedVariant || resolvedVariant.includes(' + ')));
    let singleImg = (extraMeta && extraMeta.singleImg) || '';
    if (!isDualFlavor && !singleImg && product.sabores && resolvedVariant) {
      const fSingleObj = product.sabores.find(s => s.nombre === resolvedVariant);
      if (fSingleObj && fSingleObj.img) singleImg = fSingleObj.img;
    }
    let flavor1 = (extraMeta && extraMeta.flavor1) || '';
    let flavor2 = (extraMeta && extraMeta.flavor2) || '';
    let flavor1Img = (extraMeta && extraMeta.flavor1Img) || '';
    let flavor2Img = (extraMeta && extraMeta.flavor2Img) || '';
    let compositeImg = (extraMeta && extraMeta.compositeImg) || '';

    if (isDualFlavor && (!flavor1 || !flavor2)) {
      if (resolvedVariant && resolvedVariant.includes(' + ')) {
        const parts = resolvedVariant.split(' + ');
        flavor1 = parts[0].trim();
        flavor2 = parts[1].trim();
      } else if (typeof ReignPaletteConfigurator !== 'undefined') {
        flavor1 = ReignPaletteConfigurator.flavor1;
        flavor2 = ReignPaletteConfigurator.flavor2;
        resolvedVariant = `${flavor1} + ${flavor2}`;
        compositeImg = ReignPaletteConfigurator.lastCompositeDataUrl || '';
      } else if (product.sabores && product.sabores.length > 0) {
        flavor1 = product.sabores[0].nombre;
        flavor2 = (product.sabores[1] || product.sabores[0]).nombre;
        resolvedVariant = `${flavor1} + ${flavor2}`;
      }
      if (product.sabores) {
        const f1Obj = product.sabores.find(s => s.nombre === flavor1);
        const f2Obj = product.sabores.find(s => s.nombre === flavor2);
        if (f1Obj && f1Obj.img) flavor1Img = f1Obj.img;
        if (f2Obj && f2Obj.img) flavor2Img = f2Obj.img;
      }
    }

    const itemKey = `detal__${product.id}__${resolvedVariant || 'default'}`;
    const existing = this.items.find(i => i.key === itemKey);

    if (existing) {
      existing.qty += qty;
      if (compositeImg) existing.compositeImg = compositeImg;
      if (flavor1) existing.flavor1 = flavor1;
      if (flavor2) existing.flavor2 = flavor2;
      if (flavor1Img) existing.flavor1Img = flavor1Img;
      if (flavor2Img) existing.flavor2Img = flavor2Img;
    } else {
      this.items.push({
        key: itemKey,
        type: 'detal',
        productId: product.id,
        nombre: product.nombre,
        subtitulo: product.subtitulo || '',
        imagen: compositeImg || singleImg || flavor1Img || product.imagen,
        precio: product.precio,
        precio_promo_2: product.precio_promo_2,
        variant: resolvedVariant,
        isDualFlavor: isDualFlavor,
        flavor1: flavor1,
        flavor2: flavor2,
        flavor1Img: flavor1Img,
        flavor2Img: flavor2Img,
        compositeImg: compositeImg,
        qty: qty
      });
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show(`✓ ¡"${product.nombre} ${resolvedVariant ? '(' + resolvedVariant + ')' : ''}" agregado al carrito Detal!`, 'success');
    this.pulseCartBadge();
  },

  // 2. Agregar Paquete/Unidades Mayoristas
  addWholesalePack(productId, packQty) {
    const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    if (!product) return;

    const qtyToAdd = Number(packQty) || 5;
    let isDualFlavor = product.id === 'reign-bar-palette'
      ? (typeof ReignPaletteConfigurator !== 'undefined' ? ReignPaletteConfigurator.mode !== 'single' : true)
      : false;
    let flavor = (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants[productId]) 
      || (product.sabores && product.sabores[0] ? product.sabores[0].nombre : (product.colores && product.colores[0] ? product.colores[0].nombre : 'Surtido / A convenir'));

    if (product.id === 'reign-bar-palette' && typeof ReignPaletteConfigurator !== 'undefined' && !isDualFlavor) {
      flavor = ReignPaletteConfigurator.singleFlavor || flavor;
    }

    let flavor1 = '';
    let flavor2 = '';
    let flavor1Img = '';
    let flavor2Img = '';
    let compositeImg = '';

    if (isDualFlavor) {
      if (typeof ReignPaletteConfigurator !== 'undefined') {
        flavor1 = ReignPaletteConfigurator.flavor1;
        flavor2 = ReignPaletteConfigurator.flavor2;
        flavor = `${flavor1} + ${flavor2}`;
        compositeImg = ReignPaletteConfigurator.lastCompositeDataUrl || '';
      } else if (flavor && flavor.includes(' + ')) {
        const parts = flavor.split(' + ');
        flavor1 = parts[0].trim();
        flavor2 = parts[1].trim();
      } else if (product.sabores && product.sabores.length > 0) {
        flavor1 = product.sabores[0].nombre;
        flavor2 = (product.sabores[1] || product.sabores[0]).nombre;
        flavor = `${flavor1} + ${flavor2}`;
      }
      if (product.sabores) {
        const f1Obj = product.sabores.find(s => s.nombre === flavor1);
        const f2Obj = product.sabores.find(s => s.nombre === flavor2);
        if (f1Obj && f1Obj.img) flavor1Img = f1Obj.img;
        if (f2Obj && f2Obj.img) flavor2Img = f2Obj.img;
      }
    }

    // Determine image for variant
    let img = compositeImg || flavor1Img || product.imagen;
    if (!isDualFlavor && product.sabores) {
      const f = product.sabores.find(s => s.nombre === flavor);
      if (f && f.img) img = f.img;
    } else if (product.colores) {
      const c = product.colores.find(c => c.nombre === flavor);
      if (c && c.img) img = c.img;
    }

    const itemKey = `mayorista__${product.id}__${flavor || 'default'}`;
    const existing = this.items.find(i => i.key === itemKey);

    if (existing) {
      existing.qty += qtyToAdd;
    } else {
      this.items.push({
        key: itemKey,
        type: 'mayorista',
        productId: product.id,
        nombre: product.nombre,
        subtitulo: product.subtitulo || '',
        imagen: img,
        variant: flavor,
        isDualFlavor: isDualFlavor,
        flavor1: flavor1,
        flavor2: flavor2,
        flavor1Img: flavor1Img,
        flavor2Img: flavor2Img,
        compositeImg: compositeImg,
        qty: qtyToAdd,
        unitPrice: 0,
        subtotal: 0
      });
    }

    // Recalcular dinámicamente todos los precios del carrito con el nuevo volumen total
    this.recalculateWholesalePrices();
    this.saveToStorage();
    this.updateUI();
    
    const refItems = this.getWholesaleItems().filter(i => i.productId === product.id);
    const refQty = refItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const tier = typeof WholesaleService !== 'undefined' ? WholesaleService.getWholesaleTier(refQty) : 5;
    Toast.show(`✓ ¡+${qtyToAdd} uds de "${product.nombre}" (${flavor}) agregadas! Total ${product.nombre}: ${refQty} uds (Tarifa +${tier}).`, 'success');
    this.pulseCartBadge();
  },

  pulseCartBadge() {
    const badges = document.querySelectorAll('.cart-count-badge, .wholesale-cart-count-badge');
    badges.forEach(b => {
      b.classList.remove('pulse-anim');
      void b.offsetWidth;
      b.classList.add('pulse-anim');
    });
  },

  updateQty(itemKey, delta) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(itemKey);
      return;
    }

    if (item.type === 'mayorista') {
      this.recalculateWholesalePrices();
    }

    this.saveToStorage();
    this.updateUI();
  },

  changeItemVariant(itemKey, newVariant) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item || item.variant === newVariant) return;

    const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
    let newImg = item.imagen;
    if (product) {
      if (product.sabores) {
        const f = product.sabores.find(s => s.nombre === newVariant);
        if (f && f.img) newImg = f.img;
      } else if (product.colores) {
        const c = product.colores.find(c => c.nombre === newVariant);
        if (c && c.img) newImg = c.img;
      }
    }

    if (item.type === 'mayorista') {
      const newKey = `mayorista__${item.productId}__${newVariant || 'default'}`;
      const existingTarget = this.items.find(i => i.key === newKey && i.key !== itemKey);
      if (existingTarget) {
        existingTarget.qty += item.qty;
        this.items = this.items.filter(i => i.key !== itemKey);
      } else {
        item.key = newKey;
        item.variant = newVariant;
        item.imagen = newImg;
      }
      this.recalculateWholesalePrices();
    } else {
      const newKey = `detal__${item.productId}__${newVariant || 'default'}`;
      const existingTarget = this.items.find(i => i.key === newKey && i.key !== itemKey);
      if (existingTarget) {
        existingTarget.qty += item.qty;
        this.items = this.items.filter(i => i.key !== itemKey);
      } else {
        item.key = newKey;
        item.variant = newVariant;
        item.imagen = newImg;
      }
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show(`Sabor actualizado a "${newVariant}"`, 'success');
  },

  removeItem(itemKey) {
    const item = this.items.find(i => i.key === itemKey);
    this.items = this.items.filter(i => i.key !== itemKey);
    
    this.recalculateWholesalePrices();
    this.saveToStorage();
    this.updateUI();
    if (item) {
      Toast.show(`"${item.nombre}" eliminado del carrito.`, 'info');
    }
  },

  clearCart() {
    if (this.items.length === 0) return;
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito (Detal y Mayorista)?')) {
      this.items = [];
      this.saveToStorage();
      this.updateUI();
      Toast.show('Carrito vaciado completamente.', 'info');
    }
  },

  changeDualFlavor(itemKey, slot, newFlavor) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item) return;

    let f1 = item.flavor1 || (item.variant ? item.variant.split(' + ')[0] : '');
    let f2 = item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1] : f1);

    if (Number(slot) === 1) {
      f1 = newFlavor;
    } else {
      f2 = newFlavor;
    }

    const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
    let f1Img = item.flavor1Img || '';
    let f2Img = item.flavor2Img || '';
    if (product && product.sabores) {
      const s1 = product.sabores.find(s => s.nombre === f1);
      const s2 = product.sabores.find(s => s.nombre === f2);
      if (s1 && s1.img) f1Img = s1.img;
      if (s2 && s2.img) f2Img = s2.img;
    }

    const newVariant = `${f1} + ${f2}`;
    const prefix = item.type === 'mayorista' ? 'mayorista' : 'detal';
    const newKey = `${prefix}__${item.productId}__${newVariant}`;
    const existingTarget = this.items.find(i => i.key === newKey && i.key !== itemKey);

    if (existingTarget) {
      existingTarget.qty += item.qty;
      this.items = this.items.filter(i => i.key !== itemKey);
    } else {
      item.key = newKey;
      item.variant = newVariant;
      item.isDualFlavor = true;
      item.flavor1 = f1;
      item.flavor2 = f2;
      item.flavor1Img = f1Img;
      item.flavor2Img = f2Img;
    }

    if (item.type === 'mayorista') {
      this.recalculateWholesalePrices();
    }
    this.saveToStorage();
    this.updateUI();
    Toast.show(`Combinación actualizada: ${f1} + ${f2}`, 'success');
  },

  getDetalItems() {
    return this.items.filter(i => i.type !== 'mayorista');
  },

  getWholesaleItems() {
    return this.items.filter(i => i.type === 'mayorista');
  },

  getWholesaleTotalQty() {
    return this.getWholesaleItems().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  },

  /**
   * Calcula precios al detal agrupando por referencia de producto (productId)
   * para que la promoción de 2 unidades (ej: REIGN BAR PALETTE 2x $70.000)
   * aplique tanto si lleva 2 unidades con la misma combinación como si lleva
   * 2 unidades con combinaciones de sabores diferentes.
   */
  recalculateDetalPrices() {
    const detalItems = this.getDetalItems();
    const byProduct = {};
    detalItems.forEach(item => {
      if (!byProduct[item.productId]) byProduct[item.productId] = [];
      byProduct[item.productId].push(item);
    });

    Object.values(byProduct).forEach(group => {
      const first = group[0];
      const unitRegular = Number(first.precio) || 0;
      const promo2 = Number(first.precio_promo_2) || 0;
      const totalQty = group.reduce((s, i) => s + (Number(i.qty) || 0), 0);

      if (promo2 > 0 && promo2 < unitRegular * 2 && totalQty >= 2) {
        const pairs = Math.floor(totalQty / 2);
        let promoUnitsRemaining = pairs * 2;
        const promoUnitRate = promo2 / 2;

        group.forEach(item => {
          const q = Number(item.qty) || 0;
          const promoUnitsForItem = Math.min(q, promoUnitsRemaining);
          const regularUnitsForItem = q - promoUnitsForItem;
          promoUnitsRemaining -= promoUnitsForItem;

          item.calculatedLinePrice = (promoUnitsForItem * promoUnitRate) + (regularUnitsForItem * unitRegular);
          item.hasPromoApplied = promoUnitsForItem > 0;
          item.effectiveUnitPrice = q > 0 ? Math.round(item.calculatedLinePrice / q) : unitRegular;
        });
      } else {
        group.forEach(item => {
          const q = Number(item.qty) || 0;
          item.calculatedLinePrice = q * unitRegular;
          item.hasPromoApplied = false;
          item.effectiveUnitPrice = unitRegular;
        });
      }
    });
  },

  getDetalSubtotal() {
    this.recalculateDetalPrices();
    return this.getDetalItems().reduce((sum, item) => sum + (Number(item.calculatedLinePrice) || 0), 0);
  },

  getWholesaleSubtotal() {
    this.recalculateWholesalePrices();
    return this.getWholesaleItems().reduce((sum, item) => sum + (Number(item.subtotal) || (Number(item.qty || 0) * Number(item.unitPrice || 0))), 0);
  },

  getSubtotal() {
    return this.getDetalSubtotal() + this.getWholesaleSubtotal();
  },

  getTotalCount() {
    const detalCount = this.getDetalItems().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const wsCount = this.getWholesaleTotalQty();
    return detalCount + wsCount;
  },

  getShippingInfo() {
    const detalSubtotal = this.getDetalSubtotal();
    const detalItems = this.getDetalItems();
    const wsItems = this.getWholesaleItems();
    const hasDetal = detalItems.length > 0;
    const hasWholesale = wsItems.length > 0;
    const isWholesaleOnly = hasWholesale && !hasDetal;

    let standardCost = 10000;
    let threshold = 150000;
    let isFree = false;
    let cost = 0;
    let remaining = 0;
    let percent = 0;

    if (this.destination === 'soacha') {
      // Tarifa fija Soacha: SIEMPRE $15.000 COP, nunca gratis
      standardCost = CONFIG.SHIPPING?.SOACHA_COST || 15000;
      threshold = null;
      isFree = false;
      cost = (this.items.length === 0) ? 0 : standardCost;
      remaining = 0;
      percent = 0;
    } else if (this.destination === 'nacional') {
      standardCost = CONFIG.SHIPPING?.NACIONAL_STANDARD_COST || 18000;
      threshold = CONFIG.SHIPPING?.NACIONAL_FREE_THRESHOLD || 220000;
      // El envío gratis aplica ÚNICAMENTE a compras al detal
      isFree = hasDetal && (detalSubtotal >= threshold);
      remaining = isFree ? 0 : Math.max(0, threshold - detalSubtotal);
      cost = (this.items.length === 0 || isFree) ? 0 : standardCost;
      percent = threshold > 0 ? Math.min(100, Math.round((detalSubtotal / threshold) * 100)) : 0;
    } else {
      // Por defecto 'bogota'
      standardCost = CONFIG.SHIPPING?.BOGOTA_STANDARD_COST || 10000;
      threshold = CONFIG.SHIPPING?.BOGOTA_FREE_THRESHOLD || 150000;
      // El envío gratis aplica ÚNICAMENTE a compras al detal
      isFree = hasDetal && (detalSubtotal >= threshold);
      remaining = isFree ? 0 : Math.max(0, threshold - detalSubtotal);
      cost = (this.items.length === 0 || isFree) ? 0 : standardCost;
      percent = threshold > 0 ? Math.min(100, Math.round((detalSubtotal / threshold) * 100)) : 0;
    }

    return {
      destination: this.destination,
      isBogota: this.destination === 'bogota',
      isSoacha: this.destination === 'soacha',
      isNacional: this.destination === 'nacional',
      threshold,
      standardCost,
      isFree,
      remaining,
      cost,
      percent,
      hasDetal,
      hasWholesale,
      isWholesaleOnly
    };
  },

  getTotal() {
    if (this.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    const shipping = this.getShippingInfo();
    return subtotal + shipping.cost;
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  updateUI() {
    // 1. Update badges everywhere
    const totalCount = this.getTotalCount();
    document.querySelectorAll('.cart-count-badge, .wholesale-cart-count-badge').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    // 1.1 Update Bottom Bar Cart Subtotal
    const totalSubtotal = this.getSubtotal();
    const formattedSubtotal = this.formatCOP(totalSubtotal);
    const bottomCartSubtotalEl = document.getElementById('bottomCartSubtotal');
    if (bottomCartSubtotalEl) {
      bottomCartSubtotalEl.textContent = formattedSubtotal;
    }
    const floatCartSubtotalEl = document.getElementById('floatCartSubtotal');
    if (floatCartSubtotalEl) {
      floatCartSubtotalEl.textContent = formattedSubtotal;
    }

    // 2. Render Drawer Content
    const itemsContainer = document.getElementById('cartDrawerItems');
    const meterContainer = document.getElementById('cartShippingMeter');
    const footerContainer = document.getElementById('cartDrawerFooter');

    const detalItems = this.getDetalItems();
    const wsItems = this.getWholesaleItems();
    const detalSubtotal = this.getDetalSubtotal();
    const wsSubtotal = this.getWholesaleSubtotal();
    const shipping = this.getShippingInfo();
    const totalGeneral = this.getTotal();
    const totalWsQty = this.getWholesaleTotalQty();
    const activeTier = typeof WholesaleService !== 'undefined' ? WholesaleService.getWholesaleTier(totalWsQty) : 5;
    const tierInfo = typeof WholesaleService !== 'undefined' ? WholesaleService.getNextTierInfo(totalWsQty) : null;

    // Free Shipping Progress Meter & Shipping Destination Selector
    if (meterContainer) {
      const destButtonsHtml = `
        <div class="dest-toggle-group">
          <button type="button" class="dest-btn ${shipping.isBogota ? 'active' : ''}" onclick="Cart.setDestination('bogota')">
            <span class="dest-btn-title">📍 Bogotá</span>
            <small class="dest-btn-sub">Gratis &gt; $150k</small>
          </button>
          <button type="button" class="dest-btn ${shipping.isSoacha ? 'active' : ''}" onclick="Cart.setDestination('soacha')">
            <span class="dest-btn-title">📍 Soacha</span>
            <small class="dest-btn-sub">Tarifa $15.000</small>
          </button>
          <button type="button" class="dest-btn ${shipping.isNacional ? 'active' : ''}" onclick="Cart.setDestination('nacional')">
            <span class="dest-btn-title">🇨🇴 Nacional</span>
            <small class="dest-btn-sub">Gratis &gt; $220k</small>
          </button>
        </div>
      `;

      if (shipping.isWholesaleOnly) {
        meterContainer.innerHTML = `
          <div class="shipping-meter-box wholesale-meter-box">
            ${destButtonsHtml}
            <div class="meter-status" style="margin-top: 8px; font-size: 0.86rem; color: #F59E0B;">
              📦 <strong>Envíos Mayoristas:</strong> Se coordinan vía WhatsApp al <strong>3133572726</strong> según transportadora y volumen.
            </div>
          </div>
        `;
      } else if (shipping.isSoacha) {
        meterContainer.innerHTML = `
          <div class="shipping-meter-box">
            ${destButtonsHtml}
            <div class="meter-status" style="margin-top: 8px; font-size: 0.88rem; color: #EAB308;">
              📍 Tarifa fija de envío a Soacha: <strong>$15.000 COP</strong> (incluida en el total).
            </div>
          </div>
        `;
      } else {
        meterContainer.innerHTML = `
          <div class="shipping-meter-box">
            ${destButtonsHtml}
            <div class="meter-status">
              ${shipping.isFree 
                ? `<span class="free-badge">🎉 ¡Felicitaciones! Tienes <strong>ENVÍO GRATIS</strong> en tus productos al detal.</span>` 
                : `<span>🛍️ Te faltan <strong>${this.formatCOP(shipping.remaining)}</strong> al detal para obtener <strong>ENVÍO GRATIS</strong></span>`}
            </div>
            <div class="meter-bar-track">
              <div class="meter-bar-fill ${shipping.isFree ? 'complete' : ''}" style="width: ${shipping.percent}%;"></div>
            </div>
          </div>
        `;
      }
    }

    // Items list (Strictly Separated DETAL and MAYORISTA)
    if (itemsContainer) {
      if (this.items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <img src="assets/icons/carrito.png" class="empty-cart-img" alt="Carrito Vacío">
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestro catálogo al detal o ingresa a la sección mayorista para armar tu pedido.</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
              <button type="button" class="btn btn-primary btn-sm" onclick="Cart.closeDrawer(); window.location.hash = '#catalogo';">
                Ver Catálogo Detal
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="Cart.closeDrawer(); window.location.hash = '#mayoristas';">
                Ver Mayoristas
              </button>
            </div>
          </div>
        `;
      } else {
        let html = '';

        // SECTION 1: DETAL ITEMS
        if (detalItems.length > 0) {
          html += `
            <div class="cart-section-block detal-block">
              <div class="cart-section-header">
                <span class="cart-sec-tag">🛒 PRODUCTOS DETAL</span>
                <span class="cart-sec-subtotal">Subtotal: ${this.formatCOP(detalSubtotal)}</span>
              </div>
              <div class="cart-items-group">
          `;

          html += detalItems.map(item => {
            const linePrice = (typeof item.calculatedLinePrice === 'number') ? item.calculatedLinePrice : (item.precio * item.qty);
            const promoNote = item.hasPromoApplied ? '<span class="item-promo-tag">🔥 Promo 2x</span>' : '';

            const prodObj = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
            const isDual = item.isDualFlavor === true || (item.productId === 'reign-bar-palette' && item.isDualFlavor !== false && item.variant && item.variant.includes(' + '));
            let f1 = item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant);
            let f2 = item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1);
            const thumbSrc = item.flavor1Img || item.imagen || (prodObj && prodObj.imagen) || 'assets/logo/logo.png';

            let variantOptionsHtml = '';
            if (prodObj) {
              let varList = [];
              if (prodObj.sabores && prodObj.sabores.length > 0) {
                varList = prodObj.sabores.filter(s => s.visible !== false).map(s => s.nombre);
              } else if (prodObj.colores && prodObj.colores.length > 0) {
                varList = prodObj.colores.map(c => c.nombre);
              }

              if (isDual && varList.length > 0) {
                variantOptionsHtml = `
                  <div class="cart-dual-flavor-box">
                    <div class="cart-dual-badge-line">✨ Combinación de 2 Sabores</div>
                    <div class="cart-flavor-select-row">
                      <label>1° Sabor:</label>
                      <select class="cart-flavor-dropdown" onchange="Cart.changeDualFlavor('${item.key}', 1, this.value)">
                        ${varList.map(v => `<option value="${v}" ${v === f1 ? 'selected' : ''}>${v}</option>`).join('')}
                      </select>
                    </div>
                    <div class="cart-flavor-select-row">
                      <label>2° Sabor:</label>
                      <select class="cart-flavor-dropdown" onchange="Cart.changeDualFlavor('${item.key}', 2, this.value)">
                        ${varList.map(v => `<option value="${v}" ${v === f2 ? 'selected' : ''}>${v}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                `;
              } else if (varList.length > 1) {
                variantOptionsHtml = `
                  <div class="cart-flavor-select-row">
                    <label>Sabor:</label>
                    <select class="cart-flavor-dropdown" onchange="Cart.changeItemVariant('${item.key}', this.value)">
                      ${varList.map(v => `<option value="${v}" ${v === item.variant ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                  </div>
                `;
              } else if (item.variant) {
                variantOptionsHtml = `<div class="item-variant-line"><span class="item-variant">Sabor: <strong>${item.variant}</strong></span></div>`;
              }
            } else if (item.variant) {
              variantOptionsHtml = `<div class="item-variant-line"><span class="item-variant">Sabor: <strong>${item.variant}</strong></span></div>`;
            }

            return `
              <div class="cart-item-row detal-item-row" id="cart-row-${item.key}">
                <div class="detal-item-header">
                  <div class="cart-item-head-left">
                    <div class="cart-item-thumb-box">
                      <img src="${thumbSrc}" alt="${item.nombre}" class="cart-item-thumb-img" loading="lazy">
                    </div>
                    <div class="cart-item-title-wrap">
                      <h4 class="item-title">${item.nombre}</h4>
                      <div class="item-unit-price">${this.formatCOP(item.effectiveUnitPrice || item.precio)} c/u ${promoNote}</div>
                    </div>
                  </div>
                  <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar del carrito">🗑️</button>
                </div>
                ${variantOptionsHtml}
                <div class="detal-item-footer">
                  <div class="item-qty-selector">
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', -1)" title="Restar 1">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', 1)" title="Sumar 1">+</button>
                  </div>
                  <div class="item-subtotal-block">
                    <span class="subtotal-label">Total ítem</span>
                    <div class="item-total-price">${this.formatCOP(linePrice)}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('');

          html += `
              </div>
            </div>
          `;
        }

        // SECTION 2: MAYORISTA ITEMS (AGRUPADOS POR REFERENCIA CON DETALLE DE SABORES)
        if (wsItems.length > 0) {
          // Agrupar items por referencia de producto (productId)
          const wsGroups = {};
          wsItems.forEach(item => {
            if (!wsGroups[item.productId]) {
              wsGroups[item.productId] = {
                productId: item.productId,
                nombre: item.nombre,
                items: [],
                refTotalQty: 0,
                activeTier: item.activeTier || 5,
                unitPrice: item.unitPrice || 0,
                refSubtotal: 0
              };
            }
            wsGroups[item.productId].items.push(item);
            wsGroups[item.productId].refTotalQty += item.qty;
            wsGroups[item.productId].refSubtotal += item.subtotal;
          });

          html += `
            <div class="cart-section-block wholesale-block">
              <div class="cart-section-header wholesale-header">
                <div class="ws-header-tag-wrap">
                  <span class="cart-sec-tag wholesale-tag">📦 MAYORISTA</span>
                  <span class="ws-header-tier-pill">${totalWsQty} uds totales</span>
                </div>
                <span class="cart-sec-subtotal">Subtotal: ${this.formatCOP(wsSubtotal)}</span>
              </div>

              <div class="cart-items-group">
          `;

          Object.values(wsGroups).forEach(group => {
            html += `
              <div class="ws-ref-group-container" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 14px; padding: 12px; overflow: hidden;">
                <div class="ws-ref-group-header" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 10px;">
                  <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 1rem; color: #fff; font-weight: 700;">${group.nombre}</h4>
                    <span class="ws-header-tier-pill" style="font-size: 0.78rem;">${group.refTotalQty} uds • Tarifa +${group.activeTier} (${this.formatCOP(group.unitPrice)} c/u)</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">Subtotal ${group.nombre}:</span>
                    <strong style="color: var(--accent-yellow); font-size: 0.95rem;">${this.formatCOP(group.refSubtotal)}</strong>
                  </div>
                </div>

                <div class="ws-ref-flavors-list" style="display: flex; flex-direction: column; gap: 8px;">
            `;

            group.items.forEach(item => {
              const prodObj = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
              const isDual = !!(item.isDualFlavor || item.productId === 'reign-bar-palette');
              let f1 = item.flavor1 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[0].trim() : item.variant);
              let f2 = item.flavor2 || (item.variant && item.variant.includes(' + ') ? item.variant.split(' + ')[1].trim() : f1);

              let variantOptionsHtml = '';
              if (prodObj) {
                let varList = [];
                if (prodObj.sabores && prodObj.sabores.length > 0) {
                  varList = prodObj.sabores.filter(s => s.visible !== false).map(s => s.nombre);
                } else if (prodObj.colores && prodObj.colores.length > 0) {
                  varList = prodObj.colores.map(c => c.nombre);
                }
                if (isDual && varList.length > 0) {
                  variantOptionsHtml = `
                    <div class="cart-dual-flavor-box" style="margin: 4px 0;">
                      <div class="cart-flavor-select-row" style="margin: 3px 0;">
                        <label style="font-size: 0.74rem;">1° Sabor:</label>
                        <select class="cart-flavor-dropdown" onchange="Cart.changeDualFlavor('${item.key}', 1, this.value)">
                          ${varList.map(v => `<option value="${v}" ${v === f1 ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                      </div>
                      <div class="cart-flavor-select-row" style="margin: 3px 0;">
                        <label style="font-size: 0.74rem;">2° Sabor:</label>
                        <select class="cart-flavor-dropdown" onchange="Cart.changeDualFlavor('${item.key}', 2, this.value)">
                          ${varList.map(v => `<option value="${v}" ${v === f2 ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                      </div>
                    </div>
                  `;
                } else if (varList.length > 1) {
                  variantOptionsHtml = `
                    <div class="cart-flavor-select-row" style="margin: 4px 0;">
                      <label style="font-size: 0.75rem;">Sabor:</label>
                      <select class="cart-flavor-dropdown" onchange="Cart.changeItemVariant('${item.key}', this.value)">
                        ${varList.map(v => `<option value="${v}" ${v === item.variant ? 'selected' : ''}>${v}</option>`).join('')}
                      </select>
                    </div>
                  `;
                } else if (item.variant) {
                  variantOptionsHtml = `<div class="item-variant-line" style="font-size: 0.8rem;"><span class="item-variant">Sabor: <strong>${item.variant}</strong></span></div>`;
                }
              } else if (item.variant) {
                variantOptionsHtml = `<div class="item-variant-line" style="font-size: 0.8rem;"><span class="item-variant">Sabor: <strong>${item.variant}</strong></span></div>`;
              }

              html += `
                <div class="cart-item-row ws-item-row" id="cart-row-${item.key}" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; border: 1px solid rgba(255,255,255,0.04);">
                  <div class="ws-item-header" style="margin-bottom: 6px;">
                    <div class="ws-pack-badge" style="font-size: 0.75rem;">⚡ ${item.qty} UDS • Sabor: <strong>${item.variant}</strong></div>
                    <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar este sabor">🗑️</button>
                  </div>

                  <div class="ws-item-main">
                    ${variantOptionsHtml}
                    <div class="item-unit-price" style="font-size: 0.8rem;">
                      <span class="unit-price-label">Tarifa (+${item.activeTier}):</span>
                      <strong class="unit-price-val">${this.formatCOP(item.unitPrice)}</strong> c/u
                    </div>
                  </div>

                  <div class="ws-item-footer" style="margin-top: 8px;">
                    <div class="item-qty-selector ws-qty-selector">
                      <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', -1)" title="Restar 1 unidad">−</button>
                      <span class="qty-num">${item.qty} uds</span>
                      <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', 1)" title="Sumar 1 unidad">+</button>
                    </div>
                    <div class="item-subtotal-block">
                      <span class="subtotal-label">Subtotal sabor:</span>
                      <span class="item-total-price ws-total">${this.formatCOP(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              `;
            });

            html += `
                </div>
              </div>
            `;
          });

          html += `
              </div>
            </div>
          `;
        }

        itemsContainer.innerHTML = html;
      }
    }

    // Drawer Footer
    if (footerContainer) {
      if (this.items.length === 0) {
        footerContainer.innerHTML = '';
      } else {
        const destName = shipping.isSoacha ? 'Soacha' : (shipping.isBogota ? 'Bogotá' : 'Nacional');
        let shippingLineContent = '';
        if (shipping.isSoacha) {
          shippingLineContent = `${this.formatCOP(shipping.cost)}`;
        } else if (shipping.isWholesaleOnly) {
          shippingLineContent = `<span style="color: #F59E0B; font-size: 0.82rem;">WhatsApp 3133572726 (A coordinar)</span>`;
        } else if (shipping.isFree) {
          shippingLineContent = `<strong class="text-green">GRATIS</strong>`;
        } else {
          shippingLineContent = `${this.formatCOP(shipping.cost)}`;
        }

        footerContainer.innerHTML = `
          <div class="cart-summary-box">
            ${detalItems.length > 0 ? `
              <div class="summary-line">
                <span>Subtotal Detal (${detalItems.reduce((s,i)=>s+i.qty, 0)} uds):</span>
                <span>${this.formatCOP(detalSubtotal)}</span>
              </div>
            ` : ''}
            ${wsItems.length > 0 ? `
              <div class="summary-line ws-summary-line">
                <span>Subtotal Mayorista (${totalWsQty} uds):</span>
                <span>${this.formatCOP(wsSubtotal)}</span>
              </div>
            ` : ''}
            <div class="summary-line">
              <span>Envío (${destName}):</span>
              <span>${shippingLineContent}</span>
            </div>
            <div class="summary-line total-line">
              <span>Total Final a Pagar:</span>
              <span class="total-amount">${this.formatCOP(totalGeneral)}</span>
            </div>
          </div>
          <div class="cart-footer-btns">
            <button type="button" class="btn btn-primary btn-block btn-checkout" onclick="CheckoutController.openModal()">
              <span>Proceder al Checkout ➔</span>
            </button>
            <div class="cart-secondary-actions">
              <button type="button" class="btn-link" onclick="Cart.closeDrawer()">Continuar Comprando</button>
              <button type="button" class="btn-link text-muted" onclick="Cart.clearCart()">Vaciar Carrito</button>
            </div>
          </div>
        `;
      }
    }
  },

  bindEvents() {
    document.querySelectorAll('.open-cart-btn, .open-ws-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    const closeBtn = document.getElementById('closeCartBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }
  }
};

window.Cart = Cart;
