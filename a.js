addAttribute = function(component, ...attributes) {
  attributes.forEach(attribute => addAttribute[attribute](component));
};

removeAttribute = function(component, ...attributes) {
  attributes.forEach(attribute => {
    component.attributes.remove(attribute);
    delete component[attribute];
  });
};

(() => {

function coerceBool(value) {
  return Boolean(value);
}

function coerceNumber(value, def = 0) {
  value = Number(value);
  return isNaN(value) ? def : value;
}
function coerceNonNegativeNumber(value, def = 0) {
  value = Number(value);
  return isNaN(value) || value < 0 ? def : value;
}
function coercePositiveNumber(value, def = 1) {
  value = Number(value);
  return isNaN(value) || value <= 0 ? def : value;
}

function coerceInt(value, def = 0) {
  value = floor(Number(value));
  return isNaN(value) ? def : value;
}
function coerceNonNegativeInt(value, def = 0) {
  value = floor(Number(value));
  return isNaN(value) || value < 0 ? def : value;
}
function coercePositiveInt(value, def = 1) {
  value = floor(Number(value));
  return isNaN(value) || value <= 0 ? def : value;
}

function coerceString(value,options) {
  value = String(value);
  if (typeof options === 'undefined') return value;
  if (options.includes(value)) return value;
  return options[0];
}
function coerceStringOrNull(value,options) {
  value === null ? null : String(value);
  if (typeof options === 'undefined') return value;
  if (options.includes(value)) return value;
  return options[0];
}

function coerceArray(value,coerceElements = n => n) {
  if (typeof value === 'string') {
    if (value[0] !== '[') value = '[' + value;
    if (value[value.length-1] !== ']') value += ']';
    try { value = JSON.parse(value); } catch (e) { value = []; }
  }
  if (!Array.isArray(value)) value = [value];
  return value.map(element => coerceElements(element));
}

function coerceArrayOrNull(value,coerceElements = n => n) {
  if (value === null) return null;
  if (typeof value === 'string') {
    if (value[0] !== '[') value = '[' + value;
    if (value[value.length-1] !== ']') value += ']';
    try { value = JSON.parse(value); } catch (e) { value = []; }
  }
  if (!Array.isArray(value)) value = [value];
  return value.map(element => coerceElements(element));
}

function coerceUniqueArray(value,coerceElements = n => n) {
  return [...new Set(coerceArray(value,coerceElements))];
}





function generateGeneric(coerce) {
  return function(component,name,def,setter=()=>{}) {
    var _value = def;
    Object.defineProperty(component, name, {
      get() {return _value;},
      set(value) {
        value = coerce(value);
        if (value === _value) return;
        _value = value;
        setter(_value);
      },
      configurable: true,
    });
    component.attributes.push(name);
  }
}

addAttribute.bool = generateGeneric(coerceBool);
addAttribute.number = generateGeneric(coerceNumber);
addAttribute.nonNegativeNumber = generateGeneric(coerceNonNegativeNumber);
addAttribute.positiveNumber = generateGeneric(coercePositiveNumber);
addAttribute.int = generateGeneric(coerceInt);
addAttribute.nonNegativeInt = generateGeneric(coerceNonNegativeInt);
addAttribute.positiveInt = generateGeneric(coercePositiveInt);
addAttribute.string = generateGeneric(coerceString);
addAttribute.stringOrNull = generateGeneric(coerceStringOrNull);
addAttribute.array = generateGeneric(coerceArray);
addAttribute.arrayOrNull = generateGeneric(coerceArrayOrNull);
addAttribute.uniqueArray = generateGeneric(coerceUniqueArray);

addAttribute.location = function(component,name='location',setter=()=>{}) {
  var _location = null;
  Object.defineProperty(component, name, {
    get() {return _location;},
    set(location) {
      location = coerceString(location,['Blank','Saves','Examples','DIL Library']);
      if (location === _location) return;
      _location = location;
      setter(_location);
      this.init();
    }
  });
  component.attributes.push(name);
}

addAttribute.bits = function(component,name='bits',setter=()=>{}) {
  var _bits = 1;
  if (!component.mask) component.mask = {};
  component.mask[name] = 1;
  Object.defineProperty(component, name, {
    get() {return _bits;},
    set(bits) {
      bits = coercePositiveInt(bits);
      if (bits === _bits) return;
      component.mask[name] = mask(bits);
      if (component?.multiBit) {
        component.pins[0].label = bits;
      }
      _bits = bits;
      setter(_bits);
    }
  });
  component.attributes.push(name);
}

addAttribute.color = function(component,name='color',def='#FF0000',setter=()=>{}) {
  var _value = def;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceString(value);
      if (value === _value) return;
      _value = value;
      setter(_value);
    }
  });
  component.attributes.push(name);
}

