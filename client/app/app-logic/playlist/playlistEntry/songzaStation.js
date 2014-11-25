/**
 * Created by orcwarrior on 2014-11-24.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songzaStation', function ($rootScope, songSongza) {
               return {
                 constructor: function (stationId) {
                   var self = this;
                   this.stationId = stationId;
                   this.entries = [];
                   this.shortDescription = "Some songza station..."
                   this.station = null;
                   this.stationName = null;
                   this.songsCount = 0; // count of all songs (
                   this.playedCount = 0;

                   this.init = function () {
                     $rootScope.songza.station.get(stationId)
                       .then(function (response) {
                               console.log('songza station inited');
                               console.log(response);
                                                    self.station = response;
                                                    self.songsCount = response.song_count;
                                                    self.stationName = response.name;
                                                    $rootScope.$broadcast('Songza:Station-Update', response);
                             });
                   }
                   this.init();

                   this.getNext = function () {
                     $rootScope.songza.station.nextSong(stationId).
                       then(function (response) {
                                                   console.log('songza got next song...')
                                                   console.log(response);
                                                   var next = new songSongza.constructor(response);
                                                   this.entries.push(next);
                                                   this.playedCount++;
                                                   return next;
                            });
                   }
                   this.updateShortDescription = function() {
                     this.shortDescription = this.station.name +" ("+this.playedCount+"/"+this.songsCount+")";
                   }
                   return this;
                 }
               };
             });
}
)();
