class FloatingWindow2 {
  constructor(title) {

var w = document.createElement('div'),
    tb = document.createElement('div'),
    tt = document.createElement('div'),
    rb = document.createElement('div'),
    bd = document.createElement('div'),
    l = document.createElement('div'),
    r = document.createElement('div'),
    t = document.createElement('div'),
    b = document.createElement('div'),
    tl = document.createElement('div'),
    tr = document.createElement('div'),
    bl = document.createElement('div'),
    br = document.createElement('div');
l.style.zIndex = r.style.zIndex = t.style.zIndex = b.style.zIndex = 
tl.style.zIndex = tr.style.zIndex = bl.style.zIndex = br.style.zIndex = '999';
l.style.position = r.style.position = t.style.position = b.style.position =
tl.style.position = tr.style.position = bl.style.position = br.style.position =
rb.style.position = 'absolute';
l.style.height = r.style.height = t.style.width = b.style.width = 'calc(100% - 12px)';
l.style.left = r.style.right = t.style.top = b.style.bottom = '-4px';
l.style.top = r.style.top = t.style.left = b.style.left = '6px';
l.style.width = r.style.width = t.style.height = b.style.height = '8px';
tl.style.top = tl.style.left = tr.style.top = tr.style.right =
bl.style.bottom = bl.style.left = br.style.bottom = br.style.right = '-6px';
tl.style.width = tl.style.height = tr.style.width = tr.style.height =
bl.style.width = bl.style.height = br.style.width = br.style.height = '12px';
l.style.cursor = r.style.cursor = 'ew-resize';
t.style.cursor = b.style.cursor = 'ns-resize';
tl.style.cursor = br.style.cursor = 'nwse-resize';
tr.style.cursor = bl.style.cursor = 'nesw-resize';
rb.style.width = rb.style.height = '12px';
rb.style.borderRadius = '6px';
rb.style.top = '5px';
rb.style.left = '6px';
rb.style.backgroundColor = '#f00';
tt.innerText = title;

tb.style = `
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 22px;
  background-color: black;
`;
tt.style = `
  position: absolute;
  top: 0px;
  right: 0px;
  height: 22px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  user-select: none;
`;
bd.style = `
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 22px);
  background-color: lightgrey;
  padding: 10px;
  box-sizing: border-box;
`;
w.style = `
  position: absolute;
  left: 50px; top: 50px;
  width: 325px; height: 171px;
  border: 1px solid #444;
  overflow: hidden;
  border-radius: 5px;
  font: 15px Roboto;
`;

document.body.appendChild(w);
w.appendChild(tb);
w.appendChild(bd);
tb.appendChild(tt);
tb.appendChild(rb);
w.appendChild(l);
w.appendChild(r);
w.appendChild(t);
w.appendChild(b);
w.appendChild(tl);
w.appendChild(tr);
w.appendChild(bl);
w.appendChild(br);

this.minWidth = 325;
this.minHeight = 171;

var x,y,ix,iy,ol,ot,ow,oh,nl,nt,nw,nh;

var reposition = event => {
  x = event.clientX;
  y = event.clientY;
  nl = ol + x - ix;
  nt = ot + y - iy;
  w.style.left = nl + 'px';
  w.style.top = nt + 'px';
}
var  resizeLeft = event => {
  x = event.clientX;
  nl = ol + x - ix;
  nw = ow - x + ix;
  if (nw < this.minWidth) nl = ol + ow - (nw = this.minWidth);
  w.style.left = nl + 'px';
  w.style.width = nw + 'px';
}
var  resizeTop = event => {
  y = event.clientY;
  nt = ot + y - iy;
  nh = oh - y + iy;
  if (nh < this.minHeight) nt = ot + oh - (nh = this.minHeight);
  w.style.top = nt + 'px';
  w.style.height = nh + 'px';
}
var  resizeRight = event => {
  x = event.clientX;
  nw = ow + x - ix;
  if (nw < this.minWidth) nw = this.minWidth;
  w.style.width = nw + 'px';
}
var  resizeBottom = event => {
  y = event.clientY;
  nh = oh + y - iy;
  if (nh < this.minHeight) nh = this.minHeight;
  w.style.height = nh + 'px';
}

rb.onclick = () => w.remove();
rb.onpointerdown = function(event) {
    event.stopPropagation();
};
tb.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  ix = event.clientX;
  iy = event.clientY;
  ol = w.offsetLeft;
  ot = w.offsetTop;
  this.onpointermove = reposition;
}

l.onpointerup = r.onpointerup = t.onpointerup = b.onpointerup =
tl.onpointerup = tr.onpointerup = bl.onpointerup = br.onpointerup =
tb.onpointerup =
function(event) {
  this.releasePointerCapture(event.pointerId);
  this.onpointermove = null;
}

l.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  ix = event.clientX;
  ol = w.offsetLeft;
  ow = w.offsetWidth;
  this.onpointermove = resizeLeft;
}
r.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  ix = event.clientX;
  ow = w.offsetWidth;
  this.onpointermove = resizeRight;
}
t.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  iy = event.clientY;
  ot = w.offsetTop;
  oh = w.offsetHeight;
  this.onpointermove = resizeTop;
}
b.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  iy = event.clientY;
  oh = w.offsetHeight;
  this.onpointermove = resizeBottom;
}
tl.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  ix = event.clientX;
  iy = event.clientY;
  ol = w.offsetLeft;
  ot = w.offsetTop;
  ow = w.offsetWidth;
  oh = w.offsetHeight;
  this.onpointermove = function(event) {
    resizeTop(event);
    resizeLeft(event);
  }
}
tr.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  ix = event.clientX;
  iy = event.clientY;
  ot = w.offsetTop;
  ow = w.offsetWidth;
  oh = w.offsetHeight;
  this.onpointermove = function(event) {
    resizeTop(event);
    resizeRight(event);
  }
}
bl.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  iy = event.clientY;
  oh = w.offsetHeight;
  ix = event.clientX;
  ol = w.offsetLeft;
  ow = w.offsetWidth;
  this.onpointermove = function(event) {
    resizeBottom(event);
    resizeLeft(event);
  }
}
br.onpointerdown = function(event) {
  this.setPointerCapture(event.pointerId);
  iy = event.clientY;
  oh = w.offsetHeight;
  ix = event.clientX;
  ow = w.offsetWidth;
  this.onpointermove = function(event) {
    resizeBottom(event);
    resizeRight(event);
  }
}

