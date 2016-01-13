/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var songzaLurker = require('./songzaLurker');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();

app.on('error', function (err) {console.log(err);});

app.clientError = function (exception, socket) {
  console.log("Client error: " + exception);
}
var http = require('http');
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  songzaLurker.init();
  try {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  } catch (err) {
    console.warn("Error chatched: " + err);
  }
});


// DK: Proxy servers:
var httpProxy = require('http-proxy');

var request = require('request');

// Expose app
exports = module.exports = app;
