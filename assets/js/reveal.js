(function () {
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // group children of grid-like containers so they stagger in as a set
  var staggerContainers = document.querySelectorAll('.steps, .cards-grid, .reviews-grid');
  staggerContainers.forEach(function (container) {
    Array.prototype.forEach.call(container.children, function (child, i) {
      child.classList.add('reveal');
      if (!prefersReduced) {
        child.style.transitionDelay = (Math.min(i, 8) * 50) + 'ms';
      }
    });
  });

  document.querySelectorAll('.section-title, .section-subtitle').forEach(function (el) {
    el.classList.add('reveal');
  });

  var els = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
