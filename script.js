const toggleBtn = document.querySelector('.theme-toggle');
const body = document.body;
const mainLogo = document.getElementById('main-logo');
const logoLink = document.querySelector('.main-logo-link');
const headline = document.querySelector('header h1');
const videoTargets = document.querySelectorAll('[data-animate]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Always start at top on load/refresh/back-forward ---- */
function forceTop() {
  // Prevent restored scroll position (fallback if <head> snippet didn't run early)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Jump to top now
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  // Some browsers may still restore after load; ensure once more
  window.addEventListener('load', () => {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
  }, { once: true });

  // Handle bfcache restores (Safari/Firefox)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, { once: true });
}

/* Fade-swap helper for logo */
function fadeSwap(el, changeFn) {
  el.classList.add('fade-out');
  setTimeout(() => {
    changeFn();
    el.classList.remove('fade-out');
  }, 300);
}

/* Theme assets (logo + toggle label) */
function updateThemeAssets() {
  if (body.classList.contains('dark')) {
    if (mainLogo) fadeSwap(mainLogo, () => (mainLogo.src = 'resources/Delegate_logo_all_white.png'));
    toggleBtn.textContent = '☀️ Toggle Light Theme';
  } else {
    if (mainLogo) fadeSwap(mainLogo, () => (mainLogo.src = 'resources/Delegate_logo_large.svg'));
    toggleBtn.textContent = '🌙 Toggle Dark Theme';
  }
}

/* FLIP intro using same logo + headline nodes */
function centerDelta(el, yOffset = 0) {
  const r = el.getBoundingClientRect();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = cx - (r.left + r.width / 2);
  const dy = cy - (r.top + r.height / 2) + yOffset;
  return { dx, dy };
}

function animateIntro() {
  if (!logoLink || !headline) return finishIntro();

  const logoDelta = centerDelta(logoLink, -24);
  const h1Delta   = centerDelta(headline,  24);

  [[logoLink, logoDelta],[headline, h1Delta]].forEach(([el,{dx,dy}]) => {
    el.style.willChange = 'transform, opacity';
    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.985)`;
    el.style.opacity = '0';
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      [logoLink, headline].forEach(el => {
        el.style.transition = 'transform 720ms cubic-bezier(.2,.7,.2,1), opacity 620ms ease';
        el.style.transform = 'translate(0, 0) scale(1)';
        el.style.opacity = '1';
      });
      setTimeout(() => { cleanupIntroStyles(); finishIntro(); }, 820);
    });
  });
}

function cleanupIntroStyles() {
  [logoLink, headline].forEach(el => {
    el.style.willChange = '';
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
  });
}

function finishIntro() {
  body.classList.remove('intro-active');
  body.classList.add('intro-done');
}

/* Scroll-in for video (IntersectionObserver) */
function setupScrollIn() {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    videoTargets.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  videoTargets.forEach(el => io.observe(el));
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  forceTop(); // <-- ensure we start at the top before measuring for FLIP

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) body.classList.toggle('dark', savedTheme === 'dark');

  updateThemeAssets();

  if (prefersReducedMotion) {
    finishIntro();
  } else {
    const start = () => setTimeout(animateIntro, 60);
    if (mainLogo && mainLogo.decode) {
      mainLogo.decode().then(start).catch(start);
    } else {
      start();
    }
  }

  setupScrollIn();
});

/* Theme toggle */
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeAssets();
});
