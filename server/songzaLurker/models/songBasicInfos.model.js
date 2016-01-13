'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var songBasicInfos = new Schema({
  artist: String,
  title: String,
  album: String,
  duration: Number, // in secs
  votes: {up: Number, down: Number},
  songzaId: String // songzaSongId
});

songBasicInfos.methods.mapper = function (song) {
  // console.log("songBasicInfos.methods.mapper");
  this.artist = song.song.artist.name;
  this.title = song.song.title;
  this.album = song.song.album;
  this.votes.up = this.votes.down = 0;
  this.songzaId = song.song.id;
  this.duration = song.song.duration;
};
songBasicInfos.statics.create = function (songzaObj, cb) {
  var schema = this;
  console.log("songBasicInfos.statics.create");
  this.findOne({'songzaId': songzaObj.song.id}, function (err, song) {
    if (err) return cb(err, song);
    if (song) return cb({err: "there is already song with songza-id: " + songzaObj.song.id}, song);
    else {
      var createdSong = new schema({});
      createdSong.mapper(songzaObj);
      createdSong.save(cb);
    }
  });

};
module.exports = mongoose.model('songBasicInfos', songBasicInfos, 'songBasicInfos');
