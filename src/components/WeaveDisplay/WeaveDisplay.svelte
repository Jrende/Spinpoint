<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';
  import ScrollPane from '../ScrollPane/ScrollPane.svelte';
  import { line } from '../../util/MathUtil';

  let renderer;
  let canvas;
  let tieup;
  let treadling;
  let threading;
  let weave;
  let warpColor;
  let weftColor;

  let drag = '';
  let hasDragged = false;
  let isDragging = false;
  let fromPos = [];
  let linePoints = [];
  let oldLinePoints = [];
  let vert = true;

  $: {
    if(renderer) {
      renderer.update($draft, $ui);
      renderer.setRendererPosition($draft);
      try {
        renderer.render();
      } catch (e) {
        console.error(e);
      }
    }
  }

  onMount(() => {
    renderer = new Renderer(canvas);
    syncCanvasDimensions();
    renderer.tieup.onClick((x, y) => {
      if(!hasDragged) {
        draft.update(d => d.updateIn(['tieup', x, y], i => i === 1 ? 0 : 1));
      }
      hasDragged = false;
    });

    renderer.tieup.onPointerDown((x, y) => {
      drag = 'tieup';
      startDrag(x, y);
    });

    renderer.tieup.onPointerMove((x, y, event) => {
      onMove(event, x, y);
      if(isDragging && linePointsChanged()) {
        renderer.tieup.renderPoints(linePoints);
      }
    });

    renderer.tieup.onPointerUp((x, y) => {
      if(hasDragged && drag === 'tieup') {
        updateGridWithLine('tieup');
      }
      stopDrag();
    });

    renderer.threading.onClick((x, y) => {
      if(!hasDragged) {
        draft.update(d => d.updateIn(['threading', x], (v) => v === y ? undefined : y))
      }
      hasDragged = false;
    });

    renderer.threading.onPointerDown((x, y) => {
      drag = 'threading';
      startDrag(x, y);
    });

    renderer.threading.onPointerMove((x, y, event) => {
      onMove(event, x, y);
      if(isDragging && linePointsChanged()) {
        renderer.threading.renderPoints(linePoints);
      }
    });

    renderer.threading.onPointerUp((x, y) => {
      if(hasDragged && drag === 'threading') {
        updateListWithLine('threading');
      }
      stopDrag();
    });

    renderer.treadling.onClick((x, y) => {
      if(!hasDragged) {
        draft.update(d => d.updateIn(['treadling', y], (v) => v === x ? undefined : x))
      }
      hasDragged = false;
    });

    renderer.treadling.onPointerDown((x, y) => {
      drag = 'treadling';
      startDrag(x, y);
    });

    renderer.treadling.onPointerMove((x, y, event) => {
      onMove(event, x, y);
      if(isDragging && linePointsChanged()) {
        renderer.treadling.renderPoints(linePoints);
      }
    });

    renderer.treadling.onPointerUp((x, y) => {
      if(hasDragged && drag === 'treadling') {
        updateListWithLine('treadling');
      }
      stopDrag();
    });

    renderer.warpColor.onClick((x, y) => {
      draft.update(d => d.setIn(['warpColors', x], $ui.get('selectedColor')));
    });

    renderer.weftColor.onClick((x, y) => {
      draft.update(d => d.setIn(['weftColors', y], $ui.get('selectedColor')));
    });
  });

  function updateGridWithLine(name) {
    let newTieup = [];
    for(let i = 0; i < $draft.get('shaftCount'); i++) {
      newTieup.push([]);
    }

    let tieup = $draft.get('tieup');
    for(let i = 0; i < $draft.get('treadleCount'); i++) {
      for(let j = 0; j < $draft.get('shaftCount'); j++) {
        if(linePoints[i] !== undefined && linePoints[i][j] === true) {
          newTieup[i][j] = 1;
        } else {
          newTieup[i][j] = tieup.getIn([i, j]);
        }
      }
    }
    draft.update(d => d.set('tieup', fromJS(newTieup)));
  }

  function updateListWithLine(name) {
    draft.update(d => d.update(name, list => list.withMutations(l => {
      linePoints.forEach((p, i) => l.set(i, p));
    })));
  }

  function startDrag(i, j) {
    fromPos = [i, j]
    linePoints = [[i, j]];
  }

  function linePointsChanged() {
    if(linePoints.length !== oldLinePoints.length) {
      return true;
    }
    for(let i = 0; i < linePoints.length; i++) {
      if(linePoints[i] !== oldLinePoints[i]) {
        return true;
      }
    }
    return false;
  }

  function onMove(event, i, j) {
    if(event.buttons === 0) {
      fromPos = undefined;
      isDragging = false;
      return;
    }
    if((event.buttons & 1) && ((event.movementX !== 0) || (event.movementY !== 0))) {
      isDragging = true;
      hasDragged = true;
    }
    oldLinePoints = [...linePoints];
    let lp = line(...fromPos, i, j);
    linePoints = [];
    lp.forEach(p => {
      if(drag === 'tieup') {
        if(linePoints[p[0]] === undefined) {
          linePoints[p[0]] = [];
        }
        linePoints[p[0]][p[1]] = true;
      } else  if(drag === 'treadling') {
        linePoints[p[1]] = p[0];
      } else if(drag === 'threading') {
        linePoints[p[0]] = p[1];
      }
    });
  }

  function stopDrag() {
    fromPos = undefined;
    isDragging = false;
    drag = '';
  }

  export function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    renderer.resizeCanvas();
    renderer.render();
  }

</script>
<canvas class="weave-display" bind:this={canvas} />
<style>
  .weave-display {
    image-rendering: crisp-edges;
    width: 100%;
    height: 100%;
  }
</style>
