class Vector extends Float64Array {
  type = this.constructor.name;

  constructor(x=0,y=0) {
    super(2);
    this[0] = +x;
    this[1] = +y;
  }

  static add(v1,v2) {
    return new Vector(v1[0]+v2[0],v1[1]+v2[1]);
  }
  static sub(v1,v2) {
    return new Vector(v1[0]-v2[0],v1[1]-v2[1]);
  }

  static norm(v) {
    return v[0]*v[0] + v[1]*v[1];
  }
  static abs(v) {
    return sqrt(v[0]*v[0] + v[1]*v[1]);
  }
  static dot(v1,v2) {
    return v1[0]*v2[0] + v1[1]*v2[1];
  }
  static cross(v1,v2) {
    return v1[0]*v2[1] - v1[1]*v2[0];
  }

  static dist2(v1,v2) {
    return (v1[0]-v2[0])**2 + (v1[1]-v2[1])**2;
  }
  static dist(v1,v2) {
    return sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2);
  }
  static theta(v) {
    return atan2(v[1],v[0]);
  }

  static eq(v1,v2) {
    return v1[0] === v2[0] && v1[1] === v2[1];
  }

  static round(v) {
    return vector(round(v[0]),round(v[0]));
  }
  static floor(v) {
    return vector(floor(v[0]),floor(v[0]));
  }
  static ceil(v) {
    return vector(ceil(v[0]),ceil(v[0]));
  }

  static min(...v) {
    var x = v[0][0], y = v[0][1];
    for (var i = 1; i < v.length; i++) {
      x = min(x, v[i][0]);
      y = min(y, v[i][1]);
    }
    return new Vector(x,y);
  }

  static max(...v) {
    var x = v[0][0], y = v[0][1];
    for (var i = 0; i < v.length; i++) {
      x = max(x, v[i][0]);
      y = max(y, v[i][1]);
    }
    return new Vector(x,y);
  }

  static mean(...v) {
    var x = v[0][0], y = v[0][1];
    for (var i = 1; i < v.length; i++) {
      x += v[i][0];
      y += v[i][1];
    }
    return new Vector(x / v.length, y / v.length);
  }

  static median(...v) {
    var nx = v[0][0], ny = v[0][1], mx = v[0][0], my = v[0][1];
    for (var i = 1; i < v.length; i++) {
      nx = min(nx, v[i][0]);
      ny = min(ny, v[i][1]);
      mx = max(mx, v[i][0]);
      my = max(my, v[i][1]);
    }
    return new Vector((nx + mx) / 2, (ny + my) / 2);
  }

  static intersect(v1, d1, v2, d2) {
    var dx = v2[0] - v1[0], dy = v2[1] - v1[1];
    var det = d1[0] * d2[1] - d1[1] * d2[0];
    var t = (dx * d2[1] - dy * d2[0]) / det;
    return new Vector(v1[0] + d1[0] * t, v1[1] + d1[1] * t);
  }

  static pintersect(p1, p2, p3, p4) {
    var d1x = p2[0] - p1[0], d1y = p2[1] - p1[1];
    var d2x = p4[0] - p3[0], d2y = p4[1] - p3[1];
    var dx = p3[0] - p1[0], dy = p3[1] - p1[1];
    var det = d1x * d2y - d1y * d2x;
    var t = (dx * d2y - dy * d2x) / det;
    return new Vector(p1[0] + d1x * t, p1[1] + d1y * t);
  }

  add(v) {
    return new Vector(this[0]+v[0], this[1]+v[1]);
  }
  addn(n) {
    return new Vector(this[0]+n, this[1]+n);
  }
  sub(v) {
    return new Vector(this[0]-v[0], this[1]-v[1]);
  }
  subn(v) {
    return new Vector(this[0]-n, this[1]-n);
  }
  mul(n) {
    return new Vector(this[0]*n, this[1]*n);
  }
  div(n) {
    return new Vector(this[0]/n, this[1]/n);
  }

  set(v) {
    this[0] = v[0];
    this[1] = v[1];
    return this;
  }

  copy() {
    return new Vector(this[0], this[1]);
  }

  neg() {
    return new Vector(-this[0], -this[1]);
  }

  addeq(v) {
    this[0] += v[0];
    this[1] += v[1];
    return this;
  }
  addeqn(v) {
    this[0] += n;
    this[1] += n;
    return this;
  }
  subeq(v) {
    this[0] -= v[0];
    this[1] -= v[1];
    return this;
  }
  subeqn(n) {
    this[0] -= n;
    this[1] -= n;
    return this;
  }
  muleq(n) {
    this[0] *= n;
    this[1] *= n;
    return this;
  }
  diveq(n) {
    this[0] /= n;
    this[1] /= n;
    return this;
  }

  norm() {
    return this[0]*this[0] + this[1]*this[1];
  }
  abs() {
    return sqrt(this[0]*this[0] + this[1]*this[1]);
  }
  dot(v) {
    return this[0]*v[0] + this[1]*v[1];
  }
  cross(v) {
    return this[0]*v[1] - this[1]*v[0];
  }


  dist2(v) {
    return (this[0]-v[0])**2 + (this[1]-v[1])**2;
  }
  dist(v) {
    return sqrt((this[0]-v[0])**2 + (this[1]-v[1])**2);
  }
  theta() {
    return atan2(this[1],this[0]);
  }

  eq(v) {
    return this[0] === v[0] && this[1] === v[1];
  }
  neq(v) {
    return this[0] !== v[0] || this[1] !== v[1];
  }

  lt(v) {
    return this[0] < v[0] && this[1] < v[1];
  }
  gt(v) {
    return this[0] > v[0] && this[1] > v[1];
  }
  lteq(v) {
    return this[0] <= v[0] && this[1] <= v[1];
  }
  gteq(v) {
    return this[0] >= v[0] && this[1] >= v[1];
  }

  round() {
    return vector(round(this[0]),round(this[1]));
  }
  floor() {
    return vector(floor(this[0]),floor(this[1]));
  }
  ceil() {
    return vector(ceil(this[0]),ceil(this[1]));
  }

  roundeq() {
    this[0] = round(this[0]);
    this[1] = round(this[1]);
    return this;
  }
  flooreq() {
    this[0] = floor(this[0]);
    this[1] = floor(this[1]);
    return this;
  }
  ceileq() {
    this[0] = ceil(this[0]);
    this[1] = ceil(this[1]);
    return this;
  }


  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  set x(x) {
    this[0] = x;
  }
  set y(y) {
    this[1] = y;
  }
}

