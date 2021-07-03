precision highp float;

uniform sampler2D colorSampler;

uniform vec2 cellSize;
uniform vec2 scrollPos;
uniform float vert;
uniform float steps;

varying vec2 uv;

const float gap = 0.04;
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

float getSteps(float x, float y) {
  float horiz = 1.0 - vert;

  float margin = 0.012;
  vec2 b = vec2(
      (mod(x, cellSize.x * steps) / (cellSize.x * steps)),
      (mod(y, cellSize.y * steps) / (cellSize.y * steps)));

  vec2 bv = 1.0 - vec2(
      b.x * (1.0 - b.x),
      b.y * (1.0 - b.y)
      );

  float f = step(1.0 - margin, bv.x) * horiz + step(1.0 - margin, bv.y) * vert;

  return 1.0 - f;
}

void main(void) {
  float x = uv.s + scrollPos.x;
  float y = uv.t + scrollPos.y;
  if(x > 1.0 || y > 1.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    float horiz = 1.0 - vert;
    vec3 cellColor = texture2D(
        colorSampler,
        vec2(
          x * horiz,
          y * vert
          )
        ).rgb;
    float border = getBorder(x, y, gap) * getSteps(x, y);
    vec3 fill = mix(
        cellColor,
        vec3(1.0, 1.0, 1.0),
        1.0 - getBorder(x, y, cellMargin));
    float overflow = step(x, 1.0) * step(y, 1.0);
    gl_FragColor = vec4((fill * border) * overflow, 1.0);
  }
}
