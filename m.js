class ContextMenu {

  constructor(x,y) {
    var element = document.createElement('div');
    this.element = element;
    element.style.top = y + 'px';
    element.style.left = x + 'px';
    element.className = 'context-menu';
    document.body.appendChild(element);
    this.menuItems = [];
    element.onpointermove = function(event) {
      hovering = null;
      rerender = true;
    }
  }

  addText(item) {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.innerText = item;
    element.className = 'context-menu-text';
    return element;
  }

  addMenuItem(item,action) {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.className = 'context-menu-item';
    if (typeof item == 'function') {
      element.innerText = item();
      element.onmouseup = function(event) {
        action(this,contextMenu.element);
        this.innerText = item();
        rerender = true;
      }
    } else {
      element.innerText = item;
      element.onmouseup = function(event) {
        action(this,contextMenu.element);
        rerender = true;
      }
    }
    return element;
  }

  addMenuToFloatingWindowItem(item,title,label,value,action) {
    this.addMenuItem(item, () => {
      this.destroy();
      var w = new FloatingWindow(title, label, value);
      w.submit = v => {action(v); rerender = true;};
    });
  }

  addToggleMenuItem(cond,pass,fail,action) {
    contextMenu.addMenuItem(() => cond() ? pass : fail, v => {action(v); rerender = true;});
  }

  addLine() {
    var element = document.createElement('div');
    this.element.appendChild(element);
    element.className = 'context-menu-hl';
  }

  destroy() {
    this.element.remove();
    contextMenu = null;
    rerender = true;
  }

}

var contextMenu = null;

function createContextMenu(event) {
  contextMenu = new ContextMenu(event.clientX, event.clientY);
  contextMenu.addMenuItem('Look Up "this.x"');
  contextMenu.addLine();
  contextMenu.addMenuItem('Search With Google');
  contextMenu.addLine();
  contextMenu.addMenuItem('Cut');
  contextMenu.addMenuItem('Copy');
  contextMenu.addMenuItem('Paste');
  contextMenu.addLine();
  contextMenu.addMenuItem('Share');
  contextMenu.addLine();
  contextMenu.addMenuItem('Font');
  contextMenu.addMenuItem('Spelling and Grammar');
  contextMenu.addMenuItem('Substitutions');
  contextMenu.addMenuItem('Transformations');
  contextMenu.addMenuItem('Speech');
  contextMenu.addMenuItem('Layout Orientation');
}

function createCircuitContextMenu(event,object) {
}

