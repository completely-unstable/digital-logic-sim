class Component {
  type = this.constructor.name;

  constructor(x,y) {
    this.position = vector(x,y);
    this.pins = new Pins();
    this.attributes = ['x','y','type','setFromIC'];
    this.setFromIC = false;
    addAttribute.rotation(this);
    this.metrics = getMetrics(this.type);
  }

  remove() {
    var index = circuit.components.indexOf(this);
    if (index > -1) circuit.components.splice(index,1);
  }

  addPin(dx,dy,type,label='') {
    var pin = new Pin(dx,dy,this,type,label);
    this.pins.push(pin);
    return pin;
  }

  removePin(pin) {
    this.pins.removePin(pin);
  }

  getParameterBindings() {
    return this;
  }

  selected() {
    return selection.find(s => s[1] === this);
  }

  drawLocal(ctx,x,y) {
    var svg = this.metrics.svg,
        sp = toScreen(x + this.metrics.offset.x, y + this.metrics.offset.y),
        sw = this.metrics.scale * svg.width / svg.height * scale,
        sh = this.metrics.scale * scale;
    ctx.drawImage(
        svg,
        sp.x - sw / 2, sp.y - sh / 2,
        sw, sh
    );
  }

  drawBoundingBox(ctx) {
    ctx.strokeStyle = 'magenta';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      toScreenX(this.x+this.metrics.bounds[0]),
      toScreenY(this.y+this.metrics.bounds[2]),
      (this.metrics.bounds[1]-this.metrics.bounds[0])*scale,
      (this.metrics.bounds[3]-this.metrics.bounds[2])*scale
    );
  }

  draw(ctx) {
    if (this.pins.length) {
      var rc = toScreen(this.x + this.pins[0].x, this.y + this.pins[0].y);
    } else {
      var rc = toScreen(this.x + this.metrics.offset.x, this.y + this.metrics.offset.y);
    }

    ctx.save();
    ctx.translate(rc.x, rc.y);
    ctx.rotate(-this.rotation*pi2);
    if (this.mirror) {
        ctx.scale(1, -1);  // Flip vertically
    }

    ctx.translate(-rc.x, -rc.y);
    ctx.strokeStyle = this.selected() ? 'magenta' : 'white';
    ctx.lineWidth = scale / 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawLocal(ctx,this.x,this.y);

    if (this instanceof DIL) {
      if (hovering === this) drawDILPinLabels2(ctx,this.x,this.y,this.pins);
    } else if (this?.shape === 'DIL') {
      if (hovering === this) drawDILPinLabels(ctx,this.x,this.y,this.pins);
    } else {
      drawPinLabels(ctx,this.x,this.y,this.pins,this?.inverted ?? []);
    }
    ctx.restore();

    if (this.type === 'LED' ? !running : this?.shape !== 'DIL') drawPins(ctx,this.x,this.y,this.pins,this?.inverted ?? [], this.rotation);
  }

  drawPins(ctx,x,y) {
    var inv = this?.inverted ?? [];
    var pins = this.pins;
    var inps = this.pins.inputs;
    var outs = this.pins.outputs;
    var scale = scale;
    ctx.lineWidth = 1/5 * scale;
    ctx.strokeStyle = 'white';
    inv.forEach(i => {
      var p = pins[i];
      var dir = p.type === 'output' ? -1 : 1;
      if (this.rotation === 0) p = toScreen(this.x + p.x + dir*.55, this.y + p.y);
      if (this.rotation === 1) p = toScreen(this.x + p.x, this.y + p.y - dir*.55);
      if (this.rotation === 2) p = toScreen(this.x + p.x - dir*.55, this.y + p.y);
      if (this.rotation === 3) p = toScreen(this.x + p.x, this.y + p.y + dir*.55);
      ctx.beginPath();
      ctx.arc(p.x,p.y,scale*10/20,-pi+pi*dir,pi+pi*dir);
      ctx.closePath();
      ctx.stroke();
    });

    drawPins(ctx,x,y,pins);
    drawPinLabels(ctx,x,y,pins,inv);

  }

  static drawScreen(ctx,point,scale=20) {
    var svg = this.metrics.svg,
        sp = point.add([this.metrics.offset.x*scale, this.metrics.offset.y*scale]),
        sw = this.metrics.scale * svg.width/svg.height* scale,
        sh = this.metrics.scale * scale;
    ctx.drawImage(
      svg,
      sp.x - sw / 2,
      sp.y - sh / 2,
      sw, sh
    );
  }

  static containsPoint(pos, point, scale) {
    return (
      (pos[0] + this.metrics.bounds[0]*scale < point[0]) &&
      (pos[0] + this.metrics.bounds[1]*scale > point[0]) &&
      (pos[1] + this.metrics.bounds[2]*scale < point[1]) &&
      (pos[1] + this.metrics.bounds[3]*scale > point[1]));
  }

  containsPoint(point) {
    return (
      (this.x + this.metrics.bounds[0] < point[0]) &&
      (this.x + this.metrics.bounds[1] > point[0]) &&
      (this.y + this.metrics.bounds[2] < point[1]) &&
      (this.y + this.metrics.bounds[3] > point[1]));
  }

  withinRect(p1, p2) {
    return (
      (this.x + this.metrics.bounds[1] < p2[0]) &&
      (this.x + this.metrics.bounds[0] > p1[0]) &&
      (this.y + this.metrics.bounds[3] < p2[1]) &&
      (this.y + this.metrics.bounds[2] > p1[1])
    );
  }

  unwrapAndApply(fn) {
    var _r = this.rotation,
        _m = this.mirror;
    this.rotation = 0;
    this.mirror = false;
    fn.call(this);
    this.mirror = _m;
    this.rotation = _r;
  }

  get x() {return this.position.x;}
  get y() {return this.position.y;}
  set x(x) {this.position.x = x;}
  set y(y) {this.position.y = y;}
}

class Input extends Component {
  static metrics = getMetrics('Input');
  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.state = 0;
    this.locked = false;
    this.readState = null;
    addAttribute(this,'bits','label','dual','inverted');
    var set_width = w => {this.unwrapAndApply(() => {
      this.metrics.bounds[0] = -(w+.15);
    })};
    var set_height = h => {this.unwrapAndApply(() => {
      this.metrics.bounds[2] = -(h+.2)/2;
      this.metrics.bounds[3] = +(h+.2)/2;
    })};
    addAttribute.nonNegativeNumber(this,'width',1.5,set_width);
    addAttribute.nonNegativeNumber(this,'height',1.5,set_height);
    addAttribute.numFormat(this,'numFormat','dec');
    addAttribute.autoPos(this,'autoPos',true);
    addAttribute.number(this,'pinx',0);
    addAttribute.number(this,'piny',0);
  }

  drawLocal(ctx,x,y) {
    var drawBG = this.small ? drawSmallInputBG : drawInputBG;
    var drawDot = this.small ? drawSmallIODot : drawIODot;
    var w = this.width;
    var h = this.height;

    if (running) {
      if (this.state === null && this.readState !== null) {
        drawBG(ctx,x,y,w,h,this.readState ? '#5EFF5C' : '#6600FF');
      } else {
        drawBG(ctx,x,y,w,h);
      }
      if (this.state === null) {
        drawDot(ctx,x,y,w,h,'#808080');
      } else {
        drawDot(ctx,x,y,w,h,this.state ? '#5EFF5C' : '#6600FF');
      }
    } else {
      drawBG(ctx,x,y,w,h);
      drawDot(ctx,x,y,w,h);
    }

    var p = toScreen(this.x,this.y);
    if (this.bits > 1) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'center';
      var num = this.state === null ? this.readState : this.state;
      if (num === null) {
        num = 'Z';
      } else if (this.numFormat === 'hex') {
        num = '0x' + num.toString(16).toUpperCase().padStart(ceil(this.bits/4),'0');
      } else if (this.numFormat === 'bin') {
        num = '0b' + num.toString(2).padStart(this.bits,'0');
      } else if (this.numFormat === 'dec') {
        num = num.toString();
      } else if (this.numFormat === 'signdec') {
        num = toSigned(num,this.bits);
      }
      ctx.fillText(num, p.x - .8*scale, p.y - 1.5*scale);
    }
    if (this.label.length) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'end';
      var tm = ctx.measureText(this.label);

      ctx.fillText(this.label, p.x - 2*scale, p.y + 0.5*scale);
    }
  }

  update(immediate=false) {
    if (this.locked) this.state = null;
    var pin = this.pins[0];
    var inv = pin.inverted;
    var bitMask = mask(this.bits);
    var ns;
    if (this.state === null) {
      ns = pin.state;
      if (ns !== null) {
        if (inv) ns = ~ns;
        ns &= bitMask;
      }
      this.readState = ns;
      if (immediate) {
        pin.update(null);
      } else {
        pin.queue(null);
      }
    } else {
      ns = this.state;
      if (ns !== null) {
        if (inv) ns = ~ns;
        ns &= bitMask;
      }
      if (immediate) {
        pin.update(ns);
      } else {
        pin.queue(ns);
      }
    }
  }
}

class Clock extends Component {
  static metrics = getMetrics('Clock');
  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.state = 0;
    addAttribute(this,'label','frequency','inverted');
    this.label = 'CLK';
  }

  drawLocal(ctx,x,y) {
    var drawBG = this.small ? drawSmallInputBG : drawInputBG;
    var drawDot = this.small ? drawSmallClockSymbol : drawClockSymbol;

    drawBG(ctx,x,y);
    if (running) {
      drawDot(ctx,x,y,this.state ? '#5EFF5C' : '#6600FF');
    } else {
      drawDot(ctx,x,y);
    }

    var p = toScreen(this.x,this.y);
    if (this.bits > 1) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(+this.state, p.x - 1*scale, p.y - 1.5*scale);
    }
    if (this.label.length) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'end';
      var tm = ctx.measureText(this.label);

      ctx.fillText(this.label, p.x - 2*scale, p.y + 0.5*scale);
    }
  }

  update() {
    var inv = this.inverted;
    var ns = this.inverted.includes(0) ? 1-this.state : this.state;
    this.pins[0].queue(ns);
  }
}

