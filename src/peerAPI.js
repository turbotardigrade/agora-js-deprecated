/**
 * Parses data and calls the correct handling function for the request
 */

var connectionManagerAPI = null; // require('./connectionManager/connectionManagerAPI.js')

function handle(data) {
  switch(request.type) {
    case "search":
    // handle search
    // return searchResults
    case "getRecentPosts":
    // handle recent posts
    case "getPostsByUser":
    // handle posts by user...
  // ...
    default:
    // send unsupported message
    connectionManagerAPI.sendData(/* add data */);
    break;
  }
}
