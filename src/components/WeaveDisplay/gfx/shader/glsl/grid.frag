precision highp float;

uniform sampler2D cellToggleSampler;
uniform vec2 cellSize;
uniform vec2 scrollPos;
uniform float vert;
uniform float gap;

varying vec2 uv;

const float cellMargin = 0.15;

float getBorder(float x, float y, float margin) {
  vec2 b = vec2(
      (mod(x, cellSize.x) / cellSize.x),
      (mod(y, cellSize.y) / cellSize.y));

  vec2 bv = 1.0 - vec2(
      b.x * (1.0 - b.x),
      b.y * (1.0 - b.y)
      );

  float f = step(1.0 - margin, bv.x) + step(1.0 - margin, bv.y);

  return 1.0 - f;
}

void main(void) {
  float x = uv.s + scrollPos.x;
  float y = uv.t + scrollPos.y;
  float horiz = 1.0 - vert;

  vec2 tv = texture2D(cellToggleSampler, vec2(x * horiz + y * vert, 0)).rg;
  float toggleValue = tv.r + tv.g - 1.0;

  float border = getBorder(x, y, gap);
  float squareBorder = 1.0 - getBorder(x, y, cellMargin);

  float nx = x * vert + y * horiz;
  float cellSizeF = cellSize.x * vert + cellSize.y * horiz;
  float square = 1.0 - step(toggleValue, nx) * (1.0 - step(toggleValue, nx - cellSizeF));

  float v = (square + squareBorder) * border;
  float overflow = step(x, 1.0) * step(y, 1.0);
  v = mix(1.0, v, overflow);
  gl_FragColor = vec4(vec3(v), 1.0);
}
