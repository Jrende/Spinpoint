import { writable } from 'svelte/store';
let lastListenerId = 0;
let listenersSnapshot;

let listeners = writable({});
let isVisible = writable(false);
let position = writable([0, 0]);

listeners.subscribe((s) => (listenersSnapshot = s));

let colorPickerStore = {
  onColorChange: (listener) => {
    let id = lastListenerId++;
    listeners.update((l) => ({
      ...l,
      [id]: listener,
    }));
    return id;
  },
  removeListener: (id) => {
    listeners.update((s) => {
      let ls = { ...s };
      delete ls[id];
      return { ls };
    });
  },
  showColorPicker: (x, y) => {
    position.set([x, y]);
    isVisible.set(true);
  },
  emit: (color) => Object.values(listenersSnapshot).forEach((l) => l(color)),
  listeners,
  isVisible,
  position,
};
export { colorPickerStore };
