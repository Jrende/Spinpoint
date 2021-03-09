import { mat4} from 'gl-matrix';
import RendererEventTarget from './RendererEventTarget';

export class WeaveRenderer extends RendererEventTarget {
  constructor(gl, shaders) {
    super(gl, shaders);
    this.gl = gl;
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
  }

  updateValues(values) {
    this.values = values;
  }

  setTextures(threading, treadling, tieup, warpTexture, weftTexture) {
    this.threading = threading;
    this.treadling = treadling;
    this.tieup = tieup;
    this.warpTexture = warpTexture;
    this.weftTexture = weftTexture;
  }

  setRendererPosition(scrollPos) {
    this.rendererPos = scrollPos;
  }

  render() {
    this.prerender();
    if(this.values === undefined) return;
    let { xCount, yCount, scrollPos, cellSize, shaftCount, treadleCount } = this.values;

    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;


    let cw = cellSize / w;
    let ch = cellSize / h;
    let mvp = mat4.identity(this.mvp);
    let view = mat4.translate(mat4.identity(this.view), this.initialView, [
        this.rendererPos[0] * cw,
        this.rendererPos[1] * ch,
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

    this.weaveShader.setFloat('shaftCount', shaftCount);
    this.weaveShader.setFloat('treadleCount', treadleCount);

    this.weaveShader.setVec2('cellSize', [
      cw / (cw * xCount),
      ch / (ch * yCount),
    ]);

    this.weaveShader.setVec2('scrollPos', [
      scrollPos.get(0) / (xCount * cellSize),
      scrollPos.get(1) / (yCount * cellSize)
    ]);

    this.quad.draw();
    this.quad.unbind();
    this.weaveShader.unbind();
  }
}
