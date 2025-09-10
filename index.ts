// =================================================================================================
// ==== Classes ====================================================================================
// =================================================================================================

class Utils {
  static getDist(vec1: {x: number, y: number}, vec2: {x: number, y: number}): number {
    return Math.sqrt((vec1.x - vec2.x)**2 + (vec1.y - vec2.y)**2);
  }

  static getRandFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Random integer from min to max inclusive
  static getRandInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static bound(value: number, bound1: number, bound2: number): number {
    const max = Math.max(bound1, bound2);
    const min = Math.min(bound1, bound2);
    return Math.max(Math.min(value, max), min);
  }

}

class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x ?? 1;
    this.y = y ?? 1;
    this.z = z ?? 1;
  }
  
  getCopy(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  getScaled(scaler: number): Vector3 {
    return new Vector3(scaler * this.x, scaler * this.y, scaler * this.z)
  }

  scale(scaler: number): void {
    this.x *= scaler;
    this.y *= scaler;
    this.z *= scaler;
  }

  getNeg(): Vector3 {
    return this.getScaled(-1);
  }
  
  getMagnitude(): number {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }

  getAddition(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  add(other: Vector3): void {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }
  
  // self.diff(other) = other - self
  // self + self.diff(other) = other
  getDifference(other: Vector3): Vector3 {
    return new Vector3(other.x - this.x, other.y - this.y, other.z - this.z);
  }
  
  // !!! Ignores zero vectors
  getNormalized(): Vector3 {
    const mag = this.getMagnitude();
  
    // Return <0,0> if input is zero vector
    if (mag === 0) {
      return new Vector3(0, 0, 0);
    }
  
    return this.getScaled(1/mag)
  }

  // !!! Ignores zero vectors
  normalize(): void {
    const mag = this.getMagnitude();

    // Do nothing if zero vector
    if (mag === 0) {
      return
    }

    this.scale(1/mag);
  }

  getDotProduct(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }
  
  // Returns current vector projected onto a basis vector
  // (basis vector does not need to be unit length)
  getProjection(basis: Vector3): Vector3 {
    if (basis.getMagnitude() === 0) {
      console.error("Cannot project onto a zero basis vector")
    }
    const newMag = this.getDotProduct(basis) / basis.getMagnitude()**2
    
    return basis.getScaled(newMag)
  }

  // Rotate around the X-axis
  getRotatedX(theta: number, axis: Vector3 = new Vector3(0, 0, 0)): Vector3 {
    const dx = this.x - axis.x;
    const dy = this.y - axis.y;
    const dz = this.z - axis.z;

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const y = dy * cos - dz * sin;
    const z = dy * sin + dz * cos;

    return new Vector3(axis.x + dx, axis.y + y, axis.z + z);
  }

  // Rotate around the Y-axis
  getRotatedY(theta: number, axis: Vector3 = new Vector3(0, 0, 0)): Vector3 {
    const dx = this.x - axis.x;
    const dy = this.y - axis.y;
    const dz = this.z - axis.z;

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const x = dx * cos + dz * sin;
    const z = -dx * sin + dz * cos;

    return new Vector3(axis.x + x, axis.y + dy, axis.z + z);
  }

  // Rotate around the Z-axis
  getRotatedZ(theta: number, axis: Vector3 = new Vector3(0, 0, 0)): Vector3 {
    const dx = this.x - axis.x;
    const dy = this.y - axis.y;
    const dz = this.z - axis.z;

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const x = dx * cos - dy * sin;
    const y = dx * sin + dy * cos;

    return new Vector3(axis.x + x, axis.y + y, axis.z + dz);
  }
}

class Tracer {
  tail: Vector3[];
  maxTailLength: number;
  color: string;
  
  constructor(pos: Vector3 = new Vector3(0, 0, 0), color: string = "black", maxTailLength: number = 5000) {
    this.tail = [pos];
    this.color = color;
    this.maxTailLength = maxTailLength;
  }

  // Draws 
  draw(ctx: any, offsetX: number = 0, offsetY: number = 0): void {
    const headRadius = 2;

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    // Draw head
    const headPos = this.getPos();
    ctx.beginPath();
    ctx.arc(...getScreenPos(headPos), headRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw tail
    ctx.beginPath();
    ctx.moveTo(...getScreenPos(this.tail[0]));

    for (const tailPos of this.tail) {
      ctx.lineTo(...getScreenPos(tailPos));
    }

    ctx.stroke();
  }

  addSegment(pos: Vector3): void {
    this.tail.push(pos);

    if (this.tail.length > this.maxTailLength) {
      this.tail.shift();
    }
  }

  getPos(): Vector3 {
    return this.tail[this.tail.length - 1].getCopy();
  }

  update(iteratorFunc: (pos: Vector3) => Vector3): void {
    this.addSegment(iteratorFunc(this.getPos()));
  }

}

function getScreenPos(pos: Vector3): [number, number] {
  const OFFSET_X = 0.5*CANVAS_RECT.width;
  const OFFSET_Y = 100;

  const SCALE = 1;

  pos = pos.getRotatedZ(angleZ);

  return [SCALE*pos.x + OFFSET_X, CANVAS_RECT.height-(SCALE*pos.z + OFFSET_Y)];
}


// =================================================================================================
// ==== Main Code ==================================================================================
// =================================================================================================


const canvas: any = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Consts
const CANVAS_RECT = canvas.getBoundingClientRect();
const FPS = 100;

let angleZ = 0;
let prevMousePos: [number, number] | undefined = undefined;


const tracerList: Tracer[] = [];



tracerList.push(new Tracer(new Vector3(-5, 5, 0), "purple", 1000));
tracerList.push(new Tracer(new Vector3(-4, 0, 5), "blue", 1000));





// Set frame rate
setInterval(updateFrame, 1000 / FPS);


function updateFrame(): void {

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const tracer of tracerList) {
    tracer.update(lorenzIterator);
    tracer.draw(ctx);
    console.log(tracer.getPos())
  }
}

function getLorenzGradientVec({x, y, z}: Vector3): Vector3 {
  const RHO = 28
  const SIGMA = 10
  const BETA = 8/3

  const dx = SIGMA*(y - x);
  const dy = x*(RHO - z) - y;
  const dz = (x*y) - (BETA*z);

  return new Vector3(dx, dy, dz);
}

function lorenzIterator(pos: Vector3): Vector3 {
  const STEP_SIZE = 0.05;

  const gradientVec = getLorenzGradientVec(pos.getScaled(0.1));

  return pos.getAddition(gradientVec.getScaled(STEP_SIZE));
}

window.addEventListener("mousemove", (event) => {
  if (prevMousePos === undefined) {
    return
  }

  const d_mouseX = event.clientX - prevMousePos[0];

  angleZ += d_mouseX / 100;

  prevMousePos = [event.clientX, event.clientY];
})

window.addEventListener("mousedown", (event) => {
  prevMousePos = [event.clientX, event.clientY];
})

window.addEventListener("mouseup", (event) => {
  prevMousePos = undefined;
})

window.addEventListener("mouseleave", (event) => {
  prevMousePos = undefined;
})
