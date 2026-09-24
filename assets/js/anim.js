/* Shared Web Animations API helpers. Ported from the Modernist design handoff
   (design/jz-data.js window.JZAnim) — respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';

  window.JZAnim = {
    hero: function (root) {
      if (!root || reduce) return;
      root.querySelectorAll('[data-hero]').forEach(function (el, i) {
        el.animate(
          [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
          { duration: 800, delay: 80 + i * 110, easing: EASE, fill: 'backwards' }
        );
      });
      root.querySelectorAll('[data-kenburns]').forEach(function (el) {
        el.animate(
          [{ transform: 'scale(1.12)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
          { duration: 1600, easing: EASE, fill: 'backwards' }
        );
      });
    },
    reveal: function (root) {
      if (!root || reduce || !('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          var el = en.target;
          var kids = el.hasAttribute('data-stagger') ? Array.prototype.slice.call(el.children) : [el];
          kids.forEach(function (k, i) {
            k.style.opacity = '';
            k.animate(
              [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }],
              { duration: 700, delay: i * 90, easing: EASE, fill: 'backwards' }
            );
          });
          if (el.hasAttribute('data-stagger')) el.style.opacity = '';
        });
      }, { threshold: 0.15 });
      root.querySelectorAll('[data-reveal], [data-stagger]').forEach(function (el) {
        if (el.__jz) return;
        el.__jz = 1;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) return;
        if (el.hasAttribute('data-stagger')) {
          Array.prototype.forEach.call(el.children, function (k) { k.style.opacity = '0'; });
        } else {
          el.style.opacity = '0';
        }
        io.observe(el);
      });
    },
    count: function (el) {
      if (!el || reduce) return;
      var to = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    },
    swap: function (el, dir) {
      if (!el || reduce) return;
      el.animate(
        [{ opacity: 0, transform: 'translateX(' + (dir * 48) + 'px) scale(1.03)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, easing: EASE }
      );
    },
    rise: function (el) {
      if (!el || reduce) return;
      el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE });
    },
    fade: function (el) {
      if (!el || reduce) return;
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
    },
    reduced: reduce
  };
})();
