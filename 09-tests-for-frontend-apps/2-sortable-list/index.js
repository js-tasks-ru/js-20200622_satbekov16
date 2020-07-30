export default class SortableList {
  element;
  currentDraggingItem;
  placeHolderElement;
  currentItemIndex;

  mouseOffset = {
    x: 0,
    y: 0,
  };

  pointerDownHandler = (event) => {
    const currentItem = event.target.closest('.sortable-list__item');

    if(event.target.closest('[data-grab-handle]')) {
      event.preventDefault();
      this.currentItemIndex = Array.from(this.element.children).indexOf(currentItem);

      this.mouseOffset = {
        x: event.clientX - currentItem.getBoundingClientRect().x,
        y: event.clientY - currentItem.getBoundingClientRect().y,
      };

      currentItem.style.width = `${currentItem.offsetWidth}px`;
      currentItem.style.height = `${currentItem.offsetHeight}px`;
      currentItem.classList.add('sortable-list__item_dragging');

      this.initPlaceHolder(currentItem.style.width, currentItem.style.height);
      this.currentDraggingItem = currentItem;
      currentItem.after(this.placeHolderElement)
      this.element.appendChild(currentItem);

      this.moveCurrentItem(event.clientX, event.clientY);

      document.addEventListener('pointermove', this.pointerMoveHandler);
      document.addEventListener('pointerup', this.pointerUpHandler);

    } else if(event.target.closest('[data-delete-handle]')) {
      event.preventDefault();
      this.removeListItem(currentItem);
    }
  }

  pointerMoveHandler = (event) => {
    event.preventDefault();
    this.moveCurrentItem(event.clientX, event.clientY);

    if(event.clientY < this.element.firstElementChild.getBoundingClientRect().top) {
      this.rearrangePlaceHolder(0);
    } else if(event.clientY > this.element.lastElementChild.getBoundingClientRect().bottom) {
      this.rearrangePlaceHolder(this.element.children.length);
    } else {
      for(const [index, child] of Array.from(this.element.children).entries()) {
        const childCoords = child.getBoundingClientRect();
        if(child !== this.currentDraggingItem) {
          if(event.clientY - 20 < childCoords.bottom - child.offsetHeight / 2) {
            this.rearrangePlaceHolder(index);
          } else {
            this.rearrangePlaceHolder(index + 1);
          }
        }
      }
    }
  }

  pointerUpHandler = (event) => {
    this.currentDraggingItem.classList.remove('sortable-list__item_dragging');
    this.placeHolderElement.replaceWith(this.currentDraggingItem);

    this.currentDraggingItem.style.left = '';
    this.currentDraggingItem.style.top = '';

    this.currentDraggingItem = null;
    this.removeEventListeners();
  }

  moveCurrentItem(x, y) {
    this.currentDraggingItem.position = 'absolute';
    this.currentDraggingItem.style.left = `${x - this.mouseOffset.x}px`;
    this.currentDraggingItem.style.top = `${y - this.mouseOffset.y}px`;
  }

  initPlaceHolder(width, height) {
    this.placeHolderElement = document.createElement('div');
    this.placeHolderElement.classList.add('sortable-list__placeholder');
    this.placeHolderElement.style.width = `${width}px`;
    this.placeHolderElement.style.height = `${height}px`;
  }

  rearrangePlaceHolder(index) {
    const child = this.element.children[index];
    if(child !== this.placeHolderElement) {
      this.element.insertBefore(this.placeHolderElement, child);
    }
  }

  constructor({items: listData = []} = {}) {
    this.listData = listData;
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.pointerDownHandler);
  }

  render() {
    const mainListElement = document.createElement('ul');
    mainListElement.classList.add('sortable-list');
    this.element = mainListElement;

    this.listData.forEach(listItem => {
      this.addListItem(listItem);
    });
  }

  addListItem(listItem) {
    listItem.classList.add('sortable-list__item');
    listItem.ondragstart = () => false;
    this.element.append(listItem);
  }

  removeListItem(listItem) {
    listItem.remove();
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.pointerDownHandler);
    document.removeEventListener('pointermove', this.pointerMoveHandler);
    document.removeEventListener('pointerup', this.pointerUpHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
