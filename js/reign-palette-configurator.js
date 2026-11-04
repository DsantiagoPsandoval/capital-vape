/**
 * CAPITAL VAPE — Configurador Visual Integrado para REIGN BAR PALETTE
 * Presenta PASO 1 (Primer Sabor) y PASO 2 (Segundo Sabor) con tarjetas visuales
 * y vista previa 3D en tiempo real de las dos mitades acopladas,
 * sin recuadros redundantes de combinación ni botón de pantalla completa.
 */
const ReignPaletteConfigurator = {
  productId: 'reign-bar-palette',
  mode: 'dual', // 'dual' | 'single'
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

  init() {
    this.initDefaults();
    this.syncCatalogSelectedVariant();
  },

  initDefaults() {
    const flavors = this.getFlavors();
    if (flavors.length === 0) return;

    if (!this.singleFlavor || !flavors.some(f => f.nombre === this.singleFlavor)) {
      const hasBlueRazz = flavors.find(f => f.nombre === 'Blue Razz Ice');
      this.singleFlavor = hasBlueRazz ? hasBlueRazz.nombre : flavors[0].nombre;
    }
    if (!this.flavor1 || !flavors.some(f => f.nombre === this.flavor1)) {
      const hasBlueRazz = flavors.find(f => f.nombre === 'Blue Razz Ice');
      this.flavor1 = hasBlueRazz ? hasBlueRazz.nombre : flavors[0].nombre;
    }
    if (!this.flavor2 || !flavors.some(f => f.nombre === this.flavor2) || this.flavor2 === this.flavor1) {
      const hasStrawberry = flavors.find(f => f.nombre === 'Strawberry' && f.nombre !== this.flavor1);
      const second = hasStrawberry || flavors.find(f => f.nombre !== this.flavor1) || flavors[0];
      this.flavor2 = second.nombre;
    }
  },

  getFlavorObj(flavorName) {
    const flavors = this.getFlavors();
    return flavors.find(f => f.nombre === flavorName) || flavors[0] || null;
  },

  getLeftHalfImgPath(flavorObj) {
    if (!flavorObj || !flavorObj.img) return 'REIGN BAR PALETTE/half-left/b-8.webp';
    return flavorObj.img.replace('REIGN BAR PALETTE/', 'REIGN BAR PALETTE/half-left/');
  },

  getRightHalfImgPath(flavorObj) {
    if (!flavorObj || !flavorObj.img) return 'REIGN BAR PALETTE/half-right/b-2.webp';
    return flavorObj.img.replace('REIGN BAR PALETTE/', 'REIGN BAR PALETTE/half-right/');
  },

  getCurrentVariantLabel() {
    this.initDefaults();
    if (this.mode === 'single') {
      return this.singleFlavor;
    }
    return `${this.flavor1} + ${this.flavor2}`;
  },

  getCombinedVariantLabel(f1Name, f2Name) {
    this.initDefaults();
    if (f1Name && f2Name) {
      return `${f1Name} + ${f2Name}`;
    }
    return this.getCurrentVariantLabel();
  },

  syncCatalogSelectedVariant() {
    const label = this.getCurrentVariantLabel();
    if (typeof CatalogController !== 'undefined' && CatalogController.selectedVariants) {
      CatalogController.selectedVariants[this.productId] = label;
    }
    if (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants) {
      WholesaleCatalog.selectedVariants[this.productId] = label;
    }
    const wsCard = typeof document !== 'undefined' ? document.getElementById('ws-card-' + this.productId) : null;
    if (wsCard) {
      const tag = wsCard.querySelector('.flavor-current-tag');
      if (tag) tag.textContent = label;
    }
  },

  setMode(newMode) {
    if (newMode !== 'single' && newMode !== 'dual') return;
    this.initDefaults();
    this.mode = newMode;

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
    const targetSlot = Number(slot) === 2 ? 2 : 1;

    if (targetSlot === 1) {
      this.flavor1 = flavorName;
      if (this.flavor2 === this.flavor1) {
        const diff = flavors.find(f => f.nombre !== this.flavor1);
        if (diff) this.flavor2 = diff.nombre;
      }
    } else {
      if (flavorName === this.flavor1) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Elige un Segundo Sabor diferente al Primer Sabor.', 'error');
        }
        return;
      }
      this.flavor2 = flavorName;
    }

    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  randomizeFlavors() {
    const flavors = this.getFlavors().filter(f => !f.agotado);
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

  setQty(qty) {
    const parsed = Math.max(1, Math.min(99, Number(qty) || 1));
    this.selectedQty = parsed;
    this.updateCardUI();
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
      } catch (e) {}
    }
    return this.lastCompositeDataUrl;
  },

  async refreshAllCanvases() {
    this.initDefaults();
    const fSingle = this.getFlavorObj(this.singleFlavor);
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);

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
      if (f1) img.setAttribute('alt', `Módulo 1: ${f1.nombre}`);
    });

    document.querySelectorAll('.reign-dual-right-img').forEach(img => {
      if (img.getAttribute('src') !== rightSrc) img.setAttribute('src', rightSrc);
      if (f2) img.setAttribute('alt', `Módulo 2: ${f2.nombre}`);
    });

    const wsCanvas = document.getElementById('reignWsCompositeCanvas');
    if (wsCanvas && f1 && f2) {
      await this.renderCompositeCanvas(wsCanvas, f1.nombre, f2.nombre);
    }
  },

  async renderCompositeToCanvas(canvasOrId, flavor1Name, flavor2Name) {
    return this.renderCompositeCanvas(canvasOrId, flavor1Name, flavor2Name);
  },

  updateConfiguratorDOM() {
    this.updateCardUI();
  },

  /**
   * 1. ESCENARIO DE IMAGEN 3D EN LA PARTE SUPERIOR DE LA TARJETA
   */
  renderCardImageStageHTML(product) {
    this.initDefaults();
    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor) || { nombre: this.singleFlavor, img: product.imagen };
    const f1 = this.getFlavorObj(this.flavor1) || { nombre: this.flavor1, img: product.imagen };
    const f2 = this.getFlavorObj(this.flavor2) || { nombre: this.flavor2, img: product.imagen };

    const leftHalfSrc = this.getLeftHalfImgPath(f1);
    const rightHalfSrc = this.getRightHalfImgPath(f2);

    return `
      <!-- Vista Modalidad Un Sabor -->
      <div class="reign-card-img-single" id="reignPreviewSingleView" style="display: ${isSingleMode ? 'flex' : 'none'};">
        <img src="${fSingle.img}"
             alt="${fSingle.nombre}"
             class="product-img-real reign-main-single-img"
             id="reignMainSingleImg"
             onerror="this.src='REIGN BAR PALETTE/b-4.webp';">
      </div>

      <!-- Vista Modalidad 2 Sabores: Los 2 módulos reales 3D pegados -->
      <div class="reign-card-img-dual" id="reignPreviewDualView" style="display: ${!isSingleMode ? 'flex' : 'none'};">
        <div class="reign-card-3d-joined">
          <img src="${leftHalfSrc}"
               alt="Primer sabor: ${f1.nombre}"
               class="reign-joined-half reign-dual-left-img"
               id="reignDualLeftImg"
               onerror="this.src='REIGN BAR PALETTE/half-left/b-8.webp';">
          <img src="${rightHalfSrc}"
               alt="Segundo sabor: ${f2.nombre}"
               class="reign-joined-half reign-dual-right-img"
               id="reignDualRightImg"
               onerror="this.src='REIGN BAR PALETTE/half-right/b-2.webp';">
        </div>
      </div>
    `;
  },

  /**
   * 2. CONFIGURADOR VISUAL DE TARJETAS (Igual a la captura de referencia,
   *    SIN la caja redundante de 1er Sabor + 2do Sabor ni "Combinación:" ni "Pantalla Completa")
   */
  renderCardConfiguratorHTML(product) {
    this.initDefaults();
    const flavors = this.getFlavors();
    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor) || flavors[0];
    const f1 = this.getFlavorObj(this.flavor1) || flavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || flavors[1] || flavors[0];

    return `
      <div class="reign-configurator-box" id="reignCardConfigurator">
        <div class="reign-config-header">
          <div class="reign-config-title-row">
            <div class="reign-mode-pills-inline">
              <button type="button"
                      id="reignTabDualBtn"
                      class="reign-config-badge is-clickable ${!isSingleMode ? 'active' : ''}"
                      onclick="ReignPaletteConfigurator.setMode('dual')">
                ⚡ DUAL 2 EN 1
              </button>
              <button type="button"
                      id="reignTabSingleBtn"
                      class="reign-config-badge is-clickable ${isSingleMode ? 'active' : ''}"
                      onclick="ReignPaletteConfigurator.setMode('single')">
                🍓 1 SABOR
              </button>
            </div>
            <div class="reign-quick-btns-inline" id="reignDualQuickBtns" style="display: ${!isSingleMode ? 'flex' : 'none'};">
              <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()" title="Probar combinación aleatoria">
                🎲 Aleatorio
              </button>
              <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()" title="Invertir lados de los módulos">
                ⇄ Invertir
              </button>
            </div>
          </div>
          <h4 class="reign-config-title" id="reignConfigHeadingTitle">
            ${isSingleMode ? 'ELIGE TU SABOR' : 'PERSONALIZA TU REIGN BAR'}
          </h4>
          <p class="reign-config-subtitle" id="reignConfigHeadingSub">
            ${isSingleMode ? 'Selecciona tu sabor favorito.' : 'Combina dos sabores y crea tu propia combinación.'}
          </p>
        </div>

        <!-- MODALIDAD A: UN SOLO SABOR -->
        <div class="reign-step-block" id="reignSingleStepBlock" style="display: ${isSingleMode ? 'flex' : 'none'};">
          <div class="reign-step-header">
            <span class="reign-step-num">SABOR SELECCIONADO</span>
            <strong class="reign-step-current" id="reignSummarySingleName">${fSingle.nombre}</strong>
          </div>
          <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar sabor">
            ${flavors.map(flav => {
              const isSel = flav.nombre === fSingle.nombre;
              const safeName = flav.nombre.replace(/'/g, "\\'");
              return `
                <button type="button"
                        class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                        data-reign-slot="single"
                        data-flavor-name="${flav.nombre}"
                        aria-pressed="${isSel ? 'true' : 'false'}"
                        onclick="ReignPaletteConfigurator.setSingleFlavor('${safeName}')">
                  <div class="reign-opt-img-wrap">
                    <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                  </div>
                  <span class="reign-opt-name">${flav.nombre}</span>
                  <span class="reign-opt-status">${isSel ? '✓ ELEGIDO' : 'Elegir'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- MODALIDAD B: COMBINAR DOS SABORES (PASO 1 Y PASO 2) -->
        <div class="reign-dual-steps-wrapper" id="reignDualStepsWrapper" style="display: ${!isSingleMode ? 'flex' : 'none'};">
          <!-- PASO 1: PRIMER SABOR -->
          <div class="reign-step-block">
            <div class="reign-step-header">
              <span class="reign-step-num">PASO 1 — PRIMER SABOR</span>
              <strong class="reign-step-current reign-summary-f1-name">${f1.nombre}</strong>
            </div>
            <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar primer sabor">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f1.nombre;
                const safeName = flav.nombre.replace(/'/g, "\\'");
                return `
                  <button type="button"
                          class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                          data-reign-slot="1"
                          data-flavor-name="${flav.nombre}"
                          aria-pressed="${isSel ? 'true' : 'false'}"
                          onclick="ReignPaletteConfigurator.setFlavor(1, '${safeName}')">
                    <div class="reign-opt-img-wrap">
                      <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                    </div>
                    <span class="reign-opt-name">${flav.nombre}</span>
                    <span class="reign-opt-status">${isSel ? '✓ SABOR 1' : 'Elegir #1'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- PASO 2: SEGUNDO SABOR -->
          <div class="reign-step-block">
            <div class="reign-step-header">
              <span class="reign-step-num">PASO 2 — SEGUNDO SABOR</span>
              <strong class="reign-step-current reign-summary-f2-name">${f2.nombre}</strong>
            </div>
            <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar segundo sabor">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f2.nombre;
                const isDuplicate = flav.nombre === f1.nombre;
                const safeName = flav.nombre.replace(/'/g, "\\'");
                return `
                  <button type="button"
                          class="reign-flavor-option ${isSel ? 'is-selected' : ''} ${isDuplicate ? 'is-disabled-duplicate' : ''}"
                          data-reign-slot="2"
                          data-flavor-name="${flav.nombre}"
                          aria-pressed="${isSel ? 'true' : 'false'}"
                          ${isDuplicate ? 'disabled title="Ya seleccionado como Primer Sabor"' : `onclick="ReignPaletteConfigurator.setFlavor(2, '${safeName}')"`}>
                    <div class="reign-opt-img-wrap">
                      <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                    </div>
                    <span class="reign-opt-name">${flav.nombre}</span>
                    <span class="reign-opt-status">${isSel ? '✓ SABOR 2' : (isDuplicate ? 'En #1' : 'Elegir #2')}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderFeaturedCardInnerHTML(product) {
    return this.renderCardImageStageHTML(product) + this.renderCardConfiguratorHTML(product);
  },

  updateCardUI() {
    const prod = this.getProduct();
    if (!prod) return;
    this.initDefaults();

    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor);
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    if (!fSingle || !f1 || !f2) return;

    // 1. Actualizar imagen superior (1 sabor vs 2 mitades 3D)
    const singleView = document.getElementById('reignPreviewSingleView');
    const dualView = document.getElementById('reignPreviewDualView');
    if (singleView) singleView.style.display = isSingleMode ? 'flex' : 'none';
    if (dualView) dualView.style.display = !isSingleMode ? 'flex' : 'none';

    const mainSingleImg = document.getElementById('reignMainSingleImg');
    if (mainSingleImg && fSingle.img) {
      mainSingleImg.src = fSingle.img;
      mainSingleImg.alt = fSingle.nombre;
    }

    const leftImg = document.getElementById('reignDualLeftImg');
    const rightImg = document.getElementById('reignDualRightImg');
    if (leftImg) {
      leftImg.src = this.getLeftHalfImgPath(f1);
      leftImg.alt = `Primer sabor: ${f1.nombre}`;
    }
    if (rightImg) {
      rightImg.src = this.getRightHalfImgPath(f2);
      rightImg.alt = `Segundo sabor: ${f2.nombre}`;
    }

    // 2. Actualizar cabecera y pestañas de modalidad
    const tabSingle = document.getElementById('reignTabSingleBtn');
    const tabDual = document.getElementById('reignTabDualBtn');
    if (tabSingle) tabSingle.classList.toggle('active', isSingleMode);
    if (tabDual) tabDual.classList.toggle('active', !isSingleMode);

    const quickBtns = document.getElementById('reignDualQuickBtns');
    if (quickBtns) quickBtns.style.display = !isSingleMode ? 'flex' : 'none';

    const headingTitle = document.getElementById('reignConfigHeadingTitle');
    const headingSub = document.getElementById('reignConfigHeadingSub');
    if (headingTitle) headingTitle.textContent = isSingleMode ? 'ELIGE TU SABOR' : 'PERSONALIZA TU REIGN BAR';
    if (headingSub) headingSub.textContent = isSingleMode ? 'Selecciona tu sabor favorito.' : 'Combina dos sabores y crea tu propia combinación.';

    const singleBlock = document.getElementById('reignSingleStepBlock');
    const dualWrapper = document.getElementById('reignDualStepsWrapper');
    if (singleBlock) singleBlock.style.display = isSingleMode ? 'flex' : 'none';
    if (dualWrapper) dualWrapper.style.display = !isSingleMode ? 'flex' : 'none';

    // 3. Actualizar etiquetas de sabor activo en PASO 1, PASO 2 y Un Sabor
    const singleNameEl = document.getElementById('reignSummarySingleName');
    if (singleNameEl) singleNameEl.textContent = fSingle.nombre;

    document.querySelectorAll('.reign-summary-f1-name').forEach(el => {
      el.textContent = f1.nombre;
    });
    document.querySelectorAll('.reign-summary-f2-name').forEach(el => {
      el.textContent = f2.nombre;
    });

    // 4. Actualizar tarjetas de sabores en Un Sabor, PASO 1 y PASO 2
    document.querySelectorAll('[data-reign-slot="single"]').forEach(el => {
      const fname = el.getAttribute('data-flavor-name');
      const isSel = fname === this.singleFlavor;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) statusBadge.textContent = isSel ? '✓ ELEGIDO' : 'Elegir';
    });

    document.querySelectorAll('[data-reign-slot="1"]').forEach(el => {
      const fname = el.getAttribute('data-flavor-name');
      const isSel = fname === this.flavor1;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) statusBadge.textContent = isSel ? '✓ SABOR 1' : 'Elegir #1';
    });

    document.querySelectorAll('[data-reign-slot="2"]').forEach(el => {
      const fname = el.getAttribute('data-flavor-name');
      const isSel = fname === this.flavor2;
      const isDup = fname === this.flavor1;
      const safeName = (fname || '').replace(/'/g, "\\'");
      el.classList.toggle('is-selected', isSel);
      el.classList.toggle('is-disabled-duplicate', isDup);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');

      if (isDup) {
        el.setAttribute('disabled', 'disabled');
        el.removeAttribute('onclick');
      } else {
        el.removeAttribute('disabled');
        el.setAttribute('onclick', `ReignPaletteConfigurator.setFlavor(2, '${safeName}')`);
      }

      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) {
        statusBadge.textContent = isSel ? '✓ SABOR 2' : (isDup ? 'En #1' : 'Elegir #2');
      }
    });
  },

  async addConfiguredToCart(overrideQty = null) {
    const prod = this.getProduct();
    if (!prod || prod.agotado || prod.coming_soon) return;
    this.initDefaults();

    const qtyToUse = overrideQty !== null && overrideQty !== undefined
      ? Math.max(1, Number(overrideQty) || 1)
      : Math.max(1, Number(this.selectedQty) || 1);

    if (this.mode === 'single') {
      const fSingle = this.getFlavorObj(this.singleFlavor);
      if (!fSingle || !fSingle.nombre) return;
      if (typeof Cart !== 'undefined') {
        Cart.addItem(prod, fSingle.nombre, qtyToUse, {
          isDualFlavor: false,
          singleImg: fSingle.img
        });
      }
    } else {
      const f1 = this.getFlavorObj(this.flavor1);
      const f2 = this.getFlavorObj(this.flavor2);
      if (!f1 || !f2) return;
      const comboVariant = `${f1.nombre} + ${f2.nombre}`;

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
          flavor1Img: f1.img,
          flavor2Img: f2.img,
          compositeImg: compositeImg || f1.img
        });
      }
    }
  }
};

window.ReignPaletteConfigurator = ReignPaletteConfigurator;
