import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
import Texture from '../Texture';
import RendererEventTarget from './RendererEventTarget';

export class GridRenderer extends RendererEventTarget {
  constructor(gl, shaders, vertical, scrollX, scrollY) {
    super(gl, shaders);
    this.gl = gl;
    this.shader = shaders.getShader('grid');
    this.vertical = vertical;
    this.name = name;
    this.scrollX = scrollX;
    this.scrollY = scrollY;

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
  }

  handleEvent(event) {
    let { cellSize, xCount, yCount, pos, warpCount, pickCount } = this.values;
    let scrollX = this.scrollX ? 1.0 : 0.0;
    let scrollY = this.scrollY ? 1.0 : 0.0;

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
      let xOffset = scrollX * (pos.get(0) / cellSize);
      let yOffset = scrollY * (pos.get(1) / cellSize);
      let cellX = Math.floor((w - event.offsetX) / (cellSize / 2.0) + xOffset);
      let cellY = Math.floor((h - event.offsetY) / (cellSize / 2.0) + yOffset);
      let i = cellX - this.rendererPos[0];
      let j = cellY - this.rendererPos[1];

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

  renderPoints(points) {
    this.render();
    let {
      xCount,
      yCount,
      cellSize,
      warpCount,
      pickCount,
      pos
    } = this.values;
    this.solidShader.bind();
    this.centerQuad.bind();
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
    let minorSize = Math.min(xCount, yCount);
    for(let i = 0; i < points.length; i++) {
      for(let j = 0; j < minorSize; j++) {
        let x, y;
        if(yCount < xCount) {
          x = i;
          y = j;
        } else {
          x = j;
          y = i;
        }

        if(points[i] === undefined) {
          continue;
        } else if(points[i] === j) {
          this.solidShader.setVec4('color', [1.0, 0.0, 0.0, 1.0]);
        } else {
          this.solidShader.setVec4('color', [1.0, 1.0, 1.0, 1.0]);
        }
        mat4.translate(mvp, view, [
          (-pos.get(0) / cellSize) * scrollX,
          (-pos.get(1) / cellSize) * scrollY,
          0.0
        ]);
        mat4.translate(mvp, mvp, [ x, y, 0.0 ]);
        mat4.scale(mvp, mvp, [ 0.62, 0.62, 1.0 ]);
        this.solidShader.setMat4('mvp', mvp);
        this.centerQuad.draw();
      }
    }
    this.centerQuad.unbind()
    this.solidShader.unbind();
  }

  render() {
    if(this.values === undefined) return;
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
      pos.get(0) / (warpCount * cellSize) * scrollX,
      pos.get(1) / (pickCount * cellSize) * scrollY
    ]);

    this.shader.setFloat('vert', yCount > xCount ? 1.0 : 0.0);

    this.shader.setFloat('gap', 0.04);
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
