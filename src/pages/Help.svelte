<script>
  import { useFocus } from "svelte-navigator";

  const registerFocus = useFocus();
</script>

<div class="application">
  <h1 use:registerFocus >Halp plix!!!</h1>
  <h2>Oh man i am not good with computer plz to help</h2>

  <ul>
    <li>help by Baboon designs from the Noun Project</li>
    <li>back by David from the Noun Project</li>
    <li>Scarf by Sergey Demushkin from the Noun Project</li>
    <li>Yarn by Sergey Demushkin from the Noun Project</li>
  </ul>
</div>

<style>
</style>
