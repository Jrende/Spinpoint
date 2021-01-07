import ShaderBuilder from '../shader/';
import VertexArray from '../VertexArray';
import Framebuffer from '../Framebuffer';
import Texture from '../Texture';
import { mat4, quat } from 'gl-matrix';

export class WeaveRenderer {
  constructor(gl, shaders) {
    this.gl = gl;
    this.quad = new VertexArray(this.gl, [
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ], [
      1, 0, 2,
      2, 0, 3
    ], [2]);

    this.colorShader = shaders.getShader('solid');
    this.weaveShader = shaders.getShader('weave');

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

  updateValues(values) {
    this.values = values;
    this.updateTextures(values.draft);
  }

  create1DGridTexture(data, shafts, length) {
    let gridTexture = new Uint8Array(length * 4);
    gridTexture.fill(0);
    for(let i = 0; i < data.length; i++) {
      let n = i * 4;
      let value = (data[i] / shafts) * 255;
      let absence = 255;
      if(data[i] === null || data[i] === undefined) {
        absence = 0;
      }
      gridTexture[n + 0] = value;
      gridTexture[n + 1] = absence;
      gridTexture[n + 2] = value;
      gridTexture[n + 3] = value;
    }
    return new Texture(this.gl, length, 1, gridTexture);
  }

  createGridTexture(data, width, height) {
    let gridTexture = new Uint8Array(width * height * 4);
    gridTexture.fill(0);
    for(let i = 0; i < data.length; i++) {
      for(let j = 0; j < data[0].length; j++) {
        if(data[i][j] === 1) {
          let n = (i + j*width) * 4;
          gridTexture[n + 0] = 255;
          gridTexture[n + 1] = 255;
          gridTexture[n + 2] = 255;
          gridTexture[n + 3] = 255;
        }
      }
    }
    return new Texture(this.gl, width, height, gridTexture);
  }

  createColorTexture(colors, yarns) {
    let array = colors.map(i => {
      let c = yarns[i].color;
      return [c.r, c.g, c.b];
    });
    array.push([0, 0, 0]);
    return new Texture(
      this.gl,
      colors.length,
      1,
      array
    );
  }

  updateTextures(draft) {
    this.threading = this.create1DGridTexture(draft.threading, draft.shaftCount, draft.warpCount);
    this.treadling = this.create1DGridTexture(draft.treadling, draft.shaftCount, draft.pickCount);
    this.tieup = this.createGridTexture(draft.tieup, draft.shaftCount, draft.shaftCount);
    this.warpTexture = this.createColorTexture(draft.warpColors, draft.yarn);
    this.weftTexture = this.createColorTexture(draft.weftColors, draft.yarn);
  }

  render() {
    let { ui, xCount, yCount, pos, draft } = this.values;
    let { cellSize, borderSize } = ui;
    let wp = ui.pos;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;


    let cw = cellSize / w;
    let ch = cellSize / h;
    let mvp = mat4.identity(this.mvp);
    let view = mat4.translate(mat4.identity(this.view), this.initialView, [
        pos[0] * cw,
        pos[1] * ch,
        0.0
    ]);
    mat4.scale(mvp, view, 
      [
        (cellSize * xCount) / w,
        (cellSize * yCount) / h,
        1.0
      ]
    );

    this.weaveShader.bind();
    this.quad.bind();
    this.weaveShader.setMat4('mvp', mvp);

    this.warpTexture.bind(0);
    this.weaveShader.setSampler2D('warpSampler', 0);

    this.weftTexture.bind(1);
    this.weaveShader.setSampler2D('weftSampler', 1);

    this.threading.bind(2);
    this.weaveShader.setSampler2D('threading', 2);

    this.treadling.bind(3);
    this.weaveShader.setSampler2D('treadling', 3);

    this.tieup.bind(4);
    this.weaveShader.setSampler2D('tieup', 4);

    this.weaveShader.setVec2('cellSize', [
      cw / (cw * xCount),
      ch / (ch * yCount),
    ]);

    this.weaveShader.setVec2('pos', [
      wp[0] / (draft.warpCount * ui.cellSize),
      wp[1] / (draft.pickCount * ui.cellSize)
    ]);

    this.quad.draw();
    this.quad.unbind();
    this.weaveShader.unbind();
  }
}
