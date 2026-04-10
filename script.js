//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  const oneEpisode = getOneEpisode()
  renderEpisodes(oneEpisode);
}

function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const sectionEl = document.createElement("section");
  const innerDivEl = document.createElement("div");
  const h1El = document.createElement("h1");
  const imageEl = document.createElement("img");
  const pElemRuntime = document.createElement("p")
  const pElemSummary = document.createElement("p");
  
  rootElem.appendChild(sectionEl);
  sectionEl.appendChild(innerDivEl);
  innerDivEl.appendChild(h1El);
  innerDivEl.appendChild(imageEl);
  innerDivEl.appendChild(pElemRuntime);
  innerDivEl.appendChild(pElemSummary);

  h1El.textContent = episodeList.name;
  imageEl.src = episodeList.image.medium;
  pElemRuntime.textContent = episodeList.runtime;
  pElemSummary.textContent = episodeList.summary;
}

window.onload = setup;


