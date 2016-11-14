/**
 * @maintainer: Long Hoang <long@mindwokrer.de>
 * 
 * Data Management 
 *  - interacts with the IPFS Files API
 *  - pins data for permenant storage
 *  - keeps track of Post to Comment mapping
 *  - defines how content are stored
 *
 * 
 * TODO:
 *  - Should reject to store anything above a set filesize
 *  - Check if public key are valid
 *  - Choose shorter public IDs?
 *
 * Ideas:
 *  - Comment blocks which does not get displayed, but could be used for programatic purposes
 */

// Pinning: https://github.com/ipfs/interface-ipfs-core/pull/34

"use strict";

const crypto = require('crypto');
const concat = require('concat-stream')

/**********************************************************************
 * Constants and Configs
 */
const SIGN_METHOD = 'sha256';
const CRYP_ENCODE = 'base64';

var conf = require('./config');
var me = new Author(conf.publicKey, conf.alias);

/**********************************************************************
 * Data structures
 */
function Author(pubKey, alias) {
  this.key = pubKey;
  this.alias = alias;
}

// Note: No PostID specified as ID will be given through IPFS
function Post(author, content) {
  this.authorKey = author.key;
  this.authorAlias = author.alias;
  this.content = content;
  this.signature = sign(content);

  this.timestamp = new Date().getTime();
}


function Comment(parent, author, content) {
  // @TODO check if parent hash valid
  this.parent = parent;
  
  this.authorKey = author.key;
  this.authorAlias = author.alias;
  this.content = content;
  this.signature = sign(content)

  this.timestamp = new Date().getTime();
}

/**********************************************************************
 * Helper Functions
 */
function sign(content) {
  const sign = crypto.createSign(SIGN_METHOD);
  
  sign.write(content);
  sign.end();

  const private_key = conf.privateKey;
  return sign.sign(private_key, CRYP_ENCODE);
}

function verify(item) {
  var content = item.content;
  var key = item.authorKey;
  var signature = item.signature;
  
  const verify = crypto.createVerify(SIGN_METHOD);

  verify.write(content);
  verify.end();

  return verify.verify(key, signature, CRYP_ENCODE);
}

function saveFile(node, file) {
  return new Promise(function(resolve, reject) {
    node.files.add(file, function (err, result) {
      if (err != null) {
	reject(err);
      }
      resolve(result);
    });
  });
}

/**********************************************************************
 * Exported functions
 */
function createPost(node, content) {
  var post = new Post(me, content);

  var file = {
    path: 'long/'+'test.ag', // @todo change
    content: new Buffer(JSON.stringify(post))
  };

  return saveFile(node, file);
}

function createComment(node, postID, content) {
  var comment = new Comment(postID, me, content);

  var file = {
    path: 'long/'+'test.ag', // @todo change
    content: new Buffer(JSON.stringify(post))
  };

  return saveFile(node, file);
}

function loadFile(node, hash) {
  return new Promise(function(resolve, reject) {

    var cb = (buffer) => {
      var item = JSON.parse(buffer);

      if (!verify(item)) {
	reject(new Error('Signature invalid'));
      }

      resolve(item);
    }
	  
    node.files.get(hash, (err, stream) => { // Note stream is in object mode
      if (err) {
	reject(err);
      }
      
      stream.on('data', (file) => {
	file.content.pipe(concat({encoding: 'string'}, cb));
      });
    });
    
  });
}

module.exports = {
  createPost,
  createComment,
  loadFile
}
