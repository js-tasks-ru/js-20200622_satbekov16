export default class DoubleSlider {
  element;
  thumbLeftElement;
  thumbRightElement;

  positionLeftThumb = {
    shiftX: 0,
    sliderLeft: 0,
  };

  positionRightThumb = {
    shiftX: 0,
    sliderLeft: 0,
  };

  onMouseMoveLeftThumb = event => {
    const { shiftX, sliderLeft } = this.positionLeftThumb;
    const rInnerElement = document.getElementById("rInner");

    const currentPositionPx = Math.floor(event.clientX + shiftX - sliderLeft);
    const currentPositionPercent = currentPositionPx / rInnerElement.getBoundingClientRect().width;
    let newFromValue = this.min + ((this.max - this.min) * currentPositionPercent);

    if(Math.floor(newFromValue) < this.min) {
      newFromValue = this.min;
    }

    if(Math.floor(newFromValue) > this.selected.to) {
      newFromValue = this.selected.to;
    }

    this.setCorrectRangeFrom(Math.floor(newFromValue));
  }

  onMouseMoveRightThumb = event => {
    const { shiftX, sliderLeft } = this.positionRightThumb;
    const rInnerElement = document.getElementById("rInner");

    const currentPositionPx = Math.floor(event.clientX + shiftX - sliderLeft);
    const currentPositionPercent = currentPositionPx / rInnerElement.getBoundingClientRect().width;
    let newToValue = this.min + ((this.max - this.min) * currentPositionPercent);

    if(Math.floor(newToValue) > this.max) {
      newToValue = this.max;
    }

    if(Math.floor(newToValue) < this.selected.from) {
      newToValue = this.selected.from;
    }

    this.setCorrectRangeTo(Math.floor(newToValue));
  }

  onMouseUpLeftThumb = () => {
    const thumbLeftUpEvent = new CustomEvent('range-select', {
      detail: this.selected,
    });

    this.element.dispatchEvent(thumbLeftUpEvent);

    document.removeEventListener('pointerup', this.onMouseUpLeftThumb);
    document.removeEventListener('pointermove', this.onMouseMoveLeftThumb);
  }

  onMouseUpRightThumb = () => {
    const thumbRightUpEvent = new CustomEvent('range-select', {
      detail: this.selected,
    });

    this.element.dispatchEvent(thumbRightUpEvent);

    document.removeEventListener('pointerup', this.onMouseUpRightThumb);
    document.removeEventListener('pointermove', this.onMouseMoveRightThumb);
  }

  constructor({min, max, formatValue, selected = {from: min, to: max}} = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
       <div id="rSlider" class="range-slider">
        <span data-element="from"></span>
        <div id="rInner" class="range-slider__inner">
          <span id="rProgress" class="range-slider__progress" style="left: 0%; right: 0%"></span>
          <span class="range-slider__thumb-left" style="left: 0%"></span>
          <span class="range-slider__thumb-right" style="right: 0%"></span>
        </div>
        <span data-element="to"></span>
        </div>
    `;
  }

  render() {
    const sliderElement = document.createElement('div');
    sliderElement.innerHTML = this.template;
    this.element = sliderElement.firstElementChild;
    this.thumbLeftElement = this.element.querySelector(".range-slider__thumb-left");
    this.thumbRightElement = this.element.querySelector(".range-slider__thumb-right");
    this.thumbLeftElement.ondragstart = () => false;
    this.thumbRightElement.ondragstart = () => false;
    this.setCorrectRangeFrom(this.selected.from);
    this.setCorrectRangeTo(this.selected.to);
  }

  setCorrectRangeFrom(from = null) {
    if(from) {
      const difference = this.max - this.min;
      const fromDiff = from - this.min;
      const currentPositionPercent = fromDiff * 100 / difference;

      this.thumbLeftElement.style.left = `${Math.floor(currentPositionPercent)}%`;

      const rProgressElement = this.element.querySelector(".range-slider__progress");
      rProgressElement.style.left = `${Math.floor(currentPositionPercent)}%`;

      const elem = this.element.querySelector("[data-element=from]");
      elem.textContent = this.formatValue(from);
      this.selected.from = from;
    }
    else {
      const elem = this.element.querySelector("[data-element=from]");
      elem.textContent = this.formatValue(this.min);
    }
  }

  setCorrectRangeTo(to = null) {
    if(to) {
      const difference = this.max - this.min;
      const toDiff = this.max - to;
      const currentPositionPercent = toDiff * 100 / difference;

      this.thumbRightElement.style.right = `${Math.floor(currentPositionPercent)}%`;

      const rProgressElement = this.element.querySelector(".range-slider__progress");
      rProgressElement.style.right = `${Math.floor(currentPositionPercent)}%`;

      const elem = this.element.querySelector("[data-element=to]");
      elem.textContent = this.formatValue(to);
      this.selected.to = to;
    } else {
      const elem = this.element.querySelector("[data-element=to]");
      elem.textContent = this.formatValue(this.max);
    }
  }

  initEventListeners() {
    this.thumbLeftElement.addEventListener('pointerdown', (event) => {
      event.preventDefault();

      this.getInitialPositionLeftThumb(event);

      document.addEventListener('pointermove', this.onMouseMoveLeftThumb);
      document.addEventListener('pointerup', this.onMouseUpLeftThumb);
    });

    this.thumbRightElement.addEventListener('pointerdown', (event) => {
      event.preventDefault();

      this.getInitialPositionRightThumb(event);

      document.addEventListener('pointermove', this.onMouseMoveRightThumb);
      document.addEventListener('pointerup', this.onMouseUpRightThumb);
    })

  }

  getInitialPositionLeftThumb(event) {
    const rInnerElement = document.getElementById("rInner");
    this.positionLeftThumb.shiftX = event.clientX - this.thumbLeftElement.getBoundingClientRect().left;
    this.positionLeftThumb.sliderLeft = rInnerElement.getBoundingClientRect().left;
  }

  getInitialPositionRightThumb(event) {
    const rInnerElement = document.getElementById("rInner");
    this.positionRightThumb.shiftX = event.clientX - this.thumbRightElement.getBoundingClientRect().left;
    this.positionRightThumb.sliderLeft = rInnerElement.getBoundingClientRect().left;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
