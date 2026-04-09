//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const sectionEl= document.createElement("section");
  rootElem.appendChild(sectionEl)
  const h1El = document.createElement("h1")
  sectionEl.appendChild(h1El)
  h1El.textContent = textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;

