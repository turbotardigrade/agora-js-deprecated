const ipfs = require('ipfs');
const node = new ipfs();

var dm = require('./dataManagement');

function createPostAndCommentTest() {
  dm.createPost(node, "Hello world!").then(function(data) {
    //console.log(data);

    dm.createPost(node, data[0].hash, "Hello world!").then(function(d) {
      //console.log(d);
    }, function(err) {
      console.log(err);
    });

    dm.loadFile(node, data[0].hash).then(function(item) {
      console.log(item);
    }, function(err) {
      console.log(err);
    });
    
  }, function(err) {
    console.log(err);
  });
}

createPostAndCommentTest();
