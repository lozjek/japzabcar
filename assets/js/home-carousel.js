/* Homepage single-car carousel: autoplay + progress bar, thumbnails,
   ken-burns-free swap animation, keyboard + swipe. Server-rendered slides
   (one per car, in assets/photos data-gallery) — this only toggles which is shown. */
(function () {
  var wrap = document.getElementById('carouselWrap');
  if (!wrap) return;
  var slides = Array.prototype.slice.call(wrap.querySelectorAll('.carousel-slide'));
  var total = slides.length;
  if (!total) return;
  var bar = document.getElementById('carouselBar');
  var current = 0, paused = false, barAnim = null, timer = null;

  function activeSlide() { return slides[current]; }

  function attachSwipe(el, onSwipe) {
    var startX = null, startY = null;
    el.addEventListener('touchstart', function (e) {
      var t = e.changedTouches[0]; startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var t = e.changedTouches[0], dx = t.clientX - startX, dy = t.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 'left' : 'right');
    }, { passive: true });
  }

  function runBar() {
    if (!bar) return;
    if (barAnim) barAnim.cancel();
    barAnim = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 6000, easing: 'linear', fill: 'forwards' });
    if (paused) barAnim.pause();
  }

  function render(dir) {
    slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
    var slide = activeSlide();
    slide.dataset.gidx = '0';
    updatePhoto(slide);
    if (window.JZAnim && dir) {
      window.JZAnim.swap(slide.querySelector('.slide-photo'), dir);
      window.JZAnim.rise(slide.querySelector('.slide-info'));
    }
    runBar();
  }

  function goTo(i, dir) { current = (i + total) % total; render(dir); }
  function next() { goTo(current + 1, 1); }
  function prev() { goTo(current - 1, -1); }

  function updatePhoto(slide) {
    var gallery = JSON.parse(slide.getAttribute('data-gallery') || '[]');
    var g = parseInt(slide.dataset.gidx || '0', 10);
    var img = slide.querySelector('.slide-photo img');
    if (img && gallery[g]) img.src = gallery[g];
    var badge = slide.querySelector('.slide-photo-badge');
    if (badge) badge.textContent = 'ФОТО ' + (g + 1) + ' / ' + gallery.length;
    slide.querySelectorAll('.slide-thumb').forEach(function (t, i) {
      t.classList.toggle('active', i === g);
    });
  }

  wrap.addEventListener('click', function (e) {
    var thumb = e.target.closest('.slide-thumb');
    if (thumb) {
      var slide = thumb.closest('.carousel-slide');
      var i = Array.prototype.indexOf.call(thumb.parentNode.children, thumb);
      slide.dataset.gidx = String(i);
      updatePhoto(slide);
      if (window.JZAnim) window.JZAnim.fade(slide.querySelector('.slide-photo img'));
      return;
    }
    if (e.target.closest('.slide-prev')) return prev();
    if (e.target.closest('.slide-next')) return next();
  });

  attachSwipe(wrap, function (dir) { if (dir === 'left') next(); else prev(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });

  wrap.addEventListener('mouseenter', function () { paused = true; if (barAnim) barAnim.pause(); });
  wrap.addEventListener('mouseleave', function () { paused = false; if (barAnim) barAnim.play(); });

  render();
  timer = setInterval(function () { if (!paused) next(); }, 6000);
})();
