import VertexArray from '../VertexArray';
import { mat4, quat } from 'gl-matrix';
import Texture from '../Texture';
import RendererEventTarget from './RendererEventTarget';

export class TieupRenderer extends RendererEventTarget {
  constructor(gl, shaders, toggleFunction = () => false, eventListeners = {}, settings = {innerCellMargin: 15}) {
    super(gl, shaders);
    this.shader = shaders.getShader('tieup')
    this.mvp = mat4.create();

    this.settings = settings;

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

  renderPoints(points) {
    this.render();
    let {
      xCount,
      yCount,
      cellSize,
      scrollPos
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
    for(let i = 0; i < xCount; i++) {
      for(let j = 0; j < yCount; j++) {
        if(points.some(p => p[0] === i && p[1] === j)) {
          this.solidShader.setVec4('color', [1.0, 0.0, 0.0, 1.0]);
        } else {
          continue;
        }
        mat4.translate(mvp, view, [ i, j, 0.0 ]);
        mat4.scale(mvp, mvp, [ 0.80, 0.80, 1.0 ]);
        this.solidShader.setMat4('mvp', mvp);
        this.centerQuad.draw();
      }
    }
    this.centerQuad.unbind()
    this.solidShader.unbind();
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

  setRendererPosition(scrollPos) {
    this.rendererPos = scrollPos;
  }

  setCellToggleTexture(cellToggleTexture) {
    this.cellToggleTexture = cellToggleTexture;
  }

  render() {
    if(this.values === undefined) return;
    let { ui, xCount, yCount, cellSize, borderSize } = this.values;

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

    this.shader.setVec2('scrollPos', [ 0,0 ]);

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
