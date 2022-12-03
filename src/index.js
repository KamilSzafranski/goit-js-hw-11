import Notiflix from "notiflix";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formInput = document.querySelector(".search-form__input");
const gallery = document.querySelector("div.gallery");
const btnSearch = document.querySelector("button.search-form__btn");
const btnLoadMore = document.querySelector("button.load-more");

let page = 1;
let perPage = 40;
let totalPhoto = 500;
let PhotoLeft = Math.ceil(totalPhoto / perPage);
let lightBox;

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

const fetchPhoto = async params => {
  try {
    if (page > PhotoLeft) {
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;

    PhotoLeft = Math.ceil(totalPhoto / perPage);
    const noSearch = response.hits.length === 0;
    if (noSearch) {
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
    }
    page++;

    renderGallery(response.hits);

    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};

const fetchFirstPhoto = async params => {
  try {
    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    totalPhoto = await response.totalHits;
    PhotoLeft = Math.ceil(totalPhoto / perPage);
    const noSearch = response.hits.length === 0;
    if (noSearch) {
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
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
  const params = new URLSearchParams({
    key: "31755618-c569c5727c417e8772568fe10",
    q: [formInput.value],
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: 1,
    per_page: perPage,
  });
  const emptyFormInput = formInput.value === "";
  if (emptyFormInput) return Notiflix.Notify.info("Please enter a photo name!");
  clearGallery();
  fetchFirstPhoto(params).then(response => {
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
  const emptyFormInput = formInput.value === "";
  if (emptyFormInput) return Notiflix.Notify.info("Please enter a photo name!");

  fetchPhoto(params).then(() => lightBox.refresh());
  event.target.blur();
};
btnSearch.addEventListener("click", displayFirstPhoto);

btnLoadMore.addEventListener("click", displayPhoto);

gallery.addEventListener("click", event => {
  event.preventDefault();
});
