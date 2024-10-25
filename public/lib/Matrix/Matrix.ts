import Vector from "./Vector";

interface RowOperations {
  sort: (leftNonZeros: number[]) => void;
  substract: (rowIdx: number, pivotId: number, coeff: number) => void;
  multiply: (rowIdx: number, scalar: number) => void;
}

class Matrix {
  private row: number;
  private column: number;

  constructor(private mat: number[][]) {
    const columnDimension = mat[0].length;

    if (!mat.every((row) => row.length === columnDimension))
      throw new Error("Matrix: Bad Dimension");

    this.row = mat.length;
    this.column = columnDimension;
  }

  getMat() {
    return this.mat;
  }

  trace(): number | undefined {
    if (!this.isSquare()) return;

    return this.mat.reduce((acc, row, i) => acc += this.mat[i][i], 0);
  }

  add(m: Matrix) {
    if (!Matrix.areEqual(this, m)) return;

    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.column; j++)
        this.mat[i][j] += m.get(i, j);
    }
  }

  sub(m: Matrix) {
    if (!Matrix.areEqual(this, m)) return;

    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.column; j++)
        this.mat[i][j] -= m.get(i, j);
    }
  }

  transform(v: Vector): Vector | undefined {
    if (!this.isSquare()) return;
    if (v.size() !== this.row) return;

    const fields = [] as number[];

    this.mat.forEach((row) => {

      fields.push(row.reduce((acc, el, colIndex) => {
        return acc += v.get(colIndex) as number * el
      }, 0));

    });

    return new Vector(fields);
  }

  transpose(): Matrix {
    const matrice = [] as number[][];

    this.mat.forEach((row) => {

      row.forEach((col, colIndex) => {

        if (matrice[colIndex] === undefined)
          matrice.push([]);
        matrice[colIndex].push(col);

      });

    });

    return new Matrix(matrice);
  }

  determinant(): number|undefined {
    if (!(this.isSquare() || this.row <= 3)) return;
    if (this.row === 2) return this.mat[0][0] * this.mat[1][1] - this.mat[0][1] * this.mat[1][0];
    if(this.row === 3) return this.determinant3x3();
    if(this.row === 4) return this.determinant4x4();
  }

  private determinant4x4():number {
    let det = 0;

    this.mat.forEach((row, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      const coeff = sign * row[0];
      const subMatrix = get3x3SubMatrix(this.mat, i, 0);

      det += coeff * (subMatrix.determinant() as number);
    })

    return det;
  }

  private determinant3x3() {
    let det: number = 0;

    for (let col = 0; col < this.column; col++) {
      let product = 1;

      for (let row = 0; row < this.row; row++) 
        product *= this.mat[row][(col + row) % this.column]; 
      
      det += product ;
    }

    for (let col = 0; col < this.column; col++) {
      let product = 1;

      for (let row = 0; row < this.row; row++) {
        const colIndex = (this.column * 2 - (row + 1) + col) % this.column;

        product *= this.mat[row][colIndex]
      }

      det -= product;
    }

    return det;
  }

  inverse(): Matrix | undefined {
    const det = this.determinant();

    if (det === 0 || det === undefined) return;

    let identity =  Matrix.identity(this.row);

    const rowOperations: RowOperations = {
      sort: (leftNonZeros) => {
          identity = sortMatrix(identity, leftNonZeros);
          // console.log("sort identity =", identity);
      },
      substract(rowIdx: number, pivotId: number, coeff: number) {
          identity[rowIdx] = identity[rowIdx].map((col, colIdx) => col - coeff * identity[pivotId][colIdx]);
          // console.log("sort substract =", identity);
      },
      multiply(rowPivotId: number, scalar: number) {
          // console.log(`sort rowPivotId = ${rowPivotId}, multiply =`, identity);
          identity[rowPivotId] = identity[rowPivotId].map((value) => value === 0 ? value : value * scalar)
          // console.log("sort multiply =", identity);
      },
    }
    this.reduced_row_echelon(rowOperations);
    // console.log(identity)
    return new Matrix(identity);
  }

  reduced_row_echelon(operations?: RowOperations): Matrix {
    let matrix = this.row_echelon(operations);

    for (let i = matrix.length - 1; i > 0; i--) {
      const pivot = matrix[i];
      const pivotCol = pivot.indexOf(1);
      if (pivotCol === -1) continue;

      matrix = matrix.map((row, idx) => {
        if (idx >= i) return row;
        const coeff = row[pivotCol];
        // const operation = (col: number, colIdx: number) => col - coeff * pivot[colIdx];
        operations?.substract(idx, i, coeff);
        // a.operation(rowIdx, (colValue, colIdx) => colValue - coeff * pivot[colIdx] )
        // return row.map(operation)
        return row.map((e, i) => e - coeff * pivot[i])
      });
      // console.log(`reduced_row_echelon matrix = `, matrix);
    }
    return new Matrix(matrix);
  }

  row_echelon(operations?: RowOperations): number[][] {
    let mat = [...this.mat];

    for (let i = 0; i < this.mat[0].length; i++) {
      const leftMostNonZeroColumns = getLeftMostNonZeroColumn(mat);

      if (leftMostNonZeroColumns.indexOf(i) === -1) continue;

      // const isAlone = leftMostNonZeroColumns.reduce((acc, a) => a === i ? acc + 1 : acc) === 1;
      mat = sortMatrix(mat, leftMostNonZeroColumns);
      operations?.sort(leftMostNonZeroColumns);
      const pivotId = leftMostNonZeroColumns.indexOf(i);
      
      putOne2Pivot(mat, pivotId, operations);

      for (let j = pivotId + 1 ; j < this.mat.length ; j++) {
        const coeff = mat[j][i];
        if (coeff === 0) continue;
        // const operation = (col: number, colIdx: number) => col - coeff * mat[pivotId][colIdx]
        // mat[j] = mat[j].map(operation);
        operations?.substract(j, pivotId, coeff)
        mat[j] = mat[j].map((e, idx) => e - coeff * mat[pivotId][idx]);
      }
    }

    return mat;
  }

  rank(): number {
    const rref = this.reduced_row_echelon();

    return rref.toArray().reduce((acc, row) => {
      return row.find((e) => e !== 0) ? acc + 1 : acc;
    }, 0);
  }

  scale(a: number) {
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.column; j++)
        this.mat[i][j] *= a;
    }
  }

  get(i: number, j: number) {
    return this.mat[i][j];
  }

  size() {
    return[this.row, this.column];
  }

  isSquare(): boolean {
    return this.row === this.column;
  }

  toString() {
    const str = this.mat.reduce((acc, row) => {
      return acc += `[${row.join(", ")}]`;
    }, "");

    return `[${str}]`;
  }

  toArray() {
    return this.mat.reduce((acc, row) => {
      acc.push(...row);
      return acc;
    }, []);
  }

  static areEqual(m1: Matrix, m2: Matrix): boolean {
    const [r1, c1] = m1.size();
    const [r2, c2] = m1.size();

    return r1 === r2 && c1 === c2;
  }

  static identity(size: number): number[][] {
    const identity = [] as number[][];

    for (let row = 0; row < size; row++) {
      identity.push([]);
      for (let col = 0; col < size; col++)
        identity[row].push(col === row ? 1 : 0);
    }

    return identity;
  }
}

