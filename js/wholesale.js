/**
 * CAPITAL VAPE - Módulo Oficial de Venta Mayorista
 * Acceso seguro con clave CV-MAYORISTA-2026, sesión persistente y catálogo independiente.
 */
const WHOLESALE_PASSWORD = "CV-MAYORISTA-2026";

const WholesaleService = {
  PRICES: {
    "bang-leader": {
        "5": 35000,
        "10": 26000,
        "20": 25000,
        "50": 24000,
        "100": 23000
    },
    "humo-azul": {
        "5": 35000,
        "10": 27000,
        "20": 25500,
        "50": 24000,
        "100": 23000
    },
    "donut": {
        "5": 30000,
        "10": 21000,
        "20": 20000,
        "50": 19000,
        "100": 18000
    },
    "solobar-kit": {
        "5": 29000,
        "10": 24000,
        "20": 23000,
        "50": 22000,
        "100": 21000
    },
    "solobar-pod": {
        "5": 21000,
        "10": 17000,
        "20": 16000,
        "50": 15000,
        "100": 14000
    },
    "yocco": {
        "5": 9000,
        "10": 6500,
        "20": 6000,
        "50": 5600,
        "100": 5000
    },
    "death-row": {
        "5": 9500,
        "10": 7500,
        "20": 7000,
        "50": 6500,
        "100": 6000
    },
    "ease": {
        "5": 11000,
        "10": 8000,
        "20": 7400,
        "50": 6800,
        "100": 6200
    },
    "dummy": {
        "5": 11500,
        "10": 8500,
        "20": 7300,
        "50": 6800,
        "100": 6300
    },
    "lost-mary-os": {
        "5": 11500,
        "10": 9200,
        "20": 8700,
        "50": 8200,
        "100": 7500
    },
    "lost-mary-mo": {
        "5": 11500,
        "10": 9200,
        "20": 8700,
        "50": 8200,
        "100": 7500
    },
    "beyond": {
        "5": 15000,
        "10": 12500,
        "20": 12000,
        "50": 11500,
        "100": 10500
    },
    "bugatti": {
        "5": 17000,
        "10": 13500,
        "20": 12500,
        "50": 11500,
        "100": 10500
    },
    "nicky-jam": {
        "5": 17000,
        "10": 13500,
        "20": 12600,
        "50": 11800,
        "100": 11000
    },
    "baddie-bar": {
        "5": 17000,
        "10": 13500,
        "20": 12600,
        "50": 11800,
        "100": 11000
    },
    "nimbox-kit": {
        "5": 21000,
        "10": 16000,
        "20": 15000,
        "50": 14000,
        "100": 13000
    },
    "nimbox-pod": {
        "5": 16000,
        "10": 12000,
        "20": 11000,
        "50": 10000,
        "100": 8500
    },
    "vera": {
        "5": 19000,
        "10": 16000,
        "20": 15000,
        "50": 14000,
        "100": 13000
    },
    "katchmi": {
        "5": 21000,
        "10": 17000,
        "20": 16200,
        "50": 15400,
        "100": 14500
    },
    "hookalit": {
        "5": 23000,
        "10": 18000,
        "20": 17000,
        "50": 16000,
        "100": 15300
    },
    "fifty-cent": {
        "5": 22000,
        "10": 22000,
        "20": 21000,
        "50": 19500,
        "100": 18500
    },
    "spaceman": {
        "5": 27000,
        "10": 20500,
        "20": 19500,
        "50": 18500,
        "100": 18000
    },
    "dinner-lady": {
        "5": 27000,
        "10": 20700,
        "20": 19700,
        "50": 18700,
        "100": 18200
    },
    "waka-creator-bateria": {
        "5": 32000,
        "10": 22500,
        "20": 22000,
        "50": 21500,
        "100": 20000
    },
    "sami-2-bateria": {
        "5": 32000,
        "10": 25000,
        "20": 24000,
        "50": 23000,
        "100": 22000
    },
    "waka-creator-pod": {
        "5": 41000,
        "10": 34000,
        "20": 33000,
        "50": 32000,
        "100": 31000
    },
    "sami-pod-2": {
        "5": 42000,
        "10": 34000,
        "20": 33000,
        "50": 31500,
        "100": 30000
    },
    "waka-solo-2": {
        "5": 38000,
        "10": 33000,
        "20": 32000,
        "50": 31000,
        "100": 30500
    },
    "brass-type-c": {
        "5": 20000,
        "10": 16000,
        "20": 15000,
        "50": 14000,
        "100": 13000
    },
    "anv-digital": {
        "5": 25000,
        "10": 20000,
        "20": 19000,
        "50": 18500,
        "100": 17500
    },
    "high-pro": {
        "5": 45000,
        "10": 40000,
        "20": 39000,
        "50": 38000,
        "100": 37000
    },
    "secret-pro": {
        "5": 47000,
        "10": 42000,
        "20": 41000,
        "50": 40000,
        "100": 39000
    },
    "airpods-4": {
        "5": 45000,
        "10": 40000
    },
    "airpods-4-anc": {
        "5": 45000,
        "10": 40000
    },
    "airpods-pro-2": {
        "5": 50000,
        "10": 45000
    }
  },

  /**
   * Obtiene el rango / tier mayorista según la cantidad TOTAL de unidades en el carrito:
   * - 5 a 9 unidades: 5
   * - 10 a 19 unidades: 10
   * - 20 a 49 unidades: 20
   * - 50 a 99 unidades: 50
   * - 100 unidades en adelante: 100
   */
  getWholesaleTier(totalUnits) {
    const qty = Number(totalUnits) || 0;
    if (qty >= 100) return 100;
    if (qty >= 50) return 50;
    if (qty >= 20) return 20;
    if (qty >= 10) return 10;
    if (qty >= 5) return 5;
    return 5; // Mínimo mayorista por defecto
  },

  /**
   * Obtiene el precio unitario de un producto según la cantidad TOTAL de unidades mayoristas
   */
  getProductWholesaleUnitPrice(productId, totalWholesaleQty) {
    const prices = this.PRICES[productId] || (typeof PRODUCTS_DATA !== 'undefined' ? (PRODUCTS_DATA.find(p => p.id === productId)?.precios_mayoristas) : null);
    if (!prices) {
      const p = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(x => x.id === productId) : null;
      return p ? p.precio : 0;
    }
    const tier = this.getWholesaleTier(totalWholesaleQty);
    if (prices[String(tier)]) {
      return prices[String(tier)];
    }
    // Fallback al tier disponible más cercano menor o igual
    const availableTiers = Object.keys(prices).map(Number).sort((a, b) => a - b);
    const eligible = availableTiers.filter(t => t <= tier);
    if (eligible.length > 0) {
      return prices[String(eligible[eligible.length - 1])];
    }
    return prices[String(availableTiers[0])];
  },

  /**
   * Obtiene información del siguiente rango mayorista para motivar al comprador
   */
  getNextTierInfo(totalUnits) {
    const qty = Number(totalUnits) || 0;
    if (qty < 5) return { nextTier: 5, needed: 5 - qty, currentTier: 5 };
    if (qty < 10) return { nextTier: 10, needed: 10 - qty, currentTier: 5 };
    if (qty < 20) return { nextTier: 20, needed: 20 - qty, currentTier: 10 };
    if (qty < 50) return { nextTier: 50, needed: 50 - qty, currentTier: 20 };
    if (qty < 100) return { nextTier: 100, needed: 100 - qty, currentTier: 50 };
    return { nextTier: null, needed: 0, currentTier: 100 };
  },

  /**
   * FUNCIÓN "MI PRESUPUESTO":
   * Calcula la mayor cantidad de unidades que se pueden comprar con un presupuesto dado,
   * respetando rigurosamente los rangos de precios mayoristas:
   * 5–9   -> precio de 5 unidades.
   * 10–19 -> precio de 10 unidades.
   * 20–49 -> precio de 20 unidades.
   * 50–99 -> precio de 50 unidades.
   * 100+  -> precio de 100 unidades.
   */
  calculateMaxUnitsForBudget(productId, budget) {
    const b = Number(budget) || 0;
    if (b <= 0) return null;

    const prices = this.PRICES[productId] || (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.find(p => p.id === productId)?.precios_mayoristas : null);
    if (!prices) return null;

    const minTierPrice = prices['5'] || Object.values(prices)[0];
    if (b < 5 * minTierPrice) {
      return {
        canAfford: false,
        minRequired: 5 * minTierPrice,
        budget: b
      };
    }

    const tiers = [
      { tier: 100, min: 100, max: Infinity },
      { tier: 50, min: 50, max: 99 },
      { tier: 20, min: 20, max: 49 },
      { tier: 10, min: 10, max: 19 },
      { tier: 5, min: 5, max: 9 }
    ];

    let bestQty = 0;
    let bestUnitPrice = 0;
    let bestTier = 5;

    for (const t of tiers) {
      const unitPrice = this.getProductWholesaleUnitPrice(productId, t.min);
      if (!unitPrice) continue;
      const minCostForTier = t.min * unitPrice;
      if (b >= minCostForTier) {
        const maxAffordableAtPrice = Math.floor(b / unitPrice);
        const qtyInBracket = Math.min(t.max, maxAffordableAtPrice);
        if (qtyInBracket >= t.min) {
          bestQty = qtyInBracket;
          bestUnitPrice = unitPrice;
          bestTier = this.getWholesaleTier(bestQty);
          break;
        }
      }
    }

    if (bestQty < 5) {
      return {
        canAfford: false,
        minRequired: 5 * minTierPrice,
        budget: b
      };
    }

    const totalCost = bestQty * bestUnitPrice;
    const remainder = b - totalCost;

    return {
      canAfford: true,
      budget: b,
      maxUnits: bestQty,
      unitPrice: bestUnitPrice,
      tier: bestTier,
      totalCost: totalCost,
      remainder: remainder
    };
  },

  isUnlocked() {
    return localStorage.getItem("cv_wholesale_auth") === "true" || localStorage.getItem("wholesaleAuthenticated") === "true";
  },

  verifyCode(inputCode) {
    const clean = (inputCode || '').trim();
    if (!clean) {
      return { 
        success: false, 
        message: "❌ Por favor ingresa la clave mayorista." 
      };
    }

    if (clean.toUpperCase() === WHOLESALE_PASSWORD) {
      localStorage.setItem("cv_wholesale_auth", "true");
      localStorage.setItem("wholesaleAuthenticated", "true");
      return {
        success: true,
        message: "✓ ¡Acceso mayorista concedido con éxito!"
      };
    }

    return {
      success: false,
      message: "❌ Clave incorrecta. Solicítala vía WhatsApp o verifica e inténtalo nuevamente."
    };
  },

  logout() {
    localStorage.removeItem("cv_wholesale_auth");
    localStorage.removeItem("wholesaleAuthenticated");
    localStorage.removeItem("cv_wholesale_auth_session");
  },

  formatCOP(val) {
    return '$' + Number(val || 0).toLocaleString('es-CO');
  },

  getWholesaleWhatsAppUrl() {
    const text = encodeURIComponent('Hola Capital Vape, soy comerciante/distribuidor y solicito la clave para acceder al portal mayorista.');
    return `https://wa.me/573248012914?text=${text}`;
  }
};

