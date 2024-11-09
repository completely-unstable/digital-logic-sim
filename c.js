var canvas, ctx, rerender, hovering, holding, scale, mode, keymap, persist, selection;
var env;

var toScreen, toScreenX, toScreenY, onScreen;

var showGridDots = true;

var drawBoundingBoxes = false;

(() => {

var screen_x, screen_y, camera_x, camera_y, zoom, w2, h2;

var mouse_initial_world_x, mouse_initial_world_y, mouse_initial_x, mouse_initial_y, mouse_world_x, mouse_world_y, mouse_screen_x, mouse_screen_y, mouse_snapped_x, mouse_snapped_y, mouse_offset_x, mouse_offset_y, mouse_left, mouse_right, mouse_click, wireMode, mouse_action, drawer_dh, drawer_dw, drawer_s, drawer_mt, drawer_sf, drawer_ms, drawer_th, drawer_tt, drawer_scrollCalc, lastMouseEvent;

env = () => ({screen_x, screen_y, camera_x, camera_y, zoom});

window.onload = function() {
  document.body.style = `
    background-color: black;
  `;
  canvas = document.createElement('canvas');
  canvas.style = `
    position: absolute;
    left: 0px;
    top: 24px;
  `;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  screen = vector();

  toScreen = (x,y) => vector(
    (x - camera_x) * scale + screen_x / 2,
    (y - camera_y) * scale + screen_y / 2
  );
  toScreenX = x => (x - camera_x) * scale + screen_x / 2;
  toScreenY = y => (y - camera_y) * scale + screen_y / 2;

  rerender = true;

  keymap = {};

  drawer_dh = 2000;
  drawer_dw = 120;
  drawer_s = 0;

drawer_scrollCalc = function() {
  var lastTemplate = templateGroups.at(-1);
  if (templateGroups.length) drawer_dh = drawer_s + lastTemplate.y + (lastTemplate.collapsed ? 20 : lastTemplate.height);
  drawer_sf = screen_y / drawer_dh;
  drawer_ms = max(0, drawer_dh - screen_y);
  drawer_s = clamp(0, drawer_s, drawer_ms);
  drawer_th = screen_y * drawer_sf;
  drawer_mt = max(0, screen_y - drawer_th);
  drawer_tt = drawer_s * drawer_sf;

  rerender = true;
};

  scale = 20.085536923187668;
  function resize() {
    screen_x = canvas.width = window.innerWidth;
    screen_y = canvas.height = window.innerHeight-24;
    w2 = screen_x/scale/2;
    h2 = screen_y/scale/2;
    drawer_scrollCalc();
  }

  window.onresize = resize;

  resize();

  mode = 'circuit';

  mouse_world_x = 0;
  mouse_world_y = 0;
  mouse_screen_x = 0;
  mouse_screen_y = 0;
  mouse_initial_x = 0;
  mouse_initial_y = 0;
  mouse_initial_world_x = 0;
  mouse_initial_world_y = 0;
  mouse_snapped_x = 0;
  mouse_snapped_y = 0;
  mouse_right = false;
  mouse_left = false;
  hovering = null;
  holding = null;
  selection = [];
  mouse_offset_x = 0;
  mouse_offset_y = 0;
  mouse_action = '';
  mouse_click = false;
  wireMode = 'ortho';

//  canvas.onpointermove = mouseMove;
//  canvas.onpointerdown = mouseDown;
//  canvas.onpointerup = mouseUp;

  lastMouseEvent = 0;
  canvas.onpointermove = function(event) {
    if (Date.now() - lastMouseEvent > 16) {
      mouseMove(event);
      rerender = true;
      lastMouseEvent = Date.now();
    }
  };

  canvas.onpointerdown = function(event) {
    mouseDown(event);
    rerender = true;
  };

  canvas.onpointerup = function(event) {
    mouseUp(event);
    rerender = true;
  };

  canvas.oncontextmenu = function(event) {
    event.preventDefault();
  }
  canvas.onwheel = function(event) {

    var v = zoom - .01*sign(event.deltaY);
    var f = exp(-(v-zoom));

    camera_x -= mouse_world_x;
    camera_y -= mouse_world_y;
    camera_x *= f;
    camera_y *= f;
    camera_x += mouse_world_x;
    camera_y += mouse_world_y;
    scale = exp(v);
    zoom = v;

    w2 = screen_x/scale/2;
    h2 = screen_y/scale/2;

    rerender = true;

  }

  camera_x = 15;
  camera_y = 10;

  zoom = 3;

  window.onkeyup = function(event) {
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      return;
    }
    event.preventDefault();
    if (running) {
      if (event.code in keymap) {
        var component = keymap[event.code];
        component.state = 0;
        component.update();
        if (!singleStep && !oscillation) stabilize();
      }
    }
  }

  window.onkeydown = function(event) {
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      return;
    }
    event.preventDefault();
    if (running) {
      if (event.code in keymap) {
        var component = keymap[event.code];
        component.state = 1;
        component.update();
        if (!singleStep && !oscillation) stabilize();
        return;
      }
    }
    var control = event.ctrlKey || event.metaKey;
    if (!control) {
      if (!holding && hovering && ['Input','Output','Button'].includes(hovering?.type) && (event.code.startsWith('Key') || event.code.startsWith('Digit') || event.code === 'Backspace')) {
        hovering.label = event.code === 'Backspace' ? '' : hovering.label + event.code[3 + 2*event.code.startsWith('Digit')];
        rerender = true;
        return
      }
      switch(event.code) {
        case 'Space':
          if (running) {
            stop();
          } else {
            run();
          }
          break;
        case 'Enter':
          if (running && singleStep) {
            step();
            if (!nextBatch.length) {
      clocks.forEach(clock => {
        clock.state = 1-clock.state;
        nextBatch.push(clock);
      });
            }
          }
          break;
        case 'Backspace':
          if (holding && holding instanceof Component) {
            holding.remove();
            mouse_action = '';
            holding = null;
          }
          if (selection.length) {
            selection.forEach(s => {
              if(s[1] instanceof Wire) {
                circuit.wires.remove(s[1]);
              } else s[1].remove();
            });
            mouse_action = '';
            selection = [];
          }
          break;
        case 'ArrowUp':
          if (holding) {
            mouse_offset_y++;
            holding.position[1]--;
          } else if (selection.length) {
            mouse_initial_selection.forEach(s => s[1]--);
            selection.forEach(s => s[0][1]--);
          } else {
            circuitStack.pop();
            rerender = true;
          } 
          break;
        case 'ArrowDown':
          if (holding) {
            mouse_offset_y--;
            holding.position[1]++;
          } else if (selection.length) {
            mouse_initial_selection.forEach(s => s[1]++);
            selection.forEach(s => s[0][1]++);
          } else if (hovering?.type === 'IC') {
            circuitStack.push(hovering.circuit);
            rerender = true;
          }
          break;
        case 'ArrowLeft':
          if (holding) {
            mouse_offset_x++;
            holding.position[0]--;
          } else if (selection.length) {
            mouse_initial_selection.forEach(s => s[0]--);
            selection.forEach(s => s[0][0]--);
          }
          break;
        case 'ArrowRight':
          if (holding) {
            mouse_offset_x--;
            holding.position[0]++;
          } else if (selection.length) {
            mouse_initial_selection.forEach(s => s[0]++);
            selection.forEach(s => s[0][0]++);
          }
          break;
        case 'KeyR':
          if (holding && holding instanceof Component) {
            holding.rotation++;
          }
          break;
        case 'KeyD':
          wireMode = wireMode === 'ortho' ? 'straight' : 'ortho';
          break;
      }
    } else { // if (control) {

      switch(event.code) {
        case 'Space':
          if (running) {
            stop();
          } else {
            run(true);
          }
          break;
        case 'ArrowUp':
          if (holding) {
            mouse_offset_y+=5;
            holding.position[1]-=5;
          } else if (selection) {
            mouse_initial_selection.forEach(s => s[1]-=5);
            selection.forEach(s => s[0][1]-=5);
          }
          break;
        case 'ArrowDown':
          if (holding) {
            mouse_offset_y-=5;
            holding.position[1]+=5;
          } else if (selection) {
            mouse_initial_selection.forEach(s => s[1]+=5);
            selection.forEach(s => s[0][1]+=5);
          }
          break;
        case 'ArrowLeft':
          if (holding) {
            mouse_offset_x+=5;
            holding.position[0]-=5;
          } else if (selection) {
            mouse_initial_selection.forEach(s => s[0]-=5);
            selection.forEach(s => s[0][0]-=5);
          }
          break;
        case 'ArrowRight':
          if (holding) {
            mouse_offset_x-=5;
            holding.position[0]+=5;
          } else if (selection) {
            mouse_initial_selection.forEach(s => s[0]+=5);
            selection.forEach(s => s[0][0]+=5);
          }
          break;
        case 'KeyX':
          clipboardCutCopy(true);
          break;
        case 'KeyC':
          clipboardCutCopy();
          break;
        case 'KeyV':
          clipboardPaste();
          break;
        case 'KeyA':
          selection = [];
          circuit.components.forEach(component => {
            selection.push([component.position,component]);
          });
          circuit.wires.forEach(wire => {
            selection.push([wire.ends[0],wire]);
            selection.push([wire.ends[1],wire]);
          });
          mouse_action = 'selecting';
          break;
      }
    }
    rerender = true;
  }

  init();
  loop();
}

