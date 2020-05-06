//---------------------------------------------------------------------------------
// Copyright (c) 2020 Chris Borrelli
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
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

  this.dataModel = new PsDataModel('./assets/schema/itemdb.json');
  let hlJson = new JsonDb('./assets/schema/headerLookup.json');

  this.headerLookup = hlJson.data;
  this.path = "";
  this.baseSkuName = "";
  this.startSkuNum = "";
  this.photoExt = "";
  this.photoConvExt = "";

  // Disable Export and Close buttons
  document.getElementById('button-close').setAttribute('disabled', "");
  document.getElementById('button-export').setAttribute('disabled', "");

  // Register Event Handler for New Button Click Events
  this.newButton = document.getElementById('button-new');
  this.newProjVewController = new PsNewProjViewController(function() {
    this.path = this.newProjVewController.path;
    this.baseSkuName = this.newProjVewController.baseSkuName;
    this.startSkuNum = this.newProjVewController.startSkuNum;
    this.photoExt = this.newProjVewController.photoExt;
    this.photoConvExt = this.newProjVewController.photoConvExt;
    this.createNewProject();
  }.bind(this));

  // Register Event Handler for Open Button Click Events
  this.openFileInput = document.getElementById('openProjectFile');
  this.openFileInput.style.display = "none";

  this.openButton = document.getElementById('button-open');
  this.openButton.addEventListener('click', event => {
    this.openFileInput.click(); // call click event on file input element
  });

  // Register Event Handler for Open Project File Selection Events
  this.openFileInput.addEventListener('change', event => {
    let filePath = event.target.value;
    this.path = nodePath.dirname(filePath);
    this.createNewProject(filePath);
  });

  // Register Event Handler for Export Button Click Events
  this.newButton = document.getElementById('button-export');
  this.newButton.addEventListener('click', event => {
    if (this.dataModel.isOpen()) {
      let sep = this.dataModel.sep;
      let filePath = this.path + nodePath.sep + this.baseSkuName + sep + this.startSkuNum + '.csv';
      fs.writeFileSync(filePath, Papa.unparse(this.dataModel.db.data.ItemList, {
      quotes: true, delimiter: ",", header: true, transformHeader: function(header) {
          return this.headerLookup[header];
      }.bind(this)
      }));
    }
    else {
      window.alert("No project open to export.");
    }
  });

  // Register Event Handler for Add New Item Button
  document.getElementById('addNewItemButton').addEventListener("click", function(event) {
    this.itemListVC.addNewItem(event);
  }.bind(this));

  // Register Event Handler for Close Button
  document.getElementById('button-close').addEventListener("click", function(event) {
    if(this.dataModel.isOpen()) {
      this.dataModel.saveData();
      this.dataModel.close();
      this.path = "";
      this.baseSkuName = "";
      this.startSkuNum = "";
      this.photoExt = "";
      this.photoConvExt = "";

      // Close down item list object...
      this.itemListVC.close();
      this.itemListVC = undefined;

      document.getElementById("listDivMain").hidden = true;
      document.getElementById("itemMainCard").hidden = true;
      document.getElementById('button-close').setAttribute('disabled', "");
      document.getElementById('button-export').setAttribute('disabled', "");
      this.openFileInput.value="";
    }
    else {
      window.alert("No project is open.");
    }
  }.bind(this));
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
// Create or Open New Project
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.createNewProject = function(existingFile) {
  let sep = this.dataModel.sep;

  let filePath = existingFile;
  
  if (!existingFile) {
    filePath = this.path + nodePath.sep + this.baseSkuName + sep + this.startSkuNum + '.json';
  }

  // TODO: what should we do if there is an existing data model object?
  //       Should the data model object serialize itself before starting a new
  //       initNewDb? Probably...

  this.dataModel.initDb(filePath, this.baseSkuName, this.startSkuNum, this.photoExt, this.photoConvExt);
  
  // Grab data from Config if they are null at this level (like when opening existing data base)
  // TODO: should we just reach into the datamodel instead of storing these twice???
  if (!this.baseSkuName) {
    this.baseSkuName = this.dataModel.db.data.Config.baseSkuName;
    this.startSkuNum = this.dataModel.db.data.Config.startSkuNum;
    this.photoExt = this.dataModel.db.data.Config.photoExt;
    this.photoConvExt = this.dataModel.db.data.Config.photoConvExt;
  }

  document.getElementById("listDivMain").hidden = false;
  document.getElementById("itemMainCard").hidden = true;
  document.getElementById('button-close').removeAttribute('disabled');
  document.getElementById('button-export').removeAttribute('disabled');

  // Create New Item List View Controller
  this.itemListVC = new PsItemListViewController(this.dataModel, 'itemDivBody',
                                                 './item.html', this.path);
}

/////////////////////////////////////////////////////////////////////////////
// Main Code Entry Point
/////////////////////////////////////////////////////////////////////////////

var PsApp = null;
var PsVersion = "0.3.2";

// Place all feather icons...
feather.replace();

var gui = require('nw.gui');
var win = gui.Window.get();

if (process.versions['nw-flavor'] == 'sdk') {
  win.showDevTools();
  console.log("Using nw.js SDK flavor");
}

window.addEventListener('load', (event) => {
  console.log("Ps Version " + PsVersion);
  PsApp = new PsViewController();
  //PsApp.getResults();
});
