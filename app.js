/**
 * CINEMATIC CANVAS SCROLL SCRUBBER ENGINE
 * Inspired by Design With Alok (@designwithalok) - Project Kohra
 * 
 * Features:
 * 1. Progressive Preloading ("Every 8th Frame First")
 * 2. 60-120fps Smooth Lerp Interpolation
 * 3. High-DPI Canvas Cover Rendering
 * 4. Chapter-based Non-linear Easing & Overlays
 * 5. Procedural Cinematic Mist Fallback (works immediately out of the box!)
 */

(function () {
  'use strict';

  // --- CONFIGURATION ---
  const TOTAL_FRAMES = 240;
  const FRAME_PREFIX = 'frame_';
  const FRAME_EXT = '.webp';
  const KEYFRAME_INTERVAL = 8; // Load every 8th frame first for instant interactivity

  // Responsive frame directory: vertical 9:16 portrait frames for phones, 16:9 for desktop
  const isMobileViewport = () => {
    // 1. Standard mobile phone width (e.g. 360px - 768px)
    if (window.innerWidth <= 768) return true;
    // 2. Mobile Device check (iOS Safari, Android Chrome) in portrait
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight >= window.innerWidth;
    if (isMobileUA && isPortrait) return true;
    // 3. Tablet portrait check
    if (isPortrait && window.innerWidth <= 1024) return true;
    return false;
  };
  let currentMode = isMobileViewport() ? 'mobile' : 'desktop';
  let frameDir = currentMode === 'mobile' ? 'frames-mobile-v2/' : 'frames/';
  let activePreloadId = 0;

  // DOM Elements
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const scrollTrack = document.getElementById('scroll-track');
  const chapters = document.querySelectorAll('.chapter');
  
  // HUD Elements
  const hudCounter = document.getElementById('hud-counter');
  const hudProgress = document.getElementById('hud-progress');
  const hudClarity = document.querySelector('.hud-clarity');
  const hudSteps = [
    document.getElementById('hud-step-1'),
    document.getElementById('hud-step-2'),
    document.getElementById('hud-step-3'),
    document.getElementById('hud-step-4')
  ];

  // State
  const frameStore = new Map(); // frameIndex -> HTMLImageElement
  let imagesAvailable = true;
  let targetFrame = 0;
  let currentFrame = 0;
  let scrollProgress = 0;
  let isTicking = false;
  let canvasWidth = 0;
  let canvasHeight = 0;

  // Format frame number to 4 digits: e.g. 7 -> "0007"
  function padFrame(num) {
    return String(num).padStart(4, '0');
  }

  // --- PROGRESSIVE FRAME LOADER (Kohra Engine) ---
  function preloadFrames() {
    const thisPreloadId = ++activePreloadId;
    let loadedCount = 0;
    let failedCount = 0;

    function loadFrame(index) {
      if (frameStore.has(index)) return;
      const img = new Image();
      img.src = `${frameDir}${FRAME_PREFIX}${padFrame(index + 1)}${FRAME_EXT}`;
      
      img.onload = () => {
        if (thisPreloadId !== activePreloadId) return; // Stale request from previous mode
        frameStore.set(index, img);
        loadedCount++;
        if (loadedCount % 10 === 0 && hudClarity) {
          const pct = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
          hudClarity.textContent = `CACHED ${pct}% (${currentMode.toUpperCase()})`;
        }
      };

      img.onerror = () => {
        if (thisPreloadId !== activePreloadId) return;
        failedCount++;
        // If the first few frames fail to load, gracefully switch to Procedural Cinematic Mode
        if (failedCount > 5 && loadedCount === 0) {
          imagesAvailable = false;
          if (hudClarity) hudClarity.textContent = `PROCEDURAL MODE`;
        }
      };
    }

    // Step 1: Preload Every 8th Frame First (Keyframes) for instantaneous scrubbing
    for (let i = 0; i < TOTAL_FRAMES; i += KEYFRAME_INTERVAL) {
      loadFrame(i);
    }
    loadFrame(TOTAL_FRAMES - 1);

    // Step 2: Preload intermediate frames in the background
    const loadRemaining = () => {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (thisPreloadId !== activePreloadId) break;
        loadFrame(i);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(loadRemaining, 100);
    } else {
      window.addEventListener('load', () => setTimeout(loadRemaining, 300), { once: true });
    }
  }

  // Find nearest cached frame (for progressive fallback)
  function getNearestFrame(index) {
    if (frameStore.has(index)) return frameStore.get(index);
    for (let offset = 1; offset < KEYFRAME_INTERVAL + 2; offset++) {
      if (frameStore.has(index - offset)) return frameStore.get(index - offset);
      if (frameStore.has(index + offset)) return frameStore.get(index + offset);
    }
    return null;
  }

  // --- RESIZE & CANVAS SETUP ---
  let lastWidth = 0;
  let lastHeight = 0;

  function handleResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Check if mode switched between Mobile Portrait (9:16) and Desktop/Landscape (16:9)
    const newMode = isMobileViewport() ? 'mobile' : 'desktop';
    if (newMode !== currentMode) {
      currentMode = newMode;
      frameDir = currentMode === 'mobile' ? 'frames-mobile-v2/' : 'frames/';
      frameStore.clear(); // Clear cached frames of previous aspect ratio
      imagesAvailable = true;
      preloadFrames(); // Reload keyframes for new viewport orientation
    }

    // Mobile optimization: When scrolling on mobile browsers (iOS Safari, Android Chrome),
    // dynamic address bar show/hide fires resize events.
    // Skipping re-allocation for minor height deltas (<140px) avoids canvas memory wipes & frame stutter.
    if (canvasWidth && Math.abs(newWidth - lastWidth) < 2 && Math.abs(newHeight - lastHeight) < 140) {
      return;
    }

    lastWidth = newWidth;
    lastHeight = newHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = newWidth;
    canvasHeight = newHeight;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  // --- DRAW IMAGE WITH "COVER" ASPECT RATIO ---
  function drawCover(img) {
    if (!img) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = canvasWidth;
      renderH = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - renderH) / 2;
    } else {
      renderW = canvasHeight * imgRatio;
      renderH = canvasHeight;
      offsetX = (canvasWidth - renderW) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // --- PROCEDURAL CINEMATIC MIST / MOUNTAIN FALLBACK ---
  // Renders if local frames are not generated yet, providing immediate visual magic
  let mistParticles = [];
  function initMistParticles() {
    mistParticles = [];
    for (let i = 0; i < 45; i++) {
      mistParticles.push({
        x: Math.random() * 1.5 - 0.25,
        y: Math.random() * 1.2,
        r: 120 + Math.random() * 240,
        alpha: 0.08 + Math.random() * 0.18,
        speedX: (Math.random() - 0.5) * 0.0008,
        speedY: -0.0003 - Math.random() * 0.0006
      });
    }
  }

  function drawProceduralAtmosphere(p, frameIdx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dynamic sky gradient shifting from misty charcoal to deep spruce
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    const fogColor = Math.round(18 + (1 - p) * 15);
    skyGrad.addColorStop(0, `rgb(${fogColor}, ${fogColor + 4}, ${fogColor + 8})`);
    skyGrad.addColorStop(0.6, `rgb(${fogColor - 6}, ${fogColor - 2}, ${fogColor + 2})`);
    skyGrad.addColorStop(1, `#080b0d`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Mountain silhouettes in the mist (3 parallax layers)
    function drawMountainLayer(baseY, peaks, color, parallaxOffset) {
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight);
      ctx.lineTo(0, baseY + parallaxOffset);

      const step = canvasWidth / (peaks.length - 1);
      for (let i = 0; i < peaks.length; i++) {
        const x = i * step;
        const y = baseY + peaks[i] + parallaxOffset;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = (i - 1) * step;
          const prevY = baseY + peaks[i - 1] + parallaxOffset;
          const cx = (prevX + x) / 2;
          ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
        }
      }
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Distant mountain
    drawMountainLayer(canvasHeight * 0.35, [0, -120, -60, -150, -40, -110, 0], 'rgba(28, 38, 44, 0.45)', p * 60);

    // Midground rocky ridge
    drawMountainLayer(canvasHeight * 0.52, [-40, 80, -90, 40, -140, 30, -50], 'rgba(20, 28, 32, 0.75)', p * 120);

    // Foreground cliff & foliage silhouetted
    drawMountainLayer(canvasHeight * 0.72, [20, -160, 60, -70, 90, -120, 40], 'rgba(12, 16, 18, 0.95)', p * 180);

    // Flowing mist / waterfall particles
    const time = Date.now() * 0.001;
    mistParticles.forEach(pt => {
      pt.y += pt.speedY;
      pt.x += pt.speedX;
      if (pt.y < -0.2) pt.y = 1.2;
      if (pt.x > 1.3) pt.x = -0.2;
      if (pt.x < -0.2) pt.x = 1.3;

      const px = pt.x * canvasWidth;
      const py = (pt.y - p * 0.4) * canvasHeight; // Parallax with scroll
      const grad = ctx.createRadialGradient(px, py, 0, px, py, pt.r);
      grad.addColorStop(0, `rgba(240, 245, 250, ${pt.alpha * (1 - p * 0.3)})`);
      grad.addColorStop(1, 'rgba(240, 245, 250, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, pt.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Atmospheric vignette
    const vignette = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.25,
      canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.75
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(6, 8, 10, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // --- CHAPTER TRANSITION CONTROLLER ---
  function updateChapters(p) {
    chapters.forEach((chap, idx) => {
      const start = parseFloat(chap.dataset.start);
      const end = parseFloat(chap.dataset.end);
      const isActive = p >= start && p < end;

      if (isActive) {
        chap.classList.add('active');
        hudSteps.forEach((step, sIdx) => {
          if (step) step.classList.toggle('active', sIdx === idx);
        });
      } else {
        chap.classList.remove('active');
      }
    });

    // Special case for end of page
    if (p >= 0.98) {
      chapters[chapters.length - 1].classList.add('active');
      hudSteps.forEach((step, sIdx) => {
        if (step) step.classList.toggle('active', sIdx === chapters.length - 1);
      });
    }
  }

  // --- SCROLL PROGRESS & EASING (frameAt function from video) ---
  function getScrollProgress() {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / totalScroll));
  }

  // Kohra non-linear frameAt easing (adapted from video frame 008)
  function frameAt(p) {
    // Chapter ranges:
    // 0.0 - 0.25: Fog intro (frames 0 to 50)
    // 0.25 - 0.50: Lift / Waterfall reveal (frames 50 to 125)
    // 0.50 - 0.75: Plan / Showcase (frames 125 to 180)
    // 0.75 - 1.00: Dive / Action (frames 180 to 214)
    return Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(p * (TOTAL_FRAMES - 1))));
  }

  // --- RENDER LOOP (60-120 FPS SMOOTH LERP) ---
  function render() {
    // Smooth lerping: on touchscreens, slightly faster lerp (0.24) makes scrubbing feel directly pinned to thumb
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const lerpFactor = isTouch ? 0.24 : 0.18;
    currentFrame += (targetFrame - currentFrame) * lerpFactor;
    const roundedFrame = Math.round(currentFrame);

    if (imagesAvailable && frameStore.size > 0) {
      const img = getNearestFrame(roundedFrame);
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawCover(img);
      } else {
        drawProceduralAtmosphere(scrollProgress, roundedFrame);
      }
    } else {
      drawProceduralAtmosphere(scrollProgress, roundedFrame);
    }

    // Update Telemetry HUD
    if (hudCounter) {
      hudCounter.textContent = `FRAME ${padFrame(roundedFrame + 1)} / ${TOTAL_FRAMES}`;
    }
    if (hudProgress) {
      hudProgress.textContent = `SCROLL ${Math.round(scrollProgress * 100)}%`;
    }

    requestAnimationFrame(render);
  }

  // --- SCROLL EVENT LISTENER ---
  function onScroll() {
    scrollProgress = getScrollProgress();
    targetFrame = frameAt(scrollProgress);
    updateChapters(scrollProgress);
  }

  // --- DIRECT MAIL INBOX HANDLER ---
  function initDirectMailForm() {
    const form = document.getElementById('direct-mail-form');
    const status = document.getElementById('mail-status');
    const submitBtn = document.getElementById('btn-submit-mail');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('sender-name')?.value.trim();
      const email = document.getElementById('sender-email')?.value.trim();
      const message = document.getElementById('sender-message')?.value.trim();

      if (!name || !email || !message) return;

      submitBtn.disabled = true;
      status.className = 'mail-status sending';
      status.textContent = 'Delivering directly to inbox...';

      try {
        const response = await fetch('https://formsubmit.co/ajax/Rajeevrajgupta158@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            _subject: `New Portfolio Message from ${name} (${email})`
          })
        });

        if (response.ok) {
          status.className = 'mail-status success';
          status.textContent = '✓ Delivered directly to Rajeevraj\'s inbox!';
          form.reset();
        } else {
          throw new Error('Fallback to mailto');
        }
      } catch (err) {
        // Instant graceful fallback: opens default mail client with message pre-filled
        window.location.href = `mailto:Rajeevrajgupta158@gmail.com?subject=${encodeURIComponent('Portfolio Message from ' + name)}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
        status.className = 'mail-status success';
        status.textContent = '✓ Opening email client with pre-filled message...';
      } finally {
        setTimeout(() => {
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  }

  // --- INITIALIZATION ---
  function init() {
    handleResize();
    initMistParticles();
    preloadFrames();
    initDirectMailForm();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll();
    requestAnimationFrame(render);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
