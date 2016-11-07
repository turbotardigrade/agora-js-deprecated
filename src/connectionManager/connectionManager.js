/**
 * ConnectionManager manages who to connect to.
 */

"use strict";

const nodeObj = {
  // "<node id>": {
  //   trustValue: ...
  //   lastOnline: ...
  //   requests: ...
  //   ...
  // }
}

const defaultTrustValue = 0;
const refreshInterval = 100; //ms
const maxRequests = 10;
const maxNodes = 30;
// after 1 minute, the requests are no longer counted towards the limit
const connectionAttemptCountPeriod = 60000;
const peerAPI = {}; // require('./peerAPI.js')
const content = {}; // require('./content.js')
const ipfs = {}; // require('ipfs') ??
const connectionManagerAPI = {}; // require('./connectionManagerAPI.js')
const blackList = [];
const nodePriorityQueue = [];

// define Node structure
function Node() {
  this.trustValue = defaultTrustValue,
  this.lastOnline = Date.getTime(),
  this.requests = []
}

/*
 * Connection Manager INTERNAL FUNCTIONS
 */

function updateBlackList() {
  for (var nodeId in nodeObj) {
    var earliestCountedRequest;
    for (var i = 0; i < nodeObj[nodeId].requests.length; ++i) {
      // delete requests older than considered time period
      if (Date.now() - nodeObj[nodeId].requests[i].timestamp >
          connectionAttemptCountPeriod) {
        earliestCountedRequest = i;
      } else {
        break;
      }
    }
    nodeObj[nodeId].requests =
      nodeObj[nodeId].requests.splice(i, nodeObj[nodeId].requests.length);
    if (nodeObj[nodeId].requests.length > maxRequests) {
      blackList.push(nodeObj[nodeId]);
      delete nodeObj[nodeId];
    }
  }
}

// periodically update its own node list and the blacklist
(function refreshNodes() {
  var peerList = ipfs.getPeers();
  for (var i = 0; i < peerList.length; ++i) {
    if (nodeObj[peerList[i].id]) {
      nodeObj[peerList[i].id].lastOnline = Date.getTime();
    } else {
      nodeObj[peerList[i].id] = new Node();
    }
  }
  // recreate priority queue
  nodePriorityQueue.length = 0;
  for (var nodeId in nodeObj) {
    nodePriorityQueue.push({
      nodeId: nodeId,
      trust: nodeObj[nodeId].trustValue
    });
  }
  nodePriorityQueue.sort(function(a, b) {
    if (a.trust < b.trust) {
      return -1;
    }
    if (a.trust > b.trust) {
      return 1;
    }
    return 0;
  })
  // do some node cleanup...
  if (nodePriorityQueue.length > maxNodes) {
    // delete some nodes using some criteria
  }
  updateBlackList();
  setTimeout(refreshNodes, refreshInterval);
})();

/*
 * Connection Manager EXTERNAL FUNCTIONS
 */

// calls functions to handle external requests
function handleData(data) {
  // drop all requests that are by blacklisted nodes
  for (var i = 0; i < blackList.length; ++i) {
    if (data.nodeId === blackList[i].nodeId) {
      return;
    }
  }
  if (data.type === "request") {
    if (nodeObj[data.nodeId]) {
      nodeObj[data.nodeId].requests.add({
        timestamp: Date.now()
      });
      if (nodeObj[data.nodeId].requests.length > maxRequests) {
        updateBlackList();
      }
    } else {
      nodeObj[data.nodeId] = new Node();
    }
    peerAPI.handle(data);
  } else {
    content.handle(data);
  }
}

function sendData(req) {
  //pick some nodes to send data
  for (var i = 0; i < nodePriorityQueue.length && i < maxRequests; ++i) {
    ipfs.send(nodePriorityQueue[i].nodeId, req);
  }
}

// updates trust value based on spam received
function updateNodeSpamPercentage(nodeId, percentage) {
  // example implementation
  const spamThreshold = 0.2
  if (percentage < 0.2) {
    nodeObj[trustValue] += (percentage - 0.2) * 5;
  } else {
    nodeObj[trustValue] -= (percentage - 0.2) * 5 / 4;
  }
}

connectionManagerAPI.init({
  sendData: sendData,
  handleData: handleRequest,
  updateNodeSpamPercentage: updateNodeSpamPercentage
});
