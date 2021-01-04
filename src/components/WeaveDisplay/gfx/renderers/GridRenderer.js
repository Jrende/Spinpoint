import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
export class GridRenderer {
  constructor(gl, shaders, toggleFunction = () => false, eventListeners = {}, settings = {innerCellMargin: 15}) {
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
    for(let [key, func] of Object.entries(eventListeners)) {
      gl.canvas.addEventListener(key, (event) => {
        let c = this.handleEvent(event);
        if(c !== undefined) {
          func(...c);
        }
      });
    }

    this.settings = settings;
    this.quat = quat.create();
    this.black = { r: 0.0, g: 0.0, b: 0.0 };

    this.initialView = mat4.create();
    this.mvp = mat4.create();
    mat4.translate(this.initialView, this.initialView, [1.0, -1.0, 0])
    this.view = mat4.create();
  }


  handleEvent(event) {
    let { ui, xCount, yCount, pos } = this.values;
    let cellSize = ui.cellSize;
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    let x = (w - event.offsetX) / w * 2.0;
    let y = (h - event.offsetY) / h * 2.0;

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
      return [i, j, event]
    }
    return undefined;
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

    let cw = cellSize / w;
    let ch = cellSize / h;
    let view = mat4.translate(mat4.identity(this.view), this.initialView, [
        -pos[0] * cw,
        pos[1] * ch,
        0.0
    ]);

    for(let i = 0; i < xCount + 1; i++) {
      let mvp = mat4.identity(this.mvp);
      mat4.translate(mvp, view, [
        -i * cw,
        0.0,
        0.0
      ]);
      mat4.scale(mvp, mvp, 
        [
          (borderSize * 1.5) / w,
          yCount * ch + (2.0 * borderSize / h),
          1.0
        ]
      );
      this.solidShader.setMat4('mvp', mvp);
      this.quad.draw();
    }

    for(let i = 0; i < yCount + 1; i++) {
      let mvp = mat4.identity(this.mvp);
      mat4.translate(mvp, view, [
        0.0,
        i * ch,
        0.0
      ]);
      mat4.scale(mvp, mvp, 
        [
          xCount * cw + (2.0 * borderSize / w),
          (borderSize * 1.5) / h,
          1.0
        ]
      );
      this.solidShader.setMat4('mvp', mvp);
      this.quad.draw();
    }

    let innerCellMargin = this.settings.innerCellMargin;
    for(let i = 0; i < xCount; i++) {
      for(let j = 0; j < yCount; j++) {
        let mvp = mat4.identity(this.mvp);
        let color = this.toggleFunction(i, j)
        if(color !== false) {
          let mvp = mat4.identity(this.mvp);
          mat4.translate(mvp, view, [
            -i * cw - innerCellMargin / w,
            j * ch + innerCellMargin / h,
            0.0
          ]);
          mat4.scale(mvp, mvp, 
            [
              (cellSize - 2.0 * innerCellMargin) / w,
              (cellSize - 2.0 * innerCellMargin) / h,
              1.0
            ]
          );

          let c = color === true ? this.black : color;
          this.solidShader.setVec4('color', [
            c.r,
            c.g,
            c.b,
            1.0
          ]);

          this.solidShader.setMat4('mvp', this.mvp);
          this.quad.draw();
        }
      }
    }
    this.quad.unbind();
    this.solidShader.unbind();
  }
}
