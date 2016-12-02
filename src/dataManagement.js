/**
 * @maintainer: Long Hoang <long@mindworker.de>
 *
 * Data Management
 *  - interacts with the IPFS Files API
 *  - pins data for permenant storage
 *  - keeps track of Post to Comment mapping
 *  - defines how content are stored
 *
 *
 * TODO:
 *  - Check if public key are valid
 *  - Choose shorter public IDs?
 *
 */

// Pinning: https://github.com/ipfs/interface-ipfs-core/pull/34

const crypto = require('crypto');
const concat = require('concat-stream');
const Datastore = require('nedb');

// @TODO was doing this, before computer crashes
const posts = new Datastore({ filename: './data/posts', autoload: true });
const comments = new Datastore({ filename: './data/comments', autoload: true });

const conf = require('./config');

/**
 * Constants and Configs
 */
const SIGN_METHOD = 'sha256';
const CRYP_ENCODE = 'base64';

/**
 * Helper Functions
 */
function createSign(content) {
  const sign = crypto.createSign(SIGN_METHOD);

  sign.write(content);
  sign.end();

  const privateKey = conf.privateKey;
  return sign.sign(privateKey, CRYP_ENCODE);
}

function verifyItem(item) {
  const content = item.content;
  const key = item.authorKey;
  const signature = item.signature;

  const verify = crypto.createVerify(SIGN_METHOD);

  verify.write(content);
  verify.end();

  return verify.verify(key, signature, CRYP_ENCODE);
}

function saveFile(node, file) {
  return new Promise((resolve, reject) => {
    if (Buffer.byteLength(file.content, 'utf8') > 10000) {
      reject(new Error('File too big, reject saving file.'));
    }

    node.files.add(file, (err, result) => {
      if (err != null) {
        reject(err);
      }
      resolve(result);
    });
  });
}

/**
 * Data structures
 */
class Author {
  constructor(pubKey, alias) {
    this.key = pubKey;
    this.alias = alias;
  }
}

// Note: No PostID specified as ID will be given through IPFS
class Post {
  constructor(author, content) {
    this.authorKey = author.key;
    this.authorAlias = author.alias;
    this.content = content;
    this.signature = createSign(content);
    this.timestamp = new Date().getTime();
  }
}

function Comment(parent, postID, author, content) {
  // @TODO check if parent hash valid
  this.parent = parent;
  this.postID = postID;

  this.authorKey = author.key;
  this.authorAlias = author.alias;
  this.content = content;
  this.signature = createSign(content);

  this.timestamp = new Date().getTime();
}

const me = new Author(conf.publicKey, conf.alias);

/**
 * Exported functions
 */
function createPost(node, content) {
  const post = new Post(me, content);

  const file = {
    path: 'long/test.ag', // @todo change
    content: new Buffer(JSON.stringify(post)),
  };

  return new Promise((resolve, reject) => {
    saveFile(node, file).then(result => {
      const hash = result[0].hash;
      posts.insert({hash});
      resolve(result);
    }, err => {
      reject(err);
    });
  });
}

function createComment(node, parent, postID, content) {
  const comment = new Comment(parent, postID, me, content);

  const file = {
    path: 'long/test.ag', // @todo change
    content: new Buffer(JSON.stringify(comment)),
  };

  return new Promise((resolve, reject) => {
    saveFile(node, file).then(result => {
      const hash = result[0].hash;
      comments.insert({hash, post: postID, parent});
      resolve(result);
    }, err => {
      reject(err);
    });
  });
}

function loadFile(node, hash) {
  return new Promise((resolve, reject) => {
    const cb = (buffer) => {
      const item = JSON.parse(buffer);
      if (!verifyItem(item)) {
        reject(new Error('Signature invalid'));
        return;
      }

      resolve(item);
    };

    node.files.get(hash, (err, stream) => { // Note stream is in object mode
      if (err) {
        reject(err);
        return;
      }

      stream.on('data', (file) => {
        file.content.pipe(concat({ encoding: 'string' }, cb));
      });
    });
  });
}

module.exports = {
  Author,
  Post,
  Comment,
  createPost,
  createComment,
  loadFile,
};
