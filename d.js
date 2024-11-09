function drawPins(ctx,x,y,pins,inv=[],r=0,sx=toScreenX,sy=toScreenY,s=scale) {
    var inps = pins.filter(pin => ['input','dual'].includes(pin.type)),
        outs = pins.filter(pin => pin.type === 'output');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = s/5;
    inps.forEach((inp,i) => {
      if (!inp.bubble || !inp.inverted) return;
      if (r === 0) drawInversionBubbleOut(ctx,x+inp.x,y+inp.y);
      if (r === 1) drawInversionBubbleInY(ctx,x+inp.x,y+inp.y);
      if (r === 2) drawInversionBubbleIn(ctx,x+inp.x,y+inp.y);
      if (r === 3) drawInversionBubbleOutY(ctx,x+inp.x,y+inp.y);
    });
    outs.forEach((out,i) => {
      if (!out.bubble || !out.inverted) return;
      if (r === 0) drawInversionBubbleIn(ctx,x+out.x,y+out.y);
      if (r === 1) drawInversionBubbleOutY(ctx,x+out.x,y+out.y);
      if (r === 2) drawInversionBubbleOut(ctx,x+out.x,y+out.y);
      if (r === 3) drawInversionBubbleInY(ctx,x+out.x,y+out.y);
    });
    ctx.strokeStyle = '#6600ff';
    ctx.lineWidth = .3*s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    inps.forEach(pin => {
      var x0 = sx(x + pin.x),
          y0 = sy(y + pin.y);
      ctx.moveTo(x0,y0);
      ctx.lineTo(x0,y0);
    });
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = '#00ccff';
    ctx.beginPath();
    outs.forEach(pin => {
      var x0 = sx(x + pin.x),
          y0 = sy(y + pin.y);
      ctx.moveTo(x0,y0);
      ctx.lineTo(x0,y0);
    });
    ctx.stroke();
    ctx.closePath();
}

function drawPinLabels(ctx,x,y,pins,inv,sx=toScreenX,sy=toScreenY,s=scale) {
    var left = pins.filter(pin => pin.orientation === 'left'),
        right = pins.filter(pin => pin.orientation === 'right'),
        top = pins.filter(pin => pin.orientation === 'top'),
        bottom = pins.filter(pin => pin.orientation === 'bottom');


    ctx.fillStyle = 'white';
    ctx.font = (s * 0.75) + 'px monospace';

    ctx.textAlign = 'left';
    left.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (pin.inverted) px++;
      if (!pin.label) return;
      if (pin.label === 'CLK') {
        drawClockLabelLeft(ctx,x+px,y+py,sx,sy,s);
      } else {
        var x0 = sx(x + px + .25);
        var y0 = sy(y + py);
        var tm = ctx.measureText(pin.label);
        var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
        ctx.fillText(pin.label,x0,y0+th/2);
      }
    });

    ctx.textAlign = 'right';
    right.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (pin.inverted) px--;
      if (!pin.label) return;
      if (pin.label === 'CLK') {
        drawClockLabelRight(ctx,x+px,y+py,sx,sy,s);
      } else {
        var x0 = sx(x + px - .25);
        var y0 = sy(y + py);
        var tm = ctx.measureText(pin.label);
        var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
        ctx.fillText(pin.label,x0,y0+th/2);
      }
    });

    ctx.textAlign = 'center';
    top.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (pin.inverted) py++;
      if (!pin.label) return;
      if (pin.label === 'CLK') {
        drawClockLabelTop(ctx,x+px,y+py,sx,sy,s);
      } else {
        var x0 = sx(x + px);
        var y0 = sy(y + py + .25);
        var tm = ctx.measureText(pin.label);
        var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
        ctx.fillText(pin.label,x0,y0+th);
      }
    });

    bottom.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (pin.inverted) py--;
      if (!pin.label) return;
      if (pin.label === 'CLK') {
        drawClockLabelBottom(ctx,x+px,y+py,sx,sy,s);
      } else {
        var x0 = sx(x + px);
        var y0 = sy(y + py - .25);
        ctx.fillText(pin.label,x0,y0);
      }
    });
}

function drawDILPinLabels(ctx,x,y,pins,sx=toScreenX,sy=toScreenY,s=scale) {
    var inps = pins.filter(pin => pin.type === 'input'),
        outs = pins.filter(pin => pin.type === 'output');

    ctx.fillStyle = 'white';
    ctx.font = (s * 0.75) + 'px monospace';

    ctx.textAlign = 'end';
    inps.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (!pin.label) return;
      var x0 = sx(x + px - .5);
      var y0 = sy(y + py);
      var tm = ctx.measureText(pin.label);
      var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
      ctx.fillText(pin.label,x0,y0+th/2);
    });

    ctx.textAlign = 'start';
    outs.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (!pin.label) return;
      var x0 = sx(x + px + .5);
      var y0 = sy(y + py);
      var tm = ctx.measureText(pin.label);
      var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
      ctx.fillText(pin.label,x0,y0+th/2);
    });

}

function drawDILPinLabels2(ctx,x,y,pins,sx=toScreenX,sy=toScreenY,s=scale) {
    var [inps,outs] = chunk(pins,pins.length/2);

    ctx.fillStyle = 'white';
    ctx.font = (s * 0.75) + 'px monospace';

    ctx.textAlign = 'end';
    inps.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (!pin.label) return;
      var x0 = sx(x + px - .5);
      var y0 = sy(y + py);
      var tm = ctx.measureText(pin.label);
      var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
      ctx.fillText(pin.label,x0,y0+th/2);
    });

    ctx.textAlign = 'start';
    outs.forEach((pin, i) => {
      var px = pin?.origin?.x ?? pin.x,
          py = pin?.origin?.y ?? pin.y;
      if (!pin.label) return;
      var x0 = sx(x + px + .5);
      var y0 = sy(y + py);
      var tm = ctx.measureText(pin.label);
      var th = tm.actualBoundingBoxAscent - tm.actualBoundingBoxDescent;
      ctx.fillText(pin.label,x0,y0+th/2);
    });

}

function drawClockLabelLeft(ctx,x,y,sx,sy,s) {
  var x1 = sx(x + 0.1);
  var x2 = sx(x + 0.5);
  var y1 = sy(y - 1/3);
  var y2 = sy(y + 0.0);
  var y3 = sy(y + 1/3);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = .15 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x1, y3);
  ctx.stroke();
  ctx.closePath();
}
function drawClockLabelRight(ctx,x,y,sx,sy,s) {
  var x1 = sx(x - 0.1);
  var x2 = sx(x - 0.5);
  var y1 = sy(y - 1/3);
  var y2 = sy(y + 0.0);
  var y3 = sy(y + 1/3);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = .15 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x1, y3);
  ctx.stroke();
  ctx.closePath();
}
function drawClockLabelTop(ctx,x,y,sx,sy,s) {
  var y1 = sy(y + 0.1);
  var y2 = sy(y + 0.5);
  var x1 = sx(x - 1/3);
  var x2 = sx(x + 0.0);
  var x3 = sx(x + 1/3);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = .15 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y1);
  ctx.stroke();
  ctx.closePath();
}
function drawClockLabelBottom(ctx,x,y,sx,sy,s) {
  var y1 = sy(y - 0.1);
  var y2 = sy(y - 0.5);
  var x1 = sx(x - 1/3);
  var x2 = sx(x + 0.0);
  var x3 = sx(x + 1/3);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = .15 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y1);
  ctx.stroke();
  ctx.closePath();
}

