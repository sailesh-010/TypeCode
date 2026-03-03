/**
 * Auth Guard – redirects unauthenticated users to /login
 * Include this script on pages that require login (account, settings).
 * Public pages (home, about, practice, leaderboard, login, signup) should NOT include this.
 */
(function () {
  // Hide page until auth is confirmed to prevent flash of content
  document.documentElement.style.visibility = 'hidden';

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('currentUserId');

  if (!token || !userId) {
    window.location.replace('/login');
    return;
  }

  // Show the page – token exists locally
  document.documentElement.style.visibility = '';

  // Async validation: if token is expired/invalid, redirect on next interaction
  fetch('/api/auth/profile', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser');
        window.location.replace('/login');
      }
    })
    .catch(() => {
      // Network error – allow page to stay visible
    });
})();
