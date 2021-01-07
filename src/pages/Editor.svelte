<script>
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';
  import ScrollPane from '../components/ScrollPane/ScrollPane.svelte';

  const registerFocus = useFocus();
</script>

<div class="fixed">
  <YarnSelector />
  <WeaveDisplay />
</div>
<ScrollPane />

<style>
  .container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .fixed {
    position: fixed;
    width: 100%;
    height: 100%;
  }
</style>