function drawSwitchOpen(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 1.95),
      x2 = sx(x + 1.00),
      x3 = sx(x + 0.45),
      x4 = sx(x + 1.55),
      y0 = sy(y + 0.00),
      y1 = sy(y - 0.50),
      y2 = sy(y - 0.30),
      y3 = sy(y - 1.25);
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/15;
  ctx.setLineDash([s/5,s/5]);
  ctx.beginPath();
  ctx.moveTo(x2,y3);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x3,y3);
  ctx.lineTo(x4,y3);
  ctx.stroke();
  ctx.closePath();
}

function drawSwitchClosed(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 2.00),
      x2 = sx(x + 1.00),
      x3 = sx(x + 0.45),
      x4 = sx(x + 1.55),
      y0 = sy(y + 0.00),
      y1 = sy(y - 1.00);
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/15;
  ctx.setLineDash([s/5,s/5]);
  ctx.beginPath();
  ctx.moveTo(x2,y1);
  ctx.lineTo(x2,y0);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x3,y1);
  ctx.lineTo(x4,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawDTSwitchDown(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 1.95),
      x2 = sx(x + 1.00),
      x3 = sx(x + 0.45),
      x4 = sx(x + 1.55),
      x5 = sx(x + 2.00),
      y0 = sy(y + 0.00),
      y1 = sy(y + 0.50),
      y2 = sy(y + 0.30),
      y3 = sy(y - 0.80),
      y4 = sy(y + 1.00);
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x1,y4);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/15;
  ctx.setLineDash([s/5,s/5]);
  ctx.beginPath();
  ctx.moveTo(x2,y3);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x3,y3);
  ctx.lineTo(x4,y3);
  ctx.stroke();
  ctx.closePath();
}

function drawDTSwitchUp(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 2.00),
      x2 = sx(x + 1.00),
      x3 = sx(x + 0.45),
      x4 = sx(x + 1.55),
      x5 = sx(x + 1.95),
      y0 = sy(y + 0.00),
      y1 = sy(y - 1.00),
      y2 = sy(y + 0.50),
      y3 = sy(y + 1.00);
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.moveTo(x5,y2);
  ctx.lineTo(x5,y3);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/15;
  ctx.setLineDash([s/5,s/5]);
  ctx.beginPath();
  ctx.moveTo(x2,y1);
  ctx.lineTo(x2,y0);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x3,y1);
  ctx.lineTo(x4,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawLabel(ctx,x,y,l,r,dx,dy,sx=toScreenX,sy=toScreenY,s=scale) {
  var xx = dx, yy = dy;
  if (r&3 === 1) {
    xx = -dy; yy = dx;
  } else if (r&3 === 2) {
    xx = -dx; yy = -dy;
  } else if (r&3 === 3) {
    xx = dy; yy = -dx;
  }
  ctx.fillText(l,sx(x+xx),sy(y+yy));
}

function drawICBox(ctx,x,y,w,h,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + w - 0.05),
      y0 = sy(y - 0.50),
      y1 = sy(y + h + 0.50);
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.rect(x0,y0,x1-x0,y1-y0);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawDILChip(ctx,x,y,w,h,name,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.5),
      x1 = sx(x + w - .5),
      x2 = sx(x + (w - .5)/2),
      x3 = sx(x + w/2),
      x4 = sx(x + .05),
      x5 = sx(x + 1),
      y0 = sy(y - 0.75),
      y1 = sy(y + h + 0.75),
      y2 = sy(y-.25);
  ctx.fillStyle = 'black';
  ctx.lineJoin = 'miter';
  ctx.textBaseline = 'alphabetic';
  for(var i = 0; i <= h; i++) {
    ctx.fillRect(x4,sy(y+i-.25),(w-.1)*s,.5*s);
    ctx.strokeRect(x4,sy(y+i-.25),(w-.1)*s,.5*s);
  }
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x2,y0);
  ctx.arc(x3,y0,.25*s,pi,0,true);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = s/3.5;
  ctx.beginPath();
  ctx.moveTo(x5,y2);
  ctx.lineTo(x5,y2);
  ctx.stroke();
  ctx.closePath();

  var textX = (x0 + x1) / 2;
  var textY = (y0 + y1) / 2;

  ctx.fillStyle = 'white';
  ctx.save();
  ctx.translate(textX, textY);
  ctx.rotate(-Math.PI / 2);
  ctx.font = s + 'px monospace';
  ctx.textAlign = 'center';

  var metrics = ctx.measureText(name);
  var textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  ctx.fillText(name, 0, textHeight / 2);

  ctx.restore();
}

function drawInputBG(ctx,x,y,w=1.5,h=1.5,fill=false,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.55),
      y0 = sy(y - 0.75),
      w0 = w*s,
      h0 = h*s;
  if (fill) ctx.fillStyle = fill;
  ctx.lineWidth = s/5;
  ctx.beginPath();
  ctx.rect(x0-(w-1.5)*s,y0-(h-1.5)*s/2,w0,h0);
  if (fill) ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawOutputBG(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 1.55),
      x1 = sx(x + 0.80),
      y0 = sy(y + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,.75*s,0,tau);
  ctx.closePath();
  ctx.stroke();
}

function drawLED(ctx,x,y,color='red',size=1.6,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + size/2),
      y0 = sy(y + 0.00);
  ctx.lineWidth = .1*s;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,size*s/2,-pi,pi);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSquareLED(ctx,x,y,color='red',size=1.6,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      y0 = sy(y - size/2);
  ctx.lineWidth = .1*s;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(x0,y0,size*s,size*s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawButton(ctx,x,y,w,h,sx=toScreenX,sy=toScreenY,s=scale) {
  var ox = (w-1.5),
      oy = (h-1.5)/2,
      x0 = sx(x - 0.05),
      x1 = sx(x - 1.55 - ox),
      x2 = sx(x - 0.40),
      x3 = sx(x - 1.90 - ox),
      y0 = sy(y - 0.75 - oy),
      y1 = sy(y + 0.75 + oy),
      y2 = sy(y - 1.10 - oy),
      y3 = sy(y + 0.40 + oy);
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x0,y0);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x3,y3);
  ctx.moveTo(x0,y1);
  ctx.lineTo(x2,y3);
  ctx.stroke();
  ctx.closePath();
  drawInputBG(ctx,x-.35,y-.35,w,h,false,sx,sy,s);
}

function drawButtonPad(ctx,x,y,rows=5,cols=5,bw=1.5,bh=1.5,rg=1,cg=1,btns,sx=toScreenX,sy=toScreenY,s=scale) {
  if (!Array.isArray(bw)) bw = Array(cols).fill(bw);
  if (!Array.isArray(bh)) bh = Array(rows).fill(bh);
  if (!Array.isArray(cg)) cg = Array(cols+1).fill(cg);
  if (!Array.isArray(rg)) rg = Array(rows+1).fill(rg);
  cg = cg.toReversed();
  var w = bw.map(bw => bw + .5).concat(cg).reduce((a,v) => a+v),
      h =  bh.map(bh => bh + .5).concat(rg).reduce((a,v) => a+v),
      x0 = sx(x - w - .25),
      y0 = sy(y - h + .25),
      rw = s*(w + .2),
      rh = s*(h + .2);
  ctx.strokeRect(x0,y0,rw,rh);
  var bx, by;
  by = y + .3 - rg[0]- bh[0]/2;
  for (var yy = 0; yy < rows; yy++) {
    bx = x - .2 - cg[0];
    for (var xx = 0; xx < cols; xx++) {
      drawButton(ctx,bx,by,bw[xx],bh[yy],sx,sy,s);
      bx -= bw[xx] + .5 + cg[xx+1];
    }
    by -= bh[yy] + .5 + rg[yy+1];
  }
}

