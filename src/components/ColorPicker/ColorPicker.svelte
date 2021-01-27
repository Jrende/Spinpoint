<script context="module">
  import { mat4, vec2, vec3, quat } from 'gl-matrix';
  import tinycolor from 'tinycolor2';

  import { getAngle } from './util';
  import colorWheelVert from './colorWheel.vert';
  import colorWheelFrag from './colorWheel.frag';
  import satValVert from './satVal.vert';
  import satValFrag from './satVal.frag';
  import solidFrag from './solid.frag';
  import solidVert from './solid.vert';
  import VertexArray from '../WeaveDisplay/gfx/VertexArray';
  import Shader from '../WeaveDisplay/gfx/shader/Shader';
  import Ring from './Ring';

  let canvas = document.createElement("canvas");
  let root = document.body;
  canvas.setAttribute('class', 'color-input-canvas');
  canvas.width = 256;
  canvas.height = 256;
  let gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    preserveDrawingBuffer: true
  });
  gl.clearColor(0, 0, 0, 1.0);

  let listener;
  let state = {};
  let mouseDown = false;
  let colorWheelToggle = false;
  let triangleToggle = false;

  let colorWheelShader = new Shader({ frag: colorWheelFrag, vert: colorWheelVert });
  colorWheelShader.compile(gl);
  let satValShader = new Shader({ frag: satValFrag, vert: satValVert });
  satValShader.compile(gl);
  let solidShader = new Shader({ frag: solidFrag, vert: solidVert });
  solidShader.compile(gl);
  
  let quad = new VertexArray(
    gl,
    [
      1, 1,
      -1, 1,
      -1, -1,
      1, -1
    ],
    [1, 0, 2,
      2, 0, 3],
    [2]
  );
  let t = [
    [0, 1.0],
    [0.8660253882408142, -0.5],
    [-0.8660253882408142, -0.5]
  ];
  let triP = t;
  let triPT = [
    vec2.create(),
    vec2.create(),
    vec2.create()
  ];
  let uv = [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0],
  ];
  let triUV = uv;
  let triangle = new VertexArray(
    gl,
    [
      t[0][0], t[0][1], uv[0][0], uv[0][1], uv[0][2],
      t[1][0], t[1][1], uv[1][0], uv[1][1], uv[1][2],
      t[2][0], t[2][1], uv[2][0], uv[2][1], uv[2][2],
    ],
    [1, 0, 2],
    [2, 3]
  );
  let ring = new Ring(gl, 24, 0.6);
  let triangleModel = mat4.create();


  function onHexInputChange(event) {
    let str = event.target.value;
    let color = tinycolor(`#${str}`);
    if(str.length === 6 && color.isValid()) {
      let hsv = color.toHsv();
      updateColor(
        hsv.h / 360,
        hsv.s,
        hsv.v
      );
    }
  }

  function onCanvasMouseDown(event) {
    event.preventDefault();
    root.addEventListener('mousemove', onCanvasMouseMove);
    mouseDown = true;
    let rect = canvas.getBoundingClientRect();
    let coords = [
      2.0 * ((event.clientX - rect.x) / rect.width - 0.5),
      2.0 * (-(event.clientY - rect.y) / rect.height + 0.5)
    ];
    let { hue, saturation, value } = handleInput(coords);
    updateColor(hue, saturation, value);
  }


  function onCanvasMouseMove(event) {
    event.preventDefault();
    if(mouseDown === true && event.buttons === 0) {
      mouseDown = false;
      colorWheelToggle = false;
      triangleToggle = false;
      root.removeEventListener('mousemove', onCanvasMouseMove);
      return;
    }
    if(mouseDown) {
      let rect = canvas.getBoundingClientRect();
      let coords = [
        2.0 * ((event.clientX - rect.x) / rect.width - 0.5),
        2.0 * (-(event.clientY - rect.y) / rect.height + 0.5)
      ];
      let { hue, saturation, value } = handleInput(coords);
      updateColor(hue, saturation, value);
    }
  }

  function onCanvasMouseUp(event) {
    event.preventDefault();
    root.removeEventListener('mousemove', onCanvasMouseMove);
    mouseDown = false;
    colorWheelToggle = false;
    triangleToggle = false;
  }

  function handleInput(coords) {
    let { hue, saturation, value } = state;
    let positionInWheel = getPositionInWheel(coords);
    if(positionInWheel !== undefined) {
      hue = positionInWheel;
      colorWheelToggle = true;
    }
    let positionInTriangle = getPositionInTriangle(coords);
    if (positionInTriangle !== undefined) {
      let pos = positionInTriangle;
      if(pos.w + pos.v > 1.0 || pos.v < 0 || pos.w < 0) {
        pos = getClosestPointToTriangle(pos, coords);
      }

      value = Math.max(0, Math.min(1.0, 1.0 - pos.w));
      saturation = Math.max(0, Math.min(1.0, pos.u / value));
      // Still some weirdness when value is around zero
      if(Number.isNaN(saturation)) {
        saturation = 0.0;
      }
      triangleToggle = true;
    }
    return { hue, saturation, value };
  }

  function updateColor(hue, saturation, value, fireEvent = true) {
    let newColor = tinycolor.fromRatio({
      h: hue,
      s: saturation,
      v: value
    });
    setState({
      hue,
      saturation,
      value,
    });
    let rgb = newColor.toRgb();
    let ratio = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
      a: rgb.a
    };

    if(fireEvent) {
      emit(ratio);
    }
  }

  function getPositionInTriangle(coord) {
    let a = triPT[0];

    let b = vec2.sub(vec2.create(), triPT[1], a);
    let c = vec2.sub(vec2.create(), triPT[2], a);
    let p = vec2.sub(vec2.create(), coord, a);

    let d = b[0]*c[1] - c[0]*b[1];
    let u = (p[0]*(b[1]-c[1]) + p[1]*(c[0]-b[0]) + b[0]*c[1] - c[0]*b[1])/d;
    let v = (p[0]*c[1] - p[1]*c[0])/d;
    let w = (p[1]*b[0]-p[0]*b[1])/d;

    if(!colorWheelToggle && (triangleToggle || (u > 0.0 && u < 1.0 &&
      v > 0.0 && v < 1.0 &&
      w > 0.0 && w < 1.0))) {
      return {
        u, v, w
      };
    }
    return undefined;
  }

  function getTriangleCoordinateFromColor(color) {
    let v = 1.0 - color.value;
    let s = (1.0 - color.saturation) * color.value;

    let a = triPT[0];
    let b = triPT[1];
    let c = triPT[2];

    let v1 = vec2.sub(vec2.create(), b, a);
    let v2 = vec2.sub(vec2.create(), c, a);

    let r1 = vec2.mul(vec2.create(), v1, [s, s]);
    let r2 = vec2.mul(vec2.create(), v2, [v, v]);
    let res = vec2.add(vec2.create(), r1, r2);
    vec2.add(res, res, a);
    return res;
  }

  function getClosestPointToTriangle(pos, coords) {
    let from;
    let to;
    if(pos.w + pos.v > 1.0) {
      from = triPT[1];
      to = triPT[2];
    } else if(pos.v < 0) {
      from = triPT[0];
      to = triPT[2];
    } else if(pos.w < 0) {
      from = triPT[0];
      to = triPT[1];
    }
    let line = vec2.sub(vec2.create(), from, to);
    let len = vec2.len(line);

    vec2.normalize(line, line);

    let v = vec2.sub(vec2.create(), coords, to);
    let d = vec2.dot(v, line);
    d = Math.max(0, Math.min(len, d));
    let res = vec2.scaleAndAdd(vec2.create(), to, line, d);
    return getPositionInTriangle(res);
  }

  function getPositionInWheel(p) {
    let center = [0, 0];
    let dist = vec2.distance(p, center);
    if(!triangleToggle && (colorWheelToggle || dist > 0.8 && dist < 1.0)) {
      return getAngle([1, 0], p) / (2.0 * Math.PI);
    }
    return undefined;
  }

  function render() {
    let color = tinycolor.fromRatio({
      h: state.hue,
      s: state.saturation,
      v: state.value
    });

    gl.clear(gl.COLOR_BUFFER_BIT);
    quad.bind();

    let resolution = [
      canvas.getAttribute('width'),
      canvas.getAttribute('height')
    ];
    colorWheelShader.bind();
    colorWheelShader.setVec2('resolution', resolution);
    quad.draw();
    quad.unbind();
    colorWheelShader.unbind();

    satValShader.bind();
    triangle.bind();

    triangleModel = mat4.create();
    let rot = state.hue * Math.PI * 2.0 - Math.PI/2.0;
    let hueRot = quat.setAxisAngle(
      quat.create(),
      [0, 0, 1],
      rot
    );
    mat4.fromRotationTranslationScale(
      triangleModel,
      hueRot,
      vec3.create(),
      [0.8, 0.8, 0.8]
    );
    vec2.transformMat4(triPT[0], triP[0], triangleModel);
    vec2.transformMat4(triPT[1], triP[1], triangleModel);
    vec2.transformMat4(triPT[2], triP[2], triangleModel);

    let mvp2 = mat4.create();
    mat4.translate(mvp2, mvp2, [0.5, 0.5, 0.0]);
    mat4.rotate(mvp2, mvp2, rot, [0, 0, 1.0]);
    mat4.scale(mvp2, mvp2, [0.8, 0.8, 0.8]);

    satValShader.setMat4('mvp', triangleModel);
    satValShader.setFloat('hue', state.hue);
    triangle.draw();
    triangle.unbind();
    satValShader.unbind();

    solidShader.bind();
    ring.bind();
    let pos = getTriangleCoordinateFromColor(state);
    let svMarkerColor = color.isLight()? [0.0, 0.0, 0.0, 1.0] : [1.0, 1.0, 1.0, 1.0];

    solidShader.setVec4('color', svMarkerColor);
    solidShader.setMat4('mvp', mat4.fromRotationTranslationScale(
      mat4.create(),
      quat.create(),
      [pos[0], pos[1], 0],
      [0.03, 0.03, 1.0])
    );

    ring.draw();
    ring.unbind();

    let hue = tinycolor.fromRatio({
      h: state.hue,
      s: 1.0,
      v: 1.0
    });
    let hueMarkerColor = hue.isLight()? [0.0, 0.0, 0.0, 1.0] : [1.0, 1.0, 1.0, 1.0];
    let hueMarkerMatrix = mat4.create();
    let quatMat = mat4.fromQuat(mat4.create(), hueRot);
    mat4.multiply(hueMarkerMatrix, hueMarkerMatrix, quatMat);
    mat4.translate(hueMarkerMatrix, hueMarkerMatrix, [0, 0.9, 0]);
    mat4.scale(hueMarkerMatrix, hueMarkerMatrix, [0.015, 0.1, 1.0]);
    quad.bind();
    solidShader.setVec4('color', hueMarkerColor);
    solidShader.setMat4('mvp', hueMarkerMatrix);
    quad.draw();
    quad.unbind();
    solidShader.unbind();
  }

  function setColor(color) {
    let c = tinycolor.fromRatio(color);
    let hsv = c.toHsv();
    updateColor(
      hsv.h / 360,
      hsv.s,
      hsv.v,
      false
    );
  }

  function emit(color) {
    listener(color);
  }

  function setState(newState) {
    state = newState;
    render();
  }

    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mouseup', onCanvasMouseUp);

