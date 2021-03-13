import { writable } from 'svelte/store';
let lastListenerId = 0;
let listenersSnapshot;

let listeners = writable({});
let isVisible = writable(false);
let position = writable([0, 0]);
let color = writable({ r: 1.0, g: 0.0, b: 0.0 });

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
  showColorPicker: (x, y, startColor) => {
    position.set([x, y]);
    isVisible.set(true);
    color.set(startColor);
  },
  emit: (color) => Object.values(listenersSnapshot).forEach((l) => l(color)),
  listeners,
  isVisible,
  position,
  color,
};
export { colorPickerStore };
