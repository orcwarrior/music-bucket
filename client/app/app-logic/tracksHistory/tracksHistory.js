/**
 * Created by orcwarrior on 2015-02-25.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('tracksHistory', function () {
      return function tracksHistory() {
        var MAX_HISTORY = 10;
        this.history = [];

        this.canRestoreSong = function () {
          return this.history.length > 0;
        }
        this.peekLastSong = function () {
          return _.first(this.history);
        }
        this.restoreLastSong = function () {
          var first = _.first(this.history);
          this.history = _.rest(this.history);
          console.log("HISTORY: Restored song: " + first.metainfos.getSongDescription())
          return first;
        };
        this.storeSong = function (song) {
          console.log("HISTORY: Stored song: " + song.metainfos.getSongDescription())
          if (this.history.length >= MAX_HISTORY) {
            this.history = _.initial(this.history); // reject last from history
          }
          this.history.unshift(song);
        };
        this.getSongById = function (songId) {
          var historyEntry = _.find(this.history, function (song) {
            return song.metainfos.id === songId;
          });
          return _.isUndefined(historyEntry) ? undefined : historyEntry;
        };

        return this;
      }
    });
})();
