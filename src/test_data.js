const ipfs = require('ipfs');
const node = new ipfs();

const dm = require('./dataManagement');

function createPostAndCommentTest() {
  dm.createPost(node, 'Hello world!').then((data) => {
    // console.log(data);

    dm.createPost(node, data[0].hash, 'Hello world!').then((d) => {
      // console.log(d);
    }, (err) => {
      console.log(err);
    });

    dm.loadFile(node, data[0].hash).then((item) => {
      console.log(item);
    }, (err) => {
      console.log(err);
    });
  }, (err) => {
    console.log(err);
  });
}

createPostAndCommentTest();
