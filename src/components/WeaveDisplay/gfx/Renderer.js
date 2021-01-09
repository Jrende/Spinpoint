import ShaderBuilder from './shader/';
import VertexArray from './VertexArray';
import Texture from './Texture';
import { mat4 } from 'gl-matrix';

import { TieupRenderer} from './renderers/TieupRenderer';
import { GridRenderer} from './renderers/GridRenderer';
import { WeaveRenderer} from './renderers/WeaveRenderer';
import { ColorRowRenderer} from './renderers/ColorRowRenderer';

import { create1DGridTexture, createGridTexture, createColorTexture } from './TextureUtil';

export class Renderer {
  constructor(canvas) {
    this.gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true
    });
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.disable(this.gl.CULL_FACE);
    this.shaders = new ShaderBuilder(this.gl);

    this.tieupClickListeners = [];
    this.threadingClickListeners = [];
    this.treadlingClickListeners = [];
    this.warpColorListeners = [];
    this.weftColorListeners = [];

    this.resizeCanvas();
    window.addEventListener('beforeunload', () => {
      let extension = this.gl.getExtension('WEBGL_lose_context');
      if(extension) {
        console.log('Trying to free webgl context');
        extension.loseContext();
      }
    });
    this.tieupRenderer = new TieupRenderer(this.gl, this.shaders);
    this.threadingRenderer = new GridRenderer(this.gl, this.shaders, false, true, false);
    this.treadlingRenderer = new GridRenderer(this.gl, this.shaders, true, false, true);
    this.warpColorRenderer = new ColorRowRenderer(this.gl, this.shaders, true, false);
    this.weftColorRenderer = new ColorRowRenderer(this.gl, this.shaders, false, true);
    this.weaveRenderer = new WeaveRenderer(this.gl, this.shaders);

    canvas.addEventListener('click', (e) => {
      let event = this.tieupRenderer.handleEvent(e);
      if(event !== undefined) {
        this.tieupClickListeners.forEach(l => l(...event));
        return;
      }
      event = this.threadingRenderer.handleEvent(e);
      if(event !== undefined) {
        this.threadingClickListeners.forEach(l => l(...event));
        return;
      }
      event = this.treadlingRenderer.handleEvent(e);
      if(event !== undefined) {
        this.treadlingClickListeners.forEach(l => l(...event));
        return;
      }
      event = this.warpColorRenderer.handleEvent(e);
      if(event !== undefined) {
        this.warpColorListeners.forEach(l => l(...event));
        return;
      }
      event = this.weftColorRenderer.handleEvent(e);
      if(event !== undefined) {
        this.weftColorListeners.forEach(l => l(...event));
        return;
      }
    });

    this.renderers = [
      this.tieupRenderer,
      this.threadingRenderer,
      this.treadlingRenderer,
      this.warpColorRenderer,
      this.weftColorRenderer,
      this.weaveRenderer
    ];
  }

  setRendererPosition(draft) {
    this.tieupRenderer.setRendererPosition([3, 3]);
    this.threadingRenderer.setRendererPosition([draft.treadleCount + 4, 3]);
    this.treadlingRenderer.setRendererPosition([3, draft.shaftCount + 4]);
    this.weftColorRenderer.setRendererPosition([1, draft.shaftCount + 4]);
    this.warpColorRenderer.setRendererPosition([draft.treadleCount + 4, 1]);
    this.weaveRenderer.setRendererPosition([
      draft.treadleCount + 4,
      draft.shaftCount + 4
    ]);
  }

  update(draft, ui) {
    this.updateTextures(draft);
    this.weaveRenderer.setTextures(
      this.threading,
      this.treadling,
      this.tieup,
      this.warpTexture,
      this.weftTexture
    );
    this.weaveRenderer.updateValues({
      xCount: draft.warpCount,
      yCount: draft.pickCount,
      draft: draft,
      ui: ui
    });

    this.tieupRenderer.updateValues({
      xCount: draft.treadleCount,
      yCount: draft.shaftCount,
      cellSize: ui.cellSize,
      borderSize: ui.borderSize,
    });
    this.tieupRenderer.setCellToggleTexture(this.tieup);

    this.threadingRenderer.updateValues({
      xCount: draft.warpCount,
      yCount: draft.shaftCount,
      pickCount: draft.pickCount,
      warpCount: draft.warpCount,
      cellSize: ui.cellSize,
      borderSize: ui.borderSize,
      pos: ui.pos
    });
    this.threadingRenderer.setCellToggleTexture(this.threading);

    this.treadlingRenderer.updateValues({
      xCount: draft.treadleCount,
      yCount: draft.pickCount,
      pickCount: draft.pickCount,
      warpCount: draft.warpCount,
      cellSize: ui.cellSize,
      borderSize: ui.borderSize,
      pos: ui.pos,
    });
    this.treadlingRenderer.setCellToggleTexture(this.treadling);

    this.warpColorRenderer.updateValues({
      xCount: draft.pickCount,
      yCount: 1,
      pickCount: draft.pickCount,
      warpCount: draft.warpCount,
      cellSize: ui.cellSize,
      borderSize: ui.borderSize,
      pos: ui.pos
    });
    this.warpColorRenderer.setColorTexture(this.warpTexture);

    this.weftColorRenderer.updateValues({
      xCount: 1,
      yCount: draft.warpCount,
      pickCount: draft.pickCount,
      warpCount: draft.warpCount,
      cellSize: ui.cellSize,
      borderSize: ui.borderSize,
      pos: ui.pos
    });
    this.weftColorRenderer.setColorTexture(this.weftTexture);
  }

  updateTextures(draft) {
    this.threading = create1DGridTexture(this.gl,
      draft.threading,
      draft.shaftCount,
      draft.warpCount);
    this.treadling = create1DGridTexture(this.gl,
      draft.treadling,
      draft.shaftCount,
      draft.pickCount);
    this.tieup = createGridTexture(this.gl,
      draft.tieup,
      draft.shaftCount,
      draft.shaftCount);
    this.warpTexture = createColorTexture(this.gl,
      draft.warpColors,
      draft.warpColors.length,
      1,
      draft.yarn);
    this.weftTexture = createColorTexture(this.gl,
      draft.weftColors,
      1,
      draft.weftColors.length,
      draft.yarn);
  }

  resizeCanvas() {
    this.width = this.gl.canvas.width;
    this.height = this.gl.canvas.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  onTreadlingClick(listener) {
    this.treadlingClickListeners.push(listener);
  }

  onThreadingClick(listener) {
    this.threadingClickListeners.push(listener);
  }

  onTieupClick(listener) {
    this.tieupClickListeners.push(listener);
  }

  onWeftColorClick(listener) {
    this.weftColorListeners.push(listener);
  }

  onWarpColorClick(listener) {
    this.warpColorListeners.push(listener);
  }

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.renderers.forEach(r => {
      r.render();
    });
  }
}