function addTabs(...tabs) {
bd.remove();
var tabbar = document.createElement('div');
tabbar.style = `
  position: absolute;
  top: 22px;
  left: 0px;
  width: 100%;
  height: 22px;
  display: flex;
`;
w.appendChild(tabbar);
var vis = null;
function select(tab,body) {
  vis[0].style.backgroundColor = 'black';
  vis[0].style.color = 'white';
  vis[1].setAttribute('hidden',true);
  tab.style.backgroundColor = 'darkgray';
  tab.style.color = 'black';
  body.removeAttribute('hidden');
  vis = [tab,body];
}
var ret = [];
tabs.forEach((tab,i) => {
  var ta = document.createElement('div');
  ta.style = `
    height: 22px;
    flex-grow: 1;
    text-indent: 6px;
    display: flex;
    align-items: center;
    user-select: none;
    box-sizing: border-box;
    border-bottom: 1px solid black;
  `;
  ta.innerText = tab;
  var tbd = document.createElement('div');
  tbd.style = `
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: calc(100% - 44px);
    background-color: lightgrey;
    padding: 10px;
    box-sizing: border-box;
  `;
  if (i) {
    tbd.setAttribute('hidden',true);
    ta.style.backgroundColor = 'black';
    ta.style.color = 'white';
  } else {
    ta.style.backgroundColor = 'darkgray';
    ta.style.color = 'black';
    vis = [ta,tbd];
  }
  w.appendChild(tbd);
  tabbar.appendChild(ta);
  ta.onclick = function(event) {
    select(ta,tbd);
  }
  ret.push([ta,tbd]);
});
  this.tabs = ret;
  return ret;
}

function addText(element,text) {
  var div = document.createElement('div');
  div.style = `
    display: flex;
    width: 100%;
    margin-bottom: 10px;
  `;
  div.innerText = text;
  element.appendChild(div);
  this.minHeight = max(this.minHeight,div.parentElement.offsetTop+div.offsetTop+div.offsetHeight+40);
  w.style.height = this.minHeight + 'px';
  return [div];
}

