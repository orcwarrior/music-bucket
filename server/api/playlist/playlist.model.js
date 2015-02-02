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
                                  sampleSongs: Array
                                });

module.exports = mongoose.model('Playlist', PlaylistSchema);
