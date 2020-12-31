<script>
  import tinycolor from 'tinycolor2';
  import draft from '../../stores/Draft';
  import ui from '../../stores/UI';

  import add from 'icons/add.svg';

  let yarns = $draft.yarn;
  let colors = yarns.map(y => tinycolor.fromRatio(y.color));
</script>
<div class="settings">
  <div class="yarns">
    {#each yarns as yarn, i}
      <div class="yarn">
        <div>{yarn.name}</div>
        <button class="color" style={`
             background-color: ${colors[i].toHexString()};
             border-color: ${colors[i].isLight() ? 'black' : 'white'}`
             }>
        </button>
      </div>
    {/each}
  </div>
  <button>
    <div class="icon">{@html add}</div>
    <span>Add new yarn</span>
  </button>
</div>
<style>
  .yarns {
    padding: 10px;
    background-color: lightgray;
  }

  .yarns .yarn {
    display: flex;
    flex-direction: column;
  }

  .yarns .yarn:not(:first-child):before {
    content: "";
    height: 1px;
    background-color: rgba(0, 0, 0, 0.2);
    margin: 10px 0;
    position: relative;
    left: -10px;
    width: calc(100% + 20px);
  }

  .color {
    height: 1em;
    border: 1px solid black;
  }

  button {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }

  .settings {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

</style>
