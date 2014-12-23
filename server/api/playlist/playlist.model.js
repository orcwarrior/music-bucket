'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaylistSchema = new Schema({
  name: String,
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  entries: Array,
  songsCount: Number
 });

module.exports = mongoose.model('Playlist', PlaylistSchema);
