'use strict';

var _ = require('lodash');
var Playlist = require('./playlist.model');

function _escapeMongoKey(id) {
  if (!_.isString(id)) return id;
  return id.replace(new RegExp('\\.', 'g'), ':e:')
    .replace(new RegExp('\\$', 'g'), ':d:');
}
function _unescapeMongoKey(id) {
  if (!_.isString(id)) return id;
  return id.replace(new RegExp(':e:', 'g'), '\.')
    .replace(new RegExp(':d:', 'g'), '\$');
}

function _fixPlaylist(playlist) {
  var fixedPlaylistEntries = {};
  _.each(playlist.entries, function (entry, entryKey) {
    var fixedEntryEntries = _.clone(entry);
    fixedEntryEntries.entries = {};
    _.each(entry.entries, function (song, songId) {
      fixedEntryEntries.entries[_escapeMongoKey(songId)] = song;
    });
    fixedPlaylistEntries[_escapeMongoKey(entryKey)] = fixedEntryEntries;
  });
  playlist.entries = fixedPlaylistEntries;
  return playlist;
}
function _restorePlaylist(playlist) {
  var fixedPlaylistEntries = {};
  _.each(playlist.entries, function (entry, entryKey) {
    var fixedEntryEntries = _.clone(entry);
    fixedEntryEntries.entries = {};
    _.each(entry.entries, function (song, songId) {
      fixedEntryEntries.entries[_unescapeMongoKey(songId)] = song;
    });
    fixedPlaylistEntries[_unescapeMongoKey(entryKey)] = fixedEntryEntries;
  });
  playlist.entries = fixedPlaylistEntries;
  return playlist;
}
// Get list of playlists
exports.index = function (req, res) {
  var uId = (_.isUndefined(req.user)) ? null : req.user._id;
  Playlist.find({
    $or: [{visibility: {$in: ["public", null]}},
      {author: uId, visibility: "private"}]
  })
    .lean()
    .exec(function (err, playlists) {
      if (err) {
        return handleError(res, err);
      }
      //console.log(_.last(playlists));
      var restoredPlaylists = _.map(playlists, function (p) {
        return _restorePlaylist(p);
      });
      console.log(_.last(restoredPlaylists));
      return res.json(200, restoredPlaylists);
    });
};

// Get a single playlist
exports.show = function (req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) {
      return handleError(res, err);
    }
    if (!playlist) {
      return res.send(404);
    }
    return res.json(_restorePlaylist(playlist));
  });
};

// Creates a new playlist in the DB.
exports.create = function (req, res) {
  Playlist.create(_fixPlaylist(req.body), function (err, playlist) {
    if (err) {
      console.error(err);
      return handleError(res, err);
    }
    return res.json(201, _restorePlaylist(playlist));
  });
};

// Updates an existing playlist in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) {
      return handleError(res, err);
    }
    if (!playlist) {
      return res.send(404);
    }

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
      if (err) {
        return handleError(res, err);
      }
      Playlist.create(_fixPlaylist(updated), function (err, playlist) {
        if (err) {
          return handleError(res, err);
        }
        return res.json(200, _restorePlaylist(playlist));
      });
    });
  });
};

// Deletes a playlist from the DB.
exports.destroy = function (req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) {
      return handleError(res, err);
    }
    if (!playlist) {
      return res.send(404);
    }

    // DK: Check if current user is author of an playlist:
    if (playlist.author.toString() !== req.user.id) {
      return res.send(401);
    }
    playlist.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

exports.advanceTimer = function (req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) {
      return handleError(res, err);
    }
    if (!playlist) {
      return res.send(404);
    }

    playlist.totalPlaytime++;
    playlist.save(function (err) {
      if (err) return handleError(res, err);
      res.send(200);
    });

  });
}

function handleError(res, err) {
  return res.send(500, err);
}
