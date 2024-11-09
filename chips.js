var gates2inABY = '1A 1B 1Y 2A 2B 2Y GND 3Y 3A 3B 4Y 4A 4B VCC';
var gates2inYAB = '1Y 1A 1B 2Y 2A 2B GND 3A 3B 3Y 4A 4B 4Y VCC';
var gates1in = '1A 1Y 2A 2Y 3A 3Y GND 4Y 4A 5Y 5A 6Y 6A VCC';
var gates3in = '1A 1B 2A 2B 2C 2Y GND 3Y 3A 3B 3C 1Y 1C VCC';
var gates4in = '1A 1B NC 1C 1D 1Y GND 2Y 2A 2B NC 2C 2Y VCC';
var gates8in = 'A B C D E F GND Y NC NC G H NC VCC';
var BCDtoDECin = '0 1 2 3 4 5 6 GND 7 8 9 D C B A VCC';

function bufferTable(oc=false) {
  return 'H ' + (oc ? 'Z' : 'H') + '\nL L';
}

function notTable(oc=false) {
  return 'H L\nL ' + (oc ? 'Z' : 'H');
}

function nandTable(n=2, oc=false) {
  return 'H '.repeat(n) + 'L' + '\n' + 'X '.repeat(n) + (oc ? 'Z' : 'H');
}

function norTable(n=2, oc=false) {
  return 'L '.repeat(n) + (oc ? 'Z' : 'H') + '\n' + 'X '.repeat(n) + 'L';
}

function andTable(n=2, oc=false) {
  return 'H '.repeat(n) + (oc ? 'Z' : 'H') + '\n' + 'X '.repeat(n) + 'L';
}

function orTable(n=2, oc=false) {
  return 'L '.repeat(n) + 'L' + '\n' + 'X '.repeat(n) + (oc ? 'Z' : 'H');
}



