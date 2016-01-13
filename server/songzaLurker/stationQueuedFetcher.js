/**
 * Created by orcwa on 23.12.2015.
 */

var _ = require('lodash');
var songzaConstructor = require('songza');
var songza = new songzaConstructor({userAgent: 'mb-backend/v0'});

function stationQueuedFetcher() {
  const fetchMethodDelay = 500; // 500ms without any new station queued to fetch
                                 // causes fetching to start
  const fetchMaxStationsCnt = 90;

  var self = this;

  this._fetchLocked = false;
  this._fetchTimeoutedMethod = undefined;

  this.stationsToFetchQueue = [];
  this.fetchStationsChunks = {};
  this.fetchStation = function (stationId, callback) {
      this.stationsToFetchQueue.push({'id': stationId, 'cb': callback});
      this._afterStationInclude();
  };

  this.runFetch = function (key) {
    var self = this;
    console.log("There " + this.fetchStationsChunks[key].length + " that should be fetched in chunk:" + key);
    var stationIds = _.map(this.fetchStationsChunks[key], function (stationInfo) {
      return stationInfo.id;
    });

    console.log("Fetching: "+ _.take(stationIds, 3)+"...");
    songza.station.getBatch(stationIds)
      .then(function (resolvedStations) {
        console.log("Resolved stations: " + resolvedStations.length + "/" + self.fetchStationsChunks[key].length);

        _.each(resolvedStations, function (resolvedStation) {
          var requestedStation = _.find(self.fetchStationsChunks[key], function (reqStation) {
            return reqStation.id == resolvedStation.id;
          });
          requestedStation.cb(resolvedStation);
        });
        delete self.fetchStationsChunks[key]; // clear that chunk

        // send those stations to lurker too so it will start to lookup for them:
        var lurker = new require('./index');
        setTimeout(function () {
          lurker.stationLookup(stationIds);
        }, 5000);
      });
  };

  this._delayFetch = function (key, timeout) {
    setTimeout(function () {
      // if (self._fetchLocked) return self._delayFetch(key);
      self.runFetch(key);
    }, timeout);
  };
  this.getFetchDelay = function() {
    return fetchMethodDelay * _.keys(this.fetchStationsChunks).length;
  };
  // There was a need of chunks cause when delayed fetches came in
  // there was high possibility that queue gets over max lenght befere actual fetching
  this._putQueueInChunk = function (key) {
    this.fetchStationsChunks[key] = _.clone(this.stationsToFetchQueue);
    this.stationsToFetchQueue = [];
    console.log("stationFetcher.newChunk:" + key + ".len:" + this.fetchStationsChunks[key].length);
  };
  this._afterStationInclude = function () {
    // Fetch cause: stations count
    var chunkKey = _.random(0, 16384);
    if (this.stationsToFetchQueue.length >= fetchMaxStationsCnt) {
      console.log("stationFetcher.runFetch.>" + fetchMaxStationsCnt);
      this._putQueueInChunk(chunkKey);
      clearTimeout(this._fetchTimeoutedMethod);
      return this._delayFetch(chunkKey, this.getFetchDelay());
    }

    // fetching method recreation: (timeout refresh)
    clearTimeout(this._fetchTimeoutedMethod);
    this._fetchTimeoutedMethod = setTimeout(function () {
      console.log("stationFetcher.runFetch.Timeout:" + fetchMethodDelay);
      self._putQueueInChunk(chunkKey);
      self.runFetch(chunkKey);
    }, this.getFetchDelay());

  };
}
var exports = module.exports = new stationQueuedFetcher();
