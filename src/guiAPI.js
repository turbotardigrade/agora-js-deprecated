"use strict";
const co = require('co');
const connectionManager = null; // require('./connectionManager.js');

// suddenly I realize I need some data
function updateFeed() {
  var responses = yield connectionManager.sendRequest({
    "type": "getRecentPosts"
  });
  return yield responses.map(function(res) {
    return content.handle(res);
  });
}

module.exports = {
  updateFeed: co(updateFeed)
};
