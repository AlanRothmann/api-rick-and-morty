let page = 1;
let totalPages;
let countPages;
let count;
let characterStatus = '';
let dead;
let unknown;
let pageButton;
let result = [];

const characterEl = document.getElementById("character");
const locationEl = document.getElementById("location");
const episodeEl = document.getElementById("episode");
const characterCardsEl = document.getElementById("character_cards");
const charactersContainer = document.getElementById("characters");
const buttonsContainer = document.getElementById("buttons");

const instance = axios.create({
    baseURL: "https://rickandmortyapi.com/api",
});

function increasePage() {
    if (page !== totalPages) {
        page++;
        buttonsContainer.innerHTML = '';
        pagination(page);
        loadCharacters();
    }
}

function decreasePage() {
    if (page > 1) {
        page--;
        buttonsContainer.innerHTML = '';
        pagination(page);
        loadCharacters();
    }
}

function pagination(newPage) {
    page = newPage;
    console.log(page);

    if (page === totalPages - 1) {
        result = [1, totalPages - 3, totalPages - 2, page, totalPages];
    } else if (page > 2 && page < totalPages) {
        result = [1, page - 1, page, page + 1, totalPages];
    } else if (page === totalPages) {
        result = [1, page - 3, page - 2, page - 1, totalPages];
    } else {
        result = [1, 2, 3, 4, totalPages];
    }

    buttonsContainer.innerHTML = '';

    for (let i = 0; i < result.length; i++) {
        pageButton = document.createElement('button');
        pageButton.setAttribute('style', 'background-color: #62EC52; border:1px solid #62EC52; margin-right: 5px; width: 35px; height: 30px; border-radius: 5px; font-size:20px; margin-top: 40px;');
        pageButton.innerHTML = result[i];
        pageButton.addEventListener('click', () => { pagination(result[i]); });
        buttonsContainer.appendChild(pageButton);

        if (result[i] === page) {
            pageButton.setAttribute('style', 'background-color: green; border:1px solid green; margin-right: 5px; width: 35px; height: 30px; border-radius: 5px; font-size:20px; margin-top: 40px;');
        }
    }
    loadCharacters();
}

async function initialLoadCharacters() {
    await loadCharacters();
    buttonsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        if (i < 4) {
            pageButton = document.createElement('button');
            pageButton.setAttribute('style', 'background-color: #62EC52; border:1px solid #62EC52; margin-right: 5px; width: 35px; height: 30px; border-radius: 5px; font-size:20px; margin-top: 25px;');
            pageButton.innerHTML = i + 1;
            pageButton.addEventListener('click', () => { pagination(i + 1); });
            buttonsContainer.appendChild(pageButton);
        }

        if (i === 5) {
            pageButton = document.createElement('button');
            pageButton.setAttribute('style', 'background-color: #62EC52; border:1px solid #62EC52; margin-right: 5px; width: 35px; height: 30px; border-radius: 5px; font-size:20px; margin-top: 40px;');
            pageButton.innerHTML = totalPages;
            pageButton.addEventListener('click', () => { pagination(totalPages); });
            buttonsContainer.appendChild(pageButton);
        }
    }
}

async function loadCharacters() {
    loadLocations();
    loadEpisodes();
    try {
        const response = await instance.get(`/character?page=${page}`);
        const characters = response.data.results;
        totalPages = response.data.info.pages;
        count = response.data.info.count;
        characterCardsEl.innerHTML = '';


        let characterCount = 0;

        const characterPromises = characters.map(async (character) => {
            if (characterCount % 2 === 0) {
                characterCardsEl.innerHTML += '<div class="card_row">';
            }

            let characterStatus = ''; // Define characterStatus inside the loop for each character

            if (character.status.toLowerCase() === 'alive') {
                characterStatus = '<span class="color_status_alive"></span>';
            } else if (character.status.toLowerCase() === 'unknown') {
                characterStatus = '<span class="color_status_unknown"></span>';
            } else if (character.status.toLowerCase() === 'dead') {
                characterStatus = '<span class="color_status_dead"></span>';
            }

            const lastKnownLocation = await loadLastKnownLocation(character);
            const lastEpisode = await loadLastEpisode(character);

            const card = `
                <div class="character_card" style="margin-right: 20px;">
                    <div class="card_content">
                        <h2 class="card_title">${character.name}</h2>
                        <img class="character_image" src="${character.image}" alt="character_image">
                        <p class="character_status">${characterStatus}${character.status} - ${character.species}</p>
                        <p class="last_location">Última localização conhecida: <span>${lastKnownLocation}</span></p>
                        <p class="last_episode">Visto pela última vez em: <span>${lastEpisode}</span></p>
                    </div>
                </div>
            `;

            characterCardsEl.innerHTML += card;

            characterCount++;

            if (characterCount % 2 === 0) {
                characterCardsEl.innerHTML += '</div>';
                characterCardsEl.innerHTML += '<hr class="hr">';
            }
        });

        await Promise.all(characterPromises);

        characterEl.innerHTML = `PERSONAGENS: ${count}`;

    } catch (error) {
        console.log(error);
    }
}

async function loadLastKnownLocation(character) {
    try {
        const response = await instance.get(character.location.url);
        return response.data.name;
    } catch (error) {
        console.log(error);
        return 'Unknown';
    }
}

async function loadLastEpisode(character) {
    try {
        const lastEpisodeId = character.episode[character.episode.length - 1].split('/').pop();
        const response = await instance.get(`/episode/${lastEpisodeId}`);
        return response.data.name;
    } catch (error) {
        console.log(error);
        return 'Unknown';
    }
}

async function loadEpisodes() {
    try {
        const response = await instance.get(`/episode`);
        episodeEl.innerHTML = `EPISÓDIOS: ${response.data.info.count}`;
    } catch (error) {
        console.log(error);
    }
}

async function loadLocations() {
    try {
        const response = await instance.get(`/location`);
        locationEl.innerHTML = `LOCALIZAÇÕES: ${response.data.info.count}`;
    } catch (error) {
        console.log(error);
    }
}

initialLoadCharacters();
