import { writable } from 'svelte/store';
import { produce } from 'immer';

let selection = {
  isSelecting: false,
  from: [0, 0],
  to: [10, 10],
  useThreading: false,
  useWarpColors: false,
  useTreadling: false,
  useWeftColors: false,
};

const store = writable(selection);
let prevStore = selection;

store.subscribe((s) => {
  prevStore = s;
});

export default {
  selection: store,
  update: function (func) {
    store.set(produce(prevStore, func));
  },
  subscribe: function (subscription) {
    return store.subscribe(subscription);
  },
};
