import { camera, multiply3DMatrix, perspectiveProjection, rotatex, rotatey, rotatez, translate } from "./lib/Matrix/3DMatrix";
import { resizeCanvasToDisplaySize } from "./lib/WebGL/Canvas";
import { arrayToMatrix } from "./lib/Matrix/Matrix";
import { initShaderProgram } from "./lib/WebGL/Shader";
import { WebglInfos} from "./type";
import Shader from "./Shaders/Ft_scop";
import OBJHelper from "./lib/OBJ/OBJHelper";

const fov = 65;
let useTexture = 1;
let xAngle = 0;
let yAngle = 0;
let zAngle = 0;

function initWebGL(): WebglInfos | undefined {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl") as WebGLRenderingContext;
  
  if (!gl) return;

  resizeCanvasToDisplaySize(canvas);

  const program = initShaderProgram(gl, Shader.vs, Shader.fs) as WebGLProgram;
  const programInfos = {
    program: program,
    attrib: {
      position: gl.getAttribLocation(program, "a_position"),
      color: gl.getAttribLocation(program, "a_color"),
      textCoord: gl.getAttribLocation(program, "a_textcoord")
    },
    uniform: {
      projectionMatrix: gl.getUniformLocation(program, "u_projection"),
      o2wMatrix: gl.getUniformLocation(program, "u_object2world"),
      w2cMatrix: gl.getUniformLocation(program, "u_world2Camera"),
      useTexture: gl.getUniformLocation(program, "u_useTexture"),
    }
  };

  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE);
  return {
    gl, program, programInfos
  }
}

function initBuffers(gl: WebGLRenderingContext, obj: OBJHelper): any {
  const positions = gl.createBuffer() as WebGLBuffer;
  const colors = gl.createBuffer() as WebGLBuffer;
  const texture = gl.createBuffer() as WebGLBuffer;

  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.getPositions()), gl.STATIC_DRAW);

  
  gl.bindBuffer(gl.ARRAY_BUFFER, colors);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.getMaterials()), gl.STATIC_DRAW);

  
  gl.bindBuffer(gl.ARRAY_BUFFER, texture);
  console.log(new Float32Array(obj.getUvs()));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.getUvs()), gl.STATIC_DRAW);

  return {
    positions,
    colors,
    texture
  }
}

function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement) {
  const texture = gl.createTexture();
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //Permet de ne pas repeter la texture en cas de depassement
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  // gl.generateMipmap(gl.TEXTURE_2D);
}

export function drawObj(obj: OBJHelper, image: HTMLImageElement) {
  const { gl, program, programInfos } = initWebGL() as WebglInfos;
  const buffers = initBuffers(gl, obj);
  const renderLoop = (t: number) => {
    t /= 50;
    // xAngle = t * .85 ;
    yAngle = -t * 1.5;
    // xAngle = t * 1.1;
    
    drawScene(gl, program, programInfos, buffers, obj);
    requestAnimationFrame(renderLoop);
  }
  
  createTexture(gl, image);
  initListeners();
  requestAnimationFrame(renderLoop);
}

function initListeners() {
  document.addEventListener("keydown", (ev) => {
    switch (ev.key) {
      case "t":
        useTexture = useTexture === 1 ? 0 : 1;
        break;

      case "ArrowUp":
        xAngle += 5;
        break;

      case "ArrowDown":
        xAngle -= 5;
        break;
      
      case "ArrowRight":
        zAngle += 5;
        break;

      case "ArrowLeft":
        zAngle -= 5;
        break;
    }
    console.log(ev.key);
  })
}

function initializeCameraDistance(rSphere) {
  const distance = rSphere / Math.tan(Math.PI / 180 * fov / 2);
  
  return {
    matrix: multiply3DMatrix(translate(0, 0, -(distance*1.15)), camera()),
    distance
  };
}

function drawScene(gl: WebGLRenderingContext, program: WebGLProgram, programInfos, buffers, obj: OBJHelper) {
  const ar = gl.canvas.width / gl.canvas.height;
  const camera = initializeCameraDistance(obj.getBoundingSphereRadius());
  const world2Camera = arrayToMatrix(camera.matrix)?.inverse()?.toArray() as number[];
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
  gl.vertexAttribPointer(programInfos.attrib.position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfos.attrib.position);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
  gl.vertexAttribPointer(programInfos.attrib.color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfos.attrib.color);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
  gl.vertexAttribPointer(programInfos.attrib.textCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfos.attrib.textCoord);

  const [xCenter, yCenter, zCenter ] = obj.getCenter()
  let initialTranslation = translate(xCenter, yCenter, -zCenter);
  let rotation = rotatez(zAngle);
  rotation = multiply3DMatrix(rotation, rotatex(xAngle))
  rotation = multiply3DMatrix(rotation, rotatey(yAngle))

  const objectMatrix = multiply3DMatrix(rotation, initialTranslation)

  const matrix = perspectiveProjection(fov, ar, 0.01, camera.distance * 2.5);

  gl.uniformMatrix4fv(programInfos.uniform.projectionMatrix, false, matrix);
  gl.uniformMatrix4fv(programInfos.uniform.o2wMatrix, false, objectMatrix);
  gl.uniformMatrix4fv(programInfos.uniform.w2cMatrix, false, world2Camera);
  gl.uniform1i(programInfos.uniform.useTexture, useTexture);

  gl.drawArrays(gl.TRIANGLES, 0, obj.getPositions().length / 3);
}

