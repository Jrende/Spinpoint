<script>
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';

  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  export let length;
  export let vertical = false;
  export let colors;

  let canvas;
  let ctx;

  let colorsStr = [];
  $: {
    for(let i = 0; i < $draft.warpCount; i++) {
      let color = colors[i];
      if(color !== undefined) {
        colorsStr[i] = tinycolor.fromRatio(color).toHexString();
      } else {
        colorsStr[i] = tinycolor('white');
      }
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    syncCanvasDimensions();
  });

  function syncCanvasDimensions() {
    if(vertical) {
      canvas.width = $ui.squareSize;
      canvas.height = $ui.squareSize * length;
    } else {
      canvas.width = $ui.squareSize * length;
      canvas.height = $ui.squareSize;
    }
    draw();
  }

  function draw() {
    let borderSize = $ui.borderSize;
    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';

    if(vertical) {
      let squareSize = ($ui.squareSize - borderSize / 2.25);
      let insideSquareSize = squareSize / 1.5;
      ctx.fillRect(0.0, 0, squareSize, borderSize);
      ctx.fillRect(0, 0, borderSize, squareSize * length);
      ctx.fillRect(squareSize - borderSize, 0, borderSize, squareSize * length);
      ctx.fillRect(0.0, squareSize * length, squareSize, borderSize);

      for(let i = 0; i < length; i++) {
        ctx.fillRect(0.0, i * squareSize, squareSize, borderSize);
      }

      for(let i = 0; i < length; i++) {
        ctx.fillStyle = colorsStr[i];
        ctx.fillRect(
          insideSquareSize / 4.0,
          i * squareSize + insideSquareSize / 3.5,
          insideSquareSize,
          insideSquareSize
        );
      }
    } else {
      let squareSize = ($ui.squareSize - borderSize / 4.0);
      let insideSquareSize = squareSize / 1.5;
      ctx.fillRect(0.1, 0, borderSize, squareSize);
      ctx.fillRect(squareSize * length, 0, borderSize, squareSize);
      ctx.fillRect(0, 0, squareSize * length, borderSize);
      ctx.fillRect(0.1, squareSize - borderSize, squareSize * length, borderSize);

      for(let i = 0; i < length; i++) {
        ctx.fillRect(i * squareSize, 0.0, borderSize, squareSize);
      }

      for(let i = 0; i < length; i++) {
        ctx.fillStyle = colorsStr[i];
        ctx.fillRect(
          i * squareSize + insideSquareSize / 3.5,
          insideSquareSize / 4.0,
          insideSquareSize,
          insideSquareSize
        );
      }
    }

  }

</script>

<canvas bind:this={canvas} />

<style>
  .row-color-picker {
    display: flex;
    flex-direction: row;
  }

  .color {
    width: 25px;
    height: 25px;
  }
</style>
