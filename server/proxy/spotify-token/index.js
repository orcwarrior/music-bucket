'use strict';

var express = require('express');
var https = require('https');
var _ = require('lodash');
var querystring = require('querystring');

// Middleware:
var spotifyClientID = "68166e0a3ed34236b1d99f51a1c52d16";
var spotifyClientSecret = "bb366cb3bbdf402d9e0855b7896924af";
var basicToken = new Buffer(spotifyClientID + ":" + spotifyClientSecret).toString('base64');

module.exports = function (req, res) {
  var authorizationHeader = 'Basic ' + basicToken;
  req.query.redirect_uri = decodeURIComponent(req.query.redirect_uri);
  req.query = _.extend(req.query, {
    client_id: spotifyClientID,
    client_secret: spotifyClientSecret
  });
  var postData = querystring.stringify(req.query);
  // An object of options to indicate where to post to
  var postConfig = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'Authorization': authorizationHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  console.log(postData);

  // Set up the request
  var post_req = https.request(postConfig, function (postRes) {
    postRes.setEncoding('utf8');
    postRes.on('data', function (chunk) {
      console.log('Response: ' + chunk);
      res.write(chunk);
    });
    postRes.on('end', function () {
      res.status(postRes.statusCode).end();
    })
  });
  post_req.on('error', function (err) {
    console.error(err);
  })

  post_req.write(postData);
  post_req.end();
};
