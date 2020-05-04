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

  this.itemListUiState = {
    pendingChanges: false,
    activeSkuNum: -1,
    activeFieldName: ""
  };
  
  this.itemHtml = fs.readFileSync("./item.html").toString();

  // Get Element where the items will be listed
  this.itemDivBody = document.getElementById('itemDivBody');
  
  // Disable Export and Close buttons
  document.getElementById('button-close').setAttribute('disabled', "");
  document.getElementById('button-export').setAttribute('disabled', "");

  // Send List Events to a common event handler
  this.itemDivBody.addEventListener('click', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('input', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('change', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

  this.itemDivBody.addEventListener('keyup', function(event) {
    this.listUiEventHandler(event);
  }.bind(this));

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
    this.addNewItem(event);
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

      this.itemListUiState = {
        pendingChanges: false,
        activeSkuNum: -1,
        activeFieldName: ""
      };
      this.itemDivBody.innerHTML = "";
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
// Event Handler for List of Items UI - clicks, inputs, changes, keyups
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.listUiEventHandler = function(event) {
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

    // Setup background colors of previous and new active item
    let itemDivName = 'itemDiv_' + skuNum;
    let prevItemDivName = 'itemDiv_' + previousState.activeSkuNum;
    if (previousState.activeSkuNum >= 0) {
      document.getElementById(prevItemDivName).style['background-color'] = '';
    }
    document.getElementById(itemDivName).style['background-color'] = 'lightyellow';
  }

  switch (type) {
    case 'click':
      this.dataModel.saveData();
      break;
    case 'input':
    case 'change':
      // handle checkbox differently because the value field is not an indicator of checked/unchecked
      if (event.srcElement.type == "checkbox") {
        this.activeItem[fieldName] = event.srcElement.checked;
      }
      else {
        this.activeItem[fieldName] = event.srcElement.value;
      }
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
// Create New Project
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

  this.itemDivBody.innerHTML = "";
  document.getElementById("listDivMain").hidden = false;
  document.getElementById("itemMainCard").hidden = true;
  document.getElementById('button-close').removeAttribute('disabled');
  document.getElementById('button-export').removeAttribute('disabled');
  this.loadItems();

  // TODO: refactor and move this callback to a memnber function...
  fs.watch(this.path, function(eventType, fn) {
    if (eventType == 'rename' && fn.split('.').pop().toLowerCase() == this.photoExt.toLowerCase()) {
      
      //this.photoConvExt
      if (this.activeItem) {

        // Convert file extension for adding or deleting the file
        let newFileName = fn.split('.');
        newFileName.pop();
        newFileName = newFileName.join('') + '.' + this.photoConvExt;

        // check if adding or deleting a file
        let path = this.path + nodePath.sep + fn;
        if (fs.existsSync(path)) {
          if (this.activeItem.photoList.indexOf(newFileName) == -1) {
            this.activeItem.photoList.push(newFileName);
          }
        }
        else {
          let idxDelete = this.activeItem.photoList.indexOf(newFileName);
          if (idxDelete != -1) {
            this.activeItem.photoList.splice(idxDelete,1);
          }
        }
        this.dataModel.saveData();
        this.generatePhotoList(this.activeItem.photoList, "photoList_" + this.itemListUiState.activeSkuNum);
      }
    }
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
          title:                '',
          brand:                '',
          qty:                  1,
          storageLocation:      '',
          sku:                  '',
          barcode:              '',
          condition:            'New',
          conditionDescription: '',
          ebayCheckbox:         false,
          amazonCheckbox:       false,
          notes:                '',
          category:             '',
          asin:                 '',
          ebayPrice:            0.00,
          amazonPrice:          0.00,
          photoList:            []
  });

  // Reset Focus to new item's title field
  let newTitleId = "title_" + nextSkuNum;
  document.getElementById(newTitleId).focus();
  document.getElementById(newTitleId).click();
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

      if (document.getElementById(webKey).type == 'checkbox') {
        document.getElementById(webKey).checked = value;
      }
      else if (key != "photoList") {
        document.getElementById(webKey).value = value;
      }
      else {
        this.generatePhotoList(value, webKey);
      }
    }
  }

  // draw any feathers on the new gui element..
  feather.replace();

}

/////////////////////////////////////////////////////////////////////////////
// generatePhotoList
/////////////////////////////////////////////////////////////////////////////
PsViewController.prototype.generatePhotoList = function(pList, id) {
  let photoListDiv = document.getElementById(id);
 
  // Clear the list (regen whole list from scratch)
  while (photoListDiv.firstChild) {
    photoListDiv.removeChild(photoListDiv.firstChild);
  }
  photoListDiv.insertAdjacentHTML('beforeend', '<ul>');
  for (let p=0 ; p<pList.length ; p++) {
    photoListDiv.insertAdjacentHTML('beforeend', '<li>' + pList[p] + '</li>');
  }
  photoListDiv.insertAdjacentHTML('beforeend', '</ul>');
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
