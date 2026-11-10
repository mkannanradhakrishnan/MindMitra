/**
 * MindMitra — Main Shell & Application Controller
 * Handles sidebar rendering, mobile navigation, toast alerts, modals, and common UI helpers.
 */

(function () {
  // SVG Icons collection
  const ICONS = {
    heartHandshake: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>`,
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    checkIn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
    sparkles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    chat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
    mentor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    crisis: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
    settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
    menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    checkCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    battery: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/></svg>`,
    shieldCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
    phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  };

  const NAV_ITEMS = [
    { href: 'dashboard.html', label: 'Dashboard', icon: ICONS.dashboard },
    { href: 'check-in.html', label: 'Daily check-in', icon: ICONS.checkIn },
    { href: 'cbt.html', label: '2-min reset', icon: ICONS.sparkles },
    { href: 'chat.html', label: 'AI Assistant', icon: ICONS.chat },
    { href: 'mentor.html', label: 'Mentor queue', icon: ICONS.mentor },
    { href: 'crisis.html', label: 'Get urgent help', icon: ICONS.crisis, extraClass: 'nav-crisis' },
  ];

  function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename;
  }

  function initShell() {
    const sidebarPlaceholder = document.getElementById('app-sidebar-placeholder');
    const mobileHeaderPlaceholder = document.getElementById('mobile-header-placeholder');
    if (!sidebarPlaceholder) return;

    let user = window.MindMitraStorage ? window.MindMitraStorage.getUser() : null;
    const currentPage = getCurrentPageName();

    // If not authenticated and on a protected dashboard/app page, redirect to auth.html
    if (!user && currentPage !== 'index.html' && currentPage !== 'auth.html' && currentPage !== 'login.html') {
      window.location.assign('auth.html');
      return;
    }

    if (!user) {
      user = { name: 'Student', role: 'student', alias: 'Anonymous' };
    }

    // Render Sidebar HTML
    sidebarPlaceholder.innerHTML = `
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <aside class="app-sidebar" id="app-sidebar">
        <a href="dashboard.html" class="sidebar-brand">
          <span class="brand-icon">${ICONS.heartHandshake}</span>
          <span>MindMitra</span>
        </a>

        <div class="user-badge">
          <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
          <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-role">${user.role === 'mentor' ? 'Peer Mentor' : 'Student'} · ${user.alias}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.href;
            return `
              <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''} ${item.extraClass || ''}">
                ${item.icon}
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>

        <div class="sidebar-footer">
          <a href="settings.html" class="nav-item ${currentPage === 'settings.html' ? 'active' : ''}">
            ${ICONS.settings}
            <span>Settings</span>
          </a>
          <button type="button" class="nav-item" id="btn-logout" style="background: none; border: none; text-align: left; width: 100%; cursor: pointer;">
            ${ICONS.logout}
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    `;

    // Render Mobile Topbar
    if (mobileHeaderPlaceholder) {
      mobileHeaderPlaceholder.innerHTML = `
        <div class="mobile-topbar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-sidebar" aria-label="Open navigation menu">
              ${ICONS.menu}
            </button>
            <a href="dashboard.html" style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.15rem; color: var(--ink);">
              <span class="brand-icon" style="width: 28px; height: 28px; border-radius: 8px;">${ICONS.heartHandshake}</span>
              MindMitra
            </a>
          </div>
          <a href="crisis.html" class="btn btn-sm btn-danger" style="padding: 6px 12px; font-size: 0.75rem;">
            Urgent Help
          </a>
        </div>
      `;
    }

    // Bind sidebar toggling
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const toggleBtn = document.getElementById('btn-toggle-sidebar');

    function openSidebar() {
      sidebar.classList.add('open');
      backdrop.classList.add('active');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('active');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // Bind Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (window.MindMitraStorage) {
          window.MindMitraStorage.logout();
        }
        window.location.assign('auth.html');
      });
    }
  }

  // Toast System
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'danger') toast.style.background = 'var(--coral-dark)';
    if (type === 'success') toast.style.background = 'var(--sage-dark)';

    toast.innerHTML = `
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initShell();
  });

  window.MindMitraApp = {
    icons: ICONS,
    toast: showToast,
    getCurrentPageName,
  };
})();
