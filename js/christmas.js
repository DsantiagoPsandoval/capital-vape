/**
 * CAPITAL VAPE — EXPERIENCIA NAVIDEÑA 3D PROFESIONAL
 * Motor Three.js + WebGL + CSS3D optimizado:
 * 1. Sistema de nieve 3D multicapa (diferentes tamaños, velocidades, viento lateral y profundidad Z).
 * 2. Papá Noel 3D sorpresa volando en su trineo con renos articulados y estela mágica de partículas.
 * 3. Escenario 3D del Árbol de Navidad, Estrella de Belén 3D, Luces animadas y Regalos 3D en el Banner.
 * 4. Gestión estricta de rendimiento: lazy init no bloqueante, Visibility API, adaptación por dispositivo,
 *    prefers-reduced-motion, alternativa visual sin WebGL y cero interferencia con compras o carrito.
 */

(function () {
  'use strict';

  // Comprobar soporte WebGL de forma segura
  function isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  // Preferencia de reducción de movimiento (Accesibilidad)
  const motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  let isReducedMotion = !!motionQuery.matches;
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
    });
  }

  // Perfil de capacidad del dispositivo (PC, Portátil, Android, iPhone)
  function getDeviceProfile() {
    const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 320);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const isLowPower = cores <= 2 || memory <= 2;

    if (w < 480) {
      return {
        tier: 'mobile-compact',
        isMobile: true,
        maxDpr: 0.9,
        targetFps: 24,
        snowCounts: { far: 22, mid: 14, near: 6 },
        sparkleCount: 6
      };
    }
    if (w < 768 || isLowPower) {
      return {
        tier: 'mobile',
        isMobile: true,
        maxDpr: 1.0,
        targetFps: 28,
        snowCounts: { far: 30, mid: 18, near: 8 },
        sparkleCount: 8
      };
    }
    if (w < 1024) {
      return {
        tier: 'tablet',
        isMobile: false,
        maxDpr: 1.25,
        targetFps: 45,
        snowCounts: { far: 85, mid: 55, near: 25 },
        sparkleCount: 22
      };
    }
    return {
      tier: 'desktop',
      isMobile: false,
      maxDpr: 1.5,
      targetFps: 60,
      snowCounts: { far: 160, mid: 110, near: 50 },
      sparkleCount: 40
    };
  }

  /* ==========================================================================
     TEXTURAS PROCEDURALES CACHEADAS (COPO DE NIEVE CRISTALINO Y DESTELLO)
     ========================================================================== */
  let cachedSnowflakeTexture = null;
  let cachedSparkleTexture = null;

  function getSnowflakeTexture() {
    if (cachedSnowflakeTexture) return cachedSnowflakeTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Halo suave cristalino
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(240, 249, 255, 0.88)');
    grad.addColorStop(0.7, 'rgba(186, 230, 253, 0.32)');
    grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    // Brazos hexagonales sutiles de cristal de nieve
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x2 = 32 + Math.cos(angle) * 20;
      const y2 = 32 + Math.sin(angle) * 20;
      ctx.beginPath();
      ctx.moveTo(32, 32);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    cachedSnowflakeTexture = new THREE.CanvasTexture(canvas);
    return cachedSnowflakeTexture;
  }

  function getSparkleTexture() {
    if (cachedSparkleTexture) return cachedSparkleTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.28, 'rgba(250, 204, 21, 0.9)');
    grad.addColorStop(0.62, 'rgba(216, 27, 183, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    cachedSparkleTexture = new THREE.CanvasTexture(canvas);
    return cachedSparkleTexture;
  }

  /* ==========================================================================
     3.1 SISTEMA DE NIEVE CAYENDO 3D MULTICAPA (FONDO, PLANO MEDIO, PRIMER PLANO)
     ========================================================================== */
  class SnowfallSystem3D {
    constructor(scene, screenBounds, profile) {
      this.scene = scene;
      this.screenBounds = screenBounds || { width: 1200, height: 800 };
      this.profile = profile || getDeviceProfile();
      this.layers = [];
      this.sparkles = null;

      this.initLayers();
    }

    initLayers() {
      this.dispose();

      const counts = this.profile.snowCounts;
      const layerConfigs = [
        // Plano de fondo: copos pequeños, caída suave, gran profundidad
        {
          count: counts.far,
          size: this.profile.isMobile ? 6.5 : 8.0,
          opacity: 0.45,
          zMin: -380,
          zMax: -140,
          speedMin: 18,
          speedMax: 34,
          swayAmp: 0.38
        },
        // Plano intermedio: copos medianos, movimiento natural con brisa
        {
          count: counts.mid,
          size: this.profile.isMobile ? 10.5 : 13.0,
          opacity: 0.68,
          zMin: -130,
          zMax: 60,
          speedMin: 32,
          speedMax: 56,
          swayAmp: 0.62
        },
        // Primer plano: copos grandes y cristalinos con paralaje 3D sutil
        {
          count: counts.near,
          size: this.profile.isMobile ? 15.0 : 19.5,
          opacity: 0.58,
          zMin: 70,
          zMax: 220,
          speedMin: 48,
          speedMax: 78,
          swayAmp: 0.88
        }
      ];

      const w = Math.max(this.screenBounds.width || 0, 400);
      const h = Math.max(this.screenBounds.height || 0, 300);

      layerConfigs.forEach((cfg) => {
        const positions = new Float32Array(cfg.count * 3);
        const speeds = new Float32Array(cfg.count);
        const phases = new Float32Array(cfg.count);
        const drifts = new Float32Array(cfg.count);

        for (let i = 0; i < cfg.count; i++) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * w * 1.35;
          positions[i * 3 + 1] = (Math.random() - 0.5) * h * 1.35;
          positions[i * 3 + 2] = cfg.zMin + Math.random() * (cfg.zMax - cfg.zMin);

          speeds[i] = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
          phases[i] = Math.random() * Math.PI * 2;
          drifts[i] = (Math.random() - 0.5) * 14;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
          size: cfg.size,
          map: getSnowflakeTexture(),
          color: 0xf8fafc,
          transparent: true,
          opacity: cfg.opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geom, mat);
        this.scene.add(points);

        this.layers.push({
          cfg,
          geom,
          mat,
          points,
          speeds,
          phases,
          drifts
        });
      });

      // Pequeños destellos navideños dorados y helados flotando en el ambiente
      const spCount = this.profile.sparkleCount;
      const spPos = new Float32Array(spCount * 3);
      const spCol = new Float32Array(spCount * 3);
      const spPhases = new Float32Array(spCount);

      const palette = [
        new THREE.Color(0xfacc15), // Oro navideño
        new THREE.Color(0xbae6fd), // Azul hielo
        new THREE.Color(0xf43f5e), // Rojo carmesí
        new THREE.Color(0x34d399)  // Verde esmeralda
      ];

      for (let i = 0; i < spCount; i++) {
        spPos[i * 3 + 0] = (Math.random() - 0.5) * w * 1.2;
        spPos[i * 3 + 1] = (Math.random() - 0.5) * h * 1.2;
        spPos[i * 3 + 2] = -240 + Math.random() * 360;

        const c = palette[i % palette.length];
        spCol[i * 3 + 0] = c.r;
        spCol[i * 3 + 1] = c.g;
        spCol[i * 3 + 2] = c.b;
        spPhases[i] = Math.random() * Math.PI * 2;
      }

      const spGeom = new THREE.BufferGeometry();
      spGeom.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
      spGeom.setAttribute('color', new THREE.BufferAttribute(spCol, 3));

      const spMat = new THREE.PointsMaterial({
        size: this.profile.isMobile ? 9 : 12,
        vertexColors: true,
        map: getSparkleTexture(),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const spPoints = new THREE.Points(spGeom, spMat);
      this.scene.add(spPoints);
      this.sparkles = { geom: spGeom, mat: spMat, points: spPoints, phases: spPhases, count: spCount };
    }

    update(dt, time, windOffset = 0) {
      if (!dt || isNaN(dt) || dt <= 0) dt = 0.016;
      dt = Math.min(dt, 0.05);

      const motionFactor = isReducedMotion ? 0.3 : 1.0;
      const w = Math.max(this.screenBounds.width || 0, 400) * 1.35;
      const halfW = w * 0.5;
      const h = Math.max(this.screenBounds.height || 0, 300) * 1.35;
      const halfH = h * 0.5;

      // Viento global suave cambiante
      const globalWind = Math.sin(time * 0.35) * 10 + windOffset * 8;

      for (let l = 0; l < this.layers.length; l++) {
        const layer = this.layers[l];
        const pos = layer.geom.attributes.position.array;
        const count = layer.cfg.count;
        const swayAmp = layer.cfg.swayAmp;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          // Caída vertical continua
          pos[i3 + 1] -= layer.speeds[i] * dt * motionFactor;

          // Movimiento lateral simulando viento y turbulencia suave
          const localSway = Math.sin(time * 1.35 + layer.phases[i]) * swayAmp * 22;
          pos[i3 + 0] += (layer.drifts[i] + globalWind + localSway) * dt * motionFactor;

          // Oscilación sutil en profundidad Z
          pos[i3 + 2] += Math.cos(time * 0.9 + layer.phases[i]) * 4 * dt * motionFactor;

          // Reciclar copo al llegar abajo
          if (pos[i3 + 1] < -halfH) {
            pos[i3 + 1] = halfH;
            pos[i3 + 0] = (Math.random() - 0.5) * w;
          }
          // Envolver lateralmente
          if (pos[i3 + 0] > halfW) pos[i3 + 0] = -halfW;
          else if (pos[i3 + 0] < -halfW) pos[i3 + 0] = halfW;
        }
        layer.geom.attributes.position.needsUpdate = true;
      }

      // Actualizar destellos ambientales
      if (this.sparkles) {
        const spPos = this.sparkles.geom.attributes.position.array;
        for (let i = 0; i < this.sparkles.count; i++) {
          const i3 = i * 3;
          spPos[i3 + 1] += Math.sin(time * 1.6 + this.sparkles.phases[i]) * 6 * dt * motionFactor;
          spPos[i3 + 0] += Math.cos(time * 1.2 + this.sparkles.phases[i]) * 5 * dt * motionFactor;
        }
        this.sparkles.mat.opacity = 0.42 + 0.2 * Math.sin(time * 2.4);
        this.sparkles.geom.attributes.position.needsUpdate = true;
      }
    }

    dispose() {
      this.layers.forEach((l) => {
        if (l.points && l.points.parent) l.points.parent.remove(l.points);
        if (l.geom) l.geom.dispose();
        if (l.mat) l.mat.dispose();
      });
      this.layers = [];

      if (this.sparkles) {
        if (this.sparkles.points && this.sparkles.points.parent) {
          this.sparkles.points.parent.remove(this.sparkles.points);
        }
        if (this.sparkles.geom) this.sparkles.geom.dispose();
        if (this.sparkles.mat) this.sparkles.mat.dispose();
        this.sparkles = null;
      }
    }
  }

  /* ==========================================================================
     3.2 PAPÁ NOEL ANIMADO EN SU TRINEO 3D CON RENOS Y ESTELA MÁGICA
     - Comienza oculto al cargar la página.
     - Aparece de forma inesperada tras unos segundos.
     - Entra desde un lateral o desde la parte superior volando en su trineo.
     - Se desplaza con animación fluida 3D y desaparece progresivamente.
     - Vuelve a aparecer en intervalos aleatorios.
     ========================================================================== */
  class SantaSleigh3D {
    constructor(scene, screenBounds) {
      this.scene = scene;
      this.screenBounds = screenBounds || { width: 1200, height: 800 };

      this.root = new THREE.Group();
      this.root.visible = false;
      this.scene.add(this.root);

      this.materials = [];
      this.reindeerList = [];
      this.santaArmPivot = null;
      this.santaHeadGroup = null;
      this.sleighLight = null;

      // Estado de vuelo
      this.isFlying = false;
      this.flightTime = 0;
      this.flightDuration = 8.5;
      this.startPos = new THREE.Vector3();
      this.controlPos = new THREE.Vector3();
      this.endPos = new THREE.Vector3();

      // Temporizador para aparición sorpresa:
      // 1. La página comienza normalmente.
      // 2. Después de ~4.2 segundos aparece Papá Noel por primera vez.
      this.cooldownTimer = 4.2;

      this.buildModel();
      this.initTrailParticles();
    }

    registerMat(mat) {
      mat.transparent = true;
      mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
      this.materials.push(mat);
      return mat;
    }

    setGroupOpacity(alpha) {
      const clamped = Math.max(0, Math.min(1, alpha));
      for (let i = 0; i < this.materials.length; i++) {
        const m = this.materials[i];
        m.opacity = (m.userData.baseOpacity || 1.0) * clamped;
      }
      if (this.sleighLight) {
        this.sleighLight.intensity = 1.6 * clamped;
      }
    }

    buildModel() {
      const redVelvet = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.15 })
      );
      const darkCrimson = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5, metalness: 0.2 })
      );
      const goldMetal = this.registerMat(
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0x713f12,
          emissiveIntensity: 0.25
        })
      );
      const whiteFur = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8, metalness: 0.05 })
      );
      const skinMat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.6, metalness: 0.05 })
      );
      const blackBelt = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 })
      );
      const sackMat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75, metalness: 0.1 })
      );
      const emeraldMat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35, metalness: 0.3 })
      );
      const magentaMat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xd81bb7, roughness: 0.35, metalness: 0.4 })
      );
      const deerBrown = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.65, metalness: 0.1 })
      );
      const antlerMat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5, metalness: 0.2 })
      );
      const rudolphNoseMat = this.registerMat(
        new THREE.MeshStandardMaterial({
          color: 0xff2a2a,
          emissive: 0xff0000,
          emissiveIntensity: 1.2,
          roughness: 0.2
        })
      );

      // Grupo interno orientado hacia +X como frente de avance
      this.carriage = new THREE.Group();
      this.root.add(this.carriage);

      // 1. PATINES DORADOS DEL TRINEO (SKIS)
      const runnerGeom = new THREE.BoxGeometry(34, 1.3, 1.3);
      const curlGeom = new THREE.TorusGeometry(4.2, 0.7, 8, 16, Math.PI * 1.15);
      const strutGeom = new THREE.CylinderGeometry(0.6, 0.6, 4.5, 8);

      [-6.5, 6.5].forEach((zPos) => {
        const runner = new THREE.Mesh(runnerGeom, goldMetal);
        runner.position.set(-4, -7.5, zPos);
        this.carriage.add(runner);

        const curl = new THREE.Mesh(curlGeom, goldMetal);
        curl.position.set(13, -3.5, zPos);
        curl.rotation.z = -Math.PI * 0.45;
        this.carriage.add(curl);

        [-12, 4].forEach((xStrut) => {
          const strut = new THREE.Mesh(strutGeom, goldMetal);
          strut.position.set(xStrut, -5.2, zPos);
          this.carriage.add(strut);
        });
      });

      // 2. CARROCERÍA DEL TRINEO
      const baseBody = new THREE.Mesh(new THREE.BoxGeometry(26, 4.5, 13), redVelvet);
      baseBody.position.set(-4, -1.2, 0);
      this.carriage.add(baseBody);

      const backRest = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 13.2), darkCrimson);
      backRest.position.set(-15.5, 3.0, 0);
      backRest.rotation.z = 0.22;
      this.carriage.add(backRest);

      const frontHood = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 13.2, 12, 1, false, 0, Math.PI), redVelvet);
      frontHood.rotation.x = Math.PI / 2;
      frontHood.position.set(8.5, 0.5, 0);
      this.carriage.add(frontHood);

      // Molduras doradas laterales
      const trimGeom = new THREE.BoxGeometry(27, 0.9, 13.8);
      const goldTrim = new THREE.Mesh(trimGeom, goldMetal);
      goldTrim.position.set(-4, 1.2, 0);
      this.carriage.add(goldTrim);

      // Farol mágico delantero + Luz puntual
      const lanternMesh = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 10), goldMetal);
      lanternMesh.position.set(14.5, 2.6, 0);
      this.carriage.add(lanternMesh);

      this.sleighLight = new THREE.PointLight(0xfacc15, 1.6, 260);
      this.sleighLight.position.set(16, 4, 0);
      this.carriage.add(this.sleighLight);

      // 3. SACO DE REGALOS Y CAJAS DE REGALO 3D EN EL TRINEO
      const sack = new THREE.Mesh(new THREE.SphereGeometry(6.8, 12, 12), sackMat);
      sack.scale.set(1.15, 1.0, 0.95);
      sack.position.set(-11.5, 5.2, 0);
      this.carriage.add(sack);

      const gift1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, 4.5), emeraldMat);
      gift1.position.set(-9.5, 9.8, 2.2);
      gift1.rotation.set(0.2, 0.4, -0.15);
      this.carriage.add(gift1);

      const gift2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.8, 4.2), magentaMat);
      gift2.position.set(-12.5, 9.5, -2.0);
      gift2.rotation.set(-0.15, 0.2, 0.25);
      this.carriage.add(gift2);

      // 4. PAPÁ NOEL 3D (TRAJE ROJO, BARBA BLANCA, GORRO NAVIDEÑO Y BRAZO SALUDANDO)
      const santaGroup = new THREE.Group();
      santaGroup.position.set(-1.5, 2.2, 0);
      this.carriage.add(santaGroup);

      // Torso + Cinturón
      const torso = new THREE.Mesh(new THREE.SphereGeometry(5.2, 12, 12), redVelvet);
      torso.scale.set(0.95, 1.15, 0.95);
      torso.position.set(0, 3.8, 0);
      santaGroup.add(torso);

      const collarFur = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.95, 8, 16), whiteFur);
      collarFur.rotation.x = Math.PI / 2;
      collarFur.position.set(0, 7.6, 0);
      santaGroup.add(collarFur);

      const belt = new THREE.Mesh(new THREE.CylinderGeometry(5.05, 5.05, 1.5, 14), blackBelt);
      belt.position.set(0, 3.2, 0);
      santaGroup.add(belt);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, 2.4), goldMetal);
      buckle.position.set(4.9, 3.2, 0);
      santaGroup.add(buckle);

      // Cabeza + Barba 3D + Gorro
      this.santaHeadGroup = new THREE.Group();
      this.santaHeadGroup.position.set(0, 10.6, 0);
      santaGroup.add(this.santaHeadGroup);

      const head = new THREE.Mesh(new THREE.SphereGeometry(3.1, 12, 12), skinMat);
      this.santaHeadGroup.add(head);

      // Barba voluminosa
      const beardMain = new THREE.Mesh(new THREE.SphereGeometry(2.7, 10, 10), whiteFur);
      beardMain.scale.set(0.9, 1.25, 1.05);
      beardMain.position.set(1.7, -1.3, 0);
      this.santaHeadGroup.add(beardMain);

      // Gorro navideño
      const hatBrim = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.85, 8, 16), whiteFur);
      hatBrim.rotation.x = Math.PI / 2;
      hatBrim.position.set(0, 1.6, 0);
      this.santaHeadGroup.add(hatBrim);

      const hatCone = new THREE.Mesh(new THREE.ConeGeometry(2.9, 6.5, 12), redVelvet);
      hatCone.position.set(-0.8, 4.6, 0);
      hatCone.rotation.z = 0.35;
      this.santaHeadGroup.add(hatCone);

      const pomPom = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 10), whiteFur);
      pomPom.position.set(-2.1, 7.6, 0);
      this.santaHeadGroup.add(pomPom);

      // Brazo saludando articulado
      this.santaArmPivot = new THREE.Group();
      this.santaArmPivot.position.set(0.5, 6.8, 4.2);
      santaGroup.add(this.santaArmPivot);

      const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 5.8, 8), redVelvet);
      armMesh.position.set(0, 2.6, 0);
      this.santaArmPivot.add(armMesh);

      const cuffMesh = new THREE.Mesh(new THREE.SphereGeometry(1.35, 8, 8), whiteFur);
      cuffMesh.position.set(0, 5.4, 0);
      this.santaArmPivot.add(cuffMesh);

      // 5. DOS RENOS 3D ARTICULADOS TIRANDO DEL TRINEO + RIENDAS DORADAS
      const reindeerOffsets = [
        { x: 34, z: -4.2, isRudolph: true, phase: 0 },
        { x: 31, z: 4.2, isRudolph: false, phase: 1.6 }
      ];

      reindeerOffsets.forEach((cfg) => {
        const deerGroup = new THREE.Group();
        deerGroup.position.set(cfg.x, -1.0, cfg.z);
        this.carriage.add(deerGroup);

        // Cuerpo del reno
        const body = new THREE.Mesh(new THREE.BoxGeometry(11.5, 4.6, 3.8), deerBrown);
        deerGroup.add(body);

        // Cuello y cabeza
        const neckGroup = new THREE.Group();
        neckGroup.position.set(5.2, 2.2, 0);
        deerGroup.add(neckGroup);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 5.2, 8), deerBrown);
        neck.rotation.z = -0.35;
        neckGroup.add(neck);

        const deerHead = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.8, 2.6), deerBrown);
        deerHead.position.set(1.8, 2.8, 0);
        neckGroup.add(deerHead);

        // Nariz roja brillante de Rodolfo
        if (cfg.isRudolph) {
          const nose = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), rudolphNoseMat);
          nose.position.set(4.3, 2.9, 0);
          neckGroup.add(nose);
        }

        // Astas (Antlers)
        [-0.9, 0.9].forEach((zAnt) => {
          const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 4.2, 6), antlerMat);
          antler.position.set(0.8, 5.2, zAnt);
          antler.rotation.z = 0.25;
          antler.rotation.x = zAnt * 0.35;
          neckGroup.add(antler);
        });

        // Patas articuladas (delanteras y traseras)
        const frontLegs = new THREE.Group();
        frontLegs.position.set(4.0, -2.0, 0);
        deerGroup.add(frontLegs);
        [-1.1, 1.1].forEach((zL) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 5.2, 6), deerBrown);
          leg.position.set(0, -2.4, zL);
          frontLegs.add(leg);
        });

        const backLegs = new THREE.Group();
        backLegs.position.set(-4.2, -2.0, 0);
        deerGroup.add(backLegs);
        [-1.1, 1.1].forEach((zL) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 5.2, 6), deerBrown);
          leg.position.set(0, -2.4, zL);
          backLegs.add(leg);
        });

        this.reindeerList.push({
          group: deerGroup,
          neckGroup,
          frontLegs,
          backLegs,
          baseY: -1.0,
          phase: cfg.phase
        });
      });

      // Riendas doradas conectando trineo y renos
      const reinPoints = [
        new THREE.Vector3(10, 2.2, -3.5),
        new THREE.Vector3(34, 1.2, -4.2),
        new THREE.Vector3(10, 2.2, 3.5),
        new THREE.Vector3(31, 1.2, 4.2)
      ];
      const reinGeom = new THREE.BufferGeometry().setFromPoints(reinPoints);
      const reinMat = this.registerMat(
        new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.75 })
      );
      const reins = new THREE.LineSegments(reinGeom, reinMat);
      this.carriage.add(reins);
    }

    initTrailParticles() {
      this.trailCount = 48;
      this.trailPositions = new Float32Array(this.trailCount * 3);
      this.trailColors = new Float32Array(this.trailCount * 3);
      this.trailAges = new Float32Array(this.trailCount);
      this.trailWriteIdx = 0;
      this.trailEmitTimer = 0;

      const trailPalette = [
        new THREE.Color(0xfacc15),
        new THREE.Color(0xfffbeb),
        new THREE.Color(0xf43f5e),
        new THREE.Color(0x34d399)
      ];

      for (let i = 0; i < this.trailCount; i++) {
        this.trailPositions[i * 3 + 0] = 0;
        this.trailPositions[i * 3 + 1] = -9999;
        this.trailPositions[i * 3 + 2] = 0;
        this.trailAges[i] = 999;

        const c = trailPalette[i % trailPalette.length];
        this.trailColors[i * 3 + 0] = c.r;
        this.trailColors[i * 3 + 1] = c.g;
        this.trailColors[i * 3 + 2] = c.b;
      }

      this.trailGeom = new THREE.BufferGeometry();
      this.trailGeom.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
      this.trailGeom.setAttribute('color', new THREE.BufferAttribute(this.trailColors, 3));

      this.trailMat = new THREE.PointsMaterial({
        size: 16,
        vertexColors: true,
        map: getSparkleTexture(),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      this.trailPoints = new THREE.Points(this.trailGeom, this.trailMat);
      this.trailPoints.visible = false;
      this.scene.add(this.trailPoints);
    }

    showToastBadge(visible) {
      let badge = document.getElementById('xmasSantaIndicator');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'xmasSantaIndicator';
        badge.className = 'xmas-santa-toast-indicator';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = '<span>🎅</span> <span>¡Papá Noel está cruzando Capital Vape!</span>';
        document.body.appendChild(badge);
      }
      badge.classList.toggle('is-visible', !!visible);
    }

    startFlight() {
      const b = this.screenBounds || { width: 1200, height: 800 };
      const w = Math.max(b.width || 0, 450);
      const h = Math.max(b.height || 0, 350);

      const isMobile = window.innerWidth < 768;
      const scale = isMobile ? 1.35 : 1.85;
      this.root.scale.setScalar(scale);

      // Elegir variante de entrada: izquierda->derecha, derecha->izquierda, o diagonal superior
      const mode = Math.floor(Math.random() * 3);
      const marginX = w * 0.62;

      if (mode === 0) {
        // Entra desde lateral izquierdo hacia lateral derecho con arco superior
        this.startPos.set(-marginX, h * 0.12, 40);
        this.controlPos.set(0, h * 0.36, 135);
        this.endPos.set(marginX, h * 0.18, 20);
      } else if (mode === 1) {
        // Entra desde lateral derecho hacia lateral izquierdo
        this.startPos.set(marginX, h * 0.22, 60);
        this.controlPos.set(0, h * 0.05, 145);
        this.endPos.set(-marginX, h * 0.28, 30);
      } else {
        // Entra desde la parte superior descendiendo en curva majestuosa
        const fromLeft = Math.random() > 0.5;
        const dir = fromLeft ? 1 : -1;
        this.startPos.set(-dir * (w * 0.45), h * 0.58, -40);
        this.controlPos.set(0, h * 0.18, 150);
        this.endPos.set(dir * marginX, h * 0.08, 60);
      }

      this.isFlying = true;
      this.flightTime = 0;
      this.flightDuration = isReducedMotion ? 11.0 : 8.2;
      this.root.visible = true;
      this.trailPoints.visible = true;
      this.setGroupOpacity(0.01);
      this.showToastBadge(true);
    }

    getPointOnCurve(t, targetVec) {
      const inv = 1 - t;
      targetVec.x =
        inv * inv * this.startPos.x +
        2 * inv * t * this.controlPos.x +
        t * t * this.endPos.x;
      targetVec.y =
        inv * inv * this.startPos.y +
        2 * inv * t * this.controlPos.y +
        t * t * this.endPos.y;
      targetVec.z =
        inv * inv * this.startPos.z +
        2 * inv * t * this.controlPos.z +
        t * t * this.endPos.z;
      return targetVec;
    }

    update(dt, time) {
      if (!dt || isNaN(dt) || dt <= 0) dt = 0.016;
      dt = Math.min(dt, 0.05);

      if (!this.isFlying) {
        this.cooldownTimer -= dt;
        if (this.cooldownTimer <= 0) {
          this.startFlight();
        }
        return;
      }

      this.flightTime += dt;
      const progress = this.flightTime / this.flightDuration;

      if (progress >= 1.0) {
        // Fin del recorrido: desaparece y programa siguiente aparición aleatoria (22 a 38 seg)
        this.isFlying = false;
        this.root.visible = false;
        this.trailPoints.visible = false;
        this.showToastBadge(false);
        this.cooldownTimer = 22 + Math.random() * 16;
        return;
      }

      // Entrada y desaparición progresivas suaves (fade-in 0..14%, fade-out 84..100%)
      let alpha = 1.0;
      if (progress < 0.14) {
        alpha = progress / 0.14;
      } else if (progress > 0.84) {
        alpha = (1.0 - progress) / 0.16;
      }
      this.setGroupOpacity(alpha);

      // Posición actual y tangente en la curva 3D
      const currPos = new THREE.Vector3();
      const nextPos = new THREE.Vector3();
      this.getPointOnCurve(progress, currPos);
      this.getPointOnCurve(Math.min(1.0, progress + 0.015), nextPos);

      // Ondulación suave de vuelo mágico
      currPos.y += Math.sin(time * 4.2) * 3.5;
      this.root.position.copy(currPos);

      // Orientar el trineo hacia la dirección de avance
      const tangent = new THREE.Vector3().subVectors(nextPos, currPos).normalize();
      const yaw = Math.atan2(-tangent.z, tangent.x);
      const pitch = Math.asin(Math.max(-0.6, Math.min(0.6, tangent.y)));
      this.carriage.rotation.set(0, yaw, pitch + Math.sin(time * 3.5) * 0.05);

      // Animación del brazo de Papá Noel saludando y movimiento de cabeza
      if (this.santaArmPivot) {
        this.santaArmPivot.rotation.z = 0.65 + Math.sin(time * 9.0) * 0.45;
        this.santaArmPivot.rotation.x = 0.35;
      }
      if (this.santaHeadGroup) {
        this.santaHeadGroup.rotation.y = Math.sin(time * 2.8) * 0.25;
      }

      // Animación de galope de los renos
      for (let i = 0; i < this.reindeerList.length; i++) {
        const r = this.reindeerList[i];
        const gal = time * 11.5 + r.phase;
        r.group.position.y = r.baseY + Math.sin(gal) * 1.6;
        r.group.rotation.z = Math.cos(gal) * 0.12;
        r.frontLegs.rotation.z = Math.sin(gal) * 0.65;
        r.backLegs.rotation.z = -Math.sin(gal) * 0.65;
        r.neckGroup.rotation.z = Math.sin(gal) * 0.08;
      }

      // Emitir y actualizar partículas de la estela mágica
      this.trailEmitTimer += dt;
      if (this.trailEmitTimer >= 0.035) {
        this.trailEmitTimer = 0;
        const idx3 = this.trailWriteIdx * 3;
        this.trailPositions[idx3 + 0] = currPos.x + (Math.random() - 0.5) * 10;
        this.trailPositions[idx3 + 1] = currPos.y + (Math.random() - 0.5) * 8;
        this.trailPositions[idx3 + 2] = currPos.z + (Math.random() - 0.5) * 8;
        this.trailAges[this.trailWriteIdx] = 0;
        this.trailWriteIdx = (this.trailWriteIdx + 1) % this.trailCount;
      }

      for (let i = 0; i < this.trailCount; i++) {
        if (this.trailAges[i] < 10) {
          this.trailAges[i] += dt;
          this.trailPositions[i * 3 + 1] -= 14 * dt;
          if (this.trailAges[i] > 1.3) {
            this.trailPositions[i * 3 + 1] = -9999;
            this.trailAges[i] = 999;
          }
        }
      }
      this.trailGeom.attributes.position.needsUpdate = true;
      this.trailMat.opacity = 0.85 * alpha;
    }

    dispose() {
      this.showToastBadge(false);
      if (this.root && this.root.parent) this.root.parent.remove(this.root);
      if (this.trailPoints && this.trailPoints.parent) {
        this.trailPoints.parent.remove(this.trailPoints);
      }
      if (this.trailGeom) this.trailGeom.dispose();
      if (this.trailMat) this.trailMat.dispose();
      this.materials.forEach((m) => m.dispose());
    }
  }

  /* ==========================================================================
     3.3 & 3.4 ESCENARIO 3D DEL BANNER NAVIDEÑO:
     Árbol de Navidad 3D + Estrella Brillante + Luces Animadas + Regalos 3D
     ========================================================================== */
  class ChristmasTreeStage3D {
    constructor(canvasEl) {
      this.canvas = canvasEl;
      if (!this.canvas) return;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
      this.camera.position.set(0, 6.5, 36);
      this.camera.lookAt(0, 4.2, 0);

      this.treeRoot = new THREE.Group();
      this.treeRoot.position.set(0, -5.8, 0);
      this.scene.add(this.treeRoot);

      this.starMesh = null;
      this.garlandPoints = null;
      this.garlandColors = null;
      this.gifts = [];
      this.targetRotY = 0;
      this.isDragging = false;
      this.prevX = 0;

      this.setupLights();
      this.buildTreeAndGifts();
      this.bindInteraction();
      this.resize();
    }

    setupLights() {
      const ambient = new THREE.AmbientLight(0x3b1d5e, 1.5);
      this.scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
      keyLight.position.set(18, 28, 22);
      this.scene.add(keyLight);

      const warmPoint = new THREE.PointLight(0xfacc15, 1.6, 55);
      warmPoint.position.set(0, 16, 6);
      this.scene.add(warmPoint);
      this.warmPoint = warmPoint;

      const rimLight = new THREE.PointLight(0xd81bb7, 1.25, 45);
      rimLight.position.set(-14, 8, -10);
      this.scene.add(rimLight);
    }

    buildTreeAndGifts() {
      // 1. Base de nieve acumulada 3D
      const snowMoundGeom = new THREE.CylinderGeometry(8.8, 10.2, 1.6, 24);
      const snowMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.75,
        metalness: 0.08
      });
      const snowMound = new THREE.Mesh(snowMoundGeom, snowMat);
      snowMound.position.y = 0.6;
      this.treeRoot.add(snowMound);

      // 2. Tronco del árbol
      const trunkGeom = new THREE.CylinderGeometry(1.3, 1.7, 4.2, 12);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 2.4;
      this.treeRoot.add(trunk);

      // 3. Capas cónicas del pino 3D con bordes de nieve acumulada
      const pineMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.55,
        metalness: 0.15,
        flatShading: true
      });
      const snowCapMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.65,
        metalness: 0.1
      });

      const tiers = [
        { radius: 7.4, height: 5.8, y: 5.5 },
        { radius: 6.1, height: 5.2, y: 8.6 },
        { radius: 4.8, height: 4.6, y: 11.4 },
        { radius: 3.4, height: 4.0, y: 13.9 },
        { radius: 2.0, height: 3.2, y: 16.0 }
      ];

      tiers.forEach((t) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.radius, t.height, 11), pineMat);
        cone.position.y = t.y;
        this.treeRoot.add(cone);

        // Detalle de nieve acumulada en la falda de cada nivel de ramas
        const snowRing = new THREE.Mesh(
          new THREE.TorusGeometry(t.radius * 0.92, 0.28, 7, 18),
          snowCapMat
        );
        snowRing.rotation.x = Math.PI / 2;
        snowRing.position.y = t.y - t.height * 0.46;
        this.treeRoot.add(snowRing);
      });

      // 4. Esferas navideñas 3D metálicas (Oro, Carmesí, Magenta, Azul Hielo)
      const ornamentMats = [
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.18 }),
        new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.78, roughness: 0.22 }),
        new THREE.MeshStandardMaterial({ color: 0xd81bb7, metalness: 0.82, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.22 })
      ];
      const baubleGeom = new THREE.SphereGeometry(0.56, 12, 12);

      const numOrnaments = 22;
      for (let i = 0; i < numOrnaments; i++) {
        const frac = i / numOrnaments;
        const y = 3.6 + frac * 11.8;
        const maxR = 6.9 * (1 - frac * 0.76);
        const angle = i * 2.35;

        const bauble = new THREE.Mesh(baubleGeom, ornamentMats[i % ornamentMats.length]);
        bauble.position.set(Math.cos(angle) * maxR, y, Math.sin(angle) * maxR);
        this.treeRoot.add(bauble);
      }

      // 5. Guirnalda espiral de luces navideñas animadas en 3D
      const lightCount = 46;
      const lPos = new Float32Array(lightCount * 3);
      const lCol = new Float32Array(lightCount * 3);
      this.lightBaseColors = [];

      const lightPalette = [
        new THREE.Color(0xfef08a),
        new THREE.Color(0xf43f5e),
        new THREE.Color(0x34d399),
        new THREE.Color(0xe879f9)
      ];

      for (let i = 0; i < lightCount; i++) {
        const t = i / (lightCount - 1);
        const y = 3.2 + t * 13.4;
        const r = (7.2 * (1 - t * 0.82)) + 0.25;
        const angle = t * Math.PI * 9.5;

        lPos[i * 3 + 0] = Math.cos(angle) * r;
        lPos[i * 3 + 1] = y;
        lPos[i * 3 + 2] = Math.sin(angle) * r;

        const c = lightPalette[i % lightPalette.length];
        this.lightBaseColors.push(c);
        lCol[i * 3 + 0] = c.r;
        lCol[i * 3 + 1] = c.g;
        lCol[i * 3 + 2] = c.b;
      }

      const lGeom = new THREE.BufferGeometry();
      lGeom.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
      lGeom.setAttribute('color', new THREE.BufferAttribute(lCol, 3));

      const lMat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        map: getSparkleTexture(),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      this.garlandPoints = new THREE.Points(lGeom, lMat);
      this.treeRoot.add(this.garlandPoints);

      // 6. Estrella brillante 3D en la cúspide
      this.starGroup = new THREE.Group();
      this.starGroup.position.y = 18.2;
      this.treeRoot.add(this.starGroup);

      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfacc15,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.15
      });

      const oct1 = new THREE.Mesh(new THREE.OctahedronGeometry(1.55, 0), starMat);
      oct1.scale.set(1, 1.3, 0.45);
      this.starGroup.add(oct1);

      const oct2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.45, 0), starMat);
      oct2.scale.set(1.3, 1, 0.45);
      oct2.rotation.z = Math.PI / 4;
      this.starGroup.add(oct2);

      // 7. Regalos navideños 3D con cintas alrededor del árbol
      const giftConfigs = [
        { x: -4.6, z: 4.5, w: 2.7, h: 2.4, d: 2.7, box: 0xe11d48, rib: 0xfacc15, rot: 0.35 },
        { x: 4.5, z: 4.2, w: 2.4, h: 2.8, d: 2.4, box: 0x7e22ce, rib: 0xfacc15, rot: -0.4 },
        { x: 0.4, z: 6.1, w: 3.0, h: 2.0, d: 2.3, box: 0x059669, rib: 0xf8fafc, rot: 0.12 },
        { x: -5.8, z: -1.8, w: 2.5, h: 2.5, d: 2.5, box: 0xfacc15, rib: 0xe11d48, rot: 0.65 },
        { x: 5.6, z: -2.2, w: 2.6, h: 2.2, d: 2.6, box: 0xd81bb7, rib: 0xfffbeb, rot: -0.55 }
      ];

      giftConfigs.forEach((g) => {
        const gGroup = new THREE.Group();
        gGroup.position.set(g.x, 1.4 + g.h * 0.5, g.z);
        gGroup.rotation.y = g.rot;

        const boxMat = new THREE.MeshStandardMaterial({
          color: g.box,
          roughness: 0.35,
          metalness: 0.25
        });
        const ribMat = new THREE.MeshStandardMaterial({
          color: g.rib,
          roughness: 0.25,
          metalness: 0.75
        });

        const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(g.w, g.h, g.d), boxMat);
        gGroup.add(boxMesh);

        // Cintas cruzadas 3D
        const rib1 = new THREE.Mesh(
          new THREE.BoxGeometry(g.w + 0.12, g.h + 0.12, g.d * 0.18),
          ribMat
        );
        gGroup.add(rib1);

        const rib2 = new THREE.Mesh(
          new THREE.BoxGeometry(g.w * 0.18, g.h + 0.12, g.d + 0.12),
          ribMat
        );
        gGroup.add(rib2);

        // Moño superior
        const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(0.38, 0.11, 24, 6), ribMat);
        bow.position.y = g.h * 0.5 + 0.25;
        gGroup.add(bow);

        this.treeRoot.add(gGroup);
        this.gifts.push({ group: gGroup, baseY: gGroup.position.y, phase: Math.random() * 6 });
      });
    }

    bindInteraction() {
      this.canvas.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.prevX = e.clientX;
      });

      window.addEventListener(
        'pointermove',
        (e) => {
          if (!this.isDragging) return;
          const dx = e.clientX - this.prevX;
          this.prevX = e.clientX;
          this.targetRotY += dx * 0.012;
        },
        { passive: true }
      );

      window.addEventListener(
        'pointerup',
        () => {
          this.isDragging = false;
        },
        { passive: true }
      );
    }

    resize() {
      if (!this.canvas || !this.renderer) return;
      const rect = this.canvas.parentElement
        ? this.canvas.parentElement.getBoundingClientRect()
        : { width: 360, height: 260 };
      const w = Math.max(rect.width || 320, 200);
      const h = Math.max(rect.height || 230, 180);

      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(w, h, false);
    }

    update(dt, time) {
      if (!this.renderer) return;
      const rotSpeed = isReducedMotion ? 0.15 : 0.45;
      if (!this.isDragging) {
        this.targetRotY += dt * rotSpeed;
      }
      this.treeRoot.rotation.y += (this.targetRotY - this.treeRoot.rotation.y) * 0.1;

      if (this.starGroup) {
        this.starGroup.rotation.y = time * 1.4;
        const starScale = 1.0 + Math.sin(time * 3.5) * 0.08;
        this.starGroup.scale.setScalar(starScale);
      }

      if (this.warmPoint) {
        this.warmPoint.intensity = 1.45 + Math.sin(time * 4.0) * 0.3;
      }

      // Parpadeo vivo de la guirnalda de luces 3D
      if (this.garlandPoints) {
        const colArr = this.garlandPoints.geometry.attributes.color.array;
        for (let i = 0; i < this.lightBaseColors.length; i++) {
          const base = this.lightBaseColors[i];
          const pulse = 0.55 + 0.45 * Math.sin(time * 4.2 + i * 0.7);
          colArr[i * 3 + 0] = base.r * pulse;
          colArr[i * 3 + 1] = base.g * pulse;
          colArr[i * 3 + 2] = base.b * pulse;
        }
        this.garlandPoints.geometry.attributes.color.needsUpdate = true;
      }

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      if (this.renderer) this.renderer.dispose();
    }
  }

  /* ==========================================================================
     CONTROLADOR PRINCIPAL DE LA EXPERIENCIA NAVIDEÑA 3D
     ========================================================================== */
  class ChristmasExperienceController {
    constructor() {
      if (window.__CHRISTMAS_INSTANCE__) {
        try {
          window.__CHRISTMAS_INSTANCE__.dispose();
        } catch (e) {}
      }
      window.__CHRISTMAS_INSTANCE__ = this;

      this.profile = getDeviceProfile();
      this.canvas = document.getElementById('christmasCanvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'christmasCanvas';
        this.canvas.className = 'christmas-three-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(this.canvas);
      }

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: !this.profile.isMobile,
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, 1, 1, 2500);
      this.camera.position.set(0, 0, 600);
      this.camera.lookAt(0, 0, 0);

      this.updateDimensions();
      this.setupLights();

      // Sistemas 3D principales
      this.snowSystem = new SnowfallSystem3D(this.scene, this.screenBounds, this.profile);
      this.santaSleigh = new SantaSleigh3D(this.scene, this.screenBounds);

      // Escenario 3D del Árbol de Navidad en el Banner
      const treeCanvas = document.getElementById('christmasTreeCanvas');
      this.treeStage = treeCanvas ? new ChristmasTreeStage3D(treeCanvas) : null;
      this.treeStageVisible = true;
      if (treeCanvas && 'IntersectionObserver' in window) {
        this.treeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.treeStageVisible = entry.isIntersecting;
          });
        }, { threshold: 0.05 });
        this.treeObserver.observe(treeCanvas);
      }

      this.windOffset = 0;
      this.setupEvents();

      this.clock = new THREE.Clock(true);
      this.isRunning = false;
      this.rafId = null;
      this.lastFrameTime = performance.now();
      this.lastRenderStamp = 0;
      this.animate = this.animate.bind(this);

      this.startLoop();
    }

    setupLights() {
      const ambient = new THREE.AmbientLight(0x3b235a, 1.55);
      this.scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
      dirLight.position.set(260, 340, 280);
      this.scene.add(dirLight);
    }

    updateDimensions() {
      const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 320);
      const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 320);
      this.width = w;
      this.height = h;
      this.profile = getDeviceProfile();

      if (this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }

      const dpr = Math.min(window.devicePixelRatio || 1, this.profile.maxDpr);
      if (this.renderer) {
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h, false);
      }

      const vFov = (this.camera.fov * Math.PI) / 180;
      const heightAtZero = 2 * Math.tan(vFov / 2) * this.camera.position.z;
      const widthAtZero = heightAtZero * (this.camera.aspect || 1);
      this.screenBounds = {
        width: Math.max(widthAtZero, 400),
        height: Math.max(heightAtZero, 300)
      };
    }

    setupEvents() {
      this.onResize = () => {
        const prevTier = this.profile.tier;
        this.updateDimensions();
        if (this.snowSystem) {
          this.snowSystem.screenBounds = this.screenBounds;
          if (this.profile.tier !== prevTier) {
            this.snowSystem.profile = this.profile;
            this.snowSystem.initLayers();
          }
        }
        if (this.santaSleigh) {
          this.santaSleigh.screenBounds = this.screenBounds;
        }
        if (this.treeStage) {
          this.treeStage.resize();
        }
      };

      window.addEventListener('resize', this.onResize, { passive: true });

      // Movimiento lateral sutil con el puntero + efecto CSS3D en el banner
      const bannerCard = document.getElementById('christmasBannerCard');
      window.addEventListener(
        'mousemove',
        (e) => {
          const normX = (e.clientX / (this.width || window.innerWidth)) * 2 - 1;
          const normY = (e.clientY / (this.height || window.innerHeight)) * 2 - 1;
          this.windOffset = normX;

          if (bannerCard && !this.profile.isMobile && !isReducedMotion) {
            const rect = bannerCard.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              bannerCard.style.transform = `rotateY(${(normX * 2.2).toFixed(2)}deg) rotateX(${(-normY * 1.8).toFixed(2)}deg)`;
            }
          }
        },
        { passive: true }
      );

      // Pausar animaciones cuando la pestaña no esté visible (Requisito 4)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopLoop();
        } else {
          this.lastFrameTime = performance.now();
          this.startLoop();
        }
      });
    }

    triggerSanta() {
      if (this.santaSleigh) {
        this.santaSleigh.startFlight();
      }
    }

    startLoop() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      if (this.clock && !this.clock.running) {
        this.clock.start();
      }
      if (this.rafId) cancelAnimationFrame(this.rafId);
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

      const now = currentTime || performance.now();
      const targetFps = (this.profile && this.profile.targetFps) || 60;
      const minInterval = 1000 / targetFps;
      if (targetFps < 60 && (now - (this.lastRenderStamp || 0)) < minInterval) {
        return;
      }
      this.lastRenderStamp = now;

      // Pausar renderizado WebGL cuando el usuario tiene abierto el carrito, checkout o modal en móvil
      const cartEl = document.getElementById('cartDrawer');
      const checkoutEl = document.getElementById('checkoutModal');
      const flavorEl = document.getElementById('flavorModal');
      const isModalOpen = (cartEl && cartEl.classList.contains('open')) ||
                          (checkoutEl && checkoutEl.classList.contains('open')) ||
                          (flavorEl && flavorEl.style.display === 'flex');
      if (isModalOpen) {
        this.lastFrameTime = now;
        this.clock.getDelta();
        return;
      }

      let dt = this.clock.getDelta();
      if (!dt || isNaN(dt) || dt <= 0 || dt > 0.2) {
        const rawDelta = (now - (this.lastFrameTime || now)) / 1000;
        dt = rawDelta > 0.001 && rawDelta < 0.1 ? rawDelta : 0.016;
      }
      this.lastFrameTime = now;
      const time = this.clock.getElapsedTime();

      if (this.snowSystem) {
        this.snowSystem.update(dt, time, this.windOffset);
      }

      if (this.santaSleigh) {
        this.santaSleigh.update(dt, time);
      }

      if (this.treeStage && this.treeStageVisible) {
        this.treeStage.update(dt, time);
      }

      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.stopLoop();
      if (this.onResize) window.removeEventListener('resize', this.onResize);
      if (this.snowSystem) this.snowSystem.dispose();
      if (this.santaSleigh) this.santaSleigh.dispose();
      if (this.treeStage) this.treeStage.dispose();
      if (this.renderer) this.renderer.dispose();
    }
  }

  /* ==========================================================================
     DETALLES DE NIEVE ACUMULADA EN ELEMENTOS DECORATIVOS Y TARJETAS
     ========================================================================== */
  const SNOW_CAP_SVG = `
    <svg viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 0 H72 C76.4 0 80 3.6 80 8 V12 C74 14 68 9 60 11 C51 13 46 19 36 16 C27 13 22 8 13 11 C6 13 2 9 0 5 V0 H8 Z" fill="rgba(248, 250, 252, 0.85)"/>
    </svg>
  `;

  function applyFestiveSnowCapsToCards() {
    if (window.innerWidth && window.innerWidth < 768) return;
    const cards = document.querySelectorAll('.product-card');
    if (!cards || cards.length === 0) return;

    cards.forEach((card, index) => {
      const existing = card.querySelector('.xmas-card-snow-cap');
      if (existing) existing.remove();

      // Aplicar nieve acumulada en las 3 primeras referencias nuevas y en 1 de cada 4 tarjetas
      if (index < 3 || index % 4 === 0) {
        const cap = document.createElement('div');
        cap.className = 'xmas-card-snow-cap';
        cap.setAttribute('aria-hidden', 'true');
        cap.innerHTML = SNOW_CAP_SVG;
        card.appendChild(cap);
      }
    });
  }

  /* ==========================================================================
     INICIALIZACIÓN NO BLOQUEANTE (LAZY / IDLE INIT)
     ========================================================================== */
  function initChristmasExperience() {
    if (window.ChristmasExperience && window.ChristmasExperience.instance) {
      return;
    }

    let instance = null;
    if (isWebGLSupported() && typeof THREE !== 'undefined') {
      try {
        instance = new ChristmasExperienceController();
        document.body.classList.remove('no-webgl');
      } catch (err) {
        document.body.classList.add('no-webgl');
        console.warn('[Christmas3D] Fallback activado:', err);
      }
    } else {
      document.body.classList.add('no-webgl');
    }

    applyFestiveSnowCapsToCards();

    // Observar cambios en la grilla del catálogo para mantener los detalles de nieve
    const grids = document.querySelectorAll('.products-grid');
    if (grids.length > 0 && window.MutationObserver) {
      let debounce = null;
      const obs = new MutationObserver(() => {
        clearTimeout(debounce);
        debounce = setTimeout(applyFestiveSnowCapsToCards, 120);
      });
      grids.forEach((g) => obs.observe(g, { childList: true }));
    }

    window.ChristmasExperience = {
      instance,
      triggerSanta() {
        if (instance) instance.triggerSanta();
      },
      applyFestiveSnowCapsToCards
    };
  }

  function scheduleNonBlockingBoot() {
    // No bloquear el renderizado inicial del catálogo ni del carrito
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initChristmasExperience(), { timeout: 600 });
    } else {
      setTimeout(initChristmasExperience, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleNonBlockingBoot, { once: true });
  } else {
    scheduleNonBlockingBoot();
  }
})();
