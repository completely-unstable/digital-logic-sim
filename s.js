
var running = false;
var singleStep = false;
var nextBatch = new SetArray;
var currentBatch;
var oscillation = false;
var resets = [];
var clocks = [];
var diodes = [];
var tick = 0;
var phase = 0;


function run(stepThrough=false) {
  save('current');
  nextBatch.clear();
  updateQueue = [];
  currentBatch = new Set(nextBatch);
  resets = circuit.components.filter(gate => gate.type === 'Reset');
  clocks = circuit.components.filter(c => c.type === 'Clock');
  diodes = circuit.components.filter(c => c.type === 'Diode');
  if (circuit.settings.script !== null) {
    var context = {addComponent, addWire};
    var fn = new Function([...Object.keys(context),...circuit.settings.parameters], circuit.settings.script);
    fn.apply(circuit.settings, [...Object.values(context),...circuit.settings.parameters.map(p => circuit.settings[p])]);
  }
  var ics = circuit.components.filter(c => ['IC','Script'].includes(c.type));
  ics.forEach(ic => ic.init());
  createConnectionGroups();
  ics.forEach(ic => ic.createGroups());
  ics.forEach(ic => ic.link());
  ConnectionGroup.init();
  circuit.components.filter(gate => ['Input','Clock','Button'].includes(gate.type)).forEach(inp => inp.state = 0);
  circuit.components.filter(gate => ['Joystick','RotaryEncoder'].includes(gate.type)).forEach(inp => inp.resetThumb());
  circuit.components.filter(gate => ['Supply','Ground','Constant','Reset','PullUp','PullDown','Input','Clock','Button','Joystick','RotaryEncoder'].includes(gate.type)).forEach(g => nextBatch.add(g));
  diodes.forEach(diode => {
    var {anode,cathode} = diode;
    var bgroup = anode.connectionGroup.pins.some(pin => 
      pin !== anode && pin.component.type === 'Diode' && pin.component.anode === pin
    );
    var fgroup = cathode.connectionGroup.pins.some(pin => 
      pin !== cathode && pin.component.type === 'Diode' && pin.component.cathode === pin
    );
    if (bgroup && !fgroup) return diode.update = diode.backwardUpdate;
    if (!bgroup && fgroup) return diode.update = diode.forwardUpdate;
    if (bgroup && anode.connectionGroup.pins.some(pin => 
      pin.component.type === 'PullUp'
    )) return diode.update = diode.backwardUpdate;
    if (fgroup && cathode.connectionGroup.pins.some(pin => 
      pin.component.type === 'PullDown'
    )) return diode.update = diode.forwardUpdate;
    anode.type = 'input';
    cathode.type = 'output';
  });
  if (!singleStep) {
    stabilize();
    nextBatch.clear();
    resets.forEach(g => nextBatch.add(g));
    stabilize();
  } else {
    phase = 0;
  }
  running = true;
  oscillation = false;
  singleStep = stepThrough;
  if (stepThrough) return;

  tick = 0;
  var frequency = circuit.settings.frequency;
  var state = 1;
  var halfCycle = 500/frequency;
  var lt = 0;
  var dt;
  var acc = 0;

  function exloop(t) {
    if (!lt) lt = t;
  
    dt = t - lt;
    acc += dt;
  
  
    while (acc >= halfCycle) {
      state = 1-state;
      clocks.forEach(clock => {
        clock.state = state;
        nextBatch.push(clock);
      });
      stabilize();
      if (oscillation) break;
      acc -= halfCycle;
    }
    rerender = true;

    lt = t;
    if (running) {
      if (oscillation) {
        frequency = min(frequency, 5);
        requestAnimationFrame(unstableLoop);
      } else {
        requestAnimationFrame(exloop);
      }
    }
  }

  function unstableLoop(t) {
    if (!lt) lt = t;
    
    dt = t - lt;
    acc += dt;
    
    
    while (acc >= halfCycle) {
      state = 1-state;
      clocks.forEach(clock => {
        clock.state = state;
        clock.update();
      });
      step();
      acc -= halfCycle;
    }
    rerender = true;
  
    lt = t;

    if (running) requestAnimationFrame(unstableLoop);
  }

  requestAnimationFrame(exloop);
}




//old
/*
function exloop() {
  stabilize();
  if (running) requestAnimationFrame(exloop);
}
*/

function stop() {
  load('current');
}

var updateQueue;

function step() {
  ConnectionGroup.initStep();
  currentBatch = new Set(nextBatch);
  nextBatch.clear();
  updateQueue = [];
  currentBatch.forEach(c => c.update());
  updateQueue.forEach(q => q[0].update(q[1],q[2]));
  tick++;
  if (singleStep && phase === 0 && !nextBatch.length) {      
    resets.forEach(g => nextBatch.add(g));
    phase = 1;
  }
}

function stabilize() {
  var o = 0;
  while (nextBatch.length > 0) {
    o++;
    if (o > 1000) {
      break;
    }
    step();
  }
  rerender = true;
  if (o > 1000) {
//    stop();
    console.log('oscillation detected, running step-by-step...');
    oscillation = true;
  }
  return;
  var ss = ConnectionGroup.all.find(group => group.checkShortCircuit());
  if (ss) {
    stop();
    throw Error('short circuit detected');
  }
}