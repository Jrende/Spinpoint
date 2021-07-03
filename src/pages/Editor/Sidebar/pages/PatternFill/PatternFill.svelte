<script>
  import { _ } from 'svelte-i18n';
  import {
    Accordion,
    AccordionItem,
  } from '../../../../../components/Accordion';
  import HeddleThreadingFill from './HeddleThreadingFill.svelte';
  import ColorFill from './ColorFill.svelte';
  import gridIcon from 'icons/grid.svg';

  let warpOrWeft = 'warp';
  let gridEnabled = false;
  let colorEnabled = false;
  let heddleThreadFill;
  let colorFill;

  function apply() {
    if (gridEnabled) {
      heddleThreadFill.apply();
    }
    if (colorEnabled) {
      colorFill.apply();
    }
  }
</script>

<Accordion>
  <div class="button-group">
    <div class="warp">
      <input
        type="radio"
        id="warp"
        name="warp-or-weft"
        value="warp"
        class:notActive={warpOrWeft === undefined}
        bind:group={warpOrWeft}
      />
      <label for="warp">{@html gridIcon}</label>
    </div>
    <div class="weft">
      <input
        type="radio"
        id="weft"
        name="warp-or-weft"
        value="weft"
        bind:group={warpOrWeft}
      />
      <label for="weft">{@html gridIcon}</label>
    </div>
  </div>
  <AccordionItem>
    <div class="accordion-title" slot="title">
      <input
        type="checkbox"
        id="enable-warp-weft"
        bind:checked={gridEnabled}
        on:click={(e) => e.stopPropagation()}
      />
      <span>Warp/weft</span>
    </div>
    <HeddleThreadingFill
      disabled={!gridEnabled}
      {warpOrWeft}
      bind:this={heddleThreadFill}
    />
  </AccordionItem>
  <AccordionItem>
    <div class="accordion-title" slot="title">
      <input
        type="checkbox"
        id="enable-color"
        bind:checked={colorEnabled}
        on:click={(e) => e.stopPropagation()}
      />
      <span>Color</span>
    </div>
    <div>
      <ColorFill disabled={!colorEnabled} {warpOrWeft} bind:this={colorFill} />
    </div>
  </AccordionItem>
</Accordion>

<button on:click={apply}>{$_('page.pattern_fill.apply')}</button>

<style>
  .warp label {
    flex-direction: column;
  }

  .button-group :global(svg) {
    width: 50px;
    stroke: var(--color-1);
    fill: var(--color-1);
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 12px 0px;
  }

  .button-group input {
    display: none;
  }

  .button-group label {
    padding: 4px;
    height: 50px;
    cursor: pointer;
    border: 1px solid var(--color-2);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-2);
    color: var(--color-1);
  }

  .button-group input:checked + label {
    background-color: var(--color-1);
    color: var(--color-2);
  }

  .button-group input:checked + label :global(svg) {
    stroke: var(--color-2);
    fill: var(--color-2);
  }

  .button-group div:first-child label {
    border-radius: 8px 0 0 8px;
    border-right: 2px solid rgba(0, 0, 0, 0.2);
  }

  .button-group div:last-child label {
    border-left: 0;
    border-radius: 0 8px 8px 0;
  }

  .button-group div {
    border-radius: 8px;
    flex-grow: 1;
    text-align: center;
    cursor: pointer;
    background-color: white;
  }

  .weft :global(svg) {
    transform: rotateZ(90deg);
  }

  .warp :global(svg) {
    width: 75px;
  }

  .accordion-title {
    display: flex;
    align-items: center;
  }

  .accordion-title input {
    margin-right: 4px;
  }
</style>
