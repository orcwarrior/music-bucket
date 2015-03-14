'use strict';

var express = require('express');
var config = require('../../config/environment');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({xfwd : true, changeOrigin: true }),
  url = require('url');

// Middleware:
module.exports = function(req, res) {
  var pattern = /^\/musicbrainz-api\/(.*)/;
  var proxyHost = 'http://musicbrainz.org/ws/2/' + req.url.match(pattern)[1];
  // BUGFIX: request url haven't '?' character, add it it resolves some strange proxy error :/
  if (req.url.match(pattern)[1].indexOf('?') === -1)
    proxyHost += '?';
  console.warn("proxy-url requested, proxyHost: " + proxyHost);

  req.url = proxyHost;
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
