import solidFrag from './glsl/solid.frag';
import weaveFrag from './glsl/weave.frag';
import textureFrag from './glsl/textureShader.frag';
import gridFrag from './glsl/grid.frag';
import tieupFrag from './glsl/tieup.frag';
import colorRowFrag from './glsl/colorRow.frag';
import genUV2D from './glsl/genUV2D.vert';
import Shader from './Shader';

function buildShader(name) {
  switch(name) {
    case 'texture': return new Shader({ frag: textureFrag, vert: genUV2D });
    case 'solid': return new Shader({ frag: solidFrag, vert: genUV2D });
    case 'weave': return new Shader({ frag: weaveFrag, vert: genUV2D });
    case 'grid': return new Shader({ frag: gridFrag, vert: genUV2D });
    case 'tieup': return new Shader({ frag: tieupFrag, vert: genUV2D });
    case 'colorRow': return new Shader({ frag: colorRowFrag, vert: genUV2D });
    default: return undefined;
  }
}

export default class ShaderBuilder {
  constructor(gl) {
    this.gl = gl;
    this.shaderCache = {};
  }

  getShader(shaderName) {
    let shader = this.shaderCache[shaderName];
    if(shader === undefined) {
      shader = buildShader(shaderName);
      if(shader === undefined) {
        throw new Error(`Unknown shader name ${shaderName}`);
      }
      shader.compile(this.gl);
      this.shaderCache[shaderName] = shader;
    }
    return shader;
  }
}