var clipboard;

function clipboardCutCopy(cut=false) {
  var _selection = selection
  if (! _selection.length) {
    if (!holding) return;
    if (holding instanceof Wire) {
      _selection = [
        [holding.ends[0],holding],
        [holding.ends[1],holding],
      ];
    } else {
      _selection = [[holding.position,holding]];
    }
  }
  var objs = _selection.map(s => s[1]);
  var vecs = _selection.map(s => s[0]);
  var components = objs.filter(obj => obj instanceof Component);
  var wires = objs.filter(obj => obj instanceof Wire);
  var found = new Set();
  for (var i = 0; i < wires.length; i++) {
    var wire = wires[i];
    if (!found.has(wire)) {
      found.add(wire);
      wires.splice(i,1);
      i--;
    }
  }

  var {x: mx, y: my} = Vector.median(...vecs);

  clipboard = JSON.stringify({
      components: components.map(g => {
        var c = {};
        g.attributes.forEach(att => {
          if (att === 'x') {
            c.x = mx - g.x;
          } else if (att === 'y') {
            c.y = my - g.y;
          } else {
            c[att] = g[att];
          }
        });
        if ('parameters' in g) g.parameters.forEach(p => c[p] = g[p]);
        return c;
      }), 
      wires: wires.map(w => ({
        x1: mx - w.ends[0][0],
        y1: my - w.ends[0][1],
        x2: mx - w.ends[1][0],
        y2: my - w.ends[1][1],
      }))
  });

  if (cut) {
    wires.forEach(wire => circuit.wires.remove(wire));
    components.forEach(component => component.remove());
  }

  

  selection = [];
  holding = null;
}

function clipboardPaste() {
  if (!clipboard) return;
  var {components,wires} = JSON.parse(clipboard);
  var mx = mouse_snapped_x;
  var my = mouse_snapped_y;
  selection = [];
  wires.forEach(wire => {
    var a = vector(mx - wire.x1, my - wire.y1);
    var b = vector(mx - wire.x2, my - wire.y2);
    wire = circuit.wires.addWireV(a,b);
    selection.push([a,wire]);
    selection.push([b,wire]);
  });
  components.forEach(component => {
    var c;
    component.x = mx - component.x;
    component.y = my - component.y;
    if (component.type === 'IC') {
      if (!(component.subcircuit in saves) && !(component.subcircuit in examples)) {console.log(component.subcircuit + ' circuit not found!'); return;}
      c = new IC(component.x, component.y, component.subcircuit);
    } else {
      c = new types[component.type](component.x, component.y);
    }
    if (('bits' in component) &&
      ('input splitting' in component)|('output splitting' in component)) {
      delete component.bits;
    }
    for (var att in component) {
      if (['rotation','mirror'].includes(att)) continue;
      c[att] = component[att];
    }
    c.rotation = component.rotation;
    if ('mirror' in component) c.mirror = component.mirror;
    circuit.components.push(c);
    selection.push([c.position,c]);
  });
  mouse_action = 'move-selection';
  mouse_initial_world_x = mouse_world_x;
  mouse_initial_world_y = mouse_world_y;
  mouse_initial_selection = selection.map(p => p[0].copy());

}

/*
bounds = [l,r,t,b]

l: camera_x - w2
r: camera_x + w2
t: camera_y - h2
b: camera_y + h2
*/

function onScreen(component) {
  var {x,y} = component,
      [l,r,t,b] = component.metrics.bounds;
  return (x + l) < camera_x + w2
      && (x + r) > camera_x - w2
      && (y + t) < camera_y + h2
      && (y + b) > camera_y - h2;
}


function toWorld(x, y) {
  return vector(
    (x - screen_x / 2) / scale + camera_x,
    (y - screen_y / 2) / scale + camera_y
  );
}
function toWorldX(x) {
  return (x - screen_x / 2) / scale + camera_x;
}
function toWorldY(y) {
  return (y - screen_y / 2) / scale + camera_y;
}

function loop() {
  if (rerender) {
    upd();
    draw();
    rerender = false;
  }
  requestAnimationFrame(loop);
}

