//Responsibility => Should orchestrate All layers

const state = {
  episodes: [],
  searchterm: "",
};

function setup() {
  const allEpisodes = getAllEpisodes();

  state.episodes = allEpisodes.map((episode) => {
    const { season, number, runtime } = episode;

    return {
      name: episode.name,
      code: formatEpisodeCode(season, number),
      image: episode.image?.medium || "", // ✅ FIXED
      runtime: formatRuntime(runtime),
      summary: episode.summary,
    };
  });

  render();
}

//Display Episodes => Should render formatted Data to the DOM
function render() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // -------- HEADER --------
  const headerEL = document.createElement("section");
  headerEL.classList.add("header-section");

  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

  const titleEl = document.createElement("h1");
  titleEl.textContent = "Game of Thrones Episodes";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "search episodes...";
  input.value = state.searchterm;

  input.addEventListener("input", (e) => {
    state.searchterm = e.target.value;
    render();
  });

  navBarEl.appendChild(titleEl);
  navBarEl.appendChild(input);
  headerEL.appendChild(navBarEl);

  rootElem.appendChild(headerEL); // ✅ FIXED (was broken)

  // -------- FILTER --------
  const term = state.searchterm.toLowerCase();

  const filteredEpisodes = state.episodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(term) ||
      episode.summary.toLowerCase().includes(term)
    );
  });

  // -------- COUNT --------
  const count = document.createElement("p");
  count.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  rootElem.appendChild(count);

  // -------- EPISODES --------
  renderEpisodes(filteredEpisodes);
}

//Display Episodes
function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");

  for (const episode of episodeList) {
    sectionEl.appendChild(createEpisodeCard(episode));
  }

  rootElem.appendChild(sectionEl);
}

//UI Component Card
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

  const imageEl = document.createElement("img");
  imageEl.src = episode.image;
  imageEl.alt = episode.name;
  contentEl.appendChild(imageEl);

  const runtimeEl = document.createElement("p");
  runtimeEl.textContent = episode.runtime;
  contentEl.appendChild(runtimeEl);

  const summaryEl = document.createElement("p");
  summaryEl.classList.add("episode-summary");
  summaryEl.innerHTML = episode.summary;
  contentEl.appendChild(summaryEl);

  return articleEl;
}

//Formatters
function formatEpisodeCode(seasonCode, numberCode) {
  return ` - S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

function formatRuntime(time) {
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `${String(hour).padStart(2, "0")}:${String(remainingMinute).padStart(2, "0")}`;
}

window.onload = setup;
