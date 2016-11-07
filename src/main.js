var queue = [];

function listenForConnections() {
  if (queue) {
    // do data processing

  }
  setTimeout(listenForConnections, 100);
}

listenForConnections();
