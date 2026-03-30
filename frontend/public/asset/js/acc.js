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

    // Load language-specific scores
    await loadLanguageScores();

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
 * Fetch and display language-specific scores
 */
async function loadLanguageScores() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('currentUserId');

  if (!token || !userId) {
    return;
  }

  try {
    const response = await fetch('/api/user/scores', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success && result.scores) {
      displayLanguageScores(result.scores);
    }
  } catch (error) {
    console.error('Error fetching language scores:', error);
  }
}

/**
 * Display language-specific scores
 */
function displayLanguageScores(scores) {
  console.log('Loading language scores:', scores);
  
  // Group scores by language (testType field contains language info)
  const languageStats = {
    'Python': { wpm: [], accuracy: [], count: 0 },
    'JavaScript': { wpm: [], accuracy: [], count: 0 },
    'Java': { wpm: [], accuracy: [], count: 0 },
    'C': { wpm: [], accuracy: [], count: 0 },
    'C++': { wpm: [], accuracy: [], count: 0 }
  };

  // Process scores - testType now contains the language
  scores.forEach(score => {
    const language = score.testType || 'JavaScript';
    
    console.log(`Score testType: "${language}"`);
    
    // Only count if it's a valid language
    if (languageStats[language]) {
      languageStats[language].wpm.push(score.wpm);
      languageStats[language].accuracy.push(score.accuracy);
      languageStats[language].count++;
    } else {
      console.log(`Unknown language: "${language}", skipping score`);
    }
  });

  console.log('Language stats:', languageStats);

  // Calculate and display averages for each language
  updateLanguageDisplay('py', languageStats['Python']);
  updateLanguageDisplay('js', languageStats['JavaScript']);
  updateLanguageDisplay('java', languageStats['Java']);
  updateLanguageDisplay('c', languageStats['C']);
  updateLanguageDisplay('cpp', languageStats['C++']);
}

/**
 * Update language display with calculated stats
 */
function updateLanguageDisplay(langPrefix, stats) {
  const avgWpm = stats.count > 0 
    ? Math.round(stats.wpm.reduce((a, b) => a + b, 0) / stats.count) 
    : 0;
  const avgAcc = stats.count > 0 
    ? Math.round(stats.accuracy.reduce((a, b) => a + b, 0) / stats.count) 
    : 0;

  const wpmElement = document.getElementById(`${langPrefix}Wpm`);
  const accElement = document.getElementById(`${langPrefix}Acc`);
  const testsElement = document.getElementById(`${langPrefix}Tests`);

  if (wpmElement) wpmElement.textContent = avgWpm;
  if (accElement) accElement.textContent = avgAcc;
  if (testsElement) testsElement.textContent = stats.count;
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