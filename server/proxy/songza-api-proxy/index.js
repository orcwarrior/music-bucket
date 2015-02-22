/**
 * Created by orcwarrior on 2015-02-22.
 */
'use strict';

var express = require('express');
var config = require('../../config/environment');
var http = require('http');


// Middleware:
module.exports = function(req, res) {
  var pattern = /\/songza-api-proxy\/(.*)/;
  if (pattern.exec(req.url)) {
    var proxyHost = 'http://transparent-proxy.herokuapp.com/proxy.php?' /*+ req.url.match(pattern)[2] + '&*/ + '__dest_url=/' + req.url.match(pattern)[1];
    console.log(proxyHost);
    res.setHeader('Access-Control-Allow-Origin', 'http://songza.com');


    // req.headers['Access-Control-Allow-Origin'] = req.headers['origin'];
    // req.headers['Access-Control-Allow-Credentials'] = "true";
    res.setHeader('Access-Control-Allow-Origin', config.ip);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    try {
      proxy.web(req, res, { target: proxyHost });
    }
    catch (error) {
      console.log(error.message);
    }
  }
};
