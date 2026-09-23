(function () {
  var carousel = document.getElementById('carousel');
  if (!carousel) return;

  var track = document.getElementById('carouselTrack');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.carousel-slide'));
  var total = slides.length;
  if (!total) return;
  var current = 0;

  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var dotsWrap = document.getElementById('carouselDots');
  var counterEl = document.getElementById('carouselCounter');

  var dots = slides.map(function (slide, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', 'Автомобиль ' + (i + 1) + ' из ' + total);
    dot.addEventListener('click', function () { goTo(i, i > current ? 'next' : 'prev'); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render(dir) {
    slides.forEach(function (slide, i) {
      var isActive = i === current;
      slide.classList.remove('dir-next', 'dir-prev');
      if (isActive && dir) slide.classList.add(dir === 'next' ? 'dir-next' : 'dir-prev');
      slide.classList.toggle('active', isActive);
    });
    dots.forEach(function (dot, i) { dot.classList.toggle('active', i === current); });
    counterEl.textContent = (current + 1) + ' / ' + total;
    var activeDot = dots[current];
    if (dir && activeDot && activeDot.scrollIntoView) {
      activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function goTo(i, dir) {
    current = (i + total) % total;
    render(dir);
  }

  function next() { goTo(current + 1, 'next'); }
  function prev() { goTo(current - 1, 'prev'); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  function attachSwipe(el, onSwipe) {
    var startX = null, startY = null;
    el.addEventListener('touchstart', function (e) {
      var t = e.changedTouches[0];
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        onSwipe(dx < 0 ? 'left' : 'right');
      }
    }, { passive: true });
  }

  attachSwipe(track, function (dir) { if (dir === 'left') next(); else prev(); });

  // ---------- lightbox ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxClose = document.getElementById('lightboxClose');

  var lbGallery = [];
  var lbIndex = 0;
  var closeTimer = null;

  function renderLightbox() {
    lightboxImg.src = lbGallery[lbIndex];
    lightboxImg.alt = 'Фото ' + (lbIndex + 1) + ' из ' + lbGallery.length;
    var multi = lbGallery.length > 1;
    lightboxPrev.style.display = multi ? '' : 'none';
    lightboxNext.style.display = multi ? '' : 'none';
    lightboxCounter.style.display = multi ? '' : 'none';
    lightboxCounter.textContent = (lbIndex + 1) + ' / ' + lbGallery.length;
    // restart the fade/scale-in animation on the (reused) img element
    lightboxImg.classList.remove('pop');
    void lightboxImg.offsetWidth;
    lightboxImg.classList.add('pop');
  }

  function openLightbox(gallery, startIndex) {
    if (!gallery || !gallery.length) return;
    clearTimeout(closeTimer);
    lbGallery = gallery;
    lbIndex = startIndex || 0;
    lightbox.hidden = false;
    lightbox.classList.remove('closing');
    renderLightbox();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.classList.add('closing');
    closeTimer = setTimeout(function () {
      lightbox.hidden = true;
      lightbox.classList.remove('closing');
      document.body.style.overflow = '';
    }, 180);
  }

  function lbNext() { lbIndex = (lbIndex + 1) % lbGallery.length; renderLightbox(); }
  function lbPrev() { lbIndex = (lbIndex - 1 + lbGallery.length) % lbGallery.length; renderLightbox(); }

  lightboxNext.addEventListener('click', lbNext);
  lightboxPrev.addEventListener('click', lbPrev);
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  attachSwipe(lightbox, function (dir) { if (dir === 'left') lbNext(); else lbPrev(); });

  slides.forEach(function (slide) {
    var btn = slide.querySelector('.slide-photo');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var gallery = [];
      try { gallery = JSON.parse(btn.getAttribute('data-gallery') || '[]'); } catch (e) {}
      openLightbox(gallery, 0);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.hidden) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') lbNext();
      else if (e.key === 'ArrowLeft') lbPrev();
    } else {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
  });

  render();
})();
