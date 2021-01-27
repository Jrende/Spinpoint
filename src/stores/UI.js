import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'
import { fromJS } from 'immutable';

let ui = {
  borderSize: 2,
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: 60,
  scrollPos: [0, 0]
};

const store = writable(fromJS(ui));

window.dataUI = ui;
export default store;
