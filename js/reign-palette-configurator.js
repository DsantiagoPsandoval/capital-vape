/**
 * CAPITAL VAPE — REIGN BAR PALETTE: Configurador Visual de 2 Sabores & Motor de Composición
 * Permite elegir Primer Sabor (Módulo Izquierdo) y Segundo Sabor (Módulo Derecho),
 * generando en tiempo real una composición visual unificada del dispositivo completo
 * a partir de las fotografías reales de cada módulo.
 */
const ReignPaletteConfigurator = {
  PRODUCT_ID: 'reign-bar-palette',
  flavor1: 'Blue Razz Ice',
  flavor2: 'Strawberry',
  selectedQty: 1,
  imageCache: new Map(),
  lastCompositeDataUrl: null,
  activeStepFilter1: '',
  activeStepFilter2: '',

  init() {
    const product = this.getProduct();
    if (!product || !product.sabores || product.sabores.length === 0) return;

    // Seleccionar por defecto Blue Razz Ice + Strawberry si existen
    const hasBlueRazz = product.sabores.find(s => s.nombre === 'Blue Razz Ice');
    const hasStrawberry = product.sabores.find(s => s.nombre === 'Strawberry');
    this.flavor1 = hasBlueRazz ? hasBlueRazz.nombre : product.sabores[0].nombre;
    this.flavor2 = hasStrawberry ? hasStrawberry.nombre : (product.sabores[1] ? product.sabores[1].nombre : product.sabores[0].nombre);

    this.syncSelectedVariantString();
    this.preloadInitialImages();
  },

  getProduct() {
    if (typeof PRODUCTS_DATA === 'undefined') return null;
    return PRODUCTS_DATA.find(p => p.id === this.PRODUCT_ID) || null;
  },

  getFlavors() {
    const product = this.getProduct();
    if (!product || !product.sabores) return [];
    return product.sabores.filter(s => s.visible !== false);
  },

  getFlavorObj(flavorName) {
    const flavors = this.getFlavors();
    return flavors.find(f => f.nombre === flavorName) || flavors[0] || null;
  },

  getCombinedVariantLabel(f1 = this.flavor1, f2 = this.flavor2) {
    return `${f1} + ${f2}`;
  },

  syncSelectedVariantString() {
    const combined = this.getCombinedVariantLabel();
    if (typeof CatalogController !== 'undefined' && CatalogController.selectedVariants) {
      CatalogController.selectedVariants[this.PRODUCT_ID] = combined;
    }
    if (typeof WholesaleCatalog !== 'undefined' && WholesaleCatalog.selectedVariants) {
      WholesaleCatalog.selectedVariants[this.PRODUCT_ID] = combined;
    }
  },

  MASTER_CLEAN_SRC: 'REIGN BAR PALETTE/dual-master-clean.png',
  MASTER_MASKS_SRC: 'REIGN BAR PALETTE/dual-masks.png',
  masterPixels: null,
  masksPixels: null,
  offscreen500: null,

  FLAVOR_RGB_MAP: {
    'Strawberry Banana': [241, 168, 208],
    'Raspberry Lemonade': [156, 102, 215],
    'Miami Mint': [112, 220, 130],
    'Blue Razz Ice': [65, 166, 242],
    'Mexico Mango': [242, 202, 34],
    'Fcuking Fab': [74, 146, 232],
    'Watermelon Ice': [248, 96, 76],
    'OMG B Pop': [234, 174, 204],
    'Caramel Cream': [214, 190, 162],
    'Virginia Tobacco': [38, 36, 42],
    'Ice Coffee': [56, 44, 38],
    'Root Beer': [214, 92, 66],
    'Vanilla Ice Cream': [226, 224, 218],
    'Cheese Cake': [242, 210, 48],
    'Strawberry': [242, 132, 178],
    'Cherry Lemon': [246, 84, 78],
    'Cool Mint': [202, 226, 222]
  },

  preloadInitialImages() {
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    Promise.all([
      this.ensureMasterBuffers(),
      f1 && f1.img ? this.loadImage(f1.img) : Promise.resolve(null),
      f2 && f2.img ? this.loadImage(f2.img) : Promise.resolve(null)
    ]).then(() => this.refreshAllCanvases());
  },

  async ensureMasterBuffers() {
    if (this.masterPixels && this.masksPixels) return true;
    if (typeof document === 'undefined' || !document.createElement) return false;
    const [masterImg, masksImg] = await Promise.all([
      this.loadImage(this.MASTER_CLEAN_SRC),
      this.loadImage(this.MASTER_MASKS_SRC)
    ]);
    if (!masterImg || !masksImg || !masterImg.width) return false;

    try {
      const c1 = document.createElement('canvas');
      c1.width = 500;
      c1.height = 500;
      const ctx1 = c1.getContext('2d');
      ctx1.drawImage(masterImg, 0, 0, 500, 500);
      this.masterPixels = ctx1.getImageData(0, 0, 500, 500).data;

      const c2 = document.createElement('canvas');
      c2.width = 500;
      c2.height = 500;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(masksImg, 0, 0, 500, 500);
      this.masksPixels = ctx2.getImageData(0, 0, 500, 500).data;

      this.offscreen500 = c1;
      return true;
    } catch (e) {
      return false;
    }
  },

  loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = src;
    });
  },

  /**
   * Actualiza el Primer Sabor (Módulo Izquierdo) o Segundo Sabor (Módulo Derecho)
   * y regenera inmediatamente todas las vistas previas combinadas sin recargar la página.
   */
  setFlavor(slot, flavorName) {
    const flavorObj = this.getFlavorObj(flavorName);
    if (!flavorObj) return;

    if (slot === 1) {
      this.flavor1 = flavorObj.nombre;
    } else {
      this.flavor2 = flavorObj.nombre;
    }

    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();

    this.loadImage(flavorObj.img).then(() => {
      this.refreshAllCanvases();
    });
  },

  swapFlavors() {
    const temp = this.flavor1;
    this.flavor1 = this.flavor2;
    this.flavor2 = temp;
    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();
    this.refreshAllCanvases();
  },

  randomizeFlavors() {
    const flavors = this.getFlavors().filter(f => !f.agotado);
    if (flavors.length < 2) return;
    const idx1 = Math.floor(Math.random() * flavors.length);
    let idx2 = Math.floor(Math.random() * flavors.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % flavors.length;

    this.flavor1 = flavors[idx1].nombre;
    this.flavor2 = flavors[idx2].nombre;
    this.syncSelectedVariantString();
    this.updateConfiguratorDOM();

    Promise.all([
      this.loadImage(flavors[idx1].img),
      this.loadImage(flavors[idx2].img)
    ]).then(() => {
      this.refreshAllCanvases();
    });
  },

  setQty(qty) {
    this.selectedQty = Number(qty) === 2 ? 2 : 1;
    this.updateConfiguratorDOM();
  },

  /**
   * Traza la silueta exacta de un módulo vertical de REIGN BAR PALETTE
   * (cuerpo redondeado exterior, base inferior, cara plana magnética interior y boquilla superior).
   * En coordenadas locales donde:
   * - x = 0 es la unión magnética central (seam)
   * - x negativ (-moduleWidth) es el borde curvo exterior izquierdo
   * - y = 0 es el centro vertical del cuerpo
   */
  traceLeftHalfModulePath(ctx, seamX, centerY, scale) {
    const s = scale;
    ctx.beginPath();
    // 1. Iniciar en la junta superior de la boquilla (cerca del eje central)
    ctx.moveTo(seamX - 2 * s, centerY - 126 * s);
    // Subir por el borde interior de la boquilla translúcida
    ctx.lineTo(seamX - 3 * s, centerY - 162 * s);
    // Punta superior de la boquilla
    ctx.quadraticCurveTo(seamX - 18 * s, centerY - 169 * s, seamX - 32 * s, centerY - 165 * s);
    // Bajar por el borde exterior izquierdo de la boquilla hasta el hombro
    ctx.lineTo(seamX - 38 * s, centerY - 127 * s);
    // 2. Hombro superior izquierdo del cuerpo
    ctx.quadraticCurveTo(seamX - 72 * s, centerY - 127 * s, seamX - 88 * s, centerY - 114 * s);
    ctx.quadraticCurveTo(seamX - 103 * s, centerY - 98 * s, seamX - 103 * s, centerY - 72 * s);
    // 3. Borde exterior izquierdo recto (donde se ubica la pantalla LED negra)
    ctx.lineTo(seamX - 103 * s, centerY + 86 * s);
    // 4. Curva inferior izquierda y base del módulo
    ctx.quadraticCurveTo(seamX - 103 * s, centerY + 118 * s, seamX - 74 * s, centerY + 125 * s);
    ctx.lineTo(seamX - 2 * s, centerY + 125 * s);
    // 5. Subir por la cara magnética interior (junta central)
    ctx.lineTo(seamX, centerY + 122 * s);
    ctx.lineTo(seamX, centerY - 124 * s);
    ctx.closePath();
  },

  /**
   * Traza la silueta simétrica para el Módulo Derecho (Segundo Sabor),
   * acoplado magnéticamente en seamX.
   */
  traceRightHalfModulePath(ctx, seamX, centerY, scale) {
    const s = scale;
    ctx.beginPath();
    ctx.moveTo(seamX + 2 * s, centerY - 126 * s);
    ctx.lineTo(seamX + 3 * s, centerY - 162 * s);
    ctx.quadraticCurveTo(seamX + 18 * s, centerY - 169 * s, seamX + 32 * s, centerY - 165 * s);
    ctx.lineTo(seamX + 38 * s, centerY - 127 * s);
    ctx.quadraticCurveTo(seamX + 72 * s, centerY - 127 * s, seamX + 88 * s, centerY - 114 * s);
    ctx.quadraticCurveTo(seamX + 103 * s, centerY - 98 * s, seamX + 103 * s, centerY - 72 * s);
    ctx.lineTo(seamX + 103 * s, centerY + 86 * s);
    ctx.quadraticCurveTo(seamX + 103 * s, centerY + 118 * s, seamX + 74 * s, centerY + 125 * s);
    ctx.lineTo(seamX + 2 * s, centerY + 125 * s);
    ctx.lineTo(seamX, centerY + 122 * s);
    ctx.lineTo(seamX, centerY - 124 * s);
    ctx.closePath();
  },

  /**
   * Traza un rectángulo redondeado compatible con todos los navegadores.
   */
  roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  },

  /**
   * Renderiza la composición visual 3D exacta de los dos módulos de REIGN BAR PALETTE
   * acoplados magnéticamente según la imagen de referencia oficial.
   */
  async renderCompositeToCanvas(canvas, f1Name = this.flavor1, f2Name = this.flavor2) {
    if (!canvas) return null;
    const f1 = this.getFlavorObj(f1Name);
    const f2 = this.getFlavorObj(f2Name);
    if (!f1 || !f2) return null;

    const hasMaster = await this.ensureMasterBuffers();
    const W = canvas.width || 460;
    const H = canvas.height || 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, W, H);

    const col1 = f1.colorPrimary || '#3553F6';
    const col2 = f2.colorPrimary || '#FB5E9B';
    const rgb1 = this.FLAVOR_RGB_MAP[f1.nombre] || [65, 166, 242];
    const rgb2 = this.FLAVOR_RGB_MAP[f2.nombre] || [234, 174, 204];

    // 1. Halo ambiental suave de estudio detrás del dispositivo 3D
    ctx.save();
    const glowLeft = ctx.createRadialGradient(W * 0.36, H * 0.48, 8, W * 0.36, H * 0.48, W * 0.42);
    glowLeft.addColorStop(0, col1 + '44');
    glowLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowLeft;
    ctx.fillRect(0, 0, W, H);

    const glowRight = ctx.createRadialGradient(W * 0.64, H * 0.48, 8, W * 0.64, H * 0.48, W * 0.42);
    glowRight.addColorStop(0, col2 + '44');
    glowRight.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowRight;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 2. Composición 3D basada en el modelo maestro de referencia (500x500)
    if (hasMaster && this.masterPixels && this.masksPixels && this.offscreen500) {
      const offCtx = this.offscreen500.getContext('2d');
      const outImgData = offCtx.createImageData(500, 500);
      const dst = outImgData.data;
      const src = this.masterPixels;
      const msk = this.masksPixels;

      const r1 = rgb1[0], g1 = rgb1[1], b1 = rgb1[2];
      const r2 = rgb2[0], g2 = rgb2[1], b2 = rgb2[2];

      // Solo recorrer el bounding box activo del dispositivo (x: 130..370, y: 42..458)
      for (let y = 42; y <= 458; y++) {
        const rowOffset = y * 500;
        for (let x = 130; x <= 370; x++) {
          const i = (rowOffset + x) << 2;
          const alpha = msk[i + 3];
          if (alpha === 0) continue;

          const wLeft = msk[i] / 255.0;       // 1.0 = Módulo Izquierdo, 0.0 = Módulo Derecho
          const keepOrig = msk[i + 1] / 255.0; // Protección de pantalla LED '88' y logos metálicos
          const lum = msk[i + 2];

          // Curva anodizada 3D para Módulo Izquierdo (ref_lum = 112)
          let L1 = lum / 112.0;
          if (L1 > 2.2) L1 = 2.2;
          let nr1, ng1, nb1;
          if (L1 <= 1.0) {
            const p1 = Math.pow(L1, 0.92);
            nr1 = r1 * p1;
            ng1 = g1 * p1;
            nb1 = b1 * p1;
          } else {
            const h1 = Math.min(1.0, (L1 - 1.0) * 1.35);
            nr1 = r1 + (255.0 - r1) * h1;
            ng1 = g1 + (255.0 - g1) * h1;
            nb1 = b1 + (255.0 - b1) * h1;
          }

          // Curva anodizada 3D para Módulo Derecho (ref_lum = 172)
          let L2 = lum / 172.0;
          if (L2 > 2.2) L2 = 2.2;
          let nr2, ng2, nb2;
          if (L2 <= 1.0) {
            const p2 = Math.pow(L2, 0.92);
            nr2 = r2 * p2;
            ng2 = g2 * p2;
            nb2 = b2 * p2;
          } else {
            const h2 = Math.min(1.0, (L2 - 1.0) * 1.35);
            nr2 = r2 + (255.0 - r2) * h2;
            ng2 = g2 + (255.0 - g2) * h2;
            nb2 = b2 + (255.0 - b2) * h2;
          }

          const wRight = 1.0 - wLeft;
          const br = nr1 * wLeft + nr2 * wRight;
          const bg = ng1 * wLeft + ng2 * wRight;
          const bb = nb1 * wLeft + nb2 * wRight;

          const invKeep = 1.0 - keepOrig;
          dst[i]     = br * invKeep + src[i] * keepOrig;
          dst[i + 1] = bg * invKeep + src[i + 1] * keepOrig;
          dst[i + 2] = bb * invKeep + src[i + 2] * keepOrig;
          dst[i + 3] = alpha;
        }
      }

      offCtx.putImageData(outImgData, 0, 0);

      // Imprimir dinámicamente los nombres de ambos sabores a los lados de la junta magnética central (como en la imagen de referencia)
      const seamAngle = Math.atan2(1.0, 0.2038); // ~78.48°
      offCtx.save();
      offCtx.font = '600 8.5px Inter, system-ui, sans-serif';
      offCtx.fillStyle = 'rgba(235, 238, 245, 0.72)';
      offCtx.textBaseline = 'middle';

      // Texto Sabor 1 (Módulo Izquierdo — paralelo a la junta central)
      const yAnchor1 = 262;
      const xAnchor1 = 179.0 + (yAnchor1 - 125.0) * 0.2038 - 9.5;
      offCtx.save();
      offCtx.translate(xAnchor1, yAnchor1);
      offCtx.rotate(seamAngle);
      offCtx.textAlign = 'left';
      offCtx.fillText(f1.nombre.toUpperCase(), 0, 0, 112);
      offCtx.restore();

      // Texto Sabor 2 (Módulo Derecho — paralelo a la junta central)
      const yAnchor2 = 250;
      const xAnchor2 = 179.0 + (yAnchor2 - 125.0) * 0.2038 + 8.5;
      offCtx.save();
      offCtx.translate(xAnchor2, yAnchor2);
      offCtx.rotate(seamAngle);
      offCtx.textAlign = 'left';
      offCtx.fillText(f2.nombre.toUpperCase(), 0, 0, 95);
      offCtx.restore();
      offCtx.restore();

      // Dibujar el dispositivo 3D centrado y con máxima nitidez en el canvas destino
      const drawSize = Math.min(W, H - 24) * 1.04;
      const dx = (W - drawSize) / 2;
      const dy = (H - 22 - drawSize) / 2;
      ctx.drawImage(this.offscreen500, dx, dy, drawSize, drawSize);
    }

    // 3. Píldoras inferiores compactas indicando los 2 sabores acoplados
    ctx.save();
    const pillY = H - 28;
    const pillH = 22;
    const maxPillW = (W * 0.45);

    this.roundRectPath(ctx, 10, pillY, maxPillW, pillH, 11);
    ctx.fillStyle = 'rgba(12, 7, 20, 0.86)';
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = col1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(20, pillY + pillH / 2, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = col1;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`1: ${f1.nombre}`, 28, pillY + pillH / 2 + 0.5, maxPillW - 22);

    const rightPillX = W - 10 - maxPillW;
    this.roundRectPath(ctx, rightPillX, pillY, maxPillW, pillH, 11);
    ctx.fillStyle = 'rgba(12, 7, 20, 0.86)';
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = col2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rightPillX + 10, pillY + pillH / 2, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = col2;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`2: ${f2.nombre}`, rightPillX + 18, pillY + pillH / 2 + 0.5, maxPillW - 22);
    ctx.restore();

    try {
      this.lastCompositeDataUrl = canvas.toDataURL('image/webp', 0.90);
    } catch (e) {}

    return this.lastCompositeDataUrl;
  },

  refreshAllCanvases() {
    const canvases = document.querySelectorAll('.reign-composite-canvas');
    canvases.forEach(canvas => {
      this.renderCompositeToCanvas(canvas, this.flavor1, this.flavor2);
    });
  },

  /**
   * Actualiza los textos, estados activos de botones y resumen de configuración
   * tanto en la tarjeta principal como en el modal configurador.
   */
  updateConfiguratorDOM() {
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const product = this.getProduct();
    if (!f1 || !f2 || !product) return;

    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    // 1. Actualizar botones de selección de PASO 1 y PASO 2
    document.querySelectorAll('[data-reign-slot="1"]').forEach(el => {
      const isSel = el.getAttribute('data-flavor-name') === this.flavor1;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) {
        statusBadge.textContent = isSel ? '✓ MÓDULO 1' : 'Elegir #1';
      }
    });

    document.querySelectorAll('[data-reign-slot="2"]').forEach(el => {
      const isSel = el.getAttribute('data-flavor-name') === this.flavor2;
      el.classList.toggle('is-selected', isSel);
      el.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      const statusBadge = el.querySelector('.reign-opt-status');
      if (statusBadge) {
        statusBadge.textContent = isSel ? '✓ MÓDULO 2' : 'Elegir #2';
      }
    });

    // 2. Actualizar textos de resumen en tarjeta y modal
    document.querySelectorAll('.reign-summary-f1-name').forEach(el => {
      el.textContent = f1.nombre;
    });
    document.querySelectorAll('.reign-summary-f2-name').forEach(el => {
      el.textContent = f2.nombre;
    });
    document.querySelectorAll('.reign-summary-f1-img').forEach(el => {
      el.src = f1.img;
      el.alt = f1.nombre;
    });
    document.querySelectorAll('.reign-summary-f2-img').forEach(el => {
      el.src = f2.img;
      el.alt = f2.nombre;
    });
    document.querySelectorAll('.reign-summary-combined-tag').forEach(el => {
      el.textContent = `${f1.nombre} + ${f2.nombre}`;
    });
    document.querySelectorAll('.reign-summary-price-val').forEach(el => {
      el.textContent = '$' + activeTotal.toLocaleString('es-CO') + ' COP';
    });
    document.querySelectorAll('.reign-qty-opt-btn').forEach(btn => {
      const q = Number(btn.getAttribute('data-qty'));
      btn.classList.toggle('active', q === this.selectedQty);
    });

    // Actualizar etiqueta del selector en tarjeta mayorista si existe
    const wsCard = document.getElementById('ws-card-reign-bar-palette');
    if (wsCard) {
      const tag = wsCard.querySelector('.flavor-current-tag');
      if (tag) tag.textContent = `${f1.nombre} + ${f2.nombre}`;
    }
  },

  /**
   * Genera el bloque HTML del configurador embebido en la primera tarjeta del catálogo (REIGN BAR PALETTE).
   */
  renderCardConfiguratorHTML(product) {
    const flavors = this.getFlavors();
    const f1 = this.getFlavorObj(this.flavor1) || flavors[0];
    const f2 = this.getFlavorObj(this.flavor2) || flavors[1] || flavors[0];
    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    return `
      <div class="reign-configurator-box" id="reignCardConfigurator">
        <div class="reign-config-header">
          <div class="reign-config-title-row">
            <span class="reign-config-badge">⚡ DUAL 2 EN 1</span>
            <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()" title="Probar combinación aleatoria">
              🎲 Aleatorio
            </button>
            <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()" title="Invertir lados de los módulos">
              ⇄ Invertir
            </button>
          </div>
          <h4 class="reign-config-title">PERSONALIZA TU REIGN BAR</h4>
          <p class="reign-config-subtitle">Combina dos sabores y crea tu propia combinación.</p>
        </div>

        <!-- PASO 1: PRIMER SABOR -->
        <div class="reign-step-block">
          <div class="reign-step-header">
            <span class="reign-step-num">PASO 1 — PRIMER SABOR (Módulo Izq.)</span>
            <strong class="reign-step-current reign-summary-f1-name">${f1.nombre}</strong>
          </div>
          <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar primer sabor">
            ${flavors.map(flav => {
              const isSel = flav.nombre === f1.nombre;
              return `
                <button type="button"
                        class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                        data-reign-slot="1"
                        data-flavor-name="${flav.nombre}"
                        aria-pressed="${isSel ? 'true' : 'false'}"
                        onclick="ReignPaletteConfigurator.setFlavor(1, '${flav.nombre}')">
                  <div class="reign-opt-img-wrap">
                    <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                  </div>
                  <span class="reign-opt-name">${flav.nombre}</span>
                  <span class="reign-opt-status">${isSel ? '✓ MÓDULO 1' : 'Elegir #1'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- PASO 2: SEGUNDO SABOR -->
        <div class="reign-step-block">
          <div class="reign-step-header">
            <span class="reign-step-num">PASO 2 — SEGUNDO SABOR (Módulo Der.)</span>
            <strong class="reign-step-current reign-summary-f2-name">${f2.nombre}</strong>
          </div>
          <div class="reign-flavor-strip" role="listbox" aria-label="Seleccionar segundo sabor">
            ${flavors.map(flav => {
              const isSel = flav.nombre === f2.nombre;
              return `
                <button type="button"
                        class="reign-flavor-option ${isSel ? 'is-selected' : ''}"
                        data-reign-slot="2"
                        data-flavor-name="${flav.nombre}"
                        aria-pressed="${isSel ? 'true' : 'false'}"
                        onclick="ReignPaletteConfigurator.setFlavor(2, '${flav.nombre}')">
                  <div class="reign-opt-img-wrap">
                    <img src="${flav.img}" alt="${flav.nombre}" class="reign-opt-img" loading="lazy">
                  </div>
                  <span class="reign-opt-name">${flav.nombre}</span>
                  <span class="reign-opt-status">${isSel ? '✓ MÓDULO 2' : 'Elegir #2'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4. INFORMACIÓN DE LA CONFIGURACIÓN -->
        <div class="reign-config-summary-card">
          <div class="reign-summary-modules-row">
            <div class="reign-summary-module-pill">
              <img src="${f1.img}" alt="${f1.nombre}" class="reign-summary-f1-img" loading="lazy">
              <div class="reign-summary-pill-text">
                <span class="reign-pill-label">Primer sabor</span>
                <strong class="reign-summary-f1-name">${f1.nombre}</strong>
              </div>
            </div>
            <span class="reign-summary-plus">+</span>
            <div class="reign-summary-module-pill">
              <img src="${f2.img}" alt="${f2.nombre}" class="reign-summary-f2-img" loading="lazy">
              <div class="reign-summary-pill-text">
                <span class="reign-pill-label">Segundo sabor</span>
                <strong class="reign-summary-f2-name">${f2.nombre}</strong>
              </div>
            </div>
          </div>

          <div class="reign-summary-details-list">
            <div class="reign-summary-detail-line">
              <span>Producto:</span>
              <strong>${product.nombre}</strong>
            </div>
            <div class="reign-summary-detail-line">
              <span>Combinación:</span>
              <strong class="reign-summary-combined-tag">${f1.nombre} + ${f2.nombre}</strong>
            </div>
            <div class="reign-summary-detail-line">
              <span>Precio:</span>
              <strong class="reign-summary-price-val">$${activeTotal.toLocaleString('es-CO')} COP</strong>
            </div>
          </div>

          <div class="reign-qty-toggle-row">
            <button type="button" class="reign-qty-opt-btn ${this.selectedQty === 1 ? 'active' : ''}" data-qty="1" onclick="ReignPaletteConfigurator.setQty(1)">
              <span>1 Unidad</span>
              <strong>$40.000 COP</strong>
            </button>
            <button type="button" class="reign-qty-opt-btn is-promo ${this.selectedQty === 2 ? 'active' : ''}" data-qty="2" onclick="ReignPaletteConfigurator.setQty(2)">
              <span>🔥 Promo 2 Unidades</span>
              <strong>$70.000 COP</strong>
            </button>
          </div>
        </div>

        <button type="button" class="btn-open-full-configurator" onclick="CatalogController.openFlavorModal('reign-bar-palette')">
          <span>🔍 Abrir Configurador en Pantalla Completa (${flavors.length} Sabores)</span>
        </button>
      </div>
    `;
  },

  /**
   * Renderiza la experiencia completa de "PERSONALIZA TU REIGN BAR" dentro del modal de sabores.
   */
  renderModalConfigurator(containerEl, filterText = '', isWholesale = false) {
    if (!containerEl) return;
    const product = this.getProduct();
    if (!product) return;

    let flavors = this.getFlavors();
    if (filterText) {
      flavors = flavors.filter(f =>
        f.nombre.toLowerCase().includes(filterText) ||
        (f.desc && f.desc.toLowerCase().includes(filterText))
      );
    }

    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const unitPrice = product.precio || 40000;
    const promo2Price = product.precio_promo_2 || 70000;
    const activeTotal = this.selectedQty === 2 ? promo2Price : unitPrice;

    containerEl.innerHTML = `
      <div class="reign-modal-studio">
        <!-- COLUMNA CENTRAL / SUPERIOR: VISTA PREVIA EN VIVO + RESUMEN DE CONFIGURACIÓN -->
        <div class="reign-modal-preview-panel">
          <div class="reign-modal-preview-header">
            <span class="reign-config-badge">⭐ PERSONALIZA TU REIGN BAR</span>
            <p class="reign-modal-preview-sub">Combina dos sabores y crea tu propia combinación.</p>
          </div>

          <div class="reign-modal-canvas-stage">
            <canvas id="reignModalCompositeCanvas" class="reign-composite-canvas" width="520" height="480"></canvas>
          </div>

          <div class="reign-modal-quick-controls">
            <button type="button" class="reign-random-btn" onclick="ReignPaletteConfigurator.randomizeFlavors()">
              🎲 Combinación Aleatoria
            </button>
            <button type="button" class="reign-swap-btn" onclick="ReignPaletteConfigurator.swapFlavors()">
              ⇄ Invertir Módulos
            </button>
          </div>

          <!-- INFORMACIÓN DE LA CONFIGURACIÓN DEBAJO DE LA VISTA PREVIA -->
          <div class="reign-config-summary-card is-modal-summary">
            <div class="reign-summary-modules-row">
              <div class="reign-summary-module-pill">
                <img src="${f1.img}" alt="${f1.nombre}" class="reign-summary-f1-img">
                <div class="reign-summary-pill-text">
                  <span class="reign-pill-label">Primer sabor</span>
                  <strong class="reign-summary-f1-name">${f1.nombre}</strong>
                </div>
              </div>
              <span class="reign-summary-plus">+</span>
              <div class="reign-summary-module-pill">
                <img src="${f2.img}" alt="${f2.nombre}" class="reign-summary-f2-img">
                <div class="reign-summary-pill-text">
                  <span class="reign-pill-label">Segundo sabor</span>
                  <strong class="reign-summary-f2-name">${f2.nombre}</strong>
                </div>
              </div>
            </div>

            <div class="reign-summary-details-list">
              <div class="reign-summary-detail-line">
                <span>Producto:</span>
                <strong>${product.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Primer sabor:</span>
                <strong class="reign-summary-f1-name">${f1.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Segundo sabor:</span>
                <strong class="reign-summary-f2-name">${f2.nombre}</strong>
              </div>
              <div class="reign-summary-detail-line">
                <span>Precio correspondiente:</span>
                <strong class="reign-summary-price-val">$${activeTotal.toLocaleString('es-CO')} COP</strong>
              </div>
            </div>

            ${!isWholesale ? `
              <div class="reign-qty-toggle-row">
                <button type="button" class="reign-qty-opt-btn ${this.selectedQty === 1 ? 'active' : ''}" data-qty="1" onclick="ReignPaletteConfigurator.setQty(1)">
                  <span>1 Unidad</span>
                  <strong>$40.000 COP</strong>
                </button>
                <button type="button" class="reign-qty-opt-btn is-promo ${this.selectedQty === 2 ? 'active' : ''}" data-qty="2" onclick="ReignPaletteConfigurator.setQty(2)">
                  <span>🔥 2 Unidades (Promo)</span>
                  <strong>$70.000 COP</strong>
                </button>
              </div>
              <button type="button" class="btn btn-primary btn-block reign-modal-add-btn" onclick="ReignPaletteConfigurator.addConfiguredToCart(ReignPaletteConfigurator.selectedQty, true)">
                <img src="assets/icons/carrito.png" class="btn-inline-icon" alt="Carrito">
                <span>Agregar Combinación al Carrito</span>
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-block reign-modal-add-btn" onclick="CatalogController.closeFlavorModal(); Toast.show('Combinación ' + ReignPaletteConfigurator.getCombinedVariantLabel() + ' lista para agregar por paquete mayorista', 'success');">
                <span>✓ Usar esta combinación en Mayorista</span>
              </button>
            `}
          </div>
        </div>

        <!-- SELECTORES PASO 1 Y PASO 2 CON FOTOGRAFÍAS GRANDES -->
        <div class="reign-modal-selectors-panel">
          <!-- PASO 1 -->
          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill">PASO 1 — PRIMER SABOR</span>
                <h4 class="reign-modal-step-heading">Elige el Módulo Izquierdo</h4>
              </div>
              <span class="reign-modal-selected-indicator reign-summary-f1-name">${f1.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f1.nombre;
                return `
                  <button type="button"
                          class="reign-modal-flavor-card ${isSel ? 'is-selected' : ''}"
                          data-reign-slot="1"
                          data-flavor-name="${flav.nombre}"
                          onclick="ReignPaletteConfigurator.setFlavor(1, '${flav.nombre}')">
                    <div class="reign-modal-card-img-box">
                      <img src="${flav.img}" alt="${flav.nombre}" loading="lazy">
                    </div>
                    <div class="reign-modal-card-Name">${flav.nombre}</div>
                    <span class="reign-opt-status">${isSel ? '✓ MÓDULO 1' : 'Elegir #1'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- PASO 2 -->
          <div class="reign-modal-step-section">
            <div class="reign-modal-step-title-bar">
              <div>
                <span class="reign-step-badge-pill step-2">PASO 2 — SEGUNDO SABOR</span>
                <h4 class="reign-modal-step-heading">Elige el Módulo Derecho</h4>
              </div>
              <span class="reign-modal-selected-indicator reign-summary-f2-name">${f2.nombre}</span>
            </div>
            <div class="reign-modal-flavors-grid">
              ${flavors.map(flav => {
                const isSel = flav.nombre === f2.nombre;
                return `
                  <button type="button"
                          class="reign-modal-flavor-card ${isSel ? 'is-selected' : ''}"
                          data-reign-slot="2"
                          data-flavor-name="${flav.nombre}"
                          onclick="ReignPaletteConfigurator.setFlavor(2, '${flav.nombre}')">
                    <div class="reign-modal-card-img-box">
                      <img src="${flav.img}" alt="${flav.nombre}" loading="lazy">
                    </div>
                    <div class="reign-modal-card-Name">${flav.nombre}</div>
                    <span class="reign-opt-status">${isSel ? '✓ MÓDULO 2' : 'Elegir #2'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    const modalCanvas = document.getElementById('reignModalCompositeCanvas');
    if (modalCanvas) {
      this.renderCompositeToCanvas(modalCanvas, this.flavor1, this.flavor2);
    }
  },

  /**
   * Agrega la combinación actual de REIGN BAR PALETTE al carrito conservando
   * explícitamente Primer Sabor, Segundo Sabor y la imagen compuesta generada.
   */
  async addConfiguredToCart(qty = null, closeModalAfter = false) {
    const product = this.getProduct();
    if (!product || product.agotado || product.coming_soon) return;

    const finalQty = Number(qty) || this.selectedQty || 1;
    const f1 = this.getFlavorObj(this.flavor1);
    const f2 = this.getFlavorObj(this.flavor2);
    const combinedVariant = this.getCombinedVariantLabel(f1.nombre, f2.nombre);

    // Asegurar que la imagen combinada esté actualizada
    const cardCanvas = document.getElementById('reignCardCompositeCanvas');
    if (cardCanvas) {
      await this.renderCompositeToCanvas(cardCanvas, f1.nombre, f2.nombre);
    }

    Cart.addItem(product, combinedVariant, finalQty, {
      isDualFlavor: true,
      flavor1: f1.nombre,
      flavor2: f2.nombre,
      flavor1Img: f1.img,
      flavor2Img: f2.img,
      compositeImg: this.lastCompositeDataUrl || f1.img
    });

    if (closeModalAfter && typeof CatalogController !== 'undefined') {
      CatalogController.closeFlavorModal();
    }
  }
};

window.ReignPaletteConfigurator = ReignPaletteConfigurator;
