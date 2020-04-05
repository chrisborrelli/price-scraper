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

  this.path = null;
  this.baseSkuName = null;
  this.startSkuNum = document.getElementById('newProjectConfigStartSKU').value;

  this.itemHtml = fs.readFileSync("./item.html").toString();
  //var itemHtml = buffer.toString().replace(/__NUM__/gi, 'SKU_1010');
  //console.log(this.itemHtml);

  // Get Element where the items will be listed
  this.itemDivBody = document.getElementById('itemDivBody');

  // Register Event Handler for New Button Click Events
  this.newButton = document.getElementById('button-new');
  this.newButton.addEventListener('click', event => {
    this.newButtonClick(event);
  });

  // Register Event Handler for Directory Chooser Event
  this.dirChooser = document.getElementById('dirChooser');
  this.dirChooser.addEventListener("change", function(event) {
    this.dirChanged(event);
  }.bind(this));

  // Register Event Handler for Base Name Change
  document.getElementById('newProjectConfigBaseName').addEventListener('input', function(event) {
    let element = document.getElementById(event.target.id);
    this.baseSkuName = element.value;
    this.tryEnableCreateButton();
  }.bind(this));

  // Register Event Handler for SKU Number Change
  document.getElementById('newProjectConfigStartSKU').addEventListener('input', function(event) {
    let element = document.getElementById(event.target.id);
    this.startSkuNum = element.value;
    this.tryEnableCreateButton();
  }.bind(this));

  // Register Event Handler for New Project Create Button
  this.dirChooser = document.getElementById('createProjectButton');
  this.dirChooser.addEventListener("click", function(event) {
    this.createNewProject(event);
  }.bind(this));

  // Register Event Handler for Add New Item Button
  document.getElementById('addNewItemButton').addEventListener("click", function(event) {
    this.addNewItem(event);
  }.bind(this));

}

/////////////////////////////////////////////////////////////////////////////
// Try to Enable Create Button
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.tryEnableCreateButton = function() {
  if (this.baseSkuName != null && this.path != null && this.startSkuNum != null) {
    document.getElementById('createProjectButton').removeAttribute('disabled');
  }
}

/////////////////////////////////////////////////////////////////////////////
// getResults
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.getResults = function() {
  // var apiVars = [ this.secutiryAppname, this.operationName, this.serviceVersion,
  //                 this.responseDataFormat, this.restPayload,
  //                 this.keywords, this.gloabalId, this.siteId
  //               ];
  //
  // var urlList = this.siteUrl + apiVars.join('&');
  // var ajax = new XMLHttpRequest();
  // ajax.open('GET', urlList, true);
  // ajax.withCredentials = true;
  // ajax.onload = function() {
  //     var data = JSON.parse(ajax.response);
  //     console.log(data);
  //     console.log(ajax);
  // };
  // ajax.send();
}

/////////////////////////////////////////////////////////////////////////////
// newButtonClick Event Handler
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.newButtonClick = function(event) {
  //console.log(event);
  //console.log(this.newButton);
  //this.newButton.innerHTML = `New: ${event.detail}`;

  // Open new window to setup new project

  //nw.Window.open("newProj.html", {focus: true}, function(new_win) {
  //  console.log("Created new window.");
  //});


}

/////////////////////////////////////////////////////////////////////////////
// New Project - Directory Changed Event Handler
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.dirChanged = function(event) {
  if (event.target.files.length > 0) {
    let path = event.target.files[0].path;
    let dirChooserLabel = document.getElementById('dirChooserLabel');
    this.path = path;
    dirChooserLabel.innerHTML = path + '/';
    this.tryEnableCreateButton();
  }
}

/////////////////////////////////////////////////////////////////////////////
// New Project - Create New Project Button Click Event Handler
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.createNewProject = function(event) {
  let baseSkuName = this.baseSkuName;
  let startSkuNum = this.startSkuNum;
  let path = this.path + '/' + baseSkuName + '-' + startSkuNum + '.json';
  this.currentFile = path;
  this.currentSkuNum = startSkuNum;

  // Create new data base object
  this.db = new JsonDb(path);

  // Insert config object into data base
  if (!this.db.data.hasOwnProperty('config')) {
    this.db.data.config = {
      baseSkuName: baseSkuName,
      startSkuNum: startSkuNum,
      currentSkuNum: startSkuNum
    };
  }
  this.db.write();

  // Setup UI to add first item
  // let itemIdText = baseSkuName + '-' + startSkuNum;
  // let htmlString = this.itemHtml.toString().replace(/__SKU__/gi, startSkuNum);
  // this.itemDivBody.innerHTML = htmlString.replace(/__NUM__/gi, itemIdText);
  document.getElementById("listDivMain").hidden = false;

}

/////////////////////////////////////////////////////////////////////////////
// Add New Item
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.addNewItem = function(event) {
  let baseSkuName = this.db.data.config.baseSkuName;
  let currentSkuNum = this.db.data.config.currentSkuNum;
  let file = this.currentFile;
  let sku = baseSkuName + currentSkuNum;

  // Setup UI to add first item
  let itemIdText = baseSkuName + '-' + currentSkuNum;
  let htmlString = this.itemHtml.toString().replace(/__SKU__/gi, currentSkuNum);
  this.itemDivBody.innerHTML += htmlString.replace(/__NUM__/gi, itemIdText);
  document.getElementById("itemMainCard").hidden = false;

  this.db.data.config.currentSkuNum = Number(currentSkuNum) + 1;

  if (!this.db.data.hasOwnProperty('items')) {
    this.db.data.items = {};
  }
  this.db.data.items[sku] = {
    brand:                '',
    qty:                  '',
    storageLocation:      '',
    sku:                  sku,
    barcode:              '',
    condition:            '',
    conditionDescription: '',
    ebayCheckbox:         '',
    amazonCheckbox:       '',
    notes:                '',
    category:             '',
    asin:                 '',
    ebayPrice:            '',
    amazonPrice:          ''
  };

  this.db.write();

}



/////////////////////////////////////////////////////////////////////////////
// Main Code Entry Point
/////////////////////////////////////////////////////////////////////////////

var PsApp = null;

// Place all feather icons...
feather.replace();

var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();

// var os = require('os');
// console.log('You are running on ', os.platform());

window.addEventListener('load', (event) => {

  console.log("Page Loaded, received load event");

  PsApp = new PsViewController();

  PsApp.getResults();

});
