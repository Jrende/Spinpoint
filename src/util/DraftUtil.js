class DraftUtil {
  constructor() {}

  updateShaftCount(draft, shaftCount) {
    draft.tieup.length = shaftCount;
  }

  updateTreadleCount(draft, treadleCount) {
    draft.tieup.forEach((t) => (t.length = treadleCount));
  }

  updateWarpCount(draft, warpCount) {
    let amountToAdd = warpCount - draft.warpCount;
    if (amountToAdd === 0) {
      return draft;
    }
    draft.warpCount = warpCount;
    this.changeArraySize(draft.warpColors, amountToAdd);
    this.changeArraySize(draft.threading, amountToAdd);
  }

  updatePickCount(draft, pickCount) {
    let amountToAdd = pickCount - draft.pickCount;
    if (amountToAdd === 0) {
      return draft;
    }

    draft.pickCount = pickCount;
    this.changeArraySize(draft.weftColors, amountToAdd);
    this.changeArraySize(draft.treadling, amountToAdd);
  }

  applyPattern(
    draft,
    pattern,
    warpOrWeft,
    mirroredRepeat,
    start = 0,
    length = warpOrWeft === 'warp' ? draft.warpCount : draft.pickCount
  ) {
    let array = draft[warpOrWeft === 'warp' ? 'threading' : 'treadling'];

    let offset = 0;
    for (let i = start; i < length; i++) {
      if (mirroredRepeat && i !== 0 && i % (pattern.length - 1) === 0) {
        offset += 1;
      }
      let j = i + offset;
      let v = j % pattern.length;
      if (mirroredRepeat && Math.floor(j / pattern.length) % 2 === 1) {
        v = pattern.length - (j % pattern.length) - 1;
      }
      array[i] = pattern[v];
    }
  }

  changeArraySize(array, amountToAdd, defaultValue = 0) {
    if (amountToAdd > 0) {
      for (let i = 0; i < amountToAdd; i++) {
        array.push(defaultValue);
      }
    } else {
      array.splice(array.size - amountToAdd);
    }
  }

  applyColor(
    draft,
    colors,
    warpOrWeft,
    start = 0,
    length = warpOrWeft === 'warp' ? draft.warpCount : draft.pickCount
  ) {
    let newColors = draft[warpOrWeft === 'warp' ? 'warpColors' : 'weftColors'];
    for (let i = start; i < length; i++) {
      newColors[i] = colors[i % colors.length];
    }
  }
}

export default new DraftUtil();
