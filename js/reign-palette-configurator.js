/**
 * CAPITAL VAPE — Configurador Visual de REIGN BAR PALETTE (Un Sabor / Combinar Dos Sabores)
 * - Modalidad A ("single"): ELIGE TU SABOR — Muestra y selecciona un único sabor con su fotografía real.
 * - Modalidad B ("dual"): COMBINA DOS SABORES — Permite elegir PRIMER SABOR (Módulo Izquierdo) y
 *   SEGUNDO SABOR (Módulo Derecho) diferentes, uniendo visualmente las dos mitades reales 3D.
 */
const ReignPaletteConfigurator = {
  productId: 'reign-bar-palette',
  mode: 'dual', // 'single' | 'dual'
  singleFlavor: 'Blue Razz Ice',
  flavor1: 'Blue Razz Ice',
  flavor2: 'Strawberry',
  selectedQty: 1,
  imageCache: {},
  lastCompositeDataUrl: null,

  getProduct() {
    if (typeof PRODUCTS_DATA === 'undefined') return null;
    return PRODUCTS_DATA.find(p => p.id === this.productId) || null;
  },

  getFlavors() {
    const prod = this.getProduct();
    if (!prod || !Array.isArray(prod.sabores)) return [];
    return prod.sabores.filter(s => s && s.visible !== false && s.img);
  },

  initDefaults() {
    const flavors = this.getFlavors();
    if (flavors.length === 0) return;

    if (!this.singleFlavor || !flavors.some(f => f.nombre === this.singleFlavor)) {
      this.singleFlavor = flavors[0].nombre;
    }
    if (!this.flavor1 || !flavors.some(f => f.nombre === this.flavor1)) {
      this.flavor1 = flavors[0].nombre;
    }
    if (!this.flavor2 || !flavors.some(f => f.nombre === this.flavor2) || this.flavor2 === this.flavor1) {
      const second = flavors.find(f => f.nombre !== this.flavor1) || flavors[0];
      this.flavor2 = second.nombre;
    }
  },

  getFlavorObj(flavorName) {
    const flavors = this.getFlavors();
    return flavors.find(f => f.nombre === flavorName) || flavors[0] || null;
  },

  getLeftHalfImgPath(flavorObj) {
    if (!flavorObj || !flavorObj.img) return 'REIGN BAR PALETTE/half-left/b-2.webp';
    return flavorObj.img.replace('REIGN BAR PALETTE/', 'REIGN BAR PALETTE/half-left/');
  },

  getRightHalfImgPath(flavorObj) {
    if (!flavorObj || !flavorObj.img) return 'REIGN BAR PALETTE/half-right/b-8.webp';
    return flavorObj.img.replace('REIGN BAR PALETTE/', 'REIGN BAR PALETTE/half-right/');
  },

  getCurrentVariantLabel() {
    this.initDefaults();
    if (this.mode === 'single') {
      return this.singleFlavor;
    }
    return `${this.flavor1} + ${this.flavor2}`;
  },

  syncCatalogSelectedVariant() {
    if (typeof CatalogController !== 'undefined' && CatalogController.selectedVariants) {
      CatalogController.selectedVariants[this.productId] = this.getCurrentVariantLabel();
    }
    if (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants) {
      WholesaleCatalog.selectedVariants[this.productId] = this.getCurrentVariantLabel();
    }
  },

  setMode(newMode) {
    if (newMode !== 'single' && newMode !== 'dual') return;
    this.initDefaults();
    this.mode = newMode;

    // Si pasa a dual, garantizar que los 2 sabores sean distintos
    if (this.mode === 'dual' && this.flavor1 === this.flavor2) {
      const flavors = this.getFlavors();
      const alt = flavors.find(f => f.nombre !== this.flavor1);
      if (alt) this.flavor2 = alt.nombre;
    }

    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  setSingleFlavor(flavorName) {
    const flavors = this.getFlavors();
    if (!flavors.some(f => f.nombre === flavorName)) return;

    this.mode = 'single';
    this.singleFlavor = flavorName;
    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  setFlavor(slot, flavorName) {
    this.setDualFlavor(slot, flavorName);
  },

  setDualFlavor(slot, flavorName) {
    const flavors = this.getFlavors();
    if (!flavors.some(f => f.nombre === flavorName)) return;

    this.mode = 'dual';

    if (Number(slot) === 1) {
      this.flavor1 = flavorName;
      // Si el segundo sabor era igual al nuevo primer sabor, seleccionar automáticamente otro diferente
      if (this.flavor2 === this.flavor1) {
        const diff = flavors.find(f => f.nombre !== this.flavor1);
        if (diff) {
          this.flavor2 = diff.nombre;
          if (typeof Toast !== 'undefined') {
            Toast.show(`Segundo sabor ajustado a "${this.flavor2}" para combinar dos sabores diferentes.`, 'info');
          }
        }
      }
    } else {
      if (flavorName === this.flavor1) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Elige un sabor diferente al Primer Sabor para combinar dos módulos distintos.', 'error');
        }
        return;
      }
      this.flavor2 = flavorName;
    }

    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  swapFlavors() {
    this.initDefaults();
    this.mode = 'dual';
    const temp = this.flavor1;
    this.flavor1 = this.flavor2;
    this.flavor2 = temp;
    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  randomizeFlavors() {
    const flavors = this.getFlavors();
    if (flavors.length < 2) return;
    this.mode = 'dual';
    const idx1 = Math.floor(Math.random() * flavors.length);
    let idx2 = Math.floor(Math.random() * flavors.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % flavors.length;
    this.flavor1 = flavors[idx1].nombre;
    this.flavor2 = flavors[idx2].nombre;
    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  setQty(qty) {
    const parsed = Math.max(1, Math.min(99, Number(qty) || 1));
    this.selectedQty = parsed;
    this.updateCardUI();
  },

  changeQtyStep(delta) {
    const next = Math.max(1, Math.min(99, (Number(this.selectedQty) || 1) + Number(delta)));
    this.selectedQty = next;
    this.updateCardUI();
  },

  calculateTotalForQty(product, qty) {
    const n = Math.max(1, Number(qty) || 1);
    const unitPrice = Number(product.precio) || 40000;
    const promo2 = Number(product.precio_promo_2) || 70000;
    const pairs = Math.floor(n / 2);
    const rem = n % 2;
    return (pairs * promo2) + (rem * unitPrice);
  },

  preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      if (this.imageCache[src] && this.imageCache[src].complete && this.imageCache[src].naturalWidth > 0) {
        resolve(this.imageCache[src]);
        return;
      }
      const img = new Image();
      img.onload = () => {
        this.imageCache[src] = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  },

  /**
   * Genera en segundo plano una miniatura combinada para el carrito o dibuja en cualquier canvas auxiliar
   */
  async renderCompositeCanvas(canvasOrId, flavor1Name, flavor2Name) {
    const canvas = typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId;
    this.initDefaults();
    const f1 = this.getFlavorObj(flavor1Name || this.flavor1);
    const f2 = this.getFlavorObj(flavor2Name || this.flavor2);
    if (!f1 || !f2) return null;

    const leftSrc = this.getLeftHalfImgPath(f1);
    const rightSrc = this.getRightHalfImgPath(f2);

    const [leftImg, rightImg] = await Promise.all([
      this.preloadImage(leftSrc),
      this.preloadImage(rightSrc)
    ]);

    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width || 500;
      const H = canvas.height || 500;
      ctx.clearRect(0, 0, W, H);
      if (leftImg) ctx.drawImage(leftImg, 0, 0, W, H);
      if (rightImg) ctx.drawImage(rightImg, 0, 0, W, H);
      try {
        this.lastCompositeDataUrl = canvas.toDataURL('image/webp', 0.9);
      } catch (e) {
        // Ignorar si file:// bloquea toDataURL
      }
    }
    return this.lastCompositeDataUrl;
  },

  async refreshAllCanvases() {
    this.initDefaults();
    const fSingle = this.getFlavorObj(this.singleFlavor);
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);

    // Actualizar vistas previas basadas en <img> reales
    document.querySelectorAll('.reign-main-single-img').forEach(img => {
      if (fSingle && fSingle.img && img.getAttribute('src') !== fSingle.img) {
        img.setAttribute('src', fSingle.img);
      }
      if (fSingle) img.setAttribute('alt', `${fSingle.nombre} - REIGN BAR PALETTE`);
    });

    const leftSrc = this.getLeftHalfImgPath(f1);
    const rightSrc = this.getRightHalfImgPath(f2);

    document.querySelectorAll('.reign-dual-left-img').forEach(img => {
      if (img.getAttribute('src') !== leftSrc) img.setAttribute('src', leftSrc);
      if (f1) img.setAttribute('alt', `Módulo Izquierdo: ${f1.nombre}`);
    });

    document.querySelectorAll('.reign-dual-right-img').forEach(img => {
      if (img.getAttribute('src') !== rightSrc) img.setAttribute('src', rightSrc);
      if (f2) img.setAttribute('alt', `Módulo Derecho: ${f2.nombre}`);
    });

    // Si existe algún canvas auxiliar en el modal o fuera de él, actualizarlo también
    const modalCanvas = document.getElementById('reignModalCompositeCanvas');
    if (modalCanvas) {
      await this.renderCompositeCanvas(modalCanvas, this.flavor1, this.flavor2);
    }
  },

  /**
   * Renderiza la ficha completa y rediseñada de REIGN BAR PALETTE siguiendo el orden 1 a 9
   */
  renderFeaturedCardInnerHTML(product) {
    this.initDefaults();
    const flavors = this.getFlavors();
    const fSingle = this.getFlavorObj(this.singleFlavor) || { nombre: this.singleFlavor, img: product.imagen };
    const f1 = this.getFlavorObj(this.flavor1) || { nombre: this.flavor1, img: product.imagen };
    const f2 = this.getFlavorObj(this.flavor2) || { nombre: this.flavor2, img: product.imagen };

    const leftHalfSrc = this.getLeftHalfImgPath(f1);
    const rightHalfSrc = this.getRightHalfImgPath(f2);

    const unitPrice = Number(product.precio) || 40000;
    const promo2Price = Number(product.precio_promo_2) || 70000;
    const ahorroDuo = (unitPrice * 2) - promo2Price;
    const activeTotal = this.calculateTotalForQty(product, this.selectedQty);
    const formatCOP = (val) => '$' + Number(val || 0).toLocaleString('es-CO');

    const isSingleMode = this.mode === 'single';

    // Tarjetas para MODALIDAD A — ELIGE TU SABOR
    const singleFlavorCardsHtml = flavors.map(flav => {
      const isSelected = flav.nombre === this.singleFlavor;
      const safeName = flav.nombre.replace(/'/g, "\\'");
      return `
        <button type="button"
                class="reign-flavor-visual-card single-card ${isSelected ? 'is-selected' : ''}"
                data-flavor="${flav.nombre}"
                onclick="ReignPaletteConfigurator.setSingleFlavor('${safeName}')"
                aria-pressed="${isSelected ? 'true' : 'false'}">
          <div class="reign-flavor-card-photo-box">
            <img src="${flav.img}" alt="${flav.nombre}" class="reign-flavor-card-photo" loading="lazy" onerror="this.src='assets/logo/logo.png';">
          </div>
          <span class="reign-flavor-card-title">${flav.nombre}</span>
          <span class="reign-flavor-card-badge">${isSelected ? '✓ Seleccionado' : 'Elegir sabor'}</span>
        </button>
      `;
    }).join('');

    // Tarjetas para MODALIDAD B — PRIMER SABOR (Módulo 1)
    const dualSlot1CardsHtml = flavors.map(flav => {
      const isSelected = flav.nombre === this.flavor1;
      const safeName = flav.nombre.replace(/'/g, "\\'");
      return `
        <button type="button"
                class="reign-flavor-visual-card slot-1-card ${isSelected ? 'is-selected' : ''}"
                data-slot="1"
                data-flavor="${flav.nombre}"
                onclick="ReignPaletteConfigurator.setDualFlavor(1, '${safeName}')"
                aria-pressed="${isSelected ? 'true' : 'false'}">
          <div class="reign-flavor-card-photo-box">
            <img src="${flav.img}" alt="${flav.nombre}" class="reign-flavor-card-photo" loading="lazy" onerror="this.src='assets/logo/logo.png';">
          </div>
          <span class="reign-flavor-card-title">${flav.nombre}</span>
          <span class="reign-flavor-card-badge">${isSelected ? '✓ 1° Sabor' : 'Elegir 1°'}</span>
        </button>
      `;
    }).join('');

    // Tarjetas para MODALIDAD B — SEGUNDO SABOR (Módulo 2)
    const dualSlot2CardsHtml = flavors.map(flav => {
      const isSelected = flav.nombre === this.flavor2;
      const isSameAsFirst = flav.nombre === this.flavor1;
      const safeName = flav.nombre.replace(/'/g, "\\'");
      return `
        <button type="button"
                class="reign-flavor-visual-card slot-2-card ${isSelected ? 'is-selected' : ''} ${isSameAsFirst ? 'is-disabled-duplicate' : ''}"
                data-slot="2"
                data-flavor="${flav.nombre}"
                ${isSameAsFirst ? 'disabled title="Ya seleccionado como Primer Sabor"' : `onclick="ReignPaletteConfigurator.setDualFlavor(2, '${safeName}')"`}
                aria-pressed="${isSelected ? 'true' : 'false'}">
          <div class="reign-flavor-card-photo-box">
            <img src="${flav.img}" alt="${flav.nombre}" class="reign-flavor-card-photo" loading="lazy" onerror="this.src='assets/logo/logo.png';">
          </div>
          <span class="reign-flavor-card-title">${flav.nombre}</span>
          <span class="reign-flavor-card-badge">${isSelected ? '✓ 2° Sabor' : (isSameAsFirst ? 'En 1° Sabor' : 'Elegir 2°')}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="reign-featured-layout">
        <!-- 1. FOTOGRAFÍA PRINCIPAL DEL PRODUCTO / VISTA PREVIA EN VIVO -->
        <div class="reign-section-1-preview-stage">
          <div class="reign-stage-top-badges">
            <span class="reign-recommended-pill-badge">⭐ PRODUCTO RECOMENDADO</span>
            <span class="reign-live-mode-indicator" id="reignStageModeBadge">
              ${isSingleMode ? '✨ MODO: UN SOLO SABOR' : '⚡ MODO: 2 SABORES COMBINADOS'}
            </span>
          </div>

          <!-- Escenario Modalidad A: Imagen Real del Sabor Seleccionado -->
          <div class="reign-preview-single-view" id="reignPreviewSingleView" style="display: ${isSingleMode ? 'flex' : 'none'};">
            <div class="reign-single-photo-frame">
              <img src="${fSingle.img}"
                   alt="${fSingle.nombre} - REIGN BAR PALETTE"
                   class="reign-main-single-img"
                   id="reignMainSingleImg"
                   onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
            </div>
            <div class="reign-preview-single-caption">
              <span class="reign-caption-tag">SABOR SELECCIONADO</span>
              <strong class="reign-caption-flavor-name" id="reignSingleCaptionName">${fSingle.nombre}</strong>
            </div>
          </div>

          <!-- Escenario Modalidad B: Composición Visual 3D de los Dos Módulos Unidos + Fotos Reales -->
          <div class="reign-preview-dual-view" id="reignPreviewDualView" style="display: ${isSingleMode ? 'none' : 'flex'};">
            <div class="reign-dual-device-stage">
              <!-- Dispositivo Completo 3D con ambas mitades ensambladas -->
              <div class="reign-dual-3d-stack" title="Dispositivo REIGN BAR PALETTE ensamblado con tus 2 sabores">
                <img src="${leftHalfSrc}"
                     alt="Módulo 1: ${f1.nombre}"
                     class="reign-dual-half-img reign-dual-left-img"
                     id="reignDualLeftImg"
                     onerror="this.src='REIGN BAR PALETTE/half-left/b-2.webp';">
                <img src="${rightHalfSrc}"
                     alt="Módulo 2: ${f2.nombre}"
                     class="reign-dual-half-img reign-dual-right-img"
                     id="reignDualRightImg"
                     onerror="this.src='REIGN BAR PALETTE/half-right/b-8.webp';">
              </div>

              <!-- Tarjetas flotantes de los dos módulos reales seleccionados -->
              <div class="reign-dual-modules-floating-row">
                <div class="reign-module-mini-card mod-left">
                  <img src="${f1.img}" alt="${f1.nombre}" class="reign-mod-mini-img" id="reignStageMod1Img" onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
                  <div class="reign-mod-mini-info">
                    <span class="reign-mod-mini-tag">1° MÓDULO IZQ.</span>
                    <strong class="reign-mod-mini-name" id="reignStageMod1Name">${f1.nombre}</strong>
                  </div>
                </div>
                <div class="reign-module-join-icon">+</div>
                <div class="reign-module-mini-card mod-right">
                  <img src="${f2.img}" alt="${f2.nombre}" class="reign-mod-mini-img" id="reignStageMod2Img" onerror="this.src='REIGN BAR PALETTE/b-8.webp';">
                  <div class="reign-mod-mini-info">
                    <span class="reign-mod-mini-tag">2° MÓDULO DER.</span>
                    <strong class="reign-mod-mini-name" id="reignStageMod2Name">${f2.nombre}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. NOMBRE REIGN BAR PALETTE -->
        <div class="reign-section-2-header">
          <div class="reign-header-badges-line">
            <span class="reign-star-rec-tag">⭐ RECOMENDADO #1</span>
            <span class="reign-stock-available-tag">🟢 Disponible para envío inmediato</span>
            <span class="reign-rating-pill">★ ${(product.rating || 5.0).toFixed(1)}</span>
          </div>
          <h3 class="reign-main-product-title">${product.nombre}</h3>
          <p class="reign-main-product-subtitle">
            Sistema modular de vapeo de última generación. Llévalo en tu sabor favorito o combina dos sabores diferentes en un solo dispositivo.
          </p>
        </div>

        <!-- 3. CARACTERÍSTICAS: 50.000 PUFFS Y 1200 MAH -->
        <div class="reign-section-3-specs">
          <div class="reign-spec-feature-pill">
            <span class="reign-spec-icon">⚡</span>
            <div class="reign-spec-text">
              <span class="reign-spec-label">Capacidad</span>
              <strong class="reign-spec-value">50.000 Puffs</strong>
            </div>
          </div>
          <div class="reign-spec-feature-pill">
            <span class="reign-spec-icon">🔋</span>
            <div class="reign-spec-text">
              <span class="reign-spec-label">Batería Recargable</span>
              <strong class="reign-spec-value">1200 mAh</strong>
            </div>
          </div>
          <div class="reign-spec-feature-pill">
            <span class="reign-spec-icon">🎨</span>
            <div class="reign-spec-text">
              <span class="reign-spec-label">Sabores Reales</span>
              <strong class="reign-spec-value">${flavors.length} Sabores</strong>
            </div>
          </div>
        </div>

        <!-- 4. PRECIO INDIVIDUAL Y PROMOCIÓN POR 2 UNIDADES -->
        <div class="reign-section-4-pricing">
          <div class="reign-price-box regular-price-box ${this.selectedQty === 1 ? 'is-active-tier' : ''}"
               onclick="ReignPaletteConfigurator.setQty(1)"
               role="button"
               tabindex="0"
               title="Seleccionar 1 unidad por ${formatCOP(unitPrice)} COP">
            <div class="reign-price-box-top">
              <span class="reign-price-tier-badge">1 UNIDAD</span>
              <span class="reign-price-tier-sub">Precio Individual</span>
            </div>
            <div class="reign-price-amount">${formatCOP(unitPrice)} <small>COP</small></div>
          </div>

          <div class="reign-price-box promo-price-box ${this.selectedQty >= 2 ? 'is-active-tier' : ''}"
               onclick="ReignPaletteConfigurator.setQty(2)"
               role="button"
               tabindex="0"
               title="Seleccionar promoción de 2 unidades por ${formatCOP(promo2Price)} COP">
            <div class="reign-price-box-top">
              <span class="reign-price-tier-badge promo-badge">🔥 PROMOCIÓN 2 UNIDADES</span>
              <span class="reign-price-save-pill">¡Ahorras ${formatCOP(ahorroDuo)}!</span>
            </div>
            <div class="reign-price-amount promo-amount">${formatCOP(promo2Price)} <small>COP</small></div>
            <div class="reign-price-unit-note">Te sale a ${formatCOP(Math.round(promo2Price / 2))} COP cada unidad</div>
          </div>
        </div>

        <!-- 5. SELECTOR DE MODALIDAD: UN SABOR O DOS SABORES -->
        <div class="reign-section-5-mode-selector">
          <div class="reign-mode-selector-label">¿CÓMO QUIERES PERSONALIZAR TU REIGN BAR PALETTE?</div>
          <div class="reign-mode-buttons-grid" role="tablist" aria-label="Modalidad de personalización">
            <button type="button"
                    role="tab"
                    id="reignTabSingleBtn"
                    aria-selected="${isSingleMode ? 'true' : 'false'}"
                    class="reign-mode-tab-btn ${isSingleMode ? 'active' : ''}"
                    onclick="ReignPaletteConfigurator.setMode('single')">
              <span class="reign-mode-tab-icon">🍓</span>
              <div class="reign-mode-tab-text">
                <strong>ELIGE TU SABOR</strong>
                <span>Modalidad de un solo sabor</span>
              </div>
            </button>

            <button type="button"
                    role="tab"
                    id="reignTabDualBtn"
                    aria-selected="${!isSingleMode ? 'true' : 'false'}"
                    class="reign-mode-tab-btn ${!isSingleMode ? 'active' : ''}"
                    onclick="ReignPaletteConfigurator.setMode('dual')">
              <span class="reign-mode-tab-icon">⚡</span>
              <div class="reign-mode-tab-text">
                <strong>COMBINA DOS SABORES</strong>
                <span>Une dos sabores diferentes</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 6. SELECTORES DE SABOR CORRESPONDIENTES -->
        <div class="reign-section-6-selectors">
          <!-- MODALIDAD A — ELEGIR UN SOLO SABOR -->
          <div class="reign-modality-panel modality-single-panel" id="reignModalitySinglePanel" style="display: ${isSingleMode ? 'flex' : 'none'};">
            <div class="reign-modality-header">
              <div>
                <span class="reign-modality-kicker">MODALIDAD A • UN SOLO SABOR</span>
                <h4 class="reign-modality-title">ELIGE TU SABOR</h4>
                <p class="reign-modality-desc">Selecciona tu sabor favorito.</p>
              </div>
              <div class="reign-active-selection-pill">
                <span>Seleccionado:</span>
                <strong id="reignSingleSelectedPillName">${fSingle.nombre}</strong>
              </div>
            </div>

            <div class="reign-visual-flavors-grid" id="reignSingleFlavorsGrid">
              ${singleFlavorCardsHtml}
            </div>
          </div>

          <!-- MODALIDAD B — COMBINAR DOS SABORES -->
          <div class="reign-modality-panel modality-dual-panel" id="reignModalityDualPanel" style="display: ${!isSingleMode ? 'flex' : 'none'};">
            <div class="reign-modality-header">
              <div>
                <span class="reign-modality-kicker">MODALIDAD B • DOS MÓDULOS INDEPENDIENTES</span>
                <h4 class="reign-modality-title">COMBINA DOS SABORES</h4>
                <p class="reign-modality-desc">Personaliza tu REIGN BAR combinando dos sabores diferentes.</p>
              </div>
              <div class="reign-dual-helper-actions">
                <button type="button" class="reign-helper-action-btn" onclick="ReignPaletteConfigurator.swapFlavors()" title="Intercambiar posición de los sabores">
                  ⇄ Intercambiar lados
                </button>
                <button type="button" class="reign-helper-action-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()" title="Elegir dos sabores al azar">
                  🎲 Mezcla aleatoria
                </button>
              </div>
            </div>

            <div class="reign-dual-selectors-columns">
              <!-- PRIMER SABOR -->
              <div class="reign-dual-selector-box slot-1-box">
                <div class="reign-dual-selector-head">
                  <div class="reign-dual-step-title-group">
                    <span class="reign-dual-step-badge mod-1">MÓDULO 1 • IZQUIERDO</span>
                    <h5 class="reign-dual-step-title">PRIMER SABOR</h5>
                  </div>
                  <div class="reign-dual-current-chip">
                    <img src="${f1.img}" alt="${f1.nombre}" id="reignSlot1ChipImg" onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
                    <strong id="reignSlot1CurrentName">${f1.nombre}</strong>
                  </div>
                </div>
                <div class="reign-visual-flavors-grid is-dual-subgrid" id="reignDualSlot1Grid">
                  ${dualSlot1CardsHtml}
                </div>
              </div>

              <!-- SEGUNDO SABOR -->
              <div class="reign-dual-selector-box slot-2-box">
                <div class="reign-dual-selector-head">
                  <div class="reign-dual-step-title-group">
                    <span class="reign-dual-step-badge mod-2">MÓDULO 2 • DERECHO</span>
                    <h5 class="reign-dual-step-title">SEGUNDO SABOR</h5>
                  </div>
                  <div class="reign-dual-current-chip mod-2">
                    <img src="${f2.img}" alt="${f2.nombre}" id="reignSlot2ChipImg" onerror="this.src='REIGN BAR PALETTE/b-8.webp';">
                    <strong id="reignSlot2CurrentName">${f2.nombre}</strong>
                  </div>
                </div>
                <div class="reign-visual-flavors-grid is-dual-subgrid" id="reignDualSlot2Grid">
                  ${dualSlot2CardsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. VISTA PREVIA DE LA SELECCIÓN (RESUMEN CLARO ANTES DE COMPRAR) -->
        <div class="reign-section-7-selection-summary">
          <div class="reign-summary-header-row">
            <span class="reign-summary-kicker">✓ TU CONFIGURACIÓN ACTUAL</span>
            <span class="reign-summary-mode-tag" id="reignSummaryModeText">
              ${isSingleMode ? 'Modalidad: Un solo sabor' : 'Modalidad: Combinación de 2 sabores'}
            </span>
          </div>

          <!-- Resumen cuando está en Modalidad A (1 sabor) -->
          <div class="reign-summary-single-content" id="reignSummarySingleBox" style="display: ${isSingleMode ? 'flex' : 'none'};">
            <div class="reign-summary-flavor-pill single-pill">
              <img src="${fSingle.img}" alt="${fSingle.nombre}" class="reign-summary-thumb" id="reignSummarySingleImg" onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
              <div class="reign-summary-pill-meta">
                <span>Sabor seleccionado</span>
                <strong id="reignSummarySingleName">${fSingle.nombre}</strong>
              </div>
            </div>
          </div>

          <!-- Resumen cuando está en Modalidad B (2 sabores) -->
          <div class="reign-summary-dual-content" id="reignSummaryDualBox" style="display: ${!isSingleMode ? 'flex' : 'none'};">
            <div class="reign-summary-flavor-pill">
              <img src="${f1.img}" alt="${f1.nombre}" class="reign-summary-thumb" id="reignSummaryF1Img" onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
              <div class="reign-summary-pill-meta">
                <span>Primer Sabor (Módulo 1)</span>
                <strong id="reignSummaryF1Name">${f1.nombre}</strong>
              </div>
            </div>

            <div class="reign-summary-plus-circle">+</div>

            <div class="reign-summary-flavor-pill">
              <img src="${f2.img}" alt="${f2.nombre}" class="reign-summary-thumb" id="reignSummaryF2Img" onerror="this.src='REIGN BAR PALETTE/b-8.webp';">
              <div class="reign-summary-pill-meta">
                <span>Segundo Sabor (Módulo 2)</span>
                <strong id="reignSummaryF2Name">${f2.nombre}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. SELECTOR DE CANTIDAD -->
        <div class="reign-section-8-quantity">
          <div class="reign-qty-header-row">
            <span class="reign-qty-label">CANTIDAD A LLEVAR:</span>
            <span class="reign-qty-total-preview">
              Total: <strong id="reignSummaryTotalPrice">${formatCOP(activeTotal)} COP</strong>
            </span>
          </div>

          <div class="reign-qty-controls-layout">
            <div class="reign-qty-presets">
              <button type="button"
                      class="reign-qty-preset-btn ${this.selectedQty === 1 ? 'active' : ''}"
                      data-qty="1"
                      onclick="ReignPaletteConfigurator.setQty(1)">
                <span class="preset-qty-title">1 Unidad</span>
                <strong class="preset-qty-price">${formatCOP(unitPrice)} COP</strong>
              </button>

              <button type="button"
                      class="reign-qty-preset-btn is-promo-preset ${this.selectedQty === 2 ? 'active' : ''}"
                      data-qty="2"
                      onclick="ReignPaletteConfigurator.setQty(2)">
                <span class="preset-qty-title">🔥 2 Unidades (Promo)</span>
                <strong class="preset-qty-price">${formatCOP(promo2Price)} COP</strong>
              </button>
            </div>

            <div class="reign-qty-stepper" aria-label="Control manual de cantidad">
              <button type="button" class="reign-stepper-btn" onclick="ReignPaletteConfigurator.changeQtyStep(-1)" title="Restar 1 unidad">−</button>
              <span class="reign-stepper-val" id="reignStepperQtyVal">${this.selectedQty}</span>
              <button type="button" class="reign-stepper-btn" onclick="ReignPaletteConfigurator.changeQtyStep(1)" title="Sumar 1 unidad">+</button>
            </div>
          </div>
        </div>

        <!-- 9. BOTÓN GRANDE PARA AGREGAR AL CARRITO -->
        <div class="reign-section-9-actions">
          <button type="button"
                  class="btn btn-primary reign-main-add-cart-btn"
                  id="reignMainAddCartBtn"
                  onclick="ReignPaletteConfigurator.addConfiguredToCart()">
            <img src="assets/icons/carrito.png" class="btn-inline-icon" alt="Carrito">
            <span id="reignAddCartBtnText">
              ${isSingleMode
                ? `AGREGAR "${fSingle.nombre.toUpperCase()}" AL CARRITO — ${formatCOP(activeTotal)} COP`
                : `AGREGAR COMBINACIÓN AL CARRITO — ${formatCOP(activeTotal)} COP`}
            </span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Alias de compatibilidad en caso de ser invocado desde código heredado
   */
  renderCardConfiguratorHTML(product) {
    return this.renderFeaturedCardInnerHTML(product);
  },

  /**
   * Actualiza dinámicamente todos los textos, tarjetas y vistas previas de la ficha
   */
  updateCardUI() {
    const prod = this.getProduct();
    if (!prod) return;
    this.initDefaults();

    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor) || { nombre: this.singleFlavor, img: prod.imagen };
    const f1 = this.getFlavorObj(this.flavor1) || { nombre: this.flavor1, img: prod.imagen };
    const f2 = this.getFlavorObj(this.flavor2) || { nombre: this.flavor2, img: prod.imagen };

    const activeTotal = this.calculateTotalForQty(prod, this.selectedQty);
    const formatCOP = (val) => '$' + Number(val || 0).toLocaleString('es-CO');

    // 1. Actualizar escenario de imagen principal (Un sabor vs Dos sabores)
    const stageBadge = document.getElementById('reignStageModeBadge');
    if (stageBadge) {
      stageBadge.textContent = isSingleMode ? '✨ MODO: UN SOLO SABOR' : '⚡ MODO: 2 SABORES COMBINADOS';
    }

    const singleView = document.getElementById('reignPreviewSingleView');
    const dualView = document.getElementById('reignPreviewDualView');
    if (singleView) singleView.style.display = isSingleMode ? 'flex' : 'none';
    if (dualView) dualView.style.display = isSingleMode ? 'none' : 'flex';

    const mainSingleImg = document.getElementById('reignMainSingleImg');
    if (mainSingleImg && fSingle.img) {
      mainSingleImg.src = fSingle.img;
      mainSingleImg.alt = `${fSingle.nombre} - REIGN BAR PALETTE`;
    }
    const singleCaptionName = document.getElementById('reignSingleCaptionName');
    if (singleCaptionName) singleCaptionName.textContent = fSingle.nombre;

    const leftImg = document.getElementById('reignDualLeftImg');
    const rightImg = document.getElementById('reignDualRightImg');
    if (leftImg) {
      leftImg.src = this.getLeftHalfImgPath(f1);
      leftImg.alt = `Módulo 1: ${f1.nombre}`;
    }
    if (rightImg) {
      rightImg.src = this.getRightHalfImgPath(f2);
      rightImg.alt = `Módulo 2: ${f2.nombre}`;
    }

    const mod1Img = document.getElementById('reignStageMod1Img');
    const mod1Name = document.getElementById('reignStageMod1Name');
    if (mod1Img && f1.img) mod1Img.src = f1.img;
    if (mod1Name) mod1Name.textContent = f1.nombre;

    const mod2Img = document.getElementById('reignStageMod2Img');
    const mod2Name = document.getElementById('reignStageMod2Name');
    if (mod2Img && f2.img) mod2Img.src = f2.img;
    if (mod2Name) mod2Name.textContent = f2.nombre;

    // 4. Actualizar estado visual de cajas de precios
    document.querySelectorAll('.reign-section-4-pricing .regular-price-box').forEach(box => {
      box.classList.toggle('is-active-tier', this.selectedQty === 1);
    });
    document.querySelectorAll('.reign-section-4-pricing .promo-price-box').forEach(box => {
      box.classList.toggle('is-active-tier', this.selectedQty >= 2);
    });

    // 5. Actualizar pestañas de modalidad
    const tabSingle = document.getElementById('reignTabSingleBtn');
    const tabDual = document.getElementById('reignTabDualBtn');
    if (tabSingle) {
      tabSingle.classList.toggle('active', isSingleMode);
      tabSingle.setAttribute('aria-selected', isSingleMode ? 'true' : 'false');
    }
    if (tabDual) {
      tabDual.classList.toggle('active', !isSingleMode);
      tabDual.setAttribute('aria-selected', !isSingleMode ? 'true' : 'false');
    }

    // 6. Mostrar/ocultar paneles de modalidad y actualizar estados de tarjetas
    const singlePanel = document.getElementById('reignModalitySinglePanel');
    const dualPanel = document.getElementById('reignModalityDualPanel');
    if (singlePanel) singlePanel.style.display = isSingleMode ? 'flex' : 'none';
    if (dualPanel) dualPanel.style.display = !isSingleMode ? 'flex' : 'none';

    const singlePillName = document.getElementById('reignSingleSelectedPillName');
    if (singlePillName) singlePillName.textContent = fSingle.nombre;

    // Tarjetas Modalidad A
    document.querySelectorAll('.reign-flavor-visual-card.single-card').forEach(card => {
      const fname = card.getAttribute('data-flavor');
      const selected = fname === this.singleFlavor;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const badge = card.querySelector('.reign-flavor-card-badge');
      if (badge) badge.textContent = selected ? '✓ Seleccionado' : 'Elegir sabor';
    });

    // Tarjetas Modalidad B — Primer Sabor
    const slot1NameEl = document.getElementById('reignSlot1CurrentName');
    const slot1ChipImg = document.getElementById('reignSlot1ChipImg');
    if (slot1NameEl) slot1NameEl.textContent = f1.nombre;
    if (slot1ChipImg && f1.img) slot1ChipImg.src = f1.img;

    document.querySelectorAll('.reign-flavor-visual-card.slot-1-card').forEach(card => {
      const fname = card.getAttribute('data-flavor');
      const selected = fname === this.flavor1;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const badge = card.querySelector('.reign-flavor-card-badge');
      if (badge) badge.textContent = selected ? '✓ 1° Sabor' : 'Elegir 1°';
    });

    // Tarjetas Modalidad B — Segundo Sabor (deshabilitando el que ya está en Primer Sabor)
    const slot2NameEl = document.getElementById('reignSlot2CurrentName');
    const slot2ChipImg = document.getElementById('reignSlot2ChipImg');
    if (slot2NameEl) slot2NameEl.textContent = f2.nombre;
    if (slot2ChipImg && f2.img) slot2ChipImg.src = f2.img;

    document.querySelectorAll('.reign-flavor-visual-card.slot-2-card').forEach(card => {
      const fname = card.getAttribute('data-flavor');
      const selected = fname === this.flavor2;
      const isDuplicate = fname === this.flavor1;
      const safeName = (fname || '').replace(/'/g, "\\'");

      card.classList.toggle('is-selected', selected);
      card.classList.toggle('is-disabled-duplicate', isDuplicate);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');

      if (isDuplicate) {
        card.setAttribute('disabled', 'disabled');
        card.setAttribute('title', 'Ya seleccionado como Primer Sabor');
        card.removeAttribute('onclick');
      } else {
        card.removeAttribute('disabled');
        card.removeAttribute('title');
        card.setAttribute('onclick', `ReignPaletteConfigurator.setDualFlavor(2, '${safeName}')`);
      }

      const badge = card.querySelector('.reign-flavor-card-badge');
      if (badge) {
        badge.textContent = selected ? '✓ 2° Sabor' : (isDuplicate ? 'En 1° Sabor' : 'Elegir 2°');
      }
    });

    // 7. Actualizar Resumen de Selección
    const summaryModeText = document.getElementById('reignSummaryModeText');
    if (summaryModeText) {
      summaryModeText.textContent = isSingleMode ? 'Modalidad: Un solo sabor' : 'Modalidad: Combinación de 2 sabores';
    }
    const summarySingleBox = document.getElementById('reignSummarySingleBox');
    const summaryDualBox = document.getElementById('reignSummaryDualBox');
    if (summarySingleBox) summarySingleBox.style.display = isSingleMode ? 'flex' : 'none';
    if (summaryDualBox) summaryDualBox.style.display = !isSingleMode ? 'flex' : 'none';

    const sumSingleImg = document.getElementById('reignSummarySingleImg');
    const sumSingleName = document.getElementById('reignSummarySingleName');
    if (sumSingleImg && fSingle.img) sumSingleImg.src = fSingle.img;
    if (sumSingleName) sumSingleName.textContent = fSingle.nombre;

    const sumF1Img = document.getElementById('reignSummaryF1Img');
    const sumF1Name = document.getElementById('reignSummaryF1Name');
    if (sumF1Img && f1.img) sumF1Img.src = f1.img;
    if (sumF1Name) sumF1Name.textContent = f1.nombre;

    const sumF2Img = document.getElementById('reignSummaryF2Img');
    const sumF2Name = document.getElementById('reignSummaryF2Name');
    if (sumF2Img && f2.img) sumF2Img.src = f2.img;
    if (sumF2Name) sumF2Name.textContent = f2.nombre;

    // 8. Actualizar Selector de Cantidad
    const sumTotalPrice = document.getElementById('reignSummaryTotalPrice');
    if (sumTotalPrice) sumTotalPrice.textContent = `${formatCOP(activeTotal)} COP`;

    const stepperVal = document.getElementById('reignStepperQtyVal');
    if (stepperVal) stepperVal.textContent = String(this.selectedQty);

    document.querySelectorAll('.reign-qty-preset-btn').forEach(btn => {
      const q = Number(btn.getAttribute('data-qty'));
      btn.classList.toggle('active', q === this.selectedQty);
    });

    // 9. Actualizar texto del botón de agregar al carrito
    const addBtnText = document.getElementById('reignAddCartBtnText');
    if (addBtnText) {
      addBtnText.textContent = isSingleMode
        ? `AGREGAR "${fSingle.nombre.toUpperCase()}" AL CARRITO — ${formatCOP(activeTotal)} COP`
        : `AGREGAR COMBINACIÓN AL CARRITO — ${formatCOP(activeTotal)} COP`;
    }
  },

  /**
   * Renderiza el estudio dentro del modal de sabores (para Mayoristas o vista ampliada)
   */
  renderModalConfigurator(gridEl, filterText = '', isWholesale = false) {
    if (!gridEl) return;
    this.initDefaults();
    const prod = this.getProduct();
    if (!prod) return;

    const allFlavors = this.getFlavors();
    const filtered = filterText
      ? allFlavors.filter(f => f.nombre.toLowerCase().includes(filterText) || (f.desc || '').toLowerCase().includes(filterText))
      : allFlavors;

    const f1 = this.getFlavorObj(this.flavor1) || allFlavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || allFlavors[1] || allFlavors[0];
    const leftHalfSrc = this.getLeftHalfImgPath(f1);
    const rightHalfSrc = this.getRightHalfImgPath(f2);
    const formatCOP = (val) => '$' + Number(val || 0).toLocaleString('es-CO');

    const renderModalGrid = (slotNum, activeFlavorName) => {
      if (filtered.length === 0) {
        return `<div class="reign-empty-filter">No se encontraron sabores con "${filterText}".</div>`;
      }
      return filtered.map(f => {
        const isSelected = f.nombre === activeFlavorName;
        const isDuplicate = slotNum === 2 && f.nombre === this.flavor1;
        const safeName = f.nombre.replace(/'/g, "\\'");
        return `
          <button type="button"
                  class="reign-modal-flavor-card ${isSelected ? 'is-selected' : ''} ${isDuplicate ? 'is-disabled-duplicate' : ''}"
                  data-slot="${slotNum}"
                  data-flavor="${f.nombre}"
                  ${isDuplicate ? 'disabled title="Ya elegido en Primer Sabor"' : `onclick="ReignPaletteConfigurator.selectFromModal(${slotNum}, '${safeName}')"`}>
            <div class="reign-modal-card-img-box">
              <img src="${f.img}" alt="${f.nombre}" loading="lazy" onerror="this.src='assets/logo/logo.png';">
            </div>
            <div class="reign-modal-card-Name">${f.nombre}</div>
            <span class="reign-opt-status">${isSelected ? '✓ Seleccionado' : (isDuplicate ? 'En 1° Sabor' : 'Elegir')}</span>
          </button>
        `;
      }).join('');
    };

    const activeTotal = this.calculateTotalForQty(prod, this.selectedQty);

    gridEl.innerHTML = `
      <div class="reign-modal-studio">
        <div class="reign-modal-preview-panel">
          <div class="reign-modal-preview-header">
            <span class="reign-config-badge">⚡ VISTA PREVIA EN VIVO</span>
            <h4>PERSONALIZA TU REIGN BAR PALETTE</h4>
            <p class="reign-modal-preview-sub">Combina dos sabores diferentes y visualiza tu dispositivo al instante.</p>
          </div>

          <div class="reign-modal-canvas-stage" style="display:flex;align-items:center;justify-content:center;padding:12px;">
            <div class="reign-dual-3d-stack" style="max-width:290px;max-height:290px;">
              <img src="${leftHalfSrc}" alt="${f1.nombre}" class="reign-dual-half-img reign-dual-left-img">
              <img src="${rightHalfSrc}" alt="${f2.nombre}" class="reign-dual-half-img reign-dual-right-img">
            </div>
          </div>

          <div class="reign-modal-quick-controls">
            <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors(); CatalogController.renderModalFlavors(document.getElementById('flavorSearchInput')?.value || '');">
              ⇄ Intercambiar Lados
            </button>
            <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors(); CatalogController.renderModalFlavors(document.getElementById('flavorSearchInput')?.value || '');">
              🎲 Combinación Aleatoria
            </button>
          </div>

          <div class="reign-modal-summary-card">
            <div class="reign-summary-detail-line"><span>Primer sabor:</span> <strong>${f1.nombre}</strong></div>
            <div class="reign-summary-detail-line"><span>Segundo sabor:</span> <strong>${f2.nombre}</strong></div>
            ${!isWholesale ? `
              <div class="reign-summary-detail-line">
                <span>Precio (${this.selectedQty} ${this.selectedQty === 1 ? 'unidad' : 'unidades'}):</span>
                <strong class="reign-summary-price-val">${formatCOP(activeTotal)} COP</strong>
              </div>
              <button type="button" class="btn btn-primary btn-block" style="margin-top:12px;padding:14px;font-size:1rem;font-weight:800;" onclick="ReignPaletteConfigurator.addConfiguredToCart(${this.selectedQty}, true)">
                🛒 Agregar Combinación al Carrito (${formatCOP(activeTotal)})
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-block" style="margin-top:12px;padding:14px;font-size:1rem;font-weight:800;" onclick="ReignPaletteConfigurator.applyWholesaleCombination()">
                ✓ Aplicar Combinación para Pedido Mayorista
              </button>
            `}
          </div>
        </div>

        <div class="reign-modal-selectors-panel">
          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill">MÓDULO 1 (IZQUIERDA)</span>
                <h5 class="reign-modal-step-heading">PRIMER SABOR</h5>
              </div>
              <span class="reign-modal-selected-indicator">Elegido: ${f1.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${renderModalGrid(1, this.flavor1)}
            </div>
          </div>

          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill step-2">MÓDULO 2 (DERECHA)</span>
                <h5 class="reign-modal-step-heading">SEGUNDO SABOR</h5>
              </div>
              <span class="reign-modal-selected-indicator">Elegido: ${f2.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${renderModalGrid(2, this.flavor2)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectFromModal(slot, flavorName) {
    this.setDualFlavor(slot, flavorName);
    if (typeof CatalogController !== 'undefined' && CatalogController.activeModalProductId === this.productId) {
      const searchInput = document.getElementById('flavorSearchInput');
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      CatalogController.renderModalFlavors(q);
    }
  },

  applyWholesaleCombination() {
    const comboLabel = `${this.flavor1} + ${this.flavor2}`;
    if (typeof WholesaleCatalog !== 'undefined') {
      WholesaleCatalog.selectedVariants[this.productId] = comboLabel;
      WholesaleCatalog.renderGrid();
    }
    if (typeof CatalogController !== 'undefined') {
      CatalogController.closeFlavorModal();
    }
    if (typeof Toast !== 'undefined') {
      Toast.show(`✓ Combinación "${comboLabel}" seleccionada para Mayoristas`, 'success');
    }
  },

  /**
   * Agrega la selección activa (Modalidad A: 1 sabor o Modalidad B: 2 sabores diferentes) al Carrito
   */
  async addConfiguredToCart(overrideQty = null, closeModalAfter = false) {
    const prod = this.getProduct();
    if (!prod || prod.agotado || prod.coming_soon) return;
    this.initDefaults();

    const qtyToUse = overrideQty !== null && overrideQty !== undefined
      ? Math.max(1, Number(overrideQty) || 1)
      : Math.max(1, Number(this.selectedQty) || 1);

    if (this.mode === 'single') {
      const fSingle = this.getFlavorObj(this.singleFlavor);
      if (!fSingle || !fSingle.nombre) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Por favor selecciona un sabor antes de agregar al carrito.', 'error');
        }
        return;
      }

      if (typeof Cart !== 'undefined') {
        Cart.addItem(prod, fSingle.nombre, qtyToUse, {
          isDualFlavor: false,
          singleImg: fSingle.img
        });
      }
    } else {
      // Modalidad B: Validar que ambos sabores estén seleccionados y sean diferentes
      if (!this.flavor1 || !this.flavor2) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Por favor selecciona el Primer Sabor y el Segundo Sabor para completar tu combinación.', 'error');
        }
        return;
      }
      if (this.flavor1 === this.flavor2) {
        if (typeof Toast !== 'undefined') {
          Toast.show('En la modalidad "Combina dos sabores", elige un Segundo Sabor diferente al primero.', 'error');
        }
        return;
      }

      const f1 = this.getFlavorObj(this.flavor1);
      const f2 = this.getFlavorObj(this.flavor2);
      const comboVariant = `${f1.nombre} + ${f2.nombre}`;

      // Generar miniatura combinada en un canvas offscreen si es posible
      let compositeImg = '';
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 300;
        offCanvas.height = 300;
        compositeImg = (await this.renderCompositeCanvas(offCanvas, f1.nombre, f2.nombre)) || '';
      } catch (e) {
        compositeImg = '';
      }

      if (typeof Cart !== 'undefined') {
        Cart.addItem(prod, comboVariant, qtyToUse, {
          isDualFlavor: true,
          flavor1: f1.nombre,
          flavor2: f2.nombre,
          flavor1Img: f1 ? f1.img : prod.imagen,
          flavor2Img: f2 ? f2.img : prod.imagen,
          compositeImg: compositeImg || (f1 ? f1.img : prod.imagen)
        });
      }
    }

    if (closeModalAfter && typeof CatalogController !== 'undefined') {
      CatalogController.closeFlavorModal();
    }
  }
};

window.ReignPaletteConfigurator = ReignPaletteConfigurator;
