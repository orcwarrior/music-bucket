/**
 * Created by orcwarrior on 2014-11-24.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songzaStationEntry', function ($rootScope, $q, song, entryCommons, songCommons, songzaApi) {
      function commonInit(self) {
        self.type = entryCommons.entryType.songzaStation;
        self.entries = [];
        self.playedCount = 0;
        self.playedIDs = [];

        self.init = function (stationId) {
          // $rootScope.songza.station.get(stationId)
          // $http.get('/songza-api/station/'+stationId)
          songzaApi.station.get(stationId)
            .then(function (response) {
              self.station = response.data;
              self.songsCount = response.data.song_count;
              self.stationName = response.data.name;
              self.updateShortDescription();
            });
        };
        // Returns promise of songSongza (based on base song object)
        function tryGetNewSong(songzaPromise, playlistCallback) {
          //$rootScope.songza.station.nextSong(self.id)
          //$http.get('/songza-api/station/'+self.id+'/next')
          songzaApi.station.next(self.id)
            .then(function (response) {
              if (response.status !== 200) {
                console.warn("Error trying get new songza song: " + response.data);
                setInterval(tryGetNewSong(songzaPromise, playlistCallback), 1000);
                return;
              }
              response = response.data; // TEMPORARY!!!
              if (_.some(self.playedIDs, function (pID) { return pID == response.song.id;})) {
                console.log("Song:", response, "already played!");
                tryGetNewSong(songzaPromise);
                return false;
              }
              self.playedIDs.push(response.song.id)
              self.playedCount = self.playedIDs.length;
              self.updateShortDescription();

              // TODO: As songUnresolved:
              var songSongza = new song(response, songCommons.songType.songza, self.id);
              songzaPromise.resolve(songSongza);
              if (!_.isUndefined(playlistCallback))
                playlistCallback(songSongza);
              return true;
            },
            /*error callback*/function (error) {
              console.warn("Error trying get new songza song: " + error);
              setInterval(tryGetNewSong(songzaPromise, playlistCallback), 1000);
            });

        }

        self.getNext = function (playlistCallback) {
          var songzaPromise = $q.defer();
          tryGetNewSong(songzaPromise, playlistCallback);
          return songzaPromise.promise;
        }
        self.updateShortDescription = function () {
          if (!_.isUndefined(this.station))
            this.shortDescription = this.station.name;
          else
            this.shortDescription = "???";
        }
        self.getPlaylistDescription = function () {
          return this.shortDescription + " (" + this.playedCount + "/" + this.songsCount + ")";
        }
      }

      return function songzaStationEntry(station) {
        commonInit(this);

        if (_.isUndefined(station)) return;

        this.id = station.id;
        this.station = station;
        this.stationName = station.name;
        this.songsCount = station.song_count;

        this.updateShortDescription();
      };
    });
})
();
