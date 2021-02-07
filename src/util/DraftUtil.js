import { fromJS } from 'immutable';
class DraftUtil {
  constructor() {
  }

  updateShaftOrTreadleCounts(draft, shaftCount, treadleCount) {
    let tieup = new Array(shaftCount);
    for(let i = 0; i < shaftCount; i++) {
      tieup[i] = new Array(treadleCount);
    }

    for(let i = 0; i < shaftCount; i++) {
      for(let j = 0; j < treadleCount; j++) {
        if(draft.getIn(['tieup', i]) !== undefined && draft.getIn(['tieup', i, j]) !== undefined) {
          tieup[i][j] = draft.getIn(['tieup', i, j]);
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

    let array = new Array(length);
    let p = [...pattern];
    if(warpOrWeft === 'warp') {
      p.reverse();
    }

    let offset = 0;
    for(let i = 0; i < length; i++) {
      if(mirroredRepeat && (i !== 0 && (i % (p.length - 1)) === 0)) {
        offset += 1;
      }
      let j = i + offset;
      let v = j % (p.length);
      if(mirroredRepeat && (Math.floor(j / p.length) % 2) === 1) {
        v = p.length - (j % p.length) - 1;
      }
      array[i] = p[v];
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

  applyColor(draft, colors, warpOrWeft) {
    let newColors = [];
    let count;
    if(warpOrWeft === 'warp') {
      count = draft.get('warpCount');
    } else if(warpOrWeft === 'weft') {
      count = draft.get('pickCount');
    }

    for(let i = 0; i < count; i++) {
      newColors[i] = colors[i % colors.length];
    }

    if(warpOrWeft === 'warp') {
      return draft.set('warpColors', fromJS(newColors));
    } else if(warpOrWeft === 'weft') {
      return draft.set('weftColors', fromJS(newColors));
    }
  }

}

export default new DraftUtil();
