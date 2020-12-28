export default class Texture {
  constructor(gl, width, height, data) {
    this.gl = gl;
    this.width = width;
    this.height = height;


    if (data instanceof Uint8Array) {
      this.color = data;
    } else {
      this.color = new Uint8Array(data.length * 4);
      for(let i = 0; i < data.length; i++) {
        let d = data[i];
        let n = i * 4;
        this.color[n + 0] = d[0] * 255;
        this.color[n + 1] = d[1] * 255;
        this.color[n + 2] = d[2] * 255;
        this.color[n + 3] = d[3] * 255;
      }
    }

    this.compile(this.gl);
  }

  compile() {
    this.texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.width,
      this.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.color);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  bind(unit) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  /*
  setColor(color) {
    this.color = new Uint8Array([
      color[0] * 255,
      color[1] * 255,
      color[2] * 255,
      color[3] * 255
    ]);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texSubImage2D(this.gl.TEXTURE_2D,
      0,
      0,
      0,
      1,
      1,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.color);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
  */

  unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
}
