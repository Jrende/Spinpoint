<script>
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import WeaveDisplay from '../components/WeaveDisplay/WeaveDisplay.svelte';
  import YarnSelector from '../components/YarnSelector/YarnSelector.svelte';

  const registerFocus = useFocus();
</script>

<YarnSelector />
<WeaveDisplay />

<style>
</style>