addAttribute.autoPos = function(component,name='autoPos',def=true,setter=()=>{}) {
  var _value = def;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceBool(value);
      if (value === _value) return;
      _value = value;
      setter(_value);
    }
  });
  component.attributes.push(name);
}

addAttribute.numFormat = function(component,name='numFormat',def,setter=()=>{}) {
  var _value = def;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceString(value,['dec','hex','bin','signdec']);
      if (value === _value) return;
      _value = value;
      setter(_value);
    }
  });
  component.attributes.push(name);
}

addAttribute.display = function(component,name='display',def='7seg',setter=()=>{}) {
  var _value = def;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceString(value,['7seg','16seg','MNEflags']);
      if (value === _value) return;
      _value = value;
      setter(_value);
      this.encoding = this.encoding;
    }
  });
  component.attributes.push(name);
}

addAttribute.encoding = function(component,name='encoding',def='noneSplit',setter=()=>{}) {
  var _encoding = def;
  var _display = '7seg';
  Object.defineProperty(component, name, {
    get() {return _encoding;},
    set(encoding) {
      var display = this.display;
      if (display === '7seg') encoding = coerceString(encoding,['noneSplit','noneBus','bcd','bcdTail','hex','hexTail']);
      if (display === '16seg') encoding = coerceString(encoding,['noneBus','bcd','hex','ascii']);
      if (display === 'MNEflags') encoding = coerceString(encoding,['noneSplit','noneBus']);
      if (encoding === _encoding && display === _display) return;
      this.pins.length = 0;
      var pins;
      var pos = [[-3,-7],[-2,-7],[-1,-7],[0,-7],[-3,0],[-2,0],[-1,0],[0,0]];
      if (display === 'MNEflags') {
        if (encoding === 'noneSplit') pins = 3;
        if (encoding === 'noneBus') pins = 1;
      } else if (display === '7seg' && encoding === 'noneSplit') {
        pins = 8;
      } else {
        pins = 2;
      }
      pos.slice(-pins).forEach(pos => this.addPin(pos[0],pos[1],'input'));
      this.drawLocal = this.drawFn[display][encoding];
      _encoding = encoding;
      _display = display;
      setter(_encoding);
    }
  });
  component.attributes.push(name);
}

addAttribute.persist = function(component,name='persist',def=null,setter=()=>{}) {
  var _value = def;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceArrayOrNull(value,d => coerceNonNegativeInt(d) & mask(this.bits))
      if (value === _value) return;
      if (value === null) {
        persist.delete(this);
      } else {
        persist.set(this,value);
      }
      _value = value;
      setter(_value);
    }
  });
  component.attributes.push(name);
}

addAttribute.key = function(component,name='key',setter=()=>{}) {
  var _key = null;
  Object.defineProperty(component, name, {
    get() {return _key;},
    set(key) {
      key = coerceStringOrNull(key);
      if (key === _key) return;
      if (key === null) {
        delete keymap[_key];
      } else {
        keymap[key] = this;
      }
      _key = key;
      setter(_key);
    }
  });
  component.attributes.push(name);
}


addAttribute.rotation = function(component,name='rotation',setter=()=>{}) {
  function _rotate(ccw=false) {
    var center = component.pins[0];
    var dir = ccw ? 1 : -1;
    component.pins.forEach(pin => {
      pin.set([
        center.x + dir*(pin.y - center.y),
        center.y - dir*(pin.x - center.x)
      ]);
    });
    var b = component.metrics.bounds;
    component.metrics.bounds = ccw ? [b[2],b[3],-b[1],-b[0]] : [-b[3],-b[2],b[0],b[1]];
  }

  var _rotation = 0;
  Object.defineProperty(component, name, {
    get() {return _rotation;},
    set(rotation) {
      var dr = rotation - _rotation;
      var ccw = dr > 0;
      for (var i = 0; i < abs(dr); i++) {
        _rotate(ccw);
      }
      _rotation = mod(rotation,4);
      setter(_rotation);
    }
  });
  component.attributes.push(name);
}

