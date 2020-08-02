import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  categoriesList = [];

  currentProduct = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
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
              <input required="" data-element="title" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="description" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list" data-element="imagesList">
              </ul>
            </div>
            <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <input type="file" data-element="inputFile" id="inputFile">
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" data-element="subcategory" name="subcategory" id="subcategory">
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" data-element="price" type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" data-element="discount" type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" data-element="quantity" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
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

  setImagesRow(image) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="" data-url="${image.url}" data-source="${image.source}">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button></li>
    `;
  }

  setImagesList() {
    if(this.productId) {
      return this.currentProduct.images.map(image => `${this.setImagesRow(image)}`).join('');
    }
    return '';
  }

  imagePost = async event => {
    const { inputFile } = this.subElements;
    inputFile.click();
  }

  handleFiles = async event => {
    const selectedFile = event.target.files[0];
    const { uploadImage, imagesList } = this.subElements;
    uploadImage.disabled = true;
    uploadImage.classList.add('is-loading');

    const formData = new FormData();
    formData.append('image', selectedFile);

    const response = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    imagesList.firstElementChild.append(this.getImageItem(response.data.link, selectedFile.name));
    // imagesList.innerHTML += this.setImagesRow({url: response.data.link, source: selectedFile.name});

    uploadImage.classList.remove('is-loading')
    uploadImage.disabled = false;
  }

  submitForm = async event => {
    await this.save();
  }

  async save() {
    const productUrl = new URL('/api/rest/products', BACKEND_URL);

    const product = await fetchJson(productUrl, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.formatProductToObject()),
    })

    const myCustomEventString = this.productId ? 'product-updated' : 'product-saved';
    const myCustomEvent = new CustomEvent(myCustomEventString, {
      detail: product.id
    });
    this.element.dispatchEvent(myCustomEvent);
  }

  async render() {
    const mainElement = document.createElement('div');
    mainElement.innerHTML = this.template;
    this.element = mainElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.loadCategories();

    if(this.productId) {
      this.currentProduct = await this.loadData();
    }

    const { productForm, inputFile, imagesList, uploadImage } = this.subElements;
    imagesList.innerHTML = this.setImagesList();

    this.createImagesList();

    uploadImage.addEventListener('click', this.imagePost);
    productForm.addEventListener('submit', this.submitForm);
    inputFile.addEventListener('change', this.handleFiles);

    return this.element;
  }

  async loadData() {
    const productUrl = new URL('/api/rest/products', BACKEND_URL);
    productUrl.searchParams.set('id', this.productId);

    const productData = await fetchJson(productUrl);
    const { title, description, quantity, subcategory, price, discount, status } = productData[0];

    this.getTitle(title);
    this.getDescription(description);
    this.getQuantity(quantity);
    this.getPrice(price);
    this.getDiscount(discount);
    this.getStatus(status);
    this.getSubcategory(subcategory);

    return productData[0];
  }

  async loadCategories() {
    const categoriesUrl = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    const productCategoryData = await fetchJson(categoriesUrl);
    this.createCategoryList(productCategoryData);
    this.updateCategories();
  }

  formatProductToObject() {
    const { title, description, subcategory, price, discount, quantity, status} = this.subElements;
    const images = this.getImages();

    const productObject = {
      id: this.productId,
      title: title.value,
      description: description.value,
      images,
      subcategory: subcategory.value,
      price: parseInt(price.value, 10),
      discount: parseInt(discount.value, 10),
      quantity: parseInt(quantity.value, 10),
      status: parseInt(status.value, 10)
    }

    return productObject;
  }

  getImages() {
    const { imagesList } = this.subElements;

    const imagesData = [...imagesList.children].map(image => {
      const imageObject = {
        url: image.dataset.url,
        source: image.dataset.source,
      };
      return imageObject;
    });

    return imagesData;
  }

  createImagesList() {
    const { imageListContainer } = this.subElements;
    const { images } = this.formData;

    const items = images.map(({ url, source }) => this.getImageItem(url, source));

    const sortableList = new SortableList({
      items
    });

    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  updateCategories() {
    const selectedElement = this.element.querySelector('select[name="subcategory"]');

    for(const item of this.categoriesList) {
      const optionList = document.createElement('option');
      const formString = `${item["title"]} > ${item["subtitle"]}`;
      optionList.value = item["subid"];
      optionList.textContent = formString;
      selectedElement.appendChild(optionList);
    }
  }

  createCategoryList(categoriesData) {
    for(const item of categoriesData) {
      for(const child of item.subcategories) {
        const listItem = {"id": item.id, "title": item.title, "subid": child.id, "subtitle": child.title, "subcategory": child.category};
        this.categoriesList.push(listItem);
      }
    }
  }

  getSubcategory(subcategory) {
    const selectedElement = this.element.querySelector('select[name="subcategory"]');
    selectedElement.value = subcategory;
  }

  getTitle(title) {
    const selectedElement = this.element.querySelector('input[name="title"]');
    selectedElement.value = title;
  }

  getDescription(description) {
    const selectedElement = this.element.querySelector('textarea[name="description"]');
    selectedElement.value = description
  }

  getQuantity(quantity) {
    const selectedElement = this.element.querySelector('input[name="quantity"]');
    selectedElement.value = quantity;
  }

  getPrice(price) {
    const selectedElement = this.element.querySelector('input[name="price"]');
    selectedElement.value = price;
  }

  getDiscount(discount) {
    const selectedElement = this.element.querySelector('input[name="discount"]');
    selectedElement.value = discount;
  }

  getStatus(status) {
    const selectedElement = this.element.querySelector('select[name="status"]');
    selectedElement.value = status;
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
  }
}
