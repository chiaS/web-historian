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
      processURL(req, res, '/' + data.slice(4), 302);
    });

  } else if (req.method === 'GET') {
    //to see if the requested url is archived
    if(routes[req.url] === undefined){
      res.writeHead(404);
      res.end();
    }else{
      processURL(req, res, req.url, 200);
    }

  }


  }

  var processURL = function(req, res, url, statusCode) {
    if (routes[url]) {
      routes[url](req, res, statusCode);
    } else {
      routes[url] = sendFile('./../archives/sites'+url);
      //request data from other web servers
      request({uri:'http:/'+url}, function(err, ress, body){
        //save to archive folder
        archive.downloadUrls(url, body);
        //add to list
        archive.addUrlToList(url, function(){
          //return page
          res.writeHead(statusCode);
          res.end(body);
        });
      });

  };

};