class Button extends Component {
  static metrics = getMetrics('Button');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.state = 0;
    addAttribute.label(this);
    addAttribute.inverted(this);
    addAttribute.key(this);
    addAttribute.nonNegativeNumber(this,'fontSize',20);
    var set_width = w => {this.unwrapAndApply(() => {
      this.metrics.bounds[0] = -(w+.5);
    })};
    var set_height = h => {this.unwrapAndApply(() => {
      this.metrics.bounds[2] = -(h+1.1)/2;
      this.metrics.bounds[3] = +(h+.2)/2;
    })};
    addAttribute.nonNegativeNumber(this,'width',1.5,set_width);
    addAttribute.nonNegativeNumber(this,'height',1.5,set_height);
  }

  drawLocal(ctx,x,y) {
    var [w,h] = [this.width,this.height];
    if (!running || !this.state) {
      drawButton(ctx,x,y,w,h);
    } else {
      drawInputBG(ctx,x,y,w,h);
    }
    var p = toScreen(this.x - (w-1.5)/2,this.y);
    if (this.label.length) {
      ctx.fillStyle = 'white';
      ctx.font = (scale * this.fontSize/20) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      var tm = ctx.measureText(this.label);
      var h2 = (tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent)/2;
      if (this.state) {

        ctx.fillText(this.label, p.x - .8*scale, p.y + h2);
      } else {
        ctx.fillText(this.label, p.x - 1.15*scale, p.y - .35*scale + h2);
      }
    }
  }

  update() {
    var inv = this.inverted;
    var ns = this.inverted.includes(0) ? 1-this.state : this.state;
    this.pins[0].update(ns);
  }
}

class ButtonPad extends Component {
  constructor(x,y) {
    super(x,y);
    var setter = () => this.calcBounds();

    addAttribute.nonNegativeNumber(this,'buttonWidth',1.5,setter);
    addAttribute.nonNegativeNumber(this,'buttonHeight',1.5,setter);

    addAttribute.nonNegativeNumber(this,'rowGap',1,setter);
    addAttribute.nonNegativeNumber(this,'columnGap',1,setter);

    addAttribute.positiveInt(this,'rows',2,setter);
    addAttribute.positiveInt(this,'cols',2,setter);

  }

  calcBounds() {
    this.metrics.bounds[0] = -((this.buttonWidth + .5)*this.cols + this.columnGap*(this.cols + 1)) - .35;
    this.metrics.bounds[2] = -((this.buttonHeight + .5)*this.rows + this.rowGap*(this.rows + 1)) + .15;
  }

  drawLocal(ctx,x,y) {
    drawButtonPad(ctx,x,y,this.rows,this.cols,this.buttonWidth,this.buttonHeight,this.rowGap,this.columnGap,[]);
  }
}

class SegmentDisplay extends Component {
  static metrics = getMetrics('SevenSegment');

  constructor(x,y) {
    super(x,y);
    addAttribute.display(this);
    addAttribute.encoding(this,'encoding',null);
    addAttribute.color(this);
    addAttribute.color(this,'offColor','#333333');
    this.encoding = 'noneSplit';
    this.drawLocal = this.drawFn['7seg']['noneSplit'];
  }

  drawFn = {
    '7seg': {
      'noneSplit': function(ctx,x,y) {
        if (running) {
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,this.pins.map(pin => !!pin.state));
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'noneBus': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          var states = range(7).map(i => getBit(state,i));
          states.push(this.pins[1].state ?? 0);
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'bcd': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          var states = [
                [0,2,3,5,7,8,9].includes(state),
                [0,1,2,3,4,7,8,9].includes(state),
                [0,1,3,4,5,6,7,8,9].includes(state),
                [0,2,3,5,6,8].includes(state),
                [0,2,6,8].includes(state),
                [0,4,5,6,8,9].includes(state),
                [2,3,4,5,6,8,9].includes(state),
                this.pins[1].state ?? 0,
              ];
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'bcdTail': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          var states = [
                [0,2,3,5,6,7,8,9].includes(state),
                [0,1,2,3,4,7,8,9].includes(state),
                [0,1,3,4,5,6,7,8,9].includes(state),
                [0,2,3,5,6,8,9].includes(state),
                [0,2,6,8].includes(state),
                [0,4,5,6,8,9].includes(state),
                [2,3,4,5,6,8,9].includes(state),
                this.pins[1].state ?? 0,
              ];
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'hex': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          var states = [
                [0,2,3,5,7,8,9,10,12,14,15].includes(state),
                [0,1,2,3,4,7,8,9,10,13].includes(state),
                [0,1,3,4,5,6,7,8,9,10,11,13].includes(state),
                [0,2,3,5,6,8,11,12,13,14].includes(state),
                [0,2,6,8,10,11,12,13,14,15].includes(state),
                [0,4,5,6,8,9,10,11,12,14,15].includes(state),
                [2,3,4,5,6,8,9,10,11,13,14,15].includes(state),
                this.pins[1].state ?? 0,
              ];
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'hexTail': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          var states = [
                [0,2,3,5,6,7,8,9,10,12,14,15].includes(state),
                [0,1,2,3,4,7,8,9,10,13].includes(state),
                [0,1,3,4,5,6,7,8,9,10,11,13].includes(state),
                [0,2,3,5,6,8,9,11,12,13,14].includes(state),
                [0,2,6,8,10,11,12,13,14,15].includes(state),
                [0,4,5,6,8,9,10,11,12,14,15].includes(state),
                [2,3,4,5,6,8,9,10,11,13,14,15].includes(state),
                this.pins[1].state ?? 0,
              ];
          draw7Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
    },
    '16seg': {
      'noneBus': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          var states = range(16).map(i => getBit(state,i));
          states.push(this.pins[1].state ?? 0);
          draw16Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw16Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'bcd': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          state = [37119,4108,887,575,908,955,1019,36867,1023,959][state];
          var states = range(16).map(i => getBit(state,i));
          states.push(this.pins[1].state ?? 0);
          draw16Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw16Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'hex': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(4);
          state = [37119,4108,887,575,908,955,1019,36867,1023,959,975,19007,243,18495,499,451][state];
          var states = range(16).map(i => getBit(state,i));
          states.push(this.pins[1].state ?? 0);
          draw16Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw16Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
      'ascii': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          state = state === null ? 0 : state & mask(7);
          state = [
     0,     0,     0,     0,     0,     0,     0,     0,
     0,     0,     0,     0,     0,     0,     0,     0,
     0,     0,     0,     0,     0,     0,     0,     0,
     0,     0,     0,     0,     0,     0,     0,     0,
     0, 65540,  2052, 19260, 19387, 56217, 11633,  2048,
 12288, 33792, 65280, 19200,    24,   768, 65536, 36864,
 37119,  4108,   887,   575,   908,   955,  1019, 36867,  
  1023,   959,    18,    26,  8704,   816, 33024, 66071,
  2807,   975, 19007,   243, 18495,   499,   451,   763,
   972, 18483, 18467, 12736,   240,  5324,  9420,   255,
   967,  8447,  9159,   955, 18435,   252, 37056, 41164,
 46080, 21504, 36915, 18450,  9216, 18465,  4100,    48,
  1024, 24928, 16864,   352, 16924, 33120, 19202,  2590,
 16832, 16688, 18528, 30720, 18481, 17224, 16704, 16736,
  2497,  2574,   320,  8720, 19216, 16408,  8200, 41032,
 46080,  2588, 33056, 33825, 18432, 12306,  2693,     0,
            ][state];
          var states = range(17).map(i => getBit(state,i));
          draw16Seg(ctx,x-3,y-7,this.color,this.offColor,states);
        } else draw16Seg(ctx,x-3,y-7,this.color,this.offColor);
      },
    },
    'MNEflags': {
      'noneSplit': function(ctx,x,y) {
        if (running) {
          drawMNEflags(ctx,x-3,y-7,this.color,this.offColor,this.pins.map(pin => !!pin.state));
        } else drawMNEflags(ctx,x-3,y-7,this.color,this.offColor);
      },
      'noneBus': function(ctx,x,y) {
        if (running) {
          var state = this.pins[0].state;
          var states = range(3).map(i => getBit(state,i));
          drawMNEflags(ctx,x-3,y-7,this.color,this.offColor,states);
        } else drawMNEflags(ctx,x-3,y-7,this.color,this.offColor);
      },
    }
  };

  update() {}
}

class SevenSegment extends Component {
  static metrics = getMetrics('SevenSegment');

  constructor(x,y) {
    super(x,y);
    var set_hex = hex => {
      this.pins.removeInputs();
      if (hex) {
        this.addPin(0,0,'input');
        this.addPin(-1,0,'input');
      } else {
        this.addPin(-3,-7,'input');
        this.addPin(-2,-7,'input');
        this.addPin(-1,-7,'input');
        this.addPin(0,-7,'input');
        this.addPin(-3,0,'input');
        this.addPin(-2,0,'input');
        this.addPin(-1,0,'input');
        this.addPin(0,0,'input');
      }
    };
    addAttribute.bool(this,'hex',true,set_hex);
    this.hex = false;
  }

  drawLocal(ctx,x,y) {
    if (running) {
      if (this.hex) {
        var state = this.pins[1].state;
        state = state === null ? 0 : state & mask(4);
        var ag = [
              [0,2,3,5,6,7,8,9,10,12,14,15].includes(state),
              [0,1,2,3,4,7,8,9,10,13].includes(state),
              [0,1,3,4,5,6,7,8,9,10,11,13].includes(state),
              [0,2,3,5,6,8,9,11,12,13,14].includes(state),
              [0,2,6,8,10,11,12,13,14,15].includes(state),
              [0,4,5,6,8,9,10,11,12,14,15].includes(state),
              [2,3,4,5,6,8,9,10,11,13,14,15].includes(state),
              this.pins[0].state ?? 0,
            ];
        draw7Seg(ctx,x-3,y-7,this.color,this.offColor,ag);
      } else {
        draw7Seg(ctx,x-3,y-7,this.color,this.offColor,this.pins.map(pin => !!pin.state));
      }
    } else {
      draw7Seg(ctx,x-3,y-7,this.color,this.offColor);
    }
  }