function addInput(element, label, type, def, action) {
  var div = document.createElement('div');
  var lab = document.createElement('div');
  var inp = document.createElement('input');
  div.appendChild(lab);
  div.appendChild(inp);
  div.style = `
    display: flex;
    width: 100%;
    margin-bottom: 10px;
    justify-content: space-between;
  `;
  lab.style = `
    flex-shrink: 0;
  `;
  inp.style = `
    flex-grow: 1;
    min-width: 0;
    max-width: 50%;
  `;
  lab.innerText = label;
  inp.type = type;

  element.appendChild(div);
  if (type === 'button') {
    inp.value = def;
    inp.onclick = function(event) {
      action();
      rerender = true;
    };
  } else {
    if (type === 'checkbox') {
      inp.checked = def;
    } else {
      inp.value = def;
    }
    inp.oninput = function(event) {
      var value = type === 'checkbox' ? event.target.checked : event.target.value;
      action(value);
      rerender = true;
    };
  }
  this.minHeight = max(this.minHeight,div.parentElement.offsetTop+div.offsetTop+div.offsetHeight+40);
  w.style.height = this.minHeight + 'px';
  return [div,lab,inp];
}

function addSelect(element, label, options, def, action) {
  var div = document.createElement('div');
  var lab = document.createElement('div');
  var sel = document.createElement('select');
  options.forEach(option => {
    var text,value;
    if (Array.isArray(option)) {
      text = option[0];
      value = option[1];
    } else {
      text = value = option;
    }
    var opt = document.createElement('option');
    opt.setAttribute('value',value);
    opt.innerText = text;
    sel.appendChild(opt);
  });
  div.appendChild(lab);
  div.appendChild(sel);
  div.style = `
    display: flex;
    width: 100%;
    margin-bottom: 10px;
    justify-content: space-between;
  `;
  lab.style = `
    flex-shrink: 0;
  `;
  sel.style = `
    flex-grow: 1;
    min-width: 0;
    max-width: 50%;
  `;
  sel.value = def;
  lab.innerText = label;
  element.appendChild(div);
  sel.oninput = function(event) {
    var value = event.target.value;
    action(value);
    rerender = true;
  };
  this.minHeight = max(this.minHeight,div.parentElement.offsetTop+div.offsetTop+div.offsetHeight+40);
  w.style.height = this.minHeight + 'px';
  return [div,lab,sel];
}

function addDatalist(element, label, options, def, action) {
  var div = document.createElement('div');
  var lab = document.createElement('div');
  var inp = document.createElement('input');
  var dl = document.createElement('datalist');
  var uid = performance.now();
  dl.id = uid;
  inp.setAttribute('list', uid);
  options.forEach(option => {
    var text,value;
    if (Array.isArray(option)) {
      text = option[0];
      value = option[1];
    } else {
      text = value = option;
    }
    var opt = document.createElement('option');
    opt.setAttribute('value',value);
    opt.innerText = text;
    dl.appendChild(opt);
  });
  div.appendChild(lab);
  div.appendChild(inp);
  div.appendChild(dl);
  div.style = `
    display: flex;
    width: 100%;
    margin-bottom: 10px;
    justify-content: space-between;
  `;
  lab.style = `
    flex-shrink: 0;
  `;
  inp.style = `
    flex-grow: 1;
    min-width: 0;
    max-width: 50%;
  `;
  lab.innerText = label;

  element.appendChild(div);
  inp.value = def;
  inp.oninput = function(event) {
    var value = event.target.value;
    action(value);
    rerender = true;
  };
  this.minHeight = max(this.minHeight,div.parentElement.offsetTop+div.offsetTop+div.offsetHeight+40);
  w.style.height = this.minHeight + 'px';
  return [div,lab,inp];
}

function addOkCancel(okAction=()=>{},cancelAction=()=>{}) {
var ok = document.createElement('button');
var cancel = document.createElement('button');
ok.innerText = 'OK';
cancel.innerText = 'Cancel';
ok.style = cancel.style = `
  position: absolute;
  width: 71px;
  height: 20px;
  bottom: 10px;
`;
ok.style.right = '10px';
cancel.style.right = '91px';
w.appendChild(ok);
w.appendChild(cancel);
ok.onclick = function(event) {
  okAction();
  w.remove();
}
cancel.onclick = function(event) {
  cancelAction();
  w.remove();
}

}

