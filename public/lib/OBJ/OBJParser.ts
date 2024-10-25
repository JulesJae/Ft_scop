import { Face, Obj3D } from "../../type";


class OBJParser {
  private objFile: string;
  private result: Obj3D;
  private keywords: {
    [key: string]: (items: string[]) => void
  };

  constructor(objFile: string) {
    this.objFile = objFile;
    this.result = {
      vertices: [],
      textureCoords: [],
      faces: []
    };
    this.keywords = {
      "v": this.parseVertices.bind(this),
      "f": this.parseFace.bind(this),
    }
  }

  parse(): Obj3D {
    const lines = this.objFile.split("\n");

    lines.forEach((line) => {
      line = line.trim();
      if (line === "" || line.startsWith("#")) return;

      const lineItems = line.replace(/\s\s+/g, ' ').split(" ");
      const keyword = lineItems[0].toLowerCase();

      this.keywords[keyword] && this.keywords[keyword](lineItems.slice(1));
    })

    return this.result;
  }

  private parseVertices(lineItems: string[]) {
    const [x, y, z] = lineItems.map(parseFloat);

    this.result.vertices.push({x, y, z});
  }

  private parseFace(lineItems: string[]) {
    const face = {} as Face;

    face.vtn = [];
    for (const item of lineItems) {
      let [vertexIndex, textureCoordsIndex, n] = item.split("/").map(parseInt);

      vertexIndex = vertexIndex > 0 ? vertexIndex - 1: this.result.vertices.length + vertexIndex;
      textureCoordsIndex = textureCoordsIndex > 0 ? textureCoordsIndex - 1: this.result.vertices.length + textureCoordsIndex;

      face.vtn.push({vertexIndex, textureCoordsIndex});
    }
    this.result.faces.push(face);
  }

}

export default OBJParser;