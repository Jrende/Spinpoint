precision highp float;
uniform vec4 color;
void main(void) {
  vec3 outColor = color.rgb * color.a;
  gl_FragColor = vec4(vec3(outColor), color.a);
}
