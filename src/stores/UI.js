import { writable } from 'svelte/store'
import { fromJS } from 'immutable';

let ui = {
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: 60,
  scrollPos: [0, 0],
  xStepDistance: 8,
  yStepDistance: 8,
};

const store = writable(fromJS(ui));

window.dataUI = ui;
export default store;
