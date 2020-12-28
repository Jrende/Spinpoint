precision highp float;
uniform vec4 color;
uniform sampler2D warpSampler;
uniform float warpCount;
uniform sampler2D weftSampler;
uniform float weftCount;
uniform sampler2D heddlePerWarp;
uniform sampler2D pedalPerPick;
uniform sampler2D tieup;
uniform sampler2D treadlingAbsence;
uniform sampler2D threadingAbsence;

uniform float squareSize;
uniform float borderSize;
uniform float width;
uniform float height;
varying vec2 uv;

void main(void) {
  float tileX = (uv.s * width) / (squareSize - borderSize / 4.0) / warpCount;
  float tileY = (uv.t * height) / (squareSize - borderSize / 2.0) / weftCount;

  float heddle = texture2D(heddlePerWarp, vec2(tileX, 0.0)).r;
  float pedal = texture2D(pedalPerPick, vec2(tileY, 0.0)).r;

  vec4 warpColor = texture2D(warpSampler, vec2(tileX, 0.0));
  vec4 weftColor = texture2D(weftSampler, vec2(tileY, 0.0));

  float tieupValue = texture2D(tieup, vec2(heddle + 0.1, pedal + 0.1)).r;
  vec3 color = mix(warpColor, weftColor, tieupValue).rgb;
  float absence = texture2D(threadingAbsence, vec2(tileX, 0.0)).r * texture2D(treadlingAbsence, vec2(tileY, 0.0)).r;
  color = mix(color, vec3(1.0, 1.0, 1.0), 1.0 - absence);
  gl_FragColor = vec4(color, 1.0);
}