function createObjectContextMenu(event,object) {
  contextMenu = new ContextMenu(event.clientX, event.clientY);
  var menu = contextMenu;
  menu.addText(object.type);
  menu.addLine();
  var title = object.type === 'IC' ? object.circuit : object.type;
  var attributes = object.attributes;


  if (attributes.includes('bits')) {
    menu.addMenuToFloatingWindowItem(
      'Set bits',
      title,
      'Bits: ',
      object.bits,
      bits => object.bits = bits,
    );
  }
  if (attributes.includes('sbits')) {
    menu.addMenuToFloatingWindowItem(
      'Set selection bits',
      title,
      'Selection bits: ',
      object.sbits,
      sbits => object.sbits = sbits,
    );
  }
  if (attributes.includes('dbits')) {
    menu.addMenuToFloatingWindowItem(
      'Set data bits',
      title,
      'Data bits: ',
      object.dbits,
      dbits => object.dbits = dbits,
    );
  }
  if (attributes.includes('abits')) {
    menu.addMenuToFloatingWindowItem(
      'Set address bits',
      title,
      'Address bits: ',
      object.abits,
      abits => object.abits = abits,
    );
  }
  if (attributes.includes('setFromIC')) {
    menu.addToggleMenuItem(
      () => object.setFromIC,
      'Dont set from IC',
      'Set from IC',
      () => object.setFromIC = !object.setFromIC,
    );
  }
  if (attributes.includes('inverted')) {
    if (object.pins.length === 1) {
      if (object.pins[0].type === 'output') {
        menu.addMenuItem(
          'Invert output',
          () => object.inverted = object.inverted.toString() === '' ? '[0]' : '[]',
        );
      } else {
        menu.addMenuItem(
          'Invert input',
          () => object.inverted = object.inverted.toString() === '' ? '[0]' : '[]',
        );
      }
    } else {
      menu.addMenuToFloatingWindowItem(
        'Set inverted',
        title,
        'Inverted pins: ',
        object.inverted,
        inverted => object.inverted = inverted,
      );
    }
  }
  if (attributes.includes('mirror')) {
    menu.addMenuItem(
      'Set mirror',
      () => object.mirror = !object.mirror,
    );
  }
  if (attributes.includes('small')) {
    menu.addToggleMenuItem(
      () => object.small,
      'Set normal shape',
      'Set small shape',
      () => object.small = !object.small,
    );
  }


  if (attributes.includes('width')) {
    menu.addMenuToFloatingWindowItem(
      'Set width',
      title,
      'Width: ',
      object.width,
      width => object.width = width,
    );
  }
  if (attributes.includes('height')) {
    menu.addMenuToFloatingWindowItem(
      'Set height',
      title,
      'Height: ',
      object.height,
      height => object.height = height,
    );
  }


  if (attributes.includes('key')) {
    if (object.key !== null) {
      menu.addMenuItem(
        'Dont map to key',
        () => object.key = null,
      );
    }
    menu.addMenuToFloatingWindowItem(
      'Map ' + object.type + ' to key',
      title,
      'Key (press any key): ',
      object.key,
      key => object.key = key,
    );
    menu.addMenuItem('Map to key', () => {
      menu.destroy();
      var w = new FloatingWindow(
        'Map ' + object.type + ' to key',
        'Key (press any key): ',
        object.key
      );
      w.inputElement.onkeydown = function(event) {
        event.preventDefault();
        w.inputElement.value = event.code;
      };
      w.submit = key => object.key = key;
    });
  }

  if (attributes.includes('keys')) {
    if (object.keys !== 'wasd') {
      menu.addMenuItem(
        'Map to wasd keys',
        () => {menu.destroy(); object.keys = 'wasd'},
      );
    }
    if (object.keys !== 'arrows') {
      menu.addMenuItem(
        'Map to arrow keys',
        () => {menu.destroy(); object.keys = 'arrows'},
      );
    }
    if (object.keys !== null) {
      menu.addMenuItem(
        'Dont map to keys',
        () => {menu.destroy(); object.keys = null},
      );
    }
  }

  if (attributes.includes('inputs')) {
    menu.addMenuToFloatingWindowItem(
      'Set # of inputs',
      title,
      'Inputs: ',
      object.inputs,
      inputs => object.inputs = inputs,
    );
  }
  if (attributes.includes('compliment') && !object.inverted.includes(object.pins.length-1)) {
    menu.addToggleMenuItem(
      () => object.compliment,
      'Normal output',
      'Complimentary outputs',
      () => object.compliment = !object.compliment,
    );
  }
  if (attributes.includes('data')) {
    menu.addMenuToFloatingWindowItem(
      'Set data',
      title,
      'Data: ',
      object.data,
      data => object.data = data,
    );
  }
  if (attributes.includes('value')) {
    menu.addMenuToFloatingWindowItem(
      'Set value',
      title,
      'Value: ',
      object.value,
      value => object.value = value,
    );
  }
  if (attributes.includes('dual')) {
    menu.addToggleMenuItem(
      () => object.dual,
      'Make normal pin',
      'Make dual pin',
      () => object.dual = !object.dual,
    );
  }
  if (attributes.includes('hex')) {
    menu.addToggleMenuItem(
      () => object.hex,
      'Dont encode hex',
      'Encode hex',
      () => object.hex = !object.hex,
    );
  }
  if (attributes.includes('ascii')) {
    menu.addToggleMenuItem(
      () => object.ascii,
      'Dont encode ascii',
      'Encode ascii',
      () => object.ascii = !object.ascii,
    );
  }
  if (attributes.includes('gray')) {
    menu.addToggleMenuItem(
      () => object.gray,
      'Use binary encoding',
      'Use gray encoding',
      () => object.gray = !object.gray,
    );
  }
  if (attributes.includes('sticky')) {
    menu.addToggleMenuItem(
      () => object.sticky,
      'Dont make sticky',
      'Make sticky',
      () => object.sticky = !object.sticky,
    );
  }
  if (attributes.includes('pre')) {
    menu.addToggleMenuItem(
      () => object.pre,
      'Remove preset pin',
      'Add preset pin',
      () => object.pre = !object.pre,
    );
  }
  if (attributes.includes('clr')) {
    menu.addToggleMenuItem(
      () => object.clr,
      'Remove clear pin',
      'Add clear pin',
      () => object.clr = !object.clr,
    );
  }
  if (attributes.includes('label')) {
    menu.addMenuToFloatingWindowItem(
      'Set label',
      title,
      'Label: ',
      object.label,
      label => object.label = label,
    );
  }
  if (attributes.includes('input splitting')) {
    menu.addMenuToFloatingWindowItem(
      'Set input splitting',
      title,
      'Input Splitting: ',
      object['input splitting'],
      splitting => object['input splitting'] = splitting,
    );
  }
  if (attributes.includes('output splitting')) {
    menu.addMenuToFloatingWindowItem(
      'Set output splitting',
      title,
      'Output Splitting: ',
      object['output splitting'],
      splitting => object['output splitting'] = splitting,
    );
  }
  if (attributes.includes('spreading')) {
    menu.addMenuToFloatingWindowItem(
      'Set spreading',
      title,
      'Spreading: ',
      object.spreading,
      spreading => object.spreading = spreading,
    );
  }

  if (object.type === 'IC') {
    object.parameters.forEach(parameter => {
      menu.addMenuToFloatingWindowItem(
        'Set ' + parameter,
        title,
        parameter + ': ',
        object[parameter],
        value => {object[parameter] = value; object.init();},
      );
    });
    menu.addMenuItem(() => 'Open circuit', () => {
      menu.destroy();
      var circuit = object.circuit;
      var w = new FloatingTextSaveWindow('Save','Do you want to save the current circuit?');
      w.save = () => {
        if (circuit.settings.name === '') {
          var w = new FloatingWindow('Save As','Name: ', '');
          w.submit = newname => {
            if (newname in saves) {
              alert('name already taken');
              return;
            }
            if (newname === '') {
              alert('name cannot be empty');
              return;
            }
            circuit.settings.name = newname;
            save(newname);
            load(circuit);
            w.removeWindow();
          }
        } else {
          save();
          load(circuit);
          w.removeWindow();
        }
      }
      w.dontSave = () => {
        load(circuit);
        w.removeWindow();
      }
    });
  }
  if (object.type in builtIn) {
    menu.addMenuItem(() => 'Open circuit', () => {
      menu.destroy();
      var circuit = builtIn[object.type];
      var w = new FloatingTextSaveWindow('Save','Do you want to save the current circuit?');
      w.save = () => {
        if (circuit.settings.name === '') {
          var w = new FloatingWindow('Save As','Name: ', '');
          w.submit = newname => {
            if (newname in saves) {
              alert('name already taken');
              return;
            }
            if (newname === '') {
              alert('name cannot be empty');
              return;
            }
            circuit.settings.name = newname;
            save(newname);
            loadConcrete(circuit,object.getParameterBindings());
            w.removeWindow();
          }
        } else {
          save();
          loadConcrete(circuit,object.getParameterBindings());
          w.removeWindow();
        }
      }
      w.dontSave = () => {
        loadConcrete(circuit,object.getParameterBindings());
        w.removeWindow();
      }
    });
  }
  menu.addMenuItem('Delete', () => {object.remove(); menu.destroy()});
}

