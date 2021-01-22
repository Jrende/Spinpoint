import tinycolor from 'tinycolor2';
import App from './App.svelte';

const app = new App({
  target: document.body,
  props: {
    url: location.pathname.substr(location.pathname.lastIndexOf('/'))
  }
});

window.tinycolor = tinycolor;
export default app;
