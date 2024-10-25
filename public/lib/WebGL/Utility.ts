
function createUniformSetter(gl: WebGL2RenderingContext,program: WebGLProgram, uniformInfo: WebGLActiveInfo) 
{
  const location = gl.getUniformLocation(program, uniformInfo.name);
  const type = uniformInfo.type;

  switch (type) {
    case gl.FLOAT:
      return (v) => gl.uniform1f(location, v);

    case gl.FLOAT_VEC2:
      return (v) => gl.uniform2fv(location, v);

    case gl.FLOAT_VEC3:
      return (v) => gl.uniform3fv(location, v);

    case gl.FLOAT_VEC4:
      return (v) => gl.uniform4fv(location, v);
  
    case gl.INT:
      return (v) => gl.uniform1i(location, v);

    case gl.INT_VEC2:
      return (v) => gl.uniform2iv(location, v);

    case gl.INT_VEC3:
      return (v) => gl.uniform3iv(location, v);

    case gl.INT_VEC4:
      return (v) => gl.uniform4iv(location, v);

    case gl.BOOL:
      return (v) => gl.uniform1iv(location, v);

    case gl.BOOL_VEC2:
      return (v) => gl.uniform2iv(location, v);

    case gl.BOOL_VEC3:
      return (v) => gl.uniform3iv(location, v);

    case gl.BOOL_VEC4:
      return (v) => gl.uniform4iv(location, v);
  }

}