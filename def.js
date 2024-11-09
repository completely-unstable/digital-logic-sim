var componentAttributes = {"Input":["x","y","type","setFromIC","rotation","bits","label","dual","inverted","width","height","numFormat"],"Clock":["x","y","type","setFromIC","rotation","label","frequency","inverted"],"Button":["x","y","type","setFromIC","rotation","label","inverted","key","fontSize","width","height"],"ButtonPad":["x","y","type","setFromIC","rotation","buttonWidth","buttonHeight","rowGap","columnGap","rows","cols"],"SegmentDisplay":["x","y","type","setFromIC","rotation","display","encoding"],"SevenSegment":["x","y","type","setFromIC","rotation","hex"],"SixteenSegment":["x","y","type","setFromIC","rotation","ascii"],"Joystick":["x","y","type","setFromIC","rotation","bits","gray","sticky","keys"],"RotaryEncoder":["x","y","type","setFromIC","rotation","bits","gray"],"Output":["x","y","type","setFromIC","rotation","bits","label","inverted","small","numFormat"],"Switch":["x","y","type","setFromIC","rotation","dt"],"Buffer":["x","y","type","setFromIC","rotation","bits","inverted","mirror","compliment","small"],"Not":["x","y","type","setFromIC","rotation","bits","inverted","mirror","compliment","small"],"And":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Or":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xor":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xand":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Majority":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xmajority":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Nand":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Nor":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xnor":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xnand":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Minority":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"Xminority":["x","y","type","setFromIC","rotation","bits","inputs","inverted","mirror","compliment","multiBit"],"LUT":["x","y","type","setFromIC","rotation","bits","inputs","data","inverted"],"Driver":["x","y","type","setFromIC","rotation","bits","mirror","inverted"],"DriverInv":["x","y","type","setFromIC","rotation","bits","mirror","inverted"],"Supply":["x","y","type","setFromIC","rotation","bits"],"Ground":["x","y","type","setFromIC","rotation"],"Constant":["x","y","type","setFromIC","rotation","bits","value"],"Tunnel":["x","y","type","setFromIC","rotation","label"],"PullUp":["x","y","type","setFromIC","rotation","bits"],"PullDown":["x","y","type","setFromIC","rotation"],"NMOS":["x","y","type","setFromIC","rotation","bits"],"PMOS":["x","y","type","setFromIC","rotation","bits"],"NPNBJT":["x","y","type","setFromIC","rotation","bits"],"PNPBJT":["x","y","type","setFromIC","rotation","bits"],"RAM":["x","y","type","setFromIC","rotation","abits","dbits","data"],"ROM":["x","y","type","setFromIC","rotation","abits","dbits","data","ports"],"IC":["x","y","type","setFromIC","rotation","circuit","location"],"Splitter":["x","y","type","setFromIC","rotation","input splitting","output splitting","spreading","mirror"],"Decoder":["x","y","type","setFromIC","rotation","sbits","mirror"],"Multiplexer":["x","y","type","setFromIC","rotation","dbits","sbits","mirror"],"Demultiplexer":["x","y","type","setFromIC","rotation","dbits","sbits","mirror"],"BitSelector":["x","y","type","setFromIC","rotation","sbits","mirror"],"PriorityEncoder":["x","y","type","setFromIC","rotation","sbits","width","mirror"],"BinToBCD":["x","y","type","setFromIC","rotation","bits"],"Increment":["x","y","type","setFromIC","rotation","bits"],"Adder":["x","y","type","setFromIC","rotation","bits"],"Decrement":["x","y","type","setFromIC","rotation","bits"],"Subtractor":["x","y","type","setFromIC","rotation","bits"],"Multiplier":["x","y","type","setFromIC","rotation","bits","signed"],"Divider":["x","y","type","setFromIC","rotation","bits","signed"],"Comparator":["x","y","type","setFromIC","rotation","bits"],"Negator":["x","y","type","setFromIC","rotation","bits"],"SignEx":["x","y","type","setFromIC","rotation","inBits","outBits"],"DIL":["x","y","type","setFromIC","rotation","chip"],"Cell":["x","y","type","setFromIC","rotation","voltage"],"Battery":["x","y","type","setFromIC","rotation","voltage"],"Resistor":["x","y","type","setFromIC","rotation","bits"],"Capacitor":["x","y","type","setFromIC","rotation"],"Inductor":["x","y","type","setFromIC","rotation"],"Diode":["x","y","type","setFromIC","rotation"],"Reset":["x","y","type","setFromIC","rotation","inverted","bits"]};

