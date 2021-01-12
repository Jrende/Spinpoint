import ShaderBuilder from './shader/';
import VertexArray from './VertexArray';
import Texture from './Texture';
import { mat4 } from 'gl-matrix';

import { TieupRenderer} from './renderers/TieupRenderer';
import { GridRenderer} from './renderers/GridRenderer';
import { WeaveRenderer} from './renderers/WeaveRenderer';
import { ColorRowRenderer} from './renderers/ColorRowRenderer';

import { create1DGridTexture, createGridTexture, createColorTexture } from './TextureUtil';
import { fromJS } from 'immutable';

export class Renderer {
  prevDraft = fromJS({});
  prevUI = fromJS({});

  constructor(canvas) {
    this.gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true
    });
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.disable(this.gl.CULL_FACE);
    this.shaders = new ShaderBuilder(this.gl);



    let maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    console.log("Max texture size", maxTextureSize);

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
      {
        renderer: this.tieupRenderer,
        dirty: true
      },
      {
        renderer: this.threadingRenderer,
        dirty: true
      },
      {
        renderer: this.treadlingRenderer,
        dirty: true
      },
      {
        renderer: this.warpColorRenderer,
        dirty: true
      },
      {
        renderer: this.weftColorRenderer,
        dirty: true
      },
      {
        renderer: this.weaveRenderer,
        dirty: true
      },
    ];
  }

  setRendererPosition(draft) {
    let treadleCount = draft.get('treadleCount');
    let shaftCount = draft.get('shaftCount');
    this.tieupRenderer.setRendererPosition([3, 3]);
    this.threadingRenderer.setRendererPosition([treadleCount + 4, 3]);
    this.treadlingRenderer.setRendererPosition([3, shaftCount + 4]);
    this.weftColorRenderer.setRendererPosition([1, shaftCount + 4]);
    this.warpColorRenderer.setRendererPosition([treadleCount + 4, 1]);
    this.weaveRenderer.setRendererPosition([
      treadleCount + 4,
      shaftCount + 4
    ]);
  }

  update(draft, ui) {
    let prevDraft = this.prevDraft;
    let prevUI = this.prevUI;
    this.updateTextures(draft);
    this.weaveRenderer.setTextures(
      this.threading,
      this.treadling,
      this.tieup,
      this.warpTexture,
      this.weftTexture
    );
    if(
      draft.get('treadleCount') !== prevDraft.get('treadleCount') || 
      draft.get('shaftCount') !== prevDraft.get('shaftCount') ||
      draft.get('tieup') !== prevDraft.get('tieup') ||
      ui !== prevUI
    ) {
      this.tieupRenderer.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('shaftCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize')
      });
      this.renderers[0].dirty = true;
      this.tieupRenderer.setCellToggleTexture(this.tieup);
    }

    if(
      draft.get('warpCount') !== prevDraft.get('warpCount') || 
      draft.get('shaftCount') !== prevDraft.get('shaftCount') ||
      draft.get('pickCount') !== prevDraft.get('pickCount') ||
      draft.get('threading') !== prevDraft.get('threading') ||
      ui !== prevUI
    ) {
      this.threadingRenderer.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('shaftCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[1].dirty = true;
      this.threadingRenderer.setCellToggleTexture(this.threading);
    }

    if(
      draft.get('treadleCount') !== prevDraft.get('treadleCount') || 
      draft.get('pickCount') !== prevDraft.get('pickCount') ||
      draft.get('warpCount') !== prevDraft.get('warpCount') ||
      draft.get('treadling') !== prevDraft.get('treadling') ||
      ui !== prevUI
    ) {
      this.treadlingRenderer.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos'),
      });
      this.renderers[2].dirty = true;
      this.treadlingRenderer.setCellToggleTexture(this.treadling);
    }

    if(
      draft.get('warpCount') !== prevDraft.get('warpCount') || 
      draft.get('pickCount') !== prevDraft.get('pickCount') ||
      draft.get('warpColors') !== prevDraft.get('warpColors') ||
      ui !== prevUI
    ) {
      this.warpColorRenderer.updateValues({
        xCount: draft.get('pickCount'),
        yCount: 1,
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[3].dirty = true;
      this.warpColorRenderer.setColorTexture(this.warpTexture);
    }

    if(
      draft.get('warpCount') !== prevDraft.get('warpCount') || 
      draft.get('pickCount') !== prevDraft.get('pickCount') ||
      draft.get('weftColors') !== prevDraft.get('weftColors') ||
      ui !== prevUI
    ) {
      this.weftColorRenderer.updateValues({
        xCount: 1,
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[4].dirty = true;
      this.weftColorRenderer.setColorTexture(this.weftTexture);
    }

    if(
      draft !== prevDraft ||
      prevUI !== ui
    ) {
      this.weaveRenderer.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('pickCount'),
        draft: draft.toJS(),
        ui: ui.toJS()
      });
      this.renderers[5].dirty = true;
    }


    this.prevDraft = draft;
    this.prevUI = draft;
  }

  updateTextures(draft) {
    let prevDraft = this.prevDraft;
    if(
      draft.get('threading') !== prevDraft.get('threading') ||
      draft.get('shaftCount') !== prevDraft.get('shaftCount') ||
      draft.get('warpCount') !== prevDraft.get('warpCount')
    ) {
      this.threading = create1DGridTexture(this.gl,
        draft.get('threading'),
        draft.get('shaftCount'),
        draft.get('warpCount'));
    }

    if(
      draft.get('treadling') !== prevDraft.get('treadling') ||
      draft.get('shaftCount') !== prevDraft.get('shaftCount') ||
      draft.get('pickCount') !== prevDraft.get('pickCount')
    ) {
      this.treadling = create1DGridTexture(this.gl,
        draft.get('treadling'),
        draft.get('shaftCount'),
        draft.get('pickCount'));
    }

    if(
      draft.get('tieup') !== prevDraft.get('tieup') ||
      draft.get('shaftCount') !== prevDraft.get('shaftCount') ||
      draft.get('shaftCount') !== prevDraft.get('shaftCount')
    ) {
      this.tieup = createGridTexture(this.gl,
        draft.get('tieup'),
        draft.get('shaftCount'),
        draft.get('shaftCount'));
    }

    if(
      draft.get('warpColors') !== prevDraft.get('warpColors') ||
      draft.get('yarn') !== prevDraft.get('yarn')
    ) {
      this.warpTexture = createColorTexture(this.gl,
        draft.get('warpColors'),
        draft.get('warpColors').size,
        1,
        draft.get('yarn'));
    }

    if(
      draft.get('weftColors') !== prevDraft.get('weftColors') ||
      draft.get('yarn') !== prevDraft.get('yarn')
    ) {
      this.weftTexture = createColorTexture(this.gl,
        draft.get('weftColors'),
        1,
        draft.get('weftColors').size,
        draft.get('yarn'));
    }
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
    this.renderers
      .filter(r => r.dirty)
      .forEach(r => r.renderer.render());
  }
}
