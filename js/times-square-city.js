/**
 * js/times-square-city.js
 * Motor de renderizado visual 2D de alta fidelidad para el horizonte y avenida futurista
 * estilo Times Square nocturno en Capital Vape.
 *
 * Características:
 * - Edificios en perspectiva isométrica y angular hacia el punto de fuga.
 * - Pantallas LED publicitarias gigantes con degradados animados y texto institucional.
 * - Marquesinas de neón (Morado, Cian, Magenta, Dorado, Azul).
 * - Reflejos dinámicos en asfalto mojado.
 * - Haces de luz / reflectores de búsqueda atravesando el cielo nocturno.
 * - Modo liviano y optimizado para 60fps con control de visibilidad.
 */

(function(root) {
  'use strict';

  class TimesSquareCitySystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.animId = null;
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.buildings = [];
      this.screens = [];
      this.searchlights = [];
      this.time = 0;
      this.isActive = false;

      this.init();
    }

    init() {
      this.resize();
      this.buildCityScene();
      this.start();

      window.addEventListener('resize', () => {
        this.resize();
        this.buildCityScene();
      });
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      this.width = rect.width || window.innerWidth;
      this.height = rect.height || window.innerHeight;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';

      this.ctx.scale(this.dpr, this.dpr);
    }

    buildCityScene() {
      const w = this.width;
      const h = this.height;
      this.buildings = [];
      this.screens = [];
      this.searchlights = [];

      const vanishX = w * 0.5;
      const vanishY = h * 0.62;

      // 1. Edificios de fondo y flancos (Perspectiva Times Square)
      // Flanco Izquierdo
      const leftColWidths = [0.18, 0.16, 0.14];
      let curX = 0;
      leftColWidths.forEach((pct, idx) => {
        const bW = w * pct;
        const bH = h * (0.85 + idx * 0.05);
        this.buildings.push({
          x: curX,
          y: h - bH,
          w: bW + 4,
          h: bH,
          color: idx % 2 === 0 ? '#0B0716' : '#070410',
          side: 'left',
          windows: this.generateWindows(curX, h - bH, bW, bH * 0.7)
        });
        curX += bW - 10;
      });

      // Flanco Derecho
      const rightColWidths = [0.14, 0.16, 0.18];
      let curRX = w;
      rightColWidths.reverse().forEach((pct, idx) => {
        const bW = w * pct;
        const bH = h * (0.90 - idx * 0.04);
        curRX -= (bW - 8);
        this.buildings.push({
          x: curRX,
          y: h - bH,
          w: bW + 4,
          h: bH,
          color: idx % 2 === 0 ? '#0C081A' : '#080512',
          side: 'right',
          windows: this.generateWindows(curRX, h - bH, bW, bH * 0.7)
        });
      });

      // 2. Pantallas LED publicitarias gigantes (estilo Times Square)
      // Pantalla Gigante Izquierda 1
      this.screens.push({
        x: w * 0.04,
        y: h * 0.12,
        w: w * 0.22,
        h: h * 0.32,
        palette: ['#9333EA', '#3B82F6', '#06B6D4'],
        label: 'CAPITAL VAPE',
        sub: 'PREMIUM EXPERIENCE',
        accent: '#D4AF37',
        rate: 0.8,
        pulseOffset: 0
      });

      // Pantalla Vertical Izquierda 2
      this.screens.push({
        x: w * 0.18,
        y: h * 0.28,
        w: w * 0.12,
        h: h * 0.38,
        palette: ['#EC4899', '#8B5CF6', '#22D3EE'],
        label: 'REIGN BAR',
        sub: '50.000 PUFFS',
        accent: '#FACC15',
        rate: 1.2,
        pulseOffset: 1.5
      });

      // Pantalla Gigante Derecha 1 (Curva / Angular)
      this.screens.push({
        x: w * 0.74,
        y: h * 0.14,
        w: w * 0.22,
        h: h * 0.30,
        palette: ['#D4AF37', '#9333EA', '#E11D48'],
        label: 'MAYORISTA',
        sub: 'DISTRIBUCIÓN 2026',
        accent: '#38BDF8',
        rate: 0.9,
        pulseOffset: 2.2
      });

      // Pantalla Vertical Derecha 2
      this.screens.push({
        x: w * 0.68,
        y: h * 0.30,
        w: w * 0.13,
        h: h * 0.36,
        palette: ['#06B6D4', '#6366F1', '#A855F7'],
        label: 'DOJO X',
        sub: '20K SYSTEM',
        accent: '#F43F5E',
        rate: 1.1,
        pulseOffset: 3.1
      });

      // Pantalla de Fondo Central (Horizonte)
      this.screens.push({
        x: w * 0.38,
        y: h * 0.35,
        w: w * 0.24,
        h: h * 0.18,
        palette: ['#7928CA', '#D4AF37', '#0EA5E9'],
        label: 'TIMES SQUARE',
        sub: 'CYBERPUNK DISTRICT',
        accent: '#FACC15',
        rate: 0.7,
        pulseOffset: 4.0
      });

      // 3. Reflectores de búsqueda (Searchlights en el cielo)
      this.searchlights = [
        { baseX: w * 0.2, angle: -0.4, speed: 0.5, color: 'rgba(147, 51, 234, 0.22)' },
        { baseX: w * 0.35, angle: 0.2, speed: 0.4, color: 'rgba(6, 182, 212, 0.18)' },
        { baseX: w * 0.65, angle: -0.3, speed: 0.45, color: 'rgba(212, 175, 55, 0.2)' },
        { baseX: w * 0.8, angle: 0.5, speed: 0.55, color: 'rgba(236, 72, 153, 0.2)' }
      ];
    }

    generateWindows(bx, by, bw, bh) {
      const windows = [];
      const cols = Math.max(3, Math.floor(bw / 16));
      const rows = Math.max(5, Math.floor(bh / 18));
      const cellW = bw / cols;
      const cellH = bh / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.45) {
            const colors = ['#FDE047', '#38BDF8', '#C084FC', '#F472B6', '#FFFFFF'];
            windows.push({
              x: bx + c * cellW + 4,
              y: by + r * cellH + 4,
              w: Math.max(2, cellW - 8),
              h: Math.max(3, cellH - 7),
              color: colors[Math.floor(Math.random() * colors.length)],
              alpha: Math.random() * 0.7 + 0.2
            });
          }
        }
      }
      return windows;
    }

    drawSky() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // Cielo nocturno con niebla púrpura profunda
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#040209');
      skyGrad.addColorStop(0.35, '#080414');
      skyGrad.addColorStop(0.65, '#120726');
      skyGrad.addColorStop(1, '#06030D');

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);
    }

    drawSearchlights() {
      const ctx = this.ctx;
      const h = this.height;

      this.searchlights.forEach((sl, idx) => {
        const curAngle = Math.sin(this.time * sl.speed + idx) * 0.45 + sl.angle;
        const beamLen = h * 1.2;
        const topX = sl.baseX + Math.sin(curAngle) * beamLen;
        const topY = 0;

        ctx.save();
        const beamGrad = ctx.createLinearGradient(sl.baseX, h * 0.7, topX, topY);
        beamGrad.addColorStop(0, sl.color);
        beamGrad.addColorStop(0.6, sl.color.replace(')', ', 0.08)').replace('rgba', 'rgba'));
        beamGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(sl.baseX - 18, h * 0.7);
        ctx.lineTo(topX - 60, topY);
        ctx.lineTo(topX + 60, topY);
        ctx.lineTo(sl.baseX + 18, h * 0.7);
        ctx.closePath();
        ctx.fillStyle = beamGrad;
        ctx.fill();
        ctx.restore();
      });
    }

    drawBuildings() {
      const ctx = this.ctx;

      this.buildings.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // Borde neón sutil de edificio
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Ventanas iluminadas
        b.windows.forEach(win => {
          ctx.fillStyle = win.color;
          ctx.globalAlpha = win.alpha * (0.85 + Math.sin(this.time * 2 + win.x) * 0.15);
          ctx.fillRect(win.x, win.y, win.w, win.h);
        });
        ctx.restore();
      });
    }

    drawScreens() {
      const ctx = this.ctx;

      this.screens.forEach(screen => {
        ctx.save();

        // Marco exterior de la pantalla LED
        ctx.fillStyle = '#050209';
        ctx.fillRect(screen.x - 3, screen.y - 3, screen.w + 6, screen.h + 6);
        ctx.strokeStyle = screen.accent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screen.x - 3, screen.y - 3, screen.w + 6, screen.h + 6);

        // Contenido de la pantalla LED con gradiente dinámico
        const wave = Math.sin(this.time * screen.rate + screen.pulseOffset);
        const grad = ctx.createLinearGradient(screen.x, screen.y, screen.x + screen.w, screen.y + screen.h);
        grad.addColorStop(0, screen.palette[0]);
        grad.addColorStop(0.5, screen.palette[1]);
        grad.addColorStop(1, screen.palette[2]);

        ctx.fillStyle = grad;
        ctx.fillRect(screen.x, screen.y, screen.w, screen.h);

        // Trama LED interna (Scanlines)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        for (let y = screen.y; y < screen.y + screen.h; y += 4) {
          ctx.fillRect(screen.x, y, screen.w, 1.5);
        }

        // Título del anuncio publicitario
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = screen.accent;
        ctx.shadowBlur = 12;
        ctx.textAlign = 'center';
        ctx.font = `900 ${Math.max(10, Math.floor(screen.w * 0.12))}px Outfit, sans-serif`;
        ctx.fillText(screen.label, screen.x + screen.w / 2, screen.y + screen.h * 0.48);

        // Subtítulo
        ctx.fillStyle = screen.accent;
        ctx.shadowBlur = 8;
        ctx.font = `700 ${Math.max(7, Math.floor(screen.w * 0.055))}px Outfit, sans-serif`;
        ctx.fillText(screen.sub, screen.x + screen.w / 2, screen.y + screen.h * 0.72);

        // Resplandor ambiental emitido hacia la niebla
        const glowRadius = Math.max(screen.w, screen.h) * 0.9;
        const screenGlow = ctx.createRadialGradient(
          screen.x + screen.w / 2, screen.y + screen.h / 2, screen.w * 0.2,
          screen.x + screen.w / 2, screen.y + screen.h / 2, glowRadius
        );
        screenGlow.addColorStop(0, screen.palette[0].replace(')', ', 0.25)').replace('rgb', 'rgba').replace('#', 'rgba('));
        screenGlow.addColorStop(1, 'transparent');

        ctx.restore();
      });
    }

    drawWetRoadAndReflections() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const roadY = h * 0.65;
      const roadH = h - roadY;

      ctx.save();

      // Superficie de asfalto mojado con perspectiva cónica
      const roadGrad = ctx.createLinearGradient(0, roadY, 0, h);
      roadGrad.addColorStop(0, 'rgba(10, 6, 20, 0.4)');
      roadGrad.addColorStop(0.3, 'rgba(8, 4, 16, 0.7)');
      roadGrad.addColorStop(1, 'rgba(3, 2, 7, 0.95)');

      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, roadY, w, roadH);

      // Líneas y reflejos especulares de las pantallas sobre el pavimento mojado
      this.screens.forEach(screen => {
        const refX = screen.x + screen.w * 0.1;
        const refW = screen.w * 0.8;
        const refY = roadY;
        const refH = roadH;

        const refGrad = ctx.createLinearGradient(refX, refY, refX, h);
        refGrad.addColorStop(0, screen.palette[0].replace(')', ', 0.35)').replace('rgb', 'rgba'));
        refGrad.addColorStop(0.5, screen.palette[1].replace(')', ', 0.18)').replace('rgb', 'rgba'));
        refGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = refGrad;
        ctx.filter = 'blur(10px)';
        ctx.fillRect(refX, refY, refW, refH);
        ctx.filter = 'none';
      });

      // Líneas de perspectiva en el suelo (Avenida futurista)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, roadY);
      ctx.lineTo(w * 0.05, h);
      ctx.moveTo(w * 0.5, roadY);
      ctx.lineTo(w * 0.95, h);
      ctx.moveTo(w * 0.5, roadY);
      ctx.lineTo(w * 0.5, h);
      ctx.stroke();

      ctx.restore();
    }

    loop() {
      if (!this.isActive) return;
      this.time += 0.02;

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawSky();
      this.drawSearchlights();
      this.drawBuildings();
      this.drawScreens();
      this.drawWetRoadAndReflections();

      this.animId = requestAnimationFrame(() => this.loop());
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.loop();
    }

    stop() {
      this.isActive = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }
  }

  // Inicializador global
  root.TimesSquareCity = {
    instances: {},
    init(canvasId) {
      if (!this.instances[canvasId]) {
        this.instances[canvasId] = new TimesSquareCitySystem(canvasId);
      }
      return this.instances[canvasId];
    },
    stop(canvasId) {
      if (this.instances[canvasId]) {
        this.instances[canvasId].stop();
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Inicializar escenario de Times Square en Age-Gate y Selector
    if (document.getElementById('tsAgeGateCityCanvas')) {
      root.TimesSquareCity.init('tsAgeGateCityCanvas');
    }
    if (document.getElementById('tsStoreSelectorCityCanvas')) {
      root.TimesSquareCity.init('tsStoreSelectorCityCanvas');
    }
  });

})(typeof window !== 'undefined' ? window : globalThis);
