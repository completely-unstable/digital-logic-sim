class Subcircuit {
  type = this.constructor.name;

  constructor(circuit) {
    if (typeof circuit === 'string') {
      circuit = JSON.parse(circuit);
    }

    this.components = [];
    this.wires = new Wires();
    this.settings = {};

    if (!circuit) {
      this.settings.name = '';
      this.settings.width = 3;
      this.settings.height = 3;
      this.settings.shape = 'normal';
      this.settings.script = null;
      this.settings.parameters = [];
      this.settings.frequency = 1;
      this.compiled = null;
      return this;
    }

    var {components, wires, settings} = circuit;
    this.settings.settings.name = settings?.name ?? '';
    this.settings.width = settings?.width ?? 3;
    this.settings.height = settings?.width ?? 3;
    this.settings.shape = settings?.shape ?? 'normal';
    this.settings.script = settings?.script ?? null;
    this.settings.parameters = settings?.parameters ?? [];
    this.settings.frequency = settings?.frequency ?? 1;
    this.settings.compiled = settings?.compiled ?? null;
  
    chunk(wires,4).forEach(wire => this.wires.addWire(...wire));
  
    components.forEach(component => {
      var c;
      if (component.type === 'IC') {
        c = new IC(component.x, component.y, component.circuit);
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
      if (component?.setFromIC) c.bits = this.settings?.bits || 1;
      this.components.push(c);
    });
  }
}

class Circuit {
  type = this.constructor.name;

  constructor(circuit) {
    this.type = 'Circuit';
    this.subcircuit = new Subcircuit(circuit);
    this.settings = this.subcircuit.settings;
    this.components = this.subcircuit.components;
    this.wires = this.subcircuit.wires;
  }
}

class CircuitStack extends Stack {
  constructor(top) {
    super();
    this.push(top);
  }

  push(item) {
    super.push(item);
    circuit = item;
  }

  pop() {
    var element = super.pop();
    if (typeof this.peek() === 'undefined') this.push(element);
    circuit = this.peek();
    return element;
  }
}

var circuit;

var circuitStack = new CircuitStack(new Subcircuit());