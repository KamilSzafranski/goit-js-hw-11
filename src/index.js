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

let page = 1;
let perPage = 40;
let totalPhoto = 500;
let PhotoLeft = Math.ceil(totalPhoto / perPage);
let lightBox;
let loadOnScroll = false;
let loadOnClick = false;
let isAnyPhotoAvailable;

const params = {
  key: "31755618-c569c5727c417e8772568fe10",
  image_type: "photo",
  orientation: "horizontal",
  safesearch: "true",
  page: page,
  per_page: perPage,
};

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
    .map(
      ({
        webformatURL: smallPhoto,
        largeImageURL: largePhoto,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return ` <a href="${largePhoto}" class="photo-card">
   <img src="${smallPhoto}" alt="${tags}" title="${tags}" loading="lazy" />
    <div class="info"><p class="info-item"><b>Likes</b>${likes}</p>
    <p class="info-item"><b>Views</b>${views}</p>
    <p class="info-item"><b>Comments</b>${comments}</p>
    <p class="info-item"><b>Downloads</b>${downloads}</p></div></a>
  `;
      }
    )
    .join("");
  gallery.insertAdjacentHTML("beforeend", markup);
};

const clearGallery = () => (gallery.innerHTML = "");

const scrollGallery = () => {
  window.scrollBy({
    top: window.innerHeight - 150,
    behavior: "smooth",
  });
};

const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;

  displayPhoto();
});

const loadMore = () => {
  if (loadOnClick) return btnLoadMore.addEventListener("click", displayPhoto);

  if (loadOnScroll)
    return observer.observe(document.querySelector("button.load-more"));
};

const fetchFirstPhoto = async options => {
  try {
    const getPhoto = await axios.get(`https://pixabay.com/api/?${options}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;
    PhotoLeft = Math.ceil(totalPhoto / perPage);
    isAnyPhotoAvailable = true;

    if (response.hits.length === 0) {
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
    params.page++;
    renderGallery(response.hits);
    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const fetchPhoto = async options => {
  try {
    if (btnLoadMore.dataset.more === "false") {
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

    const getPhoto = await axios.get(`https://pixabay.com/api/?${options}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;

    PhotoLeft = Math.ceil(totalPhoto / perPage);

    params.page++;

    renderGallery(response.hits);
    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const displayFirstPhoto = event => {
  event.preventDefault();
  btnLoadMore.style.display = "none";
  params.page = 1;
  params.q = formInput.value;
  const options = new URLSearchParams(params);
  if (formInput.value === "")
    return Notiflix.Notify.info("Please enter a photo name!");

  clearGallery();

  fetchFirstPhoto(options).then(response => {
    if (response.totalHits === 0) return;
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);

    setTimeout(() => {
      btnLoadMore.style.display = "flex";
      lightBox = new SimpleLightbox(".gallery a");
    }, 500);
  });

  event.target.blur();
};

const displayPhoto = event => {
  if (loadOnClick) {
    event.preventDefault();
    event.target.blur();
  }

  const options = new URLSearchParams(params);

  fetchPhoto(options).then(() => {
    lightBox.refresh();
    setTimeout(scrollGallery, 300);
  });
};

btnSearch.addEventListener("click", displayFirstPhoto);

modal.addEventListener("click", modalFunction);