function drawIODot(ctx,x,y,w=1.5,h=1.5,fill=false,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.25),
      x1 = sx(x - 0.80),
      y0 = sy(y + 0.00),
      r0 = Math.min(w,h)*s/2 - .3*s;
  if (fill) {
    ctx.strokeStyle = fill;
    ctx.fillStyle = fill;
  } else {
    ctx.strokeStyle = 'white';
  }
  ctx.beginPath();
  ctx.moveTo(x0-(min(w,h)+(w-h)*(w>h)/2-1.5)*scale, y0);
  ctx.arc(x1-(w-1.5)*s/2, y0, r0, -pi, pi);
  if (fill) ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawClockSymbol(ctx,x,y,stroke='white',sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.25),
      x1 = sx(x - 1.05),
      x2 = sx(x - 0.80),
      x3 = sx(x - 0.55),
      x4 = sx(x - 0.35),
      y0 = sy(y + 0.25),
      y1 = sy(y - 0.25);
  ctx.lineWidth = .1*s;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y1);
  ctx.lineTo(x2, y0);
  ctx.lineTo(x3, y0);
  ctx.lineTo(x3, y1);
  ctx.lineTo(x4, y1);
  ctx.stroke();
  ctx.closePath();
}

function drawSmallInputBG(ctx,x,y,fill=false,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.05),
      y0 = sy(y - 0.50),
      s = s;
  if (fill) ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.rect(x0,y0,s,s);
  ctx.closePath();
  if (fill) ctx.fill();
  ctx.stroke();
}

function drawSmallOutputBG(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 1.05),
      x1 = sx(x + 0.55),
      y0 = sy(y + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,s/2,0,tau);
  ctx.closePath();
  ctx.stroke();
}

function drawSmallIODot(ctx,x,y,fill=false,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.775),
      x1 = sx(x - 0.55),
      y0 = sy(y + 0.00);
  if (fill) {
    ctx.strokeStyle = fill;
    ctx.fillStyle = fill;
  } else {
    ctx.strokeStyle = 'white';
  }
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.arc(x1, y0, .45*s/2, -pi, pi);
  if (fill) ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawInversionBubbleOut(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.50),
      y0 = sy(y + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,.45*s,-pi,pi);
  ctx.stroke();
  ctx.closePath();
}

function drawInversionBubbleIn(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.05),
      x1 = sx(x - 0.50),
      y0 = sy(y + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,.45*s,0,tau);
  ctx.stroke();
  ctx.closePath();
}

function drawInversionBubbleOutY(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var y0 = sy(y + 0.05),
      y1 = sy(y + 0.50),
      x0 = sx(x + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x0,y1,.45*s,-pi2,pi3);
  ctx.stroke();
  ctx.closePath();
}

function drawInversionBubbleInY(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var y0 = sy(y - 0.05),
      y1 = sy(y - 0.50),
      x0 = sx(x + 0.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x0,y1,.45*s,-pi3,pi2);
  ctx.stroke();
  ctx.closePath();
}

function drawOCSymbol(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.30),
      x1 = sx(x + 0.00),
      x2 = sx(x + 0.30),
      y0 = sy(y - 0.30),
      y1 = sy(y + 0.00),
      y2 = sy(y + 0.30);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x2,y1);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.closePath();
}

function drawOESymbol(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.30),
      x1 = sx(x + 0.00),
      x2 = sx(x - 0.30),
      y0 = sy(y + 0.30),
      y1 = sy(y + 0.00),
      y2 = sy(y - 0.30);
  ctx.lineWidth = s/10;
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x2,y1);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.closePath();
}

function drawComplimentaryOuts(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.039),
      x1 = sx(x + 0.05),
      x2 = sx(x + 0.50),
      y0 = sy(y + 0.00),
      y1 = sy(y + 1.00),
      y2 = sy(y - 1.50),
      y3 = sy(y + 1.50);
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.arc(x2,y1,.45*s,-pi,pi);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/4.5;
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x0,y3);
  ctx.stroke();
  ctx.closePath();
}

function drawBuffer(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      y0 = sy(y - 1.00),
      y1 = sy(y + 0.00),
      y2 = sy(y + 1.00);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawSmallBuffer(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      y0 = sy(y - 0.65),
      y1 = sy(y + 0.00),
      y2 = sy(y + 0.65);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawDriver(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 1.00),
      y0 = sy(y - 1.00),
      y1 = sy(y - 0.40);
  drawSmallBuffer(ctx,x,y,sx,sy,s);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawDriverInv(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 1.00),
      y0 = sy(y - 1.00),
      y1 = sy(y - 0.65);
  drawSmallBuffer(ctx,x,y,sx,sy,s);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x0,y1,.3*s,-pi2,pi3);
  ctx.stroke();
  ctx.closePath();
}

function drawSmallNot(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.95),
      y0 = sy(y - 0.65),
      y1 = sy(y + 0.00),
      y2 = sy(y + 0.65);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
  drawInversionBubbleOut(ctx,x+1,y,sx,sy,s);
}

function drawAnd(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.45),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.arc(x1,y1,1.5*s,pi3,pi2);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawWideAnd(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 2.45),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.arc(x1,y1,1.5*s,pi3,pi2);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawOr(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.10),
      x1 = sx(x + 0.69),
      x2 = sx(x + 0.79),
      x3 = sx(x + 1.25),
      x4 = sx(x + 1.75),
      x5 = sx(x + 2.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 0.50),
      y2 = sy(y + 1.00),
      y3 = sy(y + 1.50),
      y4 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x2,y0);
  ctx.bezierCurveTo(x3,y0,x4,y0,x5,y2);
  ctx.bezierCurveTo(x4,y4,x3,y4,x2,y4);
  ctx.lineTo(x0,y4);
  ctx.bezierCurveTo(x1,y3,x1,y1,x0,y0);
  ctx.closePath();
  ctx.stroke();
}

function drawWideOr(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.10),
      x1 = sx(x + 0.69),
      x2 = sx(x + 0.79),
      x3 = sx(x + 2.25),
      x4 = sx(x + 2.75),
      x5 = sx(x + 3.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 0.50),
      y2 = sy(y + 1.00),
      y3 = sy(y + 1.50),
      y4 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x2,y0);
  ctx.bezierCurveTo(x3,y0,x4,y0,x5,y2);
  ctx.bezierCurveTo(x4,y4,x3,y4,x2,y4);
  ctx.lineTo(x0,y4);
  ctx.bezierCurveTo(x1,y3,x1,y1,x0,y0);
  ctx.closePath();
  ctx.stroke();
}

