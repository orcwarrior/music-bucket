/**
 * Created by orcwa on 24.12.2015.
 */
var promise = require('promise');
var stationSchema = require('./models/station.model');
var songInfosSchema = require('./models/songBasicInfos.model');
var _ = require('lodash');
var songzaNextSongProxy = require('./songzaNextSongProxy');
var songzaLurkerSchema = require('./models/stationsLurker.model');
var config = require('./config');
var songzaConstructor = require('songza');
var songza = new songzaConstructor({userAgent: 'mb-backend/v0'});

// so max. request before pushing it back is:
// songs * ratio + min < requests
var REQUEST_TO_SUCESS_RATIO = 0;
const REQUEST_TO_SUCCES_MIN = 10;

var lastSongIds = {}; // key: stationId, value: songSongzaId;
var lastRequestsCnt = {}; // key: stationId, value: requestCnt;
var foundedSongIds = {}; // key: stationId, value: [songSongzaId];
var fetchedStations = [];
var fetcherIdx = 0;
var fetchersCnt = 0;

function fetchWorker(stationId, songsFetcher) {
  var self = this;
  this.idx = ++fetcherIdx;
  this.consoleBuffer = "";
  this.stationId = stationId;
  this.consolePush = function (msg) {
    this.consoleBuffer += msg;
  };
  this.consolePrint = function (msg) {
    if (_.isUndefined(msg)) msg = "";
    console.log(this.consoleBuffer + msg);
    this.consoleBuffer = "";
  };

  console.log("fetchWorker." + this.idx + "." + stationId);
  fetchersCnt++;
  this.run = function (stationId) {
    var self = this;
    this.consolePush("fetchWorker." + this.idx + ".run");
    songzaNextSongProxy(stationId)
      .then(function (song) {
        lastRequestsCnt[stationId]++;
        if (self.validateStationSong(stationId, song)) {
          self.pushNewSong(stationId, song)
            .then(function () {
              if (self.isStationCompleted(stationId)) {
                self.pickNextStation(stationId);
                fetchersCnt--;
              } else {
                self._runDelayed(stationId);
              }
            }, function (err) {
              self.consolePush(".error");
              console.warn(err);
              self._runDelayed(stationId);
            });
        } else if (self.isStationCompleted(stationId)) {
          self.pickNextStation(stationId);
        } else {
          self._runDelayed(stationId);
        }
      })
      .catch(function (err) {
        self.consolePush("songzaNextSongProxy.error");
        console.warn("Songza station end!");
        if (err.error.code === 'end') {
          self.consolePush(".end");
          self.pickNextStation(stationId);
          fetchersCnt--;
        } else {
          self._runDelayed(stationId);
        }
      })
  };
  this._runDelayed = function (stationId) {
    self.consolePrint();

    setTimeout(function () {
      self.run(stationId);
    }, config.requestDelay - Math.random() * (config.requestDelay / 5));
  };
  this.validateStationSong = function (stationId, song) {
    var songAlreadyFounded = _.find(foundedSongIds[stationId], function (songId) {
      return songId == song.song.id.toString();
    });
    var validation = (!_.isUndefined(song) && !_.isUndefined(song.song) && _.isUndefined(songAlreadyFounded));
    this.consolePush(".validateSong." + song.song.id + "." + validation);
    return validation;
  };
  this.pushNewSong = function (stationId, song) {
    // setup locals:
    var self = this;
    return new Promise(function (resolve, reject) {
      // console.log("fetchWorker." + self.idx + ".pushNewSong." + song.song.id);
      lastSongIds[stationId] = song.song.id;
      if (_.isUndefined(foundedSongIds[stationId]))
        foundedSongIds[stationId] = [];
      foundedSongIds[stationId].push(song.song.id.toString());
      // Notify to songza that song been played:
      songza.station.notifyPlay(stationId, song.song.id);
      songInfosSchema.create(song, function (err, songDB) {
        stationSchema.findOneAndUpdate({'_id': stationId},
          {
            '$addToSet': {'songs': songDB._id}
          }, {upsert: true}, function (err, station) {
            if (err) console.warn(err);
          });
        if (err) {
          console.warn(err);
          if (songDB)
            resolve(songDB);
          reject(err);
        }
        self.consolePush(".pushNewSong." + songDB._id);
        resolve(songDB);
      });
    });
  };
  this.isStationCompleted = function (stationId) {
    // TODO: Add more suble methods
    fetchedStations = _.compact(fetchedStations);
    var station = _.find(fetchedStations, {'_id': stationId});
    if (_.isUndefined(station)) {
      this.consolePush("fetchWorker." + this.idx + ".stationCompleted.error!station");
      stationSchema.findById(stationId, function (err, station) {
        fetchedStations[stationId] = station;
      });
      return false;
    }
    var completedFully = (station.songsCount === station.songs.length);
    var abandoned = (((station.songsCount || 1) * REQUEST_TO_SUCESS_RATIO) + REQUEST_TO_SUCCES_MIN) < lastRequestsCnt[stationId];
    this.consolePush(".stationCompleted." + lastRequestsCnt[stationId] + "/" + ((station.songsCount || 1) * REQUEST_TO_SUCESS_RATIO + REQUEST_TO_SUCCES_MIN).toString());
    if (completedFully || abandoned)
      this.consolePush(".c" + completedFully + ".a" + abandoned);

    return completedFully || abandoned;
  };
  this.pickNextStation = function (stationId) {
    //console.log("songFetcher.storeStationAndPickNext");
    var self = this;
    stationId = stationId.toString();

    function secondPartOfPicking(lurkerId, unresolved0Id) {
      if (_.isNull(unresolved0Id)) {
        // BUGFIX: there is no more unresolved this call will run swaping unresolved <-> abandoned
        return songsFetcher.swapStationsAndRunNew(stationId, null);
      }
      songzaLurkerSchema.findOneAndUpdate({'_id': lurkerId},
        {
          '$push': {
            'processing': unresolved0Id
          },
          '$pull': {'unresolved': unresolved0Id}
        }, {upsert: true, new: true},
        function (err, obj) {
          if (err) console.warn(err);
          self.consolePush(".pickNextStation.II." + _.last(obj.processing));

          obj.save(function (err, objPostMiddleware) {
            self.songzaLurker = objPostMiddleware; // update lurker
            songsFetcher.swapStationsAndRunNew(stationId, _.last(objPostMiddleware.processing));
            songsFetcher.fetchWorkerDone(self);
          });
        });
    }

    var station = _.find(fetchedStations, {'_id': stationId});
    var stationSongs = _.map(station.songs, function (s) {
      return s.toString();
    });
    stationSongs = _.union(stationSongs, foundedSongIds);
    var abandoned = station.songsCount > stationSongs.length;
    if (abandoned) {
      songzaLurkerSchema.findOneAndUpdate({'_id': songsFetcher.songzaLurker._id},
        {
          '$pull': {'processing': stationId},
          '$push': {
            'abandoned': stationId
          },
          $inc: {'requests': lastRequestsCnt[stationId]}
        }, {upsert: true, new: true}, function (err, obj) {
          if (err) console.warn(err);
          self.consolePush(".pickNextStation.Ia" + _.last(obj.processing));
          if (obj.processing.length < config.maxProcessedStationsParallel)
            secondPartOfPicking(obj._id, obj.unresolved[0]);
        });

    } else {
      songzaLurkerSchema.findOneAndUpdate({'_id': songsFetcher.songzaLurker._id},
        {
          '$pull': {'processing': stationId},
          '$push': {
            'completed': stationId
          },
          $inc: {'requests': lastRequestsCnt[stationId]}
        }, {upsert: true}, function (err, obj) {
          if (err) console.warn(err);
          self.consolePush(".pickNextStation.Ib" + _.last(obj.processing));
          if (obj.processing.length < config.maxProcessedStationsParallel)
            secondPartOfPicking(obj._id, obj.unresolved[0]);
        });
    }
  };

} // EOF fetchWorker


