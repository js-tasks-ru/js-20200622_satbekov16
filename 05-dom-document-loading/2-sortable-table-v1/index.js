export default class SortableTable {

  element;
  subElements = {};
  headerConfig = [];
  data = [];

  constructor(headerConfig, {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
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
    return `
      <div class="sortable-table__cell" data-name="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow()}
      </div>
    `;
  }

  getHeaderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
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
    const element = document.createElement('div');
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  sort(field, order) {
    const sorted = this.sortByColumnTitle(field, order);
    const columnsRow = this.element.querySelectorAll('.sortable-table__cell[data-name]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-name="${field}"]`);

    // NOTE: Remove sorting arrow from other columns
    columnsRow.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
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