function drawXor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.10),
      x1 = sx(x + 0.60),
      x2 = sx(x + 0.69),
      x3 = sx(x + 0.79),
      x4 = sx(x + 1.19),
      x5 = sx(x + 1.25),
      x6 = sx(x + 1.75),
      x7 = sx(x + 2.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 0.50),
      y2 = sy(y + 1.00),
      y3 = sy(y + 1.50),
      y4 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x1, y0);
  ctx.lineTo(x3, y0);
  ctx.bezierCurveTo(x5, y0, x6, y0, x7, y2);
  ctx.bezierCurveTo(x6, y4, x5, y4, x3, y4);
  ctx.lineTo(x1, y4);
  ctx.bezierCurveTo(x4, y3, x4, y1, x1, y0);
  ctx.moveTo(x0, y4);
  ctx.bezierCurveTo(x2, y3, x2, y1, x0, y0);
  ctx.stroke();
  ctx.closePath();
}

function drawWideXor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.10),
      x1 = sx(x + 0.60),
      x2 = sx(x + 0.69),
      x3 = sx(x + 0.79),
      x4 = sx(x + 1.19),
      x5 = sx(x + 2.25),
      x6 = sx(x + 2.75),
      x7 = sx(x + 3.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 0.50),
      y2 = sy(y + 1.00),
      y3 = sy(y + 1.50),
      y4 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x1, y0);
  ctx.lineTo(x3, y0);
  ctx.bezierCurveTo(x5, y0, x6, y0, x7, y2);
  ctx.bezierCurveTo(x6, y4, x5, y4, x3, y4);
  ctx.lineTo(x1, y4);
  ctx.bezierCurveTo(x4, y3, x4, y1, x1, y0);
  ctx.moveTo(x0, y4);
  ctx.bezierCurveTo(x2, y3, x2, y1, x0, y0);
  ctx.stroke();
  ctx.closePath();
}

function drawXand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.60),
      x2 = sx(x + 1.45),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y2);
  ctx.moveTo(x1,y0);
  ctx.lineTo(x2,y0);
  ctx.arc(x2,y1,1.5*s,pi3,pi2);
  ctx.lineTo(x1,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawWideXand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.60),
      x2 = sx(x + 2.45),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y2);
  ctx.moveTo(x1,y0);
  ctx.lineTo(x2,y0);
  ctx.arc(x2,y1,1.5*s,pi3,pi2);
  ctx.lineTo(x1,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawNot(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawBuffer(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+2,y,sx,sy,s);
}

function drawNand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawAnd(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}

function drawNor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawOr(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}

function drawXnor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawXor(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}

function drawXnand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawXand(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}

function drawWideNand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawWideAnd(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+4,y+1,sx,sy,s);
}

function drawWideNor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawWideOr(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+4,y+1,sx,sy,s);
}

function drawWideXnor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawWideXor(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+4,y+1,sx,sy,s);
}

function drawWideXnand(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawWideXand(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+4,y+1,sx,sy,s);
}

function drawMajority(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      x2 = sx(x + 2.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x2,y1);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawMinority(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawMajority(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}

function drawXmajority(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.60),
      x2 = sx(x + 1.95),
      x3 = sx(x + 2.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 1.00),
      y2 = sy(y + 2.50);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y2);
  ctx.moveTo(x1,y0);
  ctx.lineTo(x2,y0);
  ctx.lineTo(x3,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x1,y2);
  ctx.closePath();
  ctx.stroke();
}



function drawXminority(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawXmajority(ctx,x,y,sx,sy,s);
  drawInversionBubbleOut(ctx,x+3,y+1,sx,sy,s);
}


function drawTransmissionGate(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      x2 = sx(x + 1.00),
      y0 = sy(y - 1.00),
      y1 = sy(y + 0.00),
      y2 = sy(y + 1.00),
      y3 = sy(y + 0.775),
      y4 = sy(y - 0.6);
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1,y0);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x1,y2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.arc(x2,y3,.225*s,-pi3,pi3);
  ctx.moveTo(x2,y0);
  ctx.lineTo(x2,y4);
  ctx.stroke();
  ctx.closePath();
}

function generateDrawOC(drawGate,ox,oy=0) {
  return function(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
    drawGate(ctx,x,y,sx,sy,s);
    drawOCSymbol(ctx,x+ox,y+oy,sx,sy,s);
  }
}
function generateDrawOE(drawGate,ox,oy=0) {
  return function(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
    drawGate(ctx,x,y,sx,sy,s);
    drawOESymbol(ctx,x+ox,y+oy,sx,sy,s);
  }
}

var drawNotOC = generateDrawOC(drawNot, 0.6);
var drawSmallNotOC = generateDrawOC(drawSmallNot, 0.5);
var drawBufferOC = generateDrawOC(drawBuffer, 0.6);
var drawSmallBufferOC = generateDrawOC(drawSmallBuffer, 0.5);
var drawDriverOC = generateDrawOC(drawDriver, 0.5);
var drawDriverInvOC = generateDrawOC(drawDriverInv, 0.5);
var drawAndOC = generateDrawOC(drawAnd, 1.5, 1.0);
var drawOrOC = generateDrawOC(drawOr, 1.5, 1.0);
var drawXorOC = generateDrawOC(drawXor, 1.75, 1.0);
var drawXandOC = generateDrawOC(drawXand, 1.65, 1.0);
var drawMajorityOC = generateDrawOC(drawMajority, 1.5, 1.0);
var drawXmajorityOC = generateDrawOC(drawXmajority, 1.65, 1.0);
var drawNandOC = generateDrawOC(drawNand, 1.5, 1.0);
var drawNorOC = generateDrawOC(drawNor, 1.5, 1.0);
var drawXnorOC = generateDrawOC(drawXnor, 1.75, 1.0);
var drawXnandOC = generateDrawOC(drawXnand, 1.65, 1.0);
var drawMinorityOC = generateDrawOC(drawMinority, 1.5, 1.0);
var drawXminorityOC = generateDrawOC(drawXminority, 1.65, 1.0);

var drawNotOE = generateDrawOE(drawNot, 0.6);
var drawSmallNotOE = generateDrawOE(drawSmallNot, 0.5);
var drawBufferOE = generateDrawOE(drawBuffer, 0.6);
var drawSmallBufferOE = generateDrawOE(drawSmallBuffer, 0.5);
var drawDriverOE = generateDrawOE(drawDriver, 0.5);
var drawDriverInvOE = generateDrawOE(drawDriverInv, 0.5);
var drawAndOE = generateDrawOE(drawAnd, 1.5, 1.0);
var drawOrOE = generateDrawOE(drawOr, 1.5, 1.0);
var drawXorOE = generateDrawOE(drawXor, 1.75, 1.0);
var drawXandOE = generateDrawOE(drawXand, 1.65, 1.0);
var drawMajorityOE = generateDrawOE(drawMajority, 1.5, 1.0);
var drawXmajorityOE = generateDrawOE(drawXmajority, 1.65, 1.0);
var drawNandOE = generateDrawOE(drawNand, 1.5, 1.0);
var drawNorOE = generateDrawOE(drawNor, 1.5, 1.0);
var drawXnorOE = generateDrawOE(drawXnor, 1.75, 1.0);
var drawXnandOE = generateDrawOE(drawXnand, 1.65, 1.0);
var drawMinorityOE = generateDrawOE(drawMinority, 1.5, 1.0);
var drawXminorityOE = generateDrawOE(drawXminority, 1.65, 1.0);

