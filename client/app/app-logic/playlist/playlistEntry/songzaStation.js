/**
 * Created by orcwarrior on 2014-11-24.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songzaStation', function ($rootScope, $q, songSongza, entryCommons, songzaApi, $http) {
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
                 }
                 // Returns promise of songSongza (based on base song object)
                 function tryGetNewSong(songzaPromise, playlistCallback) {
                   //$rootScope.songza.station.nextSong(self.id)
                   //$http.get('/songza-api/station/'+self.id+'/next')
                   songzaApi.station.next(self.id)
                     .then(function (response) {
                       response = response.data; // TEMPORARY!!!
                             if (_.some(self.playedIDs, function (pID) { return pID == response.song.id;})) {
                               console.log("Song:", response, "already played!");
                               tryGetNewSong(songzaPromise);
                               return false;
                             }
                             self.playedIDs.push(response.song.id)
                             self.playedCount = self.playedIDs.length;
                             self.updateShortDescription();
                             var song = new songSongza.constructor(response);
                             songzaPromise.resolve(song);
                             if (!_.isUndefined(playlistCallback))
                              playlistCallback(song);
                             return true;
                     },
                     /*error callback*/function (error) {
                       console.warn("Error trying get new songza song: " + error);
                       setInterval(tryGetNewSong(songzaPromise), 1000);
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

               return {
                 constructor_: function () {
                   commonInit(this);
                 },
                 constructor : function (stationObj) {
                   commonInit(this);

                   this.id = stationObj.id;
                   this.station = stationObj;
                   this.stationName = stationObj.name;
                   this.songsCount = stationObj.song_count;

                   this.updateShortDescription();
                 }
               };
             });
}
)();
