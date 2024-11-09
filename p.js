class Pin extends Vector {
  constructor(x,y,component,type,label='') {
    super(x,y);
    this.origin = vector(x,y);
    this.orientation = type === 'output' ? 'right' : 'left';
    this.connectionGroup = null;
    this.component = component;
    this.state = 0;
    this.inverted = false;
    this.type = type;
    this.driving = false;
    this.label = label;
    this.bubble = true;
  }

  queue(state,drive) {
    updateQueue.push([this,state,drive]);
  }

  update(state,drive) {
    if (typeof drive === 'undefined') {
      this.driving = state !== null && this.type !== 'input';
    } else {
      this.driving = drive;
    }
    this.state = state >>> 0;
    this.connectionGroup.update(this);
  }

  remove() {
    this.component.pins.removePin(this);
  }
}

class Pins extends Array {
  constructor() {
    super();
  }

  removeInputs() {
    this.splice(0, this.length, ...this.filter(pin => pin.type !== 'input'));
  }
  removeOutputs() {
    this.splice(0, this.length, ...this.filter(pin => pin.type !== 'output'));
  }

  removePin(pin) {
    var index = this.indexOf(pin);
    if (index > -1) this.splice(index,1);
  }

  clearAll() {
    this.length = 0;
  }

  get inputs() {
    return this.filter(pin => ['input','dual'].includes(pin.type));
  }

  get outputs() {
    return this.filter(pin => pin.type === 'output');
  }
}