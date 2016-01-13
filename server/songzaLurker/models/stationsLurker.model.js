'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  Schema = mongoose.Schema;

var stationsLurkerSchema = new Schema({
  unresolved: [{
    type: String,
    ref: 'songzaStation'
  }],
  completed: [{
    default: [],
    type: String,
    ref: 'songzaStation'
  }],
  processing: [{
    type: String,
    ref: 'songzaStation'
  }],
  abandoned: [{
    type: String,
    ref: 'songzaStation'
  }], // has some of song, but it's not complete for later
  requests: {type: Number, default: 0},
  requestRatio: {type: Number, default: 1},
  _lastChangeTimestamp: {type: Date, default: Date.now}
}, {
  toJSON: {
    virtuals: true
  }
});

stationsLurkerSchema.virtual('allStations').get(function () {
  var all = this.unresolved.concat(this.completed, this.processing, this.abandoned);
  return _.compact(all);
});

stationsLurkerSchema.pre('save', function (next) {
  // Multi tasking etc. could still have them non-locked etc. errors when there a
  console.log("stationsLurkerSchema.pre.save:"+this.unresolved.length);
  this.unresolved = _.difference(this.unresolved, this.abandoned, this.completed, this.processing);
  this.unresolved = _.uniq(this.unresolved);
  this._lastChangeTimestamp = new Date();
  console.log("stationsLurkerSchema.pre.save.fin:"+this.unresolved.length);
  next();
});

module.exports = mongoose.model('songzaStationsLurker', stationsLurkerSchema, 'songzaStationsLurker');
