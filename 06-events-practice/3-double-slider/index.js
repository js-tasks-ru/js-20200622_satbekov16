export default class DoubleSlider {
  element;
  static root = document.body;

  shiftX;
  down = false;

  constructor({min, max, formatValue, selected = {from: 0, to: 0}} = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.selected.from = selected.from;
    this.selected.to = selected.to;
    this.render();
    this.addEventListeners();
  }

  get template() {
    return `
       <div id="rSlider" class="range-slider">
        <span data-element="from">${this.getCorrectRangeFrom()}</span>
        <div id="rInner" class="range-slider__inner">
          <span class="range-slider__progress"></span>
          <span class="range-slider__thumb-left"></span>
          <span class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.getCorrectRangeTo()}</span>
        </div>
    `;
  }

  getCorrectRangeFrom() {
    this.min = this.formatValue(this.min);
    if(this.selected.from) {
      this.min = this.formatValue(this.selected.from);
    }
    return this.min;
  }

  getCorrectRangeTo() {
    this.max = this.formatValue(this.max);
    if(this.selected.to) {
      this.max = this.formatValue(this.selected.to);
    }
    return this.max;
  }

  render() {
    // const sliderElement = document.createElement('div');
    // sliderElement.innerHTML = this.template;
    // this.element = sliderElement.firstElementChild;
  }

  addEventListeners() {

    const sliderElement = document.createElement('div');
    sliderElement.innerHTML = this.template;
    this.element = sliderElement.firstElementChild;

    const thumbLeftElement = this.element.querySelector(".range-slider__thumb-left");

    thumbLeftElement.onmousedown = function(event) {
      event.preventDefault(); // предотвратить запуск выделения (действие браузера)

      let shiftX = event.clientX - thumbLeftElement.getBoundingClientRect().left;
      // shiftY здесь не нужен, слайдер двигается только по горизонтали

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      function onMouseMove(event) {
        console.log(rInner.getBoundingClientRect().left);
        let newLeft = event.clientX - shiftX - rInner.getBoundingClientRect().left;

        // курсор вышел из слайдера => оставить бегунок в его границах.
        if (newLeft < 0) {
          newLeft = 0;
        }
        let rightEdge = rInner.offsetWidth - thumbLeftElement.offsetWidth;
        if (newLeft > rightEdge) {
          newLeft = rightEdge;
        }

        thumbLeftElement.style.left = newLeft + 'px';
      }

      function onMouseUp() {
        // console.log(shiftX);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
      }
    }

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