  update() {}
}



class SixteenSegment extends Component {
  static metrics = getMetrics('SixteenSegment');

  constructor(x,y) {
    super(x,y);
    var set_ascii = ascii => {
      this.pins.removeInputs();
      if (ascii) {
        this.addPin(0,0,'input');
      } else {
        this.addPin(0,0,'input');
        this.addPin(-1,0,'input');
      }
    };
    addAttribute.bool(this,'ascii',true,set_ascii);
    this.ascii = false;
  }

  drawLocal(ctx,x,y) {
    if (running) {
      if (this.ascii) {
        var state = this.pins[0].state;
        state = state === null ? 0 : state & mask(7);
        state = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65540,2052,19260,19387,56217,11633,2048,12288,33792,65280,19200,24,768,65536,36864,37119,4108,887,575,908,955,1019,36867,1023,959,18,26,8704,816,33024,535,2807,975,19007,243,18495,499,451,763,972,18483,18467,12736,240,5324,9420,255,967,8447,9159,955,18435,252,37056,41164,46080,21504,36915,18450,9216,18465,4100,48,1024,24928,16864,352,16924,33120,19202,2590,16832,16688,18528,30720,18481,17224,16704,16736,2497,2574,320,8720,19216,16408,8200,41032,46080,2588,33056,33825,18432,12306,2693,0][state];
        var ag = range(17).map(b => !!(state & (1<<b)));
        draw16Seg(ctx,x-3,y-7,ag);
      } else {
        var state = this.pins[1].state;
        var ag = range(16).map(b => !!(state & (1<<b)));
        ag.push(this.pins[0].state ?? 0);
        draw16Seg(ctx,x-3,y-7,ag);
      }
    } else {
      draw16Seg(ctx,x-3,y-7);
    }
  }


  update() {}
}

class Joystick extends Component {
  static metrics = getMetrics('Joystick');
  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.addPin(2,-2,'output');
    addAttribute.bits(this);
    addAttribute.bool(this,'gray',true);
    addAttribute.bool(this,'sticky',false);
    addAttribute.keys(this);
    this.thumb = vector(0,0);
  }

  setThumb(v) {
    this.thumb[0] = v[0] - (this.position[0] + this.metrics.offset[0]);
    this.thumb[1] = v[1] - (this.position[1] + this.metrics.offset[1]);
  }

  resetThumb(v) {
    this.thumb.set([0,0]);
  }

  drawLocal(ctx,x,y) {
    if (running) {
      drawJoystick(ctx,x,y-2,this.thumb.x,this.thumb.y);
    } else {
      drawJoystick(ctx,x,y-2);
    }
  }

  update() {
    if (this.thumb.eq([0,0])) {
      this.pins[0].queue(0);
      this.pins[1].queue(0);
      return;
    }
    var theta = atan2(this.thumb.y,this.thumb.x);
    var sec = 1 / (1 << this.bits);
    var ns = floor(mod((theta + pi*sec)/tau,1)/sec);
    if (this.gray) ns = binToGray(ns,this.bits);
    this.pins[0].queue(ns);
    this.pins[1].queue(1);
  }
}

class RotaryEncoder extends Component {
  static metrics = getMetrics('RotaryEncoder');
  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    addAttribute.bits(this);
    addAttribute.bool(this,'gray',true);
    this.thumb = vector(1,0);
    this.sticky = true;
    this.lastUpdate = 0;
  }

  setThumb(v) {
    this.thumb[0] = v[0] - (this.position[0] + this.metrics.offset[0]);
    this.thumb[1] = v[1] - (this.position[1] + this.metrics.offset[1]);
  }

  resetThumb(v) {
    this.thumb.set([1,0]);
  }

  drawLocal(ctx,x,y) {
    if (running) {
      drawRotaryEncoder(ctx,x,y-2,this.thumb.x,this.thumb.y);
    } else {
      drawRotaryEncoder(ctx,x,y-2);
    }
  }

  update() {
    if (this.lastUpdate > tick) this.lastUpdate = tick;
    if (this.lastUpdate > tick - 5) return;
    this.lastUpdate = tick;
    var theta = atan2(this.thumb.y,this.thumb.x);
    var sec = 1 / (1 << this.bits);
    var ns = floor(mod((theta + pi*sec)/tau,1)/sec);
    if (this.gray) ns = binToGray(ns,this.bits);
    this.pins[0].update(ns);
  }
}



class Output extends Component {
  static metrics = getMetrics('Output');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.state = 0;
    addAttribute(this,'bits','label','inverted','smallShape');
    addAttribute.numFormat(this,'numFormat','dec');
    addAttribute.autoPos(this,'autoPos',true);
    addAttribute.number(this,'pinx',0);
    addAttribute.number(this,'piny',0);
  }


  drawLocal(ctx,x,y) {
    var drawBG = this.small ? drawSmallOutputBG : drawOutputBG;
    var drawDot = this.small ? drawSmallIODot : drawIODot;
    var dotoffset = this.small ? 1.1 : 1.6;
    drawBG(ctx,x,y);
    if (running) {
      if (this.state === null) {
        drawDot(ctx,x+dotoffset,y,1.5,1.5,'#808080');
      } else {
        drawDot(ctx,x+dotoffset,y,1.5,1.5,this.state ? '#5EFF5C' : '#6600FF');
      }
    } else {
      drawDot(ctx,x+dotoffset,y);
    }
    var p = toScreen(this.x,this.y);
    if (this.bits > 1) {
      var p = toScreen(this.x,this.y);
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'center';
      var num = this.state;
      if (num === null) {
        num = 'Z';
      } else if (this.numFormat === 'hex') {
        num = '0x' + num.toString(16).toUpperCase().padStart(ceil(this.bits/4),'0');
      } else if (this.numFormat === 'bin') {
        num = '0b' + num.toString(2).padStart(this.bits,'0');
      } else if (this.numFormat === 'dec') {
        num = num.toString();
      } else if (this.numFormat === 'signdec') {
        num = toSigned(num,this.bits);
      }
      ctx.fillText(num, p.x + 1*scale, p.y - 1.5*scale);
    }
    if (this.label.length) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      ctx.textAlign = 'start';
      var tm = ctx.measureText(this.label);

      ctx.fillText(this.label, p.x + 2*scale, p.y + 0.5*scale);
    }

  }

  update() {
    var ns = this.pins[0].state;
    if (ns === null) {
      this.state = null;
      return;
    }
    var inv = this.inverted;
    var bitMask = mask(this.bits);
    ns = this.inverted.includes(0) ? ~ns : ns;
    ns &= bitMask;
    this.state = ns >>> 0;
  }
}

class LED extends Component {
  static metrics = getMetrics('LED');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.state = 0;
    addAttribute.color(this);
    addAttribute.nonNegativeNumber(this,'size',1.6);
    addAttribute.bool(this,'square',false);
    addAttribute.bool(this,'border',true);
  }


  drawLocal(ctx,x,y) {
    if (!this.border) ctx.strokeStyle = '#00000000';
    if (this.square) {
      if (!running || this.state) {
        drawSquareLED(ctx,x,y,this.color,this.size);
      } else {
        drawSquareLED(ctx,x,y,'black',this.size);
      }
    } else {
      if (!running || this.state) {
        drawLED(ctx,x,y,this.color,this.size);
      } else {
        drawLED(ctx,x,y,'black',this.size);
      }
    }
  }

  update() {
    this.state = this.pins[0].state ?? 0;
  }
}

class Buffer extends Component {
  static metrics = getMetrics('SmallBuffer');

  constructor(x,y) {
    super(x,y);
    addAttribute(this,'bits','inverted','mirror','complimentary');
    var small_setter = small => {
      this.metrics = small ? getMetrics('SmallBuffer') : getMetrics('Buffer');
    }
    addAttribute.smallShape(this,'small',small_setter);
    this.small = true;
    this.addPin(0,0,'input');
    this.addPin(2,0,'output');
  }

  drawLocal(ctx,x,y) {
    if (this.small) {
      drawSmallBuffer(ctx,x,y);
      if (this.compliment) drawComplimentaryOuts(ctx,x+2,y);
    } else {
      drawBuffer(ctx,x,y);
      if (this.compliment) drawComplimentaryOuts(ctx,x+3,y);
    }
  }

  update() {
    var inv = this.inverted;
    var bitMask = mask(this.bits);
    var inp = this.pins.inputs[0];
    var ns = inv.includes(0) ? ~inp.state : inp.state;
    ns &= bitMask;
    this.pins.outputs[0].queue(ns);
    if (this.compliment) {
      this.pins.outputs[1].queue(~ns & bitMask);
    }
  }
}

class Not extends Component {
  static metrics = getMetrics('SmallNot');
  constructor(x,y) {
    super(x,y);
    addAttribute(this,'bits','inverted','mirror','complimentary');
    this.addPin(0,0,'input');
    this.addPin(3,0,'output');
    var small_setter = small => {
      var dir = small ? -1 : 1;
      this.pins.outputs.forEach(pin => pin.x += dir);
      this.metrics = small ? getMetrics('SmallNot') : getMetrics('Not');
    }
    addAttribute.smallShape(this,'small',small_setter);
    this.small = true;
  }

  drawLocal(ctx,x,y) {
    if (this.small) {
      drawSmallNot(ctx,x,y);
    } else {
      drawNot(ctx,x,y);
    }
  }

  update() {
    var inv = this.inverted;
    var ns = inv.includes[0]
      ? (this.pins[0].state) & ((1<<this.bits)-1)
      : (~this.pins[0].state) & ((1<<this.bits)-1);
    var ns = (~this.pins[0].state) & ((1<<this.bits)-1);
    this.pins[1].queue(ns);
  }
}

