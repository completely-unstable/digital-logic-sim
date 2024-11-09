// global math
var {
    sin,cos,tan,sinh,cosh,tanh,asin,acos,atan,asinh,acosh,atanh,atan2,hypot,
    floor,ceil,fround,trunc,abs,sign,min,max,random,imul,clz32,
    log:ln,log2:lg,log10:log,log1p,exp,expm1,pow,sqrt,cbrt,
    E:euler,LN10:ln10,LN2:ln2,LOG10E:log10e,LOG2E:log2e,PI:pi,SQRT1_2:hroot,SQRT2:root2
    } = Math;

// just cuz
var csc = x => 1/sin(x),
    sec = x => 1/cos(x),
    cot = x => 1/tan(x),
    acsc = x => asin(1/x),
    asec = x => acos(1/x),
    acot = x => atan(1/x),
    csch = x => 1/sinh(x),
    sech = x => 1/cosh(x),
    coth = x => 1/tanh(x),
    acsch = x => asinh(1/x),
    asech = x => acosh(1/x),
    acoth = x => atanh(1/x);

var tau = 2*pi,
    pi2 = pi/2,
    pi3 = 3*pi2;

//  round(number,precision)
//  fixFloat(number)
//    .1+.2 = 0.30000000000000004
//    fixFloat(.1+.2) = 0.3
//  clamp(floor,value)
//  clamp(floor,value,ceiling)
//  mod(numerator,denominator)
//  mask(bits)
//  getBit(number,bits)
//  setBit(number,bits,value)
//  toSigned(number,bits)
//  toUnsigned(number,bits) (alias to maskBits)
//  maskBits(number,bits)
//  flipBits(number,bits)
//  range(length)
//    range(4) = [0,1,2,3]
//  range(start,end)
//    range(1,4) = [1,2,3,4]
//  chunk(array,size)
//    chunk([1,2,3,4,5],2) = [[1,2],[3,4],[5]]
//  binToGray(number)
//  grayToBin(number,bits)
//  toBigInt(array) array = [32bitInt, 32bitInt, ..., NbitInt]
//  bigDec(array) => String "1290"
//  bigBin(array) => String "0b1010"
//  bigHex(array) => String "0x12EF"
//  bigSignDec(array) => String "-1290"

var round = (n,p=0) => Math.round(n*(10**p))/(10**p);

var fixFloat = n => round(n,10);

var clamp = (a,b,c=Infinity) => max(a,min(b,c));

var mod = (n,d) => ((n % d) + d) % d;

var mask = b => b >= 32 ? 0xFFFFFFFF : (1 << b) - 1;

var getBit = (n,b) => (n >> b) & 1;

var setBit = (n,b,v) => v ? (n | (1 << b)) : (n & ~(1 << b));

var toSigned = (n,b) => getBit(n,b-1) ? -((~n + 1) & mask(b)) : n;

var toUnsigned = (n,b) => n & mask(b);

var maskBits = (n,b) => n & mask(b);

var flipBits = (n,b) => ~n & mask(b);

var range = (min,max) => [...Array(max ? max-min+1 : min).keys()].map(n => n + (max ? min : 0));

var chunk = (arr,size) => arr.reduce((a,_,i) => i%size==0 ? [...a,arr.slice(i,i+size)] : a,[]);

var binToGray = n => n ^ (n >> 1);

var grayToBin = (n,b) => range(b).reduce((a,i) => a ^ (a >> (1 << i)), n);

var toBigInt = n => n.reduce((a,v) => (a << 32n) | BigInt(v), 0n);

var bigDec = n => toBigInt(n).toString();

var bigBin = (n,b) => '0b' + toBigInt(n).toString(2).padStart(b ?? n.length*32, '0');

var bigHex = (n,b) => '0x' + toBigInt(n).toString(16).padStart(ceil((b ?? n.length*32)/4), '0');

var bigSignDec = (n,b) => {
  var v = toBigInt(n);
  return v >> BigInt((b ?? n.length * 32) - 1) & 1n 
    ? '-' + ((~v + 1n) & ((1n << BigInt(b ?? n.length * 32)) - 1n)).toString(10) 
    : v.toString(10);
};

var clone;
if (typeof structuredClone === 'function') {
  clone = structuredClone;
} else {
  clone = obj => JSON.parse(JSON.stringify(obj));
}

