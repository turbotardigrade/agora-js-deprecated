var fs = require('fs');
var privateKey = fs.readFileSync('./config/privatekey', 'utf8');
var publicKey = fs.readFileSync('./config/publickey', 'utf8')
var settings = require('../config/settings.json');

settings.privateKey = privateKey;
settings.publickey = publicKey;

module.exports = settings;
