//Responsibility => Should orchestrate All layers

const state = {
  episodes: [],
  searchterm: "", 
};
function setup() {
  //Fetch raw episode data
  const allEpisodes = getAllEpisodes();

  //Prepared Episode Data => Combines formatted property and every other property the UI needs
  state.episodes  = allEpisodes.map((episode) => {
    const {season, number, runtime} = episode;
  
    return {
      name: episode.name,
      code: formatEpisodeCode(season, number),
      image: episode.image.medium,
      runtime: formatRuntime(runtime),
      summary: episode.summary
    };

  });
  render();
}

//Display Episodes => Responsibility => Should render formatted Data to the DOM
function render() {
  //Select and create HTML elements
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // searchInput 
  const headerEL = document.createElement("section");
  headerEL.classList.add("header-section");

  const navBarEl = document.createElement("nav");
  navBarEl.classList.add("nav-bar");

const input = document.createElement("input");
input.type ="text";
input.placeholder = "search episodes...";
input.value = state.searchterm;

// live search updates state + re-render:
input.addEventListener("input", (e) => {
  state.searchterm = e.target.value;
  render();
});
navBarEl.appendChild(input);
headerEL.appendChild(navBarEl);
rootElem.appendChild(headerEL);

// filter logic
const filteredEpisodes = state.episodes.filter((episode) => {
  const term = state.searchterm.toLowerCase();
  return (
    episode.name.toLowerCase().includes(term) ||
    episode.summary.toLowerCase().includes(term)
  );
});

// result count:
 const count = document.createElement("p");
 count.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
 rootElem.appendChild(count);

 renderEpisodes(filteredEpisodes);

}

//Display Episodes
function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const sectionEl = document.createElement("section");
  sectionEl.classList.add("episode-section");

  for (const episode of episodeList) {
    const episodeCard = createEpisodeCard(episode);
    sectionEl.appendChild(episodeCard);
  }

  rootElem.appendChild(sectionEl);
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

//Formatters => Responsibilities => Should transform data into UI-friendly data
//transforms season + number properties into format as S01E01
function formatEpisodeCode(seasonCode, numberCode) {
  return ` - S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

//transforms runtime property into format as 01:00:00
function formatRuntime(time) {
  const hour = Math.floor(time / 60);
  const remainingMinute = time % 60;
  return `${String(hour).padStart(2,"0")}:${String(remainingMinute).padStart(2, "0")}`;
}


window.onload = setup;
