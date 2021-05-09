import { writable } from 'svelte/store';
import { produce } from 'immer';

let ui = {
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: 60,
  scrollPos: [0, 0],
  xStepDistance: 8,
  yStepDistance: 8,
  selectTo: 0,
  selectFrom: 0,
  isDragging: false,
  hoverCell: [0, 0],
};

const store = writable(ui);
let prevStore = ui;
store.subscribe((s) => {
  prevStore = s;
});

window.dataUI = ui;
export default {
  ui: store,
  update: function (func) {
    store.set(produce(prevStore, func));
  },
  subscribe: function (subscription) {
    return store.subscribe(subscription);
  },
};
