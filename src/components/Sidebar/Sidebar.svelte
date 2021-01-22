<script>
  import { onMount } from 'svelte';
  import { Router, Link, Route, link } from 'svelte-navigator';
  import HelpIcon from 'icons/help.svg';
  import BackIcon from 'icons/back.svg';
  import ScarfIcon from 'icons/scarf.svg'
  import YarnIcon from 'icons/yarn.svg'
  import PatternBucket from 'icons/pattern-bucket.svg'

  import ui from '../../stores/UI';
  import WeaveSettings from './pages/WeaveSettings.svelte';
  import YarnSettings from './pages/YarnSettings.svelte';
  import PatternFill from './pages/PatternFill.svelte';

  let items = [
    {
      icon: ScarfIcon,
      title: 'Weave settings',
      component: WeaveSettings
    },
    {
      icon: YarnIcon,
      title: 'Yarns',
      component: YarnSettings
    },
    {
      icon: PatternBucket,
      title: 'Fill with pattern',
      component: PatternFill,
    },
  ];
  let sidebarWidth;
  let sidebar;
  onMount(() => {
    sidebarWidth = sidebar.getBoundingClientRect().width;
  });

  function selectMenu(index) {
    ui.update(u => u.update('selectedMenu', s => s === index ? -1 : index));
  }
</script>

<Router primary={false}>
  <div class="sidebar-container">
    <div class="sidebar" bind:this={sidebar} >
      {#each items as item, i}
        <button class="icon-button" on:click={() => selectMenu(i)}>
      <div class={"icon"}>
            {@html item.icon}
          </div>
        </button>
      {/each}

      <div class="help">
        <Route path="/">
          <a href="weaver/about" use:link>
            <div class="icon">
              {@html HelpIcon}
            </div>
          </a>
        </Route>
        <Route path="about">
        <a class="help" href="/" use:link>
          <div class="icon">
            {@html BackIcon}
          </div>
        </a>
        </Route>
      </div>

    </div>

    {#if $ui.get('selectedMenu') !== -1}
      <div class="settings-sidebar" style={`left: ${sidebarWidth}px`}>
        <div class="settings">
          <h2>{items[$ui.get('selectedMenu')].title}</h2>
          <svelte:component this={items[$ui.get('selectedMenu')].component} />
        </div>
        <div class="overlay" on:click={() => selectMenu(-1)}>
        </div>
      </div>
    {/if}
  </div>
</Router>

<style>
  .icon {
    fill: var(--color-1);
    stroke: var(--color-1);
    width: 50px;
    height: 50px;
  }

  .icon-button {
    background-color: var(--color-2);
    border-radius: 4px;
    border: 1px black;
  }

  .sidebar-container {
    display: flex;
    z-index: 10;
  }

  .sidebar {
    width: 50px;
    background-color: #40362A;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sidebar > * {
    margin: 10px;
  }

  .help {
    display: flex;
    flex-direction: column-reverse;
    flex-grow: 1;
  }

  .settings-sidebar {
    max-height: 100vh;
    overflow: auto;
  }

  .settings {
    background-color: white;
    padding: 20px;
    border-right: 1px solid var(--color-4);
  }

  .overlay {
    background-color: rgba(0.0, 0.0, 0.0, 0.4);
    flex-grow: 1;
  }

  .pattern-bucket {
  }
</style>