function vector(x=0,y=0) {
  return new Vector(x,y);
}

/*
var vector = (x=0,y=0) => new Float64Array([x, y]);
var vadd = (v,w) => new Float64Array([v[0] + w[0], v[1] + w[1]]);
var vsub = (v,w) => new Float64Array([v[0] - w[0], v[1] - w[1]]);
var vmul = (v,n) => new Float64Array([v[0] * n   , v[1] * n   ]);
var vdiv = (v,n) => new Float64Array([v[0] / n   , v[1] / n   ]);
var vnorm  = (v)   => v[0] * v[0] + v[1] * v[1];
var vdot   = (v,w) => v[0] * w[0] + v[1] * w[1];
var vcross = (v,w) => v[0] * w[1] - v[1] * w[0];
var vabs = (v) => sqrt(v[0] * v[0] + v[1] * v[1]);
var vdist2 = (v,w) => (v[0]-w[0])**2 + (v[1]-w[1])**2;
var vdist = (v,w) => sqrt((v[0]-w[0])**2 + (v[1]-w[1])**2);
var vtheta = (v) => atan2(v[1],v[0]);
var veq =   (v,w) => v[0] === w[0] && v[1] === w[1];
var vneq =  (v,w) => v[0] !== w[0] || v[1] !== w[1];
var vlteq = (v,w) => v[0]  <= w[0] && v[1]  <= w[1];
var vgteq = (v,w) => v[0]  >= w[0] && v[1]  >= w[1];
var vlt =   (v,w) => v[0]  <  w[0] && v[1]  <  w[1];
var vgt =   (v,w) => v[0]  >  w[0] && v[1]  >  w[1];
var vround = (v) => new Float64Array([round(v[0]), round(v[1])]);
var vfloor = (v) => new Float64Array([floor(v[0]), floor(v[1])]);
var vceil =  (v) => new Float64Array([ ceil(v[0]),  ceil(v[1])]);
var vmin = (...v) => new Float64Array([
  min(...v.map(v => v[0]));
  min(...v.map(v => v[1]));
]);
var vmax = (...v) => new Float64Array([
  max(...v.map(v => v[0]));
  max(...v.map(v => v[1]));
]);

function mean(...vectors) {
  var sum = vectors.reduce((acc, v) => add(acc, v), vector(0, 0));
  return div(sum, vectors.length);
}

function median(...vectors) {
  return mean(min(...vectors), max(...vectors));
}
  add(v) {
  return new Vector(this[0]+v[0], this[1]+v[1]);
  }
  sub(v) {
    return new Vector(this[0]-v[0], this[1]-v[1]);
  }
  mul(n) {
    return new Vector(this[0]*n, this[1]*n);
  }
  div(n) {
    return new Vector(this[0]/n, this[1]/n);
  }

  set(v) {
    this[0] = v[0];
    this[1] = v[1];
    return this;
  }

  copy() {
    return new Vector(this[0], this[1]);
  }

  neg() {
    return new Vector(-this[0], -this[1]);
  }

  addeq(v) {
    this[0] += v[0];
    this[1] += v[1];
    return this;
  }
  subeq(v) {
    this[0] -= v[0];
    this[1] -= v[1];
    return this;
  }
  muleq(n) {
    this[0] *= n;
    this[1] *= n;
    return this;
  }
  diveq(n) {
    this[0] /= n;
    this[1] /= n;
    return this;
  }

  norm() {
    return this[0]*this[0] + this[1]*this[1];
  }
  abs() {
    return Math.sqrt(this[0]*this[0] + this[1]*this[1]);
  }
  dot(v) {
    return this[0]*v[0] + this[1]*v[1];
  }
  cross(v) {
    return this[0]*v[1] - this[1]*v[0];
  }


  dist2(v) {
    return (this[0]-v[0])**2 + (this[1]-v[1])**2;
  }
  dist(v) {
    return Math.sqrt((this[0]-v[0])**2 + (this[1]-v[1])**2);
  }
  theta() {
    return Math.atan2(this[1],this[0]);
  }

  eq(v) {
    return this[0] === v[0] && this[1] === v[1];
  }
  neq(v) {
    return this[0] !== v[0] || this[1] !== v[1];
  }

  lt(v) {
    return this[0] < v[0] && this[1] < v[1];
  }
  gt(v) {
    return this[0] > v[0] && this[1] > v[1];
  }
  lteq(v) {
    return this[0] <= v[0] && this[1] <= v[1];
  }
  gteq(v) {
    return this[0] >= v[0] && this[1] >= v[1];
  }

  round() {
    return vector(Math.round(this[0]),Math.round(this[1]));
  }
  floor() {
    return vector(Math.floor(this[0]),Math.floor(this[1]));
  }
  ceil() {
    return vector(Math.ceil(this[0]),Math.ceil(this[1]));
  }


  get x() {
    return this[0];
  }
  get y() {
    return this[1];
  }
  set x(x) {
    this[0] = x;
  }
  set y(y) {
    this[1] = y;
  }
}

var vector(x=0,y=0) {
  return new Vector(x,y);
}
*/