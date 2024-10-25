import { Face, Obj3D } from "../../type";
import { Bound } from "../Geometry/Bound";

class OBJHelper {
  private obj: Obj3D;
  private positions: number[];
  private uvs: number[];
  private materials: number[];
  private bound: Bound;
  private colors = [
    [1., 0., 0.], 
    [1., 1., 0.], 
    [1., 0., 1.], 
    [1., 1., .5], 
    [0., 1., 0.],
    [0., 1., 1.],
    [0., 0., 1.],    
  ];

  constructor(obj: Obj3D) {
    this.obj = obj;
    this.positions = [];
    this.uvs = [];
    this.materials = [];

    this.init();
  }
  
  getPositions() { return this.positions; }
  getUvs() { return this.uvs; }
  getMaterials() { return this.materials; }
  getBoundingSphereRadius() { return this.bound.bbox.r; }
  getCenter() { return this.bound.bbox.center; }
  
  private init() {
    this.initPositions();
    this.bound = new Bound(this.positions);
    this.initUvs();
  }

  private initUvs() {
    if (this.obj.textureCoords.length === 0)
      this.projectXYtoUV();
  }

  private projectXYtoUV() {
    console.log(this.bound);
    for (let i = 0; i < this.positions.length; i += 3) {
      const x = this.positions[i];
      const y = this.positions[i + 1];
      const z = this.positions[i + 2];

      this.uvs.push(-(z - this.bound.minZ) / this.bound.bbox.depth);
      this.uvs.push((-(y - this.bound.minY) / this.bound.bbox.height) * 2);
      // this.uvs.push(((x - this.bound.minX) / this.bound.bbox.width) * 2);
    }
  }

  private initPositions() {
    this.obj.faces.forEach((face, faceIndex) => {
      const triangles = face.vtn.length - 2;
      const colorIndex = faceIndex % this.colors.length;
  
      for (let i = 0; i < triangles; i++) {
        this.addTrianglesToPosition(face, i);
        this.addTriangleMaterial(colorIndex)
      }
    });
  }

  private addTriangleMaterial(colorIndex) {
    this.materials.push(
      ...this.colors[colorIndex],
      ...this.colors[colorIndex],
      ...this.colors[colorIndex],
    );
  }

  private addTrianglesToPosition(face: Face, vtnIndex: number) {
    const addVertex = (i: number) => {
      const {x, y, z} = this.obj.vertices[face.vtn[i].vertexIndex];
  
      this.positions.push(x, y, z)
    }

    addVertex(0);
    addVertex(1 + vtnIndex);
    addVertex(2 + vtnIndex);
  }
}

export default OBJHelper;
