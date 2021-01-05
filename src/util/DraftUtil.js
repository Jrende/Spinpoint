class DraftUtil {
  constructor() {
  }

  updateShaftOrTreadleCounts(draft, shaftCount, treadleCount) {
    let tieup = new Array(treadleCount);
    for(let i = 0; i < treadleCount; i++) {
      tieup[i] = new Array(shaftCount);
    }

    for(let i = 0; i < treadleCount; i++) {
      for(let j = 0; j < shaftCount; j++) {
        if(draft.tieup[i] !== undefined && draft.tieup[i][j] !== undefined) {
          tieup[i][j] = draft.tieup[i][j];
        } else {
          tieup[i][j] = 0;
        }
      }
    }
    return {
      ...draft,
      shaftCount,
      treadleCount,
      tieup
    }
  }

  updateWarpCount(draft, warpCount) {
    let warpColors = new Array(warpCount);
    for(let i = 0; i < warpCount; i++) {
      let v = 0;
      if(draft.warpColors[i] !== undefined) {
        v = draft.warpColors[i];
      }
      warpColors[i] = v;
    }
    return {
      ...draft,
      warpCount,
      warpColors
    }
  }

  updatePickCount(draft, pickCount) {
    let weftColors = new Array(pickCount);
    for(let i = 0; i < pickCount; i++) {
      let v = 0;
      if(draft.weftColors[i] !== undefined) {
        v = draft.weftColors[i];
      }
      weftColors[i] = v;
    }
    return {
      ...draft,
      pickCount,
      weftColors
    }
  }

  applyPattern(draft, pattern, warpOrWeft, mirroredRepeat) {
    let newDraft = {...draft}
    let length = warpOrWeft === 'warp' ? draft.warpCount : draft.pickCount;

    if(warpOrWeft === 'warp') {
      pattern.reverse();
    }
    let array = new Array(length);
    let offset = 0;
    for(let i = 0; i < length; i++) {
      if(mirroredRepeat && (i !== 0 && (i % (pattern.length - 1)) === 0)) {
        offset += 1;
      }
      let j = i + offset;
      let v = j % (pattern.length);
      if(mirroredRepeat && (Math.floor(j / pattern.length) % 2) === 1) {
        v = pattern.length - (j % pattern.length) - 1;
      }
      array[i] = pattern[v];
    }

    if(warpOrWeft === 'warp') {
      newDraft.threading = array;
    } else {
      newDraft.treadling = array;
    }

    return newDraft;
  }
}

export default new DraftUtil();
