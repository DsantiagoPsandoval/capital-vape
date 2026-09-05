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

    const totalWsQty = this.getWholesaleTotalQty();
    const activeTier = typeof WholesaleService !== 'undefined' 
      ? WholesaleService.getWholesaleTier(totalWsQty) 
      : (totalWsQty >= 100 ? 100 : (totalWsQty >= 50 ? 50 : (totalWsQty >= 20 ? 20 : (totalWsQty >= 10 ? 10 : 5))));

    wsItems.forEach(item => {
      let unitPrice = 0;
      if (typeof WholesaleService !== 'undefined') {
        unitPrice = WholesaleService.getProductWholesaleUnitPrice(item.productId, totalWsQty);
      } else {
        const prod = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
        const prices = prod?.precios_mayoristas;
        unitPrice = prices ? (prices[String(activeTier)] || prices['5'] || prod.precio) : (prod ? prod.precio : 0);
      }

      item.unitPrice = unitPrice;
      item.subtotal = item.qty * unitPrice;
      item.activeTier = activeTier;
    });
  },

  // 1. Agregar Producto al Detal
  addItem(product, variant, qty = 1) {
    if (typeof product === 'string') {
      const found = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === product) : null;
      if (!found) return;
      product = found;
    }

    const itemKey = `detal__${product.id}__${variant || 'default'}`;
    const existing = this.items.find(i => i.key === itemKey);

    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        key: itemKey,
        type: 'detal',
        productId: product.id,
        nombre: product.nombre,
        subtitulo: product.subtitulo || '',
        imagen: product.imagen,
        precio: product.precio,
        precio_promo_2: product.precio_promo_2,
        variant: variant || (product.sabores && product.sabores[0] ? product.sabores[0].nombre : (product.colores && product.colores[0] ? product.colores[0].nombre : '')),
        qty: qty
      });
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show(`✓ ¡"${product.nombre} ${variant ? '(' + variant + ')' : ''}" agregado al carrito Detal!`, 'success');
    this.pulseCartBadge();
  },

  // 2. Agregar Paquete/Unidades Mayoristas
  addWholesalePack(productId, packQty) {
    const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    if (!product) return;

    const qtyToAdd = Number(packQty) || 5;
    const flavor = (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants[productId]) 
      || (product.sabores && product.sabores[0] ? product.sabores[0].nombre : (product.colores && product.colores[0] ? product.colores[0].nombre : 'Surtido / A convenir'));

    // Determine image for variant
    let img = product.imagen;
    if (product.sabores) {
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
        qty: qtyToAdd,
        unitPrice: 0,
        subtotal: 0
      });
    }

    // Recalcular dinámicamente todos los precios del carrito con el nuevo volumen total
    this.recalculateWholesalePrices();
    this.saveToStorage();
    this.updateUI();
    
    const totalWs = this.getWholesaleTotalQty();
    const tier = typeof WholesaleService !== 'undefined' ? WholesaleService.getWholesaleTier(totalWs) : 5;
    Toast.show(`✓ ¡+${qtyToAdd} uds de "${product.nombre}" (${flavor}) agregadas! Rango actual: +${tier} uds (${totalWs} totales).`, 'success');
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

  getDetalItems() {
    return this.items.filter(i => i.type !== 'mayorista');
  },

  getWholesaleItems() {
    return this.items.filter(i => i.type === 'mayorista');
  },

  getWholesaleTotalQty() {
    return this.getWholesaleItems().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  },

  getDetalSubtotal() {
    return this.getDetalItems().reduce((sum, item) => {
      let itemTotal = 0;
      if (item.precio_promo_2 && item.qty >= 2) {
        const pairs = Math.floor(item.qty / 2);
        const remainder = item.qty % 2;
        itemTotal = (pairs * item.precio_promo_2) + (remainder * item.precio);
      } else {
        itemTotal = item.qty * item.precio;
      }
      return sum + itemTotal;
    }, 0);
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
    const subtotal = this.getSubtotal();
    const isBogota = this.destination === 'bogota';
    const threshold = isBogota ? (CONFIG.SHIPPING?.BOGOTA_FREE_THRESHOLD || 150000) : (CONFIG.SHIPPING?.NACIONAL_FREE_THRESHOLD || 200000);
    const standardCost = isBogota ? (CONFIG.SHIPPING?.BOGOTA_STANDARD_COST || 10000) : (CONFIG.SHIPPING?.NACIONAL_STANDARD_COST || 15000);

    const isFree = subtotal >= threshold;
    const remaining = isFree ? 0 : threshold - subtotal;
    const cost = (this.items.length === 0 || isFree) ? 0 : standardCost;
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

    return {
      isBogota,
      threshold,
      standardCost,
      isFree,
      remaining,
      cost,
      percent
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

    // Free Shipping Progress Meter
    if (meterContainer) {
      meterContainer.innerHTML = `
        <div class="shipping-meter-box">
          <div class="dest-toggle-group">
            <button type="button" class="dest-btn ${shipping.isBogota ? 'active' : ''}" onclick="Cart.setDestination('bogota')">
              📍 Bogotá (Gratis > ${this.formatCOP(shipping.threshold)})
            </button>
            <button type="button" class="dest-btn ${!shipping.isBogota ? 'active' : ''}" onclick="Cart.setDestination('nacional')">
              🇨🇴 Nacional (Gratis > ${this.formatCOP(shipping.threshold)})
            </button>
          </div>
          <div class="meter-status">
            ${shipping.isFree 
              ? `<span class="free-badge">🎉 ¡Felicitaciones! Tienes <strong>ENVÍO GRATIS</strong>.</span>` 
              : `<span>🛍️ Te faltan <strong>${this.formatCOP(shipping.remaining)}</strong> para obtener <strong>ENVÍO GRATIS</strong></span>`}
          </div>
          <div class="meter-bar-track">
            <div class="meter-bar-fill ${shipping.isFree ? 'complete' : ''}" style="width: ${shipping.percent}%;"></div>
          </div>
        </div>
      `;
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
                <span class="cart-sec-tag">DETAL</span>
                <span class="cart-sec-subtotal">Subtotal: ${this.formatCOP(detalSubtotal)}</span>
              </div>
              <div class="cart-items-group">
          `;

          html += detalItems.map(item => {
            let linePrice = item.precio * item.qty;
            let promoNote = '';
            if (item.precio_promo_2 && item.qty >= 2) {
              const pairs = Math.floor(item.qty / 2);
              const rem = item.qty % 2;
              linePrice = (pairs * item.precio_promo_2) + (rem * item.precio);
              promoNote = '<span class="item-promo-tag">🔥 Promo 2x</span>';
            }

            const prodObj = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
            let variantOptionsHtml = '';
            if (prodObj) {
              let varList = [];
              if (prodObj.sabores && prodObj.sabores.length > 0) {
                varList = prodObj.sabores.filter(s => s.visible !== false).map(s => s.nombre);
              } else if (prodObj.colores && prodObj.colores.length > 0) {
                varList = prodObj.colores.map(c => c.nombre);
              }
              if (varList.length > 1) {
                variantOptionsHtml = `
                  <div class="cart-flavor-select-row">
                    <label>Sabor/Color:</label>
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
                  <h4 class="item-title">${item.nombre}</h4>
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
                    <div class="item-unit-price">${this.formatCOP(item.precio)} c/u ${promoNote}</div>
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

        // SECTION 2: MAYORISTA ITEMS
        if (wsItems.length > 0) {
          let tierProgressBannerHtml = '';
          if (tierInfo && tierInfo.nextTier) {
            tierProgressBannerHtml = `
              <div class="ws-tier-progress-banner">
                <span class="ws-tier-progress-icon">💡</span>
                <span>Agrega <strong>${tierInfo.needed} uds más</strong> para desbloquear la tarifa de <strong>+${tierInfo.nextTier} unidades</strong>.</span>
              </div>
            `;
          } else {
            tierProgressBannerHtml = `
              <div class="ws-tier-progress-banner max-tier">
                <span class="ws-tier-progress-icon">🎉</span>
                <span>¡Tienes activa la <strong>tarifa máxima mayorista (+100 uds)</strong> en todo tu pedido!</span>
              </div>
            `;
          }

          html += `
            <div class="cart-section-block wholesale-block">
              <div class="cart-section-header wholesale-header">
                <div class="ws-header-tag-wrap">
                  <span class="cart-sec-tag wholesale-tag">📦 MAYORISTA</span>
                  <span class="ws-header-tier-pill">Rango +${activeTier} (${totalWsQty} uds)</span>
                </div>
                <span class="cart-sec-subtotal">Subtotal: ${this.formatCOP(wsSubtotal)}</span>
              </div>
              
              ${tierProgressBannerHtml}

              <div class="cart-items-group">
          `;

          html += wsItems.map(item => {
            const prodObj = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
            let variantOptionsHtml = '';
            if (prodObj) {
              let varList = [];
              if (prodObj.sabores && prodObj.sabores.length > 0) {
                varList = prodObj.sabores.filter(s => s.visible !== false).map(s => s.nombre);
              } else if (prodObj.colores && prodObj.colores.length > 0) {
                varList = prodObj.colores.map(c => c.nombre);
              }
              if (varList.length > 1) {
                variantOptionsHtml = `
                  <div class="cart-flavor-select-row">
                    <label>Sabor/Color:</label>
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
              <div class="cart-item-row ws-item-row" id="cart-row-${item.key}">
                <div class="ws-item-header">
                  <div class="ws-pack-badge">⚡ ${item.qty} UDS • TARIFA +${activeTier}</div>
                  <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar del pedido mayorista">🗑️</button>
                </div>

                <div class="ws-item-main">
                  <h4 class="item-title">${item.nombre}</h4>
                  ${variantOptionsHtml}
                  <div class="item-unit-price">
                    <span class="unit-price-label">Precio Rango:</span>
                    <strong class="unit-price-val">${this.formatCOP(item.unitPrice)}</strong> c/u
                  </div>
                </div>

                <div class="ws-item-footer">
                  <div class="item-qty-selector ws-qty-selector">
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', -1)" title="Restar 1 unidad">−</button>
                    <span class="qty-num">${item.qty} uds</span>
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', 1)" title="Sumar 1 unidad">+</button>
                  </div>
                  <div class="item-subtotal-block">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="item-total-price ws-total">${this.formatCOP(item.subtotal)}</span>
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

        itemsContainer.innerHTML = html;
      }
    }

    // Drawer Footer
    if (footerContainer) {
      if (this.items.length === 0) {
        footerContainer.innerHTML = '';
      } else {
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
                <span>Subtotal Mayorista (${totalWsQty} uds • Rango +${activeTier}):</span>
                <span>${this.formatCOP(wsSubtotal)}</span>
              </div>
            ` : ''}
            <div class="summary-line">
              <span>Envío (${shipping.isBogota ? 'Bogotá' : 'Nacional'}):</span>
              <span>${shipping.isFree ? '<strong class="text-green">GRATIS</strong>' : this.formatCOP(shipping.cost)}</span>
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
