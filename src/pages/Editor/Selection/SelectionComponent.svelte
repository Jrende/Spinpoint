<script>
  import { vec2 } from 'gl-matrix';
  import selection from './SelectionStore';
  import ui from 'stores/UI';
  import draft from 'stores/Draft';

  $: cellSize = $ui.cellSize / 2.0;
  $: shaftCount = $draft.shaftCount;
  $: treadleCount = $draft.treadleCount;

  $: threadingPos = [treadleCount + 4, 3];
  $: treadlingPos = [3, shaftCount + 4];
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

  $: selections = [
    {
      name: 'useThreading',
      dir: 'horiz',
      width: cellSize * (to[0] - from[0]),
      height: cellSize * shaftCount,
      right: (threadingPos[0] + from[0]) * cellSize - scrollPos[0],
      bottom: threadingPos[1] * cellSize,
    },
    {
      name: 'useTreadling',
      dir: 'vert',
      width: cellSize * treadleCount,
      height: cellSize * (to[1] - from[1]),
      right: treadlingPos[0] * cellSize,
      bottom: (treadlingPos[1] + from[1]) * cellSize - scrollPos[1],
    },
    {
      name: 'useWarpColors',
      dir: 'horiz',
      width: cellSize * (to[0] - from[0]),
      height: cellSize,
      right: (warpColorsPosition[0] + from[0]) * cellSize - scrollPos[0],
      bottom: warpColorsPosition[1] * cellSize,
    },
    {
      name: 'useWeftColors',
      dir: 'vert',
      width: cellSize,
      height: (to[1] - from[1]) * cellSize,
      right: weftColorsPosition[0] * cellSize,
      bottom: (weftColorsPosition[1] + from[1]) * cellSize - scrollPos[1],
    },
    {
      name: 'weave',
      dir: 'weave',
      width: cellSize * (to[0] - from[0]),
      height: cellSize * (to[1] - from[1]),
      right: (weavePosition[0] + from[0]) * cellSize - scrollPos[0],
      bottom: (weavePosition[0] + from[1]) * cellSize - scrollPos[1],
    },
  ];

  let dragStart = [];
  let dragEndName;
  let dragDir;
  let dragName;
  function onResizeMouseDown(event, dir, toOrFrom, name) {
    event.stopPropagation();

    dragStart = [event.pageX, event.pageY];
    dragName = name;
    dragEndName = toOrFrom;
    dragDir = dir;

    if (dir === 'vert' || dir === 'horiz') {
      document.body.addEventListener('pointermove', onResizeMouseMove);
    } else {
      document.body.addEventListener('pointermove', onResizeMouseMoveDiagonal);
    }
    document.body.addEventListener('pointerup', onBodyMouseUp);
    if (dir === 'vert') {
      document.body.style.cursor = 'row-resize';
    } else if (dir === 'horiz') {
      document.body.style.cursor = 'col-resize';
    }
  }

  function onResizeMouseMoveDiagonal(e) {
    if (e.buttons === 0) {
      stopDrag();
      return;
    }
    let endPos = [e.pageX, e.pageY];
    if (dragDir === 'nw') {
      updateSelection(dragStart, endPos, 'vert', 'to');
      updateSelection(dragStart, endPos, 'horiz', 'to');
    }
    if (dragDir === 'ne') {
      updateSelection(dragStart, endPos, 'vert', 'to');
      updateSelection(dragStart, endPos, 'horiz', 'from');
    }
    if (dragDir === 'se') {
      updateSelection(dragStart, endPos, 'vert', 'from');
      updateSelection(dragStart, endPos, 'horiz', 'from');
    }
    if (dragDir === 'sw') {
      updateSelection(dragStart, endPos, 'vert', 'from');
      updateSelection(dragStart, endPos, 'horiz', 'to');
    }
  }

  function onResizeMouseMove(e) {
    if (e.buttons === 0) {
      stopDrag();
      return;
    }
    let endPos = [e.pageX, e.pageY];
    updateSelection(dragStart, endPos, dragDir, dragEndName, dragName);
  }
  function updateSelection(fromCoord, toCoord, dir, endName, name) {
    let diff = vec2.sub(vec2.create(), toCoord, fromCoord);
    let index = dir === 'horiz' ? 0 : 1;
    let d = diff[index] / cellSize;
    let numCells;
    if (d > 0.0) {
      numCells = Math.floor(d);
    } else {
      numCells = -Math.floor(Math.abs(d));
    }
    if (numCells !== 0) {
      // Två fall: antingen drar man from över to, eller to över from
      // I båda fallen blir from.x || from.y mer än to.x || to.y
      if (from[index] + numCells > to[index]) {
        console.log('Switch endName from ' + endName);
        dragEndName = endName === 'to' ? 'from' : 'to';
        endName = dragEndName;
        console.log('to ' + endName);
      }
      selection.update((temp) => {
        temp[endName][index] -= numCells;
        if (name !== undefined) {
          temp[name] = true;
        }
      });
      dragStart[index] = dragStart[index] + numCells * cellSize;
    }
  }

  function onBodyMouseUp() {
    stopDrag();
  }

  function stopDrag() {
    document.body.removeEventListener('pointermove', onResizeMouseMove);
    document.body.removeEventListener('pointermove', onResizeMouseMoveDiagonal);
    document.body.removeEventListener('pointerup', onBodyMouseUp);
    document.body.style.cursor = '';
  }

  function toggleSelection(name) {
    if (name !== 'weave') {
      selection.update((temp) => {
        temp[name] = !temp[name];
      });
    }
  }

  function swap(a, b, i) {
    if (a[i] > b[i]) {
      let t = b[i];
      b[i] = a[i];
      a[i] = t;
    }
  }

  function getSelection(fromCoord, toCoord) {
    let origin = vec2.scale(vec2.create(), weavePosition, cellSize);
    if (fromCoord[0] > toCoord[0]) {
      swap(fromCoord, toCoord, 0);
    }
    if (fromCoord[1] > toCoord[1]) {
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

  let containerFrom;
  let containerTo;
  function containerMouseDown(event) {
    let rect = event.target.getBoundingClientRect();
    containerFrom = [rect.width - event.offsetX, rect.height - event.offsetY];
    document.body.addEventListener('pointermove', containerMouseMove);
    document.body.addEventListener('pointerup', containerMouseUp);
  }

  function containerMouseMove(event) {
    /*
    let rect = event.target.getBoundingClientRect();
    containerTo = [rect.width - event.offsetX, rect.height - event.offsetY];
    */
  }

  function containerMouseUp(event) {
    let rect = event.target.getBoundingClientRect();
    containerTo = [rect.width - event.offsetX, rect.height - event.offsetY];
    let newSelection = getSelection(containerFrom, containerTo);
    selection.update((temp) => {
      temp.to = newSelection.to;
      temp.from = newSelection.from;
    });
    stopContainerDrag();
  }

  function stopContainerDrag() {
    containerFrom = undefined;
    document.body.removeEventListener('pointermove', containerMouseMove);
    document.body.removeEventListener('pointerup', containerMouseUp);
  }
</script>

{#if isSelecting}
  <div class="selection" on:mousedown={containerMouseDown}>
    {#if hasLength}
      {#each selections as selectionItem}
        <div
          class={'selection-overlay ' + selectionItem.dir}
          class:applied={$selection[selectionItem.name]}
          on:click={() => toggleSelection(selectionItem.name)}
          style={`
          width: ${selectionItem.width}px;
          height: ${selectionItem.height}px;
          right: ${selectionItem.right}px;
          bottom: ${selectionItem.bottom}px;
        `}
        >
          {#if selectionItem.name !== 'weave'}
            <button
              class="resize to"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(
                  e,
                  selectionItem.dir,
                  'to',
                  selectionItem.name
                )}
            />
            <button
              class="resize from"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, selectionItem.dir, 'from')}
            />
          {:else}
            <button
              class="resize n"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'vert', 'to', 'weave')}
            />
            <button
              class="resize ne"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'ne', undefined, 'weave')}
            />
            <button
              class="resize e"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'horiz', 'from', 'weave')}
            />
            <button
              class="resize se"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'se', undefined, 'weave')}
            />
            <button
              class="resize s"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'vert', 'from', 'weave')}
            />
            <button
              class="resize sw"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'sw', undefined, 'weave')}
            />
            <button
              class="resize w"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'horiz', 'to', 'weave')}
            />
            <button
              class="resize nw"
              on:click={(e) => e.stopPropagation()}
              on:pointerdown={(e) =>
                onResizeMouseDown(e, 'nw', undefined, 'weave')}
            />
          {/if}
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .selection {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    pointer-events: all;
  }

  .selection-overlay {
    position: absolute;
    box-shadow: 0 0 1px 5px gray;
    display: flex;
    justify-content: space-between;
    pointer-events: all;
  }

  .selection-overlay.horiz {
    flex-direction: row;
  }

  .selection-overlay.vert {
    flex-direction: column;
  }

  .applied {
    box-shadow: 0 0 1px 5px green;
  }

  .resize {
    position: relative;
    border: 1px solid black;
    margin: 0;
    pointer-events: all;
  }

  .vert :where(.to, .from):hover {
    cursor: row-resize;
  }

  .horiz :where(.to, .from):hover {
    cursor: col-resize;
  }

  .weave {
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: auto 1fr auto;
  }

  .weave .n {
    grid-column: 2;
    grid-row: 1;
    cursor: row-resize;
  }

  .weave .nw {
    grid-column: 1;
    grid-row: 1;
  }

  .weave .w {
    grid-column: 1;
    grid-row: 2;
    cursor: col-resize;
  }

  .weave .sw {
    grid-column: 1;
    grid-row: 3;
  }

  .weave .s {
    grid-column: 2;
    grid-row: 3;
    cursor: row-resize;
  }

  .weave .se {
    grid-column: 3;
    grid-row: 3;
  }

  .weave .e {
    grid-column: 3;
    grid-row: 2;
    cursor: col-resize;
  }

  .weave .ne {
    grid-column: 3;
    grid-row: 1;
  }
</style>
