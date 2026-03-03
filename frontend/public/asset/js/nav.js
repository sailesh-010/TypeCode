// Navigation authentication state handler
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('currentUserId');
  const isLoggedIn = !!(token && userId);

  // Get the navbar element
  const navbar = document.getElementById('navbar');

  // Hide navbar on login and signup pages
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/signup') {
    if (navbar) {
      navbar.style.display = 'none';
    }
    return;
  }

  // Navigation elements
  const loginBtns = document.querySelectorAll('a[href="/login"]');
  const signupBtns = document.querySelectorAll('a[href="/signup"]');
  const dividers = document.querySelectorAll('.w-px.h-6.bg-slate-800');

  // Settings & account buttons are ALWAYS visible.
  // Auth-guard on those pages handles the redirect if not logged in.

  if (isLoggedIn) {
    // Logged in — hide login/signup buttons and divider
    loginBtns.forEach(btn => btn.style.display = 'none');
    signupBtns.forEach(btn => btn.style.display = 'none');
    dividers.forEach(div => div.style.display = 'none');
  } else {
    // Not logged in — show login/signup buttons and divider
    loginBtns.forEach(btn => btn.style.display = '');
    signupBtns.forEach(btn => btn.style.display = '');
    dividers.forEach(div => div.style.display = '');
  }
});
