import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
import Texture from '../Texture';
import RendererEventTarget from './RendererEventTarget';

export class ColorRowRenderer extends RendererEventTarget {
  constructor(gl, shaders, scrollX, scrollY) {
    super(gl, shaders);
    this.shader = shaders.getShader('colorRow')
    this.scrollX = scrollX;
    this.scrollY = scrollY;

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
  }

  renderPoints(from, to, color) {
    this.render();
    let {
      xCount,
      yCount,
      cellSize,
      pos
    } = this.values;
    this.solidShader.bind();
    this.centerQuad.bind();
    if(to < from) {
      [from, to] = [to, from]
    }
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    let cw = cellSize / w;
    let ch = cellSize / h;
    let scrollX = this.scrollX ? 1.0 : 0.0;
    let scrollY = this.scrollY ? 1.0 : 0.0;

    let mvp = mat4.identity(this.mvp);
    let view = mat4.translate(mat4.identity(this.view), this.initialView, [
        (this.rendererPos[0]) * cw,
        (this.rendererPos[1]) * ch,
        0.0
    ]);
    mat4.translate(view, view, 
      [
        cw/2.0,
        ch/2.0,
        1.0
      ]
    );
    mat4.scale(view, view, 
      [
        cw,
        ch,
        1.0
      ]
    );

    for(let i = 0; i < (to - from) + 1; i++) {
      let x, y;
      if(xCount > yCount) {
        x = from + i;
        y = 0;
      } else {
        x = 0;
        y = from + i;
      }
      this.solidShader.setVec4('color', [color.r, color.g, color.b, 1.0]);
      mat4.translate(mvp, view, [
        (-pos.get(0) / cellSize) * scrollX,
        (-pos.get(1) / cellSize) * scrollY,
        0.0
      ]);
      mat4.translate(mvp, mvp, [ x, y, 0.0 ]);
      mat4.scale(mvp, mvp, [ 0.61, 0.61, 1.0 ]);
      this.solidShader.setMat4('mvp', mvp);
      this.centerQuad.draw();
    }
    this.centerQuad.unbind()
    this.solidShader.unbind();
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
      let i = Math.floor(((x - gridX) / gridW) * xCount + pos.get(0) / cellSize);
      let j = Math.floor(((y - gridY) / gridH) * yCount + pos.get(1) / cellSize);
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

  setColorTexture(colorTexture) {
    this.colorTexture = colorTexture;
  }

  render() {
    if(this.values === undefined) return;
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
      pos.get(0) / (warpCount * cellSize) * scrollX,
      pos.get(1) / (pickCount * cellSize) * scrollY
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
