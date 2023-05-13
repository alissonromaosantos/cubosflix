const root = document.querySelector(":root");
const body = document.querySelector("body");
const header = document.querySelector("header");
const logo = document.querySelector(".header__container-logo img");
const companyName = document.querySelector(".header__title");

const moviesContainer = document.querySelector(".movies-container");
const moviesCards = document.querySelector(".movies");

const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");

const searchInput = document.querySelector(".input");

const highLight = document.querySelector(".highlight");
const highLightVideo = document.querySelector(".highlight__video");
const highLightTitle = document.querySelector(".highlight__title");
const highLightRating = document.querySelector(".highlight__rating");
const highLightGenres = document.querySelector(".highlight__genres");
const highLightLaunch = document.querySelector(".highlight__launch");
const highLightDescription = document.querySelector(".highlight__description");
const highLightVideoLink = document.querySelector(".highlight__video-link");

const modal = document.querySelector(".modal");
const modalBody = document.querySelector(".modal__body");
const modalTitle = document.querySelector(".modal__title");
const modalImage = document.querySelector(".modal__img");
const modalDescription = document.querySelector(".modal__description");
const modalAverage = document.querySelector(".modal__average");
const modalGenres = document.querySelector(".modal__genres");
const modalCloseIcon = document.querySelector(".modal__close");

const themeIcon = document.querySelector(".header__container-right img");

let movies = [];
let movieOfTheDay = [];
let videoOfTheDay = [];
let minIndexMovies = 0;
let maxIndexMovies = 6;

function createHtmlElement(tagName, className, parentElement) {
  const htmlElement = document.createElement(tagName);
  htmlElement.classList.add(className);
  parentElement.appendChild(htmlElement);

  return htmlElement;
}

async function getMovies(url) {
  try {
    const response = await api.get(url);

    return response.data.results.slice(0, 18);
  } catch (error) {
    return error.message;
  }
}

async function getMovieOfTheDay() {
  try {
    const response = await api.get("/movie/436969?language=pt-BR");

    return response.data;
  } catch (error) {
    return error.message;
  }
}

async function getVideoOfTheDay() {
  try {
    const response = await api.get("/movie/436969/videos?language=pt-BR");

    return response.data.results[1];
  } catch (error) {
    return error.message;
  }
}

function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

async function switchModal(movie) {
  try {
    const response = await api.get(`/movie/${movie.id}?language=pt-BR`);

    let movieModal = response.data;

    openModal();

    modalTitle.textContent = movieModal.title;
    modalImage.src = movieModal.backdrop_path;
    modalDescription.textContent = movieModal.overview;
    modalAverage.textContent = movieModal.vote_average.toFixed(1);

    modalGenres.innerHTML = "";

    movieModal.genres.forEach((genre) => {
      let movieGenre = createHtmlElement("span", "modal__genre", modalGenres);

      movieGenre.textContent = genre.name;
    });
  } catch (error) {
    return error.message;
  }
}

function buildMovies() {
  moviesCards.innerHTML = "";

  if (movies.length !== 0) {
    moviesContainer.classList.remove("center");

    movies.slice(minIndexMovies, maxIndexMovies).forEach((movie) => {
      let movieCard = createHtmlElement("div", "movie", moviesCards);
      movieCard.style.backgroundImage = `url(${movie.poster_path})`;

      movieCard.addEventListener("click", () => {
        switchModal(movie);
      });

      let movieInfo = createHtmlElement("div", "movie__info", movieCard);

      let movieTitle = createHtmlElement("span", "movie__title", movieInfo);
      movieTitle.textContent = movie.title;

      let movieRating = createHtmlElement("span", "movie__rating", movieInfo);
      movieRating.textContent = movie.vote_average.toFixed(1);

      let starIcon = createHtmlElement("img", "star", movieRating);
      starIcon.src = "./assets/estrela.svg";
      starIcon.alt = "Estrela";
    });
  } else {
    let message = createHtmlElement("p", "message", moviesCards);
    moviesContainer.classList.add("center");
    message.textContent = "Nenhum filme foi encontrado!";

    if (localStorage.getItem("theme") === "dark") {
      message.style.color = "#fff";
    } else {
      message.style.color = "var(--text-color)";
    }
  }
}

