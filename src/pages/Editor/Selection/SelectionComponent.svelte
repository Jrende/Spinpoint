<script>
  import { vec2 } from 'gl-matrix';
  import selection from './SelectionStore';
  import ui from 'stores/UI';
  import draft from 'stores/Draft';

  $: cellSize = $ui.cellSize / 2.0;
  $: shaftCount = $draft.shaftCount;
  $: treadleCount = $draft.treadleCount;

  $: threadingPosition = [treadleCount + 4, 3];
  $: treadlingPosition = [3, shaftCount + 4];
  $: warpColorsPosition = [treadleCount + 4, 1];
  $: weftColorsPosition = [1, shaftCount + 4];
  $: weavePosition = [treadleCount + 4, shaftCount + 4];

  $: isSelecting = $selection.isSelecting;
  $: selectedThreading = $selection.threading;
  $: to = $selection.to;
  $: from = $selection.from;
  $: appliedSelections = [];
  $: hasLength =
    $selection.to[0] - $selection.from[0] > 0 &&
    $selection.to[1] - $selection.from[1] > 0;

  $: useThreading = $selection.useThreading;
  $: useTreadling = $selection.useTreadling;
  $: useWarpColors = $selection.useWarpColors;
  $: useWeftColors = $selection.useWeftColors;

  $: scrollPos = [$ui.scrollPos[0] / 2.0, $ui.scrollPos[1] / 2.0];

  $: dragSelection = { to: 0, from: 0 };
  $: selections = [
    {
      name: 'useThreading',
      canvasArea: {
        left: 0,
        right: `${threadingPosition[0] * cellSize}px`,
        bottom: `${threadingPosition[1] * cellSize}px`,
        height: `${shaftCount * cellSize}px`,
      },
      selectionArea: {
        width: `${cellSize * (to[0] - from[0])}px`,
        height: `${cellSize * shaftCount}px`,
        right: `${from[0] * cellSize - scrollPos[0]}px`,
        bottom: 0,
      },
      dragMarker: {
        width: `${cellSize * (dragSelection.to[0] - dragSelection.from[0])}px`,
        height: `${cellSize * shaftCount}px`,
        right: `${dragSelection.from[0] * cellSize - scrollPos[0]}px`,
        bottom: 0,
      },
    },
    {
      name: 'useTreadling',
      dir: 'vert',
      canvasArea: {
        top: 0,
        right: `${treadlingPosition[0] * cellSize}px`,
        bottom: `${treadlingPosition[1] * cellSize}px`,
        width: `${treadleCount * cellSize}px`,
      },
      selectionArea: {
        width: `${cellSize * treadleCount}px`,
        height: `${(to[1] - from[1]) * cellSize}px`,
        bottom: `${from[1] * cellSize - scrollPos[1]}px`,
      },
      dragMarker: {
        width: `${cellSize * treadleCount}px`,
        height: `${(dragSelection.to[1] - dragSelection.from[1]) * cellSize}px`,
        bottom: `${dragSelection.from[1] * cellSize - scrollPos[1]}px`,
      },
    },
    {
      name: 'useWarpColors',
      canvasArea: {
        height: `${cellSize}px`,
        right: `${warpColorsPosition[0] * cellSize}px`,
        bottom: `${warpColorsPosition[1] * cellSize}px`,
        left: 0,
      },
      selectionArea: {
        width: `${(to[0] - from[0]) * cellSize}px`,
        height: `${cellSize}px`,
        right: `${from[0] * cellSize - scrollPos[0]}px`,
      },
      dragMarker: {
        width: `${cellSize * (dragSelection.to[0] - dragSelection.from[0])}px`,
        right: `${cellSize * dragSelection.from[0]}px`,
        height: `${cellSize}px`,
      },
    },
    {
      name: 'useWeftColors',
      canvasArea: {
        width: `${cellSize}px`,
        right: `${weftColorsPosition[0] * cellSize}px`,
        top: 0,
        bottom: `${weftColorsPosition[1] * cellSize}px`,
      },
      selectionArea: {
        width: `${cellSize}px`,
        height: `${(to[1] - from[1]) * cellSize}px`,
        right: 0,
        bottom: `${from[1] * cellSize - scrollPos[1]}px`,
      },
      dragMarker: {
        width: `${cellSize}px`,
        height: `${(dragSelection.to[1] - dragSelection.from[1]) * cellSize}px`,
        right: 0,
        bottom: `${dragSelection.from[1] * cellSize}px`,
      },
    },
    {
      name: 'weave',
      canvasArea: {
        left: 0,
        right: `${weavePosition[0] * cellSize}px`,
        top: 0,
        bottom: `${weavePosition[1] * cellSize}px`,
      },
      selectionArea: {
        width: `${cellSize * (to[0] - from[0])}px`,
        height: `${cellSize * (to[1] - from[1])}px`,
        right: `${from[0] * cellSize - scrollPos[0]}px`,
        bottom: `${from[1] * cellSize - scrollPos[1]}px`,
      },
      dragMarker: {
        width: `${(dragSelection.to[0] - dragSelection.from[0]) * cellSize}px`,
        height: `${(dragSelection.to[1] - dragSelection.from[1]) * cellSize}px`,
        right: `${dragSelection.from[0] * cellSize}px`,
        bottom: `${dragSelection.from[1] * cellSize}px`,
      },
    },
  ];

  function swap(a, b, i) {
    if (a[i] > b[i]) {
      let t = b[i];
      b[i] = a[i];
      a[i] = t;
    }
  }

  function getSelection(fromCoord, toCoord) {
    let origin = [0, 0];
    if (fromCoord[0] > toCoord[0]) {
      fromCoord = vec2.copy(vec2.create(), fromCoord);
      toCoord = vec2.copy(vec2.create(), toCoord);
      swap(fromCoord, toCoord, 0);
    }
    if (fromCoord[1] > toCoord[1]) {
      fromCoord = vec2.copy(vec2.create(), fromCoord);
      toCoord = vec2.copy(vec2.create(), toCoord);
      swap(fromCoord, toCoord, 1);
    }
    if (vec2.dist(origin, fromCoord) > vec2.dist(origin, toCoord)) {
      [fromCoord, toCoord] = [toCoord, fromCoord];
    }
    let fromOrigin = vec2.create();
    vec2.sub(fromOrigin, fromCoord, origin);
    vec2.scale(fromOrigin, fromOrigin, 1 / cellSize);
    fromOrigin = fromOrigin.map((v) => Math.max(0, v)).map(Math.floor);

    let toOrigin = vec2.create();
    vec2.sub(toOrigin, toCoord, origin);
    vec2.scale(toOrigin, toOrigin, 1 / cellSize);
    toOrigin = toOrigin.map(Math.ceil);

    return {
      from: fromOrigin,
      to: toOrigin,
    };
  }

  let isDragging;
  let containerFrom = [0, 0];
  let containerTo = [0, 0];
  let currentSelection;
  function containerMouseDown(event, name) {
    isDragging = true;
    let rect = event.target.getBoundingClientRect();
    currentSelection = name;
    containerFrom = [rect.width - event.offsetX, rect.height - event.offsetY];
    document.body.addEventListener('pointermove', containerMouseMove);
    document.body.addEventListener('pointerup', containerMouseUp);
  }

  function containerMouseMove(event) {
    let rect = event.target.getBoundingClientRect();
    let containerTo = [rect.width - event.offsetX, rect.height - event.offsetY];
    dragSelection = getSelection(containerFrom, containerTo);
  }

  function containerMouseUp(event) {
    let rect = event.target.getBoundingClientRect();
    containerTo = [rect.width - event.offsetX, rect.height - event.offsetY];
    let mouseOverElement = document.elementFromPoint(event.pageX, event.pageY);
    let targetName = mouseOverElement.getAttribute('data-name');
    let newSelection = getSelection(containerFrom, containerTo);
    selection.update((temp) => {
      temp.to = newSelection.to;
      temp.from = newSelection.from;
      if (currentSelection === 'weave') {
        temp.useThreading = true;
        temp.useWarpColors = true;
        temp.useTreadling = true;
        temp.useWeftColors = true;
      } else {
        temp.useThreading = false;
        temp.useWarpColors = false;
        temp.useTreadling = false;
        temp.useWeftColors = false;
        temp[currentSelection] = true;
      }
      if (targetName !== 'weave' && targetName !== currentSelection) {
        temp[targetName] = true;
      }
    });
    stopContainerDrag();
  }

  function toggleSelection(name) {
    if (name !== 'weave') {
      selection.update((temp) => {
        temp[name] = !temp[name];
      });
    }
  }

  function stopContainerDrag() {
    isDragging = false;
    document.body.removeEventListener('pointermove', containerMouseMove);
    document.body.removeEventListener('pointerup', containerMouseUp);
  }

  function toCssString(obj) {
    return Object.entries(obj).reduce((a, b) => a + '; ' + b.join(': '), '');
  }
</script>

{#if isSelecting}
  <div class="selections">
    {#each selections as selectionItem}
      <div
        data-name={selectionItem.name}
        class={'selection ' + selectionItem.name}
        on:pointerdown={(e) => containerMouseDown(e, selectionItem.name)}
        style={toCssString(selectionItem.canvasArea)}
      >
        {#if isDragging}
          <div
            style={toCssString(selectionItem.dragMarker)}
            class="current-selection-marker"
          />
        {/if}
        {#if hasLength}
          <div
            class={'selection-overlay'}
            class:applied={$selection[selectionItem.name]}
            on:click={() => toggleSelection(selectionItem.name)}
            style={toCssString(selectionItem.selectionArea)}
          />
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .selection {
    position: absolute;
    overflow: hidden;
    pointer-events: all;
  }

  .current-selection-marker {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .selection-overlay {
    pointer-events: none;
    position: absolute;
    box-shadow: inset 0 0 1px 5px gray;
    display: flex;
    justify-content: space-between;
  }
  .applied {
    box-shadow: inset 0 0 1px 5px green;
  }
</style>
