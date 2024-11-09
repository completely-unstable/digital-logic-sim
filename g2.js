class Cell extends Component {
  static metrics = getMetrics('Cell');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.addPin(1,0,'output');
    addAttribute.nonNegativeNumber(this,'voltage',9);
  }

  drawLocal(ctx,x,y) {
    drawCell(ctx,x,y);
  }

  update() {
    this.pins[0].update(0);
    this.pins[1].update(this.voltage > 0);
  }
}

class Battery extends Component {
  static metrics = getMetrics('Battery');

  constructor(x,y) {
    super(x,y);
    this.addPin(-1,0,'output');
    this.addPin(1,0,'output');
    addAttribute.nonNegativeNumber(this,'voltage',9);
  }

  drawLocal(ctx,x,y) {
    drawBattery(ctx,x,y);
  }

  update() {
    this.pins[0].update(0);
    this.pins[1].update(this.voltage > 0);
  }
}

class Resistor extends Component {
  static metrics = getMetrics('Resistor');

  constructor(x,y) {
    super(x,y);
    this.a = this.addPin(0,0,'input');
    this.b = this.addPin(0,2,'input');
    addAttribute.bits(this);
  }

  drawLocal(ctx,x,y) {
    drawPullResistor(ctx,x,y);
  }

  update() {
    var sa = this.a.state;
    var sb = this.b.state;
    if (sb !== null) this.a.queue(sb,false);
    if (sa !== null) this.b.queue(sa,false);
  }
}

class Capacitor extends Component {
  static metrics = getMetrics('Capacitor');

  constructor(x,y) {
    super(x,y);
    this.addPin(0,0,'output');
    this.addPin(1,0,'output');
  }

  drawLocal(ctx,x,y) {
    drawCapacitor(ctx,x,y);
  }

  update() {

  }
}

class Inductor extends Component {
  static metrics = getMetrics('Inductor');

  constructor(x,y) {
    super(x,y);
    this.addPin(-1,0,'output');
    this.addPin(1,0,'output');
  }

  drawLocal(ctx,x,y) {
    drawInductor(ctx,x,y);
  }

  update() {

  }
}

class Diode extends Component {
  static metrics = getMetrics('Diode');

  constructor(x,y) {
    super(x,y);
    this.anode = this.addPin(0,0,'dual');
    this.cathode = this.addPin(1,0,'dual');
  }

  drawLocal(ctx,x,y) {
    drawDiode(ctx,x,y);
  }

  forwardUpdate() {
    if (this.anode.state) {
      this.cathode.queue(1);
    } else {
      this.cathode.queue(null);
    }
  }
  backwardUpdate() {
    if (!this.cathode.state && this.cathode.state !== null) {
      this.anode.queue(0);
    } else {
      this.anode.queue(null);
    }
  }
  update() {
    this.cathode.queue(this.anode.state);
  }
}

class NPNBJT extends Component {
  static metrics = getMetrics('NPNBJT');

  constructor(x, y) {
    super(x, y);
    this.addPin(0, 0, 'input');
    this.addPin(1, -1, 'input');
    this.addPin(1, 1, 'input');
    addAttribute.bits(this);
  }

  drawLocal(ctx,x,y) {
    drawNPNBJT(ctx,x,y);
  }

  update(pin) {
    var pg = this.pins[0];
    var pa = this.pins[1];
    var pb = this.pins[2];
    var sg = pg.state;
    var sa = pa.state;
    var sb = pb.state;
    if (pin === pg) {
      var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
      this.closed = sg && sg !== null;
      pa.update(state);
      pb.update(state);
      return;
    }

    this.closed = sg && sg !== null;
    if (pin === pb) {
      pa.update(pb.state);
    }
    if (pin === pa) {
      pb.update(pa.state);
    }
  }
}

class PNPBJT extends Component {
  static metrics = getMetrics('PNPBJT');

  constructor(x, y) {
    super(x, y);
    this.addPin(0, 0, 'input');
    this.addPin(1, 1, 'input');
    this.addPin(1, -1, 'input');
    addAttribute.bits(this);
  }

  drawLocal(ctx,x,y) {
    drawPNPBJT(ctx,x,y);
  }

  update(pin) {
    var pg = this.pins[0];
    var pa = this.pins[1];
    var pb = this.pins[2];
    var sg = pg.state;
    var sa = pa.state;
    var sb = pb.state;
    if (pin === pg) {
      var state = pa.connectionGroup.isDriven ? sa : pb.connectionGroup.isDriven ? sb : null;
      this.closed = !sg && sg !== null;
      pa.update(state);
      pb.update(state);
      return;
    }
    this.closed = !pg.state && pg.state !== null;
    if (pin === pb) {
      pa.update(pb.state);
    }
    if (pin === pa) {
      pb.update(pa.state);
    }
  }
}