/**
 * Proxy para compatibilidad total con llamadas a WholesaleCart
 */
const WholesaleCart = {
  addPack(productId, packQty) {
    Cart.addWholesalePack(productId, packQty);
  },
  openDrawer() {
    Cart.openDrawer();
  },
  closeDrawer() {
    Cart.closeDrawer();
  },
  init() {
    // Uses global Cart
  }
};
const WholesaleCatalog = {
  selectedVariants: {},
  activeCategory: 'todos',
  searchQuery: '',
  sortBy: 'relevancia',
  currentBudget: null,

  init() {
    this.renderCatalog();
    this.bindEvents();
    this.initBudgetUI();
  },

  setBudget(val) {
    const clean = String(val || '').replace(/[^0-9]/g, '');
    const num = Number(clean) || 0;
    if (num > 0) {
      this.currentBudget = num;
      this.renderCatalog();
      this.updateBudgetNotice();
      Toast.show(`✓ Presupuesto de ${WholesaleService.formatCOP(num)} aplicado al catálogo mayorista.`, 'success');
    } else {
      this.clearBudget();
    }
  },

  clearBudget() {
    this.currentBudget = null;
    const input = document.getElementById('wsBudgetInput');
    if (input) input.value = '';
    this.updateBudgetNotice();
    this.renderCatalog();
    Toast.show('Filtro de presupuesto restablecido.', 'info');
  },

  updateBudgetNotice() {
    const notice = document.getElementById('wsBudgetActiveNotice');
    const amountEl = document.getElementById('wsBudgetActiveAmount');
    const clearBtn = document.getElementById('wsBudgetClearBtn');
    if (this.currentBudget && this.currentBudget > 0) {
      if (notice) notice.style.display = 'flex';
      if (amountEl) amountEl.textContent = WholesaleService.formatCOP(this.currentBudget);
      if (clearBtn) clearBtn.style.display = 'inline-flex';
    } else {
      if (notice) notice.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
    }
  },

  initBudgetUI() {
    const form = document.getElementById('wsBudgetForm');
    const input = document.getElementById('wsBudgetInput');
    if (input) {
      input.addEventListener('input', (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw) {
          e.target.value = Number(raw).toLocaleString('es-CO');
        } else {
          e.target.value = '';
        }
      });
    }
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = input.value.replace(/[^0-9]/g, '');
        const num = Number(raw) || 0;
        if (num <= 0) {
          Toast.show('Por favor ingresa un monto válido para tu presupuesto.', 'error');
          return;
        }
        this.setBudget(num);
      });
    }
  },

  selectVariant(productId, variantName) {
    this.selectedVariants[productId] = variantName;
    const card = document.getElementById('ws-card-' + productId);
    if (card) {
      const tag = card.querySelector('.flavor-current-tag');
      if (tag) tag.textContent = variantName;

      const product = PRODUCTS_DATA.find(p => p.id === productId);
      if (product) {
        let flavorImg = null;
        if (product.sabores) {
          const found = product.sabores.find(s => s.nombre === variantName);
          if (found && found.img) flavorImg = found.img;
        } else if (product.colores) {
          const found = product.colores.find(c => c.nombre === variantName);
          if (found && found.img) flavorImg = found.img;
        }

        if (flavorImg) {
          const imgEl = card.querySelector('.product-img-real');
          if (imgEl) {
            imgEl.style.opacity = '0.3';
            setTimeout(() => {
              imgEl.src = flavorImg;
              imgEl.style.opacity = '1';
            }, 120);
          }
        }
      }
    }
  },

  getProducts() {
    let list = [...PRODUCTS_DATA];

    if (this.activeCategory !== 'todos') {
      list = list.filter(p => p.categoria === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => {
        const text = (
          p.nombre + ' ' + 
          (p.subtitulo || '') + ' ' + 
          (p.sabores ? p.sabores.map(s => s.nombre).join(' ') : '') + ' ' +
          (p.colores ? p.colores.map(c => c.nombre).join(' ') : '')
        ).toLowerCase();
        return text.includes(q);
      });
    }

    switch (this.sortBy) {
      case 'precio_asc':
        list.sort((a, b) => {
          const pa = (WholesaleService.PRICES[a.id] && WholesaleService.PRICES[a.id]['5']) || a.precio;
          const pb = (WholesaleService.PRICES[b.id] && WholesaleService.PRICES[b.id]['5']) || b.precio;
          return pa - pb;
        });
        break;
      case 'precio_desc':
        list.sort((a, b) => {
          const pa = (WholesaleService.PRICES[a.id] && WholesaleService.PRICES[a.id]['5']) || a.precio;
          const pb = (WholesaleService.PRICES[b.id] && WholesaleService.PRICES[b.id]['5']) || b.precio;
          return pb - pa;
        });
        break;
      case 'nombre_az':
        list.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre_za':
        list.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'mas_vendidos':
        list.sort((a, b) => (b.ventas || 0) - (a.ventas || 0));
        break;
      default:
        break;
    }

    return list;
  },

  renderCatalog() {
    const container = document.getElementById('wholesaleCatalogGrid');
    if (!container) return;

    const products = this.getProducts();

    if (products.length === 0) {
      container.innerHTML = `
        <div class="catalog-no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No encontramos productos mayoristas con ese criterio</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const prices = WholesaleService.PRICES[product.id] || product.precios_mayoristas;
      if (!prices) return '';

      const tierKeys = Object.keys(prices).map(Number).sort((a, b) => a - b);
      const minTier = tierKeys[0];
      const maxTier = tierKeys[tierKeys.length - 1];
      const priceAtMin = prices[String(minTier)];
      const priceAtMax = prices[String(maxTier)];
      const savingPerUnit = priceAtMin - priceAtMax;

      const defaultVariant = product.sabores && product.sabores.length > 0 
        ? product.sabores[0].nombre 
        : (product.colores && product.colores.length > 0 ? product.colores[0].nombre : null);

      if (!this.selectedVariants[product.id] && defaultVariant) {
        this.selectedVariants[product.id] = defaultVariant;
      }

      const currentSelected = this.selectedVariants[product.id] || defaultVariant || '';

      let currentImage = product.imagen;
      if (product.sabores) {
        const found = product.sabores.find(s => s.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      } else if (product.colores) {
        const found = product.colores.find(c => c.nombre === currentSelected);
        if (found && found.img) currentImage = found.img;
      }

      const totalVariants = product.sabores ? product.sabores.filter(s => s.visible !== false).length :
                            (product.colores ? product.colores.length : 0);
      const isColor = product.tipo_variante === 'color';
      let variantsHtml = '';
      if (totalVariants > 0) {
        variantsHtml = `
          <div class="card-flavor-picker-block">
            <button type="button" 
                    class="btn-open-flavor-modal" 
                    onclick="CatalogController.openFlavorModal('${product.id}', true)"
                    title="Ver sabores y detalles">
              <span class="flavor-picker-label">
                <span>${isColor ? '🎨' : '⚡'} ${isColor ? 'Colores' : 'Sabores'} (${totalVariants})</span>
              </span>
              <span class="flavor-current-tag">${currentSelected}</span>
            </button>
          </div>
        `;
      }

      const puffsBadgeText = product.puffs 
        ? `${Number(product.puffs).toLocaleString('es-CO')} Puffs` 
        : (product.categoria === 'accesorios' ? 'Original' : 'Batería 510');

      // 💰 MI PRESUPUESTO CALCULATION RESULT FOR THIS CARD
      let budgetHtml = '';
      if (this.currentBudget && this.currentBudget > 0) {
        const bRes = WholesaleService.calculateMaxUnitsForBudget(product.id, this.currentBudget);
        if (bRes && bRes.canAfford) {
          budgetHtml = `
            <div class="ws-card-budget-box">
              <div class="ws-budget-badge-row">
                <span class="ws-budget-calc-tag">💰 Tu presupuesto: <strong>${WholesaleService.formatCOP(bRes.budget)}</strong></span>
              </div>
              <div class="ws-budget-result-main">
                <div class="ws-budget-can-buy">
                  Puedes comprar hasta <strong class="ws-highlight-qty">${bRes.maxUnits} unidades</strong>
                </div>
                <div class="ws-budget-breakdown">
                  <div>• Tarifa aplicada: <strong>${WholesaleService.formatCOP(bRes.unitPrice)} c/u</strong> (Rango +${bRes.tier})</div>
                  <div>• Total: <strong>${WholesaleService.formatCOP(bRes.totalCost)}</strong></div>
                  ${bRes.remainder > 0 ? `<div class="ws-budget-remainder">• Te sobran: <strong>${WholesaleService.formatCOP(bRes.remainder)}</strong></div>` : ''}
                </div>
              </div>
              <button type="button" 
                      class="btn btn-primary btn-block btn-ws-add-budget" 
                      onclick="Cart.addWholesalePack('${product.id}', ${bRes.maxUnits})"
                      title="Agregar ${bRes.maxUnits} unidades de ${product.nombre} al pedido">
                🛒 AGREGAR ESTA CANTIDAD AL CARRITO (${bRes.maxUnits} UDS)
              </button>
            </div>
          `;
        } else if (bRes && !bRes.canAfford) {
          budgetHtml = `
            <div class="ws-card-budget-box is-insufficient">
              <div class="ws-budget-badge-row">
                <span class="ws-budget-calc-tag">💰 Presupuesto: <strong>${WholesaleService.formatCOP(bRes.budget)}</strong></span>
              </div>
              <div class="ws-budget-insufficient-msg">
                ⚠️ Tu presupuesto no alcanza todavía para el mínimo mayorista de este producto (mínimo ${WholesaleService.formatCOP(bRes.minRequired)} para 5 unidades).
              </div>
            </div>
          `;
        }
      }

      return `
        <article class="product-card ws-product-card ${product.id === 'bugatti' ? 'is-bugatti' : ''}" id="ws-card-${product.id}" data-product-id="${product.id}">
          <div class="card-image-wrapper" onclick="CatalogController.openFlavorModal('${product.id}', true)" title="Ver sabores y detalles">
            <img src="${currentImage || 'assets/logo/logo.png'}" alt="${product.nombre}" class="product-img-real" loading="lazy">
          </div>

          <div class="card-body">
            <div class="card-meta-row">
              <span class="card-rating-badge"><span class="star-icon">★</span> ${(product.rating || 4.9).toFixed(1)}</span>
              ${savingPerUnit > 0 ? `<span class="ws-save-pill">Ahorro ${WholesaleService.formatCOP(savingPerUnit)}/u</span>` : ''}
              <span class="card-stock-badge in">🟢 Mayorista</span>
            </div>

            <div class="card-header-info">
              <h3 class="card-title">${product.nombre}</h3>
              <div class="card-puffs-tag">⚡ ${puffsBadgeText}</div>
            </div>

            ${variantsHtml}

            ${budgetHtml}

            <!-- Specific Tier Quantity Buttons with Pack Subtotals -->
            <div class="ws-tier-buttons-grid">
              ${tierKeys.map(tier => {
                const pUnit = prices[String(tier)];
                const packSubtotal = pUnit * tier;
                const isBest = (tier === maxTier && savingPerUnit > 0);
                return `
                  <button type="button" 
                    class="btn-ws-tier ${isBest ? 'best-tier' : ''}" 
                    onclick="Cart.addWholesalePack('${product.id}', ${tier})"
                    title="Agregar paquete de ${tier} unidades de ${product.nombre} (Total: ${WholesaleService.formatCOP(packSubtotal)})">
                    <span class="tier-qty-tag">+${tier} UDS</span>
                    <span class="tier-unit-price">${WholesaleService.formatCOP(pUnit)} c/u</span>
                    <span class="tier-pack-subtotal">Subtotal: ${WholesaleService.formatCOP(packSubtotal)}</span>
                  </button>
                `;
              }).join('')}
            </div>

          </div>
        </article>
      `;
    }).join('');
  },

  bindEvents() {
    document.querySelectorAll('.ws-cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ws-cat-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category || 'todos';
        this.renderCatalog();
      });
    });

    const searchInput = document.getElementById('wsCatalogSearch');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.renderCatalog();
        }, 200);
      });
    }

    const sortSelect = document.getElementById('wsCatalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCatalog();
      });
    }
  }
};

window.WHOLESALE_PASSWORD = WHOLESALE_PASSWORD;
window.WholesaleService = WholesaleService;
window.WholesaleCart = WholesaleCart;
window.WholesaleCatalog = WholesaleCatalog;
