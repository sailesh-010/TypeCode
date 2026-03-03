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
async function loadLeaderboard(limit = 5, skip = 0) {
  try {
    const response = await fetch(`/api/leaderboard/rankings?limit=${limit}&skip=${skip}`);
    const result = await response.json();
    
    if (result.success) {
      renderLeaderboard(result.data);
      updateLoadMoreButton(result.count, result.total);
    } else {
      showLeaderboardError();
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
  try {
    console.log('Loading ranking for user:', userId);
    const response = await fetch(`/api/user-ranking/${userId}`);
    const result = await response.json();
    
    console.log('Ranking result:', result);
    
    if (result.success) {
      displayUserRankingInfo(result.data);
    } else {
      console.error('User ranking not found:', result.message);
      displayGuestRankingInfo();
    }
  } catch (error) {
    console.error('Error loading user ranking:', error);
    displayGuestRankingInfo();
  }
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
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="font-mono text-teal-400 font-bold text-xl">#${userData.rank}</div>
        <div class="flex flex-col">
          <span class="text-white font-medium">${userData.name}</span>
          <span class="text-xs text-slate-400">Top ${userData.percentile}%</span>
        </div>
      </div>
      <div class="flex gap-6 text-right">
        <div>
          <div class="text-xs text-slate-500 uppercase">WPM</div>
          <div class="text-white font-mono">${userData.wpm || 0}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500 uppercase">Acc</div>
          <div class="text-white font-mono">${userData.accuracy || 0}%</div>
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
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="font-mono text-slate-400 font-bold text-xl">-</div>
        <div class="flex flex-col">
          <span class="text-white font-medium">Sign in to see your rank</span>
          <span class="text-xs text-slate-400"><a href="/login" class="text-teal-400 hover:text-teal-300">Log in</a> or <a href="/signup" class="text-teal-400 hover:text-teal-300">Sign up</a></span>
        </div>
      </div>
      <div class="flex gap-6 text-right">
        <div>
          <div class="text-xs text-slate-500 uppercase">WPM</div>
          <div class="text-white font-mono">-</div>
        </div>
        <div>
          <div class="text-xs text-slate-500 uppercase">Acc</div>
          <div class="text-white font-mono">-</div>
        </div>
      </div>
    </div>
  `;

  rankingContainer.innerHTML = html;
}
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
