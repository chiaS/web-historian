var path = require('path');
var fs = require('fs');
var request = require('request');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!

var sendFile = function(filePath, fileType) {
  return function(req, res) {
    var serverPath = path.join(__dirname, filePath);
    fileType = fileType || 'text/html';

    fs.readFile(serverPath, function(err, data){
      res.writeHead(200, fileType);
      res.end(data);
    });
  };
};

var routes = {
  '/': sendFile('./public/index.html'),
};




exports.handleRequest = function (req, res) {
  if (routes[req.url]) {
    routes[req.url](req, res);
  } else {
    // res.end(archive.paths.list);
  }

  request({uri:'http://www.target.com'}, function(err, ress, body){
    res.end(body);
  });
};

