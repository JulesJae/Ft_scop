export interface Obj3D {
  vertices: Vertex[];
  textureCoords: TextureCoord[];
  faces: Face[];
}

export interface Face {
  material: string;
  group: string;
  vtn: Vtn[];
}

export type Vtn = {
  vertexIndex: number;
  textureCoordsIndex: number;
}

export type TextureCoord = {
  u: number;
  v: number;
}

export type Vertex = {
  x: number;
  y: number;
  z: number;
}

export type DrawableObj = {
  position: number[],
  colors: number[],
  uvs: number[];
}

export type WebglInfos = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  programInfos: any;
}