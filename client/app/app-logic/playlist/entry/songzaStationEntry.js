/**
 * Created by orcwarrior on 2014-11-24.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songzaStationEntry', function ($rootScope, $q, song, entryBase, entryCommons, songCommons, songzaApi) {

      var songzaStationFunc = function songzaStationEntry(station) {
        this.type = entryCommons.entryType.songza;
        this.entries = [];
        this.playedCount = 0;
        this.playedIDs = [];

        this.init = function (stationId) {
          // $rootScope.songza.station.get(stationId)
          // $http.get('/songza-api/station/'+stationId)
          var self = this;
          songzaApi.station.get(stationId)
            .then(function (response) {
              self.station = response.data;
              self.songsCount = response.data.song_count;
              self.stationName = response.data.name;
              self.updateShortDescription();
            });
        };
        // Returns promise of songSongza (based on base song object)
        function tryGetNewSong(songzaPromise, options) {
          var self = this;
          songzaApi.station.next(self.id)
            .then(function (response) {
              if (response.status !== 200) {
                console.warn("Error trying get new songza song: " + response.data);
                setInterval(_.bind(tryGetNewSong, self, songzaPromise, options), 1000);
                return;
              }
              response = response.data; // TEMPORARY!!!
              if (_.some(self.playedIDs, function (pID) {
                  return pID === response.song.id;
                })
                || (options.forced && self.playedCount < self.songsCount)) {
                console.log("Song:", response, "already played!");
                songzaApi.station.notifyPlay(self.id, response.song.id, false);
                options.requestsCnt = (options.requestsCnt) ? options.requestsCnt + 1 : 1;
                console.log("request count: " + options.requestsCnt);
                if (options.requestsCnt > 10) {
                  songzaPromise.reject(response);
                  return true;
                }
                _.bind(tryGetNewSong, self, songzaPromise, options)();

                return false;
              }
              self.playedIDs.push(response.song.id);
              self.playedCount = self.playedIDs.length;
              self.updateShortDescription();

              var songSongza = new song(response, songCommons.songType.songza, self.id);
              // Register event listener - for notifyPlay in songza services...
              songSongza.engine.listen("onfinish", function (observable, eventType, data) {
                songzaApi.station.notifyPlay(self.id, data.song.metainfos._songzaId);
              });

              songzaPromise.resolve(songSongza);
              if (!_.isUndefined(options.playlistCallback))
                options.playlistCallback(songSongza);
              return true;
            },
            /*error callback*/function (error) {
              console.warn("Error trying get new songza song: ");
              console.warn(error);
              setInterval(_.bind(tryGetNewSong, self, songzaPromise, options), 1000);
            });

        }
        // options
        // playlistCallback
        this.getNext = function (options) {
          var songzaPromise = $q.defer();
          _.bind(tryGetNewSong, this, songzaPromise, options)();
          return songzaPromise.promise;
        };
        this.updateShortDescription = function () {
          if (!_.isUndefined(this.station))
            this.shortDescription = this.station.name;
        };
        this.getPlayedCount = function () {
          return this.playedIDs.length;
        }

        if (_.isUndefined(station)) return;

        this.id = station.id;
        this.station = station;
        this.stationName = station.name;
        this.songsCount = station.song_count;

        this.updateShortDescription();
      };
      songzaStationFunc.prototype = new entryBase();
      songzaStationFunc.prototype.__models__ = {
        db: {
          base: "songzaStationEntry",
          pickedFields: [
            'id',
            //'station',
            'type',
            'shortDescription',
            'songsCount'
            //'entries'
          ]
        },
        cookies: {
          base: "songzaStationEntry",
          pickedFields: [
            'id',
            //'station',
            'type',
            'shortDescription',
            'songsCount',
            //'entries',
            'playedIDs'
          ]
        }
      };
      return songzaStationFunc;
    })
})
();
