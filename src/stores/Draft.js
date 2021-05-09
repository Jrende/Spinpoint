import { writable } from 'svelte/store';
import { produce, applyPatches } from 'immer';
import * as undo from './undo';

let draft = {};
if (window.localStorage.getItem('draft')) {
  draft = JSON.parse(localStorage.getItem('draft'));
} else {
  draft = {
    treadling: [],
    threading: [],
    warpColors: new Array(30).fill(1),
    weftColors: new Array(30).fill(0),
    tieup: [
      [1, 0, 0, 1, 0, 1],
      [0, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 0, 1],
      [1, 1, 0, 0, 1, 0],
    ],
    shaftCount: 4,
    treadleCount: 6,
    warpCount: 30,
    pickCount: 30,
    yarn: [
      {
        name: 'White yarn',
        color: { r: 0.8, g: 0.8, b: 0.8 },
      },
      {
        name: 'Black yarn',
        color: { r: 0.7, g: 0.0, b: 0.0 },
      },
    ],
  };

  for (let i = 0; i < draft.warpCount; i++) {
    draft.threading.push(i % 4);
  }

  for (let i = 0; i < draft.pickCount; i++) {
    draft.treadling.push(i % 6);
  }
}

const store = writable(draft);
export default {
  draft: store,
  update: function (func) {
    store.set(
      produce(draftSnapshot, func, (patches, inversePatches) => {
        undo.push({ patches, inversePatches });
      })
    );
  },
  subscribe: function (subscription) {
    return store.subscribe(subscription);
  },
};

let draftSnapshot;
store.subscribe((value) => {
  draftSnapshot = value;
  window.data = draftSnapshot;
  localStorage.setItem('draft', JSON.stringify(draftSnapshot));
});
window.update = function () {
  localStorage.setItem('draft', JSON.stringify(draftSnapshot));
};

window.drop = function () {
  localStorage.removeItem('draft');
};

document.body.addEventListener('keydown', (e) => {
  if (e.ctrlKey === true && e.key === 'z') {
    let changes = undo.undo();
    if (changes) {
      let newDraft = applyPatches(draftSnapshot, changes);
      store.set(newDraft);
    }
    //undo.redo();
  } else if (e.ctrlKey === true && e.key === 'y') {
    let changes = undo.redo();
    if (changes) {
      let newDraft = applyPatches(draftSnapshot, changes);
      store.set(newDraft);
    }
  }
});
