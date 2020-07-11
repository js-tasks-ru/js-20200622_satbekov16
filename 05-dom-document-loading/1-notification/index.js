export default class NotificationMessage {
  element;
  static notificationIsActive;

  constructor(message, {duration, type} = {}) {
    if(NotificationMessage.notificationIsActive) {
      NotificationMessage.notificationIsActive.remove();
    }

    this.message = message;
    this.duration = duration;
    this.durationInSeconds = (duration / 1000) + 's';
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.durationInSeconds}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    NotificationMessage.notificationIsActive = this.element;
  }

  show(root = document.body) {
    root.append(this.element);
    setTimeout(() =>{
      this.remove();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
