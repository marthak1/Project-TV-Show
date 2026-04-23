//State Management
let state = {
  shows: [],
  selectedShowId: "",
  episodes: [],
  searchTerm: "",
  counterEl: null,
  mode: "episodes", //shows all episodes
};
let cachedShowsData = null;
let cachedEpisodesByShow = {};

async function getAllShows() {
  if (cachedShowsData) return cachedShowsData;

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`HTTP: ${response.status}`);
    }

    const shows = await response.json();

    cachedShowsData = shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    return cachedShowsData;
  } catch (error) {
    console.error("Failed to load shows", error);
    alert("Failed to load shows");
    return [];
  }
}

async function getEpisodesForShow(showId) {
  if (cachedEpisodesByShow[showId]) {
    return cachedEpisodesByShow[showId];
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    if (!response.ok) {
      throw new Error(`HTTP: ${response.status}`);
    }

    const episodes = await response.json();
    cachedEpisodesByShow[showId] = episodes;
    return episodes;
  } catch (error) {
    console.error("Failed to load episodes", error);
    alert("Failed to load episodes");
    return [];
  }
}

function prepareEpisodeData(episodes) {
  return episodes.map((episode) => {
    const { season, number, runtime } = episode;

    return {
      id: episode.id,
      name: episode.name,
      code: formatEpisodeCode(season, number),
      image: episode.image?.medium || "",
      runtime: formatRuntime(runtime),
      summary: episode.summary,
    };
  });
}

//Responsibility => Should orchestrate All layers
async function setup() {
  //Fetch raw episode data from API
  const allShows = await getAllShows();
  if (allShows.length === 0) return;

  state.shows = allShows;
  state.episodes = [];
  state.selectedShowId = allShows[0].id;
  state.searchTerm = "";
  state.mode = "episodes";

  const allEpisodes = await getEpisodesForShow(state.selectedShowId);

  //Combines formatted property and every other property the UI needs
  state.episodes = prepareEpisodeData(allEpisodes); //<--------- Add prepared data for state management

  renderApp();
  populateEpisodeSelector(state.episodes);
  renderEpisodeList(state.episodes);
  hideLoadingOverlay();
}

function createShowSelector() {
  const selectEl = document.createElement("select");
  selectEl.id = "show-selector";

  for (const show of state.shows) {
    const optionEl = document.createElement("option");
    optionEl.value = show.id;
    optionEl.textContent = show.name;
    selectEl.appendChild(optionEl);
  }

  selectEl.value = state.selectedShowId;

  selectEl.addEventListener("change", async (event) => {
    const showId = event.target.value;

    state.selectedShowId = showId;
    state.searchTerm = "";
    state.mode = "episodes";

    const searchBar = document.querySelector(".search-bar");
    if (searchBar) searchBar.value = "";

    const allEpisodes = await getEpisodesForShow(showId);
    state.episodes = prepareEpisodeData(allEpisodes);

    populateEpisodeSelector(state.episodes);
    renderEpisodeList(state.episodes);
  });

  return selectEl;
}

function createEpisodeSelector() {
  const selectEl = document.createElement("select");
  selectEl.id = "episode-selector";

  selectEl.innerHTML = `<option value="all">All Episodes</option>`;

  selectEl.addEventListener("change", handleEpisodeSelect);

  return selectEl;
}

