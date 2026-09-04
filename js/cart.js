/**
 * CAPITAL VAPE - Carrito Global Unificado (Detal + Mayorista)
 * Maneja persistencia en localStorage, cálculo de subtotales independientes y total general.
 */
const Cart = {
  items: [], // [{ key, type: 'detal'|'mayorista', productId, nombre, subtitulo, imagen, variant, qty, packQty, unitPrice, subtotal, precio, precio_promo_2 }]
  destination: 'bogota', // 'bogota' | 'nacional'

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.updateUI();
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('cv_cart_unified') || localStorage.getItem('cv_cart_items') || localStorage.getItem('capital_vape_cart');
      this.items = saved ? JSON.parse(saved) : [];
      const savedDest = localStorage.getItem('cv_shipping_dest');
      if (savedDest) this.destination = savedDest;
    } catch (e) {
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

  // 2. Agregar Paquete Mayorista
  addWholesalePack(productId, packQty) {
    const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
    if (!product) return;

    const prices = (typeof WholesaleService !== 'undefined' && WholesaleService.PRICES[productId]) || product.precios_mayoristas;
    if (!prices || !prices[String(packQty)]) {
      Toast.show(`No hay tarifa configurada para +${packQty} uds de este producto.`, 'error');
      return;
    }

    const unitPrice = prices[String(packQty)];
    const subtotal = unitPrice * packQty;
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

    const packId = `ws__${productId}__${Date.now()}__${Math.random().toString(36).substr(2, 4)}`;

    this.items.push({
      key: packId,
      type: 'mayorista',
      packId: packId,
      productId: product.id,
      nombre: product.nombre,
      subtitulo: product.subtitulo || '',
      imagen: img,
      variant: flavor,
      packQty: packQty,
      unitPrice: unitPrice,
      subtotal: subtotal
    });

    this.saveToStorage();
    this.updateUI();
    Toast.show(`✓ ¡Paquete de +${packQty} uds de "${product.nombre}" (${flavor}) agregado al pedido!`, 'success');
    this.pulseCartBadge();
  },

  pulseCartBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.classList.remove('pulse-anim');
      void b.offsetWidth;
      b.classList.add('pulse-anim');
    });
  },

  updateQty(itemKey, delta) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item) return;

    if (item.type === 'mayorista') {
      // Wholesale items are pack based; delta < 0 removes it
      if (delta < 0) {
        this.removeItem(itemKey);
      }
      return;
    }

    item.qty += delta;
    if (item.qty <= 0) {
      this.removeItem(itemKey);
      return;
    }

    this.saveToStorage();
    this.updateUI();
  },

  changeItemVariant(itemKey, newVariant) {
    const item = this.items.find(i => i.key === itemKey);
    if (!item || item.variant === newVariant) return;

    if (item.type === 'mayorista') {
      item.variant = newVariant;
      const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === item.productId) : null;
      if (product) {
        if (product.sabores) {
          const f = product.sabores.find(s => s.nombre === newVariant);
          if (f && f.img) item.imagen = f.img;
        } else if (product.colores) {
          const c = product.colores.find(c => c.nombre === newVariant);
          if (c && c.img) item.imagen = c.img;
        }
      }
    } else {
      const newKey = `detal__${item.productId}__${newVariant || 'default'}`;
      const existingTarget = this.items.find(i => i.key === newKey && i.key !== itemKey);
      if (existingTarget) {
        existingTarget.qty += item.qty;
        this.items = this.items.filter(i => i.key !== itemKey);
      } else {
        item.key = newKey;
        item.variant = newVariant;
      }
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show(`Sabor actualizado a "${newVariant}"`, 'success');
  },

  removeItem(itemKey) {
    const item = this.items.find(i => i.key === itemKey);
    this.items = this.items.filter(i => i.key !== itemKey);
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
    return this.getWholesaleItems().reduce((sum, item) => sum + (item.subtotal || (item.unitPrice * item.packQty)), 0);
  },

  getSubtotal() {
    return this.getDetalSubtotal() + this.getWholesaleSubtotal();
  },

  getTotalCount() {
    const detalCount = this.getDetalItems().reduce((sum, item) => sum + item.qty, 0);
    const wsCount = this.getWholesaleItems().reduce((sum, item) => sum + item.packQty, 0);
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

    // 2. Render Drawer Content
    const itemsContainer = document.getElementById('cartDrawerItems');
    const meterContainer = document.getElementById('cartShippingMeter');
    const footerContainer = document.getElementById('cartDrawerFooter');

    const detalItems = this.getDetalItems();
    const wsItems = this.getWholesaleItems();
    const detalSubtotal = this.getDetalSubtotal();
    const wsSubtotal = this.getWholesaleSubtotal();
    const totalSubtotal = this.getSubtotal();
    const shipping = this.getShippingInfo();
    const totalGeneral = this.getTotal();

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
            <span class="empty-icon">🛒</span>
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
            <div class="cart-section-block">
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
                variantOptionsHtml = `<span class="item-variant">Sabor: <strong>${item.variant}</strong></span>`;
              }
            } else if (item.variant) {
              variantOptionsHtml = `<span class="item-variant">Sabor: <strong>${item.variant}</strong></span>`;
            }

            return `
              <div class="cart-item-row" id="cart-row-${item.key}">
                <div class="item-info">
                  <h4 class="item-title">${item.nombre}</h4>
                  ${variantOptionsHtml}
                  <div class="item-unit-price">${this.formatCOP(item.precio)} c/u ${promoNote}</div>
                </div>
                <div class="item-actions-col">
                  <div class="item-qty-selector">
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', -1)">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button type="button" class="btn-qty-mini" onclick="Cart.updateQty('${item.key}', 1)">+</button>
                  </div>
                  <div class="item-total-price">${this.formatCOP(linePrice)}</div>
                  <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar">🗑️</button>
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
          html += `
            <div class="cart-section-block wholesale-block">
              <div class="cart-section-header wholesale-header">
                <span class="cart-sec-tag wholesale-tag">📦 MAYORISTA</span>
                <span class="cart-sec-subtotal">Subtotal: ${this.formatCOP(wsSubtotal)}</span>
              </div>
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
                variantOptionsHtml = `<span class="item-variant">Sabor: <strong>${item.variant}</strong></span>`;
              }
            } else if (item.variant) {
              variantOptionsHtml = `<span class="item-variant">Sabor: <strong>${item.variant}</strong></span>`;
            }

            return `
              <div class="cart-item-row ws-item-row" id="cart-row-${item.key}">
                <div class="item-info">
                  <div class="ws-pack-badge">+${item.packQty} UNIDADES</div>
                  <h4 class="item-title">${item.nombre}</h4>
                  ${variantOptionsHtml}
                  <div class="item-unit-price">${this.formatCOP(item.unitPrice)} c/u</div>
                </div>
                <div class="item-actions-col">
                  <div class="item-total-price ws-total">${this.formatCOP(item.subtotal)}</div>
                  <button type="button" class="btn-remove-item" onclick="Cart.removeItem('${item.key}')" title="Eliminar paquete">🗑️</button>
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
              <div class="summary-line">
                <span>Subtotal Mayorista (${wsItems.reduce((s,i)=>s+i.packQty, 0)} uds):</span>
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
