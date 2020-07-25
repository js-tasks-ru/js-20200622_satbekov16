export default class SortableList {

  element;
  subElements = {};

  constructor({items: listData = []} = {}) {
    this.listData = listData;
    this.render();
  }

  render() {
    const mainListElement = document.createElement('div');
    this.listData.forEach(item => {
      mainListElement.appendChild(item);
    });
    this.element = mainListElement;
    // console.log(mainListElement);
  }

  remove() {
    this.element.remove();
  }

  destroy() {

  }
}
