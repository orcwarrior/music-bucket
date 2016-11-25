'use strict';
var promise = require('promise');
var mongoose = require('mongoose');
var songzaStationsLurker = require('./models/stationsLurker.model');
var songzaGalleryContainer = require('./models/metaGalleryContainer.model');
var songzaSituationTargeted = require('./models/metaDaytimeTarget.model');
var songzaSituation = require('./models/situation.model');
var songzaStation = require('./models/station.model');
var songzaSongs = require('./models/songBasicInfos.model');
var songsFetcher = require('./songsFetcher');
var archiveStats = require('./models/archiveStats.model');
var _ = require('lodash');
var config = require('./config');

var globalStats = {};
var exports = module.exports = {
  _composeConstructorConfig: function (req, res, resBody) {
    return {'req': req, 'res': res, 'resBody': resBody};
  },
  // Look for gathered, still fully unresolved stations
  getSongzaLurker: function () {
    console.log('lurker.getSongzaLurker');
    var self = this;
    return new promise(function (resolve, reject) {
      songzaStationsLurker.find({}, function (err, lurker) {
        console.log('lurker.founded!');
        if (err) reject(err);
        else if (_.isEmpty(lurker)) {
          var newLurker = new songzaStationsLurker({});
          newLurker.save(function (err, lurker) {
            console.log('lurker.created!');
            if (err) reject(err);
            resolve(lurker);
          });
        }
        else {
          console.log('lurker.returnInstance');
          resolve(lurker[0]);
        }
      });
    });
  },
  stationLookup: function (stations) {
    console.log("songzaLurker.stationsLookup." + stations.length);
    this.getSongzaLurker()
      .then(function (lurker) {
        var nonCompletedStations = _.difference(stations, lurker.allStations);
        console.log("songzaLurker.stationsLookup.notCompletedStations." + nonCompletedStations.length);
        songzaStationsLurker.findOneAndUpdate({},
          {
            '$addToSet': {
              'unresolved': {'$each': nonCompletedStations}
              // 'processing': {$each: nonCompletedStations, $slice: config.maxProcessedStationsParallel}
            }
          }, {new: true},
          function (err, lurker) {
            if (err) return console.error(err);
            songsFetcher.run(lurker);
          }
        );
      });
  },
  processSongzaRequest: function (req, res, resBody) {
    return;

    var url = req.url;
    var config = this._composeConstructorConfig(req, res, resBody);

    if (url.indexOf("/situation/targeted") >= 0) {
      console.log("/situation/targeted");
      mongoose.model('songzaMetaDaytimeTarget').create(config, function (err, situation) {
      });
    }
    /*
     else if (url.indexOf("/gallery/tag/") >= 0) {
     var regex = new RegExp('/gallery/tag/(.+)');
     console.log(url);
     var type = url.match(regex)[1];
     console.log(type);
     _.each(resBody, function (gallery) {
     songzaGalleryContainer.create(type, gallery, function (err, activity) {
     });
     });
     }
     else if (url.indexOf('/search/station')) {
     _.each(resBody, function (station) {
     songzaStation.create(station, function (err, stationDb) {

     });
     });
     } */
  },
  statsProgressArchive: [],
  archiveStats: function (stats) {
    var actual = new Date();
    var d = new Date();
    // check is the first stats of day:
    d.setSeconds(d.getSeconds() - 30);
    if (_.isNaN(stats.avgProgress)) stats.avgProgress = 0; //INITIAL BUGFIX

    if (actual.getUTCDate() !== d.getUTCDate()) {
      console.log("Add stat of day: " + actual.getUTCDate() + ".v:" + stats.avgProgress);
      this.statsProgressArchive.unshift({val: stats.avgProgress, day: actual.getUTCDate()});
      this.statsProgressArchive.slice(0, 7); // first 7 days only

      archiveStats.findOneAndUpdate({},
        {'$set': {'archiveProgresses': this.statsProgressArchive}},
        {upsert: true},
        function (err, stats) {
        });
    } else if (_.isUndefined(this.statsProgressArchive[0])
      || actual.getUTCDate() != this.statsProgressArchive[0].day) {
      // push first stats as element ALWAYS:
      console.log("Add initial/first after reset stat of day: " + actual.getUTCDate() + ".v:" + stats.avgProgress);
      console.log(this.statsProgressArchive[0]);
      this.statsProgressArchive[0] = {val: stats.avgProgress, day: actual.getUTCDate()};

      archiveStats.findOneAndUpdate({},
        {'$set': {'archiveProgresses': this.statsProgressArchive}},
        {upsert: true},
        function (err, stats) {
        });
    }
    // prepare current stats object:
    stats.progressArchiveSteps = {};
    stats.progressArchiveSteps.week = (this.statsProgressArchive[6]) ? this.statsProgressArchive[6].val : 0;
    // the day before yesterday
    if (this.statsProgressArchive[2]) // step = day before - week
      stats.progressArchiveSteps.daybefore = this.statsProgressArchive[2].val - stats.progressArchiveSteps.week;
    else
      stats.progressArchiveSteps.daybefore = 0;
    // yesterday
    if (this.statsProgressArchive[1]) // step = yesterday - daybefore
      stats.progressArchiveSteps.yesterday = this.statsProgressArchive[1].val - this.statsProgressArchive[2].val;
    else
      stats.progressArchiveSteps.yesterday = 0;
    // today
    if (this.statsProgressArchive[1]) // step = today - yesterday
      stats.progressArchiveSteps.today = this.statsProgressArchive[0].val - this.statsProgressArchive[1].val;
    else
      stats.progressArchiveSteps.today = this.statsProgressArchive[0].val;
    stats.progressArchiveSteps.now = stats.avgProgress - this.statsProgressArchive[0].val;

    stats.progressArchiveSteps = _.mapValues(stats.progressArchiveSteps, function (progress) {
      return (progress * 100).toPrecision(4);
    });
  },
  calculateStats: function () {
    console.log("songzaLurker.calculateStats");
    var lurkerSelf = this;
    var stats = {};
    songzaSongs.count({}, function (err, cnt) {
      stats.songsCnt = cnt;
      songzaSituation.count({}, function (err, cnt) {
        stats.situationsCnt = cnt;
        songzaStationsLurker.findOne({})
          .populate("allStations unresolved processing abandoned completed")
          .exec(function (err, lurker) {
            if (_.isNull(lurker)) return;

            var allProgresses = _.map(lurker.allStations, function (station) {
              return station.progress || 0.5;
            });
            var abandonedProgresses = _.map(lurker.abandoned, function (station) {
              return station.progress || 0.5;
            });

            stats.avgProgress = _.reduce(allProgresses, function (total, n) {
                return total + n;
              }) / allProgresses.length;
            stats.avgAbandonedProgress = _.reduce(abandonedProgresses, function (total, n) {
                return total + n;
              }) / abandonedProgresses.length;
            stats.allSongs = 0;
            _.each(lurker.allStations, function (stat) {
              stats.allSongs += stat.songsCount || 0;
            });
            stats.resolvedSongs = 0;
            _.each(lurker.allStations, function (stat) {
              // somehow there could be station saved as string
              // but there is still no object (
              if (!_.isString(stat)) // could never be here, but yno
                stats.resolvedSongs += stat.songs.length;
            });
            lurkerSelf.archiveStats(stats);

            stats.avgProgress = (stats.avgProgress.toPrecision(4) * 100);
            stats.avgAbandonedProgress = (stats.avgAbandonedProgress.toPrecision(4) * 100);
            stats.allProgresses = allProgresses;
            stats.allStations = lurker.allStations.length;
            stats.procStations = lurker.processing.length;
            stats.completedStations = lurker.completed.length;
            stats.unresolvedStations = lurker.unresolved.length;
            stats.abandonedStations = lurker.abandoned.length;
            stats.lurkerLoop = lurker.requestRatio;
            stats.lurkerRequests = lurker.requests;
            stats.timestamp = new Date().toLocaleString();
            globalStats = stats;
            return stats;
          });
      })
    });
  },
  init: function () {
    var self = this;
    return; // no longer!!!
    this.getSongzaLurker().then(function (lurker) {
      // TODO: Passing new processing if there's none.
      //   songsFetcher.run(lurker);
    });
    archiveStats.findOne({}, function (err, stats) {
      if (stats) {
        self.statsProgressArchive = stats.archiveProgresses;
      }
      self.calculateStats();
      setInterval(_.bind(self.calculateStats, self), 1000 * 30);
    });
  },
  test1: function (req, res) {
    songzaSituationTargeted.findOne({})
      .populate({
        path: 'situations', populate: {
          path: 'situations'
        }
      })
      .exec(function (err, situationTargeted) {
        return res.json(200, situationTargeted);
      });
  },
  test2: function (req, res) {
    songzaSituation.find()
      .populate({
        path: 'stations',
        populate: {path: 'songs'}
      })
      .exec(function (err, situationTargeted) {
        return res.json(200, situationTargeted);
      });
  },
  clear: function (req, res) {
    songzaSituation.remove({}, function (err, sit) {
      songzaSituationTargeted.remove({}, function (err) {
        songzaStationsLurker.remove({}, function (err) {
          songzaStation.remove({}, function (err) {
            songzaGalleryContainer.remove({}, function (err) {
              res.end("songza infos dropped :o");
            });
            archiveStats.remove({}, function (err) {
            })
          });
        });
      });
    });
  }
  ,
  getStats: function (req, res) {
    res.json(globalStats);
  }
};