var drawWideAndOC = generateDrawOC(drawWideAnd, 2.0, 1.0);
var drawWideOrOC = generateDrawOC(drawWideOr, 2.0, 1.0);
var drawWideXorOC = generateDrawOC(drawWideXor, 2.0, 1.0);
var drawWideXandOC = generateDrawOC(drawWideXand, 2.0, 1.0);
var drawWideNandOC = generateDrawOC(drawWideNand, 2.0, 1.0);
var drawWideNorOC = generateDrawOC(drawWideNor, 2.0, 1.0);
var drawWideXnorOC = generateDrawOC(drawWideXnor, 2.0, 1.0);
var drawWideXnandOC = generateDrawOC(drawWideXnand, 2.0, 1.0);

var drawWideAndOE = generateDrawOE(drawWideAnd, 2.0, 1.0);
var drawWideOrOE = generateDrawOE(drawWideOr, 2.0, 1.0);
var drawWideXorOE = generateDrawOE(drawWideXor, 2.0, 1.0);
var drawWideXandOE = generateDrawOE(drawWideXand, 2.0, 1.0);
var drawWideNandOE = generateDrawOE(drawWideNand, 2.0, 1.0);
var drawWideNorOE = generateDrawOE(drawWideNor, 2.0, 1.0);
var drawWideXnorOE = generateDrawOE(drawWideXnor, 2.0, 1.0);
var drawWideXnandOE = generateDrawOE(drawWideXnand, 2.0, 1.0);

function drawSupply(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.50),
      x1 = sx(x + 0.00),
      x2 = sx(x + 0.50),
      y0 = sy(y - 0.82),
      y1 = sy(y - 0.05);
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x0,y1);
  ctx.lineTo(x2,y1);
  ctx.lineTo(x1,y0);
  ctx.closePath();
  ctx.stroke();
}

function drawGround(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.7),
      x1 = sx(x + 0.7),
      x2 = sx(x - 0.45),
      x3 = sx(x + 0.45),
      x4 = sx(x - 0.2),
      x5 = sx(x + 0.2),
      y0 = sy(y + 0.00),
      y1 = sy(y + 0.10),
      y2 = sy(y + 0.35),
      y3 = sy(y + 0.45),
      y4 = sy(y + 0.70),
      y5 = sy(y + 0.80);
  ctx.lineWidth = s/10;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y1);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x3,y2);
  ctx.lineTo(x3,y3);
  ctx.lineTo(x2,y3);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x4,y4);
  ctx.lineTo(x5,y4);
  ctx.lineTo(x5,y5);
  ctx.lineTo(x4,y5);
  ctx.closePath();
  ctx.stroke();
}

function drawPullResistor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.25),
      x1 = sx(x + 0.00),
      x2 = sx(x + 0.25),
      y0 = sy(y + 0.00),
      y1 = sy(y + 0.50),
      y2 = sy(y + 1.50),
      y3 = sy(y + 2.00);
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x1,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x1,y3);
  ctx.moveTo(x1,y2);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x2,y1);
  ctx.lineTo(x1,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawPullDown(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawPullResistor(ctx,x,y,sx,sy,s);
  drawGround(ctx,x,y+2,sx,sy,s);
}

function drawPullUp(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawPullResistor(ctx,x,y-2,sx,sy,s);
  drawSupply(ctx,x,y-2,sx,sy,s);
}

function drawSplitter(ctx,x,y,i=1,o=4,g=1,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.50),
      x2 = sx(x + 1.00),
      y0 = sy(y + 0.00),
      h0 = (max(i,o)-1)*(g)*s,
      g0 = g*s;
  ctx.beginPath();
  ctx.moveTo(x1,y0);
  ctx.lineTo(x1,y0 + h0);
  for(var yy = 0; yy < i; yy++) {
    ctx.moveTo(x0,y0 + yy*g0);
    ctx.lineTo(x1,y0 + yy*g0);
  }
  for(var yy = 0; yy < o; yy++) {
    ctx.moveTo(x2,y0 + yy*g0);
    ctx.lineTo(x1,y0 + yy*g0);
  }
  ctx.stroke();
  ctx.closePath();
}

function drawMUX(ctx,x,y,h=2,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      y0 = sy(y - 0.25),
      y1 = sy(y + 0.25),
      y2 = sy(y + h - 0.25),
      y3 = sy(y + h + 0.25);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x0,y3);
  ctx.lineTo(x0,y0);
  ctx.stroke();
  ctx.closePath();
}

function drawDEMUX(ctx,x,y,h=2,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 1.95),
      y0 = sy(y - 0.25),
      y1 = sy(y + 0.25),
      y2 = sy(y + h - 0.25),
      y3 = sy(y + h + 0.25);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0,y1);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x1,y3);
  ctx.lineTo(x0,y2);
  ctx.lineTo(x0,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawCell(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.25),
      x2 = sx(x + 0.75),
      x3 = sx(x + 1.00),
      y0 = sy(y - 1.00),
      y1 = sy(y - 0.50),
      y2 = sy(y + 0.00),
      y3 = sy(y + 0.50),
      y4 = sy(y + 1.00);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.moveTo(x1,y0);
  ctx.lineTo(x1,y4);
  ctx.moveTo(x2,y1);
  ctx.lineTo(x2,y3);
  ctx.moveTo(x2,y2);
  ctx.lineTo(x3,y2);
  ctx.stroke();
  ctx.closePath();
}

function drawCapacitor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.25),
      x2 = sx(x + 0.75),
      x3 = sx(x + 1.00),
      y0 = sy(y - 0.75),
      y2 = sy(y + 0.00),
      y4 = sy(y + 0.75);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.moveTo(x1,y0);
  ctx.lineTo(x1,y4);
  ctx.moveTo(x2,y0);
  ctx.lineTo(x2,y4);
  ctx.moveTo(x2,y2);
  ctx.lineTo(x3,y2);
  ctx.stroke();
  ctx.closePath();
}

function drawBattery(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  drawCell(ctx,x-1,y);
  drawCell(ctx,x,y);
}


function drawDiode(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.95),
      y0 = sy(y - 0.50),
      y1 = sy(y + 0.00),
      y2 = sy(y + 0.50);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = s/5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1,y0);
  ctx.lineTo(x1,y2);
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y2);
  ctx.closePath();
  ctx.stroke();
}

