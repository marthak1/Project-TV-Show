//Responsibility => Should orchestrate All layers
function setup() {
  //Fetch raw episode data
  const oneEpisode = getOneEpisode();
  const allEpisodes = getAllEpisodes();

  //Prepared Episode Data => Combine formatted property and every other property the UI needs
  const { season, number } = oneEpisode;
  const code = formatEpisodeCode(season, number);

  const preparedEpisodeData = {
    name: oneEpisode.name,
    code,
    image: oneEpisode.image,
  };
  // renderEpisodes(oneEpisode);
  renderEpisodes(preparedEpisodeData);
}

//Display Episodes => Responsibility => Should render formatted Data to the DOM
function renderEpisodes(episodeList) {
  //Select and create HTML elements
  const rootElem = document.getElementById("root");
  const sectionEl = document.createElement("section");
  const innerDivEl = document.createElement("div");
  const pElemName = document.createElement("p");
  const pElemCode = document.createElement("span");
  const imageEl = document.createElement("img");
  const pElemRuntime = document.createElement("p");
  const pElemSummary = document.createElement("p");

  //Append child element to parent element
  rootElem.appendChild(sectionEl);
  sectionEl.appendChild(innerDivEl);
  innerDivEl.appendChild(pElemName);
  pElemName.textContent = episodeList.name;
  pElemName.appendChild(pElemCode);
  innerDivEl.appendChild(imageEl);
  innerDivEl.appendChild(pElemRuntime);
  innerDivEl.appendChild(pElemSummary);

  //Manipulate content for display
  pElemCode.textContent = episodeList.code;
  imageEl.src = episodeList.image.medium;
  pElemRuntime.textContent = episodeList.runtime;
  pElemSummary.textContent = episodeList.summary;
}

//Formatters => Responsibilities => Should transform data into UI-friendly data
//transforms season + number properties into format as S01E01
function formatEpisodeCode(seasonCode, numberCode) {
  return ` - S${String(seasonCode).padStart(2, "0")}E${String(numberCode).padStart(2, "0")}`;
}

//transforms runtime property into format as 01:00:00
function formatRuntime() {}

//removes the p tag from summary text
function cleanSummary() {}

window.onload = setup;
