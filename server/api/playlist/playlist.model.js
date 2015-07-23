'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var PlaylistSchema = new Schema({
                                  name       : String,
                                  author     : {
                                    type: Schema.ObjectId,
                                    ref : 'User'
                                  },
                                  authorName : String,
                                  entries    : Array,
                                  songsCount : Number,
                                  sampleSongs: Array,
                                  visibility: String,
                                  tags : Array,
                                  imageUrl: String,
                                  modified: { type: Date, default: Date.now }
                                });

module.exports = mongoose.model('Playlist', PlaylistSchema);
