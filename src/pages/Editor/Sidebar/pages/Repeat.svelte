<script>
  import { onMount, onDestroy } from 'svelte';
  import draft from 'stores/Draft';
  import selection from '../../Selection/SelectionStore';
  import DraftUtil from 'util/DraftUtil';
  import { _ } from 'svelte-i18n';

  $: useThreading = $selection.useThreading;
  $: useTreadling = $selection.useTreadling;
  $: useWarpColors = $selection.useWarpColors;
  $: useWeftColors = $selection.useWeftColors;
  $: maxLength = Math.max($draft.warpCount, $draft.pickCount);
  let from = 0;
  $: to = maxLength;
  let fillAll = true;

  $: {
    selection.update((temp) => {
      temp.useThreading = useThreading;
    });
  }

  $: {
    selection.update((temp) => {
      temp.useTreadling = useTreadling;
    });
  }

  $: {
    selection.update((temp) => {
      temp.useWarpColors = useWarpColors;
    });
  }

  $: {
    selection.update((temp) => {
      temp.useWeftColors = useWeftColors;
    });
  }

  onMount(() => {
    selection.update((temp) => {
      temp.isSelecting = true;
    });
  });

  onDestroy(() => {
    selection.update((temp) => {
      temp.isSelecting = false;
    });
  });

  function submit(event) {
    event.preventDefault();
    if (useThreading) {
      draft.update((temp) => {
        DraftUtil.applyPattern(
          temp,
          $draft.threading.slice(from, to),
          'warp',
          false
        );
      });
    }

    if (useWarpColors) {
      draft.update((temp) => {
        DraftUtil.applyColor(temp, $draft.warpColors.slice(from, to), 'warp');
      });
    }

    if (useTreadling) {
      draft.update((temp) => {
        DraftUtil.applyPattern(
          temp,
          $draft.treadling.slice(from, to),
          'weft',
          false
        );
      });
    }

    if (useWeftColors) {
      draft.update((temp) => {
        DraftUtil.applyColor(temp, $draft.weftColors.slice(from, to), 'weft');
      });
    }
  }
</script>

<div>
  <fieldset class="repeat-options">
    <legend>Repeat</legend>
    <div>
      <label for="use-threading">Use threading</label>
      <input
        name="use-threading"
        id="use-threading"
        type="checkbox"
        bind:checked={useThreading}
      />
    </div>
    <div>
      <label for="use-warpColors">Use warp colors</label>
      <input
        name="use-warpColors"
        id="use-warpColors"
        type="checkbox"
        bind:checked={useWarpColors}
      />
    </div>
    <div>
      <label for="use-treadling">Use treadling</label>
      <input
        name="use-treadling"
        id="use-treadling"
        type="checkbox"
        bind:checked={useTreadling}
      />
    </div>
    <div>
      <label for="use-weftColors">Use weft colors</label>
      <input
        name="use-weftColors"
        id="use-weftColors"
        type="checkbox"
        bind:checked={useWeftColors}
      />
    </div>
  </fieldset>
  <fieldset class="to-from-inputs">
    <legend>Target</legend>
    <label for="fill-all">Fill entire draft</label>
    <input
      name="fill-all"
      id="fill-all"
      type="checkbox"
      bind:checked={fillAll}
    />

    <label for="from">From</label>
    <input
      name="from"
      id="from"
      type="number"
      min="0"
      max={maxLength}
      disabled={fillAll}
      bind:value={from}
    />
    <label for="to">To</label>
    <input
      name="to"
      id="to"
      type="number"
      min="0"
      max={maxLength}
      bind:value={to}
      disabled={fillAll}
    />
  </fieldset>
  <div>{$selection.from + '->' + $selection.to}</div>
  <button class="submit">Apply repetition</button>
</div>

<!--
<form on:submit={submit} class="controls">
</form>
-->
<style>
  fieldset {
    margin-bottom: 10px;
    border: none;
  }

  fieldset > *:not(legend) {
    margin-left: 12px;
  }

  legend {
    font-size: 1.5rem;
  }

  .to-from-inputs {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  label {
    margin-right: 10px;
    display: flex;
    align-items: center;
  }

  .to-from-inputs input {
    margin: 5px 0;
    width: 5rem;
  }

  .repeat-options {
    display: grid;
    grid-template-columns: 1fr;
  }

  .repeat-options > div {
    display: flex;
    justify-content: space-between;
  }
</style>