addAttribute.inputs = function(component,name='inputs',setter=()=>{}) {
  var _inputs = 2;
  var ox = ['And','Or','Xor','LUT'].includes(component.type) ? 3 : 4;
  var isLUT = component.type === 'LUT';
  Object.defineProperty(component, name, {
    get() {return _inputs;},
    set(inputs) {this.unwrapAndApply(() => {
      inputs = coercePositiveInt(inputs,2);
      if (inputs === _inputs) return;
      var ooy = (_inputs - (_inputs % 2)) / 2;
      var ony = (inputs - (inputs % 2)) / 2;
      var ody = ony - ooy;
      this.pins.removeInputs();
      var i = 0;
      var ov = 0;
      while (ov < inputs) {
        if (i === inputs/2) {i++; continue;}
        this.addPin(0,i,'input');
        i++; ov++;
      }
      this.pins.outputs.forEach(out => {
        out.y += ody;
        this.pins.push(this.pins.shift());
      });
      if (isLUT) {
        var h = (inputs+(inputs%2===0));
        this.metrics.bounds[3] = h-.4;
        this.metrics.offset.y = h/2;
        this.data = this.data;
      } else {
        var dy = ((inputs-2) - inputs%2)/2;
        this.metrics.bounds[2] = -0.6 + dy;
        this.metrics.bounds[3] = 2.6 + dy;
        this.metrics.offset.y = 1 + dy;
      }
      this.remapInverted();
      _inputs = inputs;
      setter(_inputs);
    })}
  });
  component.attributes.push(name);
}

addAttribute.complimentary = function(component,name='compliment',setter=()=>{}) {
  var _comp = false;
  Object.defineProperty(component, name, {
    get() {return _comp;},
    set(comp) {this.unwrapAndApply(() => {
      comp = coerceBool(comp);
      if (comp === _comp) return;
      var outs = this.pins.outputs;
      var out = outs[0];
      var ox, oy;
      ox = out.x - out.inverted;
      if (outs.length === 2) {
        oy = (outs[0].y + outs[1].y)/2;
      } else {
        oy = outs[0].y;
      }
      var inv = this.inverted;
      if (comp) {
        if (inv.includes(-2)) inv.splice(inv.indexOf(-2),1);
        if (!inv.includes(-1)) inv.push(-1);
      } else {
        if (inv.includes(-1)) inv.splice(inv.indexOf(-1),1);
        if (inv.includes(-2)) inv.splice(inv.indexOf(-2),1);
      }


      this.pins.removeOutputs();

      if (comp) {
        this.addPin(ox,oy-1,'output');
        this.addPin(ox,oy+1,'output');
      } else {
        this.addPin(ox,oy,'output');
      }
      this.remapInverted();
      _comp = comp;
      this.metrics.bounds[1] += comp ? 1 : -1;
      setter(_comp);
    })}
  });
  component.attributes.push(name);
}

addAttribute.inverted = function(component,name='inverted',setter=()=>{}) {
  var _inverted = [];
  component.remapInverted = function(inv=_inverted) {
    var invPins = inv.map(inv => this.pins.at(inv)).filter(p => p);

    this.pins.forEach((pin,i) => {
      var wasInv = pin.inverted;
      var isInv = invPins.includes(pin);
      pin.inverted = isInv;
      if (!pin.bubble) return;
      var dir = pin.type === 'output' ? -1 : 1;
      if (wasInv === isInv) return;
      if (isInv) return pin.x-=dir;
      pin.x+=dir;
    });
  }
  Object.defineProperty(component, name, {
    get() {return _inverted;},
    set(inverted) {this.unwrapAndApply(() => {
      inverted = coerceUniqueArray(inverted,coerceInt);
      if (inverted.toString() === _inverted.toString()) return;
      this.remapInverted(inverted);
      _inverted = inverted;
      setter(_inverted);
    })}
  });
  component.attributes.push(name);
}

addAttribute.data = function(component,name='data',setter=()=>{}) {
  var _data = [0,0,0,0];
  Object.defineProperty(component, name, {
    get() {return _data;},
    set(data) {
      data = coerceArray(data,d => coerceNonNegativeInt(d) & mask(this.bits));
      var length = 1 << this.inputs;
      if (length > data.length) {
        while (data.length < length) {
          data.push(0);
        }
      }
      data.length = length;
      _data = data;
      setter(_data);
    }
  });
  component.attributes.push(name);
}

addAttribute.frequency = function(component,name='frequency',setter=()=>{}) {
  Object.defineProperty(component, name, {
    get() {return circuit.settings.frequency;},
    set(frequency) {
      frequency = coerceNonNegativeInt(frequency);
      circuit.settings.frequency = frequency;
      setter(frequency);
    }
  });
  component.attributes.push(name);
}

