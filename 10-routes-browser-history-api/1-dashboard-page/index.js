import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>

        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Лидер продаж</h3>

        <div data-element="sortableTable">
        <!-- sortable-table component -->
        </div>

      </div>
    `;
  }

  constructor() {

  }

  async initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    const rangePicker = new RangePicker({
      from, to
    });

    const ordersChart = new ColumnChart({
      label: 'orders',
      link: '#',
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      }
    });

    const salesChart = new ColumnChart({
      label: 'sales',
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      }
    });

    const customersChart = new ColumnChart({
      label: 'customers',
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      }
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    })

    this.components.rangePicker = rangePicker;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
    this.components.sortableTable = sortableTable;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.appendChild(element);
    })
  }

  async render() {
    const mainElement = document.createElement('div');

    mainElement.innerHTML = this.template;
    this.element = mainElement.firstElementChild;
    this.prepareSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  async updateComponents (from, to) {
    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);

    this.components.sortableTable.addRows(data);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  prepareSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    for(const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
