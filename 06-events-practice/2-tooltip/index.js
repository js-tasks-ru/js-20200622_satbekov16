class Tooltip {
  static instance;
  element;

  /*
  Tooltip is constructed as a singleton
  */
  constructor() {
    if(Tooltip.instance) {
      return Tooltip.instance;
    } else {
      Tooltip.instance = this;
    }
  }

  render(tooltipText) {
    this.element = document.createElement('div');
    this.element.innerHTML = `
      <div class="tooltip">${tooltipText}</div>
    `;
    document.body.append(this.element);
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.pointerOverEventHandler);
    document.addEventListener('pointerout', this.pointerOutEventHandler);
  }

  initialize() {
    this.initEventListeners();
  }

  pointerOverEventHandler = (event) => {
    const targetElement = event.target;
    if(targetElement) {
      const tooltipHtml = targetElement.dataset.tooltip;
      if(!tooltipHtml) return;
      this.render(tooltipHtml);
      this.moveTooltip(event.pageX, event.pageY);
      document.addEventListener('pointermove', this.pointerMoveEventHandler);
    }
  }

  moveTooltip(cordX, cordY) {
    this.element.style.position = 'absolute';
    this.element.style.left = `${cordX + 5}px`;
    this.element.style.top = `${cordY + 5}px`;
  }

  removeTooltip() {
    if(this.element) {
      this.remove();
      this.element = null;
      document.removeEventListener('pointermove', this.pointerMoveEventHandler);
    }
  }

  pointerOutEventHandler = (event) => {
    this.removeTooltip();
  }

  pointerMoveEventHandler = (event) => {
    this.moveTooltip(event.pageX, event.pageY);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOverEventHandler);
    document.removeEventListener('pointermove', this.pointerOutEventHandler);
    this.removeTooltip();
  }

}

const tooltip = new Tooltip();

export default tooltip;
