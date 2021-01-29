precision highp float;

uniform sampler2D cellToggleSampler;

uniform vec2 cellSize;
uniform vec2 scrollPos;

varying vec2 uv;

const float gap = 0.04;
const float cellMargin = 0.09;

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
  vec3 color = vec3(1.0, 1.0, 1.0);
  float x = uv.s;
  float y = uv.t;
  float toggleValue = texture2D(cellToggleSampler, vec2(uv)).r;

  float border = getBorder(x, y, gap);
  vec3 fill = mix(
      vec3(0.0, 0.0, 0.0),
      vec3(1.0, 1.0, 1.0),
      1.0 - getBorder(x, y, cellMargin) * toggleValue);
  gl_FragColor = vec4(fill * border, 1.0);
}
