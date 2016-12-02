// These eslint comments are required in test files
// Because mocha uses globals and doesn't support arrow functions
/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

'use strict';

const IPFS = require('ipfs');
const assert = require('assert');

// TODO use separate test config
const conf = require('../src/config');
const dm = require('../src/dataManagement');

const Author = dm.Author;
const Post = dm.Post;

const me = new Author(conf.publicKey, conf.alias);

describe('dataManagement', function () {
  const node = new IPFS();

  // TODO check if path is correct
  it('createPost should run correctly without errors', function () {
    return dm.createPost(node, 'Hello world!')
	     .then((files) => {
               assert(files.length > 1, 'has at least 2 file references (file and directory)');
	     });
  });

  // TODO check hash as well
  it('createComment should run correctly without errors', function () {
    return dm.createComment(node, 'fake hashID', 'fake postID', 'Hello world!')
	     .then((files) => {
               assert(files.length > 1, 'has at least 2 file references (file and directory)');
	     });
  });

  it('loadFile should refuse tampered data', function () {
    const post = new Post(me, 'Hello World!');

    // Tamper with file before uploading to IPFS
    post.content += 'MANIPULATION';

    const file = {
      path: 'test', // TODO
      content: new Buffer(JSON.stringify(post)),
    };

    return new Promise((resolve, reject) => {
      node.files.add(file, (err, files) => {
	if (err != null) {
          reject(err);
	  return;
	}

	dm.loadFile(node, files[0].hash)
	  .then((err) => {
	    reject(new Error("should reject tampered data"));
	  })
	  .catch(e => {
	    resolve();
	  });
      });
    });
    
  });


  it('createPost should reject large files', function() {
    var largefile = 'Ultimate frisbee is great';

    // consecutive proto.repeat() seems to be the most efficient way
    // to create a large string
    largefile = largefile.repeat(10);
    largefile = largefile.repeat(10);
    largefile = largefile.repeat(10);
    largefile = largefile.repeat(10);
    
    return new Promise((resolve, reject) => {
      dm.createPost(node, largefile)
	.then(files => {
	  reject(new Error('should reject large files'));
	})
	.catch(e => {
	  resolve();
	});
    });
  });

});
