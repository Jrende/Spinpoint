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

    this.mvp = mat4.create();
    this.quat = quat.create();

    this.warpTexture = new Texture(
      this.gl,
      draft.warpColors.length,
      1,
      draft.warpColors.map(c => [c.r, c.g, c.b])
    );
    
    this.weftTexture = new Texture(
      this.gl,
      draft.weftColors.length,
      1,
      draft.weftColors.map(c => [c.r, c.g, c.b])
    );

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
      gridTexture[n + 0] = value;
      gridTexture[n + 1] = value;
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

  createAbsenceTexture(array, length) {
    let buffer = new Uint8Array(length * 4);
    for(let i = 0; i < length; i++) {
      let n = i * 4;
      let c = 255;
      if(array[i] === null || array[i] === undefined) {
        c = 0;
      }
      buffer[n + 0] = c;
      buffer[n + 1] = c;
      buffer[n + 2] = c;
      buffer[n + 3] = c;
    }
    return new Texture(this.gl, length, 1, buffer);
  }

  render() {
    let { ui, xCount, yCount, pos } = this.values;
    let { cellSize, borderSize } = ui;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;

    let treadlingAbsenceTexture = this.createAbsenceTexture(draft.treadling, draft.pickCount);
    let threadingAbsenceTexture = this.createAbsenceTexture(draft.threading, draft.warpCount);
    this.heddlePerWarp = this.create1DGridTexture(draft.threading, draft.shaftCount, draft.warpCount);
    this.pedalPerPick = this.create1DGridTexture(draft.treadling, draft.shaftCount, draft.pickCount);
    this.tieup = this.createGridTexture(draft.tieup, draft.shaftCount, draft.shaftCount);
    this.mvp = mat4.create();
    mat4.scale(this.mvp, this.mvp, [1.0, -1.0, 1.0]);
    mat4.translate(this.mvp, this.mvp, [-1.0, -1.0, 0.0]);
    mat4.translate(this.mvp, this.mvp, [
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
    /*
    mat4.translate(this.mvp, this.mvp, [
      (pos[0] * cellSize) / w,
      (pos[1] * cellSize) / h,
      0.0
    ]);
    */
    /*
    mat4.translate(this.mvp, this.mvp, [
      (pos[0] * cellSize) / w - 1.0,
      0.0,
      0.0
    ]);
    */
    //mat4.scale(this.mvp, this.mvp, [1.0 / w, 1.0 / h, 1.0]);
    /*
    mat4.fromRotationTranslationScaleOrigin(
      this.mvp,
      this.quat,
      [
        (pos[0] * cellSize) / w - 1.0,
        -(pos[1] * cellSize) / h,
        0.0,
        0.0
      ],
      [
        (cellSize * xCount) / w,
        (cellSize * yCount) / h,
        1.0
      ],
      [0.0, -1.0, 0.0]
    );
*/

    this.weaveShader.bind();
    this.quad.bind();
    this.weaveShader.setMat4('mvp', this.mvp);

    this.warpTexture.bind(0);
    this.weaveShader.setSampler2D('warpSampler', 0);

    this.weftTexture.bind(1);
    this.weaveShader.setSampler2D('weftSampler', 1);

    this.heddlePerWarp.bind(2);
    this.weaveShader.setSampler2D('heddlePerWarp', 2);

    this.pedalPerPick.bind(3);
    this.weaveShader.setSampler2D('pedalPerPick', 3);

    this.tieup.bind(4);
    this.weaveShader.setSampler2D('tieup', 4);

    treadlingAbsenceTexture.bind(5);
    this.weaveShader.setSampler2D('treadlingAbsence', 5);

    threadingAbsenceTexture.bind(6);
    this.weaveShader.setSampler2D('threadingAbsence', 6);

    this.weaveShader.setFloat('squareSize', ui.cellSize);
    this.weaveShader.setFloat('borderSize', ui.borderSize);

    this.weaveShader.setFloat('warpCount', draft.warpCount);
    this.weaveShader.setFloat('weftCount', draft.pickCount);

    this.weaveShader.setFloat('width', (cellSize * xCount));
    this.weaveShader.setFloat('height', (cellSize * yCount));
    this.quad.draw();
    this.quad.unbind();
    this.weaveShader.unbind();
  }

  handleClickEvent(event) {
    console.log("Click event maybe?");
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
