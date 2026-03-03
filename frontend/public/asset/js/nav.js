// Navigation authentication state handler
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem('currentUserId');
  const isLoggedIn = !!userId;
  
  // Get the navbar element
  const navbar = document.getElementById('navbar');
  
  // Hide navbar on login and signup pages
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/signup') {
    if (navbar) {
      navbar.style.display = 'none';
    }
    return; // Don't process nav buttons on these pages
  }

  // Get navigation elements - both desktop and mobile
  const loginBtns = document.querySelectorAll('a[href="/login"]');
  const signupBtns = document.querySelectorAll('a[href="/signup"]');
  const settingsBtns = document.querySelectorAll('a[href="/settings"]');
  const accountBtns = document.querySelectorAll('a[href="/account"]');
  
  // Get the divider line (between auth buttons and settings/account)
  const dividers = document.querySelectorAll('.w-px.h-6.bg-slate-800');

  if (isLoggedIn) {
    // User is logged in - hide login/signup, show settings/account
    loginBtns.forEach(btn => btn.style.display = 'none');
    signupBtns.forEach(btn => btn.style.display = 'none');
    
    // Show settings and account buttons
    settingsBtns.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.style.display = '';
      }
    });
    accountBtns.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.style.display = '';
      }
    });
    
    // Hide divider since login/signup are hidden
    dividers.forEach(div => div.style.display = 'none');
    
  } else {
    // User is not logged in - show login/signup, hide settings/account
    loginBtns.forEach(btn => btn.style.display = '');
    signupBtns.forEach(btn => btn.style.display = '');
    
    // Hide settings and account buttons
    settingsBtns.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.style.display = 'none';
      }
    });
    accountBtns.forEach(btn => {
      if (btn.parentElement) {
        btn.parentElement.style.display = 'none';
      }
    });
    
    // Show divider when login/signup are visible
    dividers.forEach(div => div.style.display = '');
  }
});
