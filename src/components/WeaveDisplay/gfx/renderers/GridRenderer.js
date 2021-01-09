import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
import Texture from '../Texture';

export class GridRenderer {
  constructor(gl, shaders, vertical, scrollX, scrollY) {
    this.gl = gl;
    this.shader = shaders.getShader('grid')
    this.vertical = vertical;
    this.name = name;
    this.scrollX = scrollX;
    this.scrollY = scrollY;

    this.quad = new VertexArray(this.gl, [
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ], [
      1, 0, 2,
      2, 0, 3
    ], [2]);
    this.mvp = mat4.create();

    this.initialView = mat4.create();
    mat4.scale(this.initialView, this.initialView, [
        -1.0,
        1.0,
        1.0
      ]);
    mat4.translate(this.initialView, this.initialView, [
      -1.0,
      -1.0,
      0.0
      ]);
    this.view = mat4.create();
    this.mvp = mat4.create();
    this.quat = quat.create();
    this.blackTexture = new Texture(
      this.gl,
      1,
      1,
      [[0.0, 0.0, 0.0, 1.0]]
    );
  }

  handleEvent(event) {
    let { cellSize, xCount, yCount, pos, warpCount, pickCount } = this.values;
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    let cw = cellSize / w;
    let ch = cellSize / h;
    let x = (w - event.offsetX) / w * 2.0;
    let y = (h - event.offsetY) / h * 2.0;
    let gridX = (this.rendererPos[0]) * (cellSize / w);
    let gridY = (this.rendererPos[1]) * (cellSize / h);
    let gridW = (xCount * cellSize) / w;
    let gridH = (yCount * cellSize) / h;
    if(
      x > gridX &&
      y > gridY &&
      x < (gridX + gridW) &&
      y < (gridY + gridH)
    ) {
      let i = Math.floor(((x - gridX) / gridW) * xCount + pos[0] / cellSize);
      let j = Math.floor(((y - gridY) / gridH) * yCount + pos[1] / cellSize);
      return [i, j, event];
    }
    return undefined;
  }

  updateValues(values) {
    this.values = values;
  }

  setRendererPosition(pos) {
    this.rendererPos = pos;
  }

  setCellToggleTexture(cellToggleTexture) {
    this.cellToggleTexture = cellToggleTexture;
  }

  render() {
    let {
      xCount,
      yCount,
      cellSize,
      borderSize,
      warpCount,
      pickCount,
      pos
    } = this.values;
    let scrollX = this.scrollX ? 1.0 : 0.0;
    let scrollY = this.scrollY ? 1.0 : 0.0;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;

    this.shader.bind();
    this.quad.bind();

    let cw = cellSize / w;
    let ch = cellSize / h;
    let mvp = mat4.identity(this.mvp);
    let view = mat4.translate(mat4.identity(this.view), this.initialView, [
        (this.rendererPos[0]) * cw,
        (this.rendererPos[1]) * ch,
        0.0
    ]);
    mat4.scale(mvp, view, 
      [
        (cellSize * xCount) / w,
        (cellSize * yCount) / h,
        1.0
      ]
    );

    this.cellToggleTexture.bind(0);
    this.shader.setSampler2D('cellToggleSampler', 0);
    this.shader.setVec2('pos', [
      pos[0] / (warpCount * cellSize) * scrollX,
      pos[1] / (pickCount * cellSize) * scrollY
    ]);

    this.shader.setFloat('vert', yCount > xCount ? 1.0 : 0.0);

    this.shader.setVec2('cellSize', [
      cw / (cw * xCount),
      ch / (ch * yCount),
    ]);

    this.shader.setMat4('mvp', mvp);
    this.quad.draw();
    this.quad.unbind();
    this.shader.unbind();
  }
}