function init() {
  new TemplateGroup('Logic',200,[
    new Template('Buffer',Buffer,12,drawTemplate.Buffer),
    new Template('Not Gate',Not,12,drawTemplate.Not),
    new Template('And Gate',And,12,drawTemplate.And),
    new Template('Nand Gate',Nand,12,drawTemplate.Nand),
    new Template('Or Gate',Or,12,drawTemplate.Or),
    new Template('Nor Gate',Nor,12,drawTemplate.Nor),
    new Template('Xor Gate',Xor,12,drawTemplate.Xor),
    new Template('Xnor Gate',Xnor,12,drawTemplate.Xnor),
  ]);
  new TemplateGroup('IO',230,[
    new Template('Input',Input,12,drawTemplate.Input),
    new Template('Output',Output,12,drawTemplate.Output),
    new Template('Clock',Clock,12,drawTemplate.Clock),
    new Template('Button',Button,12,drawTemplate.Button),
    new Template('LED',LED,12,drawTemplate.LED),
    new Template('Square LED',LED,12,drawTemplate.SquareLED,{square: true}),
    new Template('7 Segment Display',SegmentDisplay,10,drawTemplate.SegmentDisplay),
    new Template('16 Segment Display',SegmentDisplay,10,drawTemplate.SixteenSegment,{display: '16seg'}),
    new Template('Rotary Encoder',RotaryEncoder,10,drawTemplate.RotaryEncoder),
    new Template('Joystick',Joystick,10,drawTemplate.Joystick),
//    new Template('Button Pad',ButtonPad,10,drawTemplate.ButtonPad),
  ]);
  new TemplateGroup('Wiring',300,[
    new Template('Splitter/Merger',Splitter,12,drawTemplate.Splitter),
    new Template('Constant',Constant),
    new Template('Tri-State Buffer',Driver,12,drawTemplate.Driver),
    new Template('Tri-State Buffer',Driver,12,drawTemplate.DriverInv,{inverted:[1]}),
    new Template('Supply',Supply,12,drawTemplate.Supply),
    new Template('Ground',Ground,12,drawTemplate.Ground),
    new Template('Pull-Up Resistor',PullUp,12,drawTemplate.PullUp),
    new Template('Pull-Down Resistor',PullDown,12,drawTemplate.PullDown),
    new Template('Resistor',Resistor,13,drawTemplate.Resistor),
    new Template('Switch',Switch,13,drawTemplate.Switch),
    new Template('NMOS Transistor',NMOS,12,drawTemplate.NMOS),
    new Template('PMOS Transistor',PMOS,12,drawTemplate.PMOS),
    new Template('Tunnel',Tunnel,12,drawTemplate.Tunnel),
    new Template('Diode',Diode,13,drawTemplate.Diode),
    new Template('Reset',Reset,13,drawTemplate.Reset),
    //new Template('Battery',Battery,13,drawTemplate.Battery),
  ]);
  new TemplateGroup('Plexers',190,[
    new Template('Multiplexer',Multiplexer,16,drawTemplate.Multiplexer),
    new Template('Demultiplexer',Demultiplexer,16,drawTemplate.Demultiplexer),
    new Template('Bit Selector',BitSelector,16,drawTemplate.BitSelector),
    new Template('Decoder',Decoder,16,drawTemplate.Decoder),
    new Template('Priority Encoder',PriorityEncoder,16,drawTemplate.PriorityEncoder),
  ]);
  new TemplateGroup('Latches',160,[
    new Template('SR Latch',IC,16,'SR Latch'),
    new Template('Gated SR Latch',IC,16,'Gated SR Latch'),
    new Template('D Latch',IC,16,'D Latch'),
    new Template('JK Latch',IC,16,'JK Latch'),
    new Template('T Latch',IC,16,'T Latch'),
  ]);
  new TemplateGroup('Flip-Flops',300,[
    new Template('SR Flip-Flop',IC,16,'SR Flip-Flop'),
    new Template('D Flip-Flop',IC,16,'D Flip-Flop'),
    new Template('JK Flip-Flop',IC,16,'JK Flip-Flop'),
    new Template('T Flip-Flop',IC,16,'T Flip-Flop'),

    new Template('SR Flip-Flop w/ preset+clear',IC,14,'SR Flip-Flop w/ preset+clear'),
    new Template('JK Flip-Flop w/ preset+clear',IC,14,'JK Flip-Flop w/ preset+clear'),
    new Template('D Flip-Flop w/ preset+clear',IC,14,'D Flip-Flop w/ preset+clear'),
    new Template('T Flip-Flop w/ preset+clear',IC,14,'T Flip-Flop w/ preset+clear'),
  ]);
  new TemplateGroup('Edge Detection',300,[
    new Template('Rising Edge Pulse Detector',IC,16,'+edgePulseDetector',{location: 'Examples'}),
    new Template('Falling Edge Pulse Detector',IC,16,'-edgePulseDetector',{location: 'Examples'}),
    new Template('Dual Edge Pulse Detector',IC,16,'dualEdgePulseDetector',{location: 'Examples'}),
  ]);

  new TemplateGroup('Memory',154,[
    new Template('Lookup Table',LUT,14,drawTemplate.LUT),
    new Template('RAM',RAM,14,drawTemplate.RAM),
    new Template('ROM',ROM,14,drawTemplate.ROM),
    new Template('Register',IC,14,'Register',{location: 'Examples'}),
  ]);
  new TemplateGroup('Arithmetic',200,[
    new Template('Increment (Half Adder)',Increment,14,drawTemplate.Increment),
    new Template('Decrement (Half Subtractor)',Decrement,14,drawTemplate.Decrement),
    new Template('Adder',Adder,14,drawTemplate.Adder),
    new Template('Subtractor',Subtractor,14,drawTemplate.Subtractor),
    new Template('Multiplier',Multiplier,14,drawTemplate.Multiplier),
    new Template('Divider',Divider,14,drawTemplate.Divider),
    new Template('Comparator',Comparator,14,drawTemplate.Comparator),
    new Template('Negator',Negator,16,drawTemplate.Negator),
    new Template('Sign Extension',SignEx,16,drawTemplate.SignEx),
  ]);
  new TemplateGroup('Misc',200,[
    new Template('Majority Gate',Majority,12,drawTemplate.Majority),
    new Template('Minority Gate',Minority,12,drawTemplate.Minority),
    new Template('Xmajority Gate',Xmajority,12,drawTemplate.Xmajority),
    new Template('Xminority Gate',Xminority,12,drawTemplate.Xminority),
    new Template('Xand Gate',Xand,12,drawTemplate.Xand),
    new Template('Xnand Gate',Xnand,12,drawTemplate.Xnand),
  ]);
  var templateICs = [];
  templateICs.push(new Template('Blank IC',IC,16,null));
  Object.keys(saves).forEach(key => {
    var template = new Template(key,IC,16,key);
    template.height = 10;
    template.width = 0;
    template.draw = () => {};
    templateICs.push(template);
  });
  new TemplateGroup('ICs',40,templateICs);
  if ('init' in saves) load('init');
}

var todraw;
function upd() {
  todraw = circuit.components.filter(c => onScreen(c));
}

