//---------------------------------------------------------------------------------
// Copyright (c) 2020 Tom (TomPrograms/storndb)
// Copyright (c) 2020 Chris Borrelli
//  - adapted from https://github.com/TomPrograms/stormdb.git
//  - TomPrograms/stormdb/src/engine/local.js
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

const fs = require("fs");

var JsonDb = function(path) {
  this.path = (path) ? path : ('./db_' + Math.floor(Date.now() / 1000 ) );
  this.data = {};

  const exists = fs.existsSync(this.path);
  if (!exists) {
    fs.writeFileSync(this.path, JSON.stringify({}));
  }
  else {
    this.read();
  }
}

JsonDb.prototype.read = function() {
  let fData = fs.readFileSync(this.path, "UTF-8");
  if (fData == "") data = "{}";

  try {
    this.data = JSON.parse(fData);
  }
  catch (error) {
    error.message = "Failed to load JasonDb Database file - invalid or corrupted format.";
    throw error;
  }
}

JsonDb.prototype.write = function() {
  fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
}