function close() {
  w.remove();
}

w.style.height = w.minHeight + 'px';
w.style.width = w.minWidth + 'px';

this.body = bd;
this.element = w;
this.addTabs = addTabs;
this.addText = addText;
this.addInput = addInput;
this.addSelect = addSelect;
this.addDatalist = addDatalist;
this.addOkCancel = addOkCancel;
this.close = close;

}

  static addCircuitDialogue() {
    var title = 'Circuit Settings';
    var w = new FloatingWindow2(title);
    w.addInput(w.body,'Component Width:','number',circuit.settings.width,value => circuit.settings.width = value);

    w.addDatalist(w.body,'Shape:',[['Normal','normal'],['Layout','layout'],['DIL Chip','DIL']], circuit.settings.shape, value => circuit.settings.shape = value);


    w.addInput(w.body,'Clock Frequency:','number',circuit.settings.frequency,value => circuit.settings.frequency = value);
  }

  static addGenericDialogue(component) {
    var title = component.type === 'IC' ? component.subcircuit : component.type;
    var w = new FloatingWindow2(title);
    var tbs = w.addTabs('Functional','Aesthetic');
    var attributes = component.attributes;


  if (attributes.includes('label')) {
    var inp = w.addInput(tbs[0][1],'Label:','text',component.label, value => component.label = value)[2];
    inp.focus();
  }

  w.addSelect(tbs[1][1],'Rotation:',[0,1,2,3],component.rotation, value => component.rotation = value);
  if (attributes.includes('bits')) {
    w.addInput(tbs[0][1],'Bits:','number',component.bits, value => component.bits = value);
  }
  if (attributes.includes('sbits')) {
    w.addInput(tbs[0][1],'Selection Bits:','number',component.sbits, value => component.sbits = value);
  }
  if (attributes.includes('dbits')) {
    w.addInput(tbs[0][1],'Data Bits:','number',component.dbits, value => component.dbits = value);
  }
  if (attributes.includes('abits')) {
    w.addInput(tbs[0][1],'Address Bits:','number',component.abits, value => component.abits = value);
  }

  if (attributes.includes('ports')) {
    w.addInput(tbs[0][1],'Ports:','number',component.ports, value => component.ports = value);
  }
  if (attributes.includes('inBits')) {
    w.addInput(tbs[0][1],'Input Bits:','number',component.inBits, value => component.inBits = value);
  }
  if (attributes.includes('outBits')) {
    w.addInput(tbs[0][1],'Output Bits:','number',component.outBits, value => component.outBits = value);
  }
  if (attributes.includes('setFromIC')) {
    w.addInput(tbs[0][1],'Set Bits from IC:','checkbox',component.setFromIC, value => component.setFromIC = value);
  }
  var inverted;
  if (attributes.includes('inverted')) {
    if (component.pins.length === 1) {
      if (component.pins[0].type === 'output') {
        w.addInput(tbs[0][1],'Invert output:','checkbox',component.inverted === '[0]', value => component.inverted = value ? '[0]' : '[]');
      } else {
        w.addInput(tbs[0][1],'Invert input:','checkbox',component.inverted === '[0]', value => component.inverted = value ? '[0]' : '[]');
      }
    } else {
      inverted = w.addInput(tbs[0][1],'Inverted:','text',component.inverted, value => component.inverted = value);
    }
  }

  if (attributes.includes('signed')) {
    w.addInput(tbs[0][1],'Signed Operation:','checkbox',component.signed, value => component.signed = value);
  }

  if (attributes.includes('mirror')) {
    w.addInput(tbs[1][1],'Mirror:','checkbox',component.mirror, value => component.mirror = value);
  }
  if (attributes.includes('small')) {
    w.addInput(tbs[1][1],'Small Shape:','checkbox',component.small, value => component.small = value);
  }

  if (attributes.includes('color')) {
    w.addInput(tbs[1][1],'Color:','color',component.color, value => component.color = value);
  }
  if (attributes.includes('offColor')) {
    w.addInput(tbs[1][1],'Off Color:','color',component.offColor, value => component.offColor = value);
  }
  if (attributes.includes('size')) {
    w.addInput(tbs[1][1],'Size:','number',component.size, value => component.size = value);
  }
  if (attributes.includes('square')) {
    w.addInput(tbs[1][1],'Square:','checkbox',component.square, value => component.square = value);
  }
  if (attributes.includes('border')) {
    w.addInput(tbs[1][1],'Border:','checkbox',component.border, value => component.border = value);
  }

  if (attributes.includes('width')) {
    w.addInput(tbs[1][1],'Width:','number',component.width, value => component.width = value);
  }
  if (attributes.includes('height')) {
    w.addInput(tbs[1][1],'Height:','number',component.height, value => component.height = value);
  }
  if (attributes.includes('fontSize')) {
    w.addInput(tbs[1][1],'Font Size:','number',component.fontSize, value => component.fontSize = value);
  }

  if (attributes.includes('autoPos')) {
    w.addInput(tbs[1][1],'Set Pin Position:','checkbox',!component.autoPos, value => {
      component.autoPos = !value;
      xinp.disabled = !value;
      yinp.disabled = !value;
    });
    var xinp = w.addInput(tbs[1][1],'Pin X:','number',component.pinx ?? 0, value => component.pinx = value)[2];
    var yinp = w.addInput(tbs[1][1],'Pin Y:','number',component.piny ?? 0, value => component.piny = value)[2];
    xinp.disabled = component.autoPos;
    yinp.disabled = component.autoPos;
  }



  if (attributes.includes('key')) {
    var inp = w.addInput(tbs[0][1],'Map to Key:','text', component.key, value => component.key = value)[2];
    w.addInput(tbs[0][1],'','button', 'Reset', () => {
      inp.value = '';
      component.key = null;
    });
    inp.onkeydown = function(event) {
      event.preventDefault();
      inp.value = event.code;
      component.key = event.code;
    };
    inp.onfocus = function(event) {
      inp.placeholder = '(press any key)';
    }
    inp.onblur = function(event) {
      inp.placeholder = '';
    }
  }

  if (attributes.includes('keys')) {
    var keys = {
      wasd: 'wasd',
      arrows: 'arrows',
      none: null,
    }
    var keysback = new Map();
    keysback.set('wasd','wasd');
    keysback.set('arrows','arrows');
    keysback.set(null,'none');

    w.addSelect(tbs[0][1],'Map to Keys:',['wasd','arrows','none'],keysback.get(component.keys), value => component.keys = keys[value]);
  }
  var inputs;
  if (attributes.includes('inputs')) {
    inputs = w.addInput(tbs[0][1],'# of Inputs:','number',component.inputs, value => component.inputs = value);
    if (component?.multiBit) inputs[2].disabled = true;
  }
  if (attributes.includes('compliment')) {
    w.addInput(tbs[0][1],'Complimentary Outputs:','checkbox',component.compliment, value => {
      component.compliment = value;
      if (inverted) inverted[2].value = component.inverted;
    });
  }
  if (attributes.includes('multiBit')) {
    w.addInput(tbs[0][1],'Bus Input:','checkbox',component.multiBit, value => {
      component.multiBit = value;
      if (inputs) {
        inputs[2].disabled = value;
        inputs[2].value = component.inputs;
      }
    });
  }
  if (attributes.includes('data')) {
    w.addInput(tbs[0][1],'Data:','text',component.data, value => component.data = value);
  }
  if (attributes.includes('value')) {
    w.addInput(tbs[0][1],'Value:','number',component.value, value => component.value = value);
  }
  if (attributes.includes('dual')) {
    w.addInput(tbs[0][1],'Dual Pin:','checkbox',component.dual, value => component.dual = value);
  }

  if (attributes.includes('display')) {
    w.addSelect(tbs[0][1],'Display:',[['Seven Segment','7seg'],['Sixteen Segment','16seg'],['M/-/E flags','MNEflags']],component.display, value => {
      component.display = value;
      refreshEncoding();
    });
  }
  var encoding, refreshEncoding;
  if (attributes.includes('encoding')) {
    refreshEncoding = function() {
      if (encoding) encoding.remove();
      var display = component.display;
      if (display === '7seg') {
        encoding = w.addSelect(tbs[0][1],'Encoding:',[['None - Seperate Inputs','noneSplit'],['None - Bus Input','noneBus'],['4-Bit BCD','bcd'],['4-Bit BCD w/ tail','bcdTail'],['4-Bit Hex','hex'],['4-Bit Hex w/ tail','hexTail']],component.encoding, value => component.encoding = value)[0];
      } else if (display === '16seg') {
        encoding = w.addSelect(tbs[0][1],'Encoding:',[['None - Bus Input','noneBus'],['4-Bit BCD','bcd'],['4-Bit Hex','hex'],['7-Bit ASCII','ascii']], component.encoding, value => component.encoding = value)[0];
      } else if (display === 'MNEflags') {
        encoding = w.addSelect(tbs[0][1],'Encoding:',[['None - Seperate Inputs','noneSplit'],['None - Bus Input','noneBus']],component.encoding, value => component.encoding = value)[0];
      }
    }
    refreshEncoding();
  }

  if (attributes.includes('hex')) {
    w.addInput(tbs[0][1],'Encode Hex:','checkbox',component.hex, value => component.hex = value);
  }
  if (attributes.includes('ascii')) {
    w.addInput(tbs[0][1],'Encode ascii:','checkbox',component.ascii, value => component.ascii = value);
  }
  if (attributes.includes('gray')) {
    w.addSelect(tbs[0][1],'Encoding:',['binary','gray'],component.gray ? 'gray' : 'binary', value => component.gray = value === 'gray');
  }
  if (attributes.includes('sticky')) {
    w.addInput(tbs[0][1],'Sticky:','checkbox',component.sticky, value => component.sticky = value);
  }
  if (attributes.includes('dt')) {
    w.addInput(tbs[0][1],'Double Throw:','checkbox',component.dt, value => component.dt = value);
  }
  if (attributes.includes('input splitting')) {
    w.addInput(tbs[0][1],'Input Splitting:','text',component['input splitting'], value => component['input splitting'] = value);
  }
  if (attributes.includes('output splitting')) {
    w.addInput(tbs[0][1],'Output Splitting:','text',component['output splitting'], value => component['output splitting'] = value);
  }
  if (attributes.includes('spreading')) {
    w.addInput(tbs[0][1],'Spreading:','number',component.spreading, value => component.spreading = value);
  }

  if (component.type in builtIn) {
    w.addInput(tbs[0][1],'','button','Open Circuit',() => {
      w.close();
      loadConcrete(builtIn[component.type],component.getParameterBindings());
    })
  }

  if (component.type === 'IC') {

    w.addSelect(tbs[0][1],'Location:',['Blank','Saves','Examples','DIL Library'],component.location, value => {
      component.location = value;
      component.init();
      refreshFields(false);
    });
    var dl = null;
    var parameterInps = [];
    function refreshFields(init) {
      if (dl) dl.remove();
      parameterInps.forEach(inp => inp.remove());
      parameterInps.length = 0;
      dl = w.addDatalist(tbs[0][1],'Circuit:',Object.keys(component.getLocation()),init ? component.subcircuit : '', value => {
        component.subcircuit = value;
        component.init();
        parameterInps.forEach(inp => inp.remove());
        parameterInps.length = 0;
        populateParameters();
      })[0];
      function populateParameters() {
        component.parameters.forEach(parameter => {
          parameterInps.push(w.addInput(tbs[0][1],parameter + ':','text',component[parameter],value => {
            component[parameter] = value;
            component.init();
          })[0]);
        });
        parameterInps.push(w.addInput(tbs[0][1],'','button','Open Circuit',() => {
          w.close();
          if (!running) component.init();
          circuitStack.push(component.circuit);
        })[0]);
      }
      populateParameters();
    }
    refreshFields(true);
  }

    w.addOkCancel(()=>{},()=>{});
  }

}

/*
     var add = w.addInput(tbs[2][1],'Add Parameter:','text','', parameter => {
        if (parameter in parameterInputs) return;
        parameterInputs[parameter] = w.addInput(tbs[2][1],parameter + ':','text','',value => {
          component[parameter] = value;
          component.init();
        });
        add.value = '';
      })[2];
    var parameterInputs = {};
    component.parameters.forEach(parameter => {
      parameterInputs[parameter] = w.addInput(tbs[2][1],parameter + ':','text',component[parameter],value => {
        component[parameter] = value;
        component.init();
      })[2];
    });
*/