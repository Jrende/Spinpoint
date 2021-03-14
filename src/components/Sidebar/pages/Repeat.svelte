<script>
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import DraftUtil from '../../../util/DraftUtil';
  import { _ } from 'svelte-i18n';
  import RightArrow from 'icons/right-arrow.svg';
  import DownArrow from 'icons/down-arrow-2.svg';

  let useThreading = false;
  let useTreadling = false;
  let useWarpColors = false;
  let useWeftColors = false;
  let from = 0;
  let to = 0;

  function submit(event) {
    event.preventDefault();
    let newPattern = $draft;
    if (useThreading) {
      newPattern = DraftUtil.applyPattern(
        newPattern,
        $draft.get('threading').slice(from, to).toJS(),
        'warp',
        false
      );
    }

    if (useWarpColors) {
      newPattern = DraftUtil.applyColor(
        newPattern,
        $draft.get('warpColors').slice(from, to).toJS(),
        'warp'
      );
    }

    if (useTreadling) {
      newPattern = DraftUtil.applyPattern(
        newPattern,
        $draft.get('treadling').slice(from, to).toJS(),
        'weft',
        false
      );
    }

    if (useWeftColors) {
      newPattern = DraftUtil.applyColor(
        newPattern,
        $draft.get('weftColors').slice(from, to).toJS(),
        'weft'
      );
    }
    draft.set(newPattern);
  }
</script>

<form on:submit={submit} class="controls">
  <div class="fieldset horiz">
    {@html RightArrow}
    <fieldset>
      <label for="use-threading">Use threading</label>
      <input
        name="use-threading"
        id="use-threading"
        type="checkbox"
        bind:value={useThreading}
      />
    </fieldset>
    <fieldset>
      <label for="use-warpColors">Use warp colors</label>
      <input
        name="use-warpColors"
        id="use-warpColors"
        type="checkbox"
        bind:value={useWarpColors}
      />
    </fieldset>
  </div>
  <div class="fieldset vert">
    {@html DownArrow}
    <fieldset>
      <label for="use-treadling">Use treadling</label>
      <input
        name="use-treadling"
        id="use-treadling"
        type="checkbox"
        bind:value={useTreadling}
      />
    </fieldset>
    <fieldset>
      <label for="use-weftColors">Use weft colors</label>
      <input
        name="use-weftColors"
        id="use-weftColors"
        type="checkbox"
        bind:value={useWeftColors}
      />
    </fieldset>
  </div>
  <div class="number-inputs">
    <fieldset class="number-input">
      <label for="from">From</label>
      <input name="from" id="from" type="number" bind:value={from} />
    </fieldset>
    <fieldset class="number-input">
      <label for="to">To</label>
      <input name="to" id="to" type="number" bind:value={to} />
    </fieldset>
  </div>
  <button class="submit">Apply repetition</button>
</form>

<style>
  .fieldset:not(:first-child) {
    margin-top: 1em;
  }

  .fieldset {
    display: grid;
    grid-column: span 3;
    grid-template-columns: 40.6px 1fr 1fr;
  }

  .fieldset label {
    height: 100%;
    display: flex;
    align-items: center;
  }

  fieldset:nth-child(2) {
    border-top: 1px solid var(--color-2);
  }

  fieldset {
    grid-column: 2 / span 3;
    border-bottom: 1px solid var(--color-2);
  }

  div.controls {
    grid-template-columns: auto auto 1fr;
  }

  .vert {
    grid-template-columns: auto 1fr 1fr;
  }

  .horiz {
  }

  form :global(svg) {
    fill: var(--color-2);
    stroke: var(--color-2);
  }

  .horiz :global(svg) {
    grid-column: 2 / span 2;
    width: unset;
    transform: rotateY(180deg);
    margin-bottom: 12px;
    position: relative;
    bottom: 4px;
  }

  .vert :global(svg) {
    grid-row: span 2;
    transform: rotateX(180deg);
    margin-left: 12px;
  }

  .number-input,
  .submit {
    grid-column: span 2;
    border: none !important;
    margin: 0;
  }

  .number-inputs {
    margin-top: 12px;
    margin-bottom: 12px;
    display: grid;
    grid-column: span 2;
    grid-template-columns: auto 1fr auto 1fr;
  }

  .number-inputs label {
    margin: 12px;
  }
  .number-inputs input {
    width: 6em;
  }
</style>
