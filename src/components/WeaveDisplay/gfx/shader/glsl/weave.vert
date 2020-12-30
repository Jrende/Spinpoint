attribute vec2 aVertexPosition;
attribute vec2 aVertexUV;
varying vec2 uv;
uniform mat4 mvp;
void main(void) {
  uv = aVertexUV;
  gl_Position = mvp * vec4(vec3(aVertexPosition, 0.0), 1.0);
}
