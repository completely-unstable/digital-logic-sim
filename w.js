class Wires extends Array {
  constructor() {
    super();
  }

  addWire(x1,y1,x2,y2) {
    var wire = new Wire(vector(x1,y1),vector(x2,y2));
    this.push(wire);
    return wire;
  }
  addWireV(p1,p2) {
    var wire = new Wire(p1,p2);
    this.push(wire);
    return wire;
  }

  simplify(wire) {
    if (wire.isJoint()) return;
    do {
      var ov = this.find(wire2 => {
        if (wire === wire2) return false;
        if (wire2.isJoint()) {
          return wire.ends.some(end => end.eq(wire2.ends[0]));
        } else {
          return wire.overlaps(wire2);
        }
      })
      if (ov) {
        this.combine(wire,ov);
      }
    } while (ov);
  }

  combine(w1,w2) {
    var v = w1.ends.concat(w2.ends),
        [n,m] = [Vector.min(...v), Vector.max(...v)];
    if (n.x === m.x) {
      w1.ends[0] = v.find(v => v.y === n.y);
      w1.ends[1] = v.find(v => v.y === m.y);
    } else {
      w1.ends[0] = v.find(v => v.x === n.x);
      w1.ends[1] = v.find(v => v.x === m.x);
    }
    this.remove(w2);
  }

  remove(wire) {
    var index = this.indexOf(wire);
    if (index > -1) this.splice(index,1);
  }

  clear() {
    this.splice(0,this.length);
  }
}

class Wire {
  static all = [];

  constructor(p1,p2) {
    this.ends = [p1,p2];
  }

  isJoint() {return this.ends[0].eq(this.ends[1])}

  contains(point) {
    var n = Vector.min(...this.ends),
        m = Vector.max(...this.ends);
    return n[0] <= point[0]
        && n[1] <= point[1]
        && point[0] <= m[0]
        && point[1] <= m[1]
        && Math.abs(this.ends[1].sub(this.ends[0]).cross(this.ends[1].sub(point))) < 1e-10;
  }

  overlaps(wire) {
    if (this === wire) return false;
    var BA = this.ends[1].sub(this.ends[0]),
        BC = this.ends[1].sub(wire.ends[0]),
        BD = this.ends[1].sub(wire.ends[1]);
    return Math.abs(BA.cross(BC)) + Math.abs(BA.cross(BD)) < 1e-10
    && (Vector.min(...this.ends).lteq(Vector.max(...wire.ends))
    &&  Vector.min(...wire.ends).lteq(Vector.max(...this.ends))); 
  }
}



class ConnectionGroup {
  static all = [];
  constructor() {
    this.wires = [];
    this.pins = [];
    this.state = 0;
    this.isDriven = false;
    ConnectionGroup.all.push(this);
    this.skip = false;
  }

  static clearAll() {
    this.all = [];
  }

  static combine(g1, g2) {
    if (g1 === g2) return g1;
    g1.wires = g1.wires.concat(g2.wires);
    g1.pins = g1.pins.concat(g2.pins);
    g2.pins.forEach(pin => pin.connectionGroup = g1);
    g2.remove();
    return g1;
  }

  static init() {
    this.all.forEach(g => {
      g.state = null;
      g.wires.forEach(wire => wire.state = null);
      g.pins.forEach(pin => pin.state = null);
      g.drivers = g.pins.filter(pin => pin.type === 'output');
      g.switchMap = g.pins
        .filter(pin => ['Switch','NMOS','PMOS'].includes(pin.component.type))
        .filter(pin => !(['NMOS','PMOS'].includes(pin.component.type) && pin === pin.component.pins[0]))
        .map(pin => {
        var o = {};
        o.switch = pin.component;
        o.pin = pin;
        return o;
      });
    });
  }

  static initStep() {
    this.all.forEach(g => g.skip = false);
  }

  static batch = new SetArray;

  remove() {
    var index = ConnectionGroup.all.indexOf(this);
    if (index > -1) ConnectionGroup.all.splice(index,1);
  }

  removePin(pin) {
    var index = this.pins.indexOf(pin);
    if (index > -1) this.pins.splice(index,1);
    if (pin.connectionGroup === this) pin.connectionGroup = null;
  }

