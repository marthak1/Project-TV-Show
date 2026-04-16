//State Management
let state = {
  episodes: [],
  searchTerm: "",
};

//Responsibility => Should orchestrate All layers
function setup() {
  //Fetch raw episode data
  const allEpisodes = getAllEpisodes();

  //Prepared Episode Data => Combines formatted property and every other property the UI needs
  const preparedEpisodeData = allEpisodes.map((episode) => {
    const { season, number, runtime } = episode;

    return {
      name: episode.name,
      code: formatEpisodeCode(season, number),
      image: episode.image.medium,
      runtime: formatRuntime(runtime),
      summary: episode.summary,
    };
  });

  state.episodes = preparedEpisodeData;
  state.searchTerm = "";

  renderApp(state.episodes);
}

//Render the full application structure once
function renderApp(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const headerSectionEl = document.createElement("section");
  headerSectionEl.classList.add("header-section");
  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");
  headerSectionEl.appendChild(navBarEl);

  const title = document.createElement("h2");
  title.textContent = "Game of Thrones TV Episodes";
  navBarEl.appendChild(title);
  
  const searchBarEl = searchInput(state.episodes, renderEpisodeList);
  searchBarEl.classList.add("search-bar");
  navBarEl.appendChild(searchBarEl);
  rootElem.appendChild(headerSectionEl);

  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");
  sectionEl.id = "episode-section";
  rootElem.appendChild(sectionEl);

  renderEpisodeList(episodeList);
}

function renderEpisodeList(episodeList) {
  const sectionEl = document.getElementById("episode-section");
  if (!sectionEl) {
    return;
  }

  sectionEl.innerHTML = "";
  for (const episode of episodeList) {
    const episodeCard = createEpisodeCard(episode);
    sectionEl.appendChild(episodeCard);
  }
}
//UI Component Card => Responsibility => Should take one episode data, create DOM Elements and return a fully built episode card
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

function searchInput(episodes, renderfn) {
  const searchBoxEl = document.createElement("input");
  searchBoxEl.type = "search";
  searchBoxEl.placeholder = "Search episodes...";
  searchBoxEl.value = state.searchTerm;
  searchBoxEl.addEventListener("input", (event) => {
    const query = event.target.value;
    state.searchTerm = query;
    const filteredEpisodes = handleSearchInput(query, episodes);
    renderfn(filteredEpisodes);
  });
  return searchBoxEl;
}

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
window.onload = setup;