function drawCross(x,y) {

  ctx.beginPath();
  ctx.moveTo(x-5,y);
  ctx.lineTo(x+5,y);
  ctx.moveTo(x,y-5);
  ctx.lineTo(x,y+5);
  ctx.stroke();
  ctx.closePath();

}

templates = [];

function Template(label,g,s=12,circuit,props=null) {
  this.class = g;
  this.label = label;
  this.active = () => !('group' in this) || !this.group.collapsed;
  if (this.class === IC) {
    this.ic = true;
    this.circuit = circuit;
    var c;
    if (!circuit) c = blank.blank;
    if (props?.location) {
      var loc = {
        'Saves': saves,
        'Examples': examples,
        'DIL Library': DILLibrary,
        'Blank': blank,
      }[props.location];
      if (circuit in loc) c = loc[circuit];
    } else {
      if (circuit in examples) c = examples[circuit];
      if (circuit in saves) c = saves[circuit];
    }
    var inps = c.components.filter(c => c.type === 'Input');
    var outs = c.components.filter(c => c.type === 'Output');
    var w = c.settings.width;
    var h = max(inps.length,outs.length)-1;
    if (!circuit) h = 2;
    var pins = [];
    inps.forEach((inp,y) => {
      pins.push({x:0,y,type: inp.dual?'dual':'input', label: inp.label});
    });
    outs.forEach((out,y) => {
      pins.push({x:w,y,type: 'output', label: out.label});
    });
    var sx = _x => this.pos[0] + (_x - this.bounds[0]) * s;
    var sy = _y => this.pos[1] + this.group.y + (_y - this.bounds[2]) * s;
    this.draw = function(ctx) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = s/5;
      drawICBox(ctx,0,0,w,h,sx,sy,s);
      drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
    }
    var bounds = [-.05, +w + .05,-.6,h+1-.4];

    this.bounds = bounds;
    this.width = (bounds[1]-bounds[0]) * s;
    this.height = (bounds[3]-bounds[2]) * s;
    this.center = vector(this.width/2,this.height/2);
    this.mouseOver = () => {
      var px = mouse_screen_x,
          py = mouse_screen_y - this.group.y;
      return (
        (this.pos.x + bounds[0]*s < px) &&
        (this.pos.x + bounds[1]*s > px) &&
        (this.pos.y + bounds[2]*s < py) &&
        (this.pos.y + bounds[3]*s > py));
    }

    this.update = function() {};
    this.create = () => {
      var c = new this.class(0,0,this.circuit);
      Object.assign(c,props);
      return c;
    }
  } else {
    this.ic = false;
    this.metrics = getMetrics(this.class.name);
    this.bounds = this.metrics.bounds;
    this.width = this.metrics.width * s;
    this.height = this.metrics.height * s;
    this.center = vector(this.width/2,this.height/2);
    if (typeof circuit === 'function') {
      var sx = _x => this.pos[0] + (_x - this.bounds[0]) * s;
      var sy = _y => this.pos[1] + this.group.y + (_y - this.bounds[2]) * s;
      this.draw = () => {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = s/5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        circuit(ctx,sx,sy,s);
      }
      this.mouseOver = () => {
        var px = mouse_screen_x,
            py = mouse_screen_y - this.group.y;
        return (
          (this.pos.x < px) &&
          (this.pos.x + this.width > px) &&
          (this.pos.y < py) &&
          (this.pos.y + this.height > py));
      }
      this.update = () => {};
    } else {
      this.draw = function (ctx) {this.class.drawScreen(ctx,this.pos.add([0,this.group.y]),s)}
      this.mouseOver = function() {
        return this.class.containsPoint(this.pos, [mouse_screen_x, mouse_screen_y - this.group.y], s)
      }
      this.update = () => {};
    }
    this.create = () => {
      var c = new hovering.class();
      Object.assign(c,props);
      return c;
    }
  }
  this.drawBoundingBox = function(ctx) {
    ctx.strokeStyle = 'magenta';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.pos.x,
      this.pos.y+this.group.y,
      this.width,
      this.height
    );
  }
  this.pos = vector();
  templates.push(this);
}

var templateGroups = [];

class TemplateGroup {
  constructor(name,height,templates,columns=1) {
    this.name = name;
    this.height = 10;
    this.lastHeight = 10;
    this.nextRow = 0;
    this.templates = [];
    this.columns = columns;
    templates.forEach(t => this.addTemplate(t));
    this.oddRow(templates.slice(templates.length-mod(templates.length,this.columns)))
    this.collapsed = !true;
    templateGroups.push(this);
  }

  repositionAll() {return;
    var rows = chunk(this.templates,this.columns);
    var oddRow = null;
    if (rows.at(-1).length !== this.columns) oddRow = rows.pop();
    rows.forEach(r => this.reposition(r));
    if (oddRow) this.reposition(oddRow);
  }

  addTemplate(template) {
    this.templates.push(template);
    template.group = this;
    this.nextRow++;
    if (this.nextRow === this.columns) {
      this.nextRow = 0;
      var row = this.templates.slice(-this.columns);
      var gap = (120 - row.reduce((a,v) => a + v.width, 0)) / (this.columns + 1);
      var height = max(...row.map(t => t.height));
      var xx = gap;
      row.forEach(template => {
        template.pos.x = 20;
        template.pos.y = this.height;

        template.mouseOver = () => {
          var px = mouse_screen_x,
              py = mouse_screen_y - this.y;
          return (
            (0 < px) &&
            (drawer_dw - 9 > px) &&
            (template.pos.y - 5 < py) &&
            (template.pos.y + template.height + 5 > py));
        }
        xx += template.width + gap;
      });
      this.height += height + 10;
    }
  }

  reposition(row) {
    var gap = (drawer_dw - 9 - row.reduce((a,v) => a + v.width, 0)) / (this.columns + 1);
    var xx = gap;
    row.forEach(template => {
      template.pos.x = xx;
      xx += template.width + gap;
    });
  }

  oddRow(row) {
    if (!row.length) return;
    var gap = (drawer_dw - 9 - row.reduce((a,v) => a + v.width, 0)) / (row.length + 1);
    var height = max(...row.map(t => t.height));
    var xx = gap;
    row.forEach(template => {
      template.pos.x = xx;
      template.pos.y = this.height;
      xx += template.width + gap;
    });
    this.height += height + 10;
  }

  repositionOdd(row) {
    var gap = (drawer_dw - 9 - row.reduce((a,v) => a + v.width, 0)) / (row.length + 1);
    var xx = gap;
    row.forEach(template => {
      template.pos.x = xx;
      xx += template.width + gap;
    });
  }

  toggle() {
    this.collapsed = !this.collapsed;
    var yPos = 25 - drawer_s;
    templateGroups.forEach(group => {
      yPos = group.getHeight(ctx, yPos);
    });
    drawer_scrollCalc();
  }

  getHeight(ctx, yPos) {
    this.y = yPos

    yPos += 20;
    if (!this.collapsed) {
      yPos += this.height;
    }

    return yPos;
  }

