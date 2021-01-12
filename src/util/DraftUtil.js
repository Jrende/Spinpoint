import { fromJS } from 'immutable';
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
        if(draft.getIn(['tieup', i]) !== undefined && draft.getIn(['tieup', i, j]) !== undefined) {
          tieup[i][j] = draft.get(['tieup', i, j]);
        } else {
          tieup[i][j] = 0;
        }
      }
    }

    return draft.withMutations((d) => {
      d.set('shaftCount', shaftCount);
      d.set('treadleCount', treadleCount);
      d.set('tieup', fromJS(tieup));
      return d;
    });
  }

  updateWarpCount(draft, warpCount) {
    let amountToAdd = warpCount - draft.get('warpCount');
    if(amountToAdd === 0) {
      return draft;
    }
    return draft.withMutations((d) => {
      d.set('warpCount', warpCount);
      let warpColors = this.changeArraySize(d.get('warpColors'), amountToAdd);
      d.set('warpColors', warpColors);
      let threading = this.changeArraySize(d.get('threading'), amountToAdd);
      d.set('threading', threading);
    });
  }

  updatePickCount(draft, pickCount) {
    let amountToAdd = pickCount - draft.get('pickCount');
    if(amountToAdd === 0) {
      return draft;
    }

    return draft.withMutations((d) => {
      d.set('pickCount', pickCount);
      let weftColors = this.changeArraySize(d.get('weftColors'), amountToAdd);
      d.set('weftColors', weftColors);
    });
  }

  applyPattern(draft, pattern, warpOrWeft, mirroredRepeat) {
    let newDraft = draft.toJS();
    let length = warpOrWeft === 'warp' ? newDraft.warpCount : newDraft.pickCount;

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

    return fromJS(newDraft);
  }

  changeArraySize(array, amountToAdd, defaultValue = 0) {
    let newArray = array.withMutations(wc => {
      if(amountToAdd > 0) {
        for(let i = 0; i < amountToAdd; i++) {
          wc.push(defaultValue);
        }
      } else {
        wc = wc.splice(wc.size - amountToAdd);
      }
    });
    return newArray;
  }
}

export default new DraftUtil();
