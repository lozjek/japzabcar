/* Portfolio page: brand filter, card grid, lightbox (photo + car-to-car nav),
   and review truncation/pagination. Reads everything from data-* attributes
   already baked into the server-rendered markup — no separate data file. */
(function () {
  var grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  /* ---------- brand filter ---------- */
  var filterWrap = document.getElementById('brandFilter');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.portfolio-card'));
  if (filterWrap) {
    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.brand-btn');
      if (!btn) return;
      filterWrap.querySelectorAll('.brand-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      var brand = btn.getAttribute('data-brand');
      cards.forEach(function (c, i) {
        var show = brand === 'Все' || c.getAttribute('data-brand') === brand;
        c.classList.toggle('is-hidden', !show);
        if (show && window.JZAnim && !window.JZAnim.reduced) {
          c.style.opacity = '0';
          c.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
            { duration: 450, delay: Math.min(i, 12) * 40, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' })
            .finished.then(function () { c.style.opacity = ''; }).catch(function () {});
        }
      });
    });
  }
  function visibleCards() { return cards.filter(function (c) { return !c.classList.contains('is-hidden'); }); }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbName = document.getElementById('lightboxName');
  var lbMeta = document.getElementById('lightboxMeta');
  var lbThumbs = document.getElementById('lightboxThumbs');
  var lbCarLabel = document.getElementById('lightboxCarLabel');
  var lbIndex = -1, gIndex = 0;

  function openLightbox(i) {
    lbIndex = i; gIndex = 0;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    renderLightbox();
  }
  function closeLightbox() {
    lb.hidden = true;
    lbIndex = -1;
    document.body.style.overflow = '';
  }
  function currentCard() { return visibleCards()[lbIndex]; }
  function gallery(card) { return JSON.parse(card.getAttribute('data-gallery') || '[]'); }

  function renderLightbox() {
    var card = currentCard();
    if (!card) return closeLightbox();
    var g = gallery(card);
    lbImg.src = g[gIndex];
    lbImg.alt = card.getAttribute('data-name');
    lbName.textContent = card.getAttribute('data-name');
    lbMeta.textContent = card.getAttribute('data-specs') + ' · ' + card.getAttribute('data-price');
    lbCarLabel.textContent = 'Фото ' + (gIndex + 1) + '/' + g.length + ' · Авто ' + (lbIndex + 1) + '/' + visibleCards().length;
    lbThumbs.innerHTML = '';
    if (g.length > 1) {
      g.forEach(function (src, k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'lightbox-thumb' + (k === gIndex ? ' active' : '');
        b.innerHTML = '<img src="' + src + '" alt="">';
        b.addEventListener('click', function () { gIndex = k; renderLightbox(); });
        lbThumbs.appendChild(b);
      });
    }
    if (window.JZAnim) window.JZAnim.fade(lbImg);
  }

  function gPrev() {
    var card = currentCard(); if (!card) return;
    if (gIndex > 0) { gIndex--; return renderLightbox(); }
    carNav(-1, true);
  }
  function gNext() {
    var card = currentCard(); if (!card) return;
    var g = gallery(card);
    if (gIndex < g.length - 1) { gIndex++; return renderLightbox(); }
    carNav(1, false);
  }
  function carNav(dir, toEnd) {
    var list = visibleCards();
    lbIndex = (lbIndex + dir + list.length) % list.length;
    gIndex = toEnd ? gallery(list[lbIndex]).length - 1 : 0;
    renderLightbox();
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.portfolio-photo-btn');
    if (!btn) return;
    var card = btn.closest('.portfolio-card');
    var i = visibleCards().indexOf(card);
    if (i >= 0) openLightbox(i);
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', function (e) { e.stopPropagation(); gPrev(); });
  document.getElementById('lightboxNext').addEventListener('click', function (e) { e.stopPropagation(); gNext(); });
  document.getElementById('lightboxCarPrev').addEventListener('click', function (e) { e.stopPropagation(); carNav(-1, false); });
  document.getElementById('lightboxCarNext').addEventListener('click', function (e) { e.stopPropagation(); carNav(1, false); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  document.querySelector('.lightbox-head').addEventListener('click', function (e) { e.stopPropagation(); });
  document.querySelector('.lightbox-foot').addEventListener('click', function (e) { e.stopPropagation(); });

  document.addEventListener('keydown', function (e) {
    if (lbIndex < 0) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') gNext();
    else if (e.key === 'ArrowLeft') gPrev();
  });

  /* ---------- reviews: truncate long text + show-all pagination ---------- */
  var reviewsWrap = document.getElementById('reviewsColumns');
  if (reviewsWrap) {
    reviewsWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.review-toggle');
      if (!btn) return;
      var review = btn.closest('.review');
      var open = review.classList.toggle('is-open');
      btn.textContent = open ? 'Свернуть ↑' : 'Читать полностью ↓';
    });
    var showMore = document.getElementById('reviewsShowMore');
    if (showMore) {
      showMore.addEventListener('click', function () {
        reviewsWrap.querySelectorAll('.review.is-extra').forEach(function (r) { r.classList.remove('is-extra'); });
        showMore.classList.add('is-hidden');
      });
    }
  }
})();
