import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'

let ui = {
  borderSize: 2,
  selectedMenu: -1,
  selectedColor: 0,
  cellSize: resize()
};

const store = writable(ui);
window.addEventListener('resize', () => {
  store.update((value) => {
    return {
      ...value,
      cellSize: resize()
    };
  });
});

function resize() {
    let w = document.body.clientWidth;
    //return Math.max(70, w / 50) * window.devicePixelRatio;
  return (w / 40) * window.devicePixelRatio;
}
export default store;
