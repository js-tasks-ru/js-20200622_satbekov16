export default class ColumnChart {

  data = [];
  label = "";
  link = "";
  value = 0;
  chartHeight = 50;

  element;

  constructor({data, label, link, value} = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.render();
  }

  render() {

      this.element = document.createElement("div");

      if(!this.data) {
        this.element.setAttribute("class", "column-chart_loading");
      }

      let output = "<div class=\"column-chart__title\">" + this.label;

      if(this.link) {
        output += "<a href=\"/sales\" class=\"column-chart__link\">" + this.link + "</a>"
      }

      output += "</div>" + "<div class=\"column-chart__container\">" + "<div class=\"column-chart__header\">" + this.value;

      this.element.innerHTML = output;

      if(this.data) {
        const containerElement = this.element.querySelector(".column-chart__container");
        const containerChartElement = document.createElement("div");
        containerChartElement.setAttribute("class", "column-chart__chart");
        containerElement.appendChild(containerChartElement);
        const containerChartInnerElement = this.element.querySelector(".column-chart__chart");

        for(let i = 0; i < this.data.length; i++) {
          const dataElement = document.createElement("div");
          const maxValue = Math.max(...this.data);
          const scale = 50 / maxValue;
          const toolTipValue = (this.data[i] / maxValue * 100).toFixed(0) + '%';
          dataElement.setAttribute("style", "--value: " + Math.floor(this.data[i] * scale));
          dataElement.setAttribute("data-tooltip", toolTipValue);
          containerChartInnerElement.appendChild(dataElement);
        }
        this.element.innerHTML += "</div></div>";
      }

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  update({bodyData: newData}) {
    this.data = newData;
  }
}