  draw(ctx, yPos) {
    this.y = yPos;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'bottom';
    ctx.font = '16px Roboto';

    ctx.fillText(this.name, 10, yPos);
    yPos += 20;
    if (!this.collapsed) {
      this.templates.forEach(template => {
        template.draw(ctx);
        //template.drawBoundingBox(ctx);
      });
      yPos += this.height;
    }
    return yPos;
  }

  drawLabels(ctx, yPos) {
    ctx.fillStyle = 'white';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'bottom';
    ctx.font = '16px Roboto';
    if (!this.collapsed) {
      this.templates.forEach(template => {
        var tm = ctx.measureText(template.label);
        var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
        ctx.fillText(template.label,template.pos.x + template.width + 10,template.pos.y + th/2 + template.height/2 + this.y);
      });

    }
  }

  containsPoint(point) {
    return point[0] < drawer_dw - 9 && point[1] > this.y - 20 && point[1] < this.y;
  }
}

var editor = null;

class Editor {
  constructor() {
    this.paths = [];
    this.tool = 'line';
    this.current = [];
    this.path = null;
    this.points = [];
    this.width = 1;
    this.stroke = 'white';
    this.fill = '#00000000';
  }
}

class Path {
  constructor() {
    this.points = [];
    this.methods = [];
    this.width = 1;
    this.stroke = 'white';
    this.fill = '#00000000';
  }
  draw(ctx) {
    var di = 0;
    var pull = () => this.points[di++];
    ctx.lineWidth = this.width;
    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.fill;
    ctx.beginPath();
    this.methods.forEach(method => {
      switch (method) {
        case 'moveTo':
          var {x, y} = pull();
          ctx.moveTo(x, y);
          break;
        case 'lineTo':
          var {x, y} = pull();
          ctx.lineTo(x, y);
          break;
        case 'bezierCurveTo':
          var {x: cp1x, y: cp1y} = pull(),
              {x: cp2x, y: cp2y} = pull(),
              {x, y} = pull();
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          break;
        case 'quadraticCurveTo':
          var {x: cpx, y: cpy} = pull(),
              {x, y} = pull();
          ctx.quadraticCurveTo(cpx, cpy, x, y);
          break;
      }
      ctx.stroke();
    });
  }
}

function setEditMode() {
  mode = 'edit';
  editor = new Editor;
}

function draw() {
  drawBG();
  if (scale > 10 && showGridDots) drawGridDots();
  if (mode === 'edit') drawEdit();
  if (mode === 'circuit') drawCircuit();
  drawSelectionBox();
  //drawCursor();
}

function drawEdit() {

}

function drawGridDots() {
  ctx.fillStyle = ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  var l = floor(toWorldX(0)),
      r = ceil(toWorldX(screen_x)),
      t = floor(toWorldY(0)),
      b = ceil(toWorldY(screen_y));
  for (var x = l; x < r; x++) {
    var sx = round(toScreenX(x)) + .5;
    for (var y = t; y < b; y++) {
      var sy = round(toScreenY(y)) + .5;
      ctx.fillRect(sx-0.5,sy-0.5,1,1);
    }
  }

  window.cx = camera_x;
  window.cy = camera_y;
  window.w2 = w2;
  window.h2 = h2;

  if (camera_x < w2-123/scale && camera_x > -w2 && abs(camera_y) < h2) {
    var o = toScreen(0,0);
    ctx.beginPath();
    ctx.arc(o[0]+.5,o[1]+.5,scale/2,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath();
    return;
  }

  var W = vector(camera_x+61.5/scale, camera_y);

  var P1 = [
    vector(camera_x-w2+123/scale, camera_y-h2),
    vector(camera_x-w2+123/scale, camera_y+h2),
    vector(camera_x+w2, camera_y+h2),
    vector(camera_x+w2, camera_y-h2),
  ];

  var cp = P1.map(p => sign(Vector.cross(W,p)));

  var O = vector(0,0);

  var d;
  if (cp[1] === 1 && cp[2] === 1) d = Vector.pintersect(O,W,P1[0],P1[1]);
  if (cp[2] === 1 && cp[3] === 1) d = Vector.pintersect(O,W,P1[1],P1[2]);
  if (cp[3] === 1 && cp[0] === 1) d = Vector.pintersect(O,W,P1[2],P1[3]);
  if (cp[0] === 1 && cp[1] === 1) d = Vector.pintersect(O,W,P1[3],P1[0]);

  var D = toScreen(d.x,d.y);

  ctx.beginPath();
  ctx.arc(D[0]+.5,D[1]+.5,scale/2,0,2*Math.PI);
  ctx.stroke();
  ctx.closePath();


}

function drawBG() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawSelectionBox() {
  if (mouse_action === 'select') {
    var nx = min(mouse_initial_x, mouse_screen_x),
        ny = min(mouse_initial_y, mouse_screen_y),
        mx = max(mouse_initial_x, mouse_screen_x),
        my = max(mouse_initial_y, mouse_screen_y),
        sx = mx - nx,
        sy = my - ny;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(nx,ny,sx,sy);

    ctx.setLineDash([]);
  }
}

function drawCursor() {
  ctx.strokeStyle = 'magenta';
  ctx.lineWidth = 1;
  ctx.beginPath();
  var u = toScreenY(mouse_world_y - .5),
      d = toScreenY(mouse_world_y + .5),
      l = toScreenX(mouse_world_x - .5),
      r = toScreenX(mouse_world_x + .5);
  ctx.moveTo(mouse_screen_x, d);
  ctx.lineTo(mouse_screen_x, u);
  ctx.moveTo(l, mouse_screen_y);
  ctx.lineTo(r, mouse_screen_y);
  ctx.stroke();
  ctx.closePath();
}

function drawDrawer() {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, drawer_dw - 8, screen_y);
  ctx.clip();

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,drawer_dw - 9,screen_y);


  var yPos = 25 - drawer_s;
  templateGroups.forEach(group => {
    yPos = group.draw(ctx, yPos);
  });
  templateGroups.forEach(group => {
    group.drawLabels(ctx);
  });
  ctx.restore();

  ctx.strokeStyle = '#1E1E1E';
  var hoverScroll = false;
  ctx.lineWidth = 6;

  ctx.beginPath();
  ctx.moveTo(drawer_dw - 6,0);
  ctx.lineTo(drawer_dw - 6,screen_y);
  ctx.stroke();
  ctx.closePath();

  if (drawer_ms > 0) {
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#555';
  if (hovering === 'drawer-scroll') ctx.strokeStyle = '#666';

  ctx.beginPath();
  ctx.moveTo(drawer_dw - 6, drawer_tt+3);
  ctx.lineTo(drawer_dw - 6, drawer_tt + drawer_th - 3);
  ctx.stroke();
  ctx.closePath();
  }

}

