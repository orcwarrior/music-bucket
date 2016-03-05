'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PlaylistSchema = new Schema({
  name: String,
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  _base: String,
  authorName: String,
  description: String,
  entries: Schema.Types.Mixed,
  songsCount: Number,
  sampleSongs: Array,
  visibility: String,
  tags: Array,
  imageUrl: String,
  version: String,
  modified: {type: Date, default: Date.now},
  totalPlaytime: {type: Number, default: 0}
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
