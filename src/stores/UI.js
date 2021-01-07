import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'

let ui = {
  borderSize: 2,
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: 60,
  pos: [0, 0]
};

const store = writable(ui);

export default store;
