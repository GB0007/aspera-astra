(function () {
  const field = document.getElementById('wave-field');
  if (!field) return;

  const track = document.createElement('div');
  track.className = 'wave-track';
  field.appendChild(track);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  let stars = [];

  const SACRED_SHAPES = ['hexagon', 'octagram', 'mandala', 'metatron', 'suncross', 'rings', 'octagon', 'wheel'];

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function seededRandom(seed) {
    let state = seed % 233280;
    return function next() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  function depthFactor(depth) {
    return 0.76 + clamp(depth, -1, 1) * 0.24;
  }

  function pickStarSize(rng) {
    const roll = rng();
    if (roll > 0.86) {
      return 76 + Math.floor(rng() * 44);
    }
    if (roll > 0.68) {
      return 54 + Math.floor(rng() * 26);
    }
    return 16 + Math.floor(Math.pow(rng(), 0.65) * 40);
  }

  function polygonPoints(cx, cy, r, sides, rotDeg) {
    const pts = [];
    for (let i = 0; i < sides; i += 1) {
      const a = ((i * (360 / sides) + rotDeg - 90) * Math.PI) / 180;
      pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }

  function starPoints(cx, cy, outerR, innerR, points, rotDeg) {
    const pts = [];
    for (let i = 0; i < points * 2; i += 1) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = ((i * (180 / points) + rotDeg - 90) * Math.PI) / 180;
      pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }

  function hexagonPoints(cx, cy, r, rotDeg) {
    return polygonPoints(cx, cy, r, 6, rotDeg);
  }

  function sacredMarkup(type) {
    if (type === 'hexagon') {
      return (
        '<polygon points="' + hexagonPoints(50, 50, 38, 0) + '" fill="none" stroke="currentColor" stroke-width="0.62"/>' +
        '<polygon points="' + hexagonPoints(50, 50, 22, 0) + '" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="2.8" fill="currentColor"/>'
      );
    }

    if (type === 'octagram') {
      return (
        '<polygon points="' + starPoints(50, 50, 40, 17, 8, 0) + '" fill="none" stroke="currentColor" stroke-width="0.62"/>' +
        '<circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="0.48" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="3" fill="currentColor"/>'
      );
    }

    if (type === 'mandala') {
      let markup = '';
      [42, 30, 18, 8].forEach(function (r) {
        markup += '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="currentColor" stroke-width="0.5"/>';
      });
      for (let i = 0; i < 12; i += 1) {
        const a = (i * 30 * Math.PI) / 180;
        markup += '<line x1="50" y1="50" x2="' + (50 + 42 * Math.cos(a)).toFixed(2) + '" y2="' + (50 + 42 * Math.sin(a)).toFixed(2) + '" stroke="currentColor" stroke-width="0.42"/>';
      }
      for (let i = 0; i < 8; i += 1) {
        const a = ((i * 45 + 22.5 - 90) * Math.PI) / 180;
        const x = 50 + 30 * Math.cos(a);
        const y = 50 + 30 * Math.sin(a);
        markup += '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="4.5" fill="none" stroke="currentColor" stroke-width="0.45"/>';
      }
      return markup;
    }

    if (type === 'metatron') {
      const r = 30;
      const pts = [];
      for (let i = 0; i < 6; i += 1) {
        const a = ((i * 60 - 90) * Math.PI) / 180;
        pts.push([(50 + r * Math.cos(a)).toFixed(2), (50 + r * Math.sin(a)).toFixed(2)]);
      }
      let markup = '<polygon points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="currentColor" stroke-width="0.58"/>';
      pts.forEach(function (p) {
        markup += '<line x1="50" y1="50" x2="' + p[0] + '" y2="' + p[1] + '" stroke="currentColor" stroke-width="0.45"/>';
      });
      markup += '<circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="0.48"/>';
      pts.forEach(function (p) {
        markup += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="none" stroke="currentColor" stroke-width="0.45"/>';
      });
      markup += '<circle cx="50" cy="50" r="4.5" fill="currentColor"/>';
      return markup;
    }

    if (type === 'suncross') {
      return (
        '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="0.58"/>' +
        '<line x1="50" y1="14" x2="50" y2="86" stroke="currentColor" stroke-width="0.55"/>' +
        '<line x1="14" y1="50" x2="86" y2="50" stroke="currentColor" stroke-width="0.55"/>' +
        '<circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" stroke-width="0.48" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="2.8" fill="currentColor"/>'
      );
    }

    if (type === 'rings') {
      return (
        '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="0.55"/>' +
        '<circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.85"/>' +
        '<circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" stroke-width="0.48" opacity="0.75"/>' +
        '<circle cx="50" cy="12" r="3" fill="currentColor" opacity="0.9"/>' +
        '<circle cx="88" cy="50" r="3" fill="currentColor" opacity="0.9"/>' +
        '<circle cx="50" cy="88" r="3" fill="currentColor" opacity="0.9"/>' +
        '<circle cx="12" cy="50" r="3" fill="currentColor" opacity="0.9"/>' +
        '<circle cx="50" cy="50" r="2.5" fill="currentColor"/>'
      );
    }

    if (type === 'octagon') {
      return (
        '<polygon points="' + polygonPoints(50, 50, 38, 8, 0) + '" fill="none" stroke="currentColor" stroke-width="0.62"/>' +
        '<polygon points="' + polygonPoints(50, 50, 24, 8, 0) + '" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.75"/>' +
        '<circle cx="50" cy="50" r="2.8" fill="currentColor"/>'
      );
    }

    if (type === 'wheel') {
      let markup = '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="0.55"/>';
      for (let i = 0; i < 8; i += 1) {
        const a = (i * 45 * Math.PI) / 180;
        markup += '<line x1="50" y1="50" x2="' + (50 + 38 * Math.cos(a)).toFixed(2) + '" y2="' + (50 + 38 * Math.sin(a)).toFixed(2) + '" stroke="currentColor" stroke-width="0.42" opacity="0.8"/>';
      }
      markup += '<circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="0.48" opacity="0.75"/>';
      markup += '<circle cx="50" cy="50" r="2.8" fill="currentColor"/>';
      return markup;
    }

    return (
      '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="0.58"/>' +
      '<line x1="50" y1="14" x2="50" y2="86" stroke="currentColor" stroke-width="0.55"/>' +
      '<line x1="14" y1="50" x2="86" y2="50" stroke="currentColor" stroke-width="0.55"/>' +
      '<circle cx="50" cy="50" r="3" fill="currentColor"/>'
    );
  }

  function createStar(size, y, depth, shape, rotation, isLarge) {
    const node = document.createElement('div');
    node.className = 'wave-node wave-node--' + shape + (isLarge ? ' wave-node--large' : '');
    node.style.setProperty('--node-size', size + 'px');
    node.dataset.y = String(y);
    node.dataset.depth = String(depth);
    node.dataset.rotation = String(rotation);

    const halo = document.createElement('span');
    halo.className = 'wave-node__halo';
    node.appendChild(halo);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'wave-node__svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = sacredMarkup(shape);
    node.appendChild(svg);

    return { node: node, halo: halo };
  }

  function pickX(rng, viewWidth, marginLeft, marginRight) {
    const usable = viewWidth - marginLeft - marginRight;
    if (rng() < 0.45) {
      return marginLeft + rng() * (usable * 0.55);
    }
    return marginLeft + rng() * usable;
  }

  function getFormZone(docHeight, vh) {
    const anchor = document.getElementById('contact') || document.getElementById('book');
    if (anchor) {
      const top = anchor.offsetTop;
      const height = anchor.offsetHeight;
      return {
        top: Math.max(vh * 1.05, top - vh * 0.18),
        bottom: Math.min(docHeight - vh * 0.04, top + height + vh * 0.3)
      };
    }
    return {
      top: docHeight * 0.62,
      bottom: docHeight - vh * 0.06
    };
  }

  function pickY(rng, startY, endY, formZone) {
    if (rng() < 0.34) {
      return formZone.top + rng() * (formZone.bottom - formZone.top);
    }
    return startY + rng() * (endY - startY);
  }

  function addStarAt(rng, x, y) {
    const depth = rng() * 2 - 1;
    const size = pickStarSize(rng);
    const isLarge = size >= 72;
    const shape = SACRED_SHAPES[Math.floor(rng() * SACRED_SHAPES.length)];
    const rotation = Math.floor(rng() * 12) * 30;
    const revealTwist = Math.floor(rng() * 17) - 8;
    const created = createStar(size, y, depth, shape, rotation, isLarge);
    created.node.style.left = x + 'px';
    created.node.style.top = y + 'px';
    created.node.style.setProperty('--depth', String(depthFactor(depth)));
    track.appendChild(created.node);
    stars.push({
      node: created.node,
      halo: created.halo,
      y: y,
      depth: depth,
      rotation: rotation,
      revealTwist: revealTwist,
      factor: depthFactor(depth)
    });
  }

  function scatterStars(docHeight, viewWidth, vh) {
    const rng = seededRandom(Math.floor(viewWidth * 17 + docHeight * 3 + 53));
    const count = clamp(Math.floor(docHeight / 220), 32, 72);
    const marginLeft = viewWidth * 0.035;
    const marginRight = viewWidth * 0.09;
    const startY = vh * 1.12;
    const endY = docHeight - vh * 0.1;
    const formZone = getFormZone(docHeight, vh);
    const formCount = clamp(Math.floor(count * 0.42), 12, 28);
    stars = [];

    for (let i = 0; i < count; i += 1) {
      addStarAt(
        rng,
        pickX(rng, viewWidth, marginLeft, marginRight),
        pickY(rng, startY, endY, formZone)
      );
    }

    for (let i = 0; i < formCount; i += 1) {
      addStarAt(
        rng,
        pickX(rng, viewWidth, marginLeft, marginRight),
        formZone.top + rng() * (formZone.bottom - formZone.top)
      );
    }
  }

  function layoutStars() {
    track.innerHTML = '';
    stars = [];
    const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    const viewWidth = window.innerWidth;
    const vh = window.innerHeight;
    track.style.height = docHeight + 'px';
    scatterStars(docHeight, viewWidth, vh);
  }

  function revealProgress(visualY, vh) {
    const growStart = vh + 24;
    const growEnd = vh * 0.12;

    if (visualY >= growStart) return 0;

    const raw = clamp((growStart - visualY) / (growStart - growEnd), 0, 1);
    return easeInOutSine(raw);
  }

  function applyReveal(star, progress) {
    const twist = (1 - progress) * star.revealTwist;
    const rotation = star.rotation + twist;

    star.node.style.zIndex = progress > 0 ? (star.depth > 0 ? '3' : '1') : '0';
    star.node.style.setProperty('--reveal', progress.toFixed(4));
    star.node.style.setProperty('--twist', rotation.toFixed(2) + 'deg');

    if (star.halo) {
      star.halo.style.opacity = String(progress * 0.92);
      star.halo.style.transform = 'scale(' + (0.25 + progress * 0.75).toFixed(3) + ')';
    }
  }

  function updateStars() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    track.style.transform = 'translate3d(0,' + (-scrollY) + 'px,0)';

    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];
      const visualY = star.y - scrollY;

      if (visualY < -160 || visualY > vh + 160) {
        applyReveal(star, 0);
        continue;
      }

      let progress = revealProgress(visualY, vh);
      if (prefersReducedMotion && progress > 0) progress = 1;

      applyReveal(star, progress);
    }
  }

  function onFrame() {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateStars();
        ticking = false;
      });
      ticking = true;
    }
  }

  function rebuild() {
    layoutStars();
    updateStars();
  }

  let animating = false;
  let scrollEndTimer;

  function onScroll() {
    onFrame();
    if (!animating) {
      animating = true;
      requestAnimationFrame(function loop() {
        updateStars();
        if (animating) requestAnimationFrame(loop);
      });
    }
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(function () {
      animating = false;
    }, 120);
  }

  rebuild();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
})();
