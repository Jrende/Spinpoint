import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'

let ui = {
  borderSize: 2,
  selectedMenu: 2,
  selectedColor: 0,
  cellSize: 70
};

const store = writable(ui);

export default store;
