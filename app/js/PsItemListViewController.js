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

var PsItemListViewController = function(dataModel, itemDivBody, htmlFileName, watchDir) {

  // Data Model Object
  this.dataModel = dataModel;
  
  // HTML Template for Item
  this.itemHtml = fs.readFileSync(htmlFileName).toString();

  this.path = watchDir;
  this.activeItem = undefined;
  
  // DIV Element where the items will be listed; Clear the contents
  this.itemDivBody = document.getElementById(itemDivBody);
  this.itemDivBody.innerHTML = "";
  
  // separator between field keys and sku number
  this.sep = '_';

  // Keep track of Item List UI state
  this.itemListUiState = {
    pendingChanges: false,
    activeSkuNum: -1,
    activeFieldName: ""
  };

  this.loadItems();
  document.getElementById("listDivMain").hidden = false;
  
  this.registerEventHandlers();
  
  // Reset Focus to new item's title field
  if (this.dataModel.db.data.ItemList.length) {
    this.setFocus(this.dataModel.db.data.ItemList[0].sku.split('-').pop(), "title");
  }
}

/////////////////////////////////////////////////////////////////////////////
// Register Event Handlers
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.registerEventHandlers = function() {
  // Send List Events to a common event handler
  this.ehref = this.listUiEventHandler.bind(this);

  this.itemDivBody.addEventListener('click', this.ehref, false);
  this.itemDivBody.addEventListener('input', this.ehref, false);
  this.itemDivBody.addEventListener('change', this.ehref, false);
  this.itemDivBody.addEventListener('keyup', this.ehref, false);
  this.ehfswatch = fs.watch(this.path, function(eventType, fn) {
    this.watchDirEventHandler(eventType, fn);
  }.bind(this));
}

/////////////////////////////////////////////////////////////////////////////
// Event Handler for List of Items UI - clicks, inputs, changes, keyups
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.listUiEventHandler = function(event) {
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
  console.log(previousState);

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
// Add New Item
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.addNewItem = function(event) {
  let nextSku = this.dataModel.getNextSku();
  let nextSkuNum = this.dataModel.getNextSkuNumber();

  // Setup UI with new item to be added
  let htmlString = this.itemHtml.toString().replace(/__SKU__/gi, nextSku);
  let bar = (this.itemDivBody.innerHTML == "") ? "" : "<hr>" ;

  this.itemDivBody.insertAdjacentHTML('afterbegin', htmlString.replace(/__NUM__/gi, nextSkuNum) + bar);

  document.getElementById("itemMainCard").hidden = false;

  // Draw feathers that may be on the Item UI element
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
  
  this.loadItemData(nextSkuNum, this.dataModel.db.data.ItemList[0]);

  // Reset Focus to new item's title field
  this.setFocus(nextSkuNum, "title");
}

/////////////////////////////////////////////////////////////////////////////
// Set Focus to Field with skuNum and fieldName
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.setFocus = function(skuNum, fieldName) {
  let titleId = fieldName + this.sep + skuNum;
  document.getElementById(titleId).focus();
  document.getElementById(titleId).click();
}

/////////////////////////////////////////////////////////////////////////////
// Load Item to UI
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.loadItemData = function(skuNum, item) {
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

/////////////////////////////////////////////////////////////////////////////
// Load Items
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.loadItems = function() {
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
    this.loadItemData(skuNum, item);
  }
  
  // draw any feathers on the new gui element..
  feather.replace();

}

/////////////////////////////////////////////////////////////////////////////
// generatePhotoList
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.generatePhotoList = function(pList, id) {
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
// Watch Directory Event Handler
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.watchDirEventHandler = function(eventType, fn) {
  let photoExt = this.dataModel.photoExt;
  let photoConvExt = this.dataModel.photoConvExt;
  console.log("event: dir watcher...")
  
  if (eventType == 'rename' && fn.split('.').pop().toLowerCase() == photoExt.toLowerCase()) {
    if (this.activeItem) {

      // Convert file extension for adding or deleting the file
      let newFileName = fn.split('.');
      newFileName.pop();
      newFileName = newFileName.join('') + '.' + photoConvExt;

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
}

/////////////////////////////////////////////////////////////////////////////
// Close Item List
/////////////////////////////////////////////////////////////////////////////
PsItemListViewController.prototype.close = function() {
  this.itemDivBody.innerHTML = "";
  document.getElementById("listDivMain").hidden = true;
  document.getElementById("itemMainCard").hidden = true;

  this.itemDivBody.removeEventListener('click', this.ehref, false);
  this.itemDivBody.removeEventListener('input', this.ehref, false);
  this.itemDivBody.removeEventListener('chage', this.ehref, false);
  this.itemDivBody.removeEventListener('keyup', this.ehref, false);
  this.ehfswatch.close();
}
