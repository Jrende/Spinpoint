precision highp float;
uniform vec4 color;
uniform sampler2D warpSampler;
uniform sampler2D weftSampler;
uniform sampler2D threading;
uniform sampler2D treadling;
uniform sampler2D tieup;

varying vec2 uv;

void main(void) {
  float x = uv.s;
  float y = uv.t;

  vec2 heddle = texture2D(threading, vec2(x, 0.0)).rg;
  vec2 pedal = texture2D(treadling, vec2(y, 0.0)).rg;

  vec4 warpColor = texture2D(warpSampler, vec2(x, 0.0));
  vec4 weftColor = texture2D(weftSampler, vec2(y, 0.0));

  float tieupValue = texture2D(tieup, vec2(heddle.r + 0.1, pedal.r + 0.1)).r;
  vec3 color = mix(warpColor, weftColor, tieupValue).rgb;
  float absence = heddle.g * pedal.g;
  color = mix(color, vec3(1.0, 1.0, 1.0), 1.0 - absence);
  gl_FragColor = vec4(color, 1.0);
}
