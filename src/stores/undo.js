let changes = [];
let currentIndex = -1;
export function undo() {
  if (currentIndex < 0) {
    return undefined;
  }
  let changeSet = changes[currentIndex].inversePatches;
  currentIndex = Math.max(currentIndex - 1, 0);
  return changeSet;
}

export function redo() {
  if (currentIndex >= changes.length) {
    return undefined;
  }
  let changeSet = changes[currentIndex].patches;
  currentIndex = Math.min(currentIndex + 1, changes.length - 1);
  return changeSet;
}

export function push(changeSet) {
  if (currentIndex < changes.length) {
    changes.length = currentIndex + 1;
  }
  changes.push(changeSet);
  currentIndex++;
}
