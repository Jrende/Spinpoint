<script>
  import draft from '../../stores/Draft';

  let shaftCount = $draft.shaftCount;
  let treadleCount = $draft.treadleCount;
  let warpCount = $draft.warpCount;
  let pickCount = $draft.pickCount;
  function submit(event) {
    event.preventDefault();
    draft.update((value) => ({
      ...value,
      shaftCount,
      treadleCount,
      warpCount,
      pickCount
    }));
  }
</script>
<form on:submit={submit}>
  <h1>Weave settings</h1>
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
