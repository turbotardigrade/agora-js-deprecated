/**
 * Interface for connectionManager to resolve circular dependencies
 */

"use strict";

var sendDataQueue = [];
var handleDataQueue = [];
var updateNodeSpamPercentageQueue = [];

var sendDataFunction = null;
var handleDataFunction = null;
var updateNodeSpamPercentageFunction = null;

function (init) {
  sendDataFunction = init.sendData;
  handleDataFunction = init.handleData;
  updateNodeSpamPercentageFunction = init.updateNodeSpamPercentage;
  for (var i = 0; i < sendDataQueue.length; ++i) {
    init.sendData(sendDataQueue[i]);
  }
  for (var i = 0; i < handleDataQueue.length; ++i) {
    init.handleData(handleDataQueue[i]);
  }
  for (var i = 0; i < updateNodeSpamPercentageQueue.length; ++i) {
    init.updateNodeSpamPercentage(
      updateNodeSpamPercentageQueue[i].nodeId,
      updateNodeSpamPercentageQueue[i].percentage
    );
  }
}

module.exports = {
  sendData: function(req) {
    if (!sendDataFunction) {
      sendDataQueue.push(req);
    } else {
      sendDataFunction(req);
    }
  },
  handleData: function(data) {
    if (!handleDataFunction) {
      handleDataQueue.push(data);
    } else {
      handleDataFunction(data);
    }
  },
  updateNodeSpamPercentage: function(nodeId, percentage) {
    if (!updateNodeSpamPercentageFunction) {
      updateNodeSpamPercentageQueue.push({
        nodeId: nodeId,
        percentage: percentage
      });
    } else {
      updateNodeSpamPercentageFunction(nodeId, percentage);
    }
  }
}
