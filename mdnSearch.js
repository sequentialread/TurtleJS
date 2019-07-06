(function(__tjs){
  var googleAPIKey = 'AIzaSyCi7M1L69QPOjeOzqs93i6D07957gUPzy0';
  var googleMDNSearch = '004844842177012604701:qpwcasb2_dy';
  var customSearch =
    'https://www.googleapis.com/customsearch/v1?key='
      +googleAPIKey+'&cx='+googleMDNSearch;

  var searchCachePrefix = '__tjs.mdnSearch.';
  var navigationStack = [];

  __tjs.mdnSearchPopup = function (q) {

    if(q.replace(/[^a-zA-Z]/g,'') !== '') {
      var cachedUrl = localStorage[searchCachePrefix+q];
      var cachedTitle = localStorage[searchCachePrefix+'.title.'+q];
      if(cachedUrl) {
        openSearchResultModal(cachedUrl, cachedTitle, q);
      } else {
        xhrGET(customSearch+'&q='+q).then(function(response){
          var googleSearchResults = JSON.parse(response.responseText);
          if(googleSearchResults.items && googleSearchResults.items[0]) {
            var url = googleSearchResults.items[0].link;
            var pageTitle = googleSearchResults.items[0].title;
            localStorage[searchCachePrefix+q] = url;
            localStorage[searchCachePrefix+'.title.'+q] = pageTitle;
            openSearchResultModal(url, pageTitle, q);
          }
        },
        function(response) {
          console.error(response);
        });
      }
    }
  }

  function navigate (url) {
    if(url.indexOf("http") != 0) {
      url = `https://developer.mozilla.org${url}`
    }
    document.getElementById('__mdnIframeBackButton').disabled = false;
    document.getElementById('__mdnIframeBackButton').onclick = () => {
      navigationStack.pop()
      openSearchResultModal(navigationStack[navigationStack.length-1], null, null, true);
      document.getElementById('__mdnIframeBackButton').disabled = navigationStack.length <= 1;
    }

    openSearchResultModal(url, null, null)
  }

  function openSearchResultModal(url, pageTitle, searchText, isBackButton) {

    var iframe = document.getElementById('__mdnIframe');
    var container = document.getElementById('__mdnIframeContainer');
    container.style.display = 'block';

    if(!isBackButton) {
      navigationStack.push(url);
    }
    xhrGET(url).then(
      function(response) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.__tjsNavigate = navigate;
        iframe.contentWindow.document.write(proxify(response.responseText));
        iframe.contentWindow.document.close();
      },
      function(response) {
        console.error(response);
      }
    );

    document.getElementById('__mdnIframeUrlBar').value = url;
    if(pageTitle != null && pageTitle != '' && searchText != null && searchText != '') {
      var title = `Top result for google search: \"site:developer.mozilla.org ${searchText}\": ${pageTitle} `;
      document.getElementById('__mdnIframeTitle').innerText = title;
    }
    
  }

  function proxify(htmlText) {
    const INITIAL_STATE = 0;
    const TAG_STATE = 1;
    const PROPERTY_NAME_STATE = 2;
    const PROPERTY_VALUE_STATE = 3;
    var state = INITIAL_STATE;
    var insideString = "";
    var previousCharacterWasEscapeCharacter = false;
    var tag = "";
    var propertyName = "";
    var propertyValue = "";
    var outputHtmlText = "";
    for(var i = 0; i < htmlText.length; i++) {
      var character = htmlText[i];
      if(state == INITIAL_STATE) {
        if(character == "<") {
          state = TAG_STATE;
        }
        outputHtmlText += character;
      } else if(state == TAG_STATE) {
        if(character == ">") {
          tag = "";
          state = INITIAL_STATE;
        } else if(character != " " && character != "\t") {
          tag += character;
        } else if(tag.length != 0) {
          state = PROPERTY_NAME_STATE;
        }
        outputHtmlText += character;
      } else if(state == PROPERTY_NAME_STATE) {
        if(character != " " && character != "\t" && character != "=") {
          propertyName += character;
        }
        if(character == "=") {
          state = PROPERTY_VALUE_STATE;
        }
        if(character == ">") {
          tag = "";
          propertyName = "";
          state = INITIAL_STATE;
        }
        if((character == " " || character == "\t") && propertyName.length > 0) {
          propertyName = "";
        }
        outputHtmlText += character;
      } else if(state == PROPERTY_VALUE_STATE) {
        if(insideString == "") {
          if(character == "'" || character == "\"") {
            insideString = character;
          }
          outputHtmlText += character;
        } else {
          if(character == "\\") {
            previousCharacterWasEscapeCharacter = true;
            propertyValue += character;
          } else if(character == insideString && !previousCharacterWasEscapeCharacter) {
            if(tag == "a" && propertyName == "href") {
              outputHtmlText += `#${propertyValue}${insideString} onclick="__tjsNavigate('${propertyValue}')"`;
            } else {
              outputHtmlText += `${propertyValue}${insideString}`;
            }
            insideString = "";
            propertyValue = "";
            propertyName = "";
            state = PROPERTY_NAME_STATE;
          } else {
            propertyValue += character;
          }
        }
       
      }
    }

    return outputHtmlText;
  }

  function xhrGET (url) {
    return new Promise(function (resolve, reject){
      var request = new XMLHttpRequest();
      request.addEventListener('load', resolveFromRequest);
      request.addEventListener("error", rejectFromRequest);
      request.addEventListener("abort", rejectFromRequest);
      request.open("get", url, true);
      request.send();

      function resolveFromRequest ()
      {
        resolve({
          status: this.status,
          responseText: this.responseText
        });
      }
      function rejectFromRequest () {
        reject({
          status: this.status,
          statusText: this.statusText
        });
      }
    });
  }


})(__tjs);
