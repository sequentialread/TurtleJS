(function(__tjs){

  __tjs.allAceEditors = [];
  var isMac = global.navigator.appVersion.indexOf("Mac")!=-1;
  var commandSymbolHTML = isMac ? '&#8984;' : 'Ctrl';
  var mdnSearchShortcutKey = ';';
  var runShortcutKey = 'R';
  var maxLogsCount = 100;

  shortcut.add(
    (isMac ? 'Meta' : 'Ctrl')+'+'+mdnSearchShortcutKey,
    function(event) {
      var allFocused = __tjs.allAceEditors.filter(function(ace){
        return ace.$isFocused;
      });
      if(allFocused.length) {
        __tjs.mdnSearchPopup(allFocused[0].getSelectedText());
      } else {
        __tjs.mdnSearchPopup(window.getSelection().toString());
      }
      event.preventDefault();
    },
    {
      'type':'keydown',
      'propagate':true,
      'target':document
    }
  );

  var storedFileKey = '__tjs.storedFile';
  var storedFile = localStorage[storedFileKey];
  global.setInterval(function(){
    localStorage[storedFileKey] = __tjs.editor.getValue();
  }, 3000);

  __tjs.editor = ace.edit("__editor");
  __tjs.editor.setTheme("ace/theme/tomorrow_night");
  var editSession = __tjs.editor.getSession();
  editSession.setMode("ace/mode/javascript");
  editSession.setTabSize(2);

  if(storedFile) {
    //__tjs.editor.$blockScrolling = Infinity;
    __tjs.editor.setValue(storedFile, -1);
  }
  __tjs.editor.focus();
  __tjs.allAceEditors.push(__tjs.editor);

  for(var i = 1; i <= 3; i++) {
    var helpContentAce = ace.edit("__helpContent"+i);
    helpContentAce.setTheme("ace/theme/tomorrow_night");
    helpContentAce.getSession().setMode("ace/mode/javascript");
    helpContentAce.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
    });
    helpContentAce.renderer.setShowGutter(false);
    helpContentAce.renderer.$cursorLayer.element.style.opacity=0;
    helpContentAce.textInput.getElement().tabIndex=-1;
    helpContentAce.commands.commmandKeyBinding={};
    __tjs.allAceEditors.push(helpContentAce);
  }

  var runButton = global.document.getElementById('__runButton');
  if(runButton){
    runButton.innerHTML = "Run ( "+commandSymbolHTML+" "+runShortcutKey+" )";
    runButton.onclick = function () {
      runTurtleJS();
    };
  }
  var hotkeyHelp = global.document.getElementById('__hotkeyHelp');
  if(hotkeyHelp){
    hotkeyHelp.innerHTML =
      "ProTip: Quick search Mozilla Developer Network (MDN) for the "
    + "selected text with  "+commandSymbolHTML+" + "+mdnSearchShortcutKey+" ";
  }

  global.document.getElementById('__helpButton').onclick = function () {
    global.document.getElementById('__helpContainer').style.display = 'block';
  };

  global.document.getElementById('__closeHelpButton').onclick = function () {
    global.document.getElementById('__helpContainer').style.display = 'none';
  };

  global.document.getElementById('__closeMdnButton').onclick = function () {
    global.document.getElementById('__mdnIframeContainer').style.display = 'none';
  };

  global.document.getElementById('__consoleBar').onclick = function () {
    global.document.getElementById('__console').style.display = 'block';
  };

  global.document.getElementById('__closeConsoleButton').onclick = function () {
    global.document.getElementById('__console').style.display = 'none';
  };

  var KEYCODE_ESCAPE = 27;
  window.addEventListener("keydown", (event) => {
    if(event.keyCode == KEYCODE_ESCAPE) {
      if(document.getElementById('__mdnIframeContainer').style.display == 'block') {
        document.getElementById('__mdnIframeContainer').style.display = 'none';
      } else if(document.getElementById('__helpContainer').style.display == 'block') {
        document.getElementById('__helpContainer').style.display = 'none';
      }
    }
  }, false);

  shortcut.add(
    (isMac ? 'Meta' : 'Ctrl')+'+'+runShortcutKey,
    function(event) {
      event.preventDefault();
      runTurtleJS();
    },
    {
      'type':'keydown',
      'propagate':true,
      'target':document
    }
  );


  __tjs.addLog = function (logObject) {
    var container = global.document.getElementById('__consoleContainer');
    if(__tjs.logs.length >= maxLogsCount) {
      container.removeChild(container.children[0]);
      __tjs.logs.unshift();
    }

    __tjs.logs.push(logObject);
    var newLogElement = global.document.createElement('div');
    newLogElement.setAttribute('class', 'logElement ' + logObject.type);
    newLogElement.innerHTML = logObject.message;
    newLogElement.ondblclick = gotoLine.bind(this, logObject);
    container.appendChild(newLogElement);

    setBar(logObject);
    pushRecentLog(logObject);
    if(logObject.type === 'error') {
      gotoLine(logObject);
    }
  }

  var setAnnotationsAfterDebounce = debounce(function() {
    __tjs.editor.getSession().setAnnotations(__tjs.recentLogs.map(function(log){
        return {
          row: log.lineNumber-1,
          column: log.charOffset,
          text: log.message,
          type: log.type
        };
    }));
  }, 250);

  var clearNewAnnotationsAfterDebounce = debounce(function(){
    __tjs.recentLogs = [];
  }, 2000);

  __tjs.recentLogs = [];
  function pushRecentLog(logObject) {
    __tjs.recentLogs.push(logObject);
    setAnnotationsAfterDebounce();
    clearNewAnnotationsAfterDebounce();
  }

  function gotoLine(logObject) {
    if(logObject.lineNumber) {
      __tjs.editor.scrollToLine(logObject.lineNumber, true, true, function () {});
      __tjs.editor.gotoLine(logObject.lineNumber, logObject.charOffset, true);
    }
  }

  function setBar(logObject) {
    var bar = global.document.getElementById('__consoleBar');
    bar.innerHTML = logObject ? logObject.message : '';
    bar.setAttribute('class',
      logObject ? 'logElement ' + logObject.type : '');
  }

  function runTurtleJS () {
    global.document.getElementById('__loadingScreen').style.display = 'block';
    setTimeout(function(){
      __tjs.runTurtleJS();
      global.document.getElementById('__loadingScreen').style.display = 'none';
    },50);
  }

  global.document.getElementById('__clearLogsButton').onclick = function () {
    setBar(null);
    var container = global.document.getElementById('__consoleContainer');
    container.innerHTML = '';
    __tjs.logs = [];
  };

})(__tjs);