DILchips = {
  '74x00': [gates2inABY, 'A B', 'Y', nandTable(2)],
  '74x01': [gates2inYAB, 'A B', 'Y', nandTable(2,true)],
  '74H01': [gates2inABY, 'A B', 'Y', nandTable(2,true)],
  '74x02': [gates2inYAB, 'A B', 'Y', norTable(2)],
  '74x03': [gates2inABY, 'A B', 'Y', nandTable(2,true)],
  '74x04': [gates1in, 'A', 'Y', notTable()],
  '74x05': [gates1in, 'A', 'Y', notTable(true)],
  '74x06': [gates1in, 'A', 'Y', notTable()],
  '74x07': [gates1in, 'A', 'Y', bufferTable()],
  '74x08': [gates2inABY, 'A B', 'Y', andTable(2)],
  '74x09': [gates2inABY, 'A B', 'Y', andTable(2,true)],
  '74x10': [gates3in, 'A B C', 'Y', nandTable(3)],
  '74x11': [gates3in, 'A B C', 'Y', andTable(3)],
  '74x12': [gates3in, 'A B C', 'Y', nandTable(3,true)],
  '74x13': [gates4in, 'A B C D', 'Y', nandTable(4)],
  '74x14': [gates1in, 'A', 'Y', notTable()],
  '74x15': [gates3in, 'A B C', 'Y', andTable(3,true)],
  '74x16': [gates1in, 'A', 'Y', notTable()],
  '74x17': [gates1in, 'A', 'Y', bufferTable()],
  '74x18': [gates4in, 'A B C D', 'Y', nandTable(4)],
  '74x19': [gates1in, 'A', 'Y', notTable()],
  '74x24': [gates2inABY, 'A B', 'Y', nandTable(2)],
  '74x20': [gates4in, 'A B C D', 'Y', nandTable(4)],
  '74x21': [gates4in, 'A B C D', 'Y', andTable(4)],
  '74x22': [gates4in, 'A B C D', 'Y', nandTable(4,true)],
  '74x25': [
'1A 1B 1G 1C 1D 1Y GND 2Y 2A 2B 2G 2C 2D VCC', 'A B C D G', 'Y',
`H X X X H L
 X H X X H L
 X X H X H L
 X X X H H L
 L L L L X H
 X X X X L H`
],
  '74x26': [gates2inABY, 'A B', 'Y', nandTable(2)],
  '74x27': [gates3in, 'A B C', 'Y', norTable(3)],
  '74x28': [gates2inYAB, 'A B', 'Y', norTable(2)],
  '74x30': [gates8in, 'A B C D E F G H', 'Y', nandTable(8)],
  '74x32': [gates2inABY, 'A B', 'Y', orTable(2)],
  '74x33': [gates2inYAB, 'A B', 'Y', norTable(2,true)],
  '74x37': [gates2inABY, 'A B', 'Y', nandTable(2)],
  '74x38': [gates2inABY, 'A B', 'Y', nandTable(2,true)],
  '74x39': [gates2inYAB, 'A B', 'Y', nandTable(2,true)],
  '74x40': [gates4in, 'A B C D', 'Y', nandTable(4,true)],
  '74x42': [
BCDtoDECin, 'D C B A', '0 1 2 3 4 5 6 7 8 9',
`L L L L L H H H H H H H H H
 L L L H H L H H H H H H H H
 L L H L H H L H H H H H H H
 L L H H H H H L H H H H H H
 L H L L H H H H L H H H H H
 L H L H H H H H H L H H H H
 L H H L H H H H H H L H H H
 L H H H H H H H H H H L H H
 H L L L H H H H H H H H L H
 H L L H H H H H H H H H H L
 H L H L H H H H H H H H H H
 H L H H H H H H H H H H H H
 H H L L H H H H H H H H H H
 H H L H H H H H H H H H H H
 H H H L H H H H H H H H H H
 H H H H H H H H H H H H H H`
],
  '74x43': [
BCDtoDECin, 'D C B A', '0 1 2 3 4 5 6 7 8 9',
`L L H H L H H H H H H H H H
 L H L L H L H H H H H H H H
 L H L H H H L H H H H H H H
 L H H L H H H L H H H H H H
 L H H H H H H H L H H H H H
 H L L L H H H H H L H H H H
 H L L H H H H H H H L H H H
 H L H L H H H H H H H L H H
 H L H H H H H H H H H H L H
 H H L L H H H H H H H H H L
 H H L H H H H H H H H H H H
 H H H L H H H H H H H H H H
 H H H H H H H H H H H H H H
 L L L L H H H H H H H H H H
 L L L H H H H H H H H H H H
 L L H L H H H H H H H H H H`
],
  '74x44': [
BCDtoDECin, 'D C B A', '0 1 2 3 4 5 6 7 8 9',
`L L H L L H H H H H H H H H
 L H H L H L H H H H H H H H
 L H H H H H L H H H H H H H
 L H L H H H H L H H H H H H
 L H L L H H H H L H H H H H
 H H L L H H H H H L H H H H
 H H L H H H H H H H L H H H
 H H H H H H H H H H H L H H
 H H H L H H H H H H H H L H
 H L H L H H H H H H H H H L
 H L H H H H H H H H H H H H
 H L L H H H H H H H H H H H
 H L L L H H H H H H H H H H
 L L L L H H H H H H H H H H
 L L L H H H H H H H H H H H
 L L H H H H H H H H H H H H`
],
  '74x45': [
BCDtoDECin, 'D C B A', '0 1 2 3 4 5 6 7 8 9',
`L L L L L H H H H H H H H H
 L L L H H L H H H H H H H H
 L L H L H H L H H H H H H H
 L L H H H H H L H H H H H H
 L H L L H H H H L H H H H H
 L H L H H H H H H L H H H H
 L H H L H H H H H H L H H H
 L H H H H H H H H H H L H H
 H L L L H H H H H H H H L H
 H L L H H H H H H H H H H L
 H L H L H H H H H H H H H H
 H L H H H H H H H H H H H H
 H H L L H H H H H H H H H H
 H H L H H H H H H H H H H H
 H H H L H H H H H H H H H H
 H H H H H H H H H H H H H H`
],
  '74x46': [
'B C ~LT ~BI/RBO ~RBI D A GND e d c b a g f VCC', '~LT ~RBI D C B A ~BI/RBO', 'a b c d e f g',
`H H L L L L H H H H H H H L
 H X L L L H H L H H L L L L
 H X L L H L H H H L H H L H
 H X L L H H H H H H H L L H
 H X L H L L H L H H L L H H
 H X L H L H H H L H H L H H
 H X L H H L H L L H H H H H
 H X L H H H H H H H L L L L
 H X H L L L H H H H H H H H
 H X H L L H H H H H L L H H
 H X H L H L H L L L H H L H
 H X H L H H H L L H H L L H
 H X H H L L H L H L L L H H
 H X H H L H H H L L H L H H
 H X H H H L H L L L H H H H
 H X H H H H H L L L L L L L
 X X X X X X L L L L L L L L
 H L L L L L L L L L L L L L
 L X X X X X H H H H H H H H`
],
  '74x47': [
'B C ~LT ~BI/RBO ~RBI D A GND e d c b a g f VCC', '~LT ~RBI D C B A ~BI/RBO', 'a b c d e f g',
`H H L L L L H H H H H H H L
 H X L L L H H L H H L L L L
 H X L L H L H H H L H H L H
 H X L L H H H H H H H L L H
 H X L H L L H L H H L L H H
 H X L H L H H H L H H L H H
 H X L H H L H L L H H H H H
 H X L H H H H H H H L L L L
 H X H L L L H H H H H H H H
 H X H L L H H H H H L L H H
 H X H L H L H L L L H H L H
 H X H L H H H L L H H L L H
 H X H H L L H L H L L L H H
 H X H H L H H H L L H L H H
 H X H H H L H L L L H H H H
 H X H H H H H L L L L L L L
 X X X X X X L L L L L L L L
 H L L L L L L L L L L L L L
 L X X X X X H H H H H H H H`
],
  '74x48': [
'B C ~LT ~BI/RBO ~RBI D A GND e d c b a g f VCC', '~LT ~RBI D C B A ~BI/RBO', 'a b c d e f g',
`H H L L L L H H H H H H H L
 H X L L L H H L H H L L L L
 H X L L H L H H H L H H L H
 H X L L H H H H H H H L L H
 H X L H L L H L H H L L H H
 H X L H L H H H L H H L H H
 H X L H H L H L L H H H H H
 H X L H H H H H H H L L L L
 H X H L L L H H H H H H H H
 H X H L L H H H H H L L H H
 H X H L H L H L L L H H L H
 H X H L H H H L L H H L L H
 H X H H L L H L H L L L H H
 H X H H L H H H L L H L H H
 H X H H H L H L L L H H H H
 H X H H H H H L L L L L L L
 X X X X X X L L L L L L L L
 H L L L L L L L L L L L L L
 L X X X X X H H H H H H H H`
],
  '74x49': [
'B C ~BI D A e GND d c b a g f VCC', 'D C B A ~BI', 'a b c d e f g',
`L L L L H H H H H H H L
 L L L H H L H H L L L L
 L L H L H H H L H H L H
 L L H H H H H H H L L H
 L H L L H L H H L L H H
 L H L H H H L H H L H H
 L H H L H L L H H H H H
 L H H H H H H H L L L L
 H L L L H H H H H H H H
 H L L H H H H H L L H H
 H L H L H L L L H H L H
 H L H H H L L H H L L H
 H H L L H L H L L L H H
 H H L H H H L L H L H H
 H H H L H L L L H H H H
 H H H H H L L L L L L L
 X X X X L L L L L L L L
 L L L L L L L L L L L L
 X X X X H H H H H H H H`
],
  '74x51': [
'1A 2A 2B 2C 2D 2Y GND 1Y 1C 1D NU NU 1B VCC', 'A B C D', 'Y',
`H H X X L
 X X H H L
 X X X X H`
],
  '74x54': [
'A C D E F NC GND Y G H NU NU B VCC','A B C D E F G H','Y',
`H H X X X X X X L
 X X H H X X X X L
 X X X X H H X X L
 X X X X X X H H L
 X X X X X X X X H`
],
  '74x63': [gates1in, 'A', 'Y', bufferTable()],
  '74x70': [
'NC ~CLR J1 J2 ~J ~Q GND Q ~K K1 K2 CLK ~PRE VCC','~PRE ~CLR CLK J1 J2 ~J K1 K2 ~K','Q ~Q',
`L H L X X X X X X H L
 H L L X X X X X X L H
 L L X X X X X X X L L
 H H ^ H H L L X X H L
 H H ^ H H L X L X H L
 H H ^ H H L L X H H L
 H H ^ L X X H H L L H
 H H ^ X L X H H L L H
 H H ^ X X H H H L L H
 H H ^ H H L H H L ~Q Q`
],
  '74x71': [
'NC ~CLR S1 S2 S3 ~Q GND Q R1 R2 R3 CLK ~PRE VCC','~PRE ~CLR CLR S R','Q ~Q',
`L H X X X X X X X H L
 H L X X X X X X X L H
 L L X X X X X X X H H
 H H v H H H L X X H L
 H H v H H H X L X H L
 H H v H H H X X L H L
 H H v L X X H H H L H
 H H v X L X H H H L H
 H H v X X L H H H L H
 H H v H H H H H H H H`
],
  '74x72': [
'NC ~CLR J1 J2 J3 ~Q GND Q K1 K2 K3 CLK ~PRE VCC','~PRE ~CLR CLK J1 J2 J3 K1 K2 K3','Q ~Q',
`L H X X X X X X X L H
 H L X X X X X X X H L
 L L X X X X X X X H H
 H H v H H H L X X H L
 H H v H H H X L X H L
 H H v H H H X X L H L
 H H v L X X H H H L H
 H H v X L X H H H L H
 H H v X X L H H H L H
 H H v H H H H H H ~Q Q`
],
  '74x73': [
'1CLK 1~CLR 1K VCC 2CLK 2~CLR 2J 2~Q 2Q 2K GND 1Q 1~Q 1J','~CLR CLK J K','Q ~Q',
`L X X X L H
 H v H L H L
 H v L H L H
 H v H H ~Q Q`
],
  '74x74': [
'1~CLR 1D 1CLK 1~PRE 1Q 1~Q GND 2~Q 2Q 2~PRE 2CLK 2D 2~CLR VCC', '~PRE ~CLR CLK D', 'Q ~Q',
`L H X X H L
 H L X X L H
 L L X X H H
 H H ^ H H L
 H H ^ L L H`
],
  '74x78': [
'1K 1Q 1~Q 1J 2~Q 2Q GND 2K CLK 2~PRE 2J ~CLR 1~PRE VCC', '~PRE ~CLR CLK J K', 'Q ~Q',
`L H X X X H L
 H L X X X L H
 H H v H L H L
 H H v L H L H
 H H v H H ~Q Q`
],
  '74x82': [
`${greek.Sigma}1 A1 B1 VCC C0 NC NC NC NC C2 GND ${greek.Sigma}2 B2 A2`,'A1 B1 A2 B2 C0',`${greek.Sigma}1 ${greek.Sigma}2 C2`,
`L L L L L L L L
 L L L L H H L L
 H L L L L H L L
 H L L L H L H L
 L H L L L H L L
 L H L L H L H L
 H H L L L L H L
 H H L L H H H L
 L L H L L L H L
 L L H L H H H L
 H L H L L H H L
 H L H L H L L H
 L H H L L H H L
 L H H L H L L H
 H H H L L L L H
 H H H L H H L H
 L L L H L L H L
 L L L H H H H L
 H L L H L H H L
 H L L H H L L H
 L H L H L H H L
 L H L H H L L H
 H H L H L L L H
 H H L H H H L H
 L L H H L L L H
 L L H H H H L H
 H L H H L H L H
 H L H H H L H H
 L H H H L H L H
 L H H H H L H H
 H H H H L L H H
 H H H H H H H H`
],
  '74x83': [
`A4 ${greek.Sigma}3 A3 B3 VCC ${greek.Sigma}2 B2 A2 ${greek.Sigma}1 A1 B1 GND C0 C4 ${greek.Sigma}4 B4`, 'A1 B1 A2 B2 A3 B3 A4 B4 C0', `${greek.Sigma}1 ${greek.Sigma}2 ${greek.Sigma}3 ${greek.Sigma}4 C4`, (A1,B1,A2,B2,A3,B3,A4,B4,C0) => {
    var A = (A4 << 3) | (A3 << 2) | (A2 << 1) | A1;
    var B = (B4 << 3) | (B3 << 2) | (B2 << 1) | B1;
    var S = A + B + C0;
    return [
      S & 1,
      (S >> 1) & 1,
      (S >> 2) & 1,
      (S >> 3) & 1,
      (S >> 4) & 1,
    ]  
}
],
  '74x85': [
'B3 A<Bin A=Bin A>Bin A>Bout A=Bout A<Bout GND B0 A0 B1 A1 A2 B2 A3 VCC','A3 B3 A2 B2 A1 B1 A0 B0 A>Bin A<Bin A=Bin','A>Bout A<Bout A=Bout',
`H L X X X X X X X X X H L L
 L H X X X X X X X X X L H L
 X X H L X X X X X X X H L L
 X X L H X X X X X X X L H L
 X X X X H L X X X X X H L L
 X X X X L H X X X X X L H L
 X X X X X X H L X X X H L L
 X X X X X X L H X X X L H L
 X X X X X X X X H L L H L L
 X X X X X X X X L H L L H L
 X X X X X X X X L L H L L H
 X X X X X X X X X X H L L H
 X X X X X X X X H H L L L L
 X X X X X X X X L L L H H L`
],
  '74L85': [
'B3 A<Bin A=Bin A>Bin A>Bout A=Bout A<Bout GND B0 A0 B1 A1 A2 B2 A3 VCC','A3 B3 A2 B2 A1 B1 A0 B0 A>Bin A<Bin A=Bin','A>Bout A<Bout A=Bout',
`H L X X X X X X X X X H L L
 L H X X X X X X X X X L H L
 X X H L X X X X X X X H L L
 X X L H X X X X X X X L H L
 X X X X H L X X X X X H L L
 X X X X L H X X X X X L H L
 X X X X X X H L X X X H L L
 X X X X X X L H X X X L H L
 X X X X X X X X H L L H L L
 X X X X X X X X L H L L H L
 X X X X X X X X L L H L L H
 X X X X X X X X L H H L H H
 X X X X X X X X H L H H L H
 X X X X X X X X H H H H H H
 X X X X X X X X H H L H H L
 X X X X X X X X L L L L L L`
],
  '74x86': [gates2inABY, 'A B', 'Y', 'L L L\nH H L\nX X H'],
  '74x87': ['C A1 Y1 NC A2 Y2 GND B Y3 A3 NC Y4 A4 VCC', 'A1 A2 A3 A4 B C', 'Y1 Y2 Y3 Y4',
(A1,A2,A3,A4,B,C) => {
  if (B) {
    if (C) return [0,0,0,0];
    return [1,1,1,1];
  } else {
    if (C) return [A1,A2,A3,A4];
    return [1-A1,1-A2,1-A3,1-A4];
  }
}],

  '74x386': [gates2inABY, 'A B', 'Y', 'L L L\nL H H\nH L H\nH H L'],
  '74x398': ['WS QA ~QA A1 A2 B2 B1 ~QB QB GND CLK QC ~QC C1 C2 D2 D1 ~QD QD VCC', 'WS CLK A1 B1 A2 B2 C1 C2 D1 D2', 'QA ~QA QB ~QB QC ~QC QD ~QD',
`L ^ X X X X X X X X A1 ~A1 B1 ~B1 C1 ~C1 D1 ~D1
 H ^ X X X X X X X X A2 ~A2 B2 ~B2 C2 ~C2 D2 ~D2`
],
  '74x425': ['1~G 1A 1Y 2~G 2A 2Y GND 3Y 3A 3~G 4Y 4A 4~G VCC', '~G A', 'Y',
`H X Z
 L X A`
],
  '74x426': ['1G 1A 1Y 2G 2A 2Y GND 3Y 3A 3G 4Y 4A 4G VCC', 'G A', 'Y',
`L X Z
 H X A`
],



};


