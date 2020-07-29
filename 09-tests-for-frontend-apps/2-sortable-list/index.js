export default class SortableList {

  element;
  sortableListContainer;
  currentDraggingElement;

  placeHolderElement;

  mouseOffset = {
    x: 0,
    y: 0,
  };

  pointerDownHandler = (event) => {
    console.log(this.element);
    console.log('HELLO');
    const currentItem = event.target.closest('.sortable-list__item');

    // this.mouseOffset = {
    //   x: currentItem.offsetLeft - event.clientX,
    //   y: currentItem.offsetTop - event.clientY,
    // };
    //


    const rect = currentItem.getBoundingClientRect();

    this.mouseOffset = {
      x: event.clientX - rect.x,
      y: event.clientY - rect.y,
    };

    event.preventDefault();

    this.currentDraggingElement = currentItem;

    this.currentDraggingElement.style.width = `${this.currentDraggingElement.offsetWidth}px`;
    this.currentDraggingElement.style.height = `${this.currentDraggingElement.offsetHeight}px`;
    this.currentDraggingElement.classList.add('sortable-list__item_dragging');
    this.element.append(this.currentDraggingElement);
    this.moveCurrentItem(event.clientX, event.clientY);
    // this.sortableListContainer.prepend(this.currentDraggingElement);
    // this.initPlaceHolder(currentItem.offsetWidth, currentItem.offsetHeight);
    // this.currentDraggingElement.after(this.placeHolderElement);

    // document.addEventListener('pointermove', this.pointerMoveHandler);
    // document.addEventListener('pointerup', this.pointerUpHandler);
  }

  pointerMoveHandler = (event) => {
    event.preventDefault();

    const currentItem = event.target.closest('.sortable-list__item');
    // this.moveCurrentItem(event, currentItem);
    this.moveCurrentItem(event.clientX, event.clientY);

    // if(event.clientY < this.element.firstElementChild.getBoundingClientRect().top) {
    //   this.rearrangePlaceHolder(0);
    // }
  }

  pointerUpHandler = (event) => {

    console.log(this.element);

    // const rect = this.placeHolderElement.getBoundingClientRect();
    // this.currentDraggingElement.style.left = rect.x-7+'px';
    // this.currentDraggingElement.style.top = rect.y-27+'px';
    this.currentDraggingElement.classList.remove('sortable-list__item_dragging');
    // this.placeHolderElement.replaceWith(this.currentDraggingElement);
    document.removeEventListener('pointermove', this.pointerMoveHandler);
    document.removeEventListener('pointerdown', this.pointerDownHandler);
    document.removeEventListener('pointerup', this.pointerUpHandler);
  }

  moveCurrentItem(x, y) {
    // item.style.position = 'absolute';
    // item.style.left = event.clientX + this.mouseOffset.x + 'px';
    // item.style.top = event.clientY + this.mouseOffset.y + 'px';

    this.currentDraggingElement.style.left = `${x - this.mouseOffset.x}px`;
    this.currentDraggingElement.style.top = `${y - this.mouseOffset.y}px`;
  }

  initPlaceHolder(width, height) {
    this.placeHolderElement = document.createElement('div');
    this.placeHolderElement.classList.add('sortable-list__placeholder');
    this.placeHolderElement.style.width = `${width}px`;
    this.placeHolderElement.style.height = `${height}px`;
  }

  rearrangePlaceHolder(index) {
    const child = this.element.children[index];
    if(child !== this.placeHolderElement) this.element.insertBefore(this.placeHolderElement, child);
  }

  constructor({items: listData = []} = {}) {
    this.listData = listData;
    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
      <ul class="sortable-list">
      </ul>
    `;
  }

  render() {
    const mainListElement = document.createElement('div');
    mainListElement.innerHTML = this.template;
    this.element = mainListElement;

    this.sortableListContainer = this.element.querySelector('.sortable-list');

    this.listData.forEach(item => {
      item.classList.add('sortable-list__item');
      item.ondragstart = () => false;
      this.sortableListContainer.append(item);
    });
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.pointerDownHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
