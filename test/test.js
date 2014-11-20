var expect = require('chai').expect;
var handler = require("../web/request-handler");
var stubs = require("./stubs/stubs");
var fs = require('fs');
var archive = require("../helpers/archive-helpers");
var path = require('path');
var res;

archive.initialize({
  list : path.join(__dirname, "/testdata/sites.txt")
});

// Conditional async testing, akin to Jasmine's waitsFor()
var waitForThen = function(test, cb) {
  setTimeout(function() {
    test() ? cb.apply(this) : waitForThen(test, cb);
  }, 5);
};

beforeEach(function(){
  res = new stubs.Response();
});

describe("Node Server Request Listener Function", function() {

  it("Should answer GET requests for /", function(done) {
    var req = new stubs.Request("/", "GET");

    handler.handleRequest(req, res);

    waitForThen(
      function() { return res._ended; },
      function(){
        expect(res._responseCode).to.equal(200);
        expect(res._data.toString().match(/<input/)).to.be.ok; // the resulting html should have an input tag
        done();
    });
  });

  it("Should answer GET requests for archived websites", function(done) {
    var fixtureName = "www.google.com";
    var req = new stubs.Request("/" + fixtureName, "GET");

    handler.handleRequest(req, res);

    waitForThen(
      function() { return res._ended; },
      function(){
        expect(res._responseCode).to.equal(200);
        expect(res._data.toString().match(/google/)).to.be.ok; // the resulting html should have the text "google"
        done();
    });
  });

  it("Should append submitted sites to 'sites.txt'", function(done) {
    var url = "www.example.com";
    var req = new stubs.Request("/", "POST", {url: url});

    // Reset the test file and process request
    fs.writeFileSync(archive.paths.list, "");
    handler.handleRequest(req, res);

    waitForThen(
      function() { return res._ended; },
      function(){
        var fileContents = fs.readFileSync(archive.paths.list, 'utf8');
        console.log("FILECONTENTS: " + fileContents);
        console.log("URL: " + '[' + url + ']');
        console.log("I SHOULD BE THIRD");
        expect(res._responseCode).to.equal(302);
        expect(fileContents).to.equal('[' + url + ']');
        done();
    });
  });

  it("Should 404 when asked for a nonexistent file", function(done) {
    var req = new stubs.Request("/arglebargle", "GET");

    handler.handleRequest(req, res);

    waitForThen(
      function() { return res._ended; },
      function(){
        expect(res._responseCode).to.equal(404);
        done();
    });
  });

});

describe("html fetcher helpers", function(){

  it("should have a 'readListOfUrls' function", function(done){
    var urlArray = ["example1.com", "example2.com"];
    var resultArray;

    fs.writeFileSync(archive.paths.list, JSON.stringify(urlArray));
    archive.readListOfUrls(function(urls){
      resultArray = urls;
    });

    waitForThen(
      function() { return resultArray; },
      function(){
        expect(resultArray).to.deep.equal(urlArray);
        done();
    });
  });

  it("should have a 'isUrlInList' function", function(done) {
    var urlArray = ["abc.com", 'cde.com'];
    fs.writeFileSync(archive.paths.list, JSON.stringify(urlArray));

    expect(archive.isUrlInList(urlArray[0])).to.equal(true);
    expect(archive.isUrlInList(urlArray[1])).to.equal(true);
    expect(archive.isUrlInList("aaa.com") ).to.equal(false);
    done();

  });

  it("should have a 'addUrlToList' function", function(done){
    var urlArray = ["abc.com", 'cde.com'];
    var isDone = false;
    fs.writeFileSync(archive.paths.list, JSON.stringify(urlArray));
    archive.addUrlToList('xyz.com', function(){
      isDone = true;
    });


    waitForThen(
      function() { return isDone; },
      function(){
        expect(archive.isUrlInList('xyz.com')).to.equal(true);
        done();
    });
  });


  it("should have a 'downloadUrls' function", function(){
    expect(typeof archive.downloadUrls).to.equal('function');
  });

});
