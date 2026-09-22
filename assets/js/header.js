(function () {
  var header = document.querySelector('header.site');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