class Gate extends Component {
  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.addPin(0,2,'input');
    this.addPin(3,1,'output');
    addAttribute(this,'bits','inputs','inverted','mirror','complimentary');
    var mb_setter = mb => {
      if (mb) {
        this.inputs = 1;
        this.pins[0].label = this.bits;
      } else {
        this.inputs = 2;
      }
    }
    addAttribute.bool(this,'multiBit',false,mb_setter);
    this.inputs = 2;
  }

  drawLocal(ctx,x,y) {
    var dy = (this.inputs - (this.inputs % 2)) / 2;
    this.drawFn(ctx,x,y+dy-1);
    if (this.compliment) drawComplimentaryOuts(ctx,x+3,y+dy);
  }

  update() {
    if (this.multiBit) {
      var inp = this.pins[0];
      var ns = (inp.inverted ? ~(inp.state ?? 0) : (inp.state ?? 0)) & this.mask.bits;
      ns = this.evaluate(...range(this.bits).map(i => getBit(ns,i)));
      this.pins.outputs.forEach(out => {
        if (out.inverted) {
          out.queue(~ns & 1);
        } else {
          out.queue(ns & 1);
        }
      });
    } else {
      var ns = this.evaluate(...this.pins.inputs.map(inp => 
        (inp.inverted ? ~(inp.state ?? 0) : (inp.state ?? 0)) & this.mask.bits
      ));
      this.pins.outputs.forEach(out => {
        if (out.inverted) {
          out.queue(flipBits(ns,this.mask.bits));
        } else {
          out.queue(maskBits(ns,this.mask.bits));
        }
      });
    }
  }
}

class And extends Gate {
  static metrics = getMetrics('And');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawAnd;
  }

  evaluate(...states) {
    return states.reduce((a,v) => a & v);
  }
}


class Or extends Gate {
  static metrics = getMetrics('Or');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawOr;
  }

  evaluate(...states) {
    return states.reduce((a,v) => a | v);
  }
}

class Xor extends Gate {
  static metrics = getMetrics('Xor');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXor;
  }

  evaluate(...states) {
    return states.reduce((a,v) => a ^ v)
  }
}

class Xand extends Gate {
  static metrics = getMetrics('Xand');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXand;
  }

  evaluate(...states) {
    var ns = 0;
    for (var i=0; i<this.bits; i++) {
      var count = states.reduce((a,v) => a+((v>>i)&1),0);
      if (count === 1) ns |= (1<<i);
    }
    return ns;
  }
}

class NGate extends Gate {
  constructor(x,y) {
    super(x,y);
    this.pins.outputs[0].x++;
  }

  drawLocal(ctx,x,y) {
    var dy = (this.inputs - (this.inputs % 2)) / 2;
    this.drawFn(ctx,x,y+dy-1);
    if (this.compliment) drawComplimentaryOuts(ctx,x+4,y+dy);
  }
}

class Nand extends NGate {
  static metrics = getMetrics('Nand');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawNand;
    this.type = 'Nand';
  }

  evaluate(...states) {
    return ~states.reduce((a,v) => a & v);
  }
}

class Nor extends NGate {
  static metrics = getMetrics('Nor');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawNor;
    this.type = 'Nor';
  }

  evaluate(...states) {
    return ~states.reduce((a,v) => a | v);
  }
}

class Xnor extends NGate {
  static metrics = getMetrics('Xnor');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXnor;
    this.type = 'Xnor';
  }

  evaluate(...states) {
    return ~states.reduce((a,v) => a ^ v);
  }
}

class Xnand extends NGate {
  static metrics = getMetrics('Xnand');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXnand;
    this.type = 'Xnand';
  }

  evaluate(...states) {
    var ns = 0;
    for (var i=0; i<this.bits; i++) {
      var count = states.reduce((a,v) => a+((v>>i)&1),0);
      if (count === 1) ns |= (1<<i);
    }
    return ~ns;
  }
}

class Majority extends Gate {
  static metrics = getMetrics('Majority');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawMajority;
    this.type = 'Majority';
  }

  evaluate(...states) {
    var count = Array(this.bits).fill(0);
    states.forEach(state => {
      for (var i = 0; i < this.bits; i++) 
        if (state & (1<<i)) count[i]++;
    });
    return count.reduce((a,c,i) => 
      a | ((c >= ceil(states.length/2)) << i), 0
    );
  }
}

class Minority extends NGate {
  static metrics = getMetrics('Minority');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawMinority;
    this.type = 'Minority';
  }

  evaluate(...states) {
    var count = Array(this.bits).fill(0);
    states.forEach(state => {
      for (var i = 0; i < this.bits; i++) 
        if (state & (1<<i)) count[i]++;
    });
    return ~count.reduce((a,c,i) => 
      a | ((c >= ceil(states.length/2)) << i), 0
    );
  }
}

class Xmajority extends Gate {
  static metrics = getMetrics('Xmajority');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXmajority;
    this.type = 'Xmajority';
  }

  evaluate(...states) {
    var count = Array(this.bits).fill(0);
    states.forEach(state => {
      for (var i = 0; i < this.bits; i++) 
        if (state & (1 << i)) count[i]++;
    });
    return count.reduce((a, c, i) => 
      a | ((c === floor(states.length / 2)) << i), 0
    );
  }
}

class Xminority extends NGate {
  static metrics = getMetrics('Xminority');

  constructor(x,y) {
    super(x,y);
    this.drawFn = drawXminority;
    this.type = 'Xminority';
  }

  evaluate(...states) {
    var count = Array(this.bits).fill(0);
    states.forEach(state => {
      for (var i = 0; i < this.bits; i++) 
        if (state & (1 << i)) count[i]++;
    });
    return ~count.reduce((a, c, i) => 
      a | ((c === floor(states.length / 2)) << i), 0
    );
  }
}

class LUT extends Component {
  static metrics = getMetrics('LUT');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.addPin(0,2,'input');
    this.addPin(3,1,'output');
    addAttribute(this,'bits','inputs','data','inverted');
  }

  draw(ctx) {
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 4/20 * scale;
    var sp = toScreen(this.x, this.y-.5);
    var c = toScreen(this.x+ this.metrics.offset.x, this.y+this.metrics.offset.y);
    var pl = this.pins.inputs.length;
    ctx.fillRect(
      sp.x+scale/20,sp.y,
      3*scale-scale/10,
      (pl+(pl%2===0))*scale
    );
    ctx.strokeRect(
      sp.x+scale/20,sp.y,
      3*scale-scale/10,
      (pl+(pl%2===0))*scale
    );
    ctx.fillStyle = 'white';
    ctx.font = scale + 'px monospace';
    ctx.textAlign = 'center';
    var tm = ctx.measureText('LUT');
    var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
    ctx.fillText('LUT',c.x,c.y+th/2);
    this.drawPins(ctx);
  }

  update() {
    var inv = this.inverted;
    var states = this.pins.inputs.map((pin,i) => {
      if (inv.includes(i)) return (~pin.state) & 1;
      return pin.state & 1;
    });
    var ns = 0;
    for (var i = 0; i < this.inputs; i++) {
      ns |= (states[i] << i);
    }
    this.pins.outputs[0].queue(this.data[ns]);
  }
}

class Switch extends Component {
  static metrics = getMetrics('Switch');

  constructor(x,y) {
    super(x,y);
    this.a = this.addPin(0,0,'input');
    this.b = this.addPin(2,0,'input');
    this.type = 'Switch';
    this.closed = false;
    var dt_setter = dt => {
      if (dt) {
        this.c = this.addPin(2,1,'input');
        this.update = this.updateDT;
      } else {
        this.c.remove();
        this.update = this.updateST;
      }
    }
    addAttribute.bool(this,'dt',false,dt_setter);
    this.update = this.updateST;
  }

  drawLocal(ctx,x,y) {
    if (this.dt) {
      if (running && this.closed) {
        drawDTSwitchDown(ctx,x,y);
      } else {
        drawDTSwitchUp(ctx,x,y);
      }
    } else {
      if (running && this.closed) {
        drawSwitchClosed(ctx,x,y);
      } else {
        drawSwitchOpen(ctx,x,y);
      }
    }
  }

  getOtherPin(pin) {
    if (this.dt) {
      if (pin === this.a && !this.closed) return this.b;
      if (pin === this.a && this.closed) return this.c;
      if (pin === this.b && !this.closed) return this.a;
      if (pin === this.c && this.closed) return this.a;
      return null;
    } else {
      if (pin === this.a && this.closed) return this.b;
      if (pin === this.b && this.closed) return this.a;
      return null;
    }
  }

  updateST() {
    var pa = this.a;
    var pb = this.b;
    var sg = this.closed;
    var sa = pa.state;
    var sb = pb.state;
    var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
    pa.update(state);
    pb.update(state);
  }

  updateDT() {
    var pa = this.a;
    var pb = this.b;
    var pc = this.c;
    var sg = this.closed;
    var sa = pa.state;
    var sb = pb.state;
    var sc = pc.state;
    if (sg) {
      var state = pa.connectionGroup.isDriven ? sa : pc.connectionGroup.isDriven ? sc : null;
      pa.update(state);
      pb.update(null);
      pc.update(state);
    } else {
      var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
      pa.update(state);
      pb.update(state);
      pc.update(null);
    }
  }
}

class Driver extends Component {
  static metrics = getMetrics('Driver');

  constructor(x,y) {
    super(x,y);
    this.in = this.addPin(0,0,'input');
    this.sel = this.addPin(1,-1,'input');
    this.out = this.addPin(2,0,'output');
    this.sel.bubble = false;
    addAttribute(this,'bits','mirror','inverted');
  }

  drawLocal(ctx,x,y) {
    if (this.inverted.includes(1)) {
      drawDriverInv(ctx,x,y);
    } else {
      drawDriver(ctx,x,y);
    }
  }

  update() {
    var ns = this.in.state;
    if (this.in.inverted !== this.out.inverted) {
      ns = flipBits(ns,this.bits);
    } else {
      ns = maskBits(ns,this.bits);
    }
    var sel = this.sel.state;
    if (this.sel.inverted) sel = flipBits(sel,1);
    if (sel) {
      this.out.queue(ns);
    } else {
      this.out.queue(null);
    }
  }
}

class DriverInv extends Component {
  static metrics = getMetrics('DriverInv');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.addPin(1,-1,'input');
    this.addPin(2,0,'output');
    addAttribute(this,'bits','mirror','inverted');
  }

  drawLocal(ctx,x,y) {
    drawDriverInv(ctx,x,y);
  }

  update() {
    var inv = this.inverted;
    var inn = inv.includes(0)
      ? ~this.pins[0].state
      : this.pins[0].state;
    inn &= ((1<<this.bits)-1);
    var sel = !this.pins[1].state;
    var ns = sel ? inn : null;
    this.pins[2].queue(ns);
  }
}

