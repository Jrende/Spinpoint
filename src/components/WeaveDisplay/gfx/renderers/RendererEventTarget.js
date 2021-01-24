import VertexArray from '../VertexArray';
import Texture from '../Texture';

export default class RendererEventTarget {
  clickListeners = [];
  pointerMoveListeners = [];
  pointerUpListeners = [];
  pointerDownListeners = [];

  constructor(gl, shaders) {
    this.gl = gl;
    this.solidShader = shaders.getShader('solid');
    this.centerQuad = new VertexArray(this.gl, [
      -0.5, 0.5,
      0.5, 0.5,
      0.5, -0.5,
      -0.5, -0.5,
    ], [
      1, 0, 2,
      2, 0, 3
    ], [2]);
    this.quad = new VertexArray(this.gl, [
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ], [
      1, 0, 2,
      2, 0, 3
    ], [2]);
  }

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