export function multiplyMatrix(transform: Matrix, transformed: Matrix): Matrix | undefined {
  const [__, col] = transform.size();
  const [row, newCol] = transformed.size();

  if (row !== col) return

  const matrice = [] as number[][];
  
  transform.getMat().forEach((row, rowIndex) => {

    const newRow = [] as number[];

    for (let i = 0; i < newCol ;i++) {

      newRow.push(row.reduce((acc, el, colIndex) => {

        return acc += el * transformed.get(colIndex, i);

      }, 0));

    }
    // console.log(newRow);

    matrice.push(newRow);
  });
  
  return new Matrix(matrice);
}

function get3x3SubMatrix(matrix: number[][], rowIdx:number, colIdx: number): Matrix {

  const subMatrix = matrix.reduce((acc, row, i) => {
    if (i === rowIdx) return acc;

    acc.push(row.filter((e, j) => j !== colIdx));

    return acc;
  }
  , [] as number[][]);

  return new Matrix(subMatrix);
}

function sortMatrix(matrix: number[][], topLeftnz: number[]): number[][] {
  return matrix.sort((a, b) => {
    const aIndex = matrix.findIndex(row => row === a);
    const bIndex = matrix.findIndex(row => row === b);

    return topLeftnz[aIndex] - topLeftnz[bIndex];
  })
}

function getLeftMostNonZeroColumn(mat: number[][]): number[] {
  return mat.map((row) => row.findIndex((v) => v !== 0));
}

function putOne2Pivot(matrix: number[][], rowPivotId: number, operations?: RowOperations): void {
  const colPivotId = matrix[rowPivotId].findIndex((e) => e !== 0);
  const scalar = 1 / matrix[rowPivotId][colPivotId];
  const operation = (value: number) => value === 0 ? value : value * scalar;

  operations?.multiply(rowPivotId, scalar);
  matrix[rowPivotId] = matrix[rowPivotId].map(operation);
}

export function arrayToMatrix(arr: number[]): Matrix | undefined {
  const length = arr.length;
  const size = Math.sqrt(length);
  let index = 0;

  if ((size - Math.floor(size)) !== 0) return;

  const mat = [] as number[][];
  for (let i = 0; i < size; i++) {
    const row = [] as number[];

    for (let j = 0; j < size; j++) {
      // console.log(`index = ${index}, value = ${arr[index]}`)
      row.push(arr[index++]);
    }
    mat.push(row);
  }
  // console.log("array To matrix mat = ", mat);
  return new Matrix(mat);
}

export default Matrix;