class Tunnel extends Component {
  static metrics = getMetrics('Tunnel');

  constructor(x, y) {
    super(x, y);
    this.addPin(0,0,'dual');
    this.type = 'Tunnel';
    addAttribute.label(this);
  }

  draw(ctx) {
    var rc = toScreen(this.x + this.pins[0].x, this.y + this.pins[0].y);

    ctx.save();
    ctx.translate(rc.x, rc.y);
    ctx.rotate(-this.rotation*pi2);
    if (this.mirror) {
        ctx.scale(1, -1);  // Flip vertically
    }

    ctx.translate(-rc.x, -rc.y);
    ctx.strokeStyle = this.selected() ? 'magenta' : 'white';
    ctx.lineWidth = scale / 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawTunnel(ctx,this.x,this.y);
    ctx.restore();
    if (this.label.length) {
      ctx.fillStyle = 'white';
      ctx.font = (scale) + 'px monospace';
      var tm = ctx.measureText(this.label);
      if (this.rotation === 2) {
        ctx.textAlign = 'end';
        ctx.fillText(this.label, toScreenX(this.x) - 1.5*scale, toScreenY(this.y) + 0.5*scale);
      } else {
        ctx.textAlign = 'start';
        ctx.fillText(this.label, toScreenX(this.x) + 1.5*scale, toScreenY(this.y) + 0.5*scale);
      }
    }
    this.drawPins(ctx,this.x,this.y,this.pins);
  }
}

class NMOS extends Component {
  static metrics = getMetrics('NMOS');

  constructor(x, y) {
    super(x, y);
    this.gate = this.addPin(0, 0, 'input');
    this.drain = this.addPin(1, -1, 'input');
    this.source = this.addPin(1, 1, 'input');
    addAttribute.bits(this);
    this.closed = false;
  }

  drawLocal(ctx,x,y) {
    drawNMOS(ctx,x,y);
  }

  getOtherPin(pin) {
    if (!this.closed) return null;
    if (pin === this.source) return this.drain;
    if (pin === this.drain) return this.source;
    return null;
  }

  update() {
    var pg = this.pins[0];
    var pa = this.pins[1];
    var pb = this.pins[2];
    var sg = pg.state;
    var sa = pa.state;
    var sb = pb.state;
    var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
    this.closed = sg && sg !== null;
    pa.queue(state);
    pb.queue(state);
  }
}

class PMOS extends Component {
  static metrics = getMetrics('PMOS');

  constructor(x, y) {
    super(x, y);
    this.gate = this.addPin(0, 0, 'input');
    this.source = this.addPin(1, 1, 'input');
    this.drain = this.addPin(1, -1, 'input');
    addAttribute.bits(this);
    this.closed = false;
  }

  drawLocal(ctx,x,y) {
    drawPMOS(ctx,x,y);
  }

  getOtherPin(pin) {
    if (!this.closed) return null;
    if (pin === this.source) return this.drain;
    if (pin === this.drain) return this.source;
    return null;
  }

  update() {
    var pg = this.pins[0];
    var pa = this.pins[1];
    var pb = this.pins[2];
    var sg = pg.state;
    var sa = pa.state;
    var sb = pb.state;
    var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
    this.closed = !sg && sg !== null;
    pa.queue(state);
    pb.queue(state);
  }
}

class Supply extends Component {
  static metrics = getMetrics('Supply');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    addAttribute.bits(this);
    this.drawLocal = drawSupply;
  }

  update() {
    this.pins[0].queue(this.mask.bits);
  }
}

class Ground extends Component {
  static metrics = getMetrics('Ground');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.drawLocal = drawGround;
  }

  update() {
    this.pins[0].queue(0);
  }
}

class Constant extends Component {
  static metrics = getMetrics('Constant');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    addAttribute(this,'bits','value');
  }

  draw(ctx) {
    
    var p = toScreen(this.x,this.y);

    ctx.fillStyle = 'white';
    ctx.font = (scale) + 'px monospace';
    ctx.textAlign = 'end';
    var tm = ctx.measureText(this.value);

    ctx.fillText(this.value, p.x - .5*scale, p.y);
    this.drawPins(ctx);
  }

  static drawScreen(ctx,point,scale=20) {

    ctx.fillStyle = 'white';
    ctx.font = (scale*2) + 'px monospace';
    ctx.textAlign = 'end';
    ctx.fillText(1, point.x, point.y);
  }
    
  update() {
    this.pins[0].queue(this.value);
  }
}

class PullUp extends Component {
  static metrics = getMetrics('PullUp');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.drawLocal = drawPullUp;
    addAttribute.bits(this);
  }

  update() {
    this.pins[0].queue(this.mask.bits,false);
  }
}


class PullDown extends Component {
  static metrics = getMetrics('PullDown');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.drawLocal = drawPullDown;
  }

  update() {
    this.pins[0].queue(0,false);
  }
}

class Splitter extends Component {
  static metrics = getMetrics('Splitter');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input');
    this.addPin(1,0,'output');
    this.addPin(1,1,'output');
    this.addPin(1,2,'output');
    this.addPin(1,3,'output');
    var _bits = 4;
    Object.defineProperty(this,'bits',{
      get() {return _bits;},
      set(bits) {
        this['input splitting'] = '' + bits;
        this['output splitting'] = '1*' + bits;
        _bits = bits;
      }
    });
    this.attributes.push('bits');
    addAttribute.inputSplitting(this);
    addAttribute.outputSplitting(this);
    addAttribute.spreading(this);
    addAttribute.mirror(this);


  }


  drawLocal(ctx,x,y) {
    var i = this.pins.inputs.length,
        o = this.pins.outputs.length,
        g = this.spreading;
    drawSplitter(ctx,x,y,i,o,g);
  }


  update() {
    var v = 0;
    this.pins.inputs.forEach((pin,i) => {
      var [s,e] = this.inpSplitting[i];
      var w = e - s + 1;
      var pv = pin.state & mask(w);
      v |= (pv << s) & 0xFFFFFFFF;
    });
    this.pins.outputs.forEach((pin,i) => {
      var [s, e] = this.outSplitting[i];
      var w = e - s + 1;
      pin.update((v >> s) &  mask(w));
    });
  }
}

class Decoder extends Component {
  static metrics = getMetrics('Decoder');

  constructor(x,y) {
    super(x,y);
    var set_sbits = sbits => {
      this.unwrapAndApply(() => {
        this.pins.removeOutputs();
        this.pins.removeInputs();
        var lines = 1 << sbits;
        if (lines === 2) {
          this.addPin(2,0,'output');
          this.addPin(2,2,'output');
          this.selectPin = this.addPin(1,2,'input');
        } else {
          for (var i=0;i<lines;i++) {
            var p = this.addPin(2,i,'output');
            if (i > 0) p.label = i;
          }
          this.selectPin = this.addPin(1,lines,'input');
        }
        if (this.lines === 2) {
          this.metrics.bounds[3] = 3.25;
          this.metrics.offset.y = 1.5;
        } else {
          this.metrics.bounds[3] = lines + .25;
          this.metrics.offset.y = lines/2;
        }
      });
    }
    addAttribute.bits(this,'sbits',set_sbits);
    addAttribute.mirror(this);
    set_sbits(1);
  }

  drawLocal(ctx,x,y) {
    drawDEMUX(ctx,x,y,max(2,1<<this.sbits));
  }

  update() {
    var s = this.selectPin.state;
    this.pins.outputs.forEach((out,i) => {
      out.queue(i == s);
    });
  }
}

class Multiplexer extends Component {
  static metrics = getMetrics('Multiplexer');

  constructor(x,y) {
    super(x,y);
    var set_sbits = sbits => {
      this.unwrapAndApply(() => {
        var _r = this.rotation;
        this.rotation = 0;
        this.pins.removeOutputs();
        this.pins.removeInputs();
        var lines = 1 << sbits;
        if (lines === 2) {
          this.addPin(0,0,'input');
          this.addPin(0,2,'input');
          this.selectPin = this.addPin(1,2,'input');
        } else {
          for (var i=0;i<lines;i++) {
            var p = this.addPin(0,i,'input',i);
            if (i > 0) p.label = i;
          }
          this.selectPin = this.addPin(1,lines,'input');
        }
        if (this.lines === 2) {
          this.metrics.bounds[3] = 3.25;
          this.metrics.offset.y = 1.5;
        } else {
          this.metrics.bounds[3] = lines + .25;
          this.metrics.offset.y = lines/2;
        }

        this.addPin(2,lines/2,'output');
        this.rotation = _r;
      });
    }
    addAttribute.bits(this,'dbits');
    addAttribute.bits(this,'sbits',set_sbits);
    addAttribute.mirror(this);
    set_sbits(1);
  }

  drawLocal(ctx,x,y) {
    drawMUX(ctx,x,y,max(2,1<<this.sbits));
  }

  update() {
    var sel = this.selectPin.state;
    var s = sel === null ? 0 : sel;
    if (this.mask.sbits >= s) {
      this.pins.outputs[0].queue(this.pins.inputs[s].state);
    }
  }
}

class Demultiplexer extends Component {
  static metrics = getMetrics('Demultiplexer');

  constructor(x,y) {
    super(x,y);
    var set_sbits = sbits => {
      this.unwrapAndApply(() => {
        this.pins.removeOutputs();
        this.pins.removeInputs();
        var lines = 1 << sbits;
        if (lines === 2) {
          this.addPin(2,0,'output');
          this.addPin(2,2,'output');
          this.selectPin = this.addPin(1,2,'input');
        } else {
          for (var i=0;i<lines;i++) {
            var p = this.addPin(2,i,'output');
            if (i > 0) p.label = i;
          }
          this.selectPin = this.addPin(1,lines,'input');
        }
        if (this.lines === 2) {
          this.metrics.bounds[3] = 3.25;
          this.metrics.offset.y = 1.5;
        } else {
          this.metrics.bounds[3] = lines + .25;
          this.metrics.offset.y = lines/2;
        }
        this.addPin(0,lines/2,'input');
      });
    }
    addAttribute.bits(this,'dbits');
    addAttribute.bits(this,'sbits',set_sbits);
    addAttribute.mirror(this);
    set_sbits(1);
  }

