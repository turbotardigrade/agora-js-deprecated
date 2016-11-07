/**
 * defines some methods to filter and rank stuff
 */

function rankData(data) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(calculateScore(data));
    }
    catch (error) {
      reject(error);
    }
  });
}

function classifyData(data) {
  return new Promise(function(resolve, reject) {
    try {
      resolve(calculateClass(data));
    }
    catch(error) {
      reject(error);
    }
  })
}