(() => {

var _clka1 = 0,
    _clkb1 = 0,
    _qa1 = 0,
    _qb1 = 0,
    _qc1 = 0,
    _qd1 = 0,
    count1 = 0,
    _clk2 = 0,
    _qa2 = 0,
    _qb2 = 0,
    _qc2 = 0,
    _qd2 = 0,
    count2 = 0;

function upd(clr1, clka1, clkb1, clr2, clk2) {
  var qa1 = _qa1,
      qb1 = _qb1,
      qc1 = _qc1,
      qd1 = _qd1,
      qa2 = _qa2,
      qb2 = _qb2,
      qc2 = _qc2,
      qd2 = _qd2;
  if (clr1) {
    qa1 = 0;
    qb1 = 0;
    qc1 = 0;
    qd1 = 0;
    count1 = 0;
  } else {
    if (_clka1 === 1 && clka1 === 0) {
      qa1 = 1 - _qa1;
    }
    if (_clkb1 === 1 && clkb1 === 0) {
      count1++;
      if (count1 === 5) count1 = 0;
      qb1 = getBit(count1,0);
      qc1 = getBit(count1,1);
      qd1 = getBit(count1,2);
    }
  }
  if (clr2) {
    qa2 = 0;
    qb2 = 0;
    qc2 = 0;
    qd2 = 0;
    count2 = 0;
  } else {
    if (_clk2 === 1 && clk2 === 0) {
      count2++;
      if (count2 === 10) count2 = 0;
      qa2 = getBit(count2,0);
      qb2 = getBit(count2,1);
      qc2 = getBit(count2,2);
      qd2 = getBit(count2,3);
    }
  }
  _clka1 = clka1;
  _clkb1 = clkb1;
  _qa1 = qa1;
  _qb1 = qb1;
  _qc1 = qc1;
  _qd1 = qd1;
  _clk2 = clk2;
  _qa2 = qa2;
  _qb2 = qb2;
  _qc2 = qc2;
  _qd2 = qd2;
  return [qa1,qb1,qc1,qd1,qa2,qb2,qc2,qd2];
}

DILchips['74x68'] = ['1CLKA 1QB 1QD 1~CLR 2QC NC 2QA GND 2CLK 2QB 2~CLR 2QD 1QC 1QA 1CLKB VCC', '1~CLR 1CLKA 1CLKB 2~CLR 2CLK', '1QA 1QB 1QC 1QD 2QA 2QB 2QC 2QD',upd];

})();

(() => {

var _clk = 0,
    q0 = 0,
    q1 = 0,
    q2 = 0,
    q3 = 0,
    q4 = 0,
    q5 = 0,
    q6 = 0,
    q7 = 0,
    qh = 0;

function upd(clk, a, b) {
  if (_clk === 0 && clk === 1) {
    qh = q7;
    q7 = q6;
    q6 = q5;
    q5 = q4;
    q4 = q3;
    q3 = q2;
    q2 = q1;
    q1 = q0;
    q0 = a & b;
  }
  return [qh, 1-qh];
}

DILchips['74x91'] = ['NC NC NC NC VCC NC NC NC CLK GND B A QH ~QH', 'CLK A B', 'QH ~QH',upd];

})();