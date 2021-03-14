import { writable } from 'svelte/store';
import { fromJS } from 'immutable';

let ui = {
  selectedMenu: 3,
  selectedColor: 0,
  cellSize: 60,
  scrollPos: [0, 0],
  xStepDistance: 8,
  yStepDistance: 8,
  selectTo: 0,
  selectFrom: 0,
  isDragging: false,
  hoverCell: [0, 0]
};

const store = writable(fromJS(ui));

window.dataUI = ui;
export default store;
