var fs = require('fs');
var path = require('path');
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  'siteAssets' : path.join(__dirname, '../web/public'),
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for jasmine tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback){
  fs.readFile(this.paths.list, function(err, data){
    callback(JSON.parse(data) );
  });
};

exports.isUrlInList = function(url){
  var data = fs.readFileSync(this.paths.list);
  var dataArr = JSON.parse(data.toString());

  return dataArr.indexOf(url) > -1;
};

exports.addUrlToList = function(url, callback){
  var list = this.paths.list;

  fs.readFile(list, function(err,data){
    var dataArr = JSON.parse(data.toString());
    dataArr.push(url);
    fs.writeFile(list, JSON.stringify(dataArr), function(err){
      if(err)
        console.log(err);
      else
        callback();
    });
  });
};

exports.isURLArchived = function(){
  //if its on the list, it should be archived
  return isUrlInList();
};

exports.downloadUrls = function(url){


};
