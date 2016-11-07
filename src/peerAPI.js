/**
 * Parses data and calls the correct handling function for the request
 */


function search() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

function getRecentPosts() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

function getPostsByUser() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

function handle(req) {
  switch(req.body.type) {
    case "search":
    // handle search
    // return searchResults
    search(req.body.parameters)
    .then(function(result) {
      req.send(result);
    });
    break;
    case "getRecentPosts":
    // handle recent posts
    getRecentPosts(req.body.parameters)
    .then(function(result) {
      req.send(result);
    });
    break;
    case "getPostsByUser":
    // handle posts by user...
    getPostsByUser(req.body.parameters)
    .then(function(result) {
      req.send(result);
    });
    break;
  // ...
    default:
    // send unsupported message
    req.send("unsupported");
    break;
  }
}
