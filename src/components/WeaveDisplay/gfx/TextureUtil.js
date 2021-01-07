import Texture from './Texture';
export function create1DGridTexture(gl, data, shafts, length) {
  let gridTexture = new Uint8Array(length * 4);
  gridTexture.fill(0);
  for(let i = 0; i < data.length; i++) {
    let n = i * 4;
    let value = (data[i] / shafts) * 255;
    let absence = 255;
    if(data[i] === null || data[i] === undefined) {
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
  for(let i = 0; i < data.length; i++) {
    for(let j = 0; j < data[0].length; j++) {
      if(data[i][j] === 1) {
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

export function createColorTexture(gl, colors, yarns) {
  let array = colors.map(i => {
    let c = yarns[i].color;
    // not rgba??
    return [c.r, c.g, c.b];
  });
  array.push([0, 0, 0]);
  return new Texture(
    gl,
    colors.length,
    1,
    array
  );
}
