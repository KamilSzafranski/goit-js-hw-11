import Notiflix from "notiflix";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formInput = document.querySelector(".search-form__input");
const gallery = document.querySelector("div.gallery");
const header = document.querySelector(".header");
const btnSearch = document.querySelector("button.search-form__btn");
const btnLoadMore = document.querySelector("button.load-more");
const modal = document.querySelector(".modal");
const btnLoadMoreText = document.querySelector(".load-more__text");

let emptyFormInput;
let page = 1;
let perPage = 40;
let totalPhoto = 500;
let PhotoLeft = Math.ceil(totalPhoto / perPage);
let lightBox;
let loadOnScroll = false;
let loadOnClick = false;
let isAnyPhotoAvailable;

const modalFunction = event => {
  event.preventDefault();
  event.target.blur();
  if (event.target.dataset.load === "click") {
    header.style.visibility = "visible";
    loadOnClick = true;
    modal.classList.add("is-hidden");
    return loadMore();
  }

  if (event.target.dataset.load === "scroll") {
    header.style.visibility = "visible";
    loadOnScroll = true;
    modal.classList.add("is-hidden");
    return loadMore();
  }
};

const renderGallery = data => {
  const markup = data
    .map(element => {
      return ` <a href="${element.largeImageURL}" class="photo-card">
   <img src="${element.webformatURL}" alt="${element.tags}" title="${element.tags}" loading="lazy" />
    <div class="info">
    <p class="info-item">
    <b>Likes</b>
    ${element.likes}
    </p>
    <p class="info-item">
    <b>Views</b>
    ${element.views}
    </p>
    <p class="info-item">
    <b>Comments</b>
    ${element.comments}
    </p>
    <p class="info-item">
    <b>Downloads</b>
    ${element.downloads}
    </p>
    </div>
    </a>
  `;
    })
    .join("");
  gallery.insertAdjacentHTML("beforeend", markup);
};

const clearGallery = () => (gallery.innerHTML = "");

const fetchFirstPhoto = async params => {
  try {
    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;
    PhotoLeft = Math.ceil(totalPhoto / perPage);
    const noSearch = response.hits.length === 0;
    isAnyPhotoAvailable = true;

    if (noSearch) {
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
    }

    if (totalPhoto < 40) {
      btnLoadMore.dataset.more = false;
      btnLoadMoreText.textContent = "No more photos :(";
    } else {
      btnLoadMore.dataset.more = true;
      btnLoadMoreText.textContent = "Load more";
    }
    page++;
    renderGallery(response.hits);
    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const displayFirstPhoto = event => {
  event.preventDefault();
  btnLoadMore.style.display = "none";
  emptyFormInput = formInput.value === "";
  page = 1;

  const params = new URLSearchParams({
    key: "31755618-c569c5727c417e8772568fe10",
    q: [formInput.value],
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: page,
    per_page: perPage,
  });

  if (emptyFormInput) return Notiflix.Notify.info("Please enter a photo name!");

  clearGallery();

  fetchFirstPhoto(params).then(response => {
    if (response.totalHits === 0) return;

    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);

    setTimeout(() => {
      btnLoadMore.style.display = "flex";
      lightBox = new SimpleLightbox(".gallery a");

      if (response.totalHits > 40) {
        scrollGallery();
      }
    }, 500);
  });

  event.target.blur();
};

const fetchPhoto = async params => {
  try {
    const noMorePhoto = btnLoadMore.dataset.more === "false";
    if (noMorePhoto) {
      return;
    }

    if (!isAnyPhotoAvailable) {
      return;
    }
    if (page > PhotoLeft) {
      btnLoadMoreText.textContent = "No more photos :(";
      isAnyPhotoAvailable = false;
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;

    PhotoLeft = Math.ceil(totalPhoto / perPage);

    page++;

    renderGallery(response.hits);

    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const displayPhotoScroll = () => {
  const params = new URLSearchParams({
    key: "31755618-c569c5727c417e8772568fe10",
    q: [formInput.value],
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: page,
    per_page: perPage,
  });

  fetchPhoto(params).then(() => lightBox.refresh());
  setTimeout(scrollGallery, 500);
};

const displayPhotoClick = event => {
  event.preventDefault();

  const params = new URLSearchParams({
    key: "31755618-c569c5727c417e8772568fe10",
    q: [formInput.value],
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: page,
    per_page: perPage,
  });

  fetchPhoto(params).then(() => lightBox.refresh());
  event.target.blur();
  setTimeout(scrollGallery, 500);
};

const scrollGallery = () => {
  const { bottom: galleryHight } = document
    .querySelector(".gallery")
    .getBoundingClientRect();
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  const galleryRow = Math.floor(galleryHight / cardHeight);
  window.scrollBy({
    top: cardHeight * (galleryRow - 4),
    behavior: "smooth",
  });
};
const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  displayPhotoScroll();
});

const loadMore = () => {
  if (loadOnClick)
    return btnLoadMore.addEventListener("click", displayPhotoClick);

  if (loadOnScroll)
    return observer.observe(document.querySelector("button.load-more"));
};

btnSearch.addEventListener("click", displayFirstPhoto);

modal.addEventListener("click", modalFunction);
