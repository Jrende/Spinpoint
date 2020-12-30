import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
export class GridRenderer {
  constructor(gl, shaders, toggleFunction = () => false, onClick = () => {}) {
    this.gl = gl;
    this.solidShader = shaders.getShader('solid')
    this.quad = new VertexArray(this.gl, [
      0.0, 1.0,
      -1.0, 1.0,
      -1.0, 0.0,
      0.0, 0.0
    ], [
      1, 0, 2,
      2, 0, 3
    ], [2]);
    this.mvp = mat4.create();

    this.toggleFunction = toggleFunction;
    this.onClick = onClick;
    this.quat = quat.create();
  }

  handleClickEvent(event) {
    let { ui, xCount, yCount, pos } = this.values;
    let cellSize = ui.cellSize;
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    let x = event.offsetX / w * 2.0;
    let y = event.offsetY / h * 2.0;

    let gridX = (pos[0]) * (cellSize / w);
    let gridY = (pos[1]) * (cellSize / h);
    let gridW = (xCount * cellSize) / w;
    let gridH = (yCount * cellSize) / h;
    if(
      x > gridX &&
      y > gridY &&
      x < (gridX + gridW) &&
      y < (gridY + gridH)
    ) {
      let i = Math.floor(((x - gridX) / gridW) * xCount);
      let j = Math.floor(((y - gridY) / gridH) * yCount);
      this.onClick(i, j);
    }
  }

  updateValues(values) {
    this.values = values;
  }

  render() {
    let { ui, xCount, yCount, pos } = this.values;
    let { cellSize, borderSize } = ui;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;

    this.solidShader.bind();
    this.quad.bind();
    this.solidShader.setVec4('color', [0.0, 0.0, 0.0, 1.0]);
    for(let i = 0; i < yCount + 1; i++) {
      mat4.fromRotationTranslationScaleOrigin(
        this.mvp,
        this.quat,
        [
          (pos[0]) * (cellSize / w) - borderSize / w,
          -(pos[1] + i) * (cellSize / h) - (borderSize) / h,
          0.0
        ],
        [
          (cellSize * xCount + borderSize) / w,
          (2.0 * borderSize) / h,
          1.0
        ],
        [-1.0, 1.0, 0.0]
      );
      this.solidShader.setMat4('mvp', this.mvp);
      this.quad.draw();
    }
    
    for(let i = 0; i < xCount + 1; i++) {
      mat4.fromRotationTranslationScaleOrigin(
        this.mvp,
        this.quat,
        [
          (pos[0] + i) * (cellSize / w) - borderSize / w,
          -pos[1] * (cellSize / h) - borderSize / h,
          0.0
        ],
        [
          (2.0 * borderSize) / w,
          (cellSize * yCount + borderSize) / h,
          1.0
        ],
        [-1.0, 1.0, 0.0]
      );
      this.solidShader.setMat4('mvp', this.mvp);
      this.quad.draw();
    }
    let innerCellMargin = 15;
    for(let i = 0; i < xCount; i++) {
      for(let j = 0; j < yCount; j++) {
        if(this.toggleFunction(i, j)) {
          mat4.fromRotationTranslationScaleOrigin(
            this.mvp,
            this.quat,
            [
              (pos[0] + i) * (cellSize / w) + innerCellMargin / w,
              (-pos[1] - j) * (cellSize / h) - innerCellMargin / h - 2.0 * borderSize / h,
              0.0
            ],
            [
              (cellSize - 2 * innerCellMargin) / w,
              (cellSize - 2 * innerCellMargin) / h,
              1.0
            ],
            [-1.0, 1.0, 0.0]
        );
          this.solidShader.setMat4('mvp', this.mvp);
          this.quad.draw();
        }
      }
    }
    this.quad.unbind();
    this.solidShader.unbind();
  }
}
