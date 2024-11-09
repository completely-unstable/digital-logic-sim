CanvasRenderingContext2D.prototype.arc = (function(arc) {
  return function(x, y, radius, startAngle, endAngle, anticlockwise) {
    if (radius < 0) return;
    arc.call(this, x, y, radius, startAngle, endAngle, anticlockwise);
  };
})(CanvasRenderingContext2D.prototype.arc);

CanvasRenderingContext2D.prototype.fillText = (function(fillText) {
  return function(text, x, y) {
    if (!/(?<!\\)(?:\\\\)*~/.test(text)) return fillText.call(this,text,x,y);
    var strs = [];
    var ovls = [];
    var cur = '';
    var esc = false;
    var ov = false;
    var gr = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (esc) {
        cur += ch;
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (gr) {
        if (ch === '}') {
          if (cur.length) {
            strs.push(cur);
            ovls.push(true);
            cur = '';
          }
          ov = false;
          gr = false;
        } else {
          cur += ch;
        }
      } else if (ov) {
        if (ch === '{') {
          gr = true;
        } else {
          strs.push(ch);
          ovls.push(true);
          ov = false;
        }
      } else if (ch === '~') {
        if (cur.length) {
          strs.push(cur);
          ovls.push(false);
          cur = '';
        }
        ov = true;
      } else {
        cur += ch;
      }
    }
    if (cur.length) {
      strs.push(cur);
      ovls.push(false);
    }
    var rev = ['end','right'].includes(this.textAlign);
    if (rev) {
      strs.reverse();
      ovls.reverse();
    }
    var dir = -2*rev+1;
    var lw = this.lineWidth;
    var ss = this.strokeStyle;
    this.lineWidth = 1;
    this.strokeStyle = this.fillStyle;
    var tm = this.measureText(text);
    var a = tm.actualBoundingBoxAscent;
    strs.forEach((str,i) => {
      var ov = ovls[i];
      this.fillText(str,x,y)
      var tm = this.measureText(str);
      var w = tm.width;
      if (ov) {
        var yy = Math.round(y-a-.5)+.5-1;
        this.beginPath();
        this.moveTo(x,yy);
        this.lineTo(x+w*dir,yy);
        this.stroke();
        this.closePath();
      }
      x += w*dir;
    });
    this.lineWidth = lw;
    this.strokeStyle = ss;
  };
})(CanvasRenderingContext2D.prototype.fillText);