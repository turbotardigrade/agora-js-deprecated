

const fs = require('fs');
const settings = require('../config/settings.json');

const privateKey = fs.readFileSync('./config/privatekey', 'utf8');
const publicKey = fs.readFileSync('./config/publickey', 'utf8');

settings.privateKey = privateKey;
settings.publicKey = publicKey;

module.exports = settings;
