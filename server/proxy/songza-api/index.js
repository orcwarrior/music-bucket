'use strict';

var express = require('express');
var config = require('../../config/environment');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({xfwd : true, changeOrigin: true}),
  url = require('url');

// Middleware:
module.exports = function(req, res) {
  var pattern = /^\/songza-api\/(.*)/;
  var proxyHost = 'http://songza.com/api/1/' + req.url.match(pattern)[1];
  // BUGFIX: request url haven't '?' character, add it it resolves some strange proxy error :/
  if (req.url.match(pattern)[1].indexOf('?') === -1)
    proxyHost += '?';
  console.warn("9001 proxy server requested, proxyHost: " + proxyHost);
  console.warn("headers.orgin" + req.headers['origin']);
  console.warn("config.ip" + config.ip);

  // req.headers['Access-Control-Allow-Origin'] = req.headers['origin'];
  // req.headers['Access-Control-Allow-Credentials'] = "true";
  res.setHeader('Access-Control-Allow-Origin', 'http://music-bucket.herokuapp.com/');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    proxy.web(req, res, { target: proxyHost });
  }
  catch (error) {
    console.warn("Proxy.web error:");
    console.warn(error.message);
  }
};

// Proxy event:

proxy.on('proxyRes', function (proxyRes, req, res) {
  // proxyRes.headers["access-control-allow-origin"] = req.headers['origin'];
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});
proxy.on('error', function (error) {
  console.warn('There was an error with proxy: ');
  console.warn(error);
});
