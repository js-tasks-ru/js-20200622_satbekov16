export default class DoubleSlider {
  element;
  draggingThumb;
  subElements = {};

  positionLeftThumb = {
    shiftX: 0,
  };

  positionRightThumb = {
    shiftX: 0,
  };

  onPointerDown(event) {
    const thumb = event.target;
    event.preventDefault();
    this.draggingThumb = thumb;

    const { left } = thumb.getBoundingClientRect();
    const { leftThumb, rightThumb } = this.subElements;

    if(this.draggingThumb === leftThumb) {
      this.positionLeftThumb.shiftX = event.clientX - left;
    }

    if(this.draggingThumb === rightThumb) {
      this.positionRightThumb.shiftX = event.clientX - left;
    }

    this.element.classList.add('range-slider_dragging');
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = event => {
    event.preventDefault();

    const { clientX } = event;
    const { from, to, leftThumb, rightThumb } = this.subElements;
    const { left: sliderLeft, right: sliderRight, width } = this.subElements.sliderInner.getBoundingClientRect();

    if(this.draggingThumb === leftThumb) {
      let newLeft = (clientX - sliderLeft - this.positionLeftThumb.shiftX) / width;

      if(newLeft < 0) {
        newLeft = 0;
      }

      newLeft *= 100;

      let right = parseFloat(rightThumb.style.right);

      if (newLeft + right > 100) {
        newLeft = 100 - right;
      }

      this.draggingThumb.style.left = this.subElements.progress.style.left = newLeft + '%';
      from.innerHTML = this.formatValue(this.getValue().newFromValue);
    }

    if(this.draggingThumb === rightThumb) {
      let newRight = (sliderRight - clientX - this.positionRightThumb.shiftX) / width;

      if (newRight < 0) {
        newRight = 0;
      }

      newRight *= 100;

      let left = parseFloat(leftThumb.style.left);
      if (left + newRight > 100) {
        newRight = 100 - left;
      }

      this.draggingThumb.style.right = this.subElements.progress.style.right = newRight + '%';
      to.innerHTML = this.formatValue(this.getValue().newToValue);
    }
  }

  onPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    const spanDetails = {
      from: this.getValue().newFromValue,
      to: this.getValue().newToValue
    }

    const thumbUpEvent = new CustomEvent('range-select', {
      detail: spanDetails,
      bubbles: true
    });

    this.element.dispatchEvent(thumbUpEvent);
    this.removeEventListeners();
  }

  getValue() {
    const allRange = this.max - this.min;
    const { leftThumb, rightThumb } = this.subElements;
    const { left } = leftThumb.style;
    const { right } = rightThumb.style;

    const newFromValue = Math.round(this.min + (allRange * parseFloat(left) / 100));
    const newToValue = Math.round(this.max - (allRange * parseFloat(right) / 100));
    return { newFromValue, newToValue };
  }

  setCurrentState() {
    const { leftThumb, rightThumb, progress } = this.subElements;

    const allRange = this.max - this.min;
    const fromDiff = this.selected.from - this.min;
    const toDiff = this.max - this.selected.to;

    const leftPercent = Math.floor(fromDiff * 100 / allRange) + '%';
    const rightPercent = Math.floor(toDiff * 100 / allRange) + '%';

    progress.style.left = leftPercent;
    progress.style.right = rightPercent;

    leftThumb.style.left = leftPercent;
    rightThumb.style.right = rightPercent;
  }

  constructor({min = 100, max = 200,
                formatValue = value => '$' + value,
                selected = { from: min, to: max}} = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;

    this.render();
    this.initEventListeners();
  }

  get template() {
    const { from, to } = this.selected;

    return `
       <div class="range-slider">
        <span data-element="from">${this.formatValue(from)}</span>
        <div data-element="sliderInner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: 20%; right: 0%"></span>
          <span data-element="leftThumb" class="range-slider__thumb-left" style="left: 50%"></span>
          <span data-element="rightThumb" class="range-slider__thumb-right" style="right: 0%"></span>
        </div>
        <span data-element="to">${this.formatValue(to)}</span>
        </div>
    `;
  }

  initEventListeners() {
    const { leftThumb, rightThumb } = this.subElements;

    leftThumb.addEventListener('pointerdown', (event) => {
      this.onPointerDown(event);
    });
    rightThumb.addEventListener('pointerdown', (event) => {
      this.onPointerDown(event);
    });
  }

  removeEventListeners() {
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  render() {
    const sliderElement = document.createElement('div');
    sliderElement.innerHTML = this.template;
    this.element = sliderElement.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.setCurrentState();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return[...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
