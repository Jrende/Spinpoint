export default class RendererEventTarget {
  clickListeners = [];
  pointerMoveListeners = [];
  pointerUpListeners = [];
  pointerDownListeners = [];

  onClick(listener) {
    this.clickListeners.push(listener);
  }

  onPointerMove(listener) {
    this.pointerMoveListeners.push(listener);
  }

  onPointerUp(listener) {
    this.pointerUpListeners.push(listener);
  }

  onPointerDown(listener) {
    this.pointerDownListeners.push(listener);
  }

  emitClick(e) {
    let event = this.handleEvent(e);
    if(event !== undefined) {
      this.clickListeners.forEach(l => l(...event));
    }
  }

  emitPointerMove(e) {
    let event = this.handleEvent(e);
    if(event !== undefined) {
      this.pointerMoveListeners.forEach(l => l(...event));
    }
  }

  emitPointerUp(e) {
    let event = this.handleEvent(e);
    if(event !== undefined) {
      this.pointerUpListeners.forEach(l => l(...event));
    }
  }

  emitPointerDown(e) {
    let event = this.handleEvent(e);
    if(event !== undefined) {
      this.pointerDownListeners.forEach(l => l(...event));
    }
  }

  handleEvent(event) {}
}
