/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();

app.on('error', function(err){console.log(err);});

app.clientError = function (exception, socket) {
  console.log("Client error: "+exception);
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
  try {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  } catch (err) {
    console.warn("Error chatched: " + err);
  }
});



// DK: Proxy servers:
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({xfwd : true, changeOrigin: true }),
  url = require('url');

var proxy2 = httpProxy.createProxyServer({xfwd : true, changeOrigin: true });
// start proxy server:
http.createServer(function(req, res) {
 // console.log('Proxy-server listening on %d, in %s mode', config.port, app.get('env'));
  var proxyHost, pattern;

   console.log(req.url);
  // #1 songza-api (straight-forward to songza.com)
  pattern = /^\/songza-api\/(.*)/;
  if (pattern.exec(req.url)) {
    proxyHost = 'http://songza.com/api/1/' + req.url.match(pattern)[1];
    // BUGFIX: request url haven't '?' character, add it it resolves some strange proxy error :/
    if (req.url.match(pattern)[1].indexOf('?') === -1)
      proxyHost += '?';
    console.log("9001 proxy server requested, proxyHost: " + proxyHost);

    // req.headers['Access-Control-Allow-Origin'] = req.headers['origin'];
    // req.headers['Access-Control-Allow-Credentials'] = "true";
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    try {
      proxy.web(req, res, { target: proxyHost });
    }
    catch (error) {
      console.log(error.message);
    }
  }

  // #2 songza-api-proxy (throught the heroku transparent proxy server located in USA :) )
  pattern = /\/songza-api-proxy\/(.*)/;
  if (pattern.exec(req.url)) {
    proxyHost = 'http://transparent-proxy.herokuapp.com/proxy.php?' /*+ req.url.match(pattern)[2] + '&*/ + '__dest_url=/' + req.url.match(pattern)[1];

    res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    var options = {
      host: 'transparent-proxy.herokuapp.com',
      path: '/proxy.php?' + '__dest_url=/' + req.url.match(pattern)[1]
      ,headers : { host: req.host,
        connection: 'keep-alive',
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4',
        cookie: req.headers.cookie,
        'Access-Control-Allow-Origin': req.headers['origin'],
        'Access-Control-Allow-Credentials': 'true'
      }
    };
    console.log(req.headers);
    var callback = function(response) {
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log(str);
        res.writeHead(200);
        res.end(str);
      });
      };
    try {
      http.request(options, callback).end();
    }
    catch (error) {
      console.log(error.message);
    }
    //console.log("9001 transparent-proxy server requested, proxytargetHost: " + proxyHost);
//
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9001');
    //res.setHeader('Access-Control-Allow-Credentials', 'true');
    ////console.log(res);
    //proxy2.web(req, res, { target: proxyHost, changeOrigin: true, hostRewrite: true});
  }
  // res.end();

}).listen(9001, config.ip);

proxy.on('proxyRes', function (proxyRes, req, res) {
  proxyRes.headers["access-control-allow-origin"] = req.headers['origin'];
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

// Expose app
exports = module.exports = app;
