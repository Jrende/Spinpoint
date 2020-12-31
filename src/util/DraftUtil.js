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

}

export default new DraftUtil();
