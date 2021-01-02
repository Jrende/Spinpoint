import { vec2 } from 'gl-matrix';

export function getAngle(v1, v2) {
  let v1n = vec2.normalize(vec2.create(), v1);
  let v2n = vec2.normalize(vec2.create(), v2);
  let dot = vec2.dot(v1n, v2n);
  let det = v1n[0]*v2n[1] - v1n[1]*v2n[0];
  let rad = Math.atan2(det, dot);
  if(rad < 0) {
    rad += 2*Math.PI;
  }
  return rad;
}

