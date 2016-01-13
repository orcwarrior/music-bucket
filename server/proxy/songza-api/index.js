'use strict';

var express = require('express');
var config = require('../../config/environment');
var zlib = require("zlib");
var through = require('through')
var httpProxy = require('http-proxy');
var proxy = httpProxy.createServer(
    {xfwd: true, changeOrigin: true}),
  url = require('url');
var songzaLurker = require("../../songzaLurker");

// Middleware:
module.exports = function (req, res) {
  var pattern = /^\/songza-api\/(.*)/;
  var proxyHost = 'http://songza.com/' + req.url.match(pattern)[1];
  // BUGFIX: request url haven't '?' character, add it it resolves some strange proxy error :/
  if (req.url.match(pattern)[1].indexOf('?') === -1)
    proxyHost += '?';
  res.setHeader('Access-Control-Allow-Origin', 'unknown');
  res.setHeader('Access-Control-Allow-Credentials', 'true');


  try {
    proxy.web(req, res, {target: proxyHost});
  }
  catch (error) {
    console.warn("Proxy.web error:");
    console.warn(error.message);
  };
};


// Response is gzip compressed, need to be handled manually
proxy.on('proxyRes', function (proxyReq, req, res, options) {
  var resultStream = through();
  switch (proxyReq.headers['content-encoding']) {
    case 'gzip':
      proxyReq.pipe(zlib.createGunzip()).pipe(resultStream);
      break;
    case 'deflate':
      proxyReq.pipe(zlib.createInflate()).pipe(resultStream);
      break;
    default:
      proxyReq.pipe(resultStream);
  }
  var resultStreamData = "";
  resultStream.on('error', function (err) {
    console.error("stream error:");
    console.error(err);
  });
  resultStream.on('data', function (chunk) {
    resultStreamData += chunk.toString();
  });
  resultStream.on('end', function () {
    songzaLurker.processSongzaRequest(req, res, JSON.parse(resultStreamData));
  });
});
proxy.on('error', function (err) {
  console.error("proxy error:");
  console.error(err);
});

// Proxy event:
proxy.on('end', function (proxyRes, req, res) {
  // proxyRes.headers["access-control-allow-origin"] = req.headers['origin'];
  //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});
proxy.on('error', function (error) {
  console.warn('There was an error with proxy: ');
  console.warn(error);
});