function buildMovieOfTheDay() {
  let movieGenre = "";

  highLightVideo.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${movieOfTheDay.backdrop_path})`;
  highLightVideo.style.backgroundSize = "cover";
  highLightVideo.style.backgroundPosition = "center";

  highLightTitle.textContent = `${movieOfTheDay.title}`;

  highLightRating.textContent = `${movieOfTheDay.vote_average.toFixed(1)}`;

  movieOfTheDay.genres.forEach((genre, index, genres) => {
    if (index === genres.length - 1) {
      movieGenre += `${genre.name} / `;
    } else {
      movieGenre += `${genre.name}, `;
    }
  });

  let date = new Date(movieOfTheDay.release_date).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  movieGenre += `${date}`;

  highLightGenres.textContent = movieGenre;

  highLightDescription.textContent = movieOfTheDay.overview;

  highLightVideoLink.href = `https://www.youtube.com/watch?v=${videoOfTheDay.key}`;
}

async function init(url) {
  movies = await getMovies(url);

  movieOfTheDay = await getMovieOfTheDay();

  videoOfTheDay = await getVideoOfTheDay();

  buildMovies();

  buildMovieOfTheDay();
}

init("/discover/movie?language=pt-BR&include_adult=false");

function searchMovie(event) {
  if (event.code === "Enter" && searchInput.value) {
    init(
      `/search/movie?language=pt-BR&include_adult=false&query=${searchInput.value}`
    );

    minIndexMovies = 0;
    maxIndexMovies = 6;

    searchInput.value = "";
  } else if (event.code === "Enter" && !searchInput.value) {
    init("/discover/movie?language=pt-BR&include_adult=false");

    minIndexMovies = 0;
    maxIndexMovies = 6;
    return;
  }
}

btnPrev.addEventListener("click", () => {
  if (movies.length <= 6) {
    return;
  } else if (movies.length > 6 && movies.length <= 12 && minIndexMovies === 0) {
    minIndexMovies = 6;
    maxIndexMovies = 12;
  } else if (minIndexMovies === 0) {
    minIndexMovies = 12;
    maxIndexMovies = 18;
  } else {
    minIndexMovies -= 6;
    maxIndexMovies -= 6;
  }

  buildMovies();
});

btnNext.addEventListener("click", () => {
  if (movies.length <= 6) {
    return;
  } else if (
    movies.length > 6 &&
    movies.length <= 12 &&
    maxIndexMovies === 12
  ) {
    minIndexMovies = 0;
    maxIndexMovies = 6;
  } else if (maxIndexMovies === 18) {
    minIndexMovies = 0;
    maxIndexMovies = 6;
  } else {
    minIndexMovies += 6;
    maxIndexMovies += 6;
  }

  buildMovies();
});

function switchTheme() {
  const isLightTheme = localStorage.getItem("theme") === "dark" ? true : false;

  root.style.setProperty("--background", isLightTheme ? "#1b2020" : "#fff");
  root.style.setProperty("--bg-secondary", isLightTheme ? "#2d3440" : "#ededed");
  root.style.setProperty("--text-color", isLightTheme ? "#fff" : "#1b2028");
  root.style.setProperty("--bg-modal", isLightTheme ? "#2d3440" : "#ededed");
  themeIcon.src = isLightTheme ? "./assets/dark-mode.svg" : "./assets/light-mode.svg";
  logo.src = isLightTheme ? "./assets/logo.svg": "./assets/logo-dark.png";
  btnPrev.src = isLightTheme ? "./assets/arrow-left-light.svg": "./assets/arrow-left-dark.svg";
  btnNext.src = isLightTheme? "./assets/arrow-right-light.svg": "./assets/arrow-right-dark.svg";
  modalCloseIcon.src = isLightTheme ? "./assets/close.svg" : "./assets/close-dark.svg";
}

searchInput.addEventListener("keypress", (event) => {
  searchMovie(event);
});

modal.addEventListener("click", () => {
  closeModal();
});

modalCloseIcon.addEventListener("click", () => {
  closeModal();
});

themeIcon.addEventListener("click", () => {
  const theme = localStorage.getItem("theme");

  if (theme === "dark" || theme === "") {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }

  switchTheme();
});

switchTheme();