function drawResistor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var dv = 1/14,
      x0 = sx(x - 1.00),
      x1 = sx(x - 1.00 + 2*dv),
      x2 = sx(x - 1.00 + 6*dv),
      x3 = sx(x - 1.00 + 10*dv),
      x4 = sx(x + 0.00)
      x5 = sx(x + 1.00 - 10*dv),
      x6 = sx(x + 1.00 - 6*dv),
      x7 = sx(x + 1.00 - 2*dv),
      x8 = sx(x + 1.00),
      y0 = sy(y + 0.50),
      y1 = sy(y + 0.00),
      y2 = sy(y - 0.50);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x0,y1);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3,y0);
  ctx.lineTo(x4,y2);
  ctx.lineTo(x5,y0);
  ctx.lineTo(x6,y2);
  ctx.lineTo(x7,y0);
  ctx.lineTo(x8,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawInductor(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var dv = 1/14,
      x0 = sx(x - 1.00),
      x1 = sx(x - 0.75),
      x2 = sx(x - 0.50),
      x3 = sx(x - 0.25),
      x4 = sx(x + 0.00),
      x5 = sx(x + 0.25),
      x6 = sx(x + 0.50),
      x7 = sx(x + 0.75),
      x8 = sx(x + 1.00),
      y0 = sy(y + 0.00),
      y1 = sy(y - 0.10),
      y2 = sy(y - 0.50);
  ctx.lineWidth = s/5;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y1,s/4,pi,0);
  ctx.lineTo(x2,y0);
  ctx.arc(x3,y1,s/4,pi,0);
  ctx.lineTo(x4,y0);
  ctx.arc(x5,y1,s/4,pi,0);
  ctx.lineTo(x6,y0);
  ctx.arc(x7,y1,s/4,pi,0);
  ctx.lineTo(x8,y0);
  ctx.stroke();
  ctx.closePath();
}

function drawTunnel(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.66),
      y0 = sy(y - 0.33),
      y1 = sy(y + 0.00),
      y2 = sy(y + 0.33);
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0,y1);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x0,y1);
  ctx.stroke();
  ctx.closePath();
}

function drawNMOS(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.33),
      x2 = sx(x + 0.55),
      x3 = sx(x + 1.00),
      y0 = sy(y - 0.95),
      y1 = sy(y - 0.75),
      y2 = sy(y + 0.00),
      y3 = sy(y + 0.75),
      y4 = sy(y + 0.95);
  ctx.lineWidth = s*.15;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.lineTo(x1,y2);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.lineWidth = s*.1;
  ctx.moveTo(x1,y1);
  ctx.lineTo(x1,y3);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.lineWidth = s*.15;
  ctx.moveTo(x3,y4);
  ctx.lineTo(x3,y4);
  ctx.lineTo(x2,y4);
  ctx.lineTo(x2,y0);
  ctx.lineTo(x3,y0);
  ctx.stroke();
  ctx.closePath();
}
function drawPMOS(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.00),
      x1 = sx(x + 0.33),
      x2 = sx(x + 0.55),
      x3 = sx(x + 1.00),
      x4 = sx(x + 0.33/2),
      y0 = sy(y - 0.95),
      y1 = sy(y - 0.75),
      y2 = sy(y + 0.00),
      y3 = sy(y + 0.75),
      y4 = sy(y + 0.95);
  ctx.lineWidth = s*.1;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y2);
  ctx.arc(x4,y2,s/6,-pi,pi);
  ctx.moveTo(x1,y1);
  ctx.lineTo(x1,y3);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.lineWidth = s*.15;
  ctx.moveTo(x3,y4);
  ctx.lineTo(x3,y4);
  ctx.lineTo(x2,y4);
  ctx.lineTo(x2,y0);
  ctx.lineTo(x3,y0);
  ctx.stroke();
  ctx.closePath();
}

function drawNPNBJT(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.33),
      x2 = sx(x + 0.65),
      x3 = sx(x + 1.00),
      x4 = sx(x + 0.48),
      x5 = sx(x + 0.67),
      x6 = sx(x + 0.36),
      y0 = sy(y - 0.95),
      y1 = sy(y - 0.50),
      y2 = sy(y + 0.00),
      y3 = sy(y + 0.50),
      y4 = sy(y + 0.95),
      y5 = sy(y + 0.54),
      y6 = sy(y + 0.79),
      y7 = sy(y + 0.80);
  ctx.lineWidth = s*.15;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y4);
  ctx.moveTo(x3,y4);
  ctx.lineTo(x3,y4);
  ctx.lineTo(x0,y3);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x3,y0);
  ctx.moveTo(x4,y5);
  ctx.lineTo(x5,y6);
  ctx.lineTo(x6,y7);
  ctx.closePath();
  ctx.stroke();
}

function drawPNPBJT(ctx,x,y,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x + 0.05),
      x1 = sx(x + 0.33),
      x2 = sx(x + 0.65),
      x3 = sx(x + 1.00),
      x4 = sx(x + 0.68),
      x5 = sx(x + 0.39),
      x6 = sx(x + 0.59),
      y0 = sy(y - 0.95),
      y1 = sy(y - 0.50),
      y2 = sy(y + 0.00),
      y3 = sy(y + 0.50),
      y4 = sy(y + 0.95),
      y5 = sy(y - 0.64),
      y6 = sy(y - 0.64),
      y7 = sy(y - 0.88);
  ctx.lineWidth = s*.15;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x0,y4);
  ctx.moveTo(x3,y4);
  ctx.lineTo(x3,y4);
  ctx.lineTo(x0,y3);
  ctx.lineTo(x0,y1);
  ctx.lineTo(x3,y0);
  ctx.moveTo(x4,y5);
  ctx.lineTo(x5,y6);
  ctx.lineTo(x6,y7);
  ctx.closePath();
  ctx.stroke();
}

function drawSegmentDisplay(ctx,x,y,color='red',offColor='#333',segs,ag,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 0.50),
      x1 = sx(x + 3.50),
      y0 = sy(y + 0.05),
      y1 = sy(y + 6.95);
  ctx.fillStyle = 'black';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x0,y1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  segs.forEach((sa,si) => {
    ctx.fillStyle = ag[si] ? color : offColor;
    ctx.beginPath();
    var p = sa.shift();
    ctx.moveTo(sx(x + p[0]),sy(y + p[1]));
    sa.forEach(p => ctx.lineTo(sx(x + p[0]),sy(y + p[1])));
    ctx.closePath();
    ctx.fill();
  });
}

function drawSegmentDecimal(ctx,x,y,color,offColor,ag,sx,sy,s) {
  ctx.fillStyle = ag ? color : offColor;
  ctx.beginPath();
  ctx.moveTo(sx(x + 2.84), sy(y + 6.51));
  ctx.arc(sx(x + 3.06), sy(y + 6.51), s*0.22,-pi,pi);
  ctx.fill();
  ctx.closePath();
}

function draw7Seg(ctx,x,y,color='red',offColor='#333',ag=[1,1,1,1,1,1,1,1],sx=toScreenX,sy=toScreenY,s=scale) {
  drawSegmentDisplay(ctx,x,y,color,offColor,[[[0.64,0.88],[0.36,0.58],[0.67,0.28],[2.59,0.28],[2.88,0.57],[2.56,0.88]],[[2.65,0.97],[2.97,0.66],[3.25,0.96],[3.17,3.11],[2.85,3.41],[2.57,3.11]],[[2.73,6.34],[2.45,6.04],[2.53,3.89],[2.85,3.59],[3.13,3.89],[3.05,6.04]],[[0.41,6.73],[0.12,6.43],[0.44,6.12],[2.36,6.12],[2.64,6.42],[2.33,6.73]],[[-0.17,3.89],[0.15,3.59],[0.43,3.89],[0.35,6.04],[0.03,6.34],[-0.25,6.04]],[[-0.05,0.97],[0.27,0.66],[0.55,0.96],[0.47,3.11],[0.15,3.41],[-0.13,3.11]],[[0.52,3.8],[0.24,3.5],[0.55,3.2],[2.48,3.2],[2.76,3.5],[2.45,3.8]]],ag,sx,sy,s);
  drawSegmentDecimal(ctx,x,y,color,offColor,ag[7],sx,sy,s);
}

