import { writable } from 'svelte/store'
import { fromJS } from 'immutable';

let ui = {
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: 60,
  scrollPos: [0, 0],
  colorPickerVisible: false,
  colorPickerX: 0,
  colorPickerY: 0,
  colorPickerColor: {r: 1.0, g: 0.0, b: 0.0}
};

const store = writable(fromJS(ui));

window.dataUI = ui;
export default store;
