'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var situationModel = require('./situation.model');
var _ = require("lodash");

var metaDaytimeTarget = new Schema({
  timeOfDay: {type: Number, required: true},
  dayOfWeek: {type: Number, required: true},
  stations: [{
    type: Schema.ObjectId,
    ref: 'songzaStation',
    default: []
  }],
  situations: [{
    type: Schema.ObjectId,
    ref: 'songzaSituation'
  }]
});


// Mapper - maps songza object to entity object
metaDaytimeTarget.methods.mapper = function (songzaObj) {
  console.log("metaDaytimeTarget.methods.mapper");

  this.timeOfDay = songzaObj.timeOfDay;
  this.dayOfWeek = songzaObj.dayOfWeek;
  this.situations = _.map(_.omit(songzaObj, 'timeOfDay', 'dayOfWeek'),
    function (sit) {
      return mongoose.Types.ObjectId(sit.id);
    });
  console.log(this);
};
// Create - run mapper and store object in db
metaDaytimeTarget.statics.create = function (config, cb) {
  console.log("metaDaytimeTarget.methods.create");
  if (_.isUndefined(config.req.query.period)
  || _.isUndefined(config.req.query.day)) {
    return console.warn("metaDaytimeTarget.statics.create.noPeriodorDay!!")
  }
  var self = this;
  var situationIds = _.map(config.resBody, function (sit) {
    return sit.id;
  });

  // check if there is already document with same timeOfDay and Day
  this.findOneAndUpdate({
      timeOfDay: config.req.query.period,
      dayOfWeek: config.req.query.day
    },
    {$addToSet: {situations: {$each: situationIds}}},
    {new: false},
    function (err, oldDaytimeTarget) {
      if (_.isNull(oldDaytimeTarget) || _.isUndefined(oldDaytimeTarget)) return createDaytimeTarget(config, cb, self);
      else return attachNewSituations(situationIds, config.resBody, oldDaytimeTarget);
    });
};

function attachNewSituations(situationIds, fullNewSituations, oldDaytimeTarget) {
  console.log("metaDaytimeTarget.subroutine.attachNewSituations");
  var oldSituations = _.compact(oldDaytimeTarget.situations);
  oldSituations = _.map(oldSituations, function (sit) {
    return sit.toString(); // Cannot read property 'toString' of null
  });
  var newSituations = _.difference(oldSituations, situationIds);
  console.log(oldDaytimeTarget.situations+"+"+newSituations);
  // create new sub-situations:
  console.log("New situations: " + newSituations);
  _.each(newSituations, function (sit) {
    // find full situation model:
    var situationObj = _.find(fullNewSituations, function (lookupSituation) {
      return lookupSituation.id == sit;
    });
    situationModel.create(situationObj, function (err, obj) {
    });
  });
}
function createDaytimeTarget(config, cb, daytimeSituationSchema) {
  // create sub-situations:
  console.log("metaDaytimeTarget.subroutine.createDaytimeTarget");
  _.each(config.resBody, function (sit) {
    situationModel.create(sit, function (err, obj) {
      // if (err) console.info(err);
    });
  });

// hacky fixes:
  config.resBody.timeOfDay = config.req.query.period;
  config.resBody.dayOfWeek = config.req.query.day;

  var daytimeTarget = new daytimeSituationSchema({});
  daytimeTarget.mapper(config.resBody);
  return daytimeTarget.save(cb);
}

module.exports = mongoose.model('songzaMetaDaytimeTarget', metaDaytimeTarget, 'songzaMetaDaytimeTarget');
