<script>
  import draft from '../../../../stores/Draft';
  import ui from '../../../../stores/UI';
  import DraftUtil from '../../../../util/DraftUtil';
  import { _ } from 'svelte-i18n';

  let shaftCount = $draft.shaftCount;
  let treadleCount = $draft.treadleCount;
  let warpCount = $draft.warpCount;
  let pickCount = $draft.pickCount;

  function submit(event) {
    event.preventDefault();
    draft.update((temp) => {
      if ($draft.shaftCount !== shaftCount) {
        DraftUtil.updateShaftCount(temp, shaftCount);
      }
      if ($draft.treadleCount !== treadleCount) {
        DraftUtil.updateTreadleCount(temp, treadleCount);
      }
      if ($draft.warpCount !== warpCount) {
        DraftUtil.updateWarpCount(temp, warpCount);
      }
      if ($draft.pickCount !== pickCount) {
        DraftUtil.updatePickCount(temp, pickCount);
      }
    });
    ui.update((temp) => {
      temp.selectedMenu = -1;
    });
  }
</script>

<form on:submit={submit}>
  <div>
    <label for="shaft-count">{$_('page.weave_settings.shaft_count')}</label>
    <input type="number" id="shaft-count" bind:value={shaftCount} />
  </div>
  <div>
    <label for="treadle-count">{$_('page.weave_settings.treadle_count')}</label>
    <input type="number" id="treadle-count" bind:value={treadleCount} />
  </div>
  <div>
    <label for="warp-count">{$_('page.weave_settings.warp_count')}</label>
    <input type="number" id="warp-count" bind:value={warpCount} />
  </div>
  <div>
    <label for="weft-count">{$_('page.weave_settings.weft_count')}</label>
    <input type="number" id="weft-count" bind:value={pickCount} />
  </div>

  <button class="submit">{$_('page.weave_settings.save')}</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
  }

  form > * {
    margin: 8px 4px;
  }
</style>
