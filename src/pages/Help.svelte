<script>
  import { useFocus } from 'svelte-navigator';

  const registerFocus = useFocus();
</script>

<div class="application">
  <h1 use:registerFocus>Attribution</h1>
  <h2>From the <a href="https://thenounproject.com">Noun Project</a></h2>
  <ul>
    <li>help by Baboon designs</li>
    <li>back by David</li>
    <li>Scarf by Sergey Demushkin</li>
    <li>Yarn by Sergey Demushkin</li>
    <li>add by Johan Ronsse</li>
    <li>Repeat by Adrien Coquet</li>
    <li>Save by Mahesh Keshvala</li>
    <li>Upload by Gicon studio</li>
  </ul>
</div>

<style>
</style>
