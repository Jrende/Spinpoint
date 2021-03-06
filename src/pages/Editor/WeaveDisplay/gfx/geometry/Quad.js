import VertexArray from '../VertexArray';
import Geometry from './Geometry';

export default class Quad extends Geometry {
  constructor(gl) {
    super();
    this.geometry = new VertexArray(gl,
      [1, 1, 1,
        -1, 1, 1,
        -1, -1, 1,
        1, -1, 1],
      [1, 0, 2,
        2, 0, 3],
      [3]);
  }

  bind(gl) {
    this.geometry.bind(gl);
  }

  unbind(gl) {
    this.geometry.bind(gl);
  }

  draw(gl) {
    this.geometry.draw(gl);
  }
}
