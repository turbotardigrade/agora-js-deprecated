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
    return dm.createComment(node, 'fake hashID', 'Hello world!')
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

    return node.files.add(file, (err) => {
      if (err != null) {
        assert(err);
      }

      return dm.saveFile(node, file)
      .then(files => dm.loadFile(node, files[0].hash))
      .catch((e) => {
        // TODO check for error message
        assert(e);
      });
    });
  });
});