function createColorPicker(contextMenu,menuItem,object) {
  var y = contextMenu.offsetTop + menuItem.offsetTop + 1;
  var x = contextMenu.offsetLeft + menuItem.offsetWidth + 1;
  new ColorPicker(x,y,color => {object.color = color; draw();},object.color);
}

function createFileContextMenu(x,y) {
  if (contextMenu) contextMenu.destroy();
  contextMenu = new ContextMenu(x,y);
  var menu = contextMenu;

  menu.element.className = 'context-menu-dropdown';

  menu.addMenuItem('New Circuit', () => {
    menu.destroy();
    clear();
  });
  if (circuit.settings.name !== '') {
    menu.addMenuItem('Save', () => {
      menu.destroy();
      save();
    });
  }
  menu.addMenuItem('Save As', () => {
    menu.destroy();
    var w = new FloatingWindow('Save As','Name: ', '');
    w.submit = newname => {
      if (newname in saves) {
        alert('name already taken');
        return;
      }
      if (newname === '') {
        alert('name cannot be empty');
        return;
      }
      circuit.settings.name = newname;
      save(newname);
    }
  });
  menu.addMenuItem('Open', () => {
    menu.destroy();
    var _saves = saves;
    if (!_saves) _saves = saves = JSON.parse(decompress(localStorage.getItem('saves')));
    new FloatingItemListWindow('Open',Object.keys(_saves));
  });
  menu.addMenuItem('Examples', () => {
    menu.destroy();
    new FloatingItemListWindow('Open',Object.keys(examples));
  });
  menu.addMenuItem('DIL Library', () => {
    menu.destroy();
    new FloatingItemListWindow('Open',Object.keys(DILLibrary));
  });
  menu.addMenuItem('Export', () => {
    menu.destroy();
  });

}