  drawLocal(ctx,x,y) {
    drawDEMUX(ctx,x,y,max(2,1<<this.sbits));
  }

  update() {
    this.driving = true;
    var s = this.selectPin.state;
    this.pins.outputs.forEach((out,i) => {
      out.queue(i == s ? this.pins.inputs[1].state : 0);
    });
  }
}

class BitSelector extends Component {
  static metrics = getMetrics('BitSelector');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this,'sbits');
    addAttribute.mirror(this);
    this.addPin(1,2,'input');
    this.addPin(0,1,'input');
    this.addPin(2,1,'output');
    this.sbits = 1;
    this.drawLocal = drawMUX;
  }

  update() {
    var s = this.pins.inputs[0].state;
    var ns = (1 << s) & this.pins.inputs[1].state
    this.pins.outputs[0].queue(!!ns);
  }
}



class PriorityEncoder extends Component {
  static metrics = getMetrics('PriorityEncoder');

  constructor(x,y) {
    super(x,y);
    var set_sbits = sbits => {
      this.unwrapAndApply(() => {
        this.pins.removeOutputs();
        this.pins.removeInputs();
        var lines = 1 << sbits;
        for (var i=0;i<lines;i++) {
          this.addPin(0,i,'input','D'+i);
        }
        for (var i=0;i<sbits;i++) {
          this.addPin(this.width,i,'output','Q'+i);
        }
        this.addPin(this.width,sbits,'output','v');
      });
    };
    var set_width = width => {
      this.unwrapAndApply(() => {
        this.pins.outputs.forEach(pin => pin.x = width);
      });
    }
    addAttribute.bits(this,'sbits',set_sbits);
    addAttribute.positiveInt(this,'width',3,set_width);
    addAttribute.mirror(this);
    this.sbits = 1;
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,this.width,(1<<this.sbits)-1);
  }

  update() {
    var D = this.pins.inputs;
    var Q = this.pins.outputs.slice(0,-1);
    var v = this.pins.outputs.at(-1);
    var h = null;
    for (var i = D.length - 1; i >= 0; i--) {
      if (D[i].state) {
        h = i;
        break;
      }
    }
    if (h === null) {
      Q.forEach(Q => Q.queue(0));
      v.queue(0);
    } else {
      Q.forEach((Q,i) => Q.queue(!!(h & (1<<i))));
      v.queue(1);
    }
  }
}

class BinToBCD extends Component {
  static metrics = getMetrics('BinToBCD');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'input','4');
    var labels = ['1','10','100','1K','10K','100K','1M','10M','100M','1B'];
    var set_bits = bits => {
      this.pins.removeOutputs();
      var l = floor(log(mask(bits)))+1;
      for (var y = 0; y < l; y++) {
        this.addPin(3,y,'output',labels[y]);
      }
      this.pins[0].label = bits;
    }
    addAttribute.bits(this,'bits',set_bits);
    set_bits(4);
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,this.pins.outputs.length-1);
  }

  update() {
    var n = this.pins[0].state ?? 0;
    var digits = [];
    while (n > 0) {
        digits.push(n % 10);
        n = floor(n / 10);
    }
    this.pins.outputs.forEach((out,i) => out.queue(digits[i] ?? (i > 0 ? 15 : 0)));
  }
}

class RAM extends Component {
  static metrics = getMetrics('RAM');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this,'abits');
    addAttribute.bits(this,'dbits');
    addAttribute.data(this);
    this.addPin(0,0,'input','A');
    this.addPin(0,1,'input','RE');
    this.addPin(0,2,'input','WE');
    this.addPin(0,3,'dual','D');
    this.addPin(0,4,'input','CLK');
    this.abits = 1;
    this.dbits = 1;
    this.clock = 0;
  }

  get inputs() {return this.abits;}
  get bits() {return this.dbits;}

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,4);
  }

  update() {
    var [pinA,pinRE,pinWE,pinD,pinCLK] = this.pins;
    var risingEdge = (this.clock === 0) && (pinCLK.state === 1);
    this.clock = pinCLK.state;
    var address = pinA.state ?? 0;
    address &= this.mask.abits;
    if (pinRE.state === 1) {
      pinD.queue(this.data[address] & this.mask.dbits);
    } else {
      pinD.queue(null);
    }
    if (risingEdge && pinWE.state === 1) {
      var data = pinD.state ?? 0;
      data &= this.mask.dbits;
      this.data[address] = data;
    }
  }
}

class ROM extends Component {
  static metrics = getMetrics('ROM');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this,'abits');
    addAttribute.bits(this,'dbits');
    addAttribute.data(this);
    var set_ports = ports => {
      this.pins.length = 0;
      this.portPins = [];
      if (ports === 1) {
        this.portPins.push({
          a: this.addPin(0,0,'input','A'),
          re: this.addPin(0,2,'input','RE'),
          d: this.addPin(3,1,'output','D'),
        });
        this.metrics.bounds[3] = 2.6;
      } else {
        for(var i = 0; i < ports; i++) {
          this.portPins.push({
            a: this.addPin(0,i*2,'input','A'+i),
            re: this.addPin(0,i*2+1,'input','RE'+i),
            d: this.addPin(3,i,'output','D'+i),
          });
        }
        this.metrics.bounds[3] = 1.6 + 2*(this.ports-1);
      }
    };
    addAttribute.positiveInt(this,'ports',1,set_ports);
    set_ports(1);
    this.abits = 1;
    this.dbits = 1;
  }

  get inputs() {return this.abits;}
  get bits() {return this.dbits;}

  drawLocal(ctx,x,y) {
    if (this.ports === 1) {
      drawICBox(ctx,x,y,3,2);
    } else {
      drawICBox(ctx,x,y,3,1+2*(this.ports-1));
    }
  }

  update() {
    this.portPins.forEach(pins => {
      if (pins.re.state === 1) {
        var address = pins.a.state ?? 0;
        address &= mask(this.abits);
        pins.d.queue(this.data[address] & mask(this.dbits));
      } else {
        pins.d.queue(null);
      }
    });
  }
}

class Increment extends Component {
  static metrics = getMetrics('Increment');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','A');
    this.addPin(0,1,'input','ci');
    this.addPin(3,0,'output',greek.Sigma);
    this.addPin(3,1,'output','co');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,1);
  }

  update() {
    var [A,ci,sum,co] = this.pins;
    var bitMask = mask(this.bits);
    var state = A.state ?? 0;
    state &= bitMask;
    state += !!ci.state;
    co.queue(state > bitMask);
    sum.queue(state & bitMask);
  }
}

class Decrement extends Component {
  static metrics = getMetrics('Decrement');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','X');
    this.addPin(0,1,'input','bi');
    this.addPin(3,0,'output',greek.Delta);
    this.addPin(3,1,'output','bo');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,1);
  }

  update() {
    var [X,bi,dif,bo] = this.pins;
    var bitMask = mask(this.bits);
    var state = X.state ?? 0;
    state &= bitMask;
    state -= !!bi.state;
    bo.queue(state < 0);
    dif.queue(state & bitMask);
  }
}

class Adder extends Component {
  static metrics = getMetrics('Adder');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','A');
    this.addPin(0,1,'input','B');
    this.addPin(0,2,'input','ci');
    this.addPin(3,0,'output',greek.Sigma);
    this.addPin(3,1,'output','co');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,2);
  }

  update() {
    var [A,B,ci,sum,co] = this.pins;
    var bitMask = mask(this.bits);
    var Astate = A.state ?? 0;
    var Bstate = B.state ?? 0;
    Astate &= bitMask;
    Bstate &= bitMask;
    var state = Astate + Bstate + !!ci.state;
    co.queue(state > bitMask);
    sum.queue(state & bitMask);
  }
}

class Subtractor extends Component {
  static metrics = getMetrics('Subtractor');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','X');
    this.addPin(0,1,'input','Y');
    this.addPin(0,2,'input','bi');
    this.addPin(3,0,'output',greek.Delta);
    this.addPin(3,1,'output','bo');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,2);
  }

  update() {
    var [X,Y,bi,dif,bo] = this.pins;
    var bitMask = mask(this.bits);
    var Xstate = X.state ?? 0;
    var Ystate = Y.state ?? 0;
    Xstate &= bitMask;
    Ystate &= bitMask;
    var state = Xstate - Ystate - !!bi.state;
    bo.queue(state < 0);
    dif.queue(state & bitMask);
  }
}



class Multiplier extends Component {
  static metrics = getMetrics('Multiplier');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    var set_signed = signed => {
      if (signed) {
        this.update = this.updateSigned;
      } else {
        this.update = this.updateUnsigned;
      }
    };
    this.update = this.updateUnsigned;
    addAttribute.bool(this,'signed',false,set_signed);
    this.a = this.addPin(0,0,'input','a');
    this.b = this.addPin(0,2,'input','b');
    this.prod = this.addPin(3,1,'output',greek.Pi);
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,2);
  }

  updateUnsigned() {
    var signedA = toUnsigned(this.a.state ?? 0, this.bits);
    var signedB = toUnsigned(this.b.state ?? 0, this.bits);
    var state = signedA * signedB;
    this.prod.queue(state);
  }

  updateSigned() {
    var signedA = toSigned(this.a.state ?? 0, this.bits);
    var signedB = toSigned(this.b.state ?? 0, this.bits);
    var state = toUnsigned(signedA * signedB, this.bits * 2);
    this.prod.queue(state);
  }
}

