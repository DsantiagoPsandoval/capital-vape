/**
 * CAPITAL VAPE - AMBIENTACIÓN DE HALLOWEEN 3D PROFESIONAL
 * Three.js WebGL Engine:
 * - Murciélagos 3D semirrealistas con aleteo biológico multicapa y vuelo orgánico en X/Y/Z
 * - Cinemática robusta: velocidades y objetivos garantizados desde la inicialización (sin estados estáticos)
 * - Loop de animación único y resiliente ante recargas de página, cambios de pestaña y redimensionamiento
 * - Gestión completa del ciclo de vida y Visibility API (reactivación automática hidden -> visible)
 * - Tres planos de profundidad (fondo, medio, primer plano) con materiales y geometrías 100% compartidos
 * - Optimización inteligente y adaptativa de partículas y efectos entre PC, Tablet y Celular
 * - Telarañas sutiles distribuidas en esquinas y tarjetas selectas del catálogo
 */

(function () {
  'use strict';

  // Verificar soporte de WebGL de forma segura
  function isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Comprobar reducción de movimiento para accesibilidad
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
  });

  /* ==========================================================================
     GEOMETRÍAS Y MATERIALES COMPARTIDOS (MÁXIMA EFICIENCIA DE GPU)
     ========================================================================== */
  let torsoGeom, headGeom, earGeom;
  let leftInnerGeom, leftOuterGeom, rightInnerGeom, rightOuterGeom;
  let sharedMaterials = null;
  let cachedParticleTexture = null;

  function initSharedGeometries() {
    if (torsoGeom) return;

    torsoGeom = new THREE.ConeGeometry(2.3, 11, 7);
    torsoGeom.rotateX(-Math.PI / 2); // Orientar cuerpo hacia +Z

    headGeom = new THREE.SphereGeometry(2.1, 8, 8);
    earGeom = new THREE.ConeGeometry(0.75, 2.4, 5);
    earGeom.rotateX(-0.25);

    // Forma del ala interna izquierda (brazo)
    const leftInnerShape = new THREE.Shape();
    leftInnerShape.moveTo(0, 0);
    leftInnerShape.lineTo(-12, 2.8);
    leftInnerShape.lineTo(-11, -6.0);
    leftInnerShape.quadraticCurveTo(-5.5, -3.2, 0, -3.8);
    leftInnerShape.closePath();
    leftInnerGeom = new THREE.ShapeGeometry(leftInnerShape);

    // Forma del ala externa izquierda (punta festoneada / falanges)
    const leftOuterShape = new THREE.Shape();
    leftOuterShape.moveTo(0, 0);
    leftOuterShape.lineTo(-14.5, 2.2);
    leftOuterShape.quadraticCurveTo(-12, -5.5, -8.5, -7.0);
    leftOuterShape.quadraticCurveTo(-4, -6.5, 1, -8.5);
    leftOuterShape.closePath();
    leftOuterGeom = new THREE.ShapeGeometry(leftOuterShape);

    // Forma del ala interna derecha (espejo)
    const rightInnerShape = new THREE.Shape();
    rightInnerShape.moveTo(0, 0);
    rightInnerShape.lineTo(12, 2.8);
    rightInnerShape.lineTo(11, -6.0);
    rightInnerShape.quadraticCurveTo(5.5, -3.2, 0, -3.8);
    rightInnerShape.closePath();
    rightInnerGeom = new THREE.ShapeGeometry(rightInnerShape);

    // Forma del ala externa derecha (espejo)
    const rightOuterShape = new THREE.Shape();
    rightOuterShape.moveTo(0, 0);
    rightOuterShape.lineTo(14.5, 2.2);
    rightOuterShape.quadraticCurveTo(12, -5.5, 8.5, -7.0);
    rightOuterShape.quadraticCurveTo(4, -6.5, -1, -8.5);
    rightOuterShape.closePath();
    rightOuterGeom = new THREE.ShapeGeometry(rightOuterShape);
  }

  function initSharedMaterials() {
    if (sharedMaterials) return;

    // Compartir materiales por cada plano de profundidad (evita recompilar shaders o fragmentar draw calls)
    sharedMaterials = {
      far: {
        body: new THREE.MeshStandardMaterial({
          color: 0x140b22,
          roughness: 0.65,
          metalness: 0.15,
          transparent: true,
          opacity: 0.52
        }),
        wing: new THREE.MeshStandardMaterial({
          color: 0x190d2e,
          roughness: 0.6,
          metalness: 0.1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.52
        })
      },
      mid: {
        body: new THREE.MeshStandardMaterial({
          color: 0x140b22,
          roughness: 0.65,
          metalness: 0.15,
          transparent: true,
          opacity: 0.85
        }),
        wing: new THREE.MeshStandardMaterial({
          color: 0x190d2e,
          roughness: 0.6,
          metalness: 0.1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        })
      },
      close: {
        body: new THREE.MeshStandardMaterial({
          color: 0x140b22,
          roughness: 0.65,
          metalness: 0.15,
          transparent: true,
          opacity: 0.98
        }),
        wing: new THREE.MeshStandardMaterial({
          color: 0x190d2e,
          roughness: 0.6,
          metalness: 0.1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.98
        })
      }
    };
  }

  /* ==========================================================================
     TEXTURA PROCEDURAL DE PARTÍCULAS ESPECTRALES (CACHEADA)
     ========================================================================== */
  function getParticleTexture() {
    if (cachedParticleTexture) return cachedParticleTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 170, 70, 0.85)');
    grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.45)');
    grad.addColorStop(1, 'rgba(10, 5, 20, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    cachedParticleTexture = new THREE.CanvasTexture(canvas);
    return cachedParticleTexture;
  }

  /* ==========================================================================
     CLASE MURCIÉLAGO 3D (CINEMÁTICA, ALETEO Y VUELO PROCEDURAL)
     ========================================================================== */
  class Bat3D {
    constructor(scene, depthTier, screenBounds) {
      this.scene = scene;
      this.depthTier = depthTier || 'mid';
      this.screenBounds = screenBounds || { width: 1200, height: 800 };

      // Parámetros según plano de profundidad
      let baseScale, zRange, speedRange;
      if (this.depthTier === 'far') {
        baseScale = 0.65;
        zRange = [-340, -150];
        speedRange = [1.9, 2.7];
        this.flapFreq = 10.5 + Math.random() * 2.5;
      } else if (this.depthTier === 'close') {
        baseScale = 1.35;
        zRange = [130, 260];
        speedRange = [3.8, 5.0];
        this.flapFreq = 15.0 + Math.random() * 3.5;
      } else {
        baseScale = 0.95;
        zRange = [-140, 120];
        speedRange = [2.6, 3.8];
        this.flapFreq = 12.5 + Math.random() * 3.0;
      }

      this.scale = baseScale * (0.88 + Math.random() * 0.24);
      this.maxSpeed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      this.minSpeed = Math.max(1.2, this.maxSpeed * 0.55);
      this.turnSpeed = 0.045 + Math.random() * 0.035;
      this.zRange = zRange;

      // Materiales compartidos
      const mats = sharedMaterials[this.depthTier] || sharedMaterials.mid;
      this.bodyMat = mats.body;
      this.wingMat = mats.wing;

      // Jerarquía 3D
      this.root = new THREE.Group();
      this.bodyGroup = new THREE.Group();
      this.root.add(this.bodyGroup);

      // Cuerpo, cabeza y orejas
      const torso = new THREE.Mesh(torsoGeom, this.bodyMat);
      this.bodyGroup.add(torso);

      const head = new THREE.Mesh(headGeom, this.bodyMat);
      head.position.set(0, 0.45, 5.0);
      this.bodyGroup.add(head);

      const leftEar = new THREE.Mesh(earGeom, this.bodyMat);
      leftEar.position.set(-1.05, 1.9, 5.2);
      this.bodyGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeom, this.bodyMat);
      rightEar.position.set(1.05, 1.9, 5.2);
      this.bodyGroup.add(rightEar);

      // Ala izquierda articulada (hombro + codo)
      this.leftWingPivot = new THREE.Group();
      this.leftWingPivot.position.set(-1.9, 0.2, 1.6);
      this.bodyGroup.add(this.leftWingPivot);

      const leftInnerMesh = new THREE.Mesh(leftInnerGeom, this.wingMat);
      this.leftWingPivot.add(leftInnerMesh);

      this.leftOuterPivot = new THREE.Group();
      this.leftOuterPivot.position.set(-12, 2.8, 0);
      this.leftWingPivot.add(this.leftOuterPivot);

      const leftOuterMesh = new THREE.Mesh(leftOuterGeom, this.wingMat);
      this.leftOuterPivot.add(leftOuterMesh);

      // Ala derecha articulada (hombro + codo)
      this.rightWingPivot = new THREE.Group();
      this.rightWingPivot.position.set(1.9, 0.2, 1.6);
      this.bodyGroup.add(this.rightWingPivot);

      const rightInnerMesh = new THREE.Mesh(rightInnerGeom, this.wingMat);
      this.rightWingPivot.add(rightInnerMesh);

      this.rightOuterPivot = new THREE.Group();
      this.rightOuterPivot.position.set(12, 2.8, 0);
      this.rightWingPivot.add(this.rightOuterPivot);

      const rightOuterMesh = new THREE.Mesh(rightOuterGeom, this.wingMat);
      this.rightOuterPivot.add(rightOuterMesh);

      this.root.scale.setScalar(this.scale);
      this.scene.add(this.root);

      // Cinemática garantizada (nunca vectores nulos)
      this.position = new THREE.Vector3();
      this.velocity = new THREE.Vector3();
      this.target = new THREE.Vector3();
      this.targetTimer = 3.0 + Math.random() * 4.0;

      // Variaciones y dinámicas individuales
      this.wingPhase = Math.random() * Math.PI * 2;
      this.asymmetry = (Math.random() - 0.5) * 0.08;
      this.noiseSeedX = Math.random() * 100;
      this.noiseSeedY = Math.random() * 100;
      this.noiseSeedZ = Math.random() * 100;
      this.glideTimer = 0;
      this.glideDuration = 0;
      this.bankAngle = 0;

      // Generar posición y trayectoria inicial
      this.spawn(true);
    }

    pickNewTarget() {
      const b = this.screenBounds || { width: 1200, height: 800 };
      const w = Math.max(b.width || 0, 400);
      const h = Math.max(b.height || 0, 300);

      let attempts = 0;
      do {
        this.target.set(
          (Math.random() - 0.5) * w * 0.92,
          (Math.random() - 0.5) * h * 0.85,
          this.zRange[0] + Math.random() * (this.zRange[1] - this.zRange[0])
        );
        attempts++;
      } while (this.target.distanceTo(this.position) < 120 && attempts < 5);

      this.targetTimer = 3.5 + Math.random() * 4.0;

      // Ocasionalmente planear en ráfagas de aire
      if (Math.random() < 0.32) {
        this.glideDuration = 0.8 + Math.random() * 1.0;
        this.glideTimer = this.glideDuration;
      }
    }

    spawn(initial = false) {
      const b = this.screenBounds || { width: 1200, height: 800 };
      const w = Math.max(b.width || 0, 400);
      const h = Math.max(b.height || 0, 300);
      const z = this.zRange[0] + Math.random() * (this.zRange[1] - this.zRange[0]);

      if (initial) {
        // En arranque: repartir armónicamente por el volumen visible
        this.position.set(
          (Math.random() - 0.5) * w * 0.95,
          (Math.random() - 0.5) * h * 0.85,
          z
        );
      } else {
        // En reaparición: ingresar desde un extremo exterior
        const edge = Math.floor(Math.random() * 5);
        const margin = 80;
        if (edge === 0) {
          this.position.set(-w * 0.55 - margin, (Math.random() - 0.5) * h * 0.8, z);
        } else if (edge === 1) {
          this.position.set(w * 0.55 + margin, (Math.random() - 0.5) * h * 0.8, z);
        } else if (edge === 2) {
          this.position.set((Math.random() - 0.5) * w * 0.8, h * 0.55 + margin, z);
        } else if (edge === 3) {
          this.position.set((Math.random() - 0.5) * w * 0.8, -h * 0.55 - margin, z);
        } else {
          this.position.set((Math.random() - 0.5) * w * 0.7, (Math.random() - 0.5) * h * 0.7, this.zRange[0] - 80);
        }
      }

      this.root.position.copy(this.position);
      this.pickNewTarget();

      // Dirección y velocidad inicial garantizadas (vx, vy, vz siempre activas)
      const dir = new THREE.Vector3().subVectors(this.target, this.position);
      if (dir.lengthSq() < 0.001) {
        dir.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.3, Math.random() - 0.5);
      }
      dir.normalize().multiplyScalar(this.maxSpeed * 0.85);
      this.velocity.copy(dir);

      // Orientación inicial hacia su trayectoria
      const lookPos = this.position.clone().add(this.velocity);
      this.root.lookAt(lookPos);
    }

    update(dt, time, mouseWorld) {
      // Salvaguardar dt para prevenir que sea 0, NaN o negativo
      if (!dt || isNaN(dt) || dt <= 0) dt = 0.016;
      dt = Math.min(dt, 0.05);

      // Si hay reducción de movimiento activada por accesibilidad, ralentizar suavemente sin detener
      const speedMultiplier = isReducedMotion ? 0.35 : 1.0;

      const b = this.screenBounds || { width: 1200, height: 800 };
      const w = Math.max(b.width || 0, 400);
      const h = Math.max(b.height || 0, 300);
      const margin = 140;

      // 1. Reaparición si sale del volumen de pantalla
      if (
        this.position.x < -w * 0.6 - margin ||
        this.position.x > w * 0.6 + margin ||
        this.position.y < -h * 0.6 - margin ||
        this.position.y > h * 0.6 + margin ||
        this.position.z < this.zRange[0] - 130 ||
        this.position.z > this.zRange[1] + 130
      ) {
        this.spawn(false);
        return;
      }

      // 2. Temporizador y objetivo de vuelo
      this.targetTimer -= dt;
      if (this.targetTimer <= 0 || this.position.distanceTo(this.target) < 60) {
        this.pickNewTarget();
      }

      // 3. Dirección deseada y aceleración hacia el objetivo
      const desired = new THREE.Vector3().subVectors(this.target, this.position);
      if (desired.lengthSq() < 0.001) {
        desired.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.2, Math.random() - 0.5);
      }
      desired.normalize().multiplyScalar(this.maxSpeed * speedMultiplier);

      const steer = new THREE.Vector3().subVectors(desired, this.velocity);
      steer.clampLength(0, this.turnSpeed * this.maxSpeed);
      this.velocity.add(steer);

      // 4. Turbulencia atmosférica continua (corrientes de aire)
      const turbX = Math.sin(time * 1.8 + this.noiseSeedX) * 0.35;
      const turbY = Math.cos(time * 2.2 + this.noiseSeedY) * 0.45;
      const turbZ = Math.sin(time * 1.4 + this.noiseSeedZ) * 0.25;
      this.velocity.x += turbX * dt * 25;
      this.velocity.y += turbY * dt * 25;
      this.velocity.z += turbZ * dt * 25;

      // 5. Interacción ambiental reactiva al cursor
      if (mouseWorld) {
        const distToMouse = Math.hypot(this.position.x - mouseWorld.x, this.position.y - mouseWorld.y);
        if (distToMouse < 150) {
          const repelForce = (1.0 - distToMouse / 150) * 1.8;
          const repelDir = new THREE.Vector3(
            this.position.x - mouseWorld.x,
            this.position.y - mouseWorld.y,
            (Math.random() - 0.5) * 35
          ).normalize().multiplyScalar(repelForce);
          this.velocity.add(repelDir);
        }
      }

      // 6. Salvaguarda crítica: asegurar que la velocidad nunca sea cero permanente
      if (this.velocity.lengthSq() < 0.0001) {
        const angle = Math.random() * Math.PI * 2;
        this.velocity.set(
          Math.cos(angle) * this.maxSpeed * 0.8,
          (Math.random() - 0.5) * 0.3 * this.maxSpeed,
          Math.sin(angle) * this.maxSpeed * 0.8
        );
      }

      // Limitar velocidad entre mínimo y máximo configurados
      this.velocity.clampLength(this.minSpeed * speedMultiplier, this.maxSpeed * speedMultiplier);

      // 7. Aplicar desplazamiento en el espacio 3D
      this.position.addScaledVector(this.velocity, dt * 60);
      this.root.position.copy(this.position);

      // 8. Orientación tridimensional hacia el vector de velocidad
      const forwardTarget = this.position.clone().add(this.velocity);
      this.root.lookAt(forwardTarget);

      // 9. Alabeo orgánico (banking) en giros y curvas
      const lateralTurn = steer.x;
      const targetBank = -lateralTurn * 1.8;
      this.bankAngle += (targetBank - this.bankAngle) * (dt * 6.0);
      this.bodyGroup.rotation.z = Math.max(-0.85, Math.min(0.85, this.bankAngle));

      // 10. Aleteo biológico multicapa y planeo
      let flapFactor = 1.0;
      if (this.glideTimer > 0) {
        this.glideTimer -= dt;
        flapFactor = 0.16; // Mantener alas extendidas en planeo
      } else {
        this.wingPhase += this.flapFreq * dt * (isReducedMotion ? 0.4 : 1.0);
      }

      const flap = Math.sin(this.wingPhase) * flapFactor;
      const outerFlap = Math.sin(this.wingPhase - 0.48) * flapFactor;
      const rightFlap = Math.sin(this.wingPhase + this.asymmetry) * flapFactor;
      const rightOuterFlap = Math.sin(this.wingPhase + this.asymmetry - 0.48) * flapFactor;

      const maxInnerAngle = 0.72;
      this.leftWingPivot.rotation.z = flap * maxInnerAngle;
      this.leftWingPivot.rotation.x = Math.cos(this.wingPhase) * 0.14 * flapFactor;

      this.rightWingPivot.rotation.z = -rightFlap * maxInnerAngle;
      this.rightWingPivot.rotation.x = Math.cos(this.wingPhase + this.asymmetry) * 0.14 * flapFactor;

      const maxOuterAngle = 0.88;
      this.leftOuterPivot.rotation.z = outerFlap * maxOuterAngle;
      this.rightOuterPivot.rotation.z = -rightOuterFlap * maxOuterAngle;

      this.bodyGroup.position.y = -flap * 1.35 * flapFactor;
      this.bodyGroup.rotation.x = Math.cos(this.wingPhase) * 0.08 * flapFactor;
    }

    dispose() {
      if (this.root && this.root.parent) {
        this.root.parent.remove(this.root);
      }
    }
  }

  /* ==========================================================================
     SISTEMA DE PARTÍCULAS ESPECTRALES (LIGERO Y REUTILIZABLE)
     ========================================================================== */
  class SpectralParticles {
    constructor(scene, count, screenBounds) {
      this.scene = scene;
      this.count = count;
      this.screenBounds = screenBounds || { width: 1200, height: 800 };

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      this.speeds = new Float32Array(count);
      this.phases = new Float32Array(count);

      const palette = [
        new THREE.Color(0xff7a1a), // Naranja calabaza
        new THREE.Color(0xa855f7), // Violeta místico
        new THREE.Color(0xffe89c), // Oro lunar
        new THREE.Color(0xe07a5f)  // Terracota
      ];

      const w = Math.max(this.screenBounds.width || 0, 400);
      const h = Math.max(this.screenBounds.height || 0, 300);

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * w * 1.2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * h * 1.2;
        positions[i * 3 + 2] = -280 + Math.random() * 520;

        const col = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        this.speeds[i] = 0.25 + Math.random() * 0.75;
        this.phases[i] = Math.random() * Math.PI * 2;
      }

      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      this.material = new THREE.PointsMaterial({
        size: 15,
        vertexColors: true,
        map: getParticleTexture(),
        transparent: true,
        opacity: 0.70,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.points = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.points);
    }

    update(dt, time) {
      if (!this.geometry || !this.geometry.attributes.position) return;
      if (!dt || isNaN(dt) || dt <= 0) dt = 0.016;
      dt = Math.min(dt, 0.05);

      const positions = this.geometry.attributes.position.array;
      const b = this.screenBounds || { width: 1200, height: 800 };
      const halfH = Math.max(b.height || 0, 300) * 0.65;
      const w = Math.max(b.width || 0, 400);

      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += this.speeds[i] * dt * 42;
        positions[i3 + 0] += Math.sin(time * 1.1 + this.phases[i]) * 0.40;

        if (positions[i3 + 1] > halfH) {
          positions[i3 + 1] = -halfH;
          positions[i3 + 0] = (Math.random() - 0.5) * w * 1.2;
        }
      }
      this.geometry.attributes.position.needsUpdate = true;
    }

    dispose() {
      if (this.points && this.points.parent) {
        this.points.parent.remove(this.points);
      }
      if (this.geometry) this.geometry.dispose();
      if (this.material) this.material.dispose();
    }
  }

  /* ==========================================================================
     ESCENA PRINCIPAL DE HALLOWEEN (THREE.JS RUNTIME DE ALTO RENDIMIENTO)
     ========================================================================== */
  class HalloweenScene {
    constructor() {
      // Destruir instancia previa si existía para prevenir duplicidad de loops
      if (window.__HALLOWEEN_INSTANCE__) {
        try {
          window.__HALLOWEEN_INSTANCE__.dispose();
        } catch (e) {}
      }
      window.__HALLOWEEN_INSTANCE__ = this;

      this.canvas = document.getElementById('halloweenCanvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'halloweenCanvas';
        this.canvas.className = 'halloween-three-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(this.canvas);
      }

      // Inicializar recursos compartidos
      initSharedGeometries();
      initSharedMaterials();

      // Renderer WebGL con fondo 100% transparente
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: window.innerWidth > 768, // Antialias solo en tablet/desktop para máxima velocidad en celular
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);

      // Escena y Cámara de Perspectiva
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, 1, 1, 3000);
      this.camera.position.set(0, 0, 600);
      this.camera.lookAt(0, 0, 0);

      // Dimensiones iniciales y screenBounds seguros
      this.updateDimensions();

      // Iluminación nocturna
      this.setupLights();

      // Entidades: murciélagos y partículas
      this.bats = [];
      this.particles = null;
      this.initEntities();

      // Interacción sutil de ratón (solo si existe dispositivo apuntador)
      this.mouseWorld = null;
      this.setupMouseEvents();

      // Ciclo de vida y visibilidad de pestaña
      this.setupVisibilityEvents();

      // Resize
      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize, { passive: true });

      // Loop principal único
      this.clock = new THREE.Clock(true);
      this.isRunning = false;
      this.rafId = null;
      this.lastFrameTime = performance.now();
      this.animate = this.animate.bind(this);

      // Iniciar el loop inmediatamente
      this.startLoop();
    }

    updateDimensions() {
      const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 320);
      const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 320);
      this.width = w;
      this.height = h;

      if (this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }

      // Optimización inteligente de DPR por tipo de pantalla
      const isMobile = w < 768;
      const isTablet = w < 1024;
      const maxDpr = isMobile ? 1.0 : (isTablet ? 1.2 : 1.5);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      if (this.renderer) {
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h, false);
      }

      this.calcScreenBounds();
    }

    calcScreenBounds() {
      const vFov = (this.camera.fov * Math.PI) / 180;
      const heightAtZero = 2 * Math.tan(vFov / 2) * this.camera.position.z;
      const widthAtZero = heightAtZero * (this.camera.aspect || 1);
      this.screenBounds = {
        width: Math.max(widthAtZero, 400),
        height: Math.max(heightAtZero, 300)
      };

      if (this.pumpkinLight) {
        const halfW = this.screenBounds.width / 2;
        const halfH = this.screenBounds.height / 2;
        this.pumpkinLight.position.set(halfW * 0.72, -halfH * 0.72, 130);
      }
    }

    setupLights() {
      // Luz ambiental violeta nocturna
      this.ambientLight = new THREE.AmbientLight(0x281842, 1.4);
      this.scene.add(this.ambientLight);

      // Luz direccional de luna
      this.moonLight = new THREE.DirectionalLight(0xfff6db, 1.7);
      this.moonLight.position.set(340, 320, 220);
      this.scene.add(this.moonLight);

      // Luz puntual sincronizada con la calabaza
      this.pumpkinLight = new THREE.PointLight(0xff7a1a, 1.3, 850);
      const halfW = this.screenBounds ? this.screenBounds.width / 2 : 280;
      const halfH = this.screenBounds ? this.screenBounds.height / 2 : 320;
      this.pumpkinLight.position.set(halfW * 0.72, -halfH * 0.72, 130);
      this.scene.add(this.pumpkinLight);
    }

    getBatCount() {
      const w = this.width || window.innerWidth || 1200;
      if (w < 480) return 3;         // Celular compacto
      if (w < 768) return 4;         // Celular estándar
      if (w < 1024) return 6;        // Tablet / iPad
      return 10;                     // PC / Escritorio completo
    }

    getParticleCount() {
      const w = this.width || window.innerWidth || 1200;
      if (w < 480) return 18;        // Pocas partículas en celular pequeño para evitar lag
      if (w < 768) return 24;        // Celular: ligero y fluido
      if (w < 1024) return 40;       // Tablet
      return 70;                     // PC: ambientación completa
    }

    initEntities() {
      // Limpiar murciélagos previos
      this.bats.forEach(b => b.dispose());
      this.bats = [];

      // Limpiar partículas previas
      if (this.particles) {
        this.particles.dispose();
        this.particles = null;
      }

      // Crear murciélagos con distribución de planos de profundidad
      const totalBats = this.getBatCount();
      for (let i = 0; i < totalBats; i++) {
        let tier = 'mid';
        if (i % 3 === 0) tier = 'far';
        else if (i % 3 === 2) tier = 'close';

        this.bats.push(new Bat3D(this.scene, tier, this.screenBounds));
      }

      // Crear partículas espectrales adaptadas
      const particleCount = this.getParticleCount();
      this.particles = new SpectralParticles(this.scene, particleCount, this.screenBounds);
    }

    setupMouseEvents() {
      window.addEventListener('mousemove', (e) => {
        const ndcX = (e.clientX / (this.width || window.innerWidth)) * 2 - 1;
        const ndcY = -(e.clientY / (this.height || window.innerHeight)) * 2 + 1;

        this.mouseWorld = new THREE.Vector3(
          ndcX * (this.screenBounds.width * 0.5),
          ndcY * (this.screenBounds.height * 0.5),
          0
        );
      }, { passive: true });
    }

    setupVisibilityEvents() {
      // Visibility API: reactivar inmediatamente al volver a la pestaña
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.lastFrameTime = performance.now();
          if (this.clock) {
            this.clock.start();
          }
          if (!this.isRunning) {
            this.startLoop();
          }
        }
      });

      // Eventos adicionales de restauración de ventana / foco
      window.addEventListener('focus', () => {
        if (!this.isRunning) {
          this.startLoop();
        }
      });

      window.addEventListener('pageshow', () => {
        if (!this.isRunning) {
          this.startLoop();
        }
      });
    }

    onResize() {
      this.updateDimensions();

      // Ajustar cantidad solo si cambió de categoría de dispositivo
      const expectedBats = this.getBatCount();
      if (this.bats.length !== expectedBats) {
        this.initEntities();
      } else {
        this.bats.forEach(b => { b.screenBounds = this.screenBounds; });
        if (this.particles) this.particles.screenBounds = this.screenBounds;
      }

      // Garantizar que el loop siga activo tras redimensionar
      if (!this.isRunning) {
        this.startLoop();
      }
    }

    startLoop() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      if (this.clock && !this.clock.running) {
        this.clock.start();
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = requestAnimationFrame(this.animate);
    }

    stopLoop() {
      this.isRunning = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    animate(currentTime) {
      if (!this.isRunning) return;
      this.rafId = requestAnimationFrame(this.animate);

      // Cálculo de deltaTime 100% inmune a pausas, saltos o reloj en 0
      let dt = this.clock.getDelta();
      if (!dt || isNaN(dt) || dt <= 0 || dt > 0.2) {
        const now = currentTime || performance.now();
        const rawDelta = (now - (this.lastFrameTime || now)) / 1000;
        dt = (rawDelta > 0.001 && rawDelta < 0.1) ? rawDelta : 0.016;
      }
      this.lastFrameTime = currentTime || performance.now();

      const time = this.clock.getElapsedTime();

      // Sincronización de luz puntual con el ciclo de los ojos de la calabaza (6 segundos)
      if (this.pumpkinLight) {
        const cycleProgress = (time % 6.0) / 6.0;
        let pIntensity = 0.04;
        if (cycleProgress >= 0.22 && cycleProgress < 0.34) {
          const t = (cycleProgress - 0.22) / 0.12;
          pIntensity = 0.04 + t * 1.35;
        } else if (cycleProgress >= 0.34 && cycleProgress <= 0.68) {
          const flicker = Math.sin(time * 11.5) * 0.18 + Math.cos(time * 18.2) * 0.12;
          pIntensity = 1.35 + flicker;
        } else if (cycleProgress > 0.68 && cycleProgress <= 0.80) {
          const t = (cycleProgress - 0.68) / 0.12;
          pIntensity = 1.35 * (1.0 - t) + 0.04;
        }
        this.pumpkinLight.intensity = Math.max(0.02, pIntensity);
      }

      // Actualizar y volar cada murciélago 3D
      for (let i = 0; i < this.bats.length; i++) {
        this.bats[i].update(dt, time, this.mouseWorld);
      }

      // Actualizar partículas espectrales
      if (this.particles) {
        this.particles.update(dt, time);
      }

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.stopLoop();
      window.removeEventListener('resize', this.onResize);
      this.bats.forEach(b => b.dispose());
      this.bats = [];
      if (this.particles) {
        this.particles.dispose();
        this.particles = null;
      }
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  }

  /* ==========================================================================
     TELARAÑAS SUTILES EN TARJETAS DE PRODUCTOS SELECCIONADAS
     ========================================================================== */
  const MINI_COBWEB_SVG = `
    <svg viewBox="0 0 45 45" fill="none" stroke="rgba(235, 228, 250, 0.45)" stroke-width="1.2" aria-hidden="true">
      <path d="M45 0 L0 0 L0 45" stroke-width="1.6" opacity="0.6"/>
      <path d="M0 0 L45 45" opacity="0.5"/>
      <path d="M0 0 L45 22" opacity="0.4"/>
      <path d="M0 0 L22 45" opacity="0.4"/>
      <path d="M12 0 Q10 10 0 12" stroke="rgba(201, 191, 224, 0.55)" fill="none"/>
      <path d="M24 0 Q19 19 0 24" stroke="rgba(201, 191, 224, 0.55)" fill="none"/>
      <path d="M36 0 Q29 29 0 36" stroke="rgba(201, 191, 224, 0.55)" fill="none"/>
      <circle cx="9" cy="9" r="1" fill="rgba(255, 248, 214, 0.7)"/>
      <circle cx="18" cy="18" r="1" fill="rgba(255, 248, 214, 0.7)"/>
    </svg>
  `;

  function aplicarTelaranasEnTarjetas() {
    const cards = document.querySelectorAll('.product-card');
    if (!cards || cards.length === 0) return;

    cards.forEach((card, index) => {
      const existing = card.querySelector('.hw-card-cobweb');
      if (existing) existing.remove();

      // Aplicar sutilmente a ~25% de las tarjetas para equilibrio estético
      if (index % 4 === 0) {
        const cobwebEl = document.createElement('div');
        cobwebEl.className = 'hw-card-cobweb';
        cobwebEl.setAttribute('aria-hidden', 'true');
        cobwebEl.innerHTML = MINI_COBWEB_SVG;
        card.appendChild(cobwebEl);
      }
    });
  }

  /* ==========================================================================
     ARRANQUE E INTEGRACIÓN ROBUSTA (A PRUEBA DE RECARGAS Y EVENTOS)
     ========================================================================== */
  function initHalloween() {
    // Si ya existe una escena activa y corriendo, no reinstanciar innecesariamente
    if (window.Halloween && window.Halloween.scene && window.Halloween.scene.isRunning) {
      return;
    }

    let halloweenScene = null;
    let initError = null;

    if (isWebGLSupported() && typeof THREE !== 'undefined') {
      try {
        halloweenScene = new HalloweenScene();
      } catch (err) {
        initError = err.stack || err.message;
        console.warn('[Halloween] Error al inicializar escena 3D:', err);
      }
    } else {
      initError = `WebGL support: ${isWebGLSupported()}, THREE: ${typeof THREE}`;
      console.warn('[Halloween] WebGL no disponible en este entorno. Manteniendo decoración atmosférica.');
    }

    // Interceptar renders del catálogo
    function hookCatalogRenderers() {
      if (window.CatalogController && CatalogController.renderCatalog && !CatalogController._hwHooked) {
        CatalogController._hwHooked = true;
        const origCatalogRender = CatalogController.renderCatalog.bind(CatalogController);
        CatalogController.renderCatalog = function (...args) {
          origCatalogRender(...args);
          setTimeout(aplicarTelaranasEnTarjetas, 30);
        };
      }
      if (window.WholesaleCatalog && WholesaleCatalog.renderCatalog && !WholesaleCatalog._hwHooked) {
        WholesaleCatalog._hwHooked = true;
        const origWsRender = WholesaleCatalog.renderCatalog.bind(WholesaleCatalog);
        WholesaleCatalog.renderCatalog = function (...args) {
          origWsRender(...args);
          setTimeout(aplicarTelaranasEnTarjetas, 30);
        };
      }
    }

    hookCatalogRenderers();
    aplicarTelaranasEnTarjetas();

    // Observar renderizados futuros del catálogo (filtros, búsquedas, cambios de pestaña)
    const grids = document.querySelectorAll('.products-grid');
    if (grids.length > 0 && window.MutationObserver) {
      let debounceTimer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(aplicarTelaranasEnTarjetas, 150);
      });
      grids.forEach(grid => observer.observe(grid, { childList: true }));
    }

    // Re-aplicar tras eventos futuros de catálogo
    document.addEventListener('catalogRendered', aplicarTelaranasEnTarjetas);

    // Exponer API global
    window.Halloween = {
      scene: halloweenScene,
      _initError: initError,
      aplicarTelaranasEnTarjetas
    };
  }

  function boot() {
    if (window.Halloween && window.Halloween.scene) {
      if (!window.Halloween.scene.isRunning) {
        window.Halloween.scene.startLoop();
      }
      return;
    }
    initHalloween();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Respaldo de seguridad en evento load para asegurar que la escena arranque siempre
  window.addEventListener('load', () => {
    boot();
  }, { once: true });

})();
