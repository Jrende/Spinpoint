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
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);



    let maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    console.log("Max texture size", maxTextureSize);

    this.threadingTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);
    this.treadlingTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]])
    this.tieupTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]])
    this.warpTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]])
    this.weftTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]])

    this.resizeCanvas();
    window.addEventListener('beforeunload', () => {
      let extension = this.gl.getExtension('WEBGL_lose_context');
      if(extension) {
        console.log('Trying to free webgl context');
        extension.loseContext();
      }
    });
    this.tieup = new TieupRenderer(this.gl, this.shaders);
    this.threading = new GridRenderer(this.gl, this.shaders, false, true, false);
    this.treadling = new GridRenderer(this.gl, this.shaders, true, false, true);
    this.warpColor= new ColorRowRenderer(this.gl, this.shaders, true, false);
    this.weftColor = new ColorRowRenderer(this.gl, this.shaders, false, true);
    this.weave = new WeaveRenderer(this.gl, this.shaders);

    this.renderers = [
      {
        renderer: this.tieup,
        dirty: true
      },
      {
        renderer: this.threading,
        dirty: true
      },
      {
        renderer: this.treadling,
        dirty: true
      },
      {
        renderer: this.warpColor,
        dirty: true
      },
      {
        renderer: this.weftColor,
        dirty: true
      },
      {
        renderer: this.weave,
        dirty: true
      },
    ];

    canvas.addEventListener('pointermove', (e) => {
      this.renderers
        .map(r => r.renderer)
        .forEach(r => {
          r.emitPointerMove(e);
        });
    })

    canvas.addEventListener('pointerup', (e) => {
      this.renderers
        .map(r => r.renderer)
        .forEach(r => {
          r.emitPointerUp(e);
        });
    })
    
    canvas.addEventListener('pointerdown', (e) => {
      this.renderers
        .map(r => r.renderer)
        .forEach(r => {
          r.emitPointerDown(e);
        });
    })

    canvas.addEventListener('click', (e) => {
      this.renderers
        .map(r => r.renderer)
        .forEach(r => {
          r.emitClick(e);
        });
    })

    let render = () => {
      if(this.renderNextFrame) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.renderers
          .filter(r => r.dirty)
          .forEach(r => r.renderer.render());
        this.renderNextFrame = false;
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  setRendererPosition(draft) {
    let treadleCount = draft.get('treadleCount');
    let shaftCount = draft.get('shaftCount');
    this.tieup.setRendererPosition([3, 3]);
    this.threading.setRendererPosition([treadleCount + 4, 3]);
    this.treadling.setRendererPosition([3, shaftCount + 4]);
    this.weftColor.setRendererPosition([1, shaftCount + 4]);
    this.warpColor.setRendererPosition([treadleCount + 4, 1]);
    this.weave.setRendererPosition([
      treadleCount + 4,
      shaftCount + 4
    ]);
  }

  isDifferent(draft, prevDraft, ...args) {
    return args.some(a => draft.get(a) !== prevDraft.get(a));
  }

  update(draft, ui) {
    let prevDraft = this.prevDraft;
    let prevUI = this.prevUI;
    this.updateTextures(draft);
    this.weave.setTextures(
      this.threadingTexture,
      this.treadlingTexture,
      this.tieupTexture,
      this.warpTexture,
      this.weftTexture
    );
    if(this.isDifferent(draft, prevDraft,
      'treadleCount',
      'shaftCount',
      'tieup') ||
      ui !== prevUI
    ) {
      this.tieup.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('shaftCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize')
      });
      this.renderers[0].dirty = true;
      this.tieup.setCellToggleTexture(this.tieupTexture);
    }

    if(this.isDifferent(draft, prevDraft,
      'warpCount',
      'shaftCount',
      'pickCount',
      'threading') ||
      ui !== prevUI
    ) {
      this.threading.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('shaftCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[1].dirty = true;
      this.threading.setCellToggleTexture(this.threadingTexture);
    }

    if(
      this.isDifferent(draft, prevDraft, 
      'treadleCount',
      'pickCount',
      'warpCount',
      'treadling') ||
      ui !== prevUI
    ) {
      this.treadling.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos'),
      });
      this.renderers[2].dirty = true;
      this.treadling.setCellToggleTexture(this.treadlingTexture);
    }

    if(
      this.isDifferent(draft, prevDraft, 
        'warpCount',
        'pickCount',
        'warpColors') ||
      ui !== prevUI
    ) {
      this.warpColor.updateValues({
        xCount: draft.get('pickCount'),
        yCount: 1,
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[3].dirty = true;
      this.warpColor.setColorTexture(this.warpTexture);
    }

    if(
      this.isDifferent(draft, prevDraft, 
      'warpCount',
      'pickCount',
      'weftColors') ||
      ui !== prevUI
    ) {
      this.weftColor.updateValues({
        xCount: 1,
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        borderSize: ui.get('borderSize'),
        pos: ui.get('pos')
      });
      this.renderers[4].dirty = true;
      this.weftColor.setColorTexture(this.weftTexture);
    }

    if(
      draft !== prevDraft ||
      prevUI !== ui
    ) {
      this.weave.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('pickCount'),
        cellSize: ui.get('cellSize'),
        pos: ui.get('pos')
      });
      this.renderers[5].dirty = true;
    }


    this.prevDraft = draft;
    this.prevUI = draft;
  }

  updateTextures(draft) {
    let prevDraft = this.prevDraft;
    if(this.isDifferent(draft, prevDraft, 'threading', 'shaftCount', 'warpCount')) {
      this.threadingTexture.delete();
      this.threadingTexture = create1DGridTexture(this.gl,
        draft.get('threading'),
        draft.get('shaftCount'),
        draft.get('warpCount'));
    }

    if(this.isDifferent(draft, prevDraft, 'treadling', 'shaftCount', 'pickCount')) {
      this.treadlingTexture.delete();
      this.treadlingTexture = create1DGridTexture(this.gl,
        draft.get('treadling'),
        draft.get('shaftCount'),
        draft.get('pickCount'));
    }

    if(this.isDifferent(draft, prevDraft, 'tieup', 'shaftCount')) {
      this.tieupTexture.delete();
      this.tieupTexture = createGridTexture(this.gl,
        draft.get('tieup'),
        draft.get('shaftCount'),
        draft.get('shaftCount'));
    }

    if(this.isDifferent(draft, prevDraft, 'warpColors', 'yarn')) {
      this.warpTexture.delete()
      this.warpTexture = createColorTexture(this.gl,
        draft.get('warpColors'),
        draft.get('warpColors').size,
        1,
        draft.get('yarn'));
    }

    if(this.isDifferent(draft, prevDraft, 'weftColors', 'yarn')) {
      this.weftTexture.delete();
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

  render() {
    this.renderNextFrame = true;
  }
}
