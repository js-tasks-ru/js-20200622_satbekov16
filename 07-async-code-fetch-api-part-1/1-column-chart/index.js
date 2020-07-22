import ordersData from './__mocks__/orders-data.js'
export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  result = Object.values(ordersData);

  constructor({url = '', range = {from: Date, to: Date}, label = '', link = '', formatHeading = []} = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading " style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.result)}
          </div>
        </div>
      </div>
    `;

  }

  render() {

    const element = document.createElement("div");
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    if(ordersData) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements(this.element);

  }

  async update(dateFrom, dateTo) {

    const reqDateFrom = this.formatDate(dateFrom);
    const reqDateTo = this.formatDate(dateTo);
    const requestURL = `https://course-js.javascript.ru/${this.url}?from=${reqDateFrom}&to=${reqDateTo}`;
    const response = await fetch(requestURL);
    if(response.ok) {
      response.json().then(data => {
        const res = Object.values(data);
        this.subElements.body.innerHTML = this.getColumnBody(res);
      })
    } else {
      alert('Error HTTP: ' + response.status)
    }
  }

  formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);

    return data.map(item => {
      const scale = this.chartHeight / maxValue;
      const dataTooltipValue = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${dataTooltipValue}%"></div>`
    }).join('');
  }

  // update({bodyData: newData}) {
  //   this.subElements.body.innerHTML = this.getColumnBody(newData);
  // }

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
    this.element = null;
    this.subElements = {};
  }

}






