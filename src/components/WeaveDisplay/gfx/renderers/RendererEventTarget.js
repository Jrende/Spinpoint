import VertexArray from '../VertexArray';
import { line } from '../../../../util/MathUtil';

export default class RendererEventTarget {
  clickListeners = [];
  pointerMoveListeners = [];
  pointerUpListeners = [];
  pointerDownListeners = [];

  constructor(gl, shaders) {
    this.gl = gl;
    this.solidShader = shaders.getShader('solid');
    this.centerQuad = new VertexArray(
      this.gl,
      [-0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5],
      [1, 0, 2, 2, 0, 3],
      [2]
    );
    this.quad = new VertexArray(
      this.gl,
      [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0],
      [1, 0, 2, 2, 0, 3],
      [2]
    );
  }

  prerender() {
    let { cellSize, xCount, yCount } = this.values;
    let [rX, rY] = this.rendererPos;
    let w = this.gl.canvas.width;
    let cH = cellSize / 2.0;

    this.gl.scissor(w - (rX + xCount) * cH, rY * cH, cH * xCount, cH * yCount);
  }

  isWithinGrid() {
    let { cellSize, xCount, yCount } = this.values;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;

    let x = ((w - event.offsetX) / w) * 2.0;
    let y = ((h - event.offsetY) / h) * 2.0;
    let gridX = this.rendererPos[0] * (cellSize / w);
    let gridY = this.rendererPos[1] * (cellSize / h);
    let gridW = (xCount * cellSize) / w;
    let gridH = (yCount * cellSize) / h;
    return x > gridX && y > gridY && x < gridX + gridW && y < gridY + gridH;
  }

  getCellAtPos(pos) {
    let { cellSize, scrollPos } = this.values;
    let scrollX = this.scrollX ? 1.0 : 0.0;
    let scrollY = this.scrollY ? 1.0 : 0.0;
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    let xOffset = scrollX * (scrollPos.get(0) / cellSize);
    let yOffset = scrollY * (scrollPos.get(1) / cellSize);
    let cellX = Math.floor((w - pos[0]) / (cellSize / 2.0) + xOffset);
    let cellY = Math.floor((h - pos[1]) / (cellSize / 2.0) + yOffset);
    let i = cellX - this.rendererPos[0];
    let j = cellY - this.rendererPos[1];
    return [i, j];
  }

  getCellsBetweenPoints(from, to) {
    let fromCell = this.getCellAtPos(from);
    let toCell = this.getCellAtPos(to);
    let linePoints = line(fromCell[0], fromCell[1], toCell[0], toCell[1]);
    let { xCount, yCount } = this.values;
    return linePoints.filter(
      (p) => p[0] >= 0 && p[0] < xCount && p[1] >= 0 && p[1] < yCount
    );
  }
}