function drawMNEflags(ctx,x,y,color='red',offColor='#333',ag=[1,1,1],sx=toScreenX,sy=toScreenY,s=scale) {
  drawSegmentDisplay(ctx,x,y,color,offColor,[
    [[0.47,2.94],[0.96,2.94],[1.02,1.48],[1.34,2.94],
     [1.71,2.94],[2.14,1.48],[2.08,2.94],[2.57,2.94],
     [2.67,0.5],[1.97,0.5],[1.57,1.87],[1.27,0.5],
     [0.57,0.5]],
    [[0.29,3.8],[2.69,3.8],[2.71,3.2],[0.31,3.2]],
    [[0.43,4.06],[2.53,4.06],[2.51,4.55],[0.9,4.55],
     [0.88,5.04],[2.37,5.04],[2.35,5.52],[0.86,5.52],
     [0.84,6.01],[2.45,6.01],[2.43,6.5],[0.33,6.5]
    ]
  ],ag,sx,sy,s);
}

function draw16Seg(ctx,x,y,color='red',offColor='#333',ag=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],sx=toScreenX,sy=toScreenY,s=scale) {
  drawSegmentDisplay(ctx,x,y,color,offColor,[
    [[0.33,0.58],[0.61,0.88],[1.25,0.88],[1.56,0.57],[1.27,0.28],[0.64,0.28]],
    [[1.67,0.58],[1.96,0.88],[2.59,0.88],[2.91,0.57],[2.62,0.28],[1.99,0.28]],
    [[2.65,0.93],[2.97,0.63],[3.25,0.93],[3.16,3.14],[2.85,3.44],[2.56,3.14]],
    [[2.73,6.37],[2.45,6.07],[2.54,3.86],[2.85,3.56],[3.14,3.86],[3.05,6.07]],
    [[1.44,6.43],[1.75,6.12],[2.39,6.12],[2.67,6.42],[2.36,6.73],[1.73,6.73]],
    [[0.09,6.43],[0.4,6.12],[1.04,6.12],[1.33,6.42],[1.01,6.73],[0.38,6.73]],
    [[-0.16,3.86],[0.15,3.56],[0.44,3.86],[0.35,6.07],[0.03,6.37],[-0.25,6.07]],
    [[-0.05,0.94],[0.27,0.63],[0.55,0.93],[0.46,3.14],[0.15,3.44],[-0.14,3.14]],
    [[0.21,3.5],[0.52,3.2],[1.16,3.2],[1.44,3.5],[1.13,3.8],[0.5,3.8]],
    [[1.56,3.5],[1.87,3.2],[2.5,3.2],[2.79,3.5],[2.48,3.8],[1.84,3.8]],
    [[0.63,0.96],[0.87,0.96],[1.17,2.26],[1.13,3.12],[0.9,3.12],[0.6,1.82]],
    [[1.62,0.63],[1.9,0.93],[1.82,3.14],[1.5,3.44],[1.22,3.15],[1.3,0.93]],
    [[2.33,0.96],[2.57,0.96],[2.53,1.83],[2.13,3.12],[1.9,3.12],[1.93,2.24]],
    [[1.87,3.88],[2.1,3.88],[2.4,5.18],[2.37,6.04],[2.13,6.04],[1.83,4.74]],
    [[1.5,3.56],[1.79,3.86],[1.7,6.07],[1.38,6.37],[1.1,6.07],[1.19,3.86]],
    [[0.86,3.88],[1.1,3.88],[1.07,4.76],[0.67,6.04],[0.43,6.04],[0.47,5.17]]
  ],ag,sx,sy,s);
  drawSegmentDecimal(ctx,x,y,color,offColor,ag[16],sx,sy,s);
}

