<script>
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import DraftUtil from '../../../util/DraftUtil';
  import { _ } from 'svelte-i18n';

  let useThreading = false;
  let useTreadling = false;
  let useWarpColors = false;
  let useWeftColors = false;

  function submit(event) {
    event.preventDefault();
  }
</script>

<form on:submit={submit} class="controls">
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
    <label for="use-warpColors">Use warpColors</label>
    <input
      name="use-warpColors"
      id="use-warpColors"
      type="checkbox"
      bind:value={useWarpColors}
    />
  </fieldset>
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
    <label for="use-weftColors">Use weftColors</label>
    <input
      name="use-weftColors"
      id="use-weftColors"
      type="checkbox"
      bind:value={useWeftColors}
    />
  </fieldset>
  <fieldset>
    <label for="from">From</label>
    <input name="from" id="from" type="number" />
  </fieldset>
  <fieldset>
    <label for="to">To</label>
    <input name="to" id="to" type="number" />
  </fieldset>
  <button class="submit">Apply repetition</button>
</form>

<style>
</style>
