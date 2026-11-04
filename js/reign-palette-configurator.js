/**
 * CAPITAL VAPE — Configurador Integrado en Tarjeta para REIGN BAR PALETTE
 * Diseñado con el mismo estilo, proporción y limpieza de las demás tarjetas del catálogo,
 * sin botones ni pantallas completas invasivas.
 * - Modalidad A ("single"): ELIGE TU SABOR (1 sabor con su imagen real).
 * - Modalidad B ("dual"): COMBINA DOS SABORES (Une visualmente las 2 mitades reales 3D).
 */
const ReignPaletteConfigurator = {
  productId: 'reign-bar-palette',
  mode: 'dual', // 'single' | 'dual'
  activeSlot: 1, // 1 = Primer Sabor, 2 = Segundo Sabor (en modo dual)
  singleFlavor: 'Blue Razz Ice',
  flavor1: 'OMG B Pop',
  flavor2: 'Raspberry Lemonade',
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

    if (this.mode === 'dual' && this.flavor1 === this.flavor2) {
      const flavors = this.getFlavors();
      const alt = flavors.find(f => f.nombre !== this.flavor1);
      if (alt) this.flavor2 = alt.nombre;
    }

    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  setActiveSlot(slotNum) {
    this.activeSlot = Number(slotNum) === 2 ? 2 : 1;
    this.mode = 'dual';
    this.updateCardUI();
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
          Toast.show('Elige un sabor diferente al Primer Sabor para combinar dos sabores distintos.', 'error');
        }
        return;
      }
      this.flavor2 = flavorName;
    }

    this.syncCatalogSelectedVariant();
    this.updateCardUI();
    this.refreshAllCanvases();
  },

  pickFromVisualStrip(flavorName) {
    if (this.mode === 'single') {
      this.setSingleFlavor(flavorName);
    } else {
      if (this.activeSlot === 2 && flavorName === this.flavor1) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Elige un Segundo Sabor diferente al Primer Sabor.', 'error');
        }
        return;
      }
      this.setDualFlavor(this.activeSlot, flavorName);
      // Al elegir el 1° sabor en la tira visual, pasar suavemente al 2° sabor para facilitar la combinación
      if (this.activeSlot === 1) {
        this.activeSlot = 2;
        this.updateCardUI();
      }
    }
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
        // Ignorar en protocolo file://
      }
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
  },

  /**
   * 1. ESCENARIO DE IMAGEN DENTRO DE .card-image-wrapper (Mismo tamaño que las demás tarjetas)
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
      <!-- Vista Modalidad A: Imagen real de 1 solo sabor -->
      <div class="reign-card-img-single" id="reignPreviewSingleView" style="display: ${isSingleMode ? 'flex' : 'none'};">
        <img src="${fSingle.img}"
             alt="${fSingle.nombre}"
             class="product-img-real reign-main-single-img"
             id="reignMainSingleImg"
             onerror="this.src='REIGN BAR PALETTE/b-4.webp';">
      </div>

      <!-- Vista Modalidad B: Los 2 sabores pegados en 3D (igual a la referencia) -->
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
   * 2. BLOQUE PERSONALIZADOR LIMPIO DENTRO DE LA TARJETA (Como las demás cards, sin pantalla completa)
   */
  renderCardConfiguratorHTML(product) {
    this.initDefaults();
    const flavors = this.getFlavors();
    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor) || flavors[0];
    const f1 = this.getFlavorObj(this.flavor1) || flavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || flavors[1] || flavors[0];

    const activeHighlightFlavor = isSingleMode
      ? this.singleFlavor
      : (this.activeSlot === 1 ? this.flavor1 : this.flavor2);

    // Tira de tarjetas visuales con fotografía real y nombre legible
    const visualFlavorCardsHtml = flavors.map(flav => {
      const isSelected = flav.nombre === activeHighlightFlavor;
      const isOtherSlotInDual = !isSingleMode && (
        (this.activeSlot === 2 && flav.nombre === this.flavor1)
      );
      const safeName = flav.nombre.replace(/'/g, "\\'");
      return `
        <button type="button"
                class="reign-mini-flavor-card ${isSelected ? 'is-selected' : ''} ${isOtherSlotInDual ? 'is-disabled-duplicate' : ''}"
                data-flavor="${flav.nombre}"
                ${isOtherSlotInDual ? 'disabled title="Ya seleccionado en Primer Sabor"' : `onclick="ReignPaletteConfigurator.pickFromVisualStrip('${safeName}')"`}>
          <div class="reign-mini-flavor-img-box">
            <img src="${flav.img}" alt="${flav.nombre}" loading="lazy" onerror="this.src='assets/logo/logo.png';">
          </div>
          <span class="reign-mini-flavor-name">${flav.nombre}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="reign-card-clean-box" id="reignCardConfiguratorBox">
        <!-- Selector de Modalidad: Un Sabor vs Combinar Dos Sabores -->
        <div class="reign-clean-mode-tabs" role="tablist">
          <button type="button"
                  id="reignTabSingleBtn"
                  class="reign-clean-tab ${isSingleMode ? 'active' : ''}"
                  onclick="ReignPaletteConfigurator.setMode('single')">
            🍓 Un Sabor
          </button>
          <button type="button"
                  id="reignTabDualBtn"
                  class="reign-clean-tab ${!isSingleMode ? 'active' : ''}"
                  onclick="ReignPaletteConfigurator.setMode('dual')">
            ⚡ 2 Sabores
          </button>
        </div>

        <!-- MODALIDAD A: ELIGE TU SABOR -->
        <div class="reign-clean-panel" id="reignModalitySinglePanel" style="display: ${isSingleMode ? 'flex' : 'none'};">
          <div class="reign-clean-panel-head">
            <span class="reign-clean-panel-title">ELIGE TU SABOR</span>
            <span class="reign-clean-panel-sub">Selecciona tu sabor favorito.</span>
          </div>
          <div class="reign-clean-single-row">
            <img src="${fSingle.img}" alt="${fSingle.nombre}" class="reign-clean-slot-thumb" id="reignSingleSelectedThumb" onerror="this.src='REIGN BAR PALETTE/b-4.webp';">
            <select class="reign-clean-select" id="reignSingleSelectDropdown" aria-label="Elige tu sabor" onchange="ReignPaletteConfigurator.setSingleFlavor(this.value)">
              ${flavors.map(f => `<option value="${f.nombre}" ${f.nombre === this.singleFlavor ? 'selected' : ''}>${f.nombre}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- MODALIDAD B: COMBINA DOS SABORES -->
        <div class="reign-clean-panel" id="reignModalityDualPanel" style="display: ${!isSingleMode ? 'flex' : 'none'};">
          <div class="reign-clean-panel-head">
            <div class="reign-clean-head-row">
              <span class="reign-clean-panel-title">COMBINA DOS SABORES</span>
              <button type="button" class="reign-clean-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()" title="Intercambiar sabores">⇄</button>
            </div>
            <span class="reign-clean-panel-sub">Personaliza tu REIGN BAR combinando dos sabores diferentes.</span>
          </div>

          <div class="reign-clean-dual-slots">
            <!-- PRIMER SABOR -->
            <div class="reign-clean-slot-item ${this.activeSlot === 1 ? 'is-editing-slot' : ''}" id="reignSlot1Box" onclick="ReignPaletteConfigurator.setActiveSlot(1)">
              <span class="reign-clean-slot-label">PRIMER SABOR</span>
              <div class="reign-clean-slot-control">
                <img src="${f1.img}" alt="${f1.nombre}" class="reign-clean-slot-thumb" id="reignSlot1ChipImg" onerror="this.src='REIGN BAR PALETTE/b-8.webp';">
                <select class="reign-clean-select" id="reignSlot1SelectDropdown" aria-label="Primer sabor" onclick="event.stopPropagation(); ReignPaletteConfigurator.setActiveSlot(1);" onchange="ReignPaletteConfigurator.setDualFlavor(1, this.value)">
                  ${flavors.map(f => `<option value="${f.nombre}" ${f.nombre === this.flavor1 ? 'selected' : ''}>${f.nombre}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- SEGUNDO SABOR -->
            <div class="reign-clean-slot-item ${this.activeSlot === 2 ? 'is-editing-slot' : ''}" id="reignSlot2Box" onclick="ReignPaletteConfigurator.setActiveSlot(2)">
              <span class="reign-clean-slot-label">SEGUNDO SABOR</span>
              <div class="reign-clean-slot-control">
                <img src="${f2.img}" alt="${f2.nombre}" class="reign-clean-slot-thumb" id="reignSlot2ChipImg" onerror="this.src='REIGN BAR PALETTE/b-2.webp';">
                <select class="reign-clean-select" id="reignSlot2SelectDropdown" aria-label="Segundo sabor" onclick="event.stopPropagation(); ReignPaletteConfigurator.setActiveSlot(2);" onchange="ReignPaletteConfigurator.setDualFlavor(2, this.value)">
                  ${flavors.map(f => `<option value="${f.nombre}" ${f.nombre === this.flavor2 ? 'selected' : ''} ${f.nombre === this.flavor1 ? 'disabled' : ''}>${f.nombre}${f.nombre === this.flavor1 ? ' (1° Sabor)' : ''}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tira visual interactiva con fotos reales de los 17 sabores -->
        <div class="reign-mini-flavors-strip" id="reignVisualStripContainer">
          ${visualFlavorCardsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Alias de compatibilidad
   */
  renderFeaturedCardInnerHTML(product) {
    return this.renderCardImageStageHTML(product) + this.renderCardConfiguratorHTML(product);
  },

  updateCardUI() {
    const prod = this.getProduct();
    if (!prod) return;
    this.initDefaults();

    const flavors = this.getFlavors();
    const isSingleMode = this.mode === 'single';
    const fSingle = this.getFlavorObj(this.singleFlavor) || flavors[0];
    const f1 = this.getFlavorObj(this.flavor1) || flavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || flavors[1] || flavors[0];

    // 1. Actualizar imagen superior de la tarjeta
    const singleView = document.getElementById('reignPreviewSingleView');
    const dualView = document.getElementById('reignPreviewDualView');
    if (singleView) singleView.style.display = isSingleMode ? 'flex' : 'none';
    if (dualView) dualView.style.display = !isSingleMode ? 'flex' : 'none';

    const mainSingleImg = document.getElementById('reignMainSingleImg');
    if (mainSingleImg && fSingle && fSingle.img) {
      mainSingleImg.src = fSingle.img;
      mainSingleImg.alt = fSingle.nombre;
    }

    const leftImg = document.getElementById('reignDualLeftImg');
    const rightImg = document.getElementById('reignDualRightImg');
    if (leftImg && f1) {
      leftImg.src = this.getLeftHalfImgPath(f1);
      leftImg.alt = `Primer sabor: ${f1.nombre}`;
    }
    if (rightImg && f2) {
      rightImg.src = this.getRightHalfImgPath(f2);
      rightImg.alt = `Segundo sabor: ${f2.nombre}`;
    }

    // 2. Actualizar pestañas de modalidad
    const tabSingle = document.getElementById('reignTabSingleBtn');
    const tabDual = document.getElementById('reignTabDualBtn');
    if (tabSingle) tabSingle.classList.toggle('active', isSingleMode);
    if (tabDual) tabDual.classList.toggle('active', !isSingleMode);

    const singlePanel = document.getElementById('reignModalitySinglePanel');
    const dualPanel = document.getElementById('reignModalityDualPanel');
    if (singlePanel) singlePanel.style.display = isSingleMode ? 'flex' : 'none';
    if (dualPanel) dualPanel.style.display = !isSingleMode ? 'flex' : 'none';

    // 3. Actualizar controles de Modalidad A
    const singleThumb = document.getElementById('reignSingleSelectedThumb');
    if (singleThumb && fSingle && fSingle.img) singleThumb.src = fSingle.img;
    const singleSelect = document.getElementById('reignSingleSelectDropdown');
    if (singleSelect && singleSelect.value !== this.singleFlavor) {
      singleSelect.value = this.singleFlavor;
    }

    // 4. Actualizar controles de Modalidad B (Primer Sabor y Segundo Sabor)
    const slot1Box = document.getElementById('reignSlot1Box');
    const slot2Box = document.getElementById('reignSlot2Box');
    if (slot1Box) slot1Box.classList.toggle('is-editing-slot', this.activeSlot === 1);
    if (slot2Box) slot2Box.classList.toggle('is-editing-slot', this.activeSlot === 2);

    const slot1Img = document.getElementById('reignSlot1ChipImg');
    const slot2Img = document.getElementById('reignSlot2ChipImg');
    if (slot1Img && f1 && f1.img) slot1Img.src = f1.img;
    if (slot2Img && f2 && f2.img) slot2Img.src = f2.img;

    const slot1Select = document.getElementById('reignSlot1SelectDropdown');
    if (slot1Select && slot1Select.value !== this.flavor1) {
      slot1Select.value = this.flavor1;
    }

    const slot2Select = document.getElementById('reignSlot2SelectDropdown');
    if (slot2Select) {
      slot2Select.innerHTML = flavors.map(f =>
        `<option value="${f.nombre}" ${f.nombre === this.flavor2 ? 'selected' : ''} ${f.nombre === this.flavor1 ? 'disabled' : ''}>${f.nombre}${f.nombre === this.flavor1 ? ' (1° Sabor)' : ''}</option>`
      ).join('');
    }

    // 5. Actualizar tira visual de tarjetas de sabores
    const activeHighlightFlavor = isSingleMode
      ? this.singleFlavor
      : (this.activeSlot === 1 ? this.flavor1 : this.flavor2);

    document.querySelectorAll('.reign-mini-flavor-card').forEach(card => {
      const fname = card.getAttribute('data-flavor');
      const isSelected = fname === activeHighlightFlavor;
      const isDuplicate = !isSingleMode && this.activeSlot === 2 && fname === this.flavor1;
      const safeName = (fname || '').replace(/'/g, "\\'");

      card.classList.toggle('is-selected', isSelected);
      card.classList.toggle('is-disabled-duplicate', isDuplicate);

      if (isDuplicate) {
        card.setAttribute('disabled', 'disabled');
        card.removeAttribute('onclick');
      } else {
        card.removeAttribute('disabled');
        card.setAttribute('onclick', `ReignPaletteConfigurator.pickFromVisualStrip('${safeName}')`);
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
      if (!this.flavor1 || !this.flavor2) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Selecciona el Primer Sabor y el Segundo Sabor.', 'error');
        }
        return;
      }
      if (this.flavor1 === this.flavor2) {
        if (typeof Toast !== 'undefined') {
          Toast.show('Elige un Segundo Sabor diferente al primero.', 'error');
        }
        return;
      }

      const f1 = this.getFlavorObj(this.flavor1);
      const f2 = this.getFlavorObj(this.flavor2);
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
          flavor1Img: f1 ? f1.img : prod.imagen,
          flavor2Img: f2 ? f2.img : prod.imagen,
          compositeImg: compositeImg || (f1 ? f1.img : prod.imagen)
        });
      }
    }
  }
};

window.ReignPaletteConfigurator = ReignPaletteConfigurator;
