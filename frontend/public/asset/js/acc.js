/**
 * Dynamic Account Dashboard
 * Fetches user data and stats from backend
 */

document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem('currentUserId');

  if (!userId) {
    displayGuestView();
    return;
  }

  try {
    showLoadingState();
    
    // Fetch user and score data in parallel
    const [userResponse, scoreResponse] = await Promise.all([
      fetch(`/api/users/${userId}`),
      fetch(`/api/score/${userId}`)
    ]);

    const user = await userResponse.json();
    const scoreData = await scoreResponse.json();

    if (user.success && scoreData.success) {
      displayUserProfile(user.data);
      displayUserStats(scoreData.data);
      hideLoadingState();
    } else {
      displayError('Failed to load user data');
    }
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
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userTitle").textContent = "Developer";
  document.getElementById("userJoined").textContent = 
    "Joined " + new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", 
    { month: "short", year: "numeric" });
  document.getElementById("userAvatar").src = 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
}

/**
 * Display user statistics
 */
function displayUserStats(scoreData) {
  // Overall stats
  document.getElementById("totalWpm").textContent = scoreData.Wpm || 0;
  document.getElementById("totalAcc").textContent = (scoreData.accuracy || 0) + "%";
  document.getElementById("totalTests").textContent = scoreData.totalTests || 0;
  
  // Convert milliseconds to hours:minutes format
  const totalMs = scoreData.totalTime || 0;
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  document.getElementById("totalTime").textContent = `${hours}h ${minutes}m`;

  // Language-specific stats
  const languages = {
    'python': 'py',
    'javascript': 'js',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp'
  };

  Object.entries(languages).forEach(([fullName, shortName]) => {
    const langStats = scoreData.languages?.[fullName] || {};
    
    const wpmElem = document.getElementById(`${shortName}Wpm`);
    const accElem = document.getElementById(`${shortName}Acc`);
    const testsElem = document.getElementById(`${shortName}Tests`);
    
    if (wpmElem) wpmElem.textContent = langStats.wpm || 0;
    if (accElem) accElem.textContent = langStats.accuracy || 0;
    if (testsElem) testsElem.textContent = langStats.tests || 0;
  });
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
  localStorage.removeItem('currentUserId');
  window.location.href = "/";
}