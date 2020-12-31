import tinycolor from 'tinycolor2';
import { writable } from 'svelte/store'
let draft = {};
if(window.localStorage.getItem('draft')) {
  draft = JSON.parse(localStorage.getItem('draft'));
} else {
  /*
  draft = {
    treadling: [],
    threading: [],
    warpColors: [],
    weftColors: [],
    tieup: [],
    shaftCount: 4,
    treadleCount: 4,
    warpCount: 30,
    pickCount: 30,
    yarn: [
      {
        name: 'White yarn',
        color: { r: 1.0, g: 1.0, b: 1.0}
      },
      {
        name: 'Black yarn',
        color: { r: 0.0, g: 0.0, b: 0.0}
      }
    ]
  };

  for(let i = 0; i < draft.shaftCount; i++) {
    draft.tieup[i] = [];
    for(let j = 0; j < draft.shaftCount; j++) {
      draft.tieup[i][j] = 0;
    }
  }

  for(let i = 0; i < draft.warpCount; i++) {
    draft.warpColors[i] = 0;
  }

  for(let i = 0; i < draft.pickCount; i++) {
    draft.weftColors[i] = 1;
  }
  */


  draft = JSON.parse("{\"treadling\":[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3,2,1],\"threading\":[3,2,1,0,1,2,3,2,1,0,1,2,3,2,3,0,3,2,3,2,1,0,1,2,3,2,1,0,1,2],\"warpColors\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"weftColors\":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],\"tieup\":[[1,0,0,1],[0,0,1,1],[0,1,1,0],[1,1,0,0]],\"shaftCount\":4,\"treadleCount\":4,\"warpCount\":30,\"pickCount\":30,\"yarn\":[{\"name\":\"White yarn\",\"color\":{\"r\":1,\"g\":1,\"b\":1}},{\"name\":\"Black yarn\",\"color\":{\"r\":0,\"g\":0,\"b\":0}}]}");
}

const store = writable(draft);
export default store;

let d;
store.subscribe(value => {
  window.data = value;
  d = value;
  localStorage.setItem('draft', JSON.stringify(value));
});

//window.draft = draft;
window.saveDraft = function() {
  localStorage.setItem('draft', JSON.stringify(d));
}

window.drop = function() {
  localStorage.removeItem('draft');
}
