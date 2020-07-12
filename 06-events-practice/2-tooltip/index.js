class Tooltip {
  element;
  poverRef;
  pmoveRef;

  constructor() {
    this.render();
    this.initialize();
  }

  render(id) {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="tooltip">${id}</div>
    `;
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  initialize() {
    document.addEventListener('pointerover', this.poverRef = this.pointerOverEvent.bind(this));
    document.addEventListener("pointerout", this.removePointerEvent.bind(this));
  }

  pointerOverEvent(event) {
    let target = event.target;
    let tooltipHtml = target.dataset.tooltip;
    if(!tooltipHtml) return;

    this.render(tooltipHtml);

    let tt = this.element;

    document.body.append(tt);
    tt.style.position = 'absolute';

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      tt.style.left = pageX + 'px';
      tt.style.top = pageY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('pointermove', this.poverRef = onMouseMove);

  }

  removePointerEvent() {
    document.removeEventListener('pointerover', this.poverRef);
    document.removeEventListener('pointermove', this.pmoveRef);
    if(this.element) {
     this.remove();
     this.element = null;
    }
  }
}

const tooltip = new Tooltip();

export default tooltip;