var componentDefaults = {"Input":{"x":0,"y":0,"type":"Input","setFromIC":false,"rotation":0,"bits":1,"label":"","dual":false,"inverted":[],"width":1.5,"height":1.5,"numFormat":"dec"},"Clock":{"x":0,"y":0,"type":"Clock","setFromIC":false,"rotation":0,"label":"CLK","frequency":1,"inverted":[]},"Button":{"x":0,"y":0,"type":"Button","setFromIC":false,"rotation":0,"label":"","inverted":[],"key":null,"fontSize":20,"width":1.5,"height":1.5},"ButtonPad":{"x":0,"y":0,"type":"ButtonPad","setFromIC":false,"rotation":0,"buttonWidth":1.5,"buttonHeight":1.5,"rowGap":1,"columnGap":1,"rows":2,"cols":2},"SegmentDisplay":{"x":0,"y":0,"type":"SegmentDisplay","setFromIC":false,"rotation":0,"display":"7seg","encoding":"noneSplit"},"SevenSegment":{"x":0,"y":0,"type":"SevenSegment","setFromIC":false,"rotation":0,"hex":false},"SixteenSegment":{"x":0,"y":0,"type":"SixteenSegment","setFromIC":false,"rotation":0,"ascii":false},"Joystick":{"x":0,"y":0,"type":"Joystick","setFromIC":false,"rotation":0,"bits":1,"gray":true,"sticky":false,"keys":null},"RotaryEncoder":{"x":0,"y":0,"type":"RotaryEncoder","setFromIC":false,"rotation":0,"bits":1,"gray":true},"Output":{"x":0,"y":0,"type":"Output","setFromIC":false,"rotation":0,"bits":1,"label":"","inverted":[],"small":false,"numFormat":"dec"},"Switch":{"x":0,"y":0,"type":"Switch","setFromIC":false,"rotation":0,"dt":false},"Buffer":{"x":0,"y":0,"type":"Buffer","setFromIC":false,"rotation":0,"bits":1,"inverted":[],"mirror":false,"compliment":false,"small":true},"Not":{"x":0,"y":0,"type":"Not","setFromIC":false,"rotation":0,"bits":1,"inverted":[],"mirror":false,"compliment":false,"small":true},"And":{"x":0,"y":0,"type":"And","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Or":{"x":0,"y":0,"type":"Or","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Xor":{"x":0,"y":0,"type":"Xor","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Xand":{"x":0,"y":0,"type":"Xand","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Majority":{"x":0,"y":0,"type":"Majority","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Xmajority":{"x":0,"y":0,"type":"Xmajority","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[-1],"mirror":false,"compliment":false,"multiBit":false},"Nand":{"x":0,"y":0,"type":"Nand","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"Nor":{"x":0,"y":0,"type":"Nor","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"Xnor":{"x":0,"y":0,"type":"Xnor","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"Xnand":{"x":0,"y":0,"type":"Xnand","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"Minority":{"x":0,"y":0,"type":"Minority","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"Xminority":{"x":0,"y":0,"type":"Xminority","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"inverted":[],"mirror":false,"compliment":false,"multiBit":false},"LUT":{"x":0,"y":0,"type":"LUT","setFromIC":false,"rotation":0,"bits":1,"inputs":2,"data":[0,0,0,0],"inverted":[]},"Driver":{"x":0,"y":0,"type":"Driver","setFromIC":false,"rotation":0,"bits":1,"mirror":false,"inverted":[]},"DriverInv":{"x":0,"y":0,"type":"DriverInv","setFromIC":false,"rotation":0,"bits":1,"mirror":false,"inverted":[]},"Supply":{"x":0,"y":0,"type":"Supply","setFromIC":false,"rotation":0,"bits":1},"Ground":{"x":0,"y":0,"type":"Ground","setFromIC":false,"rotation":0},"Constant":{"x":0,"y":0,"type":"Constant","setFromIC":false,"rotation":0,"bits":1,"value":1},"Tunnel":{"x":0,"y":0,"type":"Tunnel","setFromIC":false,"rotation":0,"label":""},"PullUp":{"x":0,"y":0,"type":"PullUp","setFromIC":false,"rotation":0,"bits":1},"PullDown":{"x":0,"y":0,"type":"PullDown","setFromIC":false,"rotation":0},"NMOS":{"x":0,"y":0,"type":"NMOS","setFromIC":false,"rotation":0,"bits":1},"PMOS":{"x":0,"y":0,"type":"PMOS","setFromIC":false,"rotation":0,"bits":1},"NPNBJT":{"x":0,"y":0,"type":"NPNBJT","setFromIC":false,"rotation":0,"bits":1},"PNPBJT":{"x":0,"y":0,"type":"PNPBJT","setFromIC":false,"rotation":0,"bits":1},"RAM":{"x":0,"y":0,"type":"RAM","setFromIC":false,"rotation":0,"abits":1,"dbits":1,"data":[0,0,0,0]},"ROM":{"x":0,"y":0,"type":"ROM","setFromIC":false,"rotation":0,"abits":1,"dbits":1,"data":[0,0,0,0],"ports":1},"IC":{"x":0,"y":0,"type":"IC","setFromIC":false,"rotation":0,"circuit":"blank","location":null},"Splitter":{"x":0,"y":0,"type":"Splitter","setFromIC":false,"rotation":0,"input splitting":"4","output splitting":"1*4","spreading":1,"mirror":false},"Decoder":{"x":0,"y":0,"type":"Decoder","setFromIC":false,"rotation":0,"sbits":1,"mirror":false},"Multiplexer":{"x":0,"y":0,"type":"Multiplexer","setFromIC":false,"rotation":0,"dbits":1,"sbits":1,"mirror":false},"Demultiplexer":{"x":0,"y":0,"type":"Demultiplexer","setFromIC":false,"rotation":0,"dbits":1,"sbits":1,"mirror":false},"BitSelector":{"x":0,"y":0,"type":"BitSelector","setFromIC":false,"rotation":0,"sbits":1,"mirror":false},"PriorityEncoder":{"x":0,"y":0,"type":"PriorityEncoder","setFromIC":false,"rotation":0,"sbits":1,"width":3,"mirror":false},"BinToBCD":{"x":0,"y":0,"type":"BinToBCD","setFromIC":false,"rotation":0,"bits":1},"Increment":{"x":0,"y":0,"type":"Increment","setFromIC":false,"rotation":0,"bits":1},"Adder":{"x":0,"y":0,"type":"Adder","setFromIC":false,"rotation":0,"bits":1},"Decrement":{"x":0,"y":0,"type":"Decrement","setFromIC":false,"rotation":0,"bits":1},"Subtractor":{"x":0,"y":0,"type":"Subtractor","setFromIC":false,"rotation":0,"bits":1},"Multiplier":{"x":0,"y":0,"type":"Multiplier","setFromIC":false,"rotation":0,"bits":1,"signed":false},"Divider":{"x":0,"y":0,"type":"Divider","setFromIC":false,"rotation":0,"bits":1,"signed":false},"Comparator":{"x":0,"y":0,"type":"Comparator","setFromIC":false,"rotation":0,"bits":1},"Negator":{"x":0,"y":0,"type":"Negator","setFromIC":false,"rotation":0,"bits":1},"SignEx":{"x":0,"y":0,"type":"SignEx","setFromIC":false,"rotation":0,"inBits":8,"outBits":16},"IC":{"x":0,"y":0,"type":"DIL","setFromIC":false,"rotation":0,"chip":"74x00"},"Cell":{"x":0,"y":0,"type":"Cell","setFromIC":false,"rotation":0,"voltage":9},"Battery":{"x":0,"y":0,"type":"Battery","setFromIC":false,"rotation":0,"voltage":9},"Resistor":{"x":0,"y":0,"type":"Resistor","setFromIC":false,"rotation":0,"bits":1},"Capacitor":{"x":0,"y":0,"type":"Capacitor","setFromIC":false,"rotation":0},"Inductor":{"x":0,"y":0,"type":"Inductor","setFromIC":false,"rotation":0},"Diode":{"x":0,"y":0,"type":"Diode","setFromIC":false,"rotation":0},"Reset":{"x":0,"y":0,"type":"Reset","setFromIC":false,"rotation":0,"inverted":[],"bits":1}};