var greek = {
  Sigma: String.fromCharCode(931),
  Delta: String.fromCharCode(916),
  Pi: String.fromCharCode(928),
};

var char = {
  Alpha: String.fromCharCode(913),
  Beta: String.fromCharCode(914),
  Gamma: String.fromCharCode(915),
  Delta: String.fromCharCode(916),
  Epsilon: String.fromCharCode(917),
  Zeta: String.fromCharCode(918),
  Eta: String.fromCharCode(919),
  Theta: String.fromCharCode(920),
  Iota: String.fromCharCode(921),
  Kappa: String.fromCharCode(922),
  Lambda: String.fromCharCode(923),
  Mu: String.fromCharCode(924),
  Nu: String.fromCharCode(925),
  Xi: String.fromCharCode(926),
  Omicron: String.fromCharCode(927),
  Pi: String.fromCharCode(928),
  Rho: String.fromCharCode(929),
  Sigma: String.fromCharCode(931),
  Tau: String.fromCharCode(932),
  Upsilon: String.fromCharCode(934),
  Phi: String.fromCharCode(935),
  Chi: String.fromCharCode(936),
  Psi: String.fromCharCode(937),
  Omega: String.fromCharCode(945),
  alpha: String.fromCharCode(946),
  beta: String.fromCharCode(947),
  gamma: String.fromCharCode(948),
  delta: String.fromCharCode(949),
  epsilon: String.fromCharCode(950),
  zeta: String.fromCharCode(951),
  eta: String.fromCharCode(952),
  theta: String.fromCharCode(953),
  iota: String.fromCharCode(954),
  kappa: String.fromCharCode(956),
  lambda: String.fromCharCode(957),
  mu: String.fromCharCode(958),
  nu: String.fromCharCode(959),
  xi: String.fromCharCode(960),
  omicron: String.fromCharCode(961),
  pi: String.fromCharCode(963),
  rho: String.fromCharCode(964),
  sigma: String.fromCharCode(965),
  tau: String.fromCharCode(966),
  upsilon: String.fromCharCode(967),
  phi: String.fromCharCode(968),
  chi: String.fromCharCode(969),
  neg: String.fromCharCode(8722),
  mul: String.fromCharCode(215),
  div: String.fromCharCode(247),
  pm: String.fromCharCode(177),
  mp: String.fromCharCode(8723),
  inf: String.fromCharCode(8734),
  inc: String.fromCharCode(8710),
  dec: String.fromCharCode(8711),
  prod: String.fromCharCode(8719),
  sum: String.fromCharCode(8721),
  sqrt: String.fromCharCode(8730),
  star: String.fromCharCode(9733),
};

Array.prototype.unique = function() {
  return [...new Set(this)];
}

Array.prototype.shuffle = function() {
  this.forEach((_, i) => {
    let j = floor(random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  });
  return this;
};

Array.prototype.toShuffled = function() {
  return this.slice().shuffle()
};

Array.prototype.random = function() {
  return this[floor(random()*this.length)];
};

Array.prototype.remove = function(item) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === item) {
      this.splice(i, 1);
      return item;
    }
  }
};

Array.prototype.removeAll = function(item) {
  var ret = false;
  for (var i = 0; i < this.length; ) {
    if (this[i] === item) {
      this.splice(i, 1);
      ret = true;
    } else i++;
  }
  if (ret) return item;
};

class SetArray extends Array {
  constructor() {
    super(...arguments);
  }

  push(...elements) {
    return super.push(...elements.filter(element => !this.includes(element)));
  }
  unshift(...elements) {
    return super.unshift(...elements.filter(element => !this.includes(element)));
  }
  add(value) {
    this.push(value);
    return this;
  }
  clear() {
    this.splice(0,this.length);
  }
  delete(value) {
    var index = this.indexOf(value);
    if (index > -1) {
      this.splice(index,1);
      return true;
    }
    return false;
  }
  has(value) {
    return this.includes(value);
  }
}

// Stack.inspect(stack) expose internal array
// Stack.inspect() expose internal WeakMap

var Stack = (function() {
  var data = new WeakMap();

  class Stack {
    type = this.constructor.name;

    constructor() {
      data.set(this, []);
    }

    push(item) {
      data.get(this).push(item);
    }

    pop() {
      return data.get(this).pop();
    }

    peek() {
      return data.get(this).at(-1);
    }

    static inspect(instance) {
      return instance ? data.get(instance) : data;
    }
  }

  return Stack;
})();