/* SIMPLE — project website interactions */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal + one-shot triggers (bars, counters) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-visible');

          el.querySelectorAll('[data-count]').forEach(animateCount);

          obs.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = formatNum(+el.dataset.count) + (el.dataset.suffix || '');
    });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = +el.dataset.count || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatNum(Math.round(target * eased)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function formatNum(n) {
    return n.toLocaleString('en-US');
  }

  /* ---------- Theme toggle (light / dark) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  if (themeToggle) {
    const setPressed = () =>
      themeToggle.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'light'));
    setPressed();
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setPressed();
    });
  }
  // Follow OS changes only when the user hasn't explicitly chosen.
  const media = window.matchMedia('(prefers-color-scheme: light)');
  const onSchemeChange = (e) => {
    try { if (localStorage.getItem('theme')) return; } catch (_) {}
    root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(e.matches));
  };
  if (media.addEventListener) media.addEventListener('change', onSchemeChange);
  else if (media.addListener) media.addListener(onSchemeChange);

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- Copy BibTeX ---------- */
  const copyBtn = document.getElementById('copyBtn');
  const bib = document.getElementById('bibtex');
  if (copyBtn && bib) {
    copyBtn.addEventListener('click', async () => {
      const text = bib.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const r = document.createRange();
        r.selectNode(bib);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        try { document.execCommand('copy'); } catch (_) {}
        sel.removeAllRanges();
      }
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1800);
    });
  }
})();