function songsFetcher() {

  this.songzaLurker = undefined;
  this.run = function (songzaLurker) {
    // Don't get over limit of song fetchers
    if (fetchersCnt >= config.maxProcessedStationsParallel) return;

    console.log("songFetcher.run");
    var self = this;
    REQUEST_TO_SUCESS_RATIO = songzaLurker.requestRatio;
    if (_.isEmpty(_.difference(songzaLurker.processing, fetchedStations))
      && (!_.isEmpty(fetchedStations) || !_.isEmpty(fetchedStations))) {
      console.log("songFetcher.run.noChangesInProcessing");
      this.songzaLurker = songzaLurker;
    } else {
      this.songzaLurker = songzaLurker;
      this.pushAdditionalStations()
        .then(function (updatedSongzaLurker) {
          self.songzaLurker = updatedSongzaLurker;
          self.init().then(function (newFetchedStations) {
            fetchedStations = newFetchedStations;
            self.fetchSongs(fetchedStations);
          });
        });
    }
  };
  this.init = function () {
    console.log("songFetcher.init");
    var promises = [];
    var self = this;
    this.songzaLurker.processing = _.compact(this.songzaLurker.processing);
    _.each(this.songzaLurker.processing, function (stationId) {
      promises.push(self._initStationInfos(stationId));
    });

    return Promise.all(promises);
  };
  this.pushAdditionalStations = function () {
    var self = this;
    console.log("songFetcher.pushAdditionalStations");
    var actualLurker = this.songzaLurker;
    return new Promise(function (resolve, reject) {
      if (actualLurker.processing.length >= config.maxProcessedStationsParallel) {
        console.log("songFetcher.pushAdditionalStations: processing.len > maxParallel");
        resolve(actualLurker);
      }
      else if (actualLurker.unresolved.length == 0 && actualLurker.abandoned.length) {
        return self.swapUnresolvedWithAbandonedStations(resolve, reject);
      }
      else {
        songzaLurkerSchema.findOne({'_id': actualLurker._id}, function (err, lurker) {
          var additionalStationsCnt = config.maxProcessedStationsParallel - lurker.processing.length;
          var additionalStations = _.take(lurker.unresolved, additionalStationsCnt);

          console.log("songFetcher.pushAdditionalStations.pushStations:" + additionalStations);
          if (additionalStationsCnt)
            songzaLurkerSchema.findOneAndUpdate({'_id': actualLurker._id},
              {
                '$push': {'processing': {'$each': additionalStations}},
                '$pop': {'unresolved': -additionalStationsCnt}
              }, {upsert: true, new: true}, function (err, obj) {
                if (err) {
                  console.warn(err);
                  reject(obj);
                } else {
                  obj.save(function (err, objPostMiddleware) {
                  });
                  resolve(obj);
                }
              });
          else resolve(actualLurker); // resolve updates lurker
        })
      }
    });
  };
  this.swapUnresolvedWithAbandonedStations = function (resolve, reject) {
    var self = this;
    console.log("songsFetcher.swapUnresolvedWithAbandonedStations");
    songzaLurkerSchema.findOneAndUpdate({'_id': this.songzaLurker._id},
      {
        '$inc': {'requestRatio': 0.5},
        '$rename': {'abandoned': 'unresolved'}
      }, {upsert: true, new: true}, function (err, lurker) {
        if (err) {
          console.warn(err);
          reject(lurker);
        } else {
          self.songzaLurker = lurker;
          resolve(lurker);
        }
      });
  };
  this.swapStationsAndRunNew = function (oldStationId, newStationId) {
    console.log("songFetcher.swapStationsAndRunNew." + oldStationId + "->" + newStationId);
    // there is no new station and no new workers
    // push additional stations will fire abandoned <--> unresolved swap
    // with updating of ratio (increment).
    if (_.isNull(newStationId)) {
      if (fetchersCnt === 0) {
        console.log("songFetcher.swapStationsAndRunNew.isNull");
        return this.pushAdditionalStations()
          .then(function (updatedSongzaLurker) {
            self.songzaLurker = updatedSongzaLurker;
            self.init().then(function (newFetchedStations) {
              fetchedStations = newFetchedStations;
              self.fetchSongs(fetchedStations);
            });
          });
      } else return console.warn("Cannot swap to null");
    }
    var self = this;
    fetchedStations = _.compact(fetchedStations);
    fetchedStations = _.reject(fetchedStations, {'_id': oldStationId});
    this._initStationInfos(newStationId)
      .then(function (newStation) {
        fetchedStations.push(newStation);
        var worker = new fetchWorker(newStationId, self);
        worker.run(newStationId);
      });
  };
  this._initStationInfos = function (stationId) {
    console.log("songFetcher._initStationInfos." + stationId);
    return new Promise(function (resolve, reject) {
        stationSchema.findById(stationId)
          .populate('songs', 'songzaId')
          .exec(function (err, station) {
            if (err) {
              console.log("songFetcher._initStationInfos.reject." + stationId);
              reject(err);
              return console.error(err);
            }
            // station sometimes is undefined !!!!
            if (_.isNull(station)) {
              stationSchema.create({id: stationId}, function (newStation) {
                foundedSongIds[stationId] = [];
                lastRequestsCnt[stationId] = 0;
                lastSongIds[stationId] = undefined;
                console.log("songFetcher._initStationInfos.resolve(create)." + stationId);
                resolve(newStation);
              })
            } else {
              foundedSongIds[stationId] = _.map(station.songs, 'songzaId') || [];
              lastRequestsCnt[stationId] = 0;
              lastSongIds[stationId] = undefined;
              console.log("songFetcher.initStationInfos.resolve." + stationId);
              resolve(station);
            }
          });
      }
    );
  };
  this.fetchSongs = function (fetchedStations) {
    var self = this;
    console.log("songFetcher.fetchSongs." + fetchedStations.length);
    _.each(fetchedStations, function (station) {
      var worker = new fetchWorker(station._id, self);
      worker.run(station._id);
    });
  };
  this.fetchWorkerDone = function (fetchWorker) {
    console.log("songsFetcher.fetchWorkerDone.fetchWorker" + fetchWorker.idx);
    delete foundedSongIds[fetchWorker.stationId];
    delete lastRequestsCnt[fetchWorker.stationId];
    delete lastSongIds[fetchWorker.stationId];
    // find by _id
    var statIdx = _.findIndex(fetchedStations, function (stat) {
      return stat._id == fetchWorker.stationId;
    });
    if (statIdx !== -1) delete fetchedStations[statIdx];
    delete fetchWorker;

  };

}

var exports = module.exports = new songsFetcher();
