//STATE MANAGEMENT 
let state = {
  currentView: 'shows', // 'shows' or 'episodes'
  tvShows: [],
  episodes: [],
  searchTerm: "",
  selectedShowId: null, // null = all shows
  selectedShowName: "",
  isLoading: true,
  counterEl: null,
};

function setState(newState) {
  state = { ...state, ...newState };
  render(); // Trigger re-render on any state change
}

//DATA FETCHING
let cachedTvShowData = null;
const getAllTvShows = async (url) => {
  if (cachedTvShowData) return cachedTvShowData;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP: ${response.status}`);
    cachedTvShowData = await response.json();
    return cachedTvShowData;
  } catch (error) {
    console.error("Failed to load shows", error);
    alert("Failed to load shows");
    return [];
  }
};

const getEpisodesForShow = async (showId) => {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!res.ok) throw new Error(`HTTP: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to load episodes", error);
    alert("Failed to load episodes");
    return [];
  }
};

//FORMATTERS / TRANSFORMERS 
function formatEpisodeCode(seasonCode, numberCode) {
  return `S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

function formatRuntime(time) {
  if (!time) return "Runtime: N/A";
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `Runtime: ${String(hour).padStart(2, "0")}:${String(remainingMinute).padStart(2, "0")}`;
}

//FILTER FUNCTIONS
function filterShows(showList, searchTerm, selectedShowId) {
  const term = searchTerm.trim().toLowerCase();
  
  return showList.filter(show => {
    const matchesSelect = !selectedShowId || show.id == selectedShowId;
    const matchesSearch = term === "" || 
      show.name.toLowerCase().includes(term) ||
      show.summary.toLowerCase().includes(term) ||
      show.genres.some(g => g.toLowerCase().includes(term));
    
    return matchesSelect && matchesSearch;
  });
}

function filterEpisodes(episodeList, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term === "") return episodeList;
  
  return episodeList.filter(ep => 
    ep.name.toLowerCase().includes(term) ||
    ep.summary.toLowerCase().includes(term)
  );
}

// COMPONENTS
function createShowCard(show) {
  const articleEl = document.createElement("article");
  articleEl.classList.add("show-card");
  articleEl.style.cursor = "pointer";
  
  articleEl.innerHTML = `
    <div class="show-content">
      <h3 class="show-title">${show.name}</h3>
      <img src="${show.image}" alt="${show.name}">
      <p>${show.runtime}</p>
      <p>Genres: ${show.genres.join(', ')}</p>
      <p>Rating: ${show.rating.average || 'N/A'}</p>
      <p>Status: ${show.status}</p>
      <p class="show-summary">${show.summary}</p>
    </div>
  `;
  
  articleEl.onclick = () => navigateToEpisodes(show.id, show.name);
  return articleEl;
}

function createEpisodeCard(episode) {
  const articleEl = document.createElement("article");
  articleEl.classList.add("episode-card");
  
  articleEl.innerHTML = `
    <div class="episode-content">
      <h3 class="episode-title">${episode.name} 
        <span class="episode-code">${episode.code}</span>
      </h3>
      <img src="${episode.image}" alt="${episode.name}">
      <p>${episode.runtime}</p>
      <p class="episode-summary">${episode.summary}</p>
    </div>
  `;
  
  return articleEl;
}

//RENDER FUNCTIONS
function renderShowList(showList) {
  const sectionEl = document.getElementById("main-section");
  sectionEl.innerHTML = "";
  
  for (const show of showList) {
    sectionEl.appendChild(createShowCard(show));
  }
  updateCounter(showList, state.tvShows, 'shows');
}

function renderEpisodeList(episodeList) {
  const sectionEl = document.getElementById("main-section");
  sectionEl.innerHTML = "";
  
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Shows";
  backBtn.onclick = () => setState({ 
    currentView: 'shows', 
    selectedShowId: null, 
    episodes: [],
    searchTerm: "" // clear search on back
  });
  sectionEl.appendChild(backBtn);
  
  for (const episode of episodeList) {
    sectionEl.appendChild(createEpisodeCard(episode));
  }
  updateCounter(episodeList, state.episodes, 'episodes');
}

// Main render - decides which view based on state
function render() {
  const titleEl = document.getElementById("page-title");
  const selectEl = document.getElementById("show-select");
  const searchEl = document.getElementById("search-input");
  
  // Keep UI controls in sync with state
  searchEl.value = state.searchTerm;
  selectEl.value = state.selectedShowId || "";
  
  if (state.currentView === 'shows') {
    titleEl.textContent = "TV Shows";
    selectEl.style.display = 'inline-block';
    
    // Populate select once
    if (selectEl.options.length <= 1 && state.tvShows.length > 0) {
      const sortedShows = [...state.tvShows].sort((a,b) => a.name.localeCompare(b.name));
      for (const show of sortedShows) {
        const opt = document.createElement("option");
        opt.value = show.id;
        opt.textContent = show.name;
        selectEl.appendChild(opt);
      }
    }
    
    const filtered = filterShows(state.tvShows, state.searchTerm, state.selectedShowId);
    renderShowList(filtered);
    
  } else if (state.currentView === 'episodes') {
    titleEl.textContent = state.selectedShowName ? `${state.selectedShowName} - Episodes` : "Episodes";
    selectEl.style.display = 'none';
    
    const filtered = filterEpisodes(state.episodes, state.searchTerm);
    renderEpisodeList(filtered);
  }
}

function updateCounter(filteredList, fullList, type) {
  if (state.counterEl) {
    state.counterEl.textContent = `Showing ${filteredList.length} of ${fullList.length} ${type}`;
  }
}

//NAVIGATION
async function navigateToEpisodes(showId, showName) {
  setState({ 
    isLoading: true, 
    currentView: 'episodes', 
    selectedShowId: showId,
    selectedShowName: showName,
    searchTerm: "" // clear search when switching views
  });
  
  const episodes = await getEpisodesForShow(showId);
  const preparedEpisodeData = episodes.map(episode => ({
    name: episode.name,
    code: formatEpisodeCode(episode.season, episode.number),
    image: episode.image?.medium || "",
    runtime: formatRuntime(episode.runtime),
    summary: episode.summary || "",
  }));
  
  setState({ episodes: preparedEpisodeData, isLoading: false });
}

//SETUP - runs once on page load ===
function renderAppShell() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <section class="header-section">
      <nav class="nav-bar">
        <h2 id="page-title">TV Shows</h2>
        <div class="controls">
          <input type="search" id="search-input" placeholder="Search...">
          <select id="show-select">
            <option value="">All shows</option>
          </select>
        </div>
        <p class="counter" id="counter"></p>
      </nav>
    </section>
    <section class="main-section" id="main-section"></section>
    <footer><p>Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a></p></footer>
    <div class="loading-overlay" id="loadingOverlay"><div class="spinner"></div></div>
  `;
  
  state.counterEl = document.getElementById("counter");
  
  // Search: updates state.searchTerm on every keystroke
  document.getElementById("search-input").addEventListener("input", (e) => {
    setState({ searchTerm: e.target.value });
  });
  
  // Select: updates state.selectedShowId on change
  document.getElementById("show-select").addEventListener("change", (e) => {
    setState({ selectedShowId: e.target.value || null });
  });
}

async function setup() {
  renderAppShell();
  
  const getAllShows = await getAllTvShows("https://api.tvmaze.com/shows");
  const preparedShowData = getAllShows.map(show => ({
    id: show.id,
    name: show.name,
    image: show.image?.medium || "",
    runtime: formatRuntime(show.runtime),
    genres: show.genres || [],
    rating: show.rating || {},
    summary: show.summary || "",
    status: show.status || "Unknown"
  }));
  
  setState({ tvShows: preparedShowData, isLoading: false });
  hideLoadingOverlay();
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (!loadingOverlay) return;
  loadingOverlay.style.opacity = "0";
  loadingOverlay.style.transition = "opacity 0.5s ease";
  setTimeout(() => loadingOverlay.style.display = "none", 500);
}

window.onload = setup;


