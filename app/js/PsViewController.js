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

  var today = new Date();

  this.path = "";
  this.baseSkuName = "";
  this.startSkuNum = document.getElementById('newProjectConfigStartSKU').value;
  this.photoExt = document.getElementById('newProjectConfigPhotoFileExt').value;
  this.photoConvExt = document.getElementById('newProjectConfigPhotoConvertedFileExt').value;;



  this.itemListUiState = {
    pendingChanges: false,
    activeSkuNum: -1,
    activeFieldName: ""
  };

  this.itemHtml = fs.readFileSync("./item.html").toString();

  // Get Element where the items will be listed
  this.itemDivBody = document.getElementById('itemDivBody');

  // Send List Events to a common event handler
  this.itemDivBody.addEventListener('click', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('input', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('change', event => function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('keyup', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

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

  // Register Event Handler for Photo File Extension
  document.getElementById('newProjectConfigPhotoFileExt').addEventListener('input', function(event) {
    let element = document.getElementById(event.target.id);
    this.photoExt = element.value;
    this.tryEnableCreateButton();
  }.bind(this));

  // Register Event Handler for Photo Converted File Extension Change
  document.getElementById('newProjectConfigPhotoConvertedFileExt').addEventListener('input', function(event) {
    let element = document.getElementById(event.target.id);
    this.photoConvExt = element.value;
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
// Event Handler for List of Items UI - clicks, inputs, changes, keyups
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.listUiEventHandler = function() {
  const type = event.type;
  const targetId = event.target.id;

  if (targetId.length == 0) {
    return;
  }

  const splitStr = targetId.split('_');
  const skuNum = splitStr[splitStr.length-1];
  const fieldName = splitStr[0];

  // Copy state to see if anything changed..
  const previousState = Object.assign({}, this.itemListUiState);

  // update current state based on current event
  this.itemListUiState.activeSkuNum = skuNum;
  this.itemListUiState.activeFieldName = fieldName;

  if (previousState.activeSkuNum != this.itemListUiState.activeSkuNum) {
     this.activeItem = this.dataModel.getItemBySkuNum(skuNum);
  }

  switch (type) {
    case 'click':
      this.dataModel.saveData();
      break;
    case 'input':
    case 'change':
      this.activeItem[fieldName] = event.srcElement.value;
      //console.log(event.srcElement.value);
      //console.log(this.activeItem);

      break;
    case 'keyup':
      if (event.key == "Tab") {
        this.dataModel.saveData();
      }
      break;
    default:
  }
}

/////////////////////////////////////////////////////////////////////////////
// Try to Enable Create Button
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.tryEnableCreateButton = function() {
  if (this.baseSkuName != "" && this.path != "" && this.startSkuNum != "" && this.photoExt != "" && this.photoConvExt != "") {
    document.getElementById('createProjectButton').removeAttribute('disabled');
  }
  else {
    document.getElementById('createProjectButton').setAttribute('disabled', "");
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

  // TODO: Should we save out the database at this point?

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
  let filePath = this.path + '/' + this.baseSkuName + '-' + this.startSkuNum + '.json';

  // TODO: what should we do if there is an existing data model object?
  //       Should the data model object serialize itself before starting a new
  //       initNewDb? Probably...

  this.dataModel.initNewDb(filePath, this.baseSkuName, this.startSkuNum);

  this.itemDivBody.innerHTML = "";
  document.getElementById("listDivMain").hidden = false;
  document.getElementById("itemMainCard").hidden = true;
  this.loadItems();

  fs.watch(this.path, function(event, trigger) {
    console.log("new file: " + trigger);
  }.bind(this));
}

/////////////////////////////////////////////////////////////////////////////
// Add New Item
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.addNewItem = function(event) {
  let nextSku = this.dataModel.getNextSku();
  let nextSkuNum = this.dataModel.getNextSkuNumber();

  // Setup UI with new item to be added
  let htmlString = this.itemHtml.toString().replace(/__SKU__/gi, nextSku);
  let bar = (this.itemDivBody.innerHTML == "") ? "" : "<hr>" ;

  this.itemDivBody.insertAdjacentHTML('afterbegin', htmlString.replace(/__NUM__/gi, nextSkuNum) + bar);

  //this.itemDivBody.innerHTML = htmlString.replace(/__NUM__/gi, nextSkuNum) + bar + this.itemDivBody.innerHTML;
  document.getElementById("itemMainCard").hidden = false;

  // draw any feathers on the new gui element..
  feather.replace();

  this.dataModel.addNewItem( {
          brand:                '',
          qty:                  1,
          storageLocation:      '',
          sku:                  '',
          barcode:              '',
          condition:            'New',
          conditionDescription: '',
          ebayCheckbox:         true,
          amazonCheckbox:       true,
          notes:                '',
          category:             '',
          asin:                 '',
          ebayPrice:            0.00,
          amazonPrice:          0.00,
          photoList:            []
  });
}

/////////////////////////////////////////////////////////////////////////////
// Load Items
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.loadItems = function() {
  this.itemDivBody.innerHTML == "";

  if (this.dataModel.db.data.ItemList.length > 0) {
    document.getElementById("itemMainCard").hidden = false;
  }

  for (let i=0 ; i<this.dataModel.db.data.ItemList.length ; i++) {
    let item = this.dataModel.getItemByIdx(i);
    let sku = item.sku
    let htmlString = this.itemHtml.toString().replace(/__SKU__/gi, sku);
    let bar = (this.itemDivBody.innerHTML == "") ? "" : "<hr>" ;
    let splitStr = sku.split('-');
    let skuNum = splitStr[splitStr.length-1];

    this.itemDivBody.insertAdjacentHTML('beforeend', bar + htmlString.replace(/__NUM__/gi, skuNum));

    for (const [key, value] of Object.entries(item)) {
      let webKey = key + '_' + skuNum;
      //console.log("webKey: " + webKey + ' :: ' + value);
      if (key != "photoList") {
        document.getElementById(webKey).value = value;
      }
    }
  }

  // draw any feathers on the new gui element..
  feather.replace();

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
