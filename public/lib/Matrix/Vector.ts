type Field = {
  add: (f: Field) => void
}

class Vector {
  private fields: number[];

  constructor(private arg: number | number[] | Vector) {
    this.fields = [];

    if (typeof arg === "number") {
      for (let i = 0; i < arg; i++) this.fields.push(0);
    }
    else if (arg instanceof Vector) {
      for (let i = 0; i < arg.size(); i++) this.fields.push(arg.get(i) as number);
    }
    else {
      this.fields = arg as number[];
    }
  }

  scale(a: number): Vector {
    this.fields = this.fields.map((f) => f * a);
    return this;
  }

  add(v: Vector): Vector | undefined {
    if (!(v.size() === this.size())) return;

    this.fields = this.fields.map((f, i) => f + (v.get(i) as number));
    return this;
  }

  sub(v: Vector): Vector | undefined {
    if (!(v.size() === this.size())) return;

    this.fields = this.fields.map((f, i) => f - (v.get(i) as number));
    return this;
  }

  dot(v: Vector): number | undefined {
    if (!(v.size() === this.size())) return;

    return this.fields.reduce((acc, el, id) => 
      acc += el * (v.get(id) as number)
    , 0);
  }

  /**
   * @desc la norme classique peut aussi etre vue comme la distance eucli
   * @returns 
   */
  norm(): number {
    const squareNorm = this.fields.reduce((acc, f) => acc + f ** 2, 0);

    return Math.sqrt(squareNorm);
  }

  /**
   * @description La norme Manhattan correspond par la distance qui serait parcourue par un taxi dans les rues quadrilles de
   * Manhattan. On prend la distance comme si on se ballader le long de la grille avec des deplacements horizontaux et verticaux
   * @returns {number}
   */
  norm_1(): number {
    return this.fields.reduce((acc, f) => acc += Math.abs(f), 0);
  }

  /**
   * @desc La norme supreme (supremum norm) peut etre vue en s'appuyant sur le deplacement du roi sur un echiquier pour
   * ateindre une cible si un pion est a une distance de [4, 3] le roi prendra 4 temps pour y acceder
   * @returns {number}
   */
  norm_inf(): number {
    return Math.max(...this.fields.map(f => Math.abs(f)));
  }

  size(): number {
    return this.fields.length;
  }

  get(i: number): number | null {
    if (i < this.size()) return this.fields[i];
    return null
  }

  toString() {
    return this.fields.join(", ");
  }

  toArray(): number[] {
    return [...this.fields];
  }
}


export default Vector;

export function linearCombination(familly: Vector[], scalars: number[]): Vector | undefined {
  const dim = familly[0].size();

  if (familly.length !== scalars.length) return undefined;
  if (!familly.every(vector => vector.size() === dim)) return undefined;

  const ret = new Vector(dim);

  familly.forEach((v, i) => ret.add(v.scale(scalars[i])));

  console.log(ret);
  return ret;
}

/**
 * @desc linear Interpolation between two vectors
 * @param start 
 * @param end 
 * @param t 
 * @returns 
 */
export function lerp<T>(start: T, end: T, t: number): T | undefined {
  if (start instanceof Vector) return undefined;
}

export function lerpVector(start: Vector, end: Vector, t: number) {
  if (start.size() !== end.size()) return undefined;
  if (t > 1 || t < 0) return undefined;

  const dim = start.size();
  const results = [];

  for (let i = 0; i < dim; i++) {
    const diff = (end.get(i) as number) - (start.get(i) as number);

    results.push((start.get(i) as number) + diff * t);
  }
  return new Vector(results);
}

export function lerpVector2(start: Vector, end: Vector, t: number) {
  if (start.size() !== end.size()) return undefined;
  if (t > 1 || t < 0) return undefined;

  const diff = new Vector(end.sub(start) as Vector);
  
  return new Vector(start.add(diff.scale(t)) as Vector);
}

export function cos_angle(v1: Vector, v2: Vector): number | undefined {
  if (v1.size() !== v2.size()) return;
  
  return (v1.dot(v2) as number) / (v1.norm() * v2.norm());
}

export function cross_product(v: Vector, w: Vector): Vector | undefined {
  if (v.size() !== 3 || w.size() !== 3) return;

  const [v1, v2, v3] = v.toArray();
  const [w1, w2, w3] = w.toArray();

  return new Vector([
    v2 * w3 - v3 * w2,
    v1 * w3 - v3 * w1,
    v1 * w2 - v2 * w1
  ]);
}

