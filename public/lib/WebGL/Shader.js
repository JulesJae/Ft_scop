/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {*} type 
 * @param {*} source 
 */
export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  console.log(`shader source = ${source}`);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occured compuling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader();
    return null;
  }
  return shader;
}

/**
 * 
 * @param {WebGLRenderingContext} gl 
 * @param {*} vsSource 
 * @param {*} vfSource 
 */
export function initShaderProgram(gl, vsSource, vfSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, vfSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("impossible d'initialiser le programme: " + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}