import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
import Texture from '../Texture';

export class ColorRowRenderer {
  constructor(gl, shaders, scrollX, scrollY) {
    this.gl = gl;
    this.shader = shaders.getShader('colorRow')
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
  }

  handleEvent(event) {
    let { cellSize, xCount, yCount } = this.values;
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
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
      let i = Math.floor(((x - gridX) / gridW) * xCount);
      let j = Math.floor(((y - gridY) / gridH) * yCount);
      return [i, j, event]
    }
    return undefined;
  }

  updateValues(values) {
    this.values = values;
  }

  setRendererPosition(pos) {
    this.rendererPos = pos;
  }

  setColorTexture(colorTexture) {
    this.colorTexture = colorTexture;
  }

  render() {
    let {
      pos,
      xCount,
      yCount,
      cellSize,
      borderSize,
      warpCount,
      pickCount
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

    this.colorTexture.bind(0);
    this.shader.setSampler2D('colorSampler', 0);

    this.shader.setVec2('pos', [
      pos[0] / (warpCount * cellSize) * scrollX,
      pos[1] / (pickCount * cellSize) * scrollY
    ]);

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