class Divider extends Component {
  static metrics = getMetrics('Divider');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    var set_signed = signed => {
      if (signed) {
        this.update = this.updateSigned;
      } else {
        this.update = this.updateUnsigned;
      }
    };
    this.update = this.updateUnsigned;
    addAttribute.bool(this,'signed',false,set_signed);
    this.a = this.addPin(0,0,'input','x');
    this.b = this.addPin(0,2,'input','y');
    this.q = this.addPin(3,0,'output','q');
    this.r = this.addPin(3,2,'output','r');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,2);
  }

  updateUnsigned() {
    var halfbits = this.bits >>> 1;
    var xstate = toUnsigned(this.a.state ?? 0, this.bits);
    var ystate = toUnsigned(this.b.state ?? 0, halfbits);
    var dirtyq = xstate / ystate;
    var q = toUnsigned(floor(dirtyq), this.bits);
    var r = toUnsigned(round((dirtyq-q) * ystate), this.bits);
    this.q.queue(q);
    this.r.queue(r);
  }

  updateSigned() {
    var halfbits = this.bits >>> 1;
    var xstate = toSigned(this.a.state ?? 0, this.bits);
    var ystate = toSigned(this.b.state ?? 0, halfbits);
    var dirtyq = xstate / ystate;
    var q = toUnsigned(floor(dirtyq), this.bits);
    var r = toUnsigned((abs(dirtyq)-toUnsigned(floor(abs(dirtyq)), this.bits))*abs(ystate), this.bits);
    this.q.queue(q);
    this.r.queue(r);
  }

  update() {
    var xbitMask = this.mask.bits;
    var ybitMask = mask(this.bits>>>1);
    var xstate = this.x.state ?? 0;
    var ystate = this.y.state ?? 0;
    xstate &= xbitMask;
    ystate &= ybitMask;
    var dirtyq = xstate / ystate;
    var q = floor(dirtyq);
    var r = round((dirtyq-q) * ystate);
    this.q.queue(q);
    this.rem.queue(r);
  }
}

class Comparator extends Component {
  static metrics = getMetrics('Comparator');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','A');
    this.addPin(0,2,'input','B');
    this.addPin(3,0,'output','>');
    this.addPin(3,1,'output','=');
    this.addPin(3,2,'output','<');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,2);
  }

  update() {
    var [A,B,gt,eq,lt] = this.pins;
    var bitMask = mask(this.bits);
    var Astate = A.state ?? 0;
    var Bstate = B.state ?? 0;
    Astate &= bitMask;
    Bstate &= bitMask;
    gt.queue(Astate > Bstate);
    eq.queue(Astate === Bstate);
    lt.queue(Astate < Bstate);
  }
}

class Negator extends Component {
  static metrics = getMetrics('Negator');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this);
    this.addPin(0,0,'input','A');
    this.addPin(2,0,'output','-');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,2,0);
  }

  update() {
    var [A,neg] = this.pins;
    var bitMask = mask(this.bits);
    var Astate = A.state ?? 0;
    neg.queue((~Astate+1) & bitMask);
  }
}

class SignEx extends Component {
  static metrics = getMetrics('Negator');

  constructor(x,y) {
    super(x,y);
    addAttribute.bits(this,'inBits');
    addAttribute.bits(this,'outBits');
    this.inBits = 8;
    this.outBits = 16;
    this.in = this.addPin(0,0,'input');
    this.out = this.addPin(3,0,'output','signEx');
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,3,0);
  }

  update() {
    this.out.queue(toUnsigned(toSigned(this.in.state,this.inBits),this.outBits));
  }
}

class Reset extends Component {
  static metrics = getMetrics('Reset');

  constructor(x,y) {
    super(x,y);
    this.state = 1;
    this.addPin(1,0,'output','R');
    addAttribute.inverted(this);
    addAttribute.bits(this);
  }

  drawLocal(ctx,x,y) {
    drawICBox(ctx,x,y,1,0);
  }

  update() {
    var ns = (this.state ^ this.inverted.includes(0)) * mask(this.bits);
    this.pins[0].queue(ns);
    this.state = 0;
  }
}

blank = {
  blank: {"settings":{"name":"blank","width":3,"shape":"normal","script":null,"parameters":[],"frequency":1,"compiled":null},"components":[],"wires":[]}
};

class IC extends Component {
  static metrics = getMetrics('IC');

  constructor(x,y,circuit) {
    super(x,y);
    this.subcircuit = circuit;

    this.circuit = new Subcircuit();

    this.attributes.push('subcircuit');
    addAttribute.location(this);

    var {settings} = this.getCircuit();
    this.parameters = settings?.parameters ?? [];
    this.parameters.forEach(p => this[p] = settings[p]);

    this.init();


    this.type = 'IC';

  }

  get components() {return this.circuit.components;}
  set components(v) {this.circuit.components = v;}
  get wires() {return this.circuit.wires;}
  set wires(v) {this.circuit.wires = v;}
  get settings() {return this.circuit.settings;}
  set settings(v) {this.circuit.settings = v;}
  get name() {return this.circuit.settings.name;}
  set name(v) {this.circuit.settings.name = v;}
  get width() {return this.circuit.settings.width;}
  set width(v) {this.circuit.settings.width = v;}
  get height() {return this.circuit.settings.height;}
  set height(v) {this.circuit.settings.height = v;}
  get shape() {return this.circuit.settings.shape;}
  set shape(v) {this.circuit.settings.shape = v;}
  get script() {return this.circuit.settings.script;}
  set script(v) {this.circuit.settings.script = v;}
  get parameters() {return this.circuit.settings.parameters;}
  set parameters(v) {this.circuit.settings.parameters = v;}
  get frequency() {return this.circuit.settings.frequency;}
  set frequency(v) {this.circuit.settings.frequency = v;}
  get compiled() {return this.circuit.settings.compiled;}
  set compiled(v) {this.circuit.settings.compiled = v;}

  update() {
    var lut = this.compiled;
    var index = 0;
    var inps = this.pins.inputs;
    var outs = this.pins.outputs;
    inps.forEach((inp, i) => {
      index |= (!!inp.state << i);
    });
    var outputState = lut[index];
    outs.forEach((out, i) => {
      out.queue(!!(outputState & (1 << i)));
    });
  }

  getLocation() {
    if (this.location === null) {
      if (this.subcircuit in saves) {
        this.location = 'Saves';
      } else if (this.subcircuit in examples) {
        this.location = 'Examples';
      } else if (this.subcircuit in DILLibrary) {
        this.location = 'DIL Library';
      } else {
        this.location = 'Blank';
      }
    }
    if (this.location === 'Saves') return saves;
    if (this.location === 'Examples') return examples;
    if (this.location === 'DIL Library') return DILLibrary;
    if (this.location === 'Blank') return blank;
  }

  getCircuit() {
    var circuit = this.getLocation()[this.subcircuit];
    if (!circuit) return blank.blank;
    return circuit;
  }

  init() {
    var {components, wires, settings} = this.getCircuit();
    this.compiled = settings.compiled;
    this.script = settings?.script ?? null;
    this.wires = new Wires();
    this.components = [];
    this.width = settings?.width ?? 3;
    this.shape = settings?.shape ?? 'normal';
    var parameters = settings?.parameters ?? [];
    if (!this.parameters || this.parameters.length !== parameters.length) {
      this.parameters = parameters;
      parameters.forEach(p => this[p] = settings[p]);
    }

    var _r = this.rotation;
    this.rotation = 0;

    this.pins.splice(0,this.pins.length);

    if (!this.compiled) {

    chunk(wires,4).forEach(wire => {
      var w = this.wires.addWire(wire[0],wire[1],wire[2],wire[3]);
    });

    components.forEach(component => {
      var c;
      if (component.type === 'IC') {
        c = new IC(component.x, component.y, component.subcircuit);
      } else if (component.type === 'DIL') {
        c = new DIL(component.x, component.y, component.chip);
      } else {
        c = new types[component.type](component.x, component.y);
      }
    if ((component.type === 'Splitter') && ('bits' in component)) {
      delete component['bits'];
    }
      for (var att in component) {
        if (['rotation','mirror'].includes(att)) continue;
        c[att] = component[att];
      }
      c.rotation = component.rotation;
      if ('mirror' in component) c.mirror = component.mirror;
      if (component.setFromIC) c.bits = this.bits;
      this.components.push(c);
    });

    this.context = {
      addComponent: (type,x,y) => {
        var c;
        if (types[type]) {
          c = new types[type](x,y);
        } else {
          c = new IC(x,y,type);
        }
        this.components.push(c);
        return c;
      },
      addWire: (x1,y1,x2,y2) => {
        var w = this.wires.addWire(x1,y1,x2,y2);
        this.wires.simplify(w);
        return w;
      },
    }

    if (this.script !== null) {
      var fn = new Function([...Object.keys(this.context),...this.parameters], this.script);
      fn.apply(this, [...Object.values(this.context),...this.parameters.map(p => this[p])]);
    }

    }

    if (this.shape === 'normal') {
      this.addPinsNormal();
      this.drawLocal = this.drawLocalNormal;
    } else if (this.shape === 'layout') {
      this.addPinsLayout();
      this.drawLocal = this.drawLocalLayout;
    } else if (this.shape === 'DIL') {
      this.addPinsNormal();
      this.drawLocal = this.drawLocalDIL;
    } else {
      this.addPinsNormal();
      if (typeof window['draw' + this.shape] === 'function') {
        this.drawLocal = window['draw' + this.shape];
        this.metrics = getMetrics(this.shape);
      } else {
        this.drawLocal = this.drawLocalNormal;
      }
    }

    this.components.filter(c => ['Input','Output'].includes(c.type)).forEach(c => {
      if (!c.autoPos) {
        var pin = this.pinMap.find(pm => pm[1] === c.pins[0])[0];
        pin.x = c.pinx;
        pin.y = c.piny;
      }
      if (c.type === 'Input') {
        c.dual = true;
        c.locked = true;
      }
    });

    this.rotation = _r;
  }

  addPinsNormal() {
    this.pinMap = [];

    var components = this.components;

    components.filter(component => component.type === 'Input')
    .forEach((inp,i) => {
      var pin = this.addPin(0,i,'input');
      pin.label = inp.label;
      if (!this.compiled) this.pinMap.push([pin,inp.pins[0]]);
    });

    components.filter(component => component.type === 'Output')
    .forEach((out,i) => {
      var pin = this.addPin(this.width,i,'output');
      pin.label = out.label;
      if (!this.compiled) this.pinMap.push([pin,out.pins[0]]);
    });
    var h = max(this.pins.inputs.length, this.pins.outputs.length);
    if (h === 0) h = 3;
    this.metrics = {
      bounds: [-.05, +this.width + .05,-.6,h-.4],
      offset: vector(this.width/2,h/2),
      scale: 4,
    };
  }

