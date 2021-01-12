import Texture from './Texture';
export function create1DGridTexture(gl, data, shafts, length) {
  let gridTexture = new Uint8Array(length * 4);
  gridTexture.fill(0);
  for(let i = 0; i < length; i++) {
    let n = i * 4;
    let value = (data.get(i) / shafts) * 255;
    let absence = 255;
    if(data.get(i) === null || data.get(i) === undefined) {
      absence = 0;
    }
    gridTexture[n + 0] = value;
    gridTexture[n + 1] = absence;
    gridTexture[n + 2] = value;
    gridTexture[n + 3] = value;
  }
  return new Texture(gl, length, 1, gridTexture);
}


export function createGridTexture(gl, data, width, height) {
  let gridTexture = new Uint8Array(width * height * 4);
  gridTexture.fill(0);
  for(let i = 0; i < data.size; i++) {
    for(let j = 0; j < data.get(0).size; j++) {
      if(data.getIn([i, j]) === 1) {
        let n = (i + j*width) * 4;
        gridTexture[n + 0] = 255;
        gridTexture[n + 1] = 255;
        gridTexture[n + 2] = 255;
        gridTexture[n + 3] = 255;
      }
    }
  }
  return new Texture(gl, width, height, gridTexture);
}

export function createColorTexture(gl, colors, w, h, yarns) {
  let data = new Uint8Array(colors.size * 4);
  for(let i = 0; i < colors.size; i++) {
    let n = i * 4;
    let c = yarns.getIn([colors.get(i), 'color']).toJS();
    data[n + 0] = c.r * 255;
    data[n + 1] = c.g * 255;
    data[n + 2] = c.b * 255;
    data[n + 3] = 255;
  }
  return new Texture(
    gl,
    w,
    h,
    data
  );
}
