/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlist', function (defaultPlaylistSequencer) {
               return {
                 constructor: function (base) {

                   this.entries = [];
                   this.songsCount = 0; // count of all songs (
                   if (!_.isUndefined(base)) {
                     this.entries = base.entries;
                     this.songsCount = base.entriesCount;

                   }
                   this.playlistSequencer = defaultPlaylistSequencer;

                   // methods:
                   this.play = function () {
                     console.log("playlist-play");
                   }
                   this.stop = function () {
                     console.log("playlist-stop");
                   }
                   this.pause = function () {
                     console.log("playlist-stop");
                   }
                   this.getNext = function () {
                     return this.playlistSequencer.getNext(this.entries);
                   }
                   this.addEntry = function (entry) {
                     if (_.isUndefined(entry.songsCount))
                       this.songsCount++;
                     else
                       this.songsCount += entry.songsCount;
                     this.entries.push(entry);
                   }
                   return this;
                 }
               };
             });
}
)();