function drawCircuit() {






  ctx.lineCap = 'round';


  circuit.wires.forEach(wire => {
    var e1 = toScreen(wire.ends[0][0],wire.ends[0][1]),
        e2 = toScreen(wire.ends[1][0],wire.ends[1][1]);
    ctx.lineWidth = e1.eq(e2) ? scale/1.5 : scale/4;
    var hl = (holding === wire || holding?.includes?.(wire));
    if (hl) {
      ctx.lineWidth = scale/4;
    }
    ctx.strokeStyle = (running && wire.state) ? '#5EFF5C' : 
       wire.state === null ? '#808080' : hl ? 'magenta' : '#60f';
    ctx.beginPath();
    ctx.moveTo(e1[0],e1[1]);
    ctx.lineTo(e2[0],e2[1]);
    ctx.stroke();
    ctx.closePath();
  });


  todraw.forEach(gate => gate.draw(ctx));
  if (drawBoundingBoxes) todraw.forEach(gate => gate.drawBoundingBox(ctx));

  drawDrawer();

  if (mouse_action === 'gate') {
    holding.draw(ctx);
  }
 
}

// events

var onmousemove = null;
var onmouseleftdown = null;
var onmouseleftup = null;
var onmouserightdown = null;
var onmouserightup = null;


var setAction = {
  _default() {
    onmousemove = function(event) {
      if (mouse_click) mouse_click = Vector.dist2([mouse_initial_x,mouse_initial_y],[mouse_screen_x,mouse_screen_y]) < 9;
      if (running) {
        hovering = circuit.components.find(gate => ['Input','Clock','Button','Switch','Joystick','RotaryEncoder'].includes(gate.type) && gate.containsPoint([mouse_world_x,mouse_world_y]));
      } else {
        if (mouse_action === 'gate') {
          holding.position[0] = round(mouse_world_x - mouse_offset_x);
          holding.position[1] = round(mouse_world_y - mouse_offset_y);
        } else if (mouse_action === 'wire') {
          holding.ends[1].x = mouse_snapped_x;
          holding.ends[1].y = mouse_snapped_y;
        } else if (mouse_action === 'wire-ortho-start') {
          if (mouse_snapped_x === mouse_initial_world_x &&
              mouse_snapped_y === mouse_initial_world_y) {
            holding.ends[1][0] = mouse_snapped_x;
            holding.ends[1][1] = mouse_snapped_y;
          } else {
            var imx, imy;
            if (mouse_snapped_x === mouse_initial_world_x) {
              mouse_action = 'wire-ortho-y';
              imx = mouse_snapped_x;
              imy = mouse_snapped_y;
            } else {
              mouse_action = 'wire-ortho-x';
              imx = mouse_snapped_x;
              imy = mouse_initial_world_y;
            }
            holding.ends[1][0] = imx;
            holding.ends[1][1] = imy;
            holding = [holding];
            holding.push(circuit.wires.addWire(imx,imy,imx,imy));
          }
        } else if (['wire-ortho-x','wire-ortho-y'].includes(mouse_action)) {
          if (mouse_snapped_x === mouse_initial_world_x &&
              mouse_snapped_y === mouse_initial_world_y) {
            circuit.wires.remove(holding[1]);
            holding = holding[0];
            mouse_action = 'wire-ortho-start';
          } else {
            var dir = (mouse_action === 'wire-ortho-x') ? 'x' : 'y';
            var imx, imy;
            if (dir === 'y') {
              var imx = mouse_initial_world_x;
              var imy = mouse_snapped_y;
            } else {
              var imx = mouse_snapped_x;
              var imy = mouse_initial_world_y;
            }
            holding[0].ends[1][0] = imx;
            holding[0].ends[1][1] = imy;
            holding[1].ends[0][0] = imx;
            holding[1].ends[0][1] = imy;
            holding[1].ends[1][0] = mouse_snapped_x;
            holding[1].ends[1][1] = mouse_snapped_y;
          }
        } else if (mouse_action === 'move-selection') {
          var si = mouse_initial_selection;
          var dmx = mouse_world_x - mouse_initial_world_x,
              dmy = mouse_world_y - mouse_initial_world_y;
          selection.forEach((p,i) => {
            p[0][0] = round(si[i][0] + dmx);
            p[0][1] = round(si[i][1] + dmy);
          })
        } else if (mouse_action === 'select') {
          var nx = min(mouse_initial_world_x, mouse_world_x),
              ny = min(mouse_initial_world_y, mouse_world_y),
              mx = max(mouse_initial_world_x, mouse_world_x),
              my = max(mouse_initial_world_y, mouse_world_y),
              sx = mx - nx,
              sy = my - ny;
          selection = circuit.components.filter(c =>
            nx < c.position[0] &&
            ny < c.position[1] &&
            c.position[0] < mx &&
            c.position[1] < my
          ).filter(c => c.withinRect([nx,ny],[mx,my])).map(c => [c.position, c]);
          circuit.wires.forEach(wire => wire.ends.forEach(end => {
            if (
              nx < end[0] &&
              ny < end[1] &&
              end[0] < mx &&
              end[1] < my
            ) selection.push([end,wire]);
          }));
        }
        if (!holding) {
          drawer_scrollCalc();
          if (
            drawer_dw - 3 <= mouse_screen_x && 
            mouse_screen_x < drawer_dw + 3
          ) {
            setAction.drawerResizeHover();
          } else if (
            drawer_dw - 9 <= mouse_screen_x && 
            mouse_screen_x < drawer_dw - 3 &&
            drawer_tt < mouse_screen_y &&
            mouse_screen_y < drawer_tt + drawer_th
          ) {
            setAction.drawerScrollHover();
          } else if (mouse_screen_x < drawer_dw - 9) {
            var mindist = Infinity;
            hovering = null;
            templates.filter(t => t.active()).forEach(t => {
              var cdist = Vector.dist2([mouse_screen_x,mouse_screen_y],t.pos.add([0,t.group.y]));
              if (cdist < mindist) {
                mindist = cdist;
                hovering = t;
              }
            });
            hovering = templates.filter(t => t.active()).find(t=>t.mouseOver());
            if (!hovering) {
              hovering = templateGroups.find(g=>g.containsPoint([mouse_screen_x,mouse_screen_y]));
            }
          } else {
            var mindist = 64;
            hovering = null;
            todraw.forEach(c => {
              c.pins.forEach(p => {
                var {x,y} = c.position.add(p);
                var cdist = Vector.dist2([mouse_screen_x,mouse_screen_y],toScreen(x,y));
                if (cdist < mindist) {
                  mindist = cdist;
                  hovering = p;
                }
              })
            });
            if (mindist === 64) {
              hovering = todraw.find(gate => gate.containsPoint([mouse_world_x,mouse_world_y]));
            }
          }
        }
      }
      var t = hovering?.class?.name;
      canvas.title = typeof t === 'undefined' ? '' : t;
    }


    onmouseleftdown = function(event) {
      if (running) {
        if (hovering) {
          if (['Input'].includes(hovering.type)) {
            if (hovering.bits > 1 || hovering.dual) {
              setAction.changeInput(hovering);
            } else {
              setAction.toggleInput(hovering);
            }
          } else if (['Joystick','RotaryEncoder'].includes(hovering.type)) {
            setAction.moveJoystick(hovering);
          } else if (hovering.type === 'Button') {
            setAction.pressButton(hovering);
          } else if (hovering.type === 'Switch') {
            setAction.toggleSwitch(hovering);
          }
        }
      } else if (mouse_action === 'selecting') {
        mouse_action = 'move-selection';
        mouse_initial_world_x = mouse_world_x;
        mouse_initial_world_y = mouse_world_y;
        mouse_initial_selection = selection.map(p => p[0].copy());
      } else if (mouse_action === '' && selection.length === 0) {
        mouse_action = 'select';
        mouse_initial_world_x = mouse_world_x;
        mouse_initial_world_y = mouse_world_y;
      }
    }

    onmouseleftup = function(event) {
      if (running) {
      } else {
        if (mouse_action === 'wire') {
          if (holding.ends[0].eq(holding.ends[1])) {
            circuit.wires.remove(holding);
            var joint = circuit.wires.find(wire => wire !== holding && wire.ends.some(end => end.eq([mouse_snapped_x,mouse_snapped_y])));
            if (joint) {
              if (joint.ends[0].eq(joint.ends[1])) {
                circuit.wires.remove(joint);
              }
              circuit.wires.remove(holding);
            }
            mouse_action = '';
            holding = null;
          } else {
            var onWire = circuit.wires.find(wire => wire !== holding && wire.contains([mouse_snapped_x,mouse_snapped_y]));
            circuit.wires.simplify(holding);
            var onPin = circuit.components.find(gate => gate.pins.some(pin => gate.position.add(pin).eq([mouse_snapped_x,mouse_snapped_y])));
            if (!onPin && !onWire) {
              holding = circuit.wires.addWire(mouse_snapped_x,mouse_snapped_y,mouse_snapped_x,mouse_snapped_y);
              if (wireMode === 'straight') mouse_action = 'wire';
              if (wireMode === 'ortho') mouse_action = 'wire-ortho-start';
              mouse_initial_world_x = mouse_snapped_x;
              mouse_initial_world_y = mouse_snapped_y;
            } else {
              mouse_action = '';
              holding = null;
            }
          }
        } else if (['wire-ortho-x','wire-ortho-y'].includes(mouse_action)) {
            var onWire = circuit.wires.find(wire => !holding.includes(wire) && wire.contains([mouse_snapped_x,mouse_snapped_y]));
            circuit.wires.simplify(holding[0]);
            if (holding[1].isJoint()) {
              circuit.wires.remove(holding[1]);
            } else {
              circuit.wires.simplify(holding[1]);
            }
            var onPin = circuit.components.find(gate => gate.pins.some(pin => gate.position.add(pin).eq([mouse_snapped_x,mouse_snapped_y])));
            if (!onPin && !onWire) {
              holding = circuit.wires.addWire(mouse_snapped_x,mouse_snapped_y,mouse_snapped_x,mouse_snapped_y);
              mouse_action = 'wire-ortho-start';
              mouse_initial_world_x = mouse_snapped_x;
              mouse_initial_world_y = mouse_snapped_y;
            } else {
              mouse_action = '';
              holding = null;
            }
        } else if (mouse_action === 'wire-ortho-start') {
            var joint = circuit.wires.find(wire => wire !== holding && wire.ends.some(end => end.eq([mouse_snapped_x,mouse_snapped_y])));
            if (joint) {
              if (joint.ends[0].eq(joint.ends[1])) {
                circuit.wires.remove(joint);
              }
              circuit.wires.remove(holding);
            }
          mouse_action = '';
          holding = null;    } else if (mouse_action === 'gate') {
          if (mouse_screen_x < drawer_dw - 9) {
            holding.remove();
          }
          mouse_action = '';
          holding = null;
        } else if (mouse_action === 'move-selection') {
          selection.filter(s => s[1] instanceof Wire).forEach(s => circuit.wires.simplify(s[1]));
          selection = [];
          mouse_action = '';
        } else if (mouse_action === 'select') {
          if (mouse_click) {
            if (mouse_screen_x < drawer_dw - 9) {
              if (hovering) {
                if (hovering instanceof Template) {
                  var g = hovering.create();
                  circuit.components.push(g);
                  holding = g;
                  mouse_action = 'gate';
                  mouse_initial_world_x = mouse_world_x;
                  mouse_initial_world_y = mouse_world_y;
                  mouse_offset_x = g.metrics.offset[0];
                  mouse_offset_y = g.metrics.offset[1];
                  g.position[0] = mouse_world_x - mouse_offset_x;
                  g.position[1] = mouse_world_y - mouse_offset_y;
                } else if (hovering instanceof TemplateGroup) {
                  hovering.toggle();
                  mouse_action = '';
                }
              }
            } else {
              if (hovering && !(hovering instanceof Pin)) {
                if (hovering instanceof Component) {
                  holding = hovering;
                  mouse_action = 'gate';
                  mouse_initial_world_x = mouse_world_x;
                  mouse_initial_world_y = mouse_world_y;
                  mouse_offset_x = mouse_world_x - hovering.position[0];
                  mouse_offset_y = mouse_world_y - hovering.position[1];
                }
              } else {
                holding = circuit.wires.addWire(mouse_snapped_x,mouse_snapped_y,mouse_snapped_x,mouse_snapped_y);
                if (wireMode === 'straight') mouse_action = 'wire';
                if (wireMode === 'ortho') mouse_action = 'wire-ortho-start';
                mouse_initial_world_x = mouse_snapped_x;
                mouse_initial_world_y = mouse_snapped_y;
              }
            }
          } else {
            if (selection.length) {
              mouse_action = 'selecting';
            } else mouse_action = '';
          }
        }
      }
    }

    onmouserightup = function(event) {
      if (mouse_action) {
        if (mouse_click) {
          if (['wire','wire-ortho-start'].includes(mouse_action)) {
            circuit.wires.remove(holding);
            mouse_action = '';
            holding = null;
          } else if (['wire-ortho-x','wire-ortho-y'].includes(mouse_action)) {
            circuit.wires.remove(holding[0]);
            circuit.wires.remove(holding[1]);
            mouse_action = '';
            holding = null;
          }
        }
      } else {
        var g = circuit.components.find(gate => gate.containsPoint([mouse_world_x,mouse_world_y]));
        if (mouse_click) {
          if (g) {
              FloatingWindow2.addGenericDialogue(g);/*
            if (['And','Or','Xor','Nand','Nor','Xnor','Xand','Xnand','Majority','Minority','Xmajority','Xminority'].includes(g.type)) {
              FloatingWindow2.addGateDialogue(g);
            } else if (['Not','Buffer'].includes(g.type)) {
              FloatingWindow2.addSingleInputGateDialogue(g);
            } else if (['Input'].includes(g.type)) {
              FloatingWindow2.addInputDialogue(g);
            } else {
              createObjectContextMenu(event,g);
            }*/
          } else {
            createCircuitContextMenu(event,circuit.settings);
          }
        }
      }
    }
  },

  changeInput(component) {
    var initialState = component.state - (component.state === null);
    var initialMouseY = mouse_screen_y;
    var bitMask = mask(component.bits);
    var dual = component.dual;
    onmousemove = function() {
      var dif = (initialMouseY - mouse_screen_y)/screen_y * 2 * max(63,bitMask);
      var del = floor(abs(dif/2)) * sign(dif);
      var ns = clamp(-dual, initialState + del, bitMask);
      if (component.state !== ns || ((component.state === null) !== (ns === -1))) {
        component.state = ns === -1 ? null : ns;
        processStateChange(component);
      }
    }
    onmouseleftup = function() {
      setAction._default();
    }
  },

  toggleInput(component) {
    onmouseleftup = function() {
      component.state = !component.state;
      processStateChange(component);
      setAction._default();
    }
  },

  toggleSwitch(component) {
    onmouseleftup = function() {
      component.closed = !component.closed;
      processStateChange(component);
      setAction._default();
    }
  },

  pressButton(component) {
    component.state = 1;
    component.update();
    onmouseleftup = function() {
      component.state = 0;
      processStateChange(component);
      setAction._default();
    }
  },

  moveJoystick(component) {
    component.setThumb([mouse_world_x,mouse_world_y]);
    processStateChange(component);
    onmousemove = function() {
      component.setThumb([mouse_world_x,mouse_world_y]);
      processStateChange(component);
    }
    onmouseleftup = function() {
      if (!component.sticky) {
        component.resetThumb();
        processStateChange(component);
      }
      setAction._default();
    }
  },

  drawerScrollHover() {
    hovering = 'drawer-scroll';
    onmousemove = function() {
      if (
        drawer_dw - 9 <= mouse_screen_x && 
        mouse_screen_x < drawer_dw - 3 &&
        drawer_tt < mouse_screen_y &&
        mouse_screen_y < drawer_tt + drawer_th
      ) return;
      hovering = null;
      setAction._default();
    }
    onmouseleftdown = function() {
      setAction.scrollDrawer();
    }
  },

  drawerResizeHover() {
    hovering = 'drawer-resize';
    canvas.style.cursor = 'col-resize';
    onmousemove = function() {
      if (
        drawer_dw - 3 <= mouse_screen_x && 
        mouse_screen_x < drawer_dw + 3
      ) return;
      hovering = null;
      canvas.style.cursor = 'auto';
      setAction._default();
    }
    onmouseleftdown = function() {
      setAction.resizeDrawer();
    }
  },

  scrollDrawer() {
    var initialY = mouse_screen_y;
    var initialScrollTop = drawer_tt;
    onmousemove = function() {
      var ny = initialScrollTop + (mouse_screen_y - initialY);
      drawer_tt = clamp(0, ny, drawer_mt);
      drawer_s = drawer_mt === 0 ? 0 : drawer_tt / drawer_mt * drawer_ms;
    }
    onmouseleftup = function() {
      hovering = null;
      setAction._default();
    }
  },

  resizeDrawer() {
    var initialX = mouse_screen_x;
    var initialWidth = drawer_dw;
    onmousemove = function() {
      drawer_dw = clamp(0, initialWidth + (mouse_screen_x - initialX), screen_x);
      templateGroups.forEach(g => g.repositionAll());
    }
    onmouseleftup = function() {
      hovering = null;
      canvas.style.cursor = 'auto';
      setAction._default();
    }
  },
}

