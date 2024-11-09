var sym = [['"output splitting":','"PriorityEncoder"','"input splitting":','"SixteenSegment"','output splitting','"RotaryEncoder"','"Demultiplexer"','"complimentary":','PriorityEncoder','input splitting','"SevenSegment"','"addComponent("','SixteenSegment','"Multiplexer"','"BitSelector"','"description":','RotaryEncoder','Demultiplexer','complimentary','"Subtractor"','"Multiplier"','"Comparator"','"smallShape":','"parameters":','"components":','"compliment":','SevenSegment','addComponent','"Xmajority"','"Xminority"','"DriverInv"','"Increment"','"Decrement"','"Capacitor"','"numFormat":','"frequency":','"spreading":','"setFromIC":','Multiplexer','BitSelector','description','"Joystick"','"Majority"','"Minority"','"Constant"','"PullDown"','"Splitter"','"Resistor"','"Inductor"','"rotation":','"inverted":','"settings":','"compiled":','Subtractor','Multiplier','Comparator','smallShape','parameters','components','compliment','"Decoder"','"Divider"','"Negator"','"Battery"','"persist":','"circuit":','"addWire("','Xmajority','Xminority','DriverInv','Increment','Decrement','Capacitor','numFormat','frequency','spreading','setFromIC','"Button"','"Output"','"Switch"','"Buffer"','"Driver"','"Supply"','"Ground"','"Tunnel"','"PullUp"','"NPNBJT"','"PNPBJT"','"Merger"','"inputs":','"mirror":','"height":','"script":','Joystick','Majority','Minority','Constant','PullDown','Splitter','Resistor','Inductor','rotation','inverted','settings','compiled','"Input"','"Clock"','"Xnand"','"Adder"','"Diode"','"label":','"value":','"width":','"small":','"wires":','Decoder','Divider','Negator','Battery','persist','circuit','addWire','"dbits":','"sbits":','"abits":','"Xand"','"Nand"','"Xnor"','"NMOS"','"PMOS"','"Text"','"Cell"','"bits":','"data":','"dual":','"keys":','"name":','"type":','Button','Output','Switch','Buffer','Driver','Supply','Ground','Tunnel','PullUp','NPNBJT','PNPBJT','Merger','inputs','mirror','height','script','false','"Not"','"And"','"Xor"','"Nor"','"LUT"','"RAM"','"ROM"','"DFF"','"key":','Input','Clock','Xnand','Adder','Diode','label','value','width','small','wires','dbits','sbits','abits','true','null','"Or"','"IC"','Xand','Nand','Xnor','NMOS','PMOS','Text','Cell','bits','data','dual','keys','name','type','Not','And','Xor','Nor','LUT','RAM','ROM','DFF','key','[]','},{','"x"','"y"','Or','IC']];

var sym_latest_index = sym.length-1;
var sym_latest = sym[sym_latest_index];

function sym_chars(_sym) {
  return range(_sym.length).map(ch => String.fromCharCode(0x100+ch));
}

function compress(str) {
  var sym = sym_latest;
  var chars = sym_chars(sym);
  chars.forEach((char,i) => str = str.replace(new RegExp(char,'gm'), '\\' + char));
  sym.forEach((sym,i) => str = str.replaceAll(sym, chars[i]));
  return 'sym_' + sym_latest_index + '_' + str;
}

function decompress(str) {
  var i = str.match(/(?<=sym_)\d*?(?=_)/gm);
  if (!i) return str;
  i = +i[0];
  var _sym = sym[i];
  var chars = sym_chars(_sym);
  str = str.replace(/sym_\d*?_/m,'');
  _sym.forEach((sym,i) => str = str.replace(new RegExp('(?<!\\\\)' + chars[i],'gm'), sym));
  chars.forEach((char,i) => str = str.replace(new RegExp('\\\\' + char,'gm'), char));
  return str;
}

function save(name) {
  if (typeof name === 'undefined') name = circuit.settings.name;
  if (name === '') throw Error('save failed, circuit needs a name.');
  var _saves = saves;
  if (!_saves) _saves = JSON.parse(decompress(localStorage.getItem('saves')));
  var circ = {
      settings: {
        name: name === 'current' ? 'current' : circuit.settings.name,
        width: circuit.settings.width,
        shape: circuit.settings.shape,
        script: circuit.settings.script,
        parameters: circuit.settings.parameters,
        frequency: circuit.settings.frequency,
        compiled: circuit.settings.compiled,
      },
      components: circuit.components.map(g => {
        //g.attributes.reduce((a,v) => ({...a, [v]: g[v]}), {}));
        var c = {};
        g.attributes.forEach(att => c[att] = g[att]);
        if ('parameters' in g) g.parameters.forEach(p => c[p] = g[p]);
        return c;
      }), 
      wires: circuit.wires.flatMap(w => [
        w.ends[0].x,
        w.ends[0].y,
        w.ends[1].x,
        w.ends[1].y,
      ])
  };
  circuit.settings.parameters.forEach(parameter => {
    circ.settings[parameter] = circuit.settings[parameter];
  });
  saves[name] = circ;
  _saves = compress(JSON.stringify(saves));
  localStorage.setItem('saves', _saves);
  templates.forEach(template => template.update());
}

var backup = null;