function createEditContextMenu(x,y) {
  if (contextMenu) contextMenu.destroy();
  contextMenu = new ContextMenu(x,y);
  var menu = contextMenu;

  menu.element.className = 'context-menu-dropdown';

  menu.addMenuItem('Circuit Settings', () => {
    menu.destroy();
    FloatingWindow2.addCircuitDialogue();
  });
  
  menu.addMenuToFloatingWindowItem(
    'Set component width',
    'Circuit',
    'Width: ',
    circuit.settings.width,
    width => circuit.settings.width = width,
  );
    menu.addToggleMenuItem(
      () => circuit.settings.shape === 'DIL',
      'Set normal shape',
      'Set DIL shape',
      () => circuit.settings.shape = circuit.settings.shape === 'DIL' ? 'normal' : 'DIL',
    );
  menu.addMenuToFloatingWindowItem(
    'Set clock frequency',
    'Circuit',
    'Frequency(hz): ',
    circuit.settings.frequency,
    frequency => circuit.settings.frequency = frequency,
  );
  menu.addMenuItem(() => 'Add/edit script', () => {
    contextMenu.destroy();
    var w = new FloatingTextArea('Circuit script', circuit.settings.script ?? '');
    w.submit = script => circuit.settings.script = script;
  });

  menu.addMenuToFloatingWindowItem(
    'Add parameter',
    'Circuit',
    'Parameter name: ',
    '',
    parameter => {
      if (circuit.settings.parameters.includes(parameter)) return;
      circuit.settings.parameters.push(parameter);
    },
  );

  menu.addMenuToFloatingWindowItem(
    'Remove parameter',
    'Circuit',
    'Parameter name: ',
    circuit.settings.parameters[circuit.settings.parameters.length-1] ?? '',
    parameter => {
      var index = circuit.settings.parameters.indexOf(parameter);
      if (index > -1) circuit.settings.parameters.splice(index,1);
    },
  );

  circuit.settings.parameters.forEach(parameter => {
    menu.addMenuToFloatingWindowItem(
      'Set ' + parameter,
      'Circuit',
      parameter + ': ',
      circuit.settings[parameter] ?? '',
      value => circuit.settings[parameter] = value,
    );
  });

//  menu.addMenuItem(() => 'Set defaults', () => {
//    menu.destroy();
//    circuit.settings.defaults = circuit.settings.parameters.map(p => circuit.settings[p]);
//  });

}
