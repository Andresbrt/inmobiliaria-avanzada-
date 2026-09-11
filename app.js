/**
 * ============================================================================
 * CORALES DEL VIENTO - EXPERIENCIA DIGITAL 3D V3.0
 * GRUPO AAA S.A.S | Arquitectura WebGL & Lógica Interactiva
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. UTILIDADES & HELPERS
  // --------------------------------------------------------------------------
  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(num);
  };

  const showToast = (message) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // --------------------------------------------------------------------------
  // 2. SCROLL PROGRESS BAR & STICKY HEADER
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scrollProgressBar');
  const siteHeader = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
      progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    }

    if (siteHeader) {
      if (scrollTop > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // ScrollSpy para los enlaces principales de la inmobiliaria
    const sections = ['hero', 'proyectos', 'galeria-3d', 'servicios', 'financiamiento', 'nosotros'];
    const navLinks = document.querySelectorAll('.nav-desktop .nav-link');
    let currentSec = 'hero';

    sections.forEach(secId => {
      const secEl = document.getElementById(secId);
      if (secEl) {
        const top = secEl.offsetTop - 140;
        if (scrollTop >= top) {
          currentSec = secId;
        }
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSec}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });

  // Filtro Dinámico de Portafolio de Proyectos
  const portTabs = document.querySelectorAll('.port-tab');
  const projectCards = document.querySelectorAll('.project-portfolio-card');

  portTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      portTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-cat') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Menú Móvil
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileDrawer.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. STATS ANIMADOS (CONTADORES NUMÉRICOS)
  // --------------------------------------------------------------------------
  const animateCounter = (el, target, duration = 2000) => {
    let start = 0;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start);
      }
    }, stepTime);
  };

  let statsAnimated = false;
  const initStatsObserver = () => {
    const statsStrip = document.querySelector('.hero-stats-strip');
    if (!statsStrip) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          document.querySelectorAll('.stat-number').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
            animateCounter(stat, target, 1800);
          });
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsStrip);
  };
  initStatsObserver();

  // --------------------------------------------------------------------------
  // 4. 1️⃣ HERO 3D CINEMATIC (Three.js Procedural Ocean + Particles + Dynamic Lighting)
  // --------------------------------------------------------------------------
  const initHero3D = () => {
    const canvas = document.getElementById('heroCanvas');
    const container = document.getElementById('heroCanvasContainer');
    if (!canvas || !container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a131f, 0.0035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    camera.position.set(0, 25, 70);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0x0052A3, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFACD, 1.8);
    dirLight.position.set(40, 80, 50);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x0099FF, 1.0);
    rimLight.position.set(-40, 30, -50);
    scene.add(rimLight);

    // Océano Procedural con Desplazamiento de Vértices
    const geometry = new THREE.PlaneGeometry(320, 320, 70, 70);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    const basePositions = posAttr.array.slice();

    const oceanMaterial = new THREE.MeshStandardMaterial({
      color: 0x004080,
      roughness: 0.15,
      metalness: 0.65,
      flatShading: true,
      wireframe: false
    });

    const oceanMesh = new THREE.Mesh(geometry, oceanMaterial);
    oceanMesh.position.y = -10;
    scene.add(oceanMesh);

    // Partículas marinas flotantes (Sea Spray & Star Dust)
    const particlesCount = 350;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 200;
      particlePositions[i + 1] = Math.random() * 60 - 5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0xD4AF8F,
      size: 1.4,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Parallax del Ratón
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 25;

    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) * 0.015;
      mouseY = (e.clientY - halfH) * 0.015;
    }, { passive: true });

    // Scroll Zoom Interactivo
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 800) {
        camera.position.z = 70 - scrollY * 0.035;
      }
    }, { passive: true });

    // Bucle de Animación
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Deformación de olas sinusoidales
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const x = basePositions[i * 3];
        const z = basePositions[i * 3 + 2];
        const u = 0.05 * x + elapsedTime * 1.4;
        const v = 0.05 * z + elapsedTime * 1.1;
        const y = Math.sin(u) * 2.2 + Math.cos(v) * 1.8 + Math.sin(u * 0.5 + v * 0.5) * 1.2;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Rotación de partículas
      particleSystem.rotation.y = elapsedTime * 0.03;

      // Parallax suavizado
      targetCameraX = mouseX;
      targetCameraY = 25 - mouseY;
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -20);

      renderer.render(scene, camera);
    };
    animate();

    // Redimensionamiento
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Selector de Hora del Día (Amanecer / Mediodía / Noche)
    window.setHeroLighting = (mode) => {
      if (mode === 'sunset') {
        dirLight.color.setHex(0xFF6B4A);
        dirLight.intensity = 2.0;
        ambientLight.color.setHex(0xD4AF8F);
        oceanMaterial.color.setHex(0x662d35);
        scene.fog.color.setHex(0x2a1420);
        particlesMat.color.setHex(0xFFD700);
      } else if (mode === 'night') {
        dirLight.color.setHex(0x88AAFF);
        dirLight.intensity = 1.0;
        ambientLight.color.setHex(0x06111C);
        oceanMaterial.color.setHex(0x06182B);
        scene.fog.color.setHex(0x040910);
        particlesMat.color.setHex(0x60A5FA);
      } else { // Day
        dirLight.color.setHex(0xFFFACD);
        dirLight.intensity = 1.8;
        ambientLight.color.setHex(0x0052A3);
        oceanMaterial.color.setHex(0x004080);
        scene.fog.color.setHex(0x0a131f);
        particlesMat.color.setHex(0xD4AF8F);
      }
    };
  };
  initHero3D();

  // Botones de Modo Hora (Amanecer, Día, Noche)
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const timeMode = btn.getAttribute('data-time');
      if (window.setHeroLighting) {
        window.setHeroLighting(timeMode);
      }
    });
  });

  // Switch 3D Procedural vs Video Dron 4K
  const btnMode3D = document.getElementById('btnMode3D');
  const btnModeVideo = document.getElementById('btnModeVideo');
  const heroCanvasContainer = document.getElementById('heroCanvasContainer');
  const heroVideoContainer = document.getElementById('heroVideoContainer');
  const heroVideo = document.getElementById('heroVideo');

  if (btnMode3D && btnModeVideo && heroCanvasContainer && heroVideoContainer) {
    // Autoplay para el nuevo video del encabezado
    if (heroVideo && heroVideoContainer.classList.contains('active')) {
      heroVideo.play().catch(() => {});
    }

    btnMode3D.addEventListener('click', () => {
      btnMode3D.classList.add('active');
      btnModeVideo.classList.remove('active');
      heroCanvasContainer.style.opacity = '1';
      heroVideoContainer.classList.remove('active');
      if (heroVideo) heroVideo.pause();
    });

    btnModeVideo.addEventListener('click', () => {
      btnModeVideo.classList.add('active');
      btnMode3D.classList.remove('active');
      heroCanvasContainer.style.opacity = '0';
      heroVideoContainer.classList.add('active');
      if (heroVideo) {
        heroVideo.play().catch(() => {});
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. 3️⃣ GALERÍA INTERACTIVA 3D DEL PROYECTO (Master Plan Three.js + OrbitControls)
  // --------------------------------------------------------------------------
  const initMasterPlan3D = () => {
    const canvas = document.getElementById('masterPlanCanvas');
    const container = document.getElementById('masterPlanCanvasContainer');
    const loader = document.getElementById('viewerLoader');
    const tooltip = document.getElementById('lot3dTooltip');
    const tooltipTitle = document.getElementById('tooltipTitle');
    const tooltipDesc = document.getElementById('tooltipDesc');

    if (!canvas || !container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1524);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.5,
      500
    );
    camera.position.set(0, 65, 80);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // OrbitControls
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minDistance = 20;
      controls.maxDistance = 160;
      controls.target.set(0, 0, 0);
    }

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5db, 1.4);
    sunLight.position.set(50, 90, 40);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Terreno Base Costero
    const terrainGeo = new THREE.BoxGeometry(100, 3, 90);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1B4332,
      roughness: 0.8
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = -1.5;
    scene.add(terrain);

    // Playa Arenosa Frente al Mar (Sector Norte)
    const beachGeo = new THREE.BoxGeometry(100, 3.05, 18);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF8F,
      roughness: 0.9
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.position.set(0, -1.45, -36);
    scene.add(beach);

    // Franja de Mar Caribe
    const seaGeo = new THREE.PlaneGeometry(120, 40);
    seaGeo.rotateX(-Math.PI / 2);
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x0077B6,
      roughness: 0.1,
      metalness: 0.5
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.position.set(0, 0.1, -55);
    scene.add(sea);

    // Vías Principales
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const mainRoadGeo = new THREE.BoxGeometry(6, 0.2, 70);
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.position.set(0, 0.1, 5);
    scene.add(mainRoad);

    const crossRoadGeo = new THREE.BoxGeometry(80, 0.2, 5);
    const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat);
    crossRoad.position.set(0, 0.1, -10);
    scene.add(crossRoad);

    // Lotes 3D Parcelados con Pines Interactivos
    const lotsGroup = new THREE.Group();
    scene.add(lotsGroup);

    const lotMeshList = [];
    const lotData3D = [
      { id: 'lote-01', title: 'Lote 01 · Primera Línea de Mar', area: '520 m²', price: '$125.000.000 COP', dist: '150m', status: 'Disponible', x: -28, z: -25, color: 0x22C55E },
      { id: 'lote-04', title: 'Lote 04 · Esquina Costera', area: '600 m²', price: '$140.000.000 COP', dist: '160m', status: 'Disponible', x: -14, z: -25, color: 0x22C55E },
      { id: 'lote-07', title: 'Lote 07 · Acceso Directo Playa', area: '450 m²', price: '$98.000.000 COP', dist: '150m', status: 'Disponible', x: 14, z: -25, color: 0x22C55E },
      { id: 'lote-12', title: 'Lote 12 · Sector Costa Dorada', area: '480 m²', price: '$98.000.000 COP', dist: '170m', status: 'Disponible', x: 28, z: -25, color: 0x22C55E },
      { id: 'lote-15', title: 'Lote 15 · Frente a Zonas Verdes', area: '700 m²', price: '$135.000.000 COP', dist: '220m', status: 'Reservado', x: -28, z: 0, color: 0xEAB308 },
      { id: 'lote-18', title: 'Lote 18 · Parcela Familiar', area: '550 m²', price: '$105.000.000 COP', dist: '230m', status: 'Disponible', x: -14, z: 0, color: 0x22C55E },
      { id: 'lote-22', title: 'Lote 22 · Cerca Club House', area: '450 m²', price: '$95.000.000 COP', dist: '250m', status: 'Disponible', x: 14, z: 0, color: 0x22C55E },
      { id: 'lote-28', title: 'Lote 28 · Sector Campestre', area: '850 m²', price: '$160.000.000 COP', dist: '300m', status: 'Disponible', x: 28, z: 0, color: 0x22C55E },
      { id: 'lote-31', title: 'Lote 31 · Mirador de Palmeras', area: '500 m²', price: '$92.000.000 COP', dist: '320m', status: 'Disponible', x: -20, z: 25, color: 0x22C55E },
      { id: 'lote-35', title: 'Lote 35 · Gran Parcela', area: '1000 m²', price: '$195.000.000 COP', dist: '350m', status: 'Disponible', x: 20, z: 25, color: 0x22C55E }
    ];

    lotData3D.forEach((item) => {
      // Parcela delimitada
      const parcelGeo = new THREE.BoxGeometry(11, 0.4, 18);
      const parcelMat = new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.6,
        transparent: true,
        opacity: 0.85
      });
      const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
      parcelMesh.position.set(item.x, 0.2, item.z);
      parcelMesh.userData = item;
      lotsGroup.add(parcelMesh);
      lotMeshList.push(parcelMesh);

      // Pin Flotante 3D
      const pinStemGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.5, 8);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      const pinStem = new THREE.Mesh(pinStemGeo, pinMat);
      pinStem.position.set(item.x, 2, item.z);
      lotsGroup.add(pinStem);

      const pinHeadGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const pinHeadMat = new THREE.MeshStandardMaterial({
        color: item.status === 'Disponible' ? 0x22C55E : 0xEAB308,
        emissive: item.status === 'Disponible' ? 0x052e16 : 0x422006
      });
      const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      pinHead.position.set(item.x, 4, item.z);
      pinHead.userData = item;
      lotsGroup.add(pinHead);
      lotMeshList.push(pinHead);
    });

    // Club House & Piscina en el Masterplan
    const clubHouseGeo = new THREE.BoxGeometry(16, 5, 12);
    const clubHouseMat = new THREE.MeshStandardMaterial({ color: 0xE8D5B7, roughness: 0.5 });
    const clubHouse = new THREE.Mesh(clubHouseGeo, clubHouseMat);
    clubHouse.position.set(0, 2.5, -5);
    scene.add(clubHouse);

    const poolGeo = new THREE.BoxGeometry(10, 0.5, 6);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x00B4D8, roughness: 0.1, metalness: 0.8 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(0, 0.3, -16);
    scene.add(pool);

    // Ocultar loader una vez inicializado
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
      }, 300);
    }

    // Raycaster para selección de lotes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateLotInfoPanel = (lot) => {
      const panelTitle = document.getElementById('panelLotTitle');
      const panelArea = document.getElementById('panelLotArea');
      const panelPrice = document.getElementById('panelLotPrice');
      const panelDist = document.getElementById('panelLotDistance');
      const panelStatus = document.getElementById('panelLotStatus');
      const panelWaBtn = document.getElementById('panelLotWaBtn');

      if (panelTitle) panelTitle.textContent = lot.title;
      if (panelArea) panelArea.textContent = lot.area;
      if (panelPrice) panelPrice.textContent = lot.price;
      if (panelDist) panelDist.textContent = `${lot.dist} a la orilla`;
      if (panelStatus) {
        panelStatus.textContent = lot.status;
        panelStatus.style.background = lot.status === 'Disponible' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)';
        panelStatus.style.color = lot.status === 'Disponible' ? '#4ADE80' : '#FBBF24';
      }
      if (panelWaBtn) {
        panelWaBtn.href = `https://wa.me/573122384172?text=Hola%20Grupo%20AAA%2C%20estoy%20interesado%20en%20el%20${encodeURIComponent(lot.title)}%20con%20precio%20de%20${encodeURIComponent(lot.price)}%20que%20vi%20en%20el%20Master%20Plan%203D`;
      }
    };

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lotMeshList);

      if (intersects.length > 0) {
        const selected = intersects[0].object.userData;
        if (selected && selected.id) {
          updateLotInfoPanel(selected);
          showToast(`Seleccionaste ${selected.title}`);
        }
      }
    });

    // Tooltip en Hover
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(lotMeshList);

      if (intersects.length > 0 && tooltip) {
        const item = intersects[0].object.userData;
        tooltipTitle.textContent = item.title;
        tooltipDesc.textContent = `Área: ${item.area} · ${item.price}`;
        tooltip.style.left = `${e.clientX - rect.left + 15}px`;
        tooltip.style.top = `${e.clientY - rect.top + 15}px`;
        tooltip.style.display = 'block';
      } else if (tooltip) {
        tooltip.style.display = 'none';
      }
    });

    // Presets de Cámara (Aéreo, Playa, Zonas Comunes, Atardecer)
    const cameraPresets = {
      aerial: { pos: { x: 0, y: 70, z: 80 }, target: { x: 0, y: 0, z: 0 } },
      beach: { pos: { x: 0, y: 14, z: -60 }, target: { x: 0, y: 0, z: -20 } },
      amenities: { pos: { x: -25, y: 22, z: 15 }, target: { x: 0, y: 2, z: -10 } },
      sunset: { pos: { x: 45, y: 20, z: 45 }, target: { x: 0, y: 0, z: -10 } }
    };

    const moveCameraToPreset = (presetName) => {
      const p = cameraPresets[presetName];
      if (!p) return;

      if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, {
          x: p.pos.x,
          y: p.pos.y,
          z: p.pos.z,
          duration: 1.5,
          ease: 'power2.inOut'
        });
        if (controls) {
          gsap.to(controls.target, {
            x: p.target.x,
            y: p.target.y,
            z: p.target.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => controls.update()
          });
        }
      } else {
        camera.position.set(p.pos.x, p.pos.y, p.pos.z);
        if (controls) {
          controls.target.set(p.target.x, p.target.y, p.target.z);
          controls.update();
        }
      }
    };

    document.querySelectorAll('.cam-btn, .thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cam = btn.getAttribute('data-cam');
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        moveCameraToPreset(cam);
      });
    });

    // Loop de render
    const animateViewer = () => {
      requestAnimationFrame(animateViewer);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animateViewer();

    window.addEventListener('resize', () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  };
  initMasterPlan3D();

  // Botón Favorito en Lote de Master Plan
  const btnFavoriteLot = document.getElementById('btnFavoriteLot');
  if (btnFavoriteLot) {
    btnFavoriteLot.addEventListener('click', () => {
      const isFav = btnFavoriteLot.classList.toggle('active');
      const heartIcon = btnFavoriteLot.querySelector('.heart-icon');
      const favText = btnFavoriteLot.querySelector('.fav-text');
      if (isFav) {
        heartIcon.textContent = '❤️';
        favText.textContent = 'Guardado en Favoritos';
        showToast('Lote agregado a tus favoritos guardados.');
        if (typeof confetti === 'function') {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        heartIcon.textContent = '🤍';
        favText.textContent = 'Guardar en Favoritos';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. 4️⃣ CARDS EDUCATIVAS CON MICROINTERACCIONES (Pilares)
  // --------------------------------------------------------------------------
  document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('expanded');
      const learnMore = card.querySelector('.learn-more');
      if (learnMore) {
        learnMore.innerHTML = isExpanded 
          ? 'Ocultar especificaciones <span class="arrow">↑</span>'
          : 'Ver detalles <span class="arrow">→</span>';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. 5️⃣ SECCIÓN COMPARATIVO 3D (Carrusel con Tabs)
  // --------------------------------------------------------------------------
  const compTabs = document.querySelectorAll('.comp-tab');
  const compSlides = [
    document.getElementById('compSlide0'),
    document.getElementById('compSlide1'),
    document.getElementById('compSlide2'),
    document.getElementById('compSlide3')
  ];

  compTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const slideIdx = parseInt(tab.getAttribute('data-slide'), 10);
      compTabs.forEach(t => t.classList.remove('active'));
      compSlides.forEach(s => { if (s) s.classList.remove('active'); });

      tab.classList.add('active');
      if (compSlides[slideIdx]) {
        compSlides[slideIdx].classList.add('active');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 8. 6️⃣ TESTIMONIOS CON AVATAR 3D ANIMADO (Three.js Procedural Head)
  // --------------------------------------------------------------------------
  const initAvatar3D = () => {
    const canvas = document.getElementById('avatarCanvas');
    const container = document.getElementById('avatarCanvasContainer');
    if (!canvas || !container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Luces de Estudio 3 Puntos
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(amb);

    const keyLight = new THREE.DirectionalLight(0x0099FF, 2.0);
    keyLight.position.set(10, 10, 15);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xD4AF8F, 2.2);
    rimLight.position.set(-10, -5, -10);
    scene.add(rimLight);

    // Busto / Escultura Procedural Elegante
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Cabeza
    const headGeo = new THREE.SphereGeometry(3.5, 32, 32);
    headGeo.scale(1, 1.25, 1);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1A365D,
      roughness: 0.3,
      metalness: 0.6
    });
    const head = new THREE.Mesh(headGeo, headMat);
    headGroup.add(head);

    // Cuello & Hombros
    const neckGeo = new THREE.CylinderGeometry(1.2, 2.8, 3, 24);
    const neck = new THREE.Mesh(neckGeo, headMat);
    neck.position.y = -4;
    headGroup.add(neck);

    // Ojos Estilizados
    const eyeGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00D9FF });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-1.1, 0.4, 3.2);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(1.1, 0.4, 3.2);
    headGroup.add(rightEye);

    // Seguimiento suave del ratón
    let targetRotY = 0;
    let targetRotX = 0;

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = nx * 0.45;
      targetRotX = ny * 0.3;
    }, { passive: true });

    let clock = new THREE.Clock();
    const animateAvatar = () => {
      requestAnimationFrame(animateAvatar);
      const time = clock.getElapsedTime();

      // Respiración sutil
      headGroup.position.y = Math.sin(time * 1.5) * 0.2;
      headGroup.scale.y = 1 + Math.sin(time * 1.5) * 0.015;

      // Movimiento hacia cursor
      headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };
    animateAvatar();

    window.addEventListener('resize', () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  };
  initAvatar3D();

  // Testimonios Carousel
  const testiSlides = [
    document.getElementById('testiSlide0'),
    document.getElementById('testiSlide1'),
    document.getElementById('testiSlide2'),
    document.getElementById('testiSlide3')
  ];
  const testiDots = document.querySelectorAll('.testi-dot');
  let currentTesti = 0;

  const showTestimonial = (idx) => {
    testiSlides.forEach(s => { if (s) s.classList.remove('active'); });
    testiDots.forEach(d => d.classList.remove('active'));

    currentTesti = (idx + testiSlides.length) % testiSlides.length;
    if (testiSlides[currentTesti]) testiSlides[currentTesti].classList.add('active');
    if (testiDots[currentTesti]) testiDots[currentTesti].classList.add('active');
  };

  const btnPrevTesti = document.getElementById('btnPrevTesti');
  const btnNextTesti = document.getElementById('btnNextTesti');

  if (btnPrevTesti) btnPrevTesti.addEventListener('click', () => showTestimonial(currentTesti - 1));
  if (btnNextTesti) btnNextTesti.addEventListener('click', () => showTestimonial(currentTesti + 1));

  testiDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-testi'), 10);
      showTestimonial(idx);
    });
  });

  // --------------------------------------------------------------------------
  // 9. 7️⃣ PROCESO DE COMPRA (5 Pasos y Línea SVG)
  // --------------------------------------------------------------------------
  const processSteps = document.querySelectorAll('.process-step-card');
  const animatedLine = document.getElementById('animatedProcessLine');

  processSteps.forEach((card, idx) => {
    card.addEventListener('click', () => {
      processSteps.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (animatedLine) {
        const progressX = ((idx + 1) / 5) * 1000;
        animatedLine.setAttribute('x2', progressX);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. 8️⃣ BÚSQUEDA AVANZADA CON FILTROS EN TIEMPO REAL
  // --------------------------------------------------------------------------
  const lotsDatabase = [
    { id: 1, name: 'Lote 01', sector: 'playa', sectorLabel: 'Sector Frente al Mar', area: 520, price: 125000000, status: 'Disponible', dist: 150, img: 'assets/images/lote-mar.jpg' },
    { id: 2, name: 'Lote 02', sector: 'playa', sectorLabel: 'Sector Frente al Mar', area: 480, price: 115000000, status: 'Disponible', dist: 150, img: 'assets/images/hero.jpg' },
    { id: 4, name: 'Lote 04', sector: 'playa', sectorLabel: 'Sector Esquina Marina', area: 600, price: 140000000, status: 'Disponible', dist: 160, img: 'assets/images/lote-mar.jpg' },
    { id: 7, name: 'Lote 07', sector: 'playa', sectorLabel: 'Sector Sendero Playa', area: 450, price: 98000000, status: 'Disponible', dist: 150, img: 'assets/images/lifestyle.jpg' },
    { id: 10, name: 'Lote 10', sector: 'club', sectorLabel: 'Sector Club House', area: 400, price: 88000000, status: 'Disponible', dist: 220, img: 'assets/images/amenities.jpg' },
    { id: 12, name: 'Lote 12', sector: 'playa', sectorLabel: 'Sector Costa Dorada', area: 480, price: 98000000, status: 'Disponible', dist: 170, img: 'assets/images/lote-mar.jpg' },
    { id: 15, name: 'Lote 15', sector: 'bosque', sectorLabel: 'Sector Campestre Privado', area: 700, price: 135000000, status: 'Reservado', dist: 250, img: 'assets/images/lote-campestre.jpg' },
    { id: 18, name: 'Lote 18', sector: 'bosque', sectorLabel: 'Sector Palmeras', area: 550, price: 105000000, status: 'Disponible', dist: 230, img: 'assets/images/lote-campestre.jpg' },
    { id: 22, name: 'Lote 22', sector: 'club', sectorLabel: 'Sector Frente a Piscinas', area: 450, price: 95000000, status: 'Disponible', dist: 240, img: 'assets/images/amenities.jpg' },
    { id: 25, name: 'Lote 25', sector: 'bosque', sectorLabel: 'Sector Mirador', area: 620, price: 118000000, status: 'Disponible', dist: 280, img: 'assets/images/lote-campestre.jpg' },
    { id: 28, name: 'Lote 28', sector: 'bosque', sectorLabel: 'Sector Bosque Nativo', area: 850, price: 160000000, status: 'Disponible', dist: 300, img: 'assets/images/lote-campestre.jpg' },
    { id: 31, name: 'Lote 31', sector: 'playa', sectorLabel: 'Sector Brisa Marina', area: 500, price: 92000000, status: 'Disponible', dist: 180, img: 'assets/images/lote-mar.jpg' },
    { id: 35, name: 'Lote 35', sector: 'bosque', sectorLabel: 'Gran Parcela Campestre', area: 1000, price: 195000000, status: 'Disponible', dist: 350, img: 'assets/images/imagen_encabezado_corales.jpg' },
    { id: 40, name: 'Lote 40', sector: 'club', sectorLabel: 'Sector Zona Social', area: 380, price: 82000000, status: 'Disponible', dist: 220, img: 'assets/images/amenities.jpg' },
    { id: 45, name: 'Lote 45', sector: 'playa', sectorLabel: 'Sector Esmeralda Mar', area: 550, price: 130000000, status: 'Disponible', dist: 150, img: 'assets/images/lote-mar.jpg' }
  ];

  const lotsCardsGrid = document.getElementById('lotsCardsGrid');
  const visibleCount = document.getElementById('visibleCount');
  const emptyState = document.getElementById('emptyResultsState');
  const filterSearchText = document.getElementById('filterSearchText');
  const filterArea = document.getElementById('filterArea');
  const displayAreaVal = document.getElementById('displayAreaVal');
  const filterBudget = document.getElementById('filterBudget');
  const displayBudgetVal = document.getElementById('displayBudgetVal');
  const filterOnlyAvailable = document.getElementById('filterOnlyAvailable');
  const sortSelect = document.getElementById('sortSelect');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const btnResetFiltersEmpty = document.getElementById('btnResetFiltersEmpty');

  const renderLots = () => {
    if (!lotsCardsGrid) return;

    const query = (filterSearchText ? filterSearchText.value.toLowerCase().trim() : '');
    const minArea = filterArea ? parseInt(filterArea.value, 10) : 350;
    const maxBudget = filterBudget ? parseInt(filterBudget.value, 10) * 1000000 : 250000000;
    const onlyAvailable = filterOnlyAvailable ? filterOnlyAvailable.checked : false;

    let selectedSector = 'all';
    const checkedRadio = document.querySelector('input[name="filterSector"]:checked');
    if (checkedRadio) selectedSector = checkedRadio.value;

    let filtered = lotsDatabase.filter(lot => {
      if (query && !lot.name.toLowerCase().includes(query) && !lot.sectorLabel.toLowerCase().includes(query)) {
        return false;
      }
      if (lot.area < minArea) return false;
      if (lot.price > maxBudget) return false;
      if (onlyAvailable && lot.status !== 'Disponible') return false;
      if (selectedSector !== 'all' && lot.sector !== selectedSector) return false;
      return true;
    });

    // Ordenamiento
    const sortVal = sortSelect ? sortSelect.value : 'featured';
    if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sortVal === 'area-desc') filtered.sort((a, b) => b.area - a.area);

    lotsCardsGrid.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (visibleCount) visibleCount.textContent = '0';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (visibleCount) visibleCount.textContent = filtered.length;

    filtered.forEach(lot => {
      const card = document.createElement('article');
      card.className = 'lot-card-item';
      card.innerHTML = `
        <div class="lot-card-thumb">
          <img src="${lot.img}" alt="${lot.name}" loading="lazy">
          <span class="lot-badge-status ${lot.status.toLowerCase()}">${lot.status}</span>
          <button class="lot-favorite-btn" data-id="${lot.id}" aria-label="Favorito">🤍</button>
        </div>
        <div class="lot-card-body">
          <h4 class="lot-card-title">${lot.name}</h4>
          <span class="lot-card-sector">${lot.sectorLabel}</span>
          <div class="lot-card-meta">
            <div class="lot-meta-item">
              <span>Área:</span>
              <strong>${lot.area} m²</strong>
            </div>
            <div class="lot-meta-item">
              <span>Dist. Mar:</span>
              <strong>${lot.dist} metros</strong>
            </div>
          </div>
          <div class="lot-card-price-row">
            <span class="lot-price-val">${formatCOP(lot.price)}</span>
            <a href="https://wa.me/573122384172?text=Hola%20Grupo%20AAA%2C%20quiero%20cotizar%20el%20${encodeURIComponent(lot.name)}%20(${encodeURIComponent(lot.sectorLabel)})%20con%20precio%20de%20${encodeURIComponent(formatCOP(lot.price))}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="lot-card-cta">
              Cotizar
            </a>
          </div>
        </div>
      `;
      lotsCardsGrid.appendChild(card);
    });

    // Eventos de Favorito
    lotsCardsGrid.querySelectorAll('.lot-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isFav = btn.classList.toggle('active');
        btn.textContent = isFav ? '❤️' : '🤍';
        showToast(isFav ? 'Lote añadido a tus favoritos' : 'Lote removido de favoritos');
      });
    });
  };

  if (filterSearchText) filterSearchText.addEventListener('input', renderLots);
  if (filterArea && displayAreaVal) {
    filterArea.addEventListener('input', () => {
      displayAreaVal.textContent = `${filterArea.value} m²`;
      renderLots();
    });
  }
  if (filterBudget && displayBudgetVal) {
    filterBudget.addEventListener('input', () => {
      displayBudgetVal.textContent = `$${filterBudget.value}M COP`;
      renderLots();
    });
  }
  document.querySelectorAll('input[name="filterSector"]').forEach(radio => {
    radio.addEventListener('change', renderLots);
  });
  if (filterOnlyAvailable) filterOnlyAvailable.addEventListener('change', renderLots);
  if (sortSelect) sortSelect.addEventListener('change', renderLots);

  const resetAllFilters = () => {
    if (filterSearchText) filterSearchText.value = '';
    if (filterArea) { filterArea.value = 350; displayAreaVal.textContent = '350 m²'; }
    if (filterBudget) { filterBudget.value = 250; displayBudgetVal.textContent = '$250M+'; }
    if (filterOnlyAvailable) filterOnlyAvailable.checked = false;
    const allSector = document.querySelector('input[name="filterSector"][value="all"]');
    if (allSector) allSector.checked = true;
    renderLots();
    showToast('Filtros restablecidos');
  };

  if (btnResetFilters) btnResetFilters.addEventListener('click', resetAllFilters);
  if (btnResetFiltersEmpty) btnResetFiltersEmpty.addEventListener('click', resetAllFilters);

  renderLots();

  // --------------------------------------------------------------------------
  // 11. 9️⃣ SECCIÓN MULTIMEDIA (Custom Video Player & Lightbox)
  // --------------------------------------------------------------------------
  const video = document.getElementById('multimediaVideo');
  const btnPlayPause = document.getElementById('btnVideoPlayPause');
  const videoProgressFill = document.getElementById('videoProgressFill');
  const videoProgressBar = document.getElementById('videoProgressBar');
  const videoTimeDisplay = document.getElementById('videoTimeDisplay');
  const btnMute = document.getElementById('btnVideoMute');
  const btnFullscreen = document.getElementById('btnVideoFullscreen');

  if (video && btnPlayPause) {
    const playIcon = btnPlayPause.querySelector('.play');
    const pauseIcon = btnPlayPause.querySelector('.pause');

    btnPlayPause.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
      } else {
        video.pause();
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
      }
    });

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        if (videoProgressFill) videoProgressFill.style.width = `${percent}%`;

        const curM = Math.floor(video.currentTime / 60);
        const curS = Math.floor(video.currentTime % 60);
        const durM = Math.floor(video.duration / 60);
        const durS = Math.floor(video.duration % 60);

        if (videoTimeDisplay) {
          videoTimeDisplay.textContent = `${curM}:${curS < 10 ? '0' : ''}${curS} / ${durM}:${durS < 10 ? '0' : ''}${durS}`;
        }
      }
    });

    if (videoProgressBar) {
      videoProgressBar.addEventListener('click', (e) => {
        const rect = videoProgressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        video.currentTime = (clickX / rect.width) * video.duration;
      });
    }

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        video.muted = !video.muted;
        btnMute.querySelector('.ctrl-icon').textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          video.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  // Lightbox Modal
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxCaptionTitle');
  const lightboxCounter = document.getElementById('lightboxCaptionCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const galleryItems = document.querySelectorAll('.masonry-item');
  let currentLightboxIdx = 0;

  const openLightbox = (index) => {
    if (!lightboxModal || !lightboxImg || galleryItems.length === 0) return;
    currentLightboxIdx = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentLightboxIdx];
    const imgEl = item.querySelector('img');
    const titleEl = item.querySelector('.overlay-title');

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    if (lightboxTitle && titleEl) lightboxTitle.textContent = titleEl.textContent;
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIdx + 1} de ${galleryItems.length}`;

    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => openLightbox(currentLightboxIdx - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => openLightbox(currentLightboxIdx + 1));

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentLightboxIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentLightboxIdx + 1);
  });

  // --------------------------------------------------------------------------
  // 12. 🔟 SECCIÓN FINANCIERA (Simulador de Pagos en Tiempo Real)
  // --------------------------------------------------------------------------
  const financeTabs = document.querySelectorAll('.finance-tab');
  const financePanes = {
    credito: document.getElementById('paneCredito'),
    contado: document.getElementById('paneContado'),
    directo: document.getElementById('paneDirecto'),
    escalonado: document.getElementById('paneEscalonado')
  };

  financeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      financeTabs.forEach(t => t.classList.remove('active'));
      Object.values(financePanes).forEach(p => { if (p) p.classList.remove('active'); });

      tab.classList.add('active');
      if (financePanes[tabId]) financePanes[tabId].classList.add('active');
    });
  });

  // Cálculo del Simulador de Crédito
  const simLoanAmount = document.getElementById('simLoanAmount');
  const simLoanAmountDisplay = document.getElementById('simLoanAmountDisplay');
  const simInitialPercent = document.getElementById('simInitialPercent');
  const simInitialDisplay = document.getElementById('simInitialDisplay');
  const simTermSelect = document.getElementById('simTermSelect');
  const simMonthlyResult = document.getElementById('simMonthlyResult');
  const simNetFinanced = document.getElementById('simNetFinanced');
  const simInitialValue = document.getElementById('simInitialValue');
  const simTermMonths = document.getElementById('simTermMonths');
  const btnApplyLoan = document.getElementById('btnApplyLoan');

  const calculateLoan = () => {
    if (!simLoanAmount || !simInitialPercent || !simTermSelect) return;

    const totalAmount = parseFloat(simLoanAmount.value);
    const initialPct = parseFloat(simInitialPercent.value) / 100;
    const initialVal = totalAmount * initialPct;
    const netFinancedVal = totalAmount - initialVal;
    const months = parseInt(simTermSelect.value, 10);

    const monthlyInterestRate = 0.011; // 1.1% Mes Vencido

    // Fórmula de amortización francesa: C = P * [ r*(1+r)^n ] / [ (1+r)^n - 1 ]
    const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months);
    const denominator = Math.pow(1 + monthlyInterestRate, months) - 1;
    const monthlyPayment = netFinancedVal * (numerator / denominator);

    if (simLoanAmountDisplay) simLoanAmountDisplay.textContent = formatCOP(totalAmount);
    if (simInitialDisplay) simInitialDisplay.textContent = `${formatCOP(initialVal)} (${Math.round(initialPct * 100)}%)`;
    if (simMonthlyResult) simMonthlyResult.textContent = formatCOP(monthlyPayment);
    if (simNetFinanced) simNetFinanced.textContent = formatCOP(netFinancedVal);
    if (simInitialValue) simInitialValue.textContent = formatCOP(initialVal);
    if (simTermMonths) simTermMonths.textContent = `${months} meses`;

    if (btnApplyLoan) {
      btnApplyLoan.href = `https://wa.me/573122384172?text=Hola%20Grupo%20AAA%2C%20hice%20una%20simulaci%C3%B3n%20para%20un%20lote%20de%20${encodeURIComponent(formatCOP(totalAmount))}%20con%20cuota%20inicial%20de%20${encodeURIComponent(formatCOP(initialVal))}%20a%20${months}%20meses%20(cuota%20estimada%3A%20${encodeURIComponent(formatCOP(monthlyPayment))})%20en%20Corales%20del%20Viento`;
    }
  };

  if (simLoanAmount) simLoanAmount.addEventListener('input', calculateLoan);
  if (simInitialPercent) simInitialPercent.addEventListener('input', calculateLoan);
  if (simTermSelect) simTermSelect.addEventListener('change', calculateLoan);
  calculateLoan();

  // --------------------------------------------------------------------------
  // 13. 1️⃣1️⃣ MAPA INTERACTIVO CON CONTEXTO GEOGRÁFICO (Leaflet)
  // --------------------------------------------------------------------------
  const initLeafletMap = () => {
    const mapEl = document.getElementById('interactiveMap');
    if (!mapEl || typeof L === 'undefined') return;

    // Coordenadas de Corales del Viento (San Bernardo del Viento, Córdoba)
    const projectCoords = [9.3542, -75.9521];

    const map = L.map('interactiveMap', {
      center: projectCoords,
      zoom: 12,
      scrollWheelZoom: false
    });

    // Tiles con estilo oscuro/náutico
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Marcador Principal del Proyecto
    const projectIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: #0052A3;
          border: 3px solid #D4AF8F;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        ">★</div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    L.marker(projectCoords, { icon: projectIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0F172A; padding: 4px;">
          <strong style="color: #0052A3; font-size: 14px;">Condominio Corales del Viento</strong><br>
          <span style="font-size: 12px;">A 150m de la orilla del mar Caribe</span><br>
          <strong style="color: #16A34A; font-size: 12px;">San Bernardo del Viento, Córdoba</strong>
        </div>
      `)
      .openPopup();

    // Puntos de Interés Cercanos (POIs)
    const pois = [
      { name: '🏖️ Playa de San Bernardo (150m)', coords: [9.3555, -75.9535] },
      { name: '🏪 Casco Urbano San Bernardo (3.2km)', coords: [9.3533, -75.9220] },
      { name: '🏝️ Isla Fuerte (Trayecto lancha)', coords: [9.3880, -76.1770] },
      { name: '🌿 Bahía de Cispatá (Manglares)', coords: [9.3900, -75.7900] }
    ];

    pois.forEach(poi => {
      L.marker(poi.coords)
        .addTo(map)
        .bindPopup(`<strong>${poi.name}</strong>`);
    });

    // Botones Flotantes del Mapa
    const btnCenter = document.getElementById('btnCenterProject');
    if (btnCenter) {
      btnCenter.addEventListener('click', () => {
        map.flyTo(projectCoords, 14, { duration: 1.2 });
      });
    }

    const btnCopyCoords = document.getElementById('btnCopyCoords');
    if (btnCopyCoords) {
      btnCopyCoords.addEventListener('click', () => {
        navigator.clipboard.writeText('9.354200, -75.952100').then(() => {
          showToast('Coordenadas GPS copiadas al portapapeles');
        }).catch(() => {
          showToast('9.354200, -75.952100');
        });
      });
    }
  };
  initLeafletMap();

  // --------------------------------------------------------------------------
  // 14. 1️⃣2️⃣ FAQ ACCORDION AVANZADO & BÚSQUEDA REACTIVA
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearchInput = document.getElementById('faqSearchInput');
  const faqPills = document.querySelectorAll('.faq-pill');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.toggle('active');
      header.setAttribute('aria-expanded', isOpen);
    });
  });

  const filterFaqs = () => {
    const query = faqSearchInput ? faqSearchInput.value.toLowerCase().trim() : '';
    let selectedCat = 'all';
    const activePill = document.querySelector('.faq-pill.active');
    if (activePill) selectedCat = activePill.getAttribute('data-cat');

    faqItems.forEach(item => {
      const qText = item.querySelector('.faq-question').textContent.toLowerCase();
      const aText = item.querySelector('.faq-content').textContent.toLowerCase();
      const itemCat = item.getAttribute('data-cat');

      const matchesQuery = !query || qText.includes(query) || aText.includes(query);
      const matchesCat = selectedCat === 'all' || itemCat === selectedCat;

      if (matchesQuery && matchesCat) {
        item.style.display = 'block';
        if (query) item.classList.add('active');
      } else {
        item.style.display = 'none';
      }
    });
  };

  if (faqSearchInput) faqSearchInput.addEventListener('input', filterFaqs);

  faqPills.forEach(pill => {
    pill.addEventListener('click', () => {
      faqPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterFaqs();
    });
  });

  // Botones de feedback en respuestas
  document.querySelectorAll('.btn-fb-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const isUseful = btn.getAttribute('data-useful') === 'yes';
      showToast(isUseful ? '¡Gracias por tus comentarios!' : 'Anotado. Hablaremos con el asesor para ampliar esta respuesta.');
      const parent = btn.closest('.faq-feedback');
      if (parent) parent.innerHTML = '<span style="color:#4ADE80;">✓ ¡Gracias por tu valoración!</span>';
    });
  });

  // --------------------------------------------------------------------------
  // 15. WIDGET FLOTANTE DE WHATSAPP
  // --------------------------------------------------------------------------
  const waFloatBtn = document.getElementById('waFloatBtn');
  const waChatModal = document.getElementById('waChatModal');
  const waCloseBtn = document.getElementById('waCloseBtn');

  if (waFloatBtn && waChatModal) {
    waFloatBtn.addEventListener('click', () => {
      waChatModal.classList.toggle('open');
    });

    if (waCloseBtn) {
      waCloseBtn.addEventListener('click', () => {
        waChatModal.classList.remove('open');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 16. ANIMACIONES DE SCROLL REVEAL (GSAP O INTERSECTION OBSERVER)
  // --------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.story-layer').forEach(layer => {
      gsap.from(layer, {
        scrollTrigger: {
          trigger: layer,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    gsap.utils.toArray('.interactive-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 35,
        delay: i * 0.15,
        duration: 0.7,
        ease: 'power2.out'
      });
    });
  }
});
