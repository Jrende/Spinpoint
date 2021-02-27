<script>
  import { onMount } from 'svelte';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';
  import { Renderer } from './gfx/Renderer';

  let renderer;
  let canvas;

  let drag;
  let linePoints;
  let oldLinePoints = [];
  let oldP = [];

  let startPos;
  let endPos;
  let startScroll;

  $: {
    if (renderer) {
      renderer.update($draft, $ui);
      renderer.setRendererPosition($draft);
      try {
        renderer.render();
      } catch (e) {
        console.error(e);
      }
    }
  }

  $: {
    let scroll = $ui.get('scrollPos').toJS();
    if (
      renderer !== undefined &&
      drag !== undefined &&
      (scroll[0] !== oldScroll[0] || scroll[1] !== oldScroll[1])
    ) {
      if (drag.includes('Color')) {
        let color = $draft
          .getIn(['yarn', $ui.get('selectedColor'), 'color'])
          .toJS();
        renderer[drag].renderPoints(...linePoints, color);
      } else {
        renderer[drag].renderPoints(linePoints);
      }
    }
    oldScroll = scroll;
  }

  let oldScroll = [];
  let dragMaybe;

  onMount(() => {
    renderer = new Renderer(canvas);
    syncCanvasDimensions();

    renderer.addEventListener('pointerdown', (e) => {
      startPos = [e.offsetX, e.offsetY];
      startScroll = $ui.get('scrollPos').toJS();
      dragMaybe = true;
    });

    renderer.addEventListener('pointermove', (e) => {
      if (drag !== undefined && e.buttons === 0) {
        renderer[drag].render();
        drag = undefined;
      }

      if (
        drag === undefined &&
        e.buttons & (1 !== 0) &&
        (e.movementX !== 0 || e.movementY !== 0) &&
        dragMaybe
      ) {
        let r = renderer.renderers.find((r) =>
          r.renderer.isWithinGrid(startPos)
        );
        if (r !== undefined && r.name !== 'weave') {
          drag = r.name;
        }
        dragMaybe = false;
      }

      if (drag !== undefined && drag !== 'weave') {
        let cellSize = $ui.get('cellSize');
        let scroll = $ui.get('scrollPos').toJS();
        endPos = [
          e.offsetX - scroll[0] / cellSize,
          e.offsetY - scroll[1] / cellSize,
        ];
        let startPosScroll = [
          startPos[0] + (scroll[0] - startScroll[0]) / 2.0,
          startPos[1] + (scroll[1] - startScroll[1]) / 2.0,
        ];

        linePoints = renderer[drag].getCellsBetweenPoints(
          startPosScroll,
          endPos
        );
        if (!drag.includes('Color')) {
          if (drag === 'tieup') {
            if (linePointsChanged(linePoints, oldLinePoints)) {
              renderer[drag].renderPoints(linePoints);
            }
            oldLinePoints = linePoints;
          } else {
            let p = pointsToArray(linePoints);
            if (linePointsChanged(p, oldP)) {
              renderer[drag].renderPoints(p);
            }
            oldP = p;
          }
        } else {
          if (linePointsChanged(linePoints, oldLinePoints)) {
            let color = $draft
              .getIn(['yarn', $ui.get('selectedColor'), 'color'])
              .toJS();
            renderer[drag].renderPoints(...linePoints, color);
          }
          oldLinePoints = linePoints;
        }
      }
    });

    renderer.addEventListener('pointerup', (e) => {
      if (drag !== undefined) {
        switch (drag) {
          case 'warpColors':
          case 'weftColors':
            updateColor(
              drag,
              linePoints[0],
              linePoints[1],
              $ui.get('selectedColor')
            );
            renderer.clear();
            break;
          case 'treadling':
          case 'threading': {
            let lp = pointsToArray(linePoints);
            updateListWithLine(drag, lp);
            break;
          }
          case 'tieup':
            updateTieupWithPoints(linePoints);
            break;
        }

        renderer[drag].render();
        drag = undefined;
      } else {
        let pos = [e.offsetX, e.offsetY];
        let r = renderer.renderers.find((r) => r.renderer.isWithinGrid(pos));
        if (r === undefined) {
          return;
        }
        let name = r.name;
        let cell = renderer[name].getCellAtPos(pos);
        switch (name) {
          case 'warpColors':
            updateColor(name, cell[0], cell[0], $ui.get('selectedColor'));
            break;
          case 'weftColors':
            updateColor(name, cell[1], cell[1], $ui.get('selectedColor'));
            break;
          case 'threading':
            updateGrid(name, cell[0], cell[1]);
            break;
          case 'treadling':
            updateGrid(name, cell[1], cell[0]);
            break;
          case 'tieup':
            toggleTieup(cell[1], cell[0]);
            break;
        }
      }
    });
  });

  function updateGrid(name, index, value) {
    draft.update((d) =>
      d.updateIn([name, index], (c) => (c === value ? -1 : value))
    );
  }

  function updateTieupWithPoints(linePoints) {
    draft.update((d) => {
      let draft = d;
      linePoints.forEach((p) => {
        draft = draft.setIn(['tieup', p[1], p[0]], 1);
      });
      return draft;
    });
  }

  function updateColor(name, colorStart, colorEnd, selectedColor) {
    if (colorEnd < colorStart) {
      [colorStart, colorEnd] = [colorEnd, colorStart];
    }

    let newList = $draft.get(name).withMutations((l) => {
      for (let i = 0; i < colorEnd - colorStart + 1; i++) {
        l.set(colorStart + i, selectedColor);
      }
    });

    draft.update((d) => d.set(name, newList));
  }

  function updateListWithLine(name, lp) {
    draft.update((d) =>
      d.update(name, (list) =>
        list.withMutations((l) => {
          lp.forEach((p, i) => l.set(i, p));
        })
      )
    );
  }

  function toggleTieup(x, y) {
    draft.update((d) => d.updateIn(['tieup', x, y], (v) => (v === 1 ? 0 : 1)));
  }

  function linePointsChanged(left, right) {
    if (left.length !== right.length) {
      return true;
    }
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) {
        return true;
      }
    }
    return false;
  }

  function pointsToArray(lp) {
    let ret = [];
    lp.forEach((p) => {
      if (drag === 'treadling') {
        ret[p[1]] = p[0];
      } else if (drag === 'threading') {
        ret[p[0]] = p[1];
      }
    });
    return ret;
  }

  export function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    renderer.resizeCanvas();
    renderer.render();
  }

  export function dispatchEvent(e) {
    canvas.dispatchEvent(e);
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