  update(from) {
    if (this.skip) return;
    var wires = [];
    var pins = [];
    var groups = [this];
    function bridgeGaps(group) {
      group.switchMap.forEach(s => {
        var pinb = s.switch.getOtherPin(s.pin);
        if (!pinb) return;
        if (groups.includes(pinb.connectionGroup)) return;
        groups.push(pinb.connectionGroup);
        bridgeGaps(pinb.connectionGroup);
      });
    }
    bridgeGaps(this);

    groups.forEach(group => {
      wires.push(...group.wires);
      pins.push(...group.pins);      
    });
    var active = pins.filter(pin => pin.driving);

    var state;
    this.isDriven = active.length > 0;
    if (this.isDriven) {
      state = active[0].state;
    } else {
      var pullUp = pins.find(pin => pin.component.type === 'PullUp');
      if (pullUp) state = pullUp.component.mask.bits;
      var pullDown = pins.find(pin => pin.component.type === 'PullDown');
      if (pullDown) state = 0;

      var resistor = pins.find(pin => pin.component.type === 'Resistor');
      if (resistor) {
        var pull = resistor.component.pins.find(pin => pin !== resistor).connectionGroup.state;
        if (pull) {
          state = (1<<resistor.component.bits)-1;
        } else {
          state = pull;
        }
      }
      if (!pullUp && !pullDown && !resistor) state = null;
    }

    this.state = state;

    wires.forEach(wire => wire.state = state);
    pins.filter(pin => ['input','dual'].includes(pin.type)).forEach(pin => {
      if (pin.state !== state && !pin.driving) {
        pin.state = state;
        if (['Splitter','Merger','Input','Output'].includes(pin.component.type)) {
          pin.component.update(false);
        } else if (pin !== from) {
          nextBatch.add(pin.component);
        }
      }
    });
  }
}



function createConnectionGroups(wires=circuit.wires, components=circuit.components) {
  var done = [];
  var groups = [];
  function findConnections(wire,group) {
    wires.forEach(wire2 => {
      if (done.includes(wire2)) return;
      if (wire === wire2) return;
      if (
        wire.contains(wire2.ends[0]) ||
        wire.contains(wire2.ends[1]) ||
        wire2.contains(wire.ends[0]) ||
        wire2.contains(wire.ends[1])
      ) {
        group.wires.push(wire2);
        done.push(wire2);
        findConnections(wire2,group);
      }
    });
  }
  wires.forEach(wire => {
    if (done.includes(wire)) return;
    done.push(wire);
    var group = new ConnectionGroup();
    group.wires.push(wire);
    groups.push(group);
    findConnections(wire,group);
  });

  done = [];
  groups.forEach(group => {
    var ends = group.wires.flatMap(wire => wire.ends);
    ends.forEach(end => {
      components.forEach(component => {
        component.pins.forEach(pin => {
          if (done.includes(pin)) return;
          if (component.position.add(pin).eq(end)) {
            group.pins.push(pin);
            pin.connectionGroup = group;
            done.push(pin);
          }
        });
      });
    });
  });

  done = [];
  var pins = components.flatMap(
    component => component.pins.filter(
      pin => !pin.connectionGroup
    )
  );

  pins.forEach(pin => {
    if (done.includes(pin)) return;
    done.push(pin);
    var group = new ConnectionGroup();
    group.pins.push(pin);
    pin.connectionGroup = group;
    var pos = pin.component.position.add(pin);
    pins.forEach(pin2 => {
      if (done.includes(pin2)) return;
      var pos2 = pin2.component.position.add(pin2);
      if (pos.eq(pos2)) {
        done.push(pin2);
        group.pins.push(pin2);
        pin2.connectionGroup = group;
      }
    });
  });

  var tnls = components.filter(c => c.type === 'Tunnel');
  var nets = [...new Set(tnls.map(c => c.label))];

  nets.forEach(net => {
    var t = tnls.filter(c => c.label === net);
    var group = new ConnectionGroup();
    t.forEach(t => {
      var pin = t.pins[0];
      ConnectionGroup.combine(group,pin.connectionGroup);
      group.removePin(pin);
    });
  });

}