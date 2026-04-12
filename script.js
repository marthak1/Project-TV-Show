//Responsibility => Should orchestrate All layers
function setup() {
  //Fetch raw episode data
  const allEpisodes = getAllEpisodes();

  //Prepared Episode Data => Combines formatted property and every other property the UI needs
  const preparedEpisodeData = allEpisodes.map((episode) => {
    const {season, number, runtime, summary} = episode;
    const code = formatEpisodeCode(season, number);
    const runTime = formatRuntime(runtime);
    const summaryTag = cleanSummary(summary);
  
    return {
      name: episode.name,
      code,
      image: episode.image.medium,
      runtime: runTime,
      summary: summaryTag
    };
  })
  
  // renderEpisodes;
  renderEpisodes(preparedEpisodeData);

}

//Display Episodes => Responsibility => Should render formatted Data to the DOM
function renderEpisodes(episodeList) {
  //Select and create HTML elements
  const rootElem = document.getElementById("root");
  const sectionEl = document.createElement("section");
  rootElem.appendChild(sectionEl);
  
  //For each episode data => create DOM element, store and append to section element
  for (const episode of episodeList) {
     const episodeCard = createEpisodeCard(episode)
     sectionEl.appendChild(episodeCard);
  }
 
}
//UI Component Card => Responsibility => Should take one episode data, create DOM Elements and return a fully built episode card
function createEpisodeCard(episode) {
  const articleEl = document.createElement("article");
  const pElemName = document.createElement("p");
  articleEl.appendChild(pElemName);
  pElemName.textContent = episode.name;
  const pElemCode = document.createElement("span");
  pElemName.appendChild(pElemCode);
  pElemCode.textContent = episode.code;
  const imageEl = document.createElement("img");
  articleEl.appendChild(imageEl);
  imageEl.src = episode.image;
  const pElemRuntime = document.createElement("p");
  articleEl.appendChild(pElemRuntime);
  pElemRuntime.textContent = episode.runtime;
  const pElemSummary = document.createElement("p");
  articleEl.appendChild(pElemSummary);
  pElemSummary.textContent = episode.summary;

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
  return `Airtime: ${String(hour).padStart(2,"0")}:${String(remainingMinute).padStart(2, "0")}`;
}
//removes the p tag from summary text
function cleanSummary(sumParagraph) {
  return `${String(sumParagraph).slice(3, -4)}`
}
window.onload = setup;
