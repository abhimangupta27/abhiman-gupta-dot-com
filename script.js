// Loader: lock scroll, then disintegrate after ray animation
document.documentElement.classList.add('loading');

setTimeout(function() {
  var loader = document.getElementById('loader');
  var svg = loader.querySelector('svg');
  var canvas = document.getElementById('loader-canvas');
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  // Map SVG coordinates to screen coordinates
  var svgRect = svg.getBoundingClientRect();
  var vb = svg.viewBox.baseVal;
  function svgToScreen(sx, sy) {
    return {
      x: svgRect.left + (sx - vb.x) / vb.width * svgRect.width,
      y: svgRect.top + (sy - vb.y) / vb.height * svgRect.height
    };
  }

  // Sample points along all SVG paths
  var paths = svg.querySelectorAll('path');
  var particles = [];
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var len = path.getTotalLength();
    var step = 3; // sample every 3 SVG units
    for (var d = 0; d < len; d += step) {
      var pt = path.getPointAtLength(d);
      var screen = svgToScreen(pt.x, pt.y);
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.75 + Math.random() * 1.5;
      particles.push({
        x: screen.x,
        y: screen.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.75,
        size: 1.5 + Math.random() * 2,
        alpha: 1,
        decay: 0.01 + Math.random() * 0.01
      });
    }
  }

  // Hide SVG, remove loader background so canvas controls visibility
  svg.style.display = 'none';
  loader.style.background = 'none';
  loader.style.pointerEvents = 'none';

  var bgAlpha = 1;
  var w = canvas.width / dpr;
  var h = canvas.height / dpr;
  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Fade background
    bgAlpha = Math.max(0, bgAlpha - 0.015);
    if (bgAlpha > 0) {
      ctx.globalAlpha = bgAlpha;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
    }

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (p.alpha <= 0) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.alpha = Math.max(0, p.alpha - p.decay);
      if (p.alpha <= 0) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
  document.documentElement.classList.remove('loading');

  // Clean up after particles fully fade (~1.5s)
  setTimeout(function() { loader.classList.add('hidden'); }, 3000);
}, 3500);

(function () {
  var emailButton = document.querySelector('[data-email-reveal]');
  if (!emailButton) return;

  emailButton.addEventListener('click', function () {
    var address = window.atob('aGVsbG9AYWJoaW1hbmd1cHRhLmNvbQ==');
    var link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.className = 'email-button';
    link.textContent = address;
    emailButton.replaceWith(link);
  });
})();
