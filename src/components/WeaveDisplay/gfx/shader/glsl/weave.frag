precision highp float;

uniform sampler2D warpSampler;
uniform sampler2D weftSampler;
uniform sampler2D threading;
uniform sampler2D treadling;
uniform sampler2D tieup;

uniform vec2 cellSize;
uniform vec2 pos;

varying vec2 uv;

const float gap = 0.07;

float getBorder(float x, float y, float tieupValue) {
  vec2 b = vec2(
      (mod(x, cellSize.x) / cellSize.x),
      (mod(y, cellSize.y) / cellSize.y));

  vec2 bv = 1.0 - vec2(
      b.x * (1.0 - b.x),
      b.y * (1.0 - b.y)
      );

  float f =
    step(1.0 - gap, bv.x) * (1.0 - tieupValue) +
    step(1.0 - gap, bv.y) * tieupValue;

  return 1.0 - f;
}

void main(void) {
  float x = uv.s + pos.x;
  float y = uv.t + pos.y;
  if(x > 1.0 || y > 1.0) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    vec2 heddle = texture2D(threading, vec2(x, 0.0)).rg;
    vec2 pedal = texture2D(treadling, vec2(y, 0.0)).rg;

    vec4 warpColor = texture2D(warpSampler, vec2(x, 0.0));
    vec4 weftColor = texture2D(weftSampler, vec2(y, 0.0));

    float tieupValue = texture2D(tieup, vec2(heddle.r + 0.1, pedal.r + 0.1)).r;

    vec3 color = mix(warpColor, weftColor, tieupValue).rgb;
    float absence = heddle.g * pedal.g;
    color = mix(color, vec3(1.0, 1.0, 1.0), 1.0 - absence);

    color *= getBorder(x, y, tieupValue) * absence;
    gl_FragColor = vec4(color, 1.0);
  }
}
