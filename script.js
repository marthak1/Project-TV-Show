//Fetch raw episode data
const oneEpisode = getOneEpisode();
const allEpisodes = getAllEpisodes();

//Responsibility => Should orchestrate All layers
function setup() {
  renderEpisodes(oneEpisode);
}

//Responsibility => Should render formatted Data to the DOM
function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const sectionEl = document.createElement("section");
  const innerDivEl = document.createElement("div");
  const h1El = document.createElement("h1");
  const imageEl = document.createElement("img");
  const pElemRuntime = document.createElement("p");
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

// Responsibilities => Should transform data into UI-friendly data

//transforms season + number properties into format as S01E01
function formatEpisodeCode() {}

//transforms runtime property into format as 01:00:00
function formatRuntime() {}

//removes the p tag from summary text
function cleanSummary() {}

window.onload = setup;