addAttribute.dual = function(component,name='dual',setter=()=>{}) {
  var _dual = false;
  Object.defineProperty(component, name, {
    get() {return _dual;},
    set(dual) {
      dual = coerceBool(dual);
      if (_dual === dual) return;
      this.pins[0].type = dual ? 'dual' : 'output';
      _dual = dual;
      setter(_dual);
    }
  });
  component.attributes.push(name);
}

addAttribute.label = function(component,name='label',setter=()=>{}) {
  var _label = '';
  Object.defineProperty(component, name, {
    get() {return _label;},
    set(label) {
      label = coerceString(label);
      if (label === _label) return;
      _label = label;
     setter(_label);
    }
  });
  component.attributes.push(name);
}

addAttribute.mirror = function(component,name='mirror',setter=()=>{}) {
  var _mirror = false;
  Object.defineProperty(component, name, {
    get() {return _mirror;},
    set(mirror) {
      mirror = coerceBool(mirror);
      if (mirror === _mirror) return;
      var _r = this.rotation;
      this.rotation = 0;
      var dir = mirror ? -1 : 1;
      this.pins.forEach(pin => pin.y *= -1);
      var [,,y0,y1] = this.metrics.bounds;
      this.metrics.bounds[2] = -y1;
      this.metrics.bounds[3] = -y0;
      //this.metrics.offset.y = -this.metrics.offset.y;
      _mirror = mirror;
      this.rotation = _r;
      setter(_mirror);
    }
  });
  component.attributes.push(name);
}

addAttribute.smallShape = function(component,name='small',setter=()=>{}) {
  var _small = false;
  Object.defineProperty(component, name, {
    get() {return _small;},
    set(small) {
      small = !!small;
      if (small === _small) return;
      _small = small;
      setter(_small);
    }
  });
  component.attributes.push(name);
}

addAttribute.key = function(component,name='key',setter=()=>{}) {
  var _key = null;
  Object.defineProperty(component, name, {
    get() {return _key;},
    set(key) {
      key = coerceStringOrNull(key);
      if (key === _key) return;
      if (key === null) {
        delete keymap[_key];
      } else {
        keymap[key] = this;
      }
      _key = key;
      setter(_key);
    }
  });
  component.attributes.push(name);
}

addAttribute.keys = function(component,name='keys',setter=()=>{}) {
  var _keys = null;
  Object.defineProperty(component, name, {
    get() {return _keys;},
    set(keys) {
      keys = coerceStringOrNull(keys,[null,'wasd','arrows']);
      if (keys === _keys) return;
      if (_keys === 'wasd') {
        delete keymap['KeyW'];
        delete keymap['KeyA'];
        delete keymap['KeyS'];
        delete keymap['KeyD'];
      } else if (_keys === 'arrows') {
        delete keymap['ArrowUp'];
        delete keymap['ArrowDown'];
        delete keymap['ArrowLeft'];
        delete keymap['ArrowRight'];
      }
      if (keys === 'wasd') {
        keymap.KeyW = ({
          set state(s) {component.thumb.y = -2*s;},
          update() {component.update();},
        });
        keymap.KeyS = ({
          set state(s) {component.thumb.y = 2*s;},
          update() {component.update();},
        });
        keymap.KeyA = ({
          set state(s) {component.thumb.x = -2*s;},
          update() {component.update();},
        });
        keymap.KeyD = ({
          set state(s) {component.thumb.x = 2*s;},
          update() {component.update();},
        });
      } else if (keys === 'arrows') {
        keymap.ArrowUp = ({
          set state(s) {component.thumb.y = -2*s;},
          update() {component.update();},
        });
        keymap.ArrowDown = ({
          set state(s) {component.thumb.y = 2*s;},
          update() {component.update();},
        });
        keymap.ArrowLeft = ({
          set state(s) {component.thumb.x = -2*s;},
          update() {component.update();},
        });
        keymap.ArrowRight = ({
          set state(s) {component.thumb.x = 2*s;},
          update() {component.update();},
        });
      }
      _keys = keys;
      setter(_keys);
    }
  });
  component.attributes.push(name);
}

addAttribute.value = function(component,name='value',setter=()=>{}) {
  var _value = 1;
  Object.defineProperty(component, name, {
    get() {return _value;},
    set(value) {
      value = coerceNonNegativeInt(value) & mask(this.bits);
      if (value === _value) return;
      _value = value;
      setter(_value);
    }
  });
  component.attributes.push(name);
}

