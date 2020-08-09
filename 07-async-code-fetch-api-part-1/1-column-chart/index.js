import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({url = '', range = {from: new Date(), to: new Date()}, label = '', link = '', formatHeading = data => data} = {}) {
    this.url = new URL(url, 'https://course-js.javascript.ru');
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.fetchData(this.range.from, this.range.to);
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
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  async fetchData(dateFrom, dateTo) {
    this.element.classList.add('column-chart_loading');
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.url.searchParams.set('from', dateFrom.toISOString());
    this.url.searchParams.set('to', dateTo.toISOString());

    const chartData = await fetchJson(this.url);

    this.setNewRange(dateFrom, dateTo);

    if (Object.values(chartData).length && chartData) {
      this.subElements.header.textContent = this.getHeaderValue(chartData);
      this.subElements.body.innerHTML = this.getColumnBody(chartData);
      this.element.classList.remove('column-chart_loading');
    }
  }

  async update(dateFrom, dateTo) {
    return await this.fetchData(dateFrom, dateTo);
  }

  setNewRange(dateFrom, dateTo) {
    this.range.from = dateFrom;
    this.range.to = dateTo;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data).map(([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const dataTooltipValue = (value / maxValue * 100).toFixed(0);
      const dataTooltip = `
        <span>
          <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${dataTooltipValue}%</strong>
        </span>
      `;
      return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${dataTooltip}%"></div>`
    }).join('');
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






