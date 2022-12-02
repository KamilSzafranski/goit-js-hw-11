import Notiflix from "notiflix";
import Axios from "axios";
import axios from "axios";

const formInput = document.querySelector(".search-form__input");
const gallery = document.querySelector("div.gallery");
const btnSearch = document.querySelector("button.search-form__btn");
const btnLoadMore = document.querySelector("button.load-more");

let page = 1;

const renderGallery = data => {
  const markup = data
    .map(element => {
      return `<div class="photo-card">
    <img src="${element.webformatURL}" alt="${element.tags}" loading="lazy" />
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
  </div>`;
    })
    .join("");
  gallery.insertAdjacentHTML("beforeend", markup);
};

const clearGallery = () => (gallery.innerHTML = "");

const fetchPhoto = async params => {
  try {
    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    const noSearch = response.hits.length === 0;
    console.log(response);

    if (response.hits.length === 0) {
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
    }

    renderGallery(response.hits);

    return response;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
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
    per_page: 40,
  });
  const emptyFormInput = formInput.value === "";
  if (emptyFormInput) return Notiflix.Notify.info("Please enter a photo name!");
  clearGallery();
  fetchPhoto(params);
  event.target.blur();
  setTimeout(() => {
    btnLoadMore.style.display = "flex";
  }, 500);
};

btnSearch.addEventListener("click", displayPhoto);

btnLoadMore.addEventListener("click", event => {
  ++page;
  const params = new URLSearchParams({
    key: "31755618-c569c5727c417e8772568fe10",
    q: [formInput.value],
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: page,
    per_page: 40,
  });
  const emptyFormInput = formInput.value === "";
  if (emptyFormInput) return Notiflix.Notify.info("Please enter a photo name!");

  fetchPhoto(params);
  event.target.blur();
});
