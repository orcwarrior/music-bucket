'use strict';

var express = require('express');
var config = require('../../config/environment');

var request = require('request');
// Middleware:
module.exports = function (req, res) {
  var pattern = /\/proxy\/(.*)/;
  //var proxyHost = 'http://coverartarchive.org/release/' + req.url.match(pattern)[1];
  //var proxyPath = '/release/' + req.url.match(pattern)[1];
  var proxyPath = req.url.match(pattern)[1] + "";

  console.warn("generic proxy requested, proxyPath: " + proxyPath + ", match: " + req.url.match(pattern)[1]);
  if (!proxyPath || proxyPath === "") {
    res.status(500);
    res.end();
    return;
  }

  request(proxyPath, {timeout: 15000})
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(res).on('error', function (e) {
      res.status(500);
      res.json(e);
    });
};
