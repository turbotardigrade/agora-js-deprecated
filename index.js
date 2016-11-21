'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();

const config = require('./src/config.js');

server.connection({ port: 3000 });

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply("I'm Agora!");
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
})
