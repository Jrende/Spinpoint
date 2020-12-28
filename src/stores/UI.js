import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'

const store = writable({
  canvasSize: 100,
  cellSize: 25,
  borderSize: 2
});
export default store;
