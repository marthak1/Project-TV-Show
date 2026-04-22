// Responsibility => Should orchestrate all layers

const state = {
  shows: [],
  episodes: [],
  searchterm: "",
  selectedEpisodeId: "",
  currentShowId: null,
  urlCache: {},
};

async function setup() {
  renderHeader();

  try {
    await loadShows();
    if (state.currentShowId) {
      await loadEpisodesForShow(state.currentShowId);
    }
    render();
  } catch (error) {
    renderError(error.message);
  }
}

async function cacheFetch(url) {
  if (state.urlCache[url]) {
    return state.urlCache[url];
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  const data = await response.json();
  state.urlCache[url] = data;
  return data;
}

async function loadShows() {
  const shows = await cacheFetch("https://api.tvmaze.com/shows");
  state.shows = shows
    .map((show) => ({ id: show.id, name: show.name }))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  state.currentShowId = state.shows[0]?.id || null;
  populateShowSelect();
}

async function loadEpisodesForShow(showId) {
  if (!showId) return;

  const episodes = await cacheFetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  state.episodes = episodes.map((episode) => ({
    id: episode.id,
    name: episode.name,
    code: formatEpisodeCode(episode.season, episode.number),
    image: episode.image?.medium || "",
    runtime: formatRuntime(episode.runtime),
    summary: episode.summary || "<p>No summary available.</p>",
  }));

  state.selectedEpisodeId = "";
  populateEpisodeSelect();
}

function renderHeader() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const headerEL = document.createElement("section");
  headerEL.classList.add("header-section");

  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

  const titleEl = document.createElement("h1");
  titleEl.classList.add("app-title");
  titleEl.textContent = "TV Show Explorer";

  const controlsEl = document.createElement("div");
  controlsEl.classList.add("controls");

  const showLabel = document.createElement("label");
  showLabel.textContent = "Show:";
  showLabel.classList.add("select-label");

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.classList.add("control-select");
  showSelect.addEventListener("change", async (e) => {
    state.currentShowId = Number(e.target.value);
    try {
      await loadEpisodesForShow(state.currentShowId);
      render();
    } catch (error) {
      renderError(error.message);
    }
  });

  showLabel.appendChild(showSelect);

  const episodeLabel = document.createElement("label");
  episodeLabel.textContent = "Episode:";
  episodeLabel.classList.add("select-label");

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.classList.add("control-select");
  episodeSelect.addEventListener("change", (e) => {
    state.selectedEpisodeId = e.target.value;
    render();
  });

  episodeLabel.appendChild(episodeSelect);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search episodes...";
  input.classList.add("search-input");
  input.addEventListener("input", (e) => {
    state.searchterm = e.target.value;
    render();
  });

  controlsEl.appendChild(showLabel);
  controlsEl.appendChild(episodeLabel);
  controlsEl.appendChild(input);

  navBarEl.appendChild(titleEl);
  navBarEl.appendChild(controlsEl);
  headerEL.appendChild(navBarEl);

  rootElem.appendChild(headerEL);

  const content = document.createElement("div");
  content.id = "content";
  rootElem.appendChild(content);
}

function populateShowSelect() {
  const showSelect = document.getElementById("show-select");
  if (!showSelect) return;

  showSelect.innerHTML = "";
  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.value = state.currentShowId || "";
}

function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episode-select");
  if (!episodeSelect) return;

  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  state.episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.code} ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeSelect.value = state.selectedEpisodeId;
}

function render() {
  const content = document.getElementById("content");
  if (!content) return;
  content.innerHTML = "";

  const term = state.searchterm.toLowerCase();

  const filteredEpisodes = state.episodes.filter((episode) => {
    const isSelected = state.selectedEpisodeId
      ? String(episode.id) === state.selectedEpisodeId
      : true;

    const name = episode.name?.toLowerCase() || "";
    const summary = episode.summary
      ? episode.summary.replace(/<[^>]*>/g, "").toLowerCase()
      : "";

    const matchesSearch = name.includes(term) || summary.includes(term);
    return isSelected && matchesSearch;
  });

  const count = document.createElement("p");
  count.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  count.classList.add("episode-count");
  content.appendChild(count);

  renderEpisodes(filteredEpisodes, content);
}

function renderEpisodes(episodeList, container) {
  if (episodeList.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No episodes match your filters.";
    emptyMessage.classList.add("empty-message");
    container.appendChild(emptyMessage);
    return;
  }

  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");

  episodeList.forEach((episode) => {
    sectionEl.appendChild(createEpisodeCard(episode));
  });

  container.appendChild(sectionEl);
}

function createEpisodeCard(episode) {
  const articleEl = document.createElement("article");
  articleEl.classList.add("episode-card");

  const contentEl = document.createElement("div");
  contentEl.classList.add("episode-content");
  articleEl.appendChild(contentEl);

  const titleEl = document.createElement("h3");
  titleEl.classList.add("episode-title");
  titleEl.textContent = episode.name;

  const seasonCodeEl = document.createElement("span");
  seasonCodeEl.classList.add("episode-code");
  seasonCodeEl.textContent = episode.code;

  titleEl.appendChild(seasonCodeEl);
  contentEl.appendChild(titleEl);

  if (episode.image) {
    const imageEl = document.createElement("img");
    imageEl.src = episode.image;
    imageEl.alt = episode.name;
    contentEl.appendChild(imageEl);
  }

  const runtimeEl = document.createElement("p");
  runtimeEl.textContent = episode.runtime;
  contentEl.appendChild(runtimeEl);

  const summaryEl = document.createElement("p");
  summaryEl.classList.add("episode-summary");
  summaryEl.innerHTML = episode.summary;
  contentEl.appendChild(summaryEl);

  return articleEl;
}

function renderError(message) {
  const content = document.getElementById("content");
  if (!content) return;
  content.innerHTML = "";

  const errorEl = document.createElement("div");
  errorEl.classList.add("error-message");
  errorEl.textContent = `Error: ${message}`;

  content.appendChild(errorEl);
}

function formatEpisodeCode(seasonCode, numberCode) {
  return `S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

function formatRuntime(time) {
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `${String(hour).padStart(2, "0")}h ${String(remainingMinute).padStart(2, "0")}m`;
}

window.onload = setup;
