precision highp float;

uniform sampler2D warpSampler;
uniform sampler2D weftSampler;
uniform sampler2D threading;
uniform sampler2D treadling;
uniform sampler2D tieup;

uniform vec2 cellSize;
uniform vec2 scrollPos;
uniform float shaftCount;
uniform float treadleCount;

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
  float x = (uv.s + scrollPos.x);
  float y = (uv.t + scrollPos.y);

  vec2 shaft = texture2D(threading, vec2(x, 0.0)).rg;
  vec2 pedal = texture2D(treadling, vec2(y, 0.0)).rg;

  vec3 warpColor = texture2D(warpSampler, vec2(x, 0.0)).rgb;
  vec3 weftColor = texture2D(weftSampler, vec2(0.0, y)).rgb;

  vec2 off = vec2(
      1.0 / (treadleCount + 1.0),
      1.0 / (shaftCount + 1.0));
  float tieupValue = 1.0 - texture2D(tieup, vec2(pedal.r + off.x, shaft.r + off.y)).r;
  float absence = shaft.g * pedal.g;

  vec3 color = mix(warpColor, weftColor, tieupValue) * getBorder(x, y, tieupValue);

  color = mix(warpColor * getBorder(x, y, 0.0), color, pedal.g);
  color = mix(weftColor * getBorder(x, y, 1.0), color, shaft.g);

  float overflow = step(y, 1.0) * step(x, 1.0);
  color = mix(vec3(1.0, 1.0, 1.0), color.rgb, overflow);
  gl_FragColor = vec4(vec3(color), 1.0);
}
