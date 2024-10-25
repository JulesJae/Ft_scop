import OBJHelper from "./lib/OBJ/OBJHelper";
import OBJParser from "./lib/OBJ/OBJParser";
import { drawObj } from "./draw";

const objFile = "data/teapot2.obj";

async function main() {
  const res = await fetch(objFile);
  const objStr = await res.text();
  const parser = new OBJParser(objStr);
  const obj = parser.parse();
  const objHelper = new OBJHelper(obj);
  const image = new Image();

  image.src = "f-texture.png";
  image.onload = function() {
    console.log(objHelper);
    drawObj(objHelper, image);
  };
}

main();