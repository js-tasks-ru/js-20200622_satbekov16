import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};

  defaultProduct = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    images: [],
    status: 1,
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required
              data-element="title"
              id="title"
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required
            data-element="productDescription"
            id="description"
            name="description"
            class="form-control"
            placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>

            <ul class="sortable-list" data-element="imageListContainer">
            ${this.createImagesList()}
            </ul>

            <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.renderCategoriesList()}
          </div>


          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required
               data-element="price"
               id="price"
               value=""
               type="number"
               name="price"
               class="form-control"
               placeholder="${this.defaultProduct.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required
               data-element="discount"
               id="discount"
               value=""
               type="number"
               name="discount"
               class="form-control"
               placeholder="${this.defaultProduct.discount}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required
             data-element="quantity"
             id="quantity"
             value=""
             type="number"
             name="quantity"
             class="form-control"
             placeholder="${this.defaultProduct.quantity}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" data-element="status" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  get emptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  renderCategoriesList() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <select class="form-control" id="subcategory" name="subcategory"></select>
    `;
    const selectElement = wrapper.firstElementChild;

    for(const category of this.categories) {
      for(const subcategory of category.subcategories) {
        selectElement.appendChild(new Option(`${category.title} > ${subcategory.title}`, subcategory.id));
      }
    }

    return selectElement.outerHTML;
  }

  submitForm = event => {
    event.preventDefault();
    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    // TODO: replace to addEventListener
    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('something went wrong', error);
    }
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  createImagesList () {
    return this.formData.images.map(item => {
      return this.getImageItem(item.url, item.source).outerHTML;
    }).join('');
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  async loadCategories() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProductData(productId) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultProduct).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      values[field] = formatToNumber.includes(field)
        ? parseInt(productForm.querySelector(`#${field}`).value)
        : productForm.querySelector(`#${field}`).value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData () {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultProduct).filter(item => !excludedFields.includes(item));

    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.formData[item] || this.defaultProduct[item];
    });
  }

  async render() {
    const loadedCategoriesPromise = this.loadCategories();
    const loadedProductsPromise = this.productId ? this.loadProductData(this.productId) : Promise.resolve([this.defaultProduct]);
    const [ categoriesData, productResponse ] = await Promise.all([loadedCategoriesPromise, loadedProductsPromise]);
    const [ productData ] = productResponse;

    this.categories = categoriesData;
    this.formData = productData;

    const mainElement = document.createElement('div');
    mainElement.innerHTML = this.formData ? this.template : this.emptyTemplate;

    this.element = mainElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.setFormData();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners () {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.submitForm);
    uploadImage.addEventListener('click', this.uploadImage);

    /* TODO: will be removed in the next iteration of realization.
       this logic will be implemented inside "SortableList" component
    */
    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
