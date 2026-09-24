/* Mobile burger menu: opens a full-width dropdown panel, closes on Escape,
   backdrop-less click, or navigating away. Desktop nav is untouched — this
   only matters below the header's mobile breakpoint. */
(function () {
  var btn = document.getElementById('burgerBtn');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function open() {
    menu.hidden = false;
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.hidden = true;
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    if (menu.hidden) open(); else close();
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) close();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && !menu.hidden) close();
  });
})();
