import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'
import { fromJS, List } from 'immutable';
window.fromJS = fromJS;
window.List = List;
let draft = {};
if(window.localStorage.getItem('draft')) {
  draft = JSON.parse(localStorage.getItem('draft'));
} else {
  draft = {
    treadling: [],
    threading: [],
    warpColors: new Array(30).fill(0),
    weftColors: new Array(30).fill(1),
    tieup: [
      [1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 0, 1],
      [0, 1, 1, 0, 1, 0],
      [1, 1, 0, 0, 0, 1],
    ],
    shaftCount: 4,
    treadleCount: 6,
    warpCount: 30,
    pickCount: 30,
    yarn: [
      {
        name: 'White yarn',
        color: { r: 0.8, g: 0.8, b: 0.8}
      },
      {
        name: 'Black yarn',
        color: { r: 0.7, g: 0.0, b: 0.0}
      }
    ]
  };

  for(let i = 0; i < draft.warpCount; i++) {
    draft.threading.push(i % 4);
  }

  for(let i = 0; i < draft.pickCount; i++) {
    draft.treadling.push(i % 4);
  }
}


const store = writable(fromJS(draft));
export default store;

let d;
store.subscribe(value => {
  let v = value.toJS();
  window.data = v;
  d = v;
  localStorage.setItem('draft', JSON.stringify(v));
});

//window.draft = draft;
window.update = function() {
  localStorage.setItem('draft', JSON.stringify(d));
}

window.drop = function() {
  localStorage.removeItem('draft');
}
