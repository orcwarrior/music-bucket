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
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
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

   //console.log(req.url);
  // #1 songza-api (straight-forward to songza.com)
  pattern = /^\/songza-api\/(.*)/;
  if (pattern.exec(req.url)) {
    proxyHost = 'http://songza.com/api/1/' + req.url.match(pattern)[1];
    //console.log("9001 proxy server requested, proxyHost: " + proxyHost);

    // req.headers['Access-Control-Allow-Origin'] = req.headers['origin'];
    // req.headers['Access-Control-Allow-Credentials'] = "true";
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin']);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // console.log(req.headers);
    proxy.web(req, res, { target: proxyHost });
  }

  // #2 songza-api-proxy (throught the heroku transparent proxy server located in USA :) )
  pattern = /\/songza-api-proxy\/(.*)/;
  if (pattern.exec(req.url)) {
    proxyHost = 'http://transparent-proxy.herokuapp.com/proxy.php?' /*+ req.url.match(pattern)[2] + '&*/ + '__dest_url=/' + req.url.match(pattern)[1];
    var options = {
      host: 'transparent-proxy.herokuapp.com',
      path: '/proxy.php?' + '__dest_url=/' + req.url.match(pattern)[1],
    };

    var callback = function(response) {
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        console.log(str);
        res.write(str);
      });
      };
    http.request(options, callback).end();
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
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});
// httpProxy.createServer(function (req, res, proxy) {
//   var proxyHost;
//   var pattern = /^\/songza-api\/(.*)/g;
//   debugger;
//   console.log(req.url);
//   if (pattern.exec(req.url)) {
//     proxyHost = 'http://songza.com/api/1/' + req.url.match(pattern)[0];
//     console.log("9001 proxy server requested, proxyHost: ");
//     console.log(proxyHost);
//     //req.headers["X-CUSTOM-API-KEY"] = 'my-api-key';
//     proxy.proxyRequest(req, res, {
//       target : proxyHost
//     });
//   }
// }).listen(9001);

console.log("PROXY LISTENING ON 9001");

/*
httpProxy.createProxyServer({target:'http://songza.com/api/1'}).listen(8000);

app.all("/songza-api/*", function(req, res) {
  console.log("old request url " + req.url)
  req.url = '/' + req.url.split('/').slice(2).join('/'); // remove the '/api' part
  console.log("new request url " + req.url)
  httpProxy.proxyRequest(req, res, {
    host: "other_domain.com",
    port: 3000
  });
});
*/

// Expose app
exports = module.exports = app;
