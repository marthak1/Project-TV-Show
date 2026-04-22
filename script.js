// Responsibility => Should orchestrate all layers

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
      image: episode.image?.medium || "",
      runtime: formatRuntime(runtime),
      summary: episode.summary,
    };
  });

  renderHeader(); // ✅ render once
  render(); // ✅ update dynamic content
}

// ---------------- HEADER (STATIC - render once) ----------------
function renderHeader() {
  const rootElem = document.getElementById("root");

  const headerEL = document.createElement("section");
  headerEL.classList.add("header-section");

  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

  const titleEl = document.createElement("h1");
  titleEl.textContent = "Game of Thrones Episodes";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search episodes...";

  input.addEventListener("input", (e) => {
    state.searchterm = e.target.value;
    render(); // ✅ only updates list now
  });

  navBarEl.appendChild(titleEl);
  navBarEl.appendChild(input);
  headerEL.appendChild(navBarEl);

  rootElem.appendChild(headerEL);

  // ✅ create content container once
  const content = document.createElement("div");
  content.id = "content";
  rootElem.appendChild(content);
}

// ---------------- RENDER (DYNAMIC ONLY) ----------------
function render() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const term = state.searchterm.toLowerCase();

  const filteredEpisodes = state.episodes.filter((episode) => {
    const name = episode.name?.toLowerCase() || "";
    const summary = episode.summary
      ? episode.summary.replace(/<[^>]*>/g, "").toLowerCase()
      : "";

    return name.includes(term) || summary.includes(term);
  });

  // -------- COUNT --------
  const count = document.createElement("p");
  count.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  content.appendChild(count);

  // -------- EPISODES --------
  renderEpisodes(filteredEpisodes, content);
}

// ---------------- EPISODE LIST ----------------
function renderEpisodes(episodeList, container) {
  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");

  for (const episode of episodeList) {
    sectionEl.appendChild(createEpisodeCard(episode));
  }

  container.appendChild(sectionEl);
}

// ---------------- CARD COMPONENT ----------------
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

// ---------------- FORMATTERS ----------------
function formatEpisodeCode(seasonCode, numberCode) {
  return ` - S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

function formatRuntime(time) {
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `${String(hour).padStart(2, "0")}:${String(remainingMinute).padStart(2, "0")}`;
}

window.onload = setup;
