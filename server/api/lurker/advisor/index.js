/**
 * Created by orcwa on 19.02.2016.
 */
'use strict';

var express = require('express');
var _ = require('lodash');
var daytimeTargetSchema = require('../../../songzaLurker/models/metaDaytimeTarget.model.js');
var stationSchema = require('../../../songzaLurker/models/station.model');

function _collectStations(obj) {
  var flatStations = [];
  if (!_.isEmpty(obj.stations)) {
    flatStations.unshift.apply(flatStations, obj.stations);
  }
  _.each(obj.situations, function (situation) {
    flatStations.unshift.apply(flatStations, _collectStations(situation));
  });
  return flatStations;
}
function _manuallyPopulateStations(obj, stations) {
  obj.stations = _.map(obj.stations, function (station) {
    return _.find(stations, _.identity({_id: station}));
  });

  _.each(obj.situations, function (situation) {
    _manuallyPopulateStations(situation, stations);
  });
}
module.exports = function (req, res) {
  var day, period;
  if (!req.query.period)
    return res.json(422, "param period need to be providen.");
  try {
    if (req.query.day)
      day = parseInt(req.query.day);
    period = parseInt(req.query.period);
  } catch (err) {
    return res.json(500, error);
  }
  console.log("day: " + day + ", period: " + period);
  var searchQuery = (day) ? daytimeTargetSchema.find({dayOfWeek: day, timeOfDay: period})
    : daytimeTargetSchema.find({timeOfDay: period});

  searchQuery
    .populate({
      path: 'situations', populate: {
        path: 'situations' // manual stations propagation needed :<
      }
    })
    .exec(function (err, daytimeTargets) {
      if (err)
        return console.error(err);
      if (!daytimeTargets)
        return console.error("There is no daytimeTargets for given query");


      if ((!daytimeTargets || !daytimeTargets.length) && req.query.day) {
        // Try again without concrete day:
        delete req.query.day;
        return module.exports(req, res)
      } else if (!daytimeTargets || !daytimeTargets.length) {
        return res.json(404, {err: "this period sitatuions not found"});
      }
      var masterDaytime = _.reduce(daytimeTargets, function (master, cur) {
        master.stations.concat(cur.stations);
        master.situations.concat(cur.situations);
        return master;
      });
      masterDaytime.stations = _.compact(masterDaytime.stations);
      masterDaytime.situations = _.compact(masterDaytime.situations);

      var stationsToFetch = _collectStations(masterDaytime);
      stationSchema
        .find({'_id': {$in: stationsToFetch}})
        .exec(function (err, stations) {
          _manuallyPopulateStations(masterDaytime, stations);
          return res.json(200, masterDaytime);
        });
    });
};
