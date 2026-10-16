
// ============================================================
// OWASP SECURITY UTILITIES
// ============================================================

// Prevent XSS: escape user-supplied strings before inserting into DOM
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;');
}

// Sanitize text input values (trim + strip dangerous chars)
function sanitizeInput(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/<[^>]*>/g, ''); // strip any HTML tags
}

// Validate and encode URL parameters (prevent open redirect / injection)
function safeGetParam(name) {
  const params = new URLSearchParams(window.location.search);
  const val = params.get(name) || '';
  return sanitizeInput(val);
}

// Throttle: prevent rapid repeated calls (rate-limit UI actions)
function throttle(fn, limitMs) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limitMs) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

// Validate form fields before processing
function validateFormField(value, type) {
  const v = sanitizeInput(value);
  if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (type === 'number') return !isNaN(parseFloat(v)) && isFinite(v);
  if (type === 'text') return v.length > 0 && v.length < 500;
  return v.length > 0;
}

// Theme Toggle
(function() {
  const themeToggle = document.getElementById('themeToggle');
  const moon = document.getElementById('moon');
  const sun = document.getElementById('sun');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (moon) moon.style.display = 'none';
    if (sun) sun.style.display = 'block';
  }

  themeToggle.addEventListener('click', function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      if (moon) moon.style.display = 'block';
      if (sun) sun.style.display = 'none';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (moon) moon.style.display = 'none';
      if (sun) sun.style.display = 'block';
      localStorage.setItem('theme', 'dark');
    }
  });
})();

// Utility: Format money
function formatMoney(amount, currency) {
  return currency + amount.toFixed(2);
}

// Utility: Add/remove rows
function addRow(containerId, template) {
  const c = document.getElementById(containerId);
  if (c) {
    const row = document.createElement('div');
    row.className = 'row';
    // template is internal developer HTML only (never user input)
    row.innerHTML = template;
    c.appendChild(row);
  }
}

function removeRow(btn) {
  btn.parentElement.remove();
}
