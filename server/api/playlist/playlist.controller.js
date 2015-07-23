'use strict';

var _ = require('lodash');
var Playlist = require('./playlist.model');

// Get list of playlists
exports.index = function(req, res) {
  var uId = (_.isUndefined(req.user)) ? null : req.user._id;
  Playlist.find({ $or:
                  [ {visibility: { $in : ["public", null] }},
                    {author: uId, visibility: "private"}]
                }, function (err, playlists) {
    if(err) { return handleError(res, err); }
    return res.json(200, playlists);
  });
};

// Get a single playlist
exports.show = function(req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    return res.json(playlist);
  });
};

// Creates a new playlist in the DB.
exports.create = function(req, res) {
  Playlist.create(req.body, function(err, playlist) {
    if(err) { return handleError(res, err); }
    return res.json(201, playlist);
  });
};

// Updates an existing playlist in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }

    // DK: Check if current user is author of an playlist:
    if (playlist.author.toString() !== req.user.id) {
      return res.send(401);
    }

    var updated = _.merge(playlist, req.body);
    updated.entries = req.body.entries;
    updated.modified = new Date();
    console.log("UPDATED PLAYLIST: ");
    console.log(updated);
    // DK: Otherwise mongo don't see difference in documents
    playlist.remove(function (err) {
      if (err) { return handleError(res, err); }
      Playlist.create(updated, function (err, playlist) {
        if (err) { return handleError(res, err); }
        return res.json(200, playlist);
      });
    });
  });
};

// Deletes a playlist from the DB.
exports.destroy = function(req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }

    // DK: Check if current user is author of an playlist:
    if (playlist.author.toString() !== req.user.id) {
      return res.send(401);
    }
    playlist.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
