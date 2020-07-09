export default class NotificationMessage {
  element;
  subElements = {};

  constructor(message, {duration, type} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
      </div>
    `
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  show(element) {
    if(element) {
      this.element = element;
    }
    setTimeout(() =>{
      this.remove();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }
}
