'use strict';

var mongoose = require('mongoose'),
  stationsLurker = require('../index.js'),
  Schema = mongoose.Schema,
  stationQueuedFetcher = require('../stationQueuedFetcher');
var _ = require('lodash');

var station = new Schema({
  /* resolved all data about station? */
  //_resolved: { type: Boolean, default: false },
  _id: String,
  _completed: {type: Boolean, default: false},
  cover: String,
  creator: String,
  description: String,
  featuredArtist: Array,
  name: {type: String, required: true},
  songsCount: Number,
  songs: [{
    type: Schema.ObjectId,
    ref: 'songBasicInfos'
  }],
  requestsCount: Number
}, {
  toObject: {
    virtuals: true
  }
});

station.virtual('progress').get(function () {
  return this.songs.length / this.songsCount;
});
// Mapper - maps songza object to entity object
station.methods.mapper = function (songzaObj) {
  // console.log("station.methods.mapper");

  if (_.isObject(songzaObj)) {
    this._id = songzaObj.id;
    this.name = songzaObj.name;
    this.description = songzaObj.description;
    this.cover = songzaObj.cover_url;
    this.creator = songzaObj.creator_name;
    this.featuredArtist = _.map(songzaObj.featured_artists, 'name');
    this.songsCount = songzaObj.song_count;
  } else {
    this._id = songzaObj;
  }
};
// songzaObj - could have id only
station.statics.create = function (songzaObj, cb) {
  var schema = this;
  if (_.isNull(songzaObj) || songzaObj === "ok" || songzaObj === "true") return console.warn("passed station is null or invaild!");

  this.findById(songzaObj.id, function (err, station) {

    if (station && !_.isUndefined(station.name)) {
      return console.warn("there is already station with id: " + songzaObj.id);
    } else {
      var createdStation = new schema({});
      createdStation.mapper(songzaObj);
      createdStation.save(cb);
    }
  });

  // console.log("station.methods.create." + createdStation._id);
};
// hooks pre-validate (changed from pre save) if (it's not resolved for even a little
// - grab station infos.
station.pre('validate', function (next) {
  var selfStation = this;
  // console.log("station.pre.validate");
  if (!_.isUndefined(this.songs) && this.songsCount === this.songs.length)
    this._completed = true;

  if (_.isUndefined(this.name)) {
    // console.log("Station need to be fetched first..");
    stationQueuedFetcher.fetchStation(this._id, function (fetchedStation) {
      // What a lovely piece of code <3
      // console.log("callback for station" + fetchedStation.name);
      _.bind(station.methods.mapper, selfStation, fetchedStation)();
      next();
    });
  }
});
station.post('findOneAndUpdate', function (station) {
  if (!_.isUndefined(station.songs) && station.songsCount === station.songs.length)
    station._completed = true;
});

station.post('save', function () {
});
module.exports = mongoose.model('songzaStation', station);
