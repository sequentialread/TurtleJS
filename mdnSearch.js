(function(__tjs){
  var googleAPIKey = 'AIzaSyCi7M1L69QPOjeOzqs93i6D07957gUPzy0';
  var googleMDNSearch = '004844842177012604701:qpwcasb2_dy';
  var customSearch =
    'https://www.googleapis.com/customsearch/v1?key='
      +googleAPIKey+'&cx='+googleMDNSearch;

  var searchCachePrefix = '__tjs.mdnSearch.';

  __tjs.mdnSearchPopup = function (q) {

    if(q.replace(/[^a-zA-Z]/g,'') !== '') {
      var cachedUrl = localStorage[searchCachePrefix+q];
      if(cachedUrl) {
        openTabToSearchResult(cachedUrl);
      } else {
        xhrGET(customSearch+'&q='+q).then(function(response){
          var googleSearchResults = JSON.parse(response.responseText);
          if(googleSearchResults.items && googleSearchResults.items[0]) {
            var url = googleSearchResults.items[0].link;
            localStorage[searchCachePrefix+q] = url;
            openTabToSearchResult(url);
          }
        },
        function(response) {
          console.error(response);
        });
      }
    }
  }

  function openTabToSearchResult(url) {
    var tabOpener = document.createElement('a');
    tabOpener.setAttribute('href', url);
    tabOpener.setAttribute('target', '_blank');
    tabOpener.click();
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
