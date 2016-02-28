/**
 * Created by orcwa on 19.02.2016.
 */
'use strict';

var express = require('express');
var _ = require('lodash');
var daytimeTargetSchema = require('../../../songzaLurker/models/metaDaytimeTarget.model.js');

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
      path: 'stations', populate: {
        path: 'situations stations'
      }
    })
    .populate({
      path: 'situations', populate: {
        path: 'situations stations'
      }
    })
    .exec(function (err, daytimeTargets) {
      console.log(daytimeTargets);
      if (!daytimeTargets.length && req.query.day) {
        // Try again without concrete day:
        delete req.query.day;
        return module.exports(req, res)
      } else if (!daytimeTargets.length) {
        return res.json(404, {err: "this period sitatuions not found"});
      }
      var masterDaytime = _.reduce(daytimeTargets, function (master, cur) {
        master.stations.concat(cur.stations);
        master.situations.concat(cur.situations);
        return master;
      });
      masterDaytime.stations = _.compact(masterDaytime.stations);
      masterDaytime.situations = _.compact(masterDaytime.situations);

      console.log(masterDaytime);
      return res.json(200, masterDaytime);
    });

};
