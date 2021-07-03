<script>
  import { onMount } from 'svelte';

  import draft from 'stores/Draft';
  import selection from '../Selection/SelectionStore';
  import ui from 'stores/UI';
  import { Renderer } from './gfx/Renderer';

  let renderer;
  let canvas;

  let drag;
  let linePoints;
  let oldLinePoints = [];
  let cancelled = false;
  let oldP = [];
  let mouseDownOriginator;

  let startPos;
  let endPos;
  let startScroll;
  $: scroll = $ui.scrollPos;
  $: selectedColor = $ui.selectedColor;
  $: cellSize = $ui.cellSize;
  $: isSelecting = $selection.isSelecting;

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
    if (
      renderer !== undefined &&
      drag !== undefined &&
      (scroll[0] !== oldScroll[0] || scroll[1] !== oldScroll[1])
    ) {
      if (drag.includes('Color')) {
        let color = $draft.yarn[selectedColor].color;
        renderer[drag].renderPoints(...linePoints, color);
      } else {
        renderer[drag].renderPoints(linePoints);
      }
    }
    oldScroll = scroll;
  }

  let oldScroll = [];
  let dragMaybe;

  function getRenderer(pos) {
    return renderer.renderers.find((r) => r.renderer.isWithinGrid(pos));
  }

  function shouldStartDrag(event) {
    let ret =
      drag === undefined &&
      event.buttons & (1 !== 0) &&
      (event.movementX !== 0 || event.movementY !== 0) &&
      dragMaybe &&
      !isSelecting;
    if (ret === true) {
      dragMaybe = false;
    }
    return ret;
  }

  onMount(() => {
    renderer = new Renderer(canvas);
    syncCanvasDimensions();

    renderer.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        e.preventDefault();
        cancelled = true;
        handleRightclick(e);
      } else {
        startPos = [e.offsetX, e.offsetY];
        startScroll = [...scroll];
        dragMaybe = true;
        mouseDownOriginator = getRenderer(startPos)?.name;
      }
    });

    renderer.addEventListener('pointermove', (e) => {
      if (drag !== undefined && e.buttons === 0) {
        stopDrag();
      }

      setHover(e);

      if (shouldStartDrag(e)) {
        let rendererName = getRenderer(startPos)?.name;
        if (rendererName !== undefined && rendererName !== 'weave') {
          drag = rendererName;
          ui.update((draft) => {
            draft.isDragging = true;
          });
        }
      }

      if (drag !== undefined && drag !== 'weave') {
        endPos = [e.offsetX, e.offsetY];
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
            let color = $draft.yarn[selectedColor].color;
            renderer[drag].renderPoints(...linePoints, color);
          }
          ui.update((draft) => {
            draft.selectFrom = linePoints[0];
            draft.selectTo = linePoints[1];
          });
          oldLinePoints = linePoints;
        }
      }
    });

    renderer.addEventListener('pointerup', (e) => {
      if (drag !== undefined) {
        switch (drag) {
          case 'warpColors':
          case 'weftColors':
            updateColor(drag, linePoints[0], linePoints[1], $ui.selectedColor);
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
      } else if (!isSelecting && cancelled === false) {
        // Regular click without drag
        let pos = [e.offsetX, e.offsetY];
        let name = getRenderer(pos)?.name;
        if (name === undefined || name !== mouseDownOriginator) {
          mouseDownOriginator = undefined;
        } else {
          let cell = renderer[name].getCellAtPos(pos);
          switch (name) {
            case 'warpColors':
              updateColor(name, cell[0], cell[0], selectedColor);
              break;
            case 'weftColors':
              updateColor(name, cell[1], cell[1], selectedColor);
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
      }
      stopDrag();
      cancelled = false;
      mouseDownOriginator = undefined;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drag !== undefined) {
        event.stopPropagation();
        stopDrag();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        renderer.clear();
      }
    });
  });

  function updateGrid(name, index, value) {
    draft.update((temp) => {
      temp[name][index] = temp[name][index] === value ? -1 : value;
    });
  }

  function updateTieupWithPoints(linePoints) {
    draft.update((temp) => {
      linePoints.forEach((p) => {
        temp.tieup[p[1]][p[0]] = 1;
      });
    });
  }

  function updateColor(name, colorStart, colorEnd, selectedColor) {
    if (colorEnd < colorStart) {
      [colorStart, colorEnd] = [colorEnd, colorStart];
    }

    draft.update((temp) => {
      for (let i = 0; i < colorEnd - colorStart + 1; i++) {
        temp[name][colorStart + i] = selectedColor;
      }
    });
  }

  function updateListWithLine(name, lp) {
    draft.update((temp) => {
      lp.forEach((p, i) => (temp[name][i] = p));
    });
  }

  function toggleTieup(x, y) {
    draft.update((temp) => {
      temp.tieup[x][y] = temp.tieup[x][y] === 1 ? 0 : 1;
    });
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

  function stopDrag() {
    if (drag !== undefined) {
      renderer[drag].render();
      drag = undefined;
      cancelled = true;
      ui.update((draft) => {
        draft.isDragging = false;
      });
    }
  }

  function setHover(event) {
    let pos = [event.offsetX, event.offsetY];
    let r = getRenderer(pos);
    if (r) {
      let cell = r.renderer.getCellAtPos(pos);
      if (cell[0] !== $ui.hoverCell[0] && cell[1] !== $ui.hoverCell[1]) {
        ui.update((draft) => {
          draft.hoverCell = cell;
        });
      }
    }
  }

  function handleRightclick(event) {
    let pos = [event.offsetX, event.offsetY];
    let r = getRenderer(pos);
    if (r) {
      switch (r.name) {
        case 'warpColors': {
          let cell = r.renderer.getCellAtPos(pos);
          let c = $draft[r.name][cell[0]];
          ui.update((draft) => {
            draft.selectedColor = c;
          });
          break;
        }
        case 'weftColors': {
          let cell = r.renderer.getCellAtPos(pos);
          let c = $draft[r.name][cell[1]];
          ui.update((draft) => {
            draft.selectedColor = c;
          });
          break;
        }
        case 'threading':
          break;
        case 'treadling':
          break;
        case 'tieup':
          break;
      }
    }
  }

  export function syncCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    renderer.resizeCanvas();
    renderer.clear();
  }

  export function dispatchEvent(e) {
    canvas.dispatchEvent(e);
  }
</script>

<canvas class="weave-display" bind:this={canvas} />

<style>
  .weave-display {
    position: relative;
    image-rendering: crisp-edges;
    width: 100%;
    height: 100%;
  }
</style>
