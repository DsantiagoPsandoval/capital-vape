/**
 * CAPITAL VAPE - AMBIENTACIÓN DE HALLOWEEN 3D PROFESIONAL
 * Three.js WebGL Engine:
 * - Murciélagos 3D semirrealistas con aleteo biológico multicapa y vuelo orgánico en X/Y/Z
 * - Tres planos de profundidad (fondo, medio, primer plano)
 * - Iluminación atmosférica nocturna (luna + resplandor de calabaza)
 * - Partículas espectrales y ascuas flotantes con movimiento procedural
 * - Telarañas sutiles distribuidas en esquinas y tarjetas selectas del catálogo
 * - Optimizado para 60 FPS, responsive y respetuoso con prefers-reduced-motion
 */

(function () {
  'use strict';

  // Verificar soporte de WebGL
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
     GEOMETRÍAS COMPARTIDAS PARA MURCIÉLAGOS (MÁXIMA EFICIENCIA DE GPU)
     ========================================================================== */
  let torsoGeom, headGeom, earGeom;
  let leftInnerGeom, leftOuterGeom, rightInnerGeom, rightOuterGeom;

  function initSharedGeometries() {
    if (torsoGeom) return; // Ya inicializadas

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

  /* ==========================================================================
     TEXTURA PROCEDURAL DE PARTÍCULAS ESPECTRALES
     ========================================================================== */
  function createParticleTexture() {
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
    return new THREE.CanvasTexture(canvas);
  }

  /* ==========================================================================
     CLASE MURCIÉLAGO 3D (CINEMÁTICA, ALETEO Y VUELO PROCEDURAL)
     ========================================================================== */
  class Bat3D {
    constructor(scene, depthTier, screenBounds) {
      this.scene = scene;
      this.depthTier = depthTier; // 'far', 'mid', 'close'
      this.screenBounds = screenBounds;

      // Parámetros según nivel de profundidad
      let opacity, baseScale, zRange, speedRange;
      if (depthTier === 'far') {
        opacity = 0.52;
        baseScale = 0.65;
        zRange = [-340, -150];
        speedRange = [1.8, 2.6];
        this.flapFreq = 10.5 + Math.random() * 2.5;
      } else if (depthTier === 'close') {
        opacity = 0.98;
        baseScale = 1.35;
        zRange = [130, 260];
        speedRange = [3.8, 5.0];
        this.flapFreq = 15.0 + Math.random() * 3.5;
      } else {
        // 'mid'
        opacity = 0.85;
        baseScale = 0.95;
        zRange = [-140, 120];
        speedRange = [2.6, 3.8];
        this.flapFreq = 12.5 + Math.random() * 3.0;
      }

      this.scale = baseScale * (0.88 + Math.random() * 0.24);
      this.maxSpeed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      this.minSpeed = this.maxSpeed * 0.55;
      this.turnSpeed = 0.045 + Math.random() * 0.035;
      this.zRange = zRange;

      // Materiales con soporte para iluminación nocturna
      this.bodyMat = new THREE.MeshStandardMaterial({
        color: 0x140b22,
        roughness: 0.65,
        metalness: 0.15,
        transparent: true,
        opacity: opacity
      });

      this.wingMat = new THREE.MeshStandardMaterial({
        color: 0x190d2e,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity
      });

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

      // Estado de cinemática
      this.position = new THREE.Vector3();
      this.velocity = new THREE.Vector3();
      this.target = new THREE.Vector3();
      this.targetTimer = 0;

      // Variaciones individuales
      this.wingPhase = Math.random() * Math.PI * 2;
      this.asymmetry = (Math.random() - 0.5) * 0.08;
      this.noiseSeedX = Math.random() * 100;
      this.noiseSeedY = Math.random() * 100;
      this.noiseSeedZ = Math.random() * 100;
      this.glideTimer = 0;
      this.glideDuration = 0;
      this.bankAngle = 0;

      // Inicializar posición
      this.spawn(true);
    }

    spawn(initial = false) {
      const b = this.screenBounds;
      const z = this.zRange[0] + Math.random() * (this.zRange[1] - this.zRange[0]);

      if (initial) {
        // En arranque: repartir por toda la pantalla
        this.position.set(
          (Math.random() - 0.5) * b.width * 1.1,
          (Math.random() - 0.5) * b.height * 0.9,
          z
        );
      } else {
        // En reaparición: entrar desde bordes aleatorios (izquierda, derecha, arriba, abajo, fondo)
        const edge = Math.floor(Math.random() * 5);
        const margin = 80;
        if (edge === 0) {
          // Entrar por izquierda
          this.position.set(-b.width * 0.55 - margin, (Math.random() - 0.5) * b.height * 0.8, z);
        } else if (edge === 1) {
          // Entrar por derecha
          this.position.set(b.width * 0.55 + margin, (Math.random() - 0.5) * b.height * 0.8, z);
        } else if (edge === 2) {
          // Entrar por arriba
          this.position.set((Math.random() - 0.5) * b.width * 0.8, b.height * 0.55 + margin, z);
        } else if (edge === 3) {
          // Entrar por abajo
          this.position.set((Math.random() - 0.5) * b.width * 0.8, -b.height * 0.55 - margin, z);
        } else {
          // Entrar desde el fondo profundo Z
          this.position.set((Math.random() - 0.5) * b.width * 0.7, (Math.random() - 0.5) * b.height * 0.7, this.zRange[0] - 80);
        }
      }

      this.root.position.copy(this.position);
      this.pickNewTarget();

      // Velocidad inicial hacia el objetivo
      this.velocity.subVectors(this.target, this.position).normalize().multiplyScalar(this.maxSpeed * 0.8);
      this.root.lookAt(this.position.clone().add(this.velocity));
    }

    pickNewTarget() {
      const b = this.screenBounds;
      // Generar objetivo dentro del volumen visible de vuelo
      this.target.set(
        (Math.random() - 0.5) * b.width * 0.95,
        (Math.random() - 0.5) * b.height * 0.85,
        this.zRange[0] + Math.random() * (this.zRange[1] - this.zRange[0])
      );
      this.targetTimer = 3.5 + Math.random() * 4.0;

      // Ocasionalmente entrar en planeo (glide)
      if (Math.random() < 0.35) {
        this.glideDuration = 0.8 + Math.random() * 1.0;
        this.glideTimer = this.glideDuration;
      }
    }

    update(dt, time, mouseWorld) {
      if (isReducedMotion) {
        return;
      }

      const b = this.screenBounds;
      const margin = 140;

      // 1. Verificar si salió de los límites de pantalla
      if (
        this.position.x < -b.width * 0.6 - margin ||
        this.position.x > b.width * 0.6 + margin ||
        this.position.y < -b.height * 0.6 - margin ||
        this.position.y > b.height * 0.6 + margin ||
        this.position.z < this.zRange[0] - 120 ||
        this.position.z > this.zRange[1] + 120
      ) {
        this.spawn(false);
        return;
      }

      // 2. Temporizador de objetivo
      this.targetTimer -= dt;
      if (this.targetTimer <= 0 || this.position.distanceTo(this.target) < 60) {
        this.pickNewTarget();
      }

      // 3. Vector de aceleración / dirección hacia el objetivo
      const desired = new THREE.Vector3().subVectors(this.target, this.position).normalize().multiplyScalar(this.maxSpeed);
      const steer = new THREE.Vector3().subVectors(desired, this.velocity);
      steer.clampLength(0, this.turnSpeed * this.maxSpeed);
      this.velocity.add(steer);

      // 4. Turbulencia procedural continua (viento y corrientes térmicas)
      const turbX = Math.sin(time * 1.8 + this.noiseSeedX) * 0.35;
      const turbY = Math.cos(time * 2.2 + this.noiseSeedY) * 0.45;
      const turbZ = Math.sin(time * 1.4 + this.noiseSeedZ) * 0.25;
      this.velocity.x += turbX * dt * 30;
      this.velocity.y += turbY * dt * 30;
      this.velocity.z += turbZ * dt * 30;

      // 5. Interacción sutil con el cursor del mouse (evasión ambiental)
      if (mouseWorld) {
        const distToMouse = Math.hypot(this.position.x - mouseWorld.x, this.position.y - mouseWorld.y);
        if (distToMouse < 150) {
          const repelForce = (1.0 - distToMouse / 150) * 1.8;
          const repelDir = new THREE.Vector3(
            this.position.x - mouseWorld.x,
            this.position.y - mouseWorld.y,
            (Math.random() - 0.5) * 40
          ).normalize().multiplyScalar(repelForce);
          this.velocity.add(repelDir);
        }
      }

      // Limitar velocidad
      this.velocity.clampLength(this.minSpeed, this.maxSpeed);

      // 6. Aplicar movimiento
      this.position.addScaledVector(this.velocity, dt * 60);
      this.root.position.copy(this.position);

      // 7. Orientación 3D (mirar en la dirección del vector de velocidad)
      const forwardTarget = this.position.clone().add(this.velocity);
      this.root.lookAt(forwardTarget);

      // 8. Inclinación y alabeo (Banking) orgánico en las curvas
      const lateralTurn = steer.x;
      const targetBank = -lateralTurn * 1.8;
      this.bankAngle += (targetBank - this.bankAngle) * (dt * 6.0);
      this.bodyGroup.rotation.z = Math.max(-0.85, Math.min(0.85, this.bankAngle));

      // 9. Aleteo biológico y planeo
      let flapFactor = 1.0;
      if (this.glideTimer > 0) {
        this.glideTimer -= dt;
        flapFactor = 0.15; // Mantener alas semi-extendidas en planeo
      } else {
        this.wingPhase += this.flapFreq * dt;
      }

      const flap = Math.sin(this.wingPhase) * flapFactor;
      // Desfase para propagación de onda en la articulación externa del ala
      const outerFlap = Math.sin(this.wingPhase - 0.48) * flapFactor;
      const rightFlap = Math.sin(this.wingPhase + this.asymmetry) * flapFactor;
      const rightOuterFlap = Math.sin(this.wingPhase + this.asymmetry - 0.48) * flapFactor;

      // Rotación de hombros (alas interiores)
      const maxInnerAngle = 0.72; // ~41 grados
      this.leftWingPivot.rotation.z = flap * maxInnerAngle;
      this.leftWingPivot.rotation.x = Math.cos(this.wingPhase) * 0.14 * flapFactor;

      this.rightWingPivot.rotation.z = -rightFlap * maxInnerAngle;
      this.rightWingPivot.rotation.x = Math.cos(this.wingPhase + this.asymmetry) * 0.14 * flapFactor;

      // Articulación de codos (puntas exteriores festoneadas)
      const maxOuterAngle = 0.88; // ~50 grados
      this.leftOuterPivot.rotation.z = outerFlap * maxOuterAngle;
      this.rightOuterPivot.rotation.z = -rightOuterFlap * maxOuterAngle;

      // Elevación dinámica del cuerpo (Lift aerodinámico: el cuerpo sube ligeramente al bajar las alas)
      this.bodyGroup.position.y = -flap * 1.35 * flapFactor;
      this.bodyGroup.rotation.x = Math.cos(this.wingPhase) * 0.08 * flapFactor;
    }

    dispose() {
      this.scene.remove(this.root);
      this.bodyMat.dispose();
      this.wingMat.dispose();
    }
  }

  /* ==========================================================================
     SISTEMA DE PARTÍCULAS ESPECTRALES (ASCUAS Y POLVO NOCTURNO)
     ========================================================================== */
  class SpectralParticles {
    constructor(scene, count, screenBounds) {
      this.scene = scene;
      this.count = count;
      this.screenBounds = screenBounds;

      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      this.speeds = new Float32Array(count);
      this.phases = new Float32Array(count);

      // Colores de la paleta: Naranja calabaza, Violeta místico y Oro lunar
      const palette = [
        new THREE.Color(0xff7a1a), // Naranja
        new THREE.Color(0xa855f7), // Violeta
        new THREE.Color(0xffe89c), // Oro lunar
        new THREE.Color(0xe07a5f)  // Terracota
      ];

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * screenBounds.width * 1.2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * screenBounds.height * 1.2;
        positions[i * 3 + 2] = -280 + Math.random() * 520;

        const col = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        sizes[i] = 12 + Math.random() * 20;
        this.speeds[i] = 0.25 + Math.random() * 0.75;
        this.phases[i] = Math.random() * Math.PI * 2;
      }

      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      this.material = new THREE.PointsMaterial({
        size: 16,
        vertexColors: true,
        map: createParticleTexture(),
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.points = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.points);
    }

    update(dt, time) {
      if (isReducedMotion) return;

      const positions = this.geometry.attributes.position.array;
      const b = this.screenBounds;
      const halfH = b.height * 0.65;

      for (let i = 0; i < this.count; i++) {
        const i3 = i * 3;
        // Ascenso vertical suave
        positions[i3 + 1] += this.speeds[i] * dt * 45;

        // Balanceo sinusoidal horizontal
        positions[i3 + 0] += Math.sin(time * 1.1 + this.phases[i]) * 0.45;

        // Reciclar si sale por arriba
        if (positions[i3 + 1] > halfH) {
          positions[i3 + 1] = -halfH;
          positions[i3 + 0] = (Math.random() - 0.5) * b.width * 1.2;
        }
      }
      this.geometry.attributes.position.needsUpdate = true;
    }

    dispose() {
      this.scene.remove(this.points);
      this.geometry.dispose();
      this.material.dispose();
    }
  }

  /* ==========================================================================
     ESCENA PRINCIPAL DE HALLOWEEN (THREE.JS RUNTIME)
     ========================================================================== */
  class HalloweenScene {
    constructor() {
      this.canvas = document.getElementById('halloweenCanvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'halloweenCanvas';
        this.canvas.className = 'halloween-three-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(this.canvas);
      }

      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Inicializar geometrías compartidas
      initSharedGeometries();

      // Renderer WebGL con fondo 100% transparente
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setSize(this.width, this.height);

      // Escena y Cámara de Perspectiva
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 3000);
      this.camera.position.set(0, 0, 600);
      this.camera.lookAt(0, 0, 0);

      this.calcScreenBounds();

      // Iluminación nocturna
      this.setupLights();

      // Murciélagos y partículas
      this.bats = [];
      this.particles = null;
      this.initEntities();

      // Interacción con ratón
      this.mouseWorld = null;
      this.setupMouseEvents();

      // Resize
      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize, { passive: true });

      // Loop principal
      this.lastTime = performance.now();
      this.clock = new THREE.Clock();
      this.animate = this.animate.bind(this);
      this.rafId = requestAnimationFrame(this.animate);

      // Monitoreo de FPS para rendimiento adaptativo
      this.fpsDropCount = 0;
      this.lastFpsCheck = performance.now();
      this.frameCount = 0;
    }

    calcScreenBounds() {
      const vFov = (this.camera.fov * Math.PI) / 180;
      const heightAtZero = 2 * Math.tan(vFov / 2) * this.camera.position.z;
      const widthAtZero = heightAtZero * this.camera.aspect;
      this.screenBounds = { width: widthAtZero, height: heightAtZero };
    }

    setupLights() {
      // Luz crepuscular ambiental violeta
      this.ambientLight = new THREE.AmbientLight(0x281842, 1.4);
      this.scene.add(this.ambientLight);

      // Luz direccional de luna (proyectada desde esquina superior derecha)
      this.moonLight = new THREE.DirectionalLight(0xfff6db, 1.7);
      this.moonLight.position.set(340, 320, 220);
      this.scene.add(this.moonLight);

      // Luz puntual tenue de la calabaza (cálida y parpadeante desde abajo a la derecha)
      this.pumpkinLight = new THREE.PointLight(0xff7a1a, 1.3, 850);
      this.pumpkinLight.position.set(280, -320, 160);
      this.scene.add(this.pumpkinLight);
    }

    getBatCount() {
      const w = window.innerWidth;
      if (w < 768) return 4;        // Móvil
      if (w < 1024) return 7;       // Tablet
      return 11;                    // Desktop
    }

    initEntities() {
      // Limpiar anteriores si existían
      this.bats.forEach(b => b.dispose());
      this.bats = [];
      if (this.particles) {
        this.particles.dispose();
      }

      const totalBats = this.getBatCount();
      for (let i = 0; i < totalBats; i++) {
        // Distribución equilibrada entre profundidad lejana, media y cercana
        let tier = 'mid';
        if (i % 3 === 0) tier = 'far';
        else if (i % 3 === 2) tier = 'close';

        this.bats.push(new Bat3D(this.scene, tier, this.screenBounds));
      }

      // Partículas espectrales
      const particleCount = window.innerWidth < 768 ? 45 : 85;
      this.particles = new SpectralParticles(this.scene, particleCount, this.screenBounds);
    }

    setupMouseEvents() {
      window.addEventListener('mousemove', (e) => {
        // Convertir posición de ratón a coordenadas normalizadas
        const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
        const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Proyectar al plano central Z=0
        this.mouseWorld = new THREE.Vector3(
          ndcX * (this.screenBounds.width * 0.5),
          ndcY * (this.screenBounds.height * 0.5),
          0
        );
      }, { passive: true });
    }

    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.calcScreenBounds();

      // Ajustar cantidad si hubo cambio drástico de dispositivo
      const expectedBats = this.getBatCount();
      if (this.bats.length !== expectedBats) {
        this.initEntities();
      } else {
        this.bats.forEach(b => { b.screenBounds = this.screenBounds; });
        if (this.particles) this.particles.screenBounds = this.screenBounds;
      }
    }

    animate() {
      this.rafId = requestAnimationFrame(this.animate);

      const dt = Math.min(this.clock.getDelta(), 0.08); // Limitar deltaTime para prevenir saltos
      const time = this.clock.getElapsedTime();

      // Parpadeo sutil de la luz de la calabaza
      if (this.pumpkinLight) {
        this.pumpkinLight.intensity = 1.2 + Math.sin(time * 5.2) * 0.2 + Math.cos(time * 8.7) * 0.15;
      }

      // Actualizar murciélagos 3D
      for (let i = 0; i < this.bats.length; i++) {
        this.bats[i].update(dt, time, this.mouseWorld);
      }

      // Actualizar partículas
      if (this.particles) {
        this.particles.update(dt, time);
      }

      this.renderer.render(this.scene, this.camera);

      // Monitoreo adaptativo de rendimiento
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsCheck > 2000) {
        const fps = (this.frameCount * 1000) / (now - this.lastFpsCheck);
        if (fps < 30 && this.bats.length > 4) {
          // Si cae el rendimiento sostenidamente, retirar 2 murciélagos para mantener 60 FPS
          const removed = this.bats.splice(this.bats.length - 2, 2);
          removed.forEach(b => b.dispose());
        }
        this.frameCount = 0;
        this.lastFpsCheck = now;
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
      // Eliminar telaraña previa si existe para evitar duplicados
      const existing = card.querySelector('.hw-card-cobweb');
      if (existing) existing.remove();

      // Aplicar sutilmente a solo ~25% de las tarjetas (por ejemplo índices 0, 3, 7, 11, 15...)
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
     ARRANQUE E INTEGRACIÓN
     ========================================================================== */
  function initHalloween() {
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

    // Re-aplicar tras carga de ventanas o eventos de catálogo
    window.addEventListener('load', () => {
      hookCatalogRenderers();
      setTimeout(aplicarTelaranasEnTarjetas, 100);
    });
    document.addEventListener('catalogRendered', aplicarTelaranasEnTarjetas);

    // Exponer API global de depuración / inspección
    window.Halloween = {
      scene: halloweenScene,
      _initError: initError,
      aplicarTelaranasEnTarjetas
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHalloween);
  } else {
    initHalloween();
  }
})();
