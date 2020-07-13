class Tooltip {
  element;
  poverRef;
  poutRef;
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
    this.removePointerEvent()
  }

  initialize() {
    document.addEventListener('pointerover', this.poverRef = this.pointerOverEvent.bind(this));
    document.addEventListener("pointerout", this.poutRef = this.removePointerEvent.bind(this));
  }

  pointerOverEvent(event) {
    let target = event.target;
    let tooltipHtml = target.dataset.tooltip;
    if(!tooltipHtml) return;

    this.render(tooltipHtml);

    let tt = this.element;

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
     this.element.remove();
     this.element = null;
    }
  }
}

const tooltip = new Tooltip();

export default tooltip;
