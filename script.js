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
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error(`HTTP: ${response.status}`);
    cachedTvShowData = await response.json();
    return cachedTvShowData;
  } catch (error) {
    console.error("Failed to load shows", error);
    alert("Failed to load shows");
    return [];
  }
};

const cachedEpisodes = {};
const getEpisodesForShow = async (showId) => {
  if (cachedEpisodes[showId]) return cachedEpisodes[showId];
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!res.ok) throw new Error(`HTTP: ${res.status}`);
    const data = await res.json();
    cachedEpisodes[showId] = data;
    return data;
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
  return `Runtime: ${String(hour).padStart(2, "0")}h:${String(remainingMinute).padStart(2, "0")}min`;
}

//FILTER FUNCTIONS
function filterShows(showList, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term === "") return showList;

  return showList.filter(
    (show) =>
      show.name.toLowerCase().includes(term) ||
      show.summary.toLowerCase().includes(term) ||
      show.genres.some((g) => g.toLowerCase().includes(term)),
  );
}

function filterEpisodes(episodeList, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term === "") return episodeList;

  return episodeList.filter(
    (ep) =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term),
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
  articleEl.id = `episode-${episode.id}`;
  return articleEl;
}

//RENDER FUNCTIONS
function renderShowList(showList) {
  const sectionEl = document.getElementById("main-section");
  sectionEl.innerHTML = ""; // Hide episodes, show listing

  const showContainer = document.createElement("div");
  showContainer.className = "show-container";
  sectionEl.appendChild(showContainer);
  for (const show of showList) {
    showContainer.appendChild(createShowCard(show));
  }
  updateCounter(showList, state.tvShows, "shows");
}

function renderEpisodeList(episodeList) {
  const sectionEl = document.getElementById("main-section");
  sectionEl.innerHTML = ""; // Hide shows listing
 
  const controls = document.createElement("div");
  controls.className = "episode-controls";
  const navLink = document.createElement("a");
  navLink.href = "#";
  navLink.textContent = "← Back to Shows Listing";
  navLink.className = "back-link";
  navLink.onclick = (e) => {
    e.preventDefault();
    setState({
      currentView: "shows",
      selectedShowId: null,
      episodes: [],
      searchTerm: "",
    });
  };
  controls.appendChild(navLink);

const episodeSelect = document.createElement("select");
episodeSelect.id = "episode-select";
episodeSelect.style.margin = "20px 0";
episodeSelect.innerHTML = `<option value="">Jump to episode...</option>`;
for (const episode of episodeList) {
  const opt = document.createElement("option");
  opt.value = episode.code; // Use episode code as value
  opt.textContent = `${episode.code} - ${episode.name}`;
  episodeSelect.appendChild(opt);
}
episodeSelect.addEventListener("change", (e) => {
  const episodeCode = e.target.value;
  if (episodeCode) {
    const episodeCard = Array.from(sectionEl.children).find(
      (child) =>
        child.className === "episode-card" &&
        child.querySelector(".episode-code").textContent === episodeCode,
    );
    if (episodeCard) {
      episodeCard.scrollIntoView({ behavior: "smooth" });
    }
  }
});
controls.appendChild(episodeSelect);
sectionEl.appendChild(controls);

const episodeContainer = document.createElement("div");
episodeContainer.className = "episode-container";
sectionEl.appendChild(episodeContainer);
  for (const episode of episodeList) {
    episodeContainer.appendChild(createEpisodeCard(episode));
  }
  updateCounter(episodeList, state.episodes, "episodes");
}

// Main render - decides which view based on state
function render() {
  if (state.isLoading) return;

  const titleEl = document.getElementById("page-title");
  const selectEl = document.getElementById("show-select");
  const searchEl = document.getElementById("search-input");

  searchEl.value = state.searchTerm;
  selectEl.value = state.selectedShowId || "";

  if (state.currentView === "shows") {
    titleEl.textContent = "TV SHOW"; 
    const filtered = filterShows(state.tvShows, state.searchTerm);
    renderShowList(filtered);
  } else if (state.currentView === "episodes") {
    titleEl.textContent = `${state.selectedShowName} - Episodes`;
    const filtered = filterEpisodes(state.episodes, state.searchTerm);
    renderEpisodeList(filtered); // Shows listing hidden
  }
}

function updateCounter(filteredList, fullList, type) {
  if (state.counterEl) {
    state.counterEl.textContent = `Showing ${filteredList.length} of ${fullList.length} ${type}`;
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
    currentView: "episodes",
    selectedShowId: showId,
    selectedShowName: showName,
    searchTerm: "",
  });

  const episodes = await getEpisodesForShow(showId); // Fetched once, then cached
  const preparedEpisodeData = episodes.map((episode) => ({
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
        <h2 id="page-title">Shows Listing</h2>
        <div class="controls">
          <select id="show-select">
            <option value="">All shows</option>
          </select>
          <input type="search" id="search-input" placeholder="Search shows/episodes...">
        </div>
        <p class="counter" id="counter"></p>
      </nav>
    </section>
    <section class="main-section" id="main-section"></section>
    <footer><p>Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a></p></footer>
    <div class="loading-overlay" id="loadingOverlay"><div class="spinner"></div></div>
  `;

  state.counterEl = document.getElementById("counter");


  document.getElementById("search-input").addEventListener("input", (e) => {
    setState({ searchTerm: e.target.value });
  });


  document.getElementById("show-select").addEventListener("change", (e) => {
    const showId = e.target.value;
    if (!showId) {
      setState({
        currentView: "shows",
        selectedShowId: null,
        episodes: [],
        searchTerm: "",
      });
    } else {
      const show = state.tvShows.find((s) => s.id == showId);
      navigateToEpisodes(showId, show.name);
    }
  });
}

async function setup() {
  renderAppShell();

  const getAllShows = await getAllTvShows();


  const sortedShows = getAllShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  const preparedShowData = sortedShows.map((show) => ({
    id: show.id,
    name: show.name,
    image: show.image?.medium || "",
    runtime: formatRuntime(show.runtime),
    genres: show.genres || [],
    rating: show.rating || {},
    summary: show.summary || "",
    status: show.status || "Unknown",
  }));


  const selectEl = document.getElementById("show-select");
  for (const show of preparedShowData) {
    const opt = document.createElement("option");
    opt.value = show.id;
    opt.textContent = show.name;
    selectEl.appendChild(opt);
  }

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




