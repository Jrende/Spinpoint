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

    this.view = mat4.create();
    mat4.scale(this.view, this.view, [1.0, -1.0, 1.0]);
    mat4.translate(this.view, this.view, [-1.0, -1.0, 0.0]);
    this.mvp = mat4.create();
    this.quat = quat.create();


  }

  updateValues(values) {
    this.values = values;
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

  updateTextures(draft) {
    this.threading = this.create1DGridTexture(draft.threading, draft.shaftCount, draft.warpCount);
    this.treadling = this.create1DGridTexture(draft.treadling, draft.shaftCount, draft.pickCount);
    this.tieup = this.createGridTexture(draft.tieup, draft.shaftCount, draft.shaftCount);
    this.warpTexture = new Texture(
      this.gl,
      draft.warpColors.length,
      1,
      draft.warpColors.map(i => {
        let c = draft.yarn[i].color;
        return [c.r, c.g, c.b];
      })
    );
    this.weftTexture = new Texture(
      this.gl,
      draft.weftColors.length,
      1,
      draft.weftColors.map(c => [c.r, c.g, c.b])
    );
  }

  render() {
    let { ui, xCount, yCount, pos, draft } = this.values;
    let { cellSize, borderSize } = ui;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;

    this.updateTextures(draft);

    mat4.translate(this.mvp, this.view, [
      (cellSize * pos[0]) / w,
      (cellSize * pos[1]) / h,
      0.0
    ]);
    mat4.scale(this.mvp, this.mvp, 
      [
        (cellSize * xCount) / w,
        (cellSize * yCount) / h,
        1.0
      ]
    );

    this.weaveShader.bind();
    this.quad.bind();
    this.weaveShader.setMat4('mvp', this.mvp);

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


    this.quad.draw();
    this.quad.unbind();
    this.weaveShader.unbind();
  }

  handleClickEvent(event) {
  }

  /*
  present(texture) {
    this.shader.bind();
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.shader.setSampler2D('sampler', 0);
    this.shader.setFloat('opacity', 1.0);
    this.uvLessQuad.bind();
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    this.uvLessQuad.unbind();
    this.shader.unbind();
  }
  */
}
