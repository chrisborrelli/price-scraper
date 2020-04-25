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

const C_ArraySeparaterPhoto = ';'

var PsDataModel = function(schemaPath) {

  this.filePath = null;
  this.baseSkuName = null;
  this.startSkuNum = null;
  this.photoExt = null;
  this.photoConvExt = null;

  this.schema = new JsonDb(schemaPath);
  this.db = null;

  this.sep = '-';

}

/////////////////////////////////////////////////////////////////////////////
// New Project - Create New Project Button Click Event Handler
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.initNewDb = function(filePath, baseSkuName, startSkuNum, photoExt, photoConvExt) {

  // Store info for later use
  this.filePath = filePath;
  this.baseSkuName = baseSkuName;
  this.startSkuNum = startSkuNum;
  this.photoExt = photoExt;
  this.photoConvExt = photoConvExt;

  // Create new data base object
  this.db = new JsonDb(filePath);

  // Initialize Objects in data base
  if (!this.db.data.hasOwnProperty('Config')) {
    this.db.data.Config = {
      baseSkuName: baseSkuName,
      startSkuNum: startSkuNum,
      photoExt: photoExt,
      photoConvExt: photoConvExt
    };
    this.db.data.ItemList = [];
  }
  else {
    // Override the toString property for photoList array
    for (let i=0 ; i<this.db.data.ItemList.length ; i++) {
      let item = this.db.data.ItemList[i];
      item.photoList.toString = function() {
        return this.join(C_ArraySeparaterPhoto);
      }
    }
  }
  this.db.write();
}

/////////////////////////////////////////////////////////////////////////////
// Save Data to Disk
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.saveData = function() {
  this.db.write();
}


/////////////////////////////////////////////////////////////////////////////
// Add New Item
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.addNewItem = function(item) {
  if (!this.db.data.hasOwnProperty('ItemList')) {
    this.db.data.Items = [];
  }

  item.sku = this.getNextSku();

  // Override the toString property for photoList array
  item.photoList.toString = function() {
    return this.join(C_ArraySeparaterPhoto);
  }
  
  // Add new item to start of the list
  this.db.data.ItemList.unshift (item);

  // Write database to disk
  this.db.write();
}

/////////////////////////////////////////////////////////////////////////////
// Edit Item
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.editItem = function(item) {
  let idx = this.findIndexBySku(item.sku);
  if (idx >= 0) {
    console.log("Found Item at index " + idx);
  }
  else {
    console.log("Item not found in database:\n" + item);
    return false;
  }

  this.db.data.ItemList[idx] = item;
  this.db.write();
  return true;

}

/////////////////////////////////////////////////////////////////////////////
// Get Item By Sku
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.getItemBySku = function(sku) {
  return this.getItemByIdx(this.findIndexBySku(sku));
}

/////////////////////////////////////////////////////////////////////////////
// Get Item By SkuNum
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.getItemBySkuNum = function(skuNum) {
  return this.getItemByIdx(this.findIndexBySkuNum(skuNum));
}

/////////////////////////////////////////////////////////////////////////////
// Get Item By Index
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.getItemByIdx = function(idx) {
  if (idx >= 0 && this.db.data.ItemList.length > idx) {
    return this.db.data.ItemList[idx];
  }
  else {
    return {};
  }
}

/////////////////////////////////////////////////////////////////////////////
// Get Next Sku Number
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.getNextSkuNumber = function() {
  return Number(this.db.data.Config.startSkuNum) + this.db.data.ItemList.length;
}

/////////////////////////////////////////////////////////////////////////////
// Get Next sku
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.getNextSku = function() {
  return this.db.data.Config.baseSkuName + this.sep + this.getNextSkuNumber();
}

/////////////////////////////////////////////////////////////////////////////
// Find and FindIndex by Sku or SkuNum
/////////////////////////////////////////////////////////////////////////////
PsDataModel.prototype.findIndexBySku = function(op) {
  return this.db.data.ItemList.findIndex(({ sku }) => sku === op );
}

PsDataModel.prototype.findBySku = function(op) {
  return this.db.data.ItemList.find(({ sku }) => sku === op );
}

PsDataModel.prototype.findIndexBySkuNum = function(op) {
  let sku = this.db.data.Config.baseSkuName + this.sep + op;
  return this.findIndexBySku(sku);
}

PsDataModel.prototype.findBySkuNum = function(op) {
  let sku = this.db.data.Config.baseSkuName + this.sep + op;
  return this.findBySku(sku);
}
