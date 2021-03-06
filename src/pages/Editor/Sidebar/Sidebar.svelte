<script>
  import { afterUpdate } from 'svelte';
  import { Router, Route, link } from 'svelte-navigator';
  import HelpIcon from 'icons/help.svg';
  import BackIcon from 'icons/back.svg';
  import ScarfIcon from 'icons/scarf.svg';
  import YarnIcon from 'icons/yarn.svg';
  import PatternBucket from 'icons/pattern-bucket.svg';
  import Repeat from 'icons/repeat.svg';

  import ui from '../../../stores/UI';
  import draft from '../../../stores/Draft';
  import WeaveSettings from './pages/WeaveSettings.svelte';
  import YarnSettings from './pages/YarnSettings.svelte';
  import RepeatComponent from './pages/Repeat.svelte';
  import PatternFill from './pages/PatternFill/PatternFill.svelte';

  $: selectedMenu = $ui.selectedMenu;
  let items = [
    {
      icon: ScarfIcon,
      title: 'Weave settings',
      component: WeaveSettings,
    },
    {
      icon: YarnIcon,
      title: 'Yarns',
      component: YarnSettings,
    },
    {
      icon: PatternBucket,
      title: 'Fill with pattern',
      component: PatternFill,
    },
    {
      icon: Repeat,
      title: 'Repeat',
      component: RepeatComponent,
    },
  ];
  let sidebarWidth;
  let sidebar;
  export let open = false;

  afterUpdate(() => {
    if (sidebar !== undefined && sidebar !== null) {
      sidebarWidth = sidebar.getBoundingClientRect().width;
    }
  });

  function selectMenu(index) {
    ui.update((draft) => {
      draft.selectedMenu = draft.selectedMenu === index ? -1 : index;
    });
  }

  function exportToFile() {
    const blob = new Blob([JSON.stringify($draft)], {
      type: 'text/json',
    });
    const link = document.createElement('a');

    link.download = 'weave.json';
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ['text/json', link.download, link.href].join(
      ':'
    );

    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
  }

  function importFromFile(e) {
    let files = e.target.files;
    if (files.length > 0) {
      let file = files[0];
      let reader = new FileReader();
      reader.onload = (readFile) => {
        try {
          let newDraft = JSON.parse(readFile.target.result);
          draft.set(newDraft);
        } catch (e) {
          console.error(e);
        }
      };
      reader.readAsText(file);
    }
  }
</script>

<Router primary={false}>
  <div class="sidebar-container">
    {#if open}
      <div class="sidebar" bind:this={sidebar}>
        {#each items as item, i}
          <button class="icon-button" on:click={() => selectMenu(i)}>
            <div class={'icon'}>
              {@html item.icon}
            </div>
            <span>{item.title}</span>
          </button>
        {/each}
        <button class="icon-button save-load" on:click={exportToFile}>
          <span>Save file</span>
        </button>

        <div>
          <input
            type="file"
            name="upload"
            id="upload"
            on:input={importFromFile}
          />
          <label class="icon-button button" for="upload">Load from file</label>
        </div>
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

      {#if selectedMenu !== -1}
        <div class="settings-sidebar" style={`left: ${sidebarWidth}px`}>
          <div class="settings">
            <svelte:component this={items[selectedMenu].component} />
          </div>
          <div class="overlay" on:click={() => selectMenu(-1)} />
        </div>
      {/if}
    {/if}
  </div>
</Router>

<style>
  input[type='file'] {
    display: none;
  }

  .icon {
    fill: var(--color-1);
    stroke: var(--color-1);
    width: 50px;
    height: 50px;
    margin: auto;
    margin-bottom: 5px;
  }

  .icon-button {
    background-color: var(--color-2);
    border-radius: 4px;
    border: 1px black;
    color: var(--color-1);
  }

  .sidebar-container {
    display: flex;
    z-index: 10;
    grid-column: 1;
  }

  .sidebar {
    background-color: #40362a;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
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
    max-height: 100vh;
    overflow: auto;
  }

  .settings {
    background-color: var(--color-5);
    padding: 20px;
    border-left: none;
    border: 1px solid var(--color-4);
  }

  .overlay {
    background-color: rgba(0, 0, 0, 0.4);
    flex-grow: 1;
  }

  .save-load {
    height: 50px;
    color: var(--color-1);
  }
</style>
