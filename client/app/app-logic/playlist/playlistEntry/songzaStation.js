/**
 * Created by orcwarrior on 2014-11-24.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songzaStation', function ($rootScope, $q, songSongza) {
               return {
                 constructor: function (stationObj) {
                   var self = this;
                   this.id = stationObj.id;
                   this.entries = [];
                   this.station = stationObj;
                   this.stationName = stationObj.name;
                   this.songsCount = stationObj.song_count; // count of all songs (
                   this.playedCount = 0;
                   this.playedIDs = [];

                   this.init = function (stationId) {
                     $rootScope.songza.station.get(stationId)
                       .then(function (response) {
                               console.log('songza station inited');
                               console.log(response);
                               self.station = response;
                               self.songsCount = response.song_count;
                               self.stationName = response.name;
                               self.updateShortDescription();
                               $rootScope.$broadcast('player:playlist', response);
                             });
                   }
                   // Returns promise of songSongza (based on base song object)
                   function tryGetNewSong(songzaPromise) {
                     $rootScope.songza.station.nextSong(self.id)
                       .then(function (response) {
                               if(_.some(self.playedIDs, function(pID) { return pID == response.song.id;}))
                               {
                                 console.log("Song:",response,"already played!");
                                 tryGetNewSong(songzaPromise);
                                 return false;
                               }
                               self.playedIDs.push(response.song.id)
                               self.playedCount++;
                               self.updateShortDescription();
                               songzaPromise.resolve(new songSongza.constructor(response));
                                return true;
                             });


                   }
                   this.getNext = function () {

                     var songzaPromise = $q.defer();
                     tryGetNewSong(songzaPromise);
                     // Mock departure information for the user's flight

                     return songzaPromise.promise;
                   }
                   this.updateShortDescription = function() {
                     this.shortDescription = this.station.name +" ("+this.playedCount+"/"+this.songsCount+")";
                   }
                   this.updateShortDescription();
                   return this;
                 }
               };
             });
}
)();
