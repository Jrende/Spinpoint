import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'
let draft = {};
if(window.localStorage.getItem('draft')) {
  draft = JSON.parse(localStorage.getItem('draft'));
} else {
  draft = {
    treadling: [],
    threading: [],
    warpColors: [],
    weftColors: [],
    tieup: [],
    shaftCount: 4,
    treadleCount: 4,
    warpCount: 30,
    pickCount: 30
  };

  for(let i = 0; i < draft.shaftCount; i++) {
    draft.tieup[i] = [];
    for(let j = 0; j < draft.shaftCount; j++) {
      draft.tieup[i][j] = 0;
    }
  }

  for(let i = 0; i < draft.warpCount; i++) {
    draft.warpColors[i] = {r: 0.0, g: 0.0, b: 0.0};
  }

  for(let i = 0; i < draft.pickCount; i++) {
    draft.weftColors[i] = {r: 1.0, g: 1.0, b: 1.0};
  }
}
const store = writable(draft);
export default store;

store.subscribe(value => {
  localStorage.setItem("draft", JSON.stringify(value));
});