function parseBitDefinition(def) {
  var result = [];
  var tokens = def.split(',');
  tokens.forEach(token => {
    var str = token.trim();
    var star = str.indexOf('*');
    var dash = str.indexOf('-');
    if (star >= 0) {
      var w = parseInt(str.substring(0,star).trim());
      var n = parseInt(str.substring(star+1).trim());
      var s = result.length > 0 ? result[result.length-1][1]+1 : 0;
      for (var i = 0; i < n; i++) {
        result.push([s, s+w-1]);
        s += w;
      }
    } else if (dash >= 0) {
      var s = parseInt(str.substring(0,dash).trim());
      var e = parseInt(str.substring(dash+1).trim());
      if (e<s) [s,e] = [e,s];
      result.push([s,e]);
    } else {
      var w = parseInt(str);
      var s = result.length > 0 ? result[result.length-1][1]+1 : 0;
      result.push([s, s+w-1]);
    }
  });
  return result;
}

addAttribute.inputSplitting = function(component,name='input splitting',setter=()=>{}) {
  component.inpSplitting = [[0,3]];
  var _inpSplittingStr = '4';
  Object.defineProperty(component, name ,{
    get() {return _inpSplittingStr;},
    set(str) {this.unwrapAndApply(() => {
      str = coerceString(str);
      if (str === _inpSplittingStr) return;
      _inpSplittingStr = str;
      this.inpSplitting = parseBitDefinition(str);
      this.pins.clearAll();
      for (var i = 0; i < this.inpSplitting.length; i++) {
        this.addPin(0,i*this.spreading,'input');
      }
      for (var i = 0; i < this.outSplitting.length; i++) {
        this.addPin(1,i*this.spreading,'output');
      }
      this.metrics.bounds[3] = (max(this.pins.inputs.length,this.pins.outputs.length)-1)*this.spreading+.25;
      setter(this.inpSplitting);
    })}
  });
  component.attributes.push(name);
}

addAttribute.outputSplitting = function(component,name='output splitting',setter=()=>{}) {
  component.outSplitting = [[0,0],[1,1],[2,2],[3,3]];
  var _outSplittingStr = '1*4';
  Object.defineProperty(component,'output splitting',{
    get() {return _outSplittingStr;},
    set(str) {this.unwrapAndApply(() => {
      str = coerceString(str);
      if (str === _outSplittingStr) return;
      _outSplittingStr = str;
      this.outSplitting = parseBitDefinition(str);
      this.pins.removeOutputs();
      for (var i = 0; i < this.outSplitting.length; i++) {
        this.addPin(1,i*this.spreading,'output');
      }
      this.metrics.bounds[3] = (max(this.pins.inputs.length,this.pins.outputs.length)-1)*this.spreading+.25;
      setter(this.outSplitting);
    })}
  });
  component.attributes.push(name);
}

addAttribute.spreading = function(component,name='spreading',setter=()=>{}) {
  var _spreading = 1;
  Object.defineProperty(component, name ,{
    get() {return _spreading;},
    set(spreading) {this.unwrapAndApply(() => {
      spreading = coerceNonNegativeInt(spreading);
      if (spreading === _spreading) return;
      this.pins.inputs.forEach((pin,i) => pin.y = i*spreading);
      this.pins.outputs.forEach((pin,i) => pin.y = i*spreading);
      _spreading = spreading;
      this.metrics.bounds[3] = (max(this.pins.inputs.length,this.pins.outputs.length)-1)*this.spreading+.25;
      setter(_spreading);
    })}
  });
  component.attributes.push(name);
}

addAttribute.description = function(component,name='description',setter=()=>{}) {
  var _desc = 'Text';
  Object.defineProperty(component, name ,{
    get() {return _desc;},
    set(desc) {
      desc = coerceString(desc);
      if (desc === _desc) return;
      _desc = description;
      setter(_desc);
    }
  });
  component.attributes.push(name);
}

addAttribute.fontSize = function(component) {
  var _fontsize = 12;
  Object.defineProperty(component,'font size',{
    get() {return _fontsize;},
    set(fontsize) {
      fontsize = +fontsize;
      fontsize = max(floor(fontsize),0);
      if (!Number.isSafeInteger(fontsize)) fontsize = 1;
      _fontsize = fontsize;
      this.setFontSize(_fontsize);
    }
  });
  component.setFontSize = () => {};
  component.attributes.push('font size');
}

addAttribute.font = function(component) {
  var _font = 'monospace';
  Object.defineProperty(component,'font',{
    get() {return _font;},
    set(font) {
      font = font.toString();
      _font = font;
      this.setFont(_font);
    }
  });
  component.setFont = () => {};
  component.attributes.push('font');
}

})();