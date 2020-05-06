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

var PsNewProjViewController = function(callback) {
  this.path = "";
  this.baseSkuName = "";
  this.startSkuNum = document.getElementById('newProjectConfigStartSKU').value;
  this.photoExt = document.getElementById('newProjectConfigPhotoFileExt').value;
  this.photoConvExt = document.getElementById('newProjectConfigPhotoConvertedFileExt').value;

  this.callback = callback;
    
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
    this.callback();
  }.bind(this));
}

/////////////////////////////////////////////////////////////////////////////
// Try to Enable Create Button
/////////////////////////////////////////////////////////////////////////////
PsNewProjViewController.prototype.tryEnableCreateButton = function() {
  if (this.baseSkuName != "" && this.path != "" && this.startSkuNum != "" && this.photoExt != "" && this.photoConvExt != "") {
    document.getElementById('createProjectButton').removeAttribute('disabled');
  }
  else {
    document.getElementById('createProjectButton').setAttribute('disabled', "");
  }
}

/////////////////////////////////////////////////////////////////////////////
// Directory Changed Event Handler
/////////////////////////////////////////////////////////////////////////////
PsNewProjViewController.prototype.dirChanged = function(event) {
  if (event.target.files.length > 0) {
    let path = event.target.files[0].path;
    let dirChooserLabel = document.getElementById('dirChooserLabel');
    this.path = path;
    dirChooserLabel.innerHTML = path;
    this.tryEnableCreateButton();
  }
}
