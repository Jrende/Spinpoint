import ShaderBuilder from './shader/';
import VertexArray from './VertexArray';
import Framebuffer from './Framebuffer';
import Texture from './Texture';
import { mat4 } from 'gl-matrix';
import { GridRenderer} from './renderers/GridRenderer';
import { RowColorPickerRenderer} from './renderers/RowColorPickerRenderer';
import { WeaveRenderer} from './renderers/WeaveRenderer';

export class Renderer {
  constructor(canvas) {
    this.gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true
    });
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.shaders = new ShaderBuilder(this.gl);
    this.renderers = [];

    this.resizeCanvas();
    window.addEventListener('beforeunload', () => {
      let extension = this.gl.getExtension('WEBGL_lose_context');
      if(extension) {
        console.log('Trying to free webgl context');
        extension.loseContext();
      }
    });

    canvas.addEventListener('click', (evemt) => {
      this.renderers.forEach(r => r.handleClickEvent(event));
    });
  }


  addRenderer(name, pos, toggleFunction, onClickFunction, values) {
    if(name === 'grid') {
      let renderer = new GridRenderer(
        this.gl,
        this.shaders, 
        pos,
        toggleFunction,
        onClickFunction
      )
      this.renderers.push(renderer);
      return this.renderers.length - 1;
    }
  }

  updateValues(id, values) {
    this.renderers[id].updateValues(values);
  }

  resizeCanvas() {
    this.width = this.gl.canvas.width;
    this.height = this.gl.canvas.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  render() {
    //Tieup diagram
    this.renderers.forEach(r => {
      r.render();
    });
    //this.tieupRenderer.render([3.0, 3.0], draft.treadleCount, draft.shaftCount, ui);
    /*
    this.tieupRenderer.render([5.0, 3.0], draft, ui);
    this.tieupRenderer.render([3.0, 5.0], draft, ui);

    this.tieupRenderer.render([5.0, 1.0], draft, ui);
    this.tieupRenderer.render([1.0, 5.0], draft, ui);

    this.tieupRenderer.render([5.0, 5.0], draft, ui);
*/

  }
}
