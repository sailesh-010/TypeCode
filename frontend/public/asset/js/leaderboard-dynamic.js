/**
 * Dynamic Leaderboard System
 * Fetches user ranking and leaderboard data from backend
 */

document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem('currentUserId');
  const params = new URLSearchParams(window.location.search);
  const shouldRefresh = params.has('refresh');
  
  console.log('Leaderboard loaded. User ID:', userId, 'Refresh:', shouldRefresh);
  
  // Load leaderboard rankings
  await loadLeaderboard();
  
  // If user is logged in, load their ranking info
  if (userId) {
    console.log('User is logged in, loading ranking...');
    await loadUserRanking(userId);
    // Remove refresh parameter from URL after loading
    if (shouldRefresh) {
      window.history.replaceState({}, document.title, '/leaderboard');
    }
  } else {
    console.log('User is not logged in, showing guest view');
    displayGuestRankingInfo();
  }
});

/**
 * Load full leaderboard with pagination
 */
async function loadLeaderboard(limit = 10, skip = 0) {
  try {
    console.log('Fetching leaderboard...');
    
    // Use the main leaderboard endpoint that we know works
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    const result = await response.json();
    
    console.log('Leaderboard API response:', result);
    
    if (result.success && result.data) {
      let leaderboardData = [];
      
      // Handle different response formats
      if (Array.isArray(result.data.leaderboard)) {
        // Format: { success: true, data: { leaderboard: [...] } }
        leaderboardData = result.data.leaderboard.map((entry, index) => ({
          rank: entry.rank || (index + 1),
          name: entry.username || entry.name || 'Unknown',
          wpm: entry.bestWPM || entry.wpm || 0,
          accuracy: entry.averageAccuracy || entry.accuracy || 0,
          userId: entry.userId
        }));
      } else if (Array.isArray(result.data)) {
        // Format: { success: true, data: [...] }
        leaderboardData = result.data.map((entry, index) => ({
          rank: entry.rank || (index + 1),
          name: entry.username || entry.name || 'Unknown',
          wpm: entry.bestWPM || entry.wpm || 0,
          accuracy: entry.averageAccuracy || entry.accuracy || 0,
          userId: entry.userId
        }));
      }
      
      console.log('Transformed leaderboard data:', leaderboardData);
      
      if (leaderboardData.length > 0) {
        renderLeaderboard(leaderboardData);
        updateLoadMoreButton(leaderboardData.length, result.data.count || leaderboardData.length);
      } else {
        console.log('No leaderboard entries found');
        renderLeaderboard([]);
      }
    } else {
      console.error('Invalid leaderboard response:', result);
      renderLeaderboard([]);
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    showLeaderboardError();
  }
}

/**
 * Load user's ranking information
 */
async function loadUserRanking(userId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    displayGuestRankingInfo();
    return;
  }

  try {
    console.log('Loading ranking for user:', userId);
    
    // Fetch user stats (same as profile page)
    const statsResponse = await fetch('/api/user/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const statsResult = await statsResponse.json();
    
    console.log('Stats result:', statsResult);
    
    if (!statsResult.success || !statsResult.stats || statsResult.stats.totalTests === 0) {
      console.log('User has no scores yet');
      displayNoRankingMessage();
      return;
    }
    
    // Fetch full leaderboard to calculate rank
    const leaderboardResponse = await fetch('/api/leaderboard?limit=1000');
    const leaderboardResult = await leaderboardResponse.json();
    
    console.log('Leaderboard result:', leaderboardResult);
    
    let rank = '-';
    let percentile = 0;
    
    if (leaderboardResult.success && leaderboardResult.data && leaderboardResult.data.leaderboard) {
      const leaderboard = leaderboardResult.data.leaderboard;
      
      // Find user's position in leaderboard
      const userPosition = leaderboard.findIndex(entry => entry.userId === parseInt(userId));
      
      if (userPosition !== -1) {
        rank = userPosition + 1; // 1-indexed rank
        
        // Calculate percentile (higher is better)
        const totalUsers = leaderboard.length;
        percentile = totalUsers > 0 ? Math.round((1 - userPosition / totalUsers) * 100) : 100;
      } else {
        // User not in leaderboard yet, calculate rank based on bestWPM
        const userBestWPM = statsResult.stats.bestWPM || 0;
        let betterUsers = 0;
        
        for (const entry of leaderboard) {
          if (entry.bestWPM > userBestWPM) {
            betterUsers++;
          }
        }
        
        rank = betterUsers + 1;
        const totalUsers = leaderboard.length + 1; // Include current user
        percentile = Math.round((1 - betterUsers / totalUsers) * 100);
      }
    }
    
    // Combine stats and rank data
    const userData = {
      rank: rank,
      name: statsResult.stats.username || 'User',
      wpm: statsResult.stats.bestWPM || 0,
      accuracy: statsResult.stats.averageAccuracy || 0,
      percentile: percentile
    };
    
    console.log('Final user data:', userData);
    
    displayUserRankingInfo(userData);
  } catch (error) {
    console.error('Error loading user ranking:', error);
    displayNoRankingMessage();
  }
}

/**
 * Display message when user has no ranking yet
 */
function displayNoRankingMessage() {
  const rankingContainer = document.getElementById('user-ranking-container');
  
  if (!rankingContainer) {
    return;
  }

  const html = `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center">
          <div class="font-mono text-slate-600 font-bold text-3xl">-</div>
          <div class="text-xs text-slate-500 uppercase">Your Rank</div>
        </div>
        <div class="w-px h-12 bg-slate-700"></div>
        <div class="flex flex-col">
          <span class="text-white font-semibold text-lg">Complete a challenge to get ranked!</span>
          <span class="text-xs text-slate-400">
            Your rank will appear here after you complete your first typing test
          </span>
        </div>
      </div>
      <div class="flex gap-8">
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">WPM</div>
          <div class="text-slate-600 font-mono text-xl font-bold">-</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">Accuracy</div>
          <div class="text-slate-600 font-mono text-xl font-bold">-</div>
        </div>
      </div>
    </div>
  `;

  rankingContainer.innerHTML = html;
}

/**
 * Render leaderboard table
 */
function renderLeaderboard(users) {
  const container = document.getElementById("leaderboard");
  
  if (!container) {
    console.error('Leaderboard container not found');
    return;
  }
  
  // Ensure users is an array
  if (!Array.isArray(users)) {
    console.error('renderLeaderboard: users is not an array:', users);
    users = [];
  }
  
  if (users.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-6">
        <div class="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
          <i data-lucide="trophy" class="w-8 h-8 text-slate-600"></i>
        </div>
        <p class="text-slate-300 text-lg font-semibold mb-2">No leaderboard data available yet</p>
        <p class="text-slate-500 text-sm text-center max-w-md">
          Complete some typing challenges to appear on the leaderboard and compete with other developers!
        </p>
        <a href="/practice" class="mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
          <i data-lucide="play" class="w-4 h-4"></i>
          Start Practicing
        </a>
      </div>
    `;
    // Re-initialize lucide icons for the new content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    return;
  }
  
  const html = users
    .map((user, index) => {
      const isLast = index === users.length - 1;
      const borderClass = isLast ? "border-transparent" : "border-slate-800";
      
      return `
        <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b ${borderClass} hover:bg-slate-800/40 transition">
          <div class="col-span-2 md:col-span-1 text-center font-mono text-slate-500">
            #${user.rank}
          </div>

          <div class="col-span-6 md:col-span-5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-800">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}"
                   alt="${user.name}" class="w-full h-full rounded-full">
            </div>
            <span class="text-slate-300">${user.name}</span>
          </div>

          <div class="col-span-2 md:col-span-3 text-right font-mono text-teal-400 font-bold">
            ${user.wpm || 0} WPM
          </div>

          <div class="col-span-2 md:col-span-3 text-right hidden md:block font-mono text-slate-400">
            ${user.accuracy || 0}%
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `<div class="flex flex-col">${html}</div>`;
}

/**
 * Display user's ranking information
 */
function displayUserRankingInfo(userData) {
  const rankingContainer = document.getElementById('user-ranking-container');
  
  if (!rankingContainer) {
    console.error('User ranking container not found');
    return;
  }

  const html = `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center">
          <div class="font-mono text-teal-400 font-bold text-3xl">#${userData.rank}</div>
          <div class="text-xs text-slate-500 uppercase">Your Rank</div>
        </div>
        <div class="w-px h-12 bg-slate-700"></div>
        <div class="flex flex-col">
          <span class="text-white font-semibold text-lg">${userData.name}</span>
          <span class="text-xs text-slate-400">Top ${userData.percentile}% of all users</span>
        </div>
      </div>
      <div class="flex gap-8">
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">WPM</div>
          <div class="text-white font-mono text-xl font-bold">${userData.wpm || 0}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">Accuracy</div>
          <div class="text-white font-mono text-xl font-bold">${userData.accuracy || 0}%</div>
        </div>
      </div>
    </div>
  `;

  rankingContainer.innerHTML = html;
}

/**
 * Display guest ranking information (when not logged in)
 */
function displayGuestRankingInfo() {
  const rankingContainer = document.getElementById('user-ranking-container');
  
  if (!rankingContainer) {
    return;
  }

  const html = `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center">
          <div class="font-mono text-slate-600 font-bold text-3xl">-</div>
          <div class="text-xs text-slate-500 uppercase">Your Rank</div>
        </div>
        <div class="w-px h-12 bg-slate-700"></div>
        <div class="flex flex-col">
          <span class="text-white font-semibold text-lg">Sign in to see your rank</span>
          <span class="text-xs text-slate-400">
            <a href="/login" class="text-teal-400 hover:text-teal-300 transition-colors">Log in</a> 
            or 
            <a href="/signup" class="text-teal-400 hover:text-teal-300 transition-colors">Sign up</a> 
            to track your progress
          </span>
        </div>
      </div>
      <div class="flex gap-8">
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">WPM</div>
          <div class="text-slate-600 font-mono text-xl font-bold">-</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-slate-500 uppercase mb-1">Accuracy</div>
          <div class="text-slate-600 font-mono text-xl font-bold">-</div>
        </div>
      </div>
    </div>
  `;

  rankingContainer.innerHTML = html;
}

/**
 * Update load more button status
 */
function updateLoadMoreButton(currentCount, totalCount) {
  const loadMoreBtn = document.getElementById("load-more");
  
  if (!loadMoreBtn) {
    return;
  }

  if (currentCount >= totalCount) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "flex";
  }
}

/**
 * Show error message in leaderboard
 */
function showLeaderboardError() {
  const container = document.getElementById("leaderboard");
  
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col">
        <div class="px-6 py-8 text-center">
          <p class="text-red-400 font-semibold">Error loading leaderboard data.</p>
          <p class="text-gray-400 text-sm mt-2">Please try again later.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Refresh page
 */
function refresh() {
  window.location.href = "/";
}
