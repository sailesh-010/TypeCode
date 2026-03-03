/**
 * Dynamic Account Dashboard
 * Fetches user data and stats from backend
 */

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('currentUserId');

  if (!token || !userId) {
    displayGuestView();
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    showLoadingState();

    // Fetch profile and stats in parallel using authenticated endpoints
    const [profileRes, statsRes] = await Promise.all([
      fetch('/api/auth/profile', { headers: authHeaders }),
      fetch('/api/user/stats', { headers: authHeaders })
    ]);

    const profileData = await profileRes.json();
    const statsData = await statsRes.json();

    if (profileData.success) {
      displayUserProfile(profileData.user);
    } else {
      // Token may be expired — clear auth and show guest view
      localStorage.removeItem('token');
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUser');
      displayGuestView();
      return;
    }

    if (statsData.success) {
      displayUserStats(statsData.stats);
    }

    hideLoadingState();
  } catch (error) {
    console.error("Error fetching user data:", error);
    displayError('Error loading profile. Please refresh the page.');
  }
});

/**
 * Display guest view when user is not logged in
 */
function displayGuestView() {
  document.getElementById("userName").textContent = "Guest User";
  document.getElementById("userEmail").textContent = "Please log in";
  document.getElementById("userTitle").textContent = "Guest";
  document.getElementById("userJoined").textContent = "";
  document.getElementById("userAvatar").src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
  
  // Clear stats
  const stats = ['totalWpm', 'totalAcc', 'totalTests', 'totalTime'];
  stats.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.innerHTML = '<span class="text-slate-400">— <a href="/login" class="text-teal-400 hover:text-teal-300">Log in</a></span>';
    }
  });
}

/**
 * Display user profile information
 */
function displayUserProfile(user) {
  const displayName = user.fullName || user.username || 'User';
  document.getElementById("userName").textContent = displayName;
  document.getElementById("userEmail").textContent = user.email || '';
  document.getElementById("userTitle").textContent = user.role === 'admin' ? 'Admin' : 'Developer';
  document.getElementById("userJoined").textContent = 
    "Joined " + new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", 
    { month: "short", year: "numeric" });
  document.getElementById("userAvatar").src = 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
}

/**
 * Display user statistics
 */
function displayUserStats(stats) {
  // Overall stats  (backend returns: averageWPM, averageAccuracy, totalTests, bestWPM, totalWordsTyped, totalErrors)
  document.getElementById("totalWpm").textContent = stats.averageWPM || 0;
  document.getElementById("totalAcc").textContent = (stats.averageAccuracy || 0) + "%";
  document.getElementById("totalTests").textContent = stats.totalTests || 0;

  // Estimate time from totalTests * average duration (no totalTime field in backend yet)
  const estimatedMinutes = (stats.totalTests || 0) * 1; // ~1 min per test
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  document.getElementById("totalTime").textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/**
 * Show loading state
 */
function showLoadingState() {
  const profileSection = document.querySelector('[class*="profile"]');
  if (profileSection) {
    profileSection.style.opacity = '0.6';
    profileSection.style.pointerEvents = 'none';
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const profileSection = document.querySelector('[class*="profile"]');
  if (profileSection) {
    profileSection.style.opacity = '1';
    profileSection.style.pointerEvents = 'auto';
  }
}

/**
 * Display error message
 */
function displayError(message) {
  hideLoadingState();
  console.error(message);
  document.getElementById("userName").textContent = "Error";
  document.getElementById("userEmail").textContent = message;
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUserId');
  localStorage.removeItem('currentUser');
  window.location.href = "/login";
}