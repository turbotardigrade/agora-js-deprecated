"use strict";

const curation = null; // require('./curation.js')
const dataManagement = null; // require('./dataManagement.js')
const co = require('co');

const requests = [];

function* handleGen(data) {
  var array = yield [dataManagement.getContent(data.hashId), curation.rank(data)];
  data.content = array[0];
  data.score = array[1];
  fullfillRequest(data);
}

module.exports = {
  handle: co(handleGen)
}
