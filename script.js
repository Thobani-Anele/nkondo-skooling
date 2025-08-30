// Enhancements: theme toggle, mobile nav, year injection.
// If you already have a script.js in the repo, we can merge; this is an enhanced version.

(function () {
  const themeToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');

  // Apply persisted theme
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('nk-theme');
  if (savedTheme === 'light') root.classList.add('light');

  // Theme toggle behavior
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.classList.toggle('light');
      localStorage.setItem('nk-theme', isLight ? 'light' : 'dark');
      themeToggle.textContent = isLight ? '🌤️' : '🌙';
    });
  }

  // Mobile nav toggle
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // Inject current year in all footers
  const year = new Date().getFullYear();
  ['year','year2','year3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = year;
  });

  // Small enhancement: add keyboard shortcut "t" to toggle theme for power users
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't') {
      if (themeToggle) themeToggle.click();
    }
  });
})();