class Tooltip {
  element;
  pointerOverReference;
  pointerMoveReference;

  constructor() {
    this.render();
    this.initialize();
  }

  render(id) {
    const element = document.createElement('div');
    this.element = element;
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.pointerOverReference);
    document.removeEventListener('pointermove', this.pointerMoveReference);
    this.remove();
  }

  initialize() {
    this.pointerOverReference = this.pointerOverEvent.bind(this);
    document.addEventListener('pointerover', this.pointerOverReference);
    document.addEventListener('pointerout', (event) => {
      if(this.element) {
        this.element.remove();
        this.element = null;
      }
    });
  }

  pointerOverEvent(event) {
    const target = event.target;
    const tooltipHtml = target.dataset.tooltip;
    if(!tooltipHtml) return;

    this.element.innerHTML = `
        <div class="tooltip">${tooltipHtml}</div>
    `;
    document.body.append(this.element);

    const tooltipElement = this.element;

    tooltipElement.style.position = 'absolute';

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      tooltipElement.style.left = pageX + 'px';
      tooltipElement.style.top = pageY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('pointermove', onMouseMove);
  }

}

const tooltip = new Tooltip();

export default tooltip;