function renameAttribute(oldName,newName) {
  backup = localStorage.getItem('saves');
  localStorage.setItem('backup',backup);
  saves = JSON.parse(decompress(backup));
  for (key in saves) {
    var save = saves[key];
    var components = save.components;
    components.forEach(component => {
      if (oldName in component) {
        component[newName] = component[oldName];
        delete component[oldName];
      }
    });
  }
  var _saves = compress(JSON.stringify(saves));
  localStorage.setItem('saves', _saves);
}

function revert(fromStorage = false) {
  if (fromStorage) {
    localStorage.setItem('saves',localStorage.getItem('backup'));
  } else {
    localStorage.setItem('saves',backup);
  }
}

function clearBackup() {
  localStorage.removeItem('backup');
  backup = null;
}

function compileCircuit() {
  var inps = circuit.components.filter(c => c.type === 'Input');
  var outs = circuit.components.filter(c => c.type === 'Output');
  var lut = [];

  function calculateLUT(index) {
    if (index === inps.length) {
      stabilize();
      var r = 0;
      outs.forEach((out, i) => r |= (!!out.state << i));
      lut.push(r);
      return;
    }

    inps[index].state = 0;
    inps[index].update();
    calculateLUT(index + 1);

    inps[index].state = 1;
    inps[index].update();
    calculateLUT(index + 1);
  }

  calculateLUT(0);

  circuit.settings.compiled = lut;
}

var types = {
  Input: Input,
  Clock: Clock,
  Button: Button,
  ButtonPad: ButtonPad,
  SegmentDisplay: SegmentDisplay,
  SevenSegment: SevenSegment,
  SixteenSegment: SixteenSegment,
  Joystick: Joystick,
  RotaryEncoder: RotaryEncoder,
  Output: Output,
  LED: LED,
  Switch: Switch,
  Buffer: Buffer,
  Not: Not,
  And: And,
  Or: Or,
  Xor: Xor,
  Xand: Xand,
  Nand: Nand,
  Nor: Nor,
  Xnor: Xnor,
  Xnand: Xnand,
  Majority: Majority,
  Minority: Minority,
  Xmajority: Xmajority,
  Xminority: Xminority,
  LUT: LUT,
  Driver: Driver,
  DriverInv: DriverInv,
  Supply: Supply,
  Ground: Ground,
  Constant: Constant,
  Tunnel: Tunnel,
  PullUp: PullUp,
  PullDown: PullDown,
  NMOS: NMOS,
  PMOS: PMOS,
  NPNBJT: NPNBJT,
  PNPBJT: PNPBJT,
  RAM: RAM,
  ROM: ROM,
  IC: IC,
  Splitter: Splitter,
  Decoder: Decoder,
  Multiplexer: Multiplexer,
  Demultiplexer: Demultiplexer,
  BitSelector: BitSelector,
  PriorityEncoder: PriorityEncoder,
  BinToBCD: BinToBCD,
  Increment: Increment,
  Adder: Adder,
  Decrement: Decrement,
  Subtractor: Subtractor,
  Multiplier: Multiplier,
  Divider: Divider,
  Comparator: Comparator,
  Negator: Negator,
  SignEx: SignEx,
  Text: Text,
  Cell: Cell,
  Battery: Battery,
  Resistor: Resistor,
  Capacitor: Capacitor,
  Inductor: Inductor,
  Diode: Diode,
  Reset: Reset,
}



function clear() {
  load();
}

function loadConcrete(str,bindings) {
  ConnectionGroup.clearAll();
  running = false;
  circuit.components.splice(0,circuit.components.length);
  circuit.wires.clear();
  initCircuit(str);
  if (circuit.settings.script !== null) {
    var context = {addComponent, addWire};
    var fn = new Function([...Object.keys(context),...circuit.settings.parameters], circuit.settings.script);
    fn.apply(circuit.settings, [...Object.values(context),...circuit.settings.parameters.map(p => bindings[p])]);
  }
  circuit.settings.script = null;
  circuit.settings.parameters = [];
}

function initCircuit(circ) {
  keymap = {};
  var {components, wires, settings} = circ;
  if (name !== 'current') circuit.settings.name = settings?.name ?? '';
  circuit.settings.width = settings?.width ?? 3;
  circuit.settings.shape = settings?.shape ?? 'normal';
  circuit.settings.script = settings?.script ?? null;
  circuit.settings.parameters = settings?.parameters ?? [];
  circuit.settings.frequency = settings?.frequency ?? 1;
  circuit.settings.compiled = settings?.compiled ?? null;

  chunk(wires,4).forEach(wire => circuit.wires.addWire(wire[0],wire[1],wire[2],wire[3]));
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
    if (component.setFromIC) c.bits = circuit.settings?.bits || 1;
    circuit.components.push(c);
  });

}

function load(name) {
  ConnectionGroup.clearAll();
  running = false;
  circuit.components.splice(0,circuit.components.length);
  circuit.wires.clear();
  if (!name || !name.length) {
    circuit.settings.name = '';
    circuit.settings.width = 3;
    circuit.settings.shape = 'normal';
    circuit.settings.script = null;
    circuit.settings.parameters = [];
    circuit.settings.frequency = 1;
    return;
  }

  if (name in examples) return initCircuit(examples[name]);
  if (name in DILLibrary) return initCircuit(DILLibrary[name]);
  var _saves = saves;
  if (!saves) _saves = saves = JSON.parse(decompress(localStorage.getItem('saves')));
  var _circuit = _saves[name];
  if (!_circuit) return console.error(`Circuit '${name}' not found.`);

  initCircuit(_circuit);
}