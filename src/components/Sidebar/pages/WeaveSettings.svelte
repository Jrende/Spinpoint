<script>
  import draft from '../../../stores/Draft';
  import ui from '../../../stores/UI';
  import DraftUtil from '../../../util/DraftUtil';

  let shaftCount = $draft.get('shaftCount');
  let treadleCount = $draft.get('treadleCount');
  let warpCount = $draft.get('warpCount');
  let pickCount = $draft.get('pickCount');
  function submit(event) {
    event.preventDefault();
    let newDraft = $draft;
    let changed = false;
    if(
      $draft.get('shaftCount') !== shaftCount ||
      $draft.get('treadleCount') !== treadleCount) {
      changed = true;
      newDraft = DraftUtil.updateShaftOrTreadleCounts(newDraft, shaftCount, treadleCount);
    }
    if($draft.get('warpCount') !== warpCount) {
      changed = true;
      newDraft = DraftUtil.updateWarpCount(newDraft, warpCount);
    }
    if($draft.get('pickCount') !== pickCount) {
      changed = true;
      newDraft = DraftUtil.updatePickCount(newDraft, pickCount);
    }
    if(changed) {
      draft.update((value) => newDraft);
    }
    ui.update(u => u.set('selectedMenu', -1));
  }
</script>
<form on:submit={submit}>
  <div>
    <label for="shaft-count">Number of shafts</label>
    <input type="number" id="shaft-count" bind:value={shaftCount}>
  </div>
  <div>
    <label for="treadle-count">Treadles</label>
    <input type="number" id="treadle-count" bind:value={treadleCount}>
  </div>
  <div>
    <label for="warp-count">Number of warp threads</label>
    <input type="number" id="warp-count" bind:value={warpCount}>
  </div>
  <div>
    <label for="weft-count">Number of weft threads</label>
    <input type="number" id="weft-count" bind:value={pickCount}>
  </div>

  <button class="submit">Save</button>
</form>
<style>
  form {
    display: flex;
    flex-direction: column;
  }

  form > * {
    margin: 8px 4px;
  }

  .tieup input {
    max-width: 4em;
  }

</style>
