<script>
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import DraftUtil from '../../../util/DraftUtil';
  import { _ } from 'svelte-i18n';

  let shaftCount = $draft.get('shaftCount');
  let treadleCount = $draft.get('treadleCount');
  let warpCount = $draft.get('warpCount');
  let pickCount = $draft.get('pickCount');

  function submit(event) {
    event.preventDefault();
    let newDraft = $draft;
    let changed = false;
    if (
      $draft.get('shaftCount') !== shaftCount ||
      $draft.get('treadleCount') !== treadleCount
    ) {
      changed = true;
      newDraft = DraftUtil.updateShaftOrTreadleCounts(
        newDraft,
        shaftCount,
        treadleCount
      );
    }
    if ($draft.get('warpCount') !== warpCount) {
      changed = true;
      newDraft = DraftUtil.updateWarpCount(newDraft, warpCount);
    }
    if ($draft.get('pickCount') !== pickCount) {
      changed = true;
      newDraft = DraftUtil.updatePickCount(newDraft, pickCount);
    }
    if (changed) {
      draft.set(newDraft);
    }
    ui.update((u) => u.set('selectedMenu', -1));
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
