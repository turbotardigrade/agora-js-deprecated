'use strict';

const fs = require('fs');
const settings = require('../config/settings.json');

const privateKey = fs.readFileSync('./config/privatekey', 'utf8');
const publicKey = fs.readFileSync('./config/publickey', 'utf8');

settings.privateKey = privateKey;
settings.publickey = publicKey;

module.exports = settings;
