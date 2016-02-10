/**
 * Created by orcwa on 17.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('entryBase', function () {

      var entryBase = function entryBase() {
      };
      entryBase.prototype = {
        getNext: function () {
          return new Error("getNext method from entryBase should be implemented!");
        },
        getPlayedCount: function () {
          return this.playedCount;
        },
        getSongsCount: function () {
          return this.songsCount;
        },
        getPlaylistDescription: function () {
          if (this.getSongsCount() > 1)
            return this.shortDescription + " (" + this.getPlayedCount() + "/" + this.getSongsCount() + ")";
          else
            return this.shortDescription;
        },
        getTitle: function () {
          return this.shortDescription;
        },
        resetPlayedSongs: function () {
          if (this.playedCount) this.playedCount = 0;
          if (this.playedIDs) this.playedIDs = [];
          if (this.nonPlayedSongs) this.nonPlayedSongs = _.map(this.entries, function(e) {return e.id; });
        }

      };
      return entryBase;
    });
})();
