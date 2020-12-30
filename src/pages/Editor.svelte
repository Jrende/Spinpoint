<script>
  import ui from '../stores/UI';
  import draft from '../stores/Draft';
  import { useFocus } from "svelte-navigator";
  import { WeaveDisplay } from '../components';

  const registerFocus = useFocus();
</script>

<WeaveDisplay />

<style>
</style>
