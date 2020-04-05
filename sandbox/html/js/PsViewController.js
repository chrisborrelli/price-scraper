//---------------------------------------------------------------------------------
// Copyright (c) 2020 Chris Borrelli
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//---------------------------------------------------------------------------------

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
  };
  ajax.send();
}

/////////////////////////////////////////////////////////////////////////////
// Main Code Entry Point
/////////////////////////////////////////////////////////////////////////////

var PsApp = null;

// Place all feather icons...
feather.replace();

console.log("Hellow World!");

window.addEventListener('load', (event) => {

  console.log("Page Loaded, received load event");

  PsApp = new PsViewController();

  PsApp.getResults();

});
