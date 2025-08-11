const toggleBtn = document.querySelector('.theme-toggle');
const body = document.body;
const mainLogo = document.getElementById('main-logo');

function fadeSwap(el, changeFn) {
  el.classList.add('fade-out');
  setTimeout(() => {
    changeFn();
    el.classList.remove('fade-out');
  }, 300); // matches CSS transition
}

function updateThemeAssets() {
  if (body.classList.contains('dark')) {
    // Dark mode → white PNG
    fadeSwap(mainLogo, () => (mainLogo.src = 'resources/Delegate_logo_all_white.png'));
    toggleBtn.textContent = '☀️ Toggle Light Theme';
  } else {
    // Light mode → use the SVG version
    fadeSwap(mainLogo, () => (mainLogo.src = 'resources/Delegate_logo_large.svg'));
    toggleBtn.textContent = '🌙 Toggle Dark Theme';
  }
}

// Initialize from saved theme (optional)
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.toggle('dark', savedTheme === 'dark');
  }
  updateThemeAssets();
});

// Toggle theme
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const newTheme = body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  updateThemeAssets();
});