function processStateChange(component) {
  component.update(true);
  if (!singleStep) stabilize();
}

setAction._default();

function mouseMove(event) {
  mouse_screen_x = (event.x);
  mouse_screen_y = (event.y - 24);
  if (mouse_right) {
    camera_x = mouse_world_x - (mouse_screen_x - screen_x / 2) / scale;
    camera_y = mouse_world_y - (mouse_screen_y - screen_y / 2) / scale;
  } else {
    mouse_world_x = camera_x + (mouse_screen_x - screen_x / 2) / scale;
    mouse_world_y = camera_y + (mouse_screen_y - screen_y / 2) / scale;
    mouse_snapped_x = round(mouse_world_x);
    mouse_snapped_y = round(mouse_world_y);
  }
  if (mode === 'edit') mouseMoveEdit(event);
  if (mode === 'circuit') mouseMoveCircuit(event);
}

function mouseMoveCircuit(event) {
  if (onmousemove) onmousemove(event);
}

function mouseDown(event) {
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  if (contextMenu !== null) {
    contextMenu.destroy();
    contextMenu = null;
    return;
  }
  mouse_initial_x = mouse_screen_x;
  mouse_initial_y = mouse_screen_y;
  mouse_click = true;
  if (event.button == 0) {
    mouse_left = true;
    if (mode === 'edit') mouseLeftDownEdit(event);
    if (mode === 'circuit') mouseLeftDownCircuit(event);
  }
  if (event.button == 2) {
    mouse_right = true;
    if (mode === 'edit') mouseRightDownEdit(event);
    if (mode === 'circuit') mouseRightDownCircuit(event);
  }
}

