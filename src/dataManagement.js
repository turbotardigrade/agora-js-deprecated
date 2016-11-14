/**
 * @maintainer: Long Hoang <long@mindwokrer.de>
 * 
 * Data Management 
 *  - interacts with the IPFS Files API
 *  - pins data for permenant storage
 *  - keeps track of Post to Comment mapping
 *  - defines how content are stored
 *
 * TODO:
 *  - Should reject to store anything above a set filesize
 *  - Check if public key are valid
 *  - Check
 *
 * Ideas:
 *  - Comment blocks which does not get displayed, but could be used for programatic purposes
 */

"use strict";

const crypto = require('crypto');

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

/**********************************************************************
 * Exported functions
 */
function createPost(node, content) {
  var post = new Post(me, content);

  // For testing
  console.log(verify(post));

  var file = {
    path: 'long/'+'test.ag', // @todo change
    content: new Buffer(JSON.stringify(post))  // @TODO use serializer instead
  };

  return saveFile(node, file);
}

function createComment(node, postID, content) {
  var comment = new Comment(postID, me, content);

  // For testing
  console.log(verify(comment));

  var file = {
    path: 'long/'+'test.ag', // @todo change
    content: new Buffer(JSON.stringify(post))  // @TODO use serializer instead
  };

  return saveFile(node, file);
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

module.exports = {
  createPost,
  createComment
  //pull
}
