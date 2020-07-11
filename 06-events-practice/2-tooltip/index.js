class Tooltip {
  element;

  constructor() {
    if(!Tooltip.instance) {
      Tooltip.instance = this;
    }
    this.initialize();
    return Tooltip.instance;
  }

  render(id) {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="tooltip">${id}</div>
    `;
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOverEvent);
    document.addEventListener("pointerout", this.removePointerEvent);
  }

  pointerOverEvent(event) {
    let target = event.target;
    let tooltipHtml = target.dataset.tooltip;
    if(!tooltipHtml) return;

    this.render(tooltipHtml);

    let tt = this.element;

    let shiftX = event.clientX;
    let shiftY = event.clientY;

    tt.style.position = 'absolute';

    document.body.append(tt);

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      tt.style.left = pageX + 'px';
      tt.style.top = pageY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('pointermove', onMouseMove);

  }

  removePointerEvent() {
    if(this.element) {
      this.element.remove();
      this.element = null;
      document.removeEventListener('pointerover', this.pointerOverEvent);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