function populateEpisodeSelector(episodes) {
  const selectEl = document.getElementById("episode-selector");
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="all">All Episodes</option>`;

  episodes.forEach((episode, index) => {
    const optionEl = document.createElement("option");
    optionEl.value = index;
    optionEl.textContent = `${episode.code.replace(" - ", "")} - ${episode.name}`;
    selectEl.appendChild(optionEl);
  });

  selectEl.value = "all";
}

function handleEpisodeSelect(event) {
  const selectedValue = event.target.value;

  if (state.mode !== "episodes") return;

  const filteredBySearch = handleSearchInput(state.searchTerm, state.episodes);

  if (selectedValue === "all") {
    renderEpisodeList(filteredBySearch);
    return;
  }

  const selectedEpisode = state.episodes[selectedValue];

  if (!selectedEpisode) return;

  const matchesSearch =
    state.searchTerm.trim() === "" ||
    selectedEpisode.name
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase()) ||
    selectedEpisode.summary
      .toLowerCase()
      .includes(state.searchTerm.toLowerCase());

  renderEpisodeList(matchesSearch ? [selectedEpisode] : []);
}

function renderApp() {
  const bodyEl = document.querySelector("body");
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const oldOverlay = document.getElementById("loadingOverlay");
  if (oldOverlay) oldOverlay.remove();

  const headerSectionEl = document.createElement("section");
  headerSectionEl.classList.add("header-section");

  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");
  headerSectionEl.appendChild(navBarEl);

  const title = document.createElement("h2");
  title.textContent = "TV Shows and Episodes";
  navBarEl.appendChild(title);

  const showSelectorEl = createShowSelector();
  navBarEl.appendChild(showSelectorEl);

  const episodeSelectorEl = createEpisodeSelector();
  navBarEl.appendChild(episodeSelectorEl);

  const searchBarEl = createSearchInput();
  searchBarEl.classList.add("search-bar");
  navBarEl.appendChild(searchBarEl);

  const counter = document.createElement("p");
  counter.classList.add("counter");
  navBarEl.appendChild(counter);
  state.counterEl = counter;

  rootElem.appendChild(headerSectionEl);

  const loadingOverlayEl = document.createElement("div");
  loadingOverlayEl.classList.add("loading-overlay");
  loadingOverlayEl.id = "loadingOverlay";
  bodyEl.appendChild(loadingOverlayEl);

  const spinnerEl = document.createElement("div");
  spinnerEl.classList.add("spinner");
  loadingOverlayEl.appendChild(spinnerEl);

  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");
  sectionEl.id = "episode-section";
  rootElem.appendChild(sectionEl);

  const footerEl = document.createElement("footer");
  const credit = document.createElement("p");
  footerEl.appendChild(credit);
  credit.id = "credit";
  credit.innerHTML = `
    Data originally from 
    <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>
  `;
  rootElem.appendChild(footerEl);
}

//Responsibilities renders episode list
function renderEpisodeList(episodeList) {
  const sectionEl = document.getElementById("episode-section");
  if (!sectionEl) return;

  sectionEl.innerHTML = "";

  for (const episode of episodeList) {
    const episodeCard = createEpisodeCard(episode);
    sectionEl.appendChild(episodeCard);
  }

  updateCounter(episodeList, state.episodes);
}

function createEpisodeCard(episode) {
  const articleEl = document.createElement("article");
  articleEl.classList.add("episode-card");

  // Content wrapper
  const contentEl = document.createElement("div");
  contentEl.classList.add("episode-content");
  articleEl.appendChild(contentEl);

  const titleEl = document.createElement("h3");
  articleEl.appendChild(titleEl);
  titleEl.classList.add("episode-title");
  titleEl.textContent = episode.name;

  const seasonCodeEl = document.createElement("span");
  titleEl.appendChild(seasonCodeEl);
  seasonCodeEl.classList.add("episode-code");
  seasonCodeEl.textContent = episode.code;

  const imageEl = document.createElement("img");
  articleEl.appendChild(imageEl);
  imageEl.src = episode.image;
  imageEl.alt = episode.name;

  const pElemRuntime = document.createElement("p");
  articleEl.appendChild(pElemRuntime);
  pElemRuntime.textContent = episode.runtime;

  const summaryEl = document.createElement("p");
  summaryEl.classList.add("episode-summary");
  summaryEl.innerHTML = episode.summary;
  articleEl.appendChild(summaryEl);

  return articleEl;
}

//Responsibility => Creates a search input element, stores value, listens for event triggers and calls filter function
function createSearchInput() {
  const searchBoxEl = document.createElement("input");
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  searchBoxEl.value = state.searchTerm;

  searchBoxEl.addEventListener("input", (event) => {
    const query = event.target.value;
    state.searchTerm = query;

    const episodeSelector = document.getElementById("episode-selector");
    const selectedEpisodeValue = episodeSelector
      ? episodeSelector.value
      : "all";
    const filteredEpisodes = handleSearchInput(query, state.episodes);

    if (selectedEpisodeValue === "all") {
      renderEpisodeList(filteredEpisodes);
      return;
    }

    const selectedEpisode = state.episodes[selectedEpisodeValue];
    if (!selectedEpisode) {
      renderEpisodeList(filteredEpisodes);
      return;
    }

    const matchesSearch =
      query.trim() === "" ||
      selectedEpisode.name.toLowerCase().includes(query.toLowerCase()) ||
      selectedEpisode.summary.toLowerCase().includes(query.toLowerCase());

    renderEpisodeList(matchesSearch ? [selectedEpisode] : []);
  });

  return searchBoxEl;
}

//Function Responsibility => Filters episode given a list and a query
function handleSearchInput(query, episodeList) {
  const searchTerm = query.trim().toLowerCase();
  if (searchTerm === "") {
    return episodeList;
  }

  return episodeList.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = episode.summary ? episode.summary.toLowerCase() : "";
    return name.includes(searchTerm) || summary.includes(searchTerm);
  });
}

function updateCounter(filteredItems, allItems) {
  state.counterEl.textContent = `Showing ${filteredItems.length} of ${allItems.length} episodes`;
}
//Formatters => Responsibilities => Should transform data into UI-friendly data
//transforms season + number properties into format as S01E01
function formatEpisodeCode(seasonCode, numberCode) {
  return ` - S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

//transforms runtime property into format as 01:00:00
function formatRuntime(time) {
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `${String(hour).padStart(2, "0")}:${String(remainingMinute).padStart(2, "0")}`;
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  const content = document.querySelector("#root");

  if (!loadingOverlay) return;

  loadingOverlay.style.opacity = "0";
  loadingOverlay.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    loadingOverlay.style.display = "none";
    content.style.display = "block";
  }, 500);
}
window.onload = setup;