</script>
<script>
  import { onMount,onDestroy } from 'svelte';
  export let value;
  export let onChange = () => {};
  export let onBlur = () => {};
  export let x;
  export let y;

  let realX;
  let realY;
  $: {
    if(elm !== undefined) {
      let rect = elm.parentElement.getBoundingClientRect();
      if((x + rect.width) > window.innerWidth) {
        realX = x - rect.width - 10;
      } else {
        realX = x - rect.width / 2.0;
      }
      if((y + rect.height) > window.innerHeight) {
        realY = y - rect.height - 10;
      } else {
        realY = y;
      }
    }
  }

  let elm;
  let beforeElm;

  let color = tinycolor.fromRatio(value);
  let hsv = color.toHsv();
  let hexString = color.toHex();
  let state = {
    hue: hsv.h / 360,
    value: hsv.v,
    saturation: hsv.s,
  };
  let c2;

  setState(state);

  function canvasColorChange(inColor) {
    color = tinycolor.fromRatio(inColor);
    hexString = color.toHex();
    onChange(inColor);
  }

  onMount(() => {
    elm.insertBefore(canvas, beforeElm);
    listener = canvasColorChange;
    render(state);
  });

  function bodyMouseMove(event) {
    let rect = elm.getBoundingClientRect();
    let centerX = rect.x + (rect.width / 2);
    let centerY = rect.y + (rect.height / 2);
    let distToCenter = vec2.sub(vec2.create(), [event.clientX, event.clientY], [centerX, centerY]);
    if(Math.abs(distToCenter[0]) > 220 || Math.abs(distToCenter[1]) > 220) {
      onBlur();
    }
  }

  function bodyMouseDown(event) {
    let container = elm.parentElement;
    if(!container.contains(event.target)) {
      onBlur();
    }
  }

</script>
<svelte:body on:mousemove={bodyMouseMove} on:mousedown={bodyMouseDown} />
<div class="color-picker-container" style={`left: ${realX}px; top: ${realY}px`}>
  <div class="color-picker" bind:this={elm}>
    <div
      bind:this={beforeElm}
      class="color-input-color"
      style="{`background-color: #${hexString}`}"
      >
      <input
        type="text"
        spellCheck="false"
        maxLength="6"
        style={`color: ${(color.isLight() ? 'black' : 'white')}`}
        value={hexString}
        on:input={onHexInputChange}
        on:paste={onHexInputChange}
        />
    </div>
  </div>
</div>
<style>
  :global(.color-input-canvas) {
    margin: auto;
    display: flex;
  }

  .color-picker .color-input-color {
    margin: 0.2em;
    margin-top: 0.5em;
    border-radius: 4px;
  }

  .color-picker .color-input-color input {
    background: none;
    width: 100%;
    text-align: center;
    font-size: 14pt;
    margin: 0;
  }

  .color-picker-container {
    position: absolute;
    padding: 12px;
    background-color: var(--color-2);
    border: 1px solid var(--color-4);
  }

</style>
