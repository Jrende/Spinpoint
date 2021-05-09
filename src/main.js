import './i18n/i18n';
import tinycolor from 'tinycolor2';
import App from './App.svelte';
import { enablePatches } from 'immer';

enablePatches();
window.process = { env: { NODE_ENV: 'production' } };

const app = new App({
  target: document.body,
  props: {
    url: location.pathname.substr(location.pathname.lastIndexOf('/')),
  },
});

window.tinycolor = tinycolor;
export default app;
