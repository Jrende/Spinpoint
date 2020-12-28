<script>
  import { onMount } from 'svelte';
  import { Router, Link, Route, link } from 'svelte-navigator';
  import HelpIcon from 'icons/help.svg';
  import BackIcon from 'icons/back.svg';
  import ScarfIcon from 'icons/scarf.svg'
  import YarnIcon from 'icons/yarn.svg'
  import WeaveSettings from '../WeaveSettings/WeaveSettings.svelte';
  import YarnSettings from '../YarnSettings/YarnSettings.svelte';

  let items = [
    {
      icon: ScarfIcon,
      title: 'Weave settings',
      component: WeaveSettings
    },
    {
      icon: YarnIcon,
      title: 'Weave settings',
      component: YarnSettings
    }
  ];
  let sidebarWidth;
  let sidebar;
  let selectedMenu = -1;
  onMount(() => {
    sidebarWidth = sidebar.getBoundingClientRect().width;
  });

  function selectMenu(index) {
    selectedMenu = selectedMenu === index ?  -1 : index;
  }

</script>

<Router primary={false}>
  <div class="sidebar-container">
    <div class="sidebar" bind:this={sidebar} >
      {#each items as item, i}
        <button class="icon-button" on:click={() => selectMenu(i)}>
          <div class="icon">
            {@html item.icon}
          </div>
        </button>
      {/each}

      <div class="help">
        <Route path="/">
          <a href="/about" use:link>
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

    {#if selectedMenu !== -1}
      <div class="settings-sidebar" style={`left: ${sidebarWidth}px`}>
        <div class="settings">
          <svelte:component this={items[selectedMenu].component} />
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
    position: absolute;
    right: 0;
    height: 100vh;
    display: flex;
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
</style>