  addPinsLayout() {
    this.pinMap = [];

    var components = this.components;

    var inouts = components.filter(component => ['Input','Output'].includes(component.type));

    var left = inouts.filter(c => c.rotation === (c.type === 'Input' ? 0 : 2)).sort((a, b) => a.y - b.y);
    var bottom = inouts.filter(c => c.rotation === (c.type === 'Input' ? 1 : 3)).sort((a, b) => a.x - b.x);
    var right = inouts.filter(c => c.rotation === (c.type === 'Input' ? 2 : 0)).sort((a, b) => a.y - b.y);
    var top = inouts.filter(c => c.rotation === (c.type === 'Input' ? 3 : 1)).sort((a, b) => a.x - b.x);

    var width = max(top.length, bottom.length) + 1;
    var height = max(left.length, right.length) + 1;

    left.forEach((inout,i) => {
      var pin = this.addPin(0,i,inout.type.toLowerCase());
      pin.orientation = 'left';
      pin.label = inout.label;
      if (!this.compiled) this.pinMap.push([pin,inout.pins[0]]);
    });
    right.forEach((inout,i) => {
      var pin = this.addPin(width,i,inout.type.toLowerCase());
      pin.orientation = 'right';
      pin.label = inout.label;
      if (!this.compiled) this.pinMap.push([pin,inout.pins[0]]);
    });
    top.forEach((inout,i) => {
      var pin = this.addPin(i+1,-1,inout.type.toLowerCase());
      pin.orientation = 'top';
      pin.label = inout.label;
      if (!this.compiled) this.pinMap.push([pin,inout.pins[0]]);
    });
    bottom.forEach((inout,i) => {
      var pin = this.addPin(i+1,height-1,inout.type.toLowerCase());
      pin.orientation = 'bottom';
      pin.label = inout.label;
      if (!this.compiled) this.pinMap.push([pin,inout.pins[0]]);
    });

    this.width = width;
    this.height = height;

    this.metrics = {
      bounds: [-0.05, width + 0.05, -1.05, height - 0.95],
      offset: vector(width/2,height/2-1),
      scale: 4,
    };
  }

  createGroups() {
    var ics = this.components.filter(c => c.type === 'IC');
    ics.forEach(ic => ic.init());
    createConnectionGroups(this.wires, this.components);
    ics.forEach(ic => ic.createGroups());
    ics.forEach(ic => ic.link());
    this.components.filter(gate => ['Supply','Ground','Constant','Reset','PullUp','PullDown'].includes(gate.type)).forEach(g => nextBatch.add(g));
    this.components.filter(gate => gate.type === 'Reset').forEach(g => resets.push(g));
    this.components.filter(gate => gate.type === 'Clock').forEach(g => clocks.push(g));
    this.components.filter(gate => gate.type === 'Diode').forEach(g => diodes.push(g));
  }

  link() {
  if (this.compiled) return;
    this.pinMap.forEach(p => {
      var g = ConnectionGroup.combine(
        p[0].connectionGroup,
        p[1].connectionGroup,
      );
      var i = g.pins.indexOf(p[0]);
      if (i > -1) {g.pins.splice(i,1); return;}
      p[0].connectionGroup = null;
    });
  }
  drawLocalNormal(ctx,x,y) {
    if (this.pins.length === 0) {
      drawICBox(ctx,x,y,+this.width,2);
    } else {
      drawICBox(ctx,x,y,+this.width,max(this.pins.inputs.length,this.pins.outputs.length)-1);
    }
  }
  drawLocalLayout(ctx,x,y) {
    drawICBox(ctx,x,y-.45,this.width,this.height-1.1);
  }
  drawLocalDIL(ctx,x,y) {
    drawDILChip(ctx,x,y,+this.width,max(this.pins.inputs.length,this.pins.outputs.length)-1,this.subcircuit);
  }
}

class DIL extends Component {
  static metrics = {
      bounds: [0.15, 4 - .15,-.6,3-.4],
      offset: vector(1.5,1.5),
      scale: 4,
    };
  constructor(x,y,chip) {
    super(x,y);
    this.type = 'DIL';
    this.chip = chip;
    this.attributes.push('chip');
    var [pins,inputs,outputs,table] = DILchips[chip];
    pins = pins.split(' ');
    inputs = inputs.split(' ');
    outputs = outputs.split(' ');
    this.evalType = 'lut';
    if (typeof table === 'function') {
      this.evalType = 'function';
    } else {
      table = table.split('\n').map(row => row.trim()).map(row => row.split(' ').map(cell => {
      if (cell === 'H') return 1;
      if (cell === 'L') return 0;
      if (cell === 'Z') return null;
      return cell;
      }));
    }
    var [lpins,rpins] = chunk(pins,pins.length/2);
    rpins.reverse();
    function matchPin(nl,l) {
      return nl.endsWith(l) && !isNaN(+nl.slice(0,-l.length))
    }
    var inout = [...inputs,...outputs];
    var ngroups = max(1,...pins.map(label => {
      var m = inout.find(io => matchPin(label,io));
      if (!m) return 0;
      var l = +label.slice(0,-m.length);
      return l;
    }));
    var perg = inout.length;
    var groups = Array(ngroups).fill().map(_ => Array(perg));
    pins.forEach(label => {
      var m = inout.find(io => matchPin(label,io));
      if (!m) return;
      var gi = +label.slice(0,-m.length);
      var i = inout.indexOf(m);
      if (gi) {
        groups[gi-1][i] = label;
      } else {
        groups.forEach(g => g[i] = label);
      }
    });

    lpins.forEach((label,i) => {
      var type = 'input';
      if (outputs.some(out => matchPin(label,out))) type = 'output';
      var pin = this.addPin(0,i,type,label);
    });
    rpins.forEach((label,i) => {
      var type = 'input';
      if (outputs.some(out => matchPin(label,out))) type = 'output';
      var pin = this.addPin(4,i,type,label);
    });

    this.groups = groups.map(group => group.map(label => this.pins.find(pin => pin.label === label)));
    this.groups = this.groups.map(group => [group.slice(0,inputs.length),group.slice(-outputs.length)]);

    if (this.evalType === 'lut') {
      this.entries = table;
      this.update = this.updateTable;
    } else {
      this.evaluate = table;
      this.update = this.updateFunction;
    }
    var h = this.pins.length/2;
    this.metrics = {
      bounds: [-.05, +4 + .05,-.6,h-.4],
      center: vector(4/2,h/2),
      scale: 4,
    };
    this.lastStates = groups.map(group => Array(group[0].length).fill(0));
  }

  drawLocal(ctx,x,y) {
    drawDILChip(ctx,x,y,4,this.pins.length/2-1,this.chip);
  }

  updateFunction() {
    this.groups.forEach((group,gi) => {
      var istates = group[0].map(inp => inp.state === null ? 0 : +inp.state);
      this.lastStates[gi] = istates;
      var ostates = this.evaluate(...istates);
      group[1].forEach((out,i) => out.queue(ostates[i]));
    });
  }

  updateTable() {
    this.groups.forEach((group,gi) => {
      var istates = group[0].map(inp => inp.state === null ? 0 : +inp.state);
      var m = this.entries.find(entry =>
        istates.every((state,i) => {
          var target = entry[i];
          if (target === '^') return !this.lastStates[gi][i] && state;
          if (target === 'v') return this.lastStates[gi][i] && !state;
          return target === 'X' || target === state;
        })
      )
      this.lastStates[gi] = istates;
      if (!m) return;
      var ostates = m.slice(-group[1].length);
      group[1].forEach((out,i) => {
        var state = ostates[i];
        if (![0,1,null].includes(state)) {
          var ptt = group.flat().filter(pin => pin !== out && pin.label.endsWith(state.replace('~','')));
          var target = ptt.find(pin => pin.label.includes('~') !== state.includes('~'));
          if (target) {
            state = target.state;
          } else { 
            target = ptt.find(pin => pin.label.includes('~') === state.includes('~'));
            state = 1 - target.state;
          }
        }
        out.queue(state);
      });
    });
  }
}






function addIOforDIL(c) {
c.pins.forEach(pin => {
  if (pin.x === 0) {
    addWire(c.x,c.y+pin.y,c.x-2,c.y+pin.y);
    if (pin.type === 'input') {
      var inp = addComponent('Input',c.x-2,c.y+pin.y);
      inp.width = inp.height = 1;
      inp.label = pin.label;
    }
  } else {
    addWire(c.x+pin.x,c.y+pin.y,c.x+pin.x+2,c.y+pin.y);
    if (pin.type === 'input') {
      var inp = addComponent('Input',c.x+pin.x+2,c.y+pin.y);
      inp.width = inp.height = 1;
      inp.rotation = 2;
      inp.label = pin.label;
    }
  }
});
}


class Text extends Component {
  constructor(x,y) {
    super(x,y);
    addAttribute.description(this);
    addAttribute.fontSize(this);
    addAttribute.font(this);
  }

  draw(ctx) {
    var sp = toScreen(this.x, this.y);
    ctx.fillStyle = 'white';
    ctx.font = (this['font size'] * scale) + 'px ' + this.font;
    ctx.fillText(this.description,sp.x,sp.y);
  }

  containsPoint() {return false;}
}

var ntypes = {
  Nand: And,
  Nor: Or,
  Xnor: Xor,
  Minority: Majority,
  Xnand: Xand,
  Xminority: Xmajority,
}

function addComponent(type,x,y) {
  var c;
  if (ntypes[type]) {
    c = new ntypes[type](x,y);
    c.inverted = [-1];
  } else if (types[type]) {
    c = new types[type](x,y);
  } else {
    c = new IC(x,y,type);
  }
  circuit.components.push(c);
  return c;
}

function addWire(x1,y1,x2,y2) {
  var w = circuit.wires.addWire(x1,y1,x2,y2);
  circuit.wires.simplify(w);
  return w;
}