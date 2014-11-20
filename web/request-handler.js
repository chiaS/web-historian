var path = require('path');
var fs = require('fs');
var request = require('request');
var url = require('url');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!

var sendFile = function(filePath, fileType) {
  return function(req, res, code) {
    var serverPath = path.join(__dirname, filePath);
    fileType = fileType || 'text/html';

    fs.readFile(serverPath, function(err, data){
      res.writeHead(code, fileType);
      res.end(data);
    });
  };
};

var routes = {
  '/': sendFile('./public/index.html'),
  '/styles.css': sendFile('./public/styles.css')
};

//here
fs.readFile(archive.paths.list, function(err, data){
  var dataArr = JSON.parse(data);
  for(var i=0; i<dataArr.length; i++){
    routes[dataArr[i]] = sendFile('./../archives/sites' + dataArr[i]);
  }
});

//respond to our clients
exports.handleRequest = function (req, res) {
  if(req.method === 'POST'){
    //get url
    req.on('data', function(data){
    //process url
      console.log("DATA: " + data.slice(4) );
      processURL(req, res, data.slice(4), 302);
    });

  } else if (req.method === 'GET') {
    //get url
    processURL(req, res, req.url, 200);
    //process url
  }


  }

  var processURL = function(req, res, url, statusCode) {
    if (routes[url]) {
      console.log("PULLING FROM ARCHIVES");
      console.log(url);
      routes[url](req, res, statusCode);
    } else {
      console.log("NOT PULLING FROM ARCHIVES");
      routes[url] = sendFile('./../archives/sites'+url);
      //request data from other web servers
      request({uri:'http:/'+url}, function(err, ress, body){
        //save to archive folder
        archive.downloadUrls(url, body);
        //add to list
        archive.addUrlToList(url);
        //return page
        res.writeHead(statusCode);
        console.log("I SHOULD BE SECOND");
        res.end(body);
      });

  };

};
