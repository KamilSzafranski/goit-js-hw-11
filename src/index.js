import Notiflix from "notiflix";
import Axios from "axios";
import axios from "axios";

const formInput = document.querySelector(".search-form__input");

const params = new URLSearchParams({
  key: "31755618-c569c5727c417e8772568fe10",
  q: "dsadsadasdsadasd",
  image_type: "photo",
  orientation: "horizontal",
  safesearch: "true",
});

const fetchPhoto = async () => {
  try {
    const getPhoto = await axios.get(`https://pixabay.com/api/?${params}`);
    const response = await getPhoto.data;
    if (response.hits.length === 0) {
      Notiflix.Notify.warning(
        "Sorry, there are no images matching your search query. Please try again."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
};
fetchPhoto();
