import ShaderBuilder from './shader/';
import Texture from './Texture';

import { TieupRenderer } from './renderers/TieupRenderer';
import { GridRenderer } from './renderers/GridRenderer';
import { WeaveRenderer } from './renderers/WeaveRenderer';
import { ColorRowRenderer } from './renderers/ColorRowRenderer';

import {
  create1DGridTexture,
  createGridTexture,
  createColorTexture,
} from './TextureUtil';
import { fromJS } from 'immutable';

export class Renderer {
  renderNextFrame = false;
  prevDraft = fromJS({});
  prevUI = fromJS({});

  constructor(canvas) {
    this.gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    });
    this.gl.clearColor(1, 1, 1, 1);
    this.shaders = new ShaderBuilder(this.gl);
    //this.gl.enable(this.gl.BLEND);
    //this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.SCISSOR_TEST);

    let maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    console.log('Max texture size', maxTextureSize);

    this.threadingTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);
    this.treadlingTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);
    this.tieupTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);
    this.warpTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);
    this.weftTexture = new Texture(this.gl, 1, 1, [[0, 0, 0, 0]]);

    this.resizeCanvas();
    window.addEventListener('beforeunload', () => {
      let extension = this.gl.getExtension('WEBGL_lose_context');
      if (extension) {
        console.log('Trying to free webgl context');
        extension.loseContext();
      }
    });
    this.tieup = new TieupRenderer(this.gl, this.shaders);
    this.threading = new GridRenderer(
      this.gl,
      this.shaders,
      false,
      true,
      false
    );
    this.treadling = new GridRenderer(this.gl, this.shaders, true, false, true);
    this.warpColors = new ColorRowRenderer(this.gl, this.shaders, true, false);
    this.weftColors = new ColorRowRenderer(this.gl, this.shaders, false, true);
    this.weave = new WeaveRenderer(this.gl, this.shaders);

    this.renderers = [
      {
        renderer: this.tieup,
        name: 'tieup',
        dirty: true,
      },
      {
        renderer: this.threading,
        name: 'threading',
        dirty: true,
      },
      {
        renderer: this.treadling,
        name: 'treadling',
        dirty: true,
      },
      {
        renderer: this.warpColors,
        name: 'warpColors',
        dirty: true,
      },
      {
        renderer: this.weftColors,
        name: 'weftColors',
        dirty: true,
      },
      {
        renderer: this.weave,
        name: 'weave',
        dirty: true,
      },
    ];

    // arggh
    window.setTimeout(() => {
      let render = () => {
        if (this.renderNextFrame) {
          for (let i = 0; i < this.renderers.length; i++) {
            let r = this.renderers[i];
            if (r.dirty) {
              //console.log('render', r.name);
              r.dirty = false;
              r.renderer.render();
            }
          }
          this.renderNextFrame = false;
          //console.log(' ');
        }
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    });
  }

  setRendererPosition(draft) {
    let treadleCount = draft.get('treadleCount');
    let shaftCount = draft.get('shaftCount');
    this.tieup.setRendererPosition([3, 3]);
    this.threading.setRendererPosition([treadleCount + 4, 3]);
    this.treadling.setRendererPosition([3, shaftCount + 4]);
    this.weftColors.setRendererPosition([1, shaftCount + 4]);
    this.warpColors.setRendererPosition([treadleCount + 4, 1]);
    this.weave.setRendererPosition([treadleCount + 4, shaftCount + 4]);
  }

  isDifferent(draft, prevDraft, ...args) {
    return args.some((a) => {
      return draft.get(a) !== prevDraft.get(a);
    });
  }

  update(draft, ui) {
    let prevDraft = this.prevDraft;
    let prevUI = this.prevUI;

    if (this.isDifferent(ui, prevUI, 'cellSize')) {
      this.clear();
    }

    this.updateTextures(draft);
    this.weave.setTextures(
      this.threadingTexture,
      this.treadlingTexture,
      this.tieupTexture,
      this.warpTexture,
      this.weftTexture
    );
    if (
      this.isDifferent(
        draft,
        prevDraft,
        'treadleCount',
        'shaftCount',
        'tieup'
      ) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.tieup.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('shaftCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[0].dirty = true;
      this.tieup.setCellToggleTexture(this.tieupTexture);
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'warpCount',
        'shaftCount',
        'threading'
      ) ||
      ui.getIn(['scrollPos', 0]) !== prevUI.getIn(['scrollPos', 0]) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.threading.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('shaftCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[1].dirty = true;
      this.threading.setCellToggleTexture(this.threadingTexture);
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'treadleCount',
        'pickCount',
        'treadling'
      ) ||
      ui.getIn(['scrollPos', 1]) !== prevUI.getIn(['scrollPos', 1]) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.treadling.updateValues({
        xCount: draft.get('treadleCount'),
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[2].dirty = true;
      this.treadling.setCellToggleTexture(this.treadlingTexture);
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'warpCount',
        'pickCount',
        'yarn',
        'warpColors'
      ) ||
      ui.getIn(['scrollPos', 0]) !== prevUI.getIn(['scrollPos', 0]) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.warpColors.updateValues({
        xCount: draft.get('pickCount'),
        yCount: 1,
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[3].dirty = true;
      this.warpColors.setColorTexture(this.warpTexture);
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'warpCount',
        'pickCount',
        'yarn',
        'weftColors'
      ) ||
      ui.getIn(['scrollPos', 1]) !== prevUI.getIn(['scrollPos', 1]) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.weftColors.updateValues({
        xCount: 1,
        yCount: draft.get('pickCount'),
        pickCount: draft.get('pickCount'),
        warpCount: draft.get('warpCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[4].dirty = true;
      this.weftColors.setColorTexture(this.weftTexture);
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'warpCount',
        'pickCount',
        'yarn',
        'threading',
        'treadling',
        'warpColors',
        'weftColors',
        'treadleCount',
        'shaftCount',
        'tieup'
      ) ||
      ui.getIn(['scrollPos', 0]) !== prevUI.getIn(['scrollPos', 0]) ||
      ui.getIn(['scrollPos', 1]) !== prevUI.getIn(['scrollPos', 1]) ||
      this.isDifferent(ui, prevUI, 'cellSize')
    ) {
      this.weave.updateValues({
        xCount: draft.get('warpCount'),
        yCount: draft.get('pickCount'),
        shaftCount: draft.get('shaftCount'),
        treadleCount: draft.get('treadleCount'),
        cellSize: ui.get('cellSize'),
        scrollPos: ui.get('scrollPos'),
      });
      this.renderers[5].dirty = true;
    }

    this.prevDraft = draft;
    this.prevUI = ui;
  }

  updateTextures(draft) {
    let prevDraft = this.prevDraft;
    if (
      this.isDifferent(draft, prevDraft, 'threading', 'shaftCount', 'warpCount')
    ) {
      this.threadingTexture.delete();
      this.threadingTexture = create1DGridTexture(
        this.gl,
        draft.get('threading'),
        draft.get('shaftCount'),
        draft.get('warpCount')
      );
    }

    if (
      this.isDifferent(
        draft,
        prevDraft,
        'treadling',
        'treadleCount',
        'pickCount'
      )
    ) {
      this.treadlingTexture.delete();
      this.treadlingTexture = create1DGridTexture(
        this.gl,
        draft.get('treadling'),
        draft.get('treadleCount'),
        draft.get('pickCount')
      );
    }

    if (this.isDifferent(draft, prevDraft, 'tieup', 'shaftCount')) {
      this.tieupTexture.delete();
      this.tieupTexture = createGridTexture(
        this.gl,
        draft.get('tieup'),
        draft.get('treadleCount'),
        draft.get('shaftCount')
      );
    }

    if (this.isDifferent(draft, prevDraft, 'warpColors', 'yarn')) {
      this.warpTexture.delete();
      this.warpTexture = createColorTexture(
        this.gl,
        draft.get('warpColors'),
        draft.get('warpColors').size,
        1,
        draft.get('yarn')
      );
    }

    if (this.isDifferent(draft, prevDraft, 'weftColors', 'yarn')) {
      this.weftTexture.delete();
      this.weftTexture = createColorTexture(
        this.gl,
        draft.get('weftColors'),
        1,
        draft.get('weftColors').size,
        draft.get('yarn')
      );
    }
  }

  resizeCanvas() {
    this.width = this.gl.canvas.width;
    this.height = this.gl.canvas.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  addEventListener(name, func) {
    this.gl.canvas.addEventListener(name, func);
  }

  render() {
    this.renderNextFrame = true;
  }

  clear() {
    let w = this.gl.canvas.width;
    let h = this.gl.canvas.height;
    this.gl.scissor(0, 0, w, h);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.renderers.forEach((r) => (r.dirty = true));
    this.render();
  }
}
