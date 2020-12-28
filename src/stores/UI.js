import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'

const store = writable({
  canvasSize: 100,
  squareSize: 25,
  borderSize: 1.5
});
export default store;
