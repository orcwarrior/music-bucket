'use strict';

var express = require('express');
var config = require('../../config/environment');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({xfwd: true, changeOrigin: true}),
  url = require('url');

var http = require('follow-redirects').http;
var request = require('request');
// Middleware:
module.exports = function (req, res) {
  var pattern = /^\/coverartarchive-api\/(.*)/;
  //var proxyHost = 'http://coverartarchive.org/release/' + req.url.match(pattern)[1];
  //var proxyPath = '/release/' + req.url.match(pattern)[1];
  var proxyPath = 'http://coverartarchive.org/release/' + req.url.match(pattern)[1] + "";

  console.warn("proxy-url requested, proxyPath: " + proxyPath + ", match: " + req.url.match(pattern)[1]);


  request(proxyPath, {timeout : 60000}, function (err, response, body) {
    if (err) {
      res.writeHead(500);
      res.end(JSON.stringify(err));
      return;
    };
    console.warn(response.statusCode); // 200
    console.warn(response.headers['content-type']); // 'image/png'
    console.warn(err);
    console.warn(body);
    res.writeHead(response.statusCode);
    res.end(body);
  });
};
