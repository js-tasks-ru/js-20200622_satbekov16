import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  categoriesList = [];

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
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"><ul class="sortable-list"><li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value="https://i.imgur.com/MWorX2R.jpg">
              <input type="hidden" name="source" value="75462242_3746019958756848_838491213769211904_n.jpg">
              <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="https://i.imgur.com/MWorX2R.jpg">
            <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
          </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button></li></ul></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">

            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
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

  async render() {
    const mainElement = document.createElement('div');
    mainElement.innerHTML = this.template;
    this.element = mainElement.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.fetchData();
  }

  async fetchData() {
    const productUrl = new URL('/api/rest/products', BACKEND_URL);
    const categoriesUrl = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);

    productUrl.searchParams.set('id', this.productId);

    const productData = await fetchJson(productUrl);
    const { title, description, quantity, subcategory, price, discount, status } = productData[0];

    const productCategoryData = await fetchJson(categoriesUrl);

    this.createCategoryList(productCategoryData);
    this.updateCategories();

    this.getTitle(title);
    this.getDescription(description);
    this.getQuantity(quantity);
    this.getPrice(price);
    this.getDiscount(discount);
    this.getStatus(status);
    this.getSubcategory(subcategory);
  }


  updateCategories() {
    const selectedElement = this.element.querySelector('select[name="subcategory"]');
    for(const item of this.categoriesList) {
      const optionList = document.createElement('option');
      optionList.value = item["subid"];
      const formString = `${item["title"]} > ${item["subtitle"]}`;
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

  destroy() {
    this.element.remove();
  }
}
