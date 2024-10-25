export type BoundBox = {
  width: number;
  height: number;
  depth: number;
  r: number;
  center: [number, number, number],
  count: number
}

export class Bound {
  private geometry;
  bbox: BoundBox;
  minX: number;
  minY: number;
  minZ: number;
  private verticesNumber: number;

  constructor(geometry: [number, number, number][] | number[]) {
    this.geometry = geometry;

    if (typeof this.geometry[0] === "number")
      this.verticesNumber = this.geometry.length / 3;
    else
      this.verticesNumber = this.geometry.length

    this.init();
  }

  getBbox() {
    return this.bbox;
  }

  private init() {
    this.initBound();
  }


  private initBound() {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;

    this.loopThroughVertices((x, y, z) => {
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      minZ = z < minZ ? z : minZ;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      maxZ = z > maxZ ? z : maxZ;
      centerX += x;
      centerY += y;
      centerZ += z;
    })

    const width = maxX - minX;
    const height = maxY - minY;
    const depth = maxZ - minZ;
    const r = Math.sqrt(width**2 + height**2 + depth**2) / 2;

    centerX /= this.verticesNumber;
    centerY /= this.verticesNumber;
    centerZ /= this.verticesNumber;

    this.bbox = {
      width,
      height,
      depth,
      r,
      center: [centerX, centerY, centerZ],
      count: this.verticesNumber
    };
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
  }
  
  private loopThroughVertices(cb: (x, y, z) => void) {
    if (typeof this.geometry[0] === "number") {

      for (let i = 0; i < this.geometry.length; i += 3) {
        const x =  this.geometry[i];
        const y =  this.geometry[i + 1];
        const z =  this.geometry[i + 2];
        
        cb(x, y, z);
      }

    } else {
      this.geometry.forEach(([x, y, z]) => cb(x, y, z))
    }

  }

}