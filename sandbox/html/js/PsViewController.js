//

var PsViewController = function() {
  this.siteUrl            = 'https://svcs.ebay.com/services/search/FindingService/v1?';
  this.secutiryAppname    = '';
  this.operationName      = 'OPERATION-NAME=findCompletedItems';
  this.operationName      = 'OPERATION-NAME=findItemsByKeywords';

  this.serviceVersion     = 'SERVICE-VERSION=1.0.0';
  this.responseDataFormat = 'RESPONSE-DATA-FORMAT=JSON';
  this.restPayload        = 'REST-PAYLOAD';
  this.keywords           = 'keywords=Purolator';
  this.gloabalId          = 'GLOBAL-ID=EBAY-US';
  this.siteId             = 'siteid=0';

  var today = new Date();

  this.input = [
    {'Manufacturer' : 'Purolator', 'Part Number' : 'F44658'},
    {'Manufacturer' : 'Purolator', 'Part Number' : 'F60273'},
    {'Manufacturer' : 'Purolator', 'Part Number' : 'F60043'}
  ];
}

PsViewController.prototype.getResults = function() {
  var apiVars = [ this.secutiryAppname, this.operationName, this.serviceVersion,
                  this.responseDataFormat, this.restPayload,
                  this.keywords, this.gloabalId, this.siteId
                ];

  var urlList = this.siteUrl + apiVars.join('&');
  var ajax = new XMLHttpRequest();
  ajax.open('GET', urlList, true);
  ajax.withCredentials = true;
  ajax.onload = function() {
      var data = JSON.parse(ajax.response);
      console.log(data);
      console.log(ajax);
      //console.log(ajax.responseText);
  };
  ajax.send();
}

/////////////////////////////////////////////////////////////////////////////
// Main Code Entry Point
/////////////////////////////////////////////////////////////////////////////

var PsApp = null;

console.log("Hellow World!");

window.addEventListener('load', (event) => {

  console.log("Page Loaded, received load event");

  PsApp = new PsViewController();

  PsApp.getResults();

});
