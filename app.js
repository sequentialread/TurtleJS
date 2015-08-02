var global = this;
global.__tjs = new __TurtleJS(global);

function __TurtleJS(global) {
  var self = this;
  var svgNamespace = "http://www.w3.org/2000/svg";
  var __turtleColor = '#d0d0c0';
  var __turtleStrokeWidth = 1;


  self.stage = global.document.getElementById('__stage');

  self.drawTurtle = function (x,y,rotation) {
    self.turtleTransform = global.document.createElementNS(svgNamespace, 'g');
    self.turtleTransform.setAttribute(
      'transform', 'translate('+x+', '+y+'), rotate('+rotation+')');
    var turtle = self.createSvgLine();
    self.turtleTransform.appendChild(turtle);
    turtle.setAttribute('d', 'M 0 0 L -4 3 L 0 -8 L 4 3 z');

    self.stage.appendChild(self.turtleTransform);
  };

  self.createSvgLine = function (lineObject) {
    lineObject = lineObject || {};
    var line = global.document.createElementNS(svgNamespace, 'path');
    line.setAttribute('fill', lineObject.fillColor || 'none');
    line.setAttribute('opacity', lineObject.opacity || 1);
    line.setAttribute('stroke', lineObject.color || __turtleColor);
    line.setAttribute('stroke-width', lineObject.width || __turtleStrokeWidth);
    line.setAttribute('stroke-linejoin', "miter");
    return line;
  };

  self.drawTurtle(0,0,0);

  self.logs = [];

  self.logger = {
    // addLog is defined in the ui.js file
    log: function(logObject) {
      logObject.type = 'info';
      global.__tjs.addLog(logObject);
    },
    error: function(logObject) {
      logObject.type = 'error';
      global.__tjs.addLog(logObject);
    }
  };

  self.runTurtleJS = function() {
    var __turtleJS = self.editor.getValue();
    var __oldConsole = global.console;
    global.console = {
      log: function() {

        var position = {};
        try {
          __ExceptionTime();
        } catch (ex) {
          position = __getErrorLineNumber(ex, 1);
        }

        var toLog = [];
        Array.prototype.slice.call(arguments).forEach(function(argument){
          if(typeof argument === 'object') {
            toLog.push(JSON.stringify(argument));
          } else {
            toLog.push(''+argument)
          }
        });
        self.logger.log({
          lineNumber: position.lineNumber,
          charOffset: position.charOffset,
          message: "INFO: `" + toLog.join(',')
            + (position.lineNumber ? '` at line ' + position.lineNumber : '`')
        });
      }
    };

    self.shapeBreak = function () {
      if(self.turtCurrentLine.points.length > 1) {
        penUp();
        penDown();
      }
    };


    self.stage.innerHTML = '';
    self.clearTurt();
    penDown();

    var __turtleJSWithTryCatch = [
        'var exception = null;'
       ,'try {'
       ,__turtleJS
       ,'} catch (ex) {'
       ,'  exception = {'
       ,'    message: ex.message,'
       ,'    name: ex.name,'
       ,'    stack: __getErrorLineNumber(ex)'
       ,'  };'
       ,'}'
       ,'exception;'].join('\n');
    var exception = eval(__turtleJSWithTryCatch);
    global.console = __oldConsole;
    if(exception) {
      self.logger.error({
        lineNumber: exception.stack.lineNumber,
        charOffset: exception.stack.charOffset,
        message: exception.name +': ' + exception.message
        + (exception.stack.lineNumber ? ' at line ' + exception.stack.lineNumber : '')
      });
    }
    penUp();

    self.turtLines.sort(function (a, b) {
      if ((a.layer || 0) > (b.layer || 0)) {
        return 1;
      }
      if ((a.layer || 0) < (b.layer || 0)) {
        return -1;
      }
      return 0;
    });

    self.turtLines.forEach(function (lineObject) {
      var line = self.createSvgLine(lineObject);
      line.setAttribute('d', lineObject.points.reduce(function (prev, current, i){
        return prev + (i == 0 ? 'M ' : 'L ')
              + current.x.toFixed(2) + ' ' + current.y.toFixed(2) + ' ';
      }, '')+(lineObject.fillColor && lineObject.fillColor != 'none' ? 'z' : ''));
      self.stage.appendChild(line);
    });

    self.drawTurtle(self.turt.x, self.turt.y, self.turt.rotation);

    function forward(px) {
      self.moveTurt(
        self.turt.x + (Math.sin(self.turt.rotation*self.deg2Rad)*px),
        self.turt.y - (Math.cos(self.turt.rotation*self.deg2Rad)*px)
      );
    }
    function left(deg) {
      self.turt.rotation -= deg;
      while(self.turt.rotation < 0) {
        self.turt.rotation += 360;
      }
    }
    function right(deg) {
      self.turt.rotation += deg;
      while(self.turt.rotation > 360) {
        self.turt.rotation -= 360;
      }
    }
    function penUp() {
      self.turtLines.push(self.turtCurrentLine);
      self.turtCurrentLine = {
        points: []
        width: self.turtCurrentLine.width,
        color: self.turtCurrentLine.color,
        fillColor: self.turtCurrentLine.fillColor,
        opacity: self.turtCurrentLine.opacity,
        layer: self.turtCurrentLine.layer
      };
      self.penIsUp = true;
    }
    function penDown() {
      self.turtCurrentLine.points.push({x: self.turt.x, y: self.turt.y});
      self.penIsUp = false;
    }
    function pushColor(color) {
      self.shapeBreak();
      self.turtCurrentLine.color = color;
      self.colorStack.push(color);
    }
    function pushFillColor(color) {
      self.shapeBreak();
      self.turtCurrentLine.fillColor = color;
      self.fillColorStack.push(color);
    }
    function pushWidth(width) {
      self.shapeBreak();
      self.turtCurrentLine.width = width;
      self.widthStack.push(width);
    }
    function pushOpacity(opacity) {
      self.shapeBreak();
      self.turtCurrentLine.opacity = opacity;
      self.opacityStack.push(opacity);
    }
    function pushLayer(layer) {
      self.shapeBreak();
      self.turtCurrentLine.layer = layer;
      self.layerStack.push(layer);
    }
    function popColor() {
      self.colorStack.pop();
      self.shapeBreak();
      self.turtCurrentLine.color
        = self.colorStack.length ? self.colorStack[self.colorStack.length-1] : __turtleColor;
    }
    function popFillColor() {
      self.fillColorStack.pop();
      self.shapeBreak();
      self.turtCurrentLine.fillColor
        = self.fillColorStack.length ?
          self.fillColorStack[self.fillColorStack.length-1]
          : 'none';
    }
    function popWidth() {
      self.widthStack.pop();
      self.shapeBreak();
      self.turtCurrentLine.width
        = self.widthStack.length ?
          self.widthStack[self.widthStack.length-1]
          : 1;
    }
    function popOpacity(opacity) {
      self.opacityStack.pop();
      self.shapeBreak();
      self.turtCurrentLine.opacity
        = self.opacityStack.length ?
          self.opacityStack[self.opacityStack.length-1]
          : 1;
    }
    function popLayer(layer) {
      self.layerStack.pop();
      self.shapeBreak();
      self.turtCurrentLine.layer
        = self.layerStack.length ?
          self.layerStack[self.layerStack.length-1]
          : 0;
    }
    function home() {
      self.moveTurt(0,0);
      self.turt.rotation = 0;
    }


  };

  self.colorStack = [];
  self.fillColorStack = [];
  self.widthStack = [];
  self.opacityStack = [];
  self.layerStack = [];
  self.deg2Rad = (Math.PI*2)/360;
  self.penIsUp = false;
  self.turt = {
    x: 0,
    y: 0,
    rotation: 0
  }
  self.turtCurrentLine = { points: [{x:0, y:0}] };
  self.turtLines = [];



  self.moveTurt = function (x, y) {
    self.turt.x = x;
    self.turt.y = y;
    if(!self.penIsUp) {
      self.turtCurrentLine.points.push({x: self.turt.x, y: self.turt.y});
    }
  };

  self.clearTurt = function () {
    self.colorStack = [];
    self.fillColorStack = [];
    self.widthStack = [];
    self.opacityStack = [];
    self.layerStack = [];
    self.turt = {
      x: 0,
      y: 0,
      rotation: 0
    }
    self.turtCurrentLine = { points: [{x:0, y:0}] };
    self.turtLines = [];
  };

};

var __lineNumberOffset = 2;
function __getErrorLineNumber(ex, stackFramesToSkip) {
  var result = null;
  var stackFramesToSkip = stackFramesToSkip || 0;
  if(ex.stack) {
    var lines = ex.stack.split('\n');
    var lineToParse = null;
    var browser = 'firefox';
    if(lines.length) {
      var cappedMessage =
            ex.message.substring(0, Math.max(ex.message.length-1, 20));
      if(lines[0].indexOf(ex.name) !== -1
            && lines[0].indexOf(cappedMessage) !== -1) {
        stackFramesToSkip += 1;
        browser = 'chrome';
      }
      if(lines.length > stackFramesToSkip) {
        lineToParse = lines[stackFramesToSkip];
      }
    }
    if(lineToParse) {
      var values = lineToParse.split(':');
      var charOffset = values[values.length - 1].replace(/[^\d]/g,'');
      var lineNumber = values[values.length - 2].replace(/[^\d]/g,'');
      result = {
        charOffset: Number(charOffset),
        lineNumber: Number(lineNumber)-__lineNumberOffset,
      };
    }
  }

  return result;
}