function drawJoystick(ctx,x,y,jx=0,jy=0,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.95),
      x1 = sx(x + 0.00),
      x2 = sx(x + 0.50),
      y0 = sy(y - 0.00),
      y1 = sy(y - 1.95),
      jjx = jx,
      jjy = jy;
  if (hypot(jx,jy) > 1.75) {
    var theta = atan2(jy,jx);
    jjx = 1.75*cos(theta);
    jjy = 1.75*sin(theta);
  }
  var x3 = sx(x + jjx - .75),
      x4 = sx(x + jjx),
      y2 = sy(y + jjy);
  ctx.lineWidth = .05*s;
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.arc(x1,y0,1.95*s,-pi,pi);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/5;
  ctx.beginPath();
  ctx.moveTo(x3,y2);
  ctx.arc(x4,y2,.75*s,-pi,pi);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawRotaryEncoder(ctx,x,y,jx=1,jy=0,sx=toScreenX,sy=toScreenY,s=scale) {
  var x0 = sx(x - 1.95),
      x1 = sx(x + 0.00),
      x2 = sx(x + 0.50),
      y0 = sy(y - 0.00),
      y1 = sy(y - 1.95),
      theta = atan2(jy,jx),
      jjx = sx(x + 1*cos(theta)),
      jjy = sy(y + 1*sin(theta)),
      jjx2 = sx(x + 1.5*cos(theta)),
      jjy2 = sy(y + 1.5*sin(theta));
  var x3 = sx(x + jjx - .75),
      x4 = sx(x + jjx),
      y2 = sy(y + jjy);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.rect(x0,y1,3.9*s,3.9*s);
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = s/5;
  ctx.beginPath();
  ctx.moveTo(jjx,jjy);
  ctx.arc(x1,y0,1.5*s,theta,theta+tau);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

drawTemplate = {
  Buffer(ctx,sx,sy,s) {
    drawSmallBuffer(ctx,0,0,sx,sy,s);
  },
  Not(ctx,sx,sy,s) {
    drawSmallNot(ctx,0,0,sx,sy,s);
  },
  And(ctx,sx,sy,s) {
    drawAnd(ctx,0,0,sx,sy,s);
  },
  Or(ctx,sx,sy,s) {
    drawOr(ctx,0,0,sx,sy,s);
  },
  Xor(ctx,sx,sy,s) {
    drawXor(ctx,0,0,sx,sy,s);
  },
  Xand(ctx,sx,sy,s) {
    drawXand(ctx,0,0,sx,sy,s);
  },
  Nand(ctx,sx,sy,s) {
    drawNand(ctx,0,0,sx,sy,s);
  },
  Nor(ctx,sx,sy,s) {
    drawNor(ctx,0,0,sx,sy,s);
  },
  Xnor(ctx,sx,sy,s) {
    drawXnor(ctx,0,0,sx,sy,s);
  },
  Xnand(ctx,sx,sy,s) {
    drawXnand(ctx,0,0,sx,sy,s);
  },
  Majority(ctx,sx,sy,s) {
    drawMajority(ctx,0,0,sx,sy,s);
  },
  Minority(ctx,sx,sy,s) {
    drawMinority(ctx,0,0,sx,sy,s);
  },
  Xmajority(ctx,sx,sy,s) {
    drawXmajority(ctx,0,0,sx,sy,s);
  },
  Xminority(ctx,sx,sy,s) {
    drawXminority(ctx,0,0,sx,sy,s);
  },
  Input(ctx,sx,sy,s) {
    drawInputBG(ctx,0,0,1.5,1.5,false,sx,sy,s);
    drawIODot(ctx,0,0,1.5,1.5,false,sx,sy,s);
  },
  Output(ctx,sx,sy,s) {
    drawOutputBG(ctx,0,0,sx,sy,s);
    drawIODot(ctx,1.6,0,1.5,1.5,false,sx,sy,s);
  },
  LED(ctx,sx,sy,s) {
    drawLED(ctx,0,0,color='red',1.6,sx,sy,s);
  },
  SquareLED(ctx,sx,sy,s) {
    drawSquareLED(ctx,0,0,color='red',1.6,sx,sy,s);
  },
  Clock(ctx,sx,sy,s) {
    drawInputBG(ctx,0,0,1.5,1.5,false,sx,sy,s);
    drawClockSymbol(ctx,0,0,'white',sx,sy,s);
  },
  Button(ctx,sx,sy,s) {
    drawButton(ctx,0,0,1.5,1.5,sx,sy,s);
  },
  ButtonPad(ctx,sx,sy,s) {
    drawButtonPad(ctx,0,0,2,2,1.5,1.5,1,1,[],sx,sy,s);
  },
  SegmentDisplay(ctx,sx,sy,s) {
    draw7Seg(ctx,-3,-7,'red','#333',[1,1,1,1,1,1,1,1],sx,sy,s);
  },
  SevenSegment(ctx,sx,sy,s) {
    draw7Seg(ctx,-3,-7,'red','#333',[1,1,1,1,1,1,1,1],sx,sy,s);
  },
  SixteenSegment(ctx,sx,sy,s) {
    draw16Seg(ctx,-3,-7,'red','#333',ag=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],sx,sy,s);
  },
  Joystick(ctx,sx,sy,s) {
    drawJoystick(ctx,0,-2,0,0,sx,sy,s);
  },
  RotaryEncoder(ctx,sx,sy,s) {
    drawRotaryEncoder(ctx,0,-2,1,0,sx,sy,s);
  },
  Splitter(ctx,sx,sy,s) {
    drawSplitter(ctx,0,0,1,4,1,sx,sy,s);
  },
  Driver(ctx,sx,sy,s) {
    drawDriver(ctx,0,0,sx,sy,s);
  },
  DriverInv(ctx,sx,sy,s) {
    drawDriverInv(ctx,0,0,sx,sy,s);
  },
  Supply(ctx,sx,sy,s) {
    drawSupply(ctx,0,0,sx,sy,s);
  },
  Ground(ctx,sx,sy,s) {
    drawGround(ctx,0,0,sx,sy,s);
  },
  Tunnel(ctx,sx,sy,s) {
    drawTunnel(ctx,0,0,sx,sy,s);
  },
  PullUp(ctx,sx,sy,s) {
    drawPullUp(ctx,0,0,sx,sy,s);
  },
  PullDown(ctx,sx,sy,s) {
    drawPullDown(ctx,0,0,sx,sy,s);
  },
  NMOS(ctx,sx,sy,s) {
    drawNMOS(ctx,0,0,sx,sy,s);
  },
  Resistor(ctx,sx,sy,s) {
    drawPullResistor(ctx,0,0,sx,sy,s);
  },
  Diode(ctx,sx,sy,s) {
    drawDiode(ctx,0,0,sx,sy,s);
  },
  Switch(ctx,sx,sy,s) {
    drawSwitchOpen(ctx,0,0,sx,sy,s);
  },
  PMOS(ctx,sx,sy,s) {
    drawPMOS(ctx,0,0,sx,sy,s)
  },
  NPNBJT(ctx,sx,sy,s) {
    drawNPNBJT(ctx,0,0,sx,sy,s)
  },
  PNPBJT(ctx,sx,sy,s) {
    drawPNPBJT(ctx,0,0,sx,sy,s)
  },
  PMOS(ctx,sx,sy,s) {
    drawPMOS(ctx,0,0,sx,sy,s)
  },
  Multiplexer(ctx,sx,sy,s) {
    drawMUX(ctx,0,0,2,sx,sy,s)
  },
  Demultiplexer(ctx,sx,sy,s) {
    drawDEMUX(ctx,0,0,2,sx,sy,s)
  },
  BitSelector(ctx,sx,sy,s) {
    drawMUX(ctx,0,0,2,sx,sy,s)
  },
  Decoder(ctx,sx,sy,s) {
    drawDEMUX(ctx,0,0,2,sx,sy,s)
  },
  PriorityEncoder(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,1,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'D0'},
      {x: 0, y: 1, type: 'input', label: 'D1'},
      {x: 3, y: 0, type: 'output', label: 'Q0'},
      {x: 3, y: 1, type: 'output', label: 'v'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  LUT(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
  },
  RAM(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,4,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 0, y: 1, type: 'input', label: 'RE'},
      {x: 0, y: 2, type: 'input', label: 'WE'},
      {x: 0, y: 3, type: 'input', label: 'D'},
      {x: 0, y: 4, type: 'input', label: 'CLK'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  ROM(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 0, y: 1, type: 'input', label: 'RE'},
      {x: 0, y: 2, type: 'input', label: 'D'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Increment(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,1,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 0, y: 1, type: 'input', label: 'ci'},
      {x: 3, y: 0, type: 'output', label: greek.Sigma},
      {x: 3, y: 1, type: 'output', label: 'co'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Decrement(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,1,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'X'},
      {x: 0, y: 1, type: 'input', label: 'bi'},
      {x: 3, y: 0, type: 'output', label: greek.Delta},
      {x: 3, y: 1, type: 'output', label: 'bo'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Adder(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 0, y: 1, type: 'input', label: 'B'},
      {x: 0, y: 2, type: 'input', label: 'ci'},
      {x: 3, y: 0, type: 'output', label: greek.Sigma},
      {x: 3, y: 1, type: 'output', label: 'co'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Subtractor(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'X'},
      {x: 0, y: 1, type: 'input', label: 'Y'},
      {x: 0, y: 2, type: 'input', label: 'bi'},
      {x: 3, y: 0, type: 'output', label: greek.Delta},
      {x: 3, y: 1, type: 'output', label: 'bo'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Multiplier(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'a'},
      {x: 0, y: 2, type: 'input', label: 'b'},
      {x: 3, y: 1, type: 'output', label: greek.Pi},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Divider(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'x'},
      {x: 0, y: 2, type: 'input', label: 'y'},
      {x: 3, y: 0, type: 'output', label: 'q'},
      {x: 3, y: 2, type: 'output', label: 'r'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Comparator(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 0, y: 2, type: 'input', label: 'B'},
      {x: 3, y: 0, type: 'output', label: '>'},
      {x: 3, y: 1, type: 'output', label: '='},
      {x: 3, y: 2, type: 'output', label: '<'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Negator(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,2,0,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'A'},
      {x: 2, y: 0, type: 'output', label: '-'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  SignEx(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,3,0,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input'},
      {x: 3, y: 0, type: 'output', label: 'signEx'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  Reset(ctx,sx,sy,s) {
    drawICBox(ctx,0,0,1,0,sx,sy,s);
    var pins = [
      {x: 0, y: 0, type: 'input', label: 'R'},
    ];
    drawPinLabels(ctx,0,0,pins,[],sx,sy,s);
  },
  IC(ctx,sx,st,s) {
    drawICBox(ctx,0,0,3,2,sx,sy,s);
  },
}