function mouseLeftDownCircuit(event) {
  if(onmouseleftdown) onmouseleftdown(event);
}

function mouseRightDownCircuit(event) {
  if(onmouserightdown) onmouserightdown(event);
}

function mouseUp(event) {
  canvas.releasePointerCapture(event.pointerId);
  var click = Math.max(
    Math.abs(mouse_screen_x - mouse_initial_x),
    Math.abs(mouse_screen_y - mouse_initial_y),
  ) < 8;
  if (event.button == 0) {
    mouse_left = false;
    if (mode === 'edit') mouseLeftUpEdit(event);
    if (mode === 'circuit') mouseLeftUpCircuit(event);
  }
  if (event.button == 2) {
    mouse_right = false;
    if (mode === 'edit') mouseRightUpEdit(event);
    if (mode === 'circuit') mouseRightUpCircuit(event);
  }
}

function mouseLeftUpCircuit(event) {
  if (onmouseleftup) onmouseleftup(event);
}

function mouseRightUpCircuit(event) {
  if (onmouserightup) onmouserightup(event);
}

function mouseMoveEdit() {

}

function mouseLeftDownEdit() {

}

function mouseRightDownEdit() {

}

function mouseLeftUpEdit() {
  editor.current.push([mouse_snapped_x,mouse_snapped_y]);
  if (editor.current.length > 1) {
    if (editor.tool === 'line' && editor.current.length === 2) {
      editor.path.points.push(...editor.current);
      editor.path.methods.push('moveTo');
      editor.path.methods.push('lineTo');
      editor.current = [];
    }
  } else {
    var path = new Path();
    editor.path = path;
    editor.paths.push(path);
  }
}

function mouseRightUpEdit() {

}

})();