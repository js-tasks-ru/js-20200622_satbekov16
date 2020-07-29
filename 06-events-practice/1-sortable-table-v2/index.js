export default class SortableTable {
  element;
  subElements = {};
  headerConfig = [];
  data = [];

  constructor(headerConfig, {data = []} = {},
              defaultSorting = {id: headerConfig.find(item => item.sortable).id, order: 'asc'}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.defaultSorting = defaultSorting;
    this.render();
    this.addEventListeners();
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>
    `;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>
    `;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.defaultSorting.id === id ? this.defaultSorting.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrder = this.defaultSorting.id === id ? this.defaultSorting.order : '';
    return isOrder ?
      `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>` : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>
    `;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  render() {
    const { id, order } = this.defaultSorting;
    const element = document.createElement('div');
    const sorted = this.sortByColumnTitle(id, order);

    element.innerHTML = this.getTable(sorted);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  addEventListeners() {
    const columnRows = this.element.querySelectorAll('[data-sortable="true"]');

    columnRows.forEach(columnItem => {
      let eventTriggered = false;

      columnItem.addEventListener('pointerdown', (event) => {
        const arrow = columnItem.querySelector('.sortable-table__sort-arrow');

        if(!arrow) {
          columnItem.append(this.subElements.arrow);
          columnItem.dataset.order = 'desc';
          this.updateRowsByOrder(columnItem)
          eventTriggered = true;
        } else {
          columnItem.dataset.order = eventTriggered === false ? 'desc' : 'asc';
          this.updateRowsByOrder(columnItem);
          eventTriggered = !eventTriggered;
        }

      });
    });
  }

  updateRowsByOrder(columnItem) {
    const { id, order } = columnItem.dataset;
    const sorted = this.sortByColumnTitle(id, order);
    this.subElements.body.innerHTML = this.getTableRows(sorted);
  }

  sortByColumnTitle(field, order) {
    const deepCopy = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType, customSorting } = column;

    return deepCopy.sort((a, b) => {
      switch(sortType) {
        case 'string':
          if(order === 'asc') {
            return a[field].localeCompare(b[field], 'ru-RU', {caseFirst: 'upper'});
          }
          return b[field].localeCompare(a[field], 'ru-RU', {caseFirst: 'upper'});
        case 'number':
          if(order === 'asc') {
            return a[field] - b[field];
          }
          return b[field] - a[field];
        case 'custom':
          if(order === 'asc') {
            return customSorting(a, b);
          }
          return customSorting(b, a);